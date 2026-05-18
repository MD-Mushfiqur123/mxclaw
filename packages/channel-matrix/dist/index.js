import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "matrix", version: "0.1.0", type: "channel",
    description: "Matrix channel plugin (Client-Server API sync)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "rooms", "media"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = {
            homeserver: "", accessToken: "", userId: "", connected: false,
            messageCount: 0, queue: [], since: "", pollTimer: null, reconnectAttempts: 0,
        };
        states.set(id, s);
    }
    return s;
}
async function sync(state, config) {
    try {
        const url = `${state.homeserver}/_matrix/client/v3/sync?timeout=30000${state.since ? `&since=${state.since}` : ""}`;
        const resp = await fetch(url, {
            headers: { Authorization: `Bearer ${state.accessToken}` },
            signal: AbortSignal.timeout(35000),
        });
        if (!resp.ok)
            throw new Error(`Sync error ${resp.status}`);
        const data = (await resp.json());
        state.since = data.next_batch;
        state.connected = true;
        state.reconnectAttempts = 0;
        const rooms = data.rooms?.join ?? {};
        for (const [roomId, room] of Object.entries(rooms)) {
            const events = room.timeline?.events ?? [];
            for (const evt of events) {
                if (evt.type !== "m.room.message" || evt.sender === state.userId)
                    continue;
                const eventType = evt.type;
                const sender = evt.sender ?? "unknown";
                const content = evt.content;
                if (!content)
                    continue;
                const msgtype = content.msgtype ?? "m.text";
                const body = content.body ?? "";
                const isMentioned = body.includes(state.userId) || (content.formatted_body ?? "").includes(state.userId);
                if (msgtype === "m.image") {
                    const imgUrl = content.url ?? content.file?.url ?? "";
                    if (imgUrl) {
                        const mxcUrl = imgUrl.startsWith("mxc://") ? `${state.homeserver}/_matrix/media/v3/download/${imgUrl.slice(6)}` : imgUrl;
                        const envelope = {
                            id: evt.event_id ?? uuidv4(), channel: config.id, channelType: "matrix",
                            sender: { id: sender, displayName: sender, isBot: false },
                            conversationId: roomId,
                            content: [
                                { type: "image", url: mxcUrl, alt: body || undefined },
                                ...(body ? [{ type: "text", text: body }] : []),
                            ],
                            mentions: [], isGroupMessage: true,
                            isMentioned, timestamp: evt.origin_server_ts ?? Date.now(),
                            metadata: {},
                        };
                        state.messageCount++;
                        state.onMessage?.(envelope);
                        continue;
                    }
                }
                if (msgtype === "m.file" || msgtype === "m.video" || msgtype === "m.audio") {
                    const mediaUrl = content.url ?? content.file?.url ?? "";
                    if (mediaUrl) {
                        const mxcUrl = mediaUrl.startsWith("mxc://") ? `${state.homeserver}/_matrix/media/v3/download/${mediaUrl.slice(6)}` : mediaUrl;
                        const mediaType = msgtype === "m.video" ? "video" : msgtype === "m.audio" ? "audio" : "file";
                        const envelope = {
                            id: evt.event_id ?? uuidv4(), channel: config.id, channelType: "matrix",
                            sender: { id: sender, displayName: sender, isBot: false },
                            conversationId: roomId,
                            content: [
                                { type: mediaType, url: mxcUrl, ...(mediaType === "file" ? { name: body || "File", mimeType: (content.info?.mimetype ?? "application/octet-stream") } : {}) },
                                ...(body ? [{ type: "text", text: body }] : []),
                            ],
                            mentions: [], isGroupMessage: true,
                            isMentioned, timestamp: evt.origin_server_ts ?? Date.now(),
                            metadata: {},
                        };
                        state.messageCount++;
                        state.onMessage?.(envelope);
                        continue;
                    }
                }
                let text = body;
                if (msgtype === "m.emote" || msgtype === "m.notice") {
                    text = body;
                }
                const envelope = {
                    id: evt.event_id ?? uuidv4(), channel: config.id, channelType: "matrix",
                    sender: { id: sender, displayName: sender, isBot: false },
                    conversationId: roomId,
                    content: [{ type: "text", text }],
                    mentions: [], isGroupMessage: true,
                    isMentioned, timestamp: evt.origin_server_ts ?? Date.now(),
                    metadata: {},
                };
                state.messageCount++;
                state.onMessage?.(envelope);
            }
        }
    }
    catch {
        state.connected = false;
        state.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 30000);
        setTimeout(() => sync(state, config), delay);
    }
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const homeserver = config.credentials?.homeserver ?? process.env.MATRIX_HOMESERVER ?? "https://matrix.org";
        const accessToken = config.credentials?.accessToken ?? process.env.MATRIX_ACCESS_TOKEN;
        if (!accessToken)
            throw new Error("Matrix access token required");
        const state = getState(config.id);
        state.homeserver = homeserver;
        state.accessToken = accessToken;
        const whoami = await fetch(`${homeserver}/_matrix/client/v3/account/whoami`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(10000),
        });
        if (!whoami.ok)
            throw new Error(`Matrix auth failed: ${whoami.status}`);
        const whoamiData = (await whoami.json());
        state.userId = whoamiData.user_id;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        sync(state, config);
        state.pollTimer = setInterval(() => {
            if (state.connected)
                sync(state, config);
        }, 1000);
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
        if (s.pollTimer)
            clearInterval(s.pollTimer);
        s.connected = false;
        states.delete(id);
    },
    sendMessage: async (id, reply) => {
        const s = states.get(id);
        if (!s)
            return;
        const textParts = [];
        const mediaParts = [];
        for (const c of reply.content) {
            if (c.type === "text")
                textParts.push(c.text);
            else if (c.type === "image" || c.type === "file" || c.type === "video" || c.type === "audio") {
                mediaParts.push({ url: c.url, info: { mimetype: c.mimeType } });
            }
        }
        if (!textParts.length && !mediaParts.length)
            return;
        const txnId = uuidv4();
        let body;
        if (mediaParts.length > 0) {
            const m = mediaParts[0];
            const typeMap = { image: "m.image", video: "m.video", audio: "m.audio", file: "m.file" };
            const matchedType = reply.content.find(c => c.type !== "text")?.type ?? "file";
            body = { msgtype: typeMap[matchedType] ?? "m.file", body: textParts.join("\n") || "File", url: m.url, info: m.info };
        }
        else {
            body = { msgtype: "m.text", body: textParts.join("\n") };
        }
        try {
            await fetch(`${s.homeserver}/_matrix/client/v3/rooms/${encodeURIComponent(reply.conversationId)}/send/m.room.message/${txnId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${s.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        }
        catch {
            s.queue.push(reply);
        }
    },
    handleCommand: async () => { },
    handleApproval: async () => { },
    getStatus: async (id) => {
        const s = states.get(id);
        return {
            id, type: "matrix", connected: s?.connected ?? false,
            messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0,
        };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
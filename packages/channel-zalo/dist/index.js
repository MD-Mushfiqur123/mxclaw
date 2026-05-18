import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "zalo", version: "0.1.0", type: "channel",
    description: "Zalo Official Account API channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "pm"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { appId: "", appSecret: "", accessToken: "", connected: false, messageCount: 0, queue: [], pollTimer: null, lastMessageId: "", tokenExpiry: 0 };
        states.set(id, s);
    }
    return s;
}
async function refreshToken(state) {
    if (Date.now() < state.tokenExpiry)
        return;
    try {
        const resp = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ app_id: state.appId, grant_type: "client_credentials", app_secret: state.appSecret }),
        });
        const data = (await resp.json());
        if (data.access_token) {
            state.accessToken = data.access_token;
            state.tokenExpiry = Date.now() + ((data.expires_in ?? 3600) - 60) * 1000;
        }
    }
    catch { }
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const state = getState(config.id);
        state.appId = config.credentials?.appId ?? "";
        state.appSecret = config.credentials?.appSecret ?? "";
        if (!state.appId || !state.appSecret)
            throw new Error("Zalo appId and appSecret required");
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        await refreshToken(state);
        state.connected = true;
        const poll = async () => {
            await refreshToken(state);
            if (!state.accessToken)
                return;
            try {
                const resp = await fetch("https://openapi.zalo.me/v2.0/oa/message/getlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", access_token: state.accessToken },
                    body: JSON.stringify({ offset: 0, count: 50 }),
                });
                const data = (await resp.json());
                if (data.error)
                    return;
                const messages = data.data ?? [];
                for (const msg of messages) {
                    if (msg.message_id === state.lastMessageId || msg.sender.id === state.appId)
                        continue;
                    state.lastMessageId = msg.message_id;
                    const envelope = {
                        id: msg.message_id, channel: config.id, channelType: "zalo",
                        sender: { id: msg.sender.id, displayName: msg.sender.id.slice(0, 8), isBot: false },
                        conversationId: msg.sender.id,
                        content: [{ type: "text", text: msg.text }],
                        mentions: [], isGroupMessage: false, isMentioned: false,
                        timestamp: msg.timestamp,
                        metadata: {},
                    };
                    state.messageCount++;
                    state.onMessage?.(envelope);
                }
            }
            catch { /* retry */ }
        };
        poll();
        state.pollTimer = setInterval(poll, 3000);
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
        await refreshToken(s);
        const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
        if (!text)
            return;
        try {
            await fetch("https://openapi.zalo.me/v2.0/oa/message", {
                method: "POST",
                headers: { "Content-Type": "application/json", access_token: s.accessToken },
                body: JSON.stringify({ recipient: { user_id: reply.conversationId }, message: { type: "text", text } }),
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
        return { id, type: "zalo", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
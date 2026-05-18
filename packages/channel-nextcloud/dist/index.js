import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "nextcloud", version: "0.1.0", type: "channel",
    description: "Nextcloud Talk channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "rooms", "webhooks"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { serverUrl: "", username: "", password: "", connected: false, messageCount: 0, queue: [], pollTimer: null, lastKnownId: 0 };
        states.set(id, s);
    }
    return s;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const serverUrl = config.credentials?.serverUrl ?? process.env.NEXTCLOUD_SERVER_URL;
        const username = config.credentials?.username ?? process.env.NEXTCLOUD_USERNAME;
        const password = config.credentials?.password ?? process.env.NEXTCLOUD_PASSWORD;
        if (!serverUrl || !username || !password)
            throw new Error("Nextcloud serverUrl, username, and password required");
        const state = getState(config.id);
        state.serverUrl = serverUrl;
        state.username = username;
        state.password = password;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.connected = true;
        const auth = Buffer.from(`${state.username}:${state.password}`).toString("base64");
        const poll = async () => {
            try {
                const token = config.options?.conversationToken ?? "";
                const resp = await fetch(`${state.serverUrl}/ocs/v2.php/apps/spreed/api/v1/chat/${token}?lookIntoFuture=1&lastKnownMessageId=${state.lastKnownId}`, {
                    headers: { Authorization: `Basic ${auth}`, "OCS-APIRequest": "true", Accept: "application/json" },
                });
                const data = (await resp.json());
                const messages = data.ocs?.data ?? [];
                for (const msg of messages) {
                    if (msg.actorType === "bots")
                        continue;
                    state.lastKnownId = Math.max(state.lastKnownId, msg.id);
                    const envelope = {
                        id: String(msg.id), channel: config.id, channelType: "nextcloud",
                        sender: { id: msg.actorId, displayName: msg.actorDisplayName, isBot: false },
                        conversationId: token,
                        content: [{ type: "text", text: msg.message }],
                        mentions: [], isGroupMessage: true, isMentioned: msg.message.includes(`@${state.username}`),
                        timestamp: msg.timestamp * 1000, metadata: {},
                    };
                    state.messageCount++;
                    state.onMessage?.(envelope);
                }
            }
            catch { /* retry */ }
        };
        poll();
        state.pollTimer = setInterval(poll, 2000);
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
        const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
        if (!text)
            return;
        try {
            const auth = Buffer.from(`${s.username}:${s.password}`).toString("base64");
            await fetch(`${s.serverUrl}/ocs/v2.php/apps/spreed/api/v1/chat/${reply.conversationId}`, {
                method: "POST", headers: { Authorization: `Basic ${auth}`, "OCS-APIRequest": "true", "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
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
        return { id, type: "nextcloud", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "line", version: "0.1.0", type: "channel",
    description: "LINE Messaging API channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "flexMessages", "stickers"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { channelAccessToken: "", channelSecret: "", connected: false, messageCount: 0, queue: [] };
        states.set(id, s);
    }
    return s;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const channelAccessToken = config.credentials?.channelAccessToken ?? process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const channelSecret = config.credentials?.channelSecret ?? process.env.LINE_CHANNEL_SECRET;
        if (!channelAccessToken || !channelSecret)
            throw new Error("LINE channelAccessToken and channelSecret required");
        const state = getState(config.id);
        state.channelAccessToken = channelAccessToken;
        state.channelSecret = channelSecret;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.connected = true;
        console.log(`[line:${config.id}] Started - configure LINE webhook URL to gateway webhook endpoint`);
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
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
            await fetch("https://api.line.me/v2/bot/message/push", {
                method: "POST", headers: { Authorization: `Bearer ${s.channelAccessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ to: reply.conversationId, messages: [{ type: "text", text: text.slice(0, 5000) }] }),
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
        return { id, type: "line", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
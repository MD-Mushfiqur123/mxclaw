import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "feishu", version: "0.1.0", type: "channel",
    description: "Feishu/Lark channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "cards", "interactive"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { appId: "", appSecret: "", tenantAccessToken: "", tokenExpiry: 0, connected: false, messageCount: 0, queue: [] };
        states.set(id, s);
    }
    return s;
}
async function getTenantToken(state) {
    if (state.tenantAccessToken && Date.now() < state.tokenExpiry)
        return state.tenantAccessToken;
    const resp = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: state.appId, app_secret: state.appSecret }),
    });
    const data = (await resp.json());
    state.tenantAccessToken = data.tenant_access_token;
    state.tokenExpiry = Date.now() + (data.expire - 300) * 1000;
    return state.tenantAccessToken;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const appId = config.credentials?.appId ?? process.env.FEISHU_APP_ID;
        const appSecret = config.credentials?.appSecret ?? process.env.FEISHU_APP_SECRET;
        if (!appId || !appSecret)
            throw new Error("Feishu appId and appSecret required");
        const state = getState(config.id);
        state.appId = appId;
        state.appSecret = appSecret;
        await getTenantToken(state);
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.connected = true;
        // Feishu uses webhook-based event delivery; the gateway's /gateway/webhook/feishu endpoint handles inbound events
        console.log(`[feishu:${config.id}] Started - configure Feishu event subscription to ${config.options?.webhookUrl ?? "gateway webhook URL"}`);
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
            const token = await getTenantToken(s);
            await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id", {
                method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ receive_id: reply.conversationId, msg_type: "text", content: JSON.stringify({ text }) }),
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
        return { id, type: "feishu", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "teams", version: "0.1.0", type: "channel",
    description: "Microsoft Teams channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "adaptiveCards", "teams"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { botId: "", botPassword: "", accessToken: "", tokenExpiry: 0, connected: false, messageCount: 0, queue: [] };
        states.set(id, s);
    }
    return s;
}
async function getTeamsToken(state) {
    if (state.accessToken && Date.now() < state.tokenExpiry)
        return state.accessToken;
    const resp = await fetch("https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${state.botId}&client_secret=${state.botPassword}&scope=https://api.botframework.com/.default`,
    });
    const data = (await resp.json());
    state.accessToken = data.access_token;
    state.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    return state.accessToken;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const botId = config.credentials?.botId ?? process.env.TEAMS_BOT_ID;
        const botPassword = config.credentials?.botPassword ?? process.env.TEAMS_BOT_PASSWORD;
        if (!botId || !botPassword)
            throw new Error("Teams botId and botPassword required");
        const state = getState(config.id);
        state.botId = botId;
        state.botPassword = botPassword;
        await getTeamsToken(state);
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.connected = true;
        console.log(`[teams:${config.id}] Started - configure Teams bot messaging endpoint to gateway webhook`);
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
            const token = await getTeamsToken(s);
            const serviceUrl = reply.metadata?.serviceUrl ?? "https://smba.trafficmanager.net/amer";
            await fetch(`${serviceUrl}/v3/conversations/${reply.conversationId}/activities`, {
                method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ type: "message", text, from: { id: s.botId, name: "mxclaw" } }),
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
        return { id, type: "teams", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
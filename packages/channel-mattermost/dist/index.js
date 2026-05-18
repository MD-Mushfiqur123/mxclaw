import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "mattermost", version: "0.1.0", type: "channel",
    description: "Mattermost channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "websocket", "threads"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { serverUrl: "", accessToken: "", botUserId: "", ws: null, connected: false, messageCount: 0, queue: [] };
        states.set(id, s);
    }
    return s;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const serverUrl = config.credentials?.serverUrl ?? process.env.MATTERMOST_SERVER_URL;
        const accessToken = config.credentials?.accessToken ?? process.env.MATTERMOST_ACCESS_TOKEN;
        if (!serverUrl || !accessToken)
            throw new Error("Mattermost serverUrl and accessToken required");
        const state = getState(config.id);
        state.serverUrl = serverUrl;
        state.accessToken = accessToken;
        const meResp = await fetch(`${serverUrl}/api/v4/users/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const meData = (await meResp.json());
        state.botUserId = meData.id;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        const wsUrl = state.serverUrl.replace(/^http/, "ws") + "/api/v4/websocket";
        state.ws = new WebSocket(wsUrl);
        state.ws.onopen = () => {
            state.ws?.send(JSON.stringify({ seq: 1, action: "authentication_challenge", data: { token: state.accessToken } }));
        };
        state.ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.event === "hello") {
                state.connected = true;
                return;
            }
            if (payload.event === "posted" && payload.data.post) {
                const postData = JSON.parse(payload.data.post);
                if (postData.user_id === state.botUserId)
                    return;
                const envelope = {
                    id: postData.id, channel: config.id, channelType: "mattermost",
                    sender: { id: postData.user_id, displayName: payload.data.sender_name ?? postData.user_id, isBot: false },
                    conversationId: postData.channel_id,
                    threadId: postData.root_id,
                    content: [{ type: "text", text: postData.message }],
                    mentions: postData.message.includes(`@${state.botUserId}`) ? [state.botUserId] : [],
                    isGroupMessage: true, isMentioned: postData.message.includes(`@${state.botUserId}`),
                    timestamp: postData.create_at, metadata: {},
                };
                state.messageCount++;
                state.onMessage?.(envelope);
            }
        };
        state.ws.onclose = () => { state.connected = false; setTimeout(() => plugin.startChannel?.(config, onMessage), 5000); };
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
        s.ws?.close();
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
            await fetch(`${s.serverUrl}/api/v4/posts`, {
                method: "POST", headers: { Authorization: `Bearer ${s.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ channel_id: reply.conversationId, message: text, ...(reply.threadId ? { root_id: reply.threadId } : {}) }),
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
        return { id, type: "mattermost", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
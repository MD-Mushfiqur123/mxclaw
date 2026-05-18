import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "wechat", version: "0.1.0", type: "channel",
    description: "WeChat Official Account API channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "pm"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { appId: "", appSecret: "", accessToken: "", connected: false, messageCount: 0, queue: [], pollTimer: null, lastMsgId: "", tokenExpiry: 0 };
        states.set(id, s);
    }
    return s;
}
async function refreshAccessToken(state) {
    if (Date.now() < state.tokenExpiry)
        return;
    try {
        const resp = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${state.appId}&secret=${state.appSecret}`);
        const data = (await resp.json());
        if (data.access_token) {
            state.accessToken = data.access_token;
            state.tokenExpiry = Date.now() + ((data.expires_in ?? 7200) - 120) * 1000;
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
            throw new Error("WeChat appId and appSecret required");
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        await refreshAccessToken(state);
        state.connected = true;
        const poll = async () => {
            await refreshAccessToken(state);
            if (!state.accessToken)
                return;
            try {
                const resp = await fetch(`https://api.weixin.qq.com/cgi-bin/message/custom/get?access_token=${state.accessToken}`);
                const data = (await resp.json());
                if (data.errcode || !data.message_list)
                    return;
                for (const msg of data.message_list) {
                    if (msg.MsgId === state.lastMsgId)
                        continue;
                    state.lastMsgId = msg.MsgId;
                    const envelope = {
                        id: msg.MsgId, channel: config.id, channelType: "wechat",
                        sender: { id: msg.FromUserName, displayName: msg.FromUserName.slice(0, 8), isBot: false },
                        conversationId: msg.FromUserName,
                        content: [{ type: "text", text: msg.Content }],
                        mentions: [], isGroupMessage: false, isMentioned: false,
                        timestamp: msg.CreateTime * 1000,
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
        await refreshAccessToken(s);
        const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
        if (!text)
            return;
        try {
            await fetch(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${s.accessToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    touser: reply.conversationId,
                    msgtype: "text",
                    text: { content: text },
                }),
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
        return { id, type: "wechat", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
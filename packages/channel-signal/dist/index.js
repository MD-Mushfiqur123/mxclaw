import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "signal", version: "0.1.0", type: "channel",
    description: "Signal channel plugin (signal-cli REST API)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "groups", "attachments"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { restApiUrl: "", connected: false, messageCount: 0, queue: [], pollTimer: null, lastTimestamp: 0 };
        states.set(id, s);
    }
    return s;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const restApiUrl = config.credentials?.restApiUrl ?? process.env.SIGNAL_REST_API_URL ?? "http://localhost:8080";
        getState(config.id).restApiUrl = restApiUrl;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.connected = true;
        const poll = async () => {
            try {
                const resp = await fetch(`${state.restApiUrl}/v1/receive/${config.options?.account ?? "+1234567890"}?timeout=30`);
                const data = (await resp.json());
                if (data.envelope?.dataMessage) {
                    const dm = data.envelope.dataMessage;
                    const envelope = {
                        id: uuidv4(), channel: config.id, channelType: "signal",
                        sender: { id: data.envelope.source, displayName: data.envelope.sourceName ?? data.envelope.source, isBot: false },
                        conversationId: dm.groupInfo?.groupId ?? data.envelope.source,
                        content: [{ type: "text", text: dm.message }],
                        mentions: [], isGroupMessage: !!dm.groupInfo, isMentioned: false,
                        timestamp: dm.timestamp, metadata: {},
                    };
                    state.messageCount++;
                    state.onMessage?.(envelope);
                }
            }
            catch { /* retry */ }
        };
        poll();
        state.pollTimer = setInterval(poll, 1000);
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
            await fetch(`${s.restApiUrl}/v2/send`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number: reply.conversationId, message: text }),
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
        return { id, type: "signal", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
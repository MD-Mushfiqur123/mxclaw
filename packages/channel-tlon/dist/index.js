import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "tlon", version: "0.1.0", type: "channel",
    description: "Tlon (Urbit) channel plugin via HTTP Poke/Subscribe", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "channels"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { ship: "", url: "", code: "", connected: false, messageCount: 0, queue: [], abortController: null, subscriptionId: null };
        states.set(id, s);
    }
    return s;
}
function authHeaders(state) {
    return {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`~${state.ship}:${state.code}`).toString("base64")}`,
    };
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const state = getState(config.id);
        state.ship = config.credentials?.ship ?? "";
        state.url = config.credentials?.url ?? "";
        state.code = config.credentials?.code ?? "";
        if (!state.ship || !state.url || !state.code)
            throw new Error("Tlon ship, url, and code required");
        if (!state.url.endsWith("/"))
            state.url += "/";
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.connected = true;
        state.subscriptionId = uuidv4();
        state.abortController = new AbortController();
        const sseSubscribe = async () => {
            try {
                const sseUrl = `${state.url}~/~/`;
                const resp = await fetch(sseUrl, {
                    headers: { ...authHeaders(state), Accept: "text/event-stream" },
                    signal: state.abortController.signal,
                });
                const reader = resp.body?.getReader();
                if (!reader)
                    return;
                const decoder = new TextDecoder();
                let buffer = "";
                while (state.connected) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";
                    for (const line of lines) {
                        if (!line.startsWith("data: "))
                            continue;
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.message && data.message.author !== `~${state.ship}`) {
                                const envelope = {
                                    id: data.id ?? uuidv4(), channel: config.id, channelType: "tlon",
                                    sender: { id: data.message.author, displayName: data.message.author, isBot: false },
                                    conversationId: data.message.author,
                                    content: [{ type: "text", text: data.message.content.text }],
                                    mentions: [], isGroupMessage: false,
                                    isMentioned: data.message.content.text.includes(`~${state.ship}`),
                                    timestamp: data.message.when * 1000,
                                    metadata: {},
                                };
                                state.messageCount++;
                                state.onMessage?.(envelope);
                            }
                        }
                        catch { }
                    }
                }
            }
            catch {
                if (state.connected)
                    setTimeout(sseSubscribe, 10000);
            }
        };
        sseSubscribe();
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
        s.abortController?.abort();
        s.connected = false;
        states.delete(id);
    },
    sendMessage: async (id, reply) => {
        const s = states.get(id);
        if (!s || !s.connected)
            return;
        const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
        if (!text)
            return;
        try {
            const json = {
                action: "poke",
                app: "chat",
                mark: "chat-action",
                json: {
                    ship: reply.conversationId,
                    message: { text },
                },
            };
            await fetch(`${s.url}~/~/`, {
                method: "POST",
                headers: authHeaders(s),
                body: JSON.stringify(json),
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
        return { id, type: "tlon", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
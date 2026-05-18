import * as net from "node:net";
import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "twitch", version: "0.1.0", type: "channel",
    description: "Twitch IRC channel plugin", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "channels"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { nick: "", oauth: "", channel: "", socket: null, connected: false, messageCount: 0, queue: [], buffer: "" };
        states.set(id, s);
    }
    return s;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const state = getState(config.id);
        state.nick = config.credentials?.nick ?? "";
        state.oauth = config.credentials?.oauth ?? "";
        state.channel = config.options?.channel ?? "";
        if (!state.nick || !state.oauth || !state.channel)
            throw new Error("Twitch nick, oauth, and channel required");
        if (!state.channel.startsWith("#"))
            state.channel = `#${state.channel}`;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.socket = new net.Socket();
        state.socket.connect(6667, "irc.chat.twitch.tv", () => {
            state.socket.write(`PASS ${state.oauth}\r\n`);
            state.socket.write(`NICK ${state.nick}\r\n`);
            state.socket.write(`JOIN ${state.channel}\r\n`);
        });
        state.socket.on("data", (data) => {
            state.buffer += data.toString();
            const lines = state.buffer.split("\r\n");
            state.buffer = lines.pop() ?? "";
            for (const line of lines) {
                if (line.startsWith("PING")) {
                    state.socket?.write(`PONG :tmi.twitch.tv\r\n`);
                    continue;
                }
                if (line.includes(" 001 ") || line.includes(":tmi.twitch.tv 001")) {
                    state.connected = true;
                    state.socket?.write(`JOIN ${state.channel}\r\n`);
                }
                const privmsgMatch = line.match(/^:([^!]+)!([^ ]+)@[^ ]+ PRIVMSG (#\w+) :(.+)$/);
                if (privmsgMatch) {
                    const sender = privmsgMatch[1];
                    const target = privmsgMatch[3];
                    const text = privmsgMatch[4];
                    if (sender.toLowerCase() === state.nick.toLowerCase())
                        continue;
                    const envelope = {
                        id: uuidv4(), channel: config.id, channelType: "twitch",
                        sender: { id: sender, displayName: sender, isBot: false },
                        conversationId: target,
                        content: [{ type: "text", text }],
                        mentions: [],
                        isGroupMessage: true,
                        isMentioned: text.toLowerCase().includes(`@${state.nick.toLowerCase()}`),
                        timestamp: Date.now(),
                        metadata: {},
                    };
                    state.messageCount++;
                    state.onMessage?.(envelope);
                }
            }
        });
        state.socket.on("close", () => { state.connected = false; setTimeout(() => plugin.startChannel?.(config, onMessage), 10000); });
        state.socket.on("error", () => { });
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
        s.socket?.write(`PART ${s.channel}\r\n`);
        s.socket?.write(`QUIT\r\n`);
        s.socket?.destroy();
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
        for (const line of text.split("\n")) {
            s.socket?.write(`PRIVMSG ${s.channel} :${line}\r\n`);
        }
    },
    handleCommand: async () => { },
    handleApproval: async () => { },
    getStatus: async (id) => {
        const s = states.get(id);
        return { id, type: "twitch", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
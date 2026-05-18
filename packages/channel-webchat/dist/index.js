import { v4 as uuidv4 } from "uuid";
import { WebSocketServer, WebSocket as WS } from "ws";
import * as http from "node:http";
const manifest = {
    name: "webchat", version: "0.1.0", type: "channel",
    description: "In-memory WebSocket chat server for control-ui", author: "mxclaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "pm"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = { port: 18701, wss: null, clients: new Map(), connected: false, messageCount: 0, queue: [], messageHistory: [] };
        states.set(id, s);
    }
    return s;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const state = getState(config.id);
        state.port = config.credentials?.port ?? 18701;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.wss = new WebSocketServer({ port: state.port });
        state.wss.on("listening", () => {
            state.connected = true;
        });
        state.wss.on("connection", (ws, req) => {
            const clientId = uuidv4();
            const address = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
            state.clients.set(clientId, ws);
            const welcome = { type: "welcome", clientId, server: "mxclaw-webchat", messageHistory: state.messageHistory };
            ws.send(JSON.stringify(welcome));
            ws.on("message", (raw) => {
                try {
                    const data = JSON.parse(raw.toString());
                    if (data.type === "ping") {
                        ws.send(JSON.stringify({ type: "pong" }));
                        return;
                    }
                    const text = data.text ?? "";
                    const envelope = {
                        id: uuidv4(), channel: config.id, channelType: "webchat",
                        sender: { id: clientId, displayName: address ?? clientId.slice(0, 8), isBot: false },
                        conversationId: clientId,
                        content: [{ type: "text", text }],
                        mentions: [], isGroupMessage: false, isMentioned: false,
                        timestamp: Date.now(),
                        metadata: {},
                    };
                    state.messageHistory.push({ id: envelope.id, role: "user", text, timestamp: envelope.timestamp });
                    state.messageCount++;
                    state.onMessage?.(envelope);
                }
                catch { }
            });
            ws.on("close", () => { state.clients.delete(clientId); });
            ws.on("error", () => { state.clients.delete(clientId); });
        });
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
        for (const [, ws] of s.clients) {
            try {
                ws.close();
            }
            catch { }
        }
        s.clients.clear();
        s.wss?.close();
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
        const client = s.clients.get(reply.conversationId);
        if (client && client.readyState === WS.OPEN) {
            const msg = { type: "message", id: uuidv4(), text, timestamp: Date.now() };
            client.send(JSON.stringify(msg));
            s.messageHistory.push({ id: msg.id, role: "bot", text, timestamp: msg.timestamp });
        }
    },
    handleCommand: async () => { },
    handleApproval: async () => { },
    getStatus: async (id) => {
        const s = states.get(id);
        return { id, type: "webchat", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
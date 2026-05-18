import { v4 as uuidv4 } from "uuid";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
const manifest = {
    name: "whatsapp", version: "0.1.0", type: "channel",
    description: "WhatsApp channel plugin (Baileys WebSocket with QR auth)", author: "MxClaw",
    main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "media", "groups", "qr-auth"],
};
const states = new Map();
function getState(id) {
    let s = states.get(id);
    if (!s) {
        s = {
            sock: null, connected: false, messageCount: 0, queue: [],
            qrCode: null, authDir: path.join(os.homedir(), ".mxclaw", "wa-auth", id),
            reconnectTimer: null, reconnectAttempts: 0,
        };
        states.set(id, s);
    }
    return s;
}
async function initBaileys(state, config, onMessage) {
    try {
        const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = await import("@whiskeysockets/baileys");
        const { Boom } = await import("@hapi/boom");
        const pino = (await import("pino")).default;
        fs.mkdirSync(state.authDir, { recursive: true });
        const { state: authState, saveCreds } = await useMultiFileAuthState(state.authDir);
        const { version } = await fetchLatestBaileysVersion();
        const sock = makeWASocket({
            version,
            auth: authState,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: ["MxClaw", "Desktop", "1.0.0"],
            markOnlineOnConnect: true,
            syncFullHistory: false,
        });
        state.sock = sock;
        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                state.qrCode = qr;
                console.log(`[whatsapp:${config.id}] QR Code received — scan with WhatsApp`);
            }
            if (connection === "open") {
                state.connected = true;
                state.reconnectAttempts = 0;
                state.qrCode = null;
                console.log(`[whatsapp:${config.id}] Connected to WhatsApp`);
                flushQueue(config.id, state);
            }
            if (connection === "close") {
                state.connected = false;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts) + Math.random() * 1000, 30000);
                    state.reconnectAttempts++;
                    console.log(`[whatsapp:${config.id}] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${state.reconnectAttempts})`);
                    state.reconnectTimer = setTimeout(() => initBaileys(state, config, onMessage), delay);
                }
                else {
                    console.log(`[whatsapp:${config.id}] Logged out — delete ${state.authDir} to re-auth`);
                }
            }
        });
        sock.ev.on("messages.upsert", (m) => {
            if (m.type !== "notify")
                return;
            for (const msg of m.messages) {
                const key = msg.key;
                if (key?.fromMe)
                    continue;
                const messageContent = msg.message;
                if (!messageContent)
                    continue;
                let text = "";
                if (messageContent.conversation)
                    text = messageContent.conversation;
                else if (messageContent.extendedTextMessage)
                    text = messageContent.extendedTextMessage.text ?? "";
                else if (messageContent.imageMessage)
                    text = messageContent.imageMessage.caption ?? "[Image]";
                else if (messageContent.videoMessage)
                    text = messageContent.videoMessage.caption ?? "[Video]";
                else if (messageContent.audioMessage)
                    text = "[Audio]";
                else if (messageContent.documentMessage)
                    text = "[Document]";
                else if (messageContent.stickerMessage)
                    text = "[Sticker]";
                else
                    text = "[Media]";
                const remoteJid = key?.remoteJid ?? "";
                const isGroup = remoteJid.endsWith("@g.us");
                const pushName = msg.pushName ?? "Unknown";
                const envelope = {
                    id: key?.id ?? uuidv4(),
                    channel: config.id, channelType: "whatsapp",
                    sender: { id: key?.participant ?? key?.remoteJid ?? "unknown", displayName: pushName, isBot: false },
                    conversationId: remoteJid,
                    content: [{ type: "text", text }],
                    mentions: [],
                    isGroupMessage: isGroup,
                    isMentioned: text.includes("@everyone") || false,
                    timestamp: msg.messageTimestamp * 1000 ?? Date.now(), metadata: {},
                };
                state.messageCount++;
                state.onMessage?.(envelope);
            }
        });
    }
    catch (err) {
        console.error(`[whatsapp:${config.id}] Baileys init failed:`, err);
        console.log(`[whatsapp:${config.id}] Install with: pnpm add @whiskeysockets/baileys @hapi/boom pino`);
        state.connected = false;
    }
}
async function flushQueue(channelId, state) {
    while (state.queue.length > 0) {
        const reply = state.queue.shift();
        if (reply) {
            try {
                await plugin.sendMessage(channelId, reply);
            }
            catch {
                state.queue.unshift(reply);
                break;
            }
        }
    }
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const state = getState(config.id);
        fs.mkdirSync(state.authDir, { recursive: true });
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        await initBaileys(state, config, onMessage);
    },
    stopChannel: async (id) => {
        const s = states.get(id);
        if (!s)
            return;
        if (s.reconnectTimer)
            clearTimeout(s.reconnectTimer);
        const sock = s.sock;
        if (sock?.end)
            sock.end(undefined);
        s.connected = false;
        states.delete(id);
    },
    sendMessage: async (id, reply) => {
        const s = states.get(id);
        if (!s || !s.connected) {
            if (s)
                s.queue.push(reply);
            return;
        }
        const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
        if (!text)
            return;
        try {
            const sock = s.sock;
            await sock.sendMessage(reply.conversationId, { text });
        }
        catch {
            s.queue.push(reply);
        }
    },
    handleCommand: async () => { },
    handleApproval: async () => { },
    getStatus: async (id) => {
        const s = states.get(id);
        return {
            id, type: "whatsapp", connected: s?.connected ?? false,
            messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0,
            error: s?.qrCode ? `QR Code available for scanning` : undefined,
        };
    },
};
export default plugin;
//# sourceMappingURL=index.js.map
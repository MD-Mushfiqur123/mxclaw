import { v4 as uuidv4 } from "uuid";
const manifest = {
    name: "telegram", version: "0.1.0", type: "channel",
    description: "Telegram Bot API channel plugin (long polling)",
    author: "mxclaw", main: "dist/index.js",
    capabilities: ["sendMessage", "receiveMessage", "attachments", "markdown"],
};
const states = new Map();
function getState(channelId) {
    let state = states.get(channelId);
    if (!state) {
        state = { token: "", botInfo: null, polling: false, offset: 0, connected: false, messageCount: 0, queue: [], pollAbort: null };
        states.set(channelId, state);
    }
    return state;
}
const plugin = {
    manifest,
    setupChannel: async (config) => {
        const token = config.credentials?.token ?? process.env.TELEGRAM_BOT_TOKEN;
        if (!token)
            throw new Error("Telegram bot token required (credentials.token or TELEGRAM_BOT_TOKEN)");
        const state = getState(config.id);
        state.token = token;
        // Get bot info
        const resp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await resp.json();
        if (data.ok)
            state.botInfo = data.result;
    },
    startChannel: async (config, onMessage) => {
        const state = getState(config.id);
        state.onMessage = onMessage;
        state.polling = true;
        state.connected = true;
        pollUpdates(config.id, state);
    },
    stopChannel: async (channelId) => {
        const state = states.get(channelId);
        if (!state)
            return;
        state.polling = false;
        state.connected = false;
        state.pollAbort?.abort();
        states.delete(channelId);
    },
    sendMessage: async (channelId, reply) => {
        const state = states.get(channelId);
        if (!state)
            return;
        const textContent = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
        if (!textContent)
            return;
        // Telegram limits messages to 4096 chars — chunk if needed
        const chunks = chunkText(textContent, 4096);
        for (const chunk of chunks) {
            const resp = await fetch(`https://api.telegram.org/bot${state.token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: reply.conversationId,
                    text: chunk,
                    parse_mode: "Markdown",
                    ...(reply.threadId ? { reply_to_message_id: parseInt(reply.threadId, 10) } : {}),
                }),
            });
            if (!resp.ok) {
                // Retry without markdown if parsing fails
                await fetch(`https://api.telegram.org/bot${state.token}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: reply.conversationId, text: chunk }),
                });
            }
        }
        // Send images/files
        for (const content of reply.content) {
            if (content.type === "image" && content.url) {
                await fetch(`https://api.telegram.org/bot${state.token}/sendPhoto`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: reply.conversationId, photo: content.url }),
                });
            }
        }
    },
    handleCommand: async () => { },
    handleApproval: async () => { },
    getStatus: async (channelId) => {
        const state = states.get(channelId);
        return {
            id: channelId, type: "telegram",
            connected: state?.connected ?? false,
            messageCount: state?.messageCount ?? 0,
            queueSize: state?.queue.length ?? 0,
        };
    },
};
async function resolveFileUrl(token, fileId) {
    try {
        const resp = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
        const data = await resp.json();
        if (data.ok && data.result?.file_path) {
            return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
        }
    }
    catch { }
    return "";
}
async function pollUpdates(channelId, state) {
    while (state.polling) {
        try {
            state.pollAbort = new AbortController();
            const resp = await fetch(`https://api.telegram.org/bot${state.token}/getUpdates?offset=${state.offset}&timeout=30&allowed_updates=["message","edited_message"]`, { signal: state.pollAbort.signal });
            const data = await resp.json();
            if (!data.ok) {
                await delay(5000);
                continue;
            }
            for (const update of data.result) {
                state.offset = update.update_id + 1;
                const msg = update.message ?? update.edited_message;
                if (!msg)
                    continue;
                if (msg.from?.is_bot)
                    continue;
                // Resolve photo/document URLs via Telegram getFile API
                let photoUrl = "";
                let docUrl = "";
                if (msg.photo && msg.photo.length > 0) {
                    const largest = msg.photo.at(-1);
                    photoUrl = await resolveFileUrl(state.token, largest.file_id);
                }
                if (msg.document) {
                    docUrl = await resolveFileUrl(state.token, msg.document.file_id);
                }
                const envelope = {
                    id: String(msg.message_id),
                    channel: channelId,
                    channelType: "telegram",
                    sender: {
                        id: String(msg.from?.id ?? 0),
                        displayName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || "Unknown",
                        avatarUrl: undefined,
                        isBot: msg.from?.is_bot ?? false,
                    },
                    conversationId: String(msg.chat.id),
                    content: [
                        ...(msg.text ? [{ type: "text", text: msg.text }] : []),
                        ...(msg.photo ? [{ type: "image", url: photoUrl, alt: "photo" }] : []),
                        ...(msg.document ? [{ type: "file", url: docUrl, name: msg.document.file_name ?? "file" }] : []),
                    ],
                    mentions: (msg.entities ?? []).filter(e => e.type === "mention").map(e => msg.text?.substring(e.offset, e.offset + e.length) ?? ""),
                    isGroupMessage: msg.chat.type !== "private",
                    isMentioned: msg.text?.includes(`@${state.botInfo?.username}`) ?? false,
                    timestamp: (msg.date ?? 0) * 1000,
                    metadata: { chatType: msg.chat.type, chatTitle: msg.chat.title },
                };
                state.messageCount++;
                state.onMessage?.(envelope);
            }
        }
        catch (err) {
            if (err.name !== "AbortError") {
                console.error(`[telegram:${channelId}] Poll error:`, err);
                await delay(5000);
            }
        }
    }
}
function chunkText(text, maxLen) {
    if (text.length <= maxLen)
        return [text];
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
        }
        let breakPoint = remaining.lastIndexOf("\n", maxLen);
        if (breakPoint < maxLen / 2)
            breakPoint = maxLen;
        chunks.push(remaining.slice(0, breakPoint));
        remaining = remaining.slice(breakPoint);
    }
    return chunks;
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
export default plugin;
//# sourceMappingURL=index.js.map
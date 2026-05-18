import type { ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope, ChannelStatus, ApprovalRequest, PluginManifest } from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";

const manifest: PluginManifest = {
  name: "telegram", version: "0.1.0", type: "channel",
  description: "Telegram Bot API channel plugin (long polling)",
  author: "mxclaw", main: "dist/index.js",
  capabilities: ["sendMessage", "receiveMessage", "attachments", "markdown"],
};

interface TelegramState {
  token: string;
  botInfo: { id: number; username: string } | null;
  polling: boolean;
  offset: number;
  connected: boolean;
  messageCount: number;
  queue: ReplyEnvelope[];
  pollAbort: AbortController | null;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}

const states = new Map<string, TelegramState>();

function getState(channelId: string): TelegramState {
  let state = states.get(channelId);
  if (!state) {
    state = { token: "", botInfo: null, polling: false, offset: 0, connected: false, messageCount: 0, queue: [], pollAbort: null };
    states.set(channelId, state);
  }
  return state;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config: ChannelConfig) => {
    const token = (config.credentials?.token as string) ?? process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("Telegram bot token required (credentials.token or TELEGRAM_BOT_TOKEN)");
    const state = getState(config.id);
    state.token = token;
    // Get bot info
    const resp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await resp.json() as { ok: boolean; result: { id: number; username: string } };
    if (data.ok) state.botInfo = data.result;
  },

  startChannel: async (config: ChannelConfig, onMessage: (env: MessageEnvelope) => Promise<void>) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    state.polling = true;
    state.connected = true;
    pollUpdates(config.id, state);
  },

  stopChannel: async (channelId: string) => {
    const state = states.get(channelId);
    if (!state) return;
    state.polling = false;
    state.connected = false;
    state.pollAbort?.abort();
    states.delete(channelId);
  },

  sendMessage: async (channelId: string, reply: ReplyEnvelope) => {
    const state = states.get(channelId);
    if (!state) return;
    const textContent = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!textContent) return;
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

  handleCommand: async () => {},
  handleApproval: async () => {},

  getStatus: async (channelId: string): Promise<ChannelStatus> => {
    const state = states.get(channelId);
    return {
      id: channelId, type: "telegram",
      connected: state?.connected ?? false,
      messageCount: state?.messageCount ?? 0,
      queueSize: state?.queue.length ?? 0,
    };
  },
};

async function resolveFileUrl(token: string, fileId: string): Promise<string> {
  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data = await resp.json() as { ok: boolean; result?: { file_path: string } };
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
    }
  } catch {}
  return "";
}

async function pollUpdates(channelId: string, state: TelegramState): Promise<void> {
  while (state.polling) {
    try {
      state.pollAbort = new AbortController();
      const resp = await fetch(
        `https://api.telegram.org/bot${state.token}/getUpdates?offset=${state.offset}&timeout=30&allowed_updates=["message","edited_message"]`,
        { signal: state.pollAbort.signal },
      );
      const data = await resp.json() as { ok: boolean; result: TelegramUpdate[] };
      if (!data.ok) { await delay(5000); continue; }
      for (const update of data.result) {
        state.offset = update.update_id + 1;
        const msg = update.message ?? update.edited_message;
        if (!msg) continue;
        if (msg.from?.is_bot) continue;

        // Resolve photo/document URLs via Telegram getFile API
        let photoUrl = "";
        let docUrl = "";
        if (msg.photo && msg.photo.length > 0) {
          const largest = msg.photo.at(-1)!;
          photoUrl = await resolveFileUrl(state.token, largest.file_id);
        }
        if (msg.document) {
          docUrl = await resolveFileUrl(state.token, msg.document.file_id);
        }

        const envelope: MessageEnvelope = {
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
            ...(msg.text ? [{ type: "text" as const, text: msg.text }] : []),
            ...(msg.photo ? [{ type: "image" as const, url: photoUrl, alt: "photo" }] : []),
            ...(msg.document ? [{ type: "file" as const, url: docUrl, name: msg.document.file_name ?? "file" }] : []),
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
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(`[telegram:${channelId}] Poll error:`, err);
        await delay(5000);
      }
    }
  }
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name: string; last_name?: string; username?: string; is_bot: boolean };
  chat: { id: number; type: string; title?: string };
  date: number;
  text?: string;
  photo?: Array<{ file_id: string }>;
  document?: { file_id: string; file_name?: string };
  entities?: Array<{ type: string; offset: number; length: number }>;
}

function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let breakPoint = remaining.lastIndexOf("\n", maxLen);
    if (breakPoint < maxLen / 2) breakPoint = maxLen;
    chunks.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint);
  }
  return chunks;
}

function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

export default plugin;
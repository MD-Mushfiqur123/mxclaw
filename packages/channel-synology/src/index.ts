import type {
  ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope,
  ChannelStatus, PluginManifest,
} from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";

interface SynologyState {
  host: string;
  port: number;
  token: string;
  connected: boolean;
  messageCount: number;
  queue: ReplyEnvelope[];
  pollTimer: ReturnType<typeof setInterval> | null;
  lastKnownId: number;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}

const manifest: PluginManifest = {
  name: "synology", version: "0.1.0", type: "channel",
  description: "Synology Chat channel plugin via REST API polling", author: "mxclaw",
  main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "rooms"],
};

const states = new Map<string, SynologyState>();

function getState(id: string): SynologyState {
  let s = states.get(id);
  if (!s) { s = { host: "", port: 5001, token: "", connected: false, messageCount: 0, queue: [], pollTimer: null, lastKnownId: 0 }; states.set(id, s); }
  return s;
}

function apiUrl(state: SynologyState, api: string): string {
  const proto = state.port === 443 ? "https" : "http";
  return `${proto}://${state.host}:${state.port}/webapi/entry.cgi?api=SYNO.Chat.${api}&version=2&token=${state.token}`;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config) => {
    const state = getState(config.id);
    state.host = (config.credentials?.host as string) ?? "";
    state.port = (config.credentials?.port as number) ?? 5001;
    state.token = (config.credentials?.token as string) ?? "";
    if (!state.host || !state.token) throw new Error("Synology Chat host and token required");
  },
  startChannel: async (config, onMessage) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    state.connected = true;

    const poll = async () => {
      try {
        const resp = await fetch(`${apiUrl(state, "Message")}&method=list&offset=0&limit=50`, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const data = (await resp.json()) as {
          success: boolean; data?: { messages?: Array<{ id: number; text: string; user: { username: string; display_name: string }; timestamp: number; chat_id: string }> };
        };
        if (!data.success) return;
        const messages = data.data?.messages ?? [];
        for (const msg of messages) {
          if (msg.id <= state.lastKnownId) continue;
          state.lastKnownId = msg.id;
          const envelope: MessageEnvelope = {
            id: String(msg.id), channel: config.id, channelType: "synology",
            sender: { id: msg.user.username, displayName: msg.user.display_name, isBot: false },
            conversationId: msg.chat_id,
            content: [{ type: "text", text: msg.text }],
          mentions: [], isGroupMessage: true, isMentioned: false,
          timestamp: msg.timestamp * 1000,
          metadata: {},
        };
          state.messageCount++;
          state.onMessage?.(envelope);
        }
      } catch { /* retry */ }
    };
    poll();
    state.pollTimer = setInterval(poll, 3000);
  },
  stopChannel: async (id) => {
    const s = states.get(id); if (!s) return;
    if (s.pollTimer) clearInterval(s.pollTimer); s.connected = false; states.delete(id);
  },
  sendMessage: async (id, reply) => {
    const s = states.get(id); if (!s) return;
    const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!text) return;
    try {
      const params = new URLSearchParams({ text, chat_id: reply.conversationId });
      await fetch(`${apiUrl(s, "Message")}&method=send&${params.toString()}`, {
        method: "POST",
      });
    } catch { s.queue.push(reply); }
  },
  handleCommand: async () => {},
  handleApproval: async () => {},
  getStatus: async (id) => {
    const s = states.get(id);
    return { id, type: "synology", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
  },
};

export default plugin;

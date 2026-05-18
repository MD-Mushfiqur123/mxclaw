import type {
  ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope,
  ChannelStatus, PluginManifest,
} from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";

const manifest: PluginManifest = {
  name: "imessage", version: "0.1.0", type: "channel",
  description: "iMessage/BlueBubbles channel plugin", author: "mxclaw",
  main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "attachments", "tapbacks"],
};

interface IMessageState {
  serverUrl: string; password: string; connected: boolean; messageCount: number;
  queue: ReplyEnvelope[]; ws: WebSocket | null;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}
const states = new Map<string, IMessageState>();

function getState(id: string): IMessageState {
  let s = states.get(id);
  if (!s) { s = { serverUrl: "", password: "", connected: false, messageCount: 0, queue: [], ws: null }; states.set(id, s); }
  return s;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config) => {
    const serverUrl = (config.credentials?.serverUrl as string) ?? process.env.BLUEBUBBLES_SERVER_URL ?? "http://localhost:1234";
    const password = (config.credentials?.password as string) ?? process.env.BLUEBUBBLES_PASSWORD;
    if (!password) throw new Error("BlueBubbles password required");
    const state = getState(config.id);
    state.serverUrl = serverUrl;
    state.password = password;
  },
  startChannel: async (config, onMessage) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    // Connect to BlueBubbles WebSocket
    try {
      state.ws = new WebSocket(`${state.serverUrl.replace("http", "ws")}/ws?password=${state.password}`);
      state.ws.onopen = () => { state.connected = true; };
      state.ws.onmessage = (event) => {
        const data = JSON.parse(event.data as string) as { type: string; data: Array<{ guid: string; handle: Array<{ address: string }>; text: string; date: number; chatGuid: string }> };
        if (data.type === "new-message") {
          for (const msg of data.data) {
            const envelope: MessageEnvelope = {
              id: msg.guid ?? uuidv4(), channel: config.id, channelType: "imessage",
              sender: { id: msg.handle?.[0]?.address ?? "unknown", displayName: msg.handle?.[0]?.address ?? "Unknown", isBot: false },
              conversationId: msg.chatGuid ?? msg.handle?.[0]?.address ?? "",
              content: [{ type: "text", text: msg.text ?? "" }],
              mentions: [], isGroupMessage: false, isMentioned: false,
              timestamp: msg.date ?? Date.now(), metadata: {},
            };
            state.messageCount++;
            state.onMessage?.(envelope);
          }
        }
      };
      state.ws.onclose = () => { state.connected = false; setTimeout(() => plugin.startChannel?.(config, onMessage), 5000); };
    } catch { /* retry */ }
  },
  stopChannel: async (id) => {
    const s = states.get(id); if (!s) return;
    s.ws?.close(); s.connected = false; states.delete(id);
  },
  sendMessage: async (id, reply) => {
    const s = states.get(id); if (!s) return;
    const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!text) return;
    try {
      await fetch(`${s.serverUrl}/api/v1/message/text`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatGuid: reply.conversationId, message: text, password: s.password }),
      });
    } catch { s.queue.push(reply); }
  },
  handleCommand: async () => {},
  handleApproval: async () => {},
  getStatus: async (id) => {
    const s = states.get(id);
    return { id, type: "imessage", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
  },
};

export default plugin;
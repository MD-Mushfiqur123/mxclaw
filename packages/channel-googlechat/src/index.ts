import type {
  ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope,
  ChannelStatus, PluginManifest,
} from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";

const manifest: PluginManifest = {
  name: "googlechat", version: "0.1.0", type: "channel",
  description: "Google Chat channel plugin", author: "mxclaw",
  main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "cards", "spaces"],
};

interface GCState {
  serviceAccountKey: Record<string, unknown>; accessToken: string; tokenExpiry: number;
  connected: boolean; messageCount: number; queue: ReplyEnvelope[];
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}
const states = new Map<string, GCState>();

function getState(id: string): GCState {
  let s = states.get(id);
  if (!s) { s = { serviceAccountKey: {}, accessToken: "", tokenExpiry: 0, connected: false, messageCount: 0, queue: [] }; states.set(id, s); }
  return s;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config) => {
    const keyJson = (config.credentials?.serviceAccountKey as string) ?? process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyJson) throw new Error("Google service account key required");
    const state = getState(config.id);
    state.serviceAccountKey = JSON.parse(keyJson);
  },
  startChannel: async (config, onMessage) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    state.connected = true;
    console.log(`[googlechat:${config.id}] Started - configure Google Chat app with webhook URL`);
  },
  stopChannel: async (id) => {
    const s = states.get(id); if (!s) return;
    s.connected = false; states.delete(id);
  },
  sendMessage: async (id, reply) => {
    const s = states.get(id); if (!s) return;
    const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!text) return;
    try {
      await fetch(`https://chat.googleapis.com/v1/${reply.conversationId}/messages`, {
        method: "POST", headers: { Authorization: `Bearer ${s.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch { s.queue.push(reply); }
  },
  handleCommand: async () => {},
  handleApproval: async () => {},
  getStatus: async (id) => {
    const s = states.get(id);
    return { id, type: "googlechat", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
  },
};

export default plugin;
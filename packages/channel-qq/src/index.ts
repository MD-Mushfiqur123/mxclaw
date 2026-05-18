import type {
  ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope,
  ChannelStatus, PluginManifest,
} from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

interface QQState {
  host: string;
  port: number;
  ws: WebSocket | null;
  connected: boolean;
  messageCount: number;
  queue: ReplyEnvelope[];
  selfId: number;
  echoCounter: number;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}

const manifest: PluginManifest = {
  name: "qq", version: "0.1.0", type: "channel",
  description: "QQ channel plugin via go-cqhttp OneBot v11 WebSocket", author: "mxclaw",
  main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "groups", "pm"],
};

const states = new Map<string, QQState>();

function getState(id: string): QQState {
  let s = states.get(id);
  if (!s) { s = { host: "127.0.0.1", port: 6700, ws: null, connected: false, messageCount: 0, queue: [], selfId: 0, echoCounter: 0 }; states.set(id, s); }
  return s;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config) => {
    const state = getState(config.id);
    state.host = (config.credentials?.host as string) ?? "127.0.0.1";
    state.port = (config.credentials?.port as number) ?? 6700;
  },
  startChannel: async (config, onMessage) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    state.ws = new WebSocket(`ws://${state.host}:${state.port}`);

    state.ws.on("open", () => {
      state.connected = true;
    });

    state.ws.on("message", (raw: Buffer) => {
      try {
        const data = JSON.parse(raw.toString()) as {
          post_type?: string; message_type?: string; message_id?: number;
          user_id?: number; group_id?: number; sender?: { user_id: number; nickname: string; card?: string };
          message?: string; self_id?: number; echo?: string;
        };

        if (data.self_id) state.selfId = data.self_id;
        if (data.post_type === "meta_event" && data.message_type === "heartbeat") {
          const pong = JSON.stringify({ action: ".handle_quick_operation", params: {} });
          state.ws?.send(pong);
          return;
        }

        if (data.post_type !== "message") return;
        const sender = data.sender ?? { user_id: data.user_id ?? 0, nickname: "unknown", card: undefined };
        const isGroup = data.message_type === "group";
        const conversationId = isGroup ? String(data.group_id) : String(sender.user_id);
        const text = data.message ?? "";

        const envelope: MessageEnvelope = {
          id: String(data.message_id ?? uuidv4()), channel: config.id, channelType: "qq",
          sender: { id: String(sender.user_id), displayName: sender.card ?? sender.nickname, isBot: false },
          conversationId,
          content: [{ type: "text", text }],
          mentions: [],
          isGroupMessage: isGroup,
          isMentioned: isGroup && text.includes(String(state.selfId)),
          timestamp: Date.now(),
          metadata: {},
        };
        state.messageCount++;
        state.onMessage?.(envelope);
      } catch {}
    });

    state.ws.on("close", () => { state.connected = false; setTimeout(() => plugin.startChannel?.(config, onMessage), 10000); });
    state.ws.on("error", () => {});
  },
  stopChannel: async (id) => {
    const s = states.get(id); if (!s) return;
    s.ws?.close(); s.connected = false; states.delete(id);
  },
  sendMessage: async (id, reply) => {
    const s = states.get(id); if (!s || !s.connected) return;
    const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!text) return;

    const isGroup = reply.conversationId.length >= 10;
    const action = isGroup ? "send_group_msg" : "send_private_msg";
    const idField = isGroup ? "group_id" : "user_id";
    const payload = {
      action,
      params: { [idField]: Number(reply.conversationId), message: text },
      echo: String(++s.echoCounter),
    };
    try {
      s.ws?.send(JSON.stringify(payload));
    } catch { s.queue.push(reply); }
  },
  handleCommand: async () => {},
  handleApproval: async () => {},
  getStatus: async (id) => {
    const s = states.get(id);
    return { id, type: "qq", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
  },
};

export default plugin;

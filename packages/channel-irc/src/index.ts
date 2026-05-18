import type {
  ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope,
  ChannelStatus, PluginManifest,
} from "@mxclaw/core";
import * as net from "node:net";
import { v4 as uuidv4 } from "uuid";

const manifest: PluginManifest = {
  name: "irc", version: "0.1.0", type: "channel",
  description: "IRC channel plugin", author: "mxclaw",
  main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "channels", "pm"],
};

interface IrcState {
  host: string; port: number; nick: string; channels: string[];
  socket: net.Socket | null; connected: boolean; messageCount: number;
  queue: ReplyEnvelope[]; buffer: string;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}
const states = new Map<string, IrcState>();

function getState(id: string): IrcState {
  let s = states.get(id);
  if (!s) { s = { host: "", port: 6667, nick: "mxclaw", channels: [], socket: null, connected: false, messageCount: 0, queue: [], buffer: "" }; states.set(id, s); }
  return s;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config) => {
    const state = getState(config.id);
    state.host = (config.credentials?.host as string) ?? "irc.libera.chat";
    state.port = (config.credentials?.port as number) ?? 6667;
    state.nick = (config.credentials?.nick as string) ?? "mxclaw";
    state.channels = (config.options?.channels as string[]) ?? [];
  },
  startChannel: async (config, onMessage) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    state.socket = new net.Socket();

    state.socket.connect(state.port, state.host, () => {
      state.socket!.write(`NICK ${state.nick}\r\n`);
      state.socket!.write(`USER ${state.nick} 0 * :mxclaw AI Gateway\r\n`);
    });

    state.socket.on("data", (data: Buffer) => {
      state.buffer += data.toString();
      const lines = state.buffer.split("\r\n");
      state.buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("PING")) {
          state.socket?.write(`PONG ${line.slice(5)}\r\n`);
          continue;
        }

        // Handle 001 (welcome) - join channels
        if (line.includes(" 001 ")) {
          state.connected = true;
          for (const ch of state.channels) {
            state.socket?.write(`JOIN ${ch}\r\n`);
          }
        }

        // Handle PRIVMSG
        const privmsgMatch = line.match(/^:([^!]+)!([^ ]+) PRIVMSG (#?\w+) :(.+)$/);
        if (privmsgMatch) {
          const sender = privmsgMatch[1]!;
          const target = privmsgMatch[3]!;
          const text = privmsgMatch[4]!;
          if (sender === state.nick) continue;

          const isChannel = target.startsWith("#");
          const envelope: MessageEnvelope = {
            id: uuidv4(), channel: config.id, channelType: "irc",
            sender: { id: sender, displayName: sender, isBot: false },
            conversationId: isChannel ? target : sender,
            content: [{ type: "text", text }],
            mentions: isChannel && text.includes(state.nick) ? [state.nick] : [],
            isGroupMessage: isChannel,
            isMentioned: isChannel && text.includes(state.nick),
            timestamp: Date.now(), metadata: {},
          };
          state.messageCount++;
          state.onMessage?.(envelope);
        }
      }
    });

    state.socket.on("close", () => { state.connected = false; setTimeout(() => plugin.startChannel?.(config, onMessage), 10000); });
    state.socket.on("error", () => {});
  },
  stopChannel: async (id) => {
    const s = states.get(id); if (!s) return;
    s.socket?.write(`QUIT :mxclaw shutting down\r\n`);
    s.socket?.destroy(); s.connected = false; states.delete(id);
  },
  sendMessage: async (id, reply) => {
    const s = states.get(id); if (!s || !s.connected) return;
    const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!text) return;
    const lines = text.split("\n");
    for (const line of lines) {
      s.socket?.write(`PRIVMSG ${reply.conversationId} :${line}\r\n`);
    }
  },
  handleCommand: async () => {},
  handleApproval: async () => {},
  getStatus: async (id) => {
    const s = states.get(id);
    return { id, type: "irc", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
  },
};

export default plugin;
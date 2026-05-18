import type {
  ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope,
  ChannelStatus, PluginManifest,
} from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

interface NostrState {
  relay: string;
  privateKey: string;
  privateKeyBytes: Uint8Array;
  publicKey: string;
  ws: WebSocket | null;
  connected: boolean;
  messageCount: number;
  queue: ReplyEnvelope[];
  subId: string | null;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}

const manifest: PluginManifest = {
  name: "nostr", version: "0.1.0", type: "channel",
  description: "Nostr protocol channel plugin via WebSocket relays", author: "mxclaw",
  main: "dist/index.js", capabilities: ["sendMessage", "receiveMessage", "channels"],
};

const states = new Map<string, NostrState>();

function getState(id: string): NostrState {
  let s = states.get(id);
  if (!s) { s = { relay: "", privateKey: "", privateKeyBytes: new Uint8Array(), publicKey: "", ws: null, connected: false, messageCount: 0, queue: [], subId: null }; states.set(id, s); }
  return s;
}

function packEvent(pubkey: string, kind: number, tags: string[][], content: string): string {
  const created_at = Math.floor(Date.now() / 1000);
  const json = JSON.stringify([0, pubkey, created_at, kind, tags, content]);
  return json;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config) => {
    const state = getState(config.id);
    state.relay = (config.credentials?.relay as string) ?? "wss://relay.damus.io";
    state.privateKey = (config.credentials?.privateKey as string) ?? "";
    if (!state.privateKey) throw new Error("Nostr privateKey (hex) required in credentials");
    state.privateKeyBytes = hexToBytes(state.privateKey);
    import("nostr-tools").then(({ getPublicKey }) => {
      state.publicKey = getPublicKey(state.privateKeyBytes);
    });
  },
  startChannel: async (config, onMessage) => {
    const state = getState(config.id);
    state.onMessage = onMessage;

    state.ws = new WebSocket(state.relay);
    state.subId = uuidv4().slice(0, 8);

    state.ws.on("open", () => {
      state.connected = true;
      const sub = JSON.stringify(["REQ", state.subId, { kinds: [1], "#p": [state.publicKey], limit: 0 }]);
      state.ws!.send(sub);
    });

    state.ws.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as unknown[];
        if (msg[0] === "EVENT" && msg[1] === state.subId) {
          const event = msg[2] as { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string };
          if (event.pubkey === state.publicKey) return;
          const npub = event.pubkey.slice(0, 8);
          const envelope: MessageEnvelope = {
            id: event.id, channel: config.id, channelType: "nostr",
            sender: { id: event.pubkey, displayName: npub, isBot: false },
            conversationId: event.pubkey,
            content: [{ type: "text", text: event.content }],
            mentions: [],
            isGroupMessage: false,
            isMentioned: event.content.includes(state.publicKey.slice(0, 8)),
            timestamp: event.created_at * 1000,
            metadata: {},
          };
          state.messageCount++;
          state.onMessage?.(envelope);
        }
      } catch {}
    });

    state.ws.on("close", () => { state.connected = false; setTimeout(() => plugin.startChannel?.(config, onMessage), 10000); });
    state.ws.on("error", () => {});
  },
  stopChannel: async (id) => {
    const s = states.get(id); if (!s) return;
    if (s.subId && s.ws?.readyState === WebSocket.OPEN) {
      s.ws.send(JSON.stringify(["CLOSE", s.subId]));
    }
    s.ws?.close(); s.connected = false; states.delete(id);
  },
  sendMessage: async (id, reply) => {
    const s = states.get(id); if (!s || !s.connected) return;
    const text = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!text) return;
    try {
      const { finalizeEvent } = await import("nostr-tools");
      const event = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", reply.conversationId]],
        content: text,
      }, s.privateKeyBytes);
      s.ws?.send(JSON.stringify(["EVENT", event]));
    } catch { s.queue.push(reply); }
  },
  handleCommand: async () => {},
  handleApproval: async () => {},
  getStatus: async (id) => {
    const s = states.get(id);
    return { id, type: "nostr", connected: s?.connected ?? false, messageCount: s?.messageCount ?? 0, queueSize: s?.queue.length ?? 0 };
  },
};

export default plugin;

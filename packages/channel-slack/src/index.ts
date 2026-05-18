import type { ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope, ChannelStatus, PluginManifest } from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";

const manifest: PluginManifest = {
  name: "slack", version: "0.1.0", type: "channel",
  description: "Slack Events API + Socket Mode channel plugin",
  author: "mxclaw", main: "dist/index.js",
  capabilities: ["sendMessage", "receiveMessage", "threads", "reactions", "attachments"],
};

interface SlackState {
  botToken: string;
  appToken: string;
  botId: string;
  wsUrl: string | null;
  ws: WebSocket | null;
  connected: boolean;
  messageCount: number;
  queue: ReplyEnvelope[];
  reconnectAttempt: number;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}

const states = new Map<string, SlackState>();

function getState(channelId: string): SlackState {
  let state = states.get(channelId);
  if (!state) {
    state = { botToken: "", appToken: "", botId: "", wsUrl: null, ws: null, connected: false, messageCount: 0, queue: [], reconnectAttempt: 0 };
    states.set(channelId, state);
  }
  return state;
}

const plugin: ChannelPlugin = {
  manifest,
  setupChannel: async (config: ChannelConfig) => {
    const botToken = (config.credentials?.botToken as string) ?? process.env.SLACK_BOT_TOKEN;
    const appToken = (config.credentials?.appToken as string) ?? process.env.SLACK_APP_TOKEN;
    if (!botToken) throw new Error("Slack bot token required (credentials.botToken or SLACK_BOT_TOKEN)");
    if (!appToken) throw new Error("Slack app-level token required for Socket Mode (credentials.appToken or SLACK_APP_TOKEN)");

    const state = getState(config.id);
    state.botToken = botToken;
    state.appToken = appToken;

    // Get bot user ID
    const resp = await fetch("https://slack.com/api/auth.test", {
      headers: { Authorization: `Bearer ${botToken}` },
    });
    const data = await resp.json() as { ok: boolean; user_id: string };
    if (data.ok) state.botId = data.user_id;
  },

  startChannel: async (config: ChannelConfig, onMessage: (env: MessageEnvelope) => Promise<void>) => {
    const state = getState(config.id);
    state.onMessage = onMessage;
    await connectSocketMode(config.id, state);
  },

  stopChannel: async (channelId: string) => {
    const state = states.get(channelId);
    if (!state) return;
    state.connected = false;
    if (state.ws) state.ws.close();
    states.delete(channelId);
  },

  sendMessage: async (channelId: string, reply: ReplyEnvelope) => {
    const state = states.get(channelId);
    if (!state) return;

    const textContent = reply.content.filter(c => c.type === "text").map(c => c.text).join("\n");
    if (!textContent) return;

    // Slack's max message length is ~40,000 chars but UI truncates at ~3,000
    const chunks = chunkText(textContent, 3000);
    for (const chunk of chunks) {
      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { Authorization: `Bearer ${state.botToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: reply.conversationId,
          text: chunk,
          ...(reply.threadId ? { thread_ts: reply.threadId } : {}),
          unfurl_links: false,
        }),
      });
    }
  },

  handleCommand: async () => {},
  handleApproval: async () => {},

  getStatus: async (channelId: string): Promise<ChannelStatus> => {
    const state = states.get(channelId);
    return {
      id: channelId, type: "slack",
      connected: state?.connected ?? false,
      messageCount: state?.messageCount ?? 0,
      queueSize: state?.queue.length ?? 0,
    };
  },
};

async function connectSocketMode(channelId: string, state: SlackState): Promise<void> {
  // Request a WebSocket URL via apps.connections.open
  const resp = await fetch("https://slack.com/api/apps.connections.open", {
    method: "POST",
    headers: { Authorization: `Bearer ${state.appToken}`, "Content-Type": "application/x-www-form-urlencoded" },
  });
  const data = await resp.json() as { ok: boolean; url: string };
  if (!data.ok) throw new Error("Failed to open Slack Socket Mode connection");

  state.wsUrl = data.url;
  state.ws = new WebSocket(data.url);

  state.ws.onopen = () => {
    state.connected = true;
    state.reconnectAttempt = 0;
    console.log(`[slack:${channelId}] Socket Mode connected`);
  };

  state.ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data as string) as SocketModePayload;

      // Acknowledge the event
      if (payload.envelope_id) {
        state.ws?.send(JSON.stringify({ envelope_id: payload.envelope_id }));
      }

      if (payload.type === "events_api" && payload.payload?.event) {
        const evt = payload.payload.event;
        if (evt.type === "message" && !evt.bot_id && !evt.subtype) {
          handleSlackMessage(channelId, state, evt);
        }
        if (evt.type === "app_mention") {
          handleSlackMessage(channelId, state, evt);
        }
      }
    } catch (err) {
      console.error(`[slack:${channelId}] Message parse error:`, err);
    }
  };

  state.ws.onclose = () => {
    state.connected = false;
    const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempt), 30000) + Math.random() * 1000;
    console.log(`[slack:${channelId}] Reconnecting in ${Math.round(delay)}ms`);
    state.reconnectAttempt++;
    setTimeout(() => connectSocketMode(channelId, state), delay);
  };

  state.ws.onerror = (err) => {
    console.error(`[slack:${channelId}] Socket error:`, err);
  };
}

function handleSlackMessage(channelId: string, state: SlackState, evt: SlackEvent): void {
  const envelope: MessageEnvelope = {
    id: evt.client_msg_id ?? uuidv4(),
    channel: channelId,
    channelType: "slack",
    sender: { id: evt.user ?? "unknown", displayName: evt.user ?? "Unknown", isBot: false },
    conversationId: evt.channel ?? "",
    threadId: evt.thread_ts,
    content: [{ type: "text" as const, text: evt.text ?? "" }],
    mentions: (evt.text?.match(/<@(\w+)>/g) ?? []).map(m => m.replace(/<@|>/g, "")),
    isGroupMessage: true,
    isMentioned: evt.text?.includes(`<@${state.botId}>`) ?? false,
    timestamp: Math.floor((parseFloat(evt.ts ?? "0")) * 1000),
    metadata: { channelType: evt.channel_type },
  };
  state.messageCount++;
  state.onMessage?.(envelope);
}

interface SocketModePayload {
  type: string;
  envelope_id?: string;
  payload?: { event: SlackEvent };
}

interface SlackEvent {
  type: string;
  text?: string;
  user?: string;
  channel?: string;
  ts?: string;
  thread_ts?: string;
  client_msg_id?: string;
  bot_id?: string;
  subtype?: string;
  channel_type?: string;
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

export default plugin;
import type {
  ChannelPlugin,
  ChannelConfig,
  MessageEnvelope,
  ReplyEnvelope,
  ChannelStatus,
  ApprovalRequest,
  PluginManifest,
} from "@mxclaw/core";
import { v4 as uuidv4 } from "uuid";

const manifest: PluginManifest = {
  name: "discord",
  version: "0.1.0",
  type: "channel",
  description: "Discord channel plugin (WebSocket intents)",
  author: "mxclaw",
  main: "dist/index.js",
  capabilities: ["sendMessage", "receiveMessage", "reactions", "attachments", "threads"],
};

interface DiscordState {
  token: string;
  ws: WebSocket | null;
  heartbeatInterval: ReturnType<typeof setInterval> | null;
  sequence: number | null;
  sessionId: string | null;
  connected: boolean;
  messageCount: number;
  queue: ReplyEnvelope[];
  reconnectAttempt: number;
  onMessage?: (env: MessageEnvelope) => Promise<void>;
}

const states = new Map<string, DiscordState>();

function getReconnectDelay(attempt: number): number {
  const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000); // 1s, 2s, 4s, 8s... max 30s
  const jitter = Math.random() * 1000; // 0-1s jitter
  return baseDelay + jitter;
}

function getState(channelId: string): DiscordState {
  let state = states.get(channelId);
  if (!state) {
    state = {
      token: "",
      ws: null,
      heartbeatInterval: null,
      sequence: null,
      sessionId: null,
      connected: false,
      messageCount: 0,
      queue: [],
      reconnectAttempt: 0,
    };
    states.set(channelId, state);
  }
  return state;
}



const plugin: ChannelPlugin = {
  manifest,

  setupChannel: async (config: ChannelConfig) => {
    const token = (config.credentials?.token as string) ?? process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new Error("Discord bot token required (credentials.token or DISCORD_BOT_TOKEN)");
    const state = getState(config.id);
    state.token = token;
  },

  startChannel: async (config: ChannelConfig, onMessage: (env: MessageEnvelope) => Promise<void>) => {
    const state = getState(config.id);
    state.onMessage = onMessage;

    await connectDiscord(config.id, state);
  },

  stopChannel: async (channelId: string) => {
    const state = states.get(channelId);
    if (!state) return;
    if (state.heartbeatInterval) clearInterval(state.heartbeatInterval);
    if (state.ws) state.ws.close(1000, "Channel stopped");
    state.connected = false;
    states.delete(channelId);
  },

  sendMessage: async (channelId: string, reply: ReplyEnvelope) => {
    const state = states.get(channelId);
    if (!state || !state.connected) {
      // Queue for retry
      if (state) state.queue.push(reply);
      return;
    }

    const textContent = reply.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    if (!textContent) return;

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${reply.conversationId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${state.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: textContent.slice(0, 2000),
            ...(reply.threadId ? { message_reference: { message_id: reply.threadId } } : {}),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      state.queue.push(reply);
      throw err;
    }
  },

  handleCommand: async (channelId: string, command: string, args: string[]) => {
    const state = states.get(channelId);
    if (!state) return;
    // Handle Discord-specific commands
  },

  handleApproval: async (channelId: string, approval: ApprovalRequest) => {
    const state = states.get(channelId);
    if (!state) return;
    // Send approval request as Discord message with buttons
  },

  getStatus: async (channelId: string): Promise<ChannelStatus> => {
    const state = states.get(channelId);
    return {
      id: channelId,
      type: "discord",
      connected: state?.connected ?? false,
      lastConnectedAt: state?.connected ? Date.now() : undefined,
      messageCount: state?.messageCount ?? 0,
      queueSize: state?.queue.length ?? 0,
    };
  },
};

async function connectDiscord(channelId: string, state: DiscordState): Promise<void> {
  // Get gateway URL
  const gatewayResp = await fetch("https://discord.com/api/v10/gateway/bot", {
    headers: { Authorization: `Bot ${state.token}` },
  });
  const gatewayData = (await gatewayResp.json()) as { url: string };
  const gatewayUrl = `${gatewayData.url}?v=10&encoding=json`;

  state.ws = new WebSocket(gatewayUrl);

  state.ws.onopen = () => {
    // Identify
    state.ws!.send(
      JSON.stringify({
        op: 2,
        d: {
          token: state.token,
          intents: 1 << 9 | 1 << 0 | 1 << 15, // GUILD_MESSAGES | GUILDS | MESSAGE_CONTENT
          properties: { os: process.platform, browser: "mxclaw", device: "mxclaw" },
        },
      }),
    );
  };

  state.ws.onmessage = (event) => {
    const payload = JSON.parse(event.data as string) as {
      op: number;
      t?: string;
      s?: number;
      d: Record<string, unknown>;
    };

    state.sequence = payload.s ?? state.sequence;

    switch (payload.op) {
      case 10: // Hello
        const interval = (payload.d.heartbeat_interval as number) ?? 41250;
        state.heartbeatInterval = setInterval(() => {
          state.ws?.send(JSON.stringify({ op: 1, d: state.sequence }));
        }, interval);
        break;

      case 0: // Dispatch
        if (payload.t === "READY") {
          state.sessionId = payload.d.session_id as string;
          state.connected = true;
          state.reconnectAttempt = 0; // Reset backoff on successful connection
          // Flush queued messages
          flushQueue(channelId, state);
        }
        if (payload.t === "MESSAGE_CREATE") {
          handleDiscordMessage(channelId, state, payload.d);
        }
        break;

      case 7: // Reconnect
        state.ws?.close();
        setTimeout(() => connectDiscord(channelId, state), getReconnectDelay(state.reconnectAttempt++));
        break;

      case 9: // Invalid Session
        state.sessionId = null;
        state.sequence = null;
        setTimeout(() => connectDiscord(channelId, state), getReconnectDelay(state.reconnectAttempt++));
        break;
    }
  };

  state.ws.onclose = () => {
    state.connected = false;
    if (state.heartbeatInterval) clearInterval(state.heartbeatInterval);
    // Reconnect with exponential backoff
    const delay = getReconnectDelay(state.reconnectAttempt++);
    console.log(`[discord:${channelId}] Reconnecting in ${Math.round(delay)}ms (attempt ${state.reconnectAttempt})`);
    setTimeout(() => connectDiscord(channelId, state), delay);
  };

  state.ws.onerror = (err) => {
    console.error(`[discord:${channelId}] WebSocket error:`, err);
  };
}

function handleDiscordMessage(
  channelId: string,
  state: DiscordState,
  data: Record<string, unknown>,
): void {
  const author = data.author as Record<string, unknown> | undefined;
  if (author?.bot) return; // Ignore bot messages

  const mentions = (data.mentions as Array<Record<string, unknown>>) ?? [];
  const botId = Buffer.from(state.token.split(".")[0] ?? "", "base64").toString();

  const envelope: MessageEnvelope = {
    id: (data.id as string) ?? uuidv4(),
    channel: channelId,
    channelType: "discord",
    sender: {
      id: (author?.id as string) ?? "unknown",
      displayName: (author?.username as string) ?? "Unknown",
      avatarUrl: author?.avatar
        ? `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
        : undefined,
      isBot: (author?.bot as boolean) ?? false,
    },
    conversationId: (data.channel_id as string) ?? "",
    threadId: (data.message_reference as Record<string, unknown>)?.message_id as string | undefined,
    content: [
      ...((data.content as string)
        ? [{ type: "text" as const, text: data.content as string }]
        : []),
      ...((data.attachments as Array<Record<string, unknown>>) ?? []).map((att) => ({
        type: att.content_type?.toString().startsWith("image") ? "image" as const : "file" as const,
        url: att.url as string,
        name: att.filename as string,
      })),
    ],
    mentions: mentions.map((m) => m.id as string),
    isGroupMessage: true, // Discord messages are always in guild context
    isMentioned: mentions.some((m) => m.id === botId),
    timestamp: Date.now(),
    metadata: {
      guildId: data.guild_id,
      channelName: undefined,
    },
  };

  state.messageCount++;
  state.onMessage?.(envelope);
}

async function flushQueue(channelId: string, state: DiscordState): Promise<void> {
  while (state.queue.length > 0) {
    const reply = state.queue.shift();
    if (reply) {
      try {
        await plugin.sendMessage(channelId, reply);
      } catch {
        state.queue.unshift(reply);
        break;
      }
    }
  }
}

export default plugin;
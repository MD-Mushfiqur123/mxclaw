import { create } from "zustand";

interface GatewayStatus {
  uptime: number;
  channels: Array<{ id: string; type: string; connected: boolean; messageCount: number; queueSize: number }>;
  providers: Array<{ provider: string; model: string; available: boolean; latencyMs?: number; error?: string }>;
  activeSessions: number;
  deviceCount: number;
  pluginErrors: Array<{ plugin: string; error: string }>;
  memoryUsage: { heapUsed: number; heapTotal: number; rss: number };
}

interface GatewayStore {
  connected: boolean;
  status: GatewayStatus | null;
  ws: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
  sendChat: (agentId: string, message: string) => void;
  approve: (approvalId: string, approved: boolean) => void;
}

export const useGatewayStore = create<GatewayStore>((set, get) => ({
  connected: false,
  status: null,
  ws: null,

  connect: () => {
    const existing = get().ws;
    if (existing?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`ws://${window.location.hostname}:18700`);

    ws.onopen = () => {
      set({ connected: true });
      // Auth with stored token
      const token = localStorage.getItem("mxclaw-device-token");
      if (token) {
        ws.send(JSON.stringify({ type: "auth", token }));
      }
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "status:update") {
        set({ status: msg.status });
      }
      if (msg.type === "auth:ok") {
        localStorage.setItem("mxclaw-device-token", `${msg.deviceId}:${msg.token}`);
      }
    };

    ws.onclose = () => {
      set({ connected: false });
      setTimeout(() => get().connect(), 5000);
    };

    set({ ws });
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null, connected: false });
  },

  sendChat: (agentId, message) => {
    get().ws?.send(JSON.stringify({
      type: "chat:send",
      envelope: {
        id: crypto.randomUUID(),
        channel: "control-ui",
        channelType: "web",
        sender: { id: "owner", displayName: "Owner", isBot: false },
        conversationId: agentId,
        content: [{ type: "text", text: message }],
        mentions: [],
        isGroupMessage: false,
        isMentioned: false,
        timestamp: Date.now(),
      },
    }));
  },

  approve: (approvalId, approved) => {
    get().ws?.send(JSON.stringify({
      type: "chat:approve",
      approvalId,
      approved,
    }));
  },
}));
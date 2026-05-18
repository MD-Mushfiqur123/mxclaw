import type { WsClientMessage, WsServerMessage, MessageEnvelope } from "@mxclaw/core";
import {
  validateDeviceToken,
  rotateDeviceToken,
} from "@mxclaw/security";
import type { Logger } from "@mxclaw/logging";
import type { ApprovalManager } from "@mxclaw/tools";
import type { VoiceManager } from "@mxclaw/voice";
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

export interface WsClient {
  ws: WebSocket;
  deviceId: string;
  clientId: string;
  /** Sliding window rate limiter state */
  msgTimestamps: number[];
}

export interface WsHandlerDeps {
  logger: Logger;
  approvalManager: ApprovalManager;
  voiceManager: VoiceManager;
  wsClients: Map<string, WsClient>;
  wsHeartbeatIntervalMs: number;
  voiceDefaultProvider: string;
  handleInboundMessage: (envelope: MessageEnvelope) => Promise<void>;
  /** Maximum messages per second per client */
  wsRateLimit: number;
}

/**
 * Check if a WebSocket client has exceeded its rate limit.
 * Uses a sliding window of 1 second.
 */
function isWsRateLimited(client: WsClient, maxPerSecond: number): boolean {
  const now = Date.now();
  // Remove timestamps older than 1 second
  client.msgTimestamps = client.msgTimestamps.filter(t => now - t < 1000);
  if (client.msgTimestamps.length >= maxPerSecond) {
    return true;
  }
  client.msgTimestamps.push(now);
  return false;
}

/**
 * Handle a new WebSocket connection: auth, heartbeat, rate limiting, message dispatch.
 */
export function handleWebSocketConnection(
  deps: WsHandlerDeps,
  ws: WebSocket,
): void {
  let deviceId: string | null = null;
  let authenticated = false;
  const clientId = uuidv4();
  const maxMsgsPerSecond = deps.wsRateLimit || 20;

  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, deps.wsHeartbeatIntervalMs);

  // Connection timeout — must auth within 10 seconds
  const authTimeout = setTimeout(() => {
    if (!authenticated) {
      sendWs(ws, { type: "auth:error", error: "Authentication timeout — must authenticate within 10 seconds" });
      ws.close(4001, "Auth timeout");
    }
  }, 10_000);

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString()) as WsClientMessage;

      // ── Auth handshake ──
      if (msg.type === "auth" && !authenticated) {
        const [devId, token] = msg.token.split(":");
        if (devId && token && validateDeviceToken(devId, token)) {
          authenticated = true;
          deviceId = devId;
          clearTimeout(authTimeout);
          deps.wsClients.set(clientId, { ws, deviceId: devId, clientId, msgTimestamps: [] });
          rotateDeviceToken(devId);
          sendWs(ws, { type: "auth:ok", deviceId: devId });
          deps.logger.info("ws", `Device authenticated: ${devId}`);
        } else {
          sendWs(ws, { type: "auth:error", error: "Invalid token" });
        }
        return;
      }

      if (!authenticated) {
        sendWs(ws, { type: "auth:error", error: "Not authenticated" });
        return;
      }

      // ── Rate limiting ──
      const client = deps.wsClients.get(clientId);
      if (client && isWsRateLimited(client, maxMsgsPerSecond)) {
        sendWs(ws, { type: "error", message: "Rate limited — too many messages", code: "RATE_LIMITED" });
        return;
      }

      // ── Authenticated message dispatch ──
      switch (msg.type) {
        case "chat:send": {
          // Validate sender — enforce that the sender ID matches the authenticated device
          const envelope = msg.envelope;
          if (envelope.sender.id !== deviceId && envelope.sender.id !== "owner") {
            sendWs(ws, { type: "error", message: "Sender ID mismatch — you cannot impersonate other users", code: "SENDER_MISMATCH" });
            break;
          }
          await deps.handleInboundMessage(envelope);
          break;
        }

        case "chat:approve":
          deps.approvalManager.resolveApproval(msg.approvalId, msg.approved);
          break;

        case "canvas:event":
          broadcastWs(deps.wsClients, { type: "canvas:update", json: msg.event });
          break;

        case "voice:start":
          try {
            const sessionId = await deps.voiceManager.startVoiceSession(
              deps.voiceDefaultProvider,
            );
            sendWs(ws, { type: "voice:token", token: sessionId });
          } catch (err) {
            sendWs(ws, {
              type: "voice:error",
              error: err instanceof Error ? err.message : "Voice start failed",
            });
          }
          break;

        case "voice:stop":
          break;

        case "voice:audio":
          break;

        case "presence:update":
          broadcastWs(
            deps.wsClients,
            { type: "presence:update", deviceId: deviceId!, status: msg.status },
            clientId,
          );
          break;

        case "ping":
          sendWs(ws, { type: "pong" });
          break;
      }
    } catch (err) {
      deps.logger.error("ws", "Message handling error", err);
      sendWs(ws, { type: "error", message: "Invalid message", code: "PARSE_ERROR" });
    }
  });

  ws.on("close", (code) => {
    clearInterval(heartbeatInterval);
    clearTimeout(authTimeout);
    deps.wsClients.delete(clientId);
    if (deviceId) {
      broadcastWs(deps.wsClients, { type: "presence:update", deviceId, status: "offline" });
    }
    deps.logger.debug("ws", `Client disconnected: ${clientId} (code: ${code})`);
  });

  ws.on("error", (err) => {
    deps.logger.error("ws", "WebSocket error", err);
  });
}

// ── WS Helpers ───────────────────────────────────────────────────────

export function sendWs(ws: WebSocket, msg: WsServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function broadcastWs(
  clients: Map<string, WsClient>,
  msg: WsServerMessage,
  excludeClientId?: string,
): void {
  for (const [id, client] of clients) {
    if (id !== excludeClientId) {
      sendWs(client.ws, msg);
    }
  }
}

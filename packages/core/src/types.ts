import { z } from "zod";

// ── Message Envelope ──────────────────────────────────────────────

export const MessageContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("image"), url: z.string(), alt: z.string().optional() }),
  z.object({ type: z.literal("audio"), url: z.string(), transcript: z.string().optional() }),
  z.object({ type: z.literal("video"), url: z.string() }),
  z.object({ type: z.literal("file"), url: z.string(), name: z.string(), mimeType: z.string().optional() }),
  z.object({ type: z.literal("location"), lat: z.number(), lng: z.number(), label: z.string().optional() }),
  z.object({ type: z.literal("sticker"), id: z.string(), url: z.string().optional() }),
  z.object({ type: z.literal("reaction"), emoji: z.string(), messageId: z.string() }),
  z.object({ type: z.literal("canvas"), json: z.record(z.unknown()) }),
]);

export type MessageContent = z.infer<typeof MessageContentSchema>;

export const MessageEnvelopeSchema = z.object({
  id: z.string(),
  channel: z.string(),
  channelType: z.string(),
  sender: z.object({
    id: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().optional(),
    isBot: z.boolean().default(false),
  }),
  conversationId: z.string(),
  threadId: z.string().optional(),
  content: z.array(MessageContentSchema),
  mentions: z.array(z.string()).default([]),
  isGroupMessage: z.boolean().default(false),
  isMentioned: z.boolean().default(false),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).default({}),
});

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;

// ── Reply Envelope ────────────────────────────────────────────────

export const ReplyEnvelopeSchema = z.object({
  channelMessageId: z.string().optional(),
  conversationId: z.string(),
  threadId: z.string().optional(),
  content: z.array(MessageContentSchema),
  isStreaming: z.boolean().default(false),
  streamDone: z.boolean().optional(),
  streamToken: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export type ReplyEnvelope = z.infer<typeof ReplyEnvelopeSchema>;

// ── Agent Config ──────────────────────────────────────────────────

export const ApprovalModeSchema = z.enum([
  "always-require-approval",
  "owner-only",
  "yolo",
]);

export type ApprovalMode = z.infer<typeof ApprovalModeSchema>;

export const SandboxConfigSchema = z.object({
  enabled: z.boolean().default(false),
  type: z.enum(["docker", "ssh"]).default("docker"),
  image: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
});

export const ToolConfigSchema = z.object({
  bash: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
  browser: z.object({ enabled: z.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
  canvas: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("owner-only") }).default({}),
  cron: z.object({ enabled: z.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
  sessionSpawn: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("owner-only") }).default({}),
  imageGen: z.object({ enabled: z.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
  fileRead: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("owner-only"), allowedPaths: z.array(z.string()).default(["~/.mxclaw/workspace"]) }).default({}),
  fileWrite: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("always-require-approval"), allowedPaths: z.array(z.string()).default(["~/.mxclaw/workspace"]) }).default({}),
});

export type ToolConfig = z.infer<typeof ToolConfigSchema>;

export const ProviderRefSchema = z.object({
  provider: z.string(),
  model: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  preset: z.string().optional(),
  headers: z.record(z.string()).optional(),
  modelAliases: z.record(z.string()).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(4096),
  systemPrompt: z.string().optional(),
  options: z.record(z.unknown()).default({}),
});

export type ProviderRef = z.infer<typeof ProviderRefSchema>;

export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  model: ProviderRefSchema,
  fallbackChain: z.array(ProviderRefSchema).default([]),
  tools: ToolConfigSchema.default({}),
  sandbox: SandboxConfigSchema.default({}),
  systemPrompt: z.string().optional(),
  mentionGating: z.boolean().default(true),
  maxSessionTurns: z.number().positive().default(100),
  compactionThreshold: z.number().positive().default(50),
  voice: z
    .object({
      provider: z.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
      voiceId: z.string().optional(),
      wakeWord: z.string().optional(),
    })
    .default({}),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// ── Channel Config ────────────────────────────────────────────────

export const ChannelConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  enabled: z.boolean().default(true),
  credentials: z.record(z.unknown()).default({}),
  options: z.record(z.unknown()).default({}),
  allowlist: z.array(z.string()).default([]),
  mentionGating: z.boolean().default(true),
  pairingEnabled: z.boolean().default(true),
});

export type ChannelConfig = z.infer<typeof ChannelConfigSchema>;

// ── Binding Config ────────────────────────────────────────────────

export const BindingConfigSchema = z.object({
  channelId: z.string(),
  senderId: z.string().optional(),
  agentId: z.string(),
  conversationId: z.string().optional(),
});

export type BindingConfig = z.infer<typeof BindingConfigSchema>;

// ── Device Config ─────────────────────────────────────────────────

export const DeviceConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["mobile", "desktop", "web"]),
  token: z.string().optional(),
  paired: z.boolean().default(false),
  lastSeen: z.number().optional(),
});

export type DeviceConfig = z.infer<typeof DeviceConfigSchema>;

// ── Voice Config ──────────────────────────────────────────────────

export const VoiceConfigSchema = z.object({
  defaultProvider: z.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
  openaiRealtime: z.object({ apiKey: z.string().optional(), model: z.string().default("gpt-4o-realtime-preview"), voice: z.string().default("alloy") }).default({}),
  geminiLive: z.object({ apiKey: z.string().optional(), model: z.string().default("gemini-2.0-flash-live-001"), voice: z.string().default("Puck") }).default({}),
  elevenlabs: z.object({ apiKey: z.string().optional(), voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM") }).default({}),
  systemTts: z.object({ rate: z.number().default(1.0), pitch: z.number().default(1.0) }).default({}),
});

export type VoiceConfig = z.infer<typeof VoiceConfigSchema>;

// ── Logging Config ────────────────────────────────────────────────

export const LoggingConfigSchema = z.object({
  level: z.enum(["silent", "error", "warn", "info", "debug", "trace"]).default("info"),
  subsystems: z.record(z.enum(["silent", "error", "warn", "info", "debug", "trace"])).default({}),
  file: z.string().optional(),
  otel: z
    .object({
      enabled: z.boolean().default(false),
      endpoint: z.string().optional(),
      headers: z.record(z.string()).default({}),
    })
    .default({}),
});

export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;

// ── Storage Config ────────────────────────────────────────────────

export const StorageConfigSchema = z.object({
  type: z.enum(["jsonl", "sqlite"]).default("jsonl"),
  workspacePath: z.string().default("~/.mxclaw/workspace"),
  lanceDbPath: z.string().default("~/.mxclaw/lancedb"),
  sqlitePath: z.string().default("~/.mxclaw/mxclaw.db"),
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

// ── Gateway Config ────────────────────────────────────────────────

export const GatewayConfigSchema = z.object({
  host: z.string().default("127.0.0.1"),
  port: z.number().int().positive().default(18700),
  webhookPath: z.string().default("/gateway/webhook"),
  corsOrigins: z.array(z.string()).default(["http://localhost:5173"]),
  wsHeartbeatIntervalMs: z.number().positive().default(30000),
  apiToken: z.string().optional(),
});

export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;

// ── Root Config ───────────────────────────────────────────────────

export const MxClawConfigSchema = z.object({
  version: z.literal(1),
  gateway: GatewayConfigSchema.default({}),
  agents: z.record(AgentConfigSchema).default({}),
  defaultAgentId: z.string().optional(),
  ownerId: z.string().optional(),
  channels: z.record(ChannelConfigSchema).default({}),
  bindings: z.array(BindingConfigSchema).default([]),
  devices: z.array(DeviceConfigSchema).default([]),
  voice: VoiceConfigSchema.default({}),
  logging: LoggingConfigSchema.default({}),
  storage: StorageConfigSchema.default({}),
  plugins: z.array(z.string()).default([]),
  sandbox: SandboxConfigSchema.default({}),
});

export type MxClawConfig = z.infer<typeof MxClawConfigSchema>;

// ── Session Types ─────────────────────────────────────────────────

export interface SessionTurn {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  toolResults?: Array<{
    id: string;
    name: string;
    result: string;
    error?: string;
  }>;
  timestamp: number;
  tokenCount?: number;
}

export interface SessionCompactionPoint {
  turnIndex: number;
  summary: string;
  timestamp: number;
}

export interface SessionManifest {
  sessionKey: string;
  agentId: string;
  channelId: string;
  senderId: string;
  conversationId: string;
  createdAt: number;
  lastActiveAt: number;
  turnCount: number;
  compactionPoints: SessionCompactionPoint[];
}

// ── Plugin Types ──────────────────────────────────────────────────

export interface PluginManifest {
  name: string;
  version: string;
  type: "channel" | "provider" | "tool" | "voice" | "extension";
  description: string;
  author: string;
  main: string;
  capabilities: string[];
  dependencies?: Record<string, string>;
}

// ── Status Types ──────────────────────────────────────────────────

export interface ChannelStatus {
  id: string;
  type: string;
  connected: boolean;
  lastConnectedAt?: number;
  error?: string;
  messageCount: number;
  queueSize: number;
}

export interface ProviderStatus {
  provider: string;
  model: string;
  available: boolean;
  lastCheckAt?: number;
  error?: string;
  latencyMs?: number;
}

export interface GatewayStatus {
  uptime: number;
  channels: ChannelStatus[];
  providers: ProviderStatus[];
  activeSessions: number;
  deviceCount: number;
  pluginErrors: Array<{ plugin: string; error: string }>;
  memoryUsage: { heapUsed: number; heapTotal: number; rss: number };
}

// ── WebSocket Message Types ───────────────────────────────────────

export type WsClientMessage =
  | { type: "auth"; token: string }
  | { type: "chat:send"; envelope: MessageEnvelope }
  | { type: "chat:approve"; approvalId: string; approved: boolean }
  | { type: "canvas:event"; event: Record<string, unknown> }
  | { type: "voice:start" }
  | { type: "voice:stop" }
  | { type: "voice:audio"; data: string }
  | { type: "presence:update"; status: "online" | "away" | "offline" }
  | { type: "ping" };

export type WsServerMessage =
  | { type: "auth:ok"; deviceId: string }
  | { type: "auth:error"; error: string }
  | { type: "chat:token"; token: string; conversationId: string; messageId: string }
  | { type: "chat:done"; conversationId: string; messageId: string; fullText: string }
  | { type: "chat:error"; conversationId: string; error: string }
  | { type: "approval:required"; approvalId: string; tool: string; args: Record<string, unknown>; agentId: string }
  | { type: "canvas:update"; json: Record<string, unknown> }
  | { type: "voice:token"; token: string }
  | { type: "voice:error"; error: string }
  | { type: "presence:update"; deviceId: string; status: string }
  | { type: "status:update"; status: GatewayStatus }
  | { type: "pong" }
  | { type: "error"; message: string; code: string };

// ── Tool Types ────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodType;
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}

export interface ToolContext {
  agentId: string;
  sessionKey: string;
  workspacePath: string;
  sandbox?: z.infer<typeof SandboxConfigSchema>;
  signal?: AbortSignal;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  artifacts?: Array<{ type: string; url: string; name: string }>;
}

export interface ApprovalRequest {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  agentId: string;
  sessionKey: string;
  timestamp: number;
  status: "pending" | "approved" | "denied" | "timed-out";
}

// ── Provider Types ────────────────────────────────────────────────

export type LLMMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } }
      | { type: "image"; source?: { type: "base64"; media_type: string; data: string } }
    >;

export interface LLMCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: LLMMessageContent; tool_call_id?: string; name?: string }>;
  tools?: Array<{
    type: "function";
    function: { name: string; description: string; parameters: Record<string, unknown> };
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface LLMCompletionChunk {
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  finishReason?: "stop" | "tool_calls" | "length" | "error";
}

export interface LLMCompletionResponse {
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  finishReason: "stop" | "tool_calls" | "length" | "error";
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

// ── Channel Plugin Interface ──────────────────────────────────────

export interface ChannelPlugin {
  manifest: PluginManifest;
  setupChannel: (config: ChannelConfig) => Promise<void>;
  startChannel: (config: ChannelConfig, onMessage: (env: MessageEnvelope) => Promise<void>) => Promise<void>;
  stopChannel: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, reply: ReplyEnvelope) => Promise<void>;
  handleCommand?: (channelId: string, command: string, args: string[]) => Promise<void>;
  handleApproval?: (channelId: string, approval: ApprovalRequest) => Promise<void>;
  getStatus: (channelId: string) => Promise<ChannelStatus>;
}

// ── Provider Plugin Interface ─────────────────────────────────────

export interface ProviderPlugin {
  manifest: PluginManifest;
  initialize: (config: Record<string, unknown>) => Promise<void>;
  complete: (request: LLMCompletionRequest) => Promise<LLMCompletionResponse>;
  completeStream: (request: LLMCompletionRequest) => AsyncGenerator<LLMCompletionChunk>;
  listModels: () => Promise<Array<{ id: string; name: string }>>;
  healthCheck: () => Promise<boolean>;
}

// ── Voice Plugin Interface ────────────────────────────────────────

export interface VoicePlugin {
  manifest: PluginManifest;
  initialize: (config: Record<string, unknown>) => Promise<void>;
  startSession: () => Promise<{ sessionId: string }>;
  sendAudio: (sessionId: string, audio: Buffer) => Promise<void>;
  receiveAudio: (sessionId: string) => AsyncGenerator<Buffer>;
  stopSession: (sessionId: string) => Promise<void>;
}

// ── Storage Interface ─────────────────────────────────────────────

export interface StorageAdapter {
  initialize(): Promise<void>;
  getSessionTranscript(agentId: string, sessionKey: string): Promise<SessionTurn[]>;
  appendTurn(agentId: string, sessionKey: string, turn: SessionTurn): Promise<void>;
  getSessionManifest(agentId: string, sessionKey: string): Promise<SessionManifest | null>;
  upsertSessionManifest(manifest: SessionManifest): Promise<void>;
  listSessions(agentId: string): Promise<SessionManifest[]>;
  deleteSession(agentId: string, sessionKey: string): Promise<void>;
  storeEmbedding(id: string, vector: number[], metadata: Record<string, unknown>): Promise<void>;
  searchEmbeddings(vector: number[], limit?: number): Promise<Array<{ id: string; metadata: Record<string, unknown>; distance: number }>>;
  rewriteSession(agentId: string, sessionKey: string, turns: SessionTurn[]): Promise<void>;
  close(): Promise<void>;
}
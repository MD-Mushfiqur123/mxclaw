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
// ── Agent Config ──────────────────────────────────────────────────
export const ApprovalModeSchema = z.enum([
    "always-require-approval",
    "owner-only",
    "yolo",
]);
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
// ── Binding Config ────────────────────────────────────────────────
export const BindingConfigSchema = z.object({
    channelId: z.string(),
    senderId: z.string().optional(),
    agentId: z.string(),
    conversationId: z.string().optional(),
});
// ── Device Config ─────────────────────────────────────────────────
export const DeviceConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["mobile", "desktop", "web"]),
    token: z.string().optional(),
    paired: z.boolean().default(false),
    lastSeen: z.number().optional(),
});
// ── Voice Config ──────────────────────────────────────────────────
export const VoiceConfigSchema = z.object({
    defaultProvider: z.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
    openaiRealtime: z.object({ apiKey: z.string().optional(), model: z.string().default("gpt-4o-realtime-preview"), voice: z.string().default("alloy") }).default({}),
    geminiLive: z.object({ apiKey: z.string().optional(), model: z.string().default("gemini-2.0-flash-live-001"), voice: z.string().default("Puck") }).default({}),
    elevenlabs: z.object({ apiKey: z.string().optional(), voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM") }).default({}),
    systemTts: z.object({ rate: z.number().default(1.0), pitch: z.number().default(1.0) }).default({}),
});
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
// ── Storage Config ────────────────────────────────────────────────
export const StorageConfigSchema = z.object({
    type: z.enum(["jsonl", "sqlite"]).default("jsonl"),
    workspacePath: z.string().default("~/.mxclaw/workspace"),
    lanceDbPath: z.string().default("~/.mxclaw/lancedb"),
    sqlitePath: z.string().default("~/.mxclaw/mxclaw.db"),
});
// ── Gateway Config ────────────────────────────────────────────────
export const GatewayConfigSchema = z.object({
    host: z.string().default("127.0.0.1"),
    port: z.number().int().positive().default(18700),
    webhookPath: z.string().default("/gateway/webhook"),
    corsOrigins: z.array(z.string()).default(["http://localhost:5173"]),
    wsHeartbeatIntervalMs: z.number().positive().default(30000),
    apiToken: z.string().optional(),
});
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
//# sourceMappingURL=types.js.map
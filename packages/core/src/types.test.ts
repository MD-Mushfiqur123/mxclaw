import { describe, it, expect } from "vitest";
import {
  MessageEnvelopeSchema,
  ReplyEnvelopeSchema,
  MxClawConfigSchema,
  MessageContentSchema,
  ProviderRefSchema,
  ApprovalModeSchema,
  ChannelConfigSchema,
  AgentConfigSchema,
  GatewayConfigSchema,
  StorageConfigSchema,
  LoggingConfigSchema,
  VoiceConfigSchema,
  DeviceConfigSchema,
  BindingConfigSchema,
  SandboxConfigSchema,
} from "@mxclaw/core";

describe("MessageContentSchema", () => {
  it("validates text content", () => {
    const r = MessageContentSchema.safeParse({ type: "text", text: "hello" });
    expect(r.success).toBe(true);
  });

  it("validates image content with optional alt", () => {
    expect(MessageContentSchema.safeParse({ type: "image", url: "https://example.com/img.png" }).success).toBe(true);
    expect(MessageContentSchema.safeParse({ type: "image", url: "https://example.com/img.png", alt: "A photo" }).success).toBe(true);
  });

  it("validates audio content", () => {
    expect(MessageContentSchema.safeParse({ type: "audio", url: "https://example.com/audio.mp3" }).success).toBe(true);
    expect(MessageContentSchema.safeParse({ type: "audio", url: "https://example.com/audio.mp3", transcript: "hello" }).success).toBe(true);
  });

  it("validates video content", () => {
    expect(MessageContentSchema.safeParse({ type: "video", url: "https://example.com/vid.mp4" }).success).toBe(true);
  });

  it("validates file content", () => {
    expect(MessageContentSchema.safeParse({ type: "file", url: "https://example.com/doc.pdf", name: "doc.pdf" }).success).toBe(true);
  });

  it("validates file content with optional mimeType", () => {
    const r = MessageContentSchema.safeParse({ type: "file", url: "https://example.com/doc.pdf", name: "doc.pdf", mimeType: "application/pdf" });
    expect(r.success).toBe(true);
  });

  it("validates location content", () => {
    expect(MessageContentSchema.safeParse({ type: "location", lat: 40.7128, lng: -74.006 }).success).toBe(true);
  });

  it("validates location content with optional label", () => {
    expect(MessageContentSchema.safeParse({ type: "location", lat: 40.7128, lng: -74.006, label: "NYC" }).success).toBe(true);
  });

  it("validates sticker content", () => {
    expect(MessageContentSchema.safeParse({ type: "sticker", id: "sticker-1" }).success).toBe(true);
  });

  it("validates reaction content", () => {
    expect(MessageContentSchema.safeParse({ type: "reaction", emoji: "👍", messageId: "msg-1" }).success).toBe(true);
  });

  it("validates canvas content", () => {
    expect(MessageContentSchema.safeParse({ type: "canvas", json: { nodes: [] } }).success).toBe(true);
  });

  it("rejects unknown discriminator", () => {
    expect(MessageContentSchema.safeParse({ type: "unknown" }).success).toBe(false);
  });

  it("rejects text content without text field", () => {
    expect(MessageContentSchema.safeParse({ type: "text" }).success).toBe(false);
  });

  it("rejects image without url", () => {
    expect(MessageContentSchema.safeParse({ type: "image" }).success).toBe(false);
  });

  it("rejects empty object", () => {
    expect(MessageContentSchema.safeParse({}).success).toBe(false);
  });
});

describe("MessageEnvelopeSchema", () => {
  const validMsg = {
    id: "msg-1",
    channel: "discord-1",
    channelType: "discord",
    sender: { id: "user-1", displayName: "Test User" },
    conversationId: "conv-1",
    content: [{ type: "text", text: "Hello" }],
    mentions: [],
    isGroupMessage: false,
    isMentioned: false,
    timestamp: 1700000000000,
  };

  it("validates a complete message", () => {
    expect(MessageEnvelopeSchema.safeParse(validMsg).success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const minimal = {
      id: "msg-2",
      channel: "discord-1",
      channelType: "discord",
      sender: { id: "user-2", displayName: "User" },
      conversationId: "conv-2",
      content: [{ type: "text", text: "Hi" }],
      timestamp: 1700000000000,
    };
    const result = MessageEnvelopeSchema.parse(minimal);
    expect(result.mentions).toEqual([]);
    expect(result.isGroupMessage).toBe(false);
    expect(result.isMentioned).toBe(false);
    expect(result.metadata).toEqual({});
    expect(result.sender.isBot).toBe(false);
  });

  it("accepts optional threadId", () => {
    const r = MessageEnvelopeSchema.safeParse({ ...validMsg, threadId: "thread-1" });
    expect(r.success).toBe(true);
  });

  it("accepts optional metadata", () => {
    const r = MessageEnvelopeSchema.safeParse({ ...validMsg, metadata: { guildId: "guild-1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id, ...rest } = validMsg;
    expect(MessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing channel", () => {
    const { channel, ...rest } = validMsg;
    expect(MessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing channelType", () => {
    const { channelType, ...rest } = validMsg;
    expect(MessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing sender", () => {
    const { sender, ...rest } = validMsg;
    expect(MessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing conversationId", () => {
    const { conversationId, ...rest } = validMsg;
    expect(MessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing content", () => {
    const { content, ...rest } = validMsg;
    expect(MessageEnvelopeSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts empty content array (schema allows it)", () => {
    expect(MessageEnvelopeSchema.safeParse({ ...validMsg, content: [] }).success).toBe(true);
  });

  it("rejects invalid content item in array", () => {
    expect(MessageEnvelopeSchema.safeParse({ ...validMsg, content: [{ type: "unknown" }] }).success).toBe(false);
  });

  it("rejects null", () => {
    expect(MessageEnvelopeSchema.safeParse(null).success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(MessageEnvelopeSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("ReplyEnvelopeSchema", () => {
  it("validates a minimal reply", () => {
    const r = ReplyEnvelopeSchema.safeParse({
      conversationId: "conv-1",
      content: [{ type: "text", text: "Hello back" }],
    });
    expect(r.success).toBe(true);
  });

  it("applies defaults for optional fields", () => {
    const result = ReplyEnvelopeSchema.parse({
      conversationId: "conv-1",
      content: [{ type: "text", text: "Hi" }],
    });
    expect(result.isStreaming).toBe(false);
    expect(result.metadata).toEqual({});
  });

  it("accepts all optional fields", () => {
    const r = ReplyEnvelopeSchema.safeParse({
      channelMessageId: "ch-msg-1",
      conversationId: "conv-1",
      threadId: "thread-1",
      content: [{ type: "text", text: "Hey" }],
      isStreaming: true,
      streamToken: "token-abc",
      metadata: { key: "value" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing conversationId", () => {
    expect(ReplyEnvelopeSchema.safeParse({ content: [{ type: "text", text: "hi" }] }).success).toBe(false);
  });

  it("rejects missing content", () => {
    expect(ReplyEnvelopeSchema.safeParse({ conversationId: "conv-1" }).success).toBe(false);
  });

  it("accepts empty content array (schema allows it)", () => {
    expect(ReplyEnvelopeSchema.safeParse({ conversationId: "conv-1", content: [] }).success).toBe(true);
  });

  it("rejects invalid content", () => {
    expect(ReplyEnvelopeSchema.safeParse({ conversationId: "conv-1", content: [{ type: "bogus" }] }).success).toBe(false);
  });

  it("rejects null", () => {
    expect(ReplyEnvelopeSchema.safeParse(null).success).toBe(false);
  });
});

describe("ProviderRefSchema", () => {
  it("validates with minimal fields", () => {
    const r = ProviderRefSchema.safeParse({ provider: "openai", model: "gpt-4o" });
    expect(r.success).toBe(true);
  });

  it("applies defaults for temperature and maxTokens", () => {
    const result = ProviderRefSchema.parse({ provider: "openai", model: "gpt-4o" });
    expect(result.temperature).toBe(0.7);
    expect(result.maxTokens).toBe(4096);
    expect(result.options).toEqual({});
  });

  it("accepts all optional fields", () => {
    const r = ProviderRefSchema.safeParse({
      provider: "openai-compatible",
      model: "gpt-4o",
      apiKey: "sk-123",
      baseUrl: "https://custom.openai.com/v1",
      preset: "openai",
      headers: { "X-Custom": "value" },
      modelAliases: { gpt4: "gpt-4o" },
      temperature: 0.5,
      maxTokens: 2048,
      systemPrompt: "Be helpful",
      options: { foo: "bar" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects temperature below 0", () => {
    expect(ProviderRefSchema.safeParse({ provider: "openai", model: "gpt-4o", temperature: -0.1 }).success).toBe(false);
  });

  it("rejects temperature above 2", () => {
    expect(ProviderRefSchema.safeParse({ provider: "openai", model: "gpt-4o", temperature: 2.1 }).success).toBe(false);
  });

  it("rejects zero maxTokens", () => {
    expect(ProviderRefSchema.safeParse({ provider: "openai", model: "gpt-4o", maxTokens: 0 }).success).toBe(false);
  });

  it("rejects negative maxTokens", () => {
    expect(ProviderRefSchema.safeParse({ provider: "openai", model: "gpt-4o", maxTokens: -1 }).success).toBe(false);
  });

  it("rejects missing provider", () => {
    expect(ProviderRefSchema.safeParse({ model: "gpt-4o" }).success).toBe(false);
  });

  it("rejects missing model", () => {
    expect(ProviderRefSchema.safeParse({ provider: "openai" }).success).toBe(false);
  });
});

describe("ApprovalModeSchema", () => {
  it("accepts valid modes", () => {
    expect(ApprovalModeSchema.safeParse("always-require-approval").success).toBe(true);
    expect(ApprovalModeSchema.safeParse("owner-only").success).toBe(true);
    expect(ApprovalModeSchema.safeParse("yolo").success).toBe(true);
  });

  it("rejects invalid mode", () => {
    expect(ApprovalModeSchema.safeParse("invalid-mode").success).toBe(false);
    expect(ApprovalModeSchema.safeParse("never").success).toBe(false);
    expect(ApprovalModeSchema.safeParse("").success).toBe(false);
  });
});

describe("SandboxConfigSchema", () => {
  it("applies defaults", () => {
    const r = SandboxConfigSchema.parse({});
    expect(r.enabled).toBe(false);
    expect(r.type).toBe("docker");
  });

  it("accepts ssh type with optional fields", () => {
    const r = SandboxConfigSchema.safeParse({
      enabled: true,
      type: "ssh",
      image: "ubuntu:latest",
      host: "sandbox.local",
      port: 2222,
      username: "agent",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(SandboxConfigSchema.safeParse({ enabled: true, type: "vm" }).success).toBe(false);
  });
});

describe("AgentConfigSchema", () => {
  it("validates minimal agent", () => {
    const r = AgentConfigSchema.safeParse({
      id: "default",
      name: "Default",
      model: { provider: "openai", model: "gpt-4o" },
    });
    expect(r.success).toBe(true);
  });

  it("applies defaults", () => {
    const result = AgentConfigSchema.parse({
      id: "default",
      name: "Default",
      model: { provider: "openai", model: "gpt-4o" },
    });
    expect(result.mentionGating).toBe(true);
    expect(result.maxSessionTurns).toBe(100);
    expect(result.compactionThreshold).toBe(50);
    expect(result.tools.bash.enabled).toBe(true);
    expect(result.tools.browser.enabled).toBe(false);
    expect(result.tools.fileRead.allowedPaths).toEqual(["~/.mxclaw/workspace"]);
    expect(result.fallbackChain).toEqual([]);
  });

  it("accepts voice config", () => {
    const r = AgentConfigSchema.safeParse({
      id: "a1",
      name: "A1",
      model: { provider: "openai", model: "gpt-4o" },
      voice: { provider: "elevenlabs", voiceId: "rachel", wakeWord: "hey" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(AgentConfigSchema.safeParse({ name: "X", model: { provider: "openai", model: "gpt-4o" } }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(AgentConfigSchema.safeParse({ id: "x", model: { provider: "openai", model: "gpt-4o" } }).success).toBe(false);
  });

  it("rejects missing model", () => {
    expect(AgentConfigSchema.safeParse({ id: "x", name: "X" }).success).toBe(false);
  });

  it("rejects zero maxSessionTurns", () => {
    expect(AgentConfigSchema.safeParse({ id: "x", name: "X", model: { provider: "openai", model: "gpt-4o" }, maxSessionTurns: 0 }).success).toBe(false);
  });

  it("rejects invalid voice provider", () => {
    expect(AgentConfigSchema.safeParse({ id: "x", name: "X", model: { provider: "openai", model: "gpt-4o" }, voice: { provider: "unknown" } }).success).toBe(false);
  });
});

describe("ChannelConfigSchema", () => {
  it("validates minimal channel", () => {
    const r = ChannelConfigSchema.safeParse({ id: "discord-1", type: "discord" });
    expect(r.success).toBe(true);
  });

  it("applies defaults", () => {
    const result = ChannelConfigSchema.parse({ id: "ch-1", type: "discord" });
    expect(result.enabled).toBe(true);
    expect(result.credentials).toEqual({});
    expect(result.options).toEqual({});
    expect(result.allowlist).toEqual([]);
    expect(result.mentionGating).toBe(true);
    expect(result.pairingEnabled).toBe(true);
  });

  it("accepts all fields", () => {
    const r = ChannelConfigSchema.safeParse({
      id: "discord-1",
      type: "discord",
      enabled: true,
      credentials: { token: "abc" },
      options: { intents: ["GUILD_MESSAGES"] },
      allowlist: ["user-1"],
      mentionGating: true,
      pairingEnabled: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(ChannelConfigSchema.safeParse({ type: "discord" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(ChannelConfigSchema.safeParse({ id: "ch-1" }).success).toBe(false);
  });
});

describe("BindingConfigSchema", () => {
  it("validates minimal binding", () => {
    expect(BindingConfigSchema.safeParse({ channelId: "discord-1", agentId: "default" }).success).toBe(true);
  });

  it("accepts optional senderId and conversationId", () => {
    expect(BindingConfigSchema.safeParse({ channelId: "discord-1", senderId: "user-1", agentId: "default", conversationId: "conv-1" }).success).toBe(true);
  });

  it("rejects missing channelId", () => {
    expect(BindingConfigSchema.safeParse({ agentId: "default" }).success).toBe(false);
  });

  it("rejects missing agentId", () => {
    expect(BindingConfigSchema.safeParse({ channelId: "discord-1" }).success).toBe(false);
  });
});

describe("DeviceConfigSchema", () => {
  it("validates minimal device", () => {
    expect(DeviceConfigSchema.safeParse({ id: "dev-1", name: "My Phone", type: "mobile" }).success).toBe(true);
  });

  it("accepts paired device with lastSeen", () => {
    const r = DeviceConfigSchema.safeParse({ id: "dev-1", name: "My Phone", type: "mobile", token: "tok-1", paired: true, lastSeen: Date.now() });
    expect(r.success).toBe(true);
  });

  it("applies default paired false", () => {
    const r = DeviceConfigSchema.parse({ id: "dev-1", name: "My Phone", type: "mobile" });
    expect(r.paired).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(DeviceConfigSchema.safeParse({ id: "dev-1", name: "X", type: "tablet" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(DeviceConfigSchema.safeParse({ id: "dev-1", type: "mobile" }).success).toBe(false);
  });
});

describe("GatewayConfigSchema", () => {
  it("applies defaults", () => {
    const r = GatewayConfigSchema.parse({});
    expect(r.host).toBe("127.0.0.1");
    expect(r.port).toBe(18700);
    expect(r.webhookPath).toBe("/gateway/webhook");
    expect(r.corsOrigins).toEqual(["http://localhost:5173"]);
    expect(r.wsHeartbeatIntervalMs).toBe(30000);
  });

  it("accepts overrides", () => {
    const r = GatewayConfigSchema.parse({ host: "0.0.0.0", port: 8080 });
    expect(r.host).toBe("0.0.0.0");
    expect(r.port).toBe(8080);
  });

  it("rejects non-positive port", () => {
    expect(GatewayConfigSchema.safeParse({ port: 0 }).success).toBe(false);
    expect(GatewayConfigSchema.safeParse({ port: -1 }).success).toBe(false);
  });

  it("rejects non-integer port", () => {
    expect(GatewayConfigSchema.safeParse({ port: 8080.5 }).success).toBe(false);
  });
});

describe("StorageConfigSchema", () => {
  it("applies defaults", () => {
    const r = StorageConfigSchema.parse({});
    expect(r.workspacePath).toBe("~/.mxclaw/workspace");
    expect(r.lanceDbPath).toBe("~/.mxclaw/lancedb");
    expect(r.sqlitePath).toBe("~/.mxclaw/mxclaw.db");
  });
});

describe("LoggingConfigSchema", () => {
  it("applies defaults", () => {
    const r = LoggingConfigSchema.parse({});
    expect(r.level).toBe("info");
    expect(r.subsystems).toEqual({});
    expect(r.otel.enabled).toBe(false);
  });

  it("accepts all log levels", () => {
    for (const level of ["silent", "error", "warn", "info", "debug", "trace"] as const) {
      expect(LoggingConfigSchema.safeParse({ level }).success).toBe(true);
    }
  });

  it("rejects invalid log level", () => {
    expect(LoggingConfigSchema.safeParse({ level: "verbose" }).success).toBe(false);
  });
});

describe("VoiceConfigSchema", () => {
  it("applies defaults", () => {
    const r = VoiceConfigSchema.parse({});
    expect(r.defaultProvider).toBe("system-tts");
  });

  it("accepts all providers", () => {
    for (const provider of ["openai-realtime", "gemini-live", "elevenlabs", "system-tts"] as const) {
      expect(VoiceConfigSchema.safeParse({ defaultProvider: provider }).success).toBe(true);
    }
  });

  it("rejects invalid provider", () => {
    expect(VoiceConfigSchema.safeParse({ defaultProvider: "unknown" }).success).toBe(false);
  });
});

describe("MxClawConfigSchema", () => {
  it("validates minimal config with just version", () => {
    expect(MxClawConfigSchema.safeParse({ version: 1 }).success).toBe(true);
  });

  it("applies defaults for all sections", () => {
    const r = MxClawConfigSchema.parse({ version: 1 });
    expect(r.gateway.port).toBe(18700);
    expect(r.agents).toEqual({});
    expect(r.channels).toEqual({});
    expect(r.bindings).toEqual([]);
    expect(r.devices).toEqual([]);
    expect(r.plugins).toEqual([]);
    expect(r.logging.level).toBe("info");
    expect(r.storage.workspacePath).toBe("~/.mxclaw/workspace");
    expect(r.voice.defaultProvider).toBe("system-tts");
  });

  it("rejects version other than 1", () => {
    expect(MxClawConfigSchema.safeParse({ version: 2 }).success).toBe(false);
    expect(MxClawConfigSchema.safeParse({ version: 0 }).success).toBe(false);
    expect(MxClawConfigSchema.safeParse({ version: "1" }).success).toBe(false);
  });

  it("rejects empty config without version", () => {
    expect(MxClawConfigSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null", () => {
    expect(MxClawConfigSchema.safeParse(null).success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(MxClawConfigSchema.safeParse(undefined).success).toBe(false);
  });
});

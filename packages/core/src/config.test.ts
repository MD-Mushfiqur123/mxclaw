import { describe, it, expect } from "vitest";
import { MxClawConfigSchema, MessageEnvelopeSchema, ReplyEnvelopeSchema, ProviderRefSchema, AgentConfigSchema, ChannelConfigSchema } from "@mxclaw/core";

describe("Config Schema Validation", () => {
  it("should validate a minimal config", () => {
    const result = MxClawConfigSchema.safeParse({ version: 1 });
    expect(result.success).toBe(true);
  });

  it("should validate a full config with agents and channels", () => {
    const config = {
      version: 1,
      gateway: { host: "127.0.0.1", port: 18700 },
      agents: {
        default: {
          id: "default",
          name: "Default",
          model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
          tools: {
            bash: { enabled: true, approval: "always-require-approval" },
            browser: { enabled: false, approval: "always-require-approval" },
            canvas: { enabled: true, approval: "owner-only" },
            cron: { enabled: false, approval: "always-require-approval" },
            sessionSpawn: { enabled: true, approval: "owner-only" },
            imageGen: { enabled: false, approval: "always-require-approval" },
            fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
            fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] },
          },
          sandbox: { enabled: false, type: "docker" },
          voice: { provider: "system-tts" },
          mentionGating: true,
          maxSessionTurns: 100,
          compactionThreshold: 50,
        },
      },
      defaultAgentId: "default",
      channels: {
        "discord-1": {
          id: "discord-1",
          type: "discord",
          enabled: true,
          credentials: { token: "test" },
          options: {},
          allowlist: [],
          mentionGating: true,
          pairingEnabled: true,
        },
      },
      bindings: [{ channelId: "discord-1", agentId: "default" }],
    };
    const result = MxClawConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("should reject config with invalid version", () => {
    const result = MxClawConfigSchema.safeParse({ version: 2 });
    expect(result.success).toBe(false);
  });

  it("should reject agent with invalid approval mode", () => {
    const config = {
      version: 1,
      agents: {
        default: {
          id: "default",
          name: "Default",
          model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
          tools: {
            bash: { enabled: true, approval: "invalid-mode" },
            browser: { enabled: false, approval: "always-require-approval" },
            canvas: { enabled: true, approval: "owner-only" },
            cron: { enabled: false, approval: "always-require-approval" },
            sessionSpawn: { enabled: true, approval: "owner-only" },
            imageGen: { enabled: false, approval: "always-require-approval" },
            fileRead: { enabled: true, approval: "owner-only", allowedPaths: [] },
            fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: [] },
          },
          sandbox: { enabled: false, type: "docker" },
          voice: { provider: "system-tts" },
          mentionGating: true,
          maxSessionTurns: 100,
          compactionThreshold: 50,
        },
      },
    };
    const result = MxClawConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe("Message Envelope Validation", () => {
  it("should validate a valid text message", () => {
    const msg = {
      id: "msg-1",
      channel: "discord-1",
      channelType: "discord",
      sender: { id: "user-1", displayName: "Test User" },
      conversationId: "conv-1",
      content: [{ type: "text", text: "Hello" }],
      mentions: [],
      isGroupMessage: false,
      isMentioned: false,
      timestamp: Date.now(),
    };
    const result = MessageEnvelopeSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("should validate a message with image content", () => {
    const msg = {
      id: "msg-2",
      channel: "telegram-1",
      channelType: "telegram",
      sender: { id: "user-2", displayName: "User 2" },
      conversationId: "conv-2",
      content: [
        { type: "text", text: "Check this" },
        { type: "image", url: "https://example.com/img.png", alt: "An image" },
      ],
      mentions: [],
      isGroupMessage: true,
      isMentioned: true,
      timestamp: Date.now(),
    };
    const result = MessageEnvelopeSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it("should reject message without required fields", () => {
    const result = MessageEnvelopeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("ProviderRef Validation", () => {
  it("should validate with preset and custom baseUrl", () => {
    const ref = {
      provider: "openai-compatible",
      model: "gpt-4o",
      preset: "openai",
      baseUrl: "https://custom.openai.com/v1",
      headers: { "X-Custom": "value" },
      modelAliases: { "gpt4": "gpt-4o" },
      temperature: 0.7,
      maxTokens: 4096,
      options: {},
    };
    const result = ProviderRefSchema.safeParse(ref);
    expect(result.success).toBe(true);
  });
});

describe("Channel Config Validation", () => {
  it("should validate a channel with credentials", () => {
    const ch = {
      id: "discord-1",
      type: "discord",
      enabled: true,
      credentials: { token: "abc123" },
      options: { intents: ["GUILD_MESSAGES", "MESSAGE_CONTENT"] },
      allowlist: ["user-1", "user-2"],
      mentionGating: true,
      pairingEnabled: true,
    };
    const result = ChannelConfigSchema.safeParse(ch);
    expect(result.success).toBe(true);
  });
});
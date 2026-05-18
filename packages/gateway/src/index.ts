import type {
  MxClawConfig,
  MessageEnvelope,
  ReplyEnvelope,
  SessionTurn,
  LLMCompletionRequest,
  ProviderStatus,
  WsServerMessage,
  StorageAdapter,
} from "@mxclaw/core";
import { loadConfig, watchConfig, getWorkspacePath } from "@mxclaw/core";
import { createPluginRegistry, loadPlugins, getChannelPlugin } from "@mxclaw/plugin-system";
import { IPRateLimiter } from "./rate-limiter.js";
import { JsonlStorageAdapter, SqliteStorageAdapter, deriveSessionKey } from "@mxclaw/storage";
import {
  isSenderAllowed,
  shouldRespondToMessage,
  generatePairingCode,
} from "@mxclaw/security";
import { SecretsManager } from "@mxclaw/security/secrets";
import { getTool, getToolDefinitionsForLLM, ApprovalManager, registerMemoryAdapter } from "@mxclaw/tools";
import { createLogger, type Logger } from "@mxclaw/logging";
import { VoiceManager } from "@mxclaw/voice";
import { SkillLoader } from "@mxclaw/skills";
import { InMemoryMemoryAdapter } from "@mxclaw/memory";
import { ContextEngine } from "./context-engine.js";
import * as http from "node:http";
import * as path from "node:path";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

// ── Sub-modules (decomposed from the old monolith) ──────────────────
import { handleHttpRequest, type GatewayContext } from "./http-handler.js";
import { handleWebSocketConnection, broadcastWs, type WsClient } from "./ws-handler.js";
import { runCompletion, runCompletionStream } from "./agent-runner.js";
import { executeToolCalls } from "./tool-executor.js";
import { SessionManager } from "./session-manager.js";
import { tryParseJson, truncateOutput } from "./utils.js";
import {
  parseSlashCommand,
  buildHelpMessage,
  normalizeThinkLevel,
  normalizeVerboseLevel,
  normalizeUsageDisplay,
  setSessionDirective,
  clearSessionDirectives,
  getSessionDirectives,
} from "./slash-commands.js";

// Re-export sub-modules for consumers
export { SessionManager } from "./session-manager.js";
export type { GatewayContext } from "./http-handler.js";
export type { WsClient } from "./ws-handler.js";

/**
 * MxClaw Gateway — the central orchestrator.
 *
 * Architecture mirrors OpenClaw's modular `src/` layout:
 *   - http-handler.ts  → HTTP route dispatch
 *   - ws-handler.ts    → WebSocket auth + messaging
 *   - agent-runner.ts  → LLM completion with fallback chain
 *   - tool-executor.ts → Tool dispatch, approval, timeout
 *   - session-manager  → Session lifecycle, spawn, compaction
 *   - utils.ts         → Pure helpers (readBody, redact, retry)
 */
export class MxClawGateway {
  private config: MxClawConfig;
  private registry = createPluginRegistry();
  private storage!: StorageAdapter;
  private logger!: Logger;
  private approvalManager = new ApprovalManager();
  private voiceManager = new VoiceManager();
  private sessionManager!: SessionManager;
  private server!: http.Server;
  private wss!: WebSocketServer;
  private wsClients = new Map<string, WsClient>();
  private outboundQueues = new Map<string, ReplyEnvelope[]>();
  private startTime = Date.now();
  private configWatcherDispose?: () => void;
  private channelMessageCounts = new Map<string, number>();
  private providerStatuses = new Map<string, ProviderStatus>();
  private rateLimiter = new IPRateLimiter();
  private skillLoader?: SkillLoader;
  private contextEngine?: ContextEngine;
  private secretsManager?: SecretsManager;
  private memory?: InMemoryMemoryAdapter;

  constructor(configPath?: string) {
    this.config = loadConfig(configPath);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────

  async start(): Promise<void> {
    this.logger = createLogger(this.config.logging);
    this.logger.info("gateway", "Starting mxclaw Gateway...");

    // Initialize storage (JSONL default, SQLite optional)
    if (this.config.storage.type === "sqlite") {
      this.storage = new SqliteStorageAdapter(this.config);
    } else {
      this.storage = new JsonlStorageAdapter(this.config);
    }
    await this.storage.initialize();

    // Initialize memory/knowledge base
    try {
      this.memory = new InMemoryMemoryAdapter(
        path.join(getWorkspacePath(this.config), "memory.jsonl"),
      );
      await this.memory.load();
      registerMemoryAdapter(this.memory);
      this.logger.info("gateway", `Memory loaded (${(await this.memory.stats()).total} entries)`);
    } catch (err) {
      this.logger.warn("gateway", `Memory init skipped: ${err instanceof Error ? err.message : err}`);
    }

    // Initialize secrets vault — resolves $secret:KEY_NAME refs in config
    try {
      this.secretsManager = new SecretsManager(getWorkspacePath(this.config));
      await this.secretsManager.load();
      this.resolveConfigSecrets();
      this.logger.info("gateway", `Secrets vault loaded (${this.secretsManager.listKeys().length} keys)`);
    } catch (err) {
      this.logger.warn("gateway", `Secrets vault skipped: ${err instanceof Error ? err.message : err}`);
    }

    // Initialize session manager
    this.sessionManager = new SessionManager(this.storage, this.logger);

    // Load plugins
    await loadPlugins(this.config, this.registry);
    this.logger.info(
      "gateway",
      `Loaded ${this.registry.channels.size} channels, ${this.registry.providers.size} providers, ${this.registry.voices.size} voices`,
    );

    // Initialize voice plugins
    for (const [name, voice] of this.registry.voices) {
      this.voiceManager.register(voice);
      this.logger.debug("gateway", `Registered voice plugin: ${name}`);
    }

    // Initialize Context Engine
    this.contextEngine = new ContextEngine(this.logger, getWorkspacePath(this.config));

    // Initialize Skill Loader — load SKILL.md files from workspace
    try {
      this.skillLoader = new SkillLoader(getWorkspacePath(this.config), this.logger);
      await this.skillLoader.loadAll();
      const loaded = this.skillLoader.getAllSkills();
      this.logger.info("gateway", `Loaded ${loaded.length} skills: ${loaded.map(s => s.name).join(", ") || "(none)"}`);
    } catch (err) {
      this.logger.warn("gateway", `Skill loading skipped: ${err instanceof Error ? err.message : err}`);
    }

    // Start channels
    await this.startChannels();

    // Start HTTP + WebSocket server
    await this.startServer();

    // Start config hot-reload watcher
    this.configWatcherDispose = watchConfig((newConfig) => {
      this.logger.info("gateway", "Config hot-reloaded");
      this.config = newConfig;
      this.startChannels().catch((err) =>
        this.logger.error("gateway", "Failed to reload channels", err),
      );
    });

    // Graceful shutdown on SIGTERM/SIGINT
    const shutdownHandler = async () => {
      this.logger.info("gateway", "Received shutdown signal");
      await this.stop();
      process.exit(0);
    };
    process.on("SIGTERM", shutdownHandler);
    process.on("SIGINT", shutdownHandler);

    this.logger.info(
      "gateway",
      `Gateway listening on ${this.config.gateway.host}:${this.config.gateway.port}`,
    );
  }

  async stop(): Promise<void> {
    this.logger.info("gateway", "Shutting down...");
    this.configWatcherDispose?.();

    // Stop all channels
    for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
      const plugin = getChannelPlugin(this.registry, channelConfig.type);
      if (plugin) {
        await plugin.stopChannel(channelId).catch(() => {});
      }
    }

    // Close WebSocket connections
    for (const [, client] of this.wsClients) {
      client.ws.close(1001, "Server shutting down");
    }

    this.wss?.close();
    this.server?.close();
    await this.storage.close();
    this.logger.info("gateway", "Gateway stopped");
  }

  // ── Channels ──────────────────────────────────────────────────────

  private async startChannels(): Promise<void> {
    for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
      if (!channelConfig.enabled) continue;

      const plugin = getChannelPlugin(this.registry, channelConfig.type);
      if (!plugin) {
        this.logger.warn("gateway", `No plugin for channel type "${channelConfig.type}" (${channelId})`);
        this.registry.pluginErrors.push({
          plugin: channelConfig.type,
          error: `No plugin registered for channel type`,
        });
        continue;
      }

      try {
        await plugin.setupChannel(channelConfig);
        await plugin.startChannel(channelConfig, async (envelope) => {
          await this.handleInboundMessage(envelope);
        });
        this.channelMessageCounts.set(channelId, 0);
        this.logger.info("gateway", `Channel started: ${channelId} (${channelConfig.type})`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error("gateway", `Failed to start channel ${channelId}: ${errorMsg}`);
        this.registry.pluginErrors.push({ plugin: channelConfig.type, error: errorMsg });
      }
    }
  }

  // ── Server ────────────────────────────────────────────────────────

  private async startServer(): Promise<void> {
    const { host, port } = this.config.gateway;

    this.server = http.createServer((req, res) => {
      const ctx = this.buildContext();
      handleHttpRequest(ctx, req, res);
    });

    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on("connection", (ws, _req) => {
      handleWebSocketConnection(
        {
          logger: this.logger,
          approvalManager: this.approvalManager,
          voiceManager: this.voiceManager,
          wsClients: this.wsClients,
          wsHeartbeatIntervalMs: this.config.gateway.wsHeartbeatIntervalMs,
          voiceDefaultProvider: this.config.voice.defaultProvider,
          handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
          wsRateLimit: 20,
          apiToken: this.config.gateway.apiToken,
        },
        ws,
      );
    });

    return new Promise((resolve) => {
      this.server.listen(port, host, () => resolve());
    });
  }

  // ── Message Routing Engine ────────────────────────────────────────

  private async handleInboundMessage(envelope: MessageEnvelope): Promise<void> {
    this.logger.debug("router", `Message from ${envelope.sender.id} on ${envelope.channel}`);

    // Update channel message count
    const count = this.channelMessageCounts.get(envelope.channel) ?? 0;
    this.channelMessageCounts.set(envelope.channel, count + 1);

    // Find channel config
    const channelConfig = this.config.channels[envelope.channel];
    if (!channelConfig) {
      this.logger.warn("router", `Unknown channel: ${envelope.channel}`);
      return;
    }

    // Check allowlist / pairing
    if (!isSenderAllowed(envelope, channelConfig)) {
      if (channelConfig.pairingEnabled) {
        const pairing = generatePairingCode(envelope.channel, envelope.sender.id);
        this.logger.info("security", `Pairing code generated for ${envelope.sender.id}: ${pairing.code}`);
        const plugin = getChannelPlugin(this.registry, channelConfig.type);
        if (plugin) {
          await plugin.sendMessage(envelope.channel, {
            conversationId: envelope.conversationId,
            metadata: {},
            isStreaming: false,
            content: [{
              type: "text",
              text: `🔐 New sender detected. Pairing code: **${pairing.code}**\nUse this code in the control UI to approve this sender. Expires in 5 minutes.`,
            }],
          });
        }
      }
      return;
    }

    // Resolve agent binding
    const agentId = this.resolveAgentBinding(envelope);
    const agentConfig = this.config.agents[agentId];
    if (!agentConfig) {
      this.logger.warn("router", `No agent config for "${agentId}"`);
      return;
    }

    // Check mention gating
    if (!shouldRespondToMessage(envelope, agentConfig, channelConfig)) {
      this.logger.debug("router", `Mention gating: skipping message from ${envelope.sender.id}`);
      return;
    }

    // Derive session key
    const sessionKey = deriveSessionKey(envelope.channel, envelope.sender.id, agentId);

    // ── Slash command interception ──────────────────────────────────
    const userText = envelope.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join(" ")
      .trim();

    const slashCmd = parseSlashCommand(userText);
    if (slashCmd) {
      const reply = await this.handleSlashCommand(slashCmd, envelope, agentConfig, agentId, sessionKey);
      if (reply !== null) {
        const plugin = getChannelPlugin(this.registry, channelConfig.type);
        if (plugin && reply) {
          await plugin.sendMessage(envelope.channel, {
            conversationId: envelope.conversationId,
            metadata: {},
            isStreaming: false,
            content: [{ type: "text", text: reply }],
          });
        }
        return; // Don't route to LLM
      }
    }

    // Process the message through the agent
    await this.processMessage(envelope, agentConfig, channelConfig, sessionKey);
  }

  // ── Slash Command Handlers ────────────────────────────────────────

  private async handleSlashCommand(
    cmd: ReturnType<typeof parseSlashCommand> & object,
    envelope: MessageEnvelope,
    agentConfig: MxClawConfig["agents"][string],
    agentId: string,
    sessionKey: string,
  ): Promise<string | null> {
    switch (cmd.command) {
      case "help":
        return buildHelpMessage();

      case "whoami":
        return `Your sender ID: \`${envelope.sender.id}\`\nChannel: \`${envelope.channel}\``;

      case "status": {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;
        const directives = getSessionDirectives(sessionKey);
        const lines = [
          `**MxClaw Gateway Status**`,
          `Uptime: ${h}h ${m}m ${s}s`,
          `Active sessions: ${this.sessionManager.activeCount}`,
          `Agent: ${agentId} (${agentConfig.model.provider}/${agentConfig.model.model})`,
          `Think level: ${directives.thinkLevel ?? "default"}`,
          `Verbose: ${directives.verboseLevel ?? "off"}`,
        ];
        return lines.join("\n");
      }

      case "new":
      case "reset": {
        await this.sessionManager.resetSession(agentId, sessionKey);
        clearSessionDirectives(sessionKey);
        return "🆕 Session reset. Starting fresh.";
      }

      case "compact": {
        const instructions = cmd.args.join(" ");
        const session = await this.sessionManager.getOrCreate(
          envelope.channel, envelope.sender.id, agentId, envelope.conversationId,
        );
        if (session.turns.length < 4) {
          return "Session is too short to compact.";
        }
        await this.sessionManager.maybeCompact(
          agentId, sessionKey, Math.max(4, Math.floor(session.turns.length / 2)),
          async (turns) => {
            const note = instructions ? `Focus on: ${instructions}. ` : "";
            return `${note}Summary of ${turns.length} turns: ${turns.slice(-2).map(t => t.content.slice(0, 50)).join(" | ")}`;
          },
        );
        return "📦 Session compacted.";
      }

      case "think": {
        const raw = cmd.args[0];
        const level = normalizeThinkLevel(raw);
        if (!level) {
          return `Unknown think level: \`${raw}\`. Use: off, low, medium, high, max`;
        }
        setSessionDirective(sessionKey, "thinkLevel", level);
        return `🧠 Think level set to: **${level}**`;
      }

      case "verbose": {
        const raw = cmd.args[0];
        const level = normalizeVerboseLevel(raw);
        if (!level) {
          return `Unknown verbose level: \`${raw}\`. Use: on, off, full`;
        }
        setSessionDirective(sessionKey, "verboseLevel", level);
        return `Verbose mode: **${level}**`;
      }

      case "usage": {
        const raw = cmd.args[0];
        const level = normalizeUsageDisplay(raw);
        if (!level) {
          return `Unknown usage level: \`${raw}\`. Use: off, tokens, full`;
        }
        setSessionDirective(sessionKey, "usageDisplay", level);
        return `Usage display: **${level}**`;
      }

      case "stop":
        return "No active run to stop.";

      case "tools": {
        const toolNames = Object.entries(agentConfig.tools ?? {})
          .filter(([, t]) => t.enabled)
          .map(([name]) => name);
        if (toolNames.length === 0) return "No tools enabled for this agent.";
        return `**Available tools:** ${toolNames.join(", ")}`;
      }

      case "restart":
        return "Use `mxclaw gateway` to restart the server.";

      default:
        return null; // Unknown command — let LLM handle it
    }
  }

  private resolveAgentBinding(envelope: MessageEnvelope): string {
    const bindings = this.config.bindings ?? [];

    const exactMatch = bindings.find(
      (b) => b.channelId === envelope.channel && b.senderId === envelope.sender.id,
    );
    if (exactMatch) return exactMatch.agentId;

    const channelMatch = bindings.find(
      (b) => b.channelId === envelope.channel && !b.senderId,
    );
    if (channelMatch) return channelMatch.agentId;

    return this.config.defaultAgentId ?? "default";
  }

  // ── Message Processing Pipeline ───────────────────────────────────

  private async processMessage(
    envelope: MessageEnvelope,
    agentConfig: MxClawConfig["agents"][string],
    channelConfig: MxClawConfig["channels"][string],
    sessionKey: string,
  ): Promise<void> {
    const agentId = agentConfig.id;
    const channelPlugin = getChannelPlugin(this.registry, channelConfig.type);

    // Use session manager for lifecycle
    const session = await this.sessionManager.getOrCreate(
      envelope.channel,
      envelope.sender.id,
      agentId,
      envelope.conversationId,
    );

    let turns = session.turns;

    // Compaction check
    if (turns.length >= agentConfig.compactionThreshold) {
      turns = await this.sessionManager.maybeCompact(
        agentId,
        sessionKey,
        agentConfig.compactionThreshold,
        async (olderTurns) => {
          const summaryRequest: LLMCompletionRequest = {
            model: agentConfig.model.model,
            messages: [
              { role: "system", content: "Summarize the following conversation concisely, preserving key facts, decisions, and context." },
              { role: "user", content: JSON.stringify(olderTurns.map((t) => ({ role: t.role, content: t.content }))) },
            ],
            maxTokens: 500,
          };
          try {
            const deps = { registry: this.registry, logger: this.logger, providerStatuses: this.providerStatuses };
            const response = await runCompletion(deps, summaryRequest, agentConfig);
            return response.content;
          } catch {
            return "Previous conversation summary unavailable.";
          }
        },
      );
    }

    // Append user message
    const userText = envelope.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    const userTurn: SessionTurn = { role: "user", content: userText, timestamp: Date.now() };
    await this.sessionManager.appendTurn(agentId, sessionKey, userTurn);
    turns.push(userTurn);

    // Build system prompt with skills injection
    let systemPrompt =
      agentConfig.systemPrompt ??
      agentConfig.model.systemPrompt ??
      "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";

    // Use ContextEngine if available for token-budgeted prompt assembly
    let messages: Array<{ role: string; content: string }>;
    if (this.contextEngine) {
      messages = await this.contextEngine.buildContext({
        agentConfig,
        turns,
        skillLoader: this.skillLoader,
        maxTokens: (agentConfig.model as { maxContextTokens?: number }).maxContextTokens ?? 128000,
      });
    } else {
      // Fallback: inject skills manually
      if (this.skillLoader) {
        const skillsPrompt = this.skillLoader.buildSkillsPrompt();
        if (skillsPrompt) {
          systemPrompt += skillsPrompt;
        }
      }
      messages = [
        { role: "system", content: systemPrompt },
        ...turns.map((t) => ({ role: t.role, content: t.content })),
      ];
    }

    // Get enabled tools
    const enabledTools = new Set(
      Object.entries(agentConfig.tools ?? {})
        .filter(([, cfg]) => cfg.enabled)
        .map(([name]) => name),
    );
    const toolDefs = getToolDefinitionsForLLM(enabledTools);

    const completionRequest: LLMCompletionRequest = {
      model: agentConfig.model.model,
      messages,
      tools: toolDefs.length > 0 ? toolDefs : undefined,
      temperature: agentConfig.model.temperature,
      maxTokens: agentConfig.model.maxTokens,
      stream: true,
    };

    // Run completion with fallback chain
    let fullResponse = "";
    let toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];

    const runnerDeps = {
      registry: this.registry,
      logger: this.logger,
      providerStatuses: this.providerStatuses,
    };

    try {
      const stream = runCompletionStream(runnerDeps, completionRequest, agentConfig);

      for await (const chunk of stream) {
        fullResponse += chunk.content;

        if (chunk.toolCalls) {
          for (const tc of chunk.toolCalls) {
            const existing = toolCalls.find((t) => t.id === tc.id);
            if (existing) {
              existing.arguments = tryParseJson(tc.arguments) ?? existing.arguments;
            } else {
              toolCalls.push({
                id: tc.id,
                name: tc.name,
                arguments: tryParseJson(tc.arguments) ?? {},
              });
            }
          }
        }

        // Stream tokens to channel
        if (channelPlugin && chunk.content) {
          await channelPlugin.sendMessage(envelope.channel, {
            conversationId: envelope.conversationId,
            threadId: envelope.threadId,
            metadata: {},
            isStreaming: true,
            content: [{ type: "text", text: chunk.content }],
            streamToken: uuidv4(),
          });
        }

        // Stream to WebSocket clients
        broadcastWs(this.wsClients, {
          type: "chat:token",
          token: chunk.content,
          conversationId: envelope.conversationId,
          messageId: envelope.id,
        });
      }

      // Handle tool calls — multi-round loop (max 5 rounds)
      let roundMessages = [...messages];
      let currentResponse = fullResponse;
      let currentToolCalls = toolCalls;
      let round = 0;
      const MAX_TOOL_ROUNDS = 5;

      while (currentToolCalls.length > 0 && round < MAX_TOOL_ROUNDS) {
        round++;
        this.logger.debug("router", `Tool round ${round}: executing ${currentToolCalls.length} tool(s)`);

        const toolResults = await executeToolCalls(
          {
            config: this.config,
            logger: this.logger,
            approvalManager: this.approvalManager,
            broadcastWs: (msg) => broadcastWs(this.wsClients, msg),
          },
          currentToolCalls,
          agentConfig,
          sessionKey,
          envelope.sender.id,
        );

        const toolResultContent = toolResults
          .map((tr) => `[${tr.name}]: ${tr.result}${tr.error ? `\nError: ${tr.error}` : ""}`)
          .join("\n");

        const toolTurn: SessionTurn = {
          role: "tool",
          content: toolResultContent,
          toolCalls: currentToolCalls.map((tc) => ({
            id: tc.id,
            name: tc.name,
            arguments: tc.arguments,
          })),
          toolResults: toolResults.map((tr) => ({
            id: tr.id,
            name: tr.name,
            result: tr.result,
            error: tr.error,
          })),
          timestamp: Date.now(),
        };
        await this.sessionManager.appendTurn(agentId, sessionKey, toolTurn);

        roundMessages = [
          ...roundMessages,
          { role: "assistant", content: currentResponse },
          { role: "tool", content: toolResultContent },
        ];

        const followUpRequest: LLMCompletionRequest = {
          ...completionRequest,
          messages: roundMessages,
        };

        let followUpResponse = "";
        currentToolCalls = [];
        const followUpStream = runCompletionStream(runnerDeps, followUpRequest, agentConfig);

        for await (const chunk of followUpStream) {
          followUpResponse += chunk.content;

          if (chunk.toolCalls) {
            for (const tc of chunk.toolCalls) {
              const existing = currentToolCalls.find((t) => t.id === tc.id);
              if (existing) {
                existing.arguments = tryParseJson(tc.arguments) ?? existing.arguments;
              } else {
                currentToolCalls.push({
                  id: tc.id,
                  name: tc.name,
                  arguments: tryParseJson(tc.arguments) ?? {},
                });
              }
            }
          }

          if (channelPlugin && chunk.content) {
            await channelPlugin.sendMessage(envelope.channel, {
              conversationId: envelope.conversationId,
              threadId: envelope.threadId,
              metadata: {},
              isStreaming: true,
              content: [{ type: "text", text: chunk.content }],
            });
          }

          broadcastWs(this.wsClients, {
            type: "chat:token",
            token: chunk.content,
            conversationId: envelope.conversationId,
            messageId: envelope.id,
          });
        }

        currentResponse = followUpResponse;
        fullResponse = followUpResponse;
      }

      if (round >= MAX_TOOL_ROUNDS && currentToolCalls.length > 0) {
        this.logger.warn("router", `Tool loop hit max rounds (${MAX_TOOL_ROUNDS}) — stopping`);
      }

      // Save assistant turn
      const assistantTurn: SessionTurn = {
        role: "assistant",
        content: fullResponse,
        timestamp: Date.now(),
      };
      await this.sessionManager.appendTurn(agentId, sessionKey, assistantTurn);

      // Send final "stream end" marker to channel (NO duplicate of full text)
      // The full text was already streamed token-by-token above.
      if (channelPlugin) {
        await channelPlugin.sendMessage(envelope.channel, {
          conversationId: envelope.conversationId,
          threadId: envelope.threadId,
          metadata: {},
          isStreaming: false,
          content: [{ type: "text", text: "" }], // Empty = stream-end signal
          streamDone: true,
        });
      }

      // Notify WebSocket clients of completion
      broadcastWs(this.wsClients, {
        type: "chat:done",
        conversationId: envelope.conversationId,
        messageId: envelope.id,
        fullText: fullResponse,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error("router", `Completion error for session ${sessionKey}: ${errorMsg}`);

      if (channelPlugin) {
        await channelPlugin.sendMessage(envelope.channel, {
          conversationId: envelope.conversationId,
          metadata: {},
          isStreaming: false,
          content: [{ type: "text", text: `❌ Error: ${errorMsg}` }],
        });
      }

      broadcastWs(this.wsClients, {
        type: "chat:error",
        conversationId: envelope.conversationId,
        error: errorMsg,
      });
    }
  }

  // ── Secrets Resolution ────────────────────────────────────────────

  private resolveConfigSecrets(): void {
    if (!this.secretsManager) return;
    const resolve = (val: unknown): unknown => {
      if (typeof val === "string") return this.secretsManager!.resolve(val);
      if (Array.isArray(val)) return val.map(resolve);
      if (val && typeof val === "object") {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(val)) out[k] = resolve(v);
        return out;
      }
      return val;
    };
    this.config = resolve(this.config) as MxClawConfig;
  }

  // ── Context Builder ───────────────────────────────────────────────

  private buildContext(): GatewayContext {
    return {
      config: this.config,
      registry: this.registry,
      storage: this.storage,
      memory: this.memory,
      logger: this.logger,
      approvalManager: this.approvalManager,
      rateLimiter: this.rateLimiter,
      channelMessageCounts: this.channelMessageCounts,
      providerStatuses: this.providerStatuses,
      outboundQueues: this.outboundQueues,
      startTime: this.startTime,
      skillLoader: this.skillLoader,
      handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
      broadcastWs: (msg, exclude) => broadcastWs(this.wsClients, msg as WsServerMessage, exclude),
      // Real-time metrics (fixes hardcoded 0 in /status endpoint)
      activeSessionCount: this.sessionManager?.activeCount ?? 0,
      deviceCount: this.config.devices?.length ?? 0,
    };
  }

  /** Expose session manager for tool integration. */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}
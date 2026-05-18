import { loadConfig, watchConfig, getWorkspacePath } from "@mxclaw/core";
import { createPluginRegistry, loadPlugins, getChannelPlugin } from "@mxclaw/plugin-system";
import { IPRateLimiter } from "./rate-limiter.js";
import { JsonlStorageAdapter, SqliteStorageAdapter, deriveSessionKey } from "@mxclaw/storage";
import { isSenderAllowed, shouldRespondToMessage, generatePairingCode, } from "@mxclaw/security";
import { SecretsManager } from "@mxclaw/security/secrets";
import { getTool, getToolDefinitionsForLLM, ApprovalManager, registerMemoryAdapter } from "@mxclaw/tools";
import { createLogger } from "@mxclaw/logging";
import { VoiceManager } from "@mxclaw/voice";
import { SkillLoader } from "@mxclaw/skills";
import { InMemoryMemoryAdapter } from "@mxclaw/memory";
import { ContextEngine } from "./context-engine.js";
import * as http from "node:http";
import * as path from "node:path";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
// ── Sub-modules (decomposed from the old monolith) ──────────────────
import { handleHttpRequest } from "./http-handler.js";
import { handleWebSocketConnection, broadcastWs } from "./ws-handler.js";
import { runCompletion, runCompletionStream } from "./agent-runner.js";
import { executeToolCalls } from "./tool-executor.js";
import { SessionManager } from "./session-manager.js";
import { tryParseJson, truncateOutput } from "./utils.js";
// Re-export sub-modules for consumers
export { SessionManager } from "./session-manager.js";
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
    config;
    registry = createPluginRegistry();
    storage;
    logger;
    approvalManager = new ApprovalManager();
    voiceManager = new VoiceManager();
    sessionManager;
    server;
    wss;
    wsClients = new Map();
    outboundQueues = new Map();
    startTime = Date.now();
    configWatcherDispose;
    channelMessageCounts = new Map();
    providerStatuses = new Map();
    rateLimiter = new IPRateLimiter();
    skillLoader;
    contextEngine;
    secretsManager;
    memory;
    constructor(configPath) {
        this.config = loadConfig(configPath);
    }
    // ── Lifecycle ─────────────────────────────────────────────────────
    async start() {
        this.logger = createLogger(this.config.logging);
        this.logger.info("gateway", "Starting mxclaw Gateway...");
        // Initialize storage (JSONL default, SQLite optional)
        if (this.config.storage.type === "sqlite") {
            this.storage = new SqliteStorageAdapter(this.config);
        }
        else {
            this.storage = new JsonlStorageAdapter(this.config);
        }
        await this.storage.initialize();
        // Initialize memory/knowledge base
        try {
            this.memory = new InMemoryMemoryAdapter(path.join(getWorkspacePath(this.config), "memory.jsonl"));
            await this.memory.load();
            registerMemoryAdapter(this.memory);
            this.logger.info("gateway", `Memory loaded (${(await this.memory.stats()).total} entries)`);
        }
        catch (err) {
            this.logger.warn("gateway", `Memory init skipped: ${err instanceof Error ? err.message : err}`);
        }
        // Initialize secrets vault — resolves $secret:KEY_NAME refs in config
        try {
            this.secretsManager = new SecretsManager(getWorkspacePath(this.config));
            await this.secretsManager.load();
            this.resolveConfigSecrets();
            this.logger.info("gateway", `Secrets vault loaded (${this.secretsManager.listKeys().length} keys)`);
        }
        catch (err) {
            this.logger.warn("gateway", `Secrets vault skipped: ${err instanceof Error ? err.message : err}`);
        }
        // Initialize session manager
        this.sessionManager = new SessionManager(this.storage, this.logger);
        // Load plugins
        await loadPlugins(this.config, this.registry);
        this.logger.info("gateway", `Loaded ${this.registry.channels.size} channels, ${this.registry.providers.size} providers, ${this.registry.voices.size} voices`);
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
        }
        catch (err) {
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
            this.startChannels().catch((err) => this.logger.error("gateway", "Failed to reload channels", err));
        });
        // Graceful shutdown on SIGTERM/SIGINT
        const shutdownHandler = async () => {
            this.logger.info("gateway", "Received shutdown signal");
            await this.stop();
            process.exit(0);
        };
        process.on("SIGTERM", shutdownHandler);
        process.on("SIGINT", shutdownHandler);
        this.logger.info("gateway", `Gateway listening on ${this.config.gateway.host}:${this.config.gateway.port}`);
    }
    async stop() {
        this.logger.info("gateway", "Shutting down...");
        this.configWatcherDispose?.();
        // Stop all channels
        for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
            const plugin = getChannelPlugin(this.registry, channelConfig.type);
            if (plugin) {
                await plugin.stopChannel(channelId).catch(() => { });
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
    async startChannels() {
        for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
            if (!channelConfig.enabled)
                continue;
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
            }
            catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                this.logger.error("gateway", `Failed to start channel ${channelId}: ${errorMsg}`);
                this.registry.pluginErrors.push({ plugin: channelConfig.type, error: errorMsg });
            }
        }
    }
    // ── Server ────────────────────────────────────────────────────────
    async startServer() {
        const { host, port } = this.config.gateway;
        this.server = http.createServer((req, res) => {
            const ctx = this.buildContext();
            handleHttpRequest(ctx, req, res);
        });
        this.wss = new WebSocketServer({ server: this.server });
        this.wss.on("connection", (ws, _req) => {
            handleWebSocketConnection({
                logger: this.logger,
                approvalManager: this.approvalManager,
                voiceManager: this.voiceManager,
                wsClients: this.wsClients,
                wsHeartbeatIntervalMs: this.config.gateway.wsHeartbeatIntervalMs,
                voiceDefaultProvider: this.config.voice.defaultProvider,
                handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
                wsRateLimit: 20,
            }, ws);
        });
        return new Promise((resolve) => {
            this.server.listen(port, host, () => resolve());
        });
    }
    // ── Message Routing Engine ────────────────────────────────────────
    async handleInboundMessage(envelope) {
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
        // Process the message through the agent
        await this.processMessage(envelope, agentConfig, channelConfig, sessionKey);
    }
    resolveAgentBinding(envelope) {
        const bindings = this.config.bindings ?? [];
        const exactMatch = bindings.find((b) => b.channelId === envelope.channel && b.senderId === envelope.sender.id);
        if (exactMatch)
            return exactMatch.agentId;
        const channelMatch = bindings.find((b) => b.channelId === envelope.channel && !b.senderId);
        if (channelMatch)
            return channelMatch.agentId;
        return this.config.defaultAgentId ?? "default";
    }
    // ── Message Processing Pipeline ───────────────────────────────────
    async processMessage(envelope, agentConfig, channelConfig, sessionKey) {
        const agentId = agentConfig.id;
        const channelPlugin = getChannelPlugin(this.registry, channelConfig.type);
        // Use session manager for lifecycle
        const session = await this.sessionManager.getOrCreate(envelope.channel, envelope.sender.id, agentId, envelope.conversationId);
        let turns = session.turns;
        // Compaction check
        if (turns.length >= agentConfig.compactionThreshold) {
            turns = await this.sessionManager.maybeCompact(agentId, sessionKey, agentConfig.compactionThreshold, async (olderTurns) => {
                const summaryRequest = {
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
                }
                catch {
                    return "Previous conversation summary unavailable.";
                }
            });
        }
        // Append user message
        const userText = envelope.content
            .filter((c) => c.type === "text")
            .map((c) => c.text)
            .join("\n");
        const userTurn = { role: "user", content: userText, timestamp: Date.now() };
        await this.sessionManager.appendTurn(agentId, sessionKey, userTurn);
        turns.push(userTurn);
        // Build system prompt with skills injection
        let systemPrompt = agentConfig.systemPrompt ??
            agentConfig.model.systemPrompt ??
            "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";
        // Use ContextEngine if available for token-budgeted prompt assembly
        let messages;
        if (this.contextEngine) {
            messages = await this.contextEngine.buildContext({
                agentConfig,
                turns,
                skillLoader: this.skillLoader,
                maxTokens: agentConfig.model.maxContextTokens ?? 128000,
            });
        }
        else {
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
        const enabledTools = new Set(Object.entries(agentConfig.tools ?? {})
            .filter(([, cfg]) => cfg.enabled)
            .map(([name]) => name));
        const toolDefs = getToolDefinitionsForLLM(enabledTools);
        const completionRequest = {
            model: agentConfig.model.model,
            messages,
            tools: toolDefs.length > 0 ? toolDefs : undefined,
            temperature: agentConfig.model.temperature,
            maxTokens: agentConfig.model.maxTokens,
            stream: true,
        };
        // Run completion with fallback chain
        let fullResponse = "";
        let toolCalls = [];
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
                        }
                        else {
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
                const toolResults = await executeToolCalls({
                    config: this.config,
                    logger: this.logger,
                    approvalManager: this.approvalManager,
                    broadcastWs: (msg) => broadcastWs(this.wsClients, msg),
                }, currentToolCalls, agentConfig, sessionKey, envelope.sender.id);
                const toolResultContent = toolResults
                    .map((tr) => `[${tr.name}]: ${tr.result}${tr.error ? `\nError: ${tr.error}` : ""}`)
                    .join("\n");
                const toolTurn = {
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
                const followUpRequest = {
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
                            }
                            else {
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
            const assistantTurn = {
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
        }
        catch (err) {
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
    resolveConfigSecrets() {
        if (!this.secretsManager)
            return;
        const resolve = (val) => {
            if (typeof val === "string")
                return this.secretsManager.resolve(val);
            if (Array.isArray(val))
                return val.map(resolve);
            if (val && typeof val === "object") {
                const out = {};
                for (const [k, v] of Object.entries(val))
                    out[k] = resolve(v);
                return out;
            }
            return val;
        };
        this.config = resolve(this.config);
    }
    // ── Context Builder ───────────────────────────────────────────────
    buildContext() {
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
            broadcastWs: (msg, exclude) => broadcastWs(this.wsClients, msg, exclude),
        };
    }
    /** Expose session manager for tool integration. */
    getSessionManager() {
        return this.sessionManager;
    }
}
//# sourceMappingURL=index.js.map
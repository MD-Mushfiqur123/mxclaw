#!/usr/bin/env node
import { Command } from "commander";
import { loadConfig, saveConfig, generateDefaultConfig, getConfigPath, getConfigDir, loadBootstrap, saveBootstrap, getBootstrapEnvPath, getBootstrapJsonPath, PROVIDER_ENV_KEYS, } from "@mxclaw/core";
import { MxClawGateway } from "@mxclaw/gateway";
import { createPluginRegistry, loadPlugins } from "@mxclaw/plugin-system";
import { JsonlStorageAdapter } from "@mxclaw/storage";
import { createLogger } from "@mxclaw/logging";
import { runOnboard, testProvider, installDaemon, uninstallDaemon, daemonStatus } from "./onboard.js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
const program = new Command();
program
    .name("mxclaw")
    .description("mxclaw - Local-first personal AI agent gateway")
    .version("0.1.2");
// ── gateway ───────────────────────────────────────────────────────
program
    .command("gateway")
    .description("Start the mxclaw gateway server")
    .option("-c, --config <path>", "Path to config file", getConfigPath())
    .option("-p, --port <number>", "Override gateway port")
    .action(async (options) => {
    const config = loadConfig(options.config);
    if (options.port)
        config.gateway.port = parseInt(options.port, 10);
    const gateway = new MxClawGateway(options.config);
    const shutdown = async () => {
        console.log("\nShutting down...");
        await gateway.stop();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    await gateway.start();
    console.log(`mxclaw Gateway running on ${config.gateway.host}:${config.gateway.port}`);
    console.log(`Control UI: http://localhost:5173`);
    console.log(`Press Ctrl+C to stop`);
});
// ── setup ─────────────────────────────────────────────────────────
program
    .command("setup")
    .description("Interactive setup wizard for mxclaw")
    .action(async () => {
    console.log("🔧 mxclaw Setup Wizard\n");
    const configDir = getConfigDir();
    const configPath = getConfigPath();
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
        console.log(`Created config directory: ${configDir}`);
    }
    if (fs.existsSync(configPath)) {
        console.log(`Config already exists at ${configPath}`);
        console.log("Run 'mxclaw doctor' to validate your config.");
        return;
    }
    const defaultConfig = generateDefaultConfig();
    saveConfig(defaultConfig);
    console.log(`✅ Created default config at ${configPath}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Edit ${configPath} to add your API keys and channels`);
    console.log(`  2. Run 'mxclaw gateway' to start the server`);
    console.log(`  3. Run 'mxclaw doctor' to validate your setup`);
});
// ── onboard ───────────────────────────────────────────────────────
program
    .command("onboard")
    .description("Interactive terminal setup wizard — configure providers, channels, and agents step by step")
    .option("--install-daemon", "Install system daemon to auto-start gateway on boot")
    .option("--uninstall-daemon", "Remove the system daemon")
    .option("--status", "Check daemon status")
    .option("--quick", "Quick setup with defaults (non-interactive)")
    .action(async (options) => {
    if (options.installDaemon) {
        await installDaemon();
    }
    else if (options.uninstallDaemon) {
        await uninstallDaemon();
    }
    else if (options.status) {
        await daemonStatus();
    }
    else if (options.quick) {
        console.log("  ⚡ Quick setup coming soon — use 'mxclaw onboard' for interactive setup");
    }
    else {
        await runOnboard();
    }
});
// ── runner ────────────────────────────────────────────────────────
program
    .command("runner")
    .description("Quick start — run setup + doctor + gateway in one command")
    .option("-p, --port <number>", "Gateway port", "18700")
    .option("-h, --host <host>", "Bind host", "127.0.0.1")
    .action(async (options) => {
    const { loadConfig, saveConfig, generateDefaultConfig, getConfigPath } = await import("@mxclaw/core");
    const configPath = getConfigPath();
    const fs = await import("node:fs");
    // Step 1: Ensure config exists
    if (!fs.existsSync(configPath)) {
        console.log("📄 No config found — creating default...");
        const defaultConfig = generateDefaultConfig();
        saveConfig(defaultConfig);
        console.log("✅ Default config created\n");
    }
    // Step 2: Doctor check
    console.log("🩺 Running diagnostics...\n");
    const config = loadConfig();
    const issues = [];
    const warnings = [];
    const ok = [];
    ok.push(`Config: ${configPath}`);
    const agents = Object.keys(config.agents ?? {});
    if (agents.length === 0)
        warnings.push("No agents configured");
    else
        ok.push(`${agents.length} agent(s): ${agents.join(", ")}`);
    const channels = Object.keys(config.channels ?? {});
    if (channels.length === 0)
        warnings.push("No channels configured");
    else
        ok.push(`${channels.length} channel(s): ${channels.join(", ")}`);
    const defaultAgent = config.defaultAgentId ?? "default";
    if (!config.agents?.[defaultAgent])
        issues.push(`Default agent "${defaultAgent}" not found`);
    else
        ok.push(`Default agent: ${defaultAgent}`);
    for (const o of ok)
        console.log(`  ✅ ${o}`);
    for (const w of warnings)
        console.log(`  ⚠️  ${w}`);
    for (const i of issues)
        console.log(`  ❌ ${i}`);
    if (issues.length > 0) {
        console.log("\n❌ Issues found. Run 'mxclaw onboard' to fix them.");
        return;
    }
    console.log(`\n${warnings.length > 0 ? "⚠️  Warnings exist but continuing..." : "✅ All checks passed!"}\n`);
    // Step 3: Start gateway
    console.log("🚀 Starting MxClaw Gateway...\n");
    const { MxClawGateway } = await import("@mxclaw/gateway");
    config.gateway.port = parseInt(options.port, 10);
    config.gateway.host = options.host;
    const gateway = new MxClawGateway(configPath);
    const shutdown = async () => {
        console.log("\n🛑 Shutting down...");
        await gateway.stop();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    await gateway.start();
    console.log(`\n🦞  MxClaw Gateway running on http://${config.gateway.host}:${config.gateway.port}`);
    console.log(`   Control UI: http://localhost:5173`);
    console.log(`   Health:     http://${config.gateway.host}:${config.gateway.port}/health`);
    console.log(`   Status:     http://${config.gateway.host}:${config.gateway.port}/status`);
    console.log(`\n   Press Ctrl+C to stop\n`);
});
// ── auth ──────────────────────────────────────────────────────────
program
    .command("auth")
    .description("Manage authentication and pairing")
    .option("--list-pairings", "List pending pairing codes")
    .option("--approve <code>", "Approve a pairing code")
    .option("--deny <code>", "Deny a pairing code")
    .option("--list-devices", "List paired devices")
    .option("--unpair <deviceId>", "Unpair a device")
    .action(async (options) => {
    const config = loadConfig();
    if (options.listPairings) {
        console.log("Pending pairing codes:");
        // Would query the gateway's pairing manager
        console.log("  (connect to running gateway for live data)");
    }
    if (options.approve) {
        console.log(`Approved pairing code: ${options.approve}`);
        // Would call gateway API
    }
    if (options.deny) {
        console.log(`Denied pairing code: ${options.deny}`);
    }
    if (options.listDevices) {
        const devices = config.devices ?? [];
        console.log("Paired devices:");
        for (const device of devices) {
            console.log(`  ${device.id} (${device.name}) - ${device.type} - ${device.paired ? "paired" : "pending"}`);
        }
    }
    if (options.unpair) {
        config.devices = (config.devices ?? []).filter((d) => d.id !== options.unpair);
        saveConfig(config);
        console.log(`Unpaired device: ${options.unpair}`);
    }
});
// ── channels ──────────────────────────────────────────────────────
program
    .command("channels")
    .description("Manage messaging channels")
    .option("--list", "List configured channels")
    .option("--add <type>", "Add a new channel (discord, telegram, slack, whatsapp, etc.)")
    .option("--remove <id>", "Remove a channel")
    .option("--enable <id>", "Enable a channel")
    .option("--disable <id>", "Disable a channel")
    .option("--status", "Show channel connection status")
    .action(async (options) => {
    const config = loadConfig();
    if (options.list) {
        console.log("Configured channels:");
        const channels = config.channels ?? {};
        for (const [id, ch] of Object.entries(channels)) {
            console.log(`  ${id} (${ch.type}) - ${ch.enabled ? "✅ enabled" : "❌ disabled"}`);
        }
        if (Object.keys(channels).length === 0) {
            console.log("  No channels configured. Use --add to add one.");
        }
    }
    if (options.add) {
        const type = options.add;
        const id = `${type}-1`;
        const channelConfig = {
            id,
            type,
            enabled: true,
            credentials: {},
            options: {},
            allowlist: [],
            mentionGating: true,
            pairingEnabled: true,
        };
        config.channels = { ...config.channels, [id]: channelConfig };
        saveConfig(config);
        console.log(`Added channel: ${id} (${type})`);
        console.log(`Edit ${getConfigPath()} to configure credentials.`);
    }
    if (options.remove) {
        const channels = { ...config.channels };
        delete channels[options.remove];
        config.channels = channels;
        saveConfig(config);
        console.log(`Removed channel: ${options.remove}`);
    }
    if (options.enable) {
        const ch = config.channels[options.enable];
        if (ch) {
            ch.enabled = true;
            saveConfig(config);
            console.log(`Enabled channel: ${options.enable}`);
        }
    }
    if (options.disable) {
        const ch = config.channels[options.disable];
        if (ch) {
            ch.enabled = false;
            saveConfig(config);
            console.log(`Disabled channel: ${options.disable}`);
        }
    }
    if (options.status) {
        console.log("Channel status: (connect to running gateway for live data)");
        console.log("Run 'mxclaw gateway' first, then check http://localhost:18700/status");
    }
});
// ── models ────────────────────────────────────────────────────────
program
    .command("models")
    .description("Manage LLM provider models")
    .option("--list", "List configured agents and their models")
    .option("--list-providers", "List available provider plugins")
    .option("--set-default <agentId>", "Set the default agent")
    .option("--add-agent <id>", "Add a new agent")
    .option("--remove-agent <id>", "Remove an agent")
    .action(async (options) => {
    const config = loadConfig();
    if (options.list) {
        console.log("Configured agents:");
        const agents = config.agents ?? {};
        for (const [id, agent] of Object.entries(agents)) {
            const isDefault = id === (config.defaultAgentId ?? "default");
            console.log(`  ${id}${isDefault ? " ⭐ (default)" : ""}`);
            console.log(`    Model: ${agent.model.provider}/${agent.model.model}`);
            console.log(`    Fallback chain: ${agent.fallbackChain?.map((f) => `${f.provider}/${f.model}`).join(", ") ?? "none"}`);
            console.log(`    Tools: ${Object.entries(agent.tools ?? {}).filter(([, t]) => t.enabled).map(([n]) => n).join(", ") ?? "none"}`);
        }
    }
    if (options.listProviders) {
        console.log("Available provider plugins:");
        const providers = [
            "openai", "anthropic", "gemini", "groq", "deepseek",
            "lmstudio", "ollama", "together", "fireworks", "replicate",
            "cohere", "mistral", "perplexity", "xai", "bedrock", "azure", "cloudflare",
        ];
        for (const p of providers) {
            console.log(`  - ${p}`);
        }
    }
    if (options.setDefault) {
        if (!config.agents[options.setDefault]) {
            console.error(`Agent "${options.setDefault}" not found.`);
            return;
        }
        config.defaultAgentId = options.setDefault;
        saveConfig(config);
        console.log(`Default agent set to: ${options.setDefault}`);
    }
    if (options.addAgent) {
        const id = options.addAgent;
        const agentConfig = {
            id,
            name: id,
            model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
            fallbackChain: [],
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
            mentionGating: true,
            maxSessionTurns: 100,
            compactionThreshold: 50,
            sandbox: { enabled: false, type: "docker" },
            voice: { provider: "system-tts" },
        };
        config.agents = { ...config.agents, [id]: agentConfig };
        saveConfig(config);
        console.log(`Added agent: ${id}`);
    }
    if (options.removeAgent) {
        if (options.removeAgent === "default") {
            console.error("Cannot remove the default agent.");
            return;
        }
        const agents = { ...config.agents };
        delete agents[options.removeAgent];
        config.agents = agents;
        if (config.defaultAgentId === options.removeAgent) {
            config.defaultAgentId = "default";
        }
        saveConfig(config);
        console.log(`Removed agent: ${options.removeAgent}`);
    }
});
// ── sessions ──────────────────────────────────────────────────────
program
    .command("sessions")
    .description("Manage chat sessions")
    .option("--list [agentId]", "List sessions for an agent")
    .option("--view <sessionKey>", "View session transcript")
    .option("--reset <sessionKey>", "Reset (delete) a session")
    .option("--agent <agentId>", "Agent ID for session operations", "default")
    .action(async (options) => {
    const config = loadConfig();
    const storage = new JsonlStorageAdapter(config);
    await storage.initialize();
    const agentId = options.agent ?? config.defaultAgentId ?? "default";
    if (options.list !== undefined) {
        const listAgentId = typeof options.list === "string" ? options.list : agentId;
        const sessions = await storage.listSessions(listAgentId);
        console.log(`Sessions for agent "${listAgentId}":`);
        if (sessions.length === 0) {
            console.log("  No sessions found.");
        }
        for (const s of sessions) {
            const age = Math.round((Date.now() - s.lastActiveAt) / 60000);
            console.log(`  ${s.sessionKey} - ${s.turnCount} turns - last active ${age}m ago`);
        }
    }
    if (options.view) {
        const turns = await storage.getSessionTranscript(agentId, options.view);
        console.log(`Session: ${options.view} (${turns.length} turns)\n`);
        for (const turn of turns) {
            const roleTag = turn.role === "user" ? "👤" : turn.role === "assistant" ? "🤖" : turn.role === "system" ? "⚙️" : "🔧";
            console.log(`${roleTag} [${turn.role}] ${new Date(turn.timestamp).toLocaleString()}`);
            console.log(turn.content.slice(0, 200) + (turn.content.length > 200 ? "..." : ""));
            console.log("---");
        }
    }
    if (options.reset) {
        await storage.deleteSession(agentId, options.reset);
        console.log(`Session reset: ${options.reset}`);
    }
    await storage.close();
});
// ── doctor ────────────────────────────────────────────────────────
program
    .command("doctor")
    .description("Diagnose configuration and environment issues")
    .action(async () => {
    console.log("🩺 mxclaw Doctor\n");
    const issues = [];
    const warnings = [];
    const ok = [];
    // Check config
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
        ok.push(`Config file exists: ${configPath}`);
        try {
            const config = loadConfig();
            ok.push("Config is valid JSON and passes schema validation");
            // Check agents
            const agents = config.agents ?? {};
            if (Object.keys(agents).length === 0) {
                warnings.push("No agents configured. Add at least one agent.");
            }
            else {
                ok.push(`${Object.keys(agents).length} agent(s) configured`);
                for (const [id, agent] of Object.entries(agents)) {
                    if (!agent.model.provider) {
                        issues.push(`Agent "${id}" has no model provider configured`);
                    }
                }
            }
            // Check default agent
            if (!config.defaultAgentId) {
                warnings.push("No default agent set. Inbound messages without a binding will be dropped.");
            }
            else if (!agents[config.defaultAgentId]) {
                issues.push(`Default agent "${config.defaultAgentId}" not found in agents config`);
            }
            // Check channels
            const channels = config.channels ?? {};
            if (Object.keys(channels).length === 0) {
                warnings.push("No channels configured. Add channels to receive messages.");
            }
            else {
                ok.push(`${Object.keys(channels).length} channel(s) configured`);
                for (const [id, ch] of Object.entries(channels)) {
                    if (!ch.credentials || Object.keys(ch.credentials).length === 0) {
                        warnings.push(`Channel "${id}" (${ch.type}) has no credentials configured`);
                    }
                }
            }
            // Check bindings
            const bindings = config.bindings ?? [];
            if (bindings.length === 0) {
                warnings.push("No bindings configured. Messages will route to the default agent.");
            }
            // Check for yolo mode
            for (const [id, agent] of Object.entries(agents)) {
                for (const [toolName, toolCfg] of Object.entries(agent.tools ?? {})) {
                    if (toolCfg.approval === "yolo") {
                        warnings.push(`⚠️ Agent "${id}" tool "${toolName}" is in YOLO mode - no approval required!`);
                    }
                }
            }
            // Check sandbox
            for (const [id, agent] of Object.entries(agents)) {
                if (agent.sandbox?.enabled) {
                    ok.push(`Agent "${id}" has sandbox enabled (${agent.sandbox.type})`);
                }
                else {
                    const hasYolo = Object.values(agent.tools ?? {}).some((t) => t.approval === "yolo");
                    if (hasYolo) {
                        warnings.push(`Agent "${id}" has YOLO tools but no sandbox - consider enabling sandbox`);
                    }
                }
            }
        }
        catch (err) {
            issues.push(`Config validation failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    else {
        issues.push(`Config file not found: ${configPath}. Run 'mxclaw setup' to create one.`);
    }
    // Check Node.js version
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split(".")[0] ?? "0");
    if (major >= 20) {
        ok.push(`Node.js ${nodeVersion} (>=20 required)`);
    }
    else {
        issues.push(`Node.js ${nodeVersion} is too old. Version 20+ required.`);
    }
    // Check workspace directory
    const workspaceDir = path.join(os.homedir(), ".mxclaw", "workspace");
    if (fs.existsSync(workspaceDir)) {
        ok.push(`Workspace directory exists: ${workspaceDir}`);
    }
    else {
        warnings.push(`Workspace directory not yet created: ${workspaceDir} (will be created on first run)`);
    }
    // Check for common dependencies
    const deps = ["docker", "git"];
    for (const dep of deps) {
        try {
            const { execSync } = await import("node:child_process");
            execSync(`where ${dep}`, { stdio: "ignore" });
            ok.push(`${dep} is available`);
        }
        catch {
            warnings.push(`${dep} not found in PATH (optional, for sandbox/version control)`);
        }
    }
    // Print results
    console.log("✅ OK:");
    for (const o of ok)
        console.log(`  ${o}`);
    if (warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        for (const w of warnings)
            console.log(`  ${w}`);
    }
    if (issues.length > 0) {
        console.log("\n❌ Issues:");
        for (const i of issues)
            console.log(`  ${i}`);
    }
    console.log(`\nSummary: ${ok.length} OK, ${warnings.length} warnings, ${issues.length} issues`);
});
// ── config ────────────────────────────────────────────────────────
program
    .command("config")
    .description("View or edit the mxclaw configuration")
    .option("--show", "Show current config")
    .option("--path", "Show config file path")
    .option("--edit", "Open config in default editor")
    .action(async (options) => {
    const configPath = getConfigPath();
    if (options.path) {
        console.log(configPath);
        return;
    }
    if (options.show) {
        if (!fs.existsSync(configPath)) {
            console.log("No config found. Run 'mxclaw setup' first.");
            return;
        }
        const content = fs.readFileSync(configPath, "utf-8");
        console.log(content);
        return;
    }
    if (options.edit) {
        const { exec } = await import("node:child_process");
        const editor = process.env.EDITOR ?? process.env.VISUAL ?? (process.platform === "win32" ? "notepad" : "vim");
        exec(`${editor} "${configPath}"`);
        return;
    }
    // Default: show path
    console.log(`Config: ${configPath}`);
    console.log(`Exists: ${fs.existsSync(configPath) ? "yes" : "no"}`);
});
// ── bind ──────────────────────────────────────────────────────────
program
    .command("bind")
    .description("Manage channel-to-agent bindings")
    .option("--list", "List all bindings")
    .option("--add <channelId>", "Add a binding for a channel")
    .option("--sender <senderId>", "Sender ID for the binding")
    .option("--agent <agentId>", "Agent ID for the binding", "default")
    .option("--remove <index>", "Remove a binding by index")
    .action(async (options) => {
    const config = loadConfig();
    if (options.list) {
        const bindings = config.bindings ?? [];
        console.log("Bindings:");
        if (bindings.length === 0) {
            console.log("  No bindings configured.");
        }
        bindings.forEach((b, i) => {
            console.log(`  [${i}] ${b.channelId}${b.senderId ? ` / ${b.senderId}` : ""} → ${b.agentId}`);
        });
    }
    if (options.add) {
        const binding = {
            channelId: options.add,
            senderId: options.sender,
            agentId: options.agent,
        };
        config.bindings = [...(config.bindings ?? []), binding];
        saveConfig(config);
        console.log(`Added binding: ${binding.channelId} → ${binding.agentId}`);
    }
    if (options.remove !== undefined) {
        const idx = parseInt(options.remove, 10);
        const bindings = [...(config.bindings ?? [])];
        if (idx >= 0 && idx < bindings.length) {
            const removed = bindings.splice(idx, 1);
            config.bindings = bindings;
            saveConfig(config);
            console.log(`Removed binding: ${removed[0]?.channelId} → ${removed[0]?.agentId}`);
        }
        else {
            console.error(`Invalid binding index: ${idx}`);
        }
    }
});
// ── bootstrap ──────────────────────────────────────────────────────
program
    .command("bootstrap")
    .description("Manage API keys and secrets in the bootstrap file")
    .option("--show", "Show all keys (masked)")
    .option("--show-keys", "Show all keys in plain text")
    .option("--edit", "Open bootstrap.env in default editor")
    .option("--set <key=value>", "Set a key (e.g., OPENAI_API_KEY=sk-...)")
    .option("--remove <key>", "Remove a key")
    .option("--path", "Show bootstrap file paths")
    .action(async (options) => {
    const envPath = getBootstrapEnvPath();
    const jsonPath = getBootstrapJsonPath();
    if (options.path) {
        console.log(`bootstrap.env : ${envPath}`);
        console.log(`bootstrap.json: ${jsonPath}`);
        return;
    }
    if (options.edit) {
        const { exec } = await import("node:child_process");
        const editor = process.env.EDITOR ?? process.env.VISUAL ?? (process.platform === "win32" ? "notepad" : "vim");
        if (!fs.existsSync(envPath))
            fs.writeFileSync(envPath, "# MxClaw Bootstrap\n", "utf-8");
        exec(`${editor} "${envPath}"`);
        return;
    }
    if (options.set) {
        const eqIdx = options.set.indexOf("=");
        if (eqIdx === -1) {
            console.error("Usage: --set KEY=VALUE");
            return;
        }
        const key = options.set.slice(0, eqIdx);
        const value = options.set.slice(eqIdx + 1);
        const entries = loadBootstrap();
        entries[key] = value;
        saveBootstrap(entries);
        console.log(`✅ Set ${key}`);
        return;
    }
    if (options.remove) {
        const entries = loadBootstrap();
        if (!(options.remove in entries)) {
            console.error(`Key "${options.remove}" not found in bootstrap`);
            return;
        }
        delete entries[options.remove];
        saveBootstrap(entries);
        console.log(`✅ Removed ${options.remove}`);
        return;
    }
    const entries = loadBootstrap();
    const keys = Object.keys(entries);
    if (keys.length === 0) {
        console.log("No bootstrap keys found.");
        console.log("Run 'mxclaw onboard' to set up API keys.");
        return;
    }
    console.log(`Bootstrap keys (${keys.length}):\n`);
    const maxLen = Math.max(...keys.map((k) => k.length));
    for (const key of keys) {
        const val = entries[key];
        const display = options.showKeys ? val : `${val.slice(0, 8)}...${val.slice(-4)}`;
        const known = Object.values(PROVIDER_ENV_KEYS).includes(key);
        console.log(`  ${key.padEnd(maxLen + 2)}${known ? "" : "⚠️ "}${display}`);
    }
    console.log(`\nFiles:\n  ${envPath}\n  ${jsonPath}`);
});
// ── init ──────────────────────────────────────────────────────────
program
    .command("init")
    .description("Initialize a new mxclaw installation")
    .option("--clone [directory]", "Clone mxclaw from GitHub and set up a self-hosted instance", false)
    .action(async (options) => {
    if (options.clone === false) {
        console.log("Usage: mxclaw init --clone [directory]");
        console.log("\nClones the mxclaw repository from GitHub, installs dependencies,");
        console.log("builds all packages, and runs the onboard wizard.");
        return;
    }
    const targetDir = options.clone === true ? "mxclaw" : String(options.clone);
    const fullPath = path.resolve(targetDir);
    if (fs.existsSync(fullPath)) {
        console.error(`❌ Directory already exists: ${fullPath}`);
        return;
    }
    console.log(`\n  🚀 Cloning mxclaw into ${fullPath}...\n`);
    try {
        const { execSync } = await import("node:child_process");
        console.log("  1/4  Cloning repository...");
        execSync(`git clone https://github.com/mxclaw/mxclaw.git "${fullPath}"`, { stdio: "inherit" });
        console.log("\n  2/4  Installing dependencies...");
        execSync("pnpm install", { cwd: fullPath, stdio: "inherit" });
        console.log("\n  3/4  Building all packages...");
        execSync("pnpm -r build", { cwd: fullPath, stdio: "inherit" });
        console.log("\n  4/4  Running onboard wizard...\n");
        process.chdir(fullPath);
        await runOnboard();
        console.log(`\n  ✅ MxClaw initialized in ${fullPath}`);
        console.log(`  Run 'node ${path.join(fullPath, "dist", "cli.mjs")} gateway' to start the server\n`);
    }
    catch (err) {
        console.error(`\n❌ Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
    }
});
program.parse();
//# sourceMappingURL=index.js.map
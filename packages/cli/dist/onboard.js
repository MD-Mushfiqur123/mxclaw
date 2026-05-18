import * as readline from "node:readline";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { loadConfig, saveConfig, getConfigPath, getConfigDir, getWorkspacePath, loadBootstrap, saveBootstrap, getBootstrapSummary, getBootstrapEnvPath, getBootstrapJsonPath, PROVIDER_ENV_KEYS } from "@mxclaw/core";
const PROVIDER_PRESETS = {
    openai: { name: "OpenAI", baseUrl: "https://api.openai.com/v1", envKey: "OPENAI_API_KEY", defaultModel: "gpt-4o", description: "GPT-4o, GPT-4, o1, o3 — best all-around", docsUrl: "https://platform.openai.com/api-keys" },
    anthropic: { name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", envKey: "ANTHROPIC_API_KEY", defaultModel: "claude-sonnet-4-20250514", description: "Claude Sonnet 4, Opus 4 — best for coding & analysis", docsUrl: "https://console.anthropic.com/settings/keys" },
    groq: { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", envKey: "GROQ_API_KEY", defaultModel: "llama-3.3-70b-versatile", description: "Fastest inference — Llama, Mixtral, Gemma", docsUrl: "https://console.groq.com/keys" },
    deepseek: { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", envKey: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat", description: "DeepSeek V3, R1 — cheap & powerful", docsUrl: "https://platform.deepseek.com/api-keys" },
    together: { name: "Together AI", baseUrl: "https://api.together.xyz/v1", envKey: "TOGETHER_API_KEY", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo", description: "Open-source models at scale" },
    fireworks: { name: "Fireworks AI", baseUrl: "https://api.fireworks.ai/inference/v1", envKey: "FIREWORKS_API_KEY", defaultModel: "llama-v3p3-70b-instruct", description: "Fast serverless inference" },
    xai: { name: "xAI (Grok)", baseUrl: "https://api.x.ai/v1", envKey: "XAI_API_KEY", defaultModel: "grok-3", description: "Grok 3 — real-time knowledge" },
    perplexity: { name: "Perplexity", baseUrl: "https://api.perplexity.ai", envKey: "PERPLEXITY_API_KEY", defaultModel: "sonar-pro", description: "Sonar — web-search augmented" },
    mistral: { name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1", envKey: "MISTRAL_API_KEY", defaultModel: "mistral-large-latest", description: "Mistral Large, Small, Pixtral" },
    gemini: { name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta", envKey: "GEMINI_API_KEY", defaultModel: "gemini-2.5-pro-exp-03-25", description: "Gemini 2.5 Pro, Flash — multimodal", docsUrl: "https://aistudio.google.com/apikey" },
    openrouter: { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", envKey: "OPENROUTER_API_KEY", defaultModel: "openai/gpt-4o", description: "Access 200+ models through one API" },
    ollama: { name: "Ollama (Local)", baseUrl: "http://localhost:11434/v1", envKey: "", defaultModel: "llama3.2", description: "Run models locally — free & private" },
    lmstudio: { name: "LM Studio (Local)", baseUrl: "http://localhost:1234/v1", envKey: "", defaultModel: "local-model", description: "Desktop app for local models" },
    vllm: { name: "vLLM (Local)", baseUrl: "http://localhost:8000/v1", envKey: "", defaultModel: "default", description: "High-throughput local serving" },
    custom: { name: "Custom OpenAI-Compatible", baseUrl: "", envKey: "", defaultModel: "default", description: "Any OpenAI-compatible API endpoint" },
};
const CHANNEL_TYPES = {
    discord: { name: "Discord", description: "Discord bot via WebSocket intents", needsToken: true, tokenLabel: "Bot Token", docsUrl: "https://discord.com/developers/applications" },
    telegram: { name: "Telegram", description: "Telegram bot via Bot API", needsToken: true, tokenLabel: "Bot Token", docsUrl: "https://t.me/BotFather" },
    slack: { name: "Slack", description: "Slack app via Socket Mode", needsToken: true, tokenLabel: "Bot Token + App Token" },
    whatsapp: { name: "WhatsApp", description: "WhatsApp via Baileys (QR code login)", needsToken: false, tokenLabel: "" },
    signal: { name: "Signal", description: "Signal via signal-cli REST API", needsToken: false, tokenLabel: "" },
    matrix: { name: "Matrix", description: "Matrix homeserver via sync API", needsToken: true, tokenLabel: "Access Token" },
    imessage: { name: "iMessage", description: "iMessage via BlueBubbles server (macOS only)", needsToken: true, tokenLabel: "Server URL + Password" },
    irc: { name: "IRC", description: "IRC via raw TCP socket", needsToken: false, tokenLabel: "" },
    googlechat: { name: "Google Chat", description: "Google Chat via REST API", needsToken: true, tokenLabel: "Service Account Key (JSON path)" },
    teams: { name: "Microsoft Teams", description: "Teams via Bot Framework", needsToken: true, tokenLabel: "Bot ID + Password" },
    feishu: { name: "Feishu/Lark", description: "Feishu/Lark via Open API", needsToken: true, tokenLabel: "App ID + App Secret" },
    line: { name: "LINE", description: "LINE via Messaging API", needsToken: true, tokenLabel: "Channel Access Token" },
    mattermost: { name: "Mattermost", description: "Mattermost via WebSocket API", needsToken: true, tokenLabel: "Access Token" },
    nextcloud: { name: "Nextcloud Talk", description: "Nextcloud Talk via OCS API", needsToken: true, tokenLabel: "Username + Password" },
    nostr: { name: "Nostr", description: "Nostr relay via WebSocket", needsToken: false, tokenLabel: "" },
    tlon: { name: "Tlon/Urbit", description: "Tlon/Urbit via HTTP SSE + poke", needsToken: true, tokenLabel: "Ship URL + Auth Code" },
    synology: { name: "Synology Chat", description: "Synology Chat via REST API polling", needsToken: true, tokenLabel: "Webhook URL" },
    twitch: { name: "Twitch", description: "Twitch chat via IRC", needsToken: true, tokenLabel: "Access Token + Username" },
    zalo: { name: "Zalo", description: "Zalo OA via Open REST API", needsToken: true, tokenLabel: "OA ID + App Secret" },
    wechat: { name: "WeChat", description: "WeChat Official Account via REST API", needsToken: true, tokenLabel: "App ID + App Secret" },
    qq: { name: "QQ", description: "QQ via OneBot v11 WebSocket", needsToken: false, tokenLabel: "" },
    webchat: { name: "WebChat", description: "WebChat via embedded WebSocket server", needsToken: false, tokenLabel: "" },
};
// ── Daemon Management ─────────────────────────────────────────────
function detectPlatform() {
    if (process.platform === "darwin")
        return "macos";
    if (process.platform === "linux")
        return "linux";
    if (process.platform === "win32")
        return "windows";
    return "unsupported";
}
function getDaemonScriptPath() {
    const home = os.homedir();
    switch (detectPlatform()) {
        case "macos":
            return path.join(home, "Library", "LaunchAgents", "com.mxclaw.daemon.plist");
        case "linux":
            return path.join(home, ".config", "systemd", "user", "mxclaw.service");
        case "windows":
            return path.join(home, ".mxclaw", "mxclaw-daemon.ps1");
        default:
            return "";
    }
}
function generateLaunchdPlist(mxclawBin, configPath, logPath) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mxclaw.daemon</string>
  <key>ProgramArguments</key>
  <array>
    <string>${mxclawBin}</string>
    <string>gateway</string>
    <string>--config</string>
    <string>${configPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin"}</string>
  </dict>
  <key>ThrottleInterval</key>
  <integer>5</integer>
</dict>
</plist>`;
}
function generateSystemdService(mxclawBin, configPath) {
    return `[Unit]
Description=MxClaw AI Agent Gateway
After=network.target

[Service]
Type=simple
ExecStart=${mxclawBin} gateway --config ${configPath}
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target`;
}
function generateWindowsScript(mxclawBin, configPath, logPath) {
    return `# MxClaw Daemon - Windows Scheduled Task Script
# Run this via: schtasks /create /tn "MxClawDaemon" /tr "powershell -File \\"${getDaemonScriptPath()}\\"" /sc onlogon /delay 0000:30 /f
# Or manually: powershell -File "${getDaemonScriptPath()}"

while ($true) {
  try {
    & "${mxclawBin}" gateway --config "${configPath}" 2>&1 | Out-File -FilePath "${logPath}" -Append
  } catch {
    $_ | Out-File -FilePath "${logPath}" -Append
  }
  Start-Sleep -Seconds 5
}`;
}
function getMxClawBinPath() {
    const isDev = process.argv[1]?.includes("ts") || process.argv[1]?.includes("dist");
    if (isDev && process.argv[1]) {
        return process.argv[1];
    }
    try {
        const { execSync } = require("node:child_process");
        return execSync("which mxclaw 2>/dev/null || where mxclaw 2>nul").toString().trim().split("\n")[0] ?? "mxclaw";
    }
    catch {
        return "mxclaw";
    }
}
export async function installDaemon() {
    const platform = detectPlatform();
    if (platform === "unsupported") {
        console.log("  ⚠️  Daemon installation not supported on this platform.");
        return;
    }
    const mxclawBin = getMxClawBinPath();
    const configPath = getConfigPath();
    const logDir = path.join(os.homedir(), ".mxclaw");
    const logPath = path.join(logDir, "daemon.log");
    const scriptPath = getDaemonScriptPath();
    if (!fs.existsSync(logDir))
        fs.mkdirSync(logDir, { recursive: true });
    console.log(`  📝 Installing daemon for ${platform}...`);
    switch (platform) {
        case "macos": {
            const plist = generateLaunchdPlist(mxclawBin, configPath, logPath);
            const launchDir = path.dirname(scriptPath);
            if (!fs.existsSync(launchDir))
                fs.mkdirSync(launchDir, { recursive: true });
            fs.writeFileSync(scriptPath, plist, "utf-8");
            console.log(`  📄 Wrote: ${scriptPath}`);
            try {
                const { execSync } = await import("node:child_process");
                execSync(`launchctl load "${scriptPath}"`, { stdio: "pipe" });
                console.log("  ✅ Daemon loaded via launchctl");
            }
            catch (e) {
                console.log(`  ⚠️  Could not load via launchctl (will auto-start on next login): ${e instanceof Error ? e.message : String(e)}`);
            }
            break;
        }
        case "linux": {
            const service = generateSystemdService(mxclawBin, configPath);
            const sysDir = path.dirname(scriptPath);
            if (!fs.existsSync(sysDir))
                fs.mkdirSync(sysDir, { recursive: true });
            fs.writeFileSync(scriptPath, service, "utf-8");
            console.log(`  📄 Wrote: ${scriptPath}`);
            try {
                const { execSync } = await import("node:child_process");
                execSync(`systemctl --user daemon-reload`, { stdio: "pipe" });
                execSync(`systemctl --user enable mxclaw.service`, { stdio: "pipe" });
                execSync(`systemctl --user start mxclaw.service`, { stdio: "pipe" });
                console.log("  ✅ Daemon installed and started via systemd");
            }
            catch (e) {
                console.log(`  ⚠️  Could not start via systemd (will work after next login): ${e instanceof Error ? e.message : String(e)}`);
            }
            break;
        }
        case "windows": {
            const script = generateWindowsScript(mxclawBin, configPath, logPath);
            fs.writeFileSync(scriptPath, script, "utf-8");
            console.log(`  📄 Wrote: ${scriptPath}`);
            try {
                const { execSync } = await import("node:child_process");
                execSync(`schtasks /create /tn "MxClawDaemon" /tr "powershell -File \\"${scriptPath}\\"" /sc onlogon /delay 0000:30 /f`, { stdio: "pipe" });
                console.log("  ✅ Scheduled task created (runs at logon)");
            }
            catch (e) {
                console.log(`  ⚠️  Could not create scheduled task: ${e instanceof Error ? e.message : String(e)}`);
            }
            break;
        }
    }
    console.log(`  📋 Logs: ${logPath}`);
}
export async function uninstallDaemon() {
    const platform = detectPlatform();
    const scriptPath = getDaemonScriptPath();
    console.log(`  🗑️  Removing daemon for ${platform}...`);
    switch (platform) {
        case "macos": {
            try {
                const { execSync } = await import("node:child_process");
                execSync(`launchctl unload "${scriptPath}"`, { stdio: "pipe" });
            }
            catch { /* ignore */ }
            if (fs.existsSync(scriptPath))
                fs.unlinkSync(scriptPath);
            console.log("  ✅ Daemon removed");
            break;
        }
        case "linux": {
            try {
                const { execSync } = await import("node:child_process");
                execSync(`systemctl --user stop mxclaw.service 2>/dev/null`, { stdio: "pipe" });
                execSync(`systemctl --user disable mxclaw.service 2>/dev/null`, { stdio: "pipe" });
            }
            catch { /* ignore */ }
            if (fs.existsSync(scriptPath))
                fs.unlinkSync(scriptPath);
            console.log("  ✅ Daemon removed");
            break;
        }
        case "windows": {
            try {
                const { execSync } = await import("node:child_process");
                execSync(`schtasks /delete /tn "MxClawDaemon" /f`, { stdio: "pipe" });
            }
            catch { /* ignore */ }
            if (fs.existsSync(scriptPath))
                fs.unlinkSync(scriptPath);
            console.log("  ✅ Daemon removed");
            break;
        }
        default:
            console.log("  ⚠️  No daemon to remove on this platform.");
    }
}
export async function daemonStatus() {
    const platform = detectPlatform();
    const scriptPath = getDaemonScriptPath();
    console.log(`  🔍 Checking daemon status (${platform})...\n`);
    if (!fs.existsSync(scriptPath)) {
        console.log("  ❌ Daemon not installed. Run 'mxclaw onboard --install-daemon'");
        return;
    }
    let running = false;
    let pid = "";
    switch (platform) {
        case "macos": {
            try {
                const { execSync } = await import("node:child_process");
                const out = execSync(`launchctl list | grep com.mxclaw.daemon`, { encoding: "utf-8", stdio: "pipe" });
                if (out.trim()) {
                    running = true;
                    pid = out.trim().split("\t")[0] ?? "";
                }
            }
            catch { /* not running */ }
            break;
        }
        case "linux": {
            try {
                const { execSync } = await import("node:child_process");
                const out = execSync(`systemctl --user is-active mxclaw.service`, { encoding: "utf-8", stdio: "pipe" });
                running = out.trim() === "active";
                if (running) {
                    const pidOut = execSync(`systemctl --user show mxclaw.service -p MainPID`, { encoding: "utf-8", stdio: "pipe" });
                    pid = pidOut.trim().replace("MainPID=", "");
                }
            }
            catch { /* not running */ }
            break;
        }
        case "windows": {
            try {
                const { execSync } = await import("node:child_process");
                const out = execSync(`schtasks /query /tn "MxClawDaemon" /v /fo list 2>nul`, { encoding: "utf-8", stdio: "pipe" });
                running = out.includes("MxClawDaemon");
            }
            catch { /* not running */ }
            break;
        }
    }
    console.log(`  Daemon script: ${scriptPath}`);
    console.log(`  Status: ${running ? "✅ Running" : "⏹️  Stopped"}`);
    if (pid)
        console.log(`  PID: ${pid}`);
}
// ── Provider Connectivity Test ─────────────────────────────────────
export async function testProvider(baseUrl, apiKey, model) {
    const start = Date.now();
    try {
        const headers = { "Content-Type": "application/json" };
        if (apiKey)
            headers["Authorization"] = `Bearer ${apiKey}`;
        const resp = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "Reply with just: OK" }],
                max_tokens: 10,
            }),
            signal: AbortSignal.timeout(15000),
        });
        const latency = Date.now() - start;
        if (resp.ok)
            return { ok: true, latency };
        const errText = await resp.text().catch(() => "");
        return { ok: false, latency, error: `${resp.status}: ${errText.slice(0, 200)}` };
    }
    catch (err) {
        return { ok: false, latency: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
    }
}
// ── Workspace Initialization ───────────────────────────────────────
function initializeWorkspace(workspacePath) {
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
        console.log(`  📁 Created workspace: ${workspacePath}`);
    }
    const agentsMd = path.join(workspacePath, "AGENTS.md");
    if (!fs.existsSync(agentsMd)) {
        fs.writeFileSync(agentsMd, `# MxClaw Agent Workspace

This directory contains configuration, prompts, and skills for your MxClaw agents.

## Injected Prompt Files

- \`AGENTS.md\` — this file, always injected into every agent session
- \`SOUL.md\` — optional persona/soul definition
- \`TOOLS.md\` — optional tool usage guidelines

## Skills

Place skill directories under \`skills/<skill-name>/SKILL.md\`.

## Adding Files

Any markdown file placed here is automatically injected into agent context.
`, "utf-8");
        console.log(`  📝 Created: ${agentsMd}`);
    }
    const skillsDir = path.join(workspacePath, "skills");
    if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
    }
}
// ── UI Helpers ─────────────────────────────────────────────────────
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const CLEAR_LINE = "\x1b[2K\r";
function color(s, c) {
    return `${c}${s}${RESET}`;
}
function printHeader() {
    console.log("");
    console.log(color(`  ╔══════════════════════════════════════════════════════════╗`, CYAN));
    console.log(color(`  ║                                                      ║`, CYAN));
    console.log(color(`  ║           🦞  ${BOLD}MxClaw Onboard Wizard${RESET}${CYAN}              ║`, CYAN));
    console.log(color(`  ║     ${DIM}Set up your personal AI agent gateway${RESET}${CYAN}        ║`, CYAN));
    console.log(color(`  ║                                                      ║`, CYAN));
    console.log(color(`  ╚══════════════════════════════════════════════════════════╝`, CYAN));
    console.log("");
}
function printSection(title, subtitle) {
    console.log(color(`\n  ── ${BOLD}${title}${RESET} ──${subtitle ? ` ${DIM}${subtitle}${RESET}` : ""}\n`, CYAN));
}
function printTable(rows) {
    const maxLen = Math.max(...rows.map((r) => r.left.length));
    for (const row of rows) {
        console.log(`    ${row.left.padEnd(maxLen + 2)}${row.right}`);
    }
}
function printSummaryTable(summary) {
    const maxLen = Math.max(...summary.map((s) => s.label.length));
    console.log(color(`\n  ┌─────────────────────────────────────────────────────────┐`, GREEN));
    console.log(color(`  │              ✅  Setup Complete!                        │`, GREEN));
    console.log(color(`  └─────────────────────────────────────────────────────────┘`, GREEN));
    console.log("");
    for (const s of summary) {
        const icon = s.ok ? "✅" : "⚠️";
        console.log(`    ${icon}  ${s.label.padEnd(maxLen + 2)}${color(s.value, s.ok ? GREEN : YELLOW)}`);
    }
}
// ── Main Onboard Wizard ────────────────────────────────────────────
export async function runOnboard() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
    printHeader();
    console.log("  This wizard will guide you through setting up:");
    console.log("  •  LLM provider(s) for AI responses");
    console.log("  •  Messaging channel(s) for chatting with your agent");
    console.log("  •  Agent configuration with model fallbacks");
    console.log("  •  Gateway settings");
    console.log("  •  Workspace initialization");
    console.log(color(`\n  ${DIM}Press Ctrl+C at any time to exit.${RESET}\n`, DIM));
    // Load or create config
    let config;
    const configPath = getConfigPath();
    const isNew = !fs.existsSync(configPath);
    if (!isNew) {
        console.log(color(`  📄 ${BOLD}Loading existing config:${RESET} ${DIM}${configPath}${RESET}\n`, YELLOW));
        config = loadConfig();
    }
    else {
        const configDir = getConfigDir();
        if (!fs.existsSync(configDir))
            fs.mkdirSync(configDir, { recursive: true });
        config = {
            version: 1,
            gateway: { host: "127.0.0.1", port: 18700, webhookPath: "/gateway/webhook", corsOrigins: ["http://localhost:5173"], wsHeartbeatIntervalMs: 30000 },
            agents: {},
            channels: {},
            bindings: [],
            devices: [],
            voice: { defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: { voiceId: "21m00Tcm4TlvDq8ikWAM" }, systemTts: {} },
            logging: { level: "info", subsystems: {}, otel: { enabled: false } },
            storage: { type: "jsonl", workspacePath: "~/.mxclaw/workspace", lanceDbPath: "~/.mxclaw/lancedb", sqlitePath: "~/.mxclaw/mxclaw.db" },
            plugins: [],
            sandbox: { enabled: false, type: "docker" },
            ownerId: undefined,
        };
        console.log(color(`  📄 ${BOLD}Creating new config...${RESET}\n`, GREEN));
    }
    // ── Step 1: Providers ──────────────────────────────────────────
    printSection("Step 1: LLM Providers", "Pick models for your agent to use");
    console.log("  Available providers:\n");
    const presetKeys = Object.keys(PROVIDER_PRESETS);
    for (let i = 0; i < presetKeys.length; i++) {
        const key = presetKeys[i];
        const p = PROVIDER_PRESETS[key];
        console.log(`  ${color(String(i + 1).padStart(2, " "), DIM)}. ${BOLD}${p.name.padEnd(22)}${RESET} ${DIM}${p.description}${RESET}`);
    }
    console.log(color(`\n  ${DIM}Enter comma-separated numbers (e.g., 1,2,3), 'all', or press Enter to skip${RESET}`, DIM));
    const providerSelection = await ask(color("  Select providers > ", CYAN));
    const selectedIndices = [];
    if (providerSelection.toLowerCase() === "all") {
        for (let i = 0; i < presetKeys.length; i++)
            selectedIndices.push(i);
    }
    else if (providerSelection.trim()) {
        for (const part of providerSelection.split(",")) {
            const idx = parseInt(part.trim(), 10) - 1;
            if (idx >= 0 && idx < presetKeys.length)
                selectedIndices.push(idx);
        }
    }
    const providers = [];
    for (const idx of selectedIndices) {
        const key = presetKeys[idx];
        const preset = PROVIDER_PRESETS[key];
        console.log(color(`\n  ─── ${BOLD}${preset.name}${RESET} ───`, MAGENTA));
        let apiKey = "";
        if (preset.envKey) {
            const envValue = process.env[preset.envKey] ?? "";
            const bootstrapValue = loadBootstrap()[preset.envKey] ?? "";
            if (envValue) {
                apiKey = envValue;
                console.log(color(`    ✅ Found $${preset.envKey} in environment (${apiKey.slice(0, 8)}...)`, DIM));
            }
            else if (bootstrapValue) {
                apiKey = bootstrapValue;
                console.log(color(`    ✅ Found $${preset.envKey} in bootstrap.env (${apiKey.slice(0, 8)}...)`, DIM));
            }
            else {
                if (preset.docsUrl) {
                    console.log(color(`    ${DIM}Get a key at: ${preset.docsUrl}${RESET}`, DIM));
                }
                apiKey = await ask(color("    API key (or Enter to skip): ", CYAN));
            }
        }
        let baseUrl = preset.baseUrl;
        if (key === "custom") {
            baseUrl = await ask(color("    Base URL (e.g., https://api.example.com/v1): ", CYAN)) || baseUrl;
        }
        const modelInput = await ask(color(`    Model [${preset.defaultModel}]: `, CYAN));
        const model = modelInput || preset.defaultModel;
        if (apiKey || !preset.envKey) {
            const providerRef = {
                provider: "openai-compatible",
                model,
                apiKey: apiKey || undefined,
                baseUrl: baseUrl || undefined,
                preset: key,
                temperature: 0.7,
                maxTokens: 4096,
                options: {},
            };
            // Test connectivity
            if (apiKey) {
                process.stdout.write(color("    Testing connectivity... ", DIM));
                const result = await testProvider(baseUrl || "https://api.openai.com/v1", apiKey, model);
                if (result.ok) {
                    console.log(color(`✅ ${result.latency}ms`, GREEN));
                }
                else {
                    console.log(color(`❌ ${result.error ?? "unknown error"}`, YELLOW));
                    const skipFail = await ask(color("    Add anyway? (y/N): ", CYAN));
                    if (skipFail.toLowerCase() !== "y") {
                        console.log(color("    ⏭️  Skipped", DIM));
                        continue;
                    }
                }
            }
            providers.push(providerRef);
            console.log(color(`    ✅ ${BOLD}${preset.name}${RESET} configured → ${model}`, GREEN));
        }
        else {
            console.log(color("    ⏭️  Skipped (no API key)", DIM));
        }
    }
    // ── Save to bootstrap.env/json ────────────────────────────────
    const bootstrapEntries = loadBootstrap();
    for (const p of providers) {
        const envKey = p.preset ? PROVIDER_ENV_KEYS[p.preset] : undefined;
        if (envKey && p.apiKey) {
            bootstrapEntries[envKey] = p.apiKey;
        }
    }
    if (Object.keys(bootstrapEntries).length > 0) {
        saveBootstrap(bootstrapEntries);
        console.log(color(`\n  🔐 ${BOLD}Saved ${Object.keys(bootstrapEntries).length} API key(s)${RESET} to bootstrap files`, GREEN));
        console.log(color(`     ${DIM}${getBootstrapEnvPath()}${RESET}`, DIM));
        console.log(color(`     ${DIM}${getBootstrapJsonPath()}${RESET}`, DIM));
    }
    // ── Step 2: Channels ───────────────────────────────────────────
    printSection("Step 2: Messaging Channels", "Connect platforms for your agent to live on");
    console.log("  Available channels:\n");
    const channelKeys = Object.keys(CHANNEL_TYPES);
    for (let i = 0; i < channelKeys.length; i++) {
        const key = channelKeys[i];
        const ch = CHANNEL_TYPES[key];
        console.log(`  ${color(String(i + 1).padStart(2, " "), DIM)}. ${BOLD}${ch.name.padEnd(18)}${RESET} ${DIM}${ch.description}${RESET}`);
    }
    console.log(color(`\n  ${DIM}Enter comma-separated numbers, 'all', or press Enter to skip${RESET}`, DIM));
    const channelSelection = await ask(color("  Select channels > ", CYAN));
    const channels = { ...config.channels };
    const selectedChannelIndices = [];
    if (channelSelection.toLowerCase() === "all") {
        for (let i = 0; i < channelKeys.length; i++)
            selectedChannelIndices.push(i);
    }
    else if (channelSelection.trim()) {
        for (const part of channelSelection.split(",")) {
            const idx = parseInt(part.trim(), 10) - 1;
            if (idx >= 0 && idx < channelKeys.length)
                selectedChannelIndices.push(idx);
        }
    }
    for (const idx of selectedChannelIndices) {
        const key = channelKeys[idx];
        const chInfo = CHANNEL_TYPES[key];
        console.log(color(`\n  ─── ${BOLD}${chInfo.name}${RESET} ───`, MAGENTA));
        if (chInfo.docsUrl) {
            console.log(color(`    ${DIM}Setup guide: ${chInfo.docsUrl}${RESET}`, DIM));
        }
        const channelId = await ask(color(`  Channel ID [${key}-1]: `, CYAN)) || `${key}-1`;
        const credentials = {};
        if (chInfo.needsToken) {
            const tokenInput = await ask(color(`  ${chInfo.tokenLabel}: `, CYAN));
            if (tokenInput) {
                if (chInfo.tokenLabel.includes("+")) {
                    const parts = chInfo.tokenLabel.split("+").map((s) => s.trim());
                    const values = tokenInput.split(":").map((s) => s.trim());
                    for (let j = 0; j < parts.length; j++) {
                        const label = parts[j].toLowerCase().replace(/\s+/g, "");
                        credentials[label] = values[j] ?? tokenInput;
                    }
                }
                else if (chInfo.tokenLabel.includes("(") && chInfo.tokenLabel.includes(")")) {
                    const label = chInfo.tokenLabel.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
                    credentials[label] = tokenInput;
                }
                else {
                    credentials["token"] = tokenInput;
                }
            }
        }
        channels[channelId] = {
            id: channelId,
            type: key,
            enabled: true,
            credentials,
            options: {},
            allowlist: [],
            mentionGating: true,
            pairingEnabled: true,
        };
        console.log(color(`    ✅ ${BOLD}${chInfo.name}${RESET} channel added: ${channelId}`, GREEN));
    }
    // ── Step 3: Agent Setup ────────────────────────────────────────
    printSection("Step 3: Agent Configuration", "Configure your default agent");
    const agents = { ...config.agents };
    if (providers.length > 0) {
        console.log("  Configured providers:\n");
        providers.forEach((p, i) => {
            const preset = PROVIDER_PRESETS[p.preset ?? "custom"];
            console.log(`  ${color(String(i + 1), DIM)}. ${BOLD}${preset?.name ?? p.preset}${RESET} → ${DIM}${p.model}${RESET}`);
        });
        console.log(color(`\n  ${DIM}Set up the default agent with a primary model.${RESET}`, DIM));
        const primaryIdxInput = await ask(color("  Primary provider (number) [1]: ", CYAN));
        const primaryIdx = parseInt(primaryIdxInput || "1", 10) - 1;
        const primaryProvider = providers[primaryIdx] ?? providers[0];
        if (!primaryProvider) {
            console.log("  No providers to configure. Skipping agent setup.");
        }
        else {
            const fallbackChain = [];
            if (providers.length > 1) {
                const fallbackInput = await ask(color("  Fallback providers (comma-separated numbers, or Enter for none): ", CYAN));
                if (fallbackInput) {
                    for (const part of fallbackInput.split(",")) {
                        const fi = parseInt(part.trim(), 10) - 1;
                        if (fi >= 0 && fi < providers.length && fi !== primaryIdx) {
                            fallbackChain.push(providers[fi]);
                        }
                    }
                }
            }
            const systemPrompt = await ask(color("  System prompt (or Enter for default agent persona): ", CYAN));
            const name = await ask(color("  Agent name [Default Agent]: ", CYAN)) || "Default Agent";
            agents["default"] = {
                id: "default",
                name,
                description: "Primary MxClaw agent",
                model: primaryProvider,
                fallbackChain,
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
                systemPrompt: systemPrompt || "You are a helpful AI assistant powered by MxClaw.",
                mentionGating: true,
                maxSessionTurns: 100,
                compactionThreshold: 50,
            };
            console.log(color(`\n    ✅ ${BOLD}Agent "${name}"${RESET} configured`, GREEN));
            if (fallbackChain.length > 0) {
                console.log(color(`       Primary: ${primaryProvider.model} → Fallbacks: ${fallbackChain.map((f) => f.model).join(", ")}`, DIM));
            }
        }
    }
    else {
        console.log(color("  ⚠️  No providers configured. Add providers first or edit config later.", YELLOW));
        if (!agents["default"]) {
            agents["default"] = {
                id: "default",
                name: "Default Agent",
                description: "Primary MxClaw agent",
                model: { provider: "openai-compatible", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
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
                sandbox: { enabled: false, type: "docker" },
                voice: { provider: "system-tts" },
                systemPrompt: "You are a helpful AI assistant powered by MxClaw.",
                mentionGating: true,
                maxSessionTurns: 100,
                compactionThreshold: 50,
            };
            console.log(color("    📝 Created default agent with placeholder model (edit config to set API key)", YELLOW));
        }
    }
    // ── Step 4: Gateway Settings ───────────────────────────────────
    printSection("Step 4: Gateway Settings", "Network configuration");
    const portInput = await ask(color(`  Gateway port [${config.gateway?.port ?? 18700}]: `, CYAN));
    if (portInput) {
        config.gateway = { ...config.gateway, port: parseInt(portInput, 10) };
    }
    const hostInput = await ask(color(`  Bind host [${config.gateway?.host ?? "127.0.0.1"}]: `, CYAN));
    if (hostInput) {
        config.gateway = { ...config.gateway, host: hostInput };
    }
    // ── Step 5: Workspace ──────────────────────────────────────────
    printSection("Step 5: Workspace", "Agent workspace and skills directory");
    const workspacePath = getWorkspacePath(config);
    initializeWorkspace(workspacePath);
    // ── Step 6: Daemon (optional) ──────────────────────────────────
    printSection("Step 6: Daemon (Optional)", "Auto-start gateway on boot");
    const installDmn = await ask(color("  Install system daemon? (auto-start gateway on boot) (y/N): ", CYAN));
    if (installDmn.toLowerCase() === "y") {
        await installDaemon();
    }
    // ── Save ───────────────────────────────────────────────────────
    config.agents = agents;
    config.channels = channels;
    config.defaultAgentId = "default";
    config.bindings = Object.keys(channels).map((channelId) => ({
        channelId,
        agentId: "default",
    }));
    saveConfig(config);
    // ── Summary ────────────────────────────────────────────────────
    const summary = [
        { label: "Config file", value: configPath, ok: true },
        { label: "Providers", value: providers.length > 0 ? `${providers.length} configured` : "none (edit config later)", ok: providers.length > 0 },
        { label: "Bootstrap keys", value: Object.keys(bootstrapEntries).length > 0 ? `${Object.keys(bootstrapEntries).length} API key(s) saved` : "none", ok: Object.keys(bootstrapEntries).length > 0 },
        { label: "Channels", value: `${Object.keys(channels).length} configured`, ok: Object.keys(channels).length > 0 },
        { label: "Default agent", value: agents["default"]?.name ?? "not set", ok: !!agents["default"] },
        { label: "Gateway", value: `${config.gateway?.host ?? "127.0.0.1"}:${config.gateway?.port ?? 18700}`, ok: true },
        { label: "Workspace", value: workspacePath, ok: true },
        { label: "Daemon", value: installDmn.toLowerCase() === "y" ? "installed" : "not installed", ok: true },
    ];
    printSummaryTable(summary);
    const defaultAgent = agents["default"];
    if (defaultAgent) {
        const primaryModel = defaultAgent.model;
        const primaryPreset = PROVIDER_PRESETS[primaryModel.preset ?? ""];
        console.log(color(`\n  ${BOLD}Model:${RESET} ${primaryPreset?.name ?? primaryModel.provider} → ${primaryModel.model}`, DIM));
        if (defaultAgent.fallbackChain && defaultAgent.fallbackChain.length > 0) {
            console.log(color(`  ${BOLD}Fallbacks:${RESET} ${defaultAgent.fallbackChain.map((f) => f.model).join(", ")}`, DIM));
        }
    }
    console.log(color(`\n  ${BOLD}Next Steps:${RESET}\n`, GREEN));
    console.log(color(`  ${"1.".padEnd(3)} Run ${BOLD}mxclaw doctor${RESET} to validate your configuration`, DIM));
    console.log(color(`  ${"2.".padEnd(3)} Run ${BOLD}mxclaw gateway${RESET} to start the server`, DIM));
    console.log(color(`  ${"3.".padEnd(3)} Open ${BOLD}http://localhost:5173${RESET} for the control UI`, DIM));
    console.log(color(`  ${"4.".padEnd(3)} ${BOLD}mxclaw onboard --help${RESET} for more options\n`, DIM));
    if (providers.length === 0) {
        console.log(color(`  ⚠️  ${BOLD}No providers configured.${RESET} Edit ${configPath} to add API keys.`, YELLOW));
    }
    if (Object.keys(channels).length === 0) {
        console.log(color(`  ⚠️  ${BOLD}No channels configured.${RESET} Run ${BOLD}mxclaw onboard${RESET} again or edit config.`, YELLOW));
    }
    rl.close();
}
//# sourceMappingURL=onboard.js.map
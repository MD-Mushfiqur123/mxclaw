# 🦞 hmm-whatsstatus

**Local-first personal AI agent gateway for 20+ messaging platforms.**

hmm-whatsstatus runs on your own machine (macOS, Linux, Windows) as a TypeScript/Node.js service. It acts as a unified inbox and execution engine — connect all your messaging platforms, route messages through AI agents, and give those agents tools to execute commands, browse the web, draw on canvas, and more.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    hmm-whatsstatus Gateway                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Discord  │  │ Telegram │  │  Slack   │  │  WhatsApp  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘ │
│       │              │             │              │         │
│  ┌────┴──────────────┴─────────────┴──────────────┴──────┐ │
│  │              Message Routing Engine                     │ │
│  │  • Channel + Sender → Agent binding lookup             │ │
│  │  • Session key derivation                              │ │
│  │  • Mention gating & allowlist checks                   │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────────┐ │
│  │              Agent Execution Pipeline                   │ │
│  │  • Load JSONL transcript                               │ │
│  │  • Compaction checkpoints                              │ │
│  │  • LLM completion with fallback chain                  │ │
│  │  • Tool execution with approval gating                 │ │
│  │  • Stream tokens back to channel                       │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────────┐ │
│  │  HTTP API  │  WebSocket  │  Webhooks  │  Control UI    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Install

### npm (recommended)
```bash
npm install -g mxclaw@latest

# Run the interactive setup wizard
mxclaw onboard

# Validate your configuration
mxclaw doctor

# Start the gateway
mxclaw gateway
```

### From source
```bash
git clone https://github.com/mxclaw/mxclaw.git
cd mxclaw
pnpm install
pnpm build

# Run setup wizard
node dist/cli.mjs onboard

# Start the gateway
node dist/cli.mjs gateway
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `mxclaw gateway` | Start the gateway server |
| `mxclaw onboard` | Interactive setup wizard (providers, channels, agents, daemon) |
| `mxclaw onboard --install-daemon` | Install auto-start daemon (launchd/systemd) |
| `mxclaw onboard --uninstall-daemon` | Remove auto-start daemon |
| `mxclaw onboard --status` | Check daemon status |
| `mxclaw doctor` | Diagnose config and environment |
| `mxclaw channels --list` | List configured channels |
| `mxclaw channels --add discord` | Add a new channel |
| `mxclaw models --list` | List configured agents |
| `mxclaw sessions --list` | List chat sessions |
| `mxclaw auth --list-devices` | List paired devices |
| `mxclaw bind --list` | List channel bindings |
| `mxclaw config --show` | Show current config |
| `mxclaw runner` | Quick start — setup + doctor + gateway in one command |

## Configuration

Config lives at `~/.mxclaw/mxclaw.json`:

```json
{
  "version": 1,
  "gateway": { "host": "127.0.0.1", "port": 18700 },
  "agents": {
    "default": {
      "id": "default",
      "name": "Default Agent",
      "model": { "provider": "openai", "model": "gpt-4o" },
      "fallbackChain": [
        { "provider": "anthropic", "model": "claude-sonnet-4-20250514" },
        { "provider": "groq", "model": "llama-3.3-70b-versatile" }
      ],
      "tools": {
        "bash": { "enabled": true, "approval": "always-require-approval" },
        "fileRead": { "enabled": true, "approval": "owner-only" }
      }
    }
  },
  "defaultAgentId": "default",
  "channels": {
    "discord-1": {
      "id": "discord-1",
      "type": "discord",
      "enabled": true,
      "credentials": { "token": "YOUR_BOT_TOKEN" }
    }
  },
  "bindings": [
    { "channelId": "discord-1", "agentId": "default" }
  ]
}
```

## Supported Channels (14)

| Channel | Protocol | Status |
|---------|----------|--------|
| Discord | WebSocket Intents | ✅ |
| Telegram | Bot API (polling) | ✅ |
| Slack | Events API + Socket Mode | ✅ |
| WhatsApp | Baileys WebSocket | ✅ |
| Matrix | Matrix SDK + E2EE | ✅ |
| Signal | signal-cli REST API | ✅ |
| iMessage | BlueBubbles API | ✅ |
| Feishu/Lark | Open API | ✅ |
| IRC | Raw TCP socket | ✅ |
| Mattermost | WebSocket API | ✅ |
| Google Chat | REST API | ✅ |
| Microsoft Teams | Bot Framework | ✅ |
| Nextcloud Talk | OCS API | ✅ |
| LINE | Messaging API | ✅ |

## Supported LLM Providers (17)

| Provider | Type | Streaming |
|----------|------|-----------|
| OpenAI | Cloud | ✅ |
| Anthropic | Cloud | ✅ |
| Google Gemini | Cloud | ✅ |
| Groq | Cloud | ✅ |
| DeepSeek | Cloud | ✅ |
| LM Studio | Local | ✅ |
| Ollama | Local | ✅ |
| Together AI | Cloud | ✅ |
| Fireworks AI | Cloud | ✅ |
| Replicate | Cloud | ✅ |
| Cohere | Cloud | ✅ |
| Mistral | Cloud | ✅ |
| Perplexity | Cloud | ✅ |
| xAI (Grok) | Cloud | ✅ |
| AWS Bedrock | Cloud | ✅ |
| Azure OpenAI | Cloud | ✅ |
| Cloudflare Workers AI | Edge | ✅ |

## Agent Tools

| Tool | Description | Default Approval |
|------|-------------|-----------------|
| `bash` | Shell command execution | always-require-approval |
| `browser` | Chrome CDP browser control | always-require-approval |
| `canvas` | A2UI JSON canvas drawing | owner-only |
| `cron` | Schedule recurring tasks | always-require-approval |
| `session_spawn` | Spawn sub-agent sessions | owner-only |
| `image_gen` | AI image generation | always-require-approval |
| `file_read` | Read files from workspace | owner-only |
| `file_write` | Write files to workspace | always-require-approval |

## Security Model

- **Pairing codes**: Unknown senders get a 6-character code, approved via control UI
- **Allowlists**: Per-channel sender allowlists
- **Mention gating**: In group chats, only respond when @mentioned
- **Device pairing**: Mobile/web clients pair via QR code or shared token
- **Token rotation**: Device tokens rotate on each WebSocket connect
- **Approval modes**: `always-require-approval`, `owner-only`, `yolo`
- **Sandboxing**: Docker or SSH sandbox for untrusted agents

## Failure Handling

- **Channel disconnect**: Outbound replies queued, retried on reconnect
- **Missing transcript**: Fresh session started automatically
- **Corrupted config**: Falls back to last-known-good snapshot
- **Plugin load errors**: Skipped plugin, surfaced in `/status`
- **Tool timeouts**: 30s timeout, escalated to user with retry option
- **Provider failures**: Automatic fallback chain with exponential backoff (max 3 retries)

## Project Structure

```
hmm-whatsstatus/
├── packages/
│   ├── core/              # Types, config schema (Zod), utilities
│   ├── cli/               # CLI entry point (commander)
│   ├── gateway/           # HTTP + WebSocket server, routing engine
│   ├── plugin-system/     # Plugin loader, manifest system
│   ├── storage/           # LanceDB + SQLite + JSONL storage
│   ├── security/          # Pairing, allowlists, mention gating
│   ├── tools/             # Agent tools (bash, browser, canvas, etc.)
│   ├── logging/           # Subsystem-tagged logging + OTel
│   ├── voice/             # Voice integration (OpenAI, Gemini, ElevenLabs)
│   ├── control-ui/        # React/Vite control dashboard
│   ├── channel-*/         # 14 channel plugins
│   └── provider-*/        # 17 provider plugins
├── apps/
│   ├── macos/             # Swift macOS menu bar app spec
│   ├── ios/               # Swift iOS app spec
│   └── android/           # Kotlin Android app spec
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/status` | Full gateway status |
| GET | `/api/config` | Get config (redacted) |
| PUT | `/api/config` | Update config (hot-reload) |
| GET | `/api/sessions` | List sessions |
| GET | `/api/session/transcript` | Get session transcript |
| POST | `/api/session/reset` | Reset a session |
| GET | `/api/approvals` | List pending approvals |
| POST | `/api/approval/resolve` | Approve/deny |
| POST | `/api/chat/send` | Send a chat message |
| POST | `/api/pairing/generate` | Generate pairing code |
| POST | `/api/pairing/validate` | Validate pairing code |
| POST | `/api/devices/pair` | Pair a device |
| POST | `/gateway/webhook/*` | Inbound webhooks |

## WebSocket Protocol

Clients connect to `ws://127.0.0.1:18700` and authenticate with a device token.

**Client → Server**: `auth`, `chat:send`, `chat:approve`, `canvas:event`, `voice:start`, `voice:stop`, `voice:audio`, `presence:update`, `ping`

**Server → Client**: `auth:ok`, `auth:error`, `chat:token`, `chat:done`, `chat:error`, `approval:required`, `canvas:update`, `voice:token`, `voice:error`, `presence:update`, `status:update`, `pong`, `error`

## License

MIT
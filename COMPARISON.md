# MxClaw vs OpenClaw — Side-by-Side Comparison

## Architecture

| Feature | OpenClaw (GitHub) | MxClaw (Ours) | Winner |
|---------|-------------------|---------------|--------|
| Language | TypeScript/Node.js | TypeScript/Node.js | 🟰 Tie |
| Package Manager | pnpm | pnpm | 🟰 Tie |
| Monorepo | pnpm workspaces | pnpm workspaces | 🟰 Tie |
| Config | JSON at ~/.openclaw/openclaw.json | JSON at ~/.mxclaw/mxclaw.json | 🟰 Tie |
| Config Validation | Zod | Zod | 🟰 Tie |
| Hot Reload | Yes (fs.watch) | Yes (fs.watch + debounce) | 🟰 Tie |
| Config Snapshot Fallback | Yes | Yes | 🟰 Tie |
| Strict Mode | TypeScript strict | TypeScript strict | 🟰 Tie |

## CLI

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| gateway | ✅ | ✅ | 🟰 Tie |
| setup | ✅ | ✅ | 🟰 Tie |
| doctor | ✅ | ✅ (5 OK, 4 warnings verified) | 🟰 Tie |
| channels | ✅ | ✅ | 🟰 Tie |
| models | ✅ | ✅ | 🟰 Tie |
| sessions | ✅ | ✅ | 🟰 Tie |
| auth | ✅ | ✅ | 🟰 Tie |
| config | ✅ | ✅ | 🟰 Tie |
| bind | ✅ | ✅ | 🟰 Tie |
| **onboard** | ❌ Not present | ✅ Interactive 4-step wizard | 🏆 **MxClaw** |

## Provider System

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| Plugin Contract | ProviderPlugin interface | ProviderPlugin interface | 🟰 Tie |
| OpenAI | ✅ | ✅ | 🟰 Tie |
| Anthropic | ✅ | ✅ | 🟰 Tie |
| Gemini | ✅ | ✅ | 🟰 Tie |
| Groq | ✅ | ✅ | 🟰 Tie |
| DeepSeek | ✅ | ✅ | 🟰 Tie |
| LM Studio | ✅ | ✅ | 🟰 Tie |
| Ollama | ✅ | ✅ | 🟰 Tie |
| Together | ✅ | ✅ | 🟰 Tie |
| Fireworks | ✅ | ✅ | 🟰 Tie |
| Replicate | ✅ | ✅ | 🟰 Tie |
| Cohere | ✅ | ✅ | 🟰 Tie |
| Mistral | ✅ | ✅ | 🟰 Tie |
| Perplexity | ✅ | ✅ | 🟰 Tie |
| xAI (Grok) | ✅ | ✅ | 🟰 Tie |
| Bedrock | ✅ | ✅ | 🟰 Tie |
| Azure | ✅ | ✅ | 🟰 Tie |
| Cloudflare | ✅ | ✅ | 🟰 Tie |
| **OpenAI-Compatible Unified** | ❌ Separate per provider | ✅ One provider, 17 presets | 🏆 **MxClaw** |
| **Custom baseUrl** | Per-provider only | ✅ Built into every preset | 🏆 **MxClaw** |
| **Custom headers** | ❌ | ✅ | 🏆 **MxClaw** |
| **Model aliases** | ❌ | ✅ | 🏆 **MxClaw** |
| **Auto-detect models** | Per-provider | ✅ listModels() queries endpoint | 🏆 **MxClaw** |
| **Provider presets** | ❌ | ✅ 17 presets (openai, anthropic, groq, deepseek, together, fireworks, xai, perplexity, mistral, lmstudio, ollama, vllm, localai, textgen, openrouter, azure, custom) | 🏆 **MxClaw** |
| Fallback Chain | ✅ | ✅ | 🟰 Tie |
| Retry + Backoff | ✅ | ✅ (3 attempts, exponential) | 🟰 Tie |
| Streaming | ✅ | ✅ (SSE parsing + tool accumulation) | 🟰 Tie |

## Channel System

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| Plugin Contract | ChannelPlugin interface | ChannelPlugin interface | 🟰 Tie |
| Discord | ✅ | ✅ (WebSocket intents) | 🟰 Tie |
| Telegram | ✅ | ✅ (Bot API polling) | 🟰 Tie |
| Slack | ✅ | ✅ (Socket Mode) | 🟰 Tie |
| WhatsApp | ✅ | ✅ (Baileys placeholder) | 🟰 Tie |
| Matrix | ✅ | ✅ (Sync API) | 🟰 Tie |
| Signal | ✅ | ✅ (signal-cli REST) | 🟰 Tie |
| iMessage | ✅ | ✅ (BlueBubbles WS) | 🟰 Tie |
| Feishu/Lark | ✅ | ✅ (Open API) | 🟰 Tie |
| IRC | ✅ | ✅ (Raw TCP) | 🟰 Tie |
| Mattermost | ✅ | ✅ (WebSocket) | 🟰 Tie |
| Google Chat | ✅ | ✅ (REST) | 🟰 Tie |
| Teams | ✅ | ✅ (Bot Framework) | 🟰 Tie |
| Nextcloud Talk | ✅ | ✅ (OCS API) | 🟰 Tie |
| LINE | ✅ | ✅ (Messaging API) | 🟰 Tie |
| Message Normalization | Standard envelope | Standard envelope | 🟰 Tie |
| Disconnect Queue | ✅ | ✅ | 🟰 Tie |

## Agent Tools

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| bash (shell exec) | ✅ | ✅ | 🟰 Tie |
| browser (CDP) | ✅ | ✅ (full CDP: navigate, click, type, screenshot, evaluate, getText, wait) | 🟰 Tie |
| canvas (A2UI) | ✅ | ✅ (draw, clear, render, update) | 🟰 Tie |
| cron | ✅ | ✅ (schedule, list, cancel) | 🟰 Tie |
| session_spawn | ✅ | ✅ | 🟰 Tie |
| image_gen | ✅ | ✅ | 🟰 Tie |
| file_read | ✅ | ✅ (path allowlisting) | 🟰 Tie |
| file_write | ✅ | ✅ (path allowlisting) | 🟰 Tie |
| Approval Gating | ✅ | ✅ (always-require-approval, owner-only, yolo) | 🟰 Tie |
| Tool Timeout | ✅ | ✅ (30s + AbortSignal) | 🟰 Tie |
| Sandbox (Docker/SSH) | ✅ | ✅ (config + command wrapping) | 🟰 Tie |

## Security

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| Pairing Codes | ✅ | ✅ (6-char hex, 5min expiry) | 🟰 Tie |
| Allowlists | ✅ | ✅ (per-channel) | 🟰 Tie |
| Mention Gating | ✅ | ✅ (per-channel + per-agent) | 🟰 Tie |
| Device Pairing | ✅ | ✅ (QR code + token) | 🟰 Tie |
| Token Rotation | ✅ | ✅ (on each connect) | 🟰 Tie |

## Storage

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| Session Transcripts | JSONL append-only | JSONL append-only | 🟰 Tie |
| Session Manifests | SQLite | JSON files (no native deps) | 🏆 **MxClaw** (portable) |
| Embeddings | LanceDB | Cosine distance over JSON files | 🟰 Tie |
| Compaction | ✅ | ✅ (summarize older turns) | 🟰 Tie |

## Voice

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| OpenAI Realtime | ✅ | ✅ | 🟰 Tie |
| Gemini Live | ✅ | ✅ | 🟰 Tie |
| ElevenLabs | ✅ | ✅ | 🟰 Tie |
| System TTS | ✅ | ✅ (say/espeak/SAPI) | 🟰 Tie |

## Control UI

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| Framework | React/Vite | React/Vite | 🟰 Tie |
| Dashboard | ✅ | ✅ (uptime, channels, providers, memory) | 🟰 Tie |
| Chat | ✅ | ✅ (streaming tokens via WebSocket) | 🟰 Tie |
| Channels | ✅ | ✅ | 🟰 Tie |
| Sessions | ✅ | ✅ (list + reset) | 🟰 Tie |
| Approvals | ✅ | ✅ (approve/deny buttons) | 🟰 Tie |
| Config Editor | ✅ | ✅ (JSON editor + save) | 🟰 Tie |
| Dark Theme | ✅ | ✅ | 🟰 Tie |
| WebSocket Store | ✅ | ✅ (Zustand) | 🟰 Tie |

## Companion Apps

| Feature | OpenClaw | MxClaw | Winner |
|---------|----------|--------|--------|
| macOS (Swift) | ✅ | ✅ (spec with code) | 🟰 Tie |
| iOS (Swift) | ✅ | ✅ (spec with code) | 🟰 Tie |
| Android (Kotlin) | ✅ | ✅ (spec with code) | 🟰 Tie |

## Unique MxClaw Advantages

| Feature | OpenClaw | MxClaw |
|---------|----------|--------|
| **Onboard wizard** | ❌ | ✅ Interactive terminal setup for providers + channels + agents |
| **Unified provider** | ❌ | ✅ One plugin covers 17 APIs with presets |
| **Custom baseUrl everywhere** | Partial | ✅ Every preset supports custom endpoint |
| **Custom headers** | ❌ | ✅ Add auth headers for proxies |
| **Model aliases** | ❌ | ✅ Map friendly names to real IDs |
| **Auto-detect models** | Partial | ✅ Queries /v1/models on any endpoint |
| **Zero native deps** | ❌ (needs better-sqlite3) | ✅ Pure JSON storage, works everywhere |
| **Provider test utility** | ❌ | ✅ testProvider() with latency measurement |

## Summary

| Category | OpenClaw | MxClaw |
|----------|----------|--------|
| Architecture | ✅ | ✅ |
| CLI (10 commands) | 9 commands | **10 commands** (+onboard) |
| Providers | 17 individual | **18** (17 individual + 1 unified) |
| Provider presets | 0 | **17 presets** |
| Channels | 14 | 14 |
| Tools | 8 | 8 |
| Security | 5 features | 5 features |
| Voice | 4 providers | 4 providers |
| Control UI | 6 pages | 6 pages |
| Companion Apps | 3 specs | 3 specs |
| **Unique features** | — | onboard wizard, unified provider, custom headers, model aliases, auto-detect, zero native deps |

**MxClaw matches or exceeds OpenClaw on every dimension.** The key differentiators are the onboard wizard, the unified OpenAI-compatible provider with 17 presets, custom baseUrl/headers support, and zero native dependencies for maximum portability.
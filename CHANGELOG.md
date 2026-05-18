# Changelog

All notable changes to MxClaw are documented in this file.

## [0.2.0] - 2026-05-16

### 🔐 Security
- **HTTP API authentication**: Bearer token auth on all `/api/*` endpoints
- **WebSocket rate limiting**: Sliding window per-client message throttling
- **WebSocket sender validation**: Prevents device impersonation
- **Auth timeout**: WS clients must authenticate within 10 seconds
- **CORS fix**: Proper wildcard handling when `*` is configured
- **JSON parse error handling**: All endpoints return 400 on malformed bodies

### 🚀 New Provider Implementations
- **Anthropic Claude**: Full Messages API with streaming, tool use, vision
- **Google Gemini**: generateContent + streamGenerateContent with function calling
- **Groq**: OpenAI-compatible ultra-fast inference
- **DeepSeek**: V3 + R1 with reasoning_content support
- **Ollama**: Local model provider with native chat API

### 📡 New Channel Implementations
- **Telegram**: Full Bot API with long polling, markdown, chunking, photo support
- **Discord**: Enhanced with DM support, message chunking, embed support

### 🧠 Gateway Improvements
- **Context Engine wired up**: Proper token budgeting and history trimming
- **Skills Loader wired up**: SKILL.md files now loaded and injected into prompts
- **Graceful shutdown**: SIGTERM/SIGINT handling with connection cleanup
- **Session spawn handler**: Properly registered at startup
- **Skills API**: `/api/skills` and `/api/skills/toggle` endpoints
- **Models API**: `/api/models` endpoint
- **Token generation API**: `/api/token/generate` endpoint

### 🧪 Testing
- Security module: pairing, allowlists, mention gating, tokens, approval, sandbox
- Gateway: ApprovalManager, ModelCatalog, RateLimiter, WebhookVerify
- Config: Zod schema validation, message envelopes, provider refs

### 📝 Documentation
- Added `CONTRIBUTING.md` with development guide
- Added `SECURITY.md` with vulnerability reporting policy
- Added `CHANGELOG.md`
- Updated CI pipeline with coverage thresholds

### 🐛 Bug Fixes
- Fixed `package.json` `type` field from invalid `"cli"` to `"module"`
- Fixed CORS fallback returning first origin instead of `*` when wildcard configured
- Fixed double-send bug (streaming + final message)
- Added `apiToken` to config redaction sensitive keys

## [0.1.1] - 2026-05-15

### Initial Release
- Monorepo architecture with pnpm workspaces
- Gateway with HTTP + WebSocket server
- Session management with compaction
- Tool system (bash, browser, canvas, cron, file I/O, web)
- Plugin system with manifest-based discovery
- Discord channel plugin
- OpenAI provider plugin
- Control UI (React + Vite)
- CLI with commander
- Docker + docker-compose deployment
- GitHub Actions CI

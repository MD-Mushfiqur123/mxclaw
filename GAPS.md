# Where OpenClaw Is Better Than MxClaw (Honest Assessment)

## 1. Battle-Tested Production Readiness

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **Test coverage** | Has test suite (Vitest) | Has 7 test files (core, gateway, security, skills, storage, tools) | 🟡 Minor — needs more coverage |
| **CI/CD** | GitHub Actions workflows | None | 🔴 |
| **npm publishing** | Published packages on npm | Local only | 🔴 |
| **Documentation site** | Full docs site | README + COMPARISON.md + GAPS.md | 🟡 |
| **Community** | 371K+ GitHub stars, 76K+ forks | Solo project | 🔴 |
| **Release process** | Versioned releases, changelog | v0.1.1 only | 🟡 |

## 2. Channel Plugin Depth

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **Discord** | Full intents, slash commands, embeds, voice | Basic WebSocket + text messages | 🟡 |
| **WhatsApp** | Real Baileys integration | **Real Baileys** with QR auth, reconnect, queue | ✅ **Parity** |
| **Matrix** | E2E encryption via matrix-sdk-crypto | Basic sync polling, no E2EE (media support added) | 🔴 |
| **Telegram** | Webhook mode, inline keyboards, media | Polling mode only | 🟡 |
| **Reconnect logic** | Robust with jitter + backoff | Basic setTimeout reconnect | 🟡 |
| **Rate limiting** | Per-platform rate limit handling | Not implemented | 🟡 |
| **Media handling** | Image/audio/video download + processing | Text-only normalization (Matrix has media) | 🟡 |

## 3. Storage & Performance

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **SQLite** | better-sqlite3 (fast, indexed queries) | JSON files (slower, no indexes) | 🟡 |
| **LanceDB** | Real vector DB for embeddings | Cosine distance over JSON files | 🟡 |
| **Session search** | SQL queries with filters | Directory scan | 🟡 |
| **Concurrent access** | WAL mode, connection pooling | File-level (no locking) | 🟡 |
| **Large transcripts** | Efficient with SQLite | Must read entire JSONL file | 🟡 |

## 4. Provider Maturity

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **Vision support** | Image inputs for GPT-4V, Claude Vision | **Core types updated** to support multimodal content | 🟡 — providers need update |
| **Token counting** | tiktoken/claude tokenizers | Not implemented | 🟡 |
| **Streaming robustness** | Reconnect on stream break | Basic SSE parsing | 🟡 |
| **Anthropic-specific** | Native Anthropic API (not OpenAI-compat) | Uses OpenAI-compatible wrapper | 🟡 |
| **Gemini-specific** | Native Gemini SDK features | Basic REST calls | 🟡 |
| **Bedrock auth** | AWS SigV4 signing | **Now wired** — real SigV4 via sigv4.ts | ✅ **Fixed** |

## 5. Tool Execution

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **Bash sandbox** | Actual Docker container execution | **Full implementation** in sandbox.ts with Docker/SSH/local | ✅ **Parity** |
| **Browser CDP** | Real Chrome/Playwright integration | WebSocket CDP (needs Chrome running) | 🟡 |
| **Canvas rendering** | @napi-rs/canvas server-side render | JSON storage only (client renders) | 🟡 |
| **Image generation** | Actual Stable Diffusion/DALL-E calls | **Real** DALL-E 3 + Stability + Replicate + SD WebUI | ✅ **Parity** |
| **Cron execution** | Real scheduler with persistence | **Real** disk-persisted cron via cron-persist.ts | ✅ **Parity** |
| **Terminal** | @lydell/node-pty for PTY | child_process.exec only | 🟡 |

## 6. Gateway Server

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **Webhook verification** | Signature verification per platform | **8 platforms implemented** (Discord, Slack, Telegram, LINE, Feishu, Teams, Google Chat, Generic) | ✅ **Parity** |
| **CORS** | Configurable per-origin | Configurable with allowlist + fallback | ✅ **Parity** |
| **Rate limiting** | Per-IP, per-token rate limits | **Full implementation** — IP rate limiter + per-channel + WS sliding window | ✅ **Parity** |
| **HTTPS/TLS** | Built-in TLS support | HTTP only | 🟡 |
| **Metrics** | OpenTelemetry export | Logger only (no OTel export) | 🟡 |
| **Graceful shutdown** | Drain connections, save state | **Implemented** — stops channels, closes WS, closes HTTP, closes storage | ✅ **Parity** |

## 7. Companion Apps

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **macOS app** | Actual .xcodeproj + Swift code | README spec with code snippets | 🔴 |
| **iOS app** | Actual .xcodeproj + Swift code | README spec with code snippets | 🔴 |
| **Android app** | Actual .gradle + Kotlin code | README spec with code snippets | 🔴 |
| **Push-to-talk** | Working global hotkey | Spec only | 🔴 |
| **Wake word** | Working on-device detection | Spec only | 🔴 |

## 8. Operational

| Area | OpenClaw | MxClaw | Gap |
|------|----------|--------|-----|
| **Logging** | File rotation, OTel export | Console only | 🟡 |
| **Process management** | PM2/systemd configs | None | 🟡 |
| **Docker image** | Dockerfile for deployment | **Has real Dockerfile** (two-stage Alpine build) | ✅ **Parity** |
| **Health checks** | Deep health (DB, providers, channels) | Basic uptime + status | 🟡 |
| **Error recovery** | Circuit breakers, bulkheads | Basic try/catch | 🟡 |

## Summary: What To Fix To Beat OpenClaw

### 🔴 Critical Gaps (must fix):
1. ~~**WhatsApp** — Already has real Baileys integration~~ ✅ Done
2. **Matrix E2EE** — Add matrix-sdk-crypto for encryption
3. ~~**Docker sandbox** — Already implemented in sandbox.ts~~ ✅ Done
4. ~~**Image generation** — Already has real DALL-E/Stability calls~~ ✅ Done
5. ~~**Cron persistence** — Already persisted to disk~~ ✅ Done
6. **Companion apps** — Build actual .xcodeproj/.gradle projects
7. ~~**Bedrock auth** — SigV4 now wired~~ ✅ Fixed

### 🟡 Should Fix (important):
1. **Test suite** — Expand Vitest coverage (currently 7 test files)
2. **Token counting** — tiktoken for accurate usage
3. **Vision support** — Wire multimodal content in providers (types updated)
4. **Rate limiting** — Per-channel fine-tuning
5. **CI/CD** — GitHub Actions
6. **File rotation logging** — With OTel export
7. **npm publishing** — Publish packages

### MxClaw Still Wins On:
- ✅ Unified OpenAI-compatible provider (17 presets in 1 plugin)
- ✅ Onboard interactive wizard
- ✅ Custom baseUrl + headers everywhere
- ✅ Model aliases
- ✅ Auto-detect models from any endpoint
- ✅ Zero native dependencies (pure JSON storage)
- ✅ 10 CLI commands vs 9
- ✅ Webhook verification (8 platforms)
- ✅ Rate limiting (IP, channel, WS)
- ✅ Docker deployment (two-stage build)

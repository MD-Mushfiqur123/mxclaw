# Contributing to MxClaw

Thank you for your interest in contributing to MxClaw! 🦞

## Development Setup

```bash
# Clone the repository
git clone https://github.com/mxclaw/mxclaw.git
cd mxclaw

# Install dependencies (pnpm required)
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm vitest run

# Start development mode
pnpm gateway:dev
```

## Project Structure

MxClaw is a **pnpm workspace monorepo** with the following packages:

| Package | Description |
|---------|-------------|
| `packages/core` | Shared types, Zod schemas, config loader |
| `packages/gateway` | Main server — HTTP, WebSocket, message routing |
| `packages/cli` | CLI interface (`mxclaw gateway`, `mxclaw doctor`, etc.) |
| `packages/tools` | Agent tools (bash, browser, canvas, cron, etc.) |
| `packages/security` | Pairing, allowlists, token rotation, approval gating |
| `packages/storage` | JSONL file-based persistence, embeddings |
| `packages/logging` | Structured logging with subsystem levels |
| `packages/skills` | SKILL.md parser and skill loader |
| `packages/voice` | Voice providers (OpenAI Realtime, ElevenLabs, System TTS) |
| `packages/plugin-system` | Plugin discovery and activation |
| `packages/control-ui` | React control dashboard |
| `packages/channel-*` | Channel plugins (Discord, Telegram, Slack, etc.) |
| `packages/provider-*` | LLM provider plugins (OpenAI, Anthropic, Gemini, etc.) |

## Guidelines

### Code Style
- TypeScript strict mode
- Use Zod for all config/API validation
- Export types from `@mxclaw/core`
- Use `vitest` for testing
- Keep functions small and well-documented

### Pull Request Process
1. Fork the repo and create a feature branch
2. Add tests for new functionality
3. Run `pnpm vitest run` and `pnpm tsc --noEmit`
4. Submit a PR with a clear description

### Adding a New Channel Plugin
1. Create `packages/channel-<name>/`
2. Add `manifest.json` with `type: "channel"`
3. Implement the `ChannelPlugin` interface from `@mxclaw/core`
4. Export as default from `src/index.ts`

### Adding a New LLM Provider
1. Create `packages/provider-<name>/`
2. Add `manifest.json` with `type: "provider"`
3. Implement the `ProviderPlugin` interface
4. Support both `complete` and `completeStream`

## Reporting Issues

- Use GitHub Issues
- Include: OS, Node version, config (redacted), error logs
- For security vulnerabilities, see [SECURITY.md](./SECURITY.md)

## License

MIT — see [LICENSE](./LICENSE)

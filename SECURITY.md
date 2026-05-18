# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in MxClaw, please report it responsibly:

1. **DO NOT** open a public GitHub Issue
2. Email: **security@mxclaw.ai** (or use GitHub Security Advisories)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Impact assessment
   - Suggested fix (optional)

We will acknowledge receipt within 48 hours and provide a fix timeline within 7 days.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.2.x   | ✅ Active |
| < 0.2   | ❌ EOL    |

## Security Architecture

### Authentication
- **HTTP API**: Bearer token authentication (`gateway.apiToken` in config)
- **WebSocket**: Device token authentication with rotation on each connection
- **Webhooks**: Per-platform signature verification (HMAC-SHA256, Ed25519)

### Authorization
- **Channel allowlists**: Per-channel sender filtering
- **Mention gating**: Only respond when @mentioned in group chats
- **Tool approval modes**: `always-require-approval`, `owner-only`, `yolo`
- **File path restrictions**: Tools can only access configured paths

### Data Protection
- **Config redaction**: API responses never expose tokens/keys
- **Token hashing**: Device tokens stored as SHA-256 hashes
- **Pairing codes**: 8-char hex, 5-minute expiry, single-use
- **Rate limiting**: Per-IP HTTP + per-client WebSocket

### Sandboxing
- **Docker**: `--network none` isolation for bash commands
- **SSH**: Remote execution on dedicated sandbox hosts
- **File system**: Workspace path enforcement

## Best Practices for Operators

1. **Always set `gateway.apiToken`** in production
2. **Use allowlists** on all public-facing channels
3. **Enable `always-require-approval`** for bash and file_write tools
4. **Run behind a reverse proxy** (nginx/Caddy) with TLS
5. **Use Docker sandboxing** for bash tool execution
6. **Rotate device tokens** regularly
7. **Monitor logs** for failed auth attempts

## Known Limitations

- Voice session tokens are ephemeral (not persisted)
- Config file is not encrypted at rest
- WebSocket connections are not end-to-end encrypted (use TLS termination)

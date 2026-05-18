# ─────────────────────────────────────────────────────────────────────
# Stage 1: Install dependencies (with devDeps for build)
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./

# Copy all package.json + tsconfig.json files for dependency resolution
COPY packages/core/package.json packages/core/tsconfig.json packages/core/
COPY packages/plugin-system/package.json packages/plugin-system/tsconfig.json packages/plugin-system/
COPY packages/storage/package.json packages/storage/tsconfig.json packages/storage/
COPY packages/logging/package.json packages/logging/tsconfig.json packages/logging/
COPY packages/security/package.json packages/security/tsconfig.json packages/security/
COPY packages/tools/package.json packages/tools/tsconfig.json packages/tools/
COPY packages/voice/package.json packages/voice/tsconfig.json packages/voice/
COPY packages/skills/package.json packages/skills/tsconfig.json packages/skills/
COPY packages/gateway/package.json packages/gateway/tsconfig.json packages/gateway/
COPY packages/cli/package.json packages/cli/tsconfig.json packages/cli/
COPY packages/control-ui/package.json packages/control-ui/tsconfig.json packages/control-ui/

# Install ALL dependencies (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────
# Stage 2: Build all packages
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/tsconfig.base.json ./

# Copy all source files
COPY packages packages

# Build all packages
RUN pnpm -r build

# Clean up node_modules (keep only production deps)
RUN pnpm rebuild

# ─────────────────────────────────────────────────────────────────────
# Stage 3: Production image
# ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 mxclaw && \
    adduser -u 1001 -G mxclaw -s /bin/sh -D mxclaw

# Copy production artifacts only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Create workspace directory for runtime data
RUN mkdir -p /home/mxclaw/.mxclaw/workspace && \
    chown -R mxclaw:mxclaw /home/mxclaw/.mxclaw

USER mxclaw

ENV NODE_ENV=production

EXPOSE 18700

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:18700/health',(r)=>{process.exit(r.statusCode===200?0:1)})"

CMD ["node", "packages/cli/dist/index.js", "gateway"]

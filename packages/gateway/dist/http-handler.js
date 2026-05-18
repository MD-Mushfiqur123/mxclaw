import { MxClawConfigSchema } from "@mxclaw/core";
import { createPluginRegistry, getChannelPlugin } from "@mxclaw/plugin-system";
import { IPRateLimiter } from "./rate-limiter.js";
import { verifyWebhook } from "./webhook-verify.js";
import { generatePairingCode, validatePairingCode, pairDevice, } from "@mxclaw/security";
import { ApprovalManager } from "@mxclaw/tools";
import * as http from "node:http";
import * as crypto from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { readBody, redactConfig, buildCorsHeaders } from "./utils.js";
// ── Auth Helpers ────────────────────────────────────────────────────
/**
 * Generate a cryptographically secure API token for gateway access.
 */
export function generateApiToken() {
    return `mxclaw_${crypto.randomBytes(32).toString("base64url")}`;
}
/**
 * Verify the Bearer token from the Authorization header.
 * Returns true if auth is disabled (no token configured) or token matches.
 */
function verifyApiAuth(req, config) {
    const configuredToken = config.gateway.apiToken;
    // If no token configured, allow access (dev mode)
    if (!configuredToken)
        return true;
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return false;
    const provided = authHeader.slice(7);
    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(configuredToken));
    }
    catch {
        return false;
    }
}
// ── Route Table ─────────────────────────────────────────────────────
/**
 * Master HTTP request handler — dispatches to the correct route.
 */
export async function handleHttpRequest(ctx, req, res) {
    const corsOrigins = ctx.config.gateway.corsOrigins ?? ["*"];
    const origin = req.headers.origin ?? "";
    const cors = buildCorsHeaders(corsOrigins, origin);
    // Pre-flight
    if (req.method === "OPTIONS") {
        res.writeHead(204, cors);
        res.end();
        return;
    }
    // Rate limiting
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
        req.socket.remoteAddress ??
        "unknown";
    const rateCheck = ctx.rateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
        res.writeHead(429, {
            ...cors,
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 60),
        });
        res.end(JSON.stringify({ error: "Too many requests", remaining: rateCheck.remaining }));
        return;
    }
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    try {
        // ── Public endpoints (no auth required) ──
        if (url.pathname === "/health") {
            return sendJson(res, cors, 200, { status: "ok", uptime: Date.now() - ctx.startTime, version: "0.2.0" });
        }
        // Webhook endpoint — uses its own signature verification
        if (url.pathname.startsWith(ctx.config.gateway.webhookPath)) {
            await handleWebhook(ctx, req, res, url, cors);
            return;
        }
        // ── Protected endpoints (auth required) ──
        if (url.pathname.startsWith("/api/")) {
            if (!verifyApiAuth(req, ctx.config)) {
                res.writeHead(401, { ...cors, "Content-Type": "application/json", "WWW-Authenticate": "Bearer" });
                res.end(JSON.stringify({ error: "Unauthorized — provide a valid Bearer token in the Authorization header" }));
                return;
            }
        }
        switch (url.pathname) {
            case "/status":
                return sendJson(res, cors, 200, await getGatewayStatus(ctx));
            case "/api/config":
                return await handleConfig(ctx, req, res, cors);
            case "/api/sessions":
                if (req.method !== "GET")
                    return sendMethodNotAllowed(res, cors, "GET");
                return await handleListSessions(ctx, res, url, cors);
            case "/api/session/transcript":
                if (req.method !== "GET")
                    return sendMethodNotAllowed(res, cors, "GET");
                return await handleTranscript(ctx, res, url, cors);
            case "/api/session/reset":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handleSessionReset(ctx, req, res, cors);
            case "/api/approvals":
                if (req.method !== "GET")
                    return sendMethodNotAllowed(res, cors, "GET");
                return sendJson(res, cors, 200, ctx.approvalManager.getPendingApprovals());
            case "/api/approval/resolve":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handleApprovalResolve(ctx, req, res, cors);
            case "/api/pairing/generate":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handlePairingGenerate(req, res, cors);
            case "/api/pairing/validate":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handlePairingValidate(req, res, cors);
            case "/api/devices/pair":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handleDevicePair(req, res, cors);
            case "/api/chat/send":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handleChatSend(ctx, req, res, cors);
            case "/api/skills":
                if (req.method !== "GET")
                    return sendMethodNotAllowed(res, cors, "GET");
                return handleListSkills(ctx, res, cors);
            case "/api/skills/toggle":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return await handleToggleSkill(ctx, req, res, cors);
            case "/api/models":
                if (req.method !== "GET")
                    return sendMethodNotAllowed(res, cors, "GET");
                return handleListModels(res, cors);
            case "/api/token/generate":
                if (req.method !== "POST")
                    return sendMethodNotAllowed(res, cors, "POST");
                return sendJson(res, cors, 200, { token: generateApiToken() });
            case "/api/memory":
                if (req.method === "GET")
                    return await handleMemoryList(ctx, res, url, cors);
                if (req.method === "POST")
                    return await handleMemoryStore(ctx, req, res, cors);
                return sendMethodNotAllowed(res, cors, "GET, POST");
            default:
                if (url.pathname.startsWith("/api/memory/")) {
                    if (req.method === "GET")
                        return await handleMemoryRecall(ctx, res, url, cors);
                    if (req.method === "PUT")
                        return await handleMemoryUpdate(ctx, req, res, cors);
                    if (req.method === "DELETE")
                        return await handleMemoryForget(ctx, res, url, cors);
                    return sendMethodNotAllowed(res, cors, "GET, PUT, DELETE");
                }
                res.writeHead(404, cors);
                res.end(JSON.stringify({ error: "Not found" }));
        }
    }
    catch (err) {
        ctx.logger.error("http", "Request error", err);
        res.writeHead(500, cors);
        res.end(JSON.stringify({ error: "Internal server error" }));
    }
}
// ── Individual Route Handlers ────────────────────────────────────────
async function handleConfig(ctx, req, res, cors) {
    if (req.method === "GET") {
        sendJson(res, cors, 200, redactConfig(ctx.config));
    }
    else if (req.method === "PUT") {
        const body = await readBody(req);
        try {
            const parsed = JSON.parse(body);
            const validated = MxClawConfigSchema.parse({ ...ctx.config, ...parsed });
            // Mutate the gateway's live config reference
            Object.assign(ctx.config, validated);
            sendJson(res, cors, 200, { ok: true });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Invalid config";
            sendJson(res, cors, 400, { error: msg });
        }
    }
    else {
        sendMethodNotAllowed(res, cors, "GET, PUT");
    }
}
async function handleListSessions(ctx, res, url, cors) {
    const agentId = url.searchParams.get("agentId") ?? ctx.config.defaultAgentId ?? "default";
    const sessions = await ctx.storage.listSessions(agentId);
    sendJson(res, cors, 200, sessions);
}
async function handleTranscript(ctx, res, url, cors) {
    const agentId = url.searchParams.get("agentId") ?? "default";
    const sessionKey = url.searchParams.get("sessionKey");
    if (!sessionKey) {
        sendJson(res, cors, 400, { error: "sessionKey required" });
        return;
    }
    const turns = await ctx.storage.getSessionTranscript(agentId, sessionKey);
    sendJson(res, cors, 200, turns);
}
async function handleSessionReset(ctx, req, res, cors) {
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    const { agentId, sessionKey } = parsed;
    if (!sessionKey)
        return sendJson(res, cors, 400, { error: "sessionKey required" });
    await ctx.storage.deleteSession(agentId ?? "default", sessionKey);
    sendJson(res, cors, 200, { ok: true });
}
async function handleApprovalResolve(ctx, req, res, cors) {
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    const { approvalId, approved } = parsed;
    if (!approvalId)
        return sendJson(res, cors, 400, { error: "approvalId required" });
    const result = ctx.approvalManager.resolveApproval(approvalId, approved ?? false);
    sendJson(res, cors, 200, result ?? { error: "Not found or already resolved" });
}
async function handlePairingGenerate(req, res, cors) {
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    const { channelId, senderId } = parsed;
    if (!channelId || !senderId)
        return sendJson(res, cors, 400, { error: "channelId and senderId required" });
    const pairing = generatePairingCode(channelId, senderId);
    sendJson(res, cors, 200, pairing);
}
async function handlePairingValidate(req, res, cors) {
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    const { code } = parsed;
    if (!code)
        return sendJson(res, cors, 400, { error: "code required" });
    const result = validatePairingCode(code);
    sendJson(res, cors, 200, result ? { valid: true, ...result } : { valid: false });
}
async function handleDevicePair(req, res, cors) {
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    const { deviceId, deviceName } = parsed;
    if (!deviceId)
        return sendJson(res, cors, 400, { error: "deviceId required" });
    const session = pairDevice(deviceId, deviceName ?? "unknown");
    sendJson(res, cors, 200, { deviceId: session.deviceId, token: session.token });
}
async function handleChatSend(ctx, req, res, cors) {
    const body = await readBody(req);
    let envelope;
    try {
        envelope = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    envelope.id = envelope.id ?? uuidv4();
    envelope.timestamp = envelope.timestamp ?? Date.now();
    await ctx.handleInboundMessage(envelope);
    sendJson(res, cors, 202, { accepted: true, messageId: envelope.id });
}
// ── Skills API ───────────────────────────────────────────────────────
function handleListSkills(ctx, res, cors) {
    const skills = ctx.skillLoader?.getAllSkills() ?? [];
    sendJson(res, cors, 200, skills.map(s => ({
        name: s.name,
        description: s.description,
        triggers: s.triggers,
        tools: s.tools,
        enabled: s.enabled,
        filePath: s.filePath,
    })));
}
async function handleToggleSkill(ctx, req, res, cors) {
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON body" });
    }
    const { name, enabled } = parsed;
    if (!name)
        return sendJson(res, cors, 400, { error: "name required" });
    const skill = ctx.skillLoader?.getSkill(name);
    if (!skill)
        return sendJson(res, cors, 404, { error: `Skill "${name}" not found` });
    skill.enabled = enabled ?? !skill.enabled;
    sendJson(res, cors, 200, { ok: true, name, enabled: skill.enabled });
}
// ── Models API ───────────────────────────────────────────────────────
function handleListModels(res, cors) {
    // Dynamic import to avoid circular dependencies
    import("./model-catalog.js").then(({ getAllModels }) => {
        sendJson(res, cors, 200, getAllModels());
    }).catch(() => {
        sendJson(res, cors, 200, []);
    });
}
// ── Webhook Handler ──────────────────────────────────────────────────
async function handleWebhook(ctx, req, res, url, cors) {
    const subPath = url.pathname.slice(ctx.config.gateway.webhookPath.length).replace(/^\//, "");
    const body = await readBody(req);
    ctx.logger.debug("webhook", `Incoming webhook: ${subPath}`);
    for (const [channelId, channelConfig] of Object.entries(ctx.config.channels)) {
        const webhookSecret = channelConfig.credentials?.webhookSecret;
        if (webhookSecret && subPath.includes(channelConfig.type)) {
            const headers = {};
            for (const [k, v] of Object.entries(req.headers)) {
                if (typeof v === "string")
                    headers[k] = v;
            }
            const platform = channelConfig.type;
            if (!verifyWebhook(platform, body, headers, webhookSecret)) {
                ctx.logger.warn("webhook", `Signature verification failed for ${channelId}`);
                res.writeHead(401, { ...cors, "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid webhook signature" }));
                return;
            }
        }
        const plugin = getChannelPlugin(ctx.registry, channelConfig.type);
        if (plugin?.handleCommand) {
            await plugin.handleCommand(channelId, "webhook", [subPath, body]);
        }
    }
    sendJson(res, cors, 200, { ok: true });
}
// ── Status ────────────────────────────────────────────────────────────
export async function getGatewayStatus(ctx) {
    const channelStatuses = [];
    for (const [channelId, channelConfig] of Object.entries(ctx.config.channels)) {
        const plugin = getChannelPlugin(ctx.registry, channelConfig.type);
        let status;
        if (plugin) {
            try {
                status = await plugin.getStatus(channelId);
            }
            catch {
                status = {
                    id: channelId,
                    type: channelConfig.type,
                    connected: false,
                    error: "Failed to get status",
                    messageCount: ctx.channelMessageCounts.get(channelId) ?? 0,
                    queueSize: ctx.outboundQueues.get(channelId)?.length ?? 0,
                };
            }
        }
        else {
            status = {
                id: channelId,
                type: channelConfig.type,
                connected: false,
                error: "No plugin loaded",
                messageCount: 0,
                queueSize: 0,
            };
        }
        channelStatuses.push(status);
    }
    const memUsage = process.memoryUsage();
    return {
        uptime: Date.now() - ctx.startTime,
        channels: channelStatuses,
        providers: Array.from(ctx.providerStatuses.values()),
        activeSessions: 0,
        deviceCount: 0, // Will be injected by the main gateway
        pluginErrors: ctx.registry.pluginErrors,
        memoryUsage: {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            rss: memUsage.rss,
        },
    };
}
// ── Memory API ─────────────────────────────────────────────────────────
async function handleMemoryList(ctx, res, url, cors) {
    if (!ctx.memory)
        return sendJson(res, cors, 501, { error: "Memory system not available" });
    const type = url.searchParams.get("type");
    const entries = await ctx.memory.list(type ?? undefined);
    sendJson(res, cors, 200, entries);
}
async function handleMemoryStore(ctx, req, res, cors) {
    if (!ctx.memory)
        return sendJson(res, cors, 501, { error: "Memory system not available" });
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON" });
    }
    if (!parsed.content)
        return sendJson(res, cors, 400, { error: "content required" });
    const entry = await ctx.memory.store({
        content: parsed.content,
        type: parsed.type ?? "general",
        tags: parsed.tags ?? [],
        source: parsed.source,
    });
    sendJson(res, cors, 200, entry);
}
async function handleMemoryRecall(ctx, res, url, cors) {
    if (!ctx.memory)
        return sendJson(res, cors, 501, { error: "Memory system not available" });
    const id = url.pathname.split("/").pop();
    if (!id)
        return sendJson(res, cors, 400, { error: "id required" });
    const entry = await ctx.memory.recall(id);
    if (!entry)
        return sendJson(res, cors, 404, { error: "Memory not found" });
    sendJson(res, cors, 200, entry);
}
async function handleMemoryUpdate(ctx, req, res, cors) {
    if (!ctx.memory)
        return sendJson(res, cors, 501, { error: "Memory system not available" });
    const id = req.url?.split("/").pop();
    if (!id)
        return sendJson(res, cors, 400, { error: "id required" });
    const body = await readBody(req);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return sendJson(res, cors, 400, { error: "Invalid JSON" });
    }
    const existing = await ctx.memory.recall(id);
    if (!existing)
        return sendJson(res, cors, 404, { error: "Memory not found" });
    const updated = await ctx.memory.store({
        content: parsed.content ?? existing.content,
        type: parsed.type ?? existing.type,
        tags: parsed.tags ?? existing.tags,
    });
    sendJson(res, cors, 200, updated);
}
async function handleMemoryForget(ctx, res, url, cors) {
    if (!ctx.memory)
        return sendJson(res, cors, 501, { error: "Memory system not available" });
    const id = url.pathname.split("/").pop();
    if (!id)
        return sendJson(res, cors, 400, { error: "id required" });
    const ok = await ctx.memory.forget(id);
    if (!ok)
        return sendJson(res, cors, 404, { error: "Memory not found" });
    sendJson(res, cors, 200, { ok: true });
}
// ── Helpers ───────────────────────────────────────────────────────────
function sendJson(res, cors, status, body) {
    res.writeHead(status, { ...cors, "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
}
function sendMethodNotAllowed(res, cors, allowed) {
    res.writeHead(405, { ...cors, "Allow": allowed, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Method not allowed. Allowed: ${allowed}` }));
}
//# sourceMappingURL=http-handler.js.map
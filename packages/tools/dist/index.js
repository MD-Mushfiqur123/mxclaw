import { z } from "zod";
import { getSandboxCommand } from "@mxclaw/security";
import { executeInSandbox, isDockerAvailable, buildSandboxImage } from "./sandbox.js";
import { imageGenTool } from "./image-gen.js";
import { CronPersistence } from "./cron-persist.js";
import * as child_process from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
// ── Bash Tool ─────────────────────────────────────────────────────
const BashParamsSchema = z.object({
    command: z.string().min(1),
    workingDirectory: z.string().optional(),
    timeout: z.number().positive().default(30000),
    env: z.record(z.string()).optional(),
});
export const bashTool = {
    name: "bash",
    description: "Execute a shell command. Requires approval for dangerous operations.",
    parameters: BashParamsSchema,
    execute: async (args, context) => {
        const { command, workingDirectory, timeout, env } = BashParamsSchema.parse(args);
        const sandboxedCommand = context.sandbox?.enabled
            ? getSandboxCommand(context.sandbox, command)
            : command;
        return new Promise((resolve) => {
            const proc = child_process.exec(sandboxedCommand, {
                cwd: workingDirectory ?? context.workspacePath,
                timeout,
                env: { ...process.env, ...env },
                maxBuffer: 10 * 1024 * 1024, // 10MB
                shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
            }, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        success: false,
                        output: stderr || stdout || error.message,
                        error: error.message,
                    });
                }
                else {
                    resolve({
                        success: true,
                        output: stdout || "(no output)",
                    });
                }
            });
            if (context.signal) {
                context.signal.addEventListener("abort", () => {
                    proc.kill();
                    resolve({ success: false, output: "", error: "Command timed out" });
                });
            }
        });
    },
};
// ── Browser CDP Tool ──────────────────────────────────────────────
const BrowserParamsSchema = z.object({
    action: z.enum(["navigate", "click", "type", "screenshot", "evaluate", "getText", "wait"]),
    url: z.string().optional(),
    selector: z.string().optional(),
    text: z.string().optional(),
    script: z.string().optional(),
    timeout: z.number().positive().default(10000),
});
export const browserTool = {
    name: "browser",
    description: "Control a browser via Chrome DevTools Protocol. Requires a running Chrome with --remote-debugging-port.",
    parameters: BrowserParamsSchema,
    execute: async (args, _context) => {
        const { action, url, selector, text, script, timeout } = BrowserParamsSchema.parse(args);
        // CDP connection to Chrome
        const cdpUrl = process.env.mxclaw_CDP_URL ?? "http://localhost:9222";
        try {
            const response = await fetch(`${cdpUrl}/json/version`);
            const debugInfo = (await response.json());
            const wsUrl = debugInfo.webSocketDebuggerUrl;
            if (!wsUrl) {
                return { success: false, output: "", error: "No Chrome debugging instance found at " + cdpUrl };
            }
            // Use WebSocket to send CDP commands
            const ws = new WebSocket(wsUrl);
            let msgId = 1;
            const pending = new Map();
            await new Promise((resolveWs, rejectWs) => {
                ws.onopen = () => resolveWs();
                ws.onerror = (e) => rejectWs(new Error("WebSocket connection failed"));
                setTimeout(() => rejectWs(new Error("WebSocket connection timeout")), 5000);
            });
            const sendCommand = (method, params) => {
                return new Promise((resolve, reject) => {
                    const id = msgId++;
                    pending.set(id, { resolve, reject });
                    ws.send(JSON.stringify({ id, method, params }));
                    setTimeout(() => {
                        pending.delete(id);
                        reject(new Error(`CDP command ${method} timed out`));
                    }, timeout);
                });
            };
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.id && pending.has(msg.id)) {
                    const { resolve, reject } = pending.get(msg.id);
                    pending.delete(msg.id);
                    if (msg.error)
                        reject(new Error(msg.error.message));
                    else
                        resolve(msg.result);
                }
            };
            let result = "";
            switch (action) {
                case "navigate": {
                    if (!url)
                        return { success: false, output: "", error: "URL required for navigate" };
                    await sendCommand("Page.enable");
                    await sendCommand("Page.navigate", { url });
                    result = `Navigated to ${url}`;
                    break;
                }
                case "screenshot": {
                    const screenshot = await sendCommand("Page.captureScreenshot", { format: "png" });
                    result = screenshot.data;
                    break;
                }
                case "evaluate": {
                    if (!script)
                        return { success: false, output: "", error: "Script required for evaluate" };
                    const evalResult = await sendCommand("Runtime.evaluate", {
                        expression: script,
                        returnByValue: true,
                    });
                    result = JSON.stringify(evalResult);
                    break;
                }
                case "click": {
                    if (!selector)
                        return { success: false, output: "", error: "Selector required for click" };
                    const doc = await sendCommand("DOM.getDocument");
                    const node = await sendCommand("DOM.querySelector", {
                        nodeId: doc.root.nodeId,
                        selector,
                    });
                    const nodeId = node.nodeId;
                    if (!nodeId)
                        return { success: false, output: "", error: `Element not found: ${selector}` };
                    const boxModel = await sendCommand("DOM.getBoxModel", { nodeId });
                    const quad = boxModel.model.content;
                    const x = quad[0] + (quad[4] - quad[0]) / 2;
                    const y = quad[1] + (quad[5] - quad[1]) / 2;
                    await sendCommand("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
                    await sendCommand("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
                    result = `Clicked ${selector}`;
                    break;
                }
                case "type": {
                    if (!selector || !text)
                        return { success: false, output: "", error: "Selector and text required for type" };
                    const doc = await sendCommand("DOM.getDocument");
                    const node = await sendCommand("DOM.querySelector", {
                        nodeId: doc.root.nodeId,
                        selector,
                    });
                    const nodeId = node.nodeId;
                    if (!nodeId)
                        return { success: false, output: "", error: `Element not found: ${selector}` };
                    await sendCommand("DOM.focus", { nodeId });
                    await sendCommand("Input.insertText", { text });
                    result = `Typed "${text}" into ${selector}`;
                    break;
                }
                case "getText": {
                    if (!selector)
                        return { success: false, output: "", error: "Selector required for getText" };
                    const evalResult = await sendCommand("Runtime.evaluate", {
                        expression: `document.querySelector('${selector.replace(/'/g, "\\'")}')?.textContent ?? ''`,
                        returnByValue: true,
                    });
                    result = JSON.stringify(evalResult);
                    break;
                }
                case "wait": {
                    await new Promise((r) => setTimeout(r, timeout));
                    result = `Waited ${timeout}ms`;
                    break;
                }
            }
            ws.close();
            return { success: true, output: result };
        }
        catch (err) {
            return {
                success: false,
                output: "",
                error: err instanceof Error ? err.message : String(err),
            };
        }
    },
};
// ── Canvas Tool ───────────────────────────────────────────────────
const CanvasParamsSchema = z.object({
    action: z.enum(["draw", "clear", "render", "update"]),
    json: z.record(z.unknown()).optional(),
    width: z.number().positive().default(800),
    height: z.number().positive().default(600),
});
export const canvasTool = {
    name: "canvas",
    description: "Draw on a shared canvas using A2UI JSON format. Rendered on connected clients.",
    parameters: CanvasParamsSchema,
    execute: async (args, context) => {
        const { action, json, width, height } = CanvasParamsSchema.parse(args);
        const canvasDir = path.join(context.workspacePath, "canvas");
        fs.mkdirSync(canvasDir, { recursive: true });
        const canvasFile = path.join(canvasDir, `${context.sessionKey}.json`);
        switch (action) {
            case "draw": {
                const canvasState = {
                    width,
                    height,
                    elements: json?.elements ?? [],
                    version: Date.now(),
                };
                fs.writeFileSync(canvasFile, JSON.stringify(canvasState, null, 2));
                return {
                    success: true,
                    output: `Canvas updated with ${json?.elements?.length ?? 0} elements`,
                    artifacts: [{ type: "canvas", url: `canvas://${context.sessionKey}`, name: "canvas-state" }],
                };
            }
            case "clear": {
                const emptyState = { width, height, elements: [], version: Date.now() };
                fs.writeFileSync(canvasFile, JSON.stringify(emptyState, null, 2));
                return { success: true, output: "Canvas cleared" };
            }
            case "render": {
                if (!fs.existsSync(canvasFile)) {
                    return { success: true, output: JSON.stringify({ width, height, elements: [] }) };
                }
                const state = fs.readFileSync(canvasFile, "utf-8");
                return { success: true, output: state };
            }
            case "update": {
                if (!fs.existsSync(canvasFile)) {
                    return { success: false, output: "", error: "No canvas state to update" };
                }
                const existing = JSON.parse(fs.readFileSync(canvasFile, "utf-8"));
                const merged = { ...existing, ...json, version: Date.now() };
                fs.writeFileSync(canvasFile, JSON.stringify(merged, null, 2));
                return { success: true, output: "Canvas updated" };
            }
            default:
                return { success: false, output: "", error: `Unknown canvas action: ${action}` };
        }
    },
};
// ── Cron Tool ─────────────────────────────────────────────────────
const CronParamsSchema = z.object({
    action: z.enum(["schedule", "list", "cancel"]),
    name: z.string().optional(),
    schedule: z.string().optional(), // cron expression
    command: z.string().optional(),
    agentId: z.string().optional(),
});
// Lazily-initialized persistent cron store
let cronPersistence = null;
function getCronStore(workspacePath) {
    if (!cronPersistence) {
        cronPersistence = new CronPersistence(workspacePath);
    }
    return cronPersistence;
}
export const cronTool = {
    name: "cron",
    description: "Schedule recurring tasks using cron expressions. Jobs are persisted to disk and survive restarts.",
    parameters: CronParamsSchema,
    execute: async (args, context) => {
        const { action, name, schedule, command, agentId } = CronParamsSchema.parse(args);
        const store = getCronStore(context.workspacePath);
        switch (action) {
            case "schedule": {
                if (!name || !schedule || !command) {
                    return { success: false, output: "", error: "name, schedule, and command required" };
                }
                const job = store.addJob(name, schedule, command, agentId ?? context.agentId);
                return { success: true, output: `Cron job "${name}" scheduled with ID ${job.id} (persisted to disk)` };
            }
            case "list": {
                const jobs = store.listJobs().map((j) => ({
                    id: j.id,
                    name: j.name,
                    schedule: j.schedule,
                    enabled: j.enabled,
                    nextRunAt: new Date(j.nextRunAt).toISOString(),
                    lastRunAt: j.lastRunAt ? new Date(j.lastRunAt).toISOString() : null,
                    lastError: j.lastError ?? null,
                }));
                return { success: true, output: JSON.stringify(jobs, null, 2) };
            }
            case "cancel": {
                if (!name)
                    return { success: false, output: "", error: "name required" };
                const allJobs = store.listJobs();
                const job = allJobs.find((j) => j.name === name);
                if (job) {
                    store.removeJob(job.id);
                    return { success: true, output: `Cron job "${name}" cancelled and removed from disk` };
                }
                return { success: false, output: "", error: `Cron job "${name}" not found` };
            }
            default:
                return { success: false, output: "", error: `Unknown cron action: ${action}` };
        }
    },
};
// ── Session Spawn Tool ────────────────────────────────────────────
const SessionSpawnParamsSchema = z.object({
    agentId: z.string().describe("The agent ID to spawn the sub-session for"),
    message: z.string().describe("The initial message / task for the spawned session"),
    context: z.record(z.unknown()).optional().describe("Optional context to pass from the parent session"),
});
let _sessionSpawnFn = null;
/**
 * Register the session spawn handler. Called once by the gateway during startup.
 */
export function registerSessionSpawnHandler(fn) {
    _sessionSpawnFn = fn;
}
export const sessionSpawnTool = {
    name: "session_spawn",
    description: "Spawn a new isolated agent session to handle a subtask. " +
        "The spawned session runs independently and can use a different agent. " +
        "Returns the session key for cross-session communication via sessions_send.",
    parameters: SessionSpawnParamsSchema,
    execute: async (args, context) => {
        const { agentId, message, context: spawnContext } = SessionSpawnParamsSchema.parse(args);
        if (!_sessionSpawnFn) {
            return {
                success: false,
                output: "",
                error: "Session spawn is not available — gateway session manager not connected",
            };
        }
        try {
            const result = await _sessionSpawnFn(context.sessionKey, agentId, message, spawnContext);
            return {
                success: true,
                output: JSON.stringify({
                    sessionKey: result.sessionKey,
                    agentId: result.agentId,
                    message: `Sub-session spawned successfully. Use session key "${result.sessionKey}" to send follow-up messages.`,
                }),
            };
        }
        catch (err) {
            return {
                success: false,
                output: "",
                error: `Failed to spawn session: ${err instanceof Error ? err.message : String(err)}`,
            };
        }
    },
};
// ── Image Generation Tool (real API calls) ────────────────────────
// Re-exported from image-gen.ts with DALL-E 3, Stability AI, Replicate, and local SD WebUI support
export { imageGenTool } from "./image-gen.js";
// ── File Read Tool ────────────────────────────────────────────────
const FileReadParamsSchema = z.object({
    path: z.string().min(1),
    encoding: z.enum(["utf-8", "base64", "binary"]).default("utf-8"),
    maxBytes: z.number().positive().default(1024 * 1024), // 1MB
});
export const fileReadTool = {
    name: "file_read",
    description: "Read a file from the workspace or allowed paths.",
    parameters: FileReadParamsSchema,
    execute: async (args, context) => {
        const { path: filePath, encoding, maxBytes } = FileReadParamsSchema.parse(args);
        const resolved = resolvePath(filePath, context.workspacePath);
        if (!isPathAllowed(resolved, context.workspacePath)) {
            return { success: false, output: "", error: `Access denied: ${filePath} is outside allowed paths` };
        }
        if (!fs.existsSync(resolved)) {
            return { success: false, output: "", error: `File not found: ${filePath}` };
        }
        const stat = fs.statSync(resolved);
        if (stat.size > maxBytes) {
            return { success: false, output: "", error: `File too large: ${stat.size} bytes (max ${maxBytes})` };
        }
        try {
            if (encoding === "utf-8") {
                const content = fs.readFileSync(resolved, "utf-8");
                return { success: true, output: content };
            }
            else {
                const content = fs.readFileSync(resolved);
                return { success: true, output: content.toString(encoding) };
            }
        }
        catch (err) {
            return {
                success: false,
                output: "",
                error: err instanceof Error ? err.message : String(err),
            };
        }
    },
};
// ── File Write Tool ───────────────────────────────────────────────
const FileWriteParamsSchema = z.object({
    path: z.string().min(1),
    content: z.string(),
    encoding: z.enum(["utf-8", "base64", "binary"]).default("utf-8"),
    append: z.boolean().default(false),
});
export const fileWriteTool = {
    name: "file_write",
    description: "Write content to a file in the workspace or allowed paths.",
    parameters: FileWriteParamsSchema,
    execute: async (args, context) => {
        const { path: filePath, content, encoding, append } = FileWriteParamsSchema.parse(args);
        const resolved = resolvePath(filePath, context.workspacePath);
        if (!isPathAllowed(resolved, context.workspacePath)) {
            return { success: false, output: "", error: `Access denied: ${filePath} is outside allowed paths` };
        }
        const dir = path.dirname(resolved);
        fs.mkdirSync(dir, { recursive: true });
        try {
            if (append) {
                fs.appendFileSync(resolved, content, encoding);
            }
            else {
                fs.writeFileSync(resolved, content, encoding);
            }
            return { success: true, output: `Written ${content.length} bytes to ${filePath}` };
        }
        catch (err) {
            return {
                success: false,
                output: "",
                error: err instanceof Error ? err.message : String(err),
            };
        }
    },
};
// ── Web Tools (search + fetch) ────────────────────────────────────
export { webSearchTool } from "./web-search.js";
export { webFetchTool } from "./web-fetch.js";
import { webSearchTool } from "./web-search.js";
import { webFetchTool } from "./web-fetch.js";
// ── Memory Tool ──────────────────────────────────────────────────
const MemoryParamsSchema = z.object({
    action: z.enum(["store", "search", "recall", "forget", "list"]),
    content: z.string().optional().describe("Content to store (for store action)"),
    type: z.enum(["fact", "preference", "entity", "event", "instruction", "general"]).optional().describe("Memory type"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    id: z.string().optional().describe("Memory ID (for recall, forget)"),
    query: z.string().optional().describe("Search query (for search action)"),
});
let _memoryAdapter = null;
export function registerMemoryAdapter(adapter) {
    _memoryAdapter = adapter;
}
export const memoryTool = {
    name: "memory",
    description: "Store, search, recall, or forget information in the agent's persistent knowledge base. Use this to remember facts, user preferences, entities, events, or instructions across sessions.",
    parameters: MemoryParamsSchema,
    execute: async (args) => {
        if (!_memoryAdapter) {
            return { success: false, output: "", error: "Memory system not available" };
        }
        const { action, content, type, tags, id, query } = MemoryParamsSchema.parse(args);
        try {
            switch (action) {
                case "store": {
                    if (!content)
                        return { success: false, output: "", error: "content required for store" };
                    const entry = await _memoryAdapter.store({
                        content,
                        type: type ?? "general",
                        tags: tags ?? [],
                    });
                    return { success: true, output: JSON.stringify({ id: entry.id, type: entry.type, tags: entry.tags }) };
                }
                case "search": {
                    if (!query)
                        return { success: false, output: "", error: "query required for search" };
                    const results = await _memoryAdapter.search({ query, type, limit: 10 });
                    return { success: true, output: JSON.stringify(results, null, 2) };
                }
                case "recall": {
                    if (!id)
                        return { success: false, output: "", error: "id required for recall" };
                    const entry = await _memoryAdapter.recall(id);
                    if (!entry)
                        return { success: false, output: "", error: `Memory not found: ${id}` };
                    return { success: true, output: JSON.stringify(entry, null, 2) };
                }
                case "forget": {
                    if (!id)
                        return { success: false, output: "", error: "id required for forget" };
                    const ok = await _memoryAdapter.forget(id);
                    return ok
                        ? { success: true, output: `Memory ${id} forgotten` }
                        : { success: false, output: "", error: `Memory not found: ${id}` };
                }
                case "list": {
                    const entries = await _memoryAdapter.list(type);
                    return { success: true, output: JSON.stringify(entries, null, 2) };
                }
                default:
                    return { success: false, output: "", error: `Unknown action: ${action}` };
            }
        }
        catch (err) {
            return { success: false, output: "", error: err instanceof Error ? err.message : String(err) };
        }
    },
};
// ── Tool Registry ─────────────────────────────────────────────────
export const ALL_TOOLS = [
    bashTool,
    browserTool,
    canvasTool,
    cronTool,
    sessionSpawnTool,
    imageGenTool,
    fileReadTool,
    fileWriteTool,
    webSearchTool,
    webFetchTool,
    memoryTool,
];
export function getTool(name) {
    return ALL_TOOLS.find((t) => t.name === name);
}
export function getToolDefinitionsForLLM(enabledTools) {
    return ALL_TOOLS.filter((t) => enabledTools.has(t.name)).map((t) => ({
        type: "function",
        function: {
            name: t.name,
            description: t.description,
            parameters: zodToJsonSchema(t.parameters),
        },
    }));
}
function zodToJsonSchema(schema) {
    // Unwrap ZodDefault, ZodOptional, ZodNullable wrappers
    function unwrap(s) {
        let inner = s;
        let isOptional = false;
        while (true) {
            if (inner instanceof z.ZodDefault) {
                inner = inner._def.innerType;
            }
            else if (inner instanceof z.ZodOptional) {
                inner = inner.unwrap();
                isOptional = true;
            }
            else if (inner instanceof z.ZodNullable) {
                inner = inner.unwrap();
                isOptional = true;
            }
            else {
                break;
            }
        }
        return { inner, isOptional };
    }
    function fieldToSchema(field) {
        const { inner, isOptional } = unwrap(field);
        const fieldDef = {};
        if (inner instanceof z.ZodString) {
            fieldDef.type = "string";
        }
        else if (inner instanceof z.ZodNumber) {
            fieldDef.type = "number";
        }
        else if (inner instanceof z.ZodBoolean) {
            fieldDef.type = "boolean";
        }
        else if (inner instanceof z.ZodEnum) {
            fieldDef.type = "string";
            fieldDef.enum = inner.options;
        }
        else if (inner instanceof z.ZodArray) {
            fieldDef.type = "array";
            fieldDef.items = fieldToSchema(inner.element).schema;
        }
        else if (inner instanceof z.ZodObject) {
            fieldDef.type = "object";
            const objSchema = zodToJsonSchema(inner);
            fieldDef.properties = objSchema.properties;
            if (objSchema.required)
                fieldDef.required = objSchema.required;
        }
        else if (inner instanceof z.ZodRecord) {
            fieldDef.type = "object";
            fieldDef.additionalProperties = true;
        }
        else {
            fieldDef.type = "string";
        }
        if (inner.description)
            fieldDef.description = inner.description;
        return { schema: fieldDef, optional: isOptional };
    }
    const shape = schema.shape;
    if (!shape)
        return { type: "object", properties: {} };
    const properties = {};
    const requiredFields = [];
    for (const [key, field] of Object.entries(shape)) {
        const { schema: fieldSchema, optional } = fieldToSchema(field);
        properties[key] = fieldSchema;
        if (!optional)
            requiredFields.push(key);
    }
    return {
        type: "object",
        properties,
        ...(requiredFields.length > 0 ? { required: requiredFields } : {}),
    };
}
// ── Helpers ───────────────────────────────────────────────────────
function resolvePath(inputPath, workspacePath) {
    if (inputPath.startsWith("~")) {
        return path.join(os.homedir(), inputPath.slice(1));
    }
    if (path.isAbsolute(inputPath))
        return inputPath;
    return path.resolve(workspacePath, inputPath);
}
function isPathAllowed(resolved, workspacePath) {
    const normalized = path.normalize(resolved);
    const workspaceNormalized = path.normalize(workspacePath);
    return normalized.startsWith(workspaceNormalized);
}
// ── Approval Manager ──────────────────────────────────────────────
export class ApprovalManager {
    pending = new Map();
    timeouts = new Map();
    defaultTimeoutMs = 60000; // 1 minute
    requestApproval(tool, args, agentId, sessionKey) {
        const id = crypto.randomUUID();
        const approval = {
            id,
            tool,
            args,
            agentId,
            sessionKey,
            timestamp: Date.now(),
            status: "pending",
        };
        this.pending.set(id, approval);
        const timeout = setTimeout(() => {
            const existing = this.pending.get(id);
            if (existing && existing.status === "pending") {
                existing.status = "timed-out";
                this.pending.set(id, existing);
            }
            this.timeouts.delete(id);
        }, this.defaultTimeoutMs);
        this.timeouts.set(id, timeout);
        return approval;
    }
    resolveApproval(approvalId, approved) {
        const approval = this.pending.get(approvalId);
        if (!approval || approval.status !== "pending")
            return null;
        const timeout = this.timeouts.get(approvalId);
        if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(approvalId);
        }
        approval.status = approved ? "approved" : "denied";
        this.pending.set(approvalId, approval);
        return approval;
    }
    getPendingApprovals() {
        return Array.from(this.pending.values()).filter((a) => a.status === "pending");
    }
    getApproval(id) {
        return this.pending.get(id);
    }
}
//# sourceMappingURL=index.js.map
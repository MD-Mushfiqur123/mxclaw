import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApprovalManager } from "@mxclaw/tools";
import { executeToolCalls, type ToolExecutorDeps, type ToolCallInput } from "../tool-executor.js";

describe("ApprovalManager", () => {
  let manager: ApprovalManager;

  beforeEach(() => {
    manager = new ApprovalManager();
  });

  it("should create pending approvals", () => {
    const approval = manager.requestApproval("bash", { command: "ls" }, "default", "session-1");
    expect(approval.id).toBeTruthy();
    expect(approval.status).toBe("pending");
    expect(approval.tool).toBe("bash");
  });

  it("should resolve approvals as approved", () => {
    const approval = manager.requestApproval("bash", { command: "rm -rf" }, "default", "session-1");
    const result = manager.resolveApproval(approval.id, true);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("approved");
  });

  it("should resolve approvals as denied", () => {
    const approval = manager.requestApproval("bash", { command: "rm -rf" }, "default", "session-1");
    const result = manager.resolveApproval(approval.id, false);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("denied");
  });

  it("should return null for already-resolved approvals", () => {
    const approval = manager.requestApproval("bash", {}, "default", "s1");
    manager.resolveApproval(approval.id, true);
    expect(manager.resolveApproval(approval.id, false)).toBeNull();
  });

  it("should return null for nonexistent approvals", () => {
    expect(manager.resolveApproval("nonexistent", true)).toBeNull();
  });

  it("should list pending approvals only", () => {
    const a1 = manager.requestApproval("bash", {}, "default", "s1");
    const a2 = manager.requestApproval("file_write", {}, "default", "s1");
    manager.resolveApproval(a1.id, true);
    const pending = manager.getPendingApprovals();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe(a2.id);
  });

  it("should get specific approval by ID", () => {
    const approval = manager.requestApproval("canvas", {}, "default", "s1");
    expect(manager.getApproval(approval.id)).toBeDefined();
    expect(manager.getApproval("nonexistent")).toBeUndefined();
  });
});

describe("AgentRunner - Fallback Chain", () => {
  it("should export runCompletion function", async () => {
    const module = await import("../agent-runner.js");
    expect(module.runCompletion).toBeDefined();
    expect(typeof module.runCompletion).toBe("function");
  });
});

describe("SessionManager", () => {
  it("should export SessionManager class", async () => {
    const module = await import("../session-manager.js");
    expect(module.SessionManager).toBeDefined();
  });
});

describe("ContextEngine", () => {
  it("should export ContextEngine class", async () => {
    const module = await import("../context-engine.js");
    expect(module.ContextEngine).toBeDefined();
  });
});

describe("ModelCatalog", () => {
  it("should return all models", async () => {
    const { getAllModels, getModel, recommendModel, getModelsForProvider } = await import("../model-catalog.js");
    const models = getAllModels();
    expect(models.length).toBeGreaterThan(10);
    expect(models[0].id).toBeTruthy();
    expect(models[0].contextWindow).toBeGreaterThan(0);
  });

  it("should find models by provider", async () => {
    const { getModelsForProvider } = await import("../model-catalog.js");
    const openai = getModelsForProvider("openai");
    expect(openai.length).toBeGreaterThan(0);
    expect(openai.every(m => m.provider === "openai")).toBe(true);
  });

  it("should get specific model", async () => {
    const { getModel } = await import("../model-catalog.js");
    const gpt4o = getModel("gpt-4o");
    expect(gpt4o).toBeDefined();
    expect(gpt4o!.supportsTools).toBe(true);
    expect(gpt4o!.supportsVision).toBe(true);
  });

  it("should recommend cheapest model meeting requirements", async () => {
    const { recommendModel } = await import("../model-catalog.js");
    const model = recommendModel({ needsVision: true, needsTools: true });
    expect(model).toBeDefined();
    expect(model!.supportsVision).toBe(true);
    expect(model!.supportsTools).toBe(true);
  });
});

describe("RateLimiter", () => {
  it("should allow requests within limit", async () => {
    const { RateLimiter } = await import("../rate-limiter.js");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 });
    for (let i = 0; i < 5; i++) {
      expect(limiter.check("test-ip").allowed).toBe(true);
    }
    expect(limiter.check("test-ip").allowed).toBe(false);
    limiter.shutdown();
  });

  it("should track remaining requests", async () => {
    const { RateLimiter } = await import("../rate-limiter.js");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 3 });
    expect(limiter.check("ip1").remaining).toBe(2);
    expect(limiter.check("ip1").remaining).toBe(1);
    expect(limiter.check("ip1").remaining).toBe(0);
    limiter.shutdown();
  });

  it("should reset per-key limits", async () => {
    const { RateLimiter } = await import("../rate-limiter.js");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 1 });
    limiter.check("ip2");
    expect(limiter.check("ip2").allowed).toBe(false);
    limiter.reset("ip2");
    expect(limiter.check("ip2").allowed).toBe(true);
    limiter.shutdown();
  });
});

describe("WebhookVerify", () => {
  it("should verify Slack signatures", async () => {
    const crypto = await import("node:crypto");
    const { verifyWebhook } = await import("../webhook-verify.js");
    const secret = "test-signing-secret";
    const body = '{"type":"event_callback"}';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sigBase = `v0:${timestamp}:${body}`;
    const signature = "v0=" + crypto.createHmac("sha256", secret).update(sigBase).digest("hex");
    const result = verifyWebhook("slack", body, {
      "x-slack-signature": signature,
      "x-slack-request-timestamp": timestamp,
    }, secret);
    expect(result).toBe(true);
  });

  it("should reject invalid Slack signatures", async () => {
    const { verifyWebhook } = await import("../webhook-verify.js");
    expect(verifyWebhook("slack", "body", {
      "x-slack-signature": "v0=invalid",
      "x-slack-request-timestamp": String(Math.floor(Date.now() / 1000)),
    }, "secret")).toBe(false);
  });

  it("should verify Telegram secret tokens", async () => {
    const { verifyWebhook } = await import("../webhook-verify.js");
    expect(verifyWebhook("telegram", "", { "x-telegram-bot-api-secret-token": "mytoken" }, "mytoken")).toBe(true);
    expect(verifyWebhook("telegram", "", { "x-telegram-bot-api-secret-token": "wrong" }, "mytoken")).toBe(false);
  });
});

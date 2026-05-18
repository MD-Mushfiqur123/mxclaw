import React, { useState, useEffect } from "react";
import { useGatewayStore } from "../store";

interface ModelInfo {
  id: string;
  provider: string;
  displayName: string;
  contextWindow: number;
  maxOutput: number;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsJson: boolean;
  pricing?: { inputPer1M: number; outputPer1M: number };
}

const PROVIDER_ICONS: Record<string, string> = {
  openai: "🟢", anthropic: "🟣", gemini: "🔵", groq: "⚡", deepseek: "🐋",
  together: "🔥", fireworks: "🎆", xai: "✖️", perplexity: "🔍", mistral: "🌬️",
  cohere: "🔷", azure: "🔷", cloudflare: "☁️", bedrock: "⛰️", ollama: "🦙",
  lmstudio: "💻", requesty: "🔀", huggingface: "🤗", replicate: "🔄",
  "openai-compatible": "🔌",
};

export function Providers() {
  const { status, connected } = useGatewayStore();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [search, setSearch] = useState("");
  const [showAllModels, setShowAllModels] = useState(false);

  useEffect(() => {
    fetch("/api/models").then((r) => r.json()).then((data) => { setModels(data); setLoadingModels(false); }).catch(() => setLoadingModels(false));
  }, []);

  const providerModels = showAllModels
    ? models
    : models.filter((m) => status?.providers.some((p) => p.provider === m.provider));

  const filtered = providerModels.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.displayName.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
  });

  const modelsByProvider: Record<string, ModelInfo[]> = {};
  for (const m of filtered) {
    if (!modelsByProvider[m.provider]) modelsByProvider[m.provider] = [];
    modelsByProvider[m.provider].push(m);
  }

  if (!connected) {
    return (
      <div className="page">
        <h1 className="page-title">Providers</h1>
        <div className="card warning">
          <div className="card-header"><strong>⚠️ Gateway Offline</strong></div>
          <div className="card-body">Connect to view provider status and available models.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Providers</h1>
        <label className="toggle-label">
          <input type="checkbox" checked={showAllModels} onChange={(e) => setShowAllModels(e.target.checked)} />
          Show all models
        </label>
      </div>

      <input
        className="input"
        placeholder="Search models..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", maxWidth: "400px", marginBottom: "20px" }}
      />

      {status?.providers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <p>No providers configured. Add providers in the config file.</p>
        </div>
      )}

      {/* Provider status cards */}
      {status?.providers.map((p) => (
        <div key={p.provider} className="card provider-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>{PROVIDER_ICONS[p.provider] ?? "🤖"}</span>
              <div>
                <strong>{p.provider}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                  {p.model}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {p.latencyMs != null && (
                <span className="latency" style={{ color: p.latencyMs < 2000 ? "var(--ok)" : "var(--warning)" }}>
                  ⏱ {p.latencyMs}ms
                </span>
              )}
              <span className={`badge ${p.available ? "ok" : "error"}`}>
                <span className={`status-dot ${p.available ? "online" : "offline"}`} style={{ display: "inline-block", marginRight: "6px" }} />
                {p.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
          {p.error && <div className="card-body" style={{ color: "var(--error)", fontSize: "0.8rem" }}>{p.error}</div>}
        </div>
      ))}

      {/* Models catalog */}
      <div className="section">
        <h3 className="section-title">Model Catalog {!loadingModels && `(${filtered.length} models)`}</h3>
        {loadingModels ? (
          <div className="card"><div className="card-body">Loading models...</div></div>
        ) : Object.entries(modelsByProvider).length === 0 ? (
          <div className="card"><div className="card-body">No models in catalog.</div></div>
        ) : (
          Object.entries(modelsByProvider).map(([provider, providerModels]) => (
            <div key={provider} className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "14px" }}>
              <div className="provider-model-header">
                <span style={{ fontSize: "1.2rem" }}>{PROVIDER_ICONS[provider] ?? "🤖"}</span>
                <strong style={{ textTransform: "capitalize" }}>{provider}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{providerModels.length} models</span>
              </div>
              <table>
                <thead><tr><th>Model</th><th>Display Name</th><th>Context</th><th>Max Output</th><th>Vision</th><th>Tools</th><th>Pricing (per 1M)</th></tr></thead>
                <tbody>
                  {providerModels.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis" }}>{m.id}</td>
                      <td style={{ fontWeight: 500 }}>{m.displayName}</td>
                      <td>{(m.contextWindow / 1000).toFixed(0)}K</td>
                      <td>{(m.maxOutput / 1024).toFixed(0)}K</td>
                      <td>{m.supportsVision ? <span className="badge ok" style={{ fontSize: "0.6rem" }}>✓</span> : <span className="badge error" style={{ fontSize: "0.6rem" }}>✕</span>}</td>
                      <td>{m.supportsTools ? <span className="badge ok" style={{ fontSize: "0.6rem" }}>✓</span> : <span className="badge error" style={{ fontSize: "0.6rem" }}>✕</span>}</td>
                      <td style={{ fontSize: "0.75rem" }}>{m.pricing ? `$${m.pricing.inputPer1M}/$${m.pricing.outputPer1M}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

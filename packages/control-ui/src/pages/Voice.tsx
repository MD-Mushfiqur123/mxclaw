import React, { useState, useEffect } from "react";

interface VoiceConfig {
  defaultProvider: string;
  openaiRealtime: { apiKey?: string; model: string; voice: string };
  geminiLive: { apiKey?: string; model: string; voice: string };
  elevenlabs: { apiKey?: string; voiceId: string };
  systemTts: { rate: number; pitch: number };
}

const VOICE_PROVIDERS = [
  { id: "system-tts", name: "System TTS", icon: "🔊", desc: "Native OS speech synthesis (no API key needed)" },
  { id: "openai-realtime", name: "OpenAI Realtime", icon: "🟢", desc: "Real-time voice with GPT-4o, streaming I/O", requiresKey: true },
  { id: "gemini-live", name: "Gemini Live", icon: "🔵", desc: "Google Gemini voice with server VAD", requiresKey: true },
  { id: "elevenlabs", name: "ElevenLabs", icon: "🎙️", desc: "High-quality TTS with voice cloning", requiresKey: true },
];

export function Voice() {
  const [config, setConfig] = useState<VoiceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((data) => {
      setConfig(data?.voice ?? {
        defaultProvider: "system-tts",
        openaiRealtime: { model: "gpt-4o-realtime-preview", voice: "alloy" },
        geminiLive: { model: "gemini-2.0-flash-live-001", voice: "Puck" },
        elevenlabs: { voiceId: "21m00Tcm4TlvDq8ikWAM" },
        systemTts: { rate: 1.0, pitch: 1.0 },
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: config }),
      });
      if (resp.ok) showToast("success", "Voice config saved!");
      else showToast("error", "Failed to save config");
    } catch { showToast("error", "Network error"); }
    setSaving(false);
  };

  if (loading) return <div className="page"><h1 className="page-title">Voice</h1><div className="card"><div className="card-body">Loading...</div></div></div>;

  return (
    <div className="page">
      <h1 className="page-title">Voice / TTS</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>
        Configure voice and text-to-speech providers for voice conversations with your agents.
      </p>

      {/* Provider Selection */}
      <div className="section">
        <h3 className="section-title">Default Provider</h3>
        <div className="provider-grid">
          {VOICE_PROVIDERS.map((vp) => (
            <div
              key={vp.id}
              className={`card voice-card ${config?.defaultProvider === vp.id ? "selected" : ""}`}
              onClick={() => setConfig((prev) => prev ? { ...prev, defaultProvider: vp.id } : prev)}
              style={{ cursor: "pointer" }}
            >
              <div className="voice-card-header">
                <span className="voice-icon">{vp.icon}</span>
                <div>
                  <strong>{vp.name}</strong>
                  {config?.defaultProvider === vp.id && <span className="badge ok" style={{ marginLeft: "8px" }}>Active</span>}
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: "0.8rem" }}>{vp.desc}</p>
                {vp.requiresKey && (
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    {config?.[vp.id as keyof VoiceConfig] && "apiKey" in (config?.[vp.id as keyof VoiceConfig] as Record<string, unknown>)
                      ? "🔑 Configured in config file"
                      : "⚙️ Requires API key"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider-specific settings */}
      <div className="section">
        <h3 className="section-title">Settings</h3>

        {config?.defaultProvider === "openai-realtime" && (
          <div className="card">
            <div className="card-header"><strong>OpenAI Realtime Settings</strong></div>
            <div className="card-body">
              <div className="setting-row">
                <label>Model</label>
                <input className="input" value={config.openaiRealtime.model} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="setting-row">
                <label>Voice</label>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{config.openaiRealtime.voice}</span>
              </div>
            </div>
          </div>
        )}

        {config?.defaultProvider === "gemini-live" && (
          <div className="card">
            <div className="card-header"><strong>Gemini Live Settings</strong></div>
            <div className="card-body">
              <div className="setting-row">
                <label>Model</label>
                <input className="input" value={config.geminiLive.model} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="setting-row">
                <label>Voice</label>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{config.geminiLive.voice}</span>
              </div>
            </div>
          </div>
        )}

        {config?.defaultProvider === "elevenlabs" && (
          <div className="card">
            <div className="card-header"><strong>ElevenLabs Settings</strong></div>
            <div className="card-body">
              <div className="setting-row">
                <label>Voice ID</label>
                <code style={{ color: "var(--accent-3)" }}>{config.elevenlabs.voiceId}</code>
              </div>
            </div>
          </div>
        )}

        {config?.defaultProvider === "system-tts" && (
          <div className="card">
            <div className="card-header"><strong>System TTS Settings</strong></div>
            <div className="card-body">
              <div className="setting-row">
                <label>Rate</label>
                <span style={{ color: "var(--text-muted)" }}>{config.systemTts.rate}x</span>
              </div>
              <div className="setting-row">
                <label>Pitch</label>
                <span style={{ color: "var(--text-muted)" }}>{config.systemTts.pitch}x</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice session info */}
      <div className="section">
        <h3 className="section-title">Status</h3>
        <div className="card">
          <div className="card-body voice-status">
            <div className="voice-status-item">
              <span className="voice-status-icon">🔊</span>
              <div>
                <strong>Active Provider</strong>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  {VOICE_PROVIDERS.find((vp) => vp.id === config?.defaultProvider)?.name ?? "Not configured"}
                </p>
              </div>
            </div>
            <div className="voice-status-item">
              <span className="voice-status-icon">🎤</span>
              <div>
                <strong>Audio Input</strong>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  {config?.defaultProvider === "system-tts" ? "Not supported (TTS only)" : "Supported via WebSocket"}
                </p>
              </div>
            </div>
            <div className="voice-status-item">
              <span className="voice-status-icon">🎧</span>
              <div>
                <strong>Audio Output</strong>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Streaming via WebSocket</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="save-btn">{saving ? "Saving..." : "Save Voice Settings"}</button>

      {toast && <div className={`toast ${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.message}</div>}
    </div>
  );
}

import React, { useState, useEffect } from "react";

export function Config() {
  const [config, setConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((data) => { setConfig(JSON.stringify(data, null, 2)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const isValidJson = (str: string): boolean => {
    try { JSON.parse(str); return true; } catch { return false; }
  };

  const handleSave = async () => {
    if (!isValidJson(config)) {
      showToast("error", "Invalid JSON — please fix syntax errors before saving.");
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: config });
      const data = await resp.json();
      if (resp.ok) {
        showToast("success", "Config saved! Gateway will hot-reload.");
      } else {
        showToast("error", data.error ?? "Failed to save config.");
      }
    } catch {
      showToast("error", "Network error — could not reach gateway.");
    }
    setSaving(false);
  };

  if (loading) return <div className="page"><h1 className="page-title">Configuration</h1><div className="card"><div className="card-body">Loading...</div></div></div>;

  const jsonValid = isValidJson(config);

  return (
    <div className="page">
      <h1 className="page-title">Configuration</h1>
      <p style={{color:'var(--text-secondary)', marginBottom:'16px', fontSize:'0.9rem'}}>
        Edit the gateway configuration. Changes are validated and hot-reloaded on save.
      </p>
      <div style={{position:'relative'}}>
        <textarea
          className="config-editor"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          rows={30}
          spellCheck={false}
        />
        <div style={{position:'absolute', top:'12px', right:'12px'}}>
          <span className={`badge ${jsonValid ? 'ok' : 'error'}`}>
            {jsonValid ? '✓ Valid JSON' : '✕ Invalid JSON'}
          </span>
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || !jsonValid} className="save-btn">
        {saving ? "Saving..." : "Save & Reload"}
      </button>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.message}</div>
      )}
    </div>
  );
}
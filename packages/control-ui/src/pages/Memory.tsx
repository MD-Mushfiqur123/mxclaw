import React, { useState, useEffect, useCallback } from "react";

interface MemoryEntry {
  id: string;
  type: "fact" | "preference" | "entity" | "event" | "instruction" | "general";
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  source?: string;
}

const TYPE_ICONS: Record<string, string> = {
  fact: "📌", preference: "⭐", entity: "👤", event: "📅", instruction: "📋", general: "🧠",
};

const MEMORY_TYPES = ["all", "fact", "preference", "entity", "event", "instruction", "general"];

export function Memory() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newEntry, setNewEntry] = useState({ content: "", type: "general" as MemoryEntry["type"], tags: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => { fetchMemories(); }, []);

  const fetchMemories = useCallback(async () => {
    try {
      const params = typeFilter !== "all" ? `?type=${typeFilter}` : "";
      const resp = await fetch(`/api/memory${params}`);
      if (resp.ok) {
        const data = await resp.json() as MemoryEntry[];
        setEntries(data);
      }
    } catch { /* API may not exist yet */ }
    setLoading(false);
  }, [typeFilter]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      const resp = await fetch(`/api/memory/${id}`, { method: "DELETE" });
      if (resp.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        showToast("success", "Memory deleted");
      }
    } catch { showToast("error", "Failed to delete memory"); }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const resp = await fetch(`/api/memory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (resp.ok) {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, content: editContent, updatedAt: Date.now() } : e)));
        setEditingId(null);
        showToast("success", "Memory updated");
      }
    } catch { showToast("error", "Failed to update memory"); }
  };

  const handleAdd = async () => {
    if (!newEntry.content.trim()) return;
    try {
      const resp = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newEntry.content,
          type: newEntry.type,
          tags: newEntry.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (resp.ok) {
        const created = await resp.json() as MemoryEntry;
        setEntries((prev) => [created, ...prev]);
        setNewEntry({ content: "", type: "general", tags: "" });
        setShowAdd(false);
        showToast("success", "Memory saved!");
      }
    } catch { showToast("error", "Failed to save memory"); }
  };

  const filtered = entries.filter((e) => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.content.toLowerCase().includes(q) && !e.tags.some((t) => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const stats = { total: entries.length, types: MEMORY_TYPES.filter(t => t !== "all").map(t => ({ type: t, count: entries.filter(e => e.type === t).length })) };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Memory / Knowledge Base</h1>
        <button className="btn ok" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "✕ Cancel" : "➕ Add Memory"}</button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: "20px", borderColor: "rgba(129, 140, 248, 0.3)" }}>
          <div className="card-header"><strong>New Memory Entry</strong></div>
          <div className="card-body">
            <div style={{ marginBottom: "12px" }}>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as MemoryEntry["type"] })}
                className="input"
                style={{ marginBottom: "8px", width: "200px" }}
              >
                {MEMORY_TYPES.filter(t => t !== "all").map((t) => (
                  <option key={t} value={t}>{TYPE_ICONS[t] ?? "🧠"} {t}</option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Enter memory content..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                style={{ width: "100%", marginBottom: "8px" }}
              />
              <input
                className="input"
                placeholder="Tags (comma-separated)"
                value={newEntry.tags}
                onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>
            <button className="btn ok" onClick={handleAdd} disabled={!newEntry.content.trim()}>💾 Save</button>
          </div>
        </div>
      )}

      <div className="memory-toolbar">
        <input
          className="input"
          placeholder="Search memories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: "400px" }}
        />
        <div className="filter-chips">
          {MEMORY_TYPES.map((t) => (
            <button
              key={t}
              className={`chip ${typeFilter === t ? "active" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === "all" ? "📋 All" : `${TYPE_ICONS[t] ?? "🧠"} ${t}`}
              {t !== "all" && <span className="chip-count">{entries.filter(e => e.type === t).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-row">
        <span className="stat-chip">🧠 {stats.total} total memories</span>
        {stats.types.filter(t => t.count > 0).slice(0, 4).map((t) => (
          <span key={t.type} className="stat-chip">{TYPE_ICONS[t.type] ?? "🧠"} {t.type}: {t.count}</span>
        ))}
      </div>

      {loading && <div className="card"><div className="card-body">Loading memories...</div></div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <p>{search ? "No memories match your search." : "No memories yet. Your agent will store facts, preferences, and knowledge here over time."}</p>
        </div>
      )}

      {filtered.map((entry) => (
        <div key={entry.id} className="card memory-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.3rem" }}>{TYPE_ICONS[entry.type] ?? "🧠"}</span>
              <div>
                <span className="badge ok" style={{ fontSize: "0.6rem" }}>{entry.type}</span>
                <span className="badge" style={{ fontSize: "0.6rem", marginLeft: "4px", background: "rgba(255,255,255,0.06)" }}>
                  🔍 {entry.accessCount}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn-sm" onClick={() => { setEditingId(entry.id); setEditContent(entry.content); }}>✏️</button>
              <button className="btn-sm danger" onClick={() => handleDelete(entry.id)}>🗑️</button>
            </div>
          </div>
          <div className="card-body">
            {editingId === entry.id ? (
              <div>
                <textarea
                  className="input"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn-sm ok" onClick={() => handleSaveEdit(entry.id)}>💾 Save</button>
                  <button className="btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ lineHeight: 1.6 }}>{entry.content}</p>
            )}
            {entry.tags.length > 0 && (
              <div style={{ marginTop: "10px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {entry.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="memory-meta">
              {entry.source && <span>Source: {entry.source}</span>}
              <span>Created {new Date(entry.createdAt).toLocaleDateString()}</span>
              <span>Updated {new Date(entry.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}

      {toast && <div className={`toast ${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.message}</div>}
    </div>
  );
}

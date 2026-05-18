import React, { useState, useEffect } from "react";

interface Session {
  sessionKey: string;
  agentId: string;
  channelId: string;
  senderId: string;
  turnCount: number;
  lastActiveAt: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sessions").then((r) => r.json()).then((data) => { setSessions(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleReset = async (sessionKey: string) => {
    await fetch("/api/session/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: "default", sessionKey }),
    });
    setSessions((prev) => prev.filter((s) => s.sessionKey !== sessionKey));
    setConfirmKey(null);
  };

  if (loading) return <div className="page"><h1 className="page-title">Sessions</h1><div className="card"><div className="card-body">Loading...</div></div></div>;

  return (
    <div className="page">
      <h1 className="page-title">Sessions</h1>
      {sessions.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📝</div><p>No active sessions.</p></div>
      )}
      {sessions.map((s) => (
        <div key={s.sessionKey} className="card">
          <div className="card-header">
            <div>
              <strong style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem'}}>{s.sessionKey}</strong>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'2px'}}>Active {timeAgo(s.lastActiveAt)}</div>
            </div>
            <button onClick={() => setConfirmKey(s.sessionKey)} className="btn-sm danger">Reset</button>
          </div>
          <div className="card-body" style={{display:'flex', gap:'24px', flexWrap:'wrap'}}>
            <div>Agent: <strong style={{color:'var(--accent)'}}>{s.agentId}</strong></div>
            <div>Channel: <strong style={{color:'var(--text)'}}>{s.channelId}</strong></div>
            <div>Turns: <strong style={{color:'var(--text)'}}>{s.turnCount}</strong></div>
          </div>
        </div>
      ))}

      {confirmKey && (
        <div className="confirm-overlay" onClick={() => setConfirmKey(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Session?</h3>
            <p>This will permanently delete the session transcript for <strong>{confirmKey}</strong>. This cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setConfirmKey(null)}>Cancel</button>
              <button className="btn danger" onClick={() => handleReset(confirmKey)}>Reset Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useGatewayStore } from "../store";

interface Approval {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  agentId: string;
  timestamp: number;
  status: string;
}

const TOOL_ICONS: Record<string, string> = {
  bash: "⌨️", browser: "🌐", canvas: "🎨", cron: "⏰",
  session_spawn: "🔄", image_gen: "🖼️", file_read: "📖", file_write: "✏️",
};

export function Approvals() {
  const { approve } = useGatewayStore();
  const [approvals, setApprovals] = useState<Approval[]>([]);

  useEffect(() => {
    const fetchApprovals = () => {
      fetch("/api/approvals").then((r) => r.json()).then(setApprovals).catch(() => {});
    };
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Pending Approvals</h1>
      {approvals.length === 0 && (
        <div className="empty-state"><div className="empty-icon">✅</div><p>No pending approvals. All clear!</p></div>
      )}
      {approvals.map((a) => (
        <div key={a.id} className="card">
          <div className="card-header">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <span style={{fontSize:'1.4rem'}}>{TOOL_ICONS[a.tool] ?? "🔧"}</span>
              <div>
                <strong>{a.tool}</strong>
                <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>Agent: {a.agentId}</div>
              </div>
            </div>
            <span className="badge warning">Pending</span>
          </div>
          <div className="card-body">
            <div style={{marginBottom:'8px', fontSize:'0.75rem', color:'var(--text-muted)'}}>
              Requested {new Date(a.timestamp).toLocaleString()}
            </div>
            <pre>{JSON.stringify(a.args, null, 2)}</pre>
          </div>
          <div className="card-actions">
            <button onClick={() => approve(a.id, true)} className="btn ok">✓ Approve</button>
            <button onClick={() => approve(a.id, false)} className="btn danger">✕ Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}
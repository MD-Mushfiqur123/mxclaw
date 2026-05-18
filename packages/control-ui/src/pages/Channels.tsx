import React from "react";
import { useGatewayStore } from "../store";

const CHANNEL_ICONS: Record<string, string> = {
  discord: "🎮", telegram: "✈️", slack: "💼", whatsapp: "📱",
  matrix: "🔗", signal: "🔒", imessage: "🍎", feishu: "🐦",
  irc: "📺", mattermost: "🔵", googlechat: "💚", teams: "🟣",
  nextcloud: "☁️", line: "🟢",
};

export function Channels() {
  const { status } = useGatewayStore();

  return (
    <div className="page">
      <h1 className="page-title">Channels</h1>
      {(!status || status.channels.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <p>No channels configured. Add channels in the config or via CLI.</p>
        </div>
      )}
      {status?.channels.map((ch) => (
        <div key={ch.id} className="card">
          <div className="card-header">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <span className="channel-icon">{CHANNEL_ICONS[ch.type] ?? "📡"}</span>
              <div>
                <strong>{ch.id}</strong>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{ch.type}</div>
              </div>
            </div>
            <span className={`badge ${ch.connected ? "ok" : "error"}`}>
              {ch.connected ? "● Connected" : "○ Offline"}
            </span>
          </div>
          <div className="card-body" style={{display:'flex', gap:'24px'}}>
            <div>Messages: <strong style={{color:'var(--text)'}}>{ch.messageCount}</strong></div>
            <div>Queue: <strong style={{color: ch.queueSize > 0 ? 'var(--warning)' : 'var(--text)'}}>{ch.queueSize}</strong></div>
          </div>
        </div>
      ))}
    </div>
  );
}
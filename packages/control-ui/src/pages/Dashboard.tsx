import React from "react";
import { useGatewayStore } from "../store";

export function Dashboard() {
  const { status, connected } = useGatewayStore();

  if (!connected) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="card warning">
          <div className="card-header"><strong>⚠️ Gateway Offline</strong></div>
          <div className="card-body">Not connected to gateway. Make sure the gateway is running on port 18700.</div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="card"><div className="card-body">Loading status...</div></div>
      </div>
    );
  }

  const connectedChannels = status.channels.filter((c) => c.connected).length;
  const totalChannels = status.channels.length;
  const availableProviders = status.providers.filter((p) => p.available).length;
  const totalProviders = status.providers.length;
  const memPercent = status.memoryUsage.heapTotal > 0
    ? Math.round((status.memoryUsage.heapUsed / status.memoryUsage.heapTotal) * 100) : 0;

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{formatUptime(status.uptime)}</div>
          <div className="stat-label">Uptime</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📡</div>
          <div className="stat-value">{connectedChannels}<span style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>/{totalChannels}</span></div>
          <div className="stat-label">Channels</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">{availableProviders}<span style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>/{totalProviders}</span></div>
          <div className="stat-label">Providers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{status.activeSessions}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-value">{status.deviceCount}</div>
          <div className="stat-label">Devices</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <div className="stat-value">{formatBytes(status.memoryUsage.heapUsed)}</div>
          <div className="stat-label">Memory ({memPercent}%)</div>
          <div className="memory-bar"><div className="memory-bar-fill" style={{width: `${memPercent}%`}} /></div>
        </div>
      </div>

      {status.pluginErrors.length > 0 && (
        <div className="section">
          <h3 className="section-title">⚠️ Plugin Errors</h3>
          {status.pluginErrors.map((err, i) => (
            <div key={i} className="card error">
              <div className="card-header"><strong>{err.plugin}</strong><span className="badge error">Error</span></div>
              <div className="card-body">{err.error}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <h3 className="section-title">Channels</h3>
        <div className="card" style={{padding: 0, overflow:'hidden'}}>
          <table>
            <thead><tr><th>Channel</th><th>Type</th><th>Status</th><th>Messages</th><th>Queue</th></tr></thead>
            <tbody>
              {status.channels.map((ch) => (
                <tr key={ch.id}>
                  <td style={{fontWeight: 500}}>{ch.id}</td>
                  <td>{ch.type}</td>
                  <td><span className={`badge ${ch.connected ? "ok" : "error"}`}>{ch.connected ? "Connected" : "Offline"}</span></td>
                  <td>{ch.messageCount}</td>
                  <td>{ch.queueSize > 0 ? <span style={{color:'var(--warning)'}}>{ch.queueSize}</span> : '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {status.providers.length > 0 && (
        <div className="section">
          <h3 className="section-title">Providers</h3>
          <div className="card" style={{padding: 0, overflow:'hidden'}}>
            <table>
              <thead><tr><th>Provider</th><th>Model</th><th>Status</th></tr></thead>
              <tbody>
                {status.providers.map((p, i) => (
                  <tr key={i}>
                    <td style={{fontWeight: 500}}>{p.provider}</td>
                    <td style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem'}}>{p.model}</td>
                    <td><span className={`badge ${p.available ? "ok" : "error"}`}>{p.available ? "Available" : "Unavailable"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatUptime(ms: number): string {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
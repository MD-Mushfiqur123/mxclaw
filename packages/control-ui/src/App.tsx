import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, NavLink } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { Config } from "./pages/Config";
import { Channels } from "./pages/Channels";
import { Sessions } from "./pages/Sessions";
import { Approvals } from "./pages/Approvals";
import { Skills } from "./pages/Skills";
import { Memory } from "./pages/Memory";
import { Providers } from "./pages/Providers";
import { Voice } from "./pages/Voice";
import { useGatewayStore } from "./store";

export function App() {
  const { connected, connect, status } = useGatewayStore();
  const [approvalCount, setApprovalCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { connect(); }, [connect]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/approvals").then(r => r.json()).then((data: unknown[]) => setApprovalCount(data.length)).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app">
      <button className="mobile-toggle" onClick={() => setSidebarOpen((p) => !p)}>
        {sidebarOpen ? "✕" : "☰"}
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <nav className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🦞 mxclaw</span>
          <span className={`status-indicator ${connected ? "connected" : "disconnected"}`} />
        </div>
        <NavLink to="/" end onClick={closeSidebar}><span className="nav-icon">📊</span> Dashboard</NavLink>
        <NavLink to="/chat" onClick={closeSidebar}><span className="nav-icon">💬</span> Chat</NavLink>
        <NavLink to="/channels" onClick={closeSidebar}><span className="nav-icon">📡</span> Channels</NavLink>
        <NavLink to="/sessions" onClick={closeSidebar}><span className="nav-icon">📝</span> Sessions</NavLink>
        <NavLink to="/approvals" onClick={closeSidebar}>
          <span className="nav-icon">🔐</span> Approvals
          {approvalCount > 0 && <span className="approval-badge">{approvalCount}</span>}
        </NavLink>
        <NavLink to="/skills" onClick={closeSidebar}><span className="nav-icon">🧩</span> Skills</NavLink>
        <NavLink to="/memory" onClick={closeSidebar}><span className="nav-icon">🧠</span> Memory</NavLink>
        <NavLink to="/providers" onClick={closeSidebar}><span className="nav-icon">🤖</span> Providers</NavLink>
        <NavLink to="/voice" onClick={closeSidebar}><span className="nav-icon">🎤</span> Voice</NavLink>
        <NavLink to="/config" onClick={closeSidebar}><span className="nav-icon">⚙️</span> Config</NavLink>
        <div className="sidebar-footer">
          <span>v0.1.1</span>
          {status && <span>Uptime: {formatUptime(status.uptime)}</span>}
        </div>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </main>
    </div>
  );
}

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
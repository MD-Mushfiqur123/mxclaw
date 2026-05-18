import React, { useState, useEffect } from "react";

interface Skill {
  name: string;
  description: string;
  triggers: string[];
  tools: string[];
  enabled: boolean;
  filePath: string;
}

const SKILL_TEMPLATES = [
  {
    name: "web-researcher",
    content: `---
name: Web Researcher
description: Expert at finding and synthesizing information from the web
triggers: [search, find, lookup, research, what is]
tools: [web_search, web_fetch]
---

# Web Researcher

When asked to find information, follow this process:
1. Use \`web_search\` to find relevant results for the query
2. Use \`web_fetch\` on the most promising URLs to read full content
3. Synthesize the information into a clear, well-sourced answer
4. Always cite your sources with URLs

Be thorough but concise. Prefer recent sources over older ones.`,
  },
  {
    name: "code-reviewer",
    content: `---
name: Code Reviewer
description: Reviews code for quality, security, and best practices
triggers: [review, audit, check code, code review]
tools: [file_read, bash]
---

# Code Reviewer

When reviewing code:
1. Read the file(s) using \`file_read\`
2. Check for: security vulnerabilities, performance issues, code style, error handling
3. Run linters if available using \`bash\`
4. Provide specific, actionable feedback with line numbers
5. Rate the code quality on a 1-10 scale`,
  },
];

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplate, setShowTemplate] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = () => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => { setSkills(data); setLoading(false); })
      .catch(() => { setSkills([]); setLoading(false); });
  };

  const toggleSkill = async (name: string, enabled: boolean) => {
    try {
      await fetch("/api/skills/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, enabled }),
      });
      setSkills((prev) => prev.map((s) => (s.name === name ? { ...s, enabled } : s)));
      showToastMsg("success", `Skill "${name}" ${enabled ? "enabled" : "disabled"}`);
    } catch {
      showToastMsg("error", "Failed to toggle skill");
    }
  };

  const showToastMsg = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Skills</h1>
        <div className="card"><div className="card-body">Loading skills...</div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Skills</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>
        Skills extend your agent's capabilities with specialized behaviors. Each skill is a <code style={{ color: "var(--accent-3)", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>SKILL.md</code> file in your workspace.
      </p>

      {skills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧩</div>
          <p>No skills found. Create a <code>SKILL.md</code> in <code>~/.mxclaw/workspace/skills/&lt;name&gt;/</code></p>
          <button
            onClick={() => setShowTemplate(!showTemplate)}
            style={{ marginTop: "16px" }}
            className="btn ok"
          >
            📄 View Skill Templates
          </button>
        </div>
      ) : (
        <div>
          {skills.map((skill) => (
            <div key={skill.name} className="card" style={{ opacity: skill.enabled ? 1 : 0.6 }}>
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.5rem" }}>🧩</span>
                  <div>
                    <strong>{skill.name}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {skill.description || "No description"}
                    </div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={skill.enabled}
                    onChange={(e) => toggleSkill(skill.name, e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="card-body" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Triggers: </span>
                  {skill.triggers.map((t) => (
                    <span key={t} className="badge ok" style={{ marginRight: "4px", fontSize: "0.65rem" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Tools: </span>
                  {skill.tools.map((t) => (
                    <span key={t} className="badge warning" style={{ marginRight: "4px", fontSize: "0.65rem" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setShowTemplate(!showTemplate)} className="btn" style={{ marginTop: "8px" }}>
            📄 {showTemplate ? "Hide" : "Show"} Templates
          </button>
        </div>
      )}

      {showTemplate && (
        <div style={{ marginTop: "24px" }}>
          <h3 className="section-title">Skill Templates</h3>
          {SKILL_TEMPLATES.map((tmpl) => (
            <div key={tmpl.name} className="card">
              <div className="card-header">
                <strong>{tmpl.name}/SKILL.md</strong>
                <button
                  className="btn-sm ok"
                  onClick={() => {
                    navigator.clipboard.writeText(tmpl.content);
                    showToastMsg("success", "Template copied to clipboard!");
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <div className="card-body">
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.75rem" }}>{tmpl.content}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}
    </div>
  );
}

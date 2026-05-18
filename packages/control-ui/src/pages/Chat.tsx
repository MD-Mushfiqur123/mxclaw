import React, { useState, useRef, useEffect, useMemo } from "react";
import { useGatewayStore } from "../store";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/**
 * Simple markdown-to-HTML renderer for chat messages.
 * Supports: **bold**, *italic*, `code`, ```code blocks```, [links](url), headers, lists.
 */
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre class="md-code-block" data-lang="${lang}"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="md-h">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="md-h">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="md-h">$1</h2>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Unordered lists
  html = html.replace(/^[\s]*[-*] (.+)$/gm, '<li class="md-li">$1</li>');

  // Line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
}

export function Chat() {
  const { connected, sendChat, ws, status } = useGatewayStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("default");
  const messagesEnd = useRef<HTMLDivElement>(null);

  // Get available agents from status
  const agents = useMemo(() => {
    // Default agent always available
    return ["default"];
  }, [status]);

  useEffect(() => {
    if (!ws) return;
    const handler = (event: MessageEvent) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "chat:token") setStreamingContent((prev) => prev + msg.token);
      if (msg.type === "chat:done") {
        setMessages((prev) => [...prev, { role: "assistant", content: msg.fullText, timestamp: Date.now() }]);
        setStreamingContent("");
      }
      if (msg.type === "chat:error") {
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ Error: ${msg.error}`, timestamp: Date.now() }]);
        setStreamingContent("");
      }
    };
    ws.addEventListener("message", handler);
    return () => ws.removeEventListener("message", handler);
  }, [ws]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input, timestamp: Date.now() }]);
    sendChat(selectedAgent, input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page chat-page">
      <div className="chat-header">
        <h1 className="page-title">Chat</h1>
        <div className="chat-agent-selector">
          <label htmlFor="agent-select">Agent:</label>
          <select
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="agent-select"
          >
            {agents.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <span className={`status-dot ${connected ? "online" : "offline"}`} />
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !streamingContent && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Send a message to start chatting with your agent.</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Agent: <strong style={{ color: "var(--accent)" }}>{selectedAgent}</strong>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="chat-role">{msg.role === "user" ? "You" : "🦞 mxclaw"}</div>
            <div
              className="chat-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
            <div className="chat-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}

        {streamingContent && (
          <div className="chat-message assistant streaming">
            <div className="chat-role">🦞 mxclaw</div>
            <div
              className="chat-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
            />
            <span className="cursor">▊</span>
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? `Message ${selectedAgent}...` : "Connect to gateway first..."}
          disabled={!connected}
          autoFocus
        />
        <button
          onClick={handleSend}
          disabled={!connected || !input.trim() || !!streamingContent}
          className={streamingContent ? "btn-sending" : ""}
        >
          {streamingContent ? "..." : "Send →"}
        </button>
      </div>
    </div>
  );
}
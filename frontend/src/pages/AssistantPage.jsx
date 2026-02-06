import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import ChatBubble from "../components/ChatBubble";
import { sendChat, streamChat } from "../services/aiService";

const quickActions = [
  "Summarize my week",
  "How was my mood this month?",
  "Give me advice",
  "Highlight important memories",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", message: "Hi! I can surface insights from your journal. Try a prompt below." },
  ]);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState("");

  const handleSend = async (text) => {
    const content = text || prompt;
    if (!content) return;
    setMessages((prev) => [...prev, { role: "user", message: content }]);
    setPrompt("");
    setStreaming(true);
    setStatus("Streaming response…");
    const index = Date.now();
    setMessages((prev) => [...prev, { role: "assistant", message: "", id: index }]);
    try {
      await streamChat(content, (delta) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === index ? { ...msg, message: `${msg.message}${delta}` } : msg
          )
        );
      });
    } catch (err) {
      const reply = await sendChat(content);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === index ? { ...msg, message: reply.response } : msg))
      );
      setStatus("Recovered via fallback.");
    } finally {
      setStreaming(false);
      setTimeout(() => setStatus(""), 1500);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="AI Copilot" subtitle="Ask for reflections, summaries, and guidance." />
      <div className="card glass space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs text-slate-600"
              onClick={() => handleSend(action)}
            >
              {action}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {messages.map((msg, idx) => (
            <ChatBubble key={`${msg.role}-${idx}`} role={msg.role} message={msg.message} />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask LifeLens..."
            className="flex-1 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm"
          />
          <button
            onClick={() => handleSend()}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white"
            disabled={streaming}
          >
            {streaming ? "Thinking..." : "Send"}
          </button>
        </div>
        {status && <p className="text-xs text-slate-400">{status}</p>}
      </div>
    </div>
  );
}

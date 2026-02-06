import { apiFetch } from "./api";

export function fetchInsights() {
  return apiFetch("/ai/insights");
}

export function generateWeekly() {
  return apiFetch("/ai/weekly", { method: "POST" });
}

export function fetchMoodTrendInsight() {
  return apiFetch("/ai/mood-trend", { method: "POST" });
}

export function sendChat(prompt) {
  return apiFetch("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function streamChat(prompt, onDelta) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("lifelens_token");
  const res = await fetch(`${API_URL}/ai/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Streaming failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    parts.forEach((part) => {
      const line = part.trim();
      if (!line.startsWith("data:")) return;
      const json = line.replace("data:", "").trim();
      if (!json) return;
      const payload = JSON.parse(json);
      if (payload.delta) onDelta(payload.delta);
    });
  }
}

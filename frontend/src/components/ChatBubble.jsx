import React from "react";

export default function ChatBubble({ role, message }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow ${
          isUser ? "bg-slate-900 text-white" : "bg-white/80 text-slate-700"
        }`}
      >
        {message}
      </div>
    </div>
  );
}


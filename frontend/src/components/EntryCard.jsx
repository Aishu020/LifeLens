import React from "react";
import { motion } from "framer-motion";

export default function EntryCard({ entry }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card glass overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative">
        {entry.image_url && (
          <img src={entry.image_url} alt={entry.title} className="h-48 w-full object-cover" />
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold">
          <span>{entry.mood_emoji || "✨"}</span>
          <span>{entry.mood_label || "Balanced"}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
          <span className="font-semibold text-slate-700">
            {entry.author_name ? `${entry.author_name} · ` : ""}
            {entry.location || "Anywhere"}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-ink">{entry.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{entry.summary || entry.content}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags?.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

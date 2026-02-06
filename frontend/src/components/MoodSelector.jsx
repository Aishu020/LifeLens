import React from "react";

const moods = [
  { id: "mood_calm", emoji: "😌", label: "Calm" },
  { id: "mood_happy", emoji: "😊", label: "Happy" },
  { id: "mood_focus", emoji: "🎯", label: "Focused" },
  { id: "mood_tired", emoji: "😴", label: "Tired" },
  { id: "mood_stress", emoji: "😵‍💫", label: "Stressed" },
];

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {moods.map((mood) => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onChange(mood)}
          className={`rounded-2xl border px-2 py-3 text-center text-sm transition ${
            value?.id === mood.id ? "border-indigo-400 bg-white shadow-glow" : "border-white/60 bg-white/70"
          }`}
        >
          <div className="text-lg">{mood.emoji}</div>
          <div className="mt-1 text-[10px] text-slate-500">{mood.label}</div>
        </button>
      ))}
    </div>
  );
}


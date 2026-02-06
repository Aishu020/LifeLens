import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { generateWeekly } from "../services/aiService";

export default function WeeklyReflectionPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const data = await generateWeekly();
    setReport(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Weekly Reflection"
        subtitle="A calm, AI-generated summary of your week."
        action={
          <button
            onClick={handleGenerate}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        }
      />
      {report && (
        <div className="card glass space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Summary</p>
          <h3 className="text-2xl font-semibold text-ink">{report.title}</h3>
          <p className="text-slate-600">{report.content}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-700">Highlights</p>
              <p className="mt-2 text-sm text-slate-500">Moments of focus and calm anchored your week.</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-700">Suggestions</p>
              <p className="mt-2 text-sm text-slate-500">Block a 30-minute rest window mid-week.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


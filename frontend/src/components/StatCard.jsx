import React from "react";

export default function StatCard({ label, value, helper }) {
  return (
    <div className="card glass p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold text-ink">{value}</h3>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}


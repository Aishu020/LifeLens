import React, { useMemo, useState } from "react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function buildCalendarCells(data, month, year) {
  const map = new Map(data.map((d) => [d.day, d.count]));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ key: `empty-${i}`, empty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = date.toISOString().slice(0, 10);
    cells.push({ key, count: map.get(key) || 0 });
  }

  return cells;
}

export default function Heatmap({ data }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const years = useMemo(() => {
    const yearSet = new Set(data.map((item) => new Date(item.day).getFullYear()));
    yearSet.add(today.getFullYear());
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [data, today]);

  const cells = useMemo(() => buildCalendarCells(data, month, year), [data, month, year]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-sm"
        >
          {months.map((label, idx) => (
            <option key={label} value={idx}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-sm"
        >
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs text-slate-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.key}
            className={`h-8 w-full rounded-md ${cell.empty ? "bg-transparent" : ""}`}
            style={{
              background: cell.empty
                ? "transparent"
                : cell.count === 0
                  ? "rgba(148,163,184,0.15)"
                  : cell.count < 2
                    ? "rgba(129,140,248,0.35)"
                    : "rgba(124,58,237,0.6)",
            }}
            title={cell.empty ? "" : `${cell.key}: ${cell.count} entries`}
          />
        ))}
      </div>
    </div>
  );
}

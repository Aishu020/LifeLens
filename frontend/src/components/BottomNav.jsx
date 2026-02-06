import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Home" },
  { to: "/add", label: "Add" },
  { to: "/analytics", label: "Insights" },
  { to: "/assistant", label: "AI" },
  { to: "/profile", label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-20 w-[92%] max-w-3xl -translate-x-1/2 rounded-[2.2rem] bg-white/85 px-4 py-3 shadow-card backdrop-blur-lg">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 rounded-2xl px-3 py-2 text-center transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-glow"
                  : "hover:bg-white/60 hover:text-slate-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

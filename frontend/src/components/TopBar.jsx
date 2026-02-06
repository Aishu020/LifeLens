import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="px-4 pt-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-3xl bg-white/75 px-5 py-4 shadow-card backdrop-blur-lg">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">LifeLens</p>
          <h1 className="text-lg font-semibold text-ink">
            Welcome back, {user?.name || "Explorer"}
          </h1>
        </div>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full border border-white/50 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow"
        >
          {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
    </header>
  );
}

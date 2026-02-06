import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import EntryCard from "../components/EntryCard";
import Skeleton from "../components/Skeleton";
import { fetchEntries } from "../services/entryService";
import { fetchWorkspaces } from "../services/workspaceService";

export default function DashboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("personal");
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchWorkspaces().then((data) => {
      if (mounted) {
        setWorkspaces(data);
        if (data?.length) setSelectedWorkspace(data[0].id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params =
      scope === "workspace" && selectedWorkspace
        ? { scope: "workspace", workspaceId: selectedWorkspace }
        : {};
    fetchEntries(params)
      .then((data) => {
        if (mounted) setEntries(data);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [scope, selectedWorkspace]);

  return (
    <div className="space-y-8">
      <div className="card glass flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Insight</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Your week is trending upward.</h2>
          <p className="mt-2 text-sm text-slate-500">
            LifeLens noticed a steady rise in focus and calm moments.
          </p>
        </div>
        <Link
          to="/reflection"
          className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-glow"
        >
          View reflection
        </Link>
      </div>
      <SectionHeader
        title="Smart Timeline"
        subtitle="A cinematic feed of your memories and moods."
        action={
          <div className="flex items-center gap-2">
            <button
              className={`rounded-2xl px-3 py-2 text-xs ${
                scope === "personal" ? "bg-slate-900 text-white" : "bg-white/70"
              }`}
              onClick={() => setScope("personal")}
            >
              Personal
            </button>
            <button
              className={`rounded-2xl px-3 py-2 text-xs ${
                scope === "workspace" ? "bg-slate-900 text-white" : "bg-white/70"
              }`}
              onClick={() => setScope("workspace")}
            >
              Workspace
            </button>
            {scope === "workspace" && (
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-72" />
            ))
          : entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import {
  createWorkspace,
  fetchWorkspaces,
  inviteMember,
  fetchMembers,
  removeMember,
  leaveWorkspace,
} from "../services/workspaceService";

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [members, setMembers] = useState([]);
  const [memberRole, setMemberRole] = useState("");

  useEffect(() => {
    apiFetch("/profile").then(setProfile);
    fetchWorkspaces().then((data) => {
      setWorkspaces(data || []);
      if (data?.length) setSelectedWorkspace(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedWorkspace) return;
    fetchMembers(selectedWorkspace).then((data) => {
      setMembers(data.members || []);
      setMemberRole(data.role || "");
    });
  }, [selectedWorkspace]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Profile" subtitle="Manage your LifeLens experience." />
      <div className="card glass p-6">
        <h3 className="text-xl font-semibold text-ink">{profile?.user?.name || "Loading..."}</h3>
        <p className="text-sm text-slate-500">{profile?.user?.email}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Entries</p>
            <p className="mt-2 text-2xl font-semibold">{profile?.stats?.entries || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Last Entry</p>
            <p className="mt-2 text-sm font-semibold">
              {profile?.stats?.lastEntryAt?.slice(0, 10) || "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Plan</p>
            <p className="mt-2 text-sm font-semibold">Premium</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-6 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </div>
      <div className="card glass p-6">
        <h3 className="text-lg font-semibold text-ink">Workspaces</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {workspaces.map((ws) => (
            <span
              key={ws.id}
              className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs"
            >
              {ws.name} · {ws.role}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="New workspace name"
            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm"
          />
          <button
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white"
            onClick={async () => {
              if (!workspaceName) return;
              const created = await createWorkspace(workspaceName);
              const updated = [created, ...workspaces];
              setWorkspaces(updated);
              setWorkspaceName("");
              setSelectedWorkspace(created.id);
            }}
          >
            Create workspace
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite member by email"
            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm"
          />
          <button
            className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm"
            onClick={async () => {
              if (!inviteEmail || !selectedWorkspace) return;
              await inviteMember(selectedWorkspace, inviteEmail);
              setInviteEmail("");
              const data = await fetchMembers(selectedWorkspace);
              setMembers(data.members || []);
            }}
          >
            Invite
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Members</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <span>
                  {member.name} · {member.email} ({member.role})
                </span>
                {memberRole === "owner" && member.role !== "owner" && (
                  <button
                    className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs"
                    onClick={async () => {
                      await removeMember(selectedWorkspace, member.id);
                      const data = await fetchMembers(selectedWorkspace);
                      setMembers(data.members || []);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {memberRole !== "owner" && selectedWorkspace && (
            <button
              className="mt-4 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs"
              onClick={async () => {
                await leaveWorkspace(selectedWorkspace);
                const updated = await fetchWorkspaces();
                setWorkspaces(updated || []);
                setSelectedWorkspace(updated?.[0]?.id || "");
              }}
            >
              Leave workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

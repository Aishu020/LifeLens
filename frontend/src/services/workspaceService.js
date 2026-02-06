import { apiFetch } from "./api";

export function fetchWorkspaces() {
  return apiFetch("/workspaces");
}

export function createWorkspace(name) {
  return apiFetch("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function inviteMember(workspaceId, email) {
  return apiFetch(`/workspaces/${workspaceId}/members`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function fetchMembers(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/members`);
}

export function removeMember(workspaceId, userId) {
  return apiFetch(`/workspaces/${workspaceId}/members/${userId}`, { method: "DELETE" });
}

export function leaveWorkspace(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/leave`, { method: "POST" });
}

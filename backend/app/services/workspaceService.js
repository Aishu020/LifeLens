const { nanoid } = require("nanoid");
const { getDb } = require("../utils/db");

function createWorkspace(ownerId, name) {
  const db = getDb();
  const id = nanoid();
  db.prepare("INSERT INTO workspaces (id, owner_id, name) VALUES (?, ?, ?)").run(
    id,
    ownerId,
    name
  );
  db.prepare(
    "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)"
  ).run(id, ownerId, "owner");
  return getWorkspaceById(id, ownerId);
}

function getWorkspaceById(id, userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT w.id, w.name, w.owner_id, w.created_at, wm.role
       FROM workspaces w
       INNER JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE w.id = ? AND wm.user_id = ?`
    )
    .get(id, userId);
}

function listWorkspaces(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT w.id, w.name, w.owner_id, w.created_at, wm.role
       FROM workspaces w
       INNER JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = ?
       ORDER BY datetime(w.created_at) DESC`
    )
    .all(userId);
}

function addMember(workspaceId, ownerId, email) {
  const db = getDb();
  const workspace = db
    .prepare("SELECT * FROM workspaces WHERE id = ? AND owner_id = ?")
    .get(workspaceId, ownerId);
  if (!workspace) return { error: "Not allowed" };

  const user = db.prepare("SELECT id, email, name FROM users WHERE email = ?").get(email);
  if (!user) return { error: "User not found" };

  db.prepare(
    "INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)"
  ).run(workspaceId, user.id, "member");

  return { workspaceId, user };
}

function isMember(workspaceId, userId) {
  const db = getDb();
  const row = db
    .prepare("SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
    .get(workspaceId, userId);
  return !!row;
}

function listMembers(workspaceId, userId) {
  const db = getDb();
  const membership = db
    .prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
    .get(workspaceId, userId);
  if (!membership) return { error: "Not a member" };

  const members = db
    .prepare(
      `SELECT u.id, u.name, u.email, wm.role
       FROM workspace_members wm
       INNER JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = ?`
    )
    .all(workspaceId);
  return { members, role: membership.role };
}

function removeMember(workspaceId, ownerId, userId) {
  const db = getDb();
  const workspace = db
    .prepare("SELECT * FROM workspaces WHERE id = ? AND owner_id = ?")
    .get(workspaceId, ownerId);
  if (!workspace) return { error: "Not allowed" };
  if (ownerId === userId) return { error: "Owner cannot be removed" };
  db.prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?").run(
    workspaceId,
    userId
  );
  return { success: true };
}

function leaveWorkspace(workspaceId, userId) {
  const db = getDb();
  const member = db
    .prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
    .get(workspaceId, userId);
  if (!member) return { error: "Not a member" };
  if (member.role === "owner") return { error: "Owner cannot leave" };
  db.prepare("DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?").run(
    workspaceId,
    userId
  );
  return { success: true };
}

module.exports = {
  createWorkspace,
  listWorkspaces,
  addMember,
  isMember,
  getWorkspaceById,
  removeMember,
  leaveWorkspace,
  listMembers,
};

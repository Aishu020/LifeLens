const express = require("express");
const { authMiddleware } = require("../utils/auth");
const {
  createWorkspace,
  listWorkspaces,
  addMember,
  removeMember,
  leaveWorkspace,
  listMembers,
} = require("../services/workspaceService");

const router = express.Router();
router.use(authMiddleware);

router.get("/", (req, res) => {
  res.json(listWorkspaces(req.user.id));
});

router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Workspace name required" });
  res.status(201).json(createWorkspace(req.user.id, name));
});

router.post("/:id/members", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Member email required" });
  const result = addMember(req.params.id, req.user.id, email);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.json(result);
});

router.get("/:id/members", (req, res) => {
  const result = listMembers(req.params.id, req.user.id);
  if (result.error) return res.status(403).json({ error: result.error });
  return res.json(result);
});

router.delete("/:id/members/:userId", (req, res) => {
  const result = removeMember(req.params.id, req.user.id, req.params.userId);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.json(result);
});

router.post("/:id/leave", (req, res) => {
  const result = leaveWorkspace(req.params.id, req.user.id);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.json(result);
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const { authMiddleware } = require("../utils/auth");
const {
  createEntry,
  listEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require("../services/entryService");
const { isMember } = require("../services/workspaceService");
const { handleUpload } = require("../services/uploadService");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authMiddleware);

router.get("/", (req, res) => {
  const { scope, workspaceId } = req.query;
  if (scope === "workspace" && workspaceId) {
    if (!isMember(workspaceId, req.user.id)) {
      return res.status(403).json({ error: "Not a workspace member" });
    }
    const entries = listEntries(req.user.id, { workspaceId });
    return res.json(entries);
  }
  const entries = listEntries(req.user.id);
  return res.json(entries);
});

router.get("/:id", (req, res) => {
  const entry = getEntryById(req.user.id, req.params.id);
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  if (entry.workspace_id) {
    if (!isMember(entry.workspace_id, req.user.id)) {
      return res.status(403).json({ error: "Not a workspace member" });
    }
  }
  return res.json(entry);
});

router.post("/", (req, res) => {
  const { workspace_id, is_shared } = req.body;
  if (workspace_id && is_shared) {
    if (!isMember(workspace_id, req.user.id)) {
      return res.status(403).json({ error: "Not a workspace member" });
    }
  }
  const entry = createEntry(req.user.id, req.body);
  res.status(201).json(entry);
});

router.put("/:id", (req, res) => {
  const existing = getEntryById(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: "Entry not found" });
  if (existing.workspace_id && !isMember(existing.workspace_id, req.user.id)) {
    return res.status(403).json({ error: "Not a workspace member" });
  }
  if (req.body.workspace_id && req.body.is_shared) {
    if (!isMember(req.body.workspace_id, req.user.id)) {
      return res.status(403).json({ error: "Not a workspace member" });
    }
  }
  const entry = updateEntry(req.user.id, req.params.id, req.body);
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  return res.json(entry);
});

router.delete("/:id", (req, res) => {
  const existing = getEntryById(req.user.id, req.params.id);
  if (!existing) return res.status(404).json({ error: "Entry not found" });
  if (existing.workspace_id && !isMember(existing.workspace_id, req.user.id)) {
    return res.status(403).json({ error: "Not a workspace member" });
  }
  const ok = deleteEntry(req.user.id, req.params.id);
  if (!ok) return res.status(404).json({ error: "Entry not found" });
  return res.json({ success: true });
});

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  handleUpload(req.file)
    .then((url) => res.json({ url }))
    .catch((err) => res.status(500).json({ error: "Upload failed", detail: err.message }));
});

router.post("/suggestions", (req, res) => {
  const { content = "" } = req.body;
  const moodScore = Math.min(10, Math.max(1, Math.floor(content.length / 50)));
  const moodId =
    moodScore >= 8
      ? "mood_happy"
      : moodScore >= 6
        ? "mood_focus"
        : moodScore >= 4
          ? "mood_calm"
          : "mood_tired";
  res.json({
    title: content.slice(0, 40) || "Untitled Entry",
    moodScore,
    moodId,
    tags: ["reflection", "growth", "gratitude"].slice(0, 2),
  });
});

module.exports = router;

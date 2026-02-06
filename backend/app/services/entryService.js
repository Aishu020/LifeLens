const { nanoid } = require("nanoid");
const { getDb } = require("../utils/db");
const { ensureStreak } = require("./userService");

function upsertTags(tags) {
  if (!tags || !tags.length) return [];
  const db = getDb();
  const results = [];
  const insert = db.prepare("INSERT INTO tags (id, label, color) VALUES (?, ?, ?)");
  const find = db.prepare("SELECT id, label, color FROM tags WHERE label = ?");

  tags.forEach((tag) => {
    const existing = find.get(tag.label);
    if (existing) {
      results.push(existing);
      return;
    }
    const id = nanoid();
    insert.run(id, tag.label, tag.color || "#A1A1AA");
    results.push({ id, label: tag.label, color: tag.color || "#A1A1AA" });
  });

  return results;
}

function linkEntryTags(entryId, tags) {
  if (!tags || !tags.length) return;
  const db = getDb();
  const insert = db.prepare(
    "INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)"
  );
  tags.forEach((tag) => {
    insert.run(entryId, tag.id);
  });
}

function createEntry(userId, payload) {
  const db = getDb();
  const entryId = nanoid();
  const {
    title,
    content,
    mood_id,
    mood_score = 0,
    summary = "",
    image_url = "",
    location = "",
    workspace_id = null,
    is_shared = 0,
    tags = [],
  } = payload;

  db.prepare(
    `INSERT INTO entries
      (id, user_id, workspace_id, title, content, mood_id, mood_score, summary, image_url, location, is_shared)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entryId,
    userId,
    workspace_id,
    title,
    content,
    mood_id,
    mood_score,
    summary,
    image_url,
    location,
    is_shared ? 1 : 0
  );

  const savedTags = upsertTags(tags);
  linkEntryTags(entryId, savedTags);

  // Update streak
  const streak = ensureStreak(userId);
  const today = new Date().toISOString().slice(0, 10);
  const lastDateValue = streak.last_entry_date ? streak.last_entry_date.slice(0, 10) : null;
  if (lastDateValue !== today) {
    const lastDate = lastDateValue ? new Date(lastDateValue) : null;
    const diff =
      lastDate ? Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24)) : null;
    const nextStreak = diff === 1 ? streak.current_streak + 1 : 1;
    const nextLongest = Math.max(streak.longest_streak, nextStreak);
    db.prepare(
      "UPDATE streaks SET current_streak = ?, longest_streak = ?, last_entry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
    ).run(nextStreak, nextLongest, today, userId);
  }

  return getEntryById(userId, entryId);
}

function getEntryById(userId, entryId) {
  const db = getDb();
  const entry = db
    .prepare(
      `SELECT e.*, m.label as mood_label, m.emoji as mood_emoji, m.color as mood_color
       FROM entries e
       LEFT JOIN moods m ON e.mood_id = m.id
       WHERE e.id = ? AND e.user_id = ?`
    )
    .get(entryId, userId);
  if (!entry) return null;

  const tags = db
    .prepare(
      `SELECT t.id, t.label, t.color
       FROM tags t
       INNER JOIN entry_tags et ON t.id = et.tag_id
       WHERE et.entry_id = ?`
    )
    .all(entryId);
  return { ...entry, tags };
}

function listEntries(userId, options = {}) {
  const db = getDb();
  const { workspaceId } = options;
  let entries = [];

  if (workspaceId) {
    entries = db
      .prepare(
        `SELECT e.*, u.name as author_name, m.label as mood_label, m.emoji as mood_emoji, m.color as mood_color
         FROM entries e
         LEFT JOIN moods m ON e.mood_id = m.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE e.workspace_id = ? AND e.is_shared = 1
         ORDER BY datetime(e.created_at) DESC`
      )
      .all(workspaceId);
  } else {
    entries = db
      .prepare(
        `SELECT e.*, m.label as mood_label, m.emoji as mood_emoji, m.color as mood_color
         FROM entries e
         LEFT JOIN moods m ON e.mood_id = m.id
         WHERE e.user_id = ?
         ORDER BY datetime(e.created_at) DESC`
      )
      .all(userId);
  }

  return entries.map((entry) => ({
    ...entry,
    tags: db
      .prepare(
        `SELECT t.id, t.label, t.color
         FROM tags t
         INNER JOIN entry_tags et ON t.id = et.tag_id
         WHERE et.entry_id = ?`
      )
      .all(entry.id),
  }));
}

function updateEntry(userId, entryId, payload) {
  const db = getDb();
  const existing = getEntryById(userId, entryId);
  if (!existing) return null;

  const {
    title = existing.title,
    content = existing.content,
    mood_id = existing.mood_id,
    mood_score = existing.mood_score,
    summary = existing.summary,
    image_url = existing.image_url,
    location = existing.location,
    workspace_id = existing.workspace_id,
    is_shared = existing.is_shared,
    tags = existing.tags,
  } = payload;

  db.prepare(
    `UPDATE entries
     SET title = ?, content = ?, mood_id = ?, mood_score = ?, summary = ?,
         image_url = ?, location = ?, workspace_id = ?, is_shared = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`
  ).run(
    title,
    content,
    mood_id,
    mood_score,
    summary,
    image_url,
    location,
    workspace_id,
    is_shared ? 1 : 0,
    entryId,
    userId
  );

  db.prepare("DELETE FROM entry_tags WHERE entry_id = ?").run(entryId);
  const savedTags = upsertTags(tags);
  linkEntryTags(entryId, savedTags);

  return getEntryById(userId, entryId);
}

function deleteEntry(userId, entryId) {
  const db = getDb();
  db.prepare("DELETE FROM entry_tags WHERE entry_id = ?").run(entryId);
  const result = db.prepare("DELETE FROM entries WHERE id = ? AND user_id = ?").run(entryId, userId);
  return result.changes > 0;
}

module.exports = {
  createEntry,
  listEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};

const { getDb } = require("../utils/db");

function getProfile(userId) {
  const db = getDb();
  const user = db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").get(userId);
  const entryCount = db.prepare("SELECT COUNT(*) as count FROM entries WHERE user_id = ?").get(userId);
  const lastEntry = db
    .prepare("SELECT created_at FROM entries WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 1")
    .get(userId);

  return {
    user,
    stats: {
      entries: entryCount ? entryCount.count : 0,
      lastEntryAt: lastEntry ? lastEntry.created_at : null,
    },
  };
}

module.exports = { getProfile };


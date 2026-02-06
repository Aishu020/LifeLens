const { getDb } = require("../utils/db");
const { ensureStreak } = require("./userService");

function getMoodTrend(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT date(created_at) as day, AVG(mood_score) as avg_score
       FROM entries
       WHERE user_id = ?
       GROUP BY date(created_at)
       ORDER BY date(created_at) ASC`
    )
    .all(userId);
}

function getMoodDistribution(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT m.label as label, m.emoji as emoji, COUNT(*) as count
       FROM entries e
       LEFT JOIN moods m ON e.mood_id = m.id
       WHERE e.user_id = ?
       GROUP BY e.mood_id
       ORDER BY count DESC`
    )
    .all(userId);
}

function getHeatmap(userId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT date(created_at) as day, COUNT(*) as count
       FROM entries
       WHERE user_id = ?
       GROUP BY date(created_at)`
    )
    .all(userId);
}

function getStreak(userId) {
  const db = getDb();
  const streak = ensureStreak(userId);
  return db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId) || streak;
}

module.exports = { getMoodTrend, getMoodDistribution, getHeatmap, getStreak };


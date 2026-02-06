const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const { getDb } = require("../utils/db");

function createUser({ email, password, name }) {
  const db = getDb();
  const id = nanoid();
  const passwordHash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(
    "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)"
  );
  stmt.run(id, email, passwordHash, name);
  return { id, email, name };
}

function findUserByEmail(email) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

function getUserById(id) {
  const db = getDb();
  return db.prepare("SELECT id, email, name, created_at FROM users WHERE id = ?").get(id);
}

function ensureStreak(userId) {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId);
  if (existing) return existing;
  const id = nanoid();
  db.prepare(
    "INSERT INTO streaks (id, user_id, current_streak, longest_streak) VALUES (?, ?, 0, 0)"
  ).run(id, userId);
  return db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId);
}

module.exports = { createUser, findUserByEmail, getUserById, ensureStreak };


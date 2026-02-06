require("dotenv").config();
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const { initDb, getDb } = require("./db");

async function seed() {
  await initDb();
  const db = getDb();

  const moods = [
    { id: "mood_calm", label: "Calm", emoji: "😌", color: "#9AE6B4" },
    { id: "mood_happy", label: "Happy", emoji: "😊", color: "#FBD38D" },
    { id: "mood_focus", label: "Focused", emoji: "🎯", color: "#90CDF4" },
    { id: "mood_tired", label: "Tired", emoji: "😴", color: "#E2E8F0" },
    { id: "mood_stress", label: "Stressed", emoji: "😵‍💫", color: "#FEB2B2" },
  ];

  db.prepare("DELETE FROM moods").run();
  db.prepare("DELETE FROM users").run();
  db.prepare("DELETE FROM entries").run();
  db.prepare("DELETE FROM tags").run();
  db.prepare("DELETE FROM entry_tags").run();
  db.prepare("DELETE FROM ai_insights").run();
  db.prepare("DELETE FROM streaks").run();
  db.prepare("DELETE FROM workspace_members").run();
  db.prepare("DELETE FROM workspaces").run();

  const userId = nanoid();
  db.prepare("INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)")
    .run(userId, "demo@lifelens.ai", bcrypt.hashSync("password123", 10), "Aisha Patel");

  const insertMood = db.prepare("INSERT INTO moods (id, label, emoji, color) VALUES (?, ?, ?, ?)");
  moods.forEach((mood) => insertMood.run(mood.id, mood.label, mood.emoji, mood.color));

  const entryStmt = db.prepare(
    `INSERT INTO entries (id, user_id, workspace_id, title, content, mood_id, mood_score, summary, image_url, location, is_shared, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const workspaceId = nanoid();
  db.prepare("INSERT INTO workspaces (id, owner_id, name) VALUES (?, ?, ?)")
    .run(workspaceId, userId, "LifeLens Studio");
  db.prepare(
    "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)"
  ).run(workspaceId, userId, "owner");

  const now = new Date();
  const sampleEntries = [
    {
      title: "Sunrise Ritual",
      content: "Started the morning with a sunrise walk and a clear intention.",
      mood_id: "mood_calm",
      mood_score: 8,
      summary: "A grounding sunrise walk with intentional breathing.",
      image_url: "/uploads/placeholder.svg",
      location: "Seattle, WA",
      daysAgo: 1,
    },
    {
      title: "Deep Work Session",
      content: "Lost track of time while building the LifeLens timeline experience.",
      mood_id: "mood_focus",
      mood_score: 9,
      summary: "Focused sprint on premium UI work.",
      image_url: "/uploads/placeholder.svg",
      location: "Home studio",
      daysAgo: 2,
    },
    {
      title: "Quiet Evening",
      content: "Read a few pages, journaled, and shut screens early.",
      mood_id: "mood_happy",
      mood_score: 7,
      summary: "Calm evening with a tech detox.",
      image_url: "/uploads/placeholder.svg",
      location: "Living room",
      daysAgo: 4,
    },
  ];

  sampleEntries.forEach((entry) => {
    const createdAt = new Date(now.getTime() - entry.daysAgo * 86400000).toISOString();
    entryStmt.run(
      nanoid(),
      userId,
      workspaceId,
      entry.title,
      entry.content,
      entry.mood_id,
      entry.mood_score,
      entry.summary,
      entry.image_url,
      entry.location,
      1,
      createdAt
    );
  });

  db.prepare(
    "INSERT INTO streaks (id, user_id, current_streak, longest_streak, last_entry_date) VALUES (?, ?, ?, ?, ?)"
  ).run(nanoid(), userId, 4, 12, now.toISOString());

  // eslint-disable-next-line no-console
  console.log("Seed complete. Demo login: demo@lifelens.ai / password123");
}

seed();

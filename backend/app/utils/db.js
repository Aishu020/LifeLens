const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "lifelens.db");
let db;

async function initDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  const exists = fs.existsSync(dbPath);
  const data = exists ? fs.readFileSync(dbPath) : null;
  const sqlDb = data ? new SQL.Database(new Uint8Array(data)) : new SQL.Database();

  const wrapper = {
    _sql: sqlDb,
    exec: (sql) => sqlDb.exec(sql),
    pragma: () => {},
    prepare: (sql) => createStatement(sqlDb, sql),
  };

  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS moods (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workspace_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      mood_id TEXT,
      mood_score INTEGER DEFAULT 0,
      summary TEXT,
      image_url TEXT,
      location TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (entry_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS ai_insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS streaks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_entry_date TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (workspace_id, user_id)
    );
  `);

  // Light migrations
  const columns = wrapper
    .prepare("PRAGMA table_info(entries)")
    .all()
    .map((c) => c.name);
  if (!columns.includes("workspace_id")) {
    wrapper.exec("ALTER TABLE entries ADD COLUMN workspace_id TEXT");
  }
  if (!columns.includes("is_shared")) {
    wrapper.exec("ALTER TABLE entries ADD COLUMN is_shared INTEGER DEFAULT 0");
  }

  db = wrapper;
  persist();
  return db;
}

function persist() {
  if (!db) return;
  const data = db._sql.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function createStatement(sqlDb, sql) {
  return {
    run: (...params) => {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      persist();
      return { changes: sqlDb.getRowsModified() };
    },
    get: (...params) => {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const row = stmt.step() ? rowFromStmt(stmt) : undefined;
      stmt.free();
      return row;
    },
    all: (...params) => {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(rowFromStmt(stmt));
      }
      stmt.free();
      return rows;
    },
  };
}

function rowFromStmt(stmt) {
  const row = stmt.getAsObject();
  return row;
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

module.exports = { initDb, getDb };

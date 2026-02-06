const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { initDb } = require("./utils/db");
const authRoutes = require("./routes/authRoutes");
const entryRoutes = require("./routes/entryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const profileRoutes = require("./routes/profileRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");

async function createServer() {
  await initDb();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "LifeLens API" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/entries", entryRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/workspaces", workspaceRoutes);

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error", detail: err.message });
  });

  return app;
}

module.exports = { createServer };

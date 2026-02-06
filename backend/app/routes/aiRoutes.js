const express = require("express");
const rateLimit = require("express-rate-limit");
const { authMiddleware } = require("../utils/auth");
const { nanoid } = require("nanoid");
const { getDb } = require("../utils/db");
const {
  generateWeeklyInsight,
  getInsights,
  chatWithAssistant,
  chatWithOpenAI,
  getModel,
  runToolCalling,
} = require("../services/aiService");
const { getOpenAIClient } = require("../utils/openaiClient");

const router = express.Router();
router.use(authMiddleware);
router.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, slow down." },
  })
);

router.get("/insights", (req, res) => {
  res.json(getInsights(req.user.id));
});

router.post("/weekly", (req, res) => {
  const prompt =
    "Summarize my week with a short reflection, emotional insight, highlight, and gentle suggestion.";
  runToolCalling(req.user.id, prompt)
    .then((result) => {
      if (result) {
        if (result.response) {
          const db = getDb();
          db.prepare(
            "INSERT INTO ai_insights (id, user_id, type, title, content) VALUES (?, ?, ?, ?, ?)"
          ).run(nanoid(), req.user.id, "weekly", "Weekly Reflection", result.response);
        }
        return res.json({
          id: "weekly_tool",
          title: "Weekly Reflection",
          content: result.response,
          toolOutputs: result.toolOutputs,
        });
      }
      return generateWeeklyInsight(req.user.id).then((insight) => res.json(insight));
    })
    .catch((err) => res.status(500).json({ error: "AI failed", detail: err.message }));
});

router.post("/mood-trend", (req, res) => {
  const prompt = "Analyze my mood trend and provide a concise insight.";
  runToolCalling(req.user.id, prompt)
    .then((result) => {
      if (result) return res.json({ response: result.response, toolOutputs: result.toolOutputs });
      return res.json(chatWithAssistant(req.user.id, prompt));
    })
    .catch((err) => res.status(500).json({ error: "AI failed", detail: err.message }));
});

router.post("/chat", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  const base = chatWithAssistant(req.user.id, prompt);
  chatWithOpenAI(prompt, base.context)
    .then((response) => {
      if (response) return res.json({ ...base, response });
      return res.json(base);
    })
    .catch(() => res.json(base));
});

router.post("/chat/stream", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const base = chatWithAssistant(req.user.id, prompt);
  const client = getOpenAIClient();

  if (!client) {
    res.write(`data: ${JSON.stringify({ delta: base.response })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  try {
    const stream = await client.responses.create({
      model: getModel(),
      stream: true,
      input: [
        {
          role: "system",
          content:
            "You are LifeLens, a warm, premium journaling assistant. Keep responses concise, supportive, and actionable.",
        },
        {
          role: "user",
          content: `User question: ${prompt}\nRecent entries:\n${base.context
            .map((entry) => `${entry.title} (${entry.mood_score}/10): ${entry.summary || ""}`)
            .join("\n")}`,
        },
      ],
    });

    req.on("close", () => {
      res.end();
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        const delta = event.delta || event.text || event?.data?.delta || "";
        if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
      if (event.type === "response.completed") {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ delta: base.response })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;

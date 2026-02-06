const { nanoid } = require("nanoid");
const { getDb } = require("../utils/db");
const { getOpenAIClient } = require("../utils/openaiClient");
const { getMoodTrend } = require("./analyticsService");

function buildMockInsight(type, entries = []) {
  const recent = entries.slice(0, 3).map((e) => e.title).join(", ");
  const summary = recent
    ? `Recent highlights: ${recent}.`
    : "Your journal is ready for new memories.";
  const advice = "Try a short evening reflection to close your day with intention.";

  return {
    id: nanoid(),
    type,
    title: type === "weekly" ? "Weekly Reflection" : "AI Insight",
    content: `${summary} ${advice}`,
  };
}

function formatEntryContext(entries) {
  return entries
    .map((entry) => `- ${entry.title}: ${entry.content?.slice(0, 200)}`)
    .join("\n");
}

function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

async function generateWeeklyInsight(userId) {
  const db = getDb();
  const entries = db
    .prepare(
      `SELECT title, content, created_at
       FROM entries
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT 10`
    )
    .all(userId);

  const client = getOpenAIClient();
  let insight = buildMockInsight("weekly", entries);

  if (client) {
    const prompt = `
You are LifeLens, an AI journaling assistant. Write a concise weekly reflection with:
- A short summary (2-3 sentences)
- Emotional insight (1 sentence)
- Positive highlight (1 sentence)
- One gentle suggestion (1 sentence)

Entries:
${formatEntryContext(entries)}
    `.trim();

    const response = await client.responses.create({
      model: getModel(),
      input: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    insight = {
      id: nanoid(),
      type: "weekly",
      title: "Weekly Reflection",
      content: response.output_text || response.output?.[0]?.content?.[0]?.text || insight.content,
    };
  }

  db.prepare(
    "INSERT INTO ai_insights (id, user_id, type, title, content) VALUES (?, ?, ?, ?, ?)"
  ).run(insight.id, userId, insight.type, insight.title, insight.content);

  return insight;
}

function getInsights(userId) {
  const db = getDb();
  return db
    .prepare("SELECT * FROM ai_insights WHERE user_id = ? ORDER BY datetime(created_at) DESC")
    .all(userId);
}

function chatWithAssistant(userId, prompt) {
  const db = getDb();
  const entries = db
    .prepare(
      `SELECT title, summary, mood_score
       FROM entries
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT 5`
    )
    .all(userId);

  const averageMood =
    entries.length > 0
      ? Math.round(entries.reduce((acc, e) => acc + (e.mood_score || 0), 0) / entries.length)
      : 0;

  return {
    id: nanoid(),
    prompt,
    response: `Based on your recent notes, your average mood has been ${averageMood}/10. Here's a gentle takeaway: keep the wins visible and schedule one restorative moment this week.`,
    context: entries,
  };
}

async function chatWithOpenAI(prompt, entries) {
  const client = getOpenAIClient();
  if (!client) return null;

  const context = entries
    .map((entry) => `${entry.title} (${entry.mood_score}/10): ${entry.summary || ""}`)
    .join("\n");

  const response = await client.responses.create({
    model: getModel(),
    input: [
      {
        role: "system",
        content:
          "You are LifeLens, a warm, premium journaling assistant. Keep responses concise, supportive, and actionable.",
      },
      { role: "user", content: `User question: ${prompt}\nRecent entries:\n${context}` },
    ],
  });

  return response.output_text || response.output?.[0]?.content?.[0]?.text;
}

async function runToolCalling(userId, userPrompt) {
  const client = getOpenAIClient();
  if (!client) return null;

  const tools = [
    {
      type: "function",
      name: "summarize_week",
      description: "Summarize the user's last 7 days of journal entries.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days to include." },
        },
        required: [],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "mood_trend",
      description: "Compute mood trend analytics for the user.",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          window: { type: "string", description: "Date window label, e.g., 30d." },
        },
        required: [],
        additionalProperties: false,
      },
    },
  ];

  const inputList = [{ role: "user", content: userPrompt }];

  const first = await client.responses.create({
    model: getModel(),
    tools,
    tool_choice: "required",
    input: inputList,
  });

  inputList.push(...first.output);

  const toolOutputs = [];

  for (const item of first.output) {
    if (item.type !== "function_call") continue;
    const args = item.arguments ? safeJsonParse(item.arguments) : {};
    if (item.name === "summarize_week") {
      const days = args.days || 7;
      const db = getDb();
      const entries = db
        .prepare(
          `SELECT title, content, created_at, mood_score
           FROM entries
           WHERE user_id = ? AND datetime(created_at) >= datetime('now', ?)
           ORDER BY datetime(created_at) DESC`
        )
        .all(userId, `-${days} days`);
      const summary = buildMockInsight("weekly", entries).content;
      toolOutputs.push({
        type: "function_call_output",
        call_id: item.call_id,
        output: JSON.stringify({ days, summary, entries: entries.length }),
      });
    }

    if (item.name === "mood_trend") {
      const trend = getMoodTrend(userId);
      toolOutputs.push({
        type: "function_call_output",
        call_id: item.call_id,
        output: JSON.stringify({ points: trend }),
      });
    }
  }

  if (!toolOutputs.length) {
    return { response: first.output_text, toolOutputs: [], insight: null };
  }

  inputList.push(...toolOutputs);

  const finalResponse = await client.responses.create({
    model: getModel(),
    instructions: "Use the tool outputs to answer in a calm, premium voice.",
    tools,
    input: inputList,
  });

  return { response: finalResponse.output_text, toolOutputs, insight: null };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return {};
  }
}

module.exports = {
  generateWeeklyInsight,
  getInsights,
  chatWithAssistant,
  chatWithOpenAI,
  getModel,
  runToolCalling,
};

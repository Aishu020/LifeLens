const OpenAIImport = require("openai");

const OpenAI = OpenAIImport.default || OpenAIImport;

let client;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

module.exports = { getOpenAIClient };

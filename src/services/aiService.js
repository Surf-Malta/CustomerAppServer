const https = require("node:https");
const config = require("../config/config");

const apiKey = String(config.gemini.apiKey || "").trim();
const rawBaseUrl = String(config.gemini.baseUrl || "")
  .replace(/:generateContent$/, "")
  .trim();
const geminiUrl = `${rawBaseUrl}:generateContent?key=${apiKey}`;

async function callGemini(contents) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ contents });
    console.log(`[AiService] Calling Gemini at: ${geminiUrl}`);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(geminiUrl, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("Failed to parse Gemini response"));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function extractKeywords(message) {
  const promptText = `
    User said: "${message}"
    Extract search keywords for an e-commerce product API.
    Focus on product names, types, and colors.
    Return ONLY valid JSON: {"keywords": ["keyword1", "keyword2"]}
  `;

  try {
    const result = await callGemini([{ parts: [{ text: promptText }] }]);
    let text = result.candidates[0].content.parts[0].text;
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);
    return parsed.keywords || [];
  } catch (error) {
    console.error("[AiService.extractKeywords Error] Stack:", error.stack);
    return [];
  }
}

async function generateAlternatives(message, triedKeywords) {
  const promptText = `
    User searched: "${message}"
    No products found with keywords: ${JSON.stringify(triedKeywords)}
    Generate 3 alternative search terms (synonyms, broader categories, related items).
    Return ONLY valid JSON: {"keywords": ["alt1", "alt2", "alt3"]}
  `;

  try {
    const result = await callGemini([{ parts: [{ text: promptText }] }]);
    let text = result.candidates[0].content.parts[0].text;
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);
    return parsed.keywords || [];
  } catch (error) {
    console.error("[AiService.generateAlternatives Error] Stack:", error.stack);
    return [];
  }
}

async function formatFinalMessage(message, products) {
  if (products.length === 0) {
    return "I searched for that, but I couldn't find any matching products right now. Maybe try different keywords?";
  }

  const summary = products
    .slice(0, 3)
    .map((p) => `- ${p.product} (${p.format_price || p.price})`)
    .join("\n");

  const promptText = `
    The user asked: "${message}"
    I found these products:
    ${summary}
    Write a VERY brief (1-2 sentences) friendly wrap-up mentioning we found these items.
  `;

  try {
    const result = await callGemini([{ parts: [{ text: promptText }] }]);
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("[AiService.formatFinalMessage Error] Stack:", error.stack);
    return `I found ${products.length} products for you:`;
  }
}

module.exports = {
  extractKeywords,
  generateAlternatives,
  formatFinalMessage,
};

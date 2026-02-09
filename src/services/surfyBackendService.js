const https = require("node:https");

// Pure native implementation to bypass any global axios/config intercepts
const G_KEY = "AIzaSyCqaCvuryed-xO4WQR0AX4LT84dWDR1PSg";
const G_HOSTNAME = "generativelanguage.googleapis.com";
const C_AUTH =
  "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";
const C_HOSTNAME = "dev.surf.mt";

async function callAiNative(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
    const options = {
      hostname: G_HOSTNAME,
      port: 443,
      path: `/v1beta/models/gemini-flash-latest:generateContent?key=${G_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("AI Parse Fail"));
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function searchProductsNative(q) {
  return new Promise((resolve, reject) => {
    const path = `/api/2.0/NtProductApi?items_per_page=26&page=1${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const options = {
      hostname: C_HOSTNAME,
      port: 443,
      path: path,
      method: "GET",
      headers: {
        Authorization: C_AUTH,
        Accept: "*/*",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("Search Parse Fail"));
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

function safelyExtractAiText(result) {
  try {
    if (
      result &&
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0]
    ) {
      return result.candidates[0].content.parts[0].text || "";
    }
  } catch (e) {
    console.error("[SurfyService] AI Extract Fail:", e.message);
  }
  return "";
}

exports.processChat = async (message) => {
  console.log(`[SurfyService] 🟢 Process Chat Start: "${message}"`);
  try {
    // 1. Keywords
    const kResult = await callAiNative(
      `User: "${message}". Extract key search terms for a product database. Return ONLY JSON: {"keywords": ["term1", "term2"]}`,
    );
    console.log(
      `[SurfyService] 🤖 Raw AI Keywords Response: ${JSON.stringify(kResult)}`,
    );

    const kTextRaw = safelyExtractAiText(kResult);
    if (!kTextRaw) {
      console.log(`[SurfyService] ❌ Failed to extract initial keywords.`);
      // Retry once if failed? Or just return error?
      // For now, return error but with better logging
      return {
        message:
          "I'm sorry, I'm having trouble understanding that right now. Could you try rephrasing?",
        products: [],
      };
    }

    const kText = kTextRaw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const keywords = JSON.parse(kText).keywords || [];
    console.log(
      `[SurfyService] 🔑 Extracted Keywords: ${JSON.stringify(keywords)}`,
    );

    // 2. Search
    console.log(
      `[SurfyService] 🔍 Searching for main keywords: "${keywords.join(" ")}"`,
    );
    let pResult = await searchProductsNative(keywords.join(" "));
    let products = pResult.products || [];
    console.log(
      `[SurfyService] 📦 Primary Search Results: ${products.length} products found.`,
    );

    // 3. Fallback
    if (products.length === 0 && keywords.length > 0) {
      console.log(
        `[SurfyService] ⚠️ 0 products found. Triggering Fallback Logic...`,
      );
      console.log(`[SurfyService] 🤖 Asking AI for alternatives...`);
      const aResult = await callAiNative(
        `No products for: ${keywords.join(", ")}. Suggest 3 alternatives. Return ONLY JSON: {"keywords": ["a1"]}`,
      );
      const aTextRaw = safelyExtractAiText(aResult);
      if (aTextRaw) {
        const aText = aTextRaw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const aKeywords = JSON.parse(aText).keywords || [];
        console.log(
          `[SurfyService] 💡 AI Suggested Alternatives: ${JSON.stringify(aKeywords)}`,
        );

        if (aKeywords.length > 0) {
          console.log(
            `[SurfyService] 🔄 Searching specifically for alternatives: "${aKeywords.join(" ")}"`,
          );
          pResult = await searchProductsNative(aKeywords.join(" "));
          products = pResult.products || [];
          console.log(
            `[SurfyService] 📦 Alternative Search Results: ${products.length} products found.`,
          );
        } else {
          console.log(
            `[SurfyService] ❌ No actionable alternative keywords generated.`,
          );
        }
      } else {
        console.log(
          `[SurfyService] ❌ AI returned empty response for alternatives.`,
        );
      }
    } else {
      console.log(
        `[SurfyService] ✅ Product(s) found immediately, skipping fallback.`,
      );
    }

    // 4. Format
    const summary = products
      .slice(0, 3)
      .map((p) => `- ${p.product}`)
      .join("\n");

    const prompt = summary
      ? `User asked: "${message}". Found: ${summary}. Write a friendly 1-sentence response.`
      : `User asked: "${message}". Nothing found. Write a friendly 1-sentence response.`;

    console.log(`[SurfyService] 📝 Generating final response for user...`);
    const fResult = await callAiNative(prompt);

    // Log raw AI response for debugging
    console.log(
      `[SurfyService] 🤖 Raw AI Response: ${JSON.stringify(fResult)}`,
    );

    let finalMsg = safelyExtractAiText(fResult);

    if (!finalMsg) {
      console.log(
        `[SurfyService] ⚠️ Failed to extract text from AI response. Using fallback.`,
      );
      if (products.length > 0) {
        finalMsg = "Here are the products I found for you:";
      } else {
        finalMsg =
          "I couldn't find exactly what you're looking for, but I'm here to help with anything else!";
      }
    }

    console.log(`[SurfyService] 📤 Sent Response: "${finalMsg}"`);

    return { message: finalMsg, products };
  } catch (err) {
    console.error(
      `[SurfyService] ❌ Error in ProcessChat: ${err.message}`,
      err.stack,
    );
    throw err;
  }
};

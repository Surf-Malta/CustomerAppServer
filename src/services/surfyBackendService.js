const https = require("node:https");
const axios = require("axios");
const mongoose = require("mongoose");
const config = require("../config/config");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { generateEmbedding } = require("../utils/embedding");

const USE_VECTOR_SEARCH = process.env.VECTOR_SEARCH_ENABLED === 'true';
const VECTOR_SEARCH_THRESHOLD = 0.72;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || (config && config.gemini ? config.gemini.apiKey : "");
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const G_HOSTNAME = "generativelanguage.googleapis.com";
const C_AUTH = config && config.csCartApi ? `Basic ${Buffer.from(`${config.csCartApi.username}:${config.csCartApi.apiKey}`).toString("base64")}` : "";
const C_HOSTNAME = "surf.mt";

let cachedCategoryList = null;
let cachedCategoryMap = {};
let cachedCategoryIdMap = {};
let lastCategoryFetchTime = 0;

let Conversation;
try {
  Conversation = mongoose.model('Conversation');
} catch (e) {
  const ConversationSchema = new mongoose.Schema({
    session_id: { type: String, required: true, index: true },
    messages: [{ role: String, text: String, timestamp: Date }],
    last_active: Date
  }, { collection: 'conversations' });
  Conversation = mongoose.model('Conversation', ConversationSchema);
}

async function getMaltaWeatherContext() {
  const timeOfDay = new Date().toLocaleString("en-MT", { timeZone: "Europe/Malta" });
  if (!WEATHER_API_KEY) {
    return `Weather data unavailable. Time of day in Malta: ${timeOfDay}`;
  }
  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Valletta,MT&appid=${WEATHER_API_KEY}&units=metric`);
    const data = res.data;
    return `Current weather in Malta: ${data.weather[0].description}, ${data.main.temp}°C. Time of day: ${timeOfDay}.`;
  } catch (err) {
    console.error("[SurfyService] Failed to fetch weather:", err.message);
    return `Weather data unavailable. Time of day in Malta: ${timeOfDay}`;
  }
}

async function callGeminiAxios(systemInstruction, promptText, expectJson = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: {}
  };

  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (expectJson) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const res = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" }
  });

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (expectJson) {
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("[SurfyService] Failed to parse JSON from Gemini:", text);
      return null;
    }
  }
  return text.trim();
}

async function performVectorSearch(phrase, filters) {
  console.log(`[SurfyService] Performing vector search for phrase: "${phrase}" with filters:`, filters);
  const embedding = await generateEmbedding(phrase);

  const filterConditions = {};
  if (filters?.price_max != null) {
    filterConditions.price = { $lte: Number(filters.price_max) };
  }
  if (filters?.category_ids?.length) {
    filterConditions.category_ids = {
      $in: filters.category_ids
    };
  }

  const vectorSearchStage = {
    index: "vector_index",
    path: "embedding",
    queryVector: embedding,
    numCandidates: 100,
    limit: 10
  };

  if (Object.keys(filterConditions).length > 0) {
    vectorSearchStage.filter = filterConditions;
  }

  const pipeline = [
    { $vectorSearch: vectorSearchStage },
    {
      $project: {
        score: { $meta: "vectorSearchScore" },
        product_id: 1,
        product: 1,
        category_ids: 1
      }
    }
  ];
  return await Product.aggregate(pipeline);
}

async function getRelevantCategories(message) {
  const embedding = await generateEmbedding(message);

  const pipeline = [
    {
      $vectorSearch: {
        index: "category_vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 50,
        limit: 8
      }
    },
    {
      $project: {
        score: { $meta: "vectorSearchScore" },
        category_id: 1,
        category: 1
      }
    }
  ];

  return await Category.aggregate(pipeline);
}

function userMentionedWeatherFallback(message) {
  return /\b(weather|rain|rainy|hot|cold|summer|winter|warm|cool|humid|sunny|beach|snow|snowy|freezing|chilly|windy|heatwave|monsoon|drizzle|stormy|tropical|outdoor|picnic|skiing|swimming|poolside|hike|hiking)\b/i.test(message);
}

async function userMentionedWeather(message) {
  try {
    const prompt = `Does the following user message explicitly or implicitly indicate they want product suggestions based on weather, temperature, season, or outdoor conditions?

User message: "${message}"

Answer with ONLY "yes" or "no". No explanation.

Examples:
- "white shirt" → no
- "something warm to wear" → yes
- "it's been really hot lately" → yes
- "running shoes" → no
- "beach outfit" → yes
- "dress for a party" → no
- "leather handbag" → no
- "jacket for the cold" → yes`;

    const result = await callGeminiAxios(null, prompt, false);
    const answer = result?.toLowerCase().trim();

    if (answer === 'yes') return true;
    if (answer === 'no') return false;

    // Gemini returned something unexpected — fall back to regex
    console.warn(`[SurfyService] Weather detection: unexpected Gemini response "${result}", falling back to regex`);
    return userMentionedWeatherFallback(message);

  } catch (err) {
    // Gemini failed — fall back to regex silently so pipeline continues
    console.warn(`[SurfyService] Weather detection: Gemini call failed (${err.message}), falling back to regex`);
    return userMentionedWeatherFallback(message);
  }
}


async function buildEnhancePrompt(searchPhrase, originalMessage, weatherContext) {
  const weatherDetected = await userMentionedWeather(originalMessage);
  const weatherHint = weatherDetected
    ? `\nWeather context (include because user mentioned it): ${weatherContext}`
    : '';

  return `You are enhancing a product search query for a retail store's vector embedding search.

Original query: "${searchPhrase}"${weatherHint}

Rules:
- Only add product-specific attributes such as: material (cotton, linen, leather, wool, denim), fit (slim, loose, oversized, tailored), style (formal, casual, sporty, elegant), or gender (mens, womens, unisex) — but ONLY when clearly implied by the query
- Do NOT add weather words (warm, cool, summer, lightweight, breathable) UNLESS the user explicitly mentioned weather in their message
- Do NOT add location names (Malta, Mediterranean, etc.)
- Do NOT add lifestyle or generic marketing words (gift, fashion, trendy, accessories, stylish, popular)
- Do NOT add seasonal words (spring, autumn) unless the user said them
- Keep the result tightly focused on the core product noun and its direct, obvious attributes
- Return ONLY the enhanced search string — no explanation, no quotes, no extra text

Examples of correct behaviour:
- "white shirt" → white shirt formal casual mens
- "running shoes" → running shoes athletic sport mens womens
- "dress for a party" → party dress womens evening formal
- "leather handbag" → leather handbag womens shoulder tote
- "warm jacket" (user said warm) → warm jacket winter coat heavyweight mens womens
- "sunglasses" → sunglasses polarized UV protection mens womens`;
}


exports.processChat = async (message, session_id = "default") => {
  if (!USE_VECTOR_SEARCH) {
    console.log(`[SurfyService] 🟢 Legacy Keyword Process Chat Start: "${message}"`);
    return await legacyProcessChat(message);
  }

  console.log(`\n======================================================`);
  console.log(`🤖 LUCY AI PIPELINE STARTED`);
  console.log(`======================================================`);
  console.log(`👉 STEP 1: Received User Message`);
  console.log(`   Message: "${message}"`);
  console.log(`   Session: ${session_id}`);

  try {

    console.log(`\n👉 STEP 2: Fetching Weather Context`);
    const weatherContext = await getMaltaWeatherContext();
    console.log(`   Result: ${weatherContext}`);

    console.log(`\n👉 STEP 3: Intent Classification`);
    console.log(`\n👉 STEP 3a: Fetching Relevant Categories (Task 1)`);
    const enhancePrompt = `
You convert ecommerce user messages into a strict category-retrieval query.

GOAL:
Generate a short query that helps vector search retrieve the correct product categories only.

RULES:
- Keep the main product noun as the highest priority
- Add only closely related category terms
- Do NOT add broad ecommerce words unless necessary
- Avoid generic words like:
  fashion, apparel, style, wear, trendy, outfit
- Do NOT add weather, occasion, lifestyle, or descriptive phrases
- Do NOT explain anything
- Output only the final search phrase
- Maximum 5 words
- Keep terms tightly related to the same product domain

GOOD EXAMPLES:

Input: "i need a white shirt"
Output: "shirt tops clothing"

Input: "formal black shoes"
Output: "formal shoes loafers footwear"

Input: "something for travel"
Output: "travel bags luggage passport holder"

Input: "men running shoes"
Output: "men running shoes sneakers"

Input: "makeup for party"
Output: "makeup cosmetics beauty"

If gender is clearly mentioned, include it.

User Message:
"${message}"
`;
    const enhanceCategory = await callGeminiAxios(null, enhancePrompt, false);
    const relevantCategories = await getRelevantCategories(enhanceCategory);
    console.log(`   Result: Retrieved ${relevantCategories
        .map(
          (c) =>
            `- ${c.category} (ID: ${c.category_id}, Score: ${c.score.toFixed(4)})`
        )
        .join("\n")} relevant categories from vector search.`);

    const rerankPrompt = `
User Query:
"${message}"

Enhanced Query:
"${enhanceCategory}"

Retrieved Categories:
${relevantCategories
        .map(
          (c) =>
            `- ${c.category} (ID: ${c.category_id}, Score: ${c.score.toFixed(4)})`
        )
        .join("\n")}

Task:
Remove ONLY clearly unrelated categories.

Rules:

- Keep all genuinely relevant categories
- Remove only obvious mismatches
- Treat every category entry independently
- Different category_id values represent different valid categories
- NEVER remove categories only because category names are identical
- If multiple categories with the same name are relevant, keep them all
- Preserve semantically related categories
- Keep broad parent categories if relevant
- Keep gender categories only when user explicitly mentions gender
- Remove categories that are clearly unrelated to the user's intent
- Do NOT aggressively filter results
- If multiple categories are relevant, keep them all
- Keep original scores exactly as provided
- Keep original category IDs exactly as provided
- Return in SAME format as retrieved categories
- Return ONLY valid JSON
- Do NOT wrap in markdown
- Do NOT explain anything

Output format:
[
  {
    "_id": "mongodb_id",
    "category_id": 658,
    "category": "Clothing",
    "score": 0.8725
  }
]
`;
    const reRankResultsRaw = await callGeminiAxios(
      null,
      rerankPrompt,
      false
    );

    // CLEAN RESPONSE
    const cleanedResponse = reRankResultsRaw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let rerankedCategories = [];

    try {
      rerankedCategories = JSON.parse(cleanedResponse);
    } catch (err) {
      console.error("Failed to parse reranked categories:", err);
    }


    console.log("rerankedCategories - next step from here", rerankedCategories)
    const intentPrompt = `
User message: "${message}"

Weather Context:
${weatherContext}

Relevant categories retrieved for this query:
${rerankedCategories
        .map(c => `- ${c.category} (ID: ${c.category_id})`)
        .join("\n")}

Task:

1. Classify intent:
   - product_search
   - advice

   2. If intent is "product_search":
   - Extract a clean search_phrase that best represents what the user wants to buy.
   - Focus only on the core product intent.
   - Remove conversational words and filler text.

3. Extract filters if explicitly mentioned:
   - price_max

Rules:

- search_phrase should be concise and product-focused.
- Remove phrases like:
  "I need",
  "show me",
  "looking for",
  "can you suggest",
  "something for",
  etc.

- Do NOT include category names unless they are part of the product itself.
- Do NOT invent products, categories, brands, genders, colors, materials, occasions, or attributes not mentioned by the user.
- Do NOT use weather context unless the user explicitly refers to weather.
- Ignore the retrieved categories when generating search_phrase.
- Retrieved categories are provided only for system awareness and are NOT required in the response.
- Return ONLY valid JSON.
- Do NOT wrap response in markdown.

Return format:

{
  "intent": "product_search",
  "search_phrase": "...",
  "filters": {
    "price_max": null
  }
}
`;

    const intentData = await callGeminiAxios("You are an intent classifier for a retail chatbot.", intentPrompt, true);
    console.log(`   Result: Intent determined as "${intentData?.intent}" with phrase: "${intentData?.search_phrase}"`);
    let products = [];
    let searchResultsContext = "";

    if (intentData && intentData.intent === "product_search") {

      console.log(`\n STEP 4: Search Phrase Enhancement (Task 2a)`);
      const weatherDetectedForLog = await userMentionedWeather(message);
      console.log(`   Weather mentioned by user: ${weatherDetectedForLog}`);
      const enhancePrompt = await buildEnhancePrompt(
        intentData.search_phrase || message,
        message,
        weatherContext
      );
      const enhancedPhrase = await callGeminiAxios(null, enhancePrompt, false);
      console.log(`   Result enhancedPhrase: "${enhancedPhrase}"`);

      console.log(`\n STEP 5: MongoDB Vector Search`);
      const categoryIds = rerankedCategories.map(c => c.category_id);
      let searchResults = await performVectorSearch(enhancedPhrase,
        {
          ...intentData.filters,
          category_ids: categoryIds
        }
      );

      // For debugging: added a fetch all categories to create a lookup map for better log output
      const allCategories = await Category.find(
        {},
        {
          category_id: 1,
          category: 1
        }
      ).lean();
      const categoryLookup = {};

      allCategories.forEach(cat => {
        categoryLookup[cat.category_id] = cat.category;
      });
      // console.log(
      //   searchResults.map(p => ({
      //     product: p.product,
      //     categories: p.category_ids
      //   }))
      // );
      console.table(
        searchResults.map(product => ({
          product_id: product.product_id,
          name: product.product,
          score: product.score,
          categories: product.category_ids
            ?.map(id => `${id} (${categoryLookup[id] || "Unknown"})`)
            .join(", ")
        }))
      );


      //   if (searchResults.length > 0 && searchResults[0].score < VECTOR_SEARCH_THRESHOLD) {
      //     console.log(`    Top score (${searchResults[0].score}) is below threshold (${VECTOR_SEARCH_THRESHOLD}).`);
      //     console.log(`    Retrying search with broader phrase...`);
      //     const retryPrompt = `The previous search phrase "${enhancedPhrase}" yielded poor results. Write a broader, more general product search phrase for: "${message}". Return only the string without quotes.`;
      //     const broaderPhrase = await callGeminiAxios(null, retryPrompt, false);
      //     console.log(`   Result broader phrase: "${broaderPhrase}"`);
      //     searchResults = await performVectorSearch(broaderPhrase, intentData.filters);
      //   }

      //   if (searchResults.length > 0) {
      //     console.log(`   Result: Found ${searchResults.length} matching products. Top score: ${searchResults[0].score}`);
      //     const productIds = searchResults.map(r => r.product_id);
      //     products = await Product.find({ product_id: { $in: productIds } })
      //       .select('-embedding')
      //       .lean();

      //     products.sort((a, b) => productIds.indexOf(a.product_id) - productIds.indexOf(b.product_id));

      //     products = products.map(p => ({
      //       ...p,
      //       format_price: p.price ? `€${Number(p.price).toFixed(2)}` : "€0.00",
      //       format_list_price: p.list_price ? `€${Number(p.list_price).toFixed(2)}` : undefined,
      //       discount_prc: p.list_price && p.price < p.list_price
      //         ? ((p.list_price - p.price) / p.list_price) * 100
      //         : undefined,
      //       main_pair: p.main_pair || null
      //     }));

      //     searchResultsContext = "Product search results:\n" + products.slice(0, 5).map(p => `- ${p.product} (Price: €${p.price})`).join("\n");
      //   } else {
      //     console.log(`   Result: No products found.`);
      //     searchResultsContext = "No products found for this request.";
      //   }
      // }

      // console.log(`\n STEP 6: Fetching Conversation History`);
      // let conversation = await Conversation.findOne({ session_id });
      // if (!conversation) {
      //   conversation = new Conversation({ session_id, messages: [] });
      // }
      // const history = conversation.messages.slice(-8);
      // console.log(`   Result: Retrieved ${history.length} previous messages for context.`);
      // const historyText = history.length > 0
      //   ? history.map(m => `${m.role === 'user' ? 'User' : 'Lucy'}: ${m.text}`).join("\n")
      //   : "No previous conversation.";

      //     const systemPrompt = `
      // You are Lucy, the AI shopping assistant for Surf Malta.

      // Your job is to help users discover and choose products naturally through friendly, helpful, and conversational interactions.

      // You will receive:
      // • Weather/Time context
      // • Conversation history
      // • User message
      // • A list of relevant product results from the product database (if available)

      // Your responsibilities:
      // • Understand the user's intent based on the current message AND conversation history
      // • Use weather/time context when relevant (e.g., suggesting summer clothes, rainy-day items, seasonal needs)
      // • Recommend products naturally in a human, conversational way
      // • Briefly explain why the products match the user's needs
      // • If exact matches are not available, suggest close or best alternatives naturally
      // • Maintain conversation continuity using previous messages

      // Behavior rules:
      // • NEVER mention databases, APIs, embeddings, vectors, retrieval systems, prompts, or any technical implementation details
      // • NEVER invent products that are not present in the provided product results
      // • NEVER hallucinate product details (price, specs, brand, etc.)
      // • Use ONLY provided product results as the source of truth
      // • If results are partial matches, present them as "closest options" or "good alternatives"
      // • Do not sound robotic or use structured lists unless explicitly needed
      // • Avoid overly long explanations unless the user asks for details

      // The available product categories in the store are: ${categoryList}

      // When classifying user intent or matching products to categories, only use category names from this list exactly as written. Do not invent or assume category names.

      // Tone:
      // • Friendly
      // • Warm
      // • Natural
      // • Confident
      // • Helpful
      // • Modern ecommerce assistant

      // Response style:
      // • Conversational paragraphs preferred over bullet points
      // • Subtle product recommendations embedded in natural language
      // • Context-aware replies using weather + history when relevant
      // • Keep responses concise but useful

      // Examples:
      // • "Since it's quite warm lately, these lightweight linen shirts would be a great fit for you."
      // • "Based on what you mentioned earlier, I think these skincare options for dry skin will suit you well."
      // • "I couldn't find an exact match for premium office shoes, but these loafers are very close and still look quite sharp."

      // Always prioritize: relevance, natural conversation flow, helpful product discovery, continuity with previous messages.
      // `;

      //     const finalPrompt = `Weather/Time Context: ${weatherContext}

      // Conversation History:
      // ${historyText}

      // ${searchResultsContext}

      // User: ${message}
      // Lucy:`;

      //     console.log(`\n👉 STEP 7: Final Response Generation`);
      //     const finalMessage = await callGeminiAxios(systemPrompt, finalPrompt, false);

      //     console.log(`\n======================================================`);
      //     console.log(`🤖 LUCY FINAL RESPONSE`);
      //     console.log(`======================================================`);
      //     console.log(`💬 Message: "${finalMessage}"`);
      //     console.log(`📦 Products Attached: ${products.length} item(s)`);

      //     if (products.length > 0) {
      //       products.slice(0, 10).forEach((p, i) => {
      //         console.log(`
      // ======================================================
      // 📦 Product ${i + 1}
      // ======================================================
      // 🆔 Product ID: ${p.product_id}
      // 🛍️  Product: ${p.product}
      // 💰 Price: €${p.price}
      // 🏷️  Categories: ${(p.category_ids || []).map(id => `${id} (${cachedCategoryIdMap[id] || "Unknown"})`).join(", ") || "N/A"}
      // 📝 Short Description: ${p.short_description || "N/A"}
      // ======================================================`);
      //       });
      //       if (products.length > 10) {
      //         console.log(`...and ${products.length - 10} more`);
      //       }
      //     }
      //     console.log(`======================================================\n`);

      //     conversation.messages.push({ role: "user", text: message, timestamp: new Date() });
      //     conversation.messages.push({ role: "lucy", text: finalMessage, timestamp: new Date() });
      //     conversation.last_active = new Date();
      //     await conversation.save();

      // return {
      //   message: finalMessage || (products.length ? "Here is what I found!" : "I couldn't find anything right now, sorry!"),
      //   products: products
    };

  } catch (err) {
    console.log(`\n❌ GEMINI ERROR SUMMARY`);
    console.log(`Status:`, err?.response?.status);
    console.log(`Status Text:`, err?.response?.statusText);
    console.log(`Message:`, err?.message);
    console.log(`Gemini Error:`, err?.response?.data?.error);
    console.log(`======================================================\n`);
    return {
      message: "I'm having a little trouble thinking right now. Could you please try again in a moment?",
      products: []
    };
  }
};

async function callAiNative(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
    const options = {
      hostname: G_HOSTNAME,
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        "User-Agent": "Surfy/1.0.0 (Chatbot Service)",
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(new Error("AI Parse Fail")); }
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
        "User-Agent": "Mozilla/5.0",
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(new Error("Search Parse Fail")); }
      });
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

function safelyExtractAiText(result) {
  try {
    if (result?.candidates?.[0]?.content?.parts?.[0]) {
      return result.candidates[0].content.parts[0].text || "";
    }
  } catch (e) {
    console.error("[SurfyService] AI Extract Fail:", e.message);
  }
  return "";
}

async function legacyProcessChat(message) {
  try {
    const kResult = await callAiNative(
      `User: "${message}". Extract key search terms for a product database. Return ONLY JSON: {"keywords": ["term1", "term2"]}`
    );
    const kTextRaw = safelyExtractAiText(kResult);
    if (!kTextRaw) return { message: "I'm sorry, I'm having trouble understanding that right now.", products: [] };

    const kText = kTextRaw.replace(/```json/g, "").replace(/```/g, "").trim();
    const keywords = JSON.parse(kText).keywords || [];

    let pResult = await searchProductsNative(keywords.join(" "));
    let products = pResult.products || [];

    if (products.length === 0 && keywords.length > 0) {
      const aResult = await callAiNative(
        `No products for: ${keywords.join(", ")}. Suggest 3 alternatives. Return ONLY JSON: {"keywords": ["a1"]}`
      );
      const aTextRaw = safelyExtractAiText(aResult);
      if (aTextRaw) {
        const aText = aTextRaw.replace(/```json/g, "").replace(/```/g, "").trim();
        const aKeywords = JSON.parse(aText).keywords || [];
        for (const alt of aKeywords) {
          pResult = await searchProductsNative(alt);
          products = pResult.products || [];
          if (products.length > 0) break;
        }
      }
    }

    const summary = products.slice(0, 3).map((p) => `- ${p.product}`).join("\n");
    const prompt = summary
      ? `User asked: "${message}". Found: ${summary}. Write a friendly 1-sentence response.`
      : `User asked: "${message}". Nothing found. Write a friendly 1-sentence response.`;

    const fResult = await callAiNative(prompt);
    let finalMsg = safelyExtractAiText(fResult);

    if (!finalMsg) {
      finalMsg = products.length > 0 ? "Here are the products I found for you:" : "I couldn't find exactly what you're looking for.";
    }

    return { message: finalMsg, products };
  } catch (err) {
    console.error(`[SurfyService] ❌ Error in Legacy ProcessChat:`, err);
    throw err;
  }
}
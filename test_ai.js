const https = require("node:https");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
const baseUrl = process.env.GEMINI_API_URL;
const geminiUrl = `${baseUrl}?key=${apiKey}`;

async function testAi() {
  const data = JSON.stringify({
    contents: [{ parts: [{ text: "Hello, reply with 'test success'" }] }],
  });

  console.log("Testing URL:", geminiUrl, "Type:", typeof geminiUrl);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  try {
    const req = https.request(geminiUrl, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        console.log("Response:", body);
      });
    });

    req.on("error", (e) => console.error("Request Error:", e));
    req.write(data);
    req.end();
  } catch (err) {
    console.error("Catch Error:", err.stack);
  }
}

testAi();

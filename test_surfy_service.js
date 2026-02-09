const https = require("node:https");
const config = require("./src/config/config");

console.log("--- Surfy Service Test ---");
console.log("Config Port:", config.port);
console.log("Config CS-Cart Base URL:", config.csCartApi.baseUrl);
console.log(
  "Config Gemini API Key:",
  config.gemini.apiKey ? "PRESENT" : "MISSING",
);

async function testNetworking() {
  const apiKey = String(config.gemini.apiKey || "").trim();
  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log(
    "Options Hostname:",
    options.hostname,
    "Type:",
    typeof options.hostname,
  );
  console.log("Options Path:", options.path, "Type:", typeof options.path);

  try {
    const req = https.request(options, (res) => {
      console.log("Status:", res.statusCode);
      res.on("data", (d) => process.stdout.write(d));
    });

    req.on("error", (e) => console.error("Request Error:", e));
    req.write(JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }));
    req.end();
  } catch (err) {
    console.error("Catch Error:", err.stack);
  }
}

testNetworking();

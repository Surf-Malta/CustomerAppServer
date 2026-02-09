const https = require("node:https");
console.log("--- HTTPS DIAGNOSTIC ---");
console.log("https.request type:", typeof https.request);
console.log("https.request source:", https.request.toString());

try {
  const url = "https://www.google.com";
  console.log("Testing native https.request with string URL...");
  const req = https.request(url, (res) => {
    console.log("Native test success! Status:", res.statusCode);
    res.on("data", () => {});
  });
  req.end();
} catch (e) {
  console.log("Native test FAILED!", e.stack);
}

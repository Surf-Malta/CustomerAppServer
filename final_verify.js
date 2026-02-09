const http = require("http");
const data = JSON.stringify({ message: "shirts" });
const req = http.request(
  {
    hostname: "localhost",
    port: 3000,
    path: "/api/chatbot",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  },
  (res) => {
    let body = "";
    res.on("data", (d) => (body += d));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Body:", body);
      process.exit(0);
    });
  },
);
req.on("error", (e) => {
  console.error(e);
  process.exit(1);
});
req.write(data);
req.end();

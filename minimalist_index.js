const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/chatbot", (req, res) => {
  console.log("[Chatbot] Minimalist Test Received:", req.body);
  res.status(200).json({ status: "success", message: "Minimalist test OK" });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Minimalist server running on port 3000");
});

const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.send("Surf Customer App Server is running!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// Start server
const PORT = config.port || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in ${config.env} mode on http://0.0.0.0:${PORT}`);
});

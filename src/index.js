const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config/config");
const routes = require("./routes");

const app = express();

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(`MongoDB Connected: ${mongoose.connection.host}`))
    .catch((error) => {
      console.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    });
}


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Surf Customer App Server is running!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

const PORT = config.port || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in ${config.env} mode on http://0.0.0.0:${PORT}`);
});

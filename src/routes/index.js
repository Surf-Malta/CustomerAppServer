const express = require("express");
const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Import other routes here
// Import other routes here
const authRoutes = require("./auth.routes");
const layoutRoutes = require("./layout.routes");
const orderRoutes = require("./order.routes");
const categoryRoutes = require("./category.routes");

router.use("/auth", authRoutes);
router.use("/layout", layoutRoutes);
router.use("/categories", categoryRoutes);
router.use("/", orderRoutes);

module.exports = router;

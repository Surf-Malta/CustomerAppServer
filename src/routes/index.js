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
const brandRoutes = require("./brand.routes");
const vendorRoutes = require("./vendor.routes");
const productRoutes = require("./product.routes");
const wishlistRoutes = require("./wishlist.routes");
const cartRoutes = require("./cart.routes");
const configRoutes = require("./config.routes");
const userRoutes = require("./user.routes");
const notificationRoutes = require("./notification.routes");
const reviewRoutes = require("./review.routes");

router.use("/auth", authRoutes);
router.use("/layout", layoutRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/vendors", vendorRoutes);
router.use("/products", productRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/config", configRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reviews", reviewRoutes);
router.use("/", orderRoutes);

module.exports = router;

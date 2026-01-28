const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout.controller");

// GET /api/checkout - Get checkout data (payment methods, shipping methods, cart details)
router.get("/", checkoutController.getCheckoutData);

module.exports = router;

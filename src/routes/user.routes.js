const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/profile/:id", userController.getUserProfile);
router.get("/addresses", userController.getUserAddresses);
router.get("/cart", userController.getCart);

module.exports = router;

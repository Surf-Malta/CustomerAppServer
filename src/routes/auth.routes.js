const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login-email", authController.loginWithEmail);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;

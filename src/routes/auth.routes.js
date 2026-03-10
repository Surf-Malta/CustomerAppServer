const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login-email", authController.loginWithEmail);
router.post("/verify-otp", authController.verifyOtp);
router.post("/whatsapp/login", authController.loginWithWhatsApp);
router.post("/email/signup-otp", authController.signupOtpEmail);
router.put("/email/verify", authController.verifyEmailOtp);
router.post("/signup", authController.createAccount);

module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login-email", authController.loginWithEmail);
router.post("/verify-otp", authController.verifyOtp);
router.post("/whatsapp/login", authController.loginWithWhatsApp);
router.put("/whatsapp/verify", authController.verifyWhatsAppOtp);
router.post("/signup", authController.createAccount);

module.exports = router;

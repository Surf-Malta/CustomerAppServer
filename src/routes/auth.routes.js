const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/login-email", authController.loginWithEmail);

module.exports = router;

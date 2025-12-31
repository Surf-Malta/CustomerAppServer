const express = require("express");
const router = express.Router();
const layoutController = require("../controllers/layoutController");

router.get("/home-layout", layoutController.getHomeLayout);

module.exports = router;

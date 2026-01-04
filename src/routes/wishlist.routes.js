const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);

module.exports = router;

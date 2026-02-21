const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.put("/remove/:user_id", cartController.removeFromCart);
router.delete("/clear/:user_id", cartController.clearCart);

module.exports = router;

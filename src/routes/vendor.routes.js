const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");

router.get("/", vendorController.getVendors);
router.get("/:id", vendorController.getVendorDetails);

module.exports = router;

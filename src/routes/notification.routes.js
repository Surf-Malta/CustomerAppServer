const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/:userId", notificationController.getNotifications);
router.post("/action", notificationController.handleNotificationAction);

module.exports = router;

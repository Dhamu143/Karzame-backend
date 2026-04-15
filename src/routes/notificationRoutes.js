const express = require("express");
const router = express.Router();

const { getNotifications ,updateAlertStatus} = require("../controllers/notificationController");

router.get("/notifications", getNotifications);
router.put("/notifications/:id/status", updateAlertStatus);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  getNotificationsByUser,
  markAsRead,
  deleteNotification,
    getallNotifications,
} = require("../controllers/notification");

// 📥 Get all notifications for a user
// GET /api/notifications/user/:userId
router.get("/user/:userId", getNotificationsByUser);

router.get("/all", getallNotifications);
// 🔔 Mark notification as read
// PUT /api/notifications/:id/read
router.put("/:id/read", markAsRead);

// ❌ Delete notification
// DELETE /api/notifications/:id
router.delete("/:id", deleteNotification);

module.exports = router;
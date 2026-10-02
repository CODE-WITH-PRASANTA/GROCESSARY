// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/notificationController");

router.use(protect);

router.get("/", ctrl.getNotifications);
router.get("/unread-count", ctrl.getUnreadCount);
router.put("/read-all", ctrl.markAllAsRead);
router.put("/:id/read", ctrl.markAsRead);
router.delete("/:id", ctrl.deleteNotification);

module.exports = router;
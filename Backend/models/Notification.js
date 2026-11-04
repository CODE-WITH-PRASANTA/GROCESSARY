// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, default: "", trim: true, maxlength: 500 },
    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "return",
        "offer",
        "account",
        "system",
        "general",
      ],
      default: "general",
    },
    link: { type: String, default: "" },       // e.g. "/orders/ORD123"
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },

    // Optional metadata for richer display
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
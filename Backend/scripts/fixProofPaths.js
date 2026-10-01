require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const orders = await Order.find({
      "pickupProof.images.0": { $exists: true },
    });

    console.log(`Found ${orders.length} orders with pickup proof images`);

    let fixed = 0;

    for (const order of orders) {
      let changed = false;

      const newImages = order.pickupProof.images.map((img) => {
        if (!img) return img;

        // Case 1: "/uploads/xyz.webp" → "uploads/images/xyz.webp"
        if (img.startsWith("/uploads/") && !img.startsWith("/uploads/images/")) {
          changed = true;
          return img.replace(/^\/uploads\//, "uploads/images/");
        }

        // Case 2: "uploads/xyz.webp" → "uploads/images/xyz.webp"
        if (img.startsWith("uploads/") && !img.startsWith("uploads/images/")) {
          changed = true;
          return img.replace(/^uploads\//, "uploads/images/");
        }

        // Case 3: "/xyz.webp" or "xyz.webp" → "uploads/images/xyz.webp"
        if (!img.includes("uploads/")) {
          changed = true;
          const clean = img.replace(/^\/+/, "");
          return `uploads/images/${clean}`;
        }

        return img;
      });

      if (changed) {
        order.pickupProof.images = newImages;
        await order.save();
        fixed++;
      }
    }

    console.log(`Fixed ${fixed} orders`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
})();

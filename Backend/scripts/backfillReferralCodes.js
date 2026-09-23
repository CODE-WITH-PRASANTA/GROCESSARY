require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const generateReferralCode = require("../utils/generateReferralCode");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: "" },
      ],
    });

    console.log(`Found ${users.length} users without referral code`);

    for (const user of users) {
      let code;
      let exists = true;

      while (exists) {
        code = generateReferralCode(user.name || "USER");
        exists = await User.exists({ referralCode: code });
      }

      user.referralCode = code;
      await user.save();
      console.log(`✓ ${user.email} → ${code}`);
    }

    console.log("Backfill complete");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Backfill error:", err);
    process.exit(1);
  }
})();
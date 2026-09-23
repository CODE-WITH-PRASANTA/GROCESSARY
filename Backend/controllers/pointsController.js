// controllers/pointsController.js
const RewardPoints = require("../models/RewardPoints");

// GET /api/points
const getPoints = async (req, res) => {
  try {
    let points = await RewardPoints.findOne({ user: req.user._id });

    if (!points) {
      points = await RewardPoints.create({ user: req.user._id });
    }

    return res.status(200).json({ success: true, points });
  } catch (err) {
    console.error("getPoints error:", err);
    return res.status(500).json({ success: false, message: "Failed to load points." });
  }
};

// Internal helper — used by order + referral controllers
const creditPoints = async (userId, points, type, reference = "") => {
  let account = await RewardPoints.findOne({ user: userId });
  if (!account) account = await RewardPoints.create({ user: userId });

  account.availablePoints += points;
  account.totalEarned += points;
  account.transactions.unshift({
    type,
    points,
    direction: "credit",
    reference,
  });

  await account.save();
  return account;
};

// Internal helper — throws if insufficient
const debitPoints = async (userId, points, type, reference = "") => {
  const account = await RewardPoints.findOne({ user: userId });

  if (!account || account.availablePoints < points) {
    throw new Error("Insufficient points.");
  }

  account.availablePoints -= points;
  account.totalUsed += points;
  account.transactions.unshift({
    type,
    points,
    direction: "debit",
    reference,
  });

  await account.save();
  return account;
};

module.exports = { getPoints, creditPoints, debitPoints };
// controllers/referralController.js
const User = require("../models/User");
const Referral = require("../models/Referral");
const Wallet = require("../models/Wallet");
const RewardPoints = require("../models/RewardPoints");
const rewards = require("../config/rewards");
const generateReferralCode = require("../utils/generateReferralCode");

// Internal — called on new user signup when a referral code is provided
const applyReferralCode = async (newUserId, code) => {
  if (!code) return null;

  const referrer = await User.findOne({ referralCode: code });
  if (!referrer) return null;

  // A user can only be referred once
  const alreadyReferred = await Referral.findOne({ referred: newUserId });
  if (alreadyReferred) return null;

  // Create referral record
  const referral = await Referral.create({
    referrer: referrer._id,
    referred: newUserId,
    referralCode: code,
    status: "pending",
    friendRewardAmount: rewards.FRIEND_WALLET_BONUS,
    friendRewardPoints: rewards.FRIEND_POINTS_BONUS,
  });

  // Store referredBy on the new user
  await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

  // Credit friend's welcome wallet bonus
  const friendWallet =
    (await Wallet.findOne({ user: newUserId })) ||
    (await Wallet.create({ user: newUserId, balance: 0 }));

  friendWallet.balance += rewards.FRIEND_WALLET_BONUS;
  friendWallet.transactions.unshift({
    type: "referral_bonus",
    amount: rewards.FRIEND_WALLET_BONUS,
    direction: "credit",
    balanceAfter: friendWallet.balance,
    reference: `Welcome via ${code}`,
  });
  await friendWallet.save();

  // Credit friend's welcome points
  await RewardPoints.findOneAndUpdate(
    { user: newUserId },
    { $setOnInsert: { user: newUserId } },
    { upsert: true }
  );

  const friendPoints = await RewardPoints.findOne({ user: newUserId });
  friendPoints.availablePoints += rewards.FRIEND_POINTS_BONUS;
  friendPoints.totalEarned += rewards.FRIEND_POINTS_BONUS;
  friendPoints.transactions.unshift({
    type: "earned_welcome",
    points: rewards.FRIEND_POINTS_BONUS,
    direction: "credit",
    reference: `Welcome via ${code}`,
  });
  await friendPoints.save();

  return referral;
};

// Internal — called when a referred user's first order is delivered
const rewardReferrerOnFirstOrder = async (userId, orderId) => {
  const referral = await Referral.findOne({
    referred: userId,
    status: "pending",
  });

  if (!referral) return null;

  // Mark completed
  referral.status = "completed";
  referral.firstOrderAt = new Date();
  referral.firstOrderId = orderId;
  referral.rewardAmount = rewards.REFERRER_WALLET_BONUS;
  referral.rewardPoints = rewards.REFERRER_POINTS_BONUS;
  referral.rewarded = true;
  await referral.save();

  // Credit referrer's wallet
  const referrerWallet =
    (await Wallet.findOne({ user: referral.referrer })) ||
    (await Wallet.create({ user: referral.referrer, balance: 0 }));

  referrerWallet.balance += rewards.REFERRER_WALLET_BONUS;
  referrerWallet.transactions.unshift({
    type: "referral_bonus",
    amount: rewards.REFERRER_WALLET_BONUS,
    direction: "credit",
    balanceAfter: referrerWallet.balance,
    reference: `Order ${orderId}`,
  });
  await referrerWallet.save();

  // Credit referrer's points
  await RewardPoints.findOneAndUpdate(
    { user: referral.referrer },
    { $setOnInsert: { user: referral.referrer } },
    { upsert: true }
  );

  const referrerPoints = await RewardPoints.findOne({ user: referral.referrer });
  referrerPoints.availablePoints += rewards.REFERRER_POINTS_BONUS;
  referrerPoints.totalEarned += rewards.REFERRER_POINTS_BONUS;
  referrerPoints.transactions.unshift({
    type: "earned_referral",
    points: rewards.REFERRER_POINTS_BONUS,
    direction: "credit",
    reference: `Order ${orderId}`,
  });
  await referrerPoints.save();

  return referral;
};

// GET /api/referrals/me
const getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate("referred", "name phone email avatar createdAt")
      .sort({ createdAt: -1 });

    const summary = {
      totalReferrals: referrals.length,
      completed: referrals.filter((r) => r.status === "completed").length,
      pending: referrals.filter((r) => r.status === "pending").length,
      totalEarned: referrals
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
    };

    return res.status(200).json({ success: true, referrals, summary });
  } catch (err) {
    console.error("getMyReferrals error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load referrals." });
  }
};

// GET /api/referrals/link
// GET /api/referrals/link
const getMyReferralLink = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Auto-generate a referral code if missing
    if (!user.referralCode) {
      let code;
      let exists = true;

      while (exists) {
        code = generateReferralCode(user.name || "USER");
        exists = await User.exists({ referralCode: code });
      }

      user.referralCode = code;
      await user.save();
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${baseUrl}/signup?ref=${user.referralCode}`;

    return res.status(200).json({
      success: true,
      code: user.referralCode,
      link,
    });
  } catch (err) {
    console.error("getMyReferralLink error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to build referral link." });
  }
};

module.exports = {
  applyReferralCode,
  rewardReferrerOnFirstOrder,
  getMyReferrals,
  getMyReferralLink,
};
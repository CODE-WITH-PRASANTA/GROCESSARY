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
  const cleanCode = code.toString().trim().toUpperCase();

  const referrer = await User.findOne({ referralCode: cleanCode });
  if (!referrer) return null;

  // A user cannot refer themselves
  if (referrer._id.toString() === newUserId.toString()) return null;

  // A user can only be referred once
  const alreadyReferred = await Referral.findOne({ referred: newUserId });
  if (alreadyReferred) return null;

  // Create referral record
  const referral = await Referral.create({
    referrer: referrer._id,
    referred: newUserId,
    referralCode: cleanCode,
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
      .populate("referred", "firstName lastName email mobile profileImage createdAt")
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
        code = generateReferralCode(user.firstName || "USER");
        exists = await User.exists({ referralCode: code });
      }

      user.referralCode = code;
      await user.save();
    }

    const baseUrl = process.env.FRONTEND_URL || "";
    const link = baseUrl ? `${baseUrl}/login?ref=${user.referralCode}` : `/login?ref=${user.referralCode}`;

    return res.status(200).json({
      success: true,
      code: user.referralCode,
      referralCode: user.referralCode,
      link,
    });
  } catch (err) {
    console.error("getMyReferralLink error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to build referral link." });
  }
};

// GET /api/referrals/validate/:code
const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res
        .status(400)
        .json({ success: false, valid: false, message: "Referral code required." });
    }

    const cleanCode = code.toString().trim().toUpperCase();
    const referrer = await User.findOne({ referralCode: cleanCode }).select(
      "firstName lastName email"
    );

    if (!referrer) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: "Invalid or expired referral code.",
      });
    }

    const maskedName = `${referrer.firstName || "Grocery Sathi Member"} ${(
      referrer.lastName || ""
    ).slice(0, 1)}.`.trim();

    return res.status(200).json({
      success: true,
      valid: true,
      code: cleanCode,
      referrerName: maskedName,
      friendRewardAmount: rewards.FRIEND_WALLET_BONUS,
      friendRewardPoints: rewards.FRIEND_POINTS_BONUS,
      rewardDescription: `₹${rewards.FRIEND_WALLET_BONUS} Welcome Wallet Bonus + ${rewards.FRIEND_POINTS_BONUS} Reward Points`,
    });
  } catch (err) {
    console.error("validateReferralCode error:", err);
    return res
      .status(500)
      .json({ success: false, valid: false, message: "Validation error." });
  }
};

// GET /api/referrals/admin/all
const adminGetAllReferrals = async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const referrals = await Referral.find(filter)
      .populate(
        "referrer",
        "firstName lastName email mobile profileImage referralCode"
      )
      .populate(
        "referred",
        "firstName lastName email mobile profileImage createdAt"
      )
      .populate("firstOrderId", "orderId totalAmount orderStatus createdAt")
      .sort({ createdAt: -1 });

    let filteredList = referrals;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredList = referrals.filter((r) => {
        const refName = `${r.referrer?.firstName || ""} ${
          r.referrer?.lastName || ""
        }`.toLowerCase();
        const refEmail = (r.referrer?.email || "").toLowerCase();
        const friendName = `${r.referred?.firstName || ""} ${
          r.referred?.lastName || ""
        }`.toLowerCase();
        const friendEmail = (r.referred?.email || "").toLowerCase();
        const code = (r.referralCode || "").toLowerCase();
        return (
          refName.includes(q) ||
          refEmail.includes(q) ||
          friendName.includes(q) ||
          friendEmail.includes(q) ||
          code.includes(q)
        );
      });
    }

    const totalAll = await Referral.countDocuments();
    const completedAll = await Referral.countDocuments({ status: "completed" });
    const pendingAll = await Referral.countDocuments({ status: "pending" });

    const paidAgg = await Referral.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalReward: { $sum: "$rewardAmount" },
          totalPoints: { $sum: "$rewardPoints" },
        },
      },
    ]);

    const friendPaidAgg = await Referral.aggregate([
      {
        $group: {
          _id: null,
          totalFriendReward: { $sum: "$friendRewardAmount" },
          totalFriendPoints: { $sum: "$friendRewardPoints" },
        },
      },
    ]);

    const summary = {
      totalReferrals: totalAll,
      completedReferrals: completedAll,
      pendingReferrals: pendingAll,
      totalReferrerPaid: paidAgg[0]?.totalReward || 0,
      totalFriendBonusPaid: friendPaidAgg[0]?.totalFriendReward || 0,
      totalPointsAwarded:
        (paidAgg[0]?.totalPoints || 0) +
        (friendPaidAgg[0]?.totalFriendPoints || 0),
      config: {
        referrerWalletBonus: rewards.REFERRER_WALLET_BONUS,
        referrerPointsBonus: rewards.REFERRER_POINTS_BONUS,
        friendWalletBonus: rewards.FRIEND_WALLET_BONUS,
        friendPointsBonus: rewards.FRIEND_POINTS_BONUS,
      },
    };

    return res.status(200).json({
      success: true,
      referrals: filteredList,
      summary,
    });
  } catch (err) {
    console.error("adminGetAllReferrals error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load admin referrals." });
  }
};

module.exports = {
  applyReferralCode,
  rewardReferrerOnFirstOrder,
  getMyReferrals,
  getMyReferralLink,
  validateReferralCode,
  adminGetAllReferrals,
};
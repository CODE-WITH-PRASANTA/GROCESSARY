// controllers/walletController.js
const Wallet = require("../models/Wallet");
const rewards = require("../config/rewards");

// GET /api/wallet
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error("getWallet error:", err);
    return res.status(500).json({ success: false, message: "Failed to load wallet." });
  }
};

// POST /api/wallet/add  { amount, method }
const addMoney = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });

    wallet.balance += value;
    wallet.transactions.unshift({
      type: "add_money",
      amount: value,
      direction: "credit",
      balanceAfter: wallet.balance,
      reference: method || "UPI",
    });

    await wallet.save();

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error("addMoney error:", err);
    return res.status(500).json({ success: false, message: "Failed to add money." });
  }
};

// POST /api/wallet/withdraw  { amount, bankDetails }
const withdrawMoney = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }

    if (value < rewards.MIN_WALLET_BALANCE_TO_WITHDRAW) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal is ₹${rewards.MIN_WALLET_BALANCE_TO_WITHDRAW}.`,
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found." });
    }

    if (wallet.balance < value) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance." });
    }

    wallet.balance -= value;
    wallet.transactions.unshift({
      type: "withdrawal",
      amount: value,
      direction: "debit",
      balanceAfter: wallet.balance,
      reference: bankDetails ? JSON.stringify(bankDetails) : "bank",
    });

    await wallet.save();

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error("withdrawMoney error:", err);
    return res.status(500).json({ success: false, message: "Failed to withdraw money." });
  }
};


const RewardPoints = require("../models/RewardPoints");
// const rewards = require("../config/rewards");

// POST /api/wallet/convert-points  { points }
const convertPointsToWallet = async (req, res) => {
  try {
    const points = Number(req.body.points);

    if (!Number.isFinite(points) || points <= 0) {
      return res.status(400).json({ success: false, message: "Invalid points." });
    }

    const pointsAccount = await RewardPoints.findOne({ user: req.user._id });
    if (!pointsAccount || pointsAccount.availablePoints < points) {
      return res.status(400).json({ success: false, message: "Insufficient points." });
    }

    const rupees = points * rewards.POINTS_REDEEM_RATE;

    pointsAccount.availablePoints -= points;
    pointsAccount.totalUsed += points;
    pointsAccount.transactions.unshift({
      type: "redeemed_wallet",
      points,
      direction: "debit",
      reference: `Converted to ₹${rupees.toFixed(2)}`,
    });
    await pointsAccount.save();

    const wallet =
      (await Wallet.findOne({ user: req.user._id })) ||
      (await Wallet.create({ user: req.user._id, balance: 0 }));

    wallet.balance += rupees;
    wallet.transactions.unshift({
      type: "points_conversion",
      amount: rupees,
      direction: "credit",
      balanceAfter: wallet.balance,
      reference: `${points} pts`,
    });
    await wallet.save();

    return res.status(200).json({ success: true, wallet, points: pointsAccount });
  } catch (err) {
    console.error("convertPointsToWallet error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Conversion failed." });
  }
};

module.exports = { getWallet, addMoney, withdrawMoney,convertPointsToWallet };
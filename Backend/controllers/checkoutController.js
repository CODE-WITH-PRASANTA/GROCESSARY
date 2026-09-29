// controllers/checkoutController.js
const Wallet = require("../models/Wallet");
const RewardPoints = require("../models/RewardPoints");
const rewards = require("../config/rewards");

// ======================================================
// DELIVERY RULES — must match placeOrder controller
// ======================================================
const FREE_DELIVERY_THRESHOLD = 199;
const DELIVERY_CHARGE = 30;

// POST /api/checkout/preview
const previewCheckout = async (req, res) => {
  try {
    const { items, useWallet, usePoints } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided." });
    }

    // ==================================================
    // 1. SUBTOTAL
    // ==================================================
    const subtotal = items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );

    // ==================================================
    // 2. DELIVERY CHARGE
    // ==================================================
    const deliveryCharge =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

    // Total BEFORE wallet/points — used for wallet/points caps
    const preDiscountTotal = subtotal + deliveryCharge;

    // ==================================================
    // 3. LOAD USER ACCOUNTS
    // ==================================================
    const wallet = await Wallet.findOne({ user: req.user._id });
    const pointsAccount = await RewardPoints.findOne({ user: req.user._id });

    // ==================================================
    // 4. WALLET (capped against subtotal + delivery)
    // ==================================================
    let walletUsed = 0;
    if (useWallet && wallet && wallet.balance > 0) {
      const maxWallet = Math.min(
        wallet.balance,
        preDiscountTotal * rewards.MAX_WALLET_USE_PERCENT
      );
      walletUsed = Math.max(0, Math.floor(maxWallet * 100) / 100);
    }

    // ==================================================
    // 5. POINTS (capped against subtotal + delivery)
    // ==================================================
    let pointsUsed = 0;
    if (usePoints && pointsAccount && pointsAccount.availablePoints > 0) {
      const maxRedeemablePoints = Math.floor(
        (preDiscountTotal * rewards.MAX_POINTS_REDEEM_PERCENT) /
          rewards.POINTS_REDEEM_RATE
      );
      const usablePoints = Math.min(
        pointsAccount.availablePoints,
        maxRedeemablePoints
      );
      pointsUsed =
        usablePoints >= rewards.MIN_POINTS_TO_REDEEM ? usablePoints : 0;
    }

    const pointsValue = pointsUsed * rewards.POINTS_REDEEM_RATE;

    // ==================================================
    // 6. GRAND TOTAL (includes delivery)
    // ==================================================
    const grandTotal = Math.max(
      0,
      subtotal + deliveryCharge - walletUsed - pointsValue
    );

    return res.status(200).json({
      success: true,
      subtotal,
      deliveryCharge,                       // 👈 added
      walletBalance: wallet?.balance || 0,
      walletUsed,
      pointsAvailable: pointsAccount?.availablePoints || 0,
      pointsUsed,
      pointsValue,
      grandTotal,
    });
  } catch (err) {
    console.error("previewCheckout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Checkout preview failed." });
  }
};

module.exports = { previewCheckout };
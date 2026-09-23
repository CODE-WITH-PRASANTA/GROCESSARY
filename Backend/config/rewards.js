// config/rewards.js

module.exports = {
  // Referral rewards
  REFERRER_WALLET_BONUS: 30,
  REFERRER_POINTS_BONUS: 50,
  FRIEND_WALLET_BONUS: 20,
  FRIEND_POINTS_BONUS: 100,

  // Points rules
  POINTS_EARN_RATE: 0.05,            // 5% of order value → points
  POINTS_REDEEM_RATE: 0.25,          // 1 pt = ₹0.25
  MAX_POINTS_REDEEM_PERCENT: 0.20,   // max 20% of subtotal
  MIN_POINTS_TO_REDEEM: 100,

  // Wallet rules
  MAX_WALLET_USE_PERCENT: 0.50,      // up to 50% of subtotal
  MIN_WALLET_BALANCE_TO_WITHDRAW: 100,
};
// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // adjust to your path
const {
  getWallet,
  addMoney,
  withdrawMoney,
  convertPointsToWallet
} = require("../controllers/walletController");

router.get("/", protect, getWallet);
router.post("/add", protect, addMoney);
router.post("/withdraw", protect, withdrawMoney);
router.post("/convert-points", protect, convertPointsToWallet);

module.exports = router;
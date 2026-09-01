const express = require("express");

const {
  createTodayDiscount,
  getAllTodayDiscounts,
  getActiveTodayDiscounts,
  getTodayDiscountById,
  updateTodayDiscount,
  deleteTodayDiscount,
  toggleTodayDiscountStatus,
} = require("../controllers/todayDiscountController");

const router = express.Router();

// ======================================================
// PUBLIC
// Homepage
// ======================================================

router.get(
  "/active",
  getActiveTodayDiscounts
);

// ======================================================
// TODAY DISCOUNTS
// No authentication required
// ======================================================

// GET ALL
router.get(
  "/",
  getAllTodayDiscounts
);

// GET SINGLE
router.get(
  "/:id",
  getTodayDiscountById
);

// CREATE
router.post(
  "/",
  createTodayDiscount
);

// UPDATE
router.put(
  "/:id",
  updateTodayDiscount
);

// TOGGLE STATUS
router.put(
  "/:id/toggle-status",
  toggleTodayDiscountStatus
);

// DELETE
router.delete(
  "/:id",
  deleteTodayDiscount
);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  toggleCouponVisibility,
  validateCoupon,
} = require("../controllers/couponController");

// Validation route for Cart/Checkout
router.post("/validate", validateCoupon);

// CRUD routes
router
  .route("/")
  .get(getAllCoupons)
  .post(createCoupon);

router
  .route("/:id")
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

// Status and Visibility toggle routes
router.patch("/:id/status", toggleCouponStatus);
router.patch("/:id/visibility", toggleCouponVisibility);

module.exports = router;


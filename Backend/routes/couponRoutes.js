const express = require("express");
const router = express.Router();

const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
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

// Status toggle route
router.patch("/:id/status", toggleCouponStatus);

module.exports = router;


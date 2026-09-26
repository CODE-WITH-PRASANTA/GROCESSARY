const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/summary
router.get("/summary", dashboardController.getSummary);

// GET /api/dashboard/categories
router.get("/categories", dashboardController.getCategories);

// GET /api/dashboard/spending?range=this_month
router.get("/spending", dashboardController.getSpending);

// GET /api/dashboard/recommended
router.get("/recommended", dashboardController.getRecommended);

// GET /api/dashboard/offers
router.get("/offers", dashboardController.getOffers);

module.exports = router;
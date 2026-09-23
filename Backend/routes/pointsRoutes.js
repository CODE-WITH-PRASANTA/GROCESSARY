// routes/pointsRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getPoints } = require("../controllers/pointsController");

router.get("/", protect, getPoints);

module.exports = router;
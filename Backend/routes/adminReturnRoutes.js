// routes/adminReturnRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminAuthMiddleware");
const ctrl = require("../controllers/adminReturnController");

// Every route requires an authenticated admin
router.use( adminMiddleware);
// List returns
router.get("/", ctrl.listReturns);

// Summary — must be BEFORE any /:id route
router.get("/summary", ctrl.returnsSummary);

// Actions
router.put("/:orderId/status", ctrl.updateReturnStatus);
router.put("/:orderId/assign", ctrl.assignReturn);
router.put("/:orderId/schedule-pickup", ctrl.schedulePickup);
router.put("/:orderId/inspection", ctrl.submitInspection);

module.exports = router;
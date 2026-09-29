// routes/billRoutes.js
const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminAuthMiddleware");
const billController = require("../controllers/billController");

// Every bill route is admin-only
router.use(adminMiddleware);

// Create a bill
router.post("/", billController.createBill);
router.post("/upi-init", billController.initUpiPayment);

// UPI helpers
router.get("/upi-config", billController.getUpiConfig);
router.get("/upi-check/:upiTransactionId", billController.checkUpiTransaction);

// List bills (admin-only — already enforced by router.use above)
router.get("/", billController.listBills);

// Single bill
router.get("/:id", billController.getBillById);

module.exports = router;
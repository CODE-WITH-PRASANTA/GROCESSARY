const express = require("express");

const {
  addDeliveryAddress,
  getDeliveryAddresses,
  getDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultDeliveryAddress,
} = require("../controllers/deliveryAddressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getDeliveryAddresses);

router.post("/", addDeliveryAddress);

router.get("/:id", getDeliveryAddress);

router.put("/:id", updateDeliveryAddress);

router.delete("/:id", deleteDeliveryAddress);

router.put("/:id/default", setDefaultDeliveryAddress);

module.exports = router;
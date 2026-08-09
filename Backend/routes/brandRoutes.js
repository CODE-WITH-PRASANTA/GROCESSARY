const express = require("express");
const router = express.Router();

const {
  getBrands,
  createBrand,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
} = require("../controllers/brandController");

const {
  upload,
  convertToWebp,
} = require("../middleware/upload");

router.get("/", getBrands);

router.post(
  "/",
  upload.single("logo"),
  convertToWebp,
  createBrand
);

router.put(
  "/:id",
  upload.single("logo"),
  convertToWebp,
  updateBrand
);

router.patch(
  "/:id/status",
  updateBrandStatus
);

router.delete(
  "/:id",
  deleteBrand
);

module.exports = router;
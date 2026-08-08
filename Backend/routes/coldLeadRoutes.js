const express = require("express");

const {
  createColdLead,
  getColdLeads,
  getColdLeadById,
  updateColdLead,
  deleteColdLead,
  deleteMultipleColdLeads,
} = require("../controllers/coldLeadController");

const router = express.Router();

// GET all leads
router.get("/", getColdLeads);

// GET single lead
router.get("/:id", getColdLeadById);

// CREATE lead
router.post("/", createColdLead);

// UPDATE lead
router.put("/:id", updateColdLead);

// DELETE multiple leads
router.delete("/", deleteMultipleColdLeads);

// DELETE single lead
router.delete("/:id", deleteColdLead);

module.exports = router;
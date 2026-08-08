const ColdLead = require("../models/ColdLead");

// ==========================================
// CREATE LEAD
// POST /api/cold-leads
// ==========================================
const createColdLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      lookingFor,
      source,
      date,
      status,
      notes,
    } = req.body;

    // Basic validation
    if (!name || !phone || !email || !lookingFor || !source || !date) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const lead = await ColdLead.create({
      name,
      phone,
      email,
      lookingFor,
      source,
      date,
      status: status || "New",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Cold lead created successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create cold lead.",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL LEADS
// GET /api/cold-leads
// ==========================================
const getColdLeads = async (req, res) => {
  try {
    const leads = await ColdLead.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cold leads.",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE LEAD
// GET /api/cold-leads/:id
// ==========================================
const getColdLeadById = async (req, res) => {
  try {
    const lead = await ColdLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Cold lead not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Get Single Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cold lead.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE LEAD
// PUT /api/cold-leads/:id
// ==========================================
const updateColdLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      lookingFor,
      source,
      date,
      status,
      notes,
    } = req.body;

    const lead = await ColdLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Cold lead not found.",
      });
    }

    lead.name = name;
    lead.phone = phone;
    lead.email = email;
    lead.lookingFor = lookingFor;
    lead.source = source;
    lead.date = date;
    lead.status = status;
    lead.notes = notes || "";

    const updatedLead = await lead.save();

    res.status(200).json({
      success: true,
      message: "Cold lead updated successfully.",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update cold lead.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE LEAD
// DELETE /api/cold-leads/:id
// ==========================================
const deleteColdLead = async (req, res) => {
  try {
    const lead = await ColdLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Cold lead not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cold lead deleted successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete cold lead.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE MULTIPLE LEADS
// DELETE /api/cold-leads
// ==========================================
const deleteMultipleColdLeads = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide lead IDs.",
      });
    }

    const result = await ColdLead.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} lead(s) deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete Multiple Leads Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete leads.",
      error: error.message,
    });
  }
};

module.exports = {
  createColdLead,
  getColdLeads,
  getColdLeadById,
  updateColdLead,
  deleteColdLead,
  deleteMultipleColdLeads,
};
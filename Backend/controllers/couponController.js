const Coupon = require("../models/Coupon");

// ======================================================
// GET ALL COUPONS
// ======================================================
// GET /api/coupons?status=Active&search=WELCOME&visibility=public&isPublic=true
const getAllCoupons = async (req, res) => {
  try {
    const { status, search, visibility, isPublic } = req.query;
    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (visibility === "public" || isPublic === "true" || isPublic === true) {
      query.isPublic = true;
    } else if (visibility === "private" || isPublic === "false" || isPublic === false) {
      query.isPublic = false;
    }

    if (search && search.trim()) {
      const searchConditions = [
        { code: { $regex: search.trim(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Auto-update expired coupons (by expiryDate or usageLimit reached)
    const now = new Date();
    await Coupon.updateMany(
      { expiryDate: { $lte: now }, status: "Active" },
      { $set: { status: "Expired" } }
    );
    await Coupon.updateMany(
      {
        usageLimit: { $ne: null },
        $expr: { $gte: ["$usageCount", "$usageLimit"] },
        status: "Active",
      },
      { $set: { status: "Expired" } }
    );

    if (status === "Active") {
      query.status = "Active";
      query.expiryDate = { $gt: now };
      query.startDate = { $lte: now };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    // Calculate summary statistics
    const allCoupons = await Coupon.find();
    const stats = {
      total: allCoupons.length,
      active: allCoupons.filter((c) => c.status === "Active").length,
      inactive: allCoupons.filter((c) => c.status === "Inactive").length,
      expired: allCoupons.filter((c) => c.status === "Expired").length,
      publicCount: allCoupons.filter((c) => c.isPublic !== false).length,
      privateCount: allCoupons.filter((c) => c.isPublic === false).length,
      totalUsage: allCoupons.reduce((sum, c) => sum + (c.usageCount || 0), 0),
    };

    return res.status(200).json({
      success: true,
      count: coupons.length,
      stats,
      data: coupons,
    });
  } catch (error) {
    console.error("Get all coupons error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons",
    });
  }
};

// ======================================================
// GET SINGLE COUPON BY ID OR CODE
// ======================================================
// GET /api/coupons/:id
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    let coupon = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      coupon = await Coupon.findById(id);
    } else {
      coupon = await Coupon.findOne({ code: id.toUpperCase().trim() });
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Get coupon by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupon details",
    });
  }
};

// ======================================================
// CREATE NEW COUPON
// ======================================================
// POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      status,
      isPublic,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon title is required",
      });
    }

    if (discountValue === undefined || discountValue === null || Number(discountValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive discount value is required",
      });
    }

    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Expiry date is required",
      });
    }

    const cleanCode = code.toUpperCase().trim().replace(/\s+/g, "");

    // Check for existing coupon code
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists`,
      });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      title: title.trim(),
      description: description ? description.trim() : "",
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      status: status || "Active",
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

// ======================================================
// UPDATE COUPON
// ======================================================
// PUT /api/coupons/:id
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim().replace(/\s+/g, "");

      // Ensure code is not already taken by another coupon
      const duplicate = await Coupon.findOne({
        code: updateData.code,
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Coupon code '${updateData.code}' is already in use by another coupon`,
        });
      }
    }

    if (updateData.discountValue !== undefined) {
      updateData.discountValue = Number(updateData.discountValue);
    }
    if (updateData.minPurchase !== undefined) {
      updateData.minPurchase = Number(updateData.minPurchase);
    }
    if (updateData.maxDiscount !== undefined) {
      updateData.maxDiscount = updateData.maxDiscount ? Number(updateData.maxDiscount) : null;
    }
    if (updateData.usageLimit !== undefined) {
      updateData.usageLimit = updateData.usageLimit ? Number(updateData.usageLimit) : null;
    }
    if (updateData.perUserLimit !== undefined) {
      updateData.perUserLimit = Number(updateData.perUserLimit);
    }
    if (updateData.isPublic !== undefined) {
      updateData.isPublic = Boolean(updateData.isPublic);
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};

// ======================================================
// DELETE COUPON
// ======================================================
// DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};

// ======================================================
// TOGGLE STATUS
// ======================================================
// PATCH /api/coupons/:id/status
const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    let newStatus = req.body.status;
    if (!newStatus) {
      newStatus = coupon.status === "Active" ? "Inactive" : "Active";
    }

    // Check if expiry date has passed before activating
    if (newStatus === "Active" && coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot activate an expired coupon. Please extend the expiry date first.",
      });
    }

    coupon.status = newStatus;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon status changed to ${coupon.status}`,
      data: coupon,
    });
  } catch (error) {
    console.error("Toggle coupon status error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to change coupon status",
    });
  }
};

// ======================================================
// TOGGLE VISIBILITY (PUBLIC / PRIVATE)
// ======================================================
// PATCH /api/coupons/:id/visibility
const toggleCouponVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    let newVisibility;
    if (req.body && req.body.isPublic !== undefined) {
      newVisibility = Boolean(req.body.isPublic);
    } else {
      newVisibility = coupon.isPublic === false ? true : false;
    }

    coupon.isPublic = newVisibility;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon is now ${coupon.isPublic ? "Public (Visible to store)" : "Private (Hidden code-only)"}`,
      data: coupon,
    });
  } catch (error) {
    console.error("Toggle coupon visibility error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to change coupon visibility",
    });
  }
};

// ======================================================
// VALIDATE & APPLY COUPON (FOR CART / CHECKOUT)
// ======================================================
// POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code",
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const now = new Date();

    if (coupon.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: `This coupon is currently ${coupon.status.toLowerCase()}`,
      });
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet",
      });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      coupon.status = "Expired";
      await coupon.save();
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its maximum total usage limit",
      });
    }

    const subtotal = Number(orderAmount) || 0;
    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minPurchase} required to apply this coupon`,
      });
    }

    // Check per-user limit if userId provided
    if (userId && coupon.usedBy && coupon.usedBy.length > 0) {
      const userUsageCount = coupon.usedBy.filter(
        (u) => u.userId && u.userId.toString() === userId.toString()
      ).length;
      if (userUsageCount >= coupon.perUserLimit) {
        return res.status(400).json({
          success: false,
          message: `You have reached the maximum usage limit (${coupon.perUserLimit} time) for this coupon`,
        });
      }
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    discount = Math.round(discount * 100) / 100;
    const finalAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discount}`,
      data: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        finalAmount,
        minPurchase: coupon.minPurchase,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to validate coupon",
    });
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  toggleCouponVisibility,
  validateCoupon,
};


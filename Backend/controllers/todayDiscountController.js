const mongoose = require("mongoose");

const TodayDiscount = require("../models/TodayDiscount");
const Product = require("../models/Product");

// ======================================================
// HELPER
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// POPULATE QUERY
// ======================================================

const populateTodayDiscount = (query) => {
  return query
    .populate({
      path: "product",
      populate: [
        {
          path: "category",
          select: "_id name",
        },
        {
          path: "brand",
          select: "_id name",
        },
        {
          path: "unit",
          select: "_id name",
        },
      ],
    });
};

// ======================================================
// CREATE TODAY DISCOUNT
// ADMIN
// ======================================================

const createTodayDiscount = async (
  req,
  res
) => {
  try {
    const {
      productId,
      discountPrice,
      startDate,
      endDate,
      status,
    } = req.body || {};

    // ==================================================
    // PRODUCT ID
    // ==================================================

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // ==================================================
    // DISCOUNT PRICE
    // ==================================================

    const finalDiscountPrice =
      Number(discountPrice);

    if (
      !Number.isFinite(
        finalDiscountPrice
      ) ||
      finalDiscountPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid discount price is required.",
      });
    }

    // ==================================================
    // DATES
    // ==================================================

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Start date is required.",
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date is required.",
      });
    }

    const finalStartDate =
      new Date(startDate);

    const finalEndDate =
      new Date(endDate);

    if (
      Number.isNaN(
        finalStartDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start date.",
      });
    }

    if (
      Number.isNaN(
        finalEndDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid end date.",
      });
    }

    if (
      finalEndDate <
      finalStartDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date.",
      });
    }

    // ==================================================
    // FIND PRODUCT
    // ==================================================

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    // ==================================================
    // PRODUCT STATUS
    // ==================================================

    if (
      product.status ===
      "inactive"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Inactive product cannot be added to Today Discounts.",
      });
    }

    // ==================================================
    // PRICE VALIDATION
    // ==================================================

    const productPrice =
      Number(
        product.price || 0
      );

    if (
      finalDiscountPrice >
      productPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price cannot be greater than the product price.",
      });
    }

    // ==================================================
    // DUPLICATE
    // ==================================================

    const existing =
      await TodayDiscount.findOne({
        product: productId,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "This product is already added to Today Discounts.",
      });
    }

    // ==================================================
    // CREATE
    // ==================================================

    const todayDiscount =
      await TodayDiscount.create({
        product: productId,

        discountPrice:
          finalDiscountPrice,

        startDate:
          finalStartDate,

        endDate:
          finalEndDate,

        status:
          status === "inactive"
            ? "inactive"
            : "active",
      });

    // ==================================================
    // POPULATE
    // ==================================================

    const populated =
      await populateTodayDiscount(
        TodayDiscount.findById(
          todayDiscount._id
        )
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,
      message:
        "Today discount created successfully.",
      data: populated,
    });
  } catch (error) {
    console.error(
      "Create today discount error:",
      error
    );

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (
      error?.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This product is already added to Today Discounts.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create Today Discount.",
    });
  }
};

// ======================================================
// GET ALL TODAY DISCOUNTS
// ADMIN
// ======================================================

const getAllTodayDiscounts =
  async (req, res) => {
    try {
      const discounts =
        await populateTodayDiscount(
          TodayDiscount.find()
        ).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count:
          discounts.length,
        data: discounts,
      });
    } catch (error) {
      console.error(
        "Get all today discounts error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch Today Discounts.",
      });
    }
  };

// ======================================================
// GET ACTIVE TODAY DISCOUNTS
// PUBLIC
// ======================================================

const getActiveTodayDiscounts =
  async (req, res) => {
    try {
      const now =
        new Date();

      const discounts =
        await populateTodayDiscount(
          TodayDiscount.find({
            status: "active",

            startDate: {
              $lte: now,
            },

            endDate: {
              $gte: now,
            },
          })
        ).sort({
          createdAt: -1,
        });

      // ==================================================
      // ONLY ACTIVE PRODUCTS
      // ==================================================

      const activeDiscounts =
        discounts.filter(
          (discount) => {
            return (
              discount?.product &&
              discount.product.status ===
                "active"
            );
          }
        );

      return res.status(200).json({
        success: true,
        count:
          activeDiscounts.length,
        data:
          activeDiscounts,
      });
    } catch (error) {
      console.error(
        "Get active today discounts error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch active Today Discounts.",
      });
    }
  };

// ======================================================
// GET SINGLE
// ADMIN
// ======================================================

const getTodayDiscountById =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Today Discount ID.",
        });
      }

      const discount =
        await populateTodayDiscount(
          TodayDiscount.findById(
            id
          )
        );

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Today Discount not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: discount,
      });
    } catch (error) {
      console.error(
        "Get today discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch Today Discount.",
      });
    }
  };

// ======================================================
// UPDATE
// ADMIN
// ======================================================

const updateTodayDiscount =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const {
        productId,
        discountPrice,
        startDate,
        endDate,
        status,
      } = req.body || {};

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Today Discount ID.",
        });
      }

      const existing =
        await TodayDiscount.findById(
          id
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Today Discount not found.",
        });
      }

      // ==================================================
      // PRODUCT
      // ==================================================

      const finalProductId =
        productId ||
        existing.product;

      if (
        !isValidObjectId(
          finalProductId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const product =
        await Product.findById(
          finalProductId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      // ==================================================
      // PRICE
      // ==================================================

      const finalPrice =
        discountPrice !==
        undefined
          ? Number(
              discountPrice
            )
          : Number(
              existing.discountPrice
            );

      if (
        !Number.isFinite(
          finalPrice
        ) ||
        finalPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid discount price is required.",
        });
      }

      if (
        finalPrice >
        Number(
          product.price || 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount price cannot be greater than the product price.",
        });
      }

      // ==================================================
      // DATES
      // ==================================================

      const finalStartDate =
        startDate
          ? new Date(
              startDate
            )
          : new Date(
              existing.startDate
            );

      const finalEndDate =
        endDate
          ? new Date(
              endDate
            )
          : new Date(
              existing.endDate
            );

      if (
        Number.isNaN(
          finalStartDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start date.",
        });
      }

      if (
        Number.isNaN(
          finalEndDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid end date.",
        });
      }

      if (
        finalEndDate <
        finalStartDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "End date cannot be before start date.",
        });
      }

      // ==================================================
      // DUPLICATE PRODUCT
      // ==================================================

      const duplicate =
        await TodayDiscount.findOne({
          product:
            finalProductId,

          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "This product is already used in another Today Discount.",
        });
      }

      // ==================================================
      // UPDATE
      // ==================================================

      existing.product =
        finalProductId;

      existing.discountPrice =
        finalPrice;

      existing.startDate =
        finalStartDate;

      existing.endDate =
        finalEndDate;

      if (
        status ===
        "active" ||
        status ===
        "inactive"
      ) {
        existing.status =
          status;
      }

      await existing.save();

      // ==================================================
      // POPULATE
      // ==================================================

      const populated =
        await populateTodayDiscount(
          TodayDiscount.findById(
            existing._id
          )
        );

      return res.status(200).json({
        success: true,
        message:
          "Today Discount updated successfully.",
        data: populated,
      });
    } catch (error) {
      console.error(
        "Update today discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update Today Discount.",
      });
    }
  };

// ======================================================
// DELETE
// ADMIN
// ======================================================

const deleteTodayDiscount =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Today Discount ID.",
        });
      }

      const deleted =
        await TodayDiscount.findByIdAndDelete(
          id
        );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message:
            "Today Discount not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Today Discount deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete today discount error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete Today Discount.",
      });
    }
  };

// ======================================================
// TOGGLE STATUS
// ADMIN
// ======================================================

const toggleTodayDiscountStatus =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Today Discount ID.",
        });
      }

      const discount =
        await TodayDiscount.findById(
          id
        );

      if (!discount) {
        return res.status(404).json({
          success: false,
          message:
            "Today Discount not found.",
        });
      }

      discount.status =
        discount.status ===
        "active"
          ? "inactive"
          : "active";

      await discount.save();

      const populated =
        await populateTodayDiscount(
          TodayDiscount.findById(
            discount._id
          )
        );

      return res.status(200).json({
        success: true,
        message:
          `Today Discount ${
            discount.status ===
            "active"
              ? "activated"
              : "deactivated"
          } successfully.`,

        data: populated,
      });
    } catch (error) {
      console.error(
        "Toggle today discount status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update Today Discount status.",
      });
    }
  };

module.exports = {
  createTodayDiscount,
  getAllTodayDiscounts,
  getActiveTodayDiscounts,
  getTodayDiscountById,
  updateTodayDiscount,
  deleteTodayDiscount,
  toggleTodayDiscountStatus,
};
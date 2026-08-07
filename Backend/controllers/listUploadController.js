const ListUpload = require("../models/ListUpload");

const {
  mapUploadedFile,
  deleteUploadedFile,
} = require("../middleware/upload");

// ======================================================
// GENERATE ORDER ID
// ======================================================

const generateOrderId = () => {
  const date = new Date();

  const year = date
    .getFullYear()
    .toString()
    .slice(-2);

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `GS-${year}${month}${day}-${randomNumber}`;
};

// ======================================================
// GENERATE RECEIPT NUMBER
// ======================================================

const generateReceiptNo = () => {
  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `#${randomNumber}`;
};

// ======================================================
// CREATE LIST ORDER
// POST /api/list-upload
// ======================================================

const createListUpload = async (req, res) => {
  let uploadedFileData = null;

  try {
    const {
      listName,
      FullName,
      fullName,
      countryCode,
      phoneNumber,
      deliveryAddress,
    } = req.body;

    // Support both FullName and fullName
    const customerName =
      FullName || fullName;

    // =====================================
    // Validation
    // =====================================

    if (
      !listName ||
      !customerName ||
      !phoneNumber ||
      !deliveryAddress
    ) {
      // Multer may already have saved the file,
      // so remove it if validation fails.
      if (req.file) {
        uploadedFileData =
          mapUploadedFile(req.file, req);

        deleteUploadedFile(
          uploadedFileData
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload your grocery list",
      });
    }

    // =====================================
    // Map uploaded Image/PDF
    // =====================================

    uploadedFileData =
      mapUploadedFile(req.file, req);

    // =====================================
    // Create Order
    // =====================================

    const order =
      await ListUpload.create({
        listName: listName.trim(),

        fullName:
          customerName.trim(),

        countryCode:
          countryCode || "+91",

        phoneNumber:
          phoneNumber.trim(),

        deliveryAddress:
          deliveryAddress.trim(),

        uploadedFile:
          uploadedFileData,

        orderId:
          generateOrderId(),

        receiptNo:
          generateReceiptNo(),

        status: "Received",
      });

    return res.status(201).json({
      success: true,

      message:
        "Grocery list submitted successfully",

      data: order,
    });
  } catch (error) {
    // If MongoDB save fails,
    // remove uploaded file.

    if (uploadedFileData) {
      deleteUploadedFile(
        uploadedFileData
      );
    }

    console.error(
      "Create List Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to submit grocery list",

      error: error.message,
    });
  }
};

// ======================================================
// GET ALL ORDERS
// GET /api/list-upload
// ======================================================

const getAllListUploads = async (
  req,
  res
) => {
  try {
    // Optional query:
    // ?status=Packing
    // ?search=Debashish

    const {
      status,
      search,
    } = req.query;

    const filter = {};

    // =====================================
    // Status filter
    // =====================================

    if (status) {
      filter.status = status;
    }

    // =====================================
    // Search
    // =====================================

    if (search) {
      filter.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },

        {
          phoneNumber: {
            $regex: search,
            $options: "i",
          },
        },

        {
          orderId: {
            $regex: search,
            $options: "i",
          },
        },

        {
          receiptNo: {
            $regex: search,
            $options: "i",
          },
        },

        {
          listName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const orders =
      await ListUpload.find(filter)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count: orders.length,

      data: orders,
    });
  } catch (error) {
    console.error(
      "Get Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch orders",

      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// GET /api/list-upload/:id
// ======================================================

const getListUploadById = async (
  req,
  res
) => {
  try {
    const order =
      await ListUpload.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Get Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch order",

      error: error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER
// Can also replace old Image/PDF
//
// PUT /api/list-upload/:id
// ======================================================

const updateListUpload = async (req, res) => {
  try {
    const order = await ListUpload.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("UPDATE BODY:", req.body);
    console.log("UPDATE FILE:", req.file);

    const {
      listName,
      FullName,
      countryCode,
      phoneNumber,
      deliveryAddress,
      items,
      price,
      serviceCharge,
      handlingCharge,
      gst,
    } = req.body;

    // =============================
    // BASIC INFORMATION
    // =============================

    if (listName !== undefined) {
      order.listName = listName;
    }

    if (FullName !== undefined) {
      order.fullName = FullName;
    }

    if (countryCode !== undefined) {
      order.countryCode = countryCode;
    }

    if (phoneNumber !== undefined) {
      order.phoneNumber = phoneNumber;
    }

    if (
      deliveryAddress !== undefined &&
      deliveryAddress !== ""
    ) {
      order.deliveryAddress =
        deliveryAddress;
    }

    // =============================
    // BILLING INFORMATION
    // =============================

    if (items !== undefined) {
      order.items =
        Number(items) || 0;
    }

    if (price !== undefined) {
      order.price =
        Number(price) || 0;
    }

    if (serviceCharge !== undefined) {
      order.serviceCharge =
        Number(serviceCharge) || 0;
    }

    if (handlingCharge !== undefined) {
      order.handlingCharge =
        Number(handlingCharge) || 0;
    }

    if (gst !== undefined) {
      order.gst =
        Number(gst) || 0;
    }

    // =============================
    // REPLACE FILE
    // =============================

    if (req.file) {
      // Delete old file
      if (order.uploadedFile?.path) {
        deleteUploadedFile(
          order.uploadedFile.path
        );
      }

      // Save new file information
      order.uploadedFile =
        mapUploadedFile(
          req.file,
          req
        );
    }

    // =============================
    // SAVE
    // =============================

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "List updated successfully",
      data: order,
    });

  } catch (error) {
    console.error(
      "Update List Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update list",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS
// PATCH /api/list-upload/:id/status
// ======================================================

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
    } = req.body;

    const allowedStatus = [
      "Received",
      "Reviewing List",
      "Packing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    // =====================================
    // Validation
    // =====================================

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "Status is required",
      });
    }

    if (
      !allowedStatus.includes(status)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid order status",

        allowedStatus,
      });
    }

    // =====================================
    // Update
    // =====================================

    const order =
      await ListUpload.findByIdAndUpdate(
        req.params.id,

        {
          status,
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Order status updated successfully",

      data: order,
    });
  } catch (error) {
    console.error(
      "Update Status Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update status",

      error: error.message,
    });
  }
};

// ======================================================
// TRACK ORDER BY ORDER ID
// GET /api/list-upload/track/:orderId
// ======================================================

const trackOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await ListUpload.findOne({
      orderId: orderId.trim(),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your Order ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order found successfully",
      data: {
        orderId: order.orderId,
        status: order.status,
        listName: order.listName,
        fullName: order.fullName,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Track Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to track order",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE ORDER
// DELETE /api/list-upload/:id
// ======================================================

const deleteListUpload = async (
  req,
  res
) => {
  try {
    // =====================================
    // Find order
    // =====================================

    const order =
      await ListUpload.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Keep file reference before
    // deleting MongoDB record.

    const uploadedFile =
      order.uploadedFile;

    // =====================================
    // Delete MongoDB record
    // =====================================

    await order.deleteOne();

    // =====================================
    // Delete physical Image/PDF
    // =====================================

    if (uploadedFile) {
      deleteUploadedFile(
        uploadedFile
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Order and uploaded file deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete order",

      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createListUpload,
  getAllListUploads,
  getListUploadById,
  updateListUpload,
  updateOrderStatus,
  deleteListUpload,
  trackOrderByOrderId,
};
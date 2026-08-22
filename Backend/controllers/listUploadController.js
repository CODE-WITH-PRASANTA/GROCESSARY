const ListUpload = require("../models/ListUpload");

const {
  mapUploadedFile,
  deleteUploadedFile,
} = require("../middleware/upload");

// ======================================================
// HELPER: SAFE FILE DELETER
// Handles strings, Mongoose file sub-docs, or raw Multer files
// ======================================================
const safeDeleteFile = (fileData) => {
  if (!fileData) return;

  // 1. If it's a string path directly
  if (typeof fileData === "string") {
    deleteUploadedFile(fileData);
    return;
  }

  // 2. If it's an object containing a .path property
  if (fileData && typeof fileData === "object" && fileData.path) {
    deleteUploadedFile(fileData.path);
    return;
  }
};

// ======================================================
// GENERATE ORDER ID
// ======================================================
const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `GS-${year}${month}${day}-${randomNumber}`;
};

// ======================================================
// GENERATE RECEIPT NUMBER
// ======================================================
const generateReceiptNo = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
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
      deliveryDateTime,
      items,
      price,
      serviceCharge,
      handlingCharge,
      gst,
    } = req.body;

    const customerName = FullName || fullName;

    // Basic Validation
    if (!listName || !customerName || !phoneNumber || !deliveryAddress) {
      if (req.file) safeDeleteFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // File Validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your grocery list",
      });
    }

    // Delivery Date & Time Validation
    let parsedDeliveryDateTime = null;
    if (deliveryDateTime) {
      parsedDeliveryDateTime = new Date(deliveryDateTime);

      if (Number.isNaN(parsedDeliveryDateTime.getTime())) {
        if (req.file) safeDeleteFile(req.file);

        return res.status(400).json({
          success: false,
          message: "Invalid delivery date and time",
        });
      }
    }

    // Map Customer Uploaded File
    uploadedFileData = mapUploadedFile(req.file, req);

    const now = new Date();

    // Create Order
    const order = await ListUpload.create({
      listName: listName.trim(),
      fullName: customerName.trim(),
      countryCode: countryCode?.trim() || "+91",
      phoneNumber: phoneNumber.trim(),
      deliveryAddress: deliveryAddress.trim(),
      deliveryDateTime: parsedDeliveryDateTime,
      uploadedFile: uploadedFileData,
      items: Number(items || 0),
      price: Number(price || 0),
      serviceCharge: Number(serviceCharge || 0),
      handlingCharge: Number(handlingCharge || 0),
      gst: Number(gst || 0),
      orderId: generateOrderId(),
      receiptNo: generateReceiptNo(),
      status: "Received",
      statusHistory: [
        {
          status: "Received",
          date: now,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Grocery list submitted successfully",
      data: order,
    });
  } catch (error) {
    // File Cleanup on Failure
    if (uploadedFileData) {
      safeDeleteFile(uploadedFileData);
    } else if (req.file) {
      safeDeleteFile(req.file);
    }

    console.error("Create List Upload Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate order information generated. Please try again.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit grocery list",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL ORDERS
// GET /api/list-upload
// ======================================================
const getAllListUploads = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
        { receiptNo: { $regex: search, $options: "i" } },
        { listName: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await ListUpload.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// GET /api/list-upload/:id
// ======================================================
const getListUploadById = async (req, res) => {
  try {
    const order = await ListUpload.findById(req.params.id);

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
    console.error("Get Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER
// PUT /api/list-upload/:id
// ======================================================
const updateListUpload = async (req, res) => {
  let newUploadedFileData = null;

  try {
    const order = await ListUpload.findById(req.params.id);

    if (!order) {
      if (req.file) safeDeleteFile(req.file);

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const {
      listName,
      FullName,
      fullName,
      countryCode,
      phoneNumber,
      deliveryAddress,
      deliveryDateTime,
      items,
      price,
      serviceCharge,
      handlingCharge,
      gst,
    } = req.body;

    if (listName !== undefined) order.listName = listName.trim();

    const customerName = FullName !== undefined ? FullName : fullName;
    if (customerName !== undefined) order.fullName = customerName.trim();

    if (countryCode !== undefined) order.countryCode = countryCode.trim();
    if (phoneNumber !== undefined) order.phoneNumber = phoneNumber.trim();

    if (deliveryAddress !== undefined && deliveryAddress !== "") {
      order.deliveryAddress = deliveryAddress.trim();
    }

    if (deliveryDateTime !== undefined) {
      if (deliveryDateTime === "" || deliveryDateTime === null) {
        order.deliveryDateTime = null;
      } else {
        const parsedDate = new Date(deliveryDateTime);

        if (Number.isNaN(parsedDate.getTime())) {
          if (req.file) safeDeleteFile(req.file);

          return res.status(400).json({
            success: false,
            message: "Invalid delivery date and time",
          });
        }
        order.deliveryDateTime = parsedDate;
      }
    }

    if (items !== undefined) {
      const parsedItems = Number(items);
      if (!Number.isNaN(parsedItems) && parsedItems >= 0) {
        order.items = parsedItems;
      }
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isNaN(parsedPrice) && parsedPrice >= 0) {
        order.price = parsedPrice;
      }
    }

    if (serviceCharge !== undefined) {
      const parsedServiceCharge = Number(serviceCharge);
      if (!Number.isNaN(parsedServiceCharge) && parsedServiceCharge >= 0) {
        order.serviceCharge = parsedServiceCharge;
      }
    }

    if (handlingCharge !== undefined) {
      const parsedHandlingCharge = Number(handlingCharge);
      if (!Number.isNaN(parsedHandlingCharge) && parsedHandlingCharge >= 0) {
        order.handlingCharge = parsedHandlingCharge;
      }
    }

    if (gst !== undefined) {
      const parsedGst = Number(gst);
      if (!Number.isNaN(parsedGst) && parsedGst >= 0) {
        order.gst = parsedGst;
      }
    }

    // Handle File Replacement
    if (req.file) {
      newUploadedFileData = mapUploadedFile(req.file, req);
      const oldUploadedFile = order.uploadedFile;

      order.uploadedFile = newUploadedFileData;
      await order.save();

      // Clean up old file after successfully saving new order details
      if (oldUploadedFile) {
        safeDeleteFile(oldUploadedFile);
      }
    } else {
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "List updated successfully",
      data: order,
    });
  } catch (error) {
    if (newUploadedFileData) {
      safeDeleteFile(newUploadedFileData);
    } else if (req.file) {
      safeDeleteFile(req.file);
    }

    console.error("Update List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update list",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS
// PUT /api/list-upload/:id/status
// ======================================================
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "Received",
      "Reviewing List",
      "Packing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        allowedStatus,
      });
    }

    const order = await ListUpload.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === status) {
      return res.status(200).json({
        success: true,
        message: `Order is already ${status}`,
        data: order,
      });
    }

    const now = new Date();
    order.status = status;
    order.statusHistory.push({ status, date: now });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// ======================================================
// UPLOAD FINAL ORDER RECEIPT
// PUT /api/list-upload/:id/receipt
// ======================================================
const uploadOrderReceipt = async (req, res) => {
  let newReceiptFile = null;

  try {
    const order = await ListUpload.findById(req.params.id);

    if (!order) {
      if (req.file) safeDeleteFile(req.file);

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a receipt file",
      });
    }

    const receiptAllowedStatuses = ["Out for Delivery", "Delivered"];

    if (!receiptAllowedStatuses.includes(order.status)) {
      if (req.file) safeDeleteFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Receipt can be uploaded only after the order reaches Out for Delivery",
      });
    }

    newReceiptFile = mapUploadedFile(req.file, req);
    const oldReceiptFile = order.receiptFile;

    order.receiptFile = newReceiptFile;
    await order.save();

    if (oldReceiptFile) {
      safeDeleteFile(oldReceiptFile);
    }

    return res.status(200).json({
      success: true,
      message: "Receipt uploaded successfully",
      data: order,
    });
  } catch (error) {
    if (newReceiptFile) {
      safeDeleteFile(newReceiptFile);
    } else if (req.file) {
      safeDeleteFile(req.file);
    }

    console.error("Upload Receipt Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload receipt",
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

    if (!orderId || !orderId.trim()) {
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
        _id: order._id,
        orderId: order.orderId,
        receiptNo: order.receiptNo,
        status: order.status,
        listName: order.listName,
        fullName: order.fullName,
        countryCode: order.countryCode,
        phoneNumber: order.phoneNumber,
        deliveryAddress: order.deliveryAddress,
        deliveryDateTime: order.deliveryDateTime,
        statusHistory: order.statusHistory || [],
        uploadedFile: order.uploadedFile || null,
        receiptFile: order.receiptFile || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Track Order Error:", error);
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
const deleteListUpload = async (req, res) => {
  try {
    const order = await ListUpload.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const uploadedFile = order.uploadedFile;
    const receiptFile = order.receiptFile;

    await order.deleteOne();

    if (uploadedFile) {
      safeDeleteFile(uploadedFile);
    }

    if (receiptFile) {
      safeDeleteFile(receiptFile);
    }

    return res.status(200).json({
      success: true,
      message: "Order and uploaded files deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
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
  uploadOrderReceipt,
  trackOrderByOrderId,
  deleteListUpload,
};
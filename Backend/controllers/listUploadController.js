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
    // ==================================================
    // GET REQUEST DATA
    // ==================================================

    const {
      listName,

      FullName,
      fullName,

      countryCode,
      phoneNumber,
      deliveryAddress,

      // Delivery Date & Time
      deliveryDateTime,

      // Billing
      items,
      price,
      serviceCharge,
      handlingCharge,
      gst,
    } = req.body;

    // Support both FullName and fullName
    const customerName =
      FullName || fullName;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (
      !listName ||
      !customerName ||
      !phoneNumber ||
      !deliveryAddress
    ) {
      // Multer may already have saved file.
      // Delete it when validation fails.

      if (req.file) {
        uploadedFileData =
          mapUploadedFile(
            req.file,
            req
          );

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

    // ==================================================
    // FILE VALIDATION
    // ==================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload your grocery list",
      });
    }

    // ==================================================
    // DELIVERY DATE & TIME VALIDATION
    // ==================================================

    let parsedDeliveryDateTime = null;

    if (deliveryDateTime) {
      parsedDeliveryDateTime =
        new Date(deliveryDateTime);

      if (
        Number.isNaN(
          parsedDeliveryDateTime.getTime()
        )
      ) {
        uploadedFileData =
          mapUploadedFile(
            req.file,
            req
          );

        deleteUploadedFile(
          uploadedFileData
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery date and time",
        });
      }
    }

    // ==================================================
    // MAP CUSTOMER UPLOADED FILE
    // ==================================================

    uploadedFileData =
      mapUploadedFile(
        req.file,
        req
      );

    // ==================================================
    // CURRENT DATE/TIME
    // ==================================================

    const now = new Date();

    // ==================================================
    // CREATE ORDER
    // ==================================================

    const order =
      await ListUpload.create({
        // ----------------------------------------------
        // Customer Information
        // ----------------------------------------------

        listName:
          listName.trim(),

        fullName:
          customerName.trim(),

        countryCode:
          countryCode?.trim() ||
          "+91",

        phoneNumber:
          phoneNumber.trim(),

        deliveryAddress:
          deliveryAddress.trim(),

        // ----------------------------------------------
        // Delivery Date & Time
        // ----------------------------------------------

        deliveryDateTime:
          parsedDeliveryDateTime,

        // ----------------------------------------------
        // Customer Grocery List
        // ----------------------------------------------

        uploadedFile:
          uploadedFileData,

        // ----------------------------------------------
        // Billing
        // ----------------------------------------------

        items:
          Number(items || 0),

        price:
          Number(price || 0),

        serviceCharge:
          Number(
            serviceCharge || 0
          ),

        handlingCharge:
          Number(
            handlingCharge || 0
          ),

        gst:
          Number(gst || 0),

        // ----------------------------------------------
        // Order Information
        // ----------------------------------------------

        orderId:
          generateOrderId(),

        receiptNo:
          generateReceiptNo(),

        status:
          "Received",

        // ----------------------------------------------
        // Initial Status History
        // ----------------------------------------------

        statusHistory: [
          {
            status: "Received",
            date: now,
          },
        ],
      });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Grocery list submitted successfully",

      data: order,
    });
  } catch (error) {
    // ==================================================
    // DELETE FILE IF DATABASE SAVE FAILED
    // ==================================================

    if (uploadedFileData) {
      deleteUploadedFile(
        uploadedFileData
      );
    }

    console.error(
      "Create List Upload Error:",
      error
    );

    // ==================================================
    // DUPLICATE ORDER ID
    // ==================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "Duplicate order information generated. Please try again.",

        error:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to submit grocery list",

      error:
        error.message,
    });
  }
};

// ======================================================
// GET ALL ORDERS
// GET /api/list-upload
//
// Optional:
// ?status=Packing
// ?search=GS-260807
// ======================================================

const getAllListUploads = async (
  req,
  res
) => {
  try {
    const {
      status,
      search,
    } = req.query;

    const filter = {};

    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (status) {
      filter.status = status;
    }

    // ==================================================
    // SEARCH
    // ==================================================

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

    // ==================================================
    // GET ORDERS
    // ==================================================

    const orders =
      await ListUpload.find(
        filter
      ).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count:
        orders.length,

      data:
        orders,
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

      error:
        error.message,
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
        message:
          "Order not found",
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

      error:
        error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER
// PUT /api/list-upload/:id
// ======================================================

const updateListUpload = async (
  req,
  res
) => {
  let newUploadedFileData = null;

  try {
    // ==================================================
    // FIND ORDER
    // ==================================================

    const order =
      await ListUpload.findById(
        req.params.id
      );

    if (!order) {
      // Delete newly uploaded file if order doesn't exist

      if (req.file) {
        newUploadedFileData =
          mapUploadedFile(
            req.file,
            req
          );

        deleteUploadedFile(
          newUploadedFileData
        );
      }

      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    console.log(
      "UPDATE BODY:",
      req.body
    );

    console.log(
      "UPDATE FILE:",
      req.file
    );

    // ==================================================
    // REQUEST DATA
    // ==================================================

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

    // ==================================================
    // LIST NAME
    // ==================================================

    if (
      listName !== undefined
    ) {
      order.listName =
        listName.trim();
    }

    // ==================================================
    // CUSTOMER NAME
    // ==================================================

    const customerName =
      FullName !== undefined
        ? FullName
        : fullName;

    if (
      customerName !== undefined
    ) {
      order.fullName =
        customerName.trim();
    }

    // ==================================================
    // COUNTRY CODE
    // ==================================================

    if (
      countryCode !== undefined
    ) {
      order.countryCode =
        countryCode.trim();
    }

    // ==================================================
    // PHONE
    // ==================================================

    if (
      phoneNumber !== undefined
    ) {
      order.phoneNumber =
        phoneNumber.trim();
    }

    // ==================================================
    // DELIVERY ADDRESS
    // ==================================================

    if (
      deliveryAddress !==
        undefined &&
      deliveryAddress !== ""
    ) {
      order.deliveryAddress =
        deliveryAddress.trim();
    }

    // ==================================================
    // DELIVERY DATE & TIME
    // ==================================================

    if (
      deliveryDateTime !==
      undefined
    ) {
      // Allow admin to clear it

      if (
        deliveryDateTime === "" ||
        deliveryDateTime === null
      ) {
        order.deliveryDateTime =
          null;
      } else {
        const parsedDate =
          new Date(
            deliveryDateTime
          );

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          // Delete new file if update validation fails

          if (req.file) {
            newUploadedFileData =
              mapUploadedFile(
                req.file,
                req
              );

            deleteUploadedFile(
              newUploadedFileData
            );
          }

          return res.status(400).json({
            success: false,

            message:
              "Invalid delivery date and time",
          });
        }

        order.deliveryDateTime =
          parsedDate;
      }
    }

    // ==================================================
    // ITEMS
    // ==================================================

    if (
      items !== undefined
    ) {
      const parsedItems =
        Number(items);

      if (
        !Number.isNaN(
          parsedItems
        ) &&
        parsedItems >= 0
      ) {
        order.items =
          parsedItems;
      }
    }

    // ==================================================
    // PRICE
    // ==================================================

    if (
      price !== undefined
    ) {
      const parsedPrice =
        Number(price);

      if (
        !Number.isNaN(
          parsedPrice
        ) &&
        parsedPrice >= 0
      ) {
        order.price =
          parsedPrice;
      }
    }

    // ==================================================
    // SERVICE CHARGE
    // ==================================================

    if (
      serviceCharge !== undefined
    ) {
      const parsedServiceCharge =
        Number(
          serviceCharge
        );

      if (
        !Number.isNaN(
          parsedServiceCharge
        ) &&
        parsedServiceCharge >= 0
      ) {
        order.serviceCharge =
          parsedServiceCharge;
      }
    }

    // ==================================================
    // HANDLING CHARGE
    // ==================================================

    if (
      handlingCharge !== undefined
    ) {
      const parsedHandlingCharge =
        Number(
          handlingCharge
        );

      if (
        !Number.isNaN(
          parsedHandlingCharge
        ) &&
        parsedHandlingCharge >= 0
      ) {
        order.handlingCharge =
          parsedHandlingCharge;
      }
    }

    // ==================================================
    // GST
    // ==================================================

    if (
      gst !== undefined
    ) {
      const parsedGst =
        Number(gst);

      if (
        !Number.isNaN(
          parsedGst
        ) &&
        parsedGst >= 0
      ) {
        order.gst =
          parsedGst;
      }
    }

    // ==================================================
    // REPLACE CUSTOMER IMAGE / PDF
    // ==================================================

    if (req.file) {
      // Map new file

      newUploadedFileData =
        mapUploadedFile(
          req.file,
          req
        );

      // Save old file path

      const oldUploadedFile =
        order.uploadedFile?.path
          ? order.uploadedFile.path
          : null;

      // Replace

      order.uploadedFile =
        newUploadedFileData;

      // Save database first

      await order.save();

      // Delete old physical file only after successful save

      if (oldUploadedFile) {
        deleteUploadedFile(
          oldUploadedFile
        );
      }
    } else {
      // Save without replacing file

      await order.save();
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "List updated successfully",

      data:
        order,
    });
  } catch (error) {
    // ==================================================
    // DELETE NEW FILE IF UPDATE FAILED
    // ==================================================

    if (
      newUploadedFileData
    ) {
      deleteUploadedFile(
        newUploadedFileData
      );
    }

    console.error(
      "Update List Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update list",

      error:
        error.message,
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS
// PUT /api/list-upload/:id/status
//
// IMPORTANT:
// Every status change saves its own date + time.
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

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "Status is required",
      });
    }

    if (
      !allowedStatus.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid order status",

        allowedStatus,
      });
    }

    // ==================================================
    // FIND ORDER
    // ==================================================

    const order =
      await ListUpload.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    // ==================================================
    // SAME STATUS
    // Don't create duplicate history
    // ==================================================

    if (
      order.status === status
    ) {
      return res.status(200).json({
        success: true,

        message:
          `Order is already ${status}`,

        data:
          order,
      });
    }

    // ==================================================
    // CURRENT DATE AND TIME
    // ==================================================

    const now =
      new Date();

    // ==================================================
    // UPDATE CURRENT STATUS
    // ==================================================

    order.status =
      status;

    // ==================================================
    // SAVE STATUS DATE/TIME
    // ==================================================

    order.statusHistory.push({
      status,
      date: now,
    });

    // ==================================================
    // SAVE DATABASE
    // ==================================================

    await order.save();

    return res.status(200).json({
      success: true,

      message:
        "Order status updated successfully",

      data:
        order,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update order status",

      error:
        error.message,
    });
  }
};

// ======================================================
// UPLOAD FINAL ORDER RECEIPT
//
// PUT /api/list-upload/:id/receipt
//
// FormData:
// receiptFile = PDF/Image
// ======================================================

const uploadOrderReceipt = async (
  req,
  res
) => {
  let newReceiptFile = null;

  try {
    // ==================================================
    // FIND ORDER
    // ==================================================

    const order =
      await ListUpload.findById(
        req.params.id
      );

    if (!order) {
      // Delete uploaded file if order doesn't exist

      if (req.file) {
        newReceiptFile =
          mapUploadedFile(
            req.file,
            req
          );

        deleteUploadedFile(
          newReceiptFile
        );
      }

      return res.status(404).json({
        success: false,

        message:
          "Order not found",
      });
    }

    // ==================================================
    // FILE REQUIRED
    // ==================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,

        message:
          "Please select a receipt file",
      });
    }

    // ==================================================
    // OPTIONAL STATUS CHECK
    //
    // Receipt can be uploaded when:
    // Out for Delivery
    // Delivered
    // ==================================================

    const receiptAllowedStatuses = [
      "Out for Delivery",
      "Delivered",
    ];

    if (
      !receiptAllowedStatuses.includes(
        order.status
      )
    ) {
      // Multer already saved file.
      // Remove it because upload isn't allowed yet.

      newReceiptFile =
        mapUploadedFile(
          req.file,
          req
        );

      deleteUploadedFile(
        newReceiptFile
      );

      return res.status(400).json({
        success: false,

        message:
          "Receipt can be uploaded only after the order reaches Out for Delivery",
      });
    }

    // ==================================================
    // MAP RECEIPT FILE
    // ==================================================

    newReceiptFile =
      mapUploadedFile(
        req.file,
        req
      );

    // ==================================================
    // OLD RECEIPT
    // ==================================================

    const oldReceiptPath =
      order.receiptFile?.path ||
      null;

    // ==================================================
    // SET NEW RECEIPT
    // ==================================================

    order.receiptFile =
      newReceiptFile;

    // ==================================================
    // SAVE DATABASE FIRST
    // ==================================================

    await order.save();

    // ==================================================
    // DELETE OLD RECEIPT AFTER SUCCESS
    // ==================================================

    if (
      oldReceiptPath
    ) {
      deleteUploadedFile(
        oldReceiptPath
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Receipt uploaded successfully",

      data:
        order,
    });
  } catch (error) {
    // ==================================================
    // DELETE NEW FILE IF DATABASE SAVE FAILED
    // ==================================================

    if (
      newReceiptFile
    ) {
      deleteUploadedFile(
        newReceiptFile
      );
    }

    console.error(
      "Upload Receipt Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to upload receipt",

      error:
        error.message,
    });
  }
};

// ======================================================
// TRACK ORDER BY ORDER ID
//
// GET /api/list-upload/track/:orderId
//
// Customer uses this endpoint.
// ======================================================

const trackOrderByOrderId = async (
  req,
  res
) => {
  try {
    const {
      orderId,
    } = req.params;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !orderId ||
      !orderId.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Order ID is required",
      });
    }

    // ==================================================
    // FIND ORDER
    // ==================================================

    const order =
      await ListUpload.findOne({
        orderId:
          orderId.trim(),
      });

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found. Please check your Order ID.",
      });
    }

    // ==================================================
    // RETURN TRACKING DATA
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Order found successfully",

      data: {
        // ----------------------------------------------
        // Database ID
        // ----------------------------------------------

        _id:
          order._id,

        // ----------------------------------------------
        // Order
        // ----------------------------------------------

        orderId:
          order.orderId,

        receiptNo:
          order.receiptNo,

        status:
          order.status,

        // ----------------------------------------------
        // Customer
        // ----------------------------------------------

        listName:
          order.listName,

        fullName:
          order.fullName,

        countryCode:
          order.countryCode,

        phoneNumber:
          order.phoneNumber,

        deliveryAddress:
          order.deliveryAddress,

        // ----------------------------------------------
        // Delivery Date & Time
        // ----------------------------------------------

        deliveryDateTime:
          order.deliveryDateTime,

        // ----------------------------------------------
        // IMPORTANT:
        // Every progress status + date/time
        // ----------------------------------------------

        statusHistory:
          order.statusHistory ||
          [],

        // ----------------------------------------------
        // Original Grocery List
        // ----------------------------------------------

        uploadedFile:
          order.uploadedFile ||
          null,

        // ----------------------------------------------
        // Final Receipt
        // ----------------------------------------------

        receiptFile:
          order.receiptFile ||
          null,

        // ----------------------------------------------
        // Dates
        // ----------------------------------------------

        createdAt:
          order.createdAt,

        updatedAt:
          order.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Track Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to track order",

      error:
        error.message,
    });
  }
};

// ======================================================
// DELETE ORDER
// DELETE /api/list-upload/:id
//
// Deletes:
// 1. MongoDB order
// 2. Grocery list image/PDF
// 3. Receipt image/PDF
// ======================================================

const deleteListUpload = async (
  req,
  res
) => {
  try {
    // ==================================================
    // FIND ORDER
    // ==================================================

    const order =
      await ListUpload.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found",
      });
    }

    // ==================================================
    // KEEP FILE REFERENCES
    // ==================================================

    const uploadedFile =
      order.uploadedFile;

    const receiptFile =
      order.receiptFile;

    // ==================================================
    // DELETE DATABASE RECORD
    // ==================================================

    await order.deleteOne();

    // ==================================================
    // DELETE ORIGINAL GROCERY LIST
    // ==================================================

    if (
      uploadedFile
    ) {
      deleteUploadedFile(
        uploadedFile
      );
    }

    // ==================================================
    // DELETE RECEIPT
    // ==================================================

    if (
      receiptFile
    ) {
      deleteUploadedFile(
        receiptFile
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Order and uploaded files deleted successfully",
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

      error:
        error.message,
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
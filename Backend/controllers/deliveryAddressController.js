const DeliveryAddress = require("../models/DeliveryAddress");

// ======================================================
// HELPER: NORMALIZE ADDRESS DATA
// ======================================================

const normalizeAddressData = (body) => {
  const {
    type,
    addressType,

    name,
    mobile,
    phone,

    address,
    addressLine,

    city,
    state,
    country,
    pincode,

    cityStateZip,

    landmark,

    latitude,
    longitude,

    isDefault,
  } = body;

  let finalCity = city || "";
  let finalState = state || "";
  let finalPincode = pincode || "";

  // --------------------------------------------------
  // Support current frontend cityStateZip format
  // Example:
  // "Bhubaneswar, Odisha, 751001"
  // --------------------------------------------------

  if (
    cityStateZip &&
    (!finalCity || !finalState || !finalPincode)
  ) {
    const parts = cityStateZip
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      finalCity = finalCity || parts[0];
      finalState = finalState || parts[1];
      finalPincode = finalPincode || parts[2];
    } else if (parts.length === 2) {
      // Existing UI may be sending:
      // "city,pincode"

      finalCity = finalCity || parts[0];
      finalPincode = finalPincode || parts[1];
    } else if (parts.length === 1) {
      finalCity = finalCity || parts[0];
    }
  }

  return {
    name: String(name || "").trim(),

    mobile: String(mobile || phone || "").trim(),

    address: String(address || addressLine || "").trim(),

    landmark: String(landmark || "").trim(),

    city: String(finalCity || "").trim(),

    state: String(finalState || "").trim(),

    country: String(country || "India").trim(),

    pincode: String(finalPincode || "").trim(),

    latitude:
      latitude !== null &&
      latitude !== undefined &&
      latitude !== ""
        ? Number(latitude)
        : null,

    longitude:
      longitude !== null &&
      longitude !== undefined &&
      longitude !== ""
        ? Number(longitude)
        : null,

    addressType: type || addressType || "Home",

    isDefault: Boolean(isDefault),
  };
};

// ======================================================
// ADD DELIVERY ADDRESS
// POST /api/delivery-address
// ======================================================

const addDeliveryAddress = async (req, res) => {
  try {
    console.log("=================================");
    console.log("ADD DELIVERY ADDRESS");
    console.log("USER:", req.user?._id);
    console.log("BODY:", req.body);
    console.log("=================================");

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const data = normalizeAddressData(req.body);

    console.log("NORMALIZED DATA:", data);

    // --------------------------------------------------
    // REQUIRED VALIDATION
    // --------------------------------------------------

    if (!data.name) {
      return res.status(400).json({
        success: false,
        message: "Receiver name is required.",
      });
    }

    if (!data.mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
      });
    }

    if (!data.address) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    if (!data.city) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!data.state) {
      return res.status(400).json({
        success: false,
        message: "State is required.",
      });
    }

    if (!data.pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required.",
      });
    }

    // --------------------------------------------------
    // IF DEFAULT = TRUE
    // REMOVE DEFAULT FROM OTHER ADDRESSES
    // --------------------------------------------------

    if (data.isDefault) {
      await DeliveryAddress.updateMany(
        {
          user: req.user._id,
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    // --------------------------------------------------
    // CREATE ADDRESS
    // --------------------------------------------------

    const deliveryAddress =
      await DeliveryAddress.create({
        user: req.user._id,
        ...data,
      });

    return res.status(201).json({
      success: true,
      message: "Delivery address added successfully.",
      address: deliveryAddress,
    });
  } catch (error) {
    console.error("Add delivery address error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (item) => item.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add delivery address.",
    });
  }
};

// ======================================================
// GET ALL DELIVERY ADDRESSES
// GET /api/delivery-address
// ======================================================

const getDeliveryAddresses = async (req, res) => {
  try {
    const addresses = await DeliveryAddress.find({
      user: req.user._id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error(
      "Get delivery addresses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery addresses.",
    });
  }
};

// ======================================================
// GET SINGLE ADDRESS
// GET /api/delivery-address/:id
// ======================================================

const getDeliveryAddress = async (req, res) => {
  try {
    const address = await DeliveryAddress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found.",
      });
    }

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error(
      "Get delivery address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery address.",
    });
  }
};

// ======================================================
// UPDATE DELIVERY ADDRESS
// PUT /api/delivery-address/:id
// ======================================================

const updateDeliveryAddress = async (req, res) => {
  try {
    const existingAddress =
      await DeliveryAddress.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found.",
      });
    }

    const data = normalizeAddressData(req.body);

    if (!data.name) {
      return res.status(400).json({
        success: false,
        message: "Receiver name is required.",
      });
    }

    if (!data.mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
      });
    }

    if (!data.address) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    if (!data.city) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!data.state) {
      return res.status(400).json({
        success: false,
        message: "State is required.",
      });
    }

    if (!data.pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required.",
      });
    }

    if (data.isDefault) {
      await DeliveryAddress.updateMany(
        {
          user: req.user._id,
          _id: {
            $ne: req.params.id,
          },
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    Object.assign(existingAddress, data);

    await existingAddress.save();

    return res.status(200).json({
      success: true,
      message: "Delivery address updated successfully.",
      address: existingAddress,
    });
  } catch (error) {
    console.error(
      "Update delivery address error:",
      error
    );

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (item) => item.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery address.",
    });
  }
};

// ======================================================
// DELETE DELIVERY ADDRESS
// DELETE /api/delivery-address/:id
// ======================================================

const deleteDeliveryAddress = async (req, res) => {
  try {
    const address = await DeliveryAddress.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found.",
      });
    }

    // --------------------------------------------------
    // If deleted address was default,
    // make newest address default
    // --------------------------------------------------

    if (address.isDefault) {
      const nextAddress =
        await DeliveryAddress.findOne({
          user: req.user._id,
        }).sort({
          createdAt: -1,
        });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Delivery address deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete delivery address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete delivery address.",
    });
  }
};

// ======================================================
// SET DEFAULT DELIVERY ADDRESS
// PUT /api/delivery-address/:id/default
// ======================================================

const setDefaultDeliveryAddress = async (
  req,
  res
) => {
  try {
    const address = await DeliveryAddress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found.",
      });
    }

    await DeliveryAddress.updateMany(
      {
        user: req.user._id,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    address.isDefault = true;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default delivery address updated.",
      address,
    });
  } catch (error) {
    console.error(
      "Set default delivery address error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to set default delivery address.",
    });
  }
};

module.exports = {
  addDeliveryAddress,
  getDeliveryAddresses,
  getDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultDeliveryAddress,
};
const Product = require("../models/Product");

// ======================================================
// HELPERS
// ======================================================

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1" || value === 1) {
    return true;
  }

  if (value === "false" || value === "0" || value === 0) {
    return false;
  }

  return defaultValue;
};

const parseDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const normalizeStatus = (status) => {
  if (status === "published" || status === "active") {
    return "active";
  }

  if (status === "unpublished" || status === "inactive") {
    return "inactive";
  }

  return "active";
};

// ======================================================
// CREATE SLUG
// ======================================================

const createSlug = (value) => {
  return normalizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// ======================================================
// UNIQUE SLUG
// ======================================================

const createUniqueSlug = async (productName, productId = null) => {
  const baseSlug = createSlug(productName) || `product-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = {
      slug,
    };

    if (productId) {
      query._id = {
        $ne: productId,
      };
    }

    const exists = await Product.exists(query);

    if (!exists) {
      break;
    }

    slug = `${baseSlug}-${counter}`;

    counter++;
  }

  return slug;
};

// ======================================================
// POPULATE PRODUCT
// ======================================================

const getPopulatedProduct = (id) => {
  return Product.findById(id)
    .populate("category", "name")
    .populate("brand", "name")
    .populate("unit", "name");
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

const getAllProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      brand,
      unit,
      status,
      source,
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    // ==================================================
    // SEARCH
    // ==================================================

    if (search.trim()) {
      query.$or = [
        {
          productName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    if (category && category !== "all") {
      query.category = category;
    }

    // ==================================================
    // BRAND
    // ==================================================

    if (brand && brand !== "all") {
      query.brand = brand;
    }

    // ==================================================
    // UNIT
    // ==================================================

    if (unit && unit !== "all") {
      query.unit = unit;
    }

    // ==================================================
    // STATUS
    // ==================================================

    if (status && status !== "all") {
      query.status = normalizeStatus(status);
    }

    // ==================================================
    // SOURCE
    // ==================================================

    if (source && source !== "all") {
      query.source = source;
    }

    // ==================================================
    // PAGINATION
    // ==================================================

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(Math.max(Number(limit) || 100, 1), 500);

    const skip = (pageNumber - 1) * limitNumber;

    // ==================================================
    // QUERY
    // ==================================================

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("brand", "name")
        .populate("unit", "name")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,

      count: products.length,

      total,

      page: pageNumber,

      limit: limitNumber,

      pages: Math.ceil(total / limitNumber),

      products,
    });
  } catch (error) {
    console.error("GET ALL PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch products.",

      error: error.message,
    });
  }
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================

const getProductById = async (req, res) => {
  try {
    const product = await getPopulatedProduct(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      product,

      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch product.",

      error: error.message,
    });
  }
};

// ======================================================
// CREATE PRODUCT
// ======================================================

const createProduct = async (req, res) => {
  try {
    const body = req.body || {};

    // ==================================================
    // BASIC DATA
    // ==================================================

    const productName = normalizeString(body.productName || body.name);

    if (!productName) {
      return res.status(400).json({
        success: false,

        message: "Product name is required.",
      });
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    const category = body.category;

    if (!category) {
      return res.status(400).json({
        success: false,

        message: "Category is required.",
      });
    }

    // ==================================================
    // UNIT
    // ==================================================

    const unit = body.unit;

    if (!unit) {
      return res.status(400).json({
        success: false,

        message: "Unit is required.",
      });
    }

    const unitNo = parseNumber(body.unitNo, 1);

    if (unitNo < 1) {
      return res.status(400).json({
        success: false,
        message: "Unit No must be greater than 0.",
      });
    }

    // ==================================================
    // SKU
    // ==================================================

    const sku = normalizeString(body.sku).toUpperCase();

    if (!sku) {
      return res.status(400).json({
        success: false,

        message: "SKU is required.",
      });
    }

    // ==================================================
    // DUPLICATE SKU
    // ==================================================

    const existingSku = await Product.findOne({
      sku,
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,

        message: "SKU already exists.",
      });
    }

    // ==================================================
    // SLUG
    // ==================================================

    const slug = await createUniqueSlug(body.slug || productName);

    // ==================================================
    // PRICES
    // ==================================================

    const price = parseNumber(body.price ?? body.sellingPrice, 0);

    const purchasePrice = parseNumber(
      body.purchasePrice,
      body.costPrice !== undefined ? parseNumber(body.costPrice) : 0,
    );

    const writtenPrice = parseNumber(body.writtenPrice, 0);

    const discountPrice = parseNumber(body.discountPrice, 0);

    const costPrice = parseNumber(body.costPrice, purchasePrice);

    // ==================================================
    // STOCK
    // ==================================================

    const stockQuantity = parseNumber(body.stockQuantity ?? body.stock, 0);

    // ==================================================
    // IMAGES
    // ==================================================

    let images = [];

    if (Array.isArray(req.files)) {
      images = req.files
        .map((file) => {
          if (file.url) {
            return file.url;
          }

          if (file.path) {
            return `/${String(file.path).replace(/^\/+/, "")}`;
          }

          return null;
        })
        .filter(Boolean)
        .slice(0, 5);
    }

    // ==================================================
    // SOURCE
    // ==================================================

    const source = body.source === "import" ? "import" : "manual";

    // ==================================================
    // CREATE
    // ==================================================

    const product = new Product({
      productName,

      slug,

      category,

      brand: body.brand || null,

      sku,

      unit,
      unitNo,
      source,

      tags: normalizeArray(body.tags),

      shortDescription: normalizeString(body.shortDescription),

      fullDescription: normalizeString(body.fullDescription),

      metaTitle: normalizeString(body.metaTitle),

      metaDescription: normalizeString(body.metaDescription),

      metaKeywords: normalizeArray(body.metaKeywords),

      price,

      purchasePrice,

      writtenPrice,

      discountPrice,

      costPrice,

      manufactureDate: parseDate(body.manufactureDate),

      expiryDate: parseDate(body.expiryDate),

      stockQuantity,

      lowStockAlert: parseNumber(body.lowStockAlert, 0),

      tax: parseNumber(body.tax, 0),

      isOutOfStock: parseBoolean(body.isOutOfStock, stockQuantity <= 0),

      status: normalizeStatus(body.status || "active"),

      images,
    });

    await product.save();

    const savedProduct = await getPopulatedProduct(product._id);

    return res.status(201).json({
      success: true,

      message: "Product created successfully.",

      product: savedProduct,

      data: savedProduct,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message: "Product with the same SKU or slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to create product.",
    });
  }
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    const body = req.body || {};

    // ==================================================
    // PRODUCT NAME
    // ==================================================

    if (body.productName !== undefined || body.name !== undefined) {
      product.productName = normalizeString(body.productName || body.name);
    }

    // ==================================================
    // SLUG
    // ==================================================

    if (body.slug !== undefined) {
      const requestedSlug = createSlug(body.slug);

      const slugExists = await Product.findOne({
        slug: requestedSlug,

        _id: {
          $ne: product._id,
        },
      });

      if (slugExists) {
        return res.status(409).json({
          success: false,

          message: "Slug already exists.",
        });
      }

      product.slug = requestedSlug;
    } else if (body.productName !== undefined) {
      product.slug = await createUniqueSlug(product.productName, product._id);
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    if (body.category !== undefined) {
      product.category = body.category;
    }

    // ==================================================
    // BRAND
    // ==================================================

    if (body.brand !== undefined) {
      product.brand = body.brand || null;
    }

    // ==================================================
    // SKU
    // ==================================================

    if (body.sku !== undefined) {
      const sku = normalizeString(body.sku).toUpperCase();

      const duplicate = await Product.findOne({
        sku,

        _id: {
          $ne: product._id,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,

          message: "SKU already exists.",
        });
      }

      product.sku = sku;
    }

    // ==================================================
    // UNIT
    // ==================================================

    if (body.unit !== undefined) {
      product.unit = body.unit;
    }

    // ==================================================
    // UNIT NO
    // ==================================================

    if (body.unitNo !== undefined) {
      const unitNo = parseNumber(body.unitNo, 1);

      if (unitNo < 1) {
        return res.status(400).json({
          success: false,
          message: "Unit No must be greater than 0.",
        });
      }

      product.unitNo = unitNo;
    }

    // ==================================================
    // TAGS
    // ==================================================

    if (body.tags !== undefined) {
      product.tags = normalizeArray(body.tags);
    }

    // ==================================================
    // DESCRIPTION
    // ==================================================

    if (body.shortDescription !== undefined) {
      product.shortDescription = normalizeString(body.shortDescription);
    }

    if (body.fullDescription !== undefined) {
      product.fullDescription = normalizeString(body.fullDescription);
    }

    // ==================================================
    // SEO
    // ==================================================

    if (body.metaTitle !== undefined) {
      product.metaTitle = normalizeString(body.metaTitle);
    }

    if (body.metaDescription !== undefined) {
      product.metaDescription = normalizeString(body.metaDescription);
    }

    if (body.metaKeywords !== undefined) {
      product.metaKeywords = normalizeArray(body.metaKeywords);
    }

    // ==================================================
    // PRICE
    // ==================================================

    if (body.price !== undefined) {
      product.price = parseNumber(body.price);
    }

    if (body.sellingPrice !== undefined) {
      product.price = parseNumber(body.sellingPrice);
    }

    if (body.purchasePrice !== undefined) {
      product.purchasePrice = parseNumber(body.purchasePrice);
    }

    if (body.writtenPrice !== undefined) {
      product.writtenPrice = parseNumber(body.writtenPrice);
    }

    if (body.discountPrice !== undefined) {
      product.discountPrice = parseNumber(body.discountPrice);
    }

    if (body.costPrice !== undefined) {
      product.costPrice = parseNumber(body.costPrice);
    }

    // ==================================================
    // DATES
    // ==================================================

    if (body.manufactureDate !== undefined) {
      product.manufactureDate = parseDate(body.manufactureDate);
    }

    if (body.expiryDate !== undefined) {
      product.expiryDate = parseDate(body.expiryDate);
    }

    // ==================================================
    // STOCK
    // ==================================================

    if (body.stockQuantity !== undefined) {
      product.stockQuantity = parseNumber(body.stockQuantity);
    }

    if (body.stock !== undefined) {
      product.stockQuantity = parseNumber(body.stock);
    }

    if (body.lowStockAlert !== undefined) {
      product.lowStockAlert = parseNumber(body.lowStockAlert);
    }

    // ==================================================
    // TAX
    // ==================================================

    if (body.tax !== undefined) {
      product.tax = parseNumber(body.tax);
    }

    // ==================================================
    // OUT OF STOCK
    // ==================================================

    if (body.isOutOfStock !== undefined) {
      product.isOutOfStock = parseBoolean(body.isOutOfStock);
    } else if (body.stockQuantity !== undefined || body.stock !== undefined) {
      product.isOutOfStock = product.stockQuantity <= 0;
    }

    // ==================================================
    // STATUS
    // ==================================================

    if (body.status !== undefined) {
      product.status = normalizeStatus(body.status);
    }

    // ==================================================
    // SOURCE
    // ==================================================

    if (body.source === "manual" || body.source === "import") {
      product.source = body.source;
    }

    // ==================================================
    // NEW IMAGES
    // ==================================================

    if (Array.isArray(req.files) && req.files.length > 0) {
      const newImages = req.files
        .map((file) => {
          if (file.url) {
            return file.url;
          }

          if (file.path) {
            return `/${String(file.path).replace(/^\/+/, "")}`;
          }

          return null;
        })
        .filter(Boolean);

      product.images = [
        ...(Array.isArray(product.images) ? product.images : []),
        ...newImages,
      ].slice(0, 5);
    }

    // ==================================================
    // SAVE
    // ==================================================

    await product.save();

    const updatedProduct = await getPopulatedProduct(product._id);

    return res.status(200).json({
      success: true,

      message: "Product updated successfully.",

      product: updatedProduct,

      data: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message: "SKU or slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to update product.",
    });
  }
};

// ======================================================
// DELETE PRODUCT
// ======================================================

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Product deleted successfully.",

      product,
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete product.",

      error: error.message,
    });
  }
};

// ======================================================
// PUBLISH / UNPUBLISH ONE PRODUCT
// ======================================================

const updateProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,

        message: "Product not found.",
      });
    }

    const requestedStatus = req.body?.status;

    if (requestedStatus === undefined) {
      return res.status(400).json({
        success: false,

        message: "Status is required.",
      });
    }

    product.status = normalizeStatus(requestedStatus);

    await product.save();

    const updatedProduct = await getPopulatedProduct(product._id);

    return res.status(200).json({
      success: true,

      message:
        product.status === "active"
          ? "Product published successfully."
          : "Product unpublished successfully.",

      product: updatedProduct,

      data: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update product status.",

      error: error.message,
    });
  }
};

// ======================================================
// BULK PUBLISH / UNPUBLISH
// ======================================================

const bulkUpdateProductStatus = async (req, res) => {
  try {
    const { ids, status } = req.body || {};

    // ==================================================
    // VALIDATE IDS
    // ==================================================

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,

        message: "Please provide at least one product ID.",
      });
    }

    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    if (status === undefined) {
      return res.status(400).json({
        success: false,

        message: "Status is required.",
      });
    }

    const normalizedStatus = normalizeStatus(status);

    // ==================================================
    // UPDATE
    // ==================================================

    const result = await Product.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        $set: {
          status: normalizedStatus,
        },
      },
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        normalizedStatus === "active"
          ? "Products published successfully."
          : "Products unpublished successfully.",

      modifiedCount: result.modifiedCount ?? result.nModified ?? 0,

      matchedCount: result.matchedCount ?? result.n ?? 0,
    });
  } catch (error) {
    console.error("BULK UPDATE PRODUCT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update product statuses.",

      error: error.message,
    });
  }
};

// ======================================================
// PUBLISH ONE PRODUCT
// ======================================================

const publishProduct = async (req, res) => {
  req.body = {
    ...(req.body || {}),
    status: "active",
  };

  return updateProductStatus(req, res);
};

// ======================================================
// UNPUBLISH ONE PRODUCT
// ======================================================

const unpublishProduct = async (req, res) => {
  req.body = {
    ...(req.body || {}),
    status: "inactive",
  };

  return updateProductStatus(req, res);
};

// ======================================================
// BULK PUBLISH
// ======================================================

const bulkPublishProducts = async (req, res) => {
  req.body = {
    ...(req.body || {}),
    status: "active",
  };

  return bulkUpdateProductStatus(req, res);
};

// ======================================================
// BULK UNPUBLISH
// ======================================================

const bulkUnpublishProducts = async (req, res) => {
  req.body = {
    ...(req.body || {}),
    status: "inactive",
  };

  return bulkUpdateProductStatus(req, res);
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getAllProducts,

  getProductById,

  createProduct,

  updateProduct,

  deleteProduct,

  updateProductStatus,

  bulkUpdateProductStatus,

  publishProduct,

  unpublishProduct,

  bulkPublishProducts,

  bulkUnpublishProducts,
};

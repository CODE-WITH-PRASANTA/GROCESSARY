const fs = require("fs");
const path = require("path");

const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Unit = require("../models/unit.model");

// ======================================================
// HELPERS
// ======================================================

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeLower = (value) => {
  return normalizeString(value).toLowerCase();
};

const normalizeUpper = (value) => {
  return normalizeString(value).toUpperCase();
};

// ======================================================
// DATE HELPER
// ======================================================

const parseDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Excel serial date
  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));

    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

    return isNaN(date.getTime()) ? null : date;
  }

  const stringValue = normalizeString(value);

  if (!stringValue) {
    return null;
  }

  // DD/MM/YYYY
  const slashMatch = stringValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]) - 1;
    const year = Number(slashMatch[3]);

    const date = new Date(year, month, day);

    return isNaN(date.getTime()) ? null : date;
  }

  // DD-MM-YYYY
  const dashMatch = stringValue.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);

  if (dashMatch) {
    const day = Number(dashMatch[1]);
    const month = Number(dashMatch[2]) - 1;
    const year = Number(dashMatch[3]);

    const date = new Date(year, month, day);

    return isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(stringValue);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
};

// ======================================================
// NUMBER HELPER
// ======================================================

const parseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "string") {
    value = value
      .replace(/,/g, "")
      .replace(/[₹$€£]/g, "")
      .trim();
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
};

// ======================================================
// REGEX ESCAPE
// ======================================================

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ======================================================
// SLUG
// ======================================================

const createSlug = (value) => {
  return normalizeLower(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// ======================================================
// UNIQUE SLUG
// ======================================================

const createUniqueSlug = async (productName, sku, currentProductId = null) => {
  const baseSlug =
    createSlug(productName) || createSlug(sku) || `product-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = {
      slug,
    };

    if (currentProductId) {
      query._id = {
        $ne: currentProductId,
      };
    }

    const exists = await Product.exists(query);

    if (!exists) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

// ======================================================
// CATEGORY
// FIND OR CREATE AUTOMATICALLY
// ======================================================

// ======================================================
// CATEGORY
// FIND OR CREATE AUTOMATICALLY
// ======================================================

const findOrCreateCategory = async (value) => {
  const categoryValue = normalizeString(value);

  if (!categoryValue) {
    return null;
  }

  // ====================================================
  // IF MONGODB ID WAS PROVIDED
  // ====================================================

  if (/^[0-9a-fA-F]{24}$/.test(categoryValue)) {
    const categoryById = await Category.findById(categoryValue);

    if (categoryById) {
      return categoryById;
    }
  }

  // ====================================================
  // FIND BY NAME
  // ====================================================

  const escapedValue = escapeRegex(categoryValue);

  let category = await Category.findOne({
    name: {
      $regex: `^${escapedValue}$`,
      $options: "i",
    },
  });

  if (category) {
    return category;
  }

  // ====================================================
  // CREATE SLUG
  // ====================================================

  const baseSlug = createSlug(categoryValue) || `category-${Date.now()}`;

  let categorySlug = baseSlug;
  let counter = 1;

  // ====================================================
  // MAKE UNIQUE SLUG
  // ====================================================

  while (true) {
    const existingSlug = await Category.findOne({
      slug: categorySlug,
    });

    if (!existingSlug) {
      break;
    }

    categorySlug = `${baseSlug}-${counter}`;

    counter++;
  }

  // ====================================================
  // CREATE CATEGORY
  // ====================================================

  category = await Category.create({
    name: categoryValue,
    slug: categorySlug,
  });

  return category;
};

// ======================================================
// BRAND
// FIND OR CREATE AUTOMATICALLY
// ======================================================

const findOrCreateBrand = async (value) => {
  const brandValue = normalizeString(value);

  if (!brandValue) {
    return null;
  }

  // ====================================================
  // IF MONGODB ID WAS PROVIDED
  // ====================================================

  if (/^[0-9a-fA-F]{24}$/.test(brandValue)) {
    const brandById = await Brand.findById(brandValue);

    if (brandById) {
      return brandById;
    }
  }

  // ====================================================
  // FIND BY NAME
  // ====================================================

  const escapedValue = escapeRegex(brandValue);

  let brand = await Brand.findOne({
    name: {
      $regex: `^${escapedValue}$`,
      $options: "i",
    },
  });

  if (brand) {
    return brand;
  }

  // ====================================================
  // CREATE SLUG
  // ====================================================

  const baseSlug = createSlug(brandValue) || `brand-${Date.now()}`;

  let brandSlug = baseSlug;
  let counter = 1;

  // ====================================================
  // MAKE UNIQUE SLUG
  // ====================================================

  while (true) {
    const existingSlug = await Brand.findOne({
      slug: brandSlug,
    });

    if (!existingSlug) {
      break;
    }

    brandSlug = `${baseSlug}-${counter}`;

    counter++;
  }

  // ====================================================
  // CREATE BRAND
  // ====================================================

  brand = await Brand.create({
    name: brandValue,
    slug: brandSlug,
  });

  return brand;
};

// ======================================================
// UNIT
// FIND OR CREATE AUTOMATICALLY
// ======================================================

// ======================================================
// UNIT
// FIND OR CREATE AUTOMATICALLY
// ======================================================

const findOrCreateUnit = async (value) => {
  const unitValue = normalizeString(value);

  if (!unitValue) {
    return null;
  }

  // ====================================================
  // IF MONGODB ID WAS PROVIDED
  // ====================================================

  if (/^[0-9a-fA-F]{24}$/.test(unitValue)) {
    const unitById = await Unit.findById(unitValue);

    if (unitById) {
      return unitById;
    }
  }

  // ====================================================
  // FIND EXISTING UNIT BY NAME OR SYMBOL
  // ====================================================

  const escapedValue = escapeRegex(unitValue);

  let unit = await Unit.findOne({
    $or: [
      {
        name: {
          $regex: `^${escapedValue}$`,
          $options: "i",
        },
      },
      {
        symbol: {
          $regex: `^${escapedValue}$`,
          $options: "i",
        },
      },
    ],
  });

  if (unit) {
    return unit;
  }

  // ====================================================
  // AUTOMATIC UNIT TYPE
  // ====================================================

  const normalizedUnit = unitValue.toLowerCase();

  let unitType = "Count";

  if (
    ["kg", "kgs", "kilogram", "kilograms", "g", "gm", "gram", "grams"].includes(
      normalizedUnit,
    )
  ) {
    unitType = "Weight";
  } else if (
    [
      "l",
      "ltr",
      "liter",
      "litre",
      "liters",
      "litres",
      "ml",
      "milliliter",
      "millilitre",
    ].includes(normalizedUnit)
  ) {
    unitType = "Volume";
  } else if (
    ["m", "meter", "metre", "meters", "metres", "cm", "mm", "km"].includes(
      normalizedUnit,
    )
  ) {
    unitType = "Length";
  } else if (
    ["pcs", "pc", "piece", "pieces", "unit", "units", "nos", "no"].includes(
      normalizedUnit,
    )
  ) {
    unitType = "Count";
  } else {
    unitType = "Other";
  }

  // ====================================================
  // CREATE UNIT
  // ====================================================

  unit = await Unit.create({
    name: unitValue,
    symbol: unitValue,
    type: unitType,

    // IMPORTANT:
    // Unit schema expects Boolean, NOT "Active"
    status: true,

    order: 0,
  });

  return unit;
};

// ======================================================
// IMAGE URL
// ======================================================

// ======================================================
// IMAGE PATH
// ======================================================

const createImageUrl = (req, file) => {
  if (!file) {
    return "";
  }

  // If middleware already provides a URL/path
  if (file.url) {
    let imagePath = String(file.url).replace(/\\/g, "/").trim();

    // Remove localhost/backend URL if middleware gives one
    imagePath = imagePath.replace(/^https?:\/\/[^/]+/i, "");

    if (!imagePath.startsWith("/")) {
      imagePath = `/${imagePath}`;
    }

    return imagePath;
  }

  // ====================================================
  // FILE PATH
  // ====================================================

  if (file.path) {
    let relativePath = String(file.path).replace(/\\/g, "/").trim();

    // Find uploads/ anywhere in the path
    const uploadsIndex = relativePath.toLowerCase().indexOf("uploads/");

    if (uploadsIndex !== -1) {
      relativePath = relativePath.substring(uploadsIndex);
    }

    if (!relativePath.startsWith("/")) {
      relativePath = `/${relativePath}`;
    }

    return relativePath;
  }

  // ====================================================
  // FILENAME
  // ====================================================

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return "";
};

// ======================================================
// POPULATE PRODUCT
// ======================================================

const populateProduct = (query) => {
  return query
    .populate("category", "name")
    .populate("brand", "name")
    .populate("unit", "name symbol");
};

// ======================================================
// IMPORT DATA
// ======================================================

const importData = async (req, res) => {
  try {
    // ==================================================
    // PARSE PRODUCTS
    // ==================================================

    let products = [];

    if (Array.isArray(req.body?.products)) {
      products = req.body.products;
    } else if (typeof req.body?.products === "string") {
      try {
        products = JSON.parse(req.body.products);
      } catch (parseError) {
        console.error("Products JSON parse error:", parseError);

        return res.status(400).json({
          success: false,
          message: "Invalid products JSON data.",
          error: parseError.message,
        });
      }
    }

    // ==================================================
    // VALIDATE
    // ==================================================

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products found to import.",
      });
    }

    // ==================================================
    // FILES
    // ==================================================

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    // ==================================================
    // RESULTS
    // ==================================================

    const imported = [];
    const skipped = [];
    const failed = [];

    // ==================================================
    // PROCESS PRODUCTS
    // ==================================================

    for (let index = 0; index < products.length; index++) {
      const item = products[index];

      const rowNumber = item?.id || index + 1;

      try {
        // ==============================================
        // BASIC VALUES
        // ==============================================

        const productName = normalizeString(item?.productName || item?.name);

        const categoryValue = normalizeString(item?.category);

        const brandValue = normalizeString(item?.brand);

        const sku = normalizeUpper(item?.sku);

        const purchasePrice = parseNumber(
          item?.purchasePrice ?? item?.costPrice,
        );

        const sellingPrice = parseNumber(item?.sellingPrice ?? item?.price);

        const writtenPrice =
          item?.writtenPrice !== null &&
          item?.writtenPrice !== undefined &&
          item?.writtenPrice !== ""
            ? parseNumber(item.writtenPrice)
            : 0;

        const stock = parseNumber(item?.stock ?? item?.stockQuantity);

        const unitValue = normalizeString(item?.unit);

        const unitNo = parseNumber(item?.unitNo, 1);

        // ==============================================
        // VALIDATION
        // ==============================================

        if (!productName) {
          throw new Error("Product name is required");
        }

        if (!sku) {
          throw new Error("SKU is required");
        }

        if (!categoryValue) {
          throw new Error("Category is required");
        }

        if (!unitValue) {
          throw new Error("Unit is required");
        }

        if (unitNo < 1) {
          throw new Error("Unit No must be greater than 0");
        }

        if (sellingPrice < 0) {
          throw new Error("Selling price cannot be negative");
        }

        // ==============================================
        // CATEGORY
        // FIND OR CREATE
        // ==============================================

        const categoryDoc = await findOrCreateCategory(categoryValue);

        if (!categoryDoc) {
          throw new Error(`Unable to create category "${categoryValue}"`);
        }

        // ==============================================
        // BRAND
        // FIND OR CREATE
        // ==============================================

        let brandDoc = null;

        if (brandValue) {
          brandDoc = await findOrCreateBrand(brandValue);

          if (!brandDoc) {
            throw new Error(`Unable to create brand "${brandValue}"`);
          }
        }

        // ==============================================
        // UNIT
        // FIND OR CREATE
        // ==============================================

        const unitDoc = await findOrCreateUnit(unitValue);

        if (!unitDoc) {
          throw new Error(`Unable to create unit "${unitValue}"`);
        }

        // ==============================================
        // DUPLICATE SKU
        // ==============================================

        const existingProduct = await Product.findOne({
          sku: {
            $regex: `^${escapeRegex(sku)}$`,
            $options: "i",
          },
        });

        if (existingProduct) {
          skipped.push({
            rowId: rowNumber,
            productName,
            sku,
            reason: "Product with this SKU already exists",
          });

          continue;
        }

        // ==============================================
        // SLUG
        // ==============================================

        const slug = await createUniqueSlug(productName, sku);

        // ==============================================
        // IMAGES
        // ==============================================

        const rowFiles = uploadedFiles.filter((file) => {
          const fieldName = file.fieldname || "";

          return (
            fieldName.includes(String(rowNumber)) ||
            fieldName.includes(String(index))
          );
        });

        const images = rowFiles
          .map((file) => createImageUrl(req, file))
          .filter(Boolean)
          .slice(0, 5);

        // ==============================================
        // CREATE PRODUCT
        // ==============================================

        const product = await Product.create({
          // Product information
          productName,
          name: productName,
          slug,

          // Relations
          category: categoryDoc._id,

          brand: brandDoc ? brandDoc._id : null,

          unit: unitDoc._id,

          unitNo: unitNo,

          // SKU
          sku,

          // Source
          source: "import",

          // Price
          price: sellingPrice,

          purchasePrice,

          writtenPrice,

          costPrice: purchasePrice,

          discountPrice: parseNumber(item?.discountPrice ?? item?.discount),

          // Dates
          manufactureDate: parseDate(item?.manufactureDate),

          expiryDate: parseDate(item?.expiryDate),

          // Stock
          stockQuantity: stock,

          lowStockAlert: parseNumber(item?.lowStockAlert),

          isOutOfStock: stock <= 0,

          // Tax
          tax: parseNumber(item?.tax),

          // Status
          status:
            item?.status === "inactive" || item?.status === "unpublished"
              ? "inactive"
              : "active",

          // Content
          tags: Array.isArray(item?.tags)
            ? item.tags.map(normalizeString).filter(Boolean)
            : [],

          shortDescription: normalizeString(item?.shortDescription),

          fullDescription: normalizeString(item?.fullDescription),

          // SEO
          metaTitle: normalizeString(item?.metaTitle),

          metaDescription: normalizeString(item?.metaDescription),

          metaKeywords: Array.isArray(item?.metaKeywords)
            ? item.metaKeywords.map(normalizeString).filter(Boolean)
            : [],

          // Images
          images,
        });

        imported.push(product);
      } catch (error) {
        console.error(`Import row ${rowNumber} error:`, error);

        failed.push({
          rowId: rowNumber,

          productName: item?.productName || item?.name || "-",

          sku: item?.sku || "-",

          reason: error.message,
        });
      }
    }

    // ==================================================
    // POPULATE IMPORTED PRODUCTS
    // ==================================================

    let populatedImported = [];

    if (imported.length > 0) {
      const importedIds = imported.map((product) => product._id);

      populatedImported = await populateProduct(
        Product.find({
          _id: {
            $in: importedIds,
          },
        }),
      );
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    const responseStatus = imported.length > 0 ? 201 : 400;

    return res.status(responseStatus).json({
      success: imported.length > 0,

      message:
        imported.length > 0
          ? "Products imported successfully"
          : "No products were imported.",

      summary: {
        total: products.length,

        imported: imported.length,

        skipped: skipped.length,

        failed: failed.length,
      },

      products: populatedImported,

      skipped,

      failed,
    });
  } catch (error) {
    console.error("Import Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to import products",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL PRODUCTS
// BOTH MANUAL + IMPORTED
// ======================================================

const getImportedData = async (req, res) => {
  try {
    const products = await populateProduct(Product.find({})).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
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

const getImportedDataById = async (req, res) => {
  try {
    const product = await populateProduct(Product.findById(req.params.id));

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
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE PRODUCT
// BOTH MANUAL + IMPORTED
// ======================================================

const updateImportedData = async (req, res) => {
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

    if (body.productName !== undefined) {
      product.productName = normalizeString(body.productName);
    } else if (body.name !== undefined) {
      product.productName = normalizeString(body.name);
    }

    // Keep old name field compatible
    product.name = product.productName;

    // ==================================================
    // SLUG
    // ==================================================

    if (body.slug !== undefined && normalizeString(body.slug)) {
      const requestedSlug = createSlug(body.slug);

      const duplicate = await Product.findOne({
        slug: requestedSlug,
        _id: {
          $ne: product._id,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Slug already exists.",
        });
      }

      product.slug = requestedSlug;
    } else if (body.productName !== undefined && !product.slug) {
      product.slug = await createUniqueSlug(
        product.productName,
        product.sku,
        product._id,
      );
    }

    // ==================================================
    // SKU
    // ==================================================

    if (body.sku !== undefined) {
      const newSku = normalizeUpper(body.sku);

      if (!newSku) {
        return res.status(400).json({
          success: false,
          message: "SKU is required.",
        });
      }

      const duplicate = await Product.findOne({
        sku: newSku,
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

      product.sku = newSku;
    }

    // ==================================================
    // CATEGORY
    // FIND OR CREATE
    // ==================================================

    if (body.category !== undefined) {
      const category = await findOrCreateCategory(body.category);

      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Unable to create category "${body.category}".`,
        });
      }

      product.category = category._id;
    }

    // ==================================================
    // BRAND
    // FIND OR CREATE
    // ==================================================

    if (body.brand !== undefined) {
      const brandValue = normalizeString(body.brand);

      if (!brandValue) {
        product.brand = null;
      } else {
        const brand = await findOrCreateBrand(brandValue);

        if (!brand) {
          return res.status(400).json({
            success: false,
            message: `Unable to create brand "${brandValue}".`,
          });
        }

        product.brand = brand._id;
      }
    }

    // ==================================================
    // UNIT
    // FIND OR CREATE
    // ==================================================

    if (body.unit !== undefined) {
      const unit = await findOrCreateUnit(body.unit);

      if (!unit) {
        return res.status(400).json({
          success: false,
          message: `Unable to create unit "${body.unit}".`,
        });
      }

      product.unit = unit._id;
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
      if (Array.isArray(body.tags)) {
        product.tags = body.tags.map(normalizeString).filter(Boolean);
      } else {
        product.tags = normalizeString(body.tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
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
      if (Array.isArray(body.metaKeywords)) {
        product.metaKeywords = body.metaKeywords
          .map(normalizeString)
          .filter(Boolean);
      } else {
        product.metaKeywords = normalizeString(body.metaKeywords)
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean);
      }
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

      if (body.costPrice === undefined) {
        product.costPrice = product.purchasePrice;
      }
    }

    if (body.costPrice !== undefined) {
      product.costPrice = parseNumber(body.costPrice);
    }

    if (body.writtenPrice !== undefined) {
      product.writtenPrice = parseNumber(body.writtenPrice);
    }

    if (body.discountPrice !== undefined) {
      product.discountPrice = parseNumber(body.discountPrice);
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
    // STATUS
    // ==================================================

    if (body.status !== undefined) {
      if (body.status === "active" || body.status === "published") {
        product.status = "active";
      }

      if (body.status === "inactive" || body.status === "unpublished") {
        product.status = "inactive";
      }
    }

    // ==================================================
    // SOURCE
    // DO NOT CHANGE SOURCE
    // ==================================================

    if (!product.source) {
      product.source = "manual";
    }

    // ==================================================
    // STOCK STATUS
    // ==================================================

    product.isOutOfStock = product.stockQuantity <= 0;

    // ==================================================
    // IMAGES
    // ==================================================

    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length > 0) {
      const existingImages = Array.isArray(product.images)
        ? product.images
        : [];

      const newImages = files
        .map((file) => createImageUrl(req, file))
        .filter(Boolean);

      if (existingImages.length + newImages.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 images are allowed.",
        });
      }

      product.images = [...existingImages, ...newImages].slice(0, 5);
    }

    // ==================================================
    // SAVE
    // ==================================================

    await product.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    const updatedProduct = await populateProduct(Product.findById(product._id));

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product.",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ======================================================
// BULK PUBLISH / UNPUBLISH
// ======================================================

const bulkUpdateStatus = async (req, res) => {
  try {
    const body = req.body || {};

    const ids = Array.isArray(body.ids)
      ? body.ids
      : Array.isArray(body.productIds)
        ? body.productIds
        : [];

    let status = normalizeLower(body.status);

    if (status === "published") {
      status = "active";
    }

    if (status === "unpublished") {
      status = "inactive";
    }

    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: "No product IDs provided.",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active, inactive, published, or unpublished.",
      });
    }

    const result = await Product.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        $set: {
          status,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Products published successfully."
          : "Products unpublished successfully.",
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) {
    console.error("BULK STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product status.",
    });
  }
};

// ======================================================
// SINGLE PUBLISH / UNPUBLISH
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

    let status = normalizeLower(req.body?.status);

    if (status === "published") {
      status = "active";
    }

    if (status === "unpublished") {
      status = "inactive";
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status.",
      });
    }

    product.status = status;

    await product.save();

    const updatedProduct = await populateProduct(Product.findById(product._id));

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Product published successfully."
          : "Product unpublished successfully.",
      product: updatedProduct,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product status.",
    });
  }
};

// ======================================================
// ADD IMAGES
// ======================================================

const addImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image.",
      });
    }

    const existingImages = Array.isArray(product.images) ? product.images : [];

    const newImages = files
      .map((file) => createImageUrl(req, file))
      .filter(Boolean);

    if (existingImages.length + newImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images are allowed.",
      });
    }

    product.images = [...existingImages, ...newImages].slice(0, 5);

    await product.save();

    const updatedProduct = await populateProduct(Product.findById(product._id));

    return res.status(200).json({
      success: true,
      message: "Images added successfully.",
      product: updatedProduct,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("ADD IMAGES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add images.",
    });
  }
};

// ======================================================
// DELETE IMAGE
// ======================================================

const deleteImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const imageId = decodeURIComponent(String(req.params.imageId));

    if (!Array.isArray(product.images)) {
      product.images = [];
    }

    const oldImages = product.images;

    let imageIndex = -1;

    // Try numeric index
    const numericIndex = Number(imageId);

    if (
      Number.isInteger(numericIndex) &&
      numericIndex >= 0 &&
      numericIndex < oldImages.length
    ) {
      imageIndex = numericIndex;
    }

    // Try URL
    if (imageIndex === -1) {
      imageIndex = oldImages.findIndex(
        (image) => String(image) === String(imageId),
      );
    }

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    const imagePath = oldImages[imageIndex];

    // Remove database reference
    product.images = oldImages.filter((_, index) => index !== imageIndex);

    await product.save();

    // Delete local file
    try {
      if (imagePath && String(imagePath).includes("/uploads/")) {
        const relativePath = String(imagePath).split("/uploads/")[1];

        if (relativePath) {
          const fullPath = path.join(process.cwd(), "uploads", relativePath);

          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    } catch (fileError) {
      console.warn("Could not delete image file:", fileError.message);
    }

    const updatedProduct = await populateProduct(Product.findById(product._id));

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
      product: updatedProduct,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete image.",
    });
  }
};

// ======================================================
// DELETE PRODUCT
// BOTH MANUAL + IMPORTED
// ======================================================

const deleteImportedData = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // ==================================================
    // DELETE IMAGE FILES
    // ==================================================

    if (Array.isArray(product.images)) {
      for (const imagePath of product.images) {
        try {
          if (
            typeof imagePath === "string" &&
            imagePath.includes("/uploads/")
          ) {
            const relativePath = imagePath.split("/uploads/")[1];

            if (relativePath) {
              const fullPath = path.join(
                process.cwd(),
                "uploads",
                relativePath,
              );

              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            }
          }
        } catch (imageError) {
          console.warn("Could not delete product image:", imageError.message);
        }
      }
    }

    // ==================================================
    // DELETE PRODUCT
    // ==================================================

    await Product.findByIdAndDelete(product._id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product.",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  importData,

  getImportedData,

  getImportedDataById,

  updateImportedData,

  addImages,

  deleteImage,

  deleteImportedData,

  // Publish / Unpublish
  bulkUpdateStatus,

  updateProductStatus,
};

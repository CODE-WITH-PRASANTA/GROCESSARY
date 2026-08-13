const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Unit = require("../models/unit.model");

const {
  deleteUploadedFile,
} = require("../middleware/upload");


// ======================================================
// CREATE SLUG
// ======================================================

const createSlug = (text) => {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      "");
};


// ======================================================
// PARSE ARRAY
// ======================================================

const parseArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      Array.isArray(parsed)
    ) {
      return parsed;
    }
  } catch (error) {
    // Continue with comma-separated value
  }

  return String(value)
    .split(",")
    .map(
      (item) => item.trim()
    )
    .filter(Boolean);
};


// ======================================================
// GET ALL PRODUCTS
// GET /api/products
// ======================================================

exports.getProducts = async (
  req,
  res
) => {
  try {
    const {
      search,
      category,
      brand,
      unit,
      status,
      page = 1,
      limit = 20,
    } = req.query;


    // ==================================================
    // QUERY
    // ==================================================

    const query = {};


    // ==================================================
    // SEARCH
    // ==================================================

    if (
      search &&
      search.trim()
    ) {
      query.$or = [
        {
          productName: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          sku: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },

        {
          slug: {
            $regex:
              search.trim(),
            $options: "i",
          },
        },
      ];
    }


    // ==================================================
    // CATEGORY
    // ==================================================

    if (category) {
      query.category =
        category;
    }


    // ==================================================
    // BRAND
    // ==================================================

    if (brand) {
      query.brand = brand;
    }


    // ==================================================
    // UNIT
    // ==================================================

    if (unit) {
      query.unit = unit;
    }


    // ==================================================
    // STATUS
    // ==================================================

    if (status) {
      query.status =
        status;
    }


    // ==================================================
    // PAGINATION
    // ==================================================

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.max(
        Number(limit) || 20,
        1
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;


    // ==================================================
    // FETCH
    // ==================================================

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(query)

        .populate(
          "category",
          "name slug"
        )

        .populate(
          "brand",
          "name slug logoUrl"
        )

        .populate(
          "unit",
          "name shortName slug"
        )

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(
          limitNumber
        ),

      Product.countDocuments(
        query
      ),
    ]);


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(
      200
    ).json({
      success: true,

      data: products,

      pagination: {
        page: pageNumber,

        limit:
          limitNumber,

        total,

        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
      },
    });

  } catch (error) {
    console.error(
      "Get Products Error:",
      error
    );

    return res.status(
      500
    ).json({
      success: false,
      message:
        error.message,
    });
  }
};


// ======================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// ======================================================

exports.getProductById =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        )

          .populate(
            "category"
          )

          .populate(
            "brand"
          )

          .populate(
            "unit"
          );


      if (!product) {
        return res.status(
          404
        ).json({
          success: false,
          message:
            "Product not found",
        });
      }


      return res.status(
        200
      ).json({
        success: true,
        data: product,
      });

    } catch (error) {
      console.error(
        "Get Product Error:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ======================================================
// CREATE PRODUCT
// POST /api/products
// ======================================================

exports.createProduct =
  async (req, res) => {
    try {
      const {
        productName,

        category,

        brand,

        sku,

        unit,

        tags,

        shortDescription,

        fullDescription,

        metaTitle,

        metaDescription,

        metaKeywords,

        price,

        discountPrice,

        costPrice,

        stockQuantity,

        lowStockAlert,

        tax,

        isOutOfStock,

        status,

        slug,
      } = req.body;


      // ==================================================
      // REQUIRED FIELDS
      // ==================================================

      if (
        !productName ||
        !category ||
        !sku ||
        !unit ||
        price === undefined ||
        price === ""
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Product name, category, SKU, unit and price are required.",
        });
      }


      // ==================================================
      // CATEGORY VALIDATION
      // ==================================================

      const categoryExists =
        await Category.findById(
          category
        );


      if (!categoryExists) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid category.",
        });
      }


      // ==================================================
      // BRAND VALIDATION
      // ==================================================

      if (brand) {
        const brandExists =
          await Brand.findById(
            brand
          );


        if (!brandExists) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              "Invalid brand.",
          });
        }
      }


      // ==================================================
      // UNIT VALIDATION
      // ==================================================

      const unitExists =
        await Unit.findById(
          unit
        );


      if (!unitExists) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Invalid unit.",
        });
      }


      // ==================================================
      // NORMALIZE SKU
      // ==================================================

      const normalizedSku =
        String(sku)
          .trim()
          .toUpperCase();


      // ==================================================
      // SKU CHECK
      // ==================================================

      const skuExists =
        await Product.findOne({
          sku:
            normalizedSku,
        });


      if (skuExists) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "SKU already exists.",
        });
      }


      // ==================================================
      // SLUG
      // ==================================================

      let finalSlug =
        slug
          ? createSlug(slug)
          : createSlug(
              productName
            );


      // ==================================================
      // SLUG CHECK
      // ==================================================

      const slugExists =
        await Product.findOne({
          slug: finalSlug,
        });


      if (slugExists) {
        finalSlug =
          `${finalSlug}-${Date.now()}`;
      }


      // ==================================================
      // IMAGES
      // ==================================================

      const images =
        req.files &&
        Array.isArray(
          req.files
        )
          ? req.files.map(
              (file) =>
                `/${file.path}`
            )
          : [];


      // ==================================================
      // CREATE PRODUCT
      // ==================================================

      const product =
        await Product.create({
          productName:
            productName.trim(),

          slug:
            finalSlug,

          category,

          brand:
            brand || null,

          sku:
            normalizedSku,

          unit,

          tags:
            parseArray(tags),

          shortDescription:
            shortDescription ||
            "",

          fullDescription:
            fullDescription ||
            "",

          metaTitle:
            metaTitle || "",

          metaDescription:
            metaDescription ||
            "",

          metaKeywords:
            parseArray(
              metaKeywords
            ),

          price:
            Number(price),

          discountPrice:
            Number(
              discountPrice
            ) || 0,

          costPrice:
            Number(
              costPrice
            ) || 0,

          stockQuantity:
            Number(
              stockQuantity
            ) || 0,

          lowStockAlert:
            Number(
              lowStockAlert
            ) || 0,

          tax:
            Number(tax) || 0,

          isOutOfStock:
            isOutOfStock ===
              "true" ||
            isOutOfStock ===
              true,

          status:
            status ===
            "inactive"
              ? "inactive"
              : "active",

          images,
        });


      // ==================================================
      // POPULATE RESPONSE
      // ==================================================

      const populatedProduct =
        await Product.findById(
          product._id
        )

          .populate(
            "category",
            "name slug"
          )

          .populate(
            "brand",
            "name slug logoUrl"
          )

          .populate(
            "unit",
            "name shortName slug"
          );


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(
        201
      ).json({
        success: true,

        message:
          "Product created successfully",

        data:
          populatedProduct,
      });

    } catch (error) {
      console.error(
        "Create Product Error:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          error.message,
      });
    }
  };


// ======================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ======================================================

exports.updateProduct =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );


      if (!product) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Product not found",
        });
      }


      const {
        productName,

        category,

        brand,

        sku,

        unit,

        tags,

        shortDescription,

        fullDescription,

        metaTitle,

        metaDescription,

        metaKeywords,

        price,

        discountPrice,

        costPrice,

        stockQuantity,

        lowStockAlert,

        tax,

        isOutOfStock,

        status,

        slug,
      } = req.body;


      // ==================================================
      // CATEGORY
      // ==================================================

      if (
        category !==
        undefined
      ) {
        const exists =
          await Category.findById(
            category
          );


        if (!exists) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              "Invalid category.",
          });
        }


        product.category =
          category;
      }


      // ==================================================
      // BRAND
      // ==================================================

      if (
        brand !==
        undefined
      ) {
        if (brand) {
          const exists =
            await Brand.findById(
              brand
            );


          if (!exists) {
            return res.status(
              400
            ).json({
              success: false,

              message:
                "Invalid brand.",
            });
          }
        }


        product.brand =
          brand || null;
      }


      // ==================================================
      // UNIT
      // ==================================================

      if (
        unit !==
        undefined
      ) {
        const exists =
          await Unit.findById(
            unit
          );


        if (!exists) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              "Invalid unit.",
          });
        }


        product.unit =
          unit;
      }


      // ==================================================
      // PRODUCT NAME
      // ==================================================

      if (
        productName !==
        undefined
      ) {
        product.productName =
          productName.trim();
      }


      // ==================================================
      // SKU
      // ==================================================

      if (
        sku !==
        undefined
      ) {
        const normalizedSku =
          String(sku)
            .trim()
            .toUpperCase();


        const skuExists =
          await Product.findOne({
            sku:
              normalizedSku,

            _id: {
              $ne:
                product._id,
            },
          });


        if (skuExists) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              "SKU already exists.",
          });
        }


        product.sku =
          normalizedSku;
      }


      // ==================================================
      // SLUG
      // ==================================================

      if (
        slug !==
        undefined
      ) {
        const newSlug =
          createSlug(
            slug
          );


        const slugExists =
          await Product.findOne({
            slug:
              newSlug,

            _id: {
              $ne:
                product._id,
            },
          });


        if (slugExists) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              "Product slug already exists.",
          });
        }


        product.slug =
          newSlug;
      }


      // ==================================================
      // TAGS
      // ==================================================

      if (
        tags !==
        undefined
      ) {
        product.tags =
          parseArray(tags);
      }


      // ==================================================
      // DESCRIPTIONS
      // ==================================================

      if (
        shortDescription !==
        undefined
      ) {
        product.shortDescription =
          shortDescription;
      }


      if (
        fullDescription !==
        undefined
      ) {
        product.fullDescription =
          fullDescription;
      }


      // ==================================================
      // SEO
      // ==================================================

      if (
        metaTitle !==
        undefined
      ) {
        product.metaTitle =
          metaTitle;
      }


      if (
        metaDescription !==
        undefined
      ) {
        product.metaDescription =
          metaDescription;
      }


      if (
        metaKeywords !==
        undefined
      ) {
        product.metaKeywords =
          parseArray(
            metaKeywords
          );
      }


      // ==================================================
      // PRICE
      // ==================================================

      if (
        price !==
        undefined
      ) {
        product.price =
          Number(price);
      }


      if (
        discountPrice !==
        undefined
      ) {
        product.discountPrice =
          Number(
            discountPrice
          ) || 0;
      }


      if (
        costPrice !==
        undefined
      ) {
        product.costPrice =
          Number(
            costPrice
          ) || 0;
      }


      // ==================================================
      // STOCK
      // ==================================================

      if (
        stockQuantity !==
        undefined
      ) {
        product.stockQuantity =
          Number(
            stockQuantity
          ) || 0;
      }


      if (
        lowStockAlert !==
        undefined
      ) {
        product.lowStockAlert =
          Number(
            lowStockAlert
          ) || 0;
      }


      // ==================================================
      // TAX
      // ==================================================

      if (
        tax !==
        undefined
      ) {
        product.tax =
          Number(tax) || 0;
      }


      // ==================================================
      // OUT OF STOCK
      // ==================================================

      if (
        isOutOfStock !==
        undefined
      ) {
        product.isOutOfStock =
          isOutOfStock ===
            "true" ||
          isOutOfStock ===
            true;
      }


      // ==================================================
      // STATUS
      // ==================================================

      if (
        status !==
        undefined
      ) {
        product.status =
          status;
      }


      // ==================================================
      // EXISTING IMAGES
      // ==================================================

      let existingImages =
        product.images || [];


      if (
        req.body
          .existingImages
      ) {
        try {
          existingImages =
            JSON.parse(
              req.body
                .existingImages
            );
        } catch (error) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              "Invalid existingImages format.",
          });
        }
      }


      // ==================================================
      // REMOVED IMAGES
      // ==================================================

      const removedImages =
        (
          product.images ||
          []
        ).filter(
          (image) =>
            !existingImages.includes(
              image
            )
        );


      removedImages.forEach(
        (image) => {
          deleteUploadedFile(
            image
          );
        }
      );


      // ==================================================
      // NEW IMAGES
      // ==================================================

      const newImages =
        req.files &&
        Array.isArray(
          req.files
        )
          ? req.files.map(
              (file) =>
                `/${file.path}`
            )
          : [];


      // ==================================================
      // MAX 5 IMAGES
      // ==================================================

      product.images = [
        ...existingImages,
        ...newImages,
      ].slice(0, 5);


      // ==================================================
      // SAVE
      // ==================================================

      await product.save();


      // ==================================================
      // POPULATE
      // ==================================================

      const populatedProduct =
        await Product.findById(
          product._id
        )

          .populate(
            "category",
            "name slug"
          )

          .populate(
            "brand",
            "name slug logoUrl"
          )

          .populate(
            "unit",
            "name shortName slug"
          );


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Product updated successfully",

        data:
          populatedProduct,
      });

    } catch (error) {
      console.error(
        "Update Product Error:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,

        message:
          error.message,
      });
    }
  };


// ======================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ======================================================

exports.deleteProduct =
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );


      if (!product) {
        return res.status(
          404
        ).json({
          success: false,

          message:
            "Product not found",
        });
      }


      // ==================================================
      // DELETE PRODUCT IMAGES
      // ==================================================

      if (
        Array.isArray(
          product.images
        )
      ) {
        product.images.forEach(
          (image) => {
            deleteUploadedFile(
              image
            );
          }
        );
      }


      // ==================================================
      // DELETE PRODUCT
      // ==================================================

      await product.deleteOne();


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Product deleted successfully",

        id:
          req.params.id,
      });

    } catch (error) {
      console.error(
        "Delete Product Error:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,

        message:
          error.message,
      });
    }
  };
const Category = require("../models/Category");

const {
  deleteUploadedFile,
} = require("../middleware/upload");


// ======================================================
// HELPER: DELETE OLD ICON
// ======================================================

const removeOldIcon = (iconUrl) => {
  try {
    if (!iconUrl) {
      return;
    }

    deleteUploadedFile(iconUrl);

  } catch (error) {
    console.error(
      "Old icon delete error:",
      error.message
    );
  }
};


// ======================================================
// GET ALL CATEGORIES
// GET /api/categories
// ======================================================

exports.getCategories = async (req, res) => {
  try {

    const {
      search,
      status,
    } = req.query;


    let query = {};


    // ==================================================
    // SEARCH
    // ==================================================

    if (search && search.trim()) {

      const searchText =
        search.trim();


      query.$or = [
        {
          name: {
            $regex: searchText,
            $options: "i",
          },
        },

        {
          parent: {
            $regex: searchText,
            $options: "i",
          },
        },

        {
          slug: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }


    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (
      status &&
      status !== "All"
    ) {

      query.status = status;
    }


    // ==================================================
    // DATABASE
    // ==================================================

    const categories =
      await Category.find(query)
        .sort({
          order: 1,
          createdAt: -1,
        });


    return res.status(200).json({

      success: true,

      count: categories.length,

      data: categories,

    });

  } catch (error) {

    console.error(
      "Get Categories Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch categories",

      error: error.message,

    });
  }
};


// ======================================================
// GET SINGLE CATEGORY
// GET /api/categories/:id
// ======================================================

exports.getCategoryById = async (
  req,
  res
) => {

  try {

    const category =
      await Category.findById(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          "Category not found",

      });
    }


    return res.status(200).json({

      success: true,

      data: category,

    });

  } catch (error) {

    console.error(
      "Get Category Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch category",

      error: error.message,

    });
  }
};


// ======================================================
// CREATE CATEGORY
// POST /api/categories
// ======================================================

exports.createCategory = async (
  req,
  res
) => {

  try {

    const {
      name,
      slug,
      parent,
      description,
      order,
      status,
      icon,
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !name ||
      !name.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Category name is required",

      });
    }


    if (
      !slug ||
      !slug.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Category slug is required",

      });
    }


    // ==================================================
    // CHECK SLUG
    // ==================================================

    const existingCategory =
      await Category.findOne({
        slug: slug
          .trim()
          .toLowerCase(),
      });


    if (existingCategory) {

      return res.status(400).json({

        success: false,

        message:
          "Category slug already exists",

      });
    }


    // ==================================================
    // ICON
    // ==================================================

    let iconUrl = null;


    if (req.file) {

      /*
        convertToWebp middleware
        already created:

        req.file.path

        Example:

        uploads/images/category-xxx.webp
      */

      iconUrl =
        req.file.path;
    }


    // ==================================================
    // STATUS
    // ==================================================

    const categoryStatus =
      status === "true" ||
      status === true ||
      status === "Active"
        ? "Active"
        : "Inactive";


    // ==================================================
    // CREATE
    // ==================================================

    const category =
      await Category.create({

        name:
          name.trim(),

        slug:
          slug.trim().toLowerCase(),

        parent:
          parent?.trim() || "",

        description:
          description || "",

        order:
          Number(order) || 0,

        status:
          categoryStatus,

        icon:
          icon || "📦",

        iconUrl,

      });


    return res.status(201).json({

      success: true,

      message:
        "Category created successfully",

      data: category,

    });

  } catch (error) {

    console.error(
      "Create Category Error:",
      error
    );


    // ==================================================
    // CLEAN UP UPLOADED IMAGE IF DB FAILS
    // ==================================================

    if (req.file) {

      try {

        deleteUploadedFile(
          req.file.path
        );

      } catch (deleteError) {

        console.error(
          "Uploaded file cleanup error:",
          deleteError.message
        );
      }
    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to create category",

      error: error.message,

    });
  }
};


// ======================================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// ======================================================

exports.updateCategory = async (
  req,
  res
) => {

  try {

    const category =
      await Category.findById(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          "Category not found",

      });
    }


    const {
      name,
      slug,
      parent,
      description,
      order,
      status,
      icon,
    } = req.body;


    // ==================================================
    // CHECK SLUG DUPLICATE
    // ==================================================

    if (
      slug &&
      slug.trim()
    ) {

      const existingCategory =
        await Category.findOne({

          slug:
            slug.trim().toLowerCase(),

          _id: {
            $ne:
              category._id,
          },

        });


      if (existingCategory) {

        return res.status(400).json({

          success: false,

          message:
            "Category slug already exists",

        });
      }
    }


    // ==================================================
    // OLD ICON
    // ==================================================

    const oldIcon =
      category.iconUrl;


    // ==================================================
    // UPDATE FIELDS
    // ==================================================

    if (name !== undefined) {

      category.name =
        name.trim();

    }


    if (slug !== undefined) {

      category.slug =
        slug.trim().toLowerCase();

    }


    if (parent !== undefined) {

      category.parent =
        parent.trim();

    }


    if (
      description !==
      undefined
    ) {

      category.description =
        description;

    }


    if (order !== undefined) {

      category.order =
        Number(order) || 0;

    }


    if (icon !== undefined) {

      category.icon =
        icon;

    }


    if (
      status !== undefined
    ) {

      category.status =
        status === "true" ||
        status === true ||
        status === "Active"
          ? "Active"
          : "Inactive";

    }


    // ==================================================
    // NEW ICON
    // ==================================================

    if (req.file) {

      category.iconUrl =
        req.file.path;
    }


    // ==================================================
    // SAVE
    // ==================================================

    const updatedCategory =
      await category.save();


    // ==================================================
    // DELETE OLD ICON
    // ==================================================

    if (
      req.file &&
      oldIcon &&
      oldIcon !==
        category.iconUrl
    ) {

      removeOldIcon(
        oldIcon
      );
    }


    return res.status(200).json({

      success: true,

      message:
        "Category updated successfully",

      data:
        updatedCategory,

    });

  } catch (error) {

    console.error(
      "Update Category Error:",
      error
    );


    // ==================================================
    // DELETE NEW UPLOADED FILE IF UPDATE FAILS
    // ==================================================

    if (req.file) {

      try {

        deleteUploadedFile(
          req.file.path
        );

      } catch (deleteError) {

        console.error(
          "Cleanup error:",
          deleteError.message
        );
      }
    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to update category",

      error: error.message,

    });
  }
};


// ======================================================
// UPDATE STATUS
// PATCH /api/categories/:id/status
// ======================================================

exports.updateCategoryStatus =
  async (req, res) => {

    try {

      const {
        status,
      } = req.body;


      if (
        status !== "Active" &&
        status !== "Inactive"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Status must be Active or Inactive",

        });
      }


      const category =
        await Category.findByIdAndUpdate(

          req.params.id,

          {
            status,
          },

          {
            new: true,
            runValidators: true,
          }

        );


      if (!category) {

        return res.status(404).json({

          success: false,

          message:
            "Category not found",

        });
      }


      return res.status(200).json({

        success: true,

        message:
          "Category status updated successfully",

        data:
          category,

      });

    } catch (error) {

      console.error(
        "Status Update Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update category status",

        error: error.message,

      });
    }
  };


// ======================================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// ======================================================

exports.deleteCategory = async (
  req,
  res
) => {

  try {

    const category =
      await Category.findById(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          "Category not found",

      });
    }


    // ==================================================
    // DELETE ICON FILE
    // ==================================================

    if (
      category.iconUrl
    ) {

      removeOldIcon(
        category.iconUrl
      );
    }


    // ==================================================
    // DELETE DATABASE RECORD
    // ==================================================

    await category.deleteOne();


    return res.status(200).json({

      success: true,

      message:
        "Category deleted successfully",

      id:
        req.params.id,

    });

  } catch (error) {

    console.error(
      "Delete Category Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to delete category",

      error: error.message,

    });
  }
};
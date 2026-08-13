const Brand = require("../models/Brand");

const {
  deleteUploadedFile,
} = require("../middleware/upload");


// ==========================================================
// GET ALL BRANDS
// ==========================================================

exports.getBrands = async (req, res) => {
  try {

    const {
      search = "",
      status = "All",
    } = req.query;


    const query = {};


    // ======================================================
    // SEARCH
    // ======================================================

    if (search.trim()) {

      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },

        {
          category: {
            $regex: search.trim(),
            $options: "i",
          },
        },

        {
          tagline: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }


    // ======================================================
    // STATUS FILTER
    // ======================================================

    if (
      status &&
      status !== "All"
    ) {
      query.status = status;
    }


    // ======================================================
    // GET BRANDS
    // ======================================================

    const brands = await Brand.find(query)
      .sort({
        order: 1,
        createdAt: -1,
      });


    return res.status(200).json({
      success: true,
      data: brands,
    });

  } catch (error) {

    console.error(
      "Get Brands Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};


// ==========================================================
// GET SINGLE BRAND
// ==========================================================

exports.getBrandById = async (req, res) => {
  try {

    const {
      id,
    } = req.params;


    const brand = await Brand.findById(id);


    if (!brand) {

      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: brand,
    });

  } catch (error) {

    console.error(
      "Get Brand Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
      error: error.message,
    });
  }
};


// ==========================================================
// CREATE BRAND
// ==========================================================

exports.createBrand = async (req, res) => {
  try {

    const {
      name,
      tagline,
      slug,
      category,
      description,
      order,
      status,
    } = req.body;


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!name || !name.trim()) {

      /*
       If Multer already uploaded a file but validation
       fails, remove that newly uploaded file.
      */

      if (req.file) {
        deleteUploadedFile(req.file);
      }


      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }


    if (!slug || !slug.trim()) {

      if (req.file) {
        deleteUploadedFile(req.file);
      }


      return res.status(400).json({
        success: false,
        message: "Brand slug is required",
      });
    }


    // ======================================================
    // CHECK SLUG
    // ======================================================

    const existingBrand =
      await Brand.findOne({
        slug: slug.trim(),
      });


    if (existingBrand) {

      if (req.file) {
        deleteUploadedFile(req.file);
      }


      return res.status(409).json({
        success: false,
        message: "Brand slug already exists",
      });
    }


    // ======================================================
    // LOGO
    // ======================================================

    let logoUrl = null;


    if (req.file) {

      /*
       Your convertToWebp middleware sets:

       req.file.path

       Example:

       uploads/images/logo-123456.webp
      */

      logoUrl = req.file.path;
    }


    // ======================================================
    // CREATE
    // ======================================================

    const brand = await Brand.create({

      name: name.trim(),

      tagline:
        tagline?.trim() || "",

      slug:
        slug.trim(),

      category:
        category?.trim() || "General",

      description:
        description?.trim() || "",

      order:
        Number(order) || 0,

      status:
        status === "true" ||
        status === true ||
        status === "Active"
          ? "Active"
          : "Inactive",

      logoUrl,
    });


    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });

  } catch (error) {

    console.error(
      "Create Brand Error:",
      error
    );


    /*
      If database creation fails after the file
      was uploaded, remove the orphaned file.
    */

    if (req.file) {
      deleteUploadedFile(req.file);
    }


    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE BRAND
// ==========================================================

exports.updateBrand = async (req, res) => {
  try {

    const {
      id,
    } = req.params;


    // ======================================================
    // FIND BRAND
    // ======================================================

    const brand =
      await Brand.findById(id);


    if (!brand) {

      /*
       A new logo could already have been uploaded.
       Delete it because the brand doesn't exist.
      */

      if (req.file) {
        deleteUploadedFile(req.file);
      }


      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }


    // ======================================================
    // REQUEST DATA
    // ======================================================

    const {
      name,
      tagline,
      slug,
      category,
      description,
      order,
      status,
    } = req.body;


    // ======================================================
    // SLUG DUPLICATE CHECK
    // ======================================================

    if (slug !== undefined) {

      const existingBrand =
        await Brand.findOne({
          slug: slug.trim(),

          _id: {
            $ne: id,
          },
        });


      if (existingBrand) {

        if (req.file) {
          deleteUploadedFile(req.file);
        }


        return res.status(409).json({
          success: false,
          message: "Brand slug already exists",
        });
      }
    }


    // ======================================================
    // SAVE OLD LOGO
    // ======================================================

    const oldLogo =
      brand.logoUrl;


    // ======================================================
    // UPDATE FIELDS
    // ======================================================

    if (name !== undefined) {

      brand.name =
        name.trim();
    }


    if (tagline !== undefined) {

      brand.tagline =
        tagline.trim();
    }


    if (slug !== undefined) {

      brand.slug =
        slug.trim();
    }


    if (category !== undefined) {

      brand.category =
        category.trim();
    }


    if (description !== undefined) {

      brand.description =
        description.trim();
    }


    if (order !== undefined) {

      brand.order =
        Number(order) || 0;
    }


    if (status !== undefined) {

      brand.status =
        status === "true" ||
        status === true ||
        status === "Active"
          ? "Active"
          : "Inactive";
    }


    // ======================================================
    // NEW LOGO
    // ======================================================

    if (req.file) {

      brand.logoUrl =
        req.file.path;
    }


    // ======================================================
    // SAVE
    // ======================================================

    const updatedBrand =
      await brand.save();


    // ======================================================
    // DELETE OLD LOGO
    // ONLY AFTER SUCCESSFUL SAVE
    // ======================================================

    if (
      req.file &&
      oldLogo &&
      oldLogo !== updatedBrand.logoUrl
    ) {

      deleteUploadedFile(
        oldLogo
      );
    }


    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });

  } catch (error) {

    console.error(
      "Update Brand Error:",
      error
    );


    /*
      New logo was uploaded but update failed.
      Remove the new file because MongoDB didn't
      save it.
    */

    if (req.file) {
      deleteUploadedFile(req.file);
    }


    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: error.message,
    });
  }
};


// ==========================================================
// UPDATE BRAND STATUS
// ==========================================================

exports.updateBrandStatus = async (req, res) => {
  try {

    const {
      status,
    } = req.body;


    // ======================================================
    // VALIDATE STATUS
    // ======================================================

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


    // ======================================================
    // UPDATE
    // ======================================================

    const brand =
      await Brand.findByIdAndUpdate(
        req.params.id,

        {
          status,
        },

        {
          new: true,
          runValidators: true,
        }
      );


    if (!brand) {

      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Brand status updated successfully",
      data: brand,
    });

  } catch (error) {

    console.error(
      "Update Brand Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update brand status",
      error: error.message,
    });
  }
};


// ==========================================================
// DELETE BRAND
// ==========================================================

exports.deleteBrand = async (req, res) => {
  try {

    const {
      id,
    } = req.params;


    // ======================================================
    // FIND BRAND
    // ======================================================

    const brand =
      await Brand.findById(id);


    if (!brand) {

      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }


    // ======================================================
    // DELETE DATABASE RECORD
    // ======================================================

    await brand.deleteOne();


    // ======================================================
    // DELETE LOGO
    // ======================================================

    if (brand.logoUrl) {

      deleteUploadedFile(
        brand.logoUrl
      );
    }


    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
      id,
    });

  } catch (error) {

    console.error(
      "Delete Brand Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: error.message,
    });
  }
};
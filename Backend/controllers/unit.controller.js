const Unit = require("../models/unit.model");


/* ==========================================================
   CREATE UNIT
========================================================== */

const createUnit = async (req, res) => {
  try {
    const {
      name,
      symbol,
      type,
      order,
      status,
    } = req.body;


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit name is required",
      });
    }


    if (!symbol || !symbol.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit symbol is required",
      });
    }


    /* --------------------------------------------------------
       CHECK DUPLICATE NAME
    -------------------------------------------------------- */

    const existingName = await Unit.findOne({
      name: name.trim(),
    }).collation({
      locale: "en",
      strength: 2,
    });


    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Unit name already exists",
      });
    }


    /* --------------------------------------------------------
       CHECK DUPLICATE SYMBOL
    -------------------------------------------------------- */

    const existingSymbol = await Unit.findOne({
      symbol: symbol.trim(),
    }).collation({
      locale: "en",
      strength: 2,
    });


    if (existingSymbol) {
      return res.status(409).json({
        success: false,
        message: "Unit symbol already exists",
      });
    }


    /* --------------------------------------------------------
       CREATE
    -------------------------------------------------------- */

    const unit = await Unit.create({
      name: name.trim(),
      symbol: symbol.trim(),
      type: type || "Count",
      order: Number(order) || 0,
      status:
        typeof status === "boolean"
          ? status
          : true,
    });


    return res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });

  } catch (error) {

    console.error("Create Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create unit",
      error: error.message,
    });
  }
};



/* ==========================================================
   GET ALL UNITS
========================================================== */

const getUnits = async (req, res) => {
  try {

    const {
      search = "",
      status = "All",
      page = 1,
      limit = 8,
    } = req.query;


    /* --------------------------------------------------------
       FILTER
    -------------------------------------------------------- */

    const filter = {};


    /* Search */
    if (search.trim()) {

      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          symbol: searchRegex,
        },
        {
          type: searchRegex,
        },
      ];
    }


    /* Status */
    if (status === "Active") {
      filter.status = true;
    }

    if (status === "Inactive") {
      filter.status = false;
    }


    /* --------------------------------------------------------
       PAGINATION
    -------------------------------------------------------- */

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const perPage = Math.max(
      Number(limit) || 8,
      1
    );

    const skip =
      (currentPage - 1) * perPage;


    /* --------------------------------------------------------
       QUERY
    -------------------------------------------------------- */

    const [
      units,
      totalEntries,
    ] = await Promise.all([

      Unit.find(filter)
        .sort({
          order: 1,
          createdAt: 1,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Unit.countDocuments(filter),
    ]);


    const totalPages =
      Math.ceil(totalEntries / perPage) || 1;


    /* --------------------------------------------------------
       RESPONSE
    -------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      data: units,

      pagination: {
        currentPage,
        perPage,
        totalEntries,
        totalPages,
      },
    });

  } catch (error) {

    console.error("Get Units Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch units",
      error: error.message,
    });
  }
};



/* ==========================================================
   GET SINGLE UNIT
========================================================== */

const getUnitById = async (req, res) => {
  try {

    const { id } = req.params;


    const unit = await Unit.findById(id);


    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: unit,
    });

  } catch (error) {

    console.error("Get Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unit",
      error: error.message,
    });
  }
};



/* ==========================================================
   UPDATE UNIT
========================================================== */

const updateUnit = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      name,
      symbol,
      type,
      order,
      status,
    } = req.body;


    /* --------------------------------------------------------
       FIND UNIT
    -------------------------------------------------------- */

    const unit = await Unit.findById(id);


    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }


    /* --------------------------------------------------------
       VALIDATE NAME
    -------------------------------------------------------- */

    if (name !== undefined) {

      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Unit name cannot be empty",
        });
      }


      const duplicateName =
        await Unit.findOne({
          name: name.trim(),
          _id: {
            $ne: id,
          },
        }).collation({
          locale: "en",
          strength: 2,
        });


      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message: "Unit name already exists",
        });
      }


      unit.name = name.trim();
    }


    /* --------------------------------------------------------
       VALIDATE SYMBOL
    -------------------------------------------------------- */

    if (symbol !== undefined) {

      if (!symbol.trim()) {
        return res.status(400).json({
          success: false,
          message: "Unit symbol cannot be empty",
        });
      }


      const duplicateSymbol =
        await Unit.findOne({
          symbol: symbol.trim(),
          _id: {
            $ne: id,
          },
        }).collation({
          locale: "en",
          strength: 2,
        });


      if (duplicateSymbol) {
        return res.status(409).json({
          success: false,
          message: "Unit symbol already exists",
        });
      }


      unit.symbol = symbol.trim();
    }


    /* --------------------------------------------------------
       OTHER FIELDS
    -------------------------------------------------------- */

    if (type !== undefined) {
      unit.type = type || "Count";
    }


    if (order !== undefined) {
      unit.order = Number(order) || 0;
    }


    if (status !== undefined) {
      unit.status = Boolean(status);
    }


    await unit.save();


    return res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: unit,
    });

  } catch (error) {

    console.error("Update Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update unit",
      error: error.message,
    });
  }
};



/* ==========================================================
   CHANGE STATUS
========================================================== */

const changeUnitStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const { status } = req.body;


    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Status must be true or false",
      });
    }


    const unit = await Unit.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );


    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }


    return res.status(200).json({
      success: true,
      message: status
        ? "Unit activated successfully"
        : "Unit deactivated successfully",
      data: unit,
    });

  } catch (error) {

    console.error(
      "Change Unit Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change unit status",
      error: error.message,
    });
  }
};



/* ==========================================================
   DELETE UNIT
========================================================== */

const deleteUnit = async (req, res) => {
  try {

    const { id } = req.params;


    const unit = await Unit.findByIdAndDelete(id);


    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
      data: unit,
    });

  } catch (error) {

    console.error("Delete Unit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete unit",
      error: error.message,
    });
  }
};



/* ==========================================================
   EXPORT
========================================================== */

module.exports = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  changeUnitStatus,
  deleteUnit,
};
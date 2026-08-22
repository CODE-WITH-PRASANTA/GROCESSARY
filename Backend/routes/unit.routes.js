const express = require("express");

const router = express.Router();

const {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  changeUnitStatus,
  deleteUnit,
} = require("../controllers/unit.controller");


/* ==========================================================
   UNIT ROUTES
========================================================== */


/*
   GET
   /api/units

   Search:
   /api/units?search=kg

   Status:
   /api/units?status=Active

   Pagination:
   /api/units?page=1&limit=8

   Combined:
   /api/units?search=kg&status=Active&page=1&limit=8
*/

router.get("/", getUnits);


/*
   POST
   /api/units
*/

router.post("/", createUnit);


/*
   GET SINGLE
   /api/units/:id
*/

router.get("/:id", getUnitById);


/*
   PUT
   /api/units/:id
*/

router.put("/:id", updateUnit);


/*
   PATCH STATUS
   /api/units/:id/status
*/

router.put("/:id/status", changeUnitStatus);


/*
   DELETE
   /api/units/:id
*/

router.delete("/:id", deleteUnit);


module.exports = router;
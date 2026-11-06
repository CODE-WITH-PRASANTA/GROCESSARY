const express = require("express");
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// GET all registered users
router.get("/", getAllUsers);

// GET single user details
router.get("/:id", getUserById);

// UPDATE user active/inactive status
router.patch("/:id/status", toggleUserStatus);

// UPDATE user information
router.put("/:id", updateUser);

// DELETE user
router.delete("/:id", deleteUser);

module.exports = router;


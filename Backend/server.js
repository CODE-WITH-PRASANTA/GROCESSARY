const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const bannerRoutes = require("./routes/bannerRoutes");
const listUploadRoutes = require("./routes/listUploadRoutes");
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const coldLeadRoutes = require("./routes/coldLeadRoutes");
const unitRoutes = require("./routes/unit.routes");
const categoryRoutes = require("./routes/categoryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const importRoutes = require("./routes/importRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const todayDiscountRoutes = require("./routes/todayDiscountRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/list-upload", listUploadRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.use("/api/banners", bannerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cold-leads", coldLeadRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/import", importRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/today-discounts", todayDiscountRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
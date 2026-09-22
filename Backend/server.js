const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

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

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://grocerysathi.com",
  "https://grocerysathi.com",
  "http://admin.grocerysathi.com",
  "https://admin.grocerysathi.com",
  "http://backend.grocerysathi.com",
  "https://backend.grocerysathi.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    // Check if it's in the allowed production list OR any local port (localhost/127.0.0.1)
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    
    if (allowedOrigins.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
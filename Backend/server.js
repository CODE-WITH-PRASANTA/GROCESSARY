const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");




const bannerRoutes = require('./routes/bannerRoutes');




const listUploadRoutes = require(
  "./routes/listUploadRoutes"
);

const brandRoutes = require(
  "./routes/brandRoutes"
);
const coldLeadRoutes = require("./routes/coldLeadRoutes");


// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);





app.use(
  "/api/list-upload",
  listUploadRoutes
);

// Routes
app.use('/api/banners', bannerRoutes);
app.use('/api/brands', require('./routes/brandRoutes'));
app.use("/api/cold-leads", coldLeadRoutes);



// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully ",
  });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
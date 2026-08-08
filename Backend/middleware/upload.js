const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ======================================================
// CONFIG
// ======================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

// ======================================================
// GET FILE TYPE
// ======================================================

const getFileType = (file) => {
  if (file.mimetype.startsWith("image/")) {
    return "images";
  }

  if (file.mimetype === "application/pdf") {
    return "pdfs";
  }

  return "others";
};

// ======================================================
// CREATE UPLOAD DIRECTORY
// uploads/images/2026/08/
// uploads/pdfs/2026/08/
// ======================================================

const createUploadDirectory = (file) => {
  const now = new Date();

  const year = now.getFullYear().toString();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const fileType = getFileType(file);

  const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    fileType,
    year,
    month
  );

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
      recursive: true,
    });
  }

  return uploadDirectory;
};

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const directory =
        createUploadDirectory(file);

      cb(null, directory);
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    try {
      const randomId = crypto
        .randomBytes(8)
        .toString("hex");

      const timestamp = Date.now();

      const extension =
        allowedMimeTypes[file.mimetype];

      const originalBaseName = path
        .basename(
          file.originalname,
          path.extname(file.originalname)
        )
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 50);

      const safeBaseName =
        originalBaseName || "grocery-list";

      const fileName =
        `${safeBaseName}-${timestamp}-${randomId}${extension}`;

      cb(null, fileName);
    } catch (error) {
      cb(error);
    }
  },
});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and PDF files are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

// ======================================================
// MULTER
// ======================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// ======================================================
// MAP UPLOADED FILE
// ======================================================

const mapUploadedFile = (file, req) => {
  if (!file) {
    return null;
  }

  const relativePath = path
    .relative(
      path.join(__dirname, ".."),
      file.path
    )
    .replace(/\\/g, "/");

  return {
    originalName: file.originalname,

    fileName: file.filename,

    mimeType: file.mimetype,

    fileType:
      getFileType(file) === "images"
        ? "image"
        : "pdf",

    size: file.size,

    sizeMB: Number(
      (file.size / (1024 * 1024)).toFixed(2)
    ),

    path: relativePath,

    url:
      `${req.protocol}://${req.get("host")}/${relativePath}`,
  };
};

// ======================================================
// DELETE FILE
// Accepts:
// "uploads/images/.../image.jpg"
//
// OR:
//
// {
//    path: "uploads/images/.../image.jpg"
// }
// ======================================================

const deleteUploadedFile = (fileData) => {
  try {
    if (!fileData) {
      return false;
    }

    const filePath =
      typeof fileData === "string"
        ? fileData
        : fileData.path;

    if (!filePath) {
      return false;
    }

    const uploadRoot = path.resolve(
      __dirname,
      "..",
      "uploads"
    );

    const absolutePath = path.resolve(
      __dirname,
      "..",
      filePath
    );

    // Security check:
    // only delete files from uploads folder
    if (
      absolutePath !== uploadRoot &&
      !absolutePath.startsWith(
        uploadRoot + path.sep
      )
    ) {
      console.error(
        "Delete blocked: file is outside uploads directory"
      );

      return false;
    }

    if (!fs.existsSync(absolutePath)) {
      console.log(
        "File does not exist:",
        absolutePath
      );

      return false;
    }

    fs.unlinkSync(absolutePath);

    console.log(
      "Old uploaded file deleted:",
      absolutePath
    );

    return true;
  } catch (error) {
    console.error(
      "File deletion error:",
      error.message
    );

    return false;
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  upload,
  mapUploadedFile,
  deleteUploadedFile,
};
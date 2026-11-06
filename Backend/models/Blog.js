const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Commenter name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Commenter email is required"],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, "Comment message is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "Nutrition",
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },
    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },
    metaKeywords: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Scheduled", "Unpublished"],
      default: "Published",
    },
    author: {
      type: String,
      trim: true,
      default: "Grocery Sathi",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug and excerpt before saving if not provided
blogSchema.pre("save", function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (!this.excerpt && this.content) {
    // Strip HTML tags and grab first 150 characters
    const textContent = this.content.replace(/<[^>]+>/g, "").trim();
    this.excerpt =
      textContent.length > 150
        ? `${textContent.substring(0, 147)}...`
        : textContent;
  }
});

module.exports = mongoose.model("Blog", blogSchema);

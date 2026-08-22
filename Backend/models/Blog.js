const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'news'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop'
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [160, 'Excerpt cannot exceed 160 characters']
    },
    content: {
      type: String,
      default: ''
    },
    metaTitle: {
      type: String,
      default: ''
    },
    metaDescription: {
      type: String,
      default: ''
    },
    metaKeywords: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Scheduled', 'Unpublished'],
      default: 'Published'
    },
    author: {
      type: String,
      default: 'Grocery Sathi'
    },
    views: {
      type: Number,
      default: 0
    },
    publishDate: {
      type: Date,
      default: Date.now
    },
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Blog', blogSchema);
const path = require("path");
const Blog = require("../models/Blog");

// Helper to determine base image path directly from backend port 5000 /uploads
const getFileUrl = (filename) => {
  return `http://localhost:5000/uploads/${filename}`;
};

// ======================================================
// GET ALL BLOGS
// ======================================================
// GET /api/blogs?category=...&status=...&search=...
const getAllBlogs = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category && category !== "All Categories" && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

// ======================================================
// GET SINGLE BLOG BY ID OR SLUG
// ======================================================
// GET /api/blogs/:id
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    let blog = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { returnDocument: "after" }
      );
    } else {
      blog = await Blog.findOneAndUpdate(
        { slug: id.toLowerCase() },
        { $inc: { views: 1 } },
        { returnDocument: "after" }
      );
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get blog by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog post",
    });
  }
};

// ======================================================
// CREATE NEW BLOG
// ======================================================
// POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      publishDate,
      author,
      imagePreview,
      image: bodyImage,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required",
      });
    }

    // Determine featured image
    let image = "";
    if (req.file) {
      image = getFileUrl(req.file.filename);
    } else if (bodyImage && typeof bodyImage === "string" && bodyImage.trim()) {
      image = bodyImage.trim();
    } else if (
      imagePreview &&
      typeof imagePreview === "string" &&
      imagePreview.trim()
    ) {
      image = imagePreview.trim();
    }

    // Generate slug
    const cleanSlug =
      (slug && slug.trim()) ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Generate excerpt if not given
    let cleanExcerpt = excerpt ? excerpt.trim() : "";
    if (!cleanExcerpt && content) {
      const text = content.replace(/<[^>]+>/g, "").trim();
      cleanExcerpt = text.length > 150 ? `${text.substring(0, 147)}...` : text;
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: cleanSlug,
      category: (category && category.trim()) || "Nutrition",
      image,
      excerpt: cleanExcerpt || title.trim(),
      content: content || "",
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      metaKeywords: metaKeywords || "",
      status: status || "Published",
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      author: (author && author.trim()) || "Grocery Sathi",
    });

    return res.status(201).json({
      success: true,
      message: "Blog post published successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create blog post",
    });
  }
};

// ======================================================
// UPDATE BLOG
// ======================================================
// PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = getFileUrl(req.file.filename);
    } else if (req.body.imagePreview && typeof req.body.imagePreview === "string") {
      updateData.image = req.body.imagePreview;
    }

    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (!updateData.excerpt && updateData.content) {
      const text = updateData.content.replace(/<[^>]+>/g, "").trim();
      updateData.excerpt = text.length > 150 ? `${text.substring(0, 147)}...` : text;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update blog post",
    });
  }
};

// ======================================================
// UPDATE BLOG STATUS
// ======================================================
// PATCH /api/blogs/:id/status
const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status value is required",
      });
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Blog status updated to ${status}`,
      data: blog,
    });
  } catch (error) {
    console.error("Update blog status error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update blog status",
    });
  }
};

// ======================================================
// DELETE BLOG
// ======================================================
// DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog post",
    });
  }
};

// ======================================================
// ADD COMMENT
// ======================================================
// POST /api/blogs/:id/comments
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required for comments",
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    blog.comments.unshift({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      date: new Date(),
    });

    await blog.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: blog.comments,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add comment",
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  addComment,
};

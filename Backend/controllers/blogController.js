const Blog = require('../models/Blog');

// @desc    Get all blogs (Optional filtering by category and status)
// @route   GET /api/blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};

    if (category && category !== 'All Categories') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (status) {
      query.status = status;
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by ID (increments view count automatically)
// @route   GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new blog post
// @route   POST /api/blogs
exports.createBlog = async (req, res) => {
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
      author
    } = req.body;

    let image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop';
    if (req.file) {
      image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const newBlog = await Blog.create({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: category || 'news',
      image,
      excerpt,
      content: content || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      metaKeywords: metaKeywords || '',
      status: status || 'Published',
      publishDate: publishDate || new Date(),
      author: author || 'Grocery Sathi'
    });

    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update blog post by ID
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog post by ID
// @route   DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to a blog
// @route   POST /api/blogs/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    blog.comments.unshift({ name, email, message });
    await blog.save();

    res.status(201).json({ success: true, data: blog.comments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
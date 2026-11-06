import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FileText,
  Globe,
  Image,
  FolderTree,
  Check,
  CheckCircle2,
  RotateCcw,
  Save,
  ExternalLink,
  Calendar,
  TrendingUp,
  Bold,
  Italic,
  Underline,
  List,
  Code,
  Maximize2,
  Minimize2,
  ChevronRight,
  AlertCircle,
  X,
  BookOpen,
  Clock,
  ArrowLeft,
  Sparkles,
  UploadCloud,
  Send,
} from "lucide-react";
import API from "../../api/axios";
import "./BlogPosting.css";

const getBlogImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const clean = url.startsWith("/") ? url : "/" + url;
  return "http://localhost:5000" + clean;
};

const initialFormState = {
  title: "",
  slug: "",
  category: "Grocery & Health",
  featuredImage: null,
  imagePreview: "",
  excerpt: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: "Published",
  publishDate: new Date().toISOString().split("T")[0],
};

const BlogPosting = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const fileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Load Categories from database
  const loadCategories = async () => {
    try {
      const res = await API.get("/categories");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const activeList = list.filter(
        (cat) => !cat.status || cat.status.toLowerCase() === "active"
      );
      const finalList = activeList.length > 0 ? activeList : list;
      setCategories(finalList);

      if (finalList.length > 0 && !editingId && !formData.category) {
        setFormData((prev) => ({
          ...prev,
          category: finalList[0].name,
        }));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load all blogs for top stats metrics
  const loadBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      if (res.data?.success) {
        setBlogs(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading blog metrics:", err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadBlogs();
  }, []);

  // Handle Edit Mode from URL param
  useEffect(() => {
    if (urlId) {
      const fetchBlogDetails = async () => {
        try {
          const res = await API.get(`/blogs/${urlId}`);
          if (res.data?.success && res.data?.data) {
            const blog = res.data.data;
            setEditingId(blog._id);
            setFormData({
              title: blog.title || "",
              slug: blog.slug || "",
              category: blog.category || "Grocery & Health",
              featuredImage: null,
              imagePreview: blog.image ? getBlogImageUrl(blog.image) : "",
              excerpt: blog.excerpt || "",
              content: blog.content || "",
              metaTitle: blog.metaTitle || "",
              metaDescription: blog.metaDescription || "",
              metaKeywords: blog.metaKeywords || "",
              status: blog.status || "Published",
              publishDate: blog.publishDate
                ? blog.publishDate.substring(0, 10)
                : new Date().toISOString().split("T")[0],
            });
          }
        } catch (err) {
          console.error("Error loading blog for edit:", err);
          setFeedback({ error: "Could not load blog post for editing.", success: "" });
        }
      };
      fetchBlogDetails();
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
  }, [urlId]);

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate clean slug if creating new
      if (name === "title" && !editingId) {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return updated;
    });
  };

  // Featured image file change
  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Please select an image file (JPG, PNG, WEBP).",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      featuredImage: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      featuredImage: null,
      imagePreview: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // TinyMCE / Markdown style text formatting
  const applyFormatting = (tagOpen, tagClose = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || "";
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  // Reset / Discard form
  const handleReset = () => {
    Swal.fire({
      title: "Discard changes?",
      text: "Any unsaved changes on this blog post will be discarded.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, discard",
    }).then((result) => {
      if (result.isConfirmed) {
        if (editingId) {
          navigate("/blogmanagement");
        } else {
          setFormData(initialFormState);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setFeedback({ error: "", success: "" });
        }
      }
    });
  };

  // Submit blog post
  const handleSubmitBlog = async (e, forcedStatus) => {
    if (e) e.preventDefault();
    setFeedback({ error: "", success: "" });

    if (!formData.title.trim()) {
      setFeedback({ error: "Please enter a blog post title.", success: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.slug.trim()) {
      setFeedback({ error: "Please enter a URL slug for this blog.", success: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.excerpt.trim()) {
      setFeedback({ error: "Please provide a short excerpt or summary.", success: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setIsSubmitting(true);
      const postStatus = forcedStatus || formData.status || "Published";
      const payload = {
        ...formData,
        status: postStatus,
      };

      const data = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === "featuredImage") {
          if (payload[key]) data.append("featuredImage", payload[key]);
        } else if (payload[key] !== null && payload[key] !== undefined) {
          data.append(key, payload[key]);
        }
      });

      if (editingId) {
        const res = await API.put(`/blogs/${editingId}`, data);
        if (!res.data?.success) throw new Error(res.data?.message || "Failed to update blog");
        Swal.fire({
          icon: "success",
          title: "Blog Updated!",
          text: `"${formData.title}" has been updated successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/blogmanagement");
      } else {
        const res = await API.post("/blogs", data);
        if (!res.data?.success) throw new Error(res.data?.message || "Failed to publish blog");
        Swal.fire({
          icon: "success",
          title: postStatus === "Draft" ? "Draft Saved!" : "Blog Published!",
          text: `"${formData.title}" is now ${postStatus.toLowerCase()}!`,
          timer: 2000,
          showConfirmButton: false,
        });
        setFormData(initialFormState);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadBlogs();
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      const msg = error.response?.data?.message || error.message || "Failed to save blog post.";
      setFeedback({ error: msg, success: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics numbers
  const totalBlogsCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === "Published").length;
  const draftCount = blogs.filter((b) => b.status === "Draft").length;
  const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="blogp-full-container">
      {/* =========================================================
          TOP HEADER & ACTIONS BAR
      ========================================================== */}
      <div className="blogp-top-header">
        <div className="blogp-header-left">
          <div className="blogp-breadcrumb-row">
            <Link to="/blogmanagement" className="blogp-breadcrumb-link">
              <BookOpen size={14} />
              <span>Blog Management</span>
            </Link>
            <ChevronRight size={13} className="blogp-breadcrumb-sep" />
            <span className="blogp-breadcrumb-active">
              {editingId ? "Edit Blog" : "Create New Blog"}
            </span>
          </div>
          <h1 className="blogp-main-title">
            {editingId ? "Edit Blog Post" : "Add New Blog"}
          </h1>
          <p className="blogp-main-desc">
            {editingId
              ? `Updating post: "${formData.title || "Untitled Article"}"`
              : "Craft engaging grocery guides, healthy lifestyle tips, and farm-fresh recipes."}
          </p>
        </div>

        <div className="blogp-header-actions">
          <Link to="/blogmanagement" className="blogp-btn-secondary">
            <BookOpen size={15} />
            <span>View All Blogs ({totalBlogsCount})</span>
          </Link>

          <button
            type="button"
            className="blogp-btn-outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw size={15} />
            <span>{editingId ? "Cancel" : "Reset"}</span>
          </button>

          <button
            type="button"
            className="blogp-btn-draft"
            onClick={() => handleSubmitBlog(null, "Draft")}
            disabled={isSubmitting}
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="blogp-btn-publish"
            onClick={(e) => handleSubmitBlog(e)}
            disabled={isSubmitting}
          >
            <Send size={15} />
            <span>{editingId ? "Update Post" : "Publish Article"}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {feedback.error && (
        <div className="blogp-alert-box error">
          <AlertCircle size={18} />
          <span>{feedback.error}</span>
          <button
            type="button"
            onClick={() => setFeedback({ ...feedback, error: "" })}
            className="alert-close-btn"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =========================================================
          TOP STATS SUMMARY BAR
      ========================================================== */}
      <div className="blogp-stats-row">
        <div className="blogp-stat-card">
          <div className="blogp-stat-icon emerald">
            <FileText size={18} />
          </div>
          <div className="blogp-stat-meta">
            <span className="stat-label">Total Articles</span>
            <strong className="stat-val">{totalBlogsCount}</strong>
          </div>
        </div>

        <div className="blogp-stat-card">
          <div className="blogp-stat-icon blue">
            <CheckCircle2 size={18} />
          </div>
          <div className="blogp-stat-meta">
            <span className="stat-label">Live Published</span>
            <strong className="stat-val">{publishedCount}</strong>
          </div>
        </div>

        <div className="blogp-stat-card">
          <div className="blogp-stat-icon amber">
            <Clock size={18} />
          </div>
          <div className="blogp-stat-meta">
            <span className="stat-label">Drafts in Progress</span>
            <strong className="stat-val">{draftCount}</strong>
          </div>
        </div>

        <div className="blogp-stat-card">
          <div className="blogp-stat-icon purple">
            <TrendingUp size={18} />
          </div>
          <div className="blogp-stat-meta">
            <span className="stat-label">Customer Views</span>
            <strong className="stat-val">{totalViews.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FULL-WIDTH ASYMMETRICAL 2-COLUMN FORM
      ========================================================== */}
      <form onSubmit={(e) => handleSubmitBlog(e)} className="blogp-content-grid">
        {/* =======================================================
            LEFT COLUMN (68% WIDTH): TITLE, EXCERPT, RICH CONTENT, SEO
        ======================================================== */}
        <div className="blogp-col-main">
          {/* CARD 1: GENERAL ARTICLE DETAILS */}
          <div className="blogp-card">
            <div className="blogp-card-header">
              <div className="blogp-card-header-icon emerald">
                <FileText size={18} />
              </div>
              <div className="blogp-card-header-text">
                <h2>Article Information</h2>
                <p>Provide the core title, permalink handle, and summary for readers.</p>
              </div>
            </div>

            <div className="blogp-card-body">
              {/* Blog Title */}
              <div className="blogp-form-group">
                <div className="blogp-label-row">
                  <label>
                    Blog Title <span className="req">*</span>
                  </label>
                  <span className="blogp-counter">
                    {formData.title.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. 10 Essential Nutrition Tips for Healthy Living & Farm Cooking"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={120}
                  className="blogp-input title-input"
                  required
                />
              </div>

              {/* Slug Handle */}
              <div className="blogp-form-group">
                <label>
                  Permalink Slug (URL Handle) <span className="req">*</span>
                </label>
                <div className="blogp-slug-wrapper">
                  <span className="blogp-slug-prefix">grocerysathi.com/news/</span>
                  <input
                    type="text"
                    name="slug"
                    placeholder="10-essential-nutrition-tips-healthy-living"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="blogp-input slug-input"
                    required
                  />
                </div>
                <span className="blogp-field-hint">
                  The web URL readers use to discover this article. Use hyphens between words.
                </span>
              </div>

              {/* Excerpt / Summary */}
              <div className="blogp-form-group">
                <div className="blogp-label-row">
                  <label>
                    Short Excerpt / Summary <span className="req">*</span>
                  </label>
                  <span className="blogp-counter">
                    {formData.excerpt.length}/160
                  </span>
                </div>
                <textarea
                  name="excerpt"
                  placeholder="Brief 1-2 sentence overview shown in blog cards, feeds, and Google previews..."
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  maxLength={160}
                  className="blogp-textarea"
                  required
                />
              </div>

              {/* WYSIWYG Content Editor */}
              <div className="blogp-form-group">
                <div className="blogp-label-row">
                  <label>
                    Full Article Content <span className="req">*</span>
                  </label>
                  <span className="blogp-counter">
                    {(formData.content || "").length} characters
                  </span>
                </div>

                <div
                  className={`blogp-wysiwyg-box ${
                    isEditorFullscreen ? "fullscreen-editor" : ""
                  }`}
                >
                  <div className="blogp-wysiwyg-toolbar">
                    <div className="toolbar-group">
                      <select
                        className="toolbar-select"
                        onChange={(e) =>
                          applyFormatting(`<${e.target.value}>`, `</${e.target.value}>`)
                        }
                        defaultValue="p"
                      >
                        <option value="p">Paragraph</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="blockquote">Quote Block</option>
                        <option value="pre">Code Block</option>
                      </select>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                      <button
                        type="button"
                        onClick={() => applyFormatting("**", "**")}
                        title="Bold (Markdown)"
                        className="toolbar-btn"
                      >
                        <Bold size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("*", "*")}
                        title="Italic"
                        className="toolbar-btn"
                      >
                        <Italic size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("<u>", "</u>")}
                        title="Underline"
                        className="toolbar-btn"
                      >
                        <Underline size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("`", "`")}
                        title="Inline Code"
                        className="toolbar-btn"
                      >
                        <Code size={15} />
                      </button>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                      <button
                        type="button"
                        onClick={() => applyFormatting("\n- ")}
                        title="Bullet List"
                        className="toolbar-btn"
                      >
                        <List size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("\n---\n")}
                        title="Divider Line"
                        className="toolbar-btn text-btn"
                      >
                        ―
                      </button>
                    </div>

                    <div className="toolbar-group ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                        title={isEditorFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        className="toolbar-btn"
                      >
                        {isEditorFullscreen ? (
                          <Minimize2 size={15} />
                        ) : (
                          <Maximize2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={contentTextareaRef}
                    name="content"
                    className="blogp-wysiwyg-textarea"
                    placeholder="Write detailed article, recipes, ingredients, instructions, and tips here..."
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="blogp-wysiwyg-statusbar">
                    <span className="status-tag">HTML / Markdown Supported</span>
                    <span className="status-count">
                      Words:{" "}
                      {formData.content
                        ? formData.content.trim().split(/\s+/).filter(Boolean).length
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: SEARCH ENGINE OPTIMIZATION (SEO) */}
          <div className="blogp-card">
            <div className="blogp-card-header">
              <div className="blogp-card-header-icon blue">
                <Globe size={18} />
              </div>
              <div className="blogp-card-header-text">
                <h2>Search Engine Optimization (SEO)</h2>
                <p>Control how your article appears in search engines like Google and Bing.</p>
              </div>
            </div>

            <div className="blogp-card-body">
              {/* Google Live Snippet Preview */}
              <div className="blogp-google-preview-box">
                <span className="preview-heading">Live Google Search Preview</span>
                <div className="google-snippet">
                  <div className="snippet-url">
                    https://grocerysathi.com › news › {formData.slug || "slug-url"}
                  </div>
                  <h3 className="snippet-title">
                    {formData.metaTitle || formData.title || "Your Blog Post Title will show here"}
                  </h3>
                  <p className="snippet-desc">
                    {formData.metaDescription ||
                      formData.excerpt ||
                      "Add a meta description to see how your article summary appears when customers search on Google."}
                  </p>
                </div>
              </div>

              {/* Meta Title */}
              <div className="blogp-form-group">
                <div className="blogp-label-row">
                  <label>Meta Title</label>
                  <span className="blogp-counter">
                    {formData.metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  name="metaTitle"
                  placeholder="e.g. 10 Essential Nutrition Tips | Grocery Sathi"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  maxLength={60}
                  className="blogp-input"
                />
              </div>

              {/* Meta Description */}
              <div className="blogp-form-group">
                <div className="blogp-label-row">
                  <label>Meta Description</label>
                  <span className="blogp-counter">
                    {formData.metaDescription.length}/150
                  </span>
                </div>
                <textarea
                  name="metaDescription"
                  placeholder="Brief summary optimized for search results..."
                  rows={2}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  maxLength={150}
                  className="blogp-textarea"
                />
              </div>

              {/* Meta Keywords */}
              <div className="blogp-form-group">
                <label>Keywords / Tags (Comma Separated)</label>
                <input
                  type="text"
                  name="metaKeywords"
                  placeholder="organic food, fresh produce, nutrition guide, cooking tips"
                  value={formData.metaKeywords}
                  onChange={handleInputChange}
                  className="blogp-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT COLUMN (32% WIDTH): STATUS, CATEGORY, FEATURED IMAGE
        ======================================================== */}
        <div className="blogp-col-side">
          {/* SIDE CARD 1: PUBLISHING & VISIBILITY */}
          <div className="blogp-card">
            <div className="blogp-card-header">
              <div className="blogp-card-header-icon amber">
                <Send size={18} />
              </div>
              <div className="blogp-card-header-text">
                <h2>Publishing Status</h2>
                <p>Set article visibility.</p>
              </div>
            </div>

            <div className="blogp-card-body">
              {/* Status Radio Chips */}
              <div className="blogp-status-chips-grid">
                {[
                  {
                    key: "Published",
                    label: "Published",
                    desc: "Live and visible to everyone",
                    badgeColor: "published",
                  },
                  {
                    key: "Draft",
                    label: "Draft",
                    desc: "Save work without publishing",
                    badgeColor: "draft",
                  },
                  {
                    key: "Scheduled",
                    label: "Scheduled",
                    desc: "Release automatically later",
                    badgeColor: "scheduled",
                  },
                ].map((st) => (
                  <div
                    key={st.key}
                    className={`blogp-status-card-opt ${
                      formData.status === st.key ? "selected" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, status: st.key })}
                  >
                    <div className="status-radio-circle">
                      {formData.status === st.key && <span className="inner-dot" />}
                    </div>
                    <div className="status-opt-text">
                      <span className={`status-label ${st.badgeColor}`}>{st.label}</span>
                      <small className="status-desc">{st.desc}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish Date */}
              <div className="blogp-form-group mt-3">
                <label>Publish Date</label>
                <div className="blogp-date-input-wrap">
                  <Calendar size={15} className="date-icon" />
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    className="blogp-input date-input"
                  />
                </div>
              </div>

              {/* Quick Submit Buttons Inside Sidebar */}
              <div className="blogp-sidebar-actions mt-4">
                <button
                  type="submit"
                  className="blogp-btn-publish w-full"
                  disabled={isSubmitting}
                >
                  <Send size={15} />
                  <span>{editingId ? "Update Article" : "Publish Article"}</span>
                </button>

                <button
                  type="button"
                  className="blogp-btn-draft w-full"
                  onClick={() => handleSubmitBlog(null, "Draft")}
                  disabled={isSubmitting}
                >
                  <Save size={15} />
                  <span>Save as Draft</span>
                </button>
              </div>
            </div>
          </div>

          {/* SIDE CARD 2: CATEGORY & TAXONOMY */}
          <div className="blogp-card">
            <div className="blogp-card-header">
              <div className="blogp-card-header-icon purple">
                <FolderTree size={18} />
              </div>
              <div className="blogp-card-header-text">
                <h2>Category</h2>
                <p>Assign category for filtering.</p>
              </div>
            </div>

            <div className="blogp-card-body">
              <div className="blogp-form-group">
                <label>
                  Article Category <span className="req">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="blogp-select"
                  required
                >
                  {(() => {
                    const opts = [...categories];
                    if (
                      formData.category &&
                      !opts.some(
                        (c) => c.name.toLowerCase() === formData.category.toLowerCase()
                      )
                    ) {
                      opts.unshift({ _id: "curr-cat", name: formData.category });
                    }
                    if (opts.length === 0) {
                      return <option value="Grocery & Health">Grocery &amp; Health</option>;
                    }
                    return opts.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ));
                  })()}
                </select>
                <span className="blogp-field-hint">
                  Dynamically synced from your store category catalog.
                </span>
              </div>
            </div>
          </div>

          {/* SIDE CARD 3: FEATURED IMAGE */}
          <div className="blogp-card">
            <div className="blogp-card-header">
              <div className="blogp-card-header-icon pink">
                <Image size={18} />
              </div>
              <div className="blogp-card-header-text">
                <h2>Featured Image</h2>
                <p>Hero banner displayed with article.</p>
              </div>
            </div>

            <div className="blogp-card-body">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />

              {formData.imagePreview ? (
                <div className="blogp-image-preview-card">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="blogp-preview-img"
                  />
                  <div className="blogp-preview-overlay">
                    <button
                      type="button"
                      className="blogp-overlay-btn"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <UploadCloud size={14} />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      className="blogp-overlay-btn remove"
                      onClick={handleRemoveImage}
                    >
                      <X size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`blogp-dropzone-box ${isDragOver ? "dragover" : ""}`}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleImageChange(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <div className="dropzone-icon-wrap">
                    <UploadCloud size={28} />
                  </div>
                  <strong className="dropzone-title">Click to upload image</strong>
                  <p className="dropzone-sub">or drag and drop here</p>
                  <span className="dropzone-specs">
                    1200 × 630 px recommended • Max 5MB (JPG, PNG, WEBP)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogPosting;

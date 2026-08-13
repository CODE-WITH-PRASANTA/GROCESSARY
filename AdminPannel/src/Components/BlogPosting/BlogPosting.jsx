import React, { useState, useRef } from 'react';
import {
  FiPlus, FiTag, FiCheckCircle, FiFileText, FiCalendar, FiTrendingUp,
  FiFilter, FiRefreshCw, FiEdit2, FiTrash2, FiUploadCloud, FiBold,
  FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiLink, FiImage, FiMoreHorizontal, FiChevronLeft, FiChevronRight, FiX, FiCheck,
  FiMaximize, FiMinimize, FiCode, FiMinus
} from 'react-icons/fi';
import './BlogPosting.css';

const BlogPosting = () => {
  // Initial Blog List State
  const [blogs, setBlogs] = useState([
    {
      id: 1,
      title: "Why Fresh Fruit is Essential for Your Daily Nutrition",
      description: "Discover how adding fresh fruits to your daily diet can boost immunity, improve skin...",
      category: "Nutrition",
      author: "Admin User",
      status: "Published",
      views: "1,245",
      date: "18 May, 2025 10:30 AM",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "How to Keep Your Fruits & Vegetables Crispy Longer",
      description: "Learn simple and effective tips to store your produce properly and extend their shelf life...",
      category: "Health Tips",
      author: "Admin User",
      status: "Published",
      views: "842",
      date: "16 May, 2025 09:15 AM",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      title: "Tasty Berries & Organic Greens for Immunity",
      description: "Boost your immune system with antioxidant-rich berries and organic leafy greens...",
      category: "Organic Food",
      author: "Admin User",
      status: "Published",
      views: "1,032",
      date: "14 May, 2025 08:45 AM",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      title: "Supercharge Your Morning Smoothie with Fresh Blueberries",
      description: "Kickstart your day with this quick and healthy blueberry smoothie recipe...",
      category: "Recipes",
      author: "Admin User",
      status: "Draft",
      views: "—",
      date: "—",
      image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      title: "Benefits of Whole Grains for a Healthier You",
      description: "Whole grains are packed with fiber, vitamins, and minerals that support overall health...",
      category: "Nutrition",
      author: "Admin User",
      status: "Scheduled",
      views: "—",
      date: "22 May, 2025 10:00 AM",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      title: "Avocado: The Superfood You Need Every Day",
      description: "From heart health to glowing skin, avocado offers amazing benefits...",
      category: "Superfoods",
      author: "Admin User",
      status: "Published",
      views: "1,987",
      date: "10 May, 2025 07:20 AM",
      image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 7,
      title: "Top 10 Nuts You Should Add to Your Diet",
      description: "Nuts are nutrient-dense and can improve heart health, brain function, and more...",
      category: "Health Tips",
      author: "Admin User",
      status: "Draft",
      views: "—",
      date: "—",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 8,
      title: "Healthy Soup Recipes for Every Season",
      description: "Warm, comforting, and healthy soup recipes you can make at home...",
      category: "Recipes",
      author: "Admin User",
      status: "Published",
      views: "1,153",
      date: "05 May, 2025 05:40 PM",
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&auto=format&fit=crop&q=80"
    }
  ]);

  // Filtering & Pagination State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Main Form State (Left Column)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    featuredImage: null,
    imagePreview: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: '',
    publishDate: ''
  });

  // Modal State (Popup for Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [modalData, setModalData] = useState({
    title: '',
    slug: '',
    category: '',
    featuredImage: null,
    imagePreview: '',
    excerpt: '',
    content: '',
    status: 'Draft',
    publishDate: ''
  });

  // Fullscreen state for TinyMCE editor
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload Handlers
  const handleImageChange = (e, isModal = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isModal) {
        setModalData(prev => ({ ...prev, featuredImage: file, imagePreview: previewUrl }));
      } else {
        setFormData(prev => ({ ...prev, featuredImage: file, imagePreview: previewUrl }));
      }
    }
  };

  // Rich Text Formatting Handler
  const applyFormatting = (tagOpen, tagClose = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  // Reset Forms
  const handleReset = () => {
    setFormData({
      title: '',
      slug: '',
      category: '',
      featuredImage: null,
      imagePreview: '',
      excerpt: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      status: '',
      publishDate: ''
    });
  };

  // Submit Main Form (Left Section)
  const handleSubmitBlog = (e, statusType) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Please enter a blog title.");
      return;
    }

    const newBlogItem = {
      id: Date.now(),
      title: formData.title,
      description: formData.excerpt || "No summary added...",
      category: formData.category || "Nutrition",
      author: "Admin User",
      status: statusType || formData.status || "Published",
      views: "0",
      date: formData.publishDate || "Just now",
      image: formData.imagePreview || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&auto=format&fit=crop&q=80"
    };

    setBlogs([newBlogItem, ...blogs]);
    handleReset();
    alert("Blog published/saved successfully!");
  };

  // Open Modal for Add New
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setModalData({
      title: '',
      slug: '',
      category: '',
      featuredImage: null,
      imagePreview: '',
      excerpt: '',
      content: '',
      status: 'Draft',
      publishDate: ''
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (blog) => {
    setModalMode('edit');
    setEditingId(blog.id);
    setModalData({
      title: blog.title,
      slug: blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: blog.category,
      featuredImage: null,
      imagePreview: blog.image,
      excerpt: blog.description,
      content: blog.description,
      status: blog.status,
      publishDate: ''
    });
    setIsModalOpen(true);
  };

  // Save Modal Form (Popup Add/Edit)
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!modalData.title) {
      alert("Title is required");
      return;
    }

    if (modalMode === 'edit') {
      setBlogs(blogs.map(b => {
        if (b.id === editingId) {
          return {
            ...b,
            title: modalData.title,
            category: modalData.category,
            description: modalData.excerpt,
            status: modalData.status,
            image: modalData.imagePreview || b.image
          };
        }
        return b;
      }));
    } else {
      const newBlog = {
        id: Date.now(),
        title: modalData.title,
        description: modalData.excerpt || "No description...",
        category: modalData.category || "Health Tips",
        author: "Admin User",
        status: modalData.status || "Published",
        views: "0",
        date: "Just now",
        image: modalData.imagePreview || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80"
      };
      setBlogs([newBlog, ...blogs]);
    }

    setIsModalOpen(false);
  };

  // Delete Blog Handler
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      setBlogs(blogs.filter(blog => blog.id !== id));
    }
  };

  // Filter Trigger Button Actions
  const handleApplyFilter = () => {
    setAppliedCategoryFilter(selectedCategoryFilter);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedCategoryFilter('All Categories');
    setAppliedCategoryFilter('All Categories');
    setCurrentPage(1);
  };

  // Filter & Pagination Logic
  const filteredBlogs = appliedCategoryFilter === 'All Categories'
    ? blogs
    : blogs.filter(blog => blog.category.toLowerCase() === appliedCategoryFilter.toLowerCase());

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="BlogPosting">

      {/* Top Action Bar */}
      <div className="BlogPosting__top-action">
        <button className="BlogPosting__add-btn" onClick={handleOpenAddModal}>
          <FiPlus /> Add New Blog
        </button>
      </div>

      {/* Top Metric Cards Row (With Hover Animations) */}
      <div className="BlogPosting__metrics-grid">
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--green"><FiTag /></div>
          <div className="BlogPosting__metric-info">
            <h3>Total Blogs</h3>
            <h2>{blogs.length}</h2>
            <p>All time published</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--blue"><FiCheckCircle /></div>
          <div className="BlogPosting__metric-info">
            <h3>Published</h3>
            <h2>{blogs.filter(b => b.status === 'Published').length}</h2>
            <p>Visible on website</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--yellow"><FiFileText /></div>
          <div className="BlogPosting__metric-info">
            <h3>Drafts</h3>
            <h2>{blogs.filter(b => b.status === 'Draft').length}</h2>
            <p>Work in progress</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--purple"><FiCalendar /></div>
          <div className="BlogPosting__metric-info">
            <h3>Scheduled</h3>
            <h2>{blogs.filter(b => b.status === 'Scheduled').length}</h2>
            <p>Coming up next</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--pink"><FiTrendingUp /></div>
          <div className="BlogPosting__metric-info">
            <h3>Total Views</h3>
            <h2>12,458</h2>
            <p>Across all blogs</p>
          </div>
        </div>
      </div>

      {/* Main 50/50 Layout Section - Equal Heights */}
      <div className="BlogPosting__main-layout">
        
        {/* Left Section: Scrollable Form with Invisible Scrollbar */}
        <div className="BlogPosting__form-section">
          <div className="BlogPosting__section-header">
            <h3>Add / Edit Blog</h3>
            <p>Create a new blog or update an existing one.</p>
          </div>

          <form className="BlogPosting__form" onSubmit={(e) => handleSubmitBlog(e)}>
            <div className="BlogPosting__input-group">
              <label>Blog Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter blog title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={120}
              />
              <span className="BlogPosting__char-count">{formData.title.length}/120 characters</span>
            </div>

            <div className="BlogPosting__input-group">
              <label>Slug (URL) *</label>
              <input
                type="text"
                name="slug"
                placeholder="enter-blog-slug"
                value={formData.slug}
                onChange={handleInputChange}
              />
              <span className="BlogPosting__hint">URL will be: yoursite.com/blog/enter-blog-slug</span>
            </div>

            <div className="BlogPosting__input-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="">Select category</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Health Tips">Health Tips</option>
                <option value="Organic Food">Organic Food</option>
                <option value="Recipes">Recipes</option>
                <option value="Superfoods">Superfoods</option>
              </select>
            </div>

            <div className="BlogPosting__input-group">
              <label>Featured Image *</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleImageChange(e, false)}
              />
              <div className="BlogPosting__dropzone" onClick={() => fileInputRef.current.click()}>
                {formData.imagePreview ? (
                  <div className="BlogPosting__preview-container">
                    <img src={formData.imagePreview} alt="Preview" className="BlogPosting__uploaded-preview" />
                    <span>Click or drag to change image</span>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="BlogPosting__upload-icon" />
                    <p>Click to upload image<br />or drag and drop</p>
                    <span>Recommended: 1200 x 630px (Max 2MB)<br />JPG, PNG, WEBP</span>
                  </>
                )}
              </div>
            </div>

            <div className="BlogPosting__input-group">
              <label>Excerpt *</label>
              <textarea
                name="excerpt"
                placeholder="Write a short summary..."
                rows="3"
                value={formData.excerpt}
                onChange={handleInputChange}
                maxLength={160}
              ></textarea>
              <span className="BlogPosting__char-count">{formData.excerpt.length}/160</span>
            </div>

            {/* TinyMCE-style Professional Editor Box */}
            <div className={`BlogPosting__tinymce-editor ${isEditorFullscreen ? 'BlogPosting__tinymce-editor--fullscreen' : ''}`}>
              <div className="BlogPosting__tinymce-menubar">
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Insert</span>
                <span>Format</span>
                <span>Tools</span>
                <span>Table</span>
              </div>
              
              <div className="BlogPosting__tinymce-toolbar">
                <div className="BlogPosting__tinymce-group">
                  <select 
                    className="BlogPosting__tinymce-select"
                    onChange={(e) => applyFormatting(`<${e.target.value}>`, `</${e.target.value}>`)}
                  >
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="blockquote">Quote</option>
                    <option value="pre">Code Block</option>
                  </select>
                </div>

                <div className="BlogPosting__tinymce-divider"></div>

                <div className="BlogPosting__tinymce-group">
                  <button type="button" onClick={() => applyFormatting('**', '**')} title="Bold (Ctrl+B)"><FiBold /></button>
                  <button type="button" onClick={() => applyFormatting('*', '*')} title="Italic (Ctrl+I)"><FiItalic /></button>
                  <button type="button" onClick={() => applyFormatting('<u>', '</u>')} title="Underline (Ctrl+U)"><FiUnderline /></button>
                  <button type="button" onClick={() => applyFormatting('`', '`')} title="Inline Code"><FiCode /></button>
                </div>

                <div className="BlogPosting__tinymce-divider"></div>

                <div className="BlogPosting__tinymce-group">
                  <button type="button" onClick={() => applyFormatting('\n- ')} title="Bullet List"><FiList /></button>
                  <button type="button" onClick={() => applyFormatting('\n1. ')} title="Numbered List"><FiList /></button>
                </div>

                <div className="BlogPosting__tinymce-divider"></div>

                <div className="BlogPosting__tinymce-group">
                  <button type="button" onClick={() => applyFormatting('<div align="left">', '</div>')} title="Align Left"><FiAlignLeft /></button>
                  <button type="button" onClick={() => applyFormatting('<div align="center">', '</div>')} title="Align Center"><FiAlignCenter /></button>
                  <button type="button" onClick={() => applyFormatting('<div align="right">', '</div>')} title="Align Right"><FiAlignRight /></button>
                </div>

                <div className="BlogPosting__tinymce-divider"></div>

                <div className="BlogPosting__tinymce-group">
                  <button type="button" onClick={() => applyFormatting('[Link Text](', ')')} title="Insert Link"><FiLink /></button>
                  <button type="button" onClick={() => applyFormatting('![Alt Text](', ')')} title="Insert Image"><FiImage /></button>
                  <button type="button" onClick={() => applyFormatting('\n---\n')} title="Horizontal Line"><FiMinus /></button>
                </div>

                <div className="BlogPosting__tinymce-group BlogPosting__tinymce-group--right">
                  <button 
                    type="button" 
                    onClick={() => setIsEditorFullscreen(!isEditorFullscreen)} 
                    title={isEditorFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isEditorFullscreen ? <FiMinimize /> : <FiMaximize />}
                  </button>
                </div>
              </div>

              <textarea
                ref={contentTextareaRef}
                name="content"
                className="BlogPosting__tinymce-textarea"
                placeholder="Write your blog content here using rich formatting..."
                value={formData.content}
                onChange={handleInputChange}
                maxLength={10000}
              ></textarea>
              <div className="BlogPosting__tinymce-statusbar">
                <span>p</span>
                <span>{formData.content.length}/10000 characters</span>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="BlogPosting__seo-section">
              <h4>SEO Settings</h4>
              <div className="BlogPosting__input-group">
                <label>Meta Title</label>
                <div className="BlogPosting__dual-input">
                  <input type="text" name="metaTitle" placeholder="Enter meta title" value={formData.metaTitle} onChange={handleInputChange} />
                  <span>0/60</span>
                </div>
              </div>
              <div className="BlogPosting__input-group">
                <label>Meta Description</label>
                <div className="BlogPosting__dual-input">
                  <input type="text" name="metaDescription" placeholder="Enter meta description" value={formData.metaDescription} onChange={handleInputChange} />
                  <span>0/150</span>
                </div>
              </div>
              <div className="BlogPosting__input-group">
                <label>Meta Keywords</label>
                <div className="BlogPosting__dual-input">
                  <input type="text" name="metaKeywords" placeholder="Enter keywords separated by commas" value={formData.metaKeywords} onChange={handleInputChange} />
                  <span>0/150</span>
                </div>
              </div>
            </div>

            {/* Status & Date */}
            <div className="BlogPosting__row-inputs">
              <div className="BlogPosting__input-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="">Select status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="BlogPosting__input-group">
                <label>Publish Date *</label>
                <div className="BlogPosting__date-input-wrapper">
                  <input type="date" name="publishDate" value={formData.publishDate} onChange={handleInputChange} />
                  <FiCalendar className="BlogPosting__input-calendar-icon" />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="BlogPosting__form-actions">
              <button type="button" className="BlogPosting__reset-btn" onClick={handleReset}>Reset</button>
              <button type="button" className="BlogPosting__draft-btn" onClick={(e) => handleSubmitBlog(e, 'Draft')}>Save as Draft</button>
              <button type="submit" className="BlogPosting__publish-btn"><FiCheck /> Publish Blog</button>
            </div>
          </form>
        </div>

        {/* Right Section: Blogs Table */}
        <div className="BlogPosting__table-section">
          <div className="BlogPosting__table-header-row">
            <div className="BlogPosting__table-title-area">
              <h3>All Blogs</h3>
              <p>Manage and organize all your blog posts.</p>
            </div>
            <div className="BlogPosting__table-controls">
              <select
                className="BlogPosting__filter-select"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Health Tips">Health Tips</option>
                <option value="Organic Food">Organic Food</option>
                <option value="Recipes">Recipes</option>
                <option value="Superfoods">Superfoods</option>
              </select>
              <button type="button" className="BlogPosting__control-btn" onClick={handleApplyFilter}><FiFilter /> Filter</button>
              <button type="button" className="BlogPosting__control-btn" onClick={handleResetFilter} title="Reset Filter"><FiRefreshCw /></button>
            </div>
          </div>

          <div className="BlogPosting__table-container">
            <table className="BlogPosting__blogs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBlogs.length > 0 ? (
                  currentBlogs.map((blog, index) => (
                    <tr key={blog.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td className="BlogPosting__title-cell">
                        <img src={blog.image} alt="" className="BlogPosting__row-thumb" />
                        <div>
                          <strong>{blog.title}</strong>
                          <p>{blog.description}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`BlogPosting__badge BlogPosting__badge--category-${(blog.category || 'Nutrition').toLowerCase().replace(/ /g, '-')}`}>
                          {blog.category}
                        </span>
                      </td>
                      <td className="BlogPosting__author-cell">
                        <span className="BlogPosting__author-avatar">👤</span> {blog.author}
                      </td>
                      <td>
                        <span className={`BlogPosting__badge BlogPosting__badge--status-${(blog.status || 'draft').toLowerCase()}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{blog.views}</td>
                      <td className="BlogPosting__date-cell">{blog.date}</td>
                      <td>
                        <div className="BlogPosting__action-btns">
                          <button type="button" className="BlogPosting__action-edit" onClick={() => handleOpenEditModal(blog)} title="Edit">
                            <FiEdit2 />
                          </button>
                          <button type="button" className="BlogPosting__action-delete" onClick={() => handleDelete(blog.id)} title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No blogs found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="BlogPosting__table-footer">
            <span>Showing {filteredBlogs.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredBlogs.length)} of {filteredBlogs.length} entries</span>
            <div className="BlogPosting__pagination">
              <button
                type="button"
                className="BlogPosting__page-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  type="button"
                  key={num}
                  className={`BlogPosting__page-btn ${currentPage === num ? 'BlogPosting__page-btn--active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="BlogPosting__page-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Bottom Summary Cards */}
          <div className="BlogPosting__bottom-metrics-grid">
            <div className="BlogPosting__bottom-card">
              <div className="BlogPosting__bottom-card-header">
                <span>Total Views</span>
                <FiTrendingUp className="BlogPosting__icon--green" />
              </div>
              <h3>12,458</h3>
              <p><span className="BlogPosting__trend-up">+16.4%</span> vs last month</p>
            </div>
            <div className="BlogPosting__bottom-card">
              <div className="BlogPosting__bottom-card-header">
                <span>Avg. Read Time</span>
                <FiTrendingUp className="BlogPosting__icon--purple" />
              </div>
              <h3>04:32 min</h3>
              <p><span className="BlogPosting__trend-up">+3.2%</span> vs last month</p>
            </div>
            <div className="BlogPosting__bottom-card">
              <div className="BlogPosting__bottom-card-header">
                <span>Engagement Rate</span>
                <FiTrendingUp className="BlogPosting__icon--orange" />
              </div>
              <h3>62.5%</h3>
              <p><span className="BlogPosting__trend-up">+12.7%</span> vs last month</p>
            </div>
            <div className="BlogPosting__bottom-card BlogPosting__bottom-card--highlight">
              <div className="BlogPosting__bottom-card-header">
                <span>Most Popular</span>
                <span className="BlogPosting__trophy-icon">🏆</span>
              </div>
              <h3>Fresh Fruit Benefits</h3>
              <p>1,987 views</p>
            </div>
          </div>
        </div>

      </div>

      {/* Popup Modal for Add / Edit Blog */}
      {isModalOpen && (
        <div className="BlogPosting__modal-overlay">
          <div className="BlogPosting__modal-content">
            <div className="BlogPosting__modal-header">
              <h3>{modalMode === 'edit' ? 'Edit Blog Post' : 'Add New Blog'}</h3>
              <button type="button" className="BlogPosting__modal-close" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="BlogPosting__input-group">
                <label>Blog Title *</label>
                <input
                  type="text"
                  name="title"
                  value={modalData.title}
                  onChange={handleModalInputChange}
                  placeholder="Enter title..."
                  required
                />
              </div>

              <div className="BlogPosting__input-group">
                <label>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={modalData.slug}
                  onChange={handleModalInputChange}
                  placeholder="blog-slug-url"
                  required
                />
              </div>

              <div className="BlogPosting__input-group">
                <label>Category *</label>
                <select name="category" value={modalData.category} onChange={handleModalInputChange}>
                  <option value="">Select category</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Health Tips">Health Tips</option>
                  <option value="Organic Food">Organic Food</option>
                  <option value="Recipes">Recipes</option>
                  <option value="Superfoods">Superfoods</option>
                </select>
              </div>

              <div className="BlogPosting__input-group">
                <label>Featured Image *</label>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, true)}
                />
                <div className="BlogPosting__dropzone" onClick={() => modalFileInputRef.current.click()}>
                  {modalData.imagePreview ? (
                    <div className="BlogPosting__preview-container">
                      <img src={modalData.imagePreview} alt="Preview" className="BlogPosting__uploaded-preview" />
                      <span>Click to replace image</span>
                    </div>
                  ) : (
                    <>
                      <FiUploadCloud className="BlogPosting__upload-icon" />
                      <p>Click to upload image</p>
                    </>
                  )}
                </div>
              </div>

              <div className="BlogPosting__input-group">
                <label>Excerpt / Summary *</label>
                <textarea
                  name="excerpt"
                  rows="3"
                  value={modalData.excerpt}
                  onChange={handleModalInputChange}
                  placeholder="Write a short summary..."
                ></textarea>
              </div>

              <div className="BlogPosting__input-group">
                <label>Status *</label>
                <select name="status" value={modalData.status} onChange={handleModalInputChange}>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>

              <div className="BlogPosting__modal-actions">
                <button type="button" className="BlogPosting__reset-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="BlogPosting__publish-btn">
                  {modalMode === 'edit' ? 'Save Changes' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BlogPosting;
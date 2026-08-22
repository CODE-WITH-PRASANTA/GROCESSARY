import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiTag, FiCheckCircle, FiFileText, FiCalendar, FiTrendingUp,
  FiFilter, FiRefreshCw, FiEdit2, FiTrash2, FiUploadCloud, FiBold,
  FiItalic, FiUnderline, FiList, FiAlignCenter,
  FiChevronLeft, FiChevronRight, FiCheck,
  FiMaximize, FiMinimize, FiCode, FiMinus, FiExternalLink
} from 'react-icons/fi';
import './BlogPosting.css';

const API_BASE_URL = 'http://localhost:5000/api/blogs';

const BlogPosting = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Pagination
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Nutrition',
    featuredImage: null,
    imagePreview: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'Published',
    publishDate: ''
  });

  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const fileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Load all blogs for table
  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const url = appliedCategoryFilter && appliedCategoryFilter !== 'All Categories'
        ? `${API_BASE_URL}?category=${encodeURIComponent(appliedCategoryFilter)}`
        : API_BASE_URL;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setBlogs(json.data || []);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error('Error loading blogs:', err.message);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [appliedCategoryFilter]);

  // Read URL id param for auto-populating edit form
  useEffect(() => {
    if (urlId) {
      const fetchBlogDetails = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/${urlId}`);
          const json = await res.json();
          if (json.success && json.data) {
            const blog = json.data;
            setEditingId(blog._id);
            setFormData({
              title: blog.title || '',
              slug: blog.slug || '',
              category: blog.category || 'Nutrition',
              featuredImage: null,
              imagePreview: blog.image || '',
              excerpt: blog.excerpt || '',
              content: blog.content || '',
              metaTitle: blog.metaTitle || '',
              metaDescription: blog.metaDescription || '',
              metaKeywords: blog.metaKeywords || '',
              status: blog.status || 'Published',
              publishDate: blog.publishDate ? blog.publishDate.substring(0, 10) : ''
            });
          }
        } catch (err) {
          console.error('Error fetching blog details:', err.message);
        }
      };
      fetchBlogDetails();
    }
  }, [urlId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !editingId) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        featuredImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const applyFormatting = (tagOpen, tagClose = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || '';
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Nutrition',
      featuredImage: null,
      imagePreview: '',
      excerpt: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      status: 'Published',
      publishDate: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (urlId) navigate('/blog');
  };

  const handleEditClick = (blog) => {
    navigate(`/blog/edit/${blog._id}`);
  };

  // Navigates directly to /news/:id
  const handleReadMoreNavigation = (blogId) => {
    navigate(`/news/${blogId}`);
  };

  const handleSubmitBlog = async (e, forcedStatus) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a blog title.');
      return;
    }

    try {
      const payload = {
        ...formData,
        status: forcedStatus || formData.status || 'Published'
      };

      const data = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === 'featuredImage') {
          if (payload[key]) data.append('featuredImage', payload[key]);
        } else if (payload[key] !== null && payload[key] !== undefined) {
          data.append(key, payload[key]);
        }
      });

      if (editingId) {
        const res = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          body: data
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to update blog');
        alert('Blog updated successfully!');
      } else {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          body: data
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to publish blog');
        alert('Blog published successfully!');
      }

      handleReset();
      loadBlogs();
    } catch (error) {
      alert(`Error saving blog: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to delete blog');
        loadBlogs();
        if (editingId === id) handleReset();
      } catch (error) {
        alert(`Error deleting blog: ${error.message}`);
      }
    }
  };

  const handleApplyFilter = () => {
    setAppliedCategoryFilter(selectedCategoryFilter);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedCategoryFilter('All Categories');
    setAppliedCategoryFilter('All Categories');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(blogs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="BlogPosting">
      {/* Top Metric Cards */}

      {/* Top Action Bar */}
      
     
      {/* Top Metric Cards Row (With Hover Animations) */}
      <div className="BlogPosting__metrics-grid">
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--green"><FiTag /></div>
          <div className="BlogPosting__metric-info">
            <h3>Total Blogs</h3>
            <h2>{blogs.length}</h2>
            <p>All database records</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--blue"><FiCheckCircle /></div>
          <div className="BlogPosting__metric-info">
            <h3>Published</h3>
            <h2>{blogs.filter(b => b.status === 'Published').length}</h2>
            <p>Visible on news feed</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--yellow"><FiFileText /></div>
          <div className="BlogPosting__metric-info">
            <h3>Drafts</h3>
            <h2>{blogs.filter(b => b.status === 'Draft').length}</h2>
            <p>Unpublished work</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--purple"><FiCalendar /></div>
          <div className="BlogPosting__metric-info">
            <h3>Scheduled</h3>
            <h2>{blogs.filter(b => b.status === 'Scheduled').length}</h2>
            <p>Upcoming queue</p>
          </div>
        </div>
        <div className="BlogPosting__metric-card">
          <div className="BlogPosting__metric-icon BlogPosting__metric-icon--pink"><FiTrendingUp /></div>
          <div className="BlogPosting__metric-info">
            <h3>Total Views</h3>
            <h2>{blogs.reduce((acc, curr) => acc + (curr.views || 0), 0)}</h2>
            <p>Across all published posts</p>
          </div>
        </div>
      </div>

      {/* Main 50/50 Layout Section */}
      <div className="BlogPosting__main-layout">
        
        {/* Left Section: Form */}
        <div className="BlogPosting__form-section">
          <div className="BlogPosting__section-header">
            <h3>{editingId ? 'Edit Blog Post' : 'Add New Blog'}</h3>
            <p>{editingId ? 'Updating blog record in real-time.' : 'Create and broadcast fresh recipes and tips.'}</p>
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
                required
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
                required
              />
              <span className="BlogPosting__hint">URL endpoint: /news/{formData.slug || 'slug'}</span>
            </div>

            <div className="BlogPosting__input-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="Nutrition">Nutrition</option>
                <option value="news">News</option>
                <option value="health">Health</option>
                <option value="recipes">Recipes</option>
                <option value="Health Tips">Health Tips</option>
                <option value="Organic Food">Organic Food</option>
                <option value="Superfoods">Superfoods</option>
                <option value="Organic Living">Organic Living</option>
              </select>
            </div>

            <div className="BlogPosting__input-group">
              <label>Featured Image</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="BlogPosting__dropzone" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                {formData.imagePreview ? (
                  <div className="BlogPosting__preview-container">
                    <img src={formData.imagePreview} alt="Preview" className="BlogPosting__uploaded-preview" />
                    <span>Click to change image</span>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="BlogPosting__upload-icon" />
                    <p>Click to upload image<br />or drag and drop</p>
                    <span>Recommended: 1200 x 630px (Max 5MB)<br />JPG, PNG, WEBP</span>
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
                required
              ></textarea>
              <span className="BlogPosting__char-count">{formData.excerpt.length}/160</span>
            </div>

            {/* TinyMCE-Style Editor */}
            <div className={`BlogPosting__tinymce-editor ${isEditorFullscreen ? 'BlogPosting__tinymce-editor--fullscreen' : ''}`}>
              <div className="BlogPosting__tinymce-menubar">
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Insert</span>
                <span>Format</span>
                <span>Tools</span>
              </div>
              
              <div className="BlogPosting__tinymce-toolbar">
                <div className="BlogPosting__tinymce-group">
                  <select 
                    className="BlogPosting__tinymce-select"
                    onChange={(e) => applyFormatting(`<${e.target.value}>`, `</${e.target.value}>`)}
                    defaultValue="p"
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
                  <button type="button" onClick={() => applyFormatting('**', '**')} title="Bold"><FiBold /></button>
                  <button type="button" onClick={() => applyFormatting('*', '*')} title="Italic"><FiItalic /></button>
                  <button type="button" onClick={() => applyFormatting('<u>', '</u>')} title="Underline"><FiUnderline /></button>
                  <button type="button" onClick={() => applyFormatting('`', '`')} title="Inline Code"><FiCode /></button>
                </div>

                <div className="BlogPosting__tinymce-divider"></div>

                <div className="BlogPosting__tinymce-group">
                  <button type="button" onClick={() => applyFormatting('\n- ')} title="Bullet List"><FiList /></button>
                  <button type="button" onClick={() => applyFormatting('<div align="center">', '</div>')} title="Center"><FiAlignCenter /></button>
                  <button type="button" onClick={() => applyFormatting('\n---\n')} title="Line"><FiMinus /></button>
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
                placeholder="Write full blog article details..."
                value={formData.content}
                onChange={handleInputChange}
              ></textarea>
              <div className="BlogPosting__tinymce-statusbar">
                <span>p</span>
                <span>{(formData.content || '').length} characters</span>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="BlogPosting__seo-section">
              <h4>SEO Settings</h4>
              <div className="BlogPosting__input-group">
                <label>Meta Title</label>
                <div className="BlogPosting__dual-input">
                  <input type="text" name="metaTitle" placeholder="Enter meta title" value={formData.metaTitle} onChange={handleInputChange} />
                  <span>{formData.metaTitle.length}/60</span>
                </div>
              </div>
              <div className="BlogPosting__input-group">
                <label>Meta Description</label>
                <div className="BlogPosting__dual-input">
                  <input type="text" name="metaDescription" placeholder="Enter meta description" value={formData.metaDescription} onChange={handleInputChange} />
                  <span>{formData.metaDescription.length}/150</span>
                </div>
              </div>
            </div>

            {/* Status & Date */}
            <div className="BlogPosting__row-inputs">
              <div className="BlogPosting__input-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="BlogPosting__input-group">
                <label>Publish Date</label>
                <div className="BlogPosting__date-input-wrapper">
                  <input type="date" name="publishDate" value={formData.publishDate} onChange={handleInputChange} />
                  <FiCalendar className="BlogPosting__input-calendar-icon" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="BlogPosting__form-actions">
              <button type="button" className="BlogPosting__reset-btn" onClick={handleReset}>
                {editingId ? 'Cancel Edit' : 'Reset'}
              </button>
              <button type="button" className="BlogPosting__draft-btn" onClick={() => handleSubmitBlog(null, 'Draft')}>
                Save as Draft
              </button>
              <button type="submit" className="BlogPosting__publish-btn">
                <FiCheck /> {editingId ? 'Update Post' : 'Publish Blog'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Blogs Table */}
        <div className="BlogPosting__table-section">
          <div className="BlogPosting__table-header-row">
            <div className="BlogPosting__table-title-area">
              <h3>All Blogs</h3>
              <p>Database entries synced in real-time.</p>
            </div>
            <div className="BlogPosting__table-controls">
              <select
                className="BlogPosting__filter-select"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="Nutrition">Nutrition</option>
                <option value="news">News</option>
                <option value="health">Health</option>
                <option value="recipes">Recipes</option>
                <option value="Organic Food">Organic Food</option>
                <option value="Organic Living">Organic Living</option>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading blogs...</td></tr>
                ) : currentBlogs.length > 0 ? (
                  currentBlogs.map((blog, index) => (
                    <tr key={blog._id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td className="BlogPosting__title-cell">
                        <img 
                          src={blog.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80"} 
                          alt="" 
                          className="BlogPosting__row-thumb" 
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div>
                          <strong>{blog.title}</strong>
                          <p>{blog.excerpt}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`BlogPosting__badge BlogPosting__badge--category-${(blog.category || 'news').toLowerCase().replace(/ /g, '-')}`}>
                          {blog.category}
                        </span>
                      </td>
                      <td>
                        <span className={`BlogPosting__badge BlogPosting__badge--status-${(blog.status || 'Draft').toLowerCase()}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>
                        <div className="BlogPosting__action-btns">
                          {/* Navigate to /news/:id for reading the blog */}
                          <button 
                            type="button" 
                            className="BlogPosting__action-view" 
                            onClick={() => handleReadMoreNavigation(blog._id)} 
                            title="Preview Read More"
                          >
                            <FiExternalLink />
                          </button>
                          <button type="button" className="BlogPosting__action-edit" onClick={() => handleEditClick(blog)} title="Edit">
                            <FiEdit2 />
                          </button>
                          <button type="button" className="BlogPosting__action-delete" onClick={() => handleDelete(blog._id)} title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No blogs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="BlogPosting__table-footer">
            <span>Showing {blogs.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, blogs.length)} of {blogs.length} entries</span>
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

        </div>

      </div>
    </div>
  );
};

export default BlogPosting;
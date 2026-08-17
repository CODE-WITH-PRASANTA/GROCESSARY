import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiList, 
  FiMoreVertical, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiEyeOff,
  FiChevronRight
} from 'react-icons/fi';
import './BlogManagement.css';

const API_BASE_URL = 'http://localhost:5000/api/blogs';

const BlogManagement = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_BASE_URL);
      const json = await res.json();
      if (json.success) setBlogs(json.data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(prev => (prev === id ? null : id));
  };

  // Navigates directly to BlogPosting with the specific ID
  const handleEdit = (id) => {
    setActiveMenuId(null);
    navigate(`/blog/edit/${id}`);
  };

  const handleDelete = async (id) => {
    setActiveMenuId(null);
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) loadBlogs();
      } catch (err) {
        alert(`Error deleting blog: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) loadBlogs();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="BlogManagement" aria-labelledby="BlogManagement-section-title">
      <div className="BlogManagement-top-row">
        <div className="BlogManagement-header">
          <span className="BlogManagement-subtitle">Our Journal</span>
          <h2 id="BlogManagement-section-title" className="BlogManagement-title">Blog & Articles</h2>
          <p className="BlogManagement-section-desc">
            Stay updated with fresh produce tips, healthy recipes, and organic grocery insights.
          </p>
        </div>

        <div className="BlogManagement-view-toggle">
          <button
            type="button"
            className={`BlogManagement-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <FiGrid className="BlogManagement-toggle-icon" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            className={`BlogManagement-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <FiList className="BlogManagement-toggle-icon" />
            <span>List</span>
          </button>
        </div>
      </div>

      <div className="BlogManagement-content-wrapper" ref={containerRef}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading posts...</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No blogs available. Add posts using the Blog Posting form.
          </div>
        ) : (
          <div className={`BlogManagement-container BlogManagement-container--${viewMode}`}>
            {blogs.map((item) => (
              <article
                className={`BlogManagement-card BlogManagement-card--${viewMode}`}
                key={item._id}
              >
                <div className="BlogManagement-card-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="BlogManagement-card-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop";
                    }}
                  />
                  <span className="BlogManagement-card-tag">{item.category}</span>
                </div>

                <div className="BlogManagement-card-body">
                  <div className="BlogManagement-status-row">
                    <span className={`BlogManagement-status-badge BlogManagement-status-badge--${(item.status || 'draft').toLowerCase()}`}>
                      {item.status || 'Draft'}
                    </span>
                  </div>

                  <div className="BlogManagement-card-text">
                    <h3 className="BlogManagement-card-title">{item.title}</h3>
                    <p className="BlogManagement-card-description">{item.excerpt}</p>
                  </div>

                  <div className="BlogManagement-card-footer">
                    <a href="#read-more" className="BlogManagement-card-button">
                      Read more <FiChevronRight className="BlogManagement-card-button-icon" />
                    </a>
                    <div className="BlogManagement-card-meta">
                      <span className="BlogManagement-card-author">{item.author || 'Admin'},</span>
                      <time className="BlogManagement-card-date">{formatDate(item.publishDate || item.createdAt)}</time>
                    </div>
                  </div>

                  <div className="BlogManagement-actions-menu">
                    <button
                      type="button"
                      className="BlogManagement-menu-trigger"
                      onClick={(e) => toggleMenu(e, item._id)}
                      aria-label="Options"
                    >
                      <FiMoreVertical />
                    </button>

                    {activeMenuId === item._id && (
                      <div className="BlogManagement-dropdown-menu">
                        <button
                          type="button"
                          className="BlogManagement-dropdown-item"
                          onClick={() => handleEdit(item._id)}
                        >
                          <FiEdit2 className="BlogManagement-dropdown-icon" />
                          <span>Edit</span>
                        </button>

                        {item.status === 'Published' ? (
                          <button
                            type="button"
                            className="BlogManagement-dropdown-item"
                            onClick={() => handleStatusChange(item._id, 'Unpublished')}
                          >
                            <FiEyeOff className="BlogManagement-dropdown-icon" />
                            <span>Unpublish</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="BlogManagement-dropdown-item"
                            onClick={() => handleStatusChange(item._id, 'Published')}
                          >
                            <FiCheckCircle className="BlogManagement-dropdown-icon" />
                            <span>Publish</span>
                          </button>
                        )}

                        <div className="BlogManagement-dropdown-divider"></div>

                        <button
                          type="button"
                          className="BlogManagement-dropdown-item BlogManagement-dropdown-item--delete"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FiTrash2 className="BlogManagement-dropdown-icon" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogManagement;
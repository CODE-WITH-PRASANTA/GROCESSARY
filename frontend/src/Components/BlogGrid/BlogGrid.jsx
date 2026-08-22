import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogGrid.css';

const API_BASE_URL = 'http://localhost:5000/api/blogs';

const BlogGrid = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 4;

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}?status=Published`);
      const json = await res.json();
      if (json.success) {
        setBlogs(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching blog grid:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const totalPages = Math.ceil(blogs.length / itemsPerPage) || 1;
  const currentBlogs = blogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleReadMore = (id) => {
    navigate(`/news/${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="blog-grid-page">
      {/* Hero Banner */}
      <section className="blog-grid-breadcrumb" aria-label="News Breadcrumb Banner">
        <div className="blog-grid-breadcrumb-container">
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-grid-back-link" title="Return to Home">
              <span className="blog-grid-arrow-circle" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </span>
              <span className="blog-grid-back-text">Back to Home</span>
            </a>
          </nav>

          <h1 className="blog-grid-banner-title">News &amp; Blog</h1>
          <p className="blog-grid-banner-desc">
            Explore expert grocery guides, nutrition tips, and farm-fresh recipes from Grocery Sathi.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="blog-grid-main">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading articles...</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>No articles published yet.</div>
        ) : (
          <div className="blog-grid-cards-wrapper">
            {currentBlogs.map((blog) => (
              <article key={blog._id} className="blog-grid-card">
                <div className="blog-grid-image-wrapper">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="blog-grid-card-img" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop";
                    }}
                  />
                  <span className="blog-grid-tag">{blog.category}</span>
                </div>

                <div className="blog-grid-card-content">
                  <h2 className="blog-grid-card-title">{blog.title}</h2>
                  <p className="blog-grid-card-desc">{blog.excerpt}</p>

                  <div className="blog-grid-card-footer">
                    <button 
                      className="blog-grid-read-more-btn"
                      onClick={() => handleReadMore(blog._id)}
                      aria-label={`Read more about ${blog.title}`}
                    >
                      <span>Read more</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    <div className="blog-grid-author-info">
                      <span className="blog-grid-author">{blog.author || 'Grocery Sathi'}</span>
                      <span className="blog-grid-date">{formatDate(blog.publishDate || blog.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {blogs.length > itemsPerPage && (
          <nav className="blog-grid-pagination" aria-label="Blog Grid Pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`blog-grid-page-num ${currentPage === num ? 'active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="blog-grid-page-next"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </nav>
        )}
      </main>
    </div>
  );
};

export default BlogGrid;
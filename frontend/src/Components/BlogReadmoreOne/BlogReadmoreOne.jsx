import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogReadmoreOne.css';

const API_BASE_URL = 'http://localhost:5000/api/blogs';

const BlogReadmoreOne = () => {
  // Reads dynamic ID from URL e.g. /news/6a7edbfca9b63324310d3fba
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Fetch active blog by ID and load related articles
  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch current article details by ID
        const res = await fetch(`${API_BASE_URL}/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setBlog(json.data);
        } else {
          setBlog(null);
        }

        // 2. Fetch related published articles
        const relRes = await fetch(`${API_BASE_URL}?status=Published`);
        const relJson = await relRes.json();
        if (relJson.success && relJson.data) {
          setRelatedArticles(relJson.data.filter(item => item._id !== id).slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching blog read more:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticleData();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });
      const json = await res.json();
      if (json.success) {
        alert('Thank you for your comment! Your feedback has been recorded.');
        setCommentForm({ name: '', email: '', message: '' });
        setBlog(prev => ({
          ...prev,
          comments: json.data || prev.comments
        }));
      }
    } catch (err) {
      alert(`Error submitting comment: ${err.message}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title || 'Grocery Sathi Blog',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fallbackImage = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop";

  if (isLoading) {
    return <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Loading article...</div>;
  }

  if (!blog) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
        <h2>Article with ID: {id} not found.</h2>
        <button 
          onClick={() => navigate('/blog')}
          style={{ marginTop: '16px', padding: '10px 20px', cursor: 'pointer', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px' }}
        >
          Back to Blog Management
        </button>
      </div>
    );
  }

  return (
    <div className="blog-readmore-one-page">
      {/* Hero Banner with Blog's Image */}
      <section
        className="blog-readmore-one-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 42, 39, 0.8), rgba(16, 42, 39, 0.8)), url(${blog.image || fallbackImage})`
        }}
        aria-label="Article Hero Banner"
      >
        <div className="blog-readmore-one-hero-container">
          <nav aria-label="Breadcrumb Navigation">
            <button 
              type="button" 
              onClick={() => navigate('/blog')} 
              className="blog-readmore-one-back-btn" 
              title="Back to Blog Management"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span className="blog-readmore-one-arrow-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </span>
              <span>Back to Blogs</span>
            </button>
          </nav>

          <div className="blog-readmore-one-hero-meta">
            <span className="blog-readmore-one-badge-featured">{blog.status}</span>
            <button className="blog-readmore-one-meta-pill" type="button">
              Category: <strong>{blog.category}</strong>
            </button>
            <button className="blog-readmore-one-meta-pill" type="button">
              Date: <strong>{formatDate(blog.publishDate || blog.createdAt)}</strong>
            </button>
          </div>

          <h1 className="blog-readmore-one-hero-title">{blog.title}</h1>
          <p className="blog-readmore-one-hero-desc">{blog.excerpt}</p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="blog-readmore-one-main">
        <div className="blog-readmore-one-container">
          {/* Article Column */}
          <article className="blog-readmore-one-content">
            <div className="blog-readmore-one-author-bar">
              <div className="blog-readmore-one-meta-group">
                <span className="blog-readmore-one-author">{blog.author || 'Grocery Sathi'}</span>
                <span className="blog-readmore-one-meta-item">
                  Category: <strong>{blog.category}</strong>
                </span>
                <span className="blog-readmore-one-meta-item">
                  Date: <strong>{formatDate(blog.publishDate || blog.createdAt)}</strong>
                </span>
              </div>

              <button className="blog-readmore-one-share-btn" onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span>Share</span>
              </button>
            </div>

            <h2 className="blog-readmore-one-article-title">{blog.title}</h2>

            <div className="blog-readmore-one-feature-img-wrapper">
              <img
                src={blog.image || fallbackImage}
                alt={blog.title}
                className="blog-readmore-one-feature-img"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            </div>

            {/* Render formatted content */}
            <div 
              className="blog-readmore-one-text" 
              style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: blog.content || `<p>${blog.excerpt}</p>` }}
            />

            {/* Tags */}
            <div className="blog-readmore-one-tags">
              <strong>Category:</strong>
              <span className="blog-readmore-one-tag-item">{blog.category}</span>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="blog-readmore-one-sidebar">
            {/* Related Articles */}
            <div className="blog-readmore-one-related-block">
              <h3 className="blog-readmore-one-sidebar-title">Related articles</h3>

              {relatedArticles.length > 0 ? (
                relatedArticles.map((rel) => (
                  <div key={rel._id} className="blog-readmore-one-related-card">
                    <div className="blog-readmore-one-card-img-wrapper">
                      <img 
                        src={rel.image || fallbackImage} 
                        alt={rel.title} 
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }} 
                      />
                      <span className="blog-readmore-one-card-tag">{rel.category}</span>
                    </div>

                    <div className="blog-readmore-one-card-body">
                      <h4 className="blog-readmore-one-card-title">{rel.title}</h4>
                      <p className="blog-readmore-one-card-desc">{rel.excerpt}</p>

                      <div className="blog-readmore-one-card-footer">
                        <button
                          type="button"
                          className="blog-readmore-one-read-more-btn"
                          onClick={() => navigate(`/news/${rel._id}`)}
                        >
                          <span>Read more</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>

                        <div className="blog-readmore-one-card-author-info">
                          <span className="blog-readmore-one-card-author">{rel.author || 'Admin'}</span>
                          <span className="blog-readmore-one-card-date">{formatDate(rel.publishDate || rel.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No related articles yet.</p>
              )}
            </div>

            {/* Comment Form */}
            <div className="blog-readmore-one-comment-box">
              <h3 className="blog-readmore-one-comment-title">Leave a Comment</h3>

              <form onSubmit={handleCommentSubmit} className="blog-readmore-one-comment-form">
                <div className="blog-readmore-one-form-group">
                  <input
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="blog-readmore-one-input"
                  />
                </div>

                <div className="blog-readmore-one-form-group">
                  <input
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleInputChange}
                    placeholder="Your Email Address"
                    required
                    className="blog-readmore-one-input"
                  />
                </div>

                <div className="blog-readmore-one-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Write your comment here..."
                    rows="4"
                    required
                    className="blog-readmore-one-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="blog-readmore-one-submit-btn">
                  Post Comment
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogReadmoreOne;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import API from "../../api/axios";
import "./BlogGrid.css";
import breadcrumbBg from "../../assets/breadcrumb.webp";

const getBlogImageUrl = (url) => {
  if (!url) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop";
  }
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

const BlogGrid = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const itemsPerPage = 4;

  // ======================================================
  // FETCH PUBLISHED BLOGS
  // ======================================================
  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      setError("");

      const { data } = await API.get("/blogs", {
        params: { status: "Published" },
      });

      if (data?.success) {
        setBlogs(data.data || []);
      } else {
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching blog grid:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load blogs."
      );
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // ======================================================
  // PAGINATION
  // ======================================================
  const totalPages = Math.ceil(blogs.length / itemsPerPage) || 1;
  const currentBlogs = blogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ======================================================
  // NAVIGATION
  // ======================================================
  const handleReadMore = (id) => {
    navigate(`/news/${id}`);
  };

  // ======================================================
  // DATE
  // ======================================================
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="blog-grid-page">
      {/* Attractive Hero Breadcrumb Banner */}
      <section
        className="blog-grid-breadcrumb"
        style={{ backgroundImage: `url(${breadcrumbBg})` }}
        aria-label="Blog Breadcrumb Banner"
      >
        <div className="blog-grid-breadcrumb-overlay">
          <div className="blog-grid-breadcrumb-container">
            {/* Top Navigation Row: Back to Home Button & Breadcrumbs */}
            <div className="blog-grid-nav-row">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="blog-grid-back-btn"
                title="Return to Home"
              >
                <span className="blog-grid-btn-icon">
                  <ArrowLeft size={16} />
                </span>
                <span>Back to Home</span>
              </button>

              <nav className="blog-grid-trail" aria-label="Breadcrumb Trail">
                <a href="/" className="blog-trail-item">
                  <Home size={14} />
                  <span>Home</span>
                </a>
                <span className="blog-trail-separator">
                  <ChevronRight size={14} />
                </span>
                <span className="blog-trail-current">Blog</span>
              </nav>
            </div>

            {/* Hero Text */}
            <div className="blog-grid-hero-text">
              <h1 className="blog-grid-banner-title">Blog</h1>
              <p className="blog-grid-banner-desc">
                Explore expert grocery guides, nutrition tips, and farm-fresh
                recipes curated by Grocery Sathi to inspire healthy living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="blog-grid-main">
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#64748b",
            }}
          >
            Loading articles...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        ) : blogs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#64748b",
            }}
          >
            No articles published yet.
          </div>
        ) : (
          <div className="blog-grid-cards-wrapper">
            {currentBlogs.map((blog) => (
              <article key={blog._id} className="blog-grid-card">
                <div className="blog-grid-image-wrapper">
                  <img
                    src={getBlogImageUrl(blog.image)}
                    alt={blog.title}
                    className="blog-grid-card-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop";
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
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    <div className="blog-grid-author-info">
                      <span className="blog-grid-author">
                        {blog.author || "Grocery Sathi"}
                      </span>
                      <span className="blog-grid-date">
                        {formatDate(blog.publishDate || blog.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {blogs.length > itemsPerPage && (
          <nav
            className="blog-grid-pagination"
            aria-label="Blog Grid Pagination"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`blog-grid-page-num ${
                  currentPage === num ? "active" : ""
                }`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="blog-grid-page-next"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
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

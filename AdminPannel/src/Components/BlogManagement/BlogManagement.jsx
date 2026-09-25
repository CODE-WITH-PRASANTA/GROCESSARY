import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiList,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiEyeOff,
  FiChevronRight,
} from "react-icons/fi";
import API from "../../api/axios"; // 👈 adjust path to your axios.js
import "./BlogManagement.css";

const BlogManagement = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  // ======================================================
  // FETCH BLOGS
  // ======================================================

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      setError("");

      const { data } = await API.get("/blogs");

      if (data?.success) {
        setBlogs(data.data || []);
      } else {
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
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
  // OUTSIDE CLICK
  // ======================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (id) => {
    setActiveMenuId(null);
    navigate(`/blog/edit/${id}`);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {
    setActiveMenuId(null);

    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const { data } = await API.delete(`/blogs/${id}`);

      if (data?.success) {
        // Optimistic local update
        setBlogs((prev) => prev.filter((b) => (b._id || b.id) !== id));
      } else {
        await loadBlogs();
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete.");
    }
  };

  // ======================================================
  // STATUS CHANGE
  // ======================================================

  const handleStatusChange = async (id, status) => {
    setActiveMenuId(null);

    try {
      const { data } = await API.patch(`/blogs/${id}/status`, { status });

      if (data?.success) {
        // Optimistic local update
        setBlogs((prev) =>
          prev.map((b) => ((b._id || b.id) === id ? { ...b, status } : b))
        );
      } else {
        await loadBlogs();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to update status."
      );
    }
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section
      className="BlogManagement"
      aria-labelledby="BlogManagement-section-title"
    >
      {/* Top Bar Header */}
      <div className="BlogManagement-top-row">
        <div className="BlogManagement-header">
          <span className="BlogManagement-subtitle">Our Journal</span>
          <h2
            id="BlogManagement-section-title"
            className="BlogManagement-title"
          >
            Blog & Articles
          </h2>
          <p className="BlogManagement-section-desc">
            Stay updated with fresh produce tips, healthy recipes, and organic
            grocery insights.
          </p>
        </div>

        {/* View Toggle (Grid / List) */}
        <div className="BlogManagement-view-toggle">
          <button
            type="button"
            className={`BlogManagement-toggle-btn ${
              viewMode === "grid" ? "active" : ""
            }`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <FiGrid className="BlogManagement-toggle-icon" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            className={`BlogManagement-toggle-btn ${
              viewMode === "list" ? "active" : ""
            }`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <FiList className="BlogManagement-toggle-icon" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="BlogManagement-content-wrapper" ref={containerRef}>
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
            }}
          >
            Loading posts...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        ) : blogs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
            }}
          >
            No blogs available. Add posts using the Blog Posting form.
          </div>
        ) : (
          <div
            className={`BlogManagement-container BlogManagement-container--${viewMode}`}
          >
            {blogs.map((item) => {
              const itemId = item._id || item.id;

              return (
                <article
                  className={`BlogManagement-card BlogManagement-card--${viewMode}`}
                  key={itemId}
                >
                  {/* Image & Category Tag */}
                  <div className="BlogManagement-card-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="BlogManagement-card-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop";
                      }}
                    />
                    <span className="BlogManagement-card-tag">
                      {item.category || item.tag || "General"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="BlogManagement-card-body">
                    <div className="BlogManagement-status-row">
                      <span
                        className={`BlogManagement-status-badge BlogManagement-status-badge--${(
                          item.status || "draft"
                        ).toLowerCase()}`}
                      >
                        {item.status || "Draft"}
                      </span>
                    </div>

                    <div className="BlogManagement-card-text">
                      <h3 className="BlogManagement-card-title">
                        {item.title}
                      </h3>
                      <p className="BlogManagement-card-description">
                        {item.excerpt || item.description}
                      </p>
                    </div>

                    <div className="BlogManagement-card-footer">
                      <a
                        href="#read-more"
                        className="BlogManagement-card-button"
                      >
                        Read more{" "}
                        <FiChevronRight className="BlogManagement-card-button-icon" />
                      </a>
                      <div className="BlogManagement-card-meta">
                        <span className="BlogManagement-card-author">
                          {item.author || "Admin"},
                        </span>
                        <time className="BlogManagement-card-date">
                          {formatDate(
                            item.publishDate || item.createdAt || item.date
                          )}
                        </time>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="BlogManagement-actions-menu">
                      <button
                        type="button"
                        className="BlogManagement-menu-trigger"
                        onClick={(e) => toggleMenu(e, itemId)}
                        aria-label="Options"
                      >
                        <FiMoreVertical />
                      </button>

                      {activeMenuId === itemId && (
                        <div className="BlogManagement-dropdown-menu">
                          <button
                            type="button"
                            className="BlogManagement-dropdown-item"
                            onClick={() => handleEdit(itemId)}
                          >
                            <FiEdit2 className="BlogManagement-dropdown-icon" />
                            <span>Edit</span>
                          </button>

                          {item.status === "Published" ? (
                            <button
                              type="button"
                              className="BlogManagement-dropdown-item"
                              onClick={() =>
                                handleStatusChange(itemId, "Unpublished")
                              }
                            >
                              <FiEyeOff className="BlogManagement-dropdown-icon" />
                              <span>Unpublish</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="BlogManagement-dropdown-item"
                              onClick={() =>
                                handleStatusChange(itemId, "Published")
                              }
                            >
                              <FiCheckCircle className="BlogManagement-dropdown-icon" />
                              <span>Publish</span>
                            </button>
                          )}

                          <div className="BlogManagement-dropdown-divider"></div>

                          <button
                            type="button"
                            className="BlogManagement-dropdown-item BlogManagement-dropdown-item--delete"
                            onClick={() => handleDelete(itemId)}
                          >
                            <FiTrash2 className="BlogManagement-dropdown-icon" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogManagement;
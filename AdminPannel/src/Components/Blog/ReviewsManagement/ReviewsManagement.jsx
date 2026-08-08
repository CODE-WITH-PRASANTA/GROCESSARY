import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./ReviewsManagement.css";

// --- CUSTOM PORTAL DROPDOWN COMPONENT ---
const CustomDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const buttonRef = useRef(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 200;

      setCoords({
        top: openUpward ? rect.top + window.scrollY - 6 : rect.bottom + window.scrollY + 6,
        left: Math.max(12, Math.min(rect.left + window.scrollX, window.innerWidth - rect.width - 12)),
        width: rect.width,
        openUpward,
      });
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) updatePosition();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="ReviewsManagement-dropdownWrapper">
      <button
        ref={buttonRef}
        type="button"
        className={`ReviewsManagement-dropdownBtn ${isOpen ? "is-active" : ""}`}
        onClick={toggleDropdown}
      >
        <span>{selectedOption ? selectedOption.label : label}</span>
        <svg
          className={`ReviewsManagement-dropdownChevron ${isOpen ? "is-flipped" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="ReviewsManagement-portalBackdrop" onClick={() => setIsOpen(false)}>
            <ul
              className="ReviewsManagement-portalMenu"
              style={{
                top: coords.openUpward ? "auto" : `${coords.top}px`,
                bottom: coords.openUpward ? `${window.innerHeight - coords.top}px` : "auto",
                left: `${coords.left}px`,
                minWidth: `${Math.max(coords.width, 160)}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`ReviewsManagement-portalItem ${option.value === value ? "is-selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

// --- DATA DEFINITIONS ---
const initialReviewsData = [
  {
    id: 1,
    customer: { name: "Rahul Sharma", email: "rahul@gmail.com", initials: "RS", bg: "#d1fae5", color: "#047857" },
    product: { name: "All Type Bell Pepper", sku: "SKU: VGT-1001", img: "https://via.placeholder.com/40/22c55e/ffffff?text=Pepper" },
    rating: 5,
    review: "Very fresh and good quality bell peppers. Packaging was also great.",
    date: "Jul 25, 2025",
    time: "10:30 AM",
    status: "Published",
  },
  {
    id: 2,
    customer: { name: "Priya Singh", email: "priya.singh@gmail.com", initials: "PS", bg: "#d1fae5", color: "#047857" },
    product: { name: "Crunchy Healthy Cookies", sku: "SKU: BAK-1002", img: "https://via.placeholder.com/40/854d0e/ffffff?text=Cookies" },
    rating: 4,
    review: "Cookies are tasty and crunchy. Kids loved them!",
    date: "Jul 24, 2025",
    time: "04:15 PM",
    status: "Published",
  },
  {
    id: 3,
    customer: { name: "Amit Mehta", email: "amit.mehta@gmail.com", initials: "AM", bg: "#fef3c7", color: "#b45309" },
    product: { name: "Raw Yellow Potato", sku: "SKU: VGT-1003", img: "https://via.placeholder.com/40/eab308/ffffff?text=Potato" },
    rating: 3,
    review: "Potatoes were average. Some were not fresh.",
    date: "Jul 23, 2025",
    time: "09:20 AM",
    status: "Published",
  },
  {
    id: 4,
    customer: { name: "Neha Patel", email: "neha.patel@gmail.com", initials: "NP", bg: "#d1fae5", color: "#047857" },
    product: { name: "Grater With 3 Blades", sku: "SKU: KTN-1004", img: "https://via.placeholder.com/40/ef4444/ffffff?text=Grater" },
    rating: 5,
    review: "Very useful product. Makes work easy in the kitchen.",
    date: "Jul 22, 2025",
    time: "11:45 AM",
    status: "Published",
  },
  {
    id: 5,
    customer: { name: "Sanjay Kumar", email: "sanjay.kumar@gmail.com", initials: "SK", bg: "#fef3c7", color: "#b45309" },
    product: { name: "Organic Spinach", sku: "SKU: ORG-1005", img: "https://via.placeholder.com/40/16a34a/ffffff?text=Spinach" },
    rating: 4,
    review: "Fresh and organic. Will order again.",
    date: "Jul 21, 2025",
    time: "03:30 PM",
    status: "Pending",
  },
  {
    id: 6,
    customer: { name: "Anjali Kaur", email: "anjali.kaur@gmail.com", initials: "AK", bg: "#fef3c7", color: "#b45309" },
    product: { name: "Fresh Red Apple", sku: "SKU: FRU-1006", img: "https://via.placeholder.com/40/dc2626/ffffff?text=Apple" },
    rating: 5,
    review: "Apples are very fresh and sweet. Good quality.",
    date: "Jul 20, 2025",
    time: "08:10 AM",
    status: "Published",
  },
  {
    id: 7,
    customer: { name: "Vikram Bhatt", email: "vikram.bhatt@gmail.com", initials: "VB", bg: "#fee2e2", color: "#b91c1c" },
    product: { name: "Organic Carrot", sku: "SKU: ORG-1007", img: "https://via.placeholder.com/40/f97316/ffffff?text=Carrot" },
    rating: 2,
    review: "Carrots were not fresh. Disappointed.",
    date: "Jul 19, 2025",
    time: "12:00 PM",
    status: "Hidden",
  },
];

const metricsData = [
  {
    id: "total",
    title: "Total Reviews",
    count: "2,354",
    percentage: "18.6% this month",
    isPositive: true,
    bgColor: "#16a34a",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "avg",
    title: "Average Rating",
    count: "4.6 / 5",
    percentage: "4.3% this month",
    isPositive: true,
    bgColor: "#d97706",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "pos",
    title: "Positive Reviews",
    count: "1,890",
    percentage: "20.5% this month",
    isPositive: true,
    bgColor: "#2563eb",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ),
  },
  {
    id: "neg",
    title: "Negative Reviews",
    count: "464",
    percentage: "6.2% this month",
    isPositive: false,
    bgColor: "#dc2626",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
      </svg>
    ),
  },
];

const ratingOptions = [
  { label: "All Ratings", value: "all" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Published", value: "published" },
  { label: "Pending", value: "pending" },
  { label: "Hidden", value: "hidden" },
];

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState(initialReviewsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.customer.name.toLowerCase().includes(term) ||
        item.customer.email.toLowerCase().includes(term) ||
        item.product.name.toLowerCase().includes(term) ||
        item.review.toLowerCase().includes(term);

      const matchesRating = ratingFilter === "all" || item.rating.toString() === ratingFilter;
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchTerm, ratingFilter, statusFilter]);

  const handleExport = () => {
    alert("Exporting reviews dataset successfully!");
  };

  const handleView = (row) => {
    alert(`Viewing Review from ${row.customer.name}:\n\n"${row.review}"`);
  };

  const handleEdit = (row) => {
    const newStatus = prompt(`Change status for review ID ${row.id} (Published / Pending / Hidden):`, row.status);
    if (newStatus) {
      setReviews((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() } : r))
      );
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="ReviewsManagement-container">
      {/* Header */}
      <header className="ReviewsManagement-header">
        <div>
          <h1 className="ReviewsManagement-title">Reviews Management</h1>
          <nav className="ReviewsManagement-breadcrumb">
            Dashboard &gt; Reviews &gt; <span>All Reviews</span>
          </nav>
        </div>
        <button type="button" className="ReviewsManagement-btnExport" onClick={handleExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Reviews
        </button>
      </header>

      {/* Metrics */}
      <section className="ReviewsManagement-metrics">
        {metricsData.map((metric) => (
          <article key={metric.id} className="ReviewsManagement-metricCard">
            <div className="ReviewsManagement-metricIcon" style={{ backgroundColor: metric.bgColor }}>
              {metric.icon}
            </div>
            <div className="ReviewsManagement-metricInfo">
              <span className="ReviewsManagement-metricTitle">{metric.title}</span>
              <span className="ReviewsManagement-metricCount">{metric.count}</span>
              <span className={`ReviewsManagement-metricSub ${metric.isPositive ? "is-positive" : "is-negative"}`}>
                {metric.isPositive ? "↑" : "↓"} {metric.percentage}
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* Toolbar & Filters */}
      <section className="ReviewsManagement-toolbar">
        <div className="ReviewsManagement-search">
          <span className="ReviewsManagement-searchIcon">🔍</span>
          <input
            type="text"
            placeholder="Search reviews, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ReviewsManagement-filters">
          <CustomDropdown
            label="All Ratings"
            value={ratingFilter}
            options={ratingOptions}
            onChange={(val) => setRatingFilter(val)}
          />

          <CustomDropdown
            label="All Statuses"
            value={statusFilter}
            options={statusOptions}
            onChange={(val) => setStatusFilter(val)}
          />
        </div>
      </section>

      {/* Reviews Table */}
      <div className="ReviewsManagement-tableContainer">
        <table className="ReviewsManagement-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Status</th>
              <th className="u-text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="ReviewsManagement-customer">
                      <div className="ReviewsManagement-avatar" style={{ backgroundColor: row.customer.bg, color: row.customer.color }}>
                        {row.customer.initials}
                      </div>
                      <div className="ReviewsManagement-meta">
                        <strong className="ReviewsManagement-name">{row.customer.name}</strong>
                        <span className="ReviewsManagement-subtext">{row.customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ReviewsManagement-product">
                      <img src={row.product.img} alt={row.product.name} className="ReviewsManagement-productImg" />
                      <div className="ReviewsManagement-meta">
                        <strong className="ReviewsManagement-name">{row.product.name}</strong>
                        <span className="ReviewsManagement-subtext">{row.product.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ReviewsManagement-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`ReviewsManagement-star ${star <= row.rating ? "is-filled" : ""}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <p className="ReviewsManagement-reviewText">{row.review}</p>
                  </td>
                  <td>
                    <div className="ReviewsManagement-meta">
                      <span className="ReviewsManagement-date">{row.date}</span>
                      <span className="ReviewsManagement-subtext">{row.time}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`ReviewsManagement-badge is-${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="ReviewsManagement-actions">
                      <button type="button" className="ReviewsManagement-actionBtn" title="View" onClick={() => handleView(row)}>👁️</button>
                      <button type="button" className="ReviewsManagement-actionBtn" title="Edit" onClick={() => handleEdit(row)}>✏️</button>
                      <button type="button" className="ReviewsManagement-actionBtn is-delete" title="Delete" onClick={() => handleDelete(row.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="ReviewsManagement-empty">
                  No matching reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <footer className="ReviewsManagement-pagination">
        <span>Showing {filteredReviews.length} of 2,354 reviews</span>
        <div className="ReviewsManagement-paginationControls">
          <button type="button" className="ReviewsManagement-pgBtn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>&lt;</button>
          <button type="button" className={`ReviewsManagement-pgBtn ${currentPage === 1 ? "is-active" : ""}`} onClick={() => setCurrentPage(1)}>1</button>
          <button type="button" className={`ReviewsManagement-pgBtn ${currentPage === 2 ? "is-active" : ""}`} onClick={() => setCurrentPage(2)}>2</button>
          <button type="button" className={`ReviewsManagement-pgBtn ${currentPage === 3 ? "is-active" : ""}`} onClick={() => setCurrentPage(3)}>3</button>
          <span className="ReviewsManagement-pgDots">...</span>
          <button type="button" className="ReviewsManagement-pgBtn" onClick={() => setCurrentPage(336)}>336</button>
          <button type="button" className="ReviewsManagement-pgBtn" onClick={() => setCurrentPage((p) => Math.min(336, p + 1))}>&gt;</button>
        </div>
      </footer>
    </div>
  );
};

export default ReviewsManagement;
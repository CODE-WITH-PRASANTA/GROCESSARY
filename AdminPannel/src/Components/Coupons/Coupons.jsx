import React, { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  Tag,
  CheckCircle,
  Clock,
  Award,
} from "lucide-react";
import API from "../../api/axios";
import "./Coupons.css";

const initialForm = {
  code: "",
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minPurchase: "",
  maxDiscount: "",
  startDate: new Date().toISOString().substring(0, 10),
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10),
  usageLimit: "",
  perUserLimit: 1,
  status: "Active",
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    totalUsage: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Load Coupons from backend
  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await API.get("/coupons", { params });
      if (res.data?.success) {
        setCoupons(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error("Error loading coupons:", err.message);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [statusFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCoupons();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || "",
      minPurchase: coupon.minPurchase || "",
      maxDiscount: coupon.maxDiscount || "",
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().substring(0, 10)
        : "",
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate).toISOString().substring(0, 10)
        : "",
      usageLimit: coupon.usageLimit || "",
      perUserLimit: coupon.perUserLimit || 1,
      status: coupon.status || "Active",
    });
    setIsModalOpen(true);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase().replace(/\s+/g, "") : value,
    }));
  };

  // Save Coupon (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : 1,
      };

      if (editingId) {
        await API.put(`/coupons/${editingId}`, payload);
      } else {
        await API.post("/coupons", payload);
      }

      setIsModalOpen(false);
      setEditingId(null);
      await loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to save coupon");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Coupon
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await API.delete(`/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      await loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  // Toggle status
  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = coupon.status === "Active" ? "Inactive" : "Active";
      const res = await API.patch(`/coupons/${coupon._id}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? res.data.data : c))
        );
        loadCoupons();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change coupon status");
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="coupons-page">
      {/* Header */}
      <div className="coupons-header">
        <div className="coupons-header-left">
          <h1>Coupon Management</h1>
          <p>
            Create, monitor, and manage promotional coupon codes saved dynamically into your database.
          </p>
        </div>
        <button
          type="button"
          className="coupons-create-btn"
          onClick={handleOpenCreate}
        >
          <Plus size={18} /> Add New Coupon
        </button>
      </div>

      {/* Metrics Row */}
      <div className="coupons-metrics">
        <div className="coupon-stat-card">
          <div className="coupon-stat-icon blue">
            <Ticket />
          </div>
          <div className="coupon-stat-info">
            <h4>Total Coupons</h4>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon green">
            <CheckCircle />
          </div>
          <div className="coupon-stat-info">
            <h4>Active Coupons</h4>
            <h2>{stats.active}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon amber">
            <Clock />
          </div>
          <div className="coupon-stat-info">
            <h4>Inactive / Expired</h4>
            <h2>{stats.inactive + stats.expired}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon purple">
            <Award />
          </div>
          <div className="coupon-stat-info">
            <h4>Total Redeemed</h4>
            <h2>{stats.totalUsage}</h2>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="coupons-controls-bar">
        <form className="coupons-search-box" onSubmit={handleSearchSubmit}>
          <Search size={18} />
          <input
            type="text"
            className="coupons-search-input"
            placeholder="Search by code, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="coupons-filter-group">
          <select
            className="coupons-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Expired">Expired</option>
          </select>

          <button
            type="button"
            className="coupons-refresh-btn"
            title="Refresh List"
            onClick={loadCoupons}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="coupons-table-card">
        <div className="coupons-table-responsive">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title / Description</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Validity</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    No coupons found. Click "Add New Coupon" to create your first discount coupon.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="coupon-code-badge">
                        <span>{c.code}</span>
                        <button
                          type="button"
                          className="coupon-copy-btn"
                          title="Copy Code"
                          onClick={() => handleCopyCode(c.code)}
                        >
                          {copiedCode === c.code ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    <td className="coupon-title-cell">
                      <strong>{c.title}</strong>
                      <span>{c.description || "No description provided"}</span>
                    </td>

                    <td>
                      <span className="coupon-discount-tag">
                        {c.discountType === "percentage"
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} FLAT`}
                      </span>
                      {c.discountType === "percentage" && c.maxDiscount && (
                        <span className="coupon-discount-sub">
                          Up to ₹{c.maxDiscount}
                        </span>
                      )}
                    </td>

                    <td>₹{c.minPurchase || 0}</td>

                    <td>
                      <div style={{ fontSize: "0.82rem", color: "#334155" }}>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "N/A"}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Start: {c.startDate ? new Date(c.startDate).toLocaleDateString() : "Now"}
                      </span>
                    </td>

                    <td>
                      <strong>{c.usageCount || 0}</strong>
                      <span style={{ color: "#94a3b8" }}>
                        {" "}
                        / {c.usageLimit !== null && c.usageLimit !== undefined ? c.usageLimit : "∞"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`coupon-status-pill ${c.status?.toLowerCase()}`}
                        title="Click to toggle status"
                        onClick={() => handleToggleStatus(c)}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td>
                      <div className="coupon-actions">
                        <button
                          type="button"
                          className="coupon-action-btn"
                          title="Edit Coupon"
                          onClick={() => handleOpenEdit(c)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="coupon-action-btn delete"
                          title="Delete Coupon"
                          onClick={() => handleDelete(c._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="coupon-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <h3>{editingId ? "Edit Coupon" : "Add New Coupon"}</h3>
              <button
                type="button"
                className="coupon-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="coupon-modal-body">
                <div className="coupon-form-row">
                  <div className="coupon-form-group">
                    <label>Coupon Code *</label>
                    <input
                      type="text"
                      name="code"
                      placeholder="e.g. SUMMER50"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="coupon-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Summer Special 50% Off"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="coupon-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="Short description for customers..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="coupon-form-row">
                  <div className="coupon-form-group">
                    <label>Discount Type *</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="coupon-form-group">
                    <label>
                      Discount Value * ({formData.discountType === "percentage" ? "%" : "₹"})
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      min="1"
                      placeholder={formData.discountType === "percentage" ? "e.g. 20" : "e.g. 100"}
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="coupon-form-row">
                  <div className="coupon-form-group">
                    <label>Min Order Value (₹)</label>
                    <input
                      type="number"
                      name="minPurchase"
                      min="0"
                      placeholder="e.g. 499 (0 for no minimum)"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                    />
                  </div>

                  {formData.discountType === "percentage" && (
                    <div className="coupon-form-group">
                      <label>Max Discount Cap (₹)</label>
                      <input
                        type="number"
                        name="maxDiscount"
                        min="0"
                        placeholder="e.g. 150 (Leave blank for no limit)"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>

                <div className="coupon-form-row">
                  <div className="coupon-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="coupon-form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="coupon-form-row">
                  <div className="coupon-form-group">
                    <label>Total Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      min="1"
                      placeholder="Leave blank for unlimited"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="coupon-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="coupon-modal-footer">
                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coupon-save-btn"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;


import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Camera,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
  Phone,
  IndianRupee,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  X,
} from "lucide-react";
import API from "../../../api/axios";
import "./ReturnManagement.css";

// ======================================================
// STATUS METADATA & CONFIG
// ======================================================
const STATUS = {
  requested: {
    label: "Pending Review",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: CheckCircle2,
  },
  pickup_scheduled: {
    label: "Pickup Scheduled",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: Truck,
  },
  picked: {
    label: "Picked Up",
    color: "#0e7490",
    bg: "#ecfeff",
    border: "#a5f3fc",
    icon: Package,
  },
  inspection: {
    label: "Quality Inspection",
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#ffedd5",
    icon: ShieldCheck,
  },
  refunded: {
    label: "Refund Successfully",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: XCircle,
  },
  replaced: {
    label: "Replaced",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
};

const FILTERS = [
  { value: "All", label: "All Cases" },
  { value: "requested", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "pickup_scheduled", label: "Pickup Scheduled" },
  { value: "picked", label: "Picked Up" },
  { value: "inspection", label: "In Inspection" },
  { value: "refunded", label: "Refund Successfully" },
  { value: "rejected", label: "Rejected" },
  { value: "replaced", label: "Replaced" },
];

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ======================================================
// COMPONENT
// ======================================================
const ReturnManagement = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ==================================================
  // LOAD RETURNS
  // ==================================================
  const loadReturns = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const params = filter !== "All" ? { status: filter } : {};
      const { data } = await API.get("/admin/returns", { params });

      setReturns(data?.success && Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Load returns error:", err);
      setError(err.response?.data?.message || "Failed to load returns.");
      setReturns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Navigate to Dedicated Individual Return Case Page
  const handleOpenReturnCase = (row) => {
    navigate(`/orders/returns/${row.id}`, { state: { returnData: row } });
  };

  // ==================================================
  // STATS SUMMARY CARDS
  // ==================================================
  const stats = useMemo(() => {
    const total = returns.length;
    const pending = returns.filter((r) => r.status === "requested").length;
    const inProcess = returns.filter((r) =>
      ["approved", "pickup_scheduled", "picked", "inspection"].includes(r.status)
    ).length;
    const completed = returns.filter((r) =>
      ["refunded", "replaced"].includes(r.status)
    ).length;
    const totalRefunded = returns
      .filter((r) => r.status === "refunded")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return { total, pending, inProcess, completed, totalRefunded };
  }, [returns]);

  // Filter Counts
  const filterCounts = useMemo(() => {
    const counts = { All: returns.length };
    FILTERS.forEach((f) => {
      if (f.value !== "All") {
        counts[f.value] = returns.filter((r) => r.status === f.value).length;
      }
    });
    return counts;
  }, [returns]);

  // Client-side search
  const filteredReturns = useMemo(() => {
    if (!search.trim()) return returns;
    const q = search.trim().toLowerCase();
    return returns.filter(
      (r) =>
        String(r.orderNumber || r.id || "").toLowerCase().includes(q) ||
        String(r.customer?.name || "").toLowerCase().includes(q) ||
        String(r.customer?.phone || "").toLowerCase().includes(q) ||
        String(r.product?.name || "").toLowerCase().includes(q) ||
        String(r.product?.sku || "").toLowerCase().includes(q) ||
        String(r.reason || "").toLowerCase().includes(q)
    );
  }, [returns, search]);

  return (
    <div className="rm-container">
      {/* ==============================================
          1. PAGE HEADER
      =============================================== */}
      <header className="rm-page-header">
        <div className="rm-header-left">
          <div className="rm-title-icon-box">
            <RotateCcw size={26} />
          </div>
          <div className="rm-title-meta">
            <div className="rm-title-row">
              <h2>Return Management</h2>
              <span className="rm-header-count-pill">{returns.length} Total</span>
            </div>
            <p className="rm-subtitle">
              Monitor customer return requests, schedule partner pickups, verify inspections, and process refunds.
            </p>
          </div>
        </div>

        <div className="rm-header-actions">
          <button
            type="button"
            className="rm-btn-refresh-modern"
            onClick={() => loadReturns(true)}
            disabled={refreshing || loading}
            title="Refresh returns data"
          >
            <RefreshCw size={16} className={refreshing ? "spin-animate" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* ==============================================
          2. METRICS KPI CARDS
      =============================================== */}
      <section className="rm-kpi-grid">
        <div className="rm-kpi-card kpi-total">
          <div className="kpi-icon-wrap bg-blue-subtle">
            <Package size={22} className="text-blue" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Returns</span>
            <strong className="kpi-value">{stats.total}</strong>
            <span className="kpi-sub">All logged requests</span>
          </div>
        </div>

        <div className="rm-kpi-card kpi-pending">
          <div className="kpi-icon-wrap bg-amber-subtle">
            <Clock size={22} className="text-amber" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pending Action</span>
            <strong className="kpi-value">{stats.pending}</strong>
            <span className="kpi-sub text-amber-dark">Awaiting review</span>
          </div>
        </div>

        <div className="rm-kpi-card kpi-process">
          <div className="kpi-icon-wrap bg-purple-subtle">
            <Truck size={22} className="text-purple" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pickup &amp; Inspect</span>
            <strong className="kpi-value">{stats.inProcess}</strong>
            <span className="kpi-sub text-purple-dark">In active transit</span>
          </div>
        </div>

        <div className="rm-kpi-card kpi-refunded">
          <div className="kpi-icon-wrap bg-emerald-subtle">
            <CheckCircle2 size={22} className="text-emerald" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Refunded Amount</span>
            <strong className="kpi-value">₹{stats.totalRefunded.toFixed(2)}</strong>
            <span className="kpi-sub text-emerald-dark">
              {stats.completed} cases resolved
            </span>
          </div>
        </div>
      </section>

      {/* ==============================================
          3. CONTROLS: SEARCH & STATUS PILLS
      =============================================== */}
      <section className="rm-controls-card">
        {/* Search Bar */}
        <div className="rm-search-row">
          <div className="rm-search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, SKU, Reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rm-search-input"
            />
            {search && (
              <button
                type="button"
                className="rm-search-clear-btn"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills with Counts */}
        <div className="rm-filters-scroll-row">
          {FILTERS.map((f) => {
            const count = filterCounts[f.value] ?? 0;
            const isActive = filter === f.value;

            return (
              <button
                key={f.value}
                type="button"
                className={`rm-filter-pill ${isActive ? "active" : ""}`}
                onClick={() => setFilter(f.value)}
              >
                <span>{f.label}</span>
                <span className={`pill-badge ${isActive ? "badge-active" : ""}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==============================================
          4. RETURNS DATA TABLE
      =============================================== */}
      <section className="rm-table-card">
        {loading && !refreshing ? (
          <div className="rm-table-loading-state">
            <RefreshCw size={28} className="spin-animate text-emerald" />
            <p>Loading return requests…</p>
          </div>
        ) : error ? (
          <div className="rm-table-error-state">
            <AlertCircle size={32} color="#ef4444" />
            <h4>Could not load returns</h4>
            <p>{error}</p>
            <button
              type="button"
              className="rm-btn-retry"
              onClick={() => loadReturns()}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="rm-table-responsive-wrapper">
            <table className="rm-modern-table">
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>Order</th>
                  <th style={{ width: "16%" }}>Customer</th>
                  <th style={{ width: "21%" }}>Product</th>
                  <th style={{ width: "6%", textAlign: "center" }}>Qty</th>
                  <th style={{ width: "16%" }}>Reason</th>
                  <th style={{ width: "10%" }}>Requested</th>
                  <th style={{ width: "9%" }}>Amount</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="rm-table-empty-box">
                        <Package size={44} className="empty-icon" />
                        <h3>No return requests found</h3>
                        <p>
                          {search
                            ? `No records match your search "${search}".`
                            : `There are currently no return requests under the "${filter}" filter.`}
                        </p>
                        {search && (
                          <button
                            type="button"
                            className="rm-btn-clear-search"
                            onClick={() => setSearch("")}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((row) => {
                    const meta = STATUS[row.status] || {
                      label: row.status,
                      color: "#475569",
                      bg: "#f1f5f9",
                      border: "#cbd5e1",
                      icon: Package,
                    };
                    const StatusIcon = meta.icon;

                    const photoCount =
                      row.damagePhotos?.length ||
                      row.photos?.length ||
                      row.returnPhotos?.length ||
                      row.pickupProof?.images?.length ||
                      0;

                    return (
                      <tr
                        key={row.id}
                        className="rm-table-row"
                        onClick={() => handleOpenReturnCase(row)}
                        title="Click to view complete return case breakdown"
                      >
                        {/* Order Column */}
                        <td>
                          <div className="rm-order-id-chip">
                            <span className="order-id-text">
                              {row.orderNumber || String(row.id).slice(-8).toUpperCase()}
                            </span>
                            <ArrowUpRight size={13} className="arrow-icon" />
                          </div>
                        </td>

                        {/* Customer Column */}
                        <td>
                          <div className="rm-customer-cell">
                            <span className="customer-name">
                              {row.customer?.name || "Customer"}
                            </span>
                            <span className="customer-phone">
                              <Phone size={11} />
                              {row.customer?.phone || row.customer?.mobile || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Product Column */}
                        <td>
                          <div className="rm-product-cell">
                            <span className="product-title" title={row.product?.name}>
                              {row.product?.name || "Grocery Item"}
                            </span>
                            {row.product?.sku && (
                              <span className="product-sku-pill">
                                {row.product.sku}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Qty Column */}
                        <td style={{ textAlign: "center" }}>
                          <span className="rm-qty-badge">{row.qty || 1}</span>
                        </td>

                        {/* Reason Column */}
                        <td>
                          <div className="rm-reason-cell">
                            <span className="reason-text">{row.reason || "Return request"}</span>
                            {photoCount > 0 && (
                              <span className="photo-indicator-chip">
                                <Camera size={12} />
                                <span>{photoCount} photo{photoCount > 1 ? "s" : ""}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Requested Date */}
                        <td>
                          <div className="rm-date-cell">
                            <Calendar size={13} className="text-slate" />
                            <span>{formatDate(row.requestedAt)}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className="rm-amount-text">
                            ₹{Number(row.amount || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span
                            className="rm-status-badge"
                            style={{
                              color: meta.color,
                              backgroundColor: meta.bg,
                              borderColor: meta.border,
                            }}
                          >
                            <StatusIcon size={12} />
                            <span>{meta.label}</span>
                          </span>
                        </td>

                        {/* Action View Case Button */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="rm-action-view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReturnCase(row);
                            }}
                            title="Open return case and view inspection/pickup proof"
                          >
                            <span>View Case</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReturnManagement;

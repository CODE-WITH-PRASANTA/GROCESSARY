import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import "./ReturnManagement.css";

// ======================================================
// STATUS META
// ======================================================
const STATUS = {
  requested:        { label: "Pending",            color: "#d97706", bg: "#fef3c7" },
  approved:         { label: "Approved",           color: "#2563eb", bg: "#dbeafe" },
  pickup_scheduled: { label: "Pickup Scheduled",   color: "#7c3aed", bg: "#ede9fe" },
  picked:           { label: "Picked Up",          color: "#0891b2", bg: "#cffafe" },
  inspection:       { label: "In Inspection",      color: "#ea580c", bg: "#ffedd5" },
  refunded:         { label: "Refund Successfully",color: "#16a34a", bg: "#dcfce7" },
  rejected:         { label: "Rejected",           color: "#dc2626", bg: "#fee2e2" },
  replaced:         { label: "Replaced",           color: "#16a34a", bg: "#dcfce7" },
};

const FILTERS = [
  { value: "All",              label: "All" },
  { value: "requested",        label: "Pending" },
  { value: "approved",         label: "Approved" },
  { value: "pickup_scheduled", label: "Pickup Scheduled" },
  { value: "picked",           label: "Picked Up" },
  { value: "inspection",       label: "In Inspection" },
  { value: "refunded",         label: "Refund Successfully" },
  { value: "rejected",         label: "Rejected" },
  { value: "replaced",         label: "Replaced" },
];

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD RETURNS
  // ==================================================
  const loadReturns = async () => {
    try {
      setLoading(true);
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
  // RENDER
  // ==================================================
  if (loading) return <div className="rm-page">Loading return requests…</div>;
  if (error)
    return (
      <div className="rm-page rm-error">
        {error} <button onClick={loadReturns}>Retry</button>
      </div>
    );

  return (
    <div className="rm-page">
      {/* Header */}
      <div className="rm-header">
        <div>
          <h2>Return Management</h2>
          <p className="rm-subtitle">
            Manage customer return requests, pickups, inspections, and refunds.
          </p>
        </div>
        <button className="rm-btn-refresh" onClick={loadReturns}>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="rm-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`rm-filter-btn ${filter === f.value ? "active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Returns Table */}
      <div className="rm-table-wrap">
        <table className="rm-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Product</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th>Reason</th>
              <th>Requested</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td colSpan="9" className="rm-empty">
                  No return requests found in "{filter}".
                </td>
              </tr>
            ) : (
              returns.map((row) => {
                const meta = STATUS[row.status] || {
                  label: row.status,
                  color: "#64748b",
                  bg: "#f1f5f9",
                };

                const photoCount =
                  row.damagePhotos?.length ||
                  row.photos?.length ||
                  row.returnPhotos?.length ||
                  row.pickupProof?.images?.length ||
                  0;

                return (
                  <tr
                    key={row.id}
                    className="rm-row-interactive"
                    onClick={() => handleOpenReturnCase(row)}
                    style={{ cursor: "pointer" }}
                    title="Click row to open individual return case page"
                  >
                    <td
                      style={{ color: "#2563eb", fontWeight: "700" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReturnCase(row);
                      }}
                    >
                      {row.orderNumber || row.id} ↗
                    </td>
                    <td>
                      <div className="rm-cell-strong">{row.customer?.name}</div>
                      <div className="rm-cell-sub">{row.customer?.phone}</div>
                    </td>
                    <td>
                      <div className="rm-cell-strong">{row.product?.name}</div>
                      <div className="rm-cell-sub">{row.product?.sku}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>{row.qty}</td>
                    <td>
                      <div>{row.reason}</div>
                      {photoCount > 0 && (
                        <div style={{ fontSize: "11px", color: "#059669", fontWeight: "600", marginTop: "3px" }}>
                          📷 {photoCount} photo(s)
                        </div>
                      )}
                    </td>
                    <td>{formatDate(row.requestedAt)}</td>
                    <td style={{ fontWeight: "700" }}>₹{Number(row.amount || 0).toFixed(2)}</td>
                    <td>
                      <span
                        className="rm-badge"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="rm-btn-view-page"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReturnCase(row);
                        }}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnManagement;

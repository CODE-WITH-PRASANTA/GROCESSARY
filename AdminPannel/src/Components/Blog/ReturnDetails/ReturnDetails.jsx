import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import API, { BASE_URL } from "../../../api/axios";
import "./ReturnDetails.css";

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

const PICKUP_SLOTS = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM",
  "3:00 PM – 5:00 PM",
  "5:00 PM – 7:00 PM",
];

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const resolveImage = (path) => {
  if (!path) return "";
  const str = String(path).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
};

const toLocalInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ReturnDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();

  const [details, setDetails] = useState(location.state?.returnData || null);
  const [loading, setLoading] = useState(!location.state?.returnData);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);

  // Pickup Modal State
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    scheduledAt: "",
    slot: "11:00 AM – 1:00 PM",
    agent: "Delivery Partner",
    agentPhone: "+91 98878 68746",
    address: "",
    instructions: "Please keep the product safely packed.",
  });

  // Inspection Modal State
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [inspectForm, setInspectForm] = useState({
    verdict: "approved",
    condition: "damaged",
    note: "",
  });

  const returnId = routeId || details?.id;

  // Fetch Return Details from Backend
  const fetchDetails = useCallback(async () => {
    if (!returnId) return;
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/admin/returns/${returnId}`);
      if (res.data?.success && res.data?.data) {
        setDetails(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load return details.");
      }
    } catch (err) {
      console.error("Fetch return details error:", err);
      setError(err.response?.data?.message || "Failed to load return details.");
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    if (!details || details.id !== returnId) {
      fetchDetails();
    }
  }, [returnId, fetchDetails]);

  // Handle Simple Status Transitions
  const handleUpdateStatus = async (nextStatus) => {
    if (!details) return;
    const verbs = {
      approved: "Approve this return request",
      refunded: "Process refund and mark refunded",
      replaced: "Mark this return as replaced",
      rejected: "Reject this return request",
      picked: "Confirm that item has been picked up",
    };

    if (!window.confirm(`Are you sure you want to ${verbs[nextStatus] || nextStatus}?`)) {
      return;
    }

    try {
      setBusy(true);
      const payload = { status: nextStatus };
      if (nextStatus === "refunded") {
        payload.amount = Number(details.amount || 0);
      }

      await API.put(`/admin/returns/${details.id}/status`, payload);
      alert(`Status updated to ${nextStatus.toUpperCase()}`);
      await fetchDetails();
    } catch (err) {
      console.error("Update return status error:", err);
      alert(err.response?.data?.message || "Failed to update return status.");
    } finally {
      setBusy(false);
    }
  };

  // Open Pickup Modal
  const openPickupModal = () => {
    const pd = details?.pickupDetails || {};
    setPickupForm({
      scheduledAt: pd.scheduledAt
        ? toLocalInputValue(pd.scheduledAt)
        : toLocalInputValue(new Date(Date.now() + 3600000 * 2)),
      slot: pd.slot || "11:00 AM – 1:00 PM",
      agent: pd.agent || "Delivery Partner",
      agentPhone: pd.agentPhone || "+91 98878 68746",
      address: pd.address || details.pickupAddress || details.deliveryAddress || "",
      instructions: pd.instructions || "Please keep the product safely packed with original tags.",
    });
    setShowPickupModal(true);
  };

  // Submit Pickup Schedule
  const submitPickupSchedule = async (e) => {
    e.preventDefault();
    if (!pickupForm.scheduledAt) {
      alert("Please select a pickup date and time.");
      return;
    }

    try {
      setBusy(true);
      const res = await API.put(`/admin/returns/${details.id}/schedule-pickup`, pickupForm);
      alert(res.data?.message || "Pickup scheduled successfully! OTP generated.");
      setShowPickupModal(false);
      await fetchDetails();
    } catch (err) {
      console.error("Submit pickup error:", err);
      alert(err.response?.data?.message || "Failed to schedule pickup.");
    } finally {
      setBusy(false);
    }
  };

  // Verify OTP & Mark Picked
  const handleVerifyOtpAndPick = async () => {
    const customerOtp = details?.pickupDetails?.otp || "";
    const entered = prompt(
      `Enter customer's 4-digit Return Pickup OTP to verify\n(Customer OTP is: ${customerOtp || "Not set"}):`,
      customerOtp
    );
    if (entered === null) return;
    if (customerOtp && entered.trim() !== String(customerOtp).trim()) {
      alert("Incorrect OTP! The entered OTP does not match the customer OTP.");
      return;
    }

    try {
      setBusy(true);
      await API.put(`/admin/returns/${details.id}/status`, { status: "picked", otp: entered });
      alert("OTP Verified! Item successfully marked as Picked Up.");
      await fetchDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setBusy(false);
    }
  };

  // Submit Inspection
  const submitInspection = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await API.put(`/admin/returns/${details.id}/inspection`, inspectForm);
      alert("Inspection report recorded.");
      setShowInspectModal(false);
      await fetchDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit inspection.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rtd-container">
        <div className="rtd-loader">Loading return case details...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="rtd-container">
        <button type="button" className="rtd-btn-back" onClick={() => navigate("/orders/returns")}>
          ← Back to All Returns
        </button>
        <div className="rtd-error-card">
          <h3>Error Loading Return</h3>
          <p>{error || "Return case could not be found."}</p>
        </div>
      </div>
    );
  }

  const meta = STATUS[details.status] || {
    label: details.status,
    color: "#475569",
    bg: "#f1f5f9",
  };

  const proofPhotos =
    (Array.isArray(details.damagePhotos) && details.damagePhotos.length > 0 && details.damagePhotos) ||
    (Array.isArray(details.photos) && details.photos.length > 0 && details.photos) ||
    (Array.isArray(details.returnPhotos) && details.returnPhotos.length > 0 && details.returnPhotos) ||
    (Array.isArray(details.pickupProof?.images) && details.pickupProof.images.length > 0 && details.pickupProof.images) ||
    [];

  const isTerminal = ["refunded", "replaced", "rejected"].includes(details.status);
  const canApprove = details.status === "requested";
  const canSchedule = ["requested", "approved", "pickup_scheduled"].includes(details.status);
  const canVerifyPick = details.status === "pickup_scheduled";
  const canInspect = ["picked", "inspection"].includes(details.status);
  const canRefund = ["approved", "pickup_scheduled", "picked", "inspection"].includes(details.status);
  const canReplace = ["approved", "pickup_scheduled", "picked", "inspection"].includes(details.status);
  const canReject = !isTerminal;

  return (
    <div className="rtd-container">
      {/* TOP HEADER NAVIGATION */}
      <div className="rtd-top-bar">
        <button type="button" className="rtd-btn-back" onClick={() => navigate("/orders/returns")}>
          ← Back to Returns List
        </button>
        <div className="rtd-top-actions">
          <button
            type="button"
            className="rtd-btn-refresh"
            onClick={fetchDetails}
            disabled={busy}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* CASE TITLE & STATUS HEADER CARD */}
      <div className="rtd-hero-card">
        <div className="rtd-hero-left">
          <div className="rtd-hero-title-row">
            <h2>Return #{details.orderNumber || details.id}</h2>
            <span className="rtd-status-badge" style={{ color: meta.color, background: meta.bg }}>
              {meta.label}
            </span>
          </div>
          <div className="rtd-hero-meta">
            <span>Requested: <strong>{formatDateTime(details.requestedAt)}</strong></span>
            <span>•</span>
            <span>Type: <strong style={{ textTransform: "capitalize" }}>{details.type || "Refund"}</strong></span>
            <span>•</span>
            <span>Amount: <strong style={{ color: "#059669" }}>₹{Number(details.amount || 0).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="rtd-hero-actions">
          {canApprove && (
            <button
              type="button"
              className="rtd-action-btn btn-approve"
              onClick={() => handleUpdateStatus("approved")}
              disabled={busy}
            >
              Approve Return
            </button>
          )}

          {canSchedule && (
            <button
              type="button"
              className="rtd-action-btn btn-schedule"
              onClick={openPickupModal}
              disabled={busy}
            >
              {details.pickupDetails?.scheduledAt ? "Reschedule Pickup" : "Schedule Pickup"}
            </button>
          )}

          {canVerifyPick && (
            <button
              type="button"
              className="rtd-action-btn btn-picked"
              onClick={handleVerifyOtpAndPick}
              disabled={busy}
            >
              Verify OTP & Mark Picked
            </button>
          )}

          {canInspect && (
            <button
              type="button"
              className="rtd-action-btn btn-inspect"
              onClick={() => setShowInspectModal(true)}
              disabled={busy}
            >
              Quality Inspection
            </button>
          )}

          {canRefund && (
            <button
              type="button"
              className="rtd-action-btn btn-refund"
              onClick={() => handleUpdateStatus("refunded")}
              disabled={busy}
            >
              Process Refund (₹{Number(details.amount || 0).toFixed(2)})
            </button>
          )}

          {canReplace && (
            <button
              type="button"
              className="rtd-action-btn btn-replace"
              onClick={() => handleUpdateStatus("replaced")}
              disabled={busy}
            >
              Mark Replaced
            </button>
          )}

          {canReject && (
            <button
              type="button"
              className="rtd-action-btn btn-reject"
              onClick={() => handleUpdateStatus("rejected")}
              disabled={busy}
            >
              Reject
            </button>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="rtd-grid-layout">
        {/* LEFT COLUMN: CASE DETAILS & EVIDENCE */}
        <div className="rtd-col-main">
          {/* RETURN REASON & NOTES */}
          <div className="rtd-section-card">
            <h3 className="rtd-section-title">Return Reason & Customer Statement</h3>
            <div className="rtd-fields-grid">
              <div className="rtd-field">
                <span className="rtd-field-label">Reason</span>
                <span className="rtd-field-val highlight">{details.reason || "Not specified"}</span>
              </div>
              <div className="rtd-field">
                <span className="rtd-field-label">Preferred Resolution</span>
                <span className="rtd-field-val capitalize">{details.type || "Refund"}</span>
              </div>
              <div className="rtd-field full">
                <span className="rtd-field-label">Customer Note / Issue Description</span>
                <span className="rtd-field-val note">{details.note || "No note provided"}</span>
              </div>
            </div>
          </div>

          {/* CUSTOMER-UPLOADED DAMAGED ITEM PHOTOS */}
          <div className="rtd-section-card">
            <div className="rtd-section-header">
              <h3 className="rtd-section-title">Customer Damaged Item Photo(s)</h3>
              <span className="rtd-count-pill">{proofPhotos.length} photo(s)</span>
            </div>

            {proofPhotos.length > 0 ? (
              <div className="rtd-photos-grid">
                {proofPhotos.map((img, i) => (
                  <div
                    key={i}
                    className="rtd-photo-card"
                    onClick={() => setActivePhoto(resolveImage(img))}
                    title="Click to zoom in"
                  >
                    <img src={resolveImage(img)} alt={`Damaged item ${i + 1}`} />
                    <span className="rtd-photo-zoom-hint">🔍 Zoom</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rtd-empty-text">No damage photos attached by customer.</p>
            )}
          </div>

          {/* PICKUP & OTP DETAILS */}
          {details.pickupDetails && (
            <div className="rtd-section-card">
              <div className="rtd-section-header">
                <h3 className="rtd-section-title">Pickup Schedule & Verification OTP</h3>
                {details.pickupDetails.otpVerified ? (
                  <span className="rtd-badge-ok">✓ OTP Verified</span>
                ) : (
                  <span className="rtd-badge-pending">Pending Verification</span>
                )}
              </div>

              {/* OTP BOX */}
              {details.pickupDetails.otp && (
                <div className="rtd-otp-banner">
                  <div className="rtd-otp-left">
                    <span className="rtd-otp-tag">Customer Pickup OTP</span>
                    <span className="rtd-otp-digits">{details.pickupDetails.otp}</span>
                    <span className="rtd-otp-sub">
                      Ask customer for this 4-digit code to verify return package collection.
                    </span>
                  </div>
                  {!details.pickupDetails.otpVerified && (
                    <button
                      type="button"
                      className="rtd-btn-verify-otp"
                      onClick={handleVerifyOtpAndPick}
                    >
                      Verify OTP Now
                    </button>
                  )}
                </div>
              )}

              <div className="rtd-fields-grid">
                <div className="rtd-field">
                  <span className="rtd-field-label">Scheduled Date & Time</span>
                  <span className="rtd-field-val">
                    {formatDateTime(details.pickupDetails.scheduledAt)}
                  </span>
                </div>
                <div className="rtd-field">
                  <span className="rtd-field-label">Time Window</span>
                  <span className="rtd-field-val">{details.pickupDetails.slot || "—"}</span>
                </div>
                <div className="rtd-field">
                  <span className="rtd-field-label">Assigned Executive</span>
                  <span className="rtd-field-val">
                    {details.pickupDetails.agent || "Not assigned"}
                    {details.pickupDetails.agentPhone && ` (${details.pickupDetails.agentPhone})`}
                  </span>
                </div>
                <div className="rtd-field full">
                  <span className="rtd-field-label">Pickup Address</span>
                  <span className="rtd-field-val">{details.pickupDetails.address || "—"}</span>
                </div>
                {details.pickupDetails.instructions && (
                  <div className="rtd-field full">
                    <span className="rtd-field-label">Customer Instructions</span>
                    <span className="rtd-field-val note">{details.pickupDetails.instructions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUALITY INSPECTION REPORT */}
          {details.inspectionReport?.inspectedAt && (
            <div className="rtd-section-card">
              <h3 className="rtd-section-title">Quality Inspection Report</h3>
              <div className="rtd-fields-grid">
                <div className="rtd-field">
                  <span className="rtd-field-label">Verdict</span>
                  <span className="rtd-field-val highlight" style={{ textTransform: "capitalize" }}>
                    {details.inspectionReport.verdict || "—"}
                  </span>
                </div>
                <div className="rtd-field">
                  <span className="rtd-field-label">Observed Condition</span>
                  <span className="rtd-field-val" style={{ textTransform: "capitalize" }}>
                    {details.inspectionReport.condition || "—"}
                  </span>
                </div>
                <div className="rtd-field">
                  <span className="rtd-field-label">Inspected On</span>
                  <span className="rtd-field-val">
                    {formatDateTime(details.inspectionReport.inspectedAt)}
                  </span>
                </div>
                {details.inspectionReport.note && (
                  <div className="rtd-field full">
                    <span className="rtd-field-label">Inspector Notes</span>
                    <span className="rtd-field-val note">{details.inspectionReport.note}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RETURNED PRODUCT ITEMS */}
          <div className="rtd-section-card">
            <h3 className="rtd-section-title">Order Items</h3>
            <div className="rtd-table-wrapper">
              <table className="rtd-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(details.items || [details.product]).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.name || item.productName || "Product Item"}</strong>
                        {item.sku && <div className="rtd-subtext">SKU: {item.sku}</div>}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.qty || item.quantity || 1}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(item.price || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER & LOGS */}
        <div className="rtd-col-side">
          {/* CUSTOMER INFORMATION CARD */}
          <div className="rtd-section-card">
            <h3 className="rtd-section-title">Customer Information</h3>
            <div className="rtd-side-fields">
              <div className="rtd-side-item">
                <span className="rtd-side-label">Customer Name</span>
                <span className="rtd-side-val strong">{details.customer?.name || "Customer"}</span>
              </div>
              <div className="rtd-side-item">
                <span className="rtd-side-label">Phone Number</span>
                <span className="rtd-side-val">
                  {details.customer?.phone ? (
                    <a href={`tel:${details.customer.phone}`} className="rtd-phone-link">
                      {details.customer.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              <div className="rtd-side-item">
                <span className="rtd-side-label">Email Address</span>
                <span className="rtd-side-val">{details.customer?.email || "—"}</span>
              </div>
              <div className="rtd-side-item">
                <span className="rtd-side-label">Delivery Address</span>
                <span className="rtd-side-val address">{details.deliveryAddress || "—"}</span>
              </div>
            </div>
          </div>

          {/* STATUS HISTORY TIMELINE CARD */}
          {Array.isArray(details.statusHistory) && details.statusHistory.length > 0 && (
            <div className="rtd-section-card">
              <h3 className="rtd-section-title">Activity Timeline</h3>
              <div className="rtd-timeline">
                {details.statusHistory.map((step, idx) => (
                  <div key={idx} className="rtd-timeline-item">
                    <div className="rtd-timeline-dot"></div>
                    <div className="rtd-timeline-content">
                      <span className="rtd-timeline-status">{step.status}</span>
                      {step.note && <span className="rtd-timeline-note">{step.note}</span>}
                      {step.timestamp && (
                        <span className="rtd-timeline-time">{formatDateTime(step.timestamp)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SCHEDULE PICKUP MODAL */}
      {showPickupModal && (
        <div className="rtd-modal-backdrop" onClick={() => setShowPickupModal(false)}>
          <div className="rtd-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rtd-modal-header">
              <h3>Schedule Return Pickup</h3>
              <button
                type="button"
                className="rtd-modal-close"
                onClick={() => setShowPickupModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitPickupSchedule} className="rtd-modal-body">
              <div className="rtd-form-group">
                <label>Pickup Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={pickupForm.scheduledAt}
                  onChange={(e) =>
                    setPickupForm((f) => ({ ...f, scheduledAt: e.target.value }))
                  }
                />
              </div>

              <div className="rtd-form-group">
                <label>Time Slot</label>
                <select
                  value={pickupForm.slot}
                  onChange={(e) => setPickupForm((f) => ({ ...f, slot: e.target.value }))}
                >
                  {PICKUP_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rtd-form-group">
                <label>Delivery Agent / Executive Name</label>
                <input
                  value={pickupForm.agent}
                  onChange={(e) => setPickupForm((f) => ({ ...f, agent: e.target.value }))}
                  placeholder="e.g. Suresh Kumar"
                />
              </div>

              <div className="rtd-form-group">
                <label>Agent Phone Number</label>
                <input
                  value={pickupForm.agentPhone}
                  onChange={(e) => setPickupForm((f) => ({ ...f, agentPhone: e.target.value }))}
                  placeholder="+91 98878 68746"
                />
              </div>

              <div className="rtd-form-group">
                <label>Pickup Address</label>
                <textarea
                  rows={2}
                  value={pickupForm.address}
                  onChange={(e) => setPickupForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>

              <div className="rtd-form-group">
                <label>Customer Instructions</label>
                <input
                  value={pickupForm.instructions}
                  onChange={(e) => setPickupForm((f) => ({ ...f, instructions: e.target.value }))}
                />
              </div>

              <div className="rtd-modal-footer">
                <button
                  type="button"
                  className="rtd-btn-cancel"
                  onClick={() => setShowPickupModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="rtd-btn-submit" disabled={busy}>
                  {busy ? "Scheduling..." : "Schedule & Generate OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUALITY INSPECTION MODAL */}
      {showInspectModal && (
        <div className="rtd-modal-backdrop" onClick={() => setShowInspectModal(false)}>
          <div className="rtd-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rtd-modal-header">
              <h3>Quality Inspection</h3>
              <button
                type="button"
                className="rtd-modal-close"
                onClick={() => setShowInspectModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitInspection} className="rtd-modal-body">
              <div className="rtd-form-group">
                <label>Inspection Verdict</label>
                <select
                  value={inspectForm.verdict}
                  onChange={(e) => setInspectForm((f) => ({ ...f, verdict: e.target.value }))}
                >
                  <option value="approved">Approve Return (Items Valid)</option>
                  <option value="rejected">Reject Return (Items Invalid / Used)</option>
                </select>
              </div>

              <div className="rtd-form-group">
                <label>Observed Condition</label>
                <select
                  value={inspectForm.condition}
                  onChange={(e) => setInspectForm((f) => ({ ...f, condition: e.target.value }))}
                >
                  <option value="damaged">Damaged</option>
                  <option value="expired">Expired</option>
                  <option value="wrong">Wrong Item</option>
                  <option value="opened">Opened / Used</option>
                  <option value="good">Good Condition</option>
                </select>
              </div>

              <div className="rtd-form-group">
                <label>Inspector Notes</label>
                <textarea
                  rows={3}
                  value={inspectForm.note}
                  onChange={(e) => setInspectForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Seal broken, verified damage matches customer photo..."
                />
              </div>

              <div className="rtd-modal-footer">
                <button
                  type="button"
                  className="rtd-btn-cancel"
                  onClick={() => setShowInspectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="rtd-btn-submit" disabled={busy}>
                  {busy ? "Saving..." : "Save Inspection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div className="rtd-lightbox-backdrop" onClick={() => setActivePhoto(null)}>
          <div className="rtd-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="rtd-lightbox-close"
              onClick={() => setActivePhoto(null)}
            >
              ✕
            </button>
            <img src={activePhoto} alt="Full view damage photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnDetails;

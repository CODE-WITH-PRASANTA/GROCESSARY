import React, { useState, useEffect, useMemo } from "react";
import API, { BASE_URL } from "../../../api/axios";
import "./ReturnManagement.css";

// ======================================================
// STATUS META
// ======================================================
const STATUS = {
  requested:        { label: "Pending",           color: "#d97706", bg: "#fef3c7" },
  approved:         { label: "Approved",          color: "#2563eb", bg: "#dbeafe" },
  pickup_scheduled: { label: "Pickup Scheduled",  color: "#7c3aed", bg: "#ede9fe" },
  picked:           { label: "Picked Up",         color: "#0891b2", bg: "#cffafe" },
  inspection:       { label: "In Inspection",     color: "#ea580c", bg: "#ffedd5" },
  refunded:         { label: "Refunded",          color: "#16a34a", bg: "#dcfce7" },
  rejected:         { label: "Rejected",          color: "#dc2626", bg: "#fee2e2" },
  replaced:         { label: "Replaced",          color: "#16a34a", bg: "#dcfce7" },
};

const FILTERS = [
  { value: "All",              label: "All" },
  { value: "requested",        label: "Pending" },
  { value: "approved",         label: "Approved" },
  { value: "pickup_scheduled", label: "Pickup Scheduled" },
  { value: "picked",           label: "Picked Up" },
  { value: "inspection",       label: "In Inspection" },
  { value: "refunded",         label: "Refunded" },
  { value: "rejected",         label: "Rejected" },
  { value: "replaced",         label: "Replaced" },
];

const TERMINAL = ["refunded", "replaced", "rejected"];

const PICKUP_SLOTS = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM",
  "3:00 PM – 5:00 PM",
  "5:00 PM – 7:00 PM",
];

const CONDITIONS = [
  { value: "good",     label: "Good" },
  { value: "damaged",  label: "Damaged" },
  { value: "opened",   label: "Opened / Used" },
  { value: "expired",  label: "Expired" },
  { value: "wrong",    label: "Wrong Item" },
  { value: "other",    label: "Other" },
];

// ======================================================
// HELPERS
// ======================================================
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

// Convert ISO → value for <input type="datetime-local">
const toLocalInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ======================================================
// COMPONENT
// ======================================================
const ReturnManagement = () => {
  const [returns, setReturns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // ---- Pickup modal state ----
  const [pickupModal, setPickupModal] = useState(null); // { id, orderNumber }
  const [pickupForm, setPickupForm] = useState({
    scheduledAt: "",
    slot: "",
    agent: "",
    agentPhone: "",
    address: "",
    instructions: "",
  });

  // ---- Inspection modal state ----
  const [inspectModal, setInspectModal] = useState(null);
  const [inspectForm, setInspectForm] = useState({
    verdict: "approved",
    condition: "",
    note: "",
  });

  // ==================================================
  // LOAD
  // ==================================================
  const loadReturns = async () => {
    try {
      setLoading(true);
      setError("");

      const params = filter !== "All" ? { status: filter } : {};
      const { data } = await API.get("/admin/returns", { params });

      setReturns(data?.success && Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
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

  // ==================================================
  // SELECTED
  // ==================================================
  const selected = useMemo(
    () => returns.find((r) => r.id === selectedId) || null,
    [returns, selectedId]
  );

  const status = selected?.status;
  const isTerminal = selected && TERMINAL.includes(status);

  const canApprove  = selected && status === "requested";
  const canSchedule = selected && status === "approved";
  const canPickup   = selected && status === "pickup_scheduled";
  const canInspect  = selected && status === "picked";
  const canRefund   = selected && ["approved", "pickup_scheduled", "picked", "inspection"].includes(status);
  const canReplace  = selected && ["approved", "pickup_scheduled", "picked", "inspection"].includes(status);
  const canReject   = selected && !isTerminal;

  // ==================================================
  // PICKUP MODAL
  // ==================================================
  const openPickupModal = () => {
    if (!selected) return;
    setPickupModal({
      id: selected.id,
      orderNumber: selected.orderNumber || selected.id,
    });
    setPickupForm({
      scheduledAt: "",
      slot: "",
      agent: "",
      agentPhone: "",
      address: selected.address || selected.deliveryAddress?.address || "",
      instructions: "",
    });
  };

  const submitPickup = async () => {
    if (!pickupModal) return;
    if (!pickupForm.scheduledAt) {
      alert("Please pick a pickup date & time.");
      return;
    }

    try {
      setBusy(true);

      const { data } = await API.put(
        `/admin/returns/${pickupModal.id}/schedule-pickup`,
        pickupForm
      );

      // Update row in place
      setReturns((prev) =>
        prev.map((r) =>
          r.id === pickupModal.id
            ? {
                ...r,
                status: "pickup_scheduled",
                pickupDetails: data?.order?.pickupDetails || pickupForm,
              }
            : r
        )
      );

      alert(
        data?.message ||
          `Pickup scheduled. OTP: ${data?.order?.pickupDetails?.otp || "generated"}`
      );
      setPickupModal(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to schedule pickup.");
    } finally {
      setBusy(false);
    }
  };

  // ==================================================
  // INSPECTION MODAL
  // ==================================================
  const openInspectModal = () => {
    if (!selected) return;
    setInspectModal({
      id: selected.id,
      orderNumber: selected.orderNumber || selected.id,
    });
    setInspectForm({
      verdict: "approved",
      condition: "",
      note: "",
    });
  };

  const submitInspection = async () => {
    if (!inspectModal) return;

    try {
      setBusy(true);

      await API.put(
        `/admin/returns/${inspectModal.id}/inspection`,
        inspectForm
      );

      setReturns((prev) =>
        prev.map((r) =>
          r.id === inspectModal.id
            ? { ...r, status: "inspection" }
            : r
        )
      );

      alert("Inspection saved.");
      setInspectModal(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to record inspection.");
    } finally {
      setBusy(false);
    }
  };

  // ==================================================
  // SIMPLE STATUS UPDATE (approve / refund / replace / reject)
  // ==================================================
  const updateStatus = async (nextStatus) => {
    if (!selected) return;

    const verbs = {
      approved: "approve",
      rejected: "reject",
      refunded: "process refund for",
      replaced: "mark replaced",
    };

    const verb = verbs[nextStatus] || `update ${nextStatus} for`;

    if (!window.confirm(`Are you sure you want to ${verb} this return?`)) return;

    try {
      setBusy(true);

      const payload = { status: nextStatus };
      if (nextStatus === "refunded") {
        payload.amount = Number(selected.amount || 0);
      }

      await API.put(`/admin/returns/${selected.id}/status`, payload);

      setReturns((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, status: nextStatus } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update return.");
      await loadReturns();
    } finally {
      setBusy(false);
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  if (loading) return <div className="rm-page">Loading returns…</div>;
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
        <h1>Return Management</h1>
        <button className="rm-refresh" onClick={loadReturns}>
          Refresh
        </button>
      </div>

      {/* Filter chips */}
      <div className="rm-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`rm-filter ${filter === f.value ? "active" : ""}`}
            onClick={() => {
              setFilter(f.value);
              setSelectedId(null);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rm-table-wrap">
        <table className="rm-table">
          <thead>
            <tr>
              <th></th>
              <th>Order</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Requested</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td colSpan="9" className="rm-empty">
                  No return requests found.
                </td>
              </tr>
            ) : (
              returns.map((row) => {
                const meta = STATUS[row.status] || {
                  label: row.status,
                  color: "#64748b",
                  bg: "#f1f5f9",
                };

                return (
                  <tr
                    key={row.id}
                    className={selectedId === row.id ? "rm-row-selected" : ""}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td>
                      <input
                        type="radio"
                        name="selected"
                        checked={selectedId === row.id}
                        onChange={() => setSelectedId(row.id)}
                      />
                    </td>
                    <td>{row.orderNumber || row.id}</td>
                    <td>
                      <div className="rm-cell-strong">{row.customer?.name}</div>
                      <div className="rm-cell-sub">{row.customer?.phone}</div>
                    </td>
                    <td>
                      <div className="rm-cell-strong">{row.product?.name}</div>
                      <div className="rm-cell-sub">{row.product?.sku}</div>
                    </td>
                    <td>{row.qty}</td>
                    <td>{row.reason}</td>
                    <td>{formatDate(row.requestedAt)}</td>
                    <td>₹{Number(row.amount || 0).toFixed(2)}</td>
                    <td>
                      <span
                        className="rm-badge"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected details panel */}
      {selected && (
        <div className="rm-detail-panel">
          <h3>
            Return for {selected.orderNumber || selected.id} ·{" "}
            {selected.customer?.name}
          </h3>

          <div className="rm-detail-grid">
            <div>
              <span className="rm-detail-label">Reason</span>
              <span>{selected.reason || "—"}</span>
            </div>
            <div>
              <span className="rm-detail-label">Amount</span>
              <span>₹{Number(selected.amount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="rm-detail-label">Requested</span>
              <span>{formatDate(selected.requestedAt)}</span>
            </div>
            <div>
              <span className="rm-detail-label">Product</span>
              <span>
                {selected.product?.name} · Qty {selected.qty}
              </span>
            </div>
          </div>

          {/* Pickup details block */}
          {selected.pickupDetails?.scheduledAt && (
            <div className="rm-pickup-block">
              <h4>Pickup Details</h4>
              <p>
                <strong>When:</strong>{" "}
                {formatDateTime(selected.pickupDetails.scheduledAt)}
                {selected.pickupDetails.slot
                  ? ` · ${selected.pickupDetails.slot}`
                  : ""}
              </p>
              {selected.pickupDetails.agent && (
                <p>
                  <strong>Agent:</strong> {selected.pickupDetails.agent}
                  {selected.pickupDetails.agentPhone
                    ? ` · ${selected.pickupDetails.agentPhone}`
                    : ""}
                </p>
              )}
              {selected.pickupDetails.address && (
                <p>
                  <strong>Address:</strong> {selected.pickupDetails.address}
                </p>
              )}
              {selected.pickupDetails.instructions && (
                <p>
                  <strong>Instructions:</strong>{" "}
                  {selected.pickupDetails.instructions}
                </p>
              )}
              {selected.pickupDetails.otp && (
                <p>
                  <strong>OTP:</strong>{" "}
                  <span className="rm-otp">
                    {selected.pickupDetails.otp}
                  </span>{" "}
                  {selected.pickupDetails.otpVerified ? (
                    <span className="rm-otp-ok">Verified ✓</span>
                  ) : (
                    <span className="rm-otp-pending">Not verified</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* User proof images */}
          {Array.isArray(selected.pickupProof?.images) &&
            selected.pickupProof.images.length > 0 && (
              <div className="rm-proof-block">
                <h4>Customer-uploaded Photos</h4>
                <div className="rm-proof-grid">
                  {selected.pickupProof.images.map((img, i) => (
                    <a
                      key={i}
                      href={resolveImage(img)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={resolveImage(img)} alt={`proof-${i}`} />
                    </a>
                  ))}
                </div>
                {selected.pickupProof.condition && (
                  <p>
                    <strong>Condition:</strong> {selected.pickupProof.condition}
                  </p>
                )}
                {selected.pickupProof.note && (
                  <p>
                    <strong>Customer note:</strong> {selected.pickupProof.note}
                  </p>
                )}
                {selected.pickupProof.uploadedAt && (
                  <p>
                    <strong>Uploaded:</strong>{" "}
                    {formatDateTime(selected.pickupProof.uploadedAt)}
                  </p>
                )}
              </div>
            )}

          {/* Inspection report */}
          {selected.inspectionReport?.inspectedAt && (
            <div className="rm-inspection-block">
              <h4>Inspection Report</h4>
              <p>
                <strong>Verdict:</strong>{" "}
                <span
                  className={`rm-verdict rm-verdict-${
                    selected.inspectionReport.verdict || "unknown"
                  }`}
                >
                  {selected.inspectionReport.verdict}
                </span>
              </p>
              {selected.inspectionReport.condition && (
                <p>
                  <strong>Condition:</strong>{" "}
                  {selected.inspectionReport.condition}
                </p>
              )}
              {selected.inspectionReport.note && (
                <p>
                  <strong>Notes:</strong> {selected.inspectionReport.note}
                </p>
              )}
              <p>
                <strong>Inspected:</strong>{" "}
                {formatDateTime(selected.inspectionReport.inspectedAt)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="rm-actions">
        <div className="rm-selected-info">
          {selected ? (
            <>
              <span className="rm-selected-label">
                Selected:{" "}
                <strong>{selected.orderNumber || selected.id}</strong>
              </span>
              <span
                className="rm-badge"
                style={{
                  color: (STATUS[selected.status] || {}).color || "#64748b",
                  background: (STATUS[selected.status] || {}).bg || "#f1f5f9",
                }}
              >
                {(STATUS[selected.status] || {}).label || selected.status}
              </span>
            </>
          ) : (
            <span className="rm-selected-label">
              Select a row to take action
            </span>
          )}
        </div>

        <div className="rm-action-buttons">
          <button
            className="rm-btn rm-btn-approve"
            disabled={!canApprove || busy}
            onClick={() => updateStatus("approved")}
          >
            Approve
          </button>

          <button
            className="rm-btn rm-btn-schedule"
            disabled={!canSchedule || busy}
            onClick={openPickupModal}
          >
            Schedule Pickup
          </button>

          <button
            className="rm-btn rm-btn-inspect"
            disabled={!canInspect || busy}
            onClick={openInspectModal}
          >
            Inspect
          </button>

          <button
            className="rm-btn rm-btn-refund"
            disabled={!canRefund || busy}
            onClick={() => updateStatus("refunded")}
          >
            Process Refund
          </button>

          <button
            className="rm-btn rm-btn-replace"
            disabled={!canReplace || busy}
            onClick={() => updateStatus("replaced")}
          >
            Mark Replaced
          </button>

          <button
            className="rm-btn rm-btn-reject"
            disabled={!canReject || busy}
            onClick={() => updateStatus("rejected")}
          >
            Reject
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* SCHEDULE PICKUP MODAL */}
      {/* ===================== */}
      {pickupModal && (
        <div className="rm-modal-overlay" onClick={() => setPickupModal(null)}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Pickup — {pickupModal.orderNumber}</h3>

            <label>
              Pickup Date & Time *
              <input
                type="datetime-local"
                value={pickupForm.scheduledAt}
                onChange={(e) =>
                  setPickupForm((f) => ({ ...f, scheduledAt: e.target.value }))
                }
              />
            </label>

            <label>
              Time Slot
              <select
                value={pickupForm.slot}
                onChange={(e) =>
                  setPickupForm((f) => ({ ...f, slot: e.target.value }))
                }
              >
                <option value="">Select a slot…</option>
                {PICKUP_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Delivery Agent Name
              <input
                value={pickupForm.agent}
                onChange={(e) =>
                  setPickupForm((f) => ({ ...f, agent: e.target.value }))
                }
                placeholder="e.g. Suresh"
              />
            </label>

            <label>
              Agent Phone
              <input
                value={pickupForm.agentPhone}
                onChange={(e) =>
                  setPickupForm((f) => ({ ...f, agentPhone: e.target.value }))
                }
                placeholder="+91 98xxx xxxxx"
              />
            </label>

            <label>
              Pickup Address
              <input
                value={pickupForm.address}
                onChange={(e) =>
                  setPickupForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </label>

            <label>
              Instructions for Customer
              <textarea
                rows="2"
                value={pickupForm.instructions}
                onChange={(e) =>
                  setPickupForm((f) => ({ ...f, instructions: e.target.value }))
                }
                placeholder="Keep the item packed and ready…"
              />
            </label>

            <div className="rm-modal-actions">
              <button
                className="rm-btn-secondary"
                onClick={() => setPickupModal(null)}
              >
                Cancel
              </button>
              <button
                className="rm-btn-primary"
                disabled={busy}
                onClick={submitPickup}
              >
                {busy ? "Saving…" : "Schedule & Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* INSPECTION MODAL */}
      {/* ===================== */}
      {inspectModal && (
        <div className="rm-modal-overlay" onClick={() => setInspectModal(null)}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Inspection — {inspectModal.orderNumber}</h3>

            {/* Show the customer's photos right inside the modal */}
            {Array.isArray(selected?.pickupProof?.images) &&
              selected.pickupProof.images.length > 0 && (
                <div className="rm-proof-inline">
                  <p className="rm-proof-inline-label">
                    Customer-uploaded photos:
                  </p>
                  <div className="rm-proof-grid">
                    {selected.pickupProof.images.map((img, i) => (
                      <a
                        key={i}
                        href={resolveImage(img)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={resolveImage(img)} alt={`proof-${i}`} />
                      </a>
                    ))}
                  </div>
                  {selected.pickupProof.condition && (
                    <p>
                      <strong>Customer's stated condition:</strong>{" "}
                      {selected.pickupProof.condition}
                    </p>
                  )}
                </div>
              )}

            <label>
              Verdict
              <select
                value={inspectForm.verdict}
                onChange={(e) =>
                  setInspectForm((f) => ({ ...f, verdict: e.target.value }))
                }
              >
                <option value="approved">Approve Return</option>
                <option value="rejected">Reject Return</option>
              </select>
            </label>

            <label>
              Observed Condition
              <select
                value={inspectForm.condition}
                onChange={(e) =>
                  setInspectForm((f) => ({ ...f, condition: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Inspector Notes
              <textarea
                rows="3"
                value={inspectForm.note}
                onChange={(e) =>
                  setInspectForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="e.g. Seal broken, contents intact"
              />
            </label>

            <div className="rm-modal-actions">
              <button
                className="rm-btn-secondary"
                onClick={() => setInspectModal(null)}
              >
                Cancel
              </button>
              <button
                className="rm-btn-primary"
                disabled={busy}
                onClick={submitInspection}
              >
                {busy ? "Saving…" : "Save Inspection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;
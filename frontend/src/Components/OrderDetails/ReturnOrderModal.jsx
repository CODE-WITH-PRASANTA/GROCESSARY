import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Camera,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../api/axios";
import "./ReturnOrderModal.css";

const RETURN_REASONS = [
  "Damaged product",
  "Expired product",
  "Wrong item delivered",
  "Quality not as expected",
  "Missing item",
  "Other",
];

const ReturnOrderModal = ({ order, isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);

  const [reason, setReason] = useState("Damaged product");
  const [note, setNote] = useState("");
  const [returnType, setReturnType] = useState("refund");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !order) return null;

  // Handle File Selection with proper validation
  const handleFileChange = (e) => {
    setErrorMessage("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check count limit (max 4 images)
    if (selectedFiles.length + files.length > 4) {
      setErrorMessage("You can upload a maximum of 4 photos.");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage(`"${file.name}" is not a valid image file.`);
        return;
      }

      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 5MB file size limit.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    // Reset input value so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove preview photo
  const handleRemovePhoto = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Submit Return Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Proper Validation
    if (!reason) {
      setErrorMessage("Please select a reason for return.");
      return;
    }

    // Require photo if damaged or expired product
    if (
      (reason === "Damaged product" || reason === "Expired product") &&
      selectedFiles.length === 0
    ) {
      setErrorMessage(
        "Please upload at least one photo showing the damaged/expired product."
      );
      return;
    }

    if (reason === "Other" && !note.trim()) {
      setErrorMessage("Please provide a note describing the issue.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("note", note.trim());
      formData.append("type", returnType);

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await API.post(`/orders/${order._id}/return`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Return Request Submitted",
          text: "Your return request has been submitted. Our team will review the details and initiate the return process.",
          confirmButtonColor: "#059669",
        });

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.data?.message || "Failed to submit return request.");
      }
    } catch (err) {
      console.error("Submit return error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Could not submit return request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="return-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="return-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="return-modal-header">
          <div className="return-modal-title-box">
            <div className="return-icon-badge">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3>Request Order Return</h3>
              <p className="return-modal-subtitle">
                Order #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="return-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="return-modal-form">
          {/* NOTICE BANNER */}
          <div className="return-info-banner">
            <AlertCircle size={16} className="info-icon" />
            <span>
              Orders delivered within the last 7 days are eligible for return. Please
              provide clear photos of damaged or defective items to expedite your refund.
            </span>
          </div>

          {errorMessage && (
            <div className="return-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* REASON DROPDOWN */}
          <div className="return-form-group">
            <label className="return-form-label">
              Reason for Return <span className="req">*</span>
            </label>
            <select
              className="return-select-input"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMessage("");
              }}
              required
            >
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* RETURN RESOLUTION TYPE */}
          <div className="return-form-group">
            <label className="return-form-label">Preferred Resolution</label>
            <div className="return-type-options">
              <label
                className={`return-type-pill ${returnType === "refund" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="returnType"
                  value="refund"
                  checked={returnType === "refund"}
                  onChange={() => setReturnType("refund")}
                />
                <span>Refund (Source / Wallet)</span>
              </label>

              <label
                className={`return-type-pill ${returnType === "replacement" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="returnType"
                  value="replacement"
                  checked={returnType === "replacement"}
                  onChange={() => setReturnType("replacement")}
                />
                <span>Replacement / Exchange</span>
              </label>
            </div>
          </div>

          {/* PHOTO UPLOAD SECTION (WHAT IS DAMAGED) */}
          <div className="return-form-group">
            <label className="return-form-label">
              Upload Damaged Product Photo(s){" "}
              {(reason === "Damaged product" || reason === "Expired product") && (
                <span className="req">*</span>
              )}
            </label>
            <p className="return-field-hint">
              Attach clear photos showing what is damaged or defective (PNG, JPG, WEBP - Max 5MB each, up to 4 photos).
            </p>

            {/* DROPZONE */}
            <div
              className="return-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                style={{ display: "none" }}
              />
              <UploadCloud size={28} className="upload-cloud-icon" />
              <div className="upload-prompt-text">
                <strong>Click to browse</strong> or drag & drop damaged item photos
              </div>
              <span className="upload-file-limit">Up to 4 images</span>
            </div>

            {/* THUMBNAIL PREVIEWS */}
            {previewUrls.length > 0 && (
              <div className="return-previews-grid">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="return-preview-chip">
                    <img src={url} alt={`Damaged item ${idx + 1}`} />
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Remove Photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADDITIONAL NOTE / COMMENTS */}
          <div className="return-form-group">
            <label className="return-form-label">
              Additional Note / Issue Description{" "}
              {reason === "Other" && <span className="req">*</span>}
            </label>
            <textarea
              className="return-textarea-input"
              rows={3}
              placeholder="Please explain the damage, missing items, or reason for return in detail..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={400}
            />
            <div className="textarea-char-count">{note.length} / 400</div>
          </div>

          {/* MODAL FOOTER */}
          <div className="return-modal-footer">
            <button
              type="button"
              className="btn-return-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-return-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="spin-icon" />
                  <span>Submitting Return...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Submit Return Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnOrderModal;


import React, { useState, useEffect } from "react";
import { Star, X, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import API from "../../api/axios";
import "./ReviewProductModal.css";

const RATING_LABELS = {
  1: "1 Star - Poor",
  2: "2 Stars - Fair",
  3: "3 Stars - Good",
  4: "4 Stars - Very Good",
  5: "5 Stars - Outstanding!",
};

const ReviewProductModal = ({
  isOpen,
  onClose,
  product,
  orderId,
  existingReview = null,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Prefill from user session if available
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setReviewerName(u.name);
        if (u.email) setReviewerEmail(u.email);
      }
    } catch (e) {}

    // If editing existing review
    if (existingReview) {
      setRating(Number(existingReview.rating) || 5);
      setTitle(existingReview.title || "");
      setComment(existingReview.comment || "");
      if (existingReview.reviewerName) setReviewerName(existingReview.reviewerName);
      if (existingReview.reviewerEmail) setReviewerEmail(existingReview.reviewerEmail);
    } else {
      setRating(5);
      setTitle("");
      setComment("");
    }

    setErrorMsg("");
  }, [isOpen, existingReview]);

  if (!isOpen || !product) return null;

  const prodId = product._id || product.id || product.productId;
  const prodName = product.productName || product.name || "Grocery Product";
  const prodImg = product.image || product.img || "/placeholder.png";
  const prodUnit = product.unit || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg("Please select a star rating between 1 and 5.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Please enter a short headline for your review.");
      return;
    }

    if (!comment.trim()) {
      setErrorMsg("Please write your detailed product review.");
      return;
    }

    if (!reviewerName.trim()) {
      setErrorMsg("Please provide your name.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productId: prodId,
        orderId: orderId || "",
        rating: Number(rating),
        title: title.trim(),
        comment: comment.trim(),
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        verifiedPurchase: true,
      };

      const res = await API.post("/reviews", payload);

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Review Submitted!",
          text:
            res.data.message ||
            "Thank you for sharing your feedback! Your review has been submitted for admin approval.",
          confirmButtonColor: "#0f2c28",
        });

        if (typeof onReviewSubmitted === "function") {
          onReviewSubmitted({
            productId: prodId,
            rating: Number(rating),
            title: title.trim(),
            comment: comment.trim(),
          });
        }

        onClose();
      } else {
        setErrorMsg(res.data?.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Could not submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeDisplayRating = hoverRating || rating;

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div
        className="review-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="review-modal-header">
          <div className="review-header-title-box">
            <h3>Rate &amp; Review Product</h3>
            <span className="verified-badge">
              <ShieldCheck size={14} /> Verified Buyer
            </span>
          </div>
          <button
            type="button"
            className="review-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product preview */}
        <div className="review-product-preview">
          <img src={prodImg} alt={prodName} className="review-prod-img" />
          <div className="review-prod-info">
            <h4 className="review-prod-name">{prodName}</h4>
            {prodUnit && <span className="review-prod-unit">{prodUnit}</span>}
            {orderId && (
              <span className="review-order-tag">Order #{orderId}</span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="review-error-banner">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-modal-form">
          {/* Star selector */}
          <div className="star-rating-block">
            <label className="star-rating-label">Overall Rating</label>
            <div
              className="star-buttons-row"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= activeDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    className={`star-pick-btn ${filled ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    aria-label={`${star} star`}
                  >
                    <Star
                      size={28}
                      fill={filled ? "#febb00" : "none"}
                      stroke={filled ? "#febb00" : "#94a3b8"}
                    />
                  </button>
                );
              })}
            </div>
            <span className="star-feedback-text">
              {RATING_LABELS[activeDisplayRating] || ""}
            </span>
          </div>

          {/* Review Headline */}
          <div className="review-form-field">
            <label htmlFor="review-title">Review Headline *</label>
            <input
              id="review-title"
              type="text"
              placeholder="e.g. Delicious & super fresh quality!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Review Details */}
          <div className="review-form-field">
            <label htmlFor="review-comment">Detailed Feedback *</label>
            <textarea
              id="review-comment"
              rows={4}
              placeholder="Tell others what you loved about this product, quality, taste, freshness, or packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              required
            />
            <span className="review-char-count">{comment.length}/1000</span>
          </div>

          {/* Name & Email Row */}
          <div className="review-user-row">
            <div className="review-form-field">
              <label htmlFor="review-author-name">Your Name *</label>
              <input
                id="review-author-name"
                type="text"
                placeholder="Full Name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
            </div>
            <div className="review-form-field">
              <label htmlFor="review-author-email">Email (Optional)</label>
              <input
                id="review-author-email"
                type="email"
                placeholder="email@example.com"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="review-modal-footer">
            <button
              type="button"
              className="review-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewProductModal;


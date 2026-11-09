import React, { useEffect, useState, useMemo } from "react";
import "./ProductDetailsTestimonials.css";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  PenTool,
  Award,
} from "lucide-react";
import API from "../../api/axios";
import ReviewProductModal from "../OrderDetails/ReviewProductModal";

const ProductDetailsTestimonials = ({ productId, product = null }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStarFilter, setActiveStarFilter] = useState("all");
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const fetchReviews = async () => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get(`/reviews/product/${productId}`);
      const list = res.data?.reviews || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load product reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Calculate Rating Statistics
  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        avgRating: 0,
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendPercent: 0,
      };
    }

    const total = reviews.length;
    let sum = 0;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
      sum += Number(r.rating) || 5;
    });

    const avg = (sum / total).toFixed(1);
    const positiveReviews = (counts[5] || 0) + (counts[4] || 0);
    const recommendPercent = Math.round((positiveReviews / total) * 100);

    const percentages = {
      5: Math.round(((counts[5] || 0) / total) * 100),
      4: Math.round(((counts[4] || 0) / total) * 100),
      3: Math.round(((counts[3] || 0) / total) * 100),
      2: Math.round(((counts[2] || 0) / total) * 100),
      1: Math.round(((counts[1] || 0) / total) * 100),
    };

    return {
      avgRating: Number(avg),
      totalReviews: total,
      breakdown: counts,
      percentages,
      recommendPercent,
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (activeStarFilter === "all") return reviews;
    const starNum = Number(activeStarFilter);
    return reviews.filter(
      (r) => Math.round(Number(r.rating) || 5) === starNum
    );
  }, [reviews, activeStarFilter]);

  const targetProduct = product || {
    _id: productId,
    productName: reviews[0]?.product?.productName || "Grocery Product",
  };

  return (
    <section className="pdt-reviews-section" id="customer-reviews-section">
      <div className="pdt-reviews-container">
        {/* SECTION HEADER */}
        <div className="pdt-section-header">
          <div className="pdt-header-left">
            <span className="pdt-badge">
              <Sparkles size={14} /> Verified Buyer Feedback
            </span>
            <h2 className="pdt-section-title">Customer Ratings & Reviews</h2>
            <p className="pdt-section-subtitle">
              Real reviews submitted by verified Grocery Sathi shoppers.
            </p>
          </div>

          <button
            type="button"
            className="pdt-write-review-btn"
            onClick={() => setIsWriteReviewOpen(true)}
          >
            <PenTool size={16} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* OVERVIEW SCORE & DISTRIBUTION CARD */}
        <div className="pdt-overview-card">
          <div className="pdt-score-summary">
            <div className="pdt-score-number">
              {stats.totalReviews > 0 ? stats.avgRating.toFixed(1) : "5.0"}
            </div>
            <div className="pdt-stars-wrapper">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={`pdt-star ${
                    star <= Math.round(stats.avgRating || 5) ? "filled" : ""
                  }`}
                />
              ))}
            </div>
            <div className="pdt-rating-count-text">
              Based on{" "}
              <strong>
                {stats.totalReviews}{" "}
                {stats.totalReviews === 1 ? "review" : "reviews"}
              </strong>
            </div>

            {stats.totalReviews > 0 && (
              <div className="pdt-recommend-pill">
                <ThumbsUp size={13} />
                <span>{stats.recommendPercent}% recommend this product</span>
              </div>
            )}
          </div>

          {/* DISTRIBUTION BARS */}
          <div className="pdt-distribution-block">
            <div className="pdt-distribution-title">Rating Breakdown</div>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.breakdown[stars] || 0;
              const pct = stats.percentages[stars] || 0;
              const isActive = activeStarFilter === String(stars);

              return (
                <div
                  key={stars}
                  className={`pdt-dist-row ${isActive ? "active" : ""}`}
                  onClick={() =>
                    setActiveStarFilter((prev) =>
                      prev === String(stars) ? "all" : String(stars)
                    )
                  }
                  title={`Filter by ${stars} Stars`}
                >
                  <span className="pdt-dist-stars">
                    {stars} <Star size={12} className="pdt-star-tiny" />
                  </span>
                  <div className="pdt-dist-track">
                    <div
                      className="pdt-dist-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="pdt-dist-percent">{pct}%</span>
                  <span className="pdt-dist-count">({count})</span>
                </div>
              );
            })}
          </div>

          {/* VERIFIED PURCHASE GUARANTEE BANNER */}
          <div className="pdt-guarantee-block">
            <div className="pdt-guarantee-icon">
              <ShieldCheck size={28} />
            </div>
            <div className="pdt-guarantee-content">
              <h4 className="pdt-guarantee-heading">100% Genuine Reviews</h4>
              <p className="pdt-guarantee-text">
                All reviews are collected directly from verified customer orders
                and approved by our quality control team.
              </p>
            </div>
            <div className="pdt-guarantee-perk">
              <Award size={15} /> Verified Buyer Protected
            </div>
          </div>
        </div>

        {/* FILTER CHIPS */}
        <div className="pdt-filter-bar">
          <span className="pdt-filter-label">Filter:</span>
          <button
            type="button"
            className={`pdt-filter-chip ${
              activeStarFilter === "all" ? "active" : ""
            }`}
            onClick={() => setActiveStarFilter("all")}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              className={`pdt-filter-chip ${
                activeStarFilter === String(star) ? "active" : ""
              }`}
              onClick={() => setActiveStarFilter(String(star))}
            >
              {star} Stars ({stats.breakdown[star] || 0})
            </button>
          ))}
        </div>

        {/* REVIEWS LISTING */}
        {loading ? (
          <div className="pdt-loading-state">
            <div className="pdt-spinner" />
            <p>Loading genuine reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="pdt-empty-state">
            <div className="pdt-empty-icon-wrap">
              <MessageSquare size={36} />
            </div>
            <h3 className="pdt-empty-title">
              {reviews.length === 0
                ? "No reviews yet for this product"
                : `No ${activeStarFilter}-star reviews found`}
            </h3>
            <p className="pdt-empty-text">
              {reviews.length === 0
                ? "Be the first to share your experience with other Grocery Sathi shoppers!"
                : "Try selecting a different star filter above."}
            </p>
            {reviews.length === 0 && (
              <button
                type="button"
                className="pdt-write-first-review-btn"
                onClick={() => setIsWriteReviewOpen(true)}
              >
                <PenTool size={16} /> Write the First Review
              </button>
            )}
          </div>
        ) : (
          <div className="pdt-reviews-grid">
            {filteredReviews.map((rev) => {
              const reviewerName =
                rev.reviewerName || rev.user?.name || "Verified Customer";
              const userAvatar =
                rev.user?.profileImage ||
                rev.user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  reviewerName
                )}&background=047857&color=ffffff&bold=true`;
              const formattedDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recently";

              const ratingNum = Math.min(
                5,
                Math.max(1, Math.round(Number(rev.rating) || 5))
              );

              return (
                <article key={rev._id} className="pdt-review-card">
                  {/* CARD HEADER */}
                  <div className="pdt-card-header">
                    <div className="pdt-reviewer-info">
                      <img
                        src={userAvatar}
                        alt={reviewerName}
                        className="pdt-reviewer-avatar"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            reviewerName
                          )}&background=047857&color=ffffff`;
                        }}
                      />
                      <div className="pdt-reviewer-text">
                        <div className="pdt-name-row">
                          <span className="pdt-reviewer-name">
                            {reviewerName}
                          </span>
                          {(rev.verifiedPurchase || rev.orderId || rev.order) && (
                            <span
                              className="pdt-verified-badge"
                              title="Verified Purchase from Grocery Sathi"
                            >
                              <CheckCircle2 size={13} />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="pdt-review-date">{formattedDate}</span>
                      </div>
                    </div>

                    {/* STARS */}
                    <div className="pdt-card-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          className={`pdt-card-star ${
                            s <= ratingNum ? "filled" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* REVIEW TITLE */}
                  {rev.title && (
                    <h4 className="pdt-review-title">{rev.title}</h4>
                  )}

                  {/* REVIEW COMMENT */}
                  <p className="pdt-review-comment">{rev.comment}</p>

                  {/* ADMIN REPLY (IF ANY) */}
                  {rev.adminReply && (
                    <div className="pdt-admin-reply-box">
                      <div className="pdt-admin-reply-header">
                        <ShieldCheck size={14} />
                        <strong>Grocery Sathi Support Response:</strong>
                      </div>
                      <p className="pdt-admin-reply-text">{rev.adminReply}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* REUSABLE REVIEW PRODUCT MODAL */}
      <ReviewProductModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        product={targetProduct}
        onReviewSubmitted={() => {
          fetchReviews();
        }}
      />
    </section>
  );
};

export default ProductDetailsTestimonials;

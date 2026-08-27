import React, { useEffect, useState } from "react";

import "./ProductDetailsVegetables.css";

// ======================================================
// LOCAL FALLBACK IMAGES
// ======================================================

import broccoliMain from "../../assets/vege1.webp";
import broccoliThumb1 from "../../assets/vege2.webp";
import broccoliThumb2 from "../../assets/vege4.webp";

const fallbackProductImages = [
  broccoliMain ||
    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=800&q=80",

  broccoliThumb1 ||
    "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=400&q=80",

  broccoliThumb2 ||
    "https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=400&q=80",
];

// ======================================================
// API
// ======================================================

const API_BASE_URL = "http://localhost:5000";

// ======================================================
// SVG ICONS
// ======================================================

const StarFilled = () => (
  <svg
    className="pdv__star-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#1b3935"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarOutline = () => (
  <svg
    className="pdv__star-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1b3935"
    strokeWidth="1.8"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ArrowLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const PencilIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const ScissorsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CheckBadge = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="#2eb5a2"
  >
    <rect width="20" height="20" x="2" y="2" rx="4" />
    <polyline
      points="7 12 10 15 17 8"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserPlaceholder = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#687e7c"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ======================================================
// PRODUCT DETAILS
// ======================================================

const ProductDetailsVegetables = ({ productId }) => {
  const [product, setProduct] = useState(null);

  const [activeImage, setActiveImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState("1 KG");

  const [quantity, setQuantity] = useState(1);

  const [isWishlisted, setIsWishlisted] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // FETCH PRODUCT BY ID
  // ====================================================

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "FETCHING PRODUCT:",
          `${API_BASE_URL}/api/products/${productId}`
        );

        const response = await fetch(
          `${API_BASE_URL}/api/products/${productId}`
        );

        const result = await response.json();

        console.log(
          "PRODUCT DETAILS API RESPONSE:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to fetch product."
          );
        }

        const productData =
          result?.product ||
          result?.data ||
          result;

        if (!productData?._id) {
          throw new Error(
            "Product not found."
          );
        }

        setProduct(productData);

        setActiveImage(0);
      } catch (err) {
        console.error(
          "Product details fetch error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ====================================================
  // IMAGE URL HELPER
  // ====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    // Object image support
    if (typeof image === "object") {
      const objectImage =
        image?.url ||
        image?.path ||
        image?.secure_url ||
        "";

      if (!objectImage) {
        return "";
      }

      image = objectImage;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${API_BASE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // ====================================================
  // PRODUCT IMAGES
  // ====================================================

  const productImages =
    Array.isArray(product?.images) &&
    product.images.length > 0
      ? product.images
          .map((image) => getImageUrl(image))
          .filter(Boolean)
      : fallbackProductImages;

  // ====================================================
  // KEEP ACTIVE IMAGE VALID
  // ====================================================

  useEffect(() => {
    if (
      activeImage >= productImages.length
    ) {
      setActiveImage(0);
    }
  }, [productImages.length, activeImage]);

  // ====================================================
  // IMAGE CONTROLS
  // ====================================================

  const handlePrevImage = () => {
    setActiveImage((prev) =>
      prev === 0
        ? productImages.length - 1
        : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImage((prev) =>
      prev === productImages.length - 1
        ? 0
        : prev + 1
    );
  };

  // ====================================================
  // CATEGORY NAME
  // ====================================================

  const categoryName =
    typeof product?.category === "object"
      ? product?.category?.name || "Category"
      : product?.category || "Category";

  // ====================================================
  // BRAND NAME
  // ====================================================

  const brandName =
    typeof product?.brand === "object"
      ? product?.brand?.name || ""
      : product?.brand || "";

  // ====================================================
  // UNIT NAME
  // ====================================================

  const unitName =
    typeof product?.unit === "object"
      ? product?.unit?.name ||
        product?.unit?.symbol ||
        ""
      : product?.unit || "";

  // ====================================================
  // PRICE
  // ====================================================

  const price = Number(
    product?.price || 0
  );

  const writtenPrice = Number(
    product?.writtenPrice || 0
  );

  const discountPrice = Number(
    product?.discountPrice || 0
  );

  // ====================================================
  // STOCK
  // ====================================================

  const stockQuantity = Number(
    product?.stockQuantity || 0
  );

  // ====================================================
  // DISCOUNT %
  // ====================================================

  let discountPercent = 0;

  if (
    writtenPrice > price &&
    writtenPrice > 0
  ) {
    discountPercent = Math.round(
      ((writtenPrice - price) /
        writtenPrice) *
        100
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="pdv">
        <div className="pdv__container">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !product) {
    return (
      <div className="pdv">
        <div className="pdv__container">
          <p>
            {error || "Product not found."}
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <div className="pdv">
      <div className="pdv__container">

        {/* ==================================================
            TOP HEADER NAVIGATION
        ================================================== */}

        <header className="pdv__top-bar">

          <button
            className="pdv__back-link"
            type="button"
            onClick={() =>
              window.history.back()
            }
          >
            <span className="pdv__back-circle">
              <ArrowLeft />
            </span>

            <span>
              Back to category
            </span>
          </button>

          <button
            className={`pdv__wishlist-btn ${
              isWishlisted
                ? "pdv__wishlist-btn--active"
                : ""
            }`}
            onClick={() =>
              setIsWishlisted(
                !isWishlisted
              )
            }
            type="button"
          >
            <span>
              Add to wishlist
            </span>

            <HeartIcon />
          </button>

        </header>

        {/* ==================================================
            3-COLUMN PRODUCT SHOWCASE
        ================================================== */}

        <div className="pdv__product-grid">

          {/* ==================================================
              COLUMN 1: INFO & CONTROLS
          ================================================== */}

          <section className="pdv__col pdv__col--info">

            <span className="pdv__badge">
              {categoryName}
            </span>

            <h1 className="pdv__title">
              {product?.productName ||
                product?.name ||
                "Product"}
            </h1>

            <span className="pdv__category-sub">
              {categoryName}
            </span>

            {/* ==================================================
                SIZE
            ================================================== */}

            <div className="pdv__option-group">

              <div className="pdv__option-label">
                Size: {selectedSize}
              </div>

              <div className="pdv__size-buttons">

                {["1 KG", "2 KG"].map(
                  (size) => (
                    <button
                      key={size}
                      type="button"
                      className={`pdv__size-btn ${
                        selectedSize === size
                          ? "pdv__size-btn--active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                    >
                      {size}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* ==================================================
                QUANTITY
            ================================================== */}

            <div className="pdv__option-group">

              <div className="pdv__option-label">
                Quantity :
              </div>

              <div className="pdv__qty-control">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(
                        1,
                        q - 1
                      )
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="pdv__qty-value">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => {
                      if (
                        stockQuantity > 0
                      ) {
                        return Math.min(
                          q + 1,
                          stockQuantity
                        );
                      }

                      return q + 1;
                    })
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>

            {/* ==================================================
                PRICE
            ================================================== */}

            <div className="pdv__price-tag">

              ₹{price.toFixed(2)}

              {writtenPrice >
                price &&
                writtenPrice > 0 && (
                  <>
                    {" "}
                    <del>
                      ₹
                      {writtenPrice.toFixed(
                        2
                      )}
                    </del>
                  </>
                )}

            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="pdv__actions-stack">

              <button
                className="pdv__btn-add-cart"
                type="button"
              >
                <span>
                  Add to Cart
                </span>

                <span className="pdv__btn-chevron">
                  ›
                </span>
              </button>

              <button
                className="pdv__btn-buy-now"
                type="button"
              >
                Buy it now
              </button>

            </div>

          </section>

          {/* ==================================================
              COLUMN 2: GALLERY & SLIDER
          ================================================== */}

          <section className="pdv__col pdv__col--gallery">

            <div className="pdv__main-image-wrap">

              <img
                src={
                  productImages[
                    activeImage
                  ]
                }
                alt={
                  product?.productName ||
                  "Product"
                }
                className="pdv__main-image"
                onError={(e) => {
                  e.currentTarget.src =
                    fallbackProductImages[0];
                }}
              />

            </div>

            <div className="pdv__gallery-footer">

              <div className="pdv__thumbnails">

                {productImages.map(
                  (img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pdv__thumb-btn ${
                        activeImage === idx
                          ? "pdv__thumb-btn--active"
                          : ""
                      }`}
                      onClick={() =>
                        setActiveImage(idx)
                      }
                    >
                      <img
                        src={img}
                        alt={`${
                          product?.productName ||
                          "Product"
                        } thumbnail ${
                          idx + 1
                        }`}
                        onError={(e) => {
                          e.currentTarget.src =
                            fallbackProductImages[
                              idx %
                                fallbackProductImages.length
                            ];
                        }}
                      />
                    </button>
                  )
                )}

              </div>

              <div className="pdv__carousel-controls">

                <button
                  type="button"
                  className="pdv__nav-btn"
                  onClick={
                    handlePrevImage
                  }
                  aria-label="Previous image"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="pdv__nav-btn pdv__nav-btn--muted"
                  onClick={
                    handleNextImage
                  }
                  aria-label="Next image"
                >
                  ›
                </button>

                <span className="pdv__slider-text">
                  Slide slider
                </span>

              </div>

            </div>

          </section>

          {/* ==================================================
              COLUMN 3: DESCRIPTION & META
          ================================================== */}

          <section className="pdv__col pdv__col--meta">

            <div className="pdv__rating-header">

              <div className="pdv__star-rating">
                <StarFilled />
                <StarFilled />
                <StarFilled />
                <StarFilled />
                <StarOutline />
              </div>

              <button
                className="pdv__link-action"
                type="button"
              >
                <PencilIcon />

                <span>
                  Write a Review
                </span>
              </button>

            </div>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div className="pdv__meta-section">

              <h2 className="pdv__section-heading">
                Description:
              </h2>

              <p className="pdv__desc-text">
                {product?.fullDescription ||
                  product?.shortDescription ||
                  "No description available."}
              </p>

            </div>

            {/* ==================================================
                ABOUT PRODUCT
            ================================================== */}

            <div className="pdv__meta-section">

              <h2 className="pdv__section-heading">
                About Product:
              </h2>

              {/* SKU */}

              <div className="pdv__spec-item">

                <span className="pdv__spec-label">
                  SKU:
                </span>

                <span className="pdv__spec-val">
                  {product?.sku ||
                    "N/A"}
                </span>

              </div>

              {/* CATEGORY */}

              <div className="pdv__spec-item">

                <span className="pdv__spec-label">
                  Category:
                </span>

                <span className="pdv__spec-val">
                  {categoryName}
                </span>

              </div>

              {/* BRAND */}

              {brandName && (
                <div className="pdv__spec-item">

                  <span className="pdv__spec-label">
                    Brand:
                  </span>

                  <span className="pdv__spec-val">
                    {brandName}
                  </span>

                </div>
              )}

              {/* UNIT */}

              {unitName && (
                <div className="pdv__spec-item">

                  <span className="pdv__spec-label">
                    Unit:
                  </span>

                  <span className="pdv__spec-val">
                    {unitName}
                  </span>

                </div>
              )}

              {/* STOCK */}

              <div className="pdv__spec-item">

                <span className="pdv__spec-label">
                  Stock:
                </span>

                <span className="pdv__spec-val">
                  {stockQuantity}
                </span>

              </div>

              {/* MRP */}

              {writtenPrice > 0 && (
                <div className="pdv__spec-item">

                  <span className="pdv__spec-label">
                    MRP:
                  </span>

                  <span className="pdv__spec-val">
                    ₹
                    {writtenPrice.toFixed(
                      2
                    )}
                  </span>

                </div>
              )}

              {/* DISCOUNT */}

              {discountPercent > 0 && (
                <div className="pdv__spec-item">

                  <span className="pdv__spec-label">
                    Discount:
                  </span>

                  <span className="pdv__spec-val">
                    {discountPercent}%
                  </span>

                </div>
              )}

            </div>

            {/* ==================================================
                FOOTER ACTIONS
            ================================================== */}

            <div className="pdv__footer-actions">

              <button
                className="pdv__link-action"
                type="button"
              >
                <ScissorsIcon />

                <span>
                  See Sizing Guide
                </span>
              </button>

              <button
                className="pdv__link-action"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      window.location.href
                    );
                  } catch (error) {
                    console.error(
                      "Share failed:",
                      error
                    );
                  }
                }}
              >
                <ShareIcon />

                <span>
                  Share
                </span>
              </button>

            </div>

          </section>

        </div>

        {/* ==================================================
            CUSTOMER REVIEWS
        ================================================== */}

        <section className="pdv__reviews-wrapper">

          <h2 className="pdv__reviews-title">
            Customer Reviews
          </h2>

          <div className="pdv__reviews-summary-card">

            {/* ==================================================
                LEFT SCORE BLOCK
            ================================================== */}

            <div className="pdv__score-summary">

              <div className="pdv__score-stars-row">

                <div className="pdv__star-rating">
                  <StarFilled />
                  <StarFilled />
                  <StarFilled />
                  <StarFilled />
                  <StarOutline />
                </div>

                <span className="pdv__score-val">
                  4.00 out of 5
                </span>

              </div>

              <div className="pdv__verified-row">

                <span>
                  Based on 1 review
                </span>

                <CheckBadge />

              </div>

            </div>

            {/* ==================================================
                MIDDLE RATING DISTRIBUTION
            ================================================== */}

            <div className="pdv__rating-breakdown">

              {[
                {
                  stars: 5,
                  filled: 5,
                  count: 0,
                  percent: 0,
                },
                {
                  stars: 4,
                  filled: 4,
                  count: 1,
                  percent: 100,
                },
                {
                  stars: 3,
                  filled: 3,
                  count: 0,
                  percent: 0,
                },
                {
                  stars: 2,
                  filled: 2,
                  count: 0,
                  percent: 0,
                },
                {
                  stars: 1,
                  filled: 1,
                  count: 0,
                  percent: 0,
                },
              ].map((row) => (

                <div
                  className="pdv__bar-row"
                  key={row.stars}
                >

                  <div className="pdv__bar-stars">

                    {[...Array(5)].map(
                      (_, i) =>
                        i < row.filled ? (
                          <StarFilled
                            key={i}
                          />
                        ) : (
                          <StarOutline
                            key={i}
                          />
                        )
                    )}

                  </div>

                  <div className="pdv__progress-track">

                    <div
                      className="pdv__progress-fill"
                      style={{
                        width: `${row.percent}%`,
                      }}
                    />

                  </div>

                  <span className="pdv__bar-count">
                    {row.count}
                  </span>

                </div>

              ))}

            </div>

            {/* ==================================================
                RIGHT REVIEW CTA
            ================================================== */}

            <div className="pdv__review-cta-wrap">

              <button
                className="pdv__btn-review"
                type="button"
              >
                Write a review
              </button>

            </div>

          </div>

          {/* ==================================================
              REVIEW LIST CARD
          ================================================== */}

          <div className="pdv__review-card-wrap">

            <article className="pdv__review-card">

              <div className="pdv__review-card-head">

                <div className="pdv__star-rating">
                  <StarFilled />
                  <StarFilled />
                  <StarFilled />
                  <StarFilled />
                  <StarOutline />
                </div>

                <time className="pdv__review-date">
                  04/25/2024
                </time>

              </div>

              <div className="pdv__reviewer-profile">

                <div className="pdv__reviewer-avatar">
                  <UserPlaceholder />
                </div>

                <span className="pdv__reviewer-name">
                  K.M.
                </span>

              </div>

              <h3 className="pdv__review-headline">
                Nice
              </h3>

              <p className="pdv__review-body">
                fwqfqfwqfqqqfwqfqwqwqwfc
                qwfeqsdwqd qwd
              </p>

            </article>

          </div>

        </section>

      </div>
    </div>
  );
};

export default ProductDetailsVegetables;
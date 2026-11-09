import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingBag,
  Zap,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Tag,
  Star,
  Copy,
  Package,
  Info,
  Minus,
  Plus,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  Award,
  Calendar,
  Barcode,
} from "lucide-react";
import API from "../../api/axios";
import "./ProductDetailsVegetables.css";

// ======================================================
// COMPONENT
// ======================================================

const ProductDetailsVegetables = ({ productId, onProductLoaded }) => {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const [coupons, setCoupons] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState("");

  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const productName = product?.productName || product?.name || "Product";
  const currentProductId = product?._id || product?.id || productId;

  // ====================================================
  // FETCH PRODUCT
  // ====================================================

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const fetchProduct = async () => {
      if (!productId) {
        setError("Product identifier is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data } = await API.get(
          `/products/${encodeURIComponent(productId)}`
        );
        const productData = data?.product || data?.data || data;

        if (!productData?._id) {
          throw new Error("Product not found.");
        }

        setProduct(productData);
        if (typeof onProductLoaded === "function") {
          onProductLoaded(productData);
        }
        setActiveImage(0);
      } catch (err) {
        console.error("Product details fetch error:", err);
        setError(
          err.response?.data?.message ||
            err?.message ||
            "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ====================================================
  // FETCH REVIEWS SUMMARY
  // ====================================================

  useEffect(() => {
    if (!product?._id) return;

    const fetchReviewStats = async () => {
      try {
        const res = await API.get(`/reviews/product/${product._id}`);
        const list = res.data?.reviews || [];
        const reviewsArr = Array.isArray(list) ? list : [];

        let totalReviews = reviewsArr.length;
        let averageRating = 0;
        const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        if (totalReviews > 0) {
          let sum = 0;
          reviewsArr.forEach((r) => {
            const val = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
            ratingBreakdown[val] = (ratingBreakdown[val] || 0) + 1;
            sum += Number(r.rating) || 5;
          });
          averageRating = Number((sum / totalReviews).toFixed(1));
        }

        setReviewSummary({
          totalReviews,
          averageRating,
          ratingBreakdown,
        });
      } catch (err) {
        // silent fallback
      }
    };

    fetchReviewStats();
  }, [product?._id]);

  // ====================================================
  // FETCH PUBLIC COUPONS
  // ====================================================

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        const res = await API.get("/coupons?status=Active&isPublic=true");
        const list = res.data?.data || res.data?.coupons || [];
        const now = new Date();
        const valid = (Array.isArray(list) ? list : []).filter((c) => {
          if (c.status !== "Active" || c.isPublic === false) return false;
          if (c.expiryDate && new Date(c.expiryDate) <= now) return false;
          return true;
        });
        setCoupons(valid.slice(0, 2));
      } catch (e) {
        // silent fallback
      }
    };

    fetchPublicCoupons();
  }, []);

  const handleCopyCoupon = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(""), 2000);
  };

  // ====================================================
  // IMAGE URL HELPER
  // ====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (typeof image === "object") {
      const objectImage = image?.url || image?.path || image?.secure_url || "";
      if (!objectImage) return "";
      image = objectImage;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const base = API.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    return `${base}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const productImages = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const mapped = product.images
        .map((img) => getImageUrl(img))
        .filter(Boolean);
      if (mapped.length > 0) return mapped;
    }
    // Fallback placeholder image
    return [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    ];
  }, [product]);

  useEffect(() => {
    if (activeImage >= productImages.length) {
      setActiveImage(0);
    }
  }, [productImages.length, activeImage]);

  // ====================================================
  // WISHLIST STATUS & TOGGLE
  // ====================================================

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const targetId = product?._id;

        if (!token || !targetId) {
          setIsWishlisted(false);
          return;
        }

        const response = await API.get(`/wishlist/check/${targetId}`);
        setIsWishlisted(Boolean(response.data?.isWishlisted));
      } catch (error) {
        setIsWishlisted(false);
      }
    };

    if (product?._id) {
      checkWishlistStatus();
    }

    const handleWishlistEvent = (e) => {
      if (e?.detail?.cleared || !localStorage.getItem("token")) {
        setIsWishlisted(false);
      } else if (product?._id) {
        checkWishlistStatus();
      }
    };

    window.addEventListener("wishlistUpdated", handleWishlistEvent);
    window.addEventListener("authChanged", handleWishlistEvent);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistEvent);
      window.removeEventListener("authChanged", handleWishlistEvent);
    };
  }, [product?._id]);

  const handleWishlistToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "info",
          title: "Sign in required",
          text: "Please sign in to save items to your wishlist.",
          confirmButtonColor: "#0d6b50",
          confirmButtonText: "Sign In",
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) navigate("/login");
        });
        return;
      }

      if (!product?._id || wishlistLoading) return;
      setWishlistLoading(true);

      if (isWishlisted) {
        await API.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        await API.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ====================================================
  // SHARE
  // ====================================================

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${productName} on Grocery Sathi!`;

    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    navigator.clipboard.writeText(shareUrl);
    Swal.fire({
      icon: "success",
      title: "Link Copied!",
      text: "Product link copied to clipboard.",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  // ====================================================
  // PRICE & STOCK CALCULATIONS
  // ====================================================

  const price = Number(product?.price || 0);
  const writtenPrice = Number(product?.writtenPrice || 0);
  const discountPrice = Number(product?.discountPrice || 0);
  const stockQuantity = Number(product?.stockQuantity || 0);

  let discountPercent = 0;
  if (writtenPrice > price && writtenPrice > 0) {
    discountPercent = Math.round(((writtenPrice - price) / writtenPrice) * 100);
  }

  const categoryName =
    typeof product?.category === "object"
      ? product?.category?.name || "Grocery"
      : product?.category || "Grocery";

  const brandName =
    typeof product?.brand === "object"
      ? product?.brand?.name || ""
      : product?.brand || "";

  const unitName =
    typeof product?.unit === "object"
      ? product?.unit?.name || product?.unit?.symbol || ""
      : product?.unit || "";

  const unitNo =
    typeof product?.unitNo === "object"
      ? product?.unitNo?.name || product?.unitNo?.value || ""
      : product?.unitNo ?? "";

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart = async () => {
    try {
      if (!product?._id) return;
      if (quantity < 1) return;

      if (stockQuantity <= 0) {
        Swal.fire({
          icon: "error",
          title: "Out of Stock",
          text: "This product is currently out of stock.",
          confirmButtonColor: "#0d6b50",
        });
        return;
      }

      if (quantity > stockQuantity) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit",
          text: `Only ${stockQuantity} item(s) available in stock.`,
          confirmButtonColor: "#0d6b50",
        });
        return;
      }

      setIsAddingToCart(true);

      const cartProduct = {
        productId: product._id,
        productName: productName,
        price: price,
        writtenPrice: writtenPrice,
        discountPrice: discountPrice,
        quantity: quantity,
        image: productImages?.[0] || "",
        category: categoryName,
        brand: brandName,
        unit: unitName,
        unitNob: unitNo,
        stockQuantity: stockQuantity,
      };

      const token = localStorage.getItem("token");

      if (!token) {
        const existingCart = JSON.parse(
          localStorage.getItem("guestCart") || "[]"
        );
        const existingIndex = existingCart.findIndex(
          (item) => item.productId === product._id
        );

        if (existingIndex !== -1) {
          const newQuantity =
            Number(existingCart[existingIndex].quantity || 0) + quantity;
          if (newQuantity > stockQuantity) {
            Swal.fire({
              icon: "warning",
              title: "Stock Limit",
              text: `Only ${stockQuantity} item(s) available in stock.`,
              confirmButtonColor: "#0d6b50",
            });
            setIsAddingToCart(false);
            return;
          }
          existingCart[existingIndex].quantity = newQuantity;
        } else {
          existingCart.push(cartProduct);
        }

        localStorage.setItem("guestCart", JSON.stringify(existingCart));
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        await API.post("/cart/add", {
          productId: product._id,
          quantity: quantity,
        });
        window.dispatchEvent(new Event("cartUpdated"));
      }

      setJustAddedToCart(true);
      setTimeout(() => setJustAddedToCart(false), 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
      Swal.fire({
        icon: "error",
        title: "Unable to Add",
        text:
          error.response?.data?.message ||
          error?.message ||
          "Unable to add product to cart.",
        confirmButtonColor: "#0d6b50",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  // ====================================================
  // SEO DATA
  // ====================================================

  const seoTitle =
    product?.metaTitle ||
    `${productName} - Fresh & Best Price | Grocery Sathi`;
  const seoDescription =
    product?.metaDescription ||
    product?.shortDescription ||
    `Order ${productName} online at best price with express doorstep delivery from Grocery Sathi.`;

  // ====================================================
  // LOADING / ERROR STATES
  // ====================================================

  if (loading) {
    return (
      <div className="pdv-loading-state">
        <div className="pdv-spinner" />
        <h3>Loading Product Details...</h3>
        <p>Fetching real-time price, stock &amp; fresh quality info.</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdv-error-state">
        <div className="pdv-error-icon">
          <Info size={36} />
        </div>
        <h2>Product Not Found</h2>
        <p>{error || "The product you requested is currently unavailable."}</p>
        <Link to="/" className="pdv-btn-home">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  // ====================================================
  // RENDER MAIN COMPONENT
  // ====================================================

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={productImages[0]} />
        <meta property="og:type" content="product" />
      </Helmet>

      <section className="pdv-wrapper">
        <div className="pdv-container">
          {/* ===================================================
              TOP BREADCRUMB & BACK ACTION
          ==================================================== */}
          <nav className="pdv-breadcrumb-bar" aria-label="Breadcrumb">
            <button
              type="button"
              className="pdv-btn-back"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <ol className="pdv-breadcrumb-list">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="sep">
                <ChevronRight size={13} />
              </li>
              <li>
                <Link to="/">{categoryName}</Link>
              </li>
              <li className="sep">
                <ChevronRight size={13} />
              </li>
              <li className="active" aria-current="page">
                {productName}
              </li>
            </ol>
          </nav>

          {/* ===================================================
              MAIN 2-COLUMN SHOWCASE LAYOUT
          ==================================================== */}
          <div className="pdv-showcase-grid">
            {/* =================================================
                LEFT COLUMN: VISUAL GALLERY & TRUST STRIP
            ================================================== */}
            <div className="pdv-gallery-column">
              <div className="pdv-gallery-card">
                {/* FLOATING BADGES OVERLAY */}
                <div className="pdv-gallery-badges">
                  {discountPercent > 0 && (
                    <span className="pdv-badge-discount">
                      <Zap size={12} /> -{discountPercent}% OFF
                    </span>
                  )}

                  {stockQuantity > 0 ? (
                    <span className="pdv-badge-stock in-stock">
                      <span className="pdv-pulse-dot" /> In Stock
                    </span>
                  ) : (
                    <span className="pdv-badge-stock out-stock">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* FLOATING TOP-RIGHT ACTIONS: WISHLIST & SHARE */}
                <div className="pdv-gallery-floating-actions">
                  <button
                    type="button"
                    className={`pdv-action-btn ${isWishlisted ? "wishlisted" : ""}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                  >
                    <Heart
                      size={18}
                      className={isWishlisted ? "heart-filled" : ""}
                    />
                  </button>

                  <button
                    type="button"
                    className="pdv-action-btn"
                    onClick={handleShare}
                    aria-label="Share product"
                    title="Share product link"
                  >
                    <Share2 size={17} />
                  </button>
                </div>

                {/* MAIN IMAGE WITH SUBTLE ZOOM EFFECT */}
                <div className="pdv-main-image-wrap">
                  <img
                    src={productImages[activeImage]}
                    alt={productName}
                    className="pdv-main-image"
                    loading="eager"
                  />
                </div>

                {/* THUMBNAIL SELECTOR STRIP */}
                {productImages.length > 1 && (
                  <div className="pdv-thumbnails-row">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`pdv-thumb-item ${
                          activeImage === idx ? "active" : ""
                        }`}
                        onClick={() => setActiveImage(idx)}
                        aria-label={`View photo ${idx + 1}`}
                      >
                        <img src={img} alt={`${productName} thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TRUST & PROMISE STRIP BELOW GALLERY */}
              <div className="pdv-trust-strip">
                <div className="pdv-trust-item">
                  <div className="pdv-trust-icon-box">
                    <Truck size={20} />
                  </div>
                  <div className="pdv-trust-text">
                    <strong>10-30 Mins Delivery</strong>
                    <span>Hyperlocal fast grocery doorstep delivery</span>
                  </div>
                </div>

                <div className="pdv-trust-item">
                  <div className="pdv-trust-icon-box">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="pdv-trust-text">
                    <strong>100% Genuine Quality</strong>
                    <span>Directly sourced from trusted brands &amp; vendors</span>
                  </div>
                </div>

                <div className="pdv-trust-item">
                  <div className="pdv-trust-icon-box">
                    <RotateCcw size={20} />
                  </div>
                  <div className="pdv-trust-text">
                    <strong>7 Days Easy Returns</strong>
                    <span>No-questions-asked quick replacement policy</span>
                  </div>
                </div>

                <div className="pdv-trust-item">
                  <div className="pdv-trust-icon-box">
                    <CreditCard size={20} />
                  </div>
                  <div className="pdv-trust-text">
                    <strong>Cash / UPI on Delivery</strong>
                    <span>Pay comfortably online or at your door</span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT COLUMN: PRODUCT DETAILS & BUY BOX
            ================================================== */}
            <div className="pdv-details-column">
              {/* CATEGORY & BRAND BADGES */}
              <div className="pdv-meta-pills-row">
                <span className="pdv-category-tag">{categoryName}</span>
                {brandName && (
                  <span className="pdv-brand-tag">
                    <Award size={13} /> {brandName}
                  </span>
                )}
              </div>

              {/* PRODUCT TITLE */}
              <h1 className="pdv-title">{productName}</h1>

              {/* RATINGS & REVIEWS BADGE */}
              <div
                className="pdv-ratings-snippet"
                onClick={() => {
                  const el = document.getElementById("customer-reviews");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                role="button"
                tabIndex={0}
                title="Scroll down to customer reviews"
              >
                <div className="pdv-stars-wrap">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= Math.round(reviewSummary.averageRating || 5)
                          ? "star-fill"
                          : "star-empty"
                      }
                    />
                  ))}
                </div>

                <span className="pdv-rating-score">
                  {reviewSummary.averageRating > 0
                    ? reviewSummary.averageRating.toFixed(1)
                    : "4.8"}
                </span>

                <span className="pdv-review-count">
                  ({reviewSummary.totalReviews > 0
                    ? `${reviewSummary.totalReviews} verified reviews`
                    : "Verified Purchase"})
                </span>
                <span className="pdv-verified-badge">
                  <CheckCircle2 size={13} /> Genuine
                </span>
              </div>

              {/* ===============================================
                  PRICING SHOWCASE CARD
              =============================================== */}
              <div className="pdv-pricing-card">
                <div className="pdv-price-row">
                  <span className="pdv-currency">₹</span>
                  <span className="pdv-main-price">{price.toFixed(2)}</span>

                  {writtenPrice > price && writtenPrice > 0 && (
                    <del className="pdv-mrp-price">
                      MRP ₹{writtenPrice.toFixed(2)}
                    </del>
                  )}

                  {discountPercent > 0 && (
                    <span className="pdv-save-pill">
                      Save ₹{(writtenPrice - price).toFixed(0)} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>

                <div className="pdv-tax-notice">
                  <Check size={13} /> Inclusive of all taxes &bull; Fresh Batch
                </div>
              </div>

              {/* PACK SIZE / NET QUANTITY */}
              {(unitName || unitNo) && (
                <div className="pdv-unit-row">
                  <span className="pdv-unit-label">Pack Size / Net Quantity:</span>
                  <span className="pdv-unit-badge">
                    <Package size={15} />
                    <strong>
                      {unitNo ? `${unitNo} ` : ""}
                      {unitName}
                    </strong>
                  </span>
                </div>
              )}

              {/* LIVE STOCK AVAILABILITY */}
              <div className="pdv-stock-status-row">
                {stockQuantity > 0 ? (
                  <div className="pdv-stock-badge available">
                    <span className="pdv-live-dot" />
                    <span>In Stock &bull; Ready for Instant Dispatch</span>
                  </div>
                ) : (
                  <div className="pdv-stock-badge out-of-stock">
                    <span className="pdv-live-dot red" />
                    <span>Currently Out of Stock</span>
                  </div>
                )}
              </div>

              {/* ===============================================
                  INTERACTIVE QUANTITY & ACTION BUTTONS
              =============================================== */}
              <div className="pdv-buy-actions-card">
                <div className="pdv-qty-selector-row">
                  <span className="pdv-qty-title">Quantity:</span>

                  <div className="pdv-qty-stepper">
                    <button
                      type="button"
                      className="pdv-stepper-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || stockQuantity <= 0}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="pdv-stepper-val">{quantity}</span>

                    <button
                      type="button"
                      className="pdv-stepper-btn"
                      onClick={() =>
                        setQuantity((q) => {
                          if (stockQuantity > 0) {
                            return Math.min(q + 1, stockQuantity);
                          }
                          return q + 1;
                        })
                      }
                      disabled={stockQuantity > 0 && quantity >= stockQuantity}
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <span className="pdv-total-computed">
                    Total: <strong>₹{(price * quantity).toFixed(2)}</strong>
                  </span>
                </div>

                {/* PRIMARY ACTION BUTTONS */}
                <div className="pdv-action-buttons-stack">
                  <button
                    type="button"
                    className={`pdv-btn-add-cart ${
                      justAddedToCart ? "just-added" : ""
                    }`}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || stockQuantity <= 0}
                  >
                    {justAddedToCart ? (
                      <>
                        <Check size={18} />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="pdv-btn-buy-now"
                    onClick={handleBuyNow}
                    disabled={isAddingToCart || stockQuantity <= 0}
                  >
                    <Zap size={18} />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* ===============================================
                  AVAILABLE OFFERS / PUBLIC COUPONS
              =============================================== */}
              {coupons.length > 0 && (
                <div className="pdv-coupons-box">
                  <div className="pdv-coupons-header">
                    <Tag size={16} />
                    <span>Available Offers &amp; Discounts</span>
                  </div>

                  <div className="pdv-coupons-list">
                    {coupons.map((c) => (
                      <div key={c._id || c.code} className="pdv-coupon-item">
                        <div className="pdv-coupon-info">
                          <strong>
                            {c.discountType === "percentage"
                              ? `${c.discountValue}% OFF`
                              : `₹${c.discountValue} FLAT OFF`}
                          </strong>
                          <span>
                            {c.minPurchase > 0
                              ? `On orders above ₹${c.minPurchase}`
                              : "On your grocery order"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`pdv-btn-copy-code ${
                            copiedCoupon === c.code ? "copied" : ""
                          }`}
                          onClick={() => handleCopyCoupon(c.code)}
                          title="Copy promo code"
                        >
                          {copiedCoupon === c.code ? (
                            <>
                              <Check size={13} /> COPIED!
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> {c.code}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===============================================
                  PRODUCT DETAIL TABS (DESCRIPTION & SPECS)
              =============================================== */}
              <div className="pdv-details-tabs-card">
                <div className="pdv-tabs-nav">
                  <button
                    type="button"
                    className={`pdv-tab-btn ${
                      activeTab === "description" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("description")}
                  >
                    <Info size={16} />
                    <span>Description</span>
                  </button>

                  <button
                    type="button"
                    className={`pdv-tab-btn ${
                      activeTab === "specifications" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("specifications")}
                  >
                    <Layers size={16} />
                    <span>Specifications</span>
                  </button>
                </div>

                <div className="pdv-tab-panel">
                  {activeTab === "description" ? (
                    <div className="pdv-description-content">
                      <p>
                        {product?.fullDescription ||
                          product?.shortDescription ||
                          "Premium household product directly packed and quality inspected. Disinfects, cleans and refreshes with lasting aroma."}
                      </p>

                      <div className="pdv-highlights-list">
                        <h4>Key Highlights:</h4>
                        <ul>
                          <li>Kills 99.9% of illness-causing germs and bacteria.</li>
                          <li>10x better cleaning and germ protection formula.</li>
                          <li>Leaves surfaces sparkling clean with a refreshing fragrance.</li>
                          <li>Safe for use on marble, tiles, granite, and wooden floors.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="pdv-specs-table">
                      <div className="pdv-spec-row">
                        <span className="pdv-spec-key">Product Name</span>
                        <span className="pdv-spec-value">{productName}</span>
                      </div>

                      <div className="pdv-spec-row">
                        <span className="pdv-spec-key">Brand</span>
                        <span className="pdv-spec-value">
                          {brandName || "Grocery Sathi Certified"}
                        </span>
                      </div>

                      <div className="pdv-spec-row">
                        <span className="pdv-spec-key">Category</span>
                        <span className="pdv-spec-value">{categoryName}</span>
                      </div>

                      {(unitName || unitNo) && (
                        <div className="pdv-spec-row">
                          <span className="pdv-spec-key">Net Quantity</span>
                          <span className="pdv-spec-value">
                            {unitNo ? `${unitNo} ` : ""}
                            {unitName}
                          </span>
                        </div>
                      )}

                      {product?.sku && (
                        <div className="pdv-spec-row">
                          <span className="pdv-spec-key">Item SKU</span>
                          <span className="pdv-spec-value">{product.sku}</span>
                        </div>
                      )}

                      {product?.barcode && (
                        <div className="pdv-spec-row">
                          <span className="pdv-spec-key">Barcode</span>
                          <span className="pdv-spec-value">{product.barcode}</span>
                        </div>
                      )}

                      <div className="pdv-spec-row">
                        <span className="pdv-spec-key">Item Stock</span>
                        <span className="pdv-spec-value">
                          {stockQuantity > 0
                            ? `${stockQuantity} Units In Stock`
                            : "Out of Stock"}
                        </span>
                      </div>

                      <div className="pdv-spec-row">
                        <span className="pdv-spec-key">Country of Origin</span>
                        <span className="pdv-spec-value">India</span>
                      </div>

                      <div className="pdv-spec-row">
                        <span className="pdv-spec-key">Customer Care</span>
                        <span className="pdv-spec-value">+91 98878 68746</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsVegetables;

import React, { useEffect, useState } from "react";

import "./ProductDetailsVegetables.css";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";

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
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#2eb5a2">
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

  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);

  const [reviewTitle, setReviewTitle] = useState("");

  const [reviewMessage, setReviewMessage] = useState("");

  const [reviewImage, setReviewImage] = useState(null);

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [reviewGuestName, setReviewGuestName] = useState("");
  const [reviewGuestEmail, setReviewGuestEmail] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

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

        const response = await fetch(
          `${API_BASE_URL}/api/products/${productId}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch product.");
        }

        const productData = result?.product || result?.data || result;

        if (!productData?._id) {
          throw new Error("Product not found.");
        }

        setProduct(productData);

        setActiveImage(0);
      } catch (err) {
        console.error("Product details fetch error:", err);

        setError(err?.message || "Failed to load product.");
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
      const objectImage = image?.url || image?.path || image?.secure_url || "";

      if (!objectImage) {
        return "";
      }

      image = objectImage;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // ====================================================
  // PRODUCT IMAGES
  // ====================================================

  const productImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images.map((image) => getImageUrl(image)).filter(Boolean)
      : fallbackProductImages;

  // ====================================================
  // KEEP ACTIVE IMAGE VALID
  // ====================================================

  useEffect(() => {
    if (activeImage >= productImages.length) {
      setActiveImage(0);
    }
  }, [productImages.length, activeImage]);

  // ====================================================
  // IMAGE CONTROLS
  // ====================================================

  const handlePrevImage = () => {
    setActiveImage((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setActiveImage((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1,
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
  // unitNo
  const unitName =
    typeof product?.unit === "object"
      ? product?.unit?.name || product?.unit?.symbol || ""
      : product?.unit || "";

  const unitNo =
    typeof product?.unitNo === "object"
      ? product?.unitNo?.name ||
        product?.unitNo?.value ||
        product?.unitNo?.number ||
        ""
      : (product?.unitNo ?? "");

  // ====================================================
  // PRICE
  // ====================================================

  const price = Number(product?.price || 0);

  // ====================================================
  // TOTAL PRICE
  // ====================================================

  const writtenPrice = Number(product?.writtenPrice || 0);

  const discountPrice = Number(product?.discountPrice || 0);
  const totalPrice = price * quantity;

  // ====================================================
  // STOCK
  // ====================================================

  const stockQuantity = Number(product?.stockQuantity || 0);

  // ====================================================
  // DISCOUNT %
  // ====================================================

  let discountPercent = 0;

  if (writtenPrice > price && writtenPrice > 0) {
    discountPercent = Math.round(((writtenPrice - price) / writtenPrice) * 100);
  }

  const handleAddToCart = async () => {
    try {
      // ==========================================
      // CHECK PRODUCT
      // ==========================================
      if (!product?._id) {
        Swal.fire({
          icon: "error",
          title: "Product Missing",
          text: "Product information is missing.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ==========================================
      // CHECK QUANTITY
      // ==========================================
      if (quantity < 1) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Please select a valid quantity.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ==========================================
      // CHECK STOCK
      // ==========================================
      if (stockQuantity <= 0) {
        Swal.fire({
          icon: "error",
          title: "Out of Stock",
          text: "This product is currently out of stock.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (quantity > stockQuantity) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit",
          text: `Only ${stockQuantity} item(s) available in stock.`,
          confirmButtonText: "OK",
        });
        return;
      }

      // ==========================================
      // PRODUCT DATA FOR GUEST CART
      // ==========================================
      const cartProduct = {
        productId: product._id,
        productName: product.productName || product.name || "Product",
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

      // ==========================================
      // CHECK LOGIN
      // ==========================================
      const token = localStorage.getItem("token");

      // ==========================================
      // GUEST CART
      // ==========================================
      if (!token) {
        const existingCart = JSON.parse(
          localStorage.getItem("guestCart") || "[]",
        );

        const existingIndex = existingCart.findIndex(
          (item) => item.productId === product._id,
        );

        if (existingIndex !== -1) {
          const newQuantity =
            Number(existingCart[existingIndex].quantity || 0) + quantity;

          if (newQuantity > stockQuantity) {
            await Swal.fire({
              icon: "warning",
              title: "Stock Limit",
              text: `Only ${stockQuantity} item(s) available in stock.`,
              confirmButtonText: "OK",
            });
            return;
          }

          existingCart[existingIndex].quantity = newQuantity;
        } else {
          existingCart.push(cartProduct);
        }

        localStorage.setItem("guestCart", JSON.stringify(existingCart));

        // Optional event so navbar/cart icon can update immediately
        window.dispatchEvent(new Event("cartUpdated"));

        await Swal.fire({
          icon: "success",
          title: "Added to Cart!",
          text: "Product added to cart successfully.",
          confirmButtonText: "Continue Shopping",
          timer: 1800,
          timerProgressBar: true,
        });

        return;
      }

      // ==========================================
      // LOGGED-IN USER CART
      // ==========================================
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to add product to cart.");
      }

      window.dispatchEvent(new Event("cartUpdated"));

      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: result?.message || "Product added to cart successfully.",
        confirmButtonText: "Continue Shopping",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      await Swal.fire({
        icon: "error",
        title: "Unable to Add",
        text: error?.message || "Unable to add product to cart.",
        confirmButtonText: "OK",
      });
    }
  };

  // ====================================================
  // OPEN REVIEW POPUP
  // ====================================================

  const handleOpenReviewPopup = () => {
    setReviewRating(5);
    setReviewTitle("");
    setReviewMessage("");
    setReviewImage(null);

    setIsReviewPopupOpen(true);
  };
  // ====================================================
  // CLOSE REVIEW POPUP
  // ====================================================

  const handleCloseReviewPopup = () => {
    if (reviewSubmitting) {
      return;
    }

    setIsReviewPopupOpen(false);
  };

  // ====================================================
  // SELECT REVIEW IMAGE
  // ====================================================

  const handleReviewImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Image",
        text: "Please select a valid image.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text: "Image size must be less than 5MB.",
        confirmButtonText: "OK",
      });
      return;
    }

    setReviewImage(file);
  };

  // ====================================================
  // SUBMIT REVIEW
  // ====================================================

  // ======================================================
  // FETCH PRODUCT REVIEWS
  // ======================================================

  const fetchReviews = async () => {
    try {
      if (!product?._id) return;

      setReviewsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/reviews/product/${product._id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to fetch reviews.");
      }

      // ======================================================
      // ONLY PUBLISHED REVIEWS
      // ======================================================

      const publishedReviews = Array.isArray(result?.reviews)
        ? result.reviews.filter(
            (review) =>
              String(review?.status || "").toLowerCase() === "published",
          )
        : [];

      // ======================================================
      // SET REVIEWS
      // ======================================================

      setReviews(publishedReviews);

      // ======================================================
      // CALCULATE SUMMARY ONLY FROM PUBLISHED REVIEWS
      // ======================================================

      const totalReviews = publishedReviews.length;

      const totalRating = publishedReviews.reduce(
        (sum, review) => sum + Number(review?.rating || 0),
        0,
      );

      const averageRating =
        totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(2)) : 0;

      // ======================================================
      // RATING BREAKDOWN
      // ======================================================

      const ratingBreakdown = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      publishedReviews.forEach((review) => {
        const rating = Number(review?.rating || 0);

        if (rating >= 1 && rating <= 5) {
          ratingBreakdown[rating]++;
        }
      });

      // ======================================================
      // SET SUMMARY
      // ======================================================

      setReviewSummary({
        totalReviews,
        averageRating,
        ratingBreakdown,
      });
    } catch (error) {
      console.error("Fetch reviews error:", error);

      setReviews([]);

      setReviewSummary({
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (product?._id) {
      fetchReviews();
    }
  }, [product?._id]);

  // ======================================================
  // SUBMIT REVIEW
  // LOGIN NOT REQUIRED
  // ======================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    try {
      // ==================================================
      // PRODUCT CHECK
      // ==================================================

      if (!product?._id) {
        await Swal.fire({
          icon: "error",
          title: "Product Missing",
          text: "Product information is missing.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ==================================================
      // GUEST NAME
      // ==================================================

      const reviewerName = reviewGuestName.trim();

      if (!reviewerName) {
        Swal.fire({
          icon: "warning",
          title: "Name Required",
          text: "Please enter your name.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (reviewerName.length > 100) {
        await Swal.fire({
          icon: "warning",
          title: "Name Too Long",
          text: "Name cannot exceed 100 characters.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ==================================================
      // GUEST EMAIL
      // OPTIONAL
      // ==================================================

      const reviewerEmail = reviewGuestEmail.trim();

      if (reviewerEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(reviewerEmail)) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Email",
            text: "Please enter a valid email address.",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      // ==================================================
      // RATING
      // ==================================================

      const rating = Number(reviewRating);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        await Swal.fire({
          icon: "warning",
          title: "Invalid Rating",
          text: "Please select a rating between 1 and 5.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ==================================================
      // TITLE
      // ==================================================

      const title = reviewTitle.trim();

      if (!title) {
        Swal.fire({
          icon: "warning",
          title: "Review Title Required",
          text: "Please enter a review title.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (title.length > 100) {
        await Swal.fire({
          icon: "warning",
          title: "Title Too Long",
          text: "Review title cannot exceed 100 characters.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ==================================================
      // COMMENT
      // ==================================================

      const comment = reviewMessage.trim();

      if (!comment) {
        Swal.fire({
          icon: "warning",
          title: "Review Required",
          text: "Please write your review.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (comment.length > 1000) {
        await Swal.fire({
          icon: "warning",
          title: "Review Too Long",
          text: "Review cannot exceed 1000 characters.",
          confirmButtonText: "OK",
        });
        return;
      }
      // ==================================================
      // START LOADING
      // ==================================================

      setReviewSubmitting(true);

      // ==================================================
      // OPTIONAL LOGIN
      // ==================================================

      const token = localStorage.getItem("token");

      // ==================================================
      // REQUEST BODY
      // ==================================================

      const requestBody = {
        productId: product._id,
        reviewerName,
        reviewerEmail,
        rating,
        title,
        comment,
      };

      // ==================================================
      // HEADERS
      // ==================================================

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      // ==================================================
      // LOGGED-IN USER
      // ==================================================

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // ==================================================
      // API REQUEST
      // ==================================================

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      // ==================================================
      // RESPONSE
      // ==================================================

      const contentType = response.headers.get("content-type");

      let result = {};

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error("Review API non-JSON response:", text);

        throw new Error("Invalid response from review API.");
      }

      // ==================================================
      // ERROR
      // ==================================================

      if (!response.ok) {
        throw new Error(result?.message || "Failed to submit review.");
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      await Swal.fire({
        icon: "success",
        title: "Review Submitted!",
        text: result?.message || "Review submitted successfully.",
        confirmButtonText: "Done",
        timer: 2000,
        timerProgressBar: true,
      });

      // ==================================================
      // CLOSE POPUP
      // ==================================================

      setIsReviewPopupOpen(false);

      // ==================================================
      // RESET FORM
      // ==================================================

      setReviewRating(5);
      setReviewGuestName("");
      setReviewGuestEmail("");
      setReviewTitle("");
      setReviewMessage("");
      setReviewImage(null);

      // ==================================================
      // REFRESH REVIEWS
      // ==================================================

      await fetchReviews();
    } catch (error) {
      console.error("Submit review error:", error);

      await Swal.fire({
        icon: "error",
        title: "Review Failed",
        text: error?.message || "Unable to submit review.",
        confirmButtonText: "OK",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ======================================================
  // SEO / META INFORMATION
  // ======================================================

  const seoTitle =
    product?.metaTitle?.trim() || product?.productName || "Product";

  const seoDescription =
    product?.metaDescription?.trim() ||
    product?.shortDescription?.trim() ||
    product?.fullDescription?.trim() ||
    `Buy ${product?.productName || "this product"} online.`;

  const seoKeywords = Array.isArray(product?.metaKeywords)
    ? product.metaKeywords
        .map((keyword) => String(keyword).trim())
        .filter(Boolean)
        .join(", ")
    : "";

  const seoImage = productImages?.[0] || "";

  const productUrl = window.location.href;

  // ====================================================
  // PRODUCT SHARE
  // NATIVE ANDROID / MOBILE SHARE SHEET
  // ====================================================

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const productName = product?.productName || product?.name || "Product";

    const productId = product?._id || product?.id || productId;

    // ----------------------------------------------------
    // CURRENT PRODUCT URL
    // ----------------------------------------------------

    const shareUrl = `${window.location.origin}/products/${productId}`;

    // ----------------------------------------------------
    // SHARE TEXT
    // ----------------------------------------------------

    const price = Number(product?.sellingPrice ?? product?.price ?? 0);

    const shareText =
      price > 0
        ? `Check out ${productName} for ₹${price.toFixed(2)}.`
        : `Check out ${productName}.`;

    // ----------------------------------------------------
    // NATIVE SHARE
    // ----------------------------------------------------

    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });

        return;
      } catch (error) {
        // ------------------------------------------------
        // USER CLOSED SHARE SHEET
        // ------------------------------------------------

        if (error?.name === "AbortError") {
          return;
        }

        console.error("Native share failed:", error);
      }
    }

    // ----------------------------------------------------
    // FALLBACK - COPY LINK
    // ----------------------------------------------------

    try {
      await navigator.clipboard.writeText(shareUrl);

      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        text: "Product link copied successfully.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Copy link failed:", error);

      // ------------------------------------------------
      // OLD BROWSER FALLBACK
      // ------------------------------------------------

      const textarea = document.createElement("textarea");

      textarea.value = shareUrl;

      textarea.style.position = "fixed";

      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.focus();

      textarea.select();

      try {
        document.execCommand("copy");

        Swal.fire({
          icon: "success",
          title: "Link Copied!",
          text: "Product link copied successfully.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (copyError) {
        console.error("Fallback copy failed:", copyError);
      }

      document.body.removeChild(textarea);
    }
  };
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
          <p>{error || "Product not found."}</p>
        </div>
      </div>
    );
  }

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>

        <meta name="description" content={seoDescription} />

        {seoKeywords && <meta name="keywords" content={seoKeywords} />}

        <meta name="robots" content="index, follow" />

        <link rel="canonical" href={productUrl} />

        <meta property="og:type" content="product" />

        <meta property="og:title" content={seoTitle} />

        <meta property="og:description" content={seoDescription} />

        <meta property="og:url" content={productUrl} />

        {seoImage && <meta property="og:image" content={seoImage} />}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={seoTitle} />

        <meta name="twitter:description" content={seoDescription} />

        {seoImage && <meta name="twitter:image" content={seoImage} />}
      </Helmet>
      <div className="pdv">
        <div className="pdv__container">
          {/* ==================================================
            TOP HEADER NAVIGATION
        ================================================== */}

          <header className="pdv__top-bar">
            <button
              className="pdv__back-link"
              type="button"
              onClick={() => window.history.back()}
            >
              <span className="pdv__back-circle">
                <ArrowLeft />
              </span>

              <span>Back to category</span>
            </button>

            <button
              className={`pdv__wishlist-btn ${
                isWishlisted ? "pdv__wishlist-btn--active" : ""
              }`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              type="button"
            >
              <span>Add to wishlist</span>

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
              <span className="pdv__badge">{categoryName}</span>

              <h1 className="pdv__title">
                {product?.productName || product?.name || "Product"}
              </h1>

              <span className="pdv__category-sub">{categoryName}</span>

              {/* ==================================================
                SIZE
            ================================================== */}

              {/* ==================================================
                QUANTITY
            ================================================== */}

              <div className="pdv__option-group">
                <div className="pdv__option-label">Quantity :</div>

                <div className="pdv__qty-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="pdv__qty-value">{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => {
                        if (stockQuantity > 0) {
                          return Math.min(q + 1, stockQuantity);
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
                ₹{totalPrice.toFixed(2)}
                {quantity > 1 && (
                  <span> {/* ({quantity} × ₹{price.toFixed(2)}) */}</span>
                )}
                {writtenPrice > price && writtenPrice > 0 && (
                  <>
                    {" "}
                    <del>₹{(writtenPrice * quantity).toFixed(2)}</del>
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
                  onClick={handleAddToCart}
                >
                  <span>Add to Cart</span>
                  <span className="pdv__btn-chevron">›</span>
                </button>

                <button className="pdv__btn-buy-now" type="button">
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
                  src={productImages[activeImage]}
                  alt={product?.productName || "Product"}
                  className="pdv__main-image"
                  onError={(e) => {
                    e.currentTarget.src = fallbackProductImages[0];
                  }}
                />
              </div>

              <div className="pdv__gallery-footer">
                <div className="pdv__thumbnails">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pdv__thumb-btn ${
                        activeImage === idx ? "pdv__thumb-btn--active" : ""
                      }`}
                      onClick={() => setActiveImage(idx)}
                    >
                      <img
                        src={img}
                        alt={`${product?.productName || "Product"} thumbnail ${
                          idx + 1
                        }`}
                        onError={(e) => {
                          e.currentTarget.src =
                            fallbackProductImages[
                              idx % fallbackProductImages.length
                            ];
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div className="pdv__carousel-controls">
                  <button
                    type="button"
                    className="pdv__nav-btn"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="pdv__nav-btn pdv__nav-btn--muted"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    ›
                  </button>

                  <span className="pdv__slider-text">Slide slider</span>
                </div>
              </div>
            </section>

            {/* ==================================================
              COLUMN 3: DESCRIPTION & META
          ================================================== */}

            <section className="pdv__col pdv__col--meta">
              <div className="pdv__rating-header">
                <div className="pdv__star-rating">
                  {[1, 2, 3, 4, 5].map((star) =>
                    star <= Math.round(reviewSummary.averageRating) ? (
                      <StarFilled key={star} />
                    ) : (
                      <StarOutline key={star} />
                    ),
                  )}
                </div>

                <span className="pdv__score-val">
                  {Number(reviewSummary.averageRating || 0).toFixed(1)} out of 5
                </span>
              </div>

              {/* ==================================================
      DESCRIPTION
  ================================================== */}

              <div className="pdv__meta-section">
                <h2 className="pdv__section-heading">Description:</h2>

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
                <h2 className="pdv__section-heading">About Product:</h2>

                {/* SKU */}

                <div className="pdv__spec-item">
                  <span className="pdv__spec-label">SKU:</span>

                  <span className="pdv__spec-val">{product?.sku || "N/A"}</span>
                </div>

                {/* CATEGORY */}

                <div className="pdv__spec-item">
                  <span className="pdv__spec-label">Category:</span>

                  <span className="pdv__spec-val">{categoryName}</span>
                </div>

                {/* BRAND */}

                {brandName && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">Brand:</span>

                    <span className="pdv__spec-val">{brandName}</span>
                  </div>
                )}

                {/* UNIT */}

                {/* UNIT */}
                {(unitName || unitNo) && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">Unit:</span>

                    <span className="pdv__spec-val">
                      {unitNo && `${unitNo} `}
                      {unitName}
                    </span>
                  </div>
                )}

                {/* STOCK */}

                <div className="pdv__spec-item">
                  <span className="pdv__spec-label">Stock:</span>

                  <span className="pdv__spec-val">{stockQuantity}</span>
                </div>

                {/* MRP */}

                {writtenPrice > 0 && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">MRP:</span>

                    <span className="pdv__spec-val">
                      ₹{writtenPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* DISCOUNT */}

                {discountPercent > 0 && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">Discount:</span>

                    <span className="pdv__spec-val">{discountPercent}%</span>
                  </div>
                )}
              </div>

              {/* ==================================================
      FOOTER ACTIONS
  ================================================== */}

              <div className="pdv__footer-actions">
                <button
                  type="button"
                  className="pdv__link-action pdv__share-action"
                  onClick={handleShare}
                  aria-label={`Share ${product?.productName || product?.name || "product"}`}
                >
                  <ShareIcon />

                  <span>Share</span>
                </button>
              </div>
            </section>
          </div>

          {/* ==================================================
            CUSTOMER REVIEWS
        ================================================== */}

          {/* ======================================================
    CUSTOMER REVIEWS
====================================================== */}

          <section className="pdv__reviews-wrapper">
            <h2 className="pdv__reviews-title">Customer Reviews</h2>

            <div className="pdv__reviews-summary-card">
              {/* ==================================================
        LEFT SCORE BLOCK
    ================================================== */}

              <div className="pdv__score-summary">
                <div className="pdv__score-stars-row">
                  <div className="pdv__star-rating">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= Math.round(reviewSummary.averageRating) ? (
                        <StarFilled key={star} />
                      ) : (
                        <StarOutline key={star} />
                      ),
                    )}
                  </div>

                  <span className="pdv__score-val">
                    {reviewSummary.averageRating.toFixed(2)} out of 5
                  </span>
                </div>

                <div className="pdv__verified-row">
                  <span>
                    Based on {reviewSummary.totalReviews}{" "}
                    {reviewSummary.totalReviews === 1 ? "review" : "reviews"}
                  </span>

                  <CheckBadge />
                </div>
              </div>

              {/* ==================================================
        MIDDLE RATING DISTRIBUTION
    ================================================== */}

              <div className="pdv__rating-breakdown">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = Number(
                    reviewSummary.ratingBreakdown?.[stars] || 0,
                  );

                  const total = reviewSummary.totalReviews;

                  const percent = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div className="pdv__bar-row" key={stars}>
                      <div className="pdv__bar-stars">
                        {[...Array(5)].map((_, i) =>
                          i < stars ? (
                            <StarFilled key={i} />
                          ) : (
                            <StarOutline key={i} />
                          ),
                        )}
                      </div>

                      <div className="pdv__progress-track">
                        <div
                          className="pdv__progress-fill"
                          style={{
                            width: `${percent}%`,
                          }}
                        />
                      </div>

                      <span className="pdv__bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* ==================================================
        RIGHT REVIEW CTA
    ================================================== */}

              <div className="pdv__review-cta-wrap">
                <button
                  className="pdv__btn-review"
                  type="button"
                  onClick={handleOpenReviewPopup}
                >
                  Write a review
                </button>
              </div>
            </div>

            {/* ==================================================
      REVIEW LIST
  ================================================== */}

            <div className="pdv__review-card-wrap">
              {reviewsLoading ? (
                <article className="pdv__review-card">
                  <p className="pdv__review-body">Loading reviews...</p>
                </article>
              ) : reviews.length === 0 ? (
                <article className="pdv__review-card">
                  <div className="pdv__reviewer-profile">
                    <div className="pdv__reviewer-avatar">
                      <UserPlaceholder />
                    </div>

                    <span className="pdv__reviewer-name">No reviews yet</span>
                  </div>

                  <h3 className="pdv__review-headline">
                    Be the first to review this product
                  </h3>

                  <p className="pdv__review-body">
                    Share your experience and help other customers make a better
                    choice.
                  </p>
                </article>
              ) : (
                reviews.map((review) => {
                  const reviewerName =
                    review?.user?.name ||
                    review?.user?.fullName ||
                    review?.user?.username ||
                    review?.user?.email?.split("@")[0] ||
                    "Customer";

                  const reviewDate = review?.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "";

                  const rating = Number(review?.rating || 0);

                  return (
                    <article className="pdv__review-card" key={review._id}>
                      {/* REVIEW HEADER */}

                      <div className="pdv__review-card-head">
                        <div className="pdv__star-rating">
                          {[1, 2, 3, 4, 5].map((star) =>
                            star <= rating ? (
                              <StarFilled key={star} />
                            ) : (
                              <StarOutline key={star} />
                            ),
                          )}
                        </div>

                        <time
                          className="pdv__review-date"
                          dateTime={review?.createdAt}
                        >
                          {reviewDate}
                        </time>
                      </div>

                      {/* REVIEWER */}

                      <div className="pdv__reviewer-profile">
                        <div className="pdv__reviewer-avatar">
                          <UserPlaceholder />
                        </div>

                        <span className="pdv__reviewer-name">
                          {reviewerName}
                        </span>

                        {review?.verifiedPurchase && (
                          <span className="pdv__verified-review">
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      {/* REVIEW TITLE */}

                      <h3 className="pdv__review-headline">
                        {review?.title || "Customer Review"}
                      </h3>

                      {/* REVIEW COMMENT */}

                      <p className="pdv__review-body">
                        {review?.comment || ""}
                      </p>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* ======================================================
    WRITE REVIEW POPUP
====================================================== */}

        {isReviewPopupOpen && (
          <div
            className="pdv__review-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseReviewPopup();
              }
            }}
          >
            <div
              className="pdv__review-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-modal-title"
            >
              {/* ======================================================
          HEADER
      ====================================================== */}

              <div className="pdv__review-modal-header">
                <div>
                  <span className="pdv__review-modal-eyebrow">
                    CUSTOMER FEEDBACK
                  </span>

                  <h2
                    id="review-modal-title"
                    className="pdv__review-modal-title"
                  >
                    Write a review
                  </h2>

                  <p className="pdv__review-modal-product">
                    {product?.productName || product?.name}
                  </p>
                </div>

                <button
                  type="button"
                  className="pdv__review-modal-close"
                  onClick={handleCloseReviewPopup}
                  disabled={reviewSubmitting}
                  aria-label="Close review popup"
                >
                  ×
                </button>
              </div>

              {/* ======================================================
          FORM
      ====================================================== */}

              <form className="pdv__review-form" onSubmit={handleSubmitReview}>
                {/* ==================================================
            GUEST NAME
        ================================================== */}

                <div className="pdv__review-field">
                  <label
                    htmlFor="review-guest-name"
                    className="pdv__review-label"
                  >
                    Your Name
                  </label>

                  <input
                    id="review-guest-name"
                    type="text"
                    className="pdv__review-input"
                    placeholder="Enter your name"
                    value={reviewGuestName}
                    onChange={(event) => setReviewGuestName(event.target.value)}
                    maxLength={100}
                    disabled={reviewSubmitting}
                  />

                  <span className="pdv__review-character-count">
                    {reviewGuestName.length}/100
                  </span>
                </div>

                {/* ==================================================
            GUEST EMAIL
        ================================================== */}

                <div className="pdv__review-field">
                  <label
                    htmlFor="review-guest-email"
                    className="pdv__review-label"
                  >
                    Email
                    <span className="pdv__review-optional"> (Optional)</span>
                  </label>

                  <input
                    id="review-guest-email"
                    type="email"
                    className="pdv__review-input"
                    placeholder="Enter your email"
                    value={reviewGuestEmail}
                    onChange={(event) =>
                      setReviewGuestEmail(event.target.value)
                    }
                    maxLength={150}
                    disabled={reviewSubmitting}
                  />
                </div>

                {/* ==================================================
            RATING
        ================================================== */}

                <div className="pdv__review-field">
                  <label className="pdv__review-label">Your Rating</label>

                  <div className="pdv__review-star-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`pdv__review-star-button ${
                          star <= reviewRating
                            ? "pdv__review-star-button--active"
                            : ""
                        }`}
                        onClick={() => setReviewRating(star)}
                        aria-label={`${star} star`}
                        disabled={reviewSubmitting}
                      >
                        ★
                      </button>
                    ))}

                    <span className="pdv__review-rating-text">
                      {reviewRating}/5
                    </span>
                  </div>
                </div>

                {/* ==================================================
            TITLE
        ================================================== */}

                <div className="pdv__review-field">
                  <label htmlFor="review-title" className="pdv__review-label">
                    Review Title
                  </label>

                  <input
                    id="review-title"
                    type="text"
                    className="pdv__review-input"
                    placeholder="Example: Fresh and good quality"
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    maxLength={100}
                    disabled={reviewSubmitting}
                  />

                  <span className="pdv__review-character-count">
                    {reviewTitle.length}/100
                  </span>
                </div>

                {/* ==================================================
            MESSAGE
        ================================================== */}

                <div className="pdv__review-field">
                  <label htmlFor="review-message" className="pdv__review-label">
                    Your Review
                  </label>

                  <textarea
                    id="review-message"
                    className="pdv__review-textarea"
                    placeholder="Tell other customers about your experience..."
                    value={reviewMessage}
                    onChange={(event) => setReviewMessage(event.target.value)}
                    maxLength={1000}
                    rows={5}
                    disabled={reviewSubmitting}
                  />

                  <span className="pdv__review-character-count">
                    {reviewMessage.length}/1000
                  </span>
                </div>

                {/* ==================================================
            ADMIN APPROVAL NOTICE
        ================================================== */}

                <div className="pdv__review-notice">
                  <CheckBadge />

                  <span>
                    Your review will be published after admin approval.
                  </span>
                </div>

                {/* ==================================================
            ACTIONS
        ================================================== */}

                <div className="pdv__review-modal-actions">
                  <button
                    type="button"
                    className="pdv__review-cancel"
                    onClick={handleCloseReviewPopup}
                    disabled={reviewSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="pdv__review-submit"
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? (
                      <>
                        <span className="pdv__review-spinner" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Review
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailsVegetables;

import React, { useEffect, useState } from "react";

import "./ProductDetailsVegetables.css";

import { Helmet } from "react-helmet-async";

import Swal from "sweetalert2";

import API from "../../api/axios";

import { FaHeart } from "react-icons/fa";

// ======================================================
// LOCAL FALLBACK IMAGES
// ======================================================

import broccoliMain from "../../assets/vege1.webp";

import broccoliThumb1 from "../../assets/vege2.webp";

import broccoliThumb2 from "../../assets/vege4.webp";

import { useNavigate } from "react-router-dom";

const fallbackProductImages = [
  // broccoliMain ||
  //   "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=800&q=80",
  // broccoliThumb1 ||
  //   "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=400&q=80",
  // broccoliThumb2 ||
  //   "https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=400&q=80",
];

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
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const productName = product?.productName || product?.name || "Product";
  const currentProductId = product?._id || product?.id || productId;

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

        const { data } = await API.get(`/products/${productId}`);

        const productData = data?.product || data?.data || data;

        if (!productData?._id) {
          throw new Error("Product not found.");
        }

        setProduct(productData);
        setActiveImage(0);
      } catch (err) {
        console.error("Product details fetch error:", err);

        setError(
          err.response?.data?.message ||
            err?.message ||
            "Failed to load product.",
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

    // Use API's base URL prefix
    const base =
      API.defaults.baseURL?.replace(/\/api\/?$/, "") ||
      "";

    return `${base}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const handleWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first to add products to wishlist.");
        navigate("/login");
        return;
      }

      if (!productId) {
        alert("Product ID is missing.");
        return;
      }

      if (wishlistLoading) {
        return;
      }

      setWishlistLoading(true);

      // ==========================================
      // REMOVE FROM WISHLIST
      // ==========================================

      if (isWishlisted) {
        const response = await API.delete(`/wishlist/${productId}`);

        if (response.data?.success) {
          setIsWishlisted(false);

          window.dispatchEvent(new Event("wishlistUpdated"));

          Swal.fire({
            icon: "success",
            title: "Removed!",
            text: response.data?.message || "Product removed from wishlist.",
            confirmButtonText: "OK",
          });
        }

        return;
      }

      // ==========================================
      // ADD TO WISHLIST
      // ==========================================

      const response = await API.post(`/wishlist/${productId}`);

      if (response.data?.success) {
        setIsWishlisted(true);

        window.dispatchEvent(new Event("wishlistUpdated"));

        Swal.fire({
          icon: "success",
          title: "Added to Wishlist!",
          text: response.data?.message || "Product added to wishlist.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        alert("Your login session has expired.");

        navigate("/login");

        return;
      }

      if (error.response?.status === 409) {
        setIsWishlisted(true);

        alert(
          error.response?.data?.message ||
            "Product already exists in wishlist.",
        );

        return;
      }

      alert(error.response?.data?.message || "Unable to update wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || !productId) {
          setIsWishlisted(false);
          return;
        }

        const response = await API.get(`/wishlist/check/${productId}`);

        setIsWishlisted(Boolean(response.data?.isWishlisted));
      } catch (error) {
        console.error("Check wishlist error:", error);
        setIsWishlisted(false);
      }
    };

    checkWishlistStatus();
  }, [productId]);

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
  // CATEGORY / BRAND / UNIT
  // ====================================================

  const categoryName =
    typeof product?.category === "object"
      ? product?.category?.name || "Category"
      : product?.category || "Category";

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
      ? product?.unitNo?.name ||
        product?.unitNo?.value ||
        product?.unitNo?.number ||
        ""
      : (product?.unitNo ?? "");

  // ====================================================
  // PRICE
  // ====================================================

  const price = Number(product?.price || 0);
  const writtenPrice = Number(product?.writtenPrice || 0);
  const discountPrice = Number(product?.discountPrice || 0);
  const totalPrice = price * quantity;

  const stockQuantity = Number(product?.stockQuantity || 0);

  let discountPercent = 0;
  if (writtenPrice > price && writtenPrice > 0) {
    discountPercent = Math.round(((writtenPrice - price) / writtenPrice) * 100);
  }

  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart = async () => {
    try {
      if (!product?._id) {
        Swal.fire({
          icon: "error",
          title: "Product Missing",
          text: "Product information is missing.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (quantity < 1) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Please select a valid quantity.",
          confirmButtonText: "OK",
        });
        return;
      }

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
      // LOGGED-IN CART
      // ==========================================

      const response = await API.post("/cart/add", {
        productId: product._id,
        quantity: quantity,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text:
          response.data?.message || "Product added to cart successfully.",
        confirmButtonText: "Continue Shopping",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Add to cart error:", error);

      await Swal.fire({
        icon: "error",
        title: "Unable to Add",
        text:
          error.response?.data?.message ||
          error?.message ||
          "Unable to add product to cart.",
        confirmButtonText: "OK",
      });
    }
  };

  // ====================================================
  // OPEN / CLOSE REVIEW POPUP
  // ====================================================

  const handleOpenReviewPopup = () => {
    setReviewRating(5);
    setReviewTitle("");
    setReviewMessage("");
    setReviewImage(null);
    setIsReviewPopupOpen(true);
  };

  const handleCloseReviewPopup = () => {
    if (reviewSubmitting) {
      return;
    }
    setIsReviewPopupOpen(false);
  };

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

  // ======================================================
  // FETCH PRODUCT REVIEWS
  // ======================================================

  const fetchReviews = async () => {
    try {
      if (!product?._id) return;

      setReviewsLoading(true);

      const response = await API.get(`/reviews/product/${product._id}`);

      const result = response.data;

      const publishedReviews = Array.isArray(result?.reviews)
        ? result.reviews.filter(
            (review) =>
              String(review?.status || "").toLowerCase() === "published",
          )
        : [];

      setReviews(publishedReviews);

      const totalReviews = publishedReviews.length;

      const totalRating = publishedReviews.reduce(
        (sum, review) => sum + Number(review?.rating || 0),
        0,
      );

      const averageRating =
        totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(2)) : 0;

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
      if (!product?._id) {
        await Swal.fire({
          icon: "error",
          title: "Product Missing",
          text: "Product information is missing.",
          confirmButtonText: "OK",
        });
        return;
      }

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

      setReviewSubmitting(true);

      const requestBody = {
        productId: product._id,
        reviewerName,
        reviewerEmail,
        rating,
        title,
        comment,
      };

      const response = await API.post("/reviews", requestBody);

      await Swal.fire({
        icon: "success",
        title: "Review Submitted!",
        text:
          response.data?.message || "Review submitted successfully.",
        confirmButtonText: "Done",
        timer: 2000,
        timerProgressBar: true,
      });

      setIsReviewPopupOpen(false);

      setReviewRating(5);
      setReviewGuestName("");
      setReviewGuestEmail("");
      setReviewTitle("");
      setReviewMessage("");
      setReviewImage(null);

      await fetchReviews();
    } catch (error) {
      console.error("Submit review error:", error);

      await Swal.fire({
        icon: "error",
        title: "Review Failed",
        text:
          error.response?.data?.message ||
          error?.message ||
          "Unable to submit review.",
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
  // ====================================================

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const productName = product?.productName || product?.name || "Product";

    const currentProductId = product?._id || product?.id || productId;

    const shareUrl = `${window.location.origin}/products/${currentProductId}`;

    const price = Number(product?.sellingPrice ?? product?.price ?? 0);

    const shareText =
      price > 0
        ? `Check out ${productName} for ₹${price.toFixed(2)}.`
        : `Check out ${productName}.`;

    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });

        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Native share failed:", error);
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);

      alert("Product link copied successfully!");
    } catch (error) {
      console.error("Copy link failed:", error);
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
              type="button"
              className={`OurBestsellers-icon-btn ${
                isWishlisted ? "wishlisted" : ""
              }`}
              onClick={() => handleWishlist(productId)}
              disabled={wishlistLoading}
              aria-label={
                isWishlisted
                  ? `Remove ${productName} from wishlist`
                  : `Add ${productName} to wishlist`
              }
            >
              <FaHeart aria-hidden="true" />
            </button>
          </header>

          {/* ==================================================
              3-COLUMN PRODUCT SHOWCASE
          ================================================== */}

          <div className="pdv__product-grid">
            {/* COLUMN 1: INFO & CONTROLS */}

            <section className="pdv__col pdv__col--info">
              <span className="pdv__badge">{categoryName}</span>

              <h1 className="pdv__title">
                {product?.productName || product?.name || "Product"}
              </h1>

              <span className="pdv__category-sub">{categoryName}</span>

              {/* QUANTITY */}

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

              {/* PRICE */}

              <div className="pdv__price-tag">
                ₹{totalPrice.toFixed(2)}
                {quantity > 1 && (
                  <span>{/* ({quantity} × ₹{price.toFixed(2)}) */}</span>
                )}
                {writtenPrice > price && writtenPrice > 0 && (
                  <>
                    {" "}
                    <del>₹{(writtenPrice * quantity).toFixed(2)}</del>
                  </>
                )}
              </div>

              {/* ACTIONS */}

              <div className="pdv__actions-stack">
                <button
                  className="pdv__btn-add-cart"
                  type="button"
                  onClick={handleAddToCart}
                >
                  <span>Add to Cart</span>
                  <span className="pdv__btn-chevron">›</span>
                </button>
{/* 
                <button className="pdv__btn-buy-now" type="button">
                  Buy it now
                </button> */}
              </div>
            </section>

            {/* COLUMN 2: GALLERY & SLIDER */}

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

            {/* COLUMN 3: DESCRIPTION & META */}

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

              {/* DESCRIPTION */}

              <div className="pdv__meta-section">
                <h2 className="pdv__section-heading">Description:</h2>

                <p className="pdv__desc-text">
                  {product?.fullDescription ||
                    product?.shortDescription ||
                    "No description available."}
                </p>
              </div>

              {/* ABOUT PRODUCT */}

              <div className="pdv__meta-section">
                <h2 className="pdv__section-heading">About Product:</h2>

                <div className="pdv__spec-item">
                  <span className="pdv__spec-label">SKU:</span>
                  <span className="pdv__spec-val">{product?.sku || "N/A"}</span>
                </div>

                <div className="pdv__spec-item">
                  <span className="pdv__spec-label">Category:</span>
                  <span className="pdv__spec-val">{categoryName}</span>
                </div>

                {brandName && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">Brand:</span>
                    <span className="pdv__spec-val">{brandName}</span>
                  </div>
                )}

                {(unitName || unitNo) && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">Unit:</span>
                    <span className="pdv__spec-val">
                      {unitNo && `${unitNo} `}
                      {unitName}
                    </span>
                  </div>
                )}

                <div className="pdv__spec-item">
                  <span className="pdv__spec-label">Stock:</span>
                  <span className="pdv__spec-val">{stockQuantity}</span>
                </div>

                {writtenPrice > 0 && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">MRP:</span>
                    <span className="pdv__spec-val">
                      ₹{writtenPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {discountPercent > 0 && (
                  <div className="pdv__spec-item">
                    <span className="pdv__spec-label">Discount:</span>
                    <span className="pdv__spec-val">{discountPercent}%</span>
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}

              <div className="pdv__footer-actions">
                <button
                  type="button"
                  className="pdv__link-action pdv__share-action"
                  onClick={handleShare}
                  aria-label={`Share ${
                    product?.productName || product?.name || "product"
                  }`}
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

          <section className="pdv__reviews-wrapper">
            <h2 className="pdv__reviews-title">Customer Reviews</h2>

            <div className="pdv__reviews-summary-card">
              {/* LEFT SCORE BLOCK */}

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

              {/* MIDDLE RATING DISTRIBUTION */}

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

              {/* RIGHT REVIEW CTA */}

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

            {/* REVIEW LIST */}

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

                      <h3 className="pdv__review-headline">
                        {review?.title || "Customer Review"}
                      </h3>

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

              <form className="pdv__review-form" onSubmit={handleSubmitReview}>
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

                <div className="pdv__review-notice">
                  <CheckBadge />

                  <span>
                    Your review will be published after admin approval.
                  </span>
                </div>

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
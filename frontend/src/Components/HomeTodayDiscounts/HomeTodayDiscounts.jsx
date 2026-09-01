import React, { useEffect, useState } from "react";

import {
  FiHeart,
  FiEye,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiStar,
} from "react-icons/fi";

import { LuArrowRightLeft } from "react-icons/lu";

import API, { IMG_URL } from "../../api/axios";
import Swal from "sweetalert2";

import "./HomeTodayDiscounts.css";

// ======================================================
// HELPERS
// ======================================================

const getSafeText = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
};

// ======================================================
// PRODUCT NAME
// ======================================================

const getProductName = (product) => {
  if (!product) {
    return "";
  }

  return getSafeText(product.productName || product.name, "Product");
};

// ======================================================
// CATEGORY NAME
// ======================================================

const getCategoryName = (category) => {
  if (!category) {
    return "";
  }

  // category = "Vegetables"
  if (typeof category === "string") {
    return category;
  }

  // category = { _id, name }
  if (typeof category === "object") {
    return getSafeText(category.name, "");
  }

  return "";
};

// ======================================================
// BRAND NAME
// ======================================================

const getBrandName = (brand) => {
  if (!brand) {
    return "";
  }

  if (typeof brand === "string") {
    return brand;
  }

  if (typeof brand === "object") {
    return getSafeText(brand.name, "");
  }

  return "";
};

// ======================================================
// UNIT NAME
// ======================================================

const getUnitName = (unit) => {
  if (!unit) {
    return "";
  }

  if (typeof unit === "string") {
    return unit;
  }

  if (typeof unit === "object") {
    return getSafeText(unit.name, "");
  }

  return "";
};

// ======================================================
// PRODUCT IMAGE
// ======================================================

const getProductImage = (product) => {
  if (!product) {
    return "";
  }

  let image = "";

  if (Array.isArray(product.images) && product.images.length > 0) {
    image = product.images[0];
  } else if (product.image) {
    image = product.image;
  }

  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${IMG_URL}${image}`;
};

// ======================================================
// PRODUCT GALLERY
// ======================================================

const getProductGallery = (product) => {
  if (!product) {
    return [];
  }

  if (Array.isArray(product.images)) {
    return product.images.filter(Boolean).map((image) => {
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }

      return `${IMG_URL}${image}`;
    });
  }

  return [];
};

// ======================================================
// NORMALIZE DISCOUNT
// ======================================================

const normalizeDiscount = (discount) => {
  if (!discount) {
    return null;
  }

  const product = discount.product;

  if (!product) {
    return null;
  }

  const productId = product._id || product.id;

  const productName = getProductName(product);

  const category = getCategoryName(product.category);

  const brand = getBrandName(product.brand);

  const unit = getUnitName(product.unit);

  const gallery = getProductGallery(product);

  const image = getProductImage(product);

  const originalPrice = Number(product.price || 0);

  const discountPrice = Number(
    discount.discountPrice ?? product.discountPrice ?? 0,
  );

  const finalPrice = discountPrice > 0 ? discountPrice : originalPrice;

  let discountPercentage = 0;

  if (originalPrice > 0 && finalPrice < originalPrice) {
    discountPercentage = Math.round(
      ((originalPrice - finalPrice) / originalPrice) * 100,
    );
  }

  const stockQuantity = Number(product.stockQuantity ?? product.stock ?? 0);

  const outOfStock = Boolean(product.isOutOfStock) || stockQuantity <= 0;

  return {
    ...discount,

    id: productId,
    _id: productId,
    productId,

    product,

    title: productName,

    productName: productName,

    name: productName,

    category: category,

    categoryName: category,

    brandName: brand,

    unitName: unit,

    primaryImage: image,

    hoverImage: gallery[1] || image,

    images: gallery,

    price: finalPrice,

    originalPrice: originalPrice,

    discountPrice: discountPrice,

    discountPercentage,

    stockQuantity,

    isOutOfStock: outOfStock,

    badge: discountPercentage > 0 ? `${discountPercentage}% OFF` : "Sale",

    rating: Number(product.rating || product.averageRating || 0),

    options: unit ? [unit] : [],

    optionLabel: unit ? "Unit:" : "Option:",
  };
};

// ======================================================
// COMPONENT
// ======================================================

const HomeTodayDiscounts = () => {
  // ==================================================
  // STATE
  // ==================================================

  const [products, setProducts] = useState([]);

  const [selectedOptions, setSelectedOptions] = useState({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==================================================
  // FETCH ACTIVE TODAY DISCOUNTS
  // ==================================================

  const fetchTodayDiscounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/today-discounts/active");

      const backendData =
        response?.data?.data || response?.data?.discounts || [];

      if (!Array.isArray(backendData)) {
        setProducts([]);
        return;
      }

      // ==========================================
      // NORMALIZE
      // ==========================================

      const normalized = backendData.map(normalizeDiscount).filter(Boolean);

      // ==========================================
      // ONLY VALID ACTIVE PRODUCTS
      // ==========================================

      const activeProducts = normalized.filter((item) => {
        const status = String(item?.status || "").toLowerCase();

        return status === "active" || status === "";
      });

      setProducts(activeProducts);

      // ==========================================
      // DEFAULT OPTIONS
      // ==========================================

      const defaultOptions = {};

      activeProducts.forEach((product) => {
        if (Array.isArray(product.options) && product.options.length > 0) {
          defaultOptions[product.productId] = product.options[0];
        }
      });

      setSelectedOptions(defaultOptions);
    } catch (error) {
      console.error("Fetch Today Discounts error:", error);

      console.error("API ERROR RESPONSE:", error?.response?.data);

      setProducts([]);

      setError(
        error?.response?.data?.message || "Failed to load today's discounts.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL FETCH
  // ==================================================

  useEffect(() => {
    fetchTodayDiscounts();
  }, []);

  // ==================================================
  // OPTION CHANGE
  // ==================================================

  const handleOptionChange = (productId, value) => {
    setSelectedOptions((previous) => ({
      ...previous,

      [productId]: value,
    }));
  };

  // ==================================================
  // SHOW MORE
  // ==================================================

  const handleShowMoreClick = (event) => {
    event.preventDefault();

    window.location.href = "/discounts";
  };

  const handleAddToCart = async (product) => {
    try {
      const productId =
        product?.productId || product?._id || product?.product?._id;

      if (!productId) {
        console.error("Product ID missing:", product);

        await Swal.fire({
          icon: "error",
          title: "Product ID Missing",
          text: "Unable to add this product to your cart.",
          confirmButtonText: "OK",
        });

        return;
      }

      const token = localStorage.getItem("token");

      // ==================================================
      // GUEST CART
      // ==================================================

      if (!token) {
        let guestCart = [];

        try {
          const storedCart = localStorage.getItem("guestCart");

          guestCart = storedCart ? JSON.parse(storedCart) : [];

          if (!Array.isArray(guestCart)) {
            guestCart = [];
          }
        } catch {
          guestCart = [];
        }

        const existingIndex = guestCart.findIndex(
          (item) =>
            String(item?.productId || item?.id || item?._id) ===
            String(productId),
        );

        if (existingIndex !== -1) {
          guestCart[existingIndex] = {
            ...guestCart[existingIndex],
            quantity: Number(guestCart[existingIndex]?.quantity || 1) + 1,
          };
        } else {
          guestCart.push({
            id: String(productId),

            productId: String(productId),

            name:
              product?.productName ||
              product?.name ||
              product?.title ||
              "Product",

            price: Number(product?.price || 0),

            originalPrice: Number(
              product?.originalPrice ||
                product?.product?.price ||
                product?.price ||
                0,
            ),

            discountPrice: Number(
              product?.discountPrice || product?.price || 0,
            ),

            todayDiscountPrice: Number(
              product?.discountPrice || product?.price || 0,
            ),

            isTodayDiscount: true,

            quantity: 1,

            size: product?.unitName || product?.unit?.name || "Standard Pack",

            stockQuantity: Number(product?.stockQuantity || 0),

            image: product?.primaryImage || product?.image || "",
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        window.dispatchEvent(new Event("cartUpdated"));

        await Swal.fire({
          icon: "success",
          title: "Added to Cart!",
          text: `${
            product?.productName || product?.name || "Product"
          } has been added to your cart.`,
          confirmButtonText: "Continue Shopping",
          timer: 1800,
          timerProgressBar: true,
        });

        return;
      }

      // ==================================================
      // LOGGED-IN USER
      // ==================================================

      const response = await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text:
          response?.data?.message ||
          `${
            product?.productName || product?.name || "Product"
          } has been added to your cart.`,
        confirmButtonText: "Continue Shopping",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);

      console.error("API ERROR:", error?.response?.data);

      await Swal.fire({
        icon: "error",
        title: "Unable to Add",
        text:
          error?.response?.data?.message ||
          error?.apiMessage ||
          error?.message ||
          "Unable to add product to cart.",
        confirmButtonText: "OK",
      });
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <section
        className="HomeTodayDiscounts"
        aria-labelledby="today-discounts-heading"
      >
        <div className="HomeTodayDiscounts-container">
          <div className="HomeTodayDiscounts-header">
            <h2
              id="today-discounts-heading"
              className="HomeTodayDiscounts-title"
            >
              Grocery Sathi Today Discounts
            </h2>
          </div>

          <div className="HomeTodayDiscounts-grid">
            {[1, 2, 3, 4].map((item) => (
              <article key={item} className="HomeTodayDiscounts-card">
                <div
                  style={{
                    width: "100%",
                    height: "300px",
                    background: "#f3f4f6",
                    borderRadius: "12px",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==================================================
  // NO DISCOUNTS
  // ==================================================

  if (!products.length) {
    return null;
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <section
      className="HomeTodayDiscounts"
      aria-labelledby="today-discounts-heading"
    >
      <div className="HomeTodayDiscounts-container">
        {/* ============================================
              HEADER
          ============================================ */}

        <div className="HomeTodayDiscounts-header">
          <h2 id="today-discounts-heading" className="HomeTodayDiscounts-title">
            Grocery Sathi Today Discounts
          </h2>

          <a
            href="/discounts"
            className="HomeTodayDiscounts-showMoreBtn"
            onClick={handleShowMoreClick}
            aria-label="View more discounted products"
          >
            <span>Show more products</span>

            <FiChevronRight className="btn-icon" aria-hidden="true" />
          </a>
        </div>

        {/* ============================================
              PRODUCT GRID
          ============================================ */}

        <div className="HomeTodayDiscounts-grid">
          {products.map((product) => {
            const productId = product.productId || product._id;

            const title = product.title || product.productName || "Product";

            const category = getCategoryName(product.category);

            const rating = Number(product.rating || 0);

            const currentPrice = Number(product.price || 0);

            const originalPrice = Number(product.originalPrice || 0);

            const discountPercentage = Number(product.discountPercentage || 0);

            const image = product.primaryImage;

            const hoverImage = product.hoverImage || image;

            const options = Array.isArray(product.options)
              ? product.options
              : [];

            return (
              <article
                key={productId}
                className="HomeTodayDiscounts-card"
                itemScope
                itemType="https://schema.org/Product"
              >
                {/* ==================================
                        BADGE
                    ================================== */}

                {product.badge && (
                  <span
                    className="HomeTodayDiscounts-badge"
                    aria-label={`Status: ${product.badge}`}
                  >
                    {product.badge}
                  </span>
                )}

                {/* ==================================
                        ACTION BUTTONS
                    ================================== */}

                <div className="HomeTodayDiscounts-actions">
                  <button type="button" aria-label={`Add ${title} to Wishlist`}>
                    <FiHeart aria-hidden="true" />
                  </button>

                  <button type="button" aria-label={`Compare ${title}`}>
                    <LuArrowRightLeft aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Quick view details for ${title}`}
                  >
                    <FiEye aria-hidden="true" />
                  </button>
                </div>

                {/* ==================================
                        IMAGE NAVIGATION
                    ================================== */}

                <button
                  type="button"
                  className="HomeTodayDiscounts-hoverNavBtn"
                  aria-label="Previous product image"
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>

                {/* ==================================
                        IMAGE
                    ================================== */}

                <div className="HomeTodayDiscounts-imgWrapper">
                  {image ? (
                    <img
                      src={image}
                      alt={`Buy ${title} online at Grocery Sathi`}
                      className="HomeTodayDiscounts-img primary-img"
                      itemProp="image"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="HomeTodayDiscounts-img primary-img"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f5f5f5",
                        color: "#999",
                      }}
                    >
                      No Image
                    </div>
                  )}

                  {hoverImage && (
                    <img
                      src={hoverImage}
                      alt={`${title} alternative angle view`}
                      className="HomeTodayDiscounts-img hover-img"
                    />
                  )}
                </div>

                {/* ==================================
                        PRODUCT INFO
                    ================================== */}

                <div className="HomeTodayDiscounts-info">
                  {/* CATEGORY */}

                  <span className="HomeTodayDiscounts-category">
                    {category || "Grocery"}
                  </span>

                  {/* PRODUCT NAME */}

                  <h3
                    className="HomeTodayDiscounts-productTitle"
                    itemProp="name"
                  >
                    <a
                      href={`/productdetails/${productId}`}
                      className="product-title-link"
                    >
                      {title}
                    </a>
                  </h3>

                  {/* =================================
                          RATING
                      ================================= */}

                  <div
                    className="HomeTodayDiscounts-rating"
                    aria-label={`Rated ${rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={star <= rating ? "star filled" : "star"}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {/* =================================
                          PRICE
                      ================================= */}

                  <div
                    className="HomeTodayDiscounts-priceBox"
                    itemProp="offers"
                    itemScope
                    itemType="https://schema.org/Offer"
                  >
                    <meta itemProp="priceCurrency" content="INR" />

                    <span
                      className="HomeTodayDiscounts-currentPrice"
                      itemProp="price"
                    >
                      ₹{currentPrice.toLocaleString("en-IN")}
                    </span>

                    {originalPrice > currentPrice && (
                      <span
                        className="HomeTodayDiscounts-originalPrice"
                        aria-label={`Original price: ₹${originalPrice}`}
                      >
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* =================================
                          OPTION
                      ================================= */}

                  {options.length > 0 && (
                    <div className="HomeTodayDiscounts-optionGroup">
                      <label htmlFor={`option-select-${productId}`}>
                        {product.optionLabel}
                      </label>

                      <div className="HomeTodayDiscounts-selectWrapper">
                        <select
                          id={`option-select-${productId}`}
                          value={selectedOptions[productId] || options[0]}
                          onChange={(event) =>
                            handleOptionChange(productId, event.target.value)
                          }
                          aria-label={`Select ${product.optionLabel}`}
                        >
                          {options.map((option, index) => {
                            const safeOption = getSafeText(option, "");

                            return (
                              <option
                                key={`${productId}-${safeOption}-${index}`}
                                value={safeOption}
                              >
                                {safeOption}
                              </option>
                            );
                          })}
                        </select>

                        <FiChevronDown
                          className="select-arrow"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  )}

                  {/* =================================
                          ADD TO CART
                      ================================= */}

                  <button
                    type="button"
                    className="HomeTodayDiscounts-addToCartBtn"
                    aria-label={`Add ${title} to shopping cart`}
                    onClick={() => handleAddToCart(product)}
                  >
                    <span>Add to Cart</span>

                    <FiChevronRight className="btn-icon" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeTodayDiscounts;

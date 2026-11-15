import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import { addToCart, updateCartQuantity, isLoggedIn, getGuestCart } from "../../Utils/cartService";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Check,
  ShoppingBag,
} from "lucide-react";
import Swal from "sweetalert2";
import formatUnit from "../../Utils/formatUnit";
import "./RelatedProducts.css";

const resolveImage = (rawImage) => {
  if (!rawImage) return "";
  if (typeof rawImage !== "string") return "";
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    return rawImage;
  }
  const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
  const base = BASE_URL || "http://localhost:5000";
  return `${base}${cleanPath}`;
};

const RelatedProducts = ({ currentProduct, productId }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartQuantities, setCartQuantities] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState({});

  // Fetch current cart state to know existing quantities
  const syncCart = useCallback(async () => {
    try {
      if (isLoggedIn()) {
        const { data } = await API.get("/cart");
        const items =
          data?.cart?.items ||
          data?.data?.cart?.items ||
          data?.data?.items ||
          data?.items ||
          [];
        const map = {};
        items.forEach((item) => {
          const pid = String(
            item.productId?._id ||
              item.productId?.id ||
              item.productId ||
              item.product?._id ||
              item.product?.id ||
              item.product ||
              item.id ||
              ""
          );
          if (pid) map[pid] = Number(item.quantity) || 1;
        });
        setCartQuantities(map);
      } else {
        const guestItems = getGuestCart();
        const map = {};
        guestItems.forEach((item) => {
          const pid = String(item.productId || item.id || "");
          if (pid) map[pid] = Number(item.quantity) || 1;
        });
        setCartQuantities(map);
      }
    } catch {
      // silently fail
    }
  }, []);

  // Fetch related products strictly based on current product's category
  const fetchRelatedProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Determine category ID and category name from currentProduct
      const catObj = currentProduct?.category;
      const catId =
        typeof catObj === "object" ? catObj?._id : catObj || "";
      const catName =
        typeof catObj === "object" ? catObj?.name : "";

      const currentId = String(
        currentProduct?._id || currentProduct?.id || productId || ""
      );
      const currentSlug = currentProduct?.slug || "";

      // Fetch all products
      const { data } = await API.get("/products?limit=100");
      const all =
        data?.data?.products || data?.products || data?.data || [];

      if (!Array.isArray(all)) {
        setRelatedProducts([]);
        return;
      }

      // Filter products from the same category, excluding current product
      let matching = all.filter((p) => {
        const pId = String(p._id || p.id || "");
        if (pId === currentId) return false;
        if (currentSlug && p.slug === currentSlug) return false;

        const pCat = p.category;
        const pCatId = typeof pCat === "object" ? pCat?._id : pCat || "";
        const pCatName = typeof pCat === "object" ? pCat?.name : p.categoryName || "";

        if (catId && pCatId && String(pCatId) === String(catId)) return true;
        if (catName && pCatName && pCatName.toLowerCase() === catName.toLowerCase()) return true;

        return false;
      });

      // If category has few items, supplement with active products from store
      if (matching.length < 4) {
        const others = all.filter((p) => {
          const pId = String(p._id || p.id || "");
          if (pId === currentId) return false;
          if (matching.some((m) => String(m._id || m.id) === pId)) return false;
          return true;
        });
        matching = [...matching, ...others.slice(0, 8 - matching.length)];
      }

      setRelatedProducts(matching);
    } catch (err) {
      console.error("Failed to load related products:", err);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentProduct, productId]);

  useEffect(() => {
    fetchRelatedProducts();
    syncCart();

    const handleCartUpdated = () => syncCart();
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, [fetchRelatedProducts, syncCart]);

  // Horizontal scroll checks
  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, relatedProducts]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = Math.min(scrollRef.current.clientWidth * 0.75, 580);
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async (product) => {
    const pid = String(product._id || product.id);
    const res = await addToCart(product, 1);
    if (res?.success) {
      setAddedAnimation((prev) => ({ ...prev, [pid]: true }));
      setTimeout(() => {
        setAddedAnimation((prev) => ({ ...prev, [pid]: false }));
      }, 1400);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${product.productName || product.name} added to cart`,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    }
  };

  const handleUpdateQuantity = async (product, newQty) => {
    const pid = String(product._id || product.id);
    await updateCartQuantity(pid, newQty);
  };

  const handleProductNavigate = (p) => {
    const slugOrId = p.slug || p._id || p.id;
    navigate(`/product/${slugOrId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!loading && relatedProducts.length === 0) {
    return null;
  }

  const catDisplayName =
    typeof currentProduct?.category === "object"
      ? (typeof currentProduct?.category?.name === "string" ? currentProduct.category.name : "this category")
      : (typeof currentProduct?.category === "string" ? currentProduct.category : "this category");

  return (
    <section className="related-products-section" aria-label="Related Products">
      <div className="related-products-container">
        {/* HEADER ROW */}
        <div className="related-products-header">
          <div className="related-header-left">
            <div className="related-badge">
              <Sparkles size={13} className="related-badge-icon" />
              <span>FRESH RECOMMENDATIONS</span>
            </div>
            <h2 className="related-title">Related Products</h2>
            <p className="related-subtitle">
              Customers also bought these fresh essentials in{" "}
              <strong>{catDisplayName}</strong>
            </p>
          </div>

          {/* ARROW CONTROLS */}
          <div className="related-nav-controls">
            <button
              type="button"
              className={`related-nav-btn ${!canScrollLeft ? "disabled" : ""}`}
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous related products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`related-nav-btn ${!canScrollRight ? "disabled" : ""}`}
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next related products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* PRODUCTS CAROUSEL / ROW */}
        <div className="related-products-track-wrap">
          <div className="related-products-track" ref={scrollRef}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="related-card-skeleton">
                    <div className="related-skeleton-img" />
                    <div className="related-skeleton-line" />
                    <div className="related-skeleton-line short" />
                  </div>
                ))
              : relatedProducts.map((p) => {
                  const pid = String(p._id || p.id);
                  const name = p.productName || p.name || "Grocery Item";
                  const price = Number(p.price) || 0;
                  const discountPrice = Number(p.discountPrice) || 0;
                  const effectivePrice =
                    discountPrice > 0 && discountPrice < price
                      ? discountPrice
                      : price;
                  const hasDiscount =
                    discountPrice > 0 && discountPrice < price;
                  const discountPercent = hasDiscount
                    ? Math.round(((price - discountPrice) / price) * 100)
                    : 0;
                  const unitText = formatUnit(p.unit, p.unitNo);
                  const imgUrl = resolveImage(
                    (p.images && p.images[0]) || p.image
                  );
                  const qty = cartQuantities[pid] || 0;
                  const isJustAdded = addedAnimation[pid];

                  return (
                    <article key={pid} className="related-product-card">
                      {/* TOP BADGES */}
                      <div className="related-card-top-badges">
                        {discountPercent > 0 && (
                          <span className="related-discount-tag">
                            {discountPercent}% OFF
                          </span>
                        )}
                        <span className="related-speed-badge">
                          <Clock size={10} />
                          <span>10 MINS</span>
                        </span>
                      </div>

                      {/* IMAGE */}
                      <div
                        className="related-card-img-wrap"
                        onClick={() => handleProductNavigate(p)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleProductNavigate(p);
                        }}
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={name}
                            className="related-card-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="related-card-noimg">
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>

                      {/* BODY CONTENT */}
                      <div className="related-card-body">
                        <span className="related-card-unit">{unitText}</span>

                        <h3
                          className="related-card-title"
                          onClick={() => handleProductNavigate(p)}
                          title={name}
                        >
                          {name}
                        </h3>

                        {/* PRICE & ADD ROW */}
                        <div className="related-card-action-row">
                          <div className="related-card-price-col">
                            <span className="related-price-curr">
                              ₹{effectivePrice}
                            </span>
                            {hasDiscount && (
                              <span className="related-price-orig">
                                ₹{price}
                              </span>
                            )}
                          </div>

                          {/* ADD TO CART / STEPPER */}
                          <div className="related-card-cta-col">
                            {qty === 0 ? (
                              <button
                                type="button"
                                className={`related-add-btn ${
                                  isJustAdded ? "added" : ""
                                }`}
                                onClick={() => handleAddToCart(p)}
                                disabled={p.stockQuantity === 0}
                              >
                                {isJustAdded ? (
                                  <>
                                    <Check size={13} />
                                    <span>ADDED</span>
                                  </>
                                ) : p.stockQuantity === 0 ? (
                                  "OUT"
                                ) : (
                                  <>
                                    <Plus size={13} />
                                    <span>ADD</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="related-stepper">
                                <button
                                  type="button"
                                  className="related-stepper-btn"
                                  onClick={() =>
                                    handleUpdateQuantity(p, qty - 1)
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="related-stepper-qty">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  className="related-stepper-btn"
                                  onClick={() =>
                                    handleUpdateQuantity(p, qty + 1)
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;

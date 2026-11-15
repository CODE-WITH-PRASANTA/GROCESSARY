import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import "./CategoryWiseSections.css";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Minus,
  Check,
  Heart,
} from "lucide-react";
import Swal from "sweetalert2";
import formatUnit from "../../Utils/formatUnit";
import { getGuestCart, saveGuestCart } from "../../Utils/cartService";
import {
  fetchWishlistItems,
  addToWishlist,
  removeFromWishlist,
} from "../../Utils/wishlistService";

const isLoggedIn = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("userToken");
    return Boolean(token);
  } catch {
    return false;
  }
};

const resolveImage = (rawImage) => {
  if (!rawImage) return "";
  if (typeof rawImage !== "string") return "";
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    return rawImage;
  }
  const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
  return `${BASE_URL}${cleanPath}`;
};

// -------------------------------------------------------------
// SINGLE CATEGORY ROW COMPONENT WITH SMOOTH HORIZONTAL SCROLL
// -------------------------------------------------------------
const CategoryRow = ({
  category,
  products,
  cartQuantities,
  wishlistIds = new Set(),
  onAddToCart,
  onUpdateQuantity,
  onToggleWishlist,
  onSeeAll,
  onProductClick,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const isOverflow = scrollWidth > clientWidth + 8;
    setHasOverflow(isOverflow);
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(isOverflow && scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    // Run initial check and a delayed check to account for dynamic image rendering
    checkScroll();
    const t = setTimeout(checkScroll, 350);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      clearTimeout(t);
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, products]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = Math.min(scrollRef.current.clientWidth * 0.75, 680);
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  // Validation: Only show "see all" if there are more products in the database
  // or if the category products overflow the current row viewport
  const totalInDb = Number(category.productCount ?? products.length);
  const hasMoreProducts = totalInDb > products.length || hasOverflow;

  const rowId = `cat-row-${(category.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return (
    <div className="cat-wise-row" id={rowId}>
      {/* ROW HEADER: Category Name on left, "see all" on right only when more products exist */}
      <div className="cat-wise-row-header">
        <h3 className="cat-wise-row-title">{category.name}</h3>
        {hasMoreProducts && (
          <button
            type="button"
            className="cat-wise-see-all-btn"
            onClick={() => onSeeAll(category)}
          >
            see all
          </button>
        )}
      </div>

      {/* HORIZONTAL CAROUSEL WRAPPER */}
      <div className="cat-wise-carousel-container">
        {/* Left Arrow Button */}
        {canScrollLeft && hasOverflow && (
          <button
            type="button"
            className="cat-wise-arrow-btn cat-wise-arrow-btn--left"
            onClick={() => handleScroll("left")}
            aria-label={`Scroll ${category.name} left`}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Scrollable Track - Expands to full width when few items fit */}
        <div
          className={`cat-wise-track ${
            !hasOverflow ? "cat-wise-track--fit" : ""
          }`}
          ref={scrollRef}
        >
          {products.map((product) => {
            const qty = cartQuantities[product.id] || 0;
            const hasDiscount = product.oldPrice > product.price && product.oldPrice > 0;
            const isWishlisted = wishlistIds.has(String(product.id));

            return (
              <div
                key={product.id}
                className="cat-wise-card"
                onClick={() => onProductClick(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onProductClick(product);
                  }
                }}
              >
                {/* Product Image Box */}
                <div className="cat-wise-card-img-wrap">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="cat-wise-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="cat-wise-card-img-placeholder">
                      <span>🛒</span>
                    </div>
                  )}

                  {/* Wishlist Heart Button */}
                  <button
                    type="button"
                    className={`cat-wise-wishlist-btn ${
                      isWishlisted ? "cat-wise-wishlist-btn--active" : ""
                    }`}
                    onClick={(e) => onToggleWishlist(product, e)}
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      size={15}
                      fill={isWishlisted ? "#ef4444" : "none"}
                      color={isWishlisted ? "#ef4444" : "#64748b"}
                    />
                  </button>

                  {hasDiscount && (
                    <span className="cat-wise-discount-badge">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Delivery Time Badge (10 MINS) */}
                <div className="cat-wise-delivery-time">
                  <Clock size={11} className="cat-wise-clock-icon" />
                  <span>10 MINS</span>
                </div>

                {/* Product Title */}
                <h4 className="cat-wise-product-title" title={product.name}>
                  {product.name}
                </h4>

                {/* Unit / Weight Label */}
                <div className="cat-wise-unit">{product.unit || "1 pc"}</div>

                {/* Price & Action Row */}
                <div className="cat-wise-bottom-row">
                  <div className="cat-wise-price-wrap">
                    <span className="cat-wise-price">₹{product.price}</span>
                    {hasDiscount && (
                      <span className="cat-wise-old-price">₹{product.oldPrice}</span>
                    )}
                  </div>

                  {/* ADD Button / Stepper */}
                  <div
                    className="cat-wise-action-wrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {qty === 0 ? (
                      <button
                        type="button"
                        className="cat-wise-add-btn"
                        onClick={(e) => onAddToCart(product, e)}
                        disabled={product.stockQuantity === 0}
                      >
                        {product.stockQuantity === 0 ? "OUT" : "ADD"}
                      </button>
                    ) : (
                      <div className="cat-wise-stepper">
                        <button
                          type="button"
                          className="cat-wise-stepper-btn"
                          onClick={() => onUpdateQuantity(product, qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="cat-wise-stepper-qty">{qty}</span>
                        <button
                          type="button"
                          className="cat-wise-stepper-btn"
                          onClick={() => onUpdateQuantity(product, qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && hasOverflow && (
          <button
            type="button"
            className="cat-wise-arrow-btn cat-wise-arrow-btn--right"
            onClick={() => handleScroll("right")}
            aria-label={`Scroll ${category.name} right`}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MAIN COMPONENT: CATEGORY WISE SECTIONS
// -------------------------------------------------------------
const CategoryWiseSections = () => {
  const navigate = useNavigate();
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Sync Wishlist IDs across guest & logged-in user
  const syncWishlist = useCallback(async () => {
    try {
      const items = await fetchWishlistItems();
      const ids = (Array.isArray(items) ? items : []).map((i) =>
        String(i.id || i.productId || i._id)
      );
      setWishlistIds(new Set(ids));
    } catch {
      setWishlistIds(new Set());
    }
  }, []);

  // Sync Cart items & quantities
  const syncCart = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        const { data } = await API.get("/cart");
        const items =
          data?.cart?.items ||
          data?.data?.cart?.items ||
          data?.data?.items ||
          data?.items ||
          [];
        const qMap = {};
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
          if (pid) {
            qMap[pid] = Number(item.quantity || 0);
          }
        });
        setCartQuantities(qMap);
      } catch {
        setCartQuantities({});
      }
    } else {
      const guestCart = getGuestCart();
      const qMap = {};
      guestCart.forEach((item) => {
        const pid = String(item.productId || item.id || "");
        if (pid) {
          qMap[pid] = Number(item.quantity || 0);
        }
      });
      setCartQuantities(qMap);
    }
  }, []);

  // Fetch products, active discounts, categories & units
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, discountsRes, categoriesRes, unitsRes] =
        await Promise.all([
          API.get("/products"),
          API.get("/today-discounts/active").catch(() => ({ data: [] })),
          API.get("/categories?hasProducts=true").catch(() => ({ data: [] })),
          API.get("/units").catch(() => ({ data: [] })),
        ]);

      const rawProducts =
        productsRes.data?.data ||
        productsRes.data?.products ||
        productsRes.data ||
        [];
      const rawDiscounts =
        discountsRes.data?.data ||
        discountsRes.data?.todayDiscounts ||
        discountsRes.data ||
        [];
      const rawCategories =
        categoriesRes.data?.data ||
        categoriesRes.data?.categories ||
        categoriesRes.data ||
        [];
      const rawUnits =
        unitsRes.data?.data || unitsRes.data?.units || unitsRes.data || [];

      // Discount mapping
      const discountMap = new Map();
      (Array.isArray(rawDiscounts) ? rawDiscounts : []).forEach((d) => {
        if (!d) return;
        const pid =
          typeof d.product === "object"
            ? d.product?._id || d.product?.id
            : d.product;
        if (!pid) return;
        const status = String(d.status || "active").toLowerCase();
        if (status !== "active") return;
        const now = new Date();
        if (d.startDate && new Date(d.startDate) > now) return;
        if (d.endDate && new Date(d.endDate) < now) return;
        const dp = Number(d.discountPrice || 0);
        if (dp > 0) discountMap.set(String(pid), dp);
      });

      // Unit text helper
      const getUnitText = (p) => {
        let symbol = "";
        if (p.unit) {
          if (typeof p.unit === "object") {
            symbol = p.unit.name || p.unit.symbol || "";
          } else {
            const match = (Array.isArray(rawUnits) ? rawUnits : []).find(
              (u) => String(u._id || u.id) === String(p.unit)
            );
            if (match) symbol = match.name || match.symbol || "";
          }
        }
        return formatUnit(symbol || p.unit, p.unitNo);
      };

      // Normalized active products
      const activeProducts = (Array.isArray(rawProducts) ? rawProducts : [])
        .filter((p) => {
          const s = String(p?.status ?? "active").toLowerCase();
          return s === "active" || s === "true" || s === "1";
        })
        .map((p) => {
          const productId = String(p._id || p.id || "");
          const todayPrice = discountMap.get(productId) || 0;
          const basePrice = Number(p.price || 0);
          const writtenPrice = Number(p.writtenPrice || 0);
          const productDiscountPrice = Number(p.discountPrice || 0);

          let price = basePrice;
          let oldPrice = writtenPrice > basePrice ? writtenPrice : basePrice;

          if (todayPrice > 0 && todayPrice < basePrice) {
            price = todayPrice;
            oldPrice = basePrice;
          } else if (
            productDiscountPrice > 0 &&
            productDiscountPrice < basePrice
          ) {
            price = productDiscountPrice;
            oldPrice = basePrice;
          }

          const discount =
            oldPrice > price && oldPrice > 0
              ? Math.round(((oldPrice - price) / oldPrice) * 100)
              : 0;

          let rawImage = "";
          if (Array.isArray(p.images) && p.images.length > 0) {
            rawImage = p.images[0];
          } else {
            rawImage = p.image || p.thumbnail || "";
          }

          let catName = "";
          let catId = "";
          if (p.category) {
            if (typeof p.category === "object") {
              catName = p.category.name || "";
              catId = String(p.category._id || p.category.id || "");
            } else {
              catName = String(p.category);
              catId = String(p.category);
            }
          }

          return {
            id: productId,
            _id: productId,
            name: p.productName || p.name || "Product",
            slug: p.slug || productId,
            categoryName: catName,
            categoryId: catId,
            price,
            oldPrice,
            discount,
            unit: getUnitText(p),
            image: resolveImage(rawImage),
            stockQuantity: Number(p.stockQuantity ?? 10),
          };
        });

      // Group products by active categories that have products
      const catList = Array.isArray(rawCategories) ? rawCategories : [];
      const grouped = [];

      catList.forEach((cat) => {
        const catName = (cat.name || "").trim();
        const catId = String(cat._id || cat.id || "").trim();

        // Find products belonging to this category
        const prods = activeProducts.filter((p) => {
          if (catId && p.categoryId === catId) return true;
          if (
            catName &&
            p.categoryName &&
            p.categoryName.toLowerCase() === catName.toLowerCase()
          ) {
            return true;
          }
          return false;
        });

        if (prods.length > 0) {
          grouped.push({
            category: cat,
            products: prods,
          });
        }
      });

      // If categories API didn't return matches or is empty, group by unique product categories
      if (grouped.length === 0 && activeProducts.length > 0) {
        const uniqueCatNames = [
          ...new Set(activeProducts.map((p) => p.categoryName).filter(Boolean)),
        ];
        uniqueCatNames.forEach((name) => {
          const prods = activeProducts.filter((p) => p.categoryName === name);
          if (prods.length > 0) {
            grouped.push({
              category: { name, _id: name },
              products: prods,
            });
          }
        });
      }

      setCategoriesWithProducts(grouped);
    } catch (err) {
      console.error("Failed to load category-wise sections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    syncCart();
    syncWishlist();

    const handleCartUpdate = () => syncCart();
    const handleWishlistUpdate = () => syncWishlist();

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, [fetchData, syncCart, syncWishlist]);

  // TOGGLE WISHLIST HANDLER
  const handleToggleWishlist = async (product, e) => {
    e?.stopPropagation();
    const pid = String(product.id || product._id || "");
    if (!pid) return;

    const isCurrentlyWishlisted = wishlistIds.has(pid);
    try {
      if (isCurrentlyWishlisted) {
        await removeFromWishlist(pid);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(pid);
          return next;
        });
      } else {
        await addToWishlist(product);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(pid);
          return next;
        });
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      syncWishlist();
    }
  };

  // ADD TO CART HANDLER
  const handleAddToCart = async (product, e) => {
    e?.stopPropagation();
    const productId = product.id;
    if (!productId) return;

    if (product.stockQuantity === 0) {
      Swal.fire({
        icon: "warning",
        title: "Out of stock",
        text: `${product.name} is currently unavailable.`,
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    try {
      setCartQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));

      if (isLoggedIn()) {
        await API.post("/cart/add", {
          productId,
          quantity: 1,
        });
      } else {
        const guestCart = getGuestCart();
        const existing = guestCart.find(
          (i) => String(i.productId || i.id) === productId
        );
        if (existing) {
          existing.quantity = Number(existing.quantity || 0) + 1;
        } else {
          guestCart.push({
            id: productId,
            productId,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            unit: product.unit,
            stockQuantity: product.stockQuantity,
            quantity: 1,
          });
        }
        saveGuestCart(guestCart);
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to cart error:", err);
      syncCart();
    }
  };

  // UPDATE QUANTITY HANDLER (+ / -)
  const handleUpdateQuantity = async (product, newQty) => {
    const productId = product.id;
    if (!productId) return;

    try {
      if (newQty <= 0) {
        setCartQuantities((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });

        if (isLoggedIn()) {
          await API.delete(`/cart/item/${productId}`).catch(() => {});
        } else {
          const guestCart = getGuestCart().filter(
            (i) => String(i.productId || i.id) !== productId
          );
          saveGuestCart(guestCart);
        }
      } else {
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: newQty,
        }));

        if (isLoggedIn()) {
          await API.put("/cart/update", {
            productId,
            quantity: newQty,
          }).catch(() => {});
        } else {
          const guestCart = getGuestCart();
          const item = guestCart.find(
            (i) => String(i.productId || i.id) === productId
          );
          if (item) {
            item.quantity = newQty;
          }
          saveGuestCart(guestCart);
        }
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Update quantity error:", err);
      syncCart();
    }
  };

  // "SEE ALL" HANDLER -> navigates to Category Details page
  const handleSeeAll = (category) => {
    const slug =
      typeof category === "object" && category !== null
        ? category.slug || category._id || category.name || ""
        : String(category || "");
    const targetSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    navigate(`/category/${encodeURIComponent(targetSlug)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // PRODUCT CARD CLICK HANDLER
  const handleProductClick = (product) => {
    const slug = product.slug || product.id;
    navigate(`/product/${encodeURIComponent(slug)}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (loading) {
    return (
      <section className="cat-wise-sections-container">
        <div className="cat-wise-skeleton-row">
          <div className="cat-wise-skeleton-header" />
          <div className="cat-wise-skeleton-track">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cat-wise-skeleton-card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="cat-wise-sections-container"
      aria-label="Category wise groceries"
    >
      {categoriesWithProducts.map(({ category, products }) => (
        <CategoryRow
          key={category._id || category.name}
          category={category}
          products={products}
          cartQuantities={cartQuantities}
          wishlistIds={wishlistIds}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onToggleWishlist={handleToggleWishlist}
          onSeeAll={handleSeeAll}
          onProductClick={handleProductClick}
        />
      ))}
    </section>
  );
};

export default CategoryWiseSections;

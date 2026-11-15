import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import "./CategoryDetails.css";
import {
  Clock,
  Plus,
  Minus,
  Search,
  ShoppingBag,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
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

const DEFAULT_CATEGORY_ICONS = {
  "fresh fruits": "🍎",
  "fresh vegetables": "🥦",
  "dairy & breakfast": "🥛",
  "staples & grains": "🌾",
  "cooking oils & ghee": "🍾",
  "spices & masalas": "🌶️",
  "snacks & biscuits": "🍪",
  "beverages & tea": "☕",
  "organic & health foods": "🍃",
  "household & cleaning": "🧼",
};

const resolveCategoryIcon = (cat) => {
  if (!cat) return { type: "icon", symbol: "🛒" };
  if (cat.iconUrl) {
    const src = cat.iconUrl.startsWith("http")
      ? cat.iconUrl
      : `${BASE_URL}${cat.iconUrl.startsWith("/") ? "" : "/"}${cat.iconUrl}`;
    return { type: "image", src };
  }
  if (cat.image) {
    const src = cat.image.startsWith("http")
      ? cat.image
      : `${BASE_URL}${cat.image.startsWith("/") ? "" : "/"}${cat.image}`;
    return { type: "image", src };
  }
  if (cat.icon && typeof cat.icon === "string" && cat.icon.trim()) {
    return { type: "icon", symbol: cat.icon.trim() };
  }
  const key = (cat.name || "").toLowerCase().trim();
  const fallback = DEFAULT_CATEGORY_ICONS[key] || "🛒";
  return { type: "icon", symbol: fallback };
};

const CategoryDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [unitsMap, setUnitsMap] = useState(new Map());
  const [discountsMap, setDiscountsMap] = useState(new Map());
  const [cartQuantities, setCartQuantities] = useState({});
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Sync wishlist
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

  // Sync cart quantities
  const syncCart = useCallback(async () => {
    try {
      if (isLoggedIn()) {
        const res = await API.get("/cart");
        const items =
          res.data?.data?.items ||
          res.data?.items ||
          res.data?.cart?.items ||
          [];
        const map = {};
        items.forEach((item) => {
          const pid = String(
            item.productId?._id || item.productId || item.product?._id || item._id
          );
          map[pid] = Number(item.quantity) || 1;
        });
        setCartQuantities(map);
      } else {
        const guestCart = getGuestCart();
        const map = {};
        guestCart.forEach((item) => {
          const pid = String(item.productId || item.id);
          map[pid] = Number(item.quantity) || 1;
        });
        setCartQuantities(map);
      }
    } catch {
      // Fallback to guest cart if API call fails
      const guestCart = getGuestCart();
      const map = {};
      guestCart.forEach((item) => {
        const pid = String(item.productId || item.id);
        map[pid] = Number(item.quantity) || 1;
      });
      setCartQuantities(map);
    }
  }, []);

  useEffect(() => {
    syncCart();
    syncWishlist();

    const handleCartUpdated = () => syncCart();
    const handleWishlistUpdated = () => syncWishlist();

    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    window.addEventListener("storage", handleCartUpdated);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
      window.removeEventListener("storage", handleCartUpdated);
    };
  }, [syncCart, syncWishlist]);

  // Initial fetch: Categories, Units, Discounts
  useEffect(() => {
    let isMounted = true;

    const initMeta = async () => {
      setLoadingCategories(true);
      try {
        const [catRes, unitsRes, discountsRes] = await Promise.allSettled([
          API.get("/categories?hasProducts=true"),
          API.get("/units"),
          API.get("/today-discounts/active"),
        ]);

        if (!isMounted) return;

        // Categories
        let catList = [];
        if (catRes.status === "fulfilled") {
          const raw = catRes.value.data?.data || catRes.value.data?.categories || [];
          catList = Array.isArray(raw)
            ? raw.filter(
                (c) =>
                  c.status !== "Inactive" &&
                  (c.productCount === undefined || c.productCount > 0)
              )
            : [];
        }

        // Units Map
        const uMap = new Map();
        if (unitsRes.status === "fulfilled") {
          const rawUnits =
            unitsRes.value.data?.data || unitsRes.value.data?.units || [];
          if (Array.isArray(rawUnits)) {
            rawUnits.forEach((u) => {
              if (u._id) uMap.set(String(u._id), u);
            });
          }
        }
        setUnitsMap(uMap);

        // Discounts Map
        const dMap = new Map();
        if (discountsRes.status === "fulfilled") {
          const list =
            discountsRes.value.data?.discounts ||
            discountsRes.value.data?.data ||
            [];
          if (Array.isArray(list)) {
            list.forEach((d) => {
              const pid = String(d.productId?._id || d.productId || "");
              if (pid && d.discountPrice) {
                dMap.set(pid, Number(d.discountPrice));
              }
            });
          }
        }
        setDiscountsMap(dMap);

        setCategories(catList);

        // Match initial category from slug or fallback to first
        if (catList.length > 0) {
          const matched =
            catList.find(
              (c) =>
                (c.slug && c.slug.toLowerCase() === (slug || "").toLowerCase()) ||
                String(c._id) === String(slug) ||
                (c.name &&
                  c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") ===
                    (slug || "").toLowerCase())
            ) || catList[0];

          setSelectedCategory(matched);
        }
      } catch (err) {
        console.error("Failed to initialize categories:", err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    initMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  // When URL slug changes, update selectedCategory
  useEffect(() => {
    if (categories.length === 0) return;

    if (slug) {
      const matched = categories.find(
        (c) =>
          (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) ||
          String(c._id) === String(slug) ||
          (c.name &&
            c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") ===
              slug.toLowerCase())
      );
      if (matched && (!selectedCategory || selectedCategory._id !== matched._id)) {
        setSelectedCategory(matched);
      }
    } else if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [slug, categories, selectedCategory]);

  // Fetch products whenever selectedCategory changes
  useEffect(() => {
    if (!selectedCategory?._id) return;

    let isCurrent = true;
    const fetchCategoryProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await API.get(
          `/products?category=${selectedCategory._id}&limit=100`
        );
        if (!isCurrent) return;

        const rawList = res.data?.data || res.data?.products || [];
        const activeList = Array.isArray(rawList)
          ? rawList.filter((p) => {
              const s = String(p?.status ?? "active").toLowerCase();
              return s === "active" || s === "true" || s === "1";
            })
          : [];

        // Normalize product objects
        const resolved = activeList.map((p) => {
          const pid = String(p._id || p.id || "");
          const basePrice = Number(p.price || 0);
          const writtenPrice = Number(p.writtenPrice || 0);
          const productDiscountPrice = Number(p.discountPrice || 0);
          const todayPrice = discountsMap.get(pid) || 0;

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

          let discountPercent = 0;
          if (oldPrice > price && oldPrice > 0) {
            discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
          }

          // Format unit
          let formattedUnit = "1 pc";
          if (p.unit) {
            let symbol = "";
            if (typeof p.unit === "object" && p.unit !== null) {
              symbol = p.unit.name || p.unit.symbol || "";
            } else if (typeof p.unit === "string") {
              const match = unitsMap.get(p.unit);
              symbol = match ? match.name || match.symbol || "" : p.unit;
            }
            formattedUnit = formatUnit(symbol || p.unit, p.unitNo);
          }

          // Resolve image
          let img = "";
          if (Array.isArray(p.images) && p.images.length > 0) {
            img = resolveImage(p.images[0]);
          } else if (p.image) {
            img = resolveImage(p.image);
          }

          return {
            id: pid,
            _id: pid,
            name: p.productName || p.name || "Grocery Item",
            slug: p.slug || pid,
            price,
            oldPrice,
            discount: discountPercent,
            unit: formattedUnit,
            image: img,
            stockQuantity: Number(p.stockQuantity ?? 99),
            categoryName: selectedCategory.name,
            rawProduct: p,
          };
        });

        setProducts(resolved);
      } catch (err) {
        console.error("Failed to load category products:", err);
        setProducts([]);
      } finally {
        if (isCurrent) setLoadingProducts(false);
      }
    };

    fetchCategoryProducts();
    return () => {
      isCurrent = false;
    };
  }, [selectedCategory, unitsMap, discountsMap]);

  // Category switch handler
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    const targetSlug =
      cat.slug || cat._id || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    navigate(`/category/${encodeURIComponent(targetSlug)}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Product click handler -> navigate to product details
  const handleProductClick = (product) => {
    const pSlug = product.slug || product.id;
    navigate(`/product/${encodeURIComponent(pSlug)}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Add to cart handler
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    const pid = String(product.id || product._id);
    const newQty = (cartQuantities[pid] || 0) + 1;

    setCartQuantities((prev) => ({ ...prev, [pid]: newQty }));

    try {
      if (isLoggedIn()) {
        await API.post("/cart/add", { productId: pid, quantity: 1 });
      } else {
        const guestCart = getGuestCart();
        const existingIdx = guestCart.findIndex(
          (i) => String(i.productId || i.id) === pid
        );
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity =
            (guestCart[existingIdx].quantity || 1) + 1;
        } else {
          guestCart.push({
            productId: pid,
            quantity: 1,
            price: product.price,
            name: product.name,
            image: product.image,
            unit: product.unit,
          });
        }
        saveGuestCart(guestCart);
      }

      window.dispatchEvent(new Event("cartUpdated"));

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: `${product.name} added to cart`,
        showConfirmButton: false,
        timer: 1600,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Add to cart error:", err);
      syncCart();
    }
  };

  // Update quantity handler
  const handleUpdateQuantity = async (product, newQty) => {
    const pid = String(product.id || product._id);

    try {
      if (newQty <= 0) {
        setCartQuantities((prev) => {
          const next = { ...prev };
          delete next[pid];
          return next;
        });

        if (isLoggedIn()) {
          await API.delete(`/cart/item/${pid}`).catch(() => {});
        } else {
          const guestCart = getGuestCart().filter(
            (i) => String(i.productId || i.id) !== pid
          );
          saveGuestCart(guestCart);
        }
      } else {
        setCartQuantities((prev) => ({ ...prev, [pid]: newQty }));

        if (isLoggedIn()) {
          await API.put("/cart/update", {
            productId: pid,
            quantity: newQty,
          }).catch(() => {});
        } else {
          const guestCart = getGuestCart();
          const item = guestCart.find(
            (i) => String(i.productId || i.id) === pid
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

  // Toggle wishlist handler
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

  // Filtered & sorted products
  const displayedProducts = useMemo(() => {
    let list = [...products];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      list.sort((a, b) => b.discount - a.discount);
    }

    return list;
  }, [products, searchFilter, sortBy]);

  const activeCategoryIcon = resolveCategoryIcon(selectedCategory);

  return (
    <div className="cat-details-page-root">
      {/* TOP BREADCRUMB & BACK ROW */}
      <div className="cat-details-top-bar">
        <div className="cat-details-container">
          <div className="cat-details-breadcrumb-row">
            <button
              type="button"
              className="cat-details-back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <span className="cat-details-breadcrumb-separator">/</span>
            <Link to="/" className="cat-details-breadcrumb-link">
              Home
            </Link>
            <span className="cat-details-breadcrumb-separator">/</span>
            <span className="cat-details-breadcrumb-current">
              {selectedCategory?.name || "Categories"}
            </span>
          </div>
        </div>
      </div>

      <div className="cat-details-container cat-details-layout">
        {/* =========================================================
            LEFT SIDEBAR: ALL CATEGORIES VERTICAL LIST
            ========================================================= */}
        <aside className="cat-details-sidebar" aria-label="All Categories">
          <div className="cat-details-sidebar-header">
            <h2 className="cat-details-sidebar-title">All Categories</h2>
            <span className="cat-details-sidebar-count">
              {categories.length}
            </span>
          </div>

          <div className="cat-details-sidebar-list">
            {loadingCategories
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="cat-details-sidebar-skeleton">
                    <div className="cat-sidebar-skeleton-icon" />
                    <div className="cat-sidebar-skeleton-text" />
                  </div>
                ))
              : categories.map((cat) => {
                  const isSelected = selectedCategory?._id === cat._id;
                  const iconData = resolveCategoryIcon(cat);

                  return (
                    <button
                      key={cat._id || cat.name}
                      type="button"
                      className={`cat-details-sidebar-item ${
                        isSelected ? "cat-details-sidebar-item--active" : ""
                      }`}
                      onClick={() => handleSelectCategory(cat)}
                    >
                      <div className="cat-sidebar-item-icon-box">
                        {iconData.type === "image" ? (
                          <img
                            src={iconData.src}
                            alt={cat.name}
                            className="cat-sidebar-item-img"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="cat-sidebar-item-emoji">
                            {iconData.symbol}
                          </span>
                        )}
                      </div>

                      <div className="cat-sidebar-item-info">
                        <span className="cat-sidebar-item-name">
                          {cat.name}
                        </span>
                        {cat.productCount !== undefined && (
                          <span className="cat-sidebar-item-prod-count">
                            {cat.productCount} items
                          </span>
                        )}
                      </div>

                      <ChevronRight
                        size={15}
                        className="cat-sidebar-chevron"
                      />
                    </button>
                  );
                })}
          </div>
        </aside>

        {/* =========================================================
            RIGHT SIDE: PRODUCTS UNDER SELECTED CATEGORY
            ========================================================= */}
        <main className="cat-details-main" aria-label="Category Products">
          {/* CATEGORY HEADER BANNER */}
          <div className="cat-details-header-banner">
            <div className="cat-details-header-info">
              <div className="cat-details-header-icon-wrap">
                {activeCategoryIcon.type === "image" ? (
                  <img
                    src={activeCategoryIcon.src}
                    alt={selectedCategory?.name || "Category"}
                    className="cat-details-header-img"
                  />
                ) : (
                  <span className="cat-details-header-emoji">
                    {activeCategoryIcon.symbol}
                  </span>
                )}
              </div>

              <div>
                <h1 className="cat-details-header-title">
                  {selectedCategory?.name || "Select Category"}
                </h1>
                <p className="cat-details-header-sub">
                  ⚡ Delivered in <strong>10 minutes</strong> &bull;{" "}
                  {displayedProducts.length} fresh item
                  {displayedProducts.length === 1 ? "" : "s"} available
                </p>
              </div>
            </div>

            {/* QUICK CONTROLS: SEARCH & SORT */}
            <div className="cat-details-controls">
              <div className="cat-details-search-box">
                <Search size={15} className="cat-details-search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${selectedCategory?.name || "items"}...`}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="cat-details-search-input"
                />
              </div>

              <div className="cat-details-sort-wrap">
                <SlidersHorizontal size={14} className="cat-details-sort-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cat-details-sort-select"
                >
                  <option value="default">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {loadingProducts ? (
            <div className="cat-details-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="cat-details-product-skeleton">
                  <div className="cat-skeleton-img" />
                  <div className="cat-skeleton-badge" />
                  <div className="cat-skeleton-title" />
                  <div className="cat-skeleton-unit" />
                  <div className="cat-skeleton-bottom" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="cat-details-empty-box">
              <div className="cat-empty-icon-wrap">
                <ShoppingBag size={42} />
              </div>
              <h3 className="cat-empty-title">No products found</h3>
              <p className="cat-empty-sub">
                {searchFilter
                  ? `No items match "${searchFilter}" in ${selectedCategory?.name}.`
                  : `Products in ${selectedCategory?.name} will be stocked shortly.`}
              </p>
              {searchFilter && (
                <button
                  type="button"
                  className="cat-empty-clear-btn"
                  onClick={() => setSearchFilter("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="cat-details-grid">
              {displayedProducts.map((product) => {
                const qty = cartQuantities[product.id] || 0;
                const hasDiscount =
                  product.oldPrice > product.price && product.oldPrice > 0;
                const isWishlisted = wishlistIds.has(String(product.id || product._id));

                return (
                  <div
                    key={product.id}
                    className="cat-details-product-card"
                    onClick={() => handleProductClick(product)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleProductClick(product);
                      }
                    }}
                  >
                    {/* PRODUCT IMAGE & DISCOUNT BADGE */}
                    <div className="cat-card-img-wrap">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="cat-card-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="cat-card-img-placeholder">
                          <span>🛒</span>
                        </div>
                      )}

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        className={`cat-details-wishlist-btn ${
                          isWishlisted ? "cat-details-wishlist-btn--active" : ""
                        }`}
                        onClick={(e) => handleToggleWishlist(product, e)}
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        title={
                          isWishlisted ? "In Wishlist" : "Add to Wishlist"
                        }
                      >
                        <Heart
                          size={15}
                          fill={isWishlisted ? "#ef4444" : "none"}
                          color={isWishlisted ? "#ef4444" : "#64748b"}
                        />
                      </button>

                      {hasDiscount && (
                        <span className="cat-card-discount-badge">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* 10 MINS DELIVERY BADGE */}
                    <div className="cat-card-delivery-time">
                      <Clock size={11} className="cat-card-clock-icon" />
                      <span>10 MINS</span>
                    </div>

                    {/* PRODUCT TITLE */}
                    <h3 className="cat-card-product-title" title={product.name}>
                      {product.name}
                    </h3>

                    {/* UNIT / PACK SIZE */}
                    <div className="cat-card-unit">{product.unit || "1 pc"}</div>

                    {/* PRICE & ADD ACTION ROW */}
                    <div className="cat-card-bottom-row">
                      <div className="cat-card-price-wrap">
                        <span className="cat-card-price">₹{product.price}</span>
                        {hasDiscount && (
                          <span className="cat-card-old-price">
                            ₹{product.oldPrice}
                          </span>
                        )}
                      </div>

                      {/* ADD BUTTON OR STEPPER */}
                      <div
                        className="cat-card-action-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {qty === 0 ? (
                          <button
                            type="button"
                            className="cat-card-add-btn"
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={product.stockQuantity === 0}
                          >
                            {product.stockQuantity === 0 ? "OUT" : "ADD"}
                          </button>
                        ) : (
                          <div className="cat-card-stepper">
                            <button
                              type="button"
                              className="cat-card-stepper-btn"
                              onClick={() =>
                                handleUpdateQuantity(product, qty - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="cat-card-stepper-qty">{qty}</span>
                            <button
                              type="button"
                              className="cat-card-stepper-btn"
                              onClick={() =>
                                handleUpdateQuantity(product, qty + 1)
                              }
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
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryDetails;

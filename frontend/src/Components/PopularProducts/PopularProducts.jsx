import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Heart,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import "./PopularProducts.css";

const PRODUCTS_PER_PAGE = 8;
const GUEST_CART_KEY = "guestCart";
const GUEST_WISHLIST_KEY = "guestWishlist";

// =========================================================
// HELPERS
// =========================================================
const resolveImage = (path) => {
  if (!path) return "";
  if (typeof path === "object") {
    path = path?.url || path?.path || path?.secure_url || path?.src || "";
  }
  const str = String(path).trim();
  if (!str) return "";
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.units)) return data.units;
  if (Array.isArray(data?.discounts)) return data.discounts;
  if (Array.isArray(data?.todayDiscounts)) return data.todayDiscounts;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data?.categories)) return data.data.categories;
  if (Array.isArray(data?.data?.units)) return data.data.units;
  return [];
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const getProductId = (p) => String(p?._id || p?.id || "");

const getCategoryName = (cat) => {
  if (!cat) return "Other";
  if (typeof cat === "string") return cat;
  return cat.name || cat.categoryName || cat.title || "Other";
};

const getCategoryId = (cat) => {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  return String(cat._id || cat.id || "");
};

// Get the readable symbol/name for a unit id
const getUnitSymbol = (unitValue, unitList) => {
  if (!unitValue) return "";

  if (typeof unitValue === "object") {
    return unitValue.symbol || unitValue.name || "";
  }

  const found = unitList.find((u) => String(u._id) === String(unitValue));
  return found?.symbol || found?.name || "";
};

// =========================================================
// COMPONENT
// =========================================================
const PopularProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [cartQuantities, setCartQuantities] = useState({});

  const categoriesRef = useRef(null);

  const allCategoryNames = useMemo(() => {
    return ["All", ...categories.map((c) => c.name)];
  }, [categories]);

  const currentCategoryIndex = useMemo(() => {
    const idx = allCategoryNames.indexOf(activeCategory);
    return idx >= 0 ? idx : 0;
  }, [allCategoryNames, activeCategory]);

  const scrollToCategoryButton = (index) => {
    if (categoriesRef.current) {
      const buttons = categoriesRef.current.querySelectorAll(
        ".popular-products__category"
      );
      if (buttons && buttons[index]) {
        buttons[index].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      const prevCategory = allCategoryNames[currentCategoryIndex - 1];
      setActiveCategory(prevCategory);
      setCurrentPage(1);
      scrollToCategoryButton(currentCategoryIndex - 1);
    }
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < allCategoryNames.length - 1) {
      const nextCategory = allCategoryNames[currentCategoryIndex + 1];
      setActiveCategory(nextCategory);
      setCurrentPage(1);
      scrollToCategoryButton(currentCategoryIndex + 1);
    }
  };

  const isLoggedIn = () => {
    try {
      return Boolean(localStorage.getItem("token"));
    } catch {
      return false;
    }
  };

  // =========================================================
  // GUEST STORAGE
  // =========================================================
  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveGuestCart = (cart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const getGuestWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveGuestWishlist = (list) => {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // =========================================================
  // CART BADGE & QUANTITIES MAP
  // =========================================================
  const refreshCartCount = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        const { data } = await API.get("/cart");
        const items =
          data?.cart?.items ||
          data?.data?.cart?.items ||
          data?.data?.items ||
          data?.items ||
          [];
        const count = items.reduce(
          (sum, i) => sum + Number(i.quantity || 0),
          0
        );
        setCartCount(count);

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
        setCartCount(0);
        setCartQuantities({});
      }
    } else {
      const cart = getGuestCart();
      setCartCount(cart.reduce((sum, i) => sum + Number(i.quantity || 0), 0));
      const qMap = {};
      cart.forEach((item) => {
        const pid = String(item.productId || item.id || "");
        if (pid) {
          qMap[pid] = Number(item.quantity || 0);
        }
      });
      setCartQuantities(qMap);
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
    const handler = () => refreshCartCount();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [refreshCartCount]);

  // Sync category selection triggered from Navbar or URL
  useEffect(() => {
    const handleSelectCategory = (e) => {
      const catName = e.detail;
      if (catName) {
        setActiveCategory(catName);
        setCurrentPage(1);
        const section = document.querySelector(".popular-products");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("selectCategory", handleSelectCategory);

    // Initial check from URL query param
    const searchParams = new URLSearchParams(window.location.search);
    const catParam = searchParams.get("category");
    if (catParam) {
      setActiveCategory(catParam);
      setCurrentPage(1);
    }

    return () => {
      window.removeEventListener("selectCategory", handleSelectCategory);
    };
  }, []);

  // =========================================================
  // FETCH EVERYTHING
  // =========================================================
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsRes, discountsRes, categoriesRes, unitsRes] =
        await Promise.all([
          API.get("/products"),
          API.get("/today-discounts/active").catch(() => ({ data: [] })),
          API.get("/categories").catch(() => ({ data: [] })),
          API.get("/units").catch(() => ({ data: [] })),
        ]);

      const rawProducts = normalizeList(productsRes.data);
      const rawDiscounts = normalizeList(discountsRes.data);
      const rawCategories = normalizeList(categoriesRes.data);
      const rawUnits = normalizeList(unitsRes.data);

      setUnits(rawUnits);

      // ---- discount map ----
      const discountMap = new Map();
      rawDiscounts.forEach((d) => {
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

      // ---- merge product + discount + unit ----
      const merged = rawProducts
        .filter((p) => {
          const s = String(p?.status ?? "active").toLowerCase();
          return s === "active" || s === "true" || s === "1";
        })
        .map((p) => {
          const productId = getProductId(p);
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

          const unitSymbol = getUnitSymbol(p.unit, rawUnits);

          const unitLabel = p.unitNo
            ? `${p.unitNo}${unitSymbol ? ` ${unitSymbol}` : ""}`
            : unitSymbol || "1 unit";

          return {
            id: productId,
            _id: productId,
            name: p.productName || p.name || "Product",
            category: getCategoryName(p.category),
            categoryId: getCategoryId(p.category),
            tags: Array.isArray(p.tags)
              ? p.tags.join(", ")
              : p.tags || p.shortDescription || "",
            price,
            oldPrice,
            discount,
            unit: unitLabel,
            unitNo: p.unitNo || "",
            unitSymbol,
            image: resolveImage(rawImage),
            description:
              p.shortDescription || p.fullDescription || "Fresh quality product.",
            stockQuantity: Number(p.stockQuantity || 0),
          };
        });

      setProducts(merged);

      // ---- Calculate product count per category (ONLY show categories with at least 1 item) ----
      const categoryCountMap = new Map();
      merged.forEach((p) => {
        if (p.category) {
          const catKey = p.category.trim().toLowerCase();
          categoryCountMap.set(catKey, (categoryCountMap.get(catKey) || 0) + 1);
        }
        if (p.categoryId) {
          const idKey = String(p.categoryId).trim();
          categoryCountMap.set(idKey, (categoryCountMap.get(idKey) || 0) + 1);
        }
      });

      // Filter rawCategories: ONLY include categories that have at least 1 product
      let cats = rawCategories
        .filter((c) => {
          const s = String(c?.status ?? "active").toLowerCase();
          const isActive = s === "active" || s === "true" || s === "1";
          if (!isActive) return false;

          const catName = getCategoryName(c);
          const catId = getCategoryId(c);

          const countByName = categoryCountMap.get(catName.toLowerCase()) || 0;
          const countById = catId ? categoryCountMap.get(catId) || 0 : 0;
          const totalCount = countByName || countById || 0;

          return totalCount > 0;
        })
        .map((c) => {
          const catName = getCategoryName(c);
          const catId = getCategoryId(c);
          const count =
            categoryCountMap.get(catName.toLowerCase()) ||
            (catId ? categoryCountMap.get(catId) || 0 : 0);

          return {
            id: catId || catName,
            name: catName,
            count,
          };
        })
        .filter((c) => c.name);

      // If categories from API didn't match, derive directly from active products
      if (cats.length === 0) {
        const productCatMap = new Map();
        merged.forEach((p) => {
          if (p.category && p.category !== "Other") {
            productCatMap.set(
              p.category,
              (productCatMap.get(p.category) || 0) + 1
            );
          }
        });
        cats = Array.from(productCatMap.entries()).map(([name, count]) => ({
          id: name,
          name,
          count,
        }));
      }

      setCategories(cats);

      // ---- wishlist ----
      if (isLoggedIn()) {
        try {
          const { data } = await API.get("/wishlist");

          const list = Array.isArray(data?.wishlist)
            ? data.wishlist
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data)
                ? data
                : [];

          const ids = list
            .map((entry) => {
              if (!entry) return null;
              const p = entry.product;
              if (!p) return null;
              if (typeof p === "object") return p._id || p.id || null;
              return p;
            })
            .filter(Boolean)
            .map(String);

          setWishlistIds(new Set(ids));
        } catch (err) {
          console.error("Fetch wishlist error:", err);
          setWishlistIds(new Set());
        }
      } else {
        const guest = getGuestWishlist();
        setWishlistIds(new Set(guest.map((i) => String(i.id))));
      }
    } catch (err) {
      console.error("PopularProducts fetch error:", err);
      setError(err.response?.data?.message || "Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // =========================================================
  // FILTER + PAGINATION
  // =========================================================
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => {
      const matchName =
        p.category &&
        p.category.trim().toLowerCase() === activeCategory.trim().toLowerCase();
      const matchId =
        p.categoryId && String(p.categoryId) === String(activeCategory);
      return matchName || matchId;
    });
  }, [products, activeCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // =========================================================
  // ADD TO CART
  // =========================================================
  const addToCart = async (product, qty = 1) => {
    const productId = getProductId(product);
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
      setAddingId(productId);
      setCartQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + qty,
      }));

      if (isLoggedIn()) {
        await API.post("/cart/add", {
          productId,
          quantity: qty,
        });
      } else {
        const guestCart = getGuestCart();
        const existing = guestCart.find(
          (i) => String(i.productId || i.id) === productId
        );

        if (existing) {
          existing.quantity = Number(existing.quantity || 0) + qty;
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
            quantity: qty,
          });
        }
        saveGuestCart(guestCart);
      }

      window.dispatchEvent(new Event("cartUpdated"));
      await refreshCartCount();
      // Right-side notification completely removed as requested
    } catch (err) {
      console.error("Add to cart error:", err);
      await refreshCartCount();
      Swal.fire({
        icon: "error",
        title: "Could not add to cart",
        text: err.response?.data?.message || err.message || "Please try again.",
        confirmButtonColor: "#0aad4b",
      });
    } finally {
      setAddingId(null);
    }
  };

  // =========================================================
  // UPDATE CART QUANTITY (INCREMENT / DECREMENT)
  // =========================================================
  const updateCartQuantity = async (product, newQty) => {
    const productId = getProductId(product);
    if (!productId) return;

    try {
      setAddingId(productId);

      if (newQty <= 0) {
        // Optimistic remove
        setCartQuantities((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });

        if (isLoggedIn()) {
          await API.delete(`/cart/remove/${productId}`);
        } else {
          const guestCart = getGuestCart().filter(
            (i) => String(i.productId || i.id) !== productId
          );
          saveGuestCart(guestCart);
        }
      } else {
        const maxStock = Number(product.stockQuantity || 9999);
        if (newQty > maxStock) {
          Swal.fire({
            icon: "warning",
            title: "Stock Limit",
            text: `Only ${maxStock} items available in stock.`,
            confirmButtonColor: "#0aad4b",
          });
          return;
        }

        // Optimistic update
        setCartQuantities((prev) => ({
          ...prev,
          [productId]: newQty,
        }));

        if (isLoggedIn()) {
          await API.put(`/cart/update/${productId}`, {
            quantity: newQty,
          });
        } else {
          const guestCart = getGuestCart();
          const existing = guestCart.find(
            (i) => String(i.productId || i.id) === productId
          );
          if (existing) {
            existing.quantity = newQty;
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
              quantity: newQty,
            });
          }
          saveGuestCart(guestCart);
        }
      }

      window.dispatchEvent(new Event("cartUpdated"));
      await refreshCartCount();
      // Right-side notification completely removed as requested
    } catch (err) {
      console.error("Update cart error:", err);
      await refreshCartCount();
    } finally {
      setAddingId(null);
    }
  };

  // =========================================================
  // WISHLIST TOGGLE
  // =========================================================
  const toggleWishlist = async (product) => {
    const productId = getProductId(product);
    if (!productId) return;

    const isCurrentlyWishlisted = wishlistIds.has(productId);

    try {
      setAddingId(productId);

      if (isLoggedIn()) {
        if (isCurrentlyWishlisted) {
          await API.delete(`/wishlist/remove/${productId}`);
        } else {
          await API.post("/wishlist/add", { productId });
        }
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        let guestWishlist = getGuestWishlist();
        if (isCurrentlyWishlisted) {
          guestWishlist = guestWishlist.filter(
            (i) => String(i.productId || i.id) !== productId
          );
        } else {
          guestWishlist.push({
            id: productId,
            productId,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            unit: product.unit,
          });
        }
        saveGuestWishlist(guestWishlist);
      }

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyWishlisted) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      Swal.fire({
        icon: isCurrentlyWishlisted ? "info" : "success",
        title: isCurrentlyWishlisted
          ? "Removed from Wishlist"
          : "Added to Wishlist",
        text: product.name,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Wishlist error:", err);
      Swal.fire({
        icon: "error",
        title: "Wishlist error",
        text: err.response?.data?.message || err.message || "Please try again.",
        confirmButtonColor: "#0aad4b",
      });
    } finally {
      setAddingId(null);
    }
  };

  // =========================================================
  // PRODUCT DETAILS NAVIGATION (DIRECT PAGE REDIRECT)
  // =========================================================
  const openProductDetails = (product) => {
    if (!product) return;

    // Build URL-friendly product name slug: e.g. "amul-salted-pasteurised-butter"
    const rawName = product.productName || product.name || "";
    const cleanSlug =
      product.slug ||
      rawName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-") ||
      getProductId(product);

    navigate(`/product/${encodeURIComponent(cleanSlug)}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <section className="popular-products">
      <div className="popular-products__container">
        {/* HEADER WITH ATTRACTIVE DYNAMIC CATEGORIES */}
        <div className="popular-products__header">
          <div className="popular-products__header-info">
            <div className="popular-products__header-title-row">
              <h2 className="popular-products__title">Popular Products</h2>
            </div>
            <p className="popular-products__subtitle">
              Fresh quality groceries and pantry essentials handpicked for you
            </p>
          </div>

          <div className="popular-products__categories-wrapper">
            <button
              type="button"
              className="popular-products__category-nav popular-products__category-nav--left"
              onClick={handlePrevCategory}
              disabled={currentCategoryIndex <= 0}
              aria-label="Previous category"
              title="Previous category"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              className="popular-products__categories"
              ref={categoriesRef}
              role="tablist"
              aria-label="Filter products by category"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "All"}
                className={`popular-products__category ${
                  activeCategory === "All"
                    ? "popular-products__category--active"
                    : ""
                }`}
                onClick={() => handleCategoryChange("All")}
              >
                <span>All</span>
                <span className="popular-products__category-count">
                  {products.length}
                </span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.name}
                  className={`popular-products__category ${
                    activeCategory === cat.name
                      ? "popular-products__category--active"
                      : ""
                  }`}
                  onClick={() => handleCategoryChange(cat.name)}
                >
                  <span>{cat.name}</span>
                  <span className="popular-products__category-count">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="popular-products__category-nav popular-products__category-nav--right"
              onClick={handleNextCategory}
              disabled={currentCategoryIndex >= allCategoryNames.length - 1}
              aria-label="Next category"
              title="Next category"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* LOADING / ERROR */}
        {loading ? (
          <div className="popular-products__empty">
            <div className="popular-products__loading-spinner"></div>
            <h3>Loading products…</h3>
          </div>
        ) : error ? (
          <div className="popular-products__empty">
            <AlertCircle size={42} />
            <h3>{error}</h3>
            <button
              type="button"
              className="popular-products__cart-button"
              onClick={fetchAll}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* GRID */}
            <div className="popular-products__grid">
              {currentProducts.map((product) => {
                const productId = getProductId(product);
                const isWishlisted = wishlistIds.has(productId);
                const isAdding = addingId === productId;

                return (
                  <article
                    className="popular-products__card"
                    key={productId}
                    onClick={() => openProductDetails(product)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${product.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openProductDetails(product);
                      }
                    }}
                  >
                    {product.discount > 0 && (
                      <div className="popular-products__discount">
                        -{product.discount}%
                      </div>
                    )}

                    {/* WISHLIST HEART */}
                    <button
                      type="button"
                      className={`popular-products__wishlist ${
                        isWishlisted ? "popular-products__wishlist--active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      disabled={isAdding}
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    {/* IMAGE */}
                    <div className="popular-products__image-wrapper">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="popular-products__image"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300?text=Product";
                        }}
                      />
                    </div>

                    {/* BODY */}
                    <div className="popular-products__body">
                      {product.tags && (
                        <p className="popular-products__tags">{product.tags}</p>
                      )}

                      <p className="popular-products__stock">
                        <span
                          className={`popular-products__stock-dot ${
                            product.stockQuantity > 0 ? "in-stock" : "out-of-stock"
                          }`}
                        ></span>
                        {product.stockQuantity > 0
                          ? "In stock"
                          : "Out of stock"}
                      </p>

                      <h3 className="popular-products__name">
                        {product.name}
                      </h3>

                      {product.unit && (
                        <p className="popular-products__unit">
                          <strong>{product.unit}</strong>
                        </p>
                      )}

                      <div className="popular-products__bottom">
                        <div className="popular-products__prices">
                          <span className="popular-products__price">
                            {formatPrice(product.price)}
                          </span>

                          {product.oldPrice > product.price && (
                            <span className="popular-products__old-price">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>

                        {/* CART ACTION: FIRST SHOW "ADD TO CART", AFTER SHOW 1,2,3 INCREMENT / DECREMENT */}
                        {cartQuantities[productId] > 0 ? (
                          <div
                            className="popular-products__qty-counter"
                            onClick={(e) => e.stopPropagation()}
                            role="group"
                            aria-label={`Quantity in cart: ${cartQuantities[productId]}`}
                          >
                            <button
                              type="button"
                              className="popular-products__qty-btn minus"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQuantity(
                                  product,
                                  cartQuantities[productId] - 1
                                );
                              }}
                              disabled={isAdding}
                              aria-label="Decrease quantity"
                              title="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="popular-products__qty-val">
                              {cartQuantities[productId]}
                            </span>

                            <button
                              type="button"
                              className="popular-products__qty-btn plus"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQuantity(
                                  product,
                                  cartQuantities[productId] + 1
                                );
                              }}
                              disabled={
                                isAdding ||
                                (product.stockQuantity &&
                                  cartQuantities[productId] >=
                                    product.stockQuantity)
                              }
                              aria-label="Increase quantity"
                              title="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="popular-products__cart-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, 1);
                            }}
                            disabled={isAdding || product.stockQuantity === 0}
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <ShoppingCart size={16} />
                            <span>{isAdding ? "Adding…" : "Add To Cart"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* EMPTY */}
            {currentProducts.length === 0 && (
              <div className="popular-products__empty">
                <h3>No products found</h3>
                <p>There are no products in this category.</p>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="popular-products__pagination">
                <button
                  type="button"
                  className="popular-products__pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={18} />
                  <span>Previous</span>
                </button>

                <div className="popular-products__pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        className={`popular-products__page ${
                          currentPage === page
                            ? "popular-products__page--active"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                        aria-label={`Page ${page}`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="popular-products__pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FLOATING CART */}
      <button
        type="button"
        className="popular-products__cart-floating"
        aria-label={`Cart with ${cartCount} items`}
        onClick={() => (window.location.href = "/cart")}
      >
        <ShoppingCart size={21} />
        {cartCount > 0 && (
          <span className="popular-products__cart-count">{cartCount}</span>
        )}
      </button>

      {/* BACK TO TOP */}
      <button
        type="button"
        className="popular-products__top-button"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </section>
  );
};

export default PopularProducts;

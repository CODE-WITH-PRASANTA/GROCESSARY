import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Heart,
  AlertCircle,
} from "lucide-react";

import Swal from "sweetalert2";
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

  // If the backend already populated it as an object
  if (typeof unitValue === "object") {
    return unitValue.symbol || unitValue.name || "";
  }

  // Otherwise it's an ObjectId — look it up
  const found = unitList.find(
    (u) => String(u._id) === String(unitValue)
  );
  return found?.symbol || found?.name || "";
};

// =========================================================
// COMPONENT
// =========================================================
const PopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

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
  // CART BADGE
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
      } catch {
        setCartCount(0);
      }
    } else {
      const cart = getGuestCart();
      setCartCount(cart.reduce((sum, i) => sum + Number(i.quantity || 0), 0));
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
    const handler = () => refreshCartCount();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [refreshCartCount]);

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

          // 👇 unit resolution: handles ObjectId, populated object, or string
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
            unit: unitLabel,           // "250 g"
            unitNo: p.unitNo || "",    // 250
            unitSymbol,                // g
            image: resolveImage(rawImage),
            description:
              p.shortDescription || p.fullDescription || "Fresh product.",
            stockQuantity: Number(p.stockQuantity || 0),
          };
        });

      setProducts(merged);

      // ---- categories ----
      let cats = rawCategories
        .filter((c) => {
          const s = String(c?.status ?? "active").toLowerCase();
          return s === "active" || s === "true" || s === "1";
        })
        .map((c) => ({
          id: getCategoryId(c),
          name: getCategoryName(c),
        }))
        .filter((c) => c.name);

      if (cats.length === 0) {
        const set = new Set(merged.map((p) => p.category).filter(Boolean));
        cats = Array.from(set).map((name) => ({ id: name, name }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // FILTER + PAGINATION
  // =========================================================
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
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

      if (isLoggedIn()) {
        await API.post("/cart/add", {
          productId,
          quantity: qty,
        });
        window.dispatchEvent(new Event("cartUpdated"));
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

      await refreshCartCount();

      Swal.fire({
        icon: "success",
        title: "Added to cart",
        text: `${product.name} × ${qty}`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (err) {
      console.error("Add to cart error:", err);
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
  // WISHLIST
  // =========================================================
  const toggleWishlist = async (product) => {
    const productId = getProductId(product);
    if (!productId) return;

    const isWishlisted = wishlistIds.has(productId);

    try {
      setAddingId(productId);

      if (isLoggedIn()) {
        if (isWishlisted) {
          await API.delete(`/wishlist/${productId}`);
        } else {
          await API.post(`/wishlist/${productId}`);
        }
      }

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) next.delete(productId);
        else next.add(productId);
        return next;
      });

      if (!isLoggedIn()) {
        const guest = getGuestWishlist();
        const next = isWishlisted
          ? guest.filter((i) => String(i.id) !== productId)
          : [
              ...guest,
              {
                id: productId,
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice,
                image: product.image,
                unit: product.unit,
              },
            ];
        saveGuestWishlist(next);
      }

      Swal.fire({
        icon: "success",
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
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
  // MODAL
  // =========================================================
  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleModalAddToCart = async () => {
    if (!selectedProduct) return;
    await addToCart(selectedProduct, quantity);
    closeProductDetails();
  };

  const handleModalWishlist = async () => {
    if (!selectedProduct) return;
    await toggleWishlist(selectedProduct);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <section className="popular-products">
      <div className="popular-products__container">
        {/* HEADER */}
        <div className="popular-products__header">
          <h2 className="popular-products__title">Popular Products</h2>

          <div className="popular-products__categories">
            <button
              type="button"
              className={`popular-products__category ${
                activeCategory === "All"
                  ? "popular-products__category--active"
                  : ""
              }`}
              onClick={() => handleCategoryChange("All")}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id || cat.name}
                type="button"
                className={`popular-products__category ${
                  activeCategory === cat.name
                    ? "popular-products__category--active"
                    : ""
                }`}
                onClick={() => handleCategoryChange(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING / ERROR */}
        {loading ? (
          <div className="popular-products__empty">
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
                  <article className="popular-products__card" key={productId}>
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
                      onClick={() => toggleWishlist(product)}
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
                    <button
                      type="button"
                      className="popular-products__image-button"
                      onClick={() => openProductDetails(product)}
                      aria-label={`View ${product.name}`}
                    >
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
                    </button>

                    {/* BODY */}
                    <div className="popular-products__body">
                      {product.tags && (
                        <p className="popular-products__tags">{product.tags}</p>
                      )}

                      <p className="popular-products__stock">
                        {product.stockQuantity > 0
                          ? "In stock"
                          : "Out of stock"}
                      </p>

                      <button
                        type="button"
                        className="popular-products__name"
                        onClick={() => openProductDetails(product)}
                      >
                        {product.name}
                      </button>

                      {/* 👇 unit line */}
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

                        <button
                          type="button"
                          className="popular-products__cart-button"
                          onClick={() => addToCart(product, 1)}
                          disabled={isAdding || product.stockQuantity === 0}
                        >
                          <ShoppingCart size={16} />
                          <span>{isAdding ? "Adding…" : "Add To Cart"}</span>
                        </button>
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

      {/* MODAL */}
      {selectedProduct && (
        <div
          className="popular-products__modal-overlay"
          onClick={closeProductDetails}
        >
          <div
            className="popular-products__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="popular-products__modal-close"
              onClick={closeProductDetails}
            >
              <X size={21} />
            </button>

            <div className="popular-products__modal-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />

              <button
                type="button"
                className={`popular-products__modal-wishlist ${
                  wishlistIds.has(getProductId(selectedProduct))
                    ? "popular-products__modal-wishlist--active"
                    : ""
                }`}
                onClick={handleModalWishlist}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={20}
                  fill={
                    wishlistIds.has(getProductId(selectedProduct))
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            <div className="popular-products__modal-content">
              <span className="popular-products__modal-category">
                {selectedProduct.category}
              </span>

              <h3 className="popular-products__modal-title">
                {selectedProduct.name}
              </h3>

              <p className="popular-products__modal-stock">
                ●{" "}
                {selectedProduct.stockQuantity > 0
                  ? "In stock"
                  : "Out of stock"}
              </p>

              <p className="popular-products__modal-description">
                {selectedProduct.description}
              </p>

              <div className="popular-products__modal-unit">
                Pack Size: <strong>{selectedProduct.unit}</strong>
              </div>

              <div className="popular-products__modal-price-row">
                <span className="popular-products__modal-price">
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.oldPrice > selectedProduct.price && (
                  <>
                    <span className="popular-products__modal-old-price">
                      {formatPrice(selectedProduct.oldPrice)}
                    </span>
                    <span className="popular-products__modal-discount">
                      {selectedProduct.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="popular-products__modal-actions">
                <div className="popular-products__quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((v) => v + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className="popular-products__modal-cart"
                  onClick={handleModalAddToCart}
                  disabled={
                    addingId === getProductId(selectedProduct) ||
                    selectedProduct.stockQuantity === 0
                  }
                >
                  <ShoppingCart size={18} />
                  {addingId === getProductId(selectedProduct)
                    ? "Adding…"
                    : "Add To Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopularProducts;
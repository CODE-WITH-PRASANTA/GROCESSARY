import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PackageX,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../api/axios";
import {
  fetchWishlistItems,
  removeFromWishlist,
  clearWishlist,
  isLoggedIn,
  getGuestWishlist,
} from "../../Utils/wishlistService";
import "./Wishlist.css";

const GUEST_CART_KEY = "guestCart";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [movingAll, setMovingAll] = useState(false);

  // =========================================================
  // LOAD WISHLIST
  // =========================================================
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWishlistItems();
      setItems(data);
    } catch (error) {
      console.error("Wishlist load error:", error);
      setItems(getGuestWishlist());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();

    const handleUpdate = () => {
      loadWishlist();
    };

    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, [loadWishlist]);

  // =========================================================
  // REMOVE SINGLE ITEM
  // =========================================================
  const handleRemove = async (productId, productName, e) => {
    if (e) e.stopPropagation();
    try {
      setActionInProgressId(productId);
      await removeFromWishlist(productId);

      setItems((prev) =>
        prev.filter((item) => String(item.id || item.productId) !== String(productId))
      );

      Swal.fire({
        icon: "info",
        title: "Removed from Wishlist",
        text: productName,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1400,
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
    } finally {
      setActionInProgressId(null);
    }
  };

  // =========================================================
  // CLEAR ENTIRE WISHLIST
  // =========================================================
  const handleClearAll = async () => {
    if (items.length === 0) return;

    const result = await Swal.fire({
      title: "Clear your wishlist?",
      text: "All saved items will be removed from your wishlist.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await clearWishlist();
        setItems([]);
        Swal.fire({
          icon: "success",
          title: "Wishlist Cleared",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error("Clear wishlist error:", error);
      }
    }
  };

  // =========================================================
  // ADD TO CART (AND OPTIONALLY REMOVE FROM WISHLIST)
  // =========================================================
  const handleAddToCart = async (product, shouldRemoveFromWishlist = false) => {
    const pid = String(product.id || product.productId || product._id);
    if (!pid) return;

    if (product.stockQuantity === 0) {
      Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: "This item is currently out of stock.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setActionInProgressId(pid);

      if (isLoggedIn()) {
        await API.post("/cart/add", {
          productId: pid,
          quantity: 1,
        });
      } else {
        const raw = localStorage.getItem(GUEST_CART_KEY);
        let guestCart = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(guestCart)) guestCart = [];

        const existing = guestCart.find(
          (i) => String(i.productId || i.id) === pid
        );

        if (existing) {
          existing.quantity = Number(existing.quantity || 0) + 1;
        } else {
          guestCart.push({
            id: pid,
            productId: pid,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            unit: product.unit,
            stockQuantity: product.stockQuantity,
            quantity: 1,
          });
        }
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
      }

      window.dispatchEvent(new Event("cartUpdated"));

      if (shouldRemoveFromWishlist) {
        await removeFromWishlist(pid);
        setItems((prev) =>
          prev.filter((item) => String(item.id || item.productId) !== pid)
        );
      }

      Swal.fire({
        icon: "success",
        title: shouldRemoveFromWishlist ? "Moved to Cart" : "Added to Cart",
        text: product.name,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      Swal.fire({
        icon: "error",
        title: "Could not add to cart",
        text: error.response?.data?.message || "Please try again later.",
        confirmButtonColor: "#059669",
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  // =========================================================
  // MOVE ALL IN-STOCK ITEMS TO CART
  // =========================================================
  const handleMoveAllToCart = async () => {
    const inStockItems = items.filter((i) => i.stockQuantity > 0);
    if (inStockItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No In-Stock Items",
        text: "None of the items in your wishlist are currently in stock.",
      });
      return;
    }

    try {
      setMovingAll(true);

      for (const item of inStockItems) {
        const pid = String(item.id || item.productId || item._id);
        if (isLoggedIn()) {
          await API.post("/cart/add", { productId: pid, quantity: 1 }).catch(() => {});
        } else {
          const raw = localStorage.getItem(GUEST_CART_KEY);
          let guestCart = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(guestCart)) guestCart = [];
          const existing = guestCart.find(
            (i) => String(i.productId || i.id) === pid
          );
          if (existing) {
            existing.quantity = Number(existing.quantity || 0) + 1;
          } else {
            guestCart.push({
              id: pid,
              productId: pid,
              name: item.name,
              price: item.price,
              oldPrice: item.oldPrice,
              image: item.image,
              unit: item.unit,
              stockQuantity: item.stockQuantity,
              quantity: 1,
            });
          }
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
        }
      }

      window.dispatchEvent(new Event("cartUpdated"));

      // Remove in-stock items from wishlist
      for (const item of inStockItems) {
        const pid = String(item.id || item.productId || item._id);
        await removeFromWishlist(pid).catch(() => {});
      }

      setItems((prev) => prev.filter((i) => i.stockQuantity === 0));

      Swal.fire({
        icon: "success",
        title: "Items Moved to Cart!",
        text: `${inStockItems.length} items moved to your shopping cart.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Move all to cart error:", error);
    } finally {
      setMovingAll(false);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* BREADCRUMB */}
        <div className="wishlist-breadcrumb">
          <Link to="/" className="wishlist-breadcrumb-link">
            Home
          </Link>
          <span className="wishlist-breadcrumb-separator">/</span>
          <span className="wishlist-breadcrumb-current">My Wishlist</span>
        </div>

        {/* HEADER SECTION */}
        <div className="wishlist-header">
          <div className="wishlist-header-left">
            <div className="wishlist-title-wrapper">
              <div className="wishlist-heart-icon-badge">
                <Heart size={26} fill="#ef4444" color="#ef4444" />
              </div>
              <div>
                <h1 className="wishlist-title">My Wishlist</h1>
                <p className="wishlist-subtitle">
                  {items.length === 0
                    ? "Keep track of products you love"
                    : `${items.length} ${
                        items.length === 1 ? "item" : "items"
                      } saved for later`}
                </p>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="wishlist-header-actions">
              <button
                type="button"
                className="wishlist-btn-move-all"
                onClick={handleMoveAllToCart}
                disabled={movingAll}
              >
                <ShoppingBag size={18} />
                <span>{movingAll ? "Moving…" : "Move All to Cart"}</span>
              </button>

              <button
                type="button"
                className="wishlist-btn-clear"
                onClick={handleClearAll}
                title="Remove all saved products"
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="wishlist-loading-state">
            <div className="wishlist-spinner"></div>
            <p>Loading your saved items…</p>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY STATE */
          <div className="wishlist-empty-card">
            <div className="wishlist-empty-icon-circle">
              <Heart size={48} className="wishlist-empty-heart-anim" />
            </div>
            <h2 className="wishlist-empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-empty-desc">
              You haven't added any products to your wishlist yet. Browse our
              handpicked fresh grocery items and save your favorites!
            </p>
            <Link to="/" className="wishlist-empty-shop-btn">
              <Sparkles size={18} />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          /* PRODUCTS GRID */
          <div className="wishlist-grid">
            {items.map((item) => {
              const pid = String(item.id || item.productId || item._id);
              const isRemoving = actionInProgressId === pid;
              const isOutOfStock = item.stockQuantity === 0;

              return (
                <div className="wishlist-card" key={pid}>
                  {/* BADGES */}
                  <div className="wishlist-card-top-badges">
                    {item.discount > 0 ? (
                      <span className="wishlist-discount-badge">
                        -{item.discount}%
                      </span>
                    ) : (
                      <span></span>
                    )}

                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={(e) => handleRemove(pid, item.name, e)}
                      title="Remove from wishlist"
                      disabled={isRemoving}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* IMAGE */}
                  <div
                    className="wishlist-image-wrapper"
                    onClick={() => navigate(`/productdetails/${pid}`)}
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60";
                      }}
                    />
                  </div>

                  {/* INFO */}
                  <div className="wishlist-card-body">
                    <div className="wishlist-card-meta">
                      <span className="wishlist-category-tag">
                        {item.category}
                      </span>
                      <span
                        className={`wishlist-stock-pill ${
                          isOutOfStock ? "out" : "in"
                        }`}
                      >
                        <span className="wishlist-stock-dot"></span>
                        {isOutOfStock ? "Out of stock" : "In stock"}
                      </span>
                    </div>

                    <h3
                      className="wishlist-product-title"
                      title={item.name}
                      onClick={() => navigate(`/productdetails/${pid}`)}
                    >
                      {item.name}
                    </h3>

                    {item.unit && (
                      <div className="wishlist-unit">
                        Pack: <strong>{item.unit}</strong>
                      </div>
                    )}

                    <div className="wishlist-price-row">
                      <span className="wishlist-current-price">
                        {formatPrice(item.price)}
                      </span>
                      {item.oldPrice > item.price && (
                        <span className="wishlist-old-price">
                          {formatPrice(item.oldPrice)}
                        </span>
                      )}
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="wishlist-card-actions">
                      <button
                        type="button"
                        className={`wishlist-btn-add-cart ${
                          isOutOfStock ? "disabled" : ""
                        }`}
                        onClick={() => handleAddToCart(item, false)}
                        disabled={isOutOfStock || actionInProgressId === pid}
                      >
                        <ShoppingCart size={17} />
                        <span>
                          {isOutOfStock
                            ? "Out of Stock"
                            : actionInProgressId === pid
                            ? "Adding…"
                            : "Add To Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BACK TO SHOPPING FOOTNOTE */}
        <div className="wishlist-footer-nav">
          <Link to="/" className="wishlist-back-link">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;


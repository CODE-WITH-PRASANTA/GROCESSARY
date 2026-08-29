import React, { useEffect, useState } from "react";
import "./CartSection.css";

// --- IMPORT YOUR LOCAL IMAGES HERE ---
import avocadoImg from "../../assets/avocadoCart.webp";
import orangeImg from "../../assets/lemoncart.avif";
import grapeImg from "../../assets/garpecart.avif";
import mangoImg from "../../assets/mangocart.avif";

const API_BASE_URL = "http://localhost:5000";
import { useNavigate } from "react-router-dom";

const CartSection = ({ isOpen: externalIsOpen, onClose }) => {
  // ======================================================
  // DRAWER STATE
  // ======================================================
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(true);

  const isCartOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleCloseCart = () => {
    setInternalIsOpen(false);

    if (onClose) {
      onClose();
    }
  };

  // ======================================================
  // CART STATE
  // ======================================================

  const [cartItems, setCartItems] = useState([]);

  const [cartLoading, setCartLoading] = useState(false);

  const [cartError, setCartError] = useState("");

  // ======================================================
  // RECOMMENDATION ITEMS
  // ======================================================

  const recommendations = [
    {
      id: 101,
      name: "Sliced Whole Orange",
      price: 400,
      image: orangeImg,
    },
    {
      id: 102,
      name: "Garden Grape Fruit",
      price: 500,
      image: grapeImg,
    },
    {
      id: 103,
      name: "Fresh Organic Mango",
      price: 350,
      image: mangoImg,
    },
  ];

  const [activeRecIndex, setActiveRecIndex] = useState(0);

  // ======================================================
  // IMAGE URL HELPER
  // ======================================================
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add("cart-is-open");
    } else {
      document.body.classList.remove("cart-is-open");
    }

    return () => {
      document.body.classList.remove("cart-is-open");
    };
  }, [isCartOpen]);
  const getImageUrl = (image) => {
    if (!image) {
      return avocadoImg;
    }

    // Backend image object
    if (typeof image === "object") {
      image = image?.url || image?.path || image?.secure_url || "";
    }

    if (!image) {
      return avocadoImg;
    }

    // Full URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Relative backend path
    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // ======================================================
  // FETCH CART
  // ======================================================

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      // ==========================================
      // NOT LOGGED IN
      // ==========================================

      if (!token) {
        setCartItems([]);
        setCartError("");
        return;
      }

      setCartLoading(true);
      setCartError("");

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // ==========================================
      // CHECK RESPONSE TYPE
      // ==========================================

      const contentType = response.headers.get("content-type");

      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error("Cart API returned non-JSON:", text);

        throw new Error("Cart API returned an invalid response.");
      }

      console.log("GET CART RESPONSE:", result);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to fetch cart.");
      }

      // ==========================================
      // GET ITEMS
      // ==========================================

      const items = result?.cart?.items || result?.items || [];

      // ==========================================
      // FORMAT BACKEND ITEMS FOR EXISTING UI
      // ==========================================

      const formattedItems = items
        .filter((item) => item?.product)
        .map((item) => {
          const product = item.product;

          const productImage =
            Array.isArray(product?.images) && product.images.length > 0
              ? product.images[0]
              : null;

          const unitName =
            typeof product?.unit === "object"
              ? product?.unit?.name || product?.unit?.symbol || ""
              : product?.unit || "";

          return {
            // Keep original cart item ID
            id: item._id,

            // Product ID is useful for API updates later
            productId: product._id,

            name: product?.productName || product?.name || "Product",

            price: Number(product?.price || 0),

            writtenPrice: Number(product?.writtenPrice || 0),

            size: unitName || "Standard Pack",

            quantity: Number(item?.quantity || 1),

            stockQuantity: Number(product?.stockQuantity || 0),

            image: getImageUrl(productImage),
          };
        });

      setCartItems(formattedItems);
    } catch (error) {
      console.error("Fetch cart error:", error);

      setCartError(error?.message || "Unable to load cart.");

      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // ======================================================
  // LOAD CART
  // ======================================================

  useEffect(() => {
    fetchCart();
  }, []);

  // ======================================================
  // REFRESH CART WHEN DRAWER OPENS
  // ======================================================

  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen]);

  // ======================================================
  // UPDATE CART QUANTITY
  // ======================================================

  const updateCartQuantity = async (item, newQuantity) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      if (newQuantity < 1) {
        await handleRemove(item.id);
        return;
      }

      if (item.stockQuantity > 0 && newQuantity > item.stockQuantity) {
        alert(`Only ${item.stockQuantity} item(s) available in stock.`);
        return;
      }

      console.log("UPDATING CART:", {
        productId: item.productId,
        quantity: newQuantity,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/cart/update/${item.productId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            quantity: newQuantity,
          }),
        },
      );

      const contentType = response.headers.get("content-type");

      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error("Update cart non-JSON:", text);

        throw new Error("Invalid response from cart API.");
      }

      console.log("UPDATE CART RESPONSE:", result);

      if (!response.ok) {
        throw new Error(result?.message || "Unable to update cart.");
      }

      // Update immediately from server response
      if (result?.cart?.items) {
        const formattedItems = result.cart.items
          .filter((cartItem) => cartItem?.product)
          .map((cartItem) => {
            const product = cartItem.product;

            const productImage =
              Array.isArray(product?.images) && product.images.length > 0
                ? product.images[0]
                : null;

            const unitName =
              typeof product?.unit === "object"
                ? product?.unit?.name || product?.unit?.symbol || ""
                : product?.unit || "";

            return {
              id: cartItem._id,

              productId: product._id,

              name: product?.productName || product?.name || "Product",

              price: Number(product?.price || 0),

              writtenPrice: Number(product?.writtenPrice || 0),

              size: unitName || "Standard Pack",

              quantity: Number(cartItem?.quantity || 1),

              stockQuantity: Number(product?.stockQuantity || 0),

              image: getImageUrl(productImage),
            };
          });

        setCartItems(formattedItems);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error("Update cart error:", error);

      alert(error?.message || "Unable to update cart.");
    }
  };

  // ======================================================
  // INCREASE
  // ======================================================

  const handleIncrease = (id) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);

    if (!item) {
      return;
    }

    updateCartQuantity(item, item.quantity + 1);
  };

  // ======================================================
  // DECREASE
  // ======================================================

  const handleDecrease = (id) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);

    if (!item) {
      return;
    }

    updateCartQuantity(item, item.quantity - 1);
  };

  // ======================================================
  // REMOVE
  // ======================================================

  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const item = cartItems.find((cartItem) => cartItem.id === id);

      if (!item) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cart/remove/${item.productId}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const contentType = response.headers.get("content-type");

      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error("Remove cart non-JSON:", text);

        throw new Error("Invalid response from cart API.");
      }

      if (!response.ok) {
        throw new Error(result?.message || "Unable to remove product.");
      }

      console.log("REMOVE CART RESPONSE:", result);

      // Refresh cart from backend
      await fetchCart();
    } catch (error) {
      console.error("Remove cart error:", error);

      alert(error?.message || "Unable to remove product.");
    }
  };

  // ======================================================
  // RECOMMENDATION ADD
  // ======================================================

  const handleAddToCart = async (recItem) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first to add products to cart.");
        return;
      }

      alert("This recommendation is currently a demo product.");
    } catch (error) {
      console.error("Recommendation cart error:", error);
    }
  };

  // ======================================================
  // CALCULATIONS
  // ======================================================

  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const subtotalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // ======================================================
  // FREE SHIPPING
  // ======================================================

  const freeShippingThreshold = 1000;

  const progressPercent = Math.min(
    (subtotalAmount / freeShippingThreshold) * 100,
    100,
  );

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <>
      {/* ================================================== */}
      {/* SEO STRUCTURED DATA */}
      {/* ================================================== */}

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Grocery Sathi Shopping Cart",
          description:
            "Review your selected fresh organic grocery items, check shipping progress, and proceed to secure checkout on Grocery Sathi.",
          publisher: {
            "@type": "Organization",
            name: "Grocery Sathi",
          },
        })}
      </script>

      {/* ================================================== */}
      {/* REOPEN BUTTON */}
      {/* ================================================== */}

      {!isCartOpen && (
        <button
          type="button"
          className="reopen-cart-btn"
          onClick={() => setInternalIsOpen(true)}
          aria-label="Open Grocery Sathi Shopping Cart"
        >
          🛒 Open Cart
        </button>
      )}

      {/* ================================================== */}
      {/* CART DRAWER OVERLAY */}
      {/* ================================================== */}

      <div
        className={`cart-drawer-overlay ${isCartOpen ? "open" : ""}`}
        onClick={handleCloseCart}
        role="presentation"
      >
        <div
          className={`cart-drawer-container ${isCartOpen ? "slide-in" : ""}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart Drawer"
        >
          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <header className="cart-header">
            <button
              type="button"
              className="cart-close-btn"
              onClick={() => {
                handleCloseCart();
                navigate("/");
              }}
              aria-label="Close Shopping Cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="cart-header-title-wrap">
              <h2 className="cart-header-title">Your Cart</h2>

              <span className="cart-total-item-count">
                {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
              </span>
            </div>
          </header>

          {/* ================================================== */}
          {/* LOADING */}
          {/* ================================================== */}

          {cartLoading ? (
            <div className="empty-cart-container">
              <h3 className="empty-cart-title">Loading cart...</h3>
            </div>
          ) : cartError ? (
            <div className="empty-cart-container">
              <h3 className="empty-cart-title">{cartError}</h3>

              <button
                type="button"
                className="btn-continue-shopping"
                onClick={fetchCart}
              >
                Try Again
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* ================================================== */
            /* EMPTY CART */
            /* ================================================== */

            <div className="empty-cart-container">
              <div className="empty-cart-icon-wrap" aria-hidden="true">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm0-3h11.23c.77 0 1.45-.44 1.77-1.12l3.58-6.49A1.003 1.003 0 0 0 22.7 6c-.33-.51-.92-.81-1.53-.81H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z" />

                  <path d="M11 9.5c0-.28.22-.5.5-.5s.5.22.5.5v1c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1zm5 0c0-.28.22-.5.5-.5s.5.22.5.5v1c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1zm-6 4c0 1.1 1.34 2 3 2s3-.9 3-2h-6z" />
                </svg>
              </div>

              <h3 className="empty-cart-title">Your cart is empty</h3>

              <button
                type="button"
                className="btn-continue-shopping"
                onClick={() => {
                  handleCloseCart();
                  navigate("/");
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />

                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              {/* ================================================== */}
              {/* CART BODY */}
              {/* ================================================== */}

              <div className="cart-body">
                {/* ================================================== */}
                {/* SHIPPING BAR */}
                {/* ================================================== */}

                <div className="shipping-bar-container">
                  <p className="shipping-msg">
                    {subtotalAmount >= freeShippingThreshold ? (
                      <>
                        🎉 <strong>Yay!</strong> You've unlocked{" "}
                        <strong>FREE Shipping</strong>
                      </>
                    ) : (
                      <>
                        Add{" "}
                        <strong>
                          ₹{(freeShippingThreshold - subtotalAmount).toFixed(2)}
                        </strong>{" "}
                        more for <strong>FREE Shipping</strong>
                      </>
                    )}
                  </p>

                  <div
                    className="shipping-progress-track"
                    aria-label="Free shipping progress bar"
                  >
                    <div
                      className="shipping-progress-fill animated-stripes"
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />

                    <div
                      className="shipping-truck-icon-wrap bouncing-truck"
                      style={{
                        left: `calc(${progressPercent}% - 18px)`,
                      }}
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#102a27"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="1" y="3" width="15" height="13" rx="2" />

                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />

                        <circle cx="5.5" cy="18.5" r="2.5" />

                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ================================================== */}
                {/* CART ITEMS */}
                {/* ================================================== */}

                <section className="cart-items-list" aria-label="Cart Items">
                  {cartItems.map((item) => (
                    <article key={item.id} className="cart-item-card">
                      <div className="cart-item-img-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = avocadoImg;
                          }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-header-row">
                          <h4 className="cart-item-title">{item.name}</h4>

                          <button
                            type="button"
                            className="cart-item-delete-btn"
                            onClick={() => handleRemove(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="3 6 5 6 21 6" />

                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>

                        <p className="cart-item-price">
                          ₹{item.price.toFixed(2)}
                        </p>

                        <p className="cart-item-size">Size: {item.size}</p>

                        {/* ================================================== */}
                        {/* QUANTITY */}
                        {/* ================================================== */}

                        <div className="cart-item-qty-control">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item.id)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>

                          <span aria-label={`Quantity: ${item.quantity}`}>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleIncrease(item.id)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>

                {/* ================================================== */}
                {/* RECOMMENDATIONS */}
                {/* ================================================== */}

                <section
                  className="cart-recommendations-section"
                  aria-label="Recommended Products"
                >
                  <h3 className="recommendations-title">You may also like</h3>

                  <div className="recommendation-card">
                    <div className="rec-img-wrap">
                      <img
                        src={recommendations[activeRecIndex].image}
                        alt={recommendations[activeRecIndex].name}
                        loading="lazy"
                      />
                    </div>

                    <div className="rec-details">
                      <h4 className="rec-title">
                        {recommendations[activeRecIndex].name}
                      </h4>

                      <p className="rec-price">
                        ₹{recommendations[activeRecIndex].price.toFixed(2)}
                      </p>

                      <button
                        type="button"
                        className="rec-add-btn"
                        onClick={() =>
                          handleAddToCart(recommendations[activeRecIndex])
                        }
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>

                  <div
                    className="carousel-dots"
                    role="tablist"
                    aria-label="Recommendation carousel controls"
                  >
                    {recommendations.map((_, idx) => (
                      <button
                        type="button"
                        key={idx}
                        role="tab"
                        aria-selected={activeRecIndex === idx}
                        aria-label={`Slide recommendation ${idx + 1}`}
                        className={`dot ${
                          activeRecIndex === idx ? "active" : ""
                        }`}
                        onClick={() => setActiveRecIndex(idx)}
                      />
                    ))}
                  </div>
                </section>
              </div>

              {/* ================================================== */}
              {/* FOOTER */}
              {/* ================================================== */}

              <footer className="cart-footer">
                <div className="cart-badges-row">
                  <div
                    className="cart-badge-card"
                    aria-label="Coupon available badge"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />

                      <line x1="9" y1="9" x2="9.01" y2="9" />

                      <line x1="15" y1="15" x2="15.01" y2="15" />

                      <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>

                    <span>Save More</span>
                  </div>

                  <div
                    className="cart-badge-card"
                    aria-label="Secure package delivery badge"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 12 20 22 4 22 4 12" />

                      <rect x="2" y="7" width="20" height="5" />

                      <line x1="12" y1="22" x2="12" y2="7" />
                    </svg>

                    <span>Express Delivery</span>
                  </div>
                </div>

                {/* ================================================== */}
                {/* TOTALS */}
                {/* ================================================== */}

                <div className="cart-totals-row">
                  <div className="total-col">
                    <span className="total-label">Total Items</span>

                    <span className="total-value">{totalItemsCount}</span>
                  </div>

                  <div className="total-col right">
                    <span className="total-label">Subtotal</span>

                    <span className="total-value">
                      ₹{subtotalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* ================================================== */}
                {/* EACH ITEM PRICE DETAILS */}
                {/* ================================================== */}

                <div className="cart-item-price-details">
                  <h4 className="price-details-title">Price Details</h4>

                  {cartItems.map((item) => {
                    const itemTotal =
                      Number(item.price || 0) * Number(item.quantity || 0);

                    return (
                      <div className="cart-price-detail-item" key={item.id}>
                        <div className="cart-price-detail-info">
                          <span className="cart-price-detail-name">
                            {item.name}
                          </span>

                          <span className="cart-price-detail-quantity">
                            {item.quantity} × ₹
                            {Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>

                        <span className="cart-price-detail-total">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* ================================================== */}
                {/* ACTION BUTTONS */}
                {/* ================================================== */}

                <div className="cart-action-buttons">
                  <button
                    type="button"
                    className="btn-view-cart"
                    onClick={() => alert("Redirecting to full cart page...")}
                  >
                    View Cart
                  </button>

                  <button
                    type="button"
                    className="btn-checkout"
                    onClick={() => alert("Proceeding to secure checkout...")}
                  >
                    Checkout
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSection;

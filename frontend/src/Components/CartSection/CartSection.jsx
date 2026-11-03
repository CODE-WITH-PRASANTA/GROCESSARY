import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  MapPin,
  Home,
  Briefcase,
  ChevronRight,
  Phone,
  Check,
} from "lucide-react";
import API from "../../api/axios";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart as clearCartService,
  calculateCartSummary,
    isLoggedIn,
} from "../../Utils/cartService";
import { addToWishlist } from "../../Utils/wishlistService";
import "./CartSection.css";

const CartSection = () => {
  const isInternalUpdate = useRef(false);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // =======================================================
  // PROMO CODE STATES (REAL DYNAMIC FROM BACKEND)
  // =======================================================
  const [couponInput, setCouponInput] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);

  // =======================================================
  // ADDRESS STATES (REAL SAVED ADDRESSES)
  // =======================================================
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAddressSelectOpen, setIsAddressSelectOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "Home",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // =======================================================
  // LOAD CART ITEMS
  // =======================================================
  const loadCartData = useCallback(async () => {
    try {
      const data = await fetchCart();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD REAL DYNAMIC COUPONS FROM BACKEND
  // (Backed by http://localhost:5174/products/coupons)
  // =======================================================
  const loadDynamicCoupons = useCallback(async () => {
    try {
      setCouponsLoading(true);
      const { data } = await API.get("/coupons?status=Active");
      const list = data?.coupons || data?.data || [];
      setAvailableCoupons(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error loading dynamic coupons:", error);
      setAvailableCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD SAVED DELIVERY ADDRESSES
  // =======================================================
  const loadAddresses = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      setAddressLoading(true);
      const { data } = await API.get("/delivery-address");
      const list = data?.data || data?.addresses || [];
      const validList = Array.isArray(list) ? list : [];
      setAddresses(validList);

      // Auto-select default or first address
      if (validList.length > 0) {
        const defaultAddr =
          validList.find((a) => a.isDefault) || validList[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Error loading delivery addresses:", error);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadCartData();
    loadDynamicCoupons();
    loadAddresses();

    const handleCartUpdated = () => {
      if (isInternalUpdate.current) return;
      loadCartData();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [loadCartData, loadDynamicCoupons, loadAddresses]);

  // =======================================================
  // SUMMARY CALCULATIONS (NO FREE DELIVERY THRESHOLD)
  // =======================================================
  const summary = calculateCartSummary(items, appliedCoupon);

  // =======================================================
  // HANDLERS: QUANTITY
  // =======================================================
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(item);
      return;
    }

    if (item.stockQuantity && newQuantity > item.stockQuantity) {
      Swal.fire({
        icon: "warning",
        title: "Stock Limit Reached",
        text: `Sorry, only ${item.stockQuantity} units are available.`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // Immediate instant optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: newQuantity } : i
      )
    );

    // Prevent race condition from overwriting state
    isInternalUpdate.current = true;
    try {
      await updateCartQuantity(item.id, newQuantity);
    } finally {
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 500);
    }
  };

  // =======================================================
  // HANDLERS: REMOVE ITEM
  // =======================================================
  const handleRemoveItem = async (item) => {
    const result = await Swal.fire({
      title: "Remove from cart?",
      text: `Are you sure you want to remove "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Keep it",
    });

    if (!result.isConfirmed) return;

    setActionLoading(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await removeFromCart(item.id);
    setActionLoading(null);

    Swal.fire({
      icon: "success",
      title: "Item removed",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  // =======================================================
  // HANDLERS: MOVE TO WISHLIST
  // =======================================================
  const handleMoveToWishlist = async (item) => {
    setActionLoading(item.id);

    await addToWishlist({
      id: item.id,
      _id: item.id,
      productName: item.name,
      name: item.name,
      price: item.price,
      writtenPrice: item.originalPrice,
      images: [item.image],
      image: item.image,
      category: item.category,
      unit: item.unit,
    });

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await removeFromCart(item.id);
    setActionLoading(null);

    Swal.fire({
      icon: "success",
      title: "Moved to Wishlist!",
      text: `"${item.name}" moved to your saved wishlist.`,
      timer: 1600,
      showConfirmButton: false,
    });
  };

  // =======================================================
  // HANDLERS: CLEAR CART
  // =======================================================
  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Clear your shopping cart?",
      text: "All items will be removed from your cart.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, empty cart",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setItems([]);
    setAppliedCoupon(null);
    await clearCartService();

    Swal.fire({
      icon: "success",
      title: "Cart cleared",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // =======================================================
  // REAL DYNAMIC COUPON VALIDATION (API)
  // =======================================================
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setCouponError("Please enter a valid coupon code");
      return;
    }

    try {
      setCouponValidating(true);
      const { data } = await API.post("/coupons/validate", {
        code,
        orderAmount: summary.itemsTotal,
      });

      if (data?.success && data?.data) {
        setAppliedCoupon({
          code: data.data.code,
          title: data.data.title || data.data.code,
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
          discountAmount: data.data.discountAmount,
          minPurchase: data.data.minPurchase,
        });
        setCouponSuccess(
          data.message || `Coupon "${data.data.code}" applied successfully!`
        );
        setCouponInput("");
      } else {
        setCouponError(data?.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setCouponError(
        error.response?.data?.message || "Could not apply this coupon."
      );
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
  };

  // =======================================================
  // HANDLERS: ADD NEW ADDRESS
  // =======================================================
  const handleOpenAddAddress = () => {
    setAddressForm({
      name: "",
      mobile: "",
      address: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      addressType: "Home",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (
      !addressForm.name.trim() ||
      !addressForm.mobile.trim() ||
      !addressForm.address.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please fill in all mandatory address fields.",
      });
      return;
    }

    try {
      setAddressSaving(true);
      const { data } = await API.post("/delivery-address", addressForm);
      const newAddress = data?.data || data?.address || addressForm;

      await loadAddresses();
      setSelectedAddress(newAddress);
      setIsAddressModalOpen(false);

      Swal.fire({
        icon: "success",
        title: "Delivery Address Saved!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving address in cart:", error);
      Swal.fire({
        icon: "error",
        title: "Could not save address",
        text: error.response?.data?.message || "Please check details.",
      });
    } finally {
      setAddressSaving(false);
    }
  };

  // =======================================================
  // HELPER: LOAD RAZORPAY SDK DYNAMICALLY
  // =======================================================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // =======================================================
  // HANDLER: FRESH RAZORPAY CHECKOUT INTEGRATION
  // =======================================================
  const handleProceedToCheckout = async () => {
    if (items.length === 0 || checkoutLoading) return;

    // 1. Check Authentication
    if (!isLoggedIn()) {
      Swal.fire({
        icon: "info",
        title: "Please Sign In",
        text: "Please sign in or create an account to proceed with your order.",
        showCancelButton: true,
        confirmButtonColor: "#059669",
        confirmButtonText: "Sign In",
        cancelButtonText: "Continue Shopping",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    // 2. Check Delivery Address
    if (!selectedAddress) {
      Swal.fire({
        icon: "warning",
        title: "Delivery Address Required",
        text: "Please add or select a delivery address to complete your checkout.",
        showCancelButton: true,
        confirmButtonColor: "#059669",
        confirmButtonText: "Add Address",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/profile?tab=addresses");
        }
      });
      return;
    }

    try {
      setCheckoutLoading(true);

      // 3. Ensure Razorpay SDK is ready
      const isSdkReady = await loadRazorpayScript();
      if (!isSdkReady || !window.Razorpay) {
        setCheckoutLoading(false);
        Swal.fire({
          icon: "error",
          title: "Payment SDK Error",
          text: "Unable to load Razorpay payment gateway. Please check your network connection.",
          confirmButtonColor: "#059669",
        });
        return;
      }

      // 4. Place order on backend to create Razorpay Order
      const orderPayload = {
        addressId: selectedAddress._id || selectedAddress.id,
        items: items.map((i) => ({
          productId: i.productId || i.id,
          quantity: Number(i.quantity),
        })),
        paymentMethod: "razorpay",
        useWallet: false,
        usePoints: false,
      };

      const { data } = await API.post("/orders/place", orderPayload);

      if (!data?.success) {
        setCheckoutLoading(false);
        Swal.fire({
          icon: "error",
          title: "Order Failed",
          text: data?.message || "Could not initialize order. Please try again.",
          confirmButtonColor: "#059669",
        });
        return;
      }

      // If fully covered by zero payable
      if (!data.requiresPayment) {
        setCheckoutLoading(false);
        await clearCartService();
        Swal.fire({
          icon: "success",
          title: "Order Placed Successfully!",
          text: `Your order #${data.order?.orderNumber || ""} has been confirmed.`,
          confirmButtonColor: "#059669",
          confirmButtonText: "View My Orders",
        }).then(() => {
          navigate("/profile?tab=orders");
        });
        return;
      }

      // 5. Trigger Razorpay Checkout directly
      const rzpInfo = data.razorpay || {};
      let userEmail = "";
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        userEmail = storedUser?.email || "";
      } catch {}

      const options = {
        key: rzpInfo.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4",
        amount: rzpInfo.amount,
        currency: rzpInfo.currency || "INR",
        name: "Grocery Sathi",
        description: rzpInfo.description || `Order #${data.order?.orderNumber || ""}`,
        order_id: rzpInfo.orderId,
        prefill: {
          name: selectedAddress.name || "",
          contact: selectedAddress.mobile || "",
          email: rzpInfo.prefill?.email || userEmail,
        },
        theme: {
          color: "#059669",
        },
        handler: async function (paymentResponse) {
          try {
            Swal.fire({
              title: "Verifying Payment...",
              text: "Please wait while we confirm your payment.",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });

            const verifyRes = await API.post("/orders/verify", {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              await clearCartService();
              Swal.fire({
                icon: "success",
                title: "Payment Successful!",
                text: `Order #${data.order?.orderNumber || ""} is placed and confirmed!`,
                confirmButtonColor: "#059669",
                confirmButtonText: "View Orders",
              }).then(() => {
                navigate("/profile?tab=orders");
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Payment Verification Failed",
                text: verifyRes.data?.message || "Verification failed. Please contact support.",
                confirmButtonColor: "#059669",
              });
            }
          } catch (verErr) {
            console.error("Verification error:", verErr);
            Swal.fire({
              icon: "error",
              title: "Verification Error",
              text: verErr.response?.data?.message || "Failed to verify transaction.",
              confirmButtonColor: "#059669",
            });
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (resp) {
        setCheckoutLoading(false);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: resp.error?.description || "Payment was declined or cancelled.",
          confirmButtonColor: "#059669",
        });
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Proceed to checkout error:", err);
      setCheckoutLoading(false);
      Swal.fire({
        icon: "error",
        title: "Checkout Error",
        text: err.response?.data?.message || "Failed to start checkout process.",
        confirmButtonColor: "#059669",
      });
    }
  };

  // =======================================================
  // RENDER: LOADING STATE
  // =======================================================
  if (loading) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-page-container">
          <div className="cart-loading-skeleton">
            <div className="skeleton-bar skeleton-title"></div>
            <div className="cart-layout-grid">
              <div className="skeleton-items-column">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton-card"></div>
                ))}
              </div>
              <div className="skeleton-summary-column">
                <div className="skeleton-summary-box"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER: EMPTY CART
  // =======================================================
  if (items.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-page-container">
          <nav className="cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Shopping Cart</span>
          </nav>

          <div className="cart-empty-card">
            <div className="cart-empty-icon-wrap">
              <ShoppingBag size={54} className="cart-empty-icon" />
              <span className="cart-empty-badge">0</span>
            </div>
            <h1 className="cart-empty-title">Your Shopping Cart is Empty</h1>
            <p className="cart-empty-desc">
              Looks like you haven't added anything to your cart yet. Explore
              our fresh farm-picked vegetables, fruits, and groceries!
            </p>
            <div className="cart-empty-actions">
              <Link to="/" className="cart-btn-primary">
                <ShoppingBag size={18} />
                <span>Start Shopping</span>
              </Link>
              <Link to="/wishlist" className="cart-btn-secondary">
                <Heart size={18} />
                <span>View Wishlist</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER: ACTIVE CART
  // =======================================================
  return (
    <div className="cart-page-wrapper">
      <div className="cart-page-container">
        {/* BREADCRUMB */}
        <nav className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Shopping Cart</span>
        </nav>

        {/* PAGE HEADER */}
        <div className="cart-header-row">
          <div className="cart-header-left">
            <h1 className="cart-page-title">Shopping Cart</h1>
            <span className="cart-items-counter-badge">
              {summary.itemCount} {summary.itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>

          <button
            type="button"
            className="cart-clear-btn"
            onClick={handleClearCart}
            aria-label="Empty Cart"
          >
            <Trash2 size={16} />
            <span>Empty Cart</span>
          </button>
        </div>

        

        {/* MAIN 2-COLUMN LAYOUT */}
        <div className="cart-layout-grid">
          {/* ==============================================
              LEFT COLUMN: CART ITEMS LIST
          =============================================== */}
          <section className="cart-items-column" aria-label="Cart Items">
          {/* ===================================================
            DELIVERY ADDRESS SECTION (IN CART INTEGRATION)
        ==================================================== */}
        <div className="cart-delivery-address-card">
          <div className="cart-address-icon-box">
            <MapPin size={22} className="cart-address-pin" />
          </div>

          <div className="cart-address-content">
            <div className="cart-address-label-row">
              <span className="cart-deliver-to-text">Deliver to:</span>
              {selectedAddress && (
                <span className="cart-address-type-tag">
                  {selectedAddress.addressType === "Work" ? (
                    <Briefcase size={12} />
                  ) : (
                    <Home size={12} />
                  )}
                  <span>{selectedAddress.addressType || "Home"}</span>
                </span>
              )}
            </div>

            {selectedAddress ? (
              <div className="cart-selected-address-info">
                <span className="address-recipient-info">
                  <strong>{selectedAddress.name}</strong> •{" "}
                  {selectedAddress.mobile}
                </span>
                <span className="address-full-string">
                  {selectedAddress.address}
                  {selectedAddress.landmark
                    ? `, Near ${selectedAddress.landmark}`
                    : ""}
                  , {selectedAddress.city}, {selectedAddress.state} -{" "}
                  {selectedAddress.pincode}
                </span>
              </div>
            ) : isLoggedIn() ? (
              <div className="cart-no-address-info">
                <span>No delivery address selected. Please add or choose an address.</span>
              </div>
            ) : (
              <div className="cart-no-address-info">
                <span>
                  Log in or add a delivery address for fast doorstep grocery delivery.
                </span>
              </div>
            )}
          </div>

          <div className="cart-address-action-col">
            {isLoggedIn() ? (
              addresses.length > 0 ? (
                <button
                  type="button"
                  className="cart-change-address-btn"
                  onClick={() => setIsAddressSelectOpen(true)}
                >
                  <span>Change</span>
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  className="cart-add-address-btn"
                  onClick={() => navigate("/profile?tab=addresses")}
                >
                  <Plus size={15} />
                  <span>Add Address</span>
                </button>
              )
            ) : (
              <Link to="/login" className="cart-login-address-btn">
                <span>Login to deliver</span>
              </Link>
            )}
          </div>
        </div>
            <div className="cart-items-card">
              <div className="cart-items-table-header">
                <span className="col-header-product">Product</span>
                <span className="col-header-price">Price</span>
                <span className="col-header-qty">Quantity</span>
                <span className="col-header-subtotal">Subtotal</span>
              </div>

              <div className="cart-items-list">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  const isModifying = actionLoading === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`cart-item-row ${
                        isModifying ? "item-modifying" : ""
                      }`}
                    >
                      {/* PRODUCT INFO */}
                      <div className="cart-item-product-info">
                        <Link
                          to={`/productdetails/${item.id}`}
                          className="cart-item-img-link"
                        >
                          <img
                            src={item.image || "/placeholder-grocery.png"}
                            alt={item.name}
                            className="cart-item-img"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                        </Link>

                        <div className="cart-item-details">
                          <span className="cart-item-category">
                            {item.category}
                          </span>
                          <Link
                            to={`/productdetails/${item.id}`}
                            className="cart-item-name"
                          >
                            {item.name}
                          </Link>
                          <span className="cart-item-unit">
                            Pack: {item.unit}
                          </span>

                          <div className="cart-item-stock-tag">
                            <span className="stock-dot"></span>
                            <span>In Stock</span>
                          </div>

                          <div className="cart-item-mobile-price">
                            <span className="mobile-price-current">
                              ₹{item.price}
                            </span>
                            {item.originalPrice > item.price && (
                              <span className="mobile-price-original">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* UNIT PRICE */}
                      <div className="cart-item-price-col">
                        <span className="item-price-current">
                          ₹{item.price}
                        </span>
                        {item.originalPrice > item.price && (
                          <div className="item-price-savings-wrap">
                            <span className="item-price-original">
                              ₹{item.originalPrice}
                            </span>
                            <span className="item-price-discount-badge">
                              {item.discount}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* QUANTITY CONTROLS */}
                      <div className="cart-item-qty-col">
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="qty-btn qty-btn-minus"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="qty-btn qty-btn-plus"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                            aria-label={`Increase quantity of ${item.name}`}
                            
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="cart-item-actions-row">
                          <button
                            type="button"
                            className="item-action-btn action-wishlist"
                            onClick={() => handleMoveToWishlist(item)}
                            title="Move to Wishlist"
                          >
                            <Heart size={14} />
                            <span>Save</span>
                          </button>
                          <span className="action-divider">•</span>
                          <button
                            type="button"
                            className="item-action-btn action-remove"
                            onClick={() => handleRemoveItem(item)}
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* SUBTOTAL */}
                      <div className="cart-item-subtotal-col">
                        <span className="item-subtotal-amount">
                          ₹{lineTotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className="item-desktop-delete-btn"
                          onClick={() => handleRemoveItem(item)}
                          aria-label={`Remove ${item.name}`}
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ==============================================
              RIGHT COLUMN: ORDER SUMMARY (STICKY)
          =============================================== */}
          <aside className="cart-summary-column" aria-label="Order Summary">
            <div className="cart-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              {/* SUMMARY ROWS */}
              <div className="summary-rows-wrap">
                <div className="summary-row">
                  <span className="summary-label">Items Subtotal (MRP)</span>
                  <span className="summary-val">
                    ₹{summary.subtotal.toFixed(2)}
                  </span>
                </div>

                {summary.productSavings > 0 && (
                  <div className="summary-row savings-row">
                    <span className="summary-label">Product Savings</span>
                    <span className="summary-val text-green">
                      - ₹{summary.productSavings.toFixed(2)}
                    </span>
                  </div>
                )}

                {summary.couponDiscount > 0 && (
                  <div className="summary-row coupon-savings-row">
                    <span className="summary-label">
                      Promo ({appliedCoupon?.code})
                    </span>
                    <span className="summary-val text-green">
                      - ₹{summary.couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                

                <div className="summary-divider"></div>

                <div className="summary-row grand-total-row">
                  <span className="grand-total-label">Total Payable</span>
                  <span className="grand-total-val">
                    ₹{summary.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* SAVINGS CALLOUT */}
              {summary.totalSavings > 0 && (
                <div className="summary-savings-banner">
                  <Sparkles size={16} className="sparkle-icon" />
                  <span>
                    You will save{" "}
                    <strong>₹{summary.totalSavings.toFixed(2)}</strong> on this
                    grocery order!
                  </span>
                </div>
              )}

              {/* ===================================================
                  REAL DYNAMIC PROMO CODE SECTION
                  (From http://localhost:5174/products/coupons API)
              ==================================================== */}
              <div className="coupon-box-section">
                <label htmlFor="cart-coupon-input" className="coupon-label">
                  <Tag size={15} />
                  <span>Have a Promo Code?</span>
                </label>

                {appliedCoupon ? (
                  <div className="applied-coupon-pill">
                    <div className="applied-coupon-meta">
                      <span className="applied-code">{appliedCoupon.code}</span>
                      <span className="applied-desc">
                        {appliedCoupon.title || "Coupon Applied"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                      aria-label="Remove applied coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-group">
                    <input
                      id="cart-coupon-input"
                      type="text"
                      className="coupon-input"
                      placeholder="Enter Promo Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="coupon-apply-btn"
                      onClick={() => handleApplyCoupon()}
                      disabled={couponValidating}
                    >
                      {couponValidating ? "Checking..." : "Apply"}
                    </button>
                  </div>
                )}

                {couponError && (
                  <div className="coupon-alert error">
                    <AlertCircle size={14} />
                    <span>{couponError}</span>
                  </div>
                )}

                {couponSuccess && (
                  <div className="coupon-alert success">
                    <CheckCircle2 size={14} />
                    <span>{couponSuccess}</span>
                  </div>
                )}

                {/* AVAILABLE REAL PROMO CODE CHIPS */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="available-coupons-wrap">
                    <span className="coupon-chips-title">Available Offers:</span>
                    <div className="coupon-chips-list">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon._id || coupon.code}
                          type="button"
                          className="coupon-chip"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          title={coupon.description || coupon.title}
                        >
                          <span className="coupon-chip-code">
                            {coupon.code}
                          </span>
                          <span className="coupon-chip-badge">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                type="button"
                className="checkout-cta-btn"
                onClick={handleProceedToCheckout}
                disabled={checkoutLoading || items.length === 0}
              >
                {checkoutLoading ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* TRUST BADGES */}
              <div className="summary-trust-badges">
                <div className="trust-item">
                  <ShieldCheck size={18} className="trust-icon" />
                  <span>100% Secure Checkout</span>
                </div>
                <div className="trust-item">
                  <Truck size={18} className="trust-icon" />
                  <span>Doorstep Grocery Delivery</span>
                </div>
                <div className="trust-item">
                  <RotateCcw size={18} className="trust-icon" />
                  <span>Easy Return & Refund Guarantee</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =======================================================
          MODAL 1: SELECT FROM SAVED ADDRESSES
      ======================================================== */}
      {isAddressSelectOpen && (
        <div className="cart-modal-overlay">
          <div className="cart-modal-box address-select-box">
            <div className="cart-modal-header">
              <div className="modal-title-with-icon">
                <MapPin size={20} className="modal-title-icon" />
                <h3>Select Delivery Address</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsAddressSelectOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="address-select-list">
              {addresses.map((addr) => {
                const id = addr._id || addr.id;
                const isSelected =
                  selectedAddress && (selectedAddress._id || selectedAddress.id) === id;

                return (
                  <div
                    key={id}
                    className={`address-select-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setIsAddressSelectOpen(false);
                    }}
                  >
                    <div className="address-select-radio">
                      <div className={`radio-dot ${isSelected ? "active" : ""}`} />
                    </div>

                    <div className="address-select-meta">
                      <div className="address-card-top-row">
                        <span className="address-chip">
                          {addr.addressType || "Home"}
                        </span>
                        {addr.isDefault && (
                          <span className="address-default-pill">Default</span>
                        )}
                        <span className="address-user-name">
                          <strong>{addr.name}</strong> • {addr.mobile}
                        </span>
                      </div>
                      <p className="address-line-text">
                        {addr.address}
                        {addr.landmark ? `, Near ${addr.landmark}` : ""},{" "}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="address-select-modal-footer">
              <button
                type="button"
                className="btn-modal-add-new-address"
                onClick={() => {
                  setIsAddressSelectOpen(false);
                  navigate("/profile?tab=addresses");
                }}
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSection;

import React, { useEffect, useState } from "react";
import {
  MdDelete,
  MdAdd,
  MdRemove,
  MdShoppingCart,
  MdClose,
  MdLocationOn,
  MdEdit,
  MdCheck,
} from "react-icons/md";
import API, { BASE_URL } from "../../api/axios";
import "./Cart.css";

// ======================================================
// DELIVERY RULES (must match backend)
// ======================================================

const FREE_DELIVERY_THRESHOLD = 199;
const DELIVERY_CHARGE = 30;

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  // ======================================================
  // TODAY DISCOUNTS
  // ======================================================

  const [todayDiscounts, setTodayDiscounts] = useState([]);

  // ======================================================
  // ADDRESS STATE
  // ======================================================

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    addressType: "Home",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // ======================================================
  // WALLET + POINTS
  // ======================================================

  const [useWallet, setUseWallet] = useState(false);
  const [usePoints, setUsePoints] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);
  const [pointsAvailable, setPointsAvailable] = useState(0);

  const [checkoutPreview, setCheckoutPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);

  // ======================================================
  // PAYMENT METHOD
  // ======================================================

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // ======================================================
  // PRODUCT IMAGE
  // ======================================================

  const getProductImage = (product) => {
    const image = product?.images?.[0];
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `${BASE_URL}${image}`;
    return `${BASE_URL}/${image}`;
  };

  // ======================================================
  // PRODUCT UNIT
  // ======================================================

  const getProductUnit = (product) => {
    if (!product) return "";

    let unitLabel = "";
    const unit = product.unit;

    if (unit && typeof unit === "object") {
      unitLabel = unit.symbol || unit.name || "";
    } else if (typeof unit === "string") {
      const isObjectId = /^[a-f\d]{24}$/i.test(unit.trim());
      if (!isObjectId) unitLabel = unit.trim();
    }

    const unitNo =
      product.unitNo !== undefined && product.unitNo !== null
        ? String(product.unitNo).trim()
        : "";

    if (unitNo && unitLabel) return `${unitNo} ${unitLabel}`;
    if (unitNo) return unitNo;
    if (unitLabel) return unitLabel;
    return "";
  };

  // ======================================================
  // TODAY DISCOUNT HELPERS
  // ======================================================

  const getTodayDiscountForProduct = (productId) => {
    if (!productId) return null;
    const targetId = String(productId);
    return (
      todayDiscounts.find((d) => {
        const discountProductId =
          d?.product?._id || d?.product?.id || d?.product || "";
        return String(discountProductId) === targetId;
      }) || null
    );
  };

  // ======================================================
  // PRICE HELPERS
  // ======================================================

  const getProductPrice = (product) => {
    if (!product) return 0;

    const todayDiscount = getTodayDiscountForProduct(product._id);

    if (todayDiscount && Number(todayDiscount.discountPrice) > 0) {
      return Number(todayDiscount.discountPrice);
    }

    if (product.discountPrice && Number(product.discountPrice) > 0) {
      return Number(product.discountPrice);
    }

    if (product.price !== undefined && product.price !== null) {
      return Number(product.price);
    }

    if (product.writtenPrice !== undefined && product.writtenPrice !== null) {
      return Number(product.writtenPrice);
    }

    return 0;
  };

  const getProductOriginalPrice = (product) => {
    if (!product) return 0;

    const effectivePrice = getProductPrice(product);

    const price = Number(product.price || 0);
    const writtenPrice = Number(product.writtenPrice || 0);
    const productDiscountPrice = Number(product.discountPrice || 0);

    const todayDiscount = getTodayDiscountForProduct(product._id);
    const todayDiscountPrice = Number(todayDiscount?.discountPrice || 0);

    if (todayDiscountPrice > 0 && todayDiscountPrice < price) return price;

    if (productDiscountPrice > 0 && productDiscountPrice < price) {
      if (price > productDiscountPrice) return price;
      if (writtenPrice > productDiscountPrice) return writtenPrice;
      return productDiscountPrice;
    }

    if (price > 0) return price;
    if (writtenPrice > 0) return writtenPrice;
    return effectivePrice;
  };

  const getProductDiscount = (product) => {
    const original = getProductOriginalPrice(product);
    const effective = getProductPrice(product);
    if (original > effective && effective > 0) return original - effective;
    return 0;
  };

  // ======================================================
  // FETCH ACTIVE TODAY DISCOUNTS
  // ======================================================

  const fetchTodayDiscounts = async () => {
    try {
      const response = await API.get("/today-discounts/active");
      const data = response?.data;
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setTodayDiscounts(list);
      return list;
    } catch (err) {
      console.error("Fetch today-discounts error:", err);
      setTodayDiscounts([]);
      return [];
    }
  };

  // ======================================================
  // GET CART
  // ======================================================

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setCart({ items: [] });
        return;
      }

      await fetchTodayDiscounts();

      const response = await API.get("/cart");

      if (response.data?.success) {
        setCart(response.data.cart);
      } else {
        setError(response.data?.message || "Failed to load cart.");
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
      setError(error.response?.data?.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================================================
  // AUTO-OPEN CHECKOUT POPUP (SSO)
  // ======================================================

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const shouldOpen =
        params.get("openCheckout") === "1" ||
        params.get("openCheckout") === "true";

      if (!shouldOpen) return;
      if (loading || !cart?.items?.length) return;

      setShowCheckout(true);

      params.delete("openCheckout");
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname +
        (newSearch ? `?${newSearch}` : "") +
        window.location.hash;

      window.history.replaceState({}, "", newUrl);
    } catch (err) {
      console.error("Auto-open checkout error:", err);
    }
  }, [loading, cart]);

  // ======================================================
  // FETCH ADDRESSES
  // ======================================================

  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setAddresses([]);
        return;
      }

      const response = await API.get("/delivery-address");

      const list =
        response.data?.addresses ||
        response.data?.data ||
        response.data?.deliveryAddresses ||
        (Array.isArray(response.data) ? response.data : []);

      setAddresses(list);

      if (list.length > 0 && !selectedAddressId) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (showCheckout) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckout]);

  // ======================================================
  // FETCH WALLET + POINTS
  // ======================================================

  const fetchWalletAndPoints = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [walletRes, pointsRes] = await Promise.all([
        API.get("/wallet"),
        API.get("/points"),
      ]);

      setWalletBalance(walletRes.data?.wallet?.balance || 0);
      setPointsAvailable(pointsRes.data?.points?.availablePoints || 0);
    } catch (err) {
      console.error("Fetch wallet/points error:", err);
    }
  };

  useEffect(() => {
    if (showCheckout) {
      fetchWalletAndPoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckout]);

  // ======================================================
  // CHECKOUT PREVIEW
  // ======================================================

  useEffect(() => {
    if (!showCheckout || !cart?.items?.length) return;

    const runPreview = async () => {
      try {
        setPreviewLoading(true);

        const { data } = await API.post("/checkout/preview", {
          items: cart.items.map((i) => ({
            productId: i.product._id,
            price: getProductPrice(i.product),
            quantity: Number(i.quantity || 0),
          })),
          useWallet,
          usePoints,
        });

        if (data.success) {
          setCheckoutPreview(data);
        }
      } catch (err) {
        console.error("Checkout preview error:", err);
      } finally {
        setPreviewLoading(false);
      }
    };

    runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckout, useWallet, usePoints, cart]);

  // ======================================================
  // ADDRESS FORM HELPERS
  // ======================================================

  const resetAddressForm = () => {
    setAddressForm({
      name: "",
      mobile: "",
      address: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      addressType: "Home",
      isDefault: false,
    });
    setEditingAddressId(null);
  };

  const handleAddressFieldChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddAddressForm = () => {
    resetAddressForm();
    setIsAddressFormOpen(true);
  };

  const openEditAddressForm = (addr) => {
    setAddressForm({
      name: addr.name || "",
      mobile: addr.mobile || "",
      address: addr.address || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      country: addr.country || "India",
      pincode: addr.pincode || "",
      addressType: addr.addressType || "Home",
      isDefault: Boolean(addr.isDefault),
    });
    setEditingAddressId(addr._id);
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      if (
        !addressForm.name.trim() ||
        !addressForm.mobile.trim() ||
        !addressForm.address.trim() ||
        !addressForm.city.trim() ||
        !addressForm.state.trim() ||
        !addressForm.pincode.trim()
      ) {
        alert("Please fill all required fields.");
        return;
      }

      setAddressSaving(true);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to manage addresses.");
        return;
      }

      const payload = {
        name: addressForm.name.trim(),
        mobile: addressForm.mobile.trim(),
        address: addressForm.address.trim(),
        landmark: addressForm.landmark?.trim() || "",
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        country: addressForm.country?.trim() || "India",
        pincode: addressForm.pincode.trim(),
        addressType: addressForm.addressType || "Home",
        isDefault: Boolean(addressForm.isDefault),
      };

      let response;

      if (editingAddressId) {
        response = await API.put(
          `/delivery-address/${editingAddressId}`,
          payload,
        );
      } else {
        response = await API.post("/delivery-address", payload);
      }

      const ok =
        response.data?.success !== false &&
        (response.status === 200 || response.status === 201);

      if (!ok) {
        throw new Error(response.data?.message || "Failed to save address.");
      }

      await fetchAddresses();

      if (!editingAddressId) {
        const newId =
          response.data?.address?._id ||
          response.data?.data?._id ||
          response.data?._id;
        if (newId) setSelectedAddressId(newId);
      }

      setIsAddressFormOpen(false);
      resetAddressForm();
    } catch (err) {
      console.error("Save address error:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to save address.",
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await API.delete(`/delivery-address/${id}`);

      setAddresses((prev) => prev.filter((a) => a._id !== id));

      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.error("Delete address error:", err);
      alert(err.response?.data?.message || "Failed to delete address.");
    }
  };

  // ======================================================
  // CART MUTATIONS
  // ======================================================

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingProduct(productId);
      const response = await API.put(`/cart/update/${productId}`, {
        quantity,
      });

      if (response.data?.success) {
        setCart(response.data.cart);
      } else {
        alert(response.data?.message || "Failed to update quantity.");
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      alert(error.response?.data?.message || "Failed to update quantity.");
    } finally {
      setUpdatingProduct(null);
    }
  };

  const removeProduct = async (productId) => {
    try {
      setUpdatingProduct(productId);
      const response = await API.delete(`/cart/remove/${productId}`);

      if (response.data?.success) {
        setCart(response.data.cart);
      } else {
        alert(response.data?.message || "Failed to remove product.");
      }
    } catch (error) {
      console.error("Remove product error:", error);
      alert(error.response?.data?.message || "Failed to remove product.");
    } finally {
      setUpdatingProduct(null);
    }
  };

  const clearCart = async () => {
    if (!cart?.items?.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?",
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await API.delete("/cart/clear");

      if (response.data?.success) {
        setCart(response.data.cart || { items: [] });
      } else {
        alert(response.data?.message || "Failed to clear cart.");
      }
    } catch (error) {
      console.error("Clear cart error:", error);
      alert(error.response?.data?.message || "Failed to clear cart.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // TOTAL HELPERS
  // ======================================================

  const getSubtotal = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((total, item) => {
      const price = getProductPrice(item.product);
      return total + price * Number(item.quantity || 0);
    }, 0);
  };

  const getTotalItems = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    );
  };

  const getTotalSavings = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((total, item) => {
      const perUnit = getProductDiscount(item.product);
      return total + perUnit * Number(item.quantity || 0);
    }, 0);
  };

  // Delivery based on subtotal (matches backend rule)
  const getDeliveryCharge = (subtotal) =>
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

  // ======================================================
  // CONFIRM ORDER
  // ======================================================

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    if (placingOrder) return;
    setPlacingOrder(true);

    try {
      const payload = {
        addressId: selectedAddressId,
        items: cart.items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        useWallet,
        usePoints,
        paymentMethod, // "razorpay" or "cod"
      };

      const { data } = await API.post("/orders/place", payload);

      if (!data.success) {
        alert(data.message || "Failed to place order.");
        return;
      }

      const order = data.order;

      // -------- COD or fully covered by wallet+points --------
      if (!data.requiresPayment) {
        alert(
          paymentMethod === "cod"
            ? "COD order placed successfully!"
            : "Order placed successfully!",
        );
        setShowCheckout(false);
        fetchCart();
        return;
      }

      // -------- Razorpay checkout --------
      const options = {
        key: data.razorpay.key,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: data.razorpay.name,
        description: data.razorpay.description,
        order_id: data.razorpay.orderId,
        prefill: data.razorpay.prefill,
        theme: { color: "#0f2e2a" },

        handler: async (response) => {
          try {
            const verify = await API.post("/orders/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verify.data.success) {
              alert("Payment successful! Order confirmed.");
              setShowCheckout(false);
              fetchCart();
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification error.");
          }
        },

        modal: {
          ondismiss: async () => {
            try {
              await API.post(`/orders/${order._id}/abandon`);
            } catch (err) {
              console.error("Abandon error:", err);
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async () => {
        try {
          await API.post(`/orders/${order._id}/abandon`);
        } catch (err) {
          console.error("Abandon error:", err);
        }
      });

      rzp.open();
    } catch (err) {
      console.error("Place order error:", err);
      alert(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ======================================================
  // LOADING / ERROR / EMPTY
  // ======================================================

  if (loading) {
    return (
      <div className="Cart">
        <div className="Cart-loading">
          <div className="Cart-loader"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Cart">
        <div className="Cart-error">
          <MdShoppingCart />
          <h3>Unable to load cart</h3>
          <p>{error}</p>
          <button onClick={fetchCart}>Try Again</button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (!items.length) {
    return (
      <div className="Cart">
        <div className="Cart-empty">
          <div className="Cart-empty-icon">
            <MdShoppingCart />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any products to your cart yet.</p>
          <button onClick={() => window.history.back()}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalSavings = getTotalSavings();
  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge(subtotal);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="Cart">
      <div className="Cart-header">
        <div>
          <h1>Shopping Cart</h1>
          <p>
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <button className="Cart-clear" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="Cart-content">
        {/* CART ITEMS */}
        <div className="Cart-items">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const price = getProductPrice(product);
            const originalPrice = getProductOriginalPrice(product);
            const unitLabel = getProductUnit(product);
            const hasDiscount = originalPrice > price && price > 0;
            const itemTotal = price * Number(item.quantity || 0);
            const isUpdating = updatingProduct === product._id;
            const isTodayDiscount = Boolean(
              getTodayDiscountForProduct(product._id),
            );

            return (
              <div className="Cart-item" key={product._id}>
                <div className="Cart-item-image">
                  {getProductImage(product) ? (
                    <img
                      src={getProductImage(product)}
                      alt={product.productName}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <MdShoppingCart />
                  )}
                </div>

                <div className="Cart-item-info">
                  <h3>{product.productName}</h3>

                  {product.sku && (
                    <p className="Cart-item-sku">SKU: {product.sku}</p>
                  )}

                  {unitLabel && <p className="Cart-item-unit">{unitLabel}</p>}

                  <div className="Cart-item-price-row">
                    <p className="Cart-item-price">₹{price.toFixed(2)}</p>

                    {hasDiscount && (
                      <>
                        <span className="Cart-item-original-price">
                          ₹{originalPrice.toFixed(2)}
                        </span>
                        <span className="Cart-item-discount-badge">
                          SAVE ₹{(originalPrice - price).toFixed(2)}
                        </span>
                      </>
                    )}

                    {isTodayDiscount && hasDiscount && (
                      <span className="Cart-item-today-badge">
                        TODAY DISCOUNT
                      </span>
                    )}
                  </div>
                </div>

                <div className="Cart-item-quantity">
                  <button
                    type="button"
                    disabled={isUpdating || Number(item.quantity) <= 1}
                    onClick={() =>
                      updateQuantity(product._id, Number(item.quantity) - 1)
                    }
                  >
                    <MdRemove />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    disabled={
                      isUpdating ||
                      Number(item.quantity) >=
                        Number(product.stockQuantity || 0)
                    }
                    onClick={() =>
                      updateQuantity(product._id, Number(item.quantity) + 1)
                    }
                  >
                    <MdAdd />
                  </button>
                </div>

                <div className="Cart-item-total">₹{itemTotal.toFixed(2)}</div>

                <button
                  type="button"
                  className="Cart-item-remove"
                  disabled={isUpdating}
                  onClick={() => removeProduct(product._id)}
                >
                  <MdDelete />
                </button>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="Cart-summary">
          <h2>Order Summary</h2>

          <div className="Cart-summary-row">
            <span>Items</span>
            <span>{getTotalItems()}</span>
          </div>

          <div className="Cart-summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {totalSavings > 0 && (
            <div className="Cart-summary-row Cart-summary-row--savings">
              <span>You Save</span>
              <span>− ₹{totalSavings.toFixed(2)}</span>
            </div>
          )}

          <div className="Cart-summary-row">
            <span>Delivery</span>
            <span>
              {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}
            </span>
          </div>

          <div className="Cart-summary-divider"></div>

          <div className="Cart-summary-total">
            <span>Total</span>
            <strong>₹{(subtotal + deliveryCharge).toFixed(2)}</strong>
          </div>

          <button
            className="Cart-checkout"
            onClick={() => setShowCheckout(true)}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* ==================================================
          CHECKOUT POPUP
      ================================================== */}

      {showCheckout && (
        <div
          className="Checkout-overlay"
          onClick={() => setShowCheckout(false)}
        >
          <div className="Checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="Checkout-modal-header">
              <h2>Order Details</h2>
              <button
                className="Checkout-close"
                onClick={() => setShowCheckout(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="Checkout-modal-body">
              {/* ADDRESS */}
              <div className="Checkout-address-section">
                <div className="Checkout-address-header">
                  <h3>
                    <MdLocationOn /> Delivery Address
                  </h3>

                  {!isAddressFormOpen && (
                    <button
                      type="button"
                      className="Checkout-address-add-btn"
                      onClick={openAddAddressForm}
                    >
                      <MdAdd /> Add New
                    </button>
                  )}
                </div>

                {addressesLoading && (
                  <p className="Checkout-address-empty">
                    Loading addresses...
                  </p>
                )}

                {!addressesLoading && addresses.length === 0 && (
                  <p className="Checkout-address-empty">
                    No saved addresses. Please add one to continue.
                  </p>
                )}

                {!addressesLoading && addresses.length > 0 && (
                  <div className="Checkout-address-list">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;

                      return (
                        <div
                          key={addr._id}
                          className={`Checkout-address-card ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => setSelectedAddressId(addr._id)}
                        >
                          <div className="Checkout-address-radio">
                            <span
                              className={`Checkout-radio-dot ${
                                isSelected ? "on" : ""
                              }`}
                            />
                          </div>

                          <div className="Checkout-address-info">
                            <div className="Checkout-address-name-row">
                              <strong>{addr.name}</strong>
                              {addr.addressType && (
                                <span className="Checkout-address-type">
                                  {addr.addressType}
                                </span>
                              )}
                              {addr.isDefault && (
                                <span className="Checkout-address-default">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="Checkout-address-line">
                              {[addr.address, addr.landmark]
                                .filter(Boolean)
                                .join(", ")}
                            </p>

                            <p className="Checkout-address-line">
                              {[addr.city, addr.state, addr.pincode]
                                .filter(Boolean)
                                .join(", ")}
                            </p>

                            {addr.mobile && (
                              <p className="Checkout-address-phone">
                                📞 {addr.mobile}
                              </p>
                            )}
                          </div>

                          <div className="Checkout-address-actions">
                            <button
                              type="button"
                              className="Checkout-address-icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditAddressForm(addr);
                              }}
                              aria-label="Edit address"
                            >
                              <MdEdit />
                            </button>

                            <button
                              type="button"
                              className="Checkout-address-icon-btn danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              aria-label="Delete address"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isAddressFormOpen && (
                  <div className="Checkout-address-form">
                    <div className="Checkout-address-form-grid">
                      <input
                        type="text"
                        placeholder="Receiver Name *"
                        value={addressForm.name}
                        onChange={(e) =>
                          handleAddressFieldChange("name", e.target.value)
                        }
                      />
                      <input
                        type="tel"
                        placeholder="Mobile Number *"
                        value={addressForm.mobile}
                        onChange={(e) =>
                          handleAddressFieldChange("mobile", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Address *"
                        value={addressForm.address}
                        onChange={(e) =>
                          handleAddressFieldChange("address", e.target.value)
                        }
                        className="full-width"
                      />
                      <input
                        type="text"
                        placeholder="Landmark (optional)"
                        value={addressForm.landmark}
                        onChange={(e) =>
                          handleAddressFieldChange("landmark", e.target.value)
                        }
                        className="full-width"
                      />
                      <input
                        type="text"
                        placeholder="City *"
                        value={addressForm.city}
                        onChange={(e) =>
                          handleAddressFieldChange("city", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={addressForm.state}
                        onChange={(e) =>
                          handleAddressFieldChange("state", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Pincode *"
                        value={addressForm.pincode}
                        onChange={(e) =>
                          handleAddressFieldChange("pincode", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) =>
                          handleAddressFieldChange("country", e.target.value)
                        }
                      />
                      <select
                        value={addressForm.addressType}
                        onChange={(e) =>
                          handleAddressFieldChange(
                            "addressType",
                            e.target.value,
                          )
                        }
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>

                      <label className="Checkout-address-default-toggle">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            handleAddressFieldChange(
                              "isDefault",
                              e.target.checked,
                            )
                          }
                        />
                        Set as default
                      </label>
                    </div>

                    <div className="Checkout-address-form-actions">
                      <button
                        type="button"
                        className="Checkout-address-cancel"
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          resetAddressForm();
                        }}
                        disabled={addressSaving}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="Checkout-address-save"
                        onClick={handleSaveAddress}
                        disabled={addressSaving}
                      >
                        <MdCheck />
                        {addressSaving
                          ? "Saving..."
                          : editingAddressId
                            ? "Update Address"
                            : "Save Address"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEMS */}
              <div className="Checkout-items-section">
                <h3>Items</h3>

                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const price = getProductPrice(product);
                  const originalPrice = getProductOriginalPrice(product);
                  const unitLabel = getProductUnit(product);
                  const hasDiscount = originalPrice > price && price > 0;
                  const quantity = Number(item.quantity || 0);
                  const itemTotal = price * quantity;
                  const isTodayDiscount = Boolean(
                    getTodayDiscountForProduct(product._id),
                  );

                  return (
                    <div className="Checkout-item" key={product._id}>
                      <div className="Checkout-item-image">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.productName}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <MdShoppingCart />
                        )}
                      </div>

                      <div className="Checkout-item-details">
                        <h4>{product.productName}</h4>

                        {unitLabel && (
                          <p className="Checkout-item-unit">{unitLabel}</p>
                        )}

                        {product.sku && (
                          <p className="Checkout-item-sku">
                            SKU: {product.sku}
                          </p>
                        )}

                        <div className="Checkout-item-price-row">
                          <span className="Checkout-item-price">
                            ₹{price.toFixed(2)} × {quantity}
                          </span>

                          {hasDiscount && (
                            <>
                              <span className="Checkout-item-original">
                                ₹{originalPrice.toFixed(2)}
                              </span>
                              <span className="Checkout-item-discount">
                                SAVE ₹{(originalPrice - price).toFixed(2)}
                              </span>
                            </>
                          )}

                          {isTodayDiscount && hasDiscount && (
                            <span className="Checkout-item-today-badge">
                              TODAY DISCOUNT
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="Checkout-item-total">
                        ₹{itemTotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ============================================
                  PAYMENT METHOD
              ============================================ */}

              <div className="Checkout-payment-section">
                <h3>Payment Method</h3>

                <div className="Checkout-payment-options">
                  <label
                    className={`Checkout-payment-option ${
                      paymentMethod === "razorpay" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                    />
                    <div className="Checkout-payment-info">
                      <strong>Pay Online</strong>
                      <small>UPI, Credit / Debit Card, Net Banking</small>
                    </div>
                  </label>

                  <label
                    className={`Checkout-payment-option ${
                      paymentMethod === "cod" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div className="Checkout-payment-info">
                      <strong>Cash on Delivery</strong>
                      <small>Pay when your order arrives</small>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ============================================
                FOOTER
            ============================================ */}

            <div className="Checkout-modal-footer">
              <div className="Checkout-summary-row">
                <span>Total Items</span>
                <span>{getTotalItems()}</span>
              </div>

              <div className="Checkout-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="Checkout-summary-row Checkout-summary-row--savings">
                  <span>You Save</span>
                  <span>− ₹{totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="Checkout-summary-row">
                <span>Delivery</span>
                <span>
                  {deliveryCharge === 0
                    ? "FREE"
                    : `₹${deliveryCharge.toFixed(2)}`}
                </span>
              </div>

              {/* WALLET TOGGLE */}
              {walletBalance > 0 && (
                <label className="Checkout-toggle-row">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                  />

                  <span className="Checkout-toggle-label">
                    Use Wallet Balance
                    <small>₹{walletBalance.toFixed(2)} available</small>
                  </span>

                  <span className="Checkout-toggle-value">
                    − ₹{(checkoutPreview?.walletUsed || 0).toFixed(2)}
                  </span>
                </label>
              )}

              {/* POINTS TOGGLE */}
              {pointsAvailable > 0 && (
                <label className="Checkout-toggle-row">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                  />

                  <span className="Checkout-toggle-label">
                    Use Reward Points
                    <small>{pointsAvailable} pts available</small>
                  </span>

                  <span className="Checkout-toggle-value">
                    − ₹{(checkoutPreview?.pointsValue || 0).toFixed(2)}
                  </span>
                </label>
              )}

              <div className="Checkout-summary-divider"></div>

              <div className="Checkout-summary-total">
                <span>Grand Total</span>
                <strong>
                  ₹
                  {(
                    checkoutPreview?.grandTotal ??
                    subtotal + deliveryCharge
                  ).toFixed(2)}
                </strong>
              </div>

              {previewLoading && (
                <p className="Checkout-preview-loading">Calculating…</p>
              )}

              <button
                className="Checkout-confirm"
                onClick={handleConfirmOrder}
                disabled={!selectedAddressId || placingOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : !selectedAddressId
                    ? "Select an Address"
                    : paymentMethod === "cod"
                      ? "Place COD Order"
                      : "Pay & Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
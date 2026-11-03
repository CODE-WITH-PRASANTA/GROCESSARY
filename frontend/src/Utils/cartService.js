import API, { BASE_URL } from "../api/axios";

export const GUEST_CART_KEY = "guestCart";
export const STANDARD_DELIVERY_FEE = 0;

// =========================================================
// HELPER: Resolve Product Image
// =========================================================
export const resolveImage = (path) => {
  if (!path) return "";
  if (typeof path === "object") {
    path = path?.url || path?.path || path?.secure_url || path?.src || "";
  }
  const str = String(path).trim();
  if (!str) return "";
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
};

// =========================================================
// HELPER: Check Login Token
// =========================================================
export const isLoggedIn = () => {
  try {
    return Boolean(localStorage.getItem("token"));
  } catch {
    return false;
  }
};

// =========================================================
// GUEST CART HELPERS
// =========================================================
export const getGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading guest cart:", error);
    return [];
  }
};

export const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    const summary = calculateCartSummary(cart);
    window.dispatchEvent(
      new CustomEvent("cartUpdated", {
        detail: {
          items: cart,
          itemCount: summary.itemCount,
          total: summary.grandTotal,
        },
      })
    );
  } catch (error) {
    console.error("Error saving guest cart:", error);
  }
};

// =========================================================
// NORMALIZE CART ITEM
// =========================================================
export const normalizeCartItem = (rawItem) => {
  if (!rawItem) return null;

  const prod =
    rawItem.product && typeof rawItem.product === "object"
      ? rawItem.product
      : rawItem;
  const productId = String(prod._id || prod.id || rawItem.productId || "");
  if (!productId) return null;

  const quantity = Math.max(1, Number(rawItem.quantity || 1));

  let rawImg = "";
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    rawImg = prod.images[0];
  } else {
    rawImg = prod.image || prod.thumbnail || "";
  }

  const price = Number(prod.price || prod.discountPrice || 0);
  const originalPrice = Number(prod.writtenPrice || prod.originalPrice || price);
  const discount =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : Number(prod.discount || 0);

  const unitLabel =
    typeof prod.unit === "object"
      ? prod.unit?.name || prod.unit?.symbol || "1 unit"
      : prod.unit || "1 unit";

  return {
    id: productId,
    productId,
    name: prod.productName || prod.name || "Grocery Item",
    price,
    originalPrice,
    discount,
    image: resolveImage(rawImg),
    category:
      typeof prod.category === "object"
        ? prod.category?.name || "General"
        : prod.category || "General",
    unit: unitLabel,
    stockQuantity: Number(prod.stockQuantity ?? 50),
    quantity,
    slug: prod.slug || "",
    totalPrice: price * quantity,
  };
};

// =========================================================
// CALCULATE CART SUMMARY
// =========================================================
export const calculateCartSummary = (items, appliedCoupon = null) => {
  const normalized = (items || []).map(normalizeCartItem).filter(Boolean);

  const itemCount = normalized.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = normalized.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );

  const itemsTotal = normalized.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const productSavings = Math.max(0, subtotal - itemsTotal);
  const deliveryFee = 0;

  let couponDiscount = 0;
  if (appliedCoupon && itemsTotal > 0) {
    if (appliedCoupon.discountAmount !== undefined) {
      couponDiscount = Number(appliedCoupon.discountAmount);
    } else if (
      appliedCoupon.discountType === "percentage" ||
      appliedCoupon.type === "percentage"
    ) {
      const val = Number(
        appliedCoupon.discountValue || appliedCoupon.value || 0
      );
      couponDiscount = Math.round((itemsTotal * val) / 100);
      if (appliedCoupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscount);
      }
    } else {
      couponDiscount = Number(
        appliedCoupon.discountValue || appliedCoupon.value || 0
      );
    }
    couponDiscount = Math.min(couponDiscount, itemsTotal);
  }

  const grandTotal = Math.max(0, itemsTotal - couponDiscount);
  const totalSavings = productSavings + couponDiscount;

  return {
    itemCount,
    subtotal,
    itemsTotal,
    productSavings,
    deliveryFee,
    couponDiscount,
    grandTotal,
    totalSavings,
  };
};

// =========================================================
// FETCH CART (BACKEND OR GUEST)
// =========================================================
export const fetchCart = async () => {
  if (isLoggedIn()) {
    try {
      const response = await API.get("/cart");
      const cartData =
        response.data?.cart || response.data?.data?.cart || response.data;
      const rawItems = cartData?.items || [];
      const items = rawItems.map(normalizeCartItem).filter(Boolean);

      try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      } catch {}

      const summary = calculateCartSummary(items);
      return { items, summary };
    } catch (error) {
      console.warn("Backend cart fetch failed, using local cart:", error);
      const local = getGuestCart().map(normalizeCartItem).filter(Boolean);
      return { items: local, summary: calculateCartSummary(local) };
    }
  }

  const local = getGuestCart().map(normalizeCartItem).filter(Boolean);
  return { items: local, summary: calculateCartSummary(local) };
};

// =========================================================
// ADD TO CART
// =========================================================
export const addToCart = async (product, quantity = 1) => {
  const normalized = normalizeCartItem({ ...product, quantity });
  if (!normalized) return { success: false, message: "Invalid product" };

  const pid = normalized.productId;
  const qty = Math.max(1, Number(quantity || 1));

  let localCart = getGuestCart();
  const existingIndex = localCart.findIndex(
    (i) => String(i.productId || i.id) === pid
  );

  if (existingIndex > -1) {
    localCart[existingIndex].quantity =
      Number(localCart[existingIndex].quantity || 0) + qty;
  } else {
    localCart.push({ ...normalized, quantity: qty });
  }

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(localCart));

  if (isLoggedIn()) {
    try {
      await API.post("/cart/add", { productId: pid, quantity: qty });
    } catch (error) {
      console.error("Backend add to cart error:", error);
    }
  }

  // Dispatch after backend has been updated
  const summary = calculateCartSummary(localCart);
  window.dispatchEvent(
    new CustomEvent("cartUpdated", {
      detail: {
        items: localCart,
        itemCount: summary.itemCount,
        total: summary.grandTotal,
        productId: pid,
      },
    })
  );

  return { success: true, message: "Added to cart" };
};

// =========================================================
// UPDATE QUANTITY
// =========================================================
export const updateCartQuantity = async (productId, quantity) => {
  const pid = String(productId);
  const qty = Math.max(1, Number(quantity));

  let localCart = getGuestCart();
  const item = localCart.find((i) => String(i.productId || i.id) === pid);
  if (item) {
    item.quantity = qty;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(localCart));
  }

  if (isLoggedIn()) {
    try {
      await API.put(`/cart/update/${pid}`, { quantity: qty });
    } catch (error) {
      console.error("Backend update quantity error:", error);
    }
  }

  // Dispatch event AFTER backend update finishes so listeners get accurate data
  const summary = calculateCartSummary(localCart);
  window.dispatchEvent(
    new CustomEvent("cartUpdated", {
      detail: {
        items: localCart,
        itemCount: summary.itemCount,
        total: summary.grandTotal,
        productId: pid,
      },
    })
  );

  return { success: true };
};

// =========================================================
// REMOVE FROM CART
// =========================================================
export const removeFromCart = async (productId) => {
  const pid = String(productId);

  let localCart = getGuestCart().filter(
    (i) => String(i.productId || i.id) !== pid
  );
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(localCart));

  if (isLoggedIn()) {
    try {
      await API.delete(`/cart/remove/${pid}`);
    } catch (error) {
      console.error("Backend remove from cart error:", error);
    }
  }

  const summary = calculateCartSummary(localCart);
  window.dispatchEvent(
    new CustomEvent("cartUpdated", {
      detail: {
        items: localCart,
        itemCount: summary.itemCount,
        total: summary.grandTotal,
        productId: pid,
      },
    })
  );

  return { success: true };
};

// =========================================================
// CLEAR CART
// =========================================================
export const clearCart = async () => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify([]));

  if (isLoggedIn()) {
    try {
      await API.delete("/cart/clear");
    } catch (error) {
      console.error("Backend clear cart error:", error);
    }
  }

  window.dispatchEvent(
    new CustomEvent("cartUpdated", {
      detail: {
        items: [],
        itemCount: 0,
        total: 0,
      },
    })
  );

  return { success: true };
};

// =========================================================
// SYNC GUEST CART ON LOGIN
// =========================================================
export const syncGuestCartOnLogin = async () => {
  if (!isLoggedIn()) return;
  const localCart = getGuestCart();
  if (localCart.length === 0) return;

  try {
    for (const item of localCart) {
      const pid = item.productId || item.id;
      const qty = item.quantity || 1;
      if (pid) {
        await API.post("/cart/add", { productId: pid, quantity: qty }).catch(
          () => {}
        );
      }
    }
  } catch (error) {
    console.error("Error syncing guest cart on login:", error);
  }
};

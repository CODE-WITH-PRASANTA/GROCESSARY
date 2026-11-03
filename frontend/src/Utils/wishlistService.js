import API, { BASE_URL } from "../api/axios";

export const GUEST_WISHLIST_KEY = "guestWishlist";

// =========================================================
// HELPER: Resolve Image
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
// GUEST WISHLIST (LOCAL STORAGE)
// =========================================================
export const getGuestWishlist = () => {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Error reading guest wishlist:", error);
    return [];
  }
};

export const saveGuestWishlist = (list) => {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent("wishlistUpdated", {
        detail: { count: list.length, items: list },
      })
    );
  } catch (error) {
    console.error("Error saving guest wishlist:", error);
  }
};

// =========================================================
// NORMALIZE PRODUCT PAYLOAD
// =========================================================
export const normalizeWishlistProduct = (p) => {
  if (!p) return null;
  const id = String(p._id || p.id || p.productId || "");
  if (!id) return null;

  let rawImg = "";
  if (Array.isArray(p.images) && p.images.length > 0) {
    rawImg = p.images[0];
  } else {
    rawImg = p.image || p.thumbnail || "";
  }

  const price = Number(p.price || 0);
  const oldPrice = Number(p.writtenPrice || p.oldPrice || price);
  const discount =
    oldPrice > price && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : Number(p.discount || 0);

  const unitLabel =
    typeof p.unit === "object"
      ? p.unit?.name || p.unit?.symbol || "1 unit"
      : p.unit || "1 unit";

  return {
    _id: id,
    id,
    productId: id,
    name: p.productName || p.name || "Grocery Item",
    price,
    oldPrice,
    discount,
    image: resolveImage(rawImg),
    category:
      typeof p.category === "object"
        ? p.category?.name || "General"
        : p.category || "General",
    unit: unitLabel,
    stockQuantity: Number(p.stockQuantity ?? 10),
    slug: p.slug || "",
  };
};

// =========================================================
// GET ALL WISHLIST ITEMS (BACKEND OR GUEST)
// =========================================================
export const fetchWishlistItems = async () => {
  if (isLoggedIn()) {
    try {
      const response = await API.get("/wishlist");
      const list = response.data?.wishlist || response.data?.data || [];
      const items = list
        .map((entry) => {
          if (!entry) return null;
          const prod = entry.product || entry;
          return normalizeWishlistProduct(prod);
        })
        .filter(Boolean);

      // Keep guestWishlist mirrored as cache
      try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
      } catch {}

      return items;
    } catch (error) {
      console.warn("Backend wishlist fetch error, falling back to local:", error);
      return getGuestWishlist();
    }
  }

  return getGuestWishlist();
};

// =========================================================
// GET WISHLIST COUNT
// =========================================================
export const getWishlistCount = async () => {
  try {
    const items = await fetchWishlistItems();
    return items.length;
  } catch {
    return getGuestWishlist().length;
  }
};

// =========================================================
// CHECK IF PRODUCT IS WISHLISTED
// =========================================================
export const isProductWishlisted = (productId, wishlistItems = null) => {
  if (!productId) return false;
  const targetId = String(productId);
  const list = wishlistItems || getGuestWishlist();
  return list.some((i) => String(i.productId || i.id || i._id) === targetId);
};

// =========================================================
// ADD TO WISHLIST
// =========================================================
export const addToWishlist = async (product) => {
  const normalized = normalizeWishlistProduct(product);
  if (!normalized) return { success: false, message: "Invalid product" };

  const id = normalized.id;

  // Update local storage first for snappy UI
  let localList = getGuestWishlist();
  if (!localList.some((i) => String(i.id || i.productId) === id)) {
    localList.unshift(normalized);
    saveGuestWishlist(localList);
  }

  if (isLoggedIn()) {
    try {
      await API.post(`/wishlist/${id}`, { productId: id });
    } catch (error) {
      // 409 Conflict means already added, which is fine
      if (error?.response?.status !== 409) {
        console.error("Backend add wishlist error:", error);
      }
    }
  }

  window.dispatchEvent(
    new CustomEvent("wishlistUpdated", {
      detail: { count: localList.length, addedId: id },
    })
  );

  return {
    success: true,
    isWishlisted: true,
    message: "Added to wishlist",
    item: normalized,
  };
};

// =========================================================
// REMOVE FROM WISHLIST
// =========================================================
export const removeFromWishlist = async (productId) => {
  if (!productId) return { success: false, message: "Product ID required" };
  const targetId = String(productId);

  let localList = getGuestWishlist().filter(
    (i) => String(i.id || i.productId || i._id) !== targetId
  );
  saveGuestWishlist(localList);

  if (isLoggedIn()) {
    try {
      await API.delete(`/wishlist/${targetId}`);
    } catch (error) {
      console.error("Backend remove wishlist error:", error);
    }
  }

  window.dispatchEvent(
    new CustomEvent("wishlistUpdated", {
      detail: { count: localList.length, removedId: targetId },
    })
  );

  return {
    success: true,
    isWishlisted: false,
    message: "Removed from wishlist",
  };
};

// =========================================================
// TOGGLE WISHLIST
// =========================================================
export const toggleWishlist = async (product) => {
  const normalized = normalizeWishlistProduct(product);
  if (!normalized) return { success: false };

  const id = normalized.id;
  const currentlyWishlisted = isProductWishlisted(id);

  if (currentlyWishlisted) {
    return await removeFromWishlist(id);
  } else {
    return await addToWishlist(normalized);
  }
};

// =========================================================
// CLEAR ALL WISHLIST
// =========================================================
export const clearWishlist = async () => {
  saveGuestWishlist([]);

  if (isLoggedIn()) {
    try {
      await API.delete("/wishlist/clear");
    } catch (error) {
      console.error("Backend clear wishlist error:", error);
    }
  }

  window.dispatchEvent(
    new CustomEvent("wishlistUpdated", {
      detail: { count: 0, cleared: true },
    })
  );

  return { success: true, message: "Wishlist cleared" };
};

// =========================================================
// SYNC GUEST WISHLIST ON LOGIN
// =========================================================
export const syncGuestWishlistOnLogin = async () => {
  if (!isLoggedIn()) return;
  const localList = getGuestWishlist();
  if (localList.length === 0) return;

  try {
    for (const item of localList) {
      const pid = item.productId || item.id || item._id;
      if (pid) {
        await API.post(`/wishlist/${pid}`, { productId: pid }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Error syncing guest wishlist to backend:", error);
  }
};


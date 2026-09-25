import React, { useEffect, useState, useCallback } from "react";

import "./CartSection.css";

import avocadoImg from "../../assets/avocadoCart.webp";
import orangeImg from "../../assets/lemoncart.avif";
import grapeImg from "../../assets/garpecart.avif";
import mangoImg from "../../assets/mangocart.avif";

import { useNavigate } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import { useRef } from "react";

// ======================================================
// CONSTANTS
// ======================================================

const GUEST_CART_KEY = "guestCart";
const PROJECT2_URL = import.meta.env.VITE_PROJECT2_URL;

// ======================================================
// COMPONENT
// ======================================================

const CartSection = ({ isOpen: externalIsOpen, onClose, onOpen }) => {
  const navigate = useNavigate();

  // ======================================================
  // DRAWER STATE
  // ======================================================

  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // ======================================================
  // CHECKOUT POPUP STATE
  // ======================================================

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const mergeInProgressRef = useRef(false);
  const mergeCompletedRef = useRef(false);

  const isCartOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // ======================================================
  // CLOSE CART
  // ======================================================

  const handleCloseCart = () => {
    setInternalIsOpen(false);

    if (onClose) {
      onClose();
    }
  };

  const handleOpenCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCheckoutLoading(false);
        setInternalIsOpen(false);
        if (onClose) onClose();
        document.body.classList.remove("cart-is-open");
        alert("Please login to continue to checkout.");
        navigate("/login", { replace: true });
        return;
      }

      const { data } = await API.post("/auth/create-handoff");

      if (!data?.success) {
        throw new Error(data?.message || "Unable to open cart.");
      }

      const code = data?.code;

      if (!code) {
        throw new Error("Handoff code was not returned.");
      }

      setInternalIsOpen(false);

      if (onClose) {
        onClose();
      }

      window.location.href = `${PROJECT2_URL}/sso?code=${encodeURIComponent(
        code,
      )}&redirect=/cart`;
    } catch (error) {
      console.error("Open cart SSO error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to open cart.",
      );
    }
  };

  // ======================================================
  // CHECKOUT — SSO HANDOFF TO PROJECT 2 CART (POPUP AUTO-OPEN)
  // ======================================================

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to continue to checkout.");
        navigate("/login");
        return;
      }

      const { data } = await API.post("/auth/create-handoff");

      if (!data?.success) {
        throw new Error(data?.message || "Unable to continue to checkout.");
      }

      const code = data?.code;

      if (!code) {
        throw new Error("Handoff code was not returned.");
      }

      setInternalIsOpen(false);

      if (onClose) onClose();

      window.location.href = `${PROJECT2_URL}/sso?code=${encodeURIComponent(
        code,
      )}&redirect=/cart&openCheckout=1`;
    } catch (error) {
      console.error("Checkout SSO error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to continue to checkout.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ======================================================
  // CART STATE
  // ======================================================

  const [cartItems, setCartItems] = useState([]);

  const [cartLoading, setCartLoading] = useState(false);

  const [cartError, setCartError] = useState("");

  // ======================================================
  // TODAY DISCOUNTS
  // ======================================================

  const [todayDiscounts, setTodayDiscounts] = useState([]);

  // ======================================================
  // RECOMMENDATIONS
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
  // SAFE TEXT
  // ======================================================

  const getSafeText = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string") {
      const text = value.trim();

      return text || fallback;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (typeof value === "object") {
      const possibleValues = [
        value?.name,
        value?.label,
        value?.title,
        value?.unitName,
        value?.brandName,
        value?.categoryName,
        value?.value,
        value?.symbol,
      ];

      for (const possibleValue of possibleValues) {
        if (
          possibleValue !== null &&
          possibleValue !== undefined &&
          typeof possibleValue !== "object"
        ) {
          const text = String(possibleValue).trim();

          if (text) {
            return text;
          }
        }
      }

      return fallback;
    }

    return fallback;
  };

  // ======================================================
  // SAFE NUMBER
  // ======================================================

  const getSafeNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  };

  // ======================================================
  // TOKEN
  // ======================================================

  const getToken = () => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  // ======================================================
  // OBJECT ID
  // ======================================================

  const getObjectId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return value?._id || value?.id || value?.productId || "";
    }

    return "";
  };

  // ======================================================
  // PRODUCT ID
  // ======================================================

  const getProductId = (item) => {
    if (!item) {
      return null;
    }

    if (item?.productId) {
      return String(getObjectId(item.productId));
    }

    if (item?.product?._id) {
      return String(item.product._id);
    }

    if (item?._id) {
      return String(item._id);
    }

    if (item?.id) {
      return String(item.id);
    }

    return null;
  };

  // ======================================================
  // PRODUCT NAME
  // ======================================================

  const getProductName = (product = {}) => {
    const nestedProduct =
      product?.product && typeof product.product === "object"
        ? product.product
        : {};

    return getSafeText(
      product?.productName ||
        product?.name ||
        product?.title ||
        product?.productTitle ||
        product?.product_name ||
        product?.itemName ||
        product?.displayName ||
        nestedProduct?.productName ||
        nestedProduct?.name ||
        nestedProduct?.title ||
        nestedProduct?.productTitle ||
        nestedProduct?.product_name,
      "Product",
    );
  };

  // ======================================================
  // PRODUCT UNIT
  // ======================================================

  const getUnitName = (unit) => {
    if (!unit) {
      return "";
    }

    return getSafeText(unit, "");
  };

  // ======================================================
  // PRODUCT PRICE
  // ======================================================

  const getProductPrice = (product = {}) => {
    const productDiscountPrice = getSafeNumber(product?.discountPrice, 0);

    if (productDiscountPrice > 0) {
      return productDiscountPrice;
    }

    return getSafeNumber(product?.price ?? product?.sellingPrice ?? 0, 0);
  };

  // ======================================================
  // IMAGE URL
  // ======================================================

  const getImageUrl = (image) => {
    // ---- 1. Unwrap objects and arrays ----
    let value = image;

    if (Array.isArray(value)) {
      value = value[0];
    }

    if (value && typeof value === "object") {
      value =
        value.url ||
        value.path ||
        value.secure_url ||
        value.src ||
        value.image ||
        value.filename ||
        "";
    }

    if (typeof value !== "string") {
      return avocadoImg;
    }

    const str = value.trim();
    if (!str) return avocadoImg;

    // ---- 2. Already absolute (http, https, data, blob) ----
    if (/^(https?:|data:|blob:)/i.test(str)) {
      return str;
    }

    // ---- 3. Protocol-relative URL (//cdn.example.com/x.jpg) ----
    if (str.startsWith("//")) {
      return `https:${str}`;
    }

    // ---- 4. Relative path → prefix with backend origin ----
    const origin =
      BASE_URL || API.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    const path = str.startsWith("/") ? str : `/${str}`;
    return `${origin}${path}`;
  };

  // ======================================================
  // GUEST CART
  // ======================================================

  const getGuestCart = () => {
    try {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);

      if (!storedCart) {
        return [];
      }

      const parsedCart = JSON.parse(storedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart;
    } catch (error) {
      console.error("Guest cart parse error:", error);

      localStorage.removeItem(GUEST_CART_KEY);

      return [];
    }
  };

  // ======================================================
  // SAVE GUEST CART
  // ======================================================

  const saveGuestCart = (items) => {
    try {
      const safeItems = Array.isArray(items) ? items : [];

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(safeItems));

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Save guest cart error:", error);
    }
  };

  // ======================================================
  // GET TODAY DISCOUNT FOR PRODUCT
  // ======================================================

  const getTodayDiscountForProduct = (productId) => {
    if (!productId) {
      return null;
    }

    const targetId = String(productId);

    const discount = todayDiscounts.find((item) => {
      const discountProductId = getObjectId(item?.product);

      return String(discountProductId) === targetId;
    });

    return discount || null;
  };

  // ======================================================
  // APPLY TODAY DISCOUNT
  // ======================================================

  const applyTodayDiscountToItem = (item) => {
    if (!item) {
      return item;
    }

    const productId = getProductId(item);

    if (!productId) {
      return item;
    }

    const discount = getTodayDiscountForProduct(productId);

    if (!discount) {
      const fallbackOriginalPrice = getSafeNumber(item?.originalPrice, 0);

      const currentPrice = getSafeNumber(item?.price, 0);

      return {
        ...item,

        price: fallbackOriginalPrice > 0 ? fallbackOriginalPrice : currentPrice,

        discountPrice: 0,

        todayDiscountPrice: 0,

        originalPrice:
          fallbackOriginalPrice > 0 ? fallbackOriginalPrice : currentPrice,

        isTodayDiscount: false,
      };
    }

    const originalPrice = getSafeNumber(
      item?.originalPrice,
      getSafeNumber(item?.product?.price, getSafeNumber(item?.price, 0)),
    );

    const discountPrice = getSafeNumber(discount?.discountPrice, 0);

    if (
      discountPrice <= 0 ||
      (originalPrice > 0 && discountPrice >= originalPrice)
    ) {
      return {
        ...item,

        price: originalPrice > 0 ? originalPrice : item?.price,

        originalPrice,

        discountPrice: 0,

        todayDiscountPrice: 0,

        isTodayDiscount: false,
      };
    }

    return {
      ...item,

      price: discountPrice,

      originalPrice,

      discountPrice,

      todayDiscountPrice: discountPrice,

      todayDiscountId: discount?._id,

      isTodayDiscount: true,
    };
  };

  // ======================================================
  // APPLY TODAY DISCOUNTS TO CART
  // ======================================================

  const applyTodayDiscountsToCart = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map(applyTodayDiscountToItem);
  };

  // ======================================================
  // FORMAT GUEST ITEMS
  // ======================================================

  const formatGuestItems = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    const formatted = items
      .filter((item) => {
        return Boolean(getProductId(item));
      })
      .map((item) => {
        const productId = getProductId(item);

        const productName = getProductName(item);

        const rawUnit = item?.size ?? item?.unitName ?? item?.unit ?? "";

        const unitName = getUnitName(rawUnit);

        const originalPrice = getSafeNumber(
          item?.originalPrice,
          getSafeNumber(item?.price, 0),
        );

        return {
          ...item,

          id: String(item?.id || item?._id || productId),

          productId: String(productId),

          name: getSafeText(productName, "Product"),

          price: getSafeNumber(item?.price, originalPrice),

          originalPrice,

          writtenPrice: getSafeNumber(item?.writtenPrice, 0),

          discountPrice: getSafeNumber(item?.discountPrice, 0),

          todayDiscountPrice: getSafeNumber(item?.todayDiscountPrice, 0),

          size: getSafeText(unitName, "Standard Pack"),

          quantity: Math.max(1, getSafeNumber(item?.quantity, 1)),

          stockQuantity: getSafeNumber(item?.stockQuantity, 0),

          image: getImageUrl(item?.image),
        };
      });

    return applyTodayDiscountsToCart(formatted);
  };

  // ======================================================
  // FORMAT BACKEND ITEMS
  // ======================================================

  const formatBackendItems = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    const formatted = items
      .filter((item) => item?.product)
      .map((item) => {
        const product = item.product;

        const productId =
          product?._id || product?.id || item?.productId || item?._id;

        const productImage =
          Array.isArray(product?.images) && product.images.length > 0
            ? product.images[0]
            : product?.image || product?.thumbnail || product?.imageUrl || null;

        const productName = getProductName(product);

        const unitName = getUnitName(product?.unit);

        const price = getProductPrice(product);

        const originalPrice = getSafeNumber(product?.price, price);

        return {
          id: String(item?._id || productId),

          productId: String(productId || ""),

          name: getSafeText(productName, "Product"),

          price: getSafeNumber(price, 0),

          originalPrice,

          writtenPrice: getSafeNumber(product?.writtenPrice, 0),

          discountPrice: getSafeNumber(product?.discountPrice, 0),

          todayDiscountPrice: 0,

          size: getSafeText(unitName, "Standard Pack"),

          quantity: Math.max(1, getSafeNumber(item?.quantity, 1)),

          stockQuantity: getSafeNumber(product?.stockQuantity, 0),

          image: getImageUrl(productImage),
        };
      });

    return applyTodayDiscountsToCart(formatted);
  };

  // ======================================================
  // GET CART ITEMS FROM RESPONSE
  // ======================================================

  const getCartItemsFromResponse = (data) => {
    if (!data) {
      return [];
    }

    const items =
      data?.cart?.items ||
      data?.data?.cart?.items ||
      data?.data?.items ||
      data?.items ||
      [];

    return formatBackendItems(items);
  };

  // ======================================================
  // FETCH ACTIVE TODAY DISCOUNTS
  // ======================================================

  const fetchTodayDiscounts = useCallback(async () => {
    try {
      const { data } = await API.get("/today-discounts/active");

      const discounts = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      setTodayDiscounts(discounts);

      return discounts;
    } catch (error) {
      console.error("Fetch Today Discounts error:", error);

      setTodayDiscounts([]);

      return [];
    }
  }, []);

  // ======================================================
  // MERGE GUEST CART
  // ======================================================

  const mergeGuestCartToBackend = async (token) => {
    // Already merged this session?
    if (mergeCompletedRef.current) return true;

    // Another call is already merging?
    if (mergeInProgressRef.current) return true;

    try {
      mergeInProgressRef.current = true;

      const guestCart = getGuestCart();

      if (!token || guestCart.length === 0) {
        mergeCompletedRef.current = true;
        return true;
      }

      // 🚨 Capture and CLEAR the guest cart BEFORE making any network calls.
      // This prevents a second concurrent fetchCart() from re-merging it.
      localStorage.removeItem(GUEST_CART_KEY);

      let success = true;

      for (const item of guestCart) {
        const productId = getProductId(item);
        if (!productId) continue;

        const quantity = Math.max(1, getSafeNumber(item?.quantity, 1));

        try {
          await API.post("/cart/add", { productId, quantity });
        } catch (error) {
          console.error("Guest cart merge item error:", error);
          success = false;
        }
      }

      if (!success) {
        // Put it back if merge failed partially — user can retry later
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
        mergeCompletedRef.current = false;
      } else {
        mergeCompletedRef.current = true;
        window.dispatchEvent(new Event("cartUpdated"));
      }

      return success;
    } catch (error) {
      console.error("Merge guest cart error:", error);
      return false;
    } finally {
      mergeInProgressRef.current = false;
    }
  };

  // ======================================================
  // FETCH CART
  // ======================================================

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);

      setCartError("");

      const activeDiscounts = await fetchTodayDiscounts();

      const discountList = Array.isArray(activeDiscounts)
        ? activeDiscounts
        : [];

      const applyCurrentDiscounts = (items) => {
        if (!Array.isArray(items)) {
          return [];
        }

        return items.map((item) => {
          const productId = getProductId(item);

          const discount = discountList.find(
            (discountItem) =>
              String(getObjectId(discountItem?.product)) === String(productId),
          );

          if (!discount) {
            const originalPrice = getSafeNumber(
              item?.originalPrice,
              getSafeNumber(item?.price, 0),
            );

            return {
              ...item,

              price: originalPrice,

              originalPrice,

              discountPrice: 0,

              todayDiscountPrice: 0,

              isTodayDiscount: false,
            };
          }

          const originalPrice = getSafeNumber(
            item?.originalPrice,
            getSafeNumber(item?.price, 0),
          );

          const discountPrice = getSafeNumber(discount?.discountPrice, 0);

          if (
            discountPrice <= 0 ||
            (originalPrice > 0 && discountPrice >= originalPrice)
          ) {
            return {
              ...item,

              price: originalPrice,

              originalPrice,

              discountPrice: 0,

              todayDiscountPrice: 0,

              isTodayDiscount: false,
            };
          }

          return {
            ...item,

            price: discountPrice,

            originalPrice,

            discountPrice,

            todayDiscountPrice: discountPrice,

            todayDiscountId: discount?._id,

            isTodayDiscount: true,
          };
        });
      };

      const token = getToken();

      // ==================================================
      // GUEST CART
      // ==================================================

      if (!token) {
        const guestCart = getGuestCart();

        const formattedItems = formatGuestItems(guestCart);

        const discountedItems = applyCurrentDiscounts(formattedItems);

        setCartItems(discountedItems);

        return;
      }

      // ==================================================
      // MERGE GUEST CART
      // ==================================================

      await mergeGuestCartToBackend(token);

      // ==================================================
      // BACKEND CART
      // ==================================================

      const { data } = await API.get("/cart");

      const formattedItems = getCartItemsFromResponse(data);

      const discountedItems = applyCurrentDiscounts(formattedItems);

      setCartItems(discountedItems);
    } catch (error) {
      console.error("Fetch cart error:", error);

      setCartError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load cart.",
      );

      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [fetchTodayDiscounts]);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ======================================================
  // REFRESH WHEN CART OPENS
  // ======================================================

  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen, fetchCart]);

  // ======================================================
  // CART UPDATED EVENT
  // ======================================================

  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [fetchCart]);

  // ======================================================
  // BODY LOCK
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

  // ======================================================
  // UPDATE CART QUANTITY
  // ======================================================

  const updateCartQuantity = async (item, quantity) => {
    try {
      const safeQuantity = getSafeNumber(quantity, 0);

      const productId = getProductId(item);

      if (!productId) {
        throw new Error("Product ID is missing.");
      }

      if (safeQuantity <= 0) {
        await handleRemove(item.id);

        return;
      }

      if (item.stockQuantity > 0 && safeQuantity > item.stockQuantity) {
        alert(`Only ${item.stockQuantity} item(s) available in stock.`);

        return;
      }

      const token = getToken();

      // ==================================================
      // GUEST
      // ==================================================

      if (!token) {
        const guestCart = getGuestCart();

        const updatedCart = guestCart.map((cartItem) => {
          const cartProductId = getProductId(cartItem);

          if (String(cartProductId) === String(productId)) {
            return {
              ...cartItem,

              quantity: safeQuantity,
            };
          }

          return cartItem;
        });

        saveGuestCart(updatedCart);

        setCartItems(formatGuestItems(updatedCart));

        return;
      }

      // ==================================================
      // LOGGED-IN
      // ==================================================

      const { data } = await API.put(`/cart/update/${productId}`, {
        quantity: safeQuantity,
      });

      const returnedItems = getCartItemsFromResponse(data);

      if (returnedItems.length > 0 || data?.cart?.items) {
        setCartItems(applyTodayDiscountsToCart(returnedItems));
      } else {
        await fetchCart();
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Update cart error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update cart.",
      );
    }
  };

  // ======================================================
  // INCREASE
  // ======================================================

  const handleIncrease = (id) => {
    const item = cartItems.find(
      (cartItem) => String(cartItem.id) === String(id),
    );

    if (!item) {
      return;
    }

    const nextQuantity = getSafeNumber(item.quantity, 0) + 1;

    if (item.stockQuantity > 0 && nextQuantity > item.stockQuantity) {
      alert(`Only ${item.stockQuantity} item(s) available in stock.`);

      return;
    }

    updateCartQuantity(item, nextQuantity);
  };

  // ======================================================
  // DECREASE
  // ======================================================

  const handleDecrease = (id) => {
    const item = cartItems.find(
      (cartItem) => String(cartItem.id) === String(id),
    );

    if (!item) {
      return;
    }

    const nextQuantity = getSafeNumber(item.quantity, 0) - 1;

    updateCartQuantity(item, nextQuantity);
  };

  // ======================================================
  // REMOVE
  // ======================================================

  const handleRemove = async (id) => {
    try {
      const item = cartItems.find(
        (cartItem) => String(cartItem.id) === String(id),
      );

      if (!item) {
        return;
      }

      const token = getToken();

      // ==================================================
      // GUEST
      // ==================================================

      if (!token) {
        const guestCart = getGuestCart();

        const productId = getProductId(item);

        const updatedGuestCart = guestCart.filter((cartItem) => {
          const cartProductId = getProductId(cartItem);

          return String(cartProductId) !== String(productId);
        });

        saveGuestCart(updatedGuestCart);

        setCartItems(formatGuestItems(updatedGuestCart));

        return;
      }

      // ==================================================
      // LOGGED-IN
      // ==================================================

      const productId = getProductId(item);

      if (!productId) {
        throw new Error("Product ID is missing.");
      }

      const { data } = await API.delete(`/cart/remove/${productId}`);

      const returnedItems = getCartItemsFromResponse(data);

      if (returnedItems.length > 0 || data?.cart?.items) {
        setCartItems(applyTodayDiscountsToCart(returnedItems));
      } else {
        await fetchCart();
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Remove cart error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to remove product.",
      );
    }
  };

  // ======================================================
  // ADD RECOMMENDATION
  // ======================================================

  const handleAddToCart = async (recItem) => {
    try {
      if (!recItem) {
        return;
      }

      const productId = recItem?.productId || recItem?._id;

      if (!productId) {
        alert("This recommendation is currently a demo product.");

        return;
      }

      const token = getToken();

      // ==================================================
      // GUEST
      // ==================================================

      if (!token) {
        const guestCart = getGuestCart();

        const existingIndex = guestCart.findIndex(
          (item) => String(getProductId(item)) === String(productId),
        );

        if (existingIndex !== -1) {
          const currentQuantity = getSafeNumber(
            guestCart[existingIndex]?.quantity,
            1,
          );

          guestCart[existingIndex] = {
            ...guestCart[existingIndex],

            quantity: currentQuantity + 1,
          };
        } else {
          guestCart.push({
            id: String(productId),

            productId: String(productId),

            name: getSafeText(recItem?.name, "Product"),

            price: getSafeNumber(recItem?.price, 0),

            originalPrice: getSafeNumber(recItem?.price, 0),

            writtenPrice: getSafeNumber(recItem?.writtenPrice, 0),

            quantity: 1,

            stockQuantity: getSafeNumber(recItem?.stockQuantity, 0),

            image: getImageUrl(recItem?.image),
          });
        }

        saveGuestCart(guestCart);

        setCartItems(formatGuestItems(guestCart));

        alert("Product added to cart successfully.");

        return;
      }

      // ==================================================
      // LOGGED-IN
      // ==================================================

      const { data } = await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      const returnedItems = getCartItemsFromResponse(data);

      if (returnedItems.length > 0 || data?.cart?.items) {
        setCartItems(applyTodayDiscountsToCart(returnedItems));
      } else {
        await fetchCart();
      }

      window.dispatchEvent(new Event("cartUpdated"));

      alert(data?.message || "Product added to cart successfully.");
    } catch (error) {
      console.error("Recommendation cart error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to add product to cart.",
      );
    }
  };

  // ======================================================
  // CALCULATIONS
  // ======================================================

  const totalItemsCount = cartItems.reduce(
    (total, item) => total + getSafeNumber(item?.quantity, 0),
    0,
  );

  const subtotalAmount = cartItems.reduce((total, item) => {
    const price = getSafeNumber(item?.price, 0);

    const quantity = getSafeNumber(item?.quantity, 0);

    return total + price * quantity;
  }, 0);

  const totalDiscountAmount = cartItems.reduce((total, item) => {
    if (!item?.isTodayDiscount) {
      return total;
    }

    const originalPrice = getSafeNumber(item?.originalPrice, 0);

    const discountPrice = getSafeNumber(item?.price, 0);

    const quantity = getSafeNumber(item?.quantity, 0);

    const saving = Math.max(0, originalPrice - discountPrice);

    return total + saving * quantity;
  }, 0);

  const freeShippingThreshold = 1000;

  const progressPercent = Math.min(
    (subtotalAmount / freeShippingThreshold) * 100,
    100,
  );

  const activeRecommendation =
    recommendations[activeRecIndex] || recommendations[0];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
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

      {/* REOPEN CART */}
      {!isCartOpen && (
        <button
          type="button"
          className="reopen-cart-btn"
          onClick={handleOpenCart}
          aria-label="Open Grocery Sathi Shopping Cart"
        >
          🛒 Open Cart
        </button>
      )}

      {/* CART OVERLAY */}
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
          <header className="cart-header">
            <div className="cart-header-left">
              <div className="cart-header-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1.6" />
                  <circle cx="17" cy="20" r="1.6" />
                  <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
                </svg>
              </div>
              <div className="cart-header-title-wrap">
                <h2 className="cart-header-title">Your Cart</h2>
                <span className="cart-total-item-count">
                  {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="cart-close-btn"
              onClick={handleCloseCart}
              aria-label="Close shopping cart"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </header>

          {cartLoading ? (
            <div className="empty-cart-container">
              <div className="empty-cart-icon-wrap">🛒</div>

              <h3 className="empty-cart-title">Loading cart...</h3>
            </div>
          ) : cartError ? (
            <div className="empty-cart-container">
              <div className="empty-cart-icon-wrap">⚠️</div>

              <h3 className="empty-cart-title">
                {getSafeText(cartError, "Unable to load cart.")}
              </h3>

              <button
                type="button"
                className="btn-continue-shopping"
                onClick={fetchCart}
              >
                Try Again
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart-container">
              <div className="empty-cart-icon-wrap">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 8h12l1 13H5L6 8Z" />
                  <path d="M9 8a3 3 0 0 1 6 0" />
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
              <div className="cart-body">
                {/* <div className="shipping-bar-container">
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
                </div> */}

                {totalDiscountAmount > 0 && (
                  <div
                    style={{
                      margin: "10px 0",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "#ecfdf5",
                      color: "#047857",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    🎉 You are saving ₹{totalDiscountAmount.toFixed(2)} with
                    Today Discounts
                  </div>
                )}

                <section className="cart-items-list" aria-label="Cart Items">
                  {cartItems.map((item) => {
                    const itemName = getSafeText(item?.name, "Product");
                    const itemSize = getSafeText(item?.size, "Standard Pack");
                    const itemPrice = getSafeNumber(item?.price, 0);
                    const originalPrice = getSafeNumber(item?.originalPrice, 0);
                    const itemQuantity = getSafeNumber(item?.quantity, 1);
                    const isTodayDiscount = Boolean(item?.isTodayDiscount);

                    return (
                      <article
                        key={item.id || item.productId}
                        className="cart-item-card"
                      >
                        <div className="cart-item-img-wrap">
                          <img
                            src={item.image || avocadoImg}
                            alt={itemName}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = avocadoImg;
                            }}
                          />
                        </div>

                        <div className="cart-item-details">
                          <div className="cart-item-header-row">
                            <h4 className="cart-item-title">{itemName}</h4>

                            <button
                              type="button"
                              className="cart-item-delete-btn"
                              onClick={() => handleRemove(item.id)}
                              aria-label={`Remove ${itemName} from cart`}
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

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "8px",
                              marginTop: "4px",
                            }}
                          >
                            <p
                              className="cart-item-price"
                              style={{ margin: 0 }}
                            >
                              ₹{itemPrice.toFixed(2)}
                            </p>

                            {isTodayDiscount && originalPrice > itemPrice && (
                              <>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#888",
                                    textDecoration: "line-through",
                                  }}
                                >
                                  ₹{originalPrice.toFixed(2)}
                                </span>

                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "3px 7px",
                                    borderRadius: "999px",
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                  }}
                                >
                                  TODAY DISCOUNT
                                </span>
                              </>
                            )}
                          </div>

                          {isTodayDiscount && originalPrice > itemPrice && (
                            <p
                              style={{
                                margin: "4px 0 0",
                                color: "#16a34a",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              You save ₹{(originalPrice - itemPrice).toFixed(2)}
                            </p>
                          )}

                          <p className="cart-item-size">Size: {itemSize}</p>

                          <div className="cart-item-qty-control">
                            <button
                              type="button"
                              onClick={() => handleDecrease(item.id)}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>

                            <span aria-label={`Quantity: ${itemQuantity}`}>
                              {itemQuantity}
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
                    );
                  })}
                </section>

                {/* <section
                  className="cart-recommendations-section"
                  aria-label="Recommended Products"
                >
                  <h3 className="recommendations-title">You may also like</h3>

                  <div className="recommendation-card">
                    <div className="rec-img-wrap">
                      <img
                        src={activeRecommendation?.image}
                        alt={getSafeText(
                          activeRecommendation?.name,
                          "Recommended Product",
                        )}
                        loading="lazy"
                      />
                    </div>

                    <div className="rec-details">
                      <h4 className="rec-title">
                        {getSafeText(activeRecommendation?.name, "Product")}
                      </h4>

                      <p className="rec-price">
                        ₹
                        {getSafeNumber(activeRecommendation?.price, 0).toFixed(
                          2,
                        )}
                      </p>

                      <button
                        type="button"
                        className="rec-add-btn"
                        onClick={() => handleAddToCart(activeRecommendation)}
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
                    {recommendations.map((recommendation, idx) => (
                      <button
                        type="button"
                        key={recommendation.id}
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
                </section> */}
              </div>

              <footer className="cart-footer">
                <div className="cart-badges-row">
                  {/* <div
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
                  </div> */}

                  {/* <div
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
                  </div> */}
                </div>

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

                <div className="cart-item-price-details">
                  <h4 className="price-details-title">Price Details</h4>

                  {cartItems.map((item) => {
                    const itemTotal =
                      getSafeNumber(item?.price, 0) *
                      getSafeNumber(item?.quantity, 0);

                    const itemName = getSafeText(item?.name, "Product");

                    const itemOriginalPrice = getSafeNumber(
                      item?.originalPrice,
                      0,
                    );

                    const itemCurrentPrice = getSafeNumber(item?.price, 0);

                    const isDiscounted =
                      Boolean(item?.isTodayDiscount) &&
                      itemOriginalPrice > itemCurrentPrice;

                    return (
                      <div
                        className="cart-price-detail-item"
                        key={item.id || item.productId}
                      >
                        <div className="cart-price-detail-info">
                          <span className="cart-price-detail-name">
                            {itemName}
                          </span>

                          <span className="cart-price-detail-quantity">
                            {getSafeNumber(item?.quantity, 0)} × ₹
                            {itemCurrentPrice.toFixed(2)}
                          </span>

                          {isDiscounted && (
                            <span
                              style={{
                                display: "block",
                                marginTop: "2px",
                                color: "#16a34a",
                                fontSize: "10px",
                                fontWeight: 600,
                              }}
                            >
                              Today Discount
                            </span>
                          )}
                        </div>

                        <span className="cart-price-detail-total">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-action-buttons">
                  <button
                    type="button"
                    className="btn-view-cart"
                    onClick={handleOpenCart}
                  >
                    View Cart
                  </button>

                  <button
                    type="button"
                    className="btn-checkout"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? "Redirecting..." : "Checkout"}
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

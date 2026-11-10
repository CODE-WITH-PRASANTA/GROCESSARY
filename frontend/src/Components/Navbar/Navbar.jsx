import React, { useEffect, useState, useCallback, useMemo } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Search,
  User,
  ShoppingBag,
  Heart,
  Grid,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Ticket,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Eye,
  Package,
} from "lucide-react";

import logo from "../../assets/Grocessary Sathi Png.png";
import "./Navbar.css";
import { fetchWishlistItems } from "../../Utils/wishlistService";
import UserAuth from "../UserAuth/UserAuth";
import API, { BASE_URL } from "../../api/axios";

// ======================================================
// NAVIGATION PATHS
// ======================================================

const NAV_PATHS = {
  HOME: "/",
  ACCOUNT: "/login",
  WISHLIST: "/wishlist",
  CART: "/cart",
  FAQ: "/faq",
  BLOG: "/blogs",
  CONTACT: "/contact-us",
  ABOUT: "/about-us",
  SEARCH: "/search",
  CATEGORIES: "/categories",
};

// ======================================================
// COMPONENT
// ======================================================

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Sync Wishlist Count
  const refreshWishlistCount = useCallback(async () => {
    try {
      const items = await fetchWishlistItems();
      setWishlistCount(items.length);
    } catch {
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    refreshWishlistCount();

    const handleWishlistUpdate = (e) => {
      if (e?.detail?.cleared || e?.detail?.count === 0) {
        setWishlistCount(0);
      } else if (typeof e?.detail?.count === "number") {
        setWishlistCount(e.detail.count);
      } else {
        refreshWishlistCount();
      }
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [refreshWishlistCount]);

  // ======================================================
  // DYNAMIC PUBLIC COUPON FOR TOP ANNOUNCEMENT BAR
  // Validates: isPublic, Active status, expiryDate not exceeded, usage limit not exceeded
  // ======================================================
  const [publicCoupon, setPublicCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState(false);

  const fetchPublicCoupon = useCallback(async () => {
    try {
      const res = await API.get("/coupons?status=Active&isPublic=true");
      const list = res.data?.data || res.data?.coupons || [];
      const now = new Date();

      // Strict client-side validation to guarantee no expired/private coupons show
      const validCoupons = (Array.isArray(list) ? list : []).filter((c) => {
        if (c.status !== "Active") return false;
        if (c.isPublic === false) return false;
        if (c.expiryDate && new Date(c.expiryDate) <= now) return false;
        if (c.startDate && new Date(c.startDate) > now) return false;
        if (
          c.usageLimit !== null &&
          c.usageLimit !== undefined &&
          c.usageCount >= c.usageLimit
        ) {
          return false;
        }
        return true;
      });

      if (validCoupons.length > 0) {
        // Prioritize highest discount percentage or value
        validCoupons.sort(
          (a, b) => (Number(b.discountValue) || 0) - (Number(a.discountValue) || 0)
        );
        setPublicCoupon(validCoupons[0]);
      } else {
        setPublicCoupon(null);
      }
    } catch (err) {
      console.error("Failed to load public coupon in navbar:", err);
      setPublicCoupon(null);
    }
  }, []);

  useEffect(() => {
    fetchPublicCoupon();

    const handleCouponUpdate = () => {
      fetchPublicCoupon();
    };

    window.addEventListener("couponUpdated", handleCouponUpdate);
    return () => window.removeEventListener("couponUpdated", handleCouponUpdate);
  }, [fetchPublicCoupon]);

  const handleCopyCouponCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(true);
    setTimeout(() => setCopiedCouponCode(false), 2000);
  };

  // ======================================================
  // GET TOKEN
  // ======================================================

  const getToken = () => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  // ======================================================
  // SAFE STRING
  // ======================================================

  const getSafeString = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string") {
      return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (typeof value === "object") {
      return (
        String(
          value?.name ||
            value?.title ||
            value?.label ||
            value?.value ||
            value?.categoryName ||
            value?.brandName ||
            value?.unitName ||
            "",
        ).trim() || fallback
      );
    }

    return fallback;
  };

  const getObjectId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value?._id || value?.id || value?.value || "";
    }
    return "";
  };

  const getCategoryName = (category) => {
    if (!category) return "";
    return getSafeString(category, "");
  };

  const getCategoryId = (category) => getObjectId(category);

  const getCategorySlug = (category) => {
    if (!category) return "";
    if (typeof category === "string") return category.trim();

    return getSafeString(
      category?.slug || category?._id || category?.id || "",
      "",
    );
  };

  const getCategoryKey = (category) => {
    if (!category) return "";
    return (
      category?._id || category?.id || category?.slug || category?.name || ""
    );
  };

  const getSubCategoryName = (subCategory) => {
    if (!subCategory) return "";
    return getSafeString(
      subCategory?.name ||
        subCategory?.title ||
        subCategory?.categoryName ||
        subCategory,
      "",
    );
  };

  const getSubCategoryId = (subCategory) => getObjectId(subCategory);

  const getSubCategorySlug = (subCategory) => {
    if (!subCategory) return "";
    if (typeof subCategory === "string") return subCategory.trim();

    return getSafeString(
      subCategory?.slug || subCategory?._id || subCategory?.id || "",
      "",
    );
  };

  const getSubCategories = (category) => {
    if (!category) return [];

    const list =
      category?.subCategories ||
      category?.subcategories ||
      category?.children ||
      [];

    if (!Array.isArray(list)) return [];

    return list.filter(Boolean);
  };

  const getProductId = (product) => (!product ? "" : getObjectId(product));

  const getProductName = (product) => {
    if (!product) return "Unnamed Product";

    return getSafeString(
      product?.productName || product?.name || product?.title,
      "Unnamed Product",
    );
  };

  const getProductCategory = (product) => {
    if (!product) return null;

    return (
      product?.category || product?.categoryId || product?.category_id || null
    );
  };

  const getProductCategoryId = (product) => {
    return getObjectId(getProductCategory(product));
  };

  const getProductCategoryName = (product) => {
    return getCategoryName(getProductCategory(product));
  };

  const getProductImage = (product, fallback = "") => {
    if (!product) return fallback;

    // ---- 1. Pick the first candidate image ----
    let candidate;

    if (Array.isArray(product.images) && product.images.length > 0) {
      // Prefer first non-empty entry
      candidate = product.images.find(Boolean);
    }

    if (!candidate) {
      candidate =
        product.image ||
        product.thumbnail ||
        product.imageUrl ||
        product.image_url ||
        product.photo ||
        product.cover ||
        "";
    }

    // ---- 2. Unwrap object shapes: { url }, { path }, { secure_url }, ... ----
    if (candidate && typeof candidate === "object") {
      candidate =
        candidate.url ||
        candidate.path ||
        candidate.secure_url ||
        candidate.src ||
        candidate.filename ||
        "";
    }

    if (typeof candidate !== "string") return fallback;

    const str = candidate.trim();
    if (!str) return fallback;

    // ---- 3. Already absolute (http, https, data, blob, file, protocol-relative) ----
    if (/^(https?:|data:|blob:|file:)/i.test(str)) return str;
    if (str.startsWith("//")) return `https:${str}`;

    // ---- 4. Prefix with backend origin ----
    const origin =
      BASE_URL || API.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    const path = str.startsWith("/") ? str : `/${str}`;
    return `${origin}${path}`;
  };

  const getNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;

    const number = Number(
      typeof value === "object"
        ? (value?.value ?? value?.price ?? value?.amount ?? 0)
        : value,
    );

    return Number.isFinite(number) ? number : 0;
  };

  const getProductPrice = (product) => {
    if (!product) return 0;

    const discountPrice = Number(product.discountPrice || 0);
    const sellingPrice = Number(product.sellingPrice || 0);
    const price = Number(product.price || 0);

    if (product.todayDiscount === true && discountPrice > 0) {
      return discountPrice;
    }

    if (sellingPrice > 0) {
      return sellingPrice;
    }

    if (price > 0) {
      return price;
    }

    return 0;
  };

  const getOriginalPrice = (product) => {
    if (!product) return 0;

    const writtenPrice = getNumber(product?.writtenPrice);
    const price = getNumber(product?.price);
    const sellingPrice = getNumber(product?.sellingPrice);
    const discountPrice = getNumber(product?.discountPrice);

    if (writtenPrice > 0 && discountPrice > 0 && writtenPrice > discountPrice) {
      return writtenPrice;
    }

    if (writtenPrice > 0 && sellingPrice > 0 && writtenPrice > sellingPrice) {
      return writtenPrice;
    }

    if (writtenPrice > 0 && price > 0 && writtenPrice > price) {
      return writtenPrice;
    }

    if (price > 0 && discountPrice > 0 && price > discountPrice) {
      return price;
    }

    if (price > 0 && sellingPrice > 0 && price > sellingPrice) {
      return price;
    }

    return writtenPrice || price || sellingPrice || discountPrice || 0;
  };

  const getDiscountPrice = (product) => {
    if (!product) return 0;
    const discountPrice = getNumber(product?.discountPrice);
    return discountPrice > 0 ? discountPrice : 0;
  };

  const getDiscountPercentage = (product) => {
    if (!product) return 0;

    const currentPrice = getProductPrice(product);
    const originalPrice = getOriginalPrice(product);

    if (
      !Number.isFinite(currentPrice) ||
      !Number.isFinite(originalPrice) ||
      currentPrice <= 0 ||
      originalPrice <= 0 ||
      currentPrice >= originalPrice
    ) {
      return 0;
    }

    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const hasDiscount = (product) => {
    if (!product) return false;

    const discountPrice = getDiscountPrice(product);
    const currentPrice = getProductPrice(product);
    const originalPrice = getOriginalPrice(product);

    return (
      discountPrice > 0 && currentPrice > 0 && originalPrice > currentPrice
    );
  };

  const getDiscountProductId = (discount) => {
    if (!discount) return "";
    return getObjectId(discount?.product);
  };

  const isDiscountCurrentlyActive = (discount) => {
    if (!discount) return false;

    const status = String(discount?.status ?? "active")
      .trim()
      .toLowerCase();

    if (status !== "active" && status !== "true" && status !== "1") {
      return false;
    }

    const now = new Date();
    const startDate = discount?.startDate ? new Date(discount.startDate) : null;
    const endDate = discount?.endDate ? new Date(discount.endDate) : null;

    if (startDate && !Number.isNaN(startDate.getTime()) && now < startDate) {
      return false;
    }

    if (endDate && !Number.isNaN(endDate.getTime()) && now > endDate) {
      return false;
    }

    const discountPrice = getNumber(discount?.discountPrice);
    if (discountPrice <= 0) return false;

    return true;
  };

  // ======================================================
  // FETCH TODAY DISCOUNTS
  // ======================================================

  const fetchTodayDiscounts = useCallback(async () => {
    try {
      const { data } = await API.get("/today-discounts/active");

      let discountList = [];

      if (Array.isArray(data)) discountList = data;
      else if (Array.isArray(data?.discounts)) discountList = data.discounts;
      else if (Array.isArray(data?.todayDiscounts))
        discountList = data.todayDiscounts;
      else if (Array.isArray(data?.data)) discountList = data.data;
      else if (Array.isArray(data?.data?.discounts))
        discountList = data.data.discounts;
      else if (Array.isArray(data?.data?.todayDiscounts))
        discountList = data.data.todayDiscounts;

      return discountList.filter(isDiscountCurrentlyActive);
    } catch (error) {
      console.error("Today discounts fetch error:", error);
      return [];
    }
  }, []);

  // ======================================================
  // FETCH ALL PRODUCTS + TODAY DISCOUNTS
  // ======================================================

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);

      const { data: productResult } = await API.get("/products?limit=500");

      let productList = [];

      if (Array.isArray(productResult)) productList = productResult;
      else if (Array.isArray(productResult?.products))
        productList = productResult.products;
      else if (Array.isArray(productResult?.data))
        productList = productResult.data;
      else if (Array.isArray(productResult?.data?.products))
        productList = productResult.data.products;

      const activeProducts = productList.filter((product) => {
        if (!product) return false;

        const status = String(product?.status ?? "active")
          .trim()
          .toLowerCase();

        return (
          status === "active" ||
          status === "true" ||
          status === "1" ||
          product?.status === undefined
        );
      });

      const discountList = await fetchTodayDiscounts();

      const discountMap = new Map();

      discountList.forEach((discount) => {
        const discountProductId = getDiscountProductId(discount);
        if (!discountProductId) return;

        const discountPrice = getNumber(discount?.discountPrice);
        if (discountPrice <= 0) return;

        discountMap.set(String(discountProductId), discount);
      });

      const productsWithDiscount = activeProducts.map((product) => {
        const productId = getProductId(product);
        const discount = discountMap.get(String(productId));

        if (discount) {
          return {
            ...product,
            discountPrice: getNumber(discount?.discountPrice),
            todayDiscount: true,
            todayDiscountId: discount?._id || null,
            todayDiscountStartDate: discount?.startDate || null,
            todayDiscountEndDate: discount?.endDate || null,
            todayDiscountStatus: discount?.status || "active",
          };
        }

        return {
          ...product,
          discountPrice: getNumber(product?.discountPrice),
          todayDiscount: false,
          todayDiscountId: null,
          todayDiscountStartDate: null,
          todayDiscountEndDate: null,
          todayDiscountStatus: null,
        };
      });

      setProducts(productsWithDiscount);
    } catch (error) {
      console.error("Navbar product fetch error:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [fetchTodayDiscounts]);

  // ======================================================
  // FETCH CART
  // ======================================================

 const fetchCart = useCallback(async () => {
  try {
    const token = getToken();

    // ==================================================
    // GUEST CART
    // ==================================================
    if (!token) {
      const storedCart = localStorage.getItem("guestCart");

      if (!storedCart) {
        setCartItemCount(0);
        setCartTotal(0);
        return;
      }

      let guestCart = [];
      try {
        guestCart = JSON.parse(storedCart);
      } catch (error) {
        console.error("Guest cart parse error:", error);
        setCartItemCount(0);
        setCartTotal(0);
        return;
      }

      if (!Array.isArray(guestCart)) {
        setCartItemCount(0);
        setCartTotal(0);
        return;
      }

      // Fetch today's discounts so guest cart also reflects them
      const activeDiscounts = await fetchTodayDiscounts();
      const discountList = Array.isArray(activeDiscounts) ? activeDiscounts : [];

      const findDiscount = (productId) =>
        discountList.find(
          (d) => String(getObjectId(d?.product)) === String(productId),
        );

      const totalQuantity = guestCart.reduce(
        (t, item) => t + Number(item?.quantity || 0),
        0,
      );

      const totalPrice = guestCart.reduce((t, item) => {
        const productId =
          item?.productId || item?._id || item?.id || "";

        const discount = findDiscount(productId);

        // Prefer today's discountPrice from /today-discounts/active,
        // then the item's stored discountPrice, then price.
        const price = discount
          ? getNumber(discount?.discountPrice)
          : item?.discountPrice > 0
            ? Number(item.discountPrice)
            : Number(item?.price || 0);

        const quantity = Number(item?.quantity || 0);
        return t + price * quantity;
      }, 0);

      setCartItemCount(totalQuantity);
      setCartTotal(totalPrice);
      return;
    }

    // ==================================================
    // LOGGED-IN CART
    // ==================================================
    const activeDiscounts = await fetchTodayDiscounts();
    const discountList = Array.isArray(activeDiscounts) ? activeDiscounts : [];

    const { data } = await API.get("/cart");

    const items =
      data?.cart?.items ||
      data?.data?.cart?.items ||
      data?.data?.items ||
      data?.items ||
      [];

    if (!Array.isArray(items)) {
      setCartItemCount(0);
      setCartTotal(0);
      return;
    }

    const totalQuantity = items.reduce(
      (t, item) => t + Number(item?.quantity || 0),
      0,
    );

    const totalPrice = items.reduce((t, item) => {
      const product = item?.product || {};
      const productId = product?._id || product?.id || item?.productId || "";

      // 👇 find a today discount for this product
      const discount = discountList.find(
        (d) => String(getObjectId(d?.product)) === String(productId),
      );

      // If a today discount applies, use its price.
      // Otherwise fall back to the product's own price.
      const price = discount
        ? getNumber(discount?.discountPrice)
        : getProductPrice(product);

      const quantity = Number(item?.quantity || 0);
      return t + price * quantity;
    }, 0);

    setCartItemCount(totalQuantity);
    setCartTotal(Number.isFinite(totalPrice) ? totalPrice : 0);
  } catch (error) {
    console.error("Navbar cart fetch error:", error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      setCartItemCount(0);
      setCartTotal(0);
      return;
    }

    setCartItemCount(0);
    setCartTotal(0);
  }
}, [fetchTodayDiscounts]);

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      const { data: result } = await API.get("/categories?hasProducts=true");

      let categoryList = [];

      if (Array.isArray(result)) categoryList = result;
      else if (Array.isArray(result?.categories))
        categoryList = result.categories;
      else if (Array.isArray(result?.data)) categoryList = result.data;
      else if (Array.isArray(result?.data?.categories))
        categoryList = result.data.categories;

      const activeCategories = categoryList.filter((category) => {
        if (!category) return false;

        const status = String(category?.status ?? "active")
          .trim()
          .toLowerCase();

        return (
          status === "active" ||
          status === "true" ||
          status === "1" ||
          category?.status === undefined
        );
      });

      // Sort real database categories by order ascending
      activeCategories.sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : 999;
        const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : 999;
        return orderA - orderB;
      });

      setCategories(activeCategories);
    } catch (error) {
      console.error("Navbar category fetch error:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Sync real-time category updates from admin panel or storage
  useEffect(() => {
    const handleCategoryUpdate = () => {
      fetchCategories();
    };

    window.addEventListener("categoryUpdated", handleCategoryUpdate);
    return () => window.removeEventListener("categoryUpdated", handleCategoryUpdate);
  }, [fetchCategories]);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCart();
  }, [fetchCategories, fetchProducts, fetchCart]);

  // ======================================================
  // REFRESH CART WHEN ROUTE CHANGES
  // ======================================================

  useEffect(() => {
    fetchCart();
  }, [location.pathname, fetchCart]);

  // ======================================================
  // REFRESH PRODUCTS WHEN ROUTE CHANGES
  // ======================================================

  useEffect(() => {
    fetchProducts();
  }, [location.pathname, fetchProducts]);

  // ======================================================
  // CART UPDATED EVENT
  // ======================================================

  useEffect(() => {
    const handleCartUpdated = (e) => {
      if (e?.detail?.itemCount === 0 || e?.detail?.items?.length === 0) {
        setCartItemCount(0);
        setCartTotal(0);
      } else {
        fetchCart();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [fetchCart]);

  // ======================================================
  // TODAY DISCOUNT UPDATED EVENT
  // ======================================================

  useEffect(() => {
    const handleTodayDiscountUpdated = () => {
      fetchProducts();
      fetchCart();
    };

    window.addEventListener("todayDiscountUpdated", handleTodayDiscountUpdated);

    return () => {
      window.removeEventListener(
        "todayDiscountUpdated",
        handleTodayDiscountUpdated,
      );
    };
  }, [fetchProducts, fetchCart]);

  // ======================================================
  // AUTH UPDATED EVENT
  // ======================================================

  useEffect(() => {
    const handleAuthChanged = () => {
      fetchCart();
      refreshWishlistCount();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, [fetchCart, refreshWishlistCount]);

  // ======================================================
  // STORAGE EVENT
  // ======================================================

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "token" || event.key === "guestCart") {
        fetchCart();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchCart]);

  // ======================================================
  // GET PRODUCTS BY CATEGORY
  // ======================================================

  const getProductsByCategory = useCallback(
    (category) => {
      if (!category || !Array.isArray(products)) return [];

      const categoryId = String(getCategoryId(category) || "")
        .trim()
        .toLowerCase();

      const categoryName = getCategoryName(category).trim().toLowerCase();

      return products.filter((product) => {
        if (!product) return false;

        const productStatus = String(product?.status ?? "active")
          .trim()
          .toLowerCase();

        if (
          productStatus !== "active" &&
          productStatus !== "true" &&
          productStatus !== "1"
        ) {
          return false;
        }

        const productCategory = getProductCategory(product);
        if (!productCategory) return false;

        const productCategoryId = String(getObjectId(productCategory) || "")
          .trim()
          .toLowerCase();

        const productCategoryName = getCategoryName(productCategory)
          .trim()
          .toLowerCase();

        if (
          categoryId &&
          productCategoryId &&
          categoryId === productCategoryId
        ) {
          return true;
        }

        if (
          categoryName &&
          productCategoryName &&
          categoryName === productCategoryName
        ) {
          return true;
        }

        if (typeof productCategory === "string") {
          const value = productCategory.trim().toLowerCase();
          if (value === categoryId || value === categoryName) return true;
        }

        return false;
      });
    },
    [products],
  );

  // ======================================================
  // REAL CATEGORIES FROM DATABASE (ONLY WITH PRODUCTS)
  // ======================================================

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => {
      const name = getCategoryName(category);
      if (!name) return false;
      // Exclude categories without products
      if (typeof category.productCount === "number") {
        return category.productCount > 0;
      }
      return getProductsByCategory(category).length > 0;
    });
  }, [categories, getProductsByCategory]);

  // Flip card mobile/click toggle state
  const [flippedCards, setFlippedCards] = useState({});
  const [categorySearchText, setCategorySearchText] = useState("");

  const toggleCardFlip = (productId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setFlippedCards((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Instant fuzzy filter for categories when there are many
  const filteredCategories = useMemo(() => {
    if (!categorySearchText.trim()) return visibleCategories;
    const query = categorySearchText.trim().toLowerCase();
    return visibleCategories.filter((cat) => {
      const name = getCategoryName(cat).toLowerCase();
      return name.includes(query);
    });
  }, [visibleCategories, categorySearchText]);

  // Currently selected category for showcase panel (defaults to 1st visible/filtered)
  const selectedCategory = useMemo(() => {
    const list = filteredCategories.length > 0 ? filteredCategories : visibleCategories;
    if (list.length === 0) return null;
    if (activeCategory) {
      const match = list.find(
        (cat) => getCategoryKey(cat) === activeCategory
      );
      if (match) return match;
    }
    return list[0];
  }, [filteredCategories, visibleCategories, activeCategory]);

  const activeCategoryKey = selectedCategory ? getCategoryKey(selectedCategory) : null;
  const activeCategoryName = selectedCategory ? getCategoryName(selectedCategory) : "";

  const activeCategoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return getProductsByCategory(selectedCategory);
  }, [selectedCategory, getProductsByCategory]);

  // Quick Add To Cart from Flip Card
  const handleAddToCart = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const productId = getProductId(product);
    if (!productId) return;

    try {
      const token = getToken();
      if (token) {
        await API.post("/cart/add", { productId, quantity: 1 });
      } else {
        const storedCart = localStorage.getItem("guestCart");
        let guestCart = [];
        try {
          guestCart = storedCart ? JSON.parse(storedCart) : [];
        } catch {
          guestCart = [];
        }
        if (!Array.isArray(guestCart)) guestCart = [];
        const existing = guestCart.find(
          (i) => String(i.productId || i.id || i._id) === String(productId)
        );
        if (existing) {
          existing.quantity = Number(existing.quantity || 0) + 1;
        } else {
          guestCart.push({
            productId,
            id: productId,
            name: getProductName(product),
            price: getProductPrice(product),
            image: getProductImage(product),
            quantity: 1,
            unit: product.unit?.name || product.unit || "",
            unitNo: product.unitNo || 1,
          });
        }
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      fetchCart();
    } catch (err) {
      console.error("Error adding to cart from navbar flip card:", err);
    }
  };

  // ======================================================
  // OPEN PRODUCT DETAILS (SEO-FRIENDLY SLUG OR ID)
  // ======================================================

  const handleProductClick = (product) => {
    if (!product) return;

    const productId = getProductId(product);
    const rawName = product.productName || product.name || "";
    const cleanSlug =
      product.slug ||
      rawName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-") ||
      productId;

    closeCategoryMenu();
    closeMobileMenu();

    if (cleanSlug) {
      navigate(`/product/${encodeURIComponent(cleanSlug)}`);
    } else if (productId) {
      navigate(`/productdetails/${productId}`);
    }
  };

  // ======================================================
  // CATEGORY CLICK (NAVIGATE & FILTER POPULAR PRODUCTS)
  // ======================================================

  const handleCategoryClick = (category, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!category) return;

    const categoryName = getCategoryName(category);
    closeCategoryMenu();
    closeMobileMenu();

    if (categoryName) {
      navigate(`/?category=${encodeURIComponent(categoryName)}`);
      window.dispatchEvent(
        new CustomEvent("selectCategory", { detail: categoryName })
      );
    }
  };

  const handleCategoryItemClick = (category, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!category) return;
    const categoryKey = getCategoryKey(category);

    if (window.innerWidth <= 768) {
      // On mobile / touch, tapping selects category and updates showcase below
      setActiveCategory(categoryKey);
    } else {
      // On desktop, clicking navigates to category filter
      handleCategoryClick(category, event);
    }
  };

  // ======================================================
  // CATEGORY PAGE
  // ======================================================

  const handleCategoryPageClick = (category, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const slug = getCategorySlug(category);

    closeCategoryMenu();
    closeMobileMenu();

    if (slug) {
      navigate(`${NAV_PATHS.CATEGORIES}/${slug}`);
    }
  };

  // ======================================================
  // SUBCATEGORY CLICK
  // ======================================================

  const handleSubCategoryClick = (category, subCategory, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const categorySlug = getCategorySlug(category);
    const subCategorySlug = getSubCategorySlug(subCategory);

    closeCategoryMenu();
    closeMobileMenu();

    if (categorySlug && subCategorySlug) {
      navigate(`${NAV_PATHS.CATEGORIES}/${categorySlug}/${subCategorySlug}`);
      return;
    }

    if (subCategorySlug) {
      navigate(`${NAV_PATHS.CATEGORIES}/${subCategorySlug}`);
    }
  };

  // ======================================================
  // TOGGLE CATEGORY DROPDOWN
  // ======================================================

  const toggleCategoryDropdown = () => {
    setIsCategoryOpen((previous) => {
      const next = !previous;

      if (!next) {
        setActiveCategory(null);
      }

      return next;
    });
  };

  // ======================================================
  // CATEGORY TOGGLE
  // ======================================================

  const handleCategoryToggle = (id) => {
    setActiveCategory((previous) => (previous === id ? null : id));
  };

  // ======================================================
  // CLOSE MOBILE
  // ======================================================

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ======================================================
  // CLOSE CATEGORY
  // ======================================================

  const closeCategoryMenu = () => {
    setIsCategoryOpen(false);
    setActiveCategory(null);
    setCategorySearchText("");
  };

  // ======================================================
  // CLOSE CART
  // ======================================================

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      {/* SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Grocery Sathi",
          url: "https://www.grocerysathi.com",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://www.grocerysathi.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        })}
      </script>

      <header className="navbar-header" role="banner">
        {/* TOP BAR */}
        <div className="navbar-top-bar">
          <div className="navbar-container navbar-top-container">
            {/* LOGO */}
            <div className="navbar-logo-container">
              <Link
                to={NAV_PATHS.HOME}
                aria-label="Grocery Sathi Homepage"
                onClick={closeMobileMenu}
              >
                <img
                  src={logo}
                  alt="Grocery Sathi - Fresh Organic Groceries Logo"
                  className="navbar-logo-img"
                />
              </Link>
            </div>

            {/* SEARCH */}
            <form
              className="navbar-search-box"
              action={NAV_PATHS.SEARCH}
              method="GET"
              role="search"
            >
              <Search
                className="navbar-search-icon"
                size={18}
                aria-hidden="true"
              />

              <input
                type="text"
                name="q"
                placeholder="Search fresh vegetables, fruits, groceries..."
                className="navbar-search-input"
                aria-label="Search products"
                required
              />
            </form>

            {/* CONTACT */}
            <div className="navbar-info-wrapper">
              <div className="navbar-info-item">
                <span className="navbar-info-title">Monday - Friday:</span>
                <span className="navbar-info-sub">8:00 AM - 9:00 PM</span>
              </div>

              <div className="navbar-info-item">
                <span className="navbar-info-title">Support 24/7:</span>
                <a
                  href="tel:+919887868746"
                  className="navbar-info-phone"
                  aria-label="Call Grocery Sathi Support"
                >
                  +91 98878 68746
                </a>
              </div>
            </div>

            {/* USER ACTIONS: 1. WISHLIST, 2. CART, 3. PROFILE */}
            <div className="navbar-user-actions">
              {/* 1. WISHLIST BUTTON */}
              <Link
                to={NAV_PATHS.WISHLIST}
                className="navbar-wishlist-container"
                onClick={closeMobileMenu}
                aria-label={`Wishlist with ${wishlistCount} saved items`}
                title="My Wishlist"
              >
                <div className="navbar-wishlist-icon-wrapper">
                  <Heart
                    size={21}
                    className="navbar-wishlist-icon"
                    aria-hidden="true"
                    fill={wishlistCount > 0 ? "#ef4444" : "none"}
                    color={wishlistCount > 0 ? "#ef4444" : "currentColor"}
                  />

                  {wishlistCount > 0 && (
                    <span
                      className="navbar-wishlist-badge"
                      aria-label={`${wishlistCount} items in wishlist`}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* 2. CART BUTTON (ICON ONLY) */}
              <Link
                to="/cart"
                className="navbar-cart-container"
                onClick={closeMobileMenu}
                aria-label={`Shopping Cart with ${cartItemCount} items`}
                title="My Cart"
              >
                <div className="navbar-cart-icon-wrapper">
                  <ShoppingBag
                    size={21}
                    className="navbar-cart-icon"
                    aria-hidden="true"
                  />

                  {cartItemCount > 0 && (
                    <span
                      className="navbar-cart-badge"
                      aria-label={`${cartItemCount} items in cart`}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* 3. USER PROFILE */}
              <UserAuth onNavigate={closeMobileMenu} />

              {/* MOBILE */}
              <button
                type="button"
                className={`navbar-mobile-toggle ${
                  isMobileMenuOpen ? "navbar-mobile-toggle-active" : ""
                }`}
                onClick={() => setIsMobileMenuOpen((previous) => !previous)}
                aria-expanded={isMobileMenuOpen}
                aria-label={
                  isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
              >
                {isMobileMenuOpen ? (
                  <X size={24} aria-hidden="true" />
                ) : (
                  <Menu size={24} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav
          className={`navbar-bottom-bar ${
            isMobileMenuOpen ? "navbar-mobile-active" : ""
          }`}
          aria-label="Main Navigation"
        >
          <div className="navbar-container navbar-bottom-container">
            {/* ALL CATEGORIES */}
            <div
              className="navbar-category-wrapper"
              onMouseEnter={() => {
                if (window.innerWidth > 768) {
                  setIsCategoryOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (window.innerWidth > 768) {
                  setIsCategoryOpen(false);
                  setActiveCategory(null);
                }
              }}
            >
              <button
                type="button"
                className={`navbar-category-btn ${
                  isCategoryOpen ? "navbar-category-btn-active" : ""
                }`}
                onClick={toggleCategoryDropdown}
                aria-expanded={isCategoryOpen}
                aria-controls="category-dropdown-menu"
              >
                <div className="navbar-category-btn-left">
                  <Grid size={18} aria-hidden="true" />
                  <span>All Categories</span>
                </div>

                <ChevronRight
                  size={18}
                  className={`navbar-category-arrow ${
                    isCategoryOpen ? "rotate-90" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* CATEGORY DROPDOWN - MODERN FLIP STYLE SHOWCASE */}
              <div
                id="category-dropdown-menu"
                className={`navbar-dropdown-menu navbar-flip-mega-dropdown ${
                  isCategoryOpen ? "navbar-dropdown-show" : ""
                }`}
              >
                {loadingCategories ? (
                  <div className="navbar-dropdown-loading">
                    <div className="navbar-flip-spinner"></div>
                    <span>Loading fresh categories...</span>
                  </div>
                ) : visibleCategories.length === 0 ? (
                  <div className="navbar-dropdown-empty">
                    <Package size={28} className="navbar-empty-icon" />
                    <span>No active categories found with products.</span>
                  </div>
                ) : (
                  <div className="navbar-mega-grid">
                    {/* LEFT COLUMN: CATEGORIES LIST */}
                    <div className="navbar-categories-sidebar">
                      <div className="navbar-sidebar-header">
                        <div className="navbar-sidebar-header-left">
                          <span>Categories</span>
                          <span className="navbar-sidebar-badge">
                            {visibleCategories.length}
                          </span>
                        </div>
                      </div>

                      {/* QUICK CATEGORY SEARCH BAR */}
                      <div className="navbar-cat-search-wrap">
                        <Search size={13} className="navbar-cat-search-icon" />
                        <input
                          type="text"
                          placeholder="Filter categories..."
                          value={categorySearchText}
                          onChange={(e) => setCategorySearchText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="navbar-cat-search-input"
                          aria-label="Filter categories"
                        />
                        {categorySearchText && (
                          <button
                            type="button"
                            className="navbar-cat-search-clear"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategorySearchText("");
                            }}
                            aria-label="Clear filter"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <ul className="navbar-categories-menu-list">
                        {filteredCategories.length === 0 ? (
                          <li className="navbar-cat-no-match">
                            <span>No categories matching "{categorySearchText}"</span>
                          </li>
                        ) : (
                          filteredCategories.map((category) => {
                            const categoryKey = getCategoryKey(category);
                            const categoryName = getCategoryName(category);
                            const isSelected = activeCategoryKey === categoryKey;
                            const count =
                              typeof category.productCount === "number"
                                ? category.productCount
                                : getProductsByCategory(category).length;
                            const icon = category.icon || "🛒";

                            return (
                              <li
                                key={categoryKey}
                                className={`navbar-cat-menu-item ${
                                  isSelected ? "navbar-cat-menu-item-active" : ""
                                }`}
                                onMouseEnter={() => {
                                  if (window.innerWidth > 768) {
                                    setActiveCategory(categoryKey);
                                  }
                                }}
                                onClick={(e) => handleCategoryItemClick(category, e)}
                                title={categoryName}
                              >
                                <div className="navbar-cat-item-content">
                                  <span className="navbar-cat-emoji">{icon}</span>
                                  <span className="navbar-cat-name">
                                    {categoryName}
                                  </span>
                                </div>
                                <div className="navbar-cat-item-right">
                                  <span
                                    className="navbar-cat-count-badge"
                                    title={`${count} products`}
                                  >
                                    {count}
                                  </span>
                                  <ChevronRight
                                    size={13}
                                    className={`navbar-cat-chevron ${
                                      isSelected ? "navbar-cat-chevron-active" : ""
                                    }`}
                                  />
                                </div>
                              </li>
                            );
                          })
                        )}
                      </ul>

                      {/* SIDEBAR FOOTER */}
                      <div className="navbar-sidebar-footer">
                        <span>
                          {filteredCategories.length} of {visibleCategories.length} active
                        </span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: INTERACTIVE FLIP SHOWCASE */}
                    <div className="navbar-showcase-panel">
                      {selectedCategory && (
                        <>
                          <div className="navbar-showcase-header">
                            <div className="navbar-showcase-title-wrap">
                              <span className="navbar-showcase-icon">
                                {selectedCategory.icon || "✨"}
                              </span>
                              <div>
                                <h3 className="navbar-showcase-title">
                                  {activeCategoryName}
                                </h3>
                                <p className="navbar-showcase-subtitle">
                                  {activeCategoryProducts.length}{" "}
                                  {activeCategoryProducts.length === 1 ? "item" : "items"}{" "}
                                  available &bull; Hover card to flip &amp; quick-buy
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="navbar-showcase-viewall-btn"
                              onClick={(e) => handleCategoryClick(selectedCategory, e)}
                            >
                              <span>Browse All</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>

                          {/* Subcategory Pills if any */}
                          {getSubCategories(selectedCategory).length > 0 && (
                            <div className="navbar-subcat-pills">
                              {getSubCategories(selectedCategory).map((sub) => {
                                const subName = getSubCategoryName(sub);
                                const subSlug = getSubCategorySlug(sub);
                                const catSlug = getCategorySlug(selectedCategory);
                                return (
                                  <Link
                                    key={subSlug || subName}
                                    to={`${NAV_PATHS.CATEGORIES}/${catSlug}/${subSlug}`}
                                    className="navbar-subcat-pill"
                                    onClick={(e) =>
                                      handleSubCategoryClick(selectedCategory, sub, e)
                                    }
                                  >
                                    {subName}
                                  </Link>
                                );
                              })}
                            </div>
                          )}

                          {/* 3D FLIP PRODUCTS GRID */}
                          <div className="navbar-flip-cards-grid">
                            {loadingProducts ? (
                              <div className="navbar-showcase-loading">
                                <div className="navbar-flip-spinner"></div>
                                <span>Loading items...</span>
                              </div>
                            ) : activeCategoryProducts.length === 0 ? (
                              <div className="navbar-showcase-empty">
                                <span>No items currently in stock for this category</span>
                              </div>
                            ) : (
                              activeCategoryProducts.slice(0, 6).map((product) => {
                                const productId = getProductId(product);
                                const productName = getProductName(product);
                                const image = getProductImage(product);
                                const currentPrice = getProductPrice(product);
                                const origPrice = getOriginalPrice(product);
                                const discountPercent =
                                  origPrice > currentPrice && origPrice > 0
                                    ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
                                    : 0;
                                const isFlipped = Boolean(flippedCards[productId]);
                                const unitText =
                                  product.unit?.name ||
                                  product.unit ||
                                  (product.unitNo ? `${product.unitNo} pack` : "");

                                return (
                                  <div
                                    key={productId}
                                    className={`navbar-flip-card ${
                                      isFlipped ? "flipped" : ""
                                    }`}
                                    onClick={(e) => {
                                      // If mobile, toggle flip on tap
                                      if (window.innerWidth <= 768) {
                                        toggleCardFlip(productId, e);
                                      } else {
                                        handleProductClick(product);
                                      }
                                    }}
                                  >
                                    <div className="navbar-flip-card-inner">
                                      {/* FRONT FACE */}
                                      <div className="navbar-flip-face navbar-flip-front">
                                        {discountPercent > 0 && (
                                          <span className="navbar-flip-discount-tag">
                                            {discountPercent}% OFF
                                          </span>
                                        )}
                                        <div className="navbar-flip-thumb-wrap">
                                          {image ? (
                                            <img
                                              src={image}
                                              alt={productName}
                                              className="navbar-flip-img"
                                              onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                              }}
                                            />
                                          ) : (
                                            <div className="navbar-flip-noimg">🛒</div>
                                          )}
                                        </div>
                                        <div className="navbar-flip-front-body">
                                          <h4
                                            className="navbar-flip-prod-title"
                                            title={productName}
                                          >
                                            {productName}
                                          </h4>
                                          <div className="navbar-flip-price-row">
                                            <span className="navbar-flip-price-curr">
                                              ₹{currentPrice}
                                            </span>
                                            {origPrice > currentPrice && (
                                              <span className="navbar-flip-price-orig">
                                                ₹{origPrice}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="navbar-flip-peek-tab">
                                          <span>Flip details</span>
                                          <Sparkles size={11} />
                                        </div>
                                      </div>

                                      {/* BACK FACE */}
                                      <div className="navbar-flip-face navbar-flip-back">
                                        <div className="navbar-flip-back-top">
                                          <span className="navbar-flip-instock-badge">
                                            In Stock
                                          </span>
                                          {discountPercent > 0 && (
                                            <span className="navbar-flip-save-label">
                                              Save ₹{origPrice - currentPrice}
                                            </span>
                                          )}
                                        </div>

                                        <h4 className="navbar-flip-back-prod-title">
                                          {productName}
                                        </h4>

                                        <div className="navbar-flip-specs">
                                          <div className="navbar-flip-spec-row">
                                            <span>Price:</span>
                                            <strong>₹{currentPrice}</strong>
                                          </div>
                                          {unitText && (
                                            <div className="navbar-flip-spec-row">
                                              <span>Pack:</span>
                                              <span>{unitText}</span>
                                            </div>
                                          )}
                                        </div>

                                        <div
                                          className="navbar-flip-card-actions"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            type="button"
                                            className="navbar-flip-quick-add-btn"
                                            onClick={(e) =>
                                              handleAddToCart(product, e)
                                            }
                                          >
                                            <ShoppingCart size={13} />
                                            <span>Add</span>
                                          </button>
                                          <button
                                            type="button"
                                            className="navbar-flip-quick-view-btn"
                                            onClick={() =>
                                              handleProductClick(product)
                                            }
                                            title="View Details"
                                          >
                                            <Eye size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {activeCategoryProducts.length > 0 && (
                            <div className="navbar-showcase-footer">
                              <div className="navbar-showcase-footer-left">
                                <Sparkles size={12} className="navbar-footer-sparkle" />
                                <span>
                                  Showing {Math.min(activeCategoryProducts.length, 6)} of {activeCategoryProducts.length} items
                                </span>
                              </div>
                              <button
                                type="button"
                                className="navbar-showcase-footer-link"
                                onClick={(e) => handleCategoryClick(selectedCategory, e)}
                              >
                                View all {activeCategoryProducts.length} products &rarr;
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SPECIAL OFFER / COUPON BANNER */}
            <div className="navbar-offer-text">
              {publicCoupon ? (
                <div className="navbar-offer-content">
                  <span className="navbar-offer-highlight">
                    {publicCoupon.discountType === "percentage"
                      ? `-${publicCoupon.discountValue}% off`
                      : `Flat ₹${publicCoupon.discountValue} off`}
                  </span>{" "}
                  <span className="navbar-offer-subtext">
                    {publicCoupon.minPurchase > 0
                      ? `on your order over ₹${publicCoupon.minPurchase}.`
                      : "on your grocery order."}
                  </span>

                  {/* ULTRA-PREMIUM COUPON CODE PILL */}
                  <button
                    type="button"
                    className={`navbar-premium-coupon-pill ${copiedCouponCode ? "copied" : ""}`}
                    onClick={() => handleCopyCouponCode(publicCoupon.code)}
                    title="Click to copy coupon code"
                    aria-label={`Coupon code ${publicCoupon.code}. Click to copy`}
                  >
                    <span className="navbar-coupon-pill-shine" aria-hidden="true" />
                    <span className="navbar-coupon-pill-tag">
                      <Ticket size={13} className="navbar-coupon-pill-icon" />
                      <span>CODE:</span>
                    </span>
                    <span className="navbar-coupon-pill-code">{publicCoupon.code}</span>
                    <span className="navbar-coupon-pill-action">
                      {copiedCouponCode ? (
                        <>
                          <Check size={12} className="copy-icon check-icon" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="copy-icon" />
                          <span>COPY</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <strong>Fresh Grocery</strong> delivered daily to your doorstep.{" "}
                  <Link to={NAV_PATHS.HOME} onClick={closeMobileMenu}>
                    Shop Now
                  </Link>
                </>
              )}
            </div>

            {/* QUICK NAVIGATION */}
            <div className="navbar-nav-links">
              <Link to={NAV_PATHS.HOME} onClick={closeMobileMenu}>
                Home
              </Link>

              <Link to={NAV_PATHS.FAQ} onClick={closeMobileMenu}>
                Faq
              </Link>

              <Link to={NAV_PATHS.BLOG} onClick={closeMobileMenu}>
                Blog
              </Link>

              <Link to={NAV_PATHS.CONTACT} onClick={closeMobileMenu}>
                Contact
              </Link>

              <Link to={NAV_PATHS.ABOUT} onClick={closeMobileMenu}>
                About Us
              </Link>

              <Link
                to={NAV_PATHS.WISHLIST}
                onClick={closeMobileMenu}
                className="navbar-nav-mobile-only"
              >
                Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
              </Link>

              <Link
                to={NAV_PATHS.CART}
                onClick={closeMobileMenu}
                className="navbar-nav-mobile-only"
              >
                Shopping Cart {cartItemCount > 0 ? `(${cartItemCount})` : ""}
              </Link>
            </div>
          </div>
        </nav>

        {/* MOBILE MENU BACKDROP */}
        {isMobileMenuOpen && (
          <div
            className="navbar-mobile-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </header>

      {/* PUBLIC COUPON DETAILS POPUP / MODAL */}
      {isCouponModalOpen && publicCoupon && (
        <div
          className="navbar-coupon-modal-backdrop"
          onClick={() => setIsCouponModalOpen(false)}
        >
          <div
            className="navbar-coupon-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="navbar-coupon-modal-close"
              onClick={() => setIsCouponModalOpen(false)}
              aria-label="Close coupon modal"
            >
              <X size={18} />
            </button>

            <div className="navbar-coupon-modal-badge">
              <Sparkles size={15} /> Store Coupon Offer
            </div>

            <h3 className="navbar-coupon-modal-title">
              {publicCoupon.title || "Special Store Discount"}
            </h3>

            {publicCoupon.description && (
              <p className="navbar-coupon-modal-desc">
                {publicCoupon.description}
              </p>
            )}

            <div className="navbar-coupon-code-box">
              <div className="navbar-coupon-code-left">
                <Ticket size={18} className="navbar-coupon-ticket-icon" />
                <span className="navbar-coupon-code-text">
                  {publicCoupon.code}
                </span>
              </div>
              <button
                type="button"
                className="navbar-coupon-copy-btn"
                onClick={() => handleCopyCouponCode(publicCoupon.code)}
              >
                {copiedCouponCode ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="navbar-coupon-details-grid">
              <div className="coupon-detail-item">
                <span className="detail-label">Discount</span>
                <span className="detail-val highlight">
                  {publicCoupon.discountType === "percentage"
                    ? `${publicCoupon.discountValue}% OFF`
                    : `₹${publicCoupon.discountValue} FLAT`}
                </span>
              </div>
              <div className="coupon-detail-item">
                <span className="detail-label">Min Purchase</span>
                <span className="detail-val">
                  {publicCoupon.minPurchase > 0
                    ? `₹${publicCoupon.minPurchase}`
                    : "No Minimum"}
                </span>
              </div>
              {publicCoupon.maxDiscount && (
                <div className="coupon-detail-item">
                  <span className="detail-label">Max Discount</span>
                  <span className="detail-val">Up to ₹{publicCoupon.maxDiscount}</span>
                </div>
              )}
              <div className="coupon-detail-item">
                <span className="detail-label">Valid Until</span>
                <span className="detail-val">
                  {publicCoupon.expiryDate
                    ? new Date(publicCoupon.expiryDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "No Expiry"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="navbar-coupon-apply-btn"
              onClick={() => {
                handleCopyCouponCode(publicCoupon.code);
                setIsCouponModalOpen(false);
                navigate(NAV_PATHS.CART);
              }}
            >
              Copy Code & Go to Cart →
            </button>
          </div>
        </div>
      )}

      
    </>
  );
};

export default Navbar;

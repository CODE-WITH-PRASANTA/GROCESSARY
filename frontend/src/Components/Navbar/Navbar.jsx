import React, { useEffect, useState, useCallback, useMemo } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Search,
  User,
  ShoppingBag,
  Grid,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import logo from "../../assets/Grocessary Sathi Png.png";
import "./Navbar.css";
import CartSection from "../CartSection/CartSection";
import UserAuth from "../UserAuth/UserAuth";
import API from "../../api/axios";

// ======================================================
// NAVIGATION PATHS
// ======================================================

const NAV_PATHS = {
  HOME: "/",
  ACCOUNT: "/login",
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

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

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

  const getProductImage = (product) => {
    if (!product) return "";

    let image =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : product?.image || product?.thumbnail || product?.imageUrl || "";

    if (!image) return "";

    if (typeof image === "object") {
      image = image?.url || image?.path || image?.secure_url || image?.src || "";
    }

    if (!image) return "";

    const imageString = String(image).trim();

    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://")
    ) {
      return imageString;
    }

    // Use API's base URL prefix
    const base =
      API.defaults.baseURL?.replace(/\/api\/?$/, "") ||
      "http://localhost:5000";

    return `${base}${imageString.startsWith("/") ? imageString : `/${imageString}`}`;
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

    return discountPrice > 0 && currentPrice > 0 && originalPrice > currentPrice;
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

      const { data: productResult } = await API.get("/products");

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

        const totalQuantity = guestCart.reduce((total, item) => {
          return total + Number(item?.quantity || 0);
        }, 0);

        const totalPrice = guestCart.reduce((total, item) => {
          const price = Number(
            item?.discountPrice > 0 ? item.discountPrice : item?.price || 0,
          );

          const quantity = Number(item?.quantity || 0);

          return total + price * quantity;
        }, 0);

        setCartItemCount(totalQuantity);
        setCartTotal(totalPrice);

        return;
      }

      // ==================================================
      // LOGGED-IN CART
      // ==================================================

      const { data } = await API.get("/cart");

      const items =
        data?.cart?.items || data?.data?.cart?.items || data?.data?.items || [];

      if (!Array.isArray(items)) {
        setCartItemCount(0);
        setCartTotal(0);
        return;
      }

      const totalQuantity = items.reduce(
        (total, item) => total + Number(item?.quantity || 0),
        0,
      );

      const totalPrice = items.reduce((total, item) => {
        const product = item?.product || {};
        const price = getProductPrice(product);
        const quantity = Number(item?.quantity || 0);

        return total + price * quantity;
      }, 0);

      setCartItemCount(totalQuantity);
      setCartTotal(Number.isFinite(totalPrice) ? totalPrice : 0);
    } catch (error) {
      console.error("Navbar cart fetch error:", error);

      // If token is invalid, we simply reset the count.
      if (error.response?.status === 401 || error.response?.status === 403) {
        setCartItemCount(0);
        setCartTotal(0);
        return;
      }

      setCartItemCount(0);
      setCartTotal(0);
    }
  }, []);

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      const { data: result } = await API.get("/categories");

      let categoryList = [];

      if (Array.isArray(result)) categoryList = result;
      else if (Array.isArray(result?.categories)) categoryList = result.categories;
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

      setCategories(activeCategories);
    } catch (error) {
      console.error("Navbar category fetch error:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

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
    const handleCartUpdated = () => {
      fetchCart();
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
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, [fetchCart]);

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
  // ONLY SHOW CATEGORY IF PRODUCT COUNT > 0
  // ======================================================

  const visibleCategories = useMemo(() => {
    if (loadingProducts) return [];

    return categories.filter((category) => {
      const name = getCategoryName(category);
      if (!name) return false;

      const categoryProducts = getProductsByCategory(category);
      return categoryProducts.length > 0;
    });
  }, [categories, loadingProducts, getProductsByCategory]);

  // ======================================================
  // OPEN PRODUCT DETAILS
  // ======================================================

  const handleProductClick = (product) => {
    if (!product) return;

    const productId = getProductId(product);
    if (!productId) {
      console.error("Product ID not found:", product);
      return;
    }

    closeCategoryMenu();
    closeMobileMenu();

    navigate(`/productdetails/${productId}`);
  };

  // ======================================================
  // CATEGORY CLICK
  // ======================================================

  const handleCategoryClick = (category, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!category) return;

    const categoryKey = getCategoryKey(category);

    setActiveCategory((previous) =>
      previous === categoryKey ? null : categoryKey,
    );
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

            {/* USER ACTIONS */}
            <div className="navbar-user-actions">
              {/* USER */}
              <UserAuth onNavigate={closeMobileMenu} />

              {/* CART */}
              <button
                type="button"
                className="navbar-cart-container"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Open Shopping Cart. ${cartItemCount} items. Total ₹${cartTotal.toFixed(
                  2,
                )}`}
              >
                <div className="navbar-cart-text">
                  <span className="navbar-cart-label">My Cart:</span>
                  <span className="navbar-cart-price">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="navbar-cart-icon-wrapper">
                  <ShoppingBag
                    size={22}
                    className="navbar-cart-icon"
                    aria-hidden="true"
                  />

                  <span
                    className="navbar-cart-badge"
                    aria-label={`${cartItemCount} items in cart`}
                  >
                    {cartItemCount}
                  </span>
                </div>
              </button>

              {/* MOBILE */}
              <button
                type="button"
                className="navbar-mobile-toggle"
                onClick={() => setIsMobileMenuOpen((previous) => !previous)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
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
            <div className="navbar-category-wrapper">
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

              {/* CATEGORY DROPDOWN */}
              <div
                id="category-dropdown-menu"
                className={`navbar-dropdown-menu ${
                  isCategoryOpen ? "navbar-dropdown-show" : ""
                }`}
              >
                <ul className="navbar-dropdown-list">
                  {loadingCategories ? (
                    <li className="navbar-dropdown-item">
                      <div className="navbar-dropdown-item-header">
                        <span className="navbar-category-title-text">
                          Loading categories...
                        </span>
                      </div>
                    </li>
                  ) : visibleCategories.length === 0 ? (
                    <li className="navbar-dropdown-item">
                      <div className="navbar-dropdown-item-header">
                        <span className="navbar-category-title-text">
                          {loadingProducts
                            ? "Loading products..."
                            : "No categories found"}
                        </span>
                      </div>
                    </li>
                  ) : (
                    visibleCategories.map((category) => {
                      const categoryKey = getCategoryKey(category);
                      const categoryName = getCategoryName(category);
                      const subCategories = getSubCategories(category);
                      const categoryProducts = getProductsByCategory(category);
                      const isSubOpen = activeCategory === categoryKey;

                      return (
                        <li key={categoryKey} className="navbar-dropdown-item">
                          <div className="navbar-dropdown-item-header">
                            <button
                              type="button"
                              className="navbar-dropdown-title-link"
                              onClick={(event) =>
                                handleCategoryClick(category, event)
                              }
                            >
                              <Grid
                                size={18}
                                className="navbar-dropdown-icon"
                                aria-hidden="true"
                              />
                              <span className="navbar-category-title-text">
                                {categoryName}
                              </span>
                            </button>

                            <button
                              type="button"
                              className="navbar-sub-toggle-btn"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleCategoryToggle(categoryKey);
                              }}
                              aria-expanded={isSubOpen}
                              aria-label={`Show ${categoryName} products`}
                            >
                              {isSubOpen ? (
                                <ChevronDown size={16} aria-hidden="true" />
                              ) : (
                                <ChevronRight size={16} aria-hidden="true" />
                              )}
                            </button>
                          </div>

                          <div
                            className={`navbar-sub-dropdown ${
                              isSubOpen ? "navbar-sub-dropdown-show" : ""
                            }`}
                          >
                            <ul className="navbar-sub-list">
                              {subCategories.map((subCategory) => {
                                const subKey =
                                  getSubCategoryId(subCategory) ||
                                  getSubCategorySlug(subCategory) ||
                                  getSubCategoryName(subCategory);

                                const subName = getSubCategoryName(subCategory);
                                const subSlug = getSubCategorySlug(subCategory);

                                if (!subName) return null;

                                return (
                                  <li key={subKey} className="navbar-sub-item">
                                    <Link
                                      to={`${NAV_PATHS.CATEGORIES}/${getCategorySlug(
                                        category,
                                      )}/${subSlug}`}
                                      onClick={(event) =>
                                        handleSubCategoryClick(
                                          category,
                                          subCategory,
                                          event,
                                        )
                                      }
                                    >
                                      {subName}
                                    </Link>
                                  </li>
                                );
                              })}

                              {loadingProducts ? (
                                <li className="navbar-sub-item">
                                  Loading products...
                                </li>
                              ) : (
                                categoryProducts.map((product) => {
                                  const productId = getProductId(product);
                                  const productName = getProductName(product);
                                  const image = getProductImage(product);

                                  if (!productId) return null;

                                  return (
                                    <li
                                      key={productId}
                                      className="navbar-sub-item"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleProductClick(product)
                                        }
                                        className="navbar-product-item"
                                      >
                                        {image && (
                                          <img
                                            src={image}
                                            alt={productName}
                                            style={{
                                              width: "35px",
                                              height: "35px",
                                              objectFit: "cover",
                                              borderRadius: "5px",
                                              marginRight: "8px",
                                              verticalAlign: "middle",
                                            }}
                                            onError={(event) => {
                                              event.currentTarget.style.display =
                                                "none";
                                            }}
                                          />
                                        )}

                                        <span className="navbar-product-content">
                                          <span className="navbar-product-name">
                                            {productName}
                                          </span>
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })
                              )}
                            </ul>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>

            {/* SPECIAL OFFER */}
            <div className="navbar-offer-text">
              <strong>-30% off</strong> on your first order over ₹200.{" "}
              <Link
                to="/promotions/first-order-discount"
                onClick={closeMobileMenu}
              >
                Show More
              </Link>
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
            </div>
          </div>
        </nav>
      </header>

      {/* CART POPUP */}
      <CartSection
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpen={() => setIsCartOpen(true)}
      />
    </>
  );
};

export default Navbar;
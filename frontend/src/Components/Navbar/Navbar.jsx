import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

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

// ======================================================
// NAVIGATION PATHS
// ======================================================

const NAV_PATHS = {
  HOME: "/",
  ACCOUNT: "/account",
  CART: "/cart",
  FAQ: "/faq",
  BLOG: "/blogs",
  CONTACT: "/contact-us",
  ABOUT: "/about-us",
  SEARCH: "/search",
  CATEGORIES: "/categories",
};

const API_BASE_URL = "http://localhost:5000/api";
const SERVER_BASE_URL = "http://localhost:5000";

// ======================================================
// COMPONENT
// ======================================================

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ======================================================
  // CART POPUP
  // ======================================================

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  // ======================================================
  // CATEGORY
  // ======================================================

  const [isCategoryOpen, setIsCategoryOpen] =
    useState(false);

  const [activeCategory, setActiveCategory] =
    useState(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [categories, setCategories] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  // ======================================================
  // USER
  // ======================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  const [userLoading, setUserLoading] =
    useState(true);

  // ======================================================
  // CART
  // ======================================================

  const [cartItemCount, setCartItemCount] =
    useState(0);

  const [cartTotal, setCartTotal] =
    useState(0);

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
  // IMPORTANT FIX
  // Prevent {_id, name} object rendering
  // ======================================================

  const getSafeString = (
    value,
    fallback = ""
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return fallback;
    }

    if (typeof value === "string") {
      return value.trim();
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    if (
      typeof value === "object"
    ) {
      return (
        String(
          value?.name ||
            value?.title ||
            value?.label ||
            value?.value ||
            value?.categoryName ||
            value?.brandName ||
            value?.unitName ||
            ""
        ).trim() || fallback
      );
    }

    return fallback;
  };

  // ======================================================
  // GET OBJECT ID
  // ======================================================

  const getObjectId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value?._id ||
        value?.id ||
        value?.value ||
        ""
      );
    }

    return "";
  };

  // ======================================================
  // USER NAME
  // ======================================================

  const getUserName = (user) => {
    if (!user) {
      return "";
    }

    return getSafeString(
      user?.name ||
        user?.fullName ||
        user?.username ||
        user?.userName ||
        user?.firstName ||
        user?.email?.split("@")[0],
      "User"
    );
  };

  // ======================================================
  // CATEGORY NAME
  // ======================================================

  const getCategoryName = (category) => {
    if (!category) {
      return "";
    }

    return getSafeString(
      category,
      ""
    );
  };

  // ======================================================
  // CATEGORY ID
  // ======================================================

  const getCategoryId = (category) => {
    return getObjectId(category);
  };

  // ======================================================
  // CATEGORY SLUG
  // ======================================================

  const getCategorySlug = (category) => {
    if (!category) {
      return "";
    }

    if (
      typeof category === "string"
    ) {
      return category.trim();
    }

    return getSafeString(
      category?.slug ||
        category?._id ||
        category?.id ||
        "",
      ""
    );
  };

  // ======================================================
  // CATEGORY KEY
  // ======================================================

  const getCategoryKey = (category) => {
    if (!category) {
      return "";
    }

    return (
      category?._id ||
      category?.id ||
      category?.slug ||
      category?.name ||
      ""
    );
  };

  // ======================================================
  // SUBCATEGORY NAME
  // ======================================================

  const getSubCategoryName = (
    subCategory
  ) => {
    if (!subCategory) {
      return "";
    }

    return getSafeString(
      subCategory?.name ||
        subCategory?.title ||
        subCategory?.categoryName ||
        subCategory,
      ""
    );
  };

  // ======================================================
  // SUBCATEGORY ID
  // ======================================================

  const getSubCategoryId = (
    subCategory
  ) => {
    return getObjectId(
      subCategory
    );
  };

  // ======================================================
  // SUBCATEGORY SLUG
  // ======================================================

  const getSubCategorySlug = (
    subCategory
  ) => {
    if (!subCategory) {
      return "";
    }

    if (
      typeof subCategory ===
      "string"
    ) {
      return subCategory.trim();
    }

    return getSafeString(
      subCategory?.slug ||
        subCategory?._id ||
        subCategory?.id ||
        "",
      ""
    );
  };

  // ======================================================
  // GET SUBCATEGORIES
  // ======================================================

  const getSubCategories = (
    category
  ) => {
    if (!category) {
      return [];
    }

    const list =
      category?.subCategories ||
      category?.subcategories ||
      category?.children ||
      [];

    if (!Array.isArray(list)) {
      return [];
    }

    return list.filter(Boolean);
  };

  // ======================================================
  // GET PRODUCT ID
  // ======================================================

  const getProductId = (
    product
  ) => {
    if (!product) {
      return "";
    }

    return getObjectId(product);
  };

  // ======================================================
  // PRODUCT NAME
  // ======================================================

  const getProductName = (
    product
  ) => {
    if (!product) {
      return "Unnamed Product";
    }

    return getSafeString(
      product?.productName ||
        product?.name ||
        product?.title,
      "Unnamed Product"
    );
  };

  // ======================================================
  // PRODUCT CATEGORY
  // ======================================================

  const getProductCategory = (
    product
  ) => {
    if (!product) {
      return null;
    }

    return (
      product?.category ||
      product?.categoryId ||
      product?.category_id ||
      null
    );
  };

  // ======================================================
  // PRODUCT CATEGORY ID
  // ======================================================

  const getProductCategoryId = (
    product
  ) => {
    return getObjectId(
      getProductCategory(product)
    );
  };

  // ======================================================
  // PRODUCT CATEGORY NAME
  // ======================================================

  const getProductCategoryName = (
    product
  ) => {
    return getCategoryName(
      getProductCategory(product)
    );
  };

  // ======================================================
  // PRODUCT IMAGE
  // Supports:
  // images[]
  // image
  // thumbnail
  // imageUrl
  // ======================================================

  const getProductImage = (
    product
  ) => {
    if (!product) {
      return "";
    }

    let image =
      Array.isArray(
        product?.images
      ) &&
      product.images.length > 0
        ? product.images[0]
        : product?.image ||
          product?.thumbnail ||
          product?.imageUrl ||
          "";

    if (!image) {
      return "";
    }

    if (
      typeof image === "object"
    ) {
      image =
        image?.url ||
        image?.path ||
        image?.secure_url ||
        image?.src ||
        "";
    }

    if (!image) {
      return "";
    }

    const imageString =
      String(image).trim();

    if (
      imageString.startsWith(
        "http://"
      ) ||
      imageString.startsWith(
        "https://"
      )
    ) {
      return imageString;
    }

    return `${SERVER_BASE_URL}${
      imageString.startsWith("/")
        ? imageString
        : `/${imageString}`
    }`;
  };

  // ======================================================
  // PRODUCT PRICE
  // ======================================================

  const getProductPrice = (
    product
  ) => {
    if (!product) {
      return 0;
    }

    const discountPrice =
      Number(
        product?.discountPrice ||
          0
      );

    if (
      Number.isFinite(
        discountPrice
      ) &&
      discountPrice > 0
    ) {
      return discountPrice;
    }

    const price =
      Number(
        product?.price ??
          product?.sellingPrice ??
          0
      );

    return Number.isFinite(price)
      ? price
      : 0;
  };

  // ======================================================
  // FETCH CURRENT USER
  // ======================================================

  const fetchCurrentUser =
    useCallback(async () => {
      try {
        const token =
          getToken();

        if (!token) {
          setCurrentUser(null);
          setUserLoading(false);
          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/auth/me`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            localStorage.removeItem(
              "token"
            );

            setCurrentUser(null);
            setCartItemCount(0);
            setCartTotal(0);
          }

          setUserLoading(false);
          return;
        }

        const result =
          await response.json();

        const user =
          result?.user ||
          result?.data?.user ||
          result?.data ||
          null;

        setCurrentUser(user);
      } catch (error) {
        console.error(
          "Fetch current user error:",
          error
        );

        setCurrentUser(null);
      } finally {
        setUserLoading(false);
      }
    }, []);

  // ======================================================
  // FETCH CART
  // ======================================================

  const fetchCart =
    useCallback(async () => {
      try {
        const token =
          getToken();

        // ==================================================
        // GUEST CART
        // ==================================================

        if (!token) {
          const storedCart =
            localStorage.getItem(
              "guestCart"
            );

          if (!storedCart) {
            setCartItemCount(0);
            setCartTotal(0);
            return;
          }

          let guestCart;

          try {
            guestCart =
              JSON.parse(
                storedCart
              );
          } catch {
            guestCart = [];
          }

          if (
            !Array.isArray(
              guestCart
            )
          ) {
            localStorage.removeItem(
              "guestCart"
            );

            setCartItemCount(0);
            setCartTotal(0);
            return;
          }

          const validCart =
            guestCart.filter(
              (item) =>
                item &&
                Number(
                  item?.quantity
                ) > 0
            );

          if (
            validCart.length !==
            guestCart.length
          ) {
            localStorage.setItem(
              "guestCart",
              JSON.stringify(
                validCart
              )
            );
          }

          const totalQuantity =
            validCart.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item?.quantity ||
                    0
                ),
              0
            );

          const totalPrice =
            validCart.reduce(
              (
                total,
                item
              ) => {
                const price =
                  Number(
                    item?.price ??
                      item?.sellingPrice ??
                      item?.discountPrice ??
                      0
                  );

                const quantity =
                  Number(
                    item?.quantity ||
                      0
                  );

                return (
                  total +
                  price *
                    quantity
                );
              },
              0
            );

          setCartItemCount(
            totalQuantity
          );

          setCartTotal(
            Number.isFinite(
              totalPrice
            )
              ? totalPrice
              : 0
          );

          return;
        }

        // ==================================================
        // LOGGED-IN CART
        // ==================================================

        const response =
          await fetch(
            `${API_BASE_URL}/cart`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            setCartItemCount(0);
            setCartTotal(0);
          }

          return;
        }

        const result =
          await response.json();

        const items =
          result?.cart?.items ||
          result?.data?.cart?.items ||
          result?.data?.items ||
          [];

        if (
          !Array.isArray(items)
        ) {
          setCartItemCount(0);
          setCartTotal(0);
          return;
        }

        const totalQuantity =
          items.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item?.quantity ||
                  0
              ),
            0
          );

        const totalPrice =
          items.reduce(
            (
              total,
              item
            ) => {
              const product =
                item?.product ||
                {};

              const price =
                getProductPrice(
                  product
                );

              const quantity =
                Number(
                  item?.quantity ||
                    0
                );

              return (
                total +
                price *
                  quantity
              );
            },
            0
          );

        setCartItemCount(
          totalQuantity
        );

        setCartTotal(
          Number.isFinite(
            totalPrice
          )
            ? totalPrice
            : 0
        );
      } catch (error) {
        console.error(
          "Navbar cart fetch error:",
          error
        );

        setCartItemCount(0);
        setCartTotal(0);
      }
    }, []);

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  const fetchCategories =
    useCallback(async () => {
      try {
        setLoadingCategories(
          true
        );

        const response =
          await fetch(
            `${API_BASE_URL}/categories`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Category API failed: ${response.status}`
          );
        }

        const result =
          await response.json();

       

        let categoryList = [];

        if (
          Array.isArray(result)
        ) {
          categoryList =
            result;
        } else if (
          Array.isArray(
            result?.categories
          )
        ) {
          categoryList =
            result.categories;
        } else if (
          Array.isArray(
            result?.data
          )
        ) {
          categoryList =
            result.data;
        } else if (
          Array.isArray(
            result?.data?.categories
          )
        ) {
          categoryList =
            result.data
              .categories;
        }

        // ==================================================
        // ONLY VALID CATEGORIES
        // ==================================================

        const activeCategories =
          categoryList.filter(
            (category) => {
              if (!category) {
                return false;
              }

              const status =
                String(
                  category?.status ??
                    "active"
                )
                  .trim()
                  .toLowerCase();

              return (
                status ===
                  "active" ||
                status ===
                  "true" ||
                status ===
                  "1" ||
                category?.status ===
                  undefined
              );
            }
          );

        setCategories(
          activeCategories
        );
      } catch (error) {
        console.error(
          "Navbar category fetch error:",
          error
        );

        setCategories([]);
      } finally {
        setLoadingCategories(
          false
        );
      }
    }, []);

  // ======================================================
  // FETCH ALL PRODUCTS
  // ======================================================

  const fetchProducts =
    useCallback(async () => {
      try {
        setLoadingProducts(
          true
        );

        const response =
          await fetch(
            `${API_BASE_URL}/products`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Products API failed: ${response.status}`
          );
        }

        const result =
          await response.json();

       

        let productList = [];

        if (
          Array.isArray(result)
        ) {
          productList =
            result;
        } else if (
          Array.isArray(
            result?.products
          )
        ) {
          productList =
            result.products;
        } else if (
          Array.isArray(
            result?.data
          )
        ) {
          productList =
            result.data;
        } else if (
          Array.isArray(
            result?.data?.products
          )
        ) {
          productList =
            result.data.products;
        }

        // ==================================================
        // ACTIVE PRODUCTS ONLY
        // ==================================================

        const activeProducts =
          productList.filter(
            (product) => {
              if (!product) {
                return false;
              }

              const status =
                String(
                  product?.status ??
                    "active"
                )
                  .trim()
                  .toLowerCase();

              return (
                status ===
                  "active" ||
                status ===
                  "true" ||
                status ===
                  "1" ||
                product?.status ===
                  undefined
              );
            }
          );

        setProducts(
          activeProducts
        );
      } catch (error) {
        console.error(
          "Navbar product fetch error:",
          error
        );

        setProducts([]);
      } finally {
        setLoadingProducts(
          false
        );
      }
    }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCurrentUser();
    fetchCart();
  }, [
    fetchCategories,
    fetchProducts,
    fetchCurrentUser,
    fetchCart,
  ]);

  // ======================================================
  // REFRESH CART WHEN ROUTE CHANGES
  // ======================================================

  useEffect(() => {
    fetchCart();
  }, [
    location.pathname,
    fetchCart,
  ]);

  // ======================================================
  // CART UPDATED EVENT
  // ======================================================

  useEffect(() => {
    const handleCartUpdated =
      () => {
        fetchCart();
      };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated
      );
    };
  }, [fetchCart]);

  // ======================================================
  // AUTH UPDATED EVENT
  // ======================================================

  useEffect(() => {
    const handleAuthChanged =
      () => {
        fetchCurrentUser();
        fetchCart();
      };

    window.addEventListener(
      "authChanged",
      handleAuthChanged
    );

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );
    };
  }, [
    fetchCurrentUser,
    fetchCart,
  ]);

  // ======================================================
  // STORAGE EVENT
  // ======================================================

  useEffect(() => {
    const handleStorage = (
      event
    ) => {
      if (
        event.key ===
          "token" ||
        event.key ===
          "guestCart"
      ) {
        fetchCurrentUser();
        fetchCart();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [
    fetchCurrentUser,
    fetchCart,
  ]);

  // ======================================================
  // GET PRODUCTS BY CATEGORY
  // ======================================================

  const getProductsByCategory =
    useCallback(
      (category) => {
        if (
          !category ||
          !Array.isArray(products)
        ) {
          return [];
        }

        const categoryId =
          String(
            getCategoryId(
              category
            ) || ""
          )
            .trim()
            .toLowerCase();

        const categoryName =
          getCategoryName(
            category
          )
            .trim()
            .toLowerCase();

        return products.filter(
          (product) => {
            if (!product) {
              return false;
            }

            const productStatus =
              String(
                product?.status ??
                  "active"
              )
                .trim()
                .toLowerCase();

            if (
              productStatus !==
                "active" &&
              productStatus !==
                "true" &&
              productStatus !==
                "1"
            ) {
              return false;
            }

            const productCategory =
              getProductCategory(
                product
              );

            if (
              !productCategory
            ) {
              return false;
            }

            const productCategoryId =
              String(
                getObjectId(
                  productCategory
                ) || ""
              )
                .trim()
                .toLowerCase();

            const productCategoryName =
              getCategoryName(
                productCategory
              )
                .trim()
                .toLowerCase();

            // ID MATCH
            if (
              categoryId &&
              productCategoryId &&
              categoryId ===
                productCategoryId
            ) {
              return true;
            }

            // NAME MATCH
            if (
              categoryName &&
              productCategoryName &&
              categoryName ===
                productCategoryName
            ) {
              return true;
            }

            // STRING CATEGORY
            if (
              typeof productCategory ===
              "string"
            ) {
              const value =
                productCategory
                  .trim()
                  .toLowerCase();

              if (
                value ===
                  categoryId ||
                value ===
                  categoryName
              ) {
                return true;
              }
            }

            return false;
          }
        );
      },
      [products]
    );

  // ======================================================
  // ONLY SHOW CATEGORY IF PRODUCT COUNT > 0
  // ======================================================

  const visibleCategories =
    useMemo(() => {
      if (
        loadingProducts
      ) {
        return [];
      }

      return categories.filter(
        (category) => {
          const name =
            getCategoryName(
              category
            );

          if (!name) {
            return false;
          }

          const categoryProducts =
            getProductsByCategory(
              category
            );

          return (
            categoryProducts.length >
            0
          );
        }
      );
    }, [
      categories,
      loadingProducts,
      getProductsByCategory,
    ]);

  // ======================================================
  // OPEN PRODUCT DETAILS
  // ======================================================

  const handleProductClick = (
    product
  ) => {
    if (!product) {
      return;
    }

    const productId =
      getProductId(product);

    if (!productId) {
      console.error(
        "Product ID not found:",
        product
      );

      return;
    }

    closeCategoryMenu();
    closeMobileMenu();

    navigate(
      `/productdetails/${productId}`
    );
  };

  // ======================================================
  // CATEGORY CLICK
  // ======================================================

  const handleCategoryClick = (
    category,
    event
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!category) {
      return;
    }

    const categoryKey =
      getCategoryKey(category);

    setActiveCategory(
      (previous) =>
        previous ===
        categoryKey
          ? null
          : categoryKey
    );
  };

  // ======================================================
  // CATEGORY PAGE
  // ======================================================

  const handleCategoryPageClick =
    (
      category,
      event
    ) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const slug =
        getCategorySlug(
          category
        );

      closeCategoryMenu();
      closeMobileMenu();

      if (slug) {
        navigate(
          `${NAV_PATHS.CATEGORIES}/${slug}`
        );
      }
    };

  // ======================================================
  // SUBCATEGORY CLICK
  // ======================================================

  const handleSubCategoryClick =
    (
      category,
      subCategory,
      event
    ) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const categorySlug =
        getCategorySlug(
          category
        );

      const subCategorySlug =
        getSubCategorySlug(
          subCategory
        );

      closeCategoryMenu();
      closeMobileMenu();

      if (
        categorySlug &&
        subCategorySlug
      ) {
        navigate(
          `${NAV_PATHS.CATEGORIES}/${categorySlug}/${subCategorySlug}`
        );

        return;
      }

      if (subCategorySlug) {
        navigate(
          `${NAV_PATHS.CATEGORIES}/${subCategorySlug}`
        );
      }
    };

  // ======================================================
  // TOGGLE CATEGORY DROPDOWN
  // ======================================================

  const toggleCategoryDropdown =
    () => {
      setIsCategoryOpen(
        (previous) => {
          const next =
            !previous;

          if (!next) {
            setActiveCategory(
              null
            );
          }

          return next;
        }
      );
    };

  // ======================================================
  // CATEGORY TOGGLE
  // ======================================================

  const handleCategoryToggle = (
    id
  ) => {
    setActiveCategory(
      (previous) =>
        previous === id
          ? null
          : id
    );
  };

  // ======================================================
  // CLOSE MOBILE
  // ======================================================

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(
      false
    );
  };

  // ======================================================
  // CLOSE CATEGORY
  // ======================================================

  const closeCategoryMenu = () => {
    setIsCategoryOpen(
      false
    );

    setActiveCategory(
      null
    );
  };

  // ======================================================
  // ACCOUNT
  // ======================================================

  const handleAccountClick = (
    event
  ) => {
    const token =
      getToken();

    if (!token) {
      event.preventDefault();

      navigate("/account");

      return;
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    setCurrentUser(null);
    setCartItemCount(0);
    setCartTotal(0);

    window.dispatchEvent(
      new Event("authChanged")
    );

    navigate("/");
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
      {/* ==================================================
          SEO
      ================================================== */}

      <script type="application/ld+json">
        {JSON.stringify({
          "@context":
            "https://schema.org",

          "@type":
            "WebSite",

          name:
            "Grocery Sathi",

          url:
            "https://www.grocerysathi.com",

          potentialAction: {
            "@type":
              "SearchAction",

            target:
              "https://www.grocerysathi.com/search?q={search_term_string}",

            "query-input":
              "required name=search_term_string",
          },
        })}
      </script>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        className="navbar-header"
        role="banner"
      >
        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div className="navbar-top-bar">
          <div className="navbar-container navbar-top-container">

            {/* LOGO */}

            <div className="navbar-logo-container">
              <Link
                to={NAV_PATHS.HOME}
                aria-label="Grocery Sathi Homepage"
                onClick={
                  closeMobileMenu
                }
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
              action={
                NAV_PATHS.SEARCH
              }
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
                <span className="navbar-info-title">
                  Monday - Friday:
                </span>

                <span className="navbar-info-sub">
                  8:00 AM - 9:00 PM
                </span>
              </div>

              <div className="navbar-info-item">
                <span className="navbar-info-title">
                  Support 24/7:
                </span>

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

              <Link
                to={
                  currentUser
                    ? NAV_PATHS.ACCOUNT
                    : "/account"
                }
                className={`navbar-icon-btn ${
                  currentUser
                    ? "navbar-user-logged-in"
                    : ""
                }`}
                aria-label={
                  currentUser
                    ? `Account of ${getUserName(
                        currentUser
                      )}`
                    : "Login"
                }
                onClick={
                  handleAccountClick
                }
              >
                <User
                  size={22}
                  aria-hidden="true"
                />

                {!userLoading && (
                  <span className="navbar-user-name">
                    {currentUser
                      ? getUserName(
                          currentUser
                        )
                      : "Login"}
                  </span>
                )}
              </Link>

              {/* CART */}

              <button
                type="button"
                className="navbar-cart-container"
                onClick={() =>
                  setIsCartOpen(
                    true
                  )
                }
                aria-label={`Open Shopping Cart. ${cartItemCount} items. Total ₹${cartTotal.toFixed(
                  2
                )}`}
              >
                <div className="navbar-cart-text">
                  <span className="navbar-cart-label">
                    My Cart:
                  </span>

                  <span className="navbar-cart-price">
                    ₹
                    {cartTotal.toFixed(
                      2
                    )}
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
                onClick={() =>
                  setIsMobileMenuOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-expanded={
                  isMobileMenuOpen
                }
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X
                    size={24}
                    aria-hidden="true"
                  />
                ) : (
                  <Menu
                    size={24}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <nav
          className={`navbar-bottom-bar ${
            isMobileMenuOpen
              ? "navbar-mobile-active"
              : ""
          }`}
          aria-label="Main Navigation"
        >
          <div className="navbar-container navbar-bottom-container">

            {/* ALL CATEGORIES */}

            <div className="navbar-category-wrapper">
              <button
                type="button"
                className={`navbar-category-btn ${
                  isCategoryOpen
                    ? "navbar-category-btn-active"
                    : ""
                }`}
                onClick={
                  toggleCategoryDropdown
                }
                aria-expanded={
                  isCategoryOpen
                }
                aria-controls="category-dropdown-menu"
              >
                <div className="navbar-category-btn-left">
                  <Grid
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    All Categories
                  </span>
                </div>

                <ChevronRight
                  size={18}
                  className={`navbar-category-arrow ${
                    isCategoryOpen
                      ? "rotate-90"
                      : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* CATEGORY DROPDOWN */}

              <div
                id="category-dropdown-menu"
                className={`navbar-dropdown-menu ${
                  isCategoryOpen
                    ? "navbar-dropdown-show"
                    : ""
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
                  ) : visibleCategories.length ===
                    0 ? (
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
                    visibleCategories.map(
                      (
                        category
                      ) => {
                        const categoryKey =
                          getCategoryKey(
                            category
                          );

                        const categoryName =
                          getCategoryName(
                            category
                          );

                        const subCategories =
                          getSubCategories(
                            category
                          );

                        const categoryProducts =
                          getProductsByCategory(
                            category
                          );

                        const isSubOpen =
                          activeCategory ===
                          categoryKey;

                        return (
                          <li
                            key={
                              categoryKey
                            }
                            className="navbar-dropdown-item"
                          >

                            {/* CATEGORY HEADER */}

                            <div className="navbar-dropdown-item-header">

                              <button
                                type="button"
                                className="navbar-dropdown-title-link"
                                onClick={(
                                  event
                                ) =>
                                  handleCategoryClick(
                                    category,
                                    event
                                  )
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

                              {/* CATEGORY ARROW */}

                              <button
                                type="button"
                                className="navbar-sub-toggle-btn"
                                onClick={(
                                  event
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();

                                  handleCategoryToggle(
                                    categoryKey
                                  );
                                }}
                                aria-expanded={
                                  isSubOpen
                                }
                                aria-label={`Show ${categoryName} products`}
                              >
                                {isSubOpen ? (
                                  <ChevronDown
                                    size={16}
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={16}
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            </div>

                            {/* SUB DROPDOWN */}

                            <div
                              className={`navbar-sub-dropdown ${
                                isSubOpen
                                  ? "navbar-sub-dropdown-show"
                                  : ""
                              }`}
                            >
                              <ul className="navbar-sub-list">

                                {/* ==================================================
                                    SUBCATEGORIES
                                ================================================== */}

                                {subCategories.map(
                                  (
                                    subCategory
                                  ) => {
                                    const subKey =
                                      getSubCategoryId(
                                        subCategory
                                      ) ||
                                      getSubCategorySlug(
                                        subCategory
                                      ) ||
                                      getSubCategoryName(
                                        subCategory
                                      );

                                    const subName =
                                      getSubCategoryName(
                                        subCategory
                                      );

                                    const subSlug =
                                      getSubCategorySlug(
                                        subCategory
                                      );

                                    if (
                                      !subName
                                    ) {
                                      return null;
                                    }

                                    return (
                                      <li
                                        key={
                                          subKey
                                        }
                                        className="navbar-sub-item"
                                      >
                                        <Link
                                          to={`${NAV_PATHS.CATEGORIES}/${getCategorySlug(
                                            category
                                          )}/${subSlug}`}
                                          onClick={(
                                            event
                                          ) =>
                                            handleSubCategoryClick(
                                              category,
                                              subCategory,
                                              event
                                            )
                                          }
                                        >
                                          {
                                            subName
                                          }
                                        </Link>
                                      </li>
                                    );
                                  }
                                )}

                                {/* ==================================================
                                    PRODUCTS
                                ================================================== */}

                                {loadingProducts ? (
                                  <li className="navbar-sub-item">
                                    Loading products...
                                  </li>
                                ) : (
                                  categoryProducts.map(
                                    (
                                      product
                                    ) => {
                                      const productId =
                                        getProductId(
                                          product
                                        );

                                      const productName =
                                        getProductName(
                                          product
                                        );

                                      const image =
                                        getProductImage(
                                          product
                                        );

                                      if (
                                        !productId
                                      ) {
                                        return null;
                                      }

                                      return (
                                        <li
                                          key={
                                            productId
                                          }
                                          className="navbar-sub-item"
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleProductClick(
                                                product
                                              )
                                            }
                                          >
                                            {image && (
                                              <img
                                                src={
                                                  image
                                                }
                                                alt={
                                                  productName
                                                }
                                                style={{
                                                  width:
                                                    "35px",
                                                  height:
                                                    "35px",
                                                  objectFit:
                                                    "cover",
                                                  borderRadius:
                                                    "5px",
                                                  marginRight:
                                                    "8px",
                                                  verticalAlign:
                                                    "middle",
                                                }}
                                                onError={(
                                                  event
                                                ) => {
                                                  event.currentTarget.style.display =
                                                    "none";
                                                }}
                                              />
                                            )}

                                            <span>
                                              {
                                                productName
                                              }
                                            </span>
                                          </button>
                                        </li>
                                      );
                                    }
                                  )
                                )}
                              </ul>
                            </div>
                          </li>
                        );
                      }
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* SPECIAL OFFER */}

            <div className="navbar-offer-text">
              <strong>
                -30% off
              </strong>{" "}
              on your first order over ₹200.{" "}
              <Link
                to="/promotions/first-order-discount"
                onClick={
                  closeMobileMenu
                }
              >
                Show More
              </Link>
            </div>

            {/* QUICK NAVIGATION */}

            <div className="navbar-nav-links">

              <Link
                to={NAV_PATHS.HOME}
                onClick={
                  closeMobileMenu
                }
              >
                Home
              </Link>

              <Link
                to={NAV_PATHS.FAQ}
                onClick={
                  closeMobileMenu
                }
              >
                Faq
              </Link>

              <Link
                to={NAV_PATHS.BLOG}
                onClick={
                  closeMobileMenu
                }
              >
                Blog
              </Link>

              <Link
                to={NAV_PATHS.CONTACT}
                onClick={
                  closeMobileMenu
                }
              >
                Contact
              </Link>

              <Link
                to={NAV_PATHS.ABOUT}
                onClick={
                  closeMobileMenu
                }
              >
                About Us
              </Link>

            </div>
          </div>
        </nav>
      </header>

      {/* ==================================================
          CART POPUP
      ================================================== */}

      <CartSection
        isOpen={isCartOpen}
        onClose={
          handleCloseCart
        }
      />
    </>
  );
};

export default Navbar;
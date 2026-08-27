import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

const Navbar = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const navigate = useNavigate();

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await fetch(`${API_BASE_URL}/categories`);

      if (!response.ok) {
        throw new Error(`Category API failed: ${response.status}`);
      }

      const result = await response.json();

      let categoryList = [];

      if (Array.isArray(result)) {
        categoryList = result;
      } else if (Array.isArray(result.categories)) {
        categoryList = result.categories;
      } else if (Array.isArray(result.data)) {
        categoryList = result.data;
      } else if (result.data && Array.isArray(result.data.categories)) {
        categoryList = result.data.categories;
      }

      const activeCategories = categoryList.filter(
        (category) =>
          category.status === undefined ||
          category.status === "Active" ||
          category.status === "active" ||
          category.status === true,
      );

      setCategories(activeCategories);
    } catch (error) {
      console.error("Navbar category fetch error:", error);

      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ======================================================
  // FETCH ALL PRODUCTS
  // ======================================================

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(`${API_BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`Products API failed: ${response.status}`);
      }

      const result = await response.json();

     
      let productList = [];

      if (Array.isArray(result)) {
        productList = result;
      } else if (Array.isArray(result.products)) {
        productList = result.products;
      } else if (Array.isArray(result.data)) {
        productList = result.data;
      } else if (result.data && Array.isArray(result.data.products)) {
        productList = result.data.products;
      }

      // ======================================================
      // SHOW ONLY ACTIVE PRODUCTS
      // ======================================================

      const activeProducts = productList.filter(
        (product) =>
          product.status === undefined ||
          product.status === "active" ||
          product.status === "Active" ||
          product.status === true,
      );

     

      setProducts(activeProducts);
    } catch (error) {
      console.error("Navbar product fetch error:", error);

      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ======================================================
  // GET CATEGORY NAME
  // ======================================================

  const getCategoryName = (product) => {
    if (!product) {
      return "";
    }

    if (product.category && typeof product.category === "object") {
      return (
        product.category.name ||
        product.category.categoryName ||
        product.category.title ||
        ""
      );
    }

    if (typeof product.category === "string") {
      return product.category;
    }

    return "";
  };

  // ======================================================
  // GET CATEGORY ID
  // ======================================================

  const getCategoryId = (category) => {
    if (!category) {
      return "";
    }

    if (typeof category === "object") {
      return category._id || category.id || "";
    }

    return category;
  };

  // ======================================================
  // GET CATEGORY SLUG
  // ======================================================

  const getCategorySlug = (category) => {
    if (!category) {
      return "";
    }

    return category.slug || category._id || category.id || "";
  };

  // ======================================================
  // GET CATEGORY KEY
  // ======================================================

  const getCategoryKey = (category) => {
    return category?._id || category?.id || category?.slug || category?.name;
  };

  // ======================================================
  // GET SUB CATEGORIES
  // ======================================================

  const getSubCategories = (category) => {
    if (!category) {
      return [];
    }

    if (Array.isArray(category.subCategories)) {
      return category.subCategories;
    }

    if (Array.isArray(category.subcategories)) {
      return category.subcategories;
    }

    if (Array.isArray(category.children)) {
      return category.children;
    }

    return [];
  };

  // ======================================================
  // GET PRODUCTS FOR CATEGORY
  // ======================================================

  const getProductsByCategory = (category) => {
    if (!category) {
      return [];
    }

    const categoryId = getCategoryId(category);

    const categoryName = String(category.name || "")
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      if (!product) {
        return false;
      }

      const productCategory = product.category;

      // --------------------------------------------
      // PRODUCT CATEGORY IS OBJECT
      // --------------------------------------------

      if (productCategory && typeof productCategory === "object") {
        const productCategoryId =
          productCategory._id || productCategory.id || "";

        const productCategoryName = String(
          productCategory.name ||
            productCategory.categoryName ||
            productCategory.title ||
            "",
        )
          .trim()
          .toLowerCase();

        if (
          categoryId &&
          productCategoryId &&
          String(productCategoryId) === String(categoryId)
        ) {
          return true;
        }

        if (categoryName && productCategoryName === categoryName) {
          return true;
        }
      }

      // --------------------------------------------
      // PRODUCT CATEGORY IS STRING
      // --------------------------------------------

      if (typeof productCategory === "string") {
        const value = productCategory.trim().toLowerCase();

        if (categoryId && value === String(categoryId).toLowerCase()) {
          return true;
        }

        if (categoryName && value === categoryName) {
          return true;
        }
      }

      return false;
    });
  };

  // ======================================================
  // PRODUCT IMAGE
  // ======================================================

  const getProductImage = (product) => {
    if (
      !product ||
      !Array.isArray(product.images) ||
      product.images.length === 0
    ) {
      return "";
    }

    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      if (
        firstImage.startsWith("http://") ||
        firstImage.startsWith("https://")
      ) {
        return firstImage;
      }

      return `http://localhost:5000${
        firstImage.startsWith("/") ? firstImage : `/${firstImage}`
      }`;
    }

    if (typeof firstImage === "object") {
      const imageUrl =
        firstImage.url || firstImage.path || firstImage.secure_url || "";

      if (!imageUrl) {
        return "";
      }

      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
      }

      return `http://localhost:5000${
        imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
      }`;
    }

    return "";
  };

  // ======================================================
  // PRODUCT NAME
  // ======================================================

  const getProductName = (product) => {
    return product?.productName || product?.name || "Unnamed Product";
  };

  // ======================================================
  // PRODUCT PRICE
  // ======================================================

  const getProductPrice = (product) => {
    return Number(product?.price ?? product?.sellingPrice ?? 0);
  };

  // ======================================================
  // OPEN PRODUCT DETAILS
  // ======================================================

  const handleProductClick = (product) => {
    const productId = product?._id || product?.id;

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

    if (!category) {
      return;
    }

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
  // SUB CATEGORY CLICK
  // ======================================================

  const handleSubCategoryClick = (category, subCategory, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const categorySlug = getCategorySlug(category);

    const subCategorySlug =
      subCategory?.slug || subCategory?._id || subCategory?.id || "";

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
  // SUB CATEGORY TOGGLE
  // ======================================================

  const handleCategoryToggle = (id) => {
    setActiveCategory((previous) => (previous === id ? null : id));
  };

  // ======================================================
  // CLOSE MOBILE MENU
  // ======================================================

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ======================================================
  // CLOSE CATEGORY MENU
  // ======================================================

  const closeCategoryMenu = () => {
    setIsCategoryOpen(false);
    setActiveCategory(null);
  };

  return (
    <>
      {/* ==================================================
          SEO SCHEMA
      ================================================== */}

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

      {/* ==================================================
          NAVBAR HEADER
      ================================================== */}

      <header className="navbar-header" role="banner">
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
              <Link
                to={NAV_PATHS.ACCOUNT}
                className="navbar-icon-btn"
                aria-label="User Account Dashboard"
              >
                <User size={22} aria-hidden="true" />
              </Link>

              <Link
                to={NAV_PATHS.CART}
                className="navbar-cart-container"
                aria-label="View Shopping Cart"
              >
                <div className="navbar-cart-text">
                  <span className="navbar-cart-label">My Cart:</span>

                  <span className="navbar-cart-price">$0.00</span>
                </div>

                <div className="navbar-cart-icon-wrapper">
                  <ShoppingBag
                    size={22}
                    className="navbar-cart-icon"
                    aria-hidden="true"
                  />

                  <span
                    className="navbar-cart-badge"
                    aria-label="0 items in cart"
                  >
                    0
                  </span>
                </div>
              </Link>

              {/* MOBILE MENU */}

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

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <nav
          className={`navbar-bottom-bar ${
            isMobileMenuOpen ? "navbar-mobile-active" : ""
          }`}
          aria-label="Main Navigation"
        >
          <div className="navbar-container navbar-bottom-container">
            {/* ==================================================
                ALL CATEGORIES
            ================================================== */}

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

              {/* ==================================================
                  CATEGORY DROPDOWN
              ================================================== */}

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
                  ) : categories.length === 0 ? (
                    <li className="navbar-dropdown-item">
                      <div className="navbar-dropdown-item-header">
                        <span className="navbar-category-title-text">
                          No categories found
                        </span>
                      </div>
                    </li>
                  ) : (
                    categories.map((category) => {
                      const categoryKey = getCategoryKey(category);

                      const subCategories = getSubCategories(category);

                      const categoryProducts = getProductsByCategory(category);

                      const isSubOpen = activeCategory === categoryKey;

                      return (
                        <li key={categoryKey} className="navbar-dropdown-item">
                          {/* ==================================================
                                CATEGORY HEADER
                            ================================================== */}

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
                                {category.name}
                              </span>
                            </button>

                            {/* CATEGORY ARROW */}

                            <button
                              type="button"
                              className="navbar-sub-toggle-btn"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                handleCategoryToggle(categoryKey);
                              }}
                              aria-expanded={isSubOpen}
                              aria-label={`Show ${category.name} products`}
                            >
                              {isSubOpen ? (
                                <ChevronDown size={16} aria-hidden="true" />
                              ) : (
                                <ChevronRight size={16} aria-hidden="true" />
                              )}
                            </button>
                          </div>

                          {/* ==================================================
                                CATEGORY PRODUCTS
                            ================================================== */}

                          <div
                            className={`navbar-sub-dropdown ${
                              isSubOpen ? "navbar-sub-dropdown-show" : ""
                            }`}
                          >
                            <ul className="navbar-sub-list">
                              {/* SUB CATEGORIES */}

                              {subCategories.map((subCategory) => {
                                const subKey =
                                  subCategory?._id ||
                                  subCategory?.id ||
                                  subCategory?.slug ||
                                  subCategory?.name;

                                return (
                                  <li key={subKey} className="navbar-sub-item">
                                    <Link
                                      to={`${NAV_PATHS.CATEGORIES}/${getCategorySlug(
                                        category,
                                      )}/${
                                        subCategory.slug ||
                                        subCategory._id ||
                                        subCategory.id ||
                                        ""
                                      }`}
                                      onClick={(event) =>
                                        handleSubCategoryClick(
                                          category,
                                          subCategory,
                                          event,
                                        )
                                      }
                                    >
                                      {subCategory.name || subCategory.title}
                                    </Link>
                                  </li>
                                );
                              })}

                              {/* PRODUCTS */}

                              {loadingProducts ? (
                                <li className="navbar-sub-item">
                                  Loading products...
                                </li>
                              ) : categoryProducts.length === 0 ? (
                                <li className="navbar-sub-item">
                                  No products found
                                </li>
                              ) : (
                                categoryProducts.map((product) => {
                                  const productId = product?._id || product?.id;

                                  const image = getProductImage(product);

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
                                      >
                                        {image && (
                                          <img
                                            src={image}
                                            alt={getProductName(product)}
                                            style={{
                                              width: "35px",
                                              height: "35px",
                                              objectFit: "cover",
                                              borderRadius: "5px",
                                              marginRight: "8px",
                                              verticalAlign: "middle",
                                            }}
                                          />
                                        )}

                                        <span>{getProductName(product)}</span>
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

            {/* ==================================================
                SPECIAL OFFER
            ================================================== */}

            <div className="navbar-offer-text">
              <strong>-30% off</strong> on your first order over $200.{" "}
              <Link
                to="/promotions/first-order-discount"
                onClick={closeMobileMenu}
              >
                Show More
              </Link>
            </div>

            {/* ==================================================
                QUICK NAVIGATION
            ================================================== */}

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
    </>
  );
};

export default Navbar;

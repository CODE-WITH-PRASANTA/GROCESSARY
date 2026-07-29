
import React, { useEffect, useRef, useState } from "react";
import "./NourishSection.css";

import {
  FaHeart,
  FaExchangeAlt,
  FaEye,
  FaChevronRight,
  FaChevronLeft,
  FaTimes,
  FaShoppingBag,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";

// =====================================================
// IMAGE IMPORTS
// =====================================================
import saucepanImg from "../../assets/Hawkins.webp";
import grapesImg from "../../assets/grape.webp";
import vegetablesImg from "../../assets/vegetables-2.webp";
import orangeImg from "../../assets/orange.webp";
import kiwiImg from "../../assets/kiwi.webp";
import redgrapes from "../../assets/redgrape.webp";

// =====================================================
// MAIN PRODUCTS DATA
// =====================================================
const productsData = [
  {
    id: 1,
    category: "Kitchenware",
    title: "Hawkins Stainless Steel Saucepan",
    price: "$780.00 USD",
    originalPrice: "$800.00 USD",
    image: saucepanImg,
    attributeLabel: "Material",
    attributeOptions: ["Stainless Steel", "Aluminium"],
    selectedAttribute: "Stainless Steel",
    description:
      "Shop the Hawkins Stainless Steel Saucepan at Grocery Sathi. This high-quality kitchen essential features durable construction and even heat distribution, making it suitable for sauces, soups, and everyday home cooking.",
    badge: "Sale",
    rating: 4.9,
  },
  {
    id: 2,
    category: "Fresh Produce",
    title: "Organic Garden Black Grapes",
    price: "$563.00 USD",
    originalPrice: null,
    image: grapesImg,
    attributeLabel: "Variant",
    attributeOptions: [
      "Seedless Black",
      "Green Seedless",
      "Red Globe",
    ],
    selectedAttribute: "Seedless Black",
    description:
      "Buy fresh organic garden black grapes from Grocery Sathi. Naturally sweet and packed with antioxidants, these fresh grapes are perfect for healthy snacks, fruit bowls, desserts, and fresh juices.",
    badge: "Fresh",
    rating: 4.9,
  },
  {
    id: 3,
    category: "Kitchenware",
    title: "Non-Stick Premium Frying Pan",
    price: "$120.00 USD",
    originalPrice: "$150.00 USD",
    image: saucepanImg,
    attributeLabel: "Material",
    attributeOptions: ["Aluminium", "Cast Iron"],
    selectedAttribute: "Aluminium",
    description:
      "Discover a premium non-stick frying pan at Grocery Sathi. Designed for convenient everyday cooking, this durable pan helps make meal preparation easier and cleanup faster.",
    badge: "Hot",
    rating: 4.9,
  },
];

// =====================================================
// GOODIES DATA
// =====================================================
const goodiesData = [
  {
    id: 101,
    category: "Fresh Fruits",
    title: "Garden Grape...",
    fullTitle: "Fresh Garden Grape Fruit",
    price: "$563.00 USD",
    rating: 0,
    bgColor: "#a48bf5",
    image: redgrapes,
  },
  {
    id: 102,
    category: "Fresh Fruits",
    title: "Sliced Whole...",
    fullTitle: "Fresh Sliced Whole Orange",
    price: "$457.00 USD",
    rating: 4,
    bgColor: "#f7e5b2",
    image: orangeImg,
  },
  {
    id: 103,
    category: "Fresh Fruits",
    title: "Kiwi Fresh Fruit",
    fullTitle: "Fresh Kiwi Fruit",
    price: "$320.00 USD",
    rating: 0,
    bgColor: "#cbf08d",
    image: kiwiImg,
  },
];

// =====================================================
// COMPONENT
// =====================================================
const NourishSection = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeVariant, setActiveVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // =====================================================
  // RESPONSIVE SLIDER
  // =====================================================
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);

      if (!mobile && sliderIndex > productsData.length - 2) {
        setSliderIndex(Math.max(0, productsData.length - 2));
      }

      if (mobile && sliderIndex > productsData.length - 1) {
        setSliderIndex(productsData.length - 1);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [sliderIndex]);

  const maxIndex = isMobile
    ? productsData.length - 1
    : Math.max(0, productsData.length - 2);

  // =====================================================
  // QUICK VIEW
  // =====================================================
  const handleOpenQuickView = (product) => {
    setSelectedProduct(product);

    setActiveVariant(
      product.selectedAttribute ||
        product.attributeOptions?.[0] ||
        ""
    );

    setQuantity(1);

    document.body.style.overflow = "hidden";
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
    document.body.style.overflow = "";
  };

  // =====================================================
  // SLIDER
  // =====================================================
  const handleNextSlide = () => {
    if (sliderIndex < maxIndex) {
      setSliderIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (sliderIndex > 0) {
      setSliderIndex((prev) => prev - 1);
    }
  };

  // =====================================================
  // TOUCH SWIPE
  // =====================================================
  const handleTouchStart = (event) => {
    touchStartX.current =
      event.targetTouches[0].clientX;
  };

  const handleTouchMove = (event) => {
    touchEndX.current =
      event.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      !touchStartX.current ||
      !touchEndX.current
    ) {
      return;
    }

    const distance =
      touchStartX.current -
      touchEndX.current;

    if (distance > 40) {
      handleNextSlide();
    }

    if (distance < -40) {
      handlePrevSlide();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // =====================================================
  // KEYBOARD ACCESSIBILITY
  // =====================================================
  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        selectedProduct
      ) {
        handleCloseQuickView();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selectedProduct]);

  // =====================================================
  // PRODUCT STRUCTURED DATA
  // =====================================================
  const productSchema = productsData.map(
    (product) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description,
      image: product.image,
      category: product.category,
      brand: {
        "@type": "Brand",
        name: "Grocery Sathi",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: "25",
      },
      offers: {
        "@type": "Offer",
        price: product.price
          .replace("$", "")
          .replace(" USD", "")
          .replace(",", ""),
        priceCurrency: "USD",
        availability:
          "https://schema.org/InStock",
      },
    })
  );

  return (
    <div className="grocery-nourish-wrapper">

      {/* =====================================================
          SEO STRUCTURED DATA
      ===================================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productSchema
          ),
        }}
      />

      {/* =====================================================
          NOURISH SECTION
      ===================================================== */}
      <section
        className="grocery-nourish-section"
        aria-labelledby="nourish-section-title"
      >
        <div className="grocery-nourish-container">

          {/* SECTION HEADER */}
          <header className="grocery-nourish-header">
            <div className="grocery-nourish-heading-content">
              <span className="grocery-nourish-eyebrow">
                Grocery Sathi Fresh Essentials
              </span>

              <h1
                id="nourish-section-title"
                className="grocery-nourish-main-heading"
              >
                Nourish Your Body & Soul
              </h1>

              <p className="grocery-nourish-intro">
                Discover fresh vegetables, quality groceries,
                healthy fruits, and everyday kitchen essentials
                at Grocery Sathi. Shop trusted products for
                your family and enjoy a convenient online
                grocery shopping experience.
              </p>
            </div>
          </header>

          {/* MAIN CONTENT GRID */}
          <div className="grocery-nourish-grid">

            {/* =================================================
                FEATURED VEGETABLE BANNER
            ================================================= */}
            <article className="grocery-nourish-banner-card">

              <img
                src={vegetablesImg}
                alt="Fresh vegetables available online at Grocery Sathi"
                className="grocery-nourish-banner-img"
                fetchPriority="high"
                decoding="async"
              />

              <div
                className="grocery-nourish-banner-overlay"
                aria-hidden="true"
              />

              <div className="grocery-nourish-banner-content">

                <span className="grocery-nourish-banner-tag">
                  Fresh Grocery Collection
                </span>

                <h2 className="grocery-nourish-banner-title">
                  Fresh Vegetables for Healthy Living
                </h2>

                <p className="grocery-nourish-banner-text">
                  Shop fresh and nutritious vegetables at
                  Grocery Sathi. Find quality grocery essentials
                  carefully selected for healthy meals and
                  wholesome family living.
                </p>

                <button
                  type="button"
                  className="grocery-nourish-category-btn"
                  aria-label="Explore fresh vegetables category"
                >
                  <span>
                    Explore Fresh Vegetables
                  </span>

                  <FaArrowRight
                    className="grocery-nourish-btn-icon"
                    aria-hidden="true"
                  />
                </button>

              </div>
            </article>

            {/* =================================================
                PRODUCT SLIDER
            ================================================= */}
            <section
              className="grocery-nourish-slider-wrapper"
              aria-label="Featured grocery products"
            >

              {/* PREVIOUS BUTTON */}
              <button
                type="button"
                className={`grocery-nourish-slider-arrow left ${
                  sliderIndex === 0
                    ? "disabled"
                    : ""
                }`}
                onClick={handlePrevSlide}
                disabled={sliderIndex === 0}
                aria-label="View previous grocery products"
              >
                <FaChevronLeft />
              </button>

              {/* NEXT BUTTON */}
              <button
                type="button"
                className={`grocery-nourish-slider-arrow right ${
                  sliderIndex >= maxIndex
                    ? "disabled"
                    : ""
                }`}
                onClick={handleNextSlide}
                disabled={
                  sliderIndex >= maxIndex
                }
                aria-label="View next grocery products"
              >
                <FaChevronRight />
              </button>

              {/* PRODUCT TRACK */}
              <div
                className="grocery-nourish-cards-track"
                style={{
                  transform: isMobile
                    ? `translateX(-${
                        sliderIndex * 100
                      }%)`
                    : `translateX(-${
                        sliderIndex * 330
                      }px)`,
                }}
                onTouchStart={
                  handleTouchStart
                }
                onTouchMove={
                  handleTouchMove
                }
                onTouchEnd={
                  handleTouchEnd
                }
              >

                {productsData.map(
                  (product) => (
                    <article
                      key={product.id}
                      className="grocery-nourish-product-card"
                    >

                      {/* BADGE */}
                      {product.badge && (
                        <span className="grocery-nourish-card-badge">
                          {product.badge}
                        </span>
                      )}

                      {/* ACTIONS */}
                      <nav
                        className="grocery-nourish-card-actions"
                        aria-label={`Actions for ${product.title}`}
                      >
                        <button
                          type="button"
                          className="grocery-nourish-action-icon"
                          aria-label={`Add ${product.title} to wishlist`}
                          title="Add to Wishlist"
                        >
                          <FaHeart />
                        </button>

                        <button
                          type="button"
                          className="grocery-nourish-action-icon"
                          aria-label={`Compare ${product.title}`}
                          title="Compare Product"
                        >
                          <FaExchangeAlt />
                        </button>

                        <button
                          type="button"
                          className="grocery-nourish-action-icon"
                          aria-label={`Quick view ${product.title}`}
                          title="Quick View"
                          onClick={() =>
                            handleOpenQuickView(
                              product
                            )
                          }
                        >
                          <FaEye />
                        </button>
                      </nav>

                      {/* PRODUCT IMAGE */}
                      <div className="grocery-nourish-card-img-holder">
                        <img
                          src={product.image}
                          alt={`${product.title} - Buy online at Grocery Sathi`}
                          className="grocery-nourish-card-img"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* PRODUCT INFORMATION */}
                      <div className="grocery-nourish-card-body">

                        <span className="grocery-nourish-card-category">
                          {product.category}
                        </span>

                        <h3 className="grocery-nourish-card-title">
                          {product.title}
                        </h3>

                        {/* RATING */}
                        <div
                          className="grocery-nourish-stars"
                          aria-label={`Rated ${product.rating} out of 5`}
                        >
                          {[
                            ...Array(5),
                          ].map((_, index) => (
                            <FaStar
                              key={index}
                              className="grocery-nourish-star-icon"
                            />
                          ))}

                          <span className="grocery-nourish-star-count">
                            ({product.rating})
                          </span>
                        </div>

                        {/* PRICE */}
                        <div className="grocery-nourish-price-row">

                          <span className="grocery-nourish-price">
                            {product.price}
                          </span>

                          {product.originalPrice && (
                            <span className="grocery-nourish-original-price">
                              {product.originalPrice}
                            </span>
                          )}

                        </div>

                        {/* VARIANT */}
                        <div className="grocery-nourish-select-group">

                          <label
                            htmlFor={`product-${product.id}`}
                            className="grocery-nourish-select-label"
                          >
                            {product.attributeLabel}
                          </label>

                          <select
                            id={`product-${product.id}`}
                            className="grocery-nourish-select"
                            defaultValue={
                              product.selectedAttribute
                            }
                            aria-label={`Select ${product.attributeLabel} for ${product.title}`}
                          >
                            {product.attributeOptions.map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              )
                            )}
                          </select>

                        </div>

                        {/* ADD TO CART */}
                        <button
                          type="button"
                          className="grocery-nourish-add-btn"
                          aria-label={`Add ${product.title} to cart`}
                        >
                          <span>
                            Add to Cart
                          </span>

                          <FaShoppingBag />
                        </button>

                      </div>
                    </article>
                  )
                )}

              </div>
            </section>
          </div>
        </div>
      </section>

      {/* =====================================================
          GOODIES SECTION
      ===================================================== */}
      <section
        className="grocery-goodies-section"
        aria-labelledby="goodies-section-title"
      >
        <div className="grocery-goodies-container">

          <header className="grocery-goodies-header">

            <div>
              <span className="grocery-goodies-eyebrow">
                Healthy Choices for Families
              </span>

              <h2
                id="goodies-section-title"
                className="grocery-goodies-main-heading"
              >
                Goodies for Your Little Ones
              </h2>

              <p className="grocery-goodies-description">
                Explore fresh fruits and healthy grocery
                choices for your children and family.
                Grocery Sathi makes everyday grocery shopping
                simple and convenient.
              </p>
            </div>

            <button
              type="button"
              className="grocery-goodies-show-more-btn"
              aria-label="Show more grocery products"
            >
              <span>
                Show More Products
              </span>

              <FaChevronRight />
            </button>

          </header>

          {/* GOODIES GRID */}
          <div className="grocery-goodies-grid">

            {goodiesData.map((item) => (
              <article
                key={item.id}
                className="grocery-goody-card"
                style={{
                  "--goody-bg": item.bgColor,
                }}
              >

                <div className="grocery-goody-card-content">

                  <span className="grocery-goody-category">
                    {item.category}
                  </span>

                  <h3 className="grocery-goody-title">
                    {item.fullTitle}
                  </h3>

                  <div
                    className="grocery-goody-stars"
                    aria-label={`Rated ${item.rating} out of 5`}
                  >
                    {[
                      ...Array(5),
                    ].map((_, index) => (
                      <FaStar
                        key={index}
                        className={
                          index < item.rating
                            ? "grocery-star-filled"
                            : "grocery-star-empty"
                        }
                      />
                    ))}
                  </div>

                  <span className="grocery-goody-price">
                    {item.price}
                  </span>

                  <button
                    type="button"
                    className="grocery-goody-add-btn"
                    aria-label={`Add ${item.fullTitle} to cart`}
                  >
                    <span>
                      Add to Cart
                    </span>

                    <FaChevronRight
                      className="grocery-goody-btn-arrow"
                    />
                  </button>

                </div>

                <div className="grocery-goody-card-image-wrap">

                  <img
                    src={item.image}
                    alt={`${item.fullTitle} fresh fruit at Grocery Sathi`}
                    className="grocery-goody-img"
                    loading="lazy"
                    decoding="async"
                  />

                </div>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK VIEW MODAL
      ===================================================== */}
      {selectedProduct && (
        <div
          className="grocery-nourish-modal-backdrop"
          role="presentation"
          onClick={handleCloseQuickView}
        >

          <div
            className="grocery-nourish-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE BUTTON */}
            <button
              type="button"
              className="grocery-nourish-modal-close"
              onClick={handleCloseQuickView}
              aria-label="Close product quick view"
            >
              <FaTimes />
            </button>

            <div className="grocery-nourish-modal-grid">

              {/* MODAL IMAGE */}
              <div className="grocery-nourish-modal-image-col">

                <img
                  src={selectedProduct.image}
                  alt={`${selectedProduct.title} product preview`}
                  className="grocery-nourish-modal-img"
                />

              </div>

              {/* MODAL INFORMATION */}
              <div className="grocery-nourish-modal-info-col">

                <span className="grocery-nourish-modal-category">
                  {selectedProduct.category}
                </span>

                <h2
                  id="quick-view-title"
                  className="grocery-nourish-modal-title"
                >
                  {selectedProduct.title}
                </h2>

                <div className="grocery-nourish-modal-price-row">

                  <span className="grocery-nourish-modal-price">
                    {selectedProduct.price}
                  </span>

                  {selectedProduct.originalPrice && (
                    <span className="grocery-nourish-modal-orig-price">
                      {selectedProduct.originalPrice}
                    </span>
                  )}

                </div>

                <p className="grocery-nourish-modal-description">
                  {selectedProduct.description}
                </p>

                {/* ATTRIBUTE OPTIONS */}
                <div className="grocery-nourish-modal-attribute-section">

                  <span className="grocery-nourish-modal-attr-label">
                    Select{" "}
                    {selectedProduct.attributeLabel}
                  </span>

                  <div className="grocery-nourish-modal-pills">

                    {selectedProduct.attributeOptions.map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          className={`grocery-nourish-modal-pill ${
                            activeVariant === option
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setActiveVariant(
                              option
                            )
                          }
                          aria-pressed={
                            activeVariant === option
                          }
                        >
                          {option}
                        </button>
                      )
                    )}

                  </div>
                </div>

                {/* ACTIONS */}
                <div className="grocery-nourish-modal-actions-row">

                  <div
                    className="grocery-nourish-quantity-selector"
                    aria-label="Product quantity"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.max(
                            1,
                            quantity - 1
                          )
                        )
                      }
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>

                    <span>
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          quantity + 1
                        )
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>

                  <button
                    type="button"
                    className="grocery-nourish-modal-cart-btn"
                  >
                    <span>
                      Add to Cart
                    </span>

                    <FaShoppingBag />
                  </button>

                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NourishSection;


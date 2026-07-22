import React, { useState, useEffect, useRef } from "react";
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

// Image Imports
import saucepanImg from "../../assets/Hawkins.webp";
import grapesImg from "../../assets/grape.webp";
import vegetablesImg from "../../assets/vegetables-2.webp";
import orangeImg from "../../assets/orange.webp";
import kiwiImg from "../../assets/kiwi.webp";
import redgrapes from "../../assets/redgrape.webp";

// Main Section Products
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
      "A high-grade stovetop pan featuring heavy-gauge construction for fast and uniform heating. Ideal for signature sauces, soups, and daily culinary prep.",
    badge: "Sale",
  },
  {
    id: 2,
    category: "Fresh Produce",
    title: "Organic Garden Black Grapes",
    price: "$563.00 USD",
    originalPrice: null,
    image: grapesImg,
    attributeLabel: "Variant",
    attributeOptions: ["Seedless Black", "Green Seedless", "Red Globe"],
    selectedAttribute: "Seedless Black",
    description:
      "Freshly harvested organic garden grapes packed with essential antioxidants and natural sweetness. Perfect for healthy snacking or freshly squeezed juices.",
    badge: "Fresh",
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
      "High-quality non-stick frying pan designed for effortless cooking and rapid cleanup. Fully compatible with induction and traditional cooktops.",
    badge: "Hot",
  },
];

// Little Ones Goodies Data
const goodiesData = [
  {
    id: 101,
    category: "Fruits",
    title: "Garden Grape...",
    fullTitle: "Garden Grape Fruit",
    price: "$563.00 USD",
    rating: 0,
    bgColor: "#a48bf5",
    image: redgrapes,
  },
  {
    id: 102,
    category: "Fruits",
    title: "Sliced Whole...",
    fullTitle: "Sliced Whole Orange",
    price: "$457.00 USD",
    rating: 4,
    bgColor: "#f7e5b2",
    image: orangeImg,
  },
  {
    id: 103,
    category: "Fruits",
    title: "Kiwi Fresh Fruit",
    fullTitle: "Kiwi Fresh Fruit",
    price: "$320.00 USD",
    rating: 0,
    bgColor: "#cbf08d",
    image: kiwiImg,
  },
];

const NourishSection = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeVariant, setActiveVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Touch Swipe States
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Handle Responsiveness for Slider Math
  useEffect(() => {
    const handleResize = () => {
      const mobileState = window.innerWidth <= 768;
      setIsMobile(mobileState);
      if (mobileState && sliderIndex > productsData.length - 1) {
        setSliderIndex(productsData.length - 1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sliderIndex]);

  const maxIndex = isMobile ? productsData.length - 1 : Math.max(0, productsData.length - 2);

  // Quick View Handlers
  const handleOpenQuickView = (product) => {
    setSelectedProduct(product);
    setActiveVariant(
      product.selectedAttribute ||
        (product.attributeOptions && product.attributeOptions[0]) ||
        ""
    );
    setQuantity(1);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  // Slider Navigation
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

  // Touch handlers for swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && sliderIndex < maxIndex) {
      handleNextSlide();
    }
    if (isRightSwipe && sliderIndex > 0) {
      handlePrevSlide();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="nourish-wrapper">
      {/* 1. TOP NOURISH SECTION */}
      <section className="nourish-section">
        <div className="nourish-container">
          <div className="nourish-header-row">
            <div>
              <span className="nourish-sub-heading">Curated Essentials</span>
              <h1 className="nourish-main-heading">Nourish Your Body & Soul</h1>
            </div>
          </div>

          <div className="nourish-grid">
            {/* Left Banner Card */}
            <div className="nourish-banner-card">
              <img
                src={vegetablesImg}
                alt="Fresh Vegetables"
                className="nourish-banner-img"
              />
              <div className="nourish-banner-overlay" />
              <div className="nourish-banner-content">
                <span className="nourish-banner-tag">Category Feature</span>
                <h2 className="nourish-banner-title">Fresh Vegetables</h2>
                <p className="nourish-banner-text">
                  Explore handpicked daily essentials, fresh produce, and
                  premium household supplies carefully crafted for wholesome
                  living.
                </p>
                <button type="button" className="nourish-category-btn">
                  <span>Explore Category</span>
                  <FaArrowRight className="btn-icon" />
                </button>
              </div>
            </div>

            {/* Right Product Slider Container */}
            <div className="nourish-slider-wrapper">
              <button
                type="button"
                className={`nourish-slider-arrow left ${
                  sliderIndex === 0 ? "disabled" : ""
                }`}
                onClick={handlePrevSlide}
                aria-label="Previous Products"
                disabled={sliderIndex === 0}
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                className={`nourish-slider-arrow right ${
                  sliderIndex >= maxIndex ? "disabled" : ""
                }`}
                onClick={handleNextSlide}
                aria-label="Next Products"
                disabled={sliderIndex >= maxIndex}
              >
                <FaChevronRight />
              </button>

              <div
                className="nourish-cards-track"
                style={{
                  transform: isMobile
                    ? `translateX(-${sliderIndex * 100}%)`
                    : `translateX(-${sliderIndex * (310 + 20)}px)`,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {productsData.map((product) => (
                  <div key={product.id} className="nourish-product-card">
                    {product.badge && (
                      <span className="nourish-card-badge">{product.badge}</span>
                    )}

                    <div className="nourish-card-actions">
                      <button
                        type="button"
                        className="nourish-action-icon"
                        title="Wishlist"
                        aria-label="Add to Wishlist"
                      >
                        <FaHeart />
                      </button>
                      <button
                        type="button"
                        className="nourish-action-icon"
                        title="Compare"
                        aria-label="Compare Product"
                      >
                        <FaExchangeAlt />
                      </button>
                      <button
                        type="button"
                        className="nourish-action-icon"
                        title="Quick View"
                        aria-label="Quick View Product"
                        onClick={() => handleOpenQuickView(product)}
                      >
                        <FaEye />
                      </button>
                    </div>

                    <div className="nourish-card-img-holder">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="nourish-card-img"
                      />
                    </div>

                    <div className="nourish-card-body">
                      <span className="nourish-card-category">
                        {product.category}
                      </span>
                      <h3 className="nourish-card-title">{product.title}</h3>

                      <div className="nourish-stars">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="star-icon" />
                        ))}
                        <span className="nourish-star-count">(4.9)</span>
                      </div>

                      <div className="nourish-price-row">
                        <span className="nourish-price">{product.price}</span>
                        {product.originalPrice && (
                          <span className="nourish-original-price">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="nourish-select-group">
                        <label className="nourish-select-label">
                          {product.attributeLabel}
                        </label>
                        <select className="nourish-select" defaultValue={product.selectedAttribute}>
                          {product.attributeOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button type="button" className="nourish-add-btn">
                        <span>Add to Cart</span>
                        <FaShoppingBag />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GOODIES FOR YOUR LITTLE ONES SECTION */}
      <section className="goodies-section">
        <div className="goodies-container">
          <div className="goodies-header-row">
            <h2 className="goodies-main-heading">Goodies for Your Little Ones</h2>
            <button type="button" className="goodies-show-more-btn">
              <span>Show more products</span>
              <FaChevronRight />
            </button>
          </div>

          <div className="goodies-grid">
            {goodiesData.map((item) => (
              <div
                key={item.id}
                className="goody-card"
                style={{ backgroundColor: item.bgColor }}
              >
                <div className="goody-card-content">
                  <span className="goody-category">{item.category}</span>
                  <h3 className="goody-title">{item.title}</h3>

                  <div className="goody-stars">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={
                          index < item.rating ? "star-filled" : "star-empty"
                        }
                      />
                    ))}
                  </div>

                  <span className="goody-price">{item.price}</span>

                  <button type="button" className="goody-add-btn">
                    <span>Add to Cart</span>
                    <FaChevronRight className="goody-btn-arrow" />
                  </button>
                </div>

                <div className="goody-card-image-wrap">
                  <img
                    src={item.image}
                    alt={item.fullTitle}
                    className="goody-img"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. QUICK VIEW POPUP MODAL */}
      {selectedProduct && (
        <div className="nourish-modal-backdrop" onClick={handleCloseQuickView}>
          <div
            className="nourish-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="nourish-modal-close"
              onClick={handleCloseQuickView}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            <div className="nourish-modal-grid">
              <div className="nourish-modal-image-col">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="nourish-modal-img"
                />
              </div>

              <div className="nourish-modal-info-col">
                <span className="nourish-modal-category">
                  {selectedProduct.category}
                </span>
                <h2 className="nourish-modal-title">
                  {selectedProduct.title}
                </h2>

                <div className="nourish-price-row modal-price-spacing">
                  <span className="nourish-modal-price">
                    {selectedProduct.price}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="nourish-modal-orig-price">
                      {selectedProduct.originalPrice}
                    </span>
                  )}
                </div>

                <p className="nourish-modal-description">
                  {selectedProduct.description}
                </p>

                {selectedProduct.attributeOptions && (
                  <div className="nourish-modal-attribute-section">
                    <span className="nourish-modal-attr-label">
                      Select {selectedProduct.attributeLabel}
                    </span>
                    <div className="nourish-modal-pills">
                      {selectedProduct.attributeOptions.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`nourish-modal-pill ${
                            activeVariant === opt ? "active" : ""
                          }`}
                          onClick={() => setActiveVariant(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="nourish-modal-actions-row">
                  <div className="nourish-quantity-selector">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button type="button" className="nourish-modal-cart-btn">
                    <span>Add to Cart</span>
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
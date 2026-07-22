import React, { useState } from "react";
import { 
  FaHeart, 
  FaExchangeAlt, 
  FaEye, 
  FaStar, 
  FaRegStar, 
  FaChevronLeft, 
  FaChevronRight, 
  FaChevronDown, 
  FaTimes, 
  FaShoppingBag, 
  FaPlus, 
  FaMinus 
} from "react-icons/fa";
import "./OurBestsellers.css";

// Updated data with high-reliability image links and multi-image galleries
const bestsellerData = [
  {
    id: 1,
    category: "Vegetables",
    badge: "New",
    name: "All Type Bell Pepper",
    rating: 4,
    price: 14500,
    originalPrice: 19000,
    label: "Color:",
    selectedOption: "Red",
    options: ["Red", "Yellow", "Green"],
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop",
    description: "Bell pepper, (Capsicum annuum), also called sweet pepper or capsicum, pepper cultivar in the nightshade family (Solanaceae), grown for its thick, mild fruits. Bell peppers are used in salads and in cooked dishes.",
    gallery: [
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    category: "Bakery",
    badge: "New",
    name: "Crunchy Healthy &...",
    rating: 5,
    price: 41500,
    originalPrice: 58000,
    label: "Material:",
    selectedOption: "Choco",
    options: ["Choco", "Vanilla", "Strawberry"],
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop",
    description: "Deliciously crunchy healthy cookies packed with rich flavor and wholesome ingredients, perfect for a guilt-free snack any time of the day.",
    gallery: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    category: "Accessories",
    badge: "New",
    name: "Stainless-Steel-...",
    rating: 3,
    price: 46700,
    originalPrice: 49800,
    label: "Style:",
    selectedOption: "300 Watt",
    options: ["300 Watt", "500 Watt", "750 Watt"],
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
    description: "High-grade stainless steel electric chopper and blender designed for fast and efficient kitchen food preparation.",
    gallery: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570222094114-d02fcf42d2e0?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    category: "Bakery",
    badge: "New",
    name: "Spicy Puff",
    rating: 4,
    price: 19100,
    originalPrice: 24900,
    label: "Material:",
    selectedOption: "Almond",
    options: ["Almond", "Cashew", "Plain"],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
    description: "Flaky, buttery puff pastry filled with a delectable spicy kick, freshly baked to absolute golden perfection.",
    gallery: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 5,
    category: "Fruits",
    badge: "Sale",
    name: "Fresh Organic Apple",
    rating: 4,
    price: 999,
    originalPrice: 1299,
    label: "Size:",
    selectedOption: "Medium",
    options: ["Small", "Medium", "Large"],
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop",
    description: "Crisp, juicy organic apples handpicked from premium orchards, loaded with essential nutrients and vitamins.",
    gallery: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600&auto=format&fit=crop"
    ]
  },
  {
    id: 6,
    category: "Cheeses",
    badge: "New",
    name: "Artisan Cheddar Block",
    rating: 5,
    price: 2499,
    originalPrice: 2999,
    label: "Weight:",
    selectedOption: "250g",
    options: ["250g", "500g", "1kg"],
    image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&auto=format&fit=crop",
    description: "Aged artisan cheddar cheese with a sharp, rich flavor profile and smooth creamy texture.",
    gallery: [
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&auto=format&fit=crop"
    ]
  }
];

export const OurBestsellers = () => {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedDropdowns, setSelectedDropdowns] = useState(
    bestsellerData.reduce((acc, item) => ({ ...acc, [item.id]: item.selectedOption }), {})
  );

  const categories = ["All Categories", "Vegetables", "Fruits", "Accessories", "Cheeses", "Bakery"];

  const filteredItems = activeCategory === "All Categories" 
    ? bestsellerData 
    : bestsellerData.filter(item => item.category === activeCategory);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, filteredItems.length - 4) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= filteredItems.length - 4 ? 0 : prev + 1));
  };

  const handleDropdownChange = (id, value) => {
    setSelectedDropdowns(prev => ({ ...prev, [id]: value }));
  };

  const formatINR = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/600x400?text=Product+Image";
  };

  return (
    <div className="OurBestsellers-container">
      <div className="OurBestsellers-header-wrap">
        <h2 className="OurBestsellers-title">Our Bestsellers</h2>
        <div className="OurBestsellers-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`OurBestsellers-cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="OurBestsellers-slider-section">
        <button className="OurBestsellers-arrow left" onClick={handlePrev} aria-label="Previous">
          <FaChevronLeft />
        </button>

        <div className="OurBestsellers-grid">
          {filteredItems.slice(currentIndex, currentIndex + 4).map((item) => (
            <div className="OurBestsellers-card" key={item.id}>
              <div className="OurBestsellers-img-box">
                {item.badge && <span className="OurBestsellers-badge">{item.badge}</span>}
                <div className="OurBestsellers-action-icons">
                  <button className="OurBestsellers-icon-btn"><FaHeart /></button>
                  <button className="OurBestsellers-icon-btn"><FaExchangeAlt /></button>
                  <button 
                    className="OurBestsellers-icon-btn" 
                    onClick={() => {
                      setQuickViewItem(item);
                      setModalImageIndex(0);
                      setQuantity(1);
                    }}
                  >
                    <FaEye />
                  </button>
                </div>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="OurBestsellers-product-img" 
                  onError={handleImageError}
                />
              </div>

              <div className="OurBestsellers-content">
                <span className="OurBestsellers-cat-label">{item.category}</span>
                <h3 className="OurBestsellers-prod-name">{item.name}</h3>
                
                <div className="OurBestsellers-rating">
                  {[...Array(5)].map((_, i) => (
                    i < item.rating ? <FaStar key={i} className="star filled" /> : <FaRegStar key={i} className="star" />
                  ))}
                </div>

                <div className="OurBestsellers-price-box">
                  <span className="OurBestsellers-current-price">{formatINR(item.price)}</span>
                  <span className="OurBestsellers-original-price">{formatINR(item.originalPrice)}</span>
                </div>

                <div className="OurBestsellers-dropdown-group">
                  <label className="OurBestsellers-drop-label">{item.label}</label>
                  <div className="OurBestsellers-select-wrapper">
                    <select 
                      value={selectedDropdowns[item.id]} 
                      onChange={(e) => handleDropdownChange(item.id, e.target.value)}
                      className="OurBestsellers-select"
                    >
                      {item.options.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <FaChevronDown className="OurBestsellers-select-icon" />
                  </div>
                </div>

                <button className="OurBestsellers-cart-btn">
                  Add to Cart <FaChevronRight className="btn-arrow-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="OurBestsellers-arrow right" onClick={handleNext} aria-label="Next">
          <FaChevronRight />
        </button>
      </div>

      {/* Quick View Modal */}
      {quickViewItem && (
        <div className="OurBestsellers-modal-overlay">
          <div className="OurBestsellers-modal-content">
            <button className="OurBestsellers-modal-close" onClick={() => setQuickViewItem(null)}>
              <FaTimes />
            </button>

            <div className="OurBestsellers-modal-body">
              <div className="OurBestsellers-modal-img-col">
                <div className="OurBestsellers-modal-main-img-wrap">
                  <button className="modal-arr left" onClick={() => setModalImageIndex(prev => prev === 0 ? quickViewItem.gallery.length - 1 : prev - 1)}>
                    <FaChevronLeft />
                  </button>
                  <img 
                    src={quickViewItem.gallery[modalImageIndex] || quickViewItem.image} 
                    alt="Modal Preview" 
                    onError={handleImageError}
                  />
                  <button className="modal-arr right" onClick={() => setModalImageIndex(prev => prev === quickViewItem.gallery.length - 1 ? 0 : prev + 1)}>
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <div className="OurBestsellers-modal-info-col">
                <h2 className="modal-title">{quickViewItem.name}</h2>
                <p className="modal-desc">{quickViewItem.description}</p>

                <div className="modal-option-picker">
                  <span className="modal-opt-title">{quickViewItem.label} {selectedDropdowns[quickViewItem.id]}</span>
                  <div className="modal-thumb-row">
                    {quickViewItem.gallery.map((img, i) => (
                      <div 
                        key={i} 
                        className={`modal-thumb-box ${modalImageIndex === i ? "active" : ""}`}
                        onClick={() => setModalImageIndex(i)}
                      >
                        <img src={img} alt="thumb" onError={handleImageError} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-price-row">
                  <span className="modal-cur-price">{formatINR(quickViewItem.price)}</span>
                  <span className="modal-orig-price">{formatINR(quickViewItem.originalPrice)}</span>
                </div>

                <div className="modal-actions-row">
                  <button className="modal-add-cart-btn">
                    Add to Cart <FaShoppingBag />
                  </button>
                  <div className="modal-qty-counter">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><FaMinus /></button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}><FaPlus /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurBestsellers;
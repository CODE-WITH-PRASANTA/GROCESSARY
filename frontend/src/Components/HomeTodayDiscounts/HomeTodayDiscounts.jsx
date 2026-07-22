import React, { useState } from 'react';
import { 
  FiHeart, 
  FiEye, 
  FiChevronRight, 
  FiChevronLeft,
  FiChevronDown, 
  FiStar 
} from 'react-icons/fi';
import { LuArrowRightLeft } from 'react-icons/lu';
import './HomeTodayDiscounts.css';

// Importing Local Images
import bellPepper1 from '../../assets/image1.2.webp';
import bellPepper2 from '../../assets/image 1.1.avif';
import cookies1 from '../../assets/image2.2.webp';
import cookies2 from '../../assets/image 2.1.avif';
import potato1 from '../../assets/image3..2.webp';
import potato2 from '../../assets/image 3.1.avif';
import grater1 from '../../assets/image4.2.webp';
import grater2 from '../../assets/image 4.1.avif';

const productsData = [
  {
    id: 1,
    badge: 'New',
    category: 'Vegetables',
    title: 'All Type Bell Pepper',
    rating: 4,
    price: '$175.00 USD',
    originalPrice: '$230.00 USD',
    optionLabel: 'Color:',
    options: ['Red', 'Yellow', 'Green'],
    primaryImage: bellPepper1,
    hoverImage: bellPepper2
  },
  {
    id: 2,
    badge: 'New',
    category: 'Bakery',
    title: 'Crunchy Healthy &...',
    rating: 5,
    price: '$500.00 USD',
    originalPrice: '$700.00 USD',
    optionLabel: 'Material:',
    options: ['Choco', 'Vanilla', 'Strawberry'],
    primaryImage: cookies1,
    hoverImage: cookies2
  },
  {
    id: 3,
    badge: null,
    category: 'Vegetables',
    title: 'Raw Yellow Potato',
    rating: 0,
    price: '$300.00 USD',
    originalPrice: '$350.00 USD',
    optionLabel: 'Size:',
    options: ['500 Grams', '1 KG', '2 KG'],
    primaryImage: potato1,
    hoverImage: potato2
  },
  {
    id: 4,
    badge: null,
    category: 'Kitchen',
    title: 'Grater With...',
    rating: 0,
    price: '$632.00 USD',
    originalPrice: '$680.00 USD',
    optionLabel: 'Color:',
    options: ['Red', 'Silver', 'Black'],
    primaryImage: grater1,
    hoverImage: grater2
  }
];

const HomeTodayDiscounts = () => {
  const [selectedOptions, setSelectedOptions] = useState(
    productsData.reduce((acc, product) => {
      acc[product.id] = product.options[0];
      return acc;
    }, {})
  );

  const handleOptionChange = (productId, value) => {
    setSelectedOptions((prev) => ({ ...prev, [productId]: value }));
  };

  return (
    <section className="HomeTodayDiscounts">
      <div className="HomeTodayDiscounts-container">
        {/* Header */}
        <div className="HomeTodayDiscounts-header">
          <h2 className="HomeTodayDiscounts-title">Today Discounts</h2>
          <button className="HomeTodayDiscounts-showMoreBtn">
            Show more products <FiChevronRight className="btn-icon" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="HomeTodayDiscounts-grid">
          {productsData.map((product) => (
            <div key={product.id} className="HomeTodayDiscounts-card">
              
              {/* Badge */}
              {product.badge && (
                <span className="HomeTodayDiscounts-badge">{product.badge}</span>
              )}

              {/* Action Side Buttons */}
              <div className="HomeTodayDiscounts-actions">
                <button aria-label="Add to Wishlist">
                  <FiHeart />
                </button>
                <button aria-label="Compare">
                  <LuArrowRightLeft />
                </button>
                <button aria-label="Quick View">
                  <FiEye />
                </button>
              </div>

              {/* Hover Navigation Arrow (as seen in Screenshot 2) */}
              <button className="HomeTodayDiscounts-hoverNavBtn" aria-label="Previous">
                <FiChevronLeft />
              </button>

              {/* Image Section with Hover Swap */}
              <div className="HomeTodayDiscounts-imgWrapper">
                <img
                  src={product.primaryImage}
                  alt={product.title}
                  className="HomeTodayDiscounts-img primary-img"
                />
                <img
                  src={product.hoverImage}
                  alt={`${product.title} hover visual`}
                  className="HomeTodayDiscounts-img hover-img"
                />
              </div>

              {/* Product Info */}
              <div className="HomeTodayDiscounts-info">
                <span className="HomeTodayDiscounts-category">{product.category}</span>
                <h3 className="HomeTodayDiscounts-productTitle">{product.title}</h3>

                {/* Rating Stars */}
                <div className="HomeTodayDiscounts-rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < product.rating ? 'star filled' : 'star'}
                    />
                  ))}
                </div>

                {/* Price Box */}
                <div className="HomeTodayDiscounts-priceBox">
                  <span className="HomeTodayDiscounts-currentPrice">{product.price}</span>
                  <span className="HomeTodayDiscounts-originalPrice">{product.originalPrice}</span>
                </div>

                {/* Dropdown Options */}
                <div className="HomeTodayDiscounts-optionGroup">
                  <label>{product.optionLabel}</label>
                  <div className="HomeTodayDiscounts-selectWrapper">
                    <select
                      value={selectedOptions[product.id]}
                      onChange={(e) => handleOptionChange(product.id, e.target.value)}
                    >
                      {product.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="select-arrow" />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="HomeTodayDiscounts-addToCartBtn">
                  Add to Cart <FiChevronRight className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTodayDiscounts;
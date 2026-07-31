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
    hoverImage: bellPepper2,
    link: '/product/bell-pepper'
  },
  {
    id: 2,
    badge: 'New',
    category: 'Bakery',
    title: 'Crunchy Healthy Cookies',
    rating: 5,
    price: '$500.00 USD',
    originalPrice: '$700.00 USD',
    optionLabel: 'Material:',
    options: ['Choco', 'Vanilla', 'Strawberry'],
    primaryImage: cookies1,
    hoverImage: cookies2,
    link: '/product/healthy-cookies'
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
    hoverImage: potato2,
    link: '/product/raw-yellow-potato'
  },
  {
    id: 4,
    badge: null,
    category: 'Kitchen',
    title: 'Kitchen Grater Tool',
    rating: 0,
    price: '$632.00 USD',
    originalPrice: '$680.00 USD',
    optionLabel: 'Color:',
    options: ['Red', 'Silver', 'Black'],
    primaryImage: grater1,
    hoverImage: grater2,
    link: '/product/kitchen-grater'
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

  const handleShowMoreClick = (e) => {
    e.preventDefault();
    window.location.href = '/discounts';
  };

  return (
    <section className="HomeTodayDiscounts" aria-labelledby="today-discounts-heading">
      <div className="HomeTodayDiscounts-container">
        
        {/* Header */}
        <div className="HomeTodayDiscounts-header">
          <h2 id="today-discounts-heading" className="HomeTodayDiscounts-title">
            Grocery Sathi Today Discounts
          </h2>
          <a 
            href="/discounts" 
            className="HomeTodayDiscounts-showMoreBtn"
            onClick={handleShowMoreClick}
            aria-label="View more discounted products"
          >
            <span>Show more products</span> 
            <FiChevronRight className="btn-icon" aria-hidden="true" />
          </a>
        </div>

        {/* Product Cards Grid */}
        <div className="HomeTodayDiscounts-grid">
          {productsData.map((product) => (
            <article 
              key={product.id} 
              className="HomeTodayDiscounts-card"
              itemScope
              itemType="https://schema.org/Product"
            >
              
              {/* Badge */}
              {product.badge && (
                <span className="HomeTodayDiscounts-badge" aria-label={`Status: ${product.badge}`}>
                  {product.badge}
                </span>
              )}

              {/* Action Side Buttons */}
              <div className="HomeTodayDiscounts-actions">
                <button aria-label={`Add ${product.title} to Wishlist`}>
                  <FiHeart aria-hidden="true" />
                </button>
                <button aria-label={`Compare ${product.title}`}>
                  <LuArrowRightLeft aria-hidden="true" />
                </button>
                <button aria-label={`Quick view details for ${product.title}`}>
                  <FiEye aria-hidden="true" />
                </button>
              </div>

              {/* Hover Navigation Arrow */}
              <button className="HomeTodayDiscounts-hoverNavBtn" aria-label="Previous product image">
                <FiChevronLeft aria-hidden="true" />
              </button>

              {/* Image Section with Hover Swap */}
              <div className="HomeTodayDiscounts-imgWrapper">
                <img
                  src={product.primaryImage}
                  alt={`Buy ${product.title} online at Grocery Sathi`}
                  className="HomeTodayDiscounts-img primary-img"
                  itemProp="image"
                />
                <img
                  src={product.hoverImage}
                  alt={`${product.title} alternative angle view`}
                  className="HomeTodayDiscounts-img hover-img"
                />
              </div>

              {/* Product Info */}
              <div className="HomeTodayDiscounts-info">
                <span className="HomeTodayDiscounts-category">{product.category}</span>
                <h3 className="HomeTodayDiscounts-productTitle" itemProp="name">
                  <a href={product.link} className="product-title-link">
                    {product.title}
                  </a>
                </h3>

                {/* Rating Stars */}
                <div 
                  className="HomeTodayDiscounts-rating" 
                  aria-label={`Rated ${product.rating} out of 5 stars`}
                >
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < product.rating ? 'star filled' : 'star'}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Price Box */}
                <div 
                  className="HomeTodayDiscounts-priceBox"
                  itemProp="offers" 
                  itemScope 
                  itemType="https://schema.org/Offer"
                >
                  <meta itemProp="priceCurrency" content="USD" />
                  <span className="HomeTodayDiscounts-currentPrice" itemProp="price">
                    {product.price}
                  </span>
                  <span className="HomeTodayDiscounts-originalPrice" aria-label={`Original price: ${product.originalPrice}`}>
                    {product.originalPrice}
                  </span>
                </div>

                {/* Dropdown Options */}
                <div className="HomeTodayDiscounts-optionGroup">
                  <label htmlFor={`option-select-${product.id}`}>{product.optionLabel}</label>
                  <div className="HomeTodayDiscounts-selectWrapper">
                    <select
                      id={`option-select-${product.id}`}
                      value={selectedOptions[product.id]}
                      onChange={(e) => handleOptionChange(product.id, e.target.value)}
                      aria-label={`Select ${product.optionLabel}`}
                    >
                      {product.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="select-arrow" aria-hidden="true" />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                  className="HomeTodayDiscounts-addToCartBtn"
                  aria-label={`Add ${product.title} to shopping cart`}
                >
                  <span>Add to Cart</span> 
                  <FiChevronRight className="btn-icon" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTodayDiscounts;
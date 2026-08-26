import React, { useState } from 'react';
import './ProductDetailsVegetables.css';

// Local image imports with fallback URLs
import broccoliMain from '../../assets/vege1.webp';
import broccoliThumb1 from '../../assets/vege2.webp';
import broccoliThumb2 from '../../assets/vege4.webp';

const productImages = [
  broccoliMain || 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=800&q=80',
  broccoliThumb1 || 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=400&q=80',
  broccoliThumb2 || 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=400&q=80'
];

// SVG Icons
const StarFilled = () => (
  <svg className="pdv__star-icon" width="16" height="16" viewBox="0 0 24 24" fill="#1b3935">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarOutline = () => (
  <svg className="pdv__star-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b3935" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const ScissorsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CheckBadge = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#2eb5a2">
    <rect width="20" height="20" x="2" y="2" rx="4" />
    <polyline points="7 12 10 15 17 8" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserPlaceholder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#687e7c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ProductDetailsVegetables = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('1 KG');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pdv">
      <div className="pdv__container">
        {/* Top Header Navigation */}
        <header className="pdv__top-bar">
          <button className="pdv__back-link" type="button">
            <span className="pdv__back-circle">
              <ArrowLeft />
            </span>
            <span>Back to category</span>
          </button>

          <button 
            className={`pdv__wishlist-btn ${isWishlisted ? 'pdv__wishlist-btn--active' : ''}`}
            onClick={() => setIsWishlisted(!isWishlisted)}
            type="button"
          >
            <span>Add to wishlist</span>
            <HeartIcon />
          </button>
        </header>

        {/* 3-Column Product Showcase */}
        <div className="pdv__product-grid">
          {/* Column 1: Info & Controls */}
          <section className="pdv__col pdv__col--info">
            <span className="pdv__badge">Fresh Vegetables</span>
            <h1 className="pdv__title">Fresh & Healthy<br />Broccoli</h1>
            <span className="pdv__category-sub">Vegetables</span>

            <div className="pdv__option-group">
              <div className="pdv__option-label">Size: {selectedSize}</div>
              <div className="pdv__size-buttons">
                {['1 KG', '2 KG'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`pdv__size-btn ${selectedSize === size ? 'pdv__size-btn--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pdv__option-group">
              <div className="pdv__option-label">Quantity :</div>
              <div className="pdv__qty-control">
                <button 
                  type="button" 
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pdv__qty-value">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pdv__price-tag">$320.00 USD</div>

            <div className="pdv__actions-stack">
              <button className="pdv__btn-add-cart" type="button">
                <span>Add to Cart</span>
                <span className="pdv__btn-chevron">›</span>
              </button>
              <button className="pdv__btn-buy-now" type="button">
                Buy it now
              </button>
            </div>
          </section>

          {/* Column 2: Gallery & Slider */}
          <section className="pdv__col pdv__col--gallery">
            <div className="pdv__main-image-wrap">
              <img 
                src={productImages[activeImage]} 
                alt="Fresh and Healthy Broccoli" 
                className="pdv__main-image"
              />
            </div>

            <div className="pdv__gallery-footer">
              <div className="pdv__thumbnails">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdv__thumb-btn ${activeImage === idx ? 'pdv__thumb-btn--active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt={`Broccoli thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>

              <div className="pdv__carousel-controls">
                <button 
                  type="button" 
                  className="pdv__nav-btn" 
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button 
                  type="button" 
                  className="pdv__nav-btn pdv__nav-btn--muted" 
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
                <span className="pdv__slider-text">Slide slider</span>
              </div>
            </div>
          </section>

          {/* Column 3: Description & Meta */}
          <section className="pdv__col pdv__col--meta">
            <div className="pdv__rating-header">
              <div className="pdv__star-rating">
                <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarOutline />
              </div>
              <button className="pdv__link-action" type="button">
                <PencilIcon />
                <span>Write a Review</span>
              </button>
            </div>

            <div className="pdv__meta-section">
              <h2 className="pdv__section-heading">Description:</h2>
              <p className="pdv__desc-text">
                Broccoli has large flower heads, usually dark green, arranged in a tree-like 
                structure branching out from a thick stalk which is usually light green. 
                The mass of flower heads is surrounded by leaves. Broccoli resembles cauliflower, 
                which is a different but closely related cultivar group of the same Brassica species.
              </p>
            </div>

            <div className="pdv__meta-section">
              <h2 className="pdv__section-heading">About Product:</h2>
              <div className="pdv__spec-item">
                <span className="pdv__spec-label">SKU:</span>
                <span className="pdv__spec-val">2130550231135</span>
              </div>
              <div className="pdv__spec-item">
                <span className="pdv__spec-label">Category:</span>
                <span className="pdv__spec-val">Fresh Vegetables</span>
              </div>
            </div>

            <div className="pdv__footer-actions">
              <button className="pdv__link-action" type="button">
                <ScissorsIcon />
                <span>See Sizing Guide</span>
              </button>
              <button className="pdv__link-action" type="button">
                <ShareIcon />
                <span>Share</span>
              </button>
            </div>
          </section>
        </div>

        {/* Customer Reviews Section */}
        <section className="pdv__reviews-wrapper">
          <h2 className="pdv__reviews-title">Customer Reviews</h2>

          <div className="pdv__reviews-summary-card">
            {/* Left Score Block */}
            <div className="pdv__score-summary">
              <div className="pdv__score-stars-row">
                <div className="pdv__star-rating">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarOutline />
                </div>
                <span className="pdv__score-val">4.00 out of 5</span>
              </div>
              <div className="pdv__verified-row">
                <span>Based on 1 review</span>
                <CheckBadge />
              </div>
            </div>

            {/* Middle Rating Distribution Bars */}
            <div className="pdv__rating-breakdown">
              {[
                { stars: 5, filled: 5, count: 0, percent: 0 },
                { stars: 4, filled: 4, count: 1, percent: 100 },
                { stars: 3, filled: 3, count: 0, percent: 0 },
                { stars: 2, filled: 2, count: 0, percent: 0 },
                { stars: 1, filled: 1, count: 0, percent: 0 }
              ].map((row) => (
                <div className="pdv__bar-row" key={row.stars}>
                  <div className="pdv__bar-stars">
                    {[...Array(5)].map((_, i) => (
                      i < row.filled 
                        ? <StarFilled key={i} /> 
                        : <StarOutline key={i} />
                    ))}
                  </div>
                  <div className="pdv__progress-track">
                    <div 
                      className="pdv__progress-fill" 
                      style={{ width: `${row.percent}%` }} 
                    />
                  </div>
                  <span className="pdv__bar-count">{row.count}</span>
                </div>
              ))}
            </div>

            {/* Right Review CTA */}
            <div className="pdv__review-cta-wrap">
              <button className="pdv__btn-review" type="button">
                Write a review
              </button>
            </div>
          </div>

          {/* Review List Card */}
          <div className="pdv__review-card-wrap">
            <article className="pdv__review-card">
              <div className="pdv__review-card-head">
                <div className="pdv__star-rating">
                  <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarOutline />
                </div>
                <time className="pdv__review-date">04/25/2024</time>
              </div>

              <div className="pdv__reviewer-profile">
                <div className="pdv__reviewer-avatar">
                  <UserPlaceholder />
                </div>
                <span className="pdv__reviewer-name">K.M.</span>
              </div>

              <h3 className="pdv__review-headline">Nice</h3>
              <p className="pdv__review-body">
                fwqfqfwqfqqqfwqfqwqwqwfc qwfeqsdwqd qwd
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailsVegetables;
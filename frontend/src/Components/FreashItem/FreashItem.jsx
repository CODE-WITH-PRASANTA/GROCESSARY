import React from 'react';
import './FreashItem.css';

// Import your images here (replace with your actual image paths)
import freshFruitsImg from '../../assets/o-1.webp';
import bakeryDonutsImg from '../../assets/o-2.webp';

const FreashItem = () => {
  const items = [
    {
      id: 1,
      badge: 'Daily Discounts',
      title: 'Fresh Organic Fruits',
      description:
        'Discover crisp, farm-fresh organic fruits and vegetables delivered straight to your doorstep. Make delicious, nutrient-packed smoothies, juices, and healthy meals with Grocery Sathi today!',
      buttonText: 'Show products',
      image: freshFruitsImg,
    },
    {
      id: 2,
      badge: 'Daily Discounts',
      title: 'Bakery & Donuts',
      description:
        'Indulge in our freshly baked artisan pastries, soft donuts, and daily bakery essentials. Quality ingredients baked to absolute perfection, ready for quick home delivery.',
      buttonText: 'Show products',
      image: bakeryDonutsImg,
    },
  ];

  return (
    <section className="freash-item-section" aria-labelledby="fresh-highlights-heading">
      <h2 id="fresh-highlights-heading" className="sr-only">Grocery Sathi Fresh Highlights & Offers</h2>
      <div className="freash-item-container">
        {items.map((item) => (
          <article 
            key={item.id} 
            className="freash-item-card"
            itemScope
            itemType="https://schema.org/Product"
          >
            {/* Background Image Container with Hover Zoom */}
            <div className="freash-item-image-wrapper">
              <img
                src={item.image}
                alt={`Buy ${item.title} online at best prices from Grocery Sathi`}
                className="freash-item-image"
                itemProp="image"
                loading="lazy"
              />
              <div className="freash-item-overlay" aria-hidden="true"></div>
            </div>

            {/* Content Overlay */}
            <div className="freash-item-content">
              <span className="freash-item-badge" aria-label={`Offer category: ${item.badge}`}>
                {item.badge}
              </span>
              <h3 className="freash-item-title" itemProp="name">{item.title}</h3>
              <p className="freash-item-description" itemProp="description">
                {item.description}
              </p>
              
              <button 
                className="freash-item-button"
                aria-label={`Explore and show products for ${item.title}`}
              >
                <svg
                  className="freash-item-button-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
                <span>{item.buttonText}</span>
                <span className="freash-item-arrow" aria-hidden="true">&gt;</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FreashItem;
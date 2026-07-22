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
      title: 'Fresh Fruits',
      description:
        'This powerful appliance can help you make hundreds of different kinds of vegetables and fruits into delicious smoothies, juices and more! So don\'t wait any longer, order your Juicery Kitchen Fruits &...',
      buttonText: 'Show products',
      image: freshFruitsImg,
    },
    {
      id: 2,
      badge: 'Daily Discounts',
      title: 'Bakery & Donuts',
      description:
        'Our menu features all of the best fruits and vegetables in the market, so you can always be sure to have a healthy meal on hand. And when you\'re ready to move on to the next meal, just tell us where to deliver',
      buttonText: 'Show products',
      image: bakeryDonutsImg,
    },
  ];

  return (
    <div className="freash-item-section">
      <div className="freash-item-container">
        {items.map((item) => (
          <div key={item.id} className="freash-item-card">
            {/* Background Image Container with Hover Zoom */}
            <div className="freash-item-image-wrapper">
              <img
                src={item.image}
                alt={item.title}
                className="freash-item-image"
              />
              <div className="freash-item-overlay"></div>
            </div>

            {/* Content Overlay */}
            <div className="freash-item-content">
              <span className="freash-item-badge">{item.badge}</span>
              <h2 className="freash-item-title">{item.title}</h2>
              <p className="freash-item-description">{item.description}</p>
              
              <button className="freash-item-button">
                <svg
                  className="freash-item-button-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="18"
                  height="18"
                >
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
                <span>{item.buttonText}</span>
                <span className="freash-item-arrow">&gt;</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreashItem;
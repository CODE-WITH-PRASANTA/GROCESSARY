import React from 'react';
import './ProductDetailsDiscounts.css';
import citrusFruitsImg from '../../assets/green-mandarines.webp';

const ProductDetailsDiscounts = () => {
  const reviews = [
    {
      id: 1,
      title: 'Best shop on the world!',
      rating: '4.5 / 5.0',
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80',
      ],
      className: 'ProductDetailsDiscounts-review-top',
    },
    {
      id: 2,
      title: 'Perfect product on the world!',
      rating: '4.5 / 5.0',
      avatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&auto=format&fit=crop&q=80',
      ],
      className: 'ProductDetailsDiscounts-review-middle',
    },
    {
      id: 3,
      title: 'Quick Customer Support!!',
      rating: '4.5 / 5.0',
      avatars: [
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=60&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&auto=format&fit=crop&q=80',
      ],
      className: 'ProductDetailsDiscounts-review-bottom',
    },
  ];

  return (
    <section className="ProductDetailsDiscounts">
      <div className="ProductDetailsDiscounts-container">
        
        {/* Top Two-Column Section */}
        <div className="ProductDetailsDiscounts-top-grid">
          <div className="ProductDetailsDiscounts-column">
            <span className="ProductDetailsDiscounts-badge">About product</span>
            <h2 className="ProductDetailsDiscounts-heading">Description</h2>
            <p className="ProductDetailsDiscounts-text">
              his all-in-one kitchen product has it all: fruits and vegetables of all types, all at once. The
              best part? They're all healthy and nutritious, so you can enjoy them with peace of mind.
              Whether you're looking for fresh, summer fruit or a quick, healthy veggie salad, Fruits &amp;
              Vegetables has you covered. So get cooking with Fruits &amp; Vegetables today!
            </p>
          </div>

          <div className="ProductDetailsDiscounts-column">
            <span className="ProductDetailsDiscounts-badge">About product</span>
            <h2 className="ProductDetailsDiscounts-heading">About product</h2>
            <p className="ProductDetailsDiscounts-text">
              Our selection of fresh and colorful fruits and vegetables are perfect for nourishing your
              body and taste buds. Whether you're looking for an easy meal to make your day or a
              delicious and healthy snack, our Fruits &amp; Vegetables has you covered!
            </p>
          </div>
        </div>

        {/* Bottom Showcase Section */}
        <div className="ProductDetailsDiscounts-bottom-grid">
          <div className="ProductDetailsDiscounts-service-info">
            <span className="ProductDetailsDiscounts-discount-badge">Daily Discounts</span>
            <h2 className="ProductDetailsDiscounts-service-heading">
              Tailored Service for<br />Shopper
            </h2>
            <p className="ProductDetailsDiscounts-text">
              We love organic, fresh-picked vegetables for their taste and health
              benefits. Fruits &amp; Vegetables has brought you the perfect recipes for all
              your vegetable needs.
            </p>
          </div>

          <div className="ProductDetailsDiscounts-visual-composition">
            <img
              src={citrusFruitsImg}
              alt="Fresh floating citrus slices"
              className="ProductDetailsDiscounts-floating-fruits"
            />

            {reviews.map((review) => (
              <div
                key={review.id}
                className={`ProductDetailsDiscounts-card ${review.className}`}
              >
                <div className="ProductDetailsDiscounts-avatar-group">
                  {review.avatars.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt="User avatar"
                      className="ProductDetailsDiscounts-avatar"
                    />
                  ))}
                </div>
                <div className="ProductDetailsDiscounts-card-content">
                  <h4 className="ProductDetailsDiscounts-card-title">{review.title}</h4>
                  <span className="ProductDetailsDiscounts-card-rating">{review.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductDetailsDiscounts;
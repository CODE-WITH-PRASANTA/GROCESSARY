import React from 'react';
import './HomeDailyDiscounts.css';
import fruitsImg from '../../assets/green-mandarines.webp';

const HomeDailyDiscounts = () => {
  // Avatar URLs for review badges
  const avatars = [
    'https://i.pravatar.cc/100?img=1',
    'https://i.pravatar.cc/100?img=2',
    'https://i.pravatar.cc/100?img=3',
  ];

  return (
    <section className="home-daily-discounts" aria-labelledby="daily-discounts-heading">
      <div className="daily-discounts-container">
        
        {/* Left Content Side */}
        <div className="daily-discounts-content">
          <span className="badge-yellow">Daily Discounts</span>
          <h2 id="daily-discounts-heading" className="main-title">
            Fresh Fruits <br />
            &amp; Organic Vegetables
          </h2>
          <p className="description">
            We love organic, farm-fresh vegetables for their superior taste and health
            benefits. Grocery Sathi brings you the absolute best everyday deals and fresh produce recipes for all your healthy household needs.
          </p>
        </div>

        {/* Right Image & Badges Side */}
        <div className="daily-discounts-visual" role="region" aria-label="Customer reviews and organic citrus display">
          <img
            src={fruitsImg}
            alt="Fresh Organic Green Mandarines and Citrus Fruits on Grocery Sathi"
            className="main-image"
          />

          {/* Badge 1: Top Left Floating */}
          <div className="review-card badge-top-left" aria-label="Review: Best shop on the world, rated 4.5 out of 5 stars">
            <div className="avatar-group" aria-hidden="true">
              {avatars.map((url, index) => (
                <img key={index} src={url} alt="" className="avatar-img" />
              ))}
            </div>
            <div className="review-details">
              <span className="review-title">Best shop in the world!</span>
              <span className="rating-score">
                4.5 / <span className="highlight-yellow">5.0</span>
              </span>
            </div>
          </div>

          {/* Badge 2: Middle Right Floating */}
          <div className="review-card badge-middle-right" aria-label="Review: Perfect product on the world, rated 4.5 out of 5 stars">
            <div className="avatar-group" aria-hidden="true">
              {avatars.map((url, index) => (
                <img key={index} src={url} alt="" className="avatar-img" />
              ))}
            </div>
            <div className="review-details">
              <span className="review-title">Perfect product quality!</span>
              <span className="rating-score">
                4.5 / <span className="highlight-yellow">5.0</span>
              </span>
            </div>
          </div>

          {/* Badge 3: Bottom Left Floating */}
          <div className="review-card badge-bottom-left" aria-label="Review: Quick Customer Support, rated 4.5 out of 5 stars">
            <div className="avatar-group" aria-hidden="true">
              {avatars.map((url, index) => (
                <img key={index} src={url} alt="" className="avatar-img" />
              ))}
            </div>
            <div className="review-details">
              <span className="review-title">Quick Customer Support!!</span>
              <span className="rating-score">
                4.5 / <span className="highlight-yellow">5.0</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeDailyDiscounts;
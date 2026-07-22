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
    <section className="home-daily-discounts">
      <div className="daily-discounts-container">
        
        {/* Left Content Side */}
        <div className="daily-discounts-content">
          <span className="badge-yellow">Daily Discounts</span>
          <h1 className="main-title">
            Fruits <br />
            &amp; Vegetables
          </h1>
          <p className="description">
            We love organic, fresh-picked vegetables for their taste and health
            benefits. Fruits &amp; Vegetables has brought you the perfect recipes for all
            your vegetable needs.
          </p>
        </div>

        {/* Right Image & Badges Side */}
        <div className="daily-discounts-visual">
          <img
            src={fruitsImg}
            alt="Fresh Citrus Fruits"
            className="main-image"
          />

          {/* Badge 1: Top Left Floating */}
          <div className="review-card badge-top-left">
            <div className="avatar-group">
              {avatars.map((url, index) => (
                <img key={index} src={url} alt="User Avatar" className="avatar-img" />
              ))}
            </div>
            <div className="review-details">
              <span className="review-title">Best shop on the world!</span>
              <span className="rating-score">
                4.5 / <span className="highlight-yellow">5.0</span>
              </span>
            </div>
          </div>

          {/* Badge 2: Middle Right Floating */}
          <div className="review-card badge-middle-right">
            <div className="avatar-group">
              {avatars.map((url, index) => (
                <img key={index} src={url} alt="User Avatar" className="avatar-img" />
              ))}
            </div>
            <div className="review-details">
              <span className="review-title">Perfect product on the world!</span>
              <span className="rating-score">
                4.5 / <span className="highlight-yellow">5.0</span>
              </span>
            </div>
          </div>

          {/* Badge 3: Bottom Left Floating */}
          <div className="review-card badge-bottom-left">
            <div className="avatar-group">
              {avatars.map((url, index) => (
                <img key={index} src={url} alt="User Avatar" className="avatar-img" />
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
import React, { useState } from 'react';
import './HeroSection.css';

import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaThLarge 
} from 'react-icons/fa';

import mainBannerBg from '../../assets/banner-image.webp';

const slidesData = [
  {
    id: 1,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Healthful\nIngredients',
    description:
      'Step into a world of fresh produce, vibrant colors, and enticing aromas at our grocery store. We offer a wide selection of fruits, vegetables, and organic products for health-conscious shoppers.',
  },
  {
    id: 2,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Exquisite\nTaste',
    description:
      "These superfoods are packed with vital nutrients, including vitamins and minerals that can help keep you healthy. Plus, they're easy to enjoy - just add water and let the magic happen!",
  },
  {
    id: 3,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Convenience\nand Quality',
    description:
      'Discover a treasure trove of gourmet ingredients at our grocery store. From artisanal cheeses and imported chocolates to exotic spices and rare oils, we have everything you need to elevate your culinary creations.',
  },
  {
    id: 4,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Dessert\nWonderland',
    description:
      'Experience the convenience of one-stop shopping at our grocery store. With aisles stocked with pantry staples, household essentials, and personal care items, we make it easy to check off your entire shopping list.',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
  };

  const slide = slidesData[currentSlide];

  return (
    <section className="hero-container">
      {/* Background Image Layer */}
      <div
        className="hero-background-image"
        style={{ backgroundImage: `url(${mainBannerBg})` }}
        aria-hidden="true"
      />

      {/* Main Content Wrapper */}
      <div className="hero-content">
        <main className="hero-main-slider">
          <div className="slider-content-wrapper" key={slide.id}>
            
            {/* Badges Header */}
            <div className="badge-wrapper">
              <span className="badge">{slide.tag}</span>
              <div className="discount-badge">
                <span className="discount-text">{slide.discount}</span>
              </div>
            </div>

            {/* Typography */}
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-description">{slide.description}</p>

            {/* Action Button */}
            <button className="btn-show-products" type="button">
              <FaThLarge className="btn-grid-icon" />
              <span>Show products</span>
              <FaChevronRight className="btn-arrow" />
            </button>

            {/* Navigation Arrows */}
            <div className="slider-navigation">
              <button
                className="nav-btn"
                onClick={handlePrev}
                aria-label="Previous slide"
                type="button"
              >
                <FaChevronLeft />
              </button>
              <button
                className="nav-btn"
                onClick={handleNext}
                aria-label="Next slide"
                type="button"
              >
                <FaChevronRight />
              </button>
            </div>

          </div>
        </main>
      </div>
    </section>
  );
};

export default HeroSection;
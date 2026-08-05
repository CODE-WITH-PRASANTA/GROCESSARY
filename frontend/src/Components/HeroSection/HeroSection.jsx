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
      'Step into a world of farm-fresh produce, vibrant colors, and authentic organic groceries at Grocery Sathi. We offer a wide selection of healthy fruits, vegetables, and daily essentials for health-conscious shoppers.',
  },
  {
    id: 2,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Exquisite\nTaste',
    description:
      "Explore nutrient-packed superfoods loaded with vital vitamins and minerals to keep your family healthy. Enjoy effortless online grocery shopping with quick doorstep delivery.",
  },
  {
    id: 3,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Convenience\nand Quality',
    description:
      'Discover a treasure trove of gourmet ingredients, artisanal cheeses, imported chocolates, and rare spices at Grocery Sathi. Everything you need to elevate your culinary creations in one place.',
  },
  {
    id: 4,
    tag: 'Daily Discounts',
    discount: '-30%\nOFF',
    title: 'Dessert\nWonderland',
    description:
      'Experience the true convenience of one-stop online grocery shopping. From pantry staples and household essentials to personal care items, we make checking off your grocery list seamless.',
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
    <section className="hero-container" aria-label="Grocery Sathi Featured Deals and Highlights">
      {/* Background Image Layer with SEO-friendly role configuration */}
      <div
        className="hero-background-image"
        style={{ backgroundImage: `url(${mainBannerBg})` }}
        role="img"
        aria-label="Fresh organic grocery produce and ingredients banner"
      />

      {/* Main Content Wrapper */}
      <div className="hero-content">
        <main className="hero-main-slider">
          <div className="slider-content-wrapper" key={slide.id} aria-live="polite">
            
            {/* Badges Header */}
            <div className="badge-wrapper">
              <span className="badge">{slide.tag}</span>
              <div className="discount-badge" aria-label="30 percent off discount">
                <span className="discount-text">{slide.discount}</span>
              </div>
            </div>

            {/* SEO Structured Typography */}
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-description">{slide.description}</p>

            {/* Action Button */}
            <button className="btn-show-products" type="button">
              <FaThLarge className="btn-grid-icon" aria-hidden="true" />
              <span>Show products</span>
              <FaChevronRight className="btn-arrow" aria-hidden="true" />
            </button>

            {/* Navigation Controls */}
            <nav className="slider-navigation" aria-label="Hero Slider Navigation">
              <button
                className="nav-btn"
                onClick={handlePrev}
                aria-label="Previous slide"
                type="button"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>
              <button
                className="nav-btn"
                onClick={handleNext}
                aria-label="Next slide"
                type="button"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </nav>

          </div>
        </main>
      </div>
    </section>
  );
};

export default HeroSection;
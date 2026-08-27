// ProductDetailsTestimonials.jsx
import React, { useState, useEffect } from 'react';
import './ProductDetailsTestimonials.css';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonialsData = [
  {
    id: 1,
    score: '4.5 / 5.0',
    rating: 5,
    title: 'Great Customer Support',
    text: "I'm so happy with my purchase from [company name]. The product is exactly what I was looking for, and it's even better...",
    customerName: 'Ewan Sharpe',
    role: 'Developer',
    productName: 'Basil Leaves',
    customerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    score: '4.5 / 5.0',
    rating: 5,
    title: 'Helpful Products',
    text: 'Great theme with LOTS of options and GREAT support. Their support is awesome. Great communication and...',
    customerName: 'Sarah Williams',
    role: 'Patient',
    productName: 'Basil Leaves',
    customerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    score: '4.5 / 5.0',
    rating: 5,
    title: 'Excellent service!',
    text: 'I was so impressed with the customer service I received from [company name]. The staff was friendly and helpful,...',
    customerName: 'john doe',
    role: 'Client',
    productName: 'Basil Leaves',
    customerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    score: '4.5 / 5.0',
    rating: 5,
    title: 'Great Products',
    text: "I was hesitant to order online, but I'm so glad I did! The product arrived quickly and in perfect condition. I would...",
    customerName: 'Isabel Hanson',
    role: 'SEO',
    productName: 'Basil Leaves',
    customerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&auto=format&fit=crop&q=80',
  },
];

const ProductDetailsTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1200) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonialsData.length - cardsPerView);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  return (
    <section className="product-details-testimonials">
      <div className="product-details-testimonials__container">
        {/* Left Side Info */}
        <div className="product-details-testimonials__intro">
          <h2 className="product-details-testimonials__title">Testimonials</h2>
          <p className="product-details-testimonials__description">
            Grocery stores are an important part of the food supply chain. They
            provide a convenient way for consumers to purchase a variety of food
            products, and they play a role in ensuring that food is safe and
            accessible to everyone.
          </p>
        </div>

        {/* Right Side Carousel */}
        <div className="product-details-testimonials__carousel-wrapper">
          <button
            type="button"
            className="product-details-testimonials__arrow product-details-testimonials__arrow--prev"
            onClick={prevSlide}
            aria-label="Previous testimonial"
          >
            <FaChevronLeft />
          </button>

          <div className="product-details-testimonials__slider-viewport">
            <div
              className="product-details-testimonials__track"
              style={{
                transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
              }}
            >
              {testimonialsData.map((item) => (
                <div
                  className="product-details-testimonials__card-item"
                  key={item.id}
                >
                  <div className="product-details-testimonials__card">
                    {/* Rating Bar */}
                    <div className="product-details-testimonials__rating-header">
                      <div className="product-details-testimonials__stars">
                        {[...Array(item.rating)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                      <span className="product-details-testimonials__score">
                        {item.score}
                      </span>
                    </div>

                    {/* Review Title & Body */}
                    <h3 className="product-details-testimonials__review-title">
                      {item.title}
                    </h3>
                    <p className="product-details-testimonials__review-text">
                      {item.text}
                    </p>

                    {/* Customer Info */}
                    <div className="product-details-testimonials__customer">
                      <img
                        src={item.customerImage}
                        alt={item.customerName}
                        className="product-details-testimonials__avatar"
                      />
                      <div className="product-details-testimonials__meta">
                        <p className="product-details-testimonials__name-role">
                          <strong>{item.customerName}</strong>, {item.role}
                        </p>
                        <p className="product-details-testimonials__product-ref">
                          about {item.productName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="product-details-testimonials__arrow product-details-testimonials__arrow--next"
            onClick={nextSlide}
            aria-label="Next testimonial"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsTestimonials;
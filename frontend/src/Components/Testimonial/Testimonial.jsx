import React, { useRef } from 'react';
import './Testimonial.css';

const testimonialsData = [
  {
    id: 1,
    rating: 4.5,
    title: 'Excellent service!',
    text: 'I was so impressed with the customer service I received from company name. The staff was friendly and helpful, and...',
    author: 'John Doe',
    role: 'Client',
    product: 'about Basil Leaves',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 2,
    rating: 4.5,
    title: 'Great Products',
    text: 'I was hesitant to order online, but I\'m so glad I did! The product arrived quickly and in perfect condition. I would...',
    author: 'Isabel Hanson',
    role: 'SEO',
    product: 'about Basil Leaves',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 3,
    rating: 4.5,
    title: 'Customer Support',
    text: 'I\'m so happy with my purchase from company name . The product is exactly what I was looking for, and it\'s even better...',
    author: 'Ewan Sharpe',
    role: 'Developer',
    product: 'about Basil Leaves',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 4,
    rating: 5.0,
    title: 'Highly Recommended',
    text: 'The quality of the organic products exceeded all my expectations. Fast delivery and eco-friendly packaging!',
    author: 'Sarah Jenkins',
    role: 'Designer',
    product: 'about Basil Leaves',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  }
];

const Testimonial = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 350;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="testimonial">
      <div className="testimonial-container">
        
        {/* Left Side: Header Section */}
        <div className="testimonial-header">
          <h2 className="testimonial-title">Testimonials</h2>
          <p className="testimonial-description">
            Grocery stores are an important part of the food supply chain. They provide a convenient way for consumers to purchase a variety of food products, and they play a role in ensuring that food is safe and accessible to everyone.
          </p>
          
          {/* Navigation Arrows */}
          <div className="testimonial-controls">
            <button 
              className="testimonial-arrow testimonial-arrow-left" 
              onClick={() => scroll('left')}
              aria-label="Previous testimonials"
            >
              &#8592;
            </button>
            <button 
              className="testimonial-arrow testimonial-arrow-right" 
              onClick={() => scroll('right')}
              aria-label="Next testimonials"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Right Side: Scrollable Cards Section */}
        <div className="testimonial-slider" ref={scrollRef}>
          {testimonialsData.map((item) => (
            <div className="testimonial-card" key={item.id}>
              
              {/* Star Rating Header */}
              <div className="testimonial-rating">
                <div className="testimonial-stars">
                  {'★'.repeat(5)}
                </div>
                <span className="testimonial-rating-score">{item.rating.toFixed(1)} / 5.0</span>
              </div>

              {/* Review Content */}
              <h3 className="testimonial-card-title">{item.title}</h3>
              <p className="testimonial-card-text">{item.text}</p>

              {/* Author Details */}
              <div className="testimonial-author-wrapper">
                <img 
                  src={item.avatar} 
                  alt={item.author} 
                  className="testimonial-author-avatar" 
                />
                <div className="testimonial-author-info">
                  <p className="testimonial-author-name">
                    <strong>{item.author}</strong>, <span>{item.role}</span>
                  </p>
                  <p className="testimonial-product">{item.product}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonial;
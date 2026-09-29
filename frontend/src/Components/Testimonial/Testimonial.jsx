import React, { useEffect, useRef, useState } from 'react';
import API, { IMG_URL } from '../../api/axios';
import './Testimonial.css';

const fallbackTestimonials = [
  {
    id: 1,
    rating: 4.5,
    title: 'Excellent service & fresh delivery!',
    text: 'I was so impressed with the customer service and fresh organic produce I received from Grocery Sathi. The delivery was fast and everything was in pristine condition...',
    author: 'John Doe',
    role: 'Verified Buyer',
    product: 'Fresh Basil Leaves & Produce',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 2,
    rating: 4.5,
    title: 'Great Organic Products',
    text: 'I was hesitant to order groceries online, but I am so glad I did! The items arrived chilled, quickly, and in perfect condition. Highly recommend Grocery Sathi...',
    author: 'Isabel Hanson',
    role: 'Regular Customer',
    product: 'Organic Vegetables & Greens',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 3,
    rating: 4.5,
    title: 'Exceptional Customer Support',
    text: 'I am so happy with my order from Grocery Sathi. The products are exceptionally fresh, organic, and exactly what I was looking for to maintain a healthy diet...',
    author: 'Ewan Sharpe',
    role: 'Food Enthusiast',
    product: 'Daily Bakery & Essentials',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 4,
    rating: 5.0,
    title: 'Highly Recommended Store',
    text: 'The quality of the organic grocery products exceeded all my expectations. Fast home delivery, friendly delivery staff, and eco-friendly packaging!',
    author: 'Sarah Jenkins',
    role: 'Home Chef',
    product: 'Organic Fruits & Herbs',
    avatar: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150'
  }
];

const normalizeReviewImage = (image) => {
  if (!image) return '';
  if (typeof image === 'string') {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `${IMG_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  }
  if (typeof image === 'object') {
    const direct = image.url || image.path || image.secure_url || image.src || '';
    if (direct) return normalizeReviewImage(direct);
  }
  return '';
};

const Testimonial = () => {
  const scrollRef = useRef(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const { data } = await API.get('/reviews/latest?limit=5');
        const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

        if (!reviews.length) {
          setTestimonials(fallbackTestimonials);
          return;
        }

        const mapped = reviews.map((review) => {
          const product = review.product || {};
          const productName = product.productName || product.name || 'Grocery Sathi Product';
          const productImage = Array.isArray(product.images) && product.images.length
            ? product.images[0]
            : product.image || '';

          return {
            id: review._id || review.id,
            rating: Number(review.rating) || 0,
            title: review.title || 'Great experience',
            text: review.comment || review.text || '',
            author: review.reviewerName || review.user?.name || 'Verified Customer',
            role: review.verifiedPurchase ? 'Verified Buyer' : 'Verified Customer',
            product: productName,
            avatar: normalizeReviewImage(productImage) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150',
          };
        });

        setTestimonials(mapped);
      } catch (error) {
        console.error('Fetch latest reviews error:', error);
        setTestimonials(fallbackTestimonials);
      }
    };

    fetchLatestReviews();
  }, []);

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
    <section 
      className="testimonial" 
      aria-labelledby="testimonial-section-title"
      itemScope 
      itemType="https://schema.org/Product"
    >
      {/* Hidden SEO meta description for schema aggregation */}
      <meta itemProp="name" content="Grocery Sathi Organic Products & Fresh Delivery" />
      
      <div className="testimonial-container">
        
        {/* Left Side: Header Section */}
        <div className="testimonial-header">
          <span className="testimonial-subtitle">Customer Feedback</span>
          <h2 id="testimonial-section-title" className="testimonial-title">What Our Customers Say</h2>
          <p className="testimonial-description">
            Grocery Sathi connects you to farm-fresh organic food products, ensuring safety, nutrition, and reliable doorstep delivery for every household.
          </p>
          
          {/* Navigation Arrows */}
          <div className="testimonial-controls" aria-label="Testimonial slider controls">
            <button 
              className="testimonial-arrow testimonial-arrow-left" 
              onClick={() => scroll('left')}
              aria-label="Previous customer testimonials"
            >
              &#8592;
            </button>
            <button 
              className="testimonial-arrow testimonial-arrow-right" 
              onClick={() => scroll('right')}
              aria-label="Next customer testimonials"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Right Side: Scrollable Cards Section */}
        <div className="testimonial-slider" ref={scrollRef}>
          {(testimonials || []).map((item) => (
            <article 
              className="testimonial-card" 
              key={item.id}
              itemScope 
              itemType="https://schema.org/Review"
            >
              <meta itemProp="itemReviewed" content="Grocery Sathi Organic Delivery" />
              
              {/* Star Rating Header */}
              <div 
                className="testimonial-rating"
                itemScope 
                itemType="https://schema.org/Rating"
              >
                <meta itemProp="ratingValue" content={item.rating} />
                <meta itemProp="bestRating" content="5" />
                <div className="testimonial-stars" aria-label={`Rated ${item.rating} out of 5 stars`}>
                  {'★'.repeat(5)}
                </div>
                <span className="testimonial-rating-score">{Number(item.rating || 0).toFixed(1)} / 5.0</span>
              </div>

              {/* Review Content */}
              <h3 className="testimonial-card-title" itemProp="headline">{item.title}</h3>
              <p className="testimonial-card-text" itemProp="reviewBody">{item.text}</p>

              {/* Author Details */}
              <div 
                className="testimonial-author-wrapper"
                itemScope 
                itemType="https://schema.org/Person"
              >
                <img 
                  src={item.avatar} 
                  alt={`Customer avatar for ${item.author}`} 
                  className="testimonial-author-avatar"
                  loading="lazy"
                />
                <div className="testimonial-author-info">
                  <p className="testimonial-author-name">
                    <strong itemProp="name">{item.author}</strong>, <span className="testimonial-role">{item.role}</span>
                  </p>
                  {/* <p className="testimonial-product">{item.product}</p> */}
                </div>
              </div>

            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonial;
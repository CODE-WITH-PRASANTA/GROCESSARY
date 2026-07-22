import React, { useRef } from 'react';
import './Blog.css';

const blogData = [
  {
    id: 1,
    tag: 'news',
    title: 'Fruit is an essenti...',
    description: 'Explore the world of culinary delights with our grocery blog, where we highlight unique ingredients, share delicious recipes, and provide...',
    author: 'WorkDo',
    date: 'December 5, 2022',
    // Fresh Oranges
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    tag: 'news',
    title: 'Keeping Your Fruit...',
    description: 'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need...',
    author: 'WorkDo',
    date: 'December 5, 2022',
    // Fresh Peaches / Apricots (Fixed URL)
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    tag: 'news',
    title: 'Tasty Fruits & Veg...',
    description: 'Strawberries, blueberries, raspberries, and blackberries are not only delicious but also packed with antioxidants and vitamins. Add the...',
    author: 'WorkDo',
    date: 'December 5, 2022',
    // Fresh Greens & Vegetables
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop'
  },
  {
    id: 4,
    tag: 'news',
    title: 'Testy Blueberry Fr...',
    description: 'Blueberry fragrance oil can add a delightful and enticing scent to various products. Whether you\'re making candles, soaps, lotions, or...',
    author: 'WorkDo',
    date: 'December 5, 2022',
    // Blueberries
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&auto=format&fit=crop'
  },
  {
    id: 5,
    tag: 'news',
    title: 'Organic Green Leaf...',
    description: 'Fresh leafy greens are a staple for every healthy diet. Learn how to keep them crisp and delicious for longer periods...',
    author: 'WorkDo',
    date: 'December 6, 2022',
    // Leafy Greens
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop'
  }
];

const Blog = () => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="blog">
      {/* Top Header */}
      <div className="blog-header">
        <h2 className="blog-title">Blog & Articles</h2>
      </div>

      {/* Main Content Area with Split Background */}
      <div className="blog-content-wrapper">
        <div className="blog-bg-split"></div>

        {/* Left Scroll Arrow */}
        <button 
          className="blog-arrow blog-arrow-left" 
          onClick={() => scroll('left')}
          aria-label="Previous articles"
        >
          &#10094;
        </button>

        {/* Scrollable Container */}
        <div className="blog-slider" ref={sliderRef}>
          {blogData.map((item) => (
            <article className="blog-card" key={item.id}>
              
              {/* Image & Tag Badge */}
              <div className="blog-card-image-wrapper">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="blog-card-image"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback image if network or CORS fails
                    e.target.src = "https://via.placeholder.com/600x400?text=Fruit+Image";
                  }}
                />
                <span className="blog-card-tag">{item.tag}</span>
              </div>

              {/* Card Body */}
              <div className="blog-card-body">
                <h3 className="blog-card-title">{item.title}</h3>
                <p className="blog-card-description">{item.description}</p>
                
                {/* Footer Section */}
                <div className="blog-card-footer">
                  <a href="#read-more" className="blog-card-button">
                    Read more <span className="blog-card-button-icon">&#10095;</span>
                  </a>
                  <div className="blog-card-meta">
                    <span className="blog-card-author">{item.author},</span>
                    <span className="blog-card-date">{item.date}</span>
                  </div>
                </div>
              </div>

            </article>
          ))}
        </div>

        {/* Right Scroll Arrow */}
        <button 
          className="blog-arrow blog-arrow-right" 
          onClick={() => scroll('right')}
          aria-label="Next articles"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default Blog;
import React, { useRef } from 'react';
import './Blog.css';

const blogData = [
  {
    id: 1,
    tag: 'Fresh Tips',
    title: 'Why Fresh Fruit Is Essential for Your Daily Nutrition',
    description: 'Explore the world of culinary delights with the Grocery Sathi blog, where we highlight unique organic ingredients, share delicious recipes, and provide healthy living guides...',
    author: 'Grocery Sathi Editorial',
    date: '2026-06-05',
    formattedDate: 'June 5, 2026',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    tag: 'Storage Guide',
    title: 'How to Keep Your Fruits & Vegetables Crispy Longer',
    description: 'Different fruits and vegetables have unique storage requirements. Learn how to store produce properly at room temperature or in cold environments to retain peak freshness...',
    author: 'Grocery Sathi Editorial',
    date: '2026-06-05',
    formattedDate: 'June 5, 2026',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    tag: 'Health & Diet',
    title: 'Tasty Berries & Organic Greens for Immunity',
    description: 'Strawberries, blueberries, raspberries, and leafy greens are packed with antioxidants and vitamins. Discover how adding these to your daily diet boosts overall wellness...',
    author: 'Grocery Sathi Editorial',
    date: '2026-06-05',
    formattedDate: 'June 5, 2026',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop'
  },
  {
    id: 4,
    tag: 'Recipes',
    title: 'Supercharge Your Morning Smoothies with Fresh Blueberries',
    description: 'Fresh blueberries add a delightful and enticing flavor profile to your breakfast bowls and smoothies. Learn easy ways to incorporate farm-fresh berries into your daily routine...',
    author: 'Grocery Sathi Editorial',
    date: '2026-06-05',
    formattedDate: 'June 5, 2026',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&auto=format&fit=crop'
  },
  {
    id: 5,
    tag: 'Organic Living',
    title: 'The Ultimate Guide to Choosing Organic Green Leafy Vegetables',
    description: 'Fresh leafy greens are a staple for every healthy household. Learn how to identify quality organic produce and keep them crisp for longer periods after home delivery...',
    author: 'Grocery Sathi Editorial',
    date: '2026-06-06',
    formattedDate: 'June 6, 2026',
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
    <section className="blog" aria-labelledby="blog-section-title">
      {/* Top Header */}
      <div className="blog-header">
        <span className="blog-subtitle">Our Journal</span>
        <h2 id="blog-section-title" className="blog-title">Blog & Articles</h2>
        <p className="blog-section-desc">Stay updated with fresh produce tips, healthy recipes, and organic grocery insights from Grocery Sathi.</p>
      </div>

      {/* Main Content Area with Split Background */}
      <div className="blog-content-wrapper">
        <div className="blog-bg-split" aria-hidden="true"></div>

        {/* Left Scroll Arrow */}
        <button 
          className="blog-arrow blog-arrow-left" 
          onClick={() => scroll('left')}
          aria-label="Scroll articles to the left"
        >
          &#10094;
        </button>

        {/* Scrollable Container */}
        <div className="blog-slider" ref={sliderRef}>
          {blogData.map((item) => (
            <article 
              className="blog-card" 
              key={item.id}
              itemScope 
              itemType="https://schema.org/BlogPosting"
            >
              <meta itemProp="mainEntityOfPage" content={`#blog-article-${item.id}`} />
              
              {/* Image & Tag Badge */}
              <div className="blog-card-image-wrapper">
                <img 
                  src={item.image} 
                  alt={`Illustration for ${item.title}`} 
                  className="blog-card-image"
                  itemProp="image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400?text=Grocery+Sathi+Blog";
                  }}
                />
                <span className="blog-card-tag">{item.tag}</span>
              </div>

              {/* Card Body */}
              <div className="blog-card-body">
                <div>
                  <h3 className="blog-card-title" itemProp="headline">{item.title}</h3>
                  <p className="blog-card-description" itemProp="description">{item.description}</p>
                </div>
                
                {/* Footer Section */}
                <div className="blog-card-footer">
                  <a href="#read-more" className="blog-card-button" aria-label={`Read full article: ${item.title}`}>
                    Read more <span className="blog-card-button-icon" aria-hidden="true">&#10095;</span>
                  </a>
                  <div className="blog-card-meta" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span className="blog-card-author" itemProp="name">{item.author},</span>
                    <time className="blog-card-date" dateTime={item.date} itemProp="datePublished">{item.formattedDate}</time>
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
          aria-label="Scroll articles to the right"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default Blog;
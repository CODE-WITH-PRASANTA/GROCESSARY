import React, { useState, useRef, useEffect } from 'react';
import './BlogManagement.css';

const initialBlogData = [
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

const BlogManagement = () => {
  const [blogs, setBlogs] = useState(initialBlogData);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const sliderRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.BlogManagement-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleEdit = (blog) => {
    setActiveMenuId(null);
    alert(`Edit blog ID: ${blog.id} - "${blog.title}"`);
    // Implement your edit routing or modal trigger here
  };

  const handleDelete = (id) => {
    setActiveMenuId(null);
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogs(blogs.filter((blog) => blog.id !== id));
    }
  };

  return (
    <section className="BlogManagement" aria-labelledby="BlogManagement-section-title">
      {/* Top Header */}
      <div className="BlogManagement-header">
        <span className="BlogManagement-subtitle">Our Journal</span>
        <h2 id="BlogManagement-section-title" className="BlogManagement-title">Blog & Articles</h2>
        <p className="BlogManagement-section-desc">Stay updated with fresh produce tips, healthy recipes, and organic grocery insights from Grocery Sathi.</p>
      </div>

      {/* Main Content Area with Split Background */}
      <div className="BlogManagement-content-wrapper">
        <div className="BlogManagement-bg-split" aria-hidden="true"></div>

        {/* Left Scroll Arrow */}
        <button
          className="BlogManagement-arrow BlogManagement-arrow-left"
          onClick={() => scroll('left')}
          aria-label="Scroll articles to the left"
        >
          &#10094;
        </button>

        {/* Scrollable Container */}
        <div className="BlogManagement-slider" ref={sliderRef}>
          {blogs.map((item) => (
            <article
              className="BlogManagement-card"
              key={item.id}
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <meta itemProp="mainEntityOfPage" content={`#blog-article-${item.id}`} />

              {/* Image & Tag Badge */}
              <div className="BlogManagement-card-image-wrapper">
                <img
                  src={item.image}
                  alt={`Illustration for ${item.title}`}
                  className="BlogManagement-card-image"
                  itemProp="image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400?text=Grocery+Sathi+Blog";
                  }}
                />
                <span className="BlogManagement-card-tag">{item.tag}</span>

                {/* Three-Dot Options Menu */}
                <div className="BlogManagement-menu-container">
                  <button
                    className="BlogManagement-dots-btn"
                    onClick={(e) => toggleMenu(item.id, e)}
                    aria-label="Blog post options"
                  >
                    &#8230;
                  </button>

                  {activeMenuId === item.id && (
                    <div className="BlogManagement-dropdown">
                      <button 
                        className="BlogManagement-dropdown-item edit"
                        onClick={() => handleEdit(item)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        className="BlogManagement-dropdown-item delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="BlogManagement-card-body">
                <div>
                  <h3 className="BlogManagement-card-title" itemProp="headline">{item.title}</h3>
                  <p className="BlogManagement-card-description" itemProp="description">{item.description}</p>
                </div>

                {/* Footer Section */}
                <div className="BlogManagement-card-footer">
                  <a href="#read-more" className="BlogManagement-card-button" aria-label={`Read full article: ${item.title}`}>
                    Read more <span className="BlogManagement-card-button-icon" aria-hidden="true">&#10095;</span>
                  </a>
                  <div className="BlogManagement-card-meta" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span className="BlogManagement-card-author" itemProp="name">{item.author},</span>
                    <time className="BlogManagement-card-date" dateTime={item.date} itemProp="datePublished">{item.formattedDate}</time>
                  </div>
                </div>
              </div>

            </article>
          ))}
        </div>

        {/* Right Scroll Arrow */}
        <button
          className="BlogManagement-arrow BlogManagement-arrow-right"
          onClick={() => scroll('right')}
          aria-label="Scroll articles to the right"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default BlogManagement;
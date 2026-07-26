import React, { useState } from 'react';
import './BlogGrid.css';

// Import local images from your project
import blogfruit1 from '../../assets/blogfruit1.webp';
import blogfruit2 from '../../assets/blogfruit2.webp';
import blogfruit3 from '../../assets/blogfruit3.webp';
import blogfruit4 from '../../assets/blogfruit4.webp';

const BlogGrid = () => {
  // State for handling active pagination page
  const [currentPage, setCurrentPage] = useState(1);

  // Mock Blog Data for Pagination Demo
  const allBlogs = [
    {
      id: 1,
      image: blogfruit1,
      tag: 'news',
      title: 'Fruit is an essenti...',
      description: 'Explore the world of culinary delights with our grocery blog, where we highlight unique ingredients, share delicious recipes, and provide...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit2,
      tag: 'news',
      title: 'Keeping Your Fruit...',
      description: 'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 3,
      image: blogfruit3,
      tag: 'news',
      title: 'Tasty Fruits & Veg...',
      description: 'Strawberries, blueberries, raspberries, and blackberries are not only delicious but also packed with antioxidants and vitamins. Add the...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 4,
      image: blogfruit4,
      tag: 'news',
      title: 'Testy Blueberry Fr...',
      description: 'Blueberry fragrance oil can add a delightful and enticing scent to various products. Whether you\'re making candles, soaps, lotions, or...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    // Page 2 Mock Data
    {
      id: 5,
      image: blogfruit1,
      tag: 'news',
      title: 'Fresh Organic Produce',
      description: 'Discover how organic farming practices bring healthier and fresher fruits and vegetables directly from farms to your kitchen table...',
      author: 'WorkDo,',
      date: 'December 8, 2022'
    },
    {
      id: 6,
      image: blogfruit2,
      tag: 'news',
      title: 'Seasonal Fruit Guide',
      description: 'Learn which fruits are in season this month to get maximum flavor, nutritional value, and the best prices on your grocery run...',
      author: 'WorkDo,',
      date: 'December 10, 2022'
    },
    {
      id: 7,
      image: blogfruit3,
      tag: 'news',
      title: 'Healthy Green Smoothies',
      description: 'Blend your way to health with these easy green smoothie recipes featuring fresh spinach, kale, apples, and energizing chia seeds...',
      author: 'WorkDo,',
      date: 'December 12, 2022'
    },
    {
      id: 8,
      image: blogfruit4,
      tag: 'news',
      title: 'Antioxidant Superfoods',
      description: 'Uncover the top antioxidant-rich berries that boost your immune system and keep your body feeling fresh and energized every day...',
      author: 'WorkDo,',
      date: 'December 15, 2022'
    }
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(allBlogs.length / itemsPerPage);

  // Slice items for active page
  const currentBlogs = allBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReadMore = (blogTitle) => {
    // Navigate or trigger detail page viewing
    alert(`Opening detailed article: "${blogTitle}"`);
  };

  // Structured Data (JSON-LD) for SEO schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://yourwebsite.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "News",
        "item": "https://yourwebsite.com/news"
      }
    ]
  };

  return (
    <div className="blog-grid-page">
      {/* Inject Schema JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* --- BREADCRUMB / HERO BANNER --- */}
      <section className="blog-grid-breadcrumb" aria-label="News Breadcrumb Banner">
        <div className="blog-grid-breadcrumb-container">
          
          {/* Back Navigation Link */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-grid-back-link" title="Return to Homepage">
              <span className="blog-grid-arrow-circle" aria-hidden="true">
                <svg
                  className="blog-grid-back-arrow-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </span>
              <span className="blog-grid-back-text">Back to Home</span>
            </a>
          </nav>

          {/* Heading Title */}
          <h1 className="blog-grid-banner-title">news</h1>

          {/* Subtitle Description */}
          <p className="blog-grid-banner-desc">
            Food is any substance consumed by living organisms to provide energy, nutrients, and 
            nourishment for growth, maintenance, and overall well-being. It is essential for the survival 
            and proper functioning of the human body.
          </p>
        </div>
      </section>

      {/* --- BLOG GRID CONTAINER --- */}
      <main className="blog-grid-main">
        <div className="blog-grid-cards-wrapper">
          {currentBlogs.map((blog) => (
            <article key={blog.id} className="blog-grid-card">
              
              {/* Card Image Wrapper */}
              <div className="blog-grid-image-wrapper">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="blog-grid-card-img" 
                  loading="lazy"
                />
                <span className="blog-grid-tag">{blog.tag}</span>
              </div>

              {/* Card Body */}
              <div className="blog-grid-card-content">
                <h2 className="blog-grid-card-title">{blog.title}</h2>
                <p className="blog-grid-card-desc">{blog.description}</p>

                {/* Card Footer Actions */}
                <div className="blog-grid-card-footer">
                  <button 
                    className="blog-grid-read-more-btn"
                    onClick={() => handleReadMore(blog.title)}
                    aria-label={`Read more about ${blog.title}`}
                  >
                    <span>Read more</span>
                    <svg
                      className="blog-grid-btn-arrow"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>

                  <div className="blog-grid-author-info">
                    <span className="blog-grid-author">{blog.author}</span>
                    <span className="blog-grid-date">{blog.date}</span>
                  </div>
                </div>
              </div>

            </article>
          ))}
        </div>

        {/* --- PAGINATION SECTION --- */}
        <nav className="blog-grid-pagination" aria-label="Blog Grid Pagination">
          <button
            className={`blog-grid-page-num ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
            aria-label="Page 1"
            aria-current={currentPage === 1 ? 'page' : undefined}
          >
            1
          </button>
          
          <button
            className={`blog-grid-page-num ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
            aria-label="Page 2"
            aria-current={currentPage === 2 ? 'page' : undefined}
          >
            2
          </button>

          <button
            className="blog-grid-page-next"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default BlogGrid;
import React, { useState } from 'react';
import './BlogReadmoreOne.css';

// Image Imports
import blogfruit1 from '../../assets/blogfruit1.webp';
import blogfruit2 from '../../assets/blogfruit2.webp';
import blogfruit3 from '../../assets/blogfruit3.webp';
import blogfruit4 from '../../assets/blogfruit4.webp';

const BlogReadmoreOne = () => {
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your comment! Your feedback is valued at Grocery Sathi.');
    setCommentForm({ name: '', email: '', message: '' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Fruit is an Essential Part of a Healthy Diet | Grocery Sathi',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  // Advanced Structured Data (JSON-LD) for SEO and Google Rich Results
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': 'Fruit is an essential food for our life',
    'description': 'Explore why fresh fruits are essential for your daily diet, immune support, and long-term health with Grocery Sathi.',
    'image': 'https://www.grocerysathi.com/assets/blogfruit1.webp',
    'author': {
      '@type': 'Organization',
      'name': 'Grocery Sathi'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Grocery Sathi',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.grocerysathi.com/logo.png'
      }
    },
    'datePublished': '2022-12-05',
    'dateModified': '2026-07-29',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': 'https://www.grocerysathi.com/blog/fruit-essential-food'
    },
    'keywords': ['Grocery Sathi', 'Fresh Fruits', 'Healthy Diet', 'Nutrition', 'Organic Produce']
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.grocerysathi.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://www.grocerysathi.com/blog'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': 'Fruit is an essential food',
        'item': 'https://www.grocerysathi.com/blog/fruit-essential-food'
      }
    ]
  };

  // Related articles array utilizing imported images
  const relatedArticles = [
    {
      id: 1,
      image: blogfruit2,
      tag: 'news',
      title: 'Keeping Your Fresh Fruit Longer at Home',
      description:
        'Different fruits and vegetables have unique storage requirements. Some can be stored at room temperature, while others need refrigeration to stay crisp and fresh...',
      author: 'Grocery Sathi',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit3,
      tag: 'health',
      title: 'Tasty Berries & Their Amazing Benefits',
      description:
        'Strawberries, blueberries, raspberries, and blackberries are not only delicious but also packed with antioxidants and vitamins for your daily health routine...',
      author: 'Grocery Sathi',
      date: 'December 6, 2022'
    },
    {
      id: 3,
      image: blogfruit4,
      tag: 'recipes',
      title: 'Healthy Green Smoothies for Energy',
      description:
        'Blend your way to wellness with easy-to-make refreshing green juice recipes packed with natural vitamins and nutrients to energize your mornings...',
      author: 'Grocery Sathi',
      date: 'December 8, 2022'
    }
  ];

  return (
    <div className="blog-readmore-one-page">
      {/* SEO Schemas Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* --- HERO / BREADCRUMB SECTION --- */}
      <section
        className="blog-readmore-one-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 42, 39, 0.75), rgba(16, 42, 39, 0.75)), url(${blogfruit1})`
        }}
        aria-label="Article Hero Banner"
      >
        <div className="blog-readmore-one-hero-container">
          {/* Back Navigation Button */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-readmore-one-back-btn" title="Return to Grocery Sathi Homepage">
              <span className="blog-readmore-one-arrow-circle" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </span>
              <span>Back to Home</span>
            </a>
          </nav>

          {/* Meta Badges / Interactive Controls */}
          <div className="blog-readmore-one-hero-meta">
            <span className="blog-readmore-one-badge-featured">Featured Post</span>
            <button className="blog-readmore-one-meta-pill">
              Category: <strong>news</strong>
            </button>
            <button className="blog-readmore-one-meta-pill">
              Date: <strong>December 5, 2022</strong>
            </button>
          </div>

          {/* Hero Main Heading */}
          <h1 className="blog-readmore-one-hero-title">
            Fruit is an essential food
            <br />
            for our daily life
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-one-hero-desc">
            Explore the world of wholesome nutrition with Grocery Sathi. Discover unique ingredients, expert storage tips, and farm-fresh produce guides designed to enrich your well-being.
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
      <main className="blog-readmore-one-main">
        <div className="blog-readmore-one-container">
          
          {/* LEFT COLUMN: MAIN ARTICLE */}
          <article className="blog-readmore-one-content">
            
            {/* Meta bar under hero */}
            <div className="blog-readmore-one-author-bar">
              <div className="blog-readmore-one-meta-group">
                <span className="blog-readmore-one-author">Grocery Sathi</span>
                <span className="blog-readmore-one-meta-item">
                  Category: <strong>news</strong>
                </span>
                <span className="blog-readmore-one-meta-item">
                  Date: <strong>December 5, 2022</strong>
                </span>
              </div>

              <button
                className="blog-readmore-one-share-btn"
                onClick={handleShare}
                aria-label="Share this article"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span>Share</span>
              </button>
            </div>

            {/* Article Heading */}
            <h2 className="blog-readmore-one-article-title">
              Fruit is an essential food for our life &amp; vitality
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-one-feature-img-wrapper">
              <img
                src={blogfruit1}
                alt="Fresh organic fruits basket representing healthy eating by Grocery Sathi"
                className="blog-readmore-one-feature-img"
                loading="lazy"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-one-text">
              At Grocery Sathi, we believe that bringing fresh, quality produce into your kitchen is the foundation of a healthy lifestyle. Explore the world of culinary delights with our grocery blog, where we highlight unique ingredients, share delicious recipes, and provide expert cooking hacks for all skill levels.
            </p>

            <h3 className="blog-readmore-one-bold-heading">
              Fruits are packed with essential vitamins, minerals, and natural antioxidants that contribute directly to long-term vitality, immune strengthening, and chronic disease prevention.
            </h3>

            <p className="blog-readmore-one-text">
              Regular consumption of fresh fruits has been scientifically associated with a reduced risk of heart disease, stroke, certain cancers, and healthy weight management. The natural antioxidants found in berries and citrus protect your cells from oxidative stress and inflammation, while high water content supports daily hydration and digestive health.
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-one-quote">
              <span className="blog-readmore-one-quote-icon" aria-hidden="true">
                “
              </span>
              <p>
                Many fresh fruits are exceptional sources of vitamin C, playing a vital role in supporting a robust immune system. Regular daily intake helps strengthen your body&apos;s defenses against everyday infections and seasonal illnesses.
              </p>
            </blockquote>

            <p className="blog-readmore-one-text">
              Whether you are shopping for farm-fresh apples, juicy oranges, or antioxidant-rich seasonal berries, Grocery Sathi ensures top-tier quality delivered straight to your doorstep. Make smart, healthy choices every single day!
            </p>

            {/* Tags */}
            <div className="blog-readmore-one-tags">
              <strong>Tags:</strong>
              <span className="blog-readmore-one-tag-item">Food</span>
              <span className="blog-readmore-one-tag-comma">,</span>
              <span className="blog-readmore-one-tag-item">Fruits</span>
              <span className="blog-readmore-one-tag-comma">,</span>
              <span className="blog-readmore-one-tag-item">Healthy Diet</span>
            </div>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-one-sidebar" aria-label="Sidebar Content">
            
            {/* Related Articles Section */}
            <div className="blog-readmore-one-related-block">
              <h3 className="blog-readmore-one-sidebar-title">Related articles</h3>

              {relatedArticles.map((article) => (
                <div key={article.id} className="blog-readmore-one-related-card">
                  <div className="blog-readmore-one-card-img-wrapper">
                    <img src={article.image} alt={article.title} loading="lazy" />
                    <span className="blog-readmore-one-card-tag">{article.tag}</span>
                  </div>

                  <div className="blog-readmore-one-card-body">
                    <h4 className="blog-readmore-one-card-title">{article.title}</h4>
                    <p className="blog-readmore-one-card-desc">{article.description}</p>

                    <div className="blog-readmore-one-card-footer">
                      <button
                        className="blog-readmore-one-read-more-btn"
                        onClick={() => alert(`Opening article: "${article.title}"`)}
                        aria-label={`Read more about ${article.title}`}
                      >
                        <span>Read more</span>
                        <svg
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

                      <div className="blog-readmore-one-card-author-info">
                        <span className="blog-readmore-one-card-author">{article.author}</span>
                        <span className="blog-readmore-one-card-date">{article.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a Comment Form */}
            <div className="blog-readmore-one-comment-box">
              <h3 className="blog-readmore-one-comment-title">Leave a Comment</h3>

              <form onSubmit={handleCommentSubmit} className="blog-readmore-one-comment-form">
                <div className="blog-readmore-one-form-group">
                  <input
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="blog-readmore-one-input"
                  />
                </div>

                <div className="blog-readmore-one-form-group">
                  <input
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleInputChange}
                    placeholder="Your Email Address"
                    required
                    className="blog-readmore-one-input"
                  />
                </div>

                <div className="blog-readmore-one-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Write your comment here..."
                    rows="4"
                    required
                    className="blog-readmore-one-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="blog-readmore-one-submit-btn">
                  Post Comment
                </button>
              </form>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default BlogReadmoreOne;
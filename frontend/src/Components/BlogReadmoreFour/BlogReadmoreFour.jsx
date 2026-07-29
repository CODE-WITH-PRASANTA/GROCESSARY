import React, { useState } from 'react';
import './BlogReadmoreFour.css';

// Image Imports
import blogfruit1 from '../../assets/blogfruit1.webp';
import blogfruit2 from '../../assets/blogfruit2.webp';
import blogfruit3 from '../../assets/blogfruit3.webp';
import blogfruit4 from '../../assets/blogfruit4.webp';

const BlogReadmoreFour = () => {
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
    alert('Thank you for your comment on Grocery Sathi!');
    setCommentForm({ name: '', email: '', message: '' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Tasty Blueberry Fragrance & Fresh Fruit Guide | Grocery Sathi',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      alert('Link copied to clipboard!');
    }
  };

  // Structured Data (JSON-LD) for SEO schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Tasty Blueberry Fragrance & Fresh Fruit Guide',
    alternativeHeadline: 'Discover fresh fruit tips and aromatic uses with Grocery Sathi',
    image: [blogfruit4],
    author: {
      '@type': 'Organization',
      name: 'Grocery Sathi'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grocery Sathi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourwebsite.com/logo.png'
      }
    },
    datePublished: '2022-12-08',
    dateModified: '2026-07-29',
    description: 'Explore organic fruits, storage hacks, and delightful blueberry fragrance tips with Grocery Sathi.',
    keywords: ['Grocery Sathi', 'Fresh Fruit', 'Blueberry', 'Organic Produce', 'Health & Diet']
  };

  // Related articles array utilizing imported images
  const relatedArticles = [
    {
      id: 1,
      image: blogfruit1,
      tag: 'news',
      title: 'Fruit is an essential food for our daily vitality...',
      description:
        'Explore the world of culinary delights with our Grocery Sathi blog, highlighting unique ingredients, healthy recipes, and cooking hacks...',
      author: 'Grocery Sathi',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit2,
      tag: 'guide',
      title: 'Keeping Your Fruits and Vegetables Fresh Longer',
      description:
        'Different produce requires distinct storage requirements. Learn what goes on the counter versus what needs refrigeration...',
      author: 'Grocery Sathi',
      date: 'December 5, 2022'
    },
    {
      id: 3,
      image: blogfruit3,
      tag: 'health',
      title: 'Organic vs Conventional Fruit: What to Choose',
      description:
        'Understanding nutritional differences and sustainable farming practices when selecting fresh fruits for your daily health routine...',
      author: 'Grocery Sathi',
      date: 'December 6, 2022'
    }
  ];

  return (
    <div className="blog-readmore-four-page">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* --- HERO / BREADCRUMB BANNER --- */}
      <section
        className="blog-readmore-four-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 42, 39, 0.65), rgba(16, 42, 39, 0.65)), url(${blogfruit4})`
        }}
        aria-label="Grocery Sathi Article Banner"
      >
        <div className="blog-readmore-four-hero-container">
          {/* Back Navigation Button */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-readmore-four-back-btn" title="Return to Grocery Sathi Home">
              <span className="blog-readmore-four-arrow-circle" aria-hidden="true">
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
              <span>Back to Grocery Sathi Home</span>
            </a>
          </nav>

          {/* Meta Badges / Interactive Controls */}
          <div className="blog-readmore-four-hero-meta">
            <span className="blog-readmore-four-badge-featured">Grocery Sathi Featured</span>
            <button className="blog-readmore-four-meta-pill" aria-label="Filter by category Recipes">
              Category: <strong>Recipes & Fresh Produce</strong>
            </button>
            <button className="blog-readmore-four-meta-pill" aria-label="Article publication date">
              Date: <strong>December 8, 2022</strong>
            </button>
          </div>

          {/* Hero Main Heading */}
          <h1 className="blog-readmore-four-hero-title">
            Tasty Blueberry
            <br />& Natural Fragrance Guide
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-four-hero-desc">
            Blueberry extracts and fresh fruit aromas add delightful, enticing scents to organic products. 
            Discover natural health benefits and culinary inspirations curated by Grocery Sathi...
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
      <main className="blog-readmore-four-main">
        <div className="blog-readmore-four-container">
          
          {/* LEFT COLUMN: MAIN ARTICLE */}
          <article className="blog-readmore-four-content">
            {/* Meta bar under hero */}
            <div className="blog-readmore-four-author-bar">
              <div className="blog-readmore-four-meta-group">
                <span className="blog-readmore-four-author">Grocery Sathi Editorial</span>
                <span className="blog-readmore-four-meta-item">
                  Category: <strong>Fresh Foods</strong>
                </span>
                <span className="blog-readmore-four-meta-item">
                  Published: <strong>Dec 8, 2022</strong>
                </span>
              </div>

              <button
                className="blog-readmore-four-share-btn"
                onClick={handleShare}
                aria-label="Share this Grocery Sathi article"
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
                <span>Share Guide</span>
              </button>
            </div>

            {/* Article Heading */}
            <h2 className="blog-readmore-four-article-title">
              Tasty Blueberry Fragrance & Organic Fruit Insights
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-four-feature-img-wrapper">
              <img
                src={blogfruit4}
                alt="Fresh blueberries and citrus fruits curated by Grocery Sathi"
                className="blog-readmore-four-feature-img"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-four-text">
              Welcome to <strong>Grocery Sathi</strong>! Your trusted partner for farm-fresh groceries, easy summer juice recipes, 
              and antioxidant-packed natural vitamin C boosts designed to energize your daily routines. Citrus and berry fruits 
              offer incredible flavor profiles that can transform your breakfast table and wellness regimen.
            </p>

            <h3 className="blog-readmore-four-bold-heading">
              Natural fruit essences can be used in different concentrations depending on your desired aromatic intensity. 
              They blend exceptionally well with complementary notes like organic vanilla, citrus, or floral scents.
            </h3>

            <p className="blog-readmore-four-text">
              When preparing your fresh smoothies at home, try blending whole fruits instead of juicing alone to keep 
              essential dietary fibers completely intact. Add a dash of fresh ginger or garden mint leaves for an extra 
              revitalizing twist that supports immunity and digestion throughout the day.
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-four-quote">
              <span className="blog-readmore-four-quote-icon" aria-hidden="true">
                “
              </span>
              <p>
                Whether you're crafting homemade smoothies, natural personal care items, or wholesome meal plans, 
                Grocery Sathi brings the finest organic ingredients straight to your doorstep for a healthier lifestyle.
              </p>
            </blockquote>

            {/* Tags */}
            <div className="blog-readmore-four-tags">
              <strong>Tags:</strong>
              <span className="blog-readmore-four-tag-item">Grocery Sathi</span>
              <span className="blog-readmore-four-tag-comma">,</span>
              <span className="blog-readmore-four-tag-item">Recipes</span>
              <span className="blog-readmore-four-tag-comma">,</span>
              <span className="blog-readmore-four-tag-item">Fresh Fruit</span>
              <span className="blog-readmore-four-tag-comma">,</span>
              <span className="blog-readmore-four-tag-item">Blueberry</span>
            </div>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-four-sidebar" aria-label="Sidebar Content">
            {/* Related Articles Section */}
            <div className="blog-readmore-four-related-block">
              <h3 className="blog-readmore-four-sidebar-title">Related Grocery Articles</h3>

              {relatedArticles.map((article) => (
                <div key={article.id} className="blog-readmore-four-related-card">
                  <div className="blog-readmore-four-card-img-wrapper">
                    <img src={article.image} alt={article.title} />
                    <span className="blog-readmore-four-card-tag">{article.tag}</span>
                  </div>

                  <div className="blog-readmore-four-card-body">
                    <h4 className="blog-readmore-four-card-title">{article.title}</h4>
                    <p className="blog-readmore-four-card-desc">{article.description}</p>

                    <div className="blog-readmore-four-card-footer">
                      <button
                        className="blog-readmore-four-read-more-btn"
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

                      <div className="blog-readmore-four-card-author-info">
                        <span className="blog-readmore-four-card-author">{article.author}</span>
                        <span className="blog-readmore-four-card-date">{article.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a Comment Form */}
            <div className="blog-readmore-four-comment-box">
              <h3 className="blog-readmore-four-comment-title">Leave a Comment</h3>

              <form onSubmit={handleCommentSubmit} className="blog-readmore-four-comment-form">
                <div className="blog-readmore-four-form-group">
                  <input
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="blog-readmore-four-input"
                  />
                </div>

                <div className="blog-readmore-four-form-group">
                  <input
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleInputChange}
                    placeholder="Your Email Address"
                    required
                    className="blog-readmore-four-input"
                  />
                </div>

                <div className="blog-readmore-four-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Write your thoughts or recipe review here..."
                    rows="4"
                    required
                    className="blog-readmore-four-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="blog-readmore-four-submit-btn">
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

export default BlogReadmoreFour;
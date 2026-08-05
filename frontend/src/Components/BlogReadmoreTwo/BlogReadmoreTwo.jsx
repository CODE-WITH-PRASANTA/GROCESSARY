import React, { useState } from 'react';
import './BlogReadmoreTwo.css';

// Image Imports
import blogfruit1 from '../../assets/blogfruit1.webp';
import blogfruit2 from '../../assets/blogfruit2.webp';
import blogfruit3 from '../../assets/blogfruit3.webp';
import blogfruit4 from '../../assets/blogfruit4.webp';

const BlogReadmoreTwo = () => {
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
    alert('Thank you for your comment!');
    setCommentForm({ name: '', email: '', message: '' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Fruit is an essential food for our life',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Comprehensive SEO Structured Data (JSON-LD)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Fruit is an essential food for our life & Proper Storage Guide',
    description: 'Discover essential guidelines for storing fruits and vegetables, maintaining freshness, and preventing premature spoilage through optimal kitchen management.',
    image: [blogfruit2],
    datePublished: '2022-12-05T08:00:00+00:00',
    dateModified: '2026-07-29T12:00:00+00:00',
    author: {
      '@type': 'Organization',
      name: 'Grocery Sathi WorkDo'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grocery Sathi',
      logo: {
        '@type': 'ImageObject',
        url: blogfruit2
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href
    },
    keywords: ['Grocery Sathi', 'Food', 'Fruits', 'Vegetables', 'Health', 'Storage Guide']
  };

  // Related articles array utilizing imported images
  const relatedArticles = [
    {
      id: 1,
      image: blogfruit1,
      tag: 'news',
      title: 'Fruit is an essential food for our life',
      description:
        'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need refrigeration. For example, bananas, apples, citrus fruits...',
      author: 'Grocery Sathi',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit2,
      tag: 'health',
      title: 'Keeping Your Fruits and Veggies Fresh',
      description:
        'Understanding the nutritional benefits and differences in sustainable farming practice when selecting fresh fruits for your daily health routine...',
      author: 'Grocery Sathi',
      date: 'December 6, 2022'
    },
    {
      id: 3,
      image: blogfruit4,
      tag: 'recipes',
      title: 'Delicious Citrus Juices & Smoothies',
      description:
        'Easy-to-make refreshing summer juice recipes packed with antioxidants and natural vitamin C boosts to energize your daily routines...',
      author: 'Grocery Sathi',
      date: 'December 8, 2022'
    }
  ];

  return (
    <div className="blog-readmore-two-page">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* --- HERO / BREADCRUMB BANNER --- */}
      <header
        className="blog-readmore-two-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${blogfruit2})`
        }}
        role="banner"
      >
        <div className="blog-readmore-two-hero-container">
          {/* Back Navigation Button */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-readmore-two-back-btn" title="Return to Homepage">
              <span className="blog-readmore-two-arrow-circle" aria-hidden="true">
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

          {/* Meta Badges */}
          <div className="blog-readmore-two-hero-meta">
            <span className="blog-readmore-two-badge-featured">Featured Article</span>
            <span className="blog-readmore-two-meta-pill">
              Category: <strong>Fresh Produce & Nutrition</strong>
            </span>
            <span className="blog-readmore-two-meta-pill">
              Published: <strong>December 5, 2022</strong>
            </span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="blog-readmore-two-hero-title">
            Fruit is an Essential Food for Our Life & Produce Guide
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-two-hero-desc">
            Explore expert grocery insights from Grocery Sathi on proper fruit and vegetable storage techniques to extend shelf-life and maximize everyday freshness.
          </p>
        </div>
      </header>

      {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
      <main className="blog-readmore-two-main">
        <div className="blog-readmore-two-container">
          
          {/* LEFT COLUMN: MAIN ARTICLE */}
          <article className="blog-readmore-two-content">
            {/* Meta bar under hero */}
            <div className="blog-readmore-two-author-bar">
              <div className="blog-readmore-two-meta-group">
                <span className="blog-readmore-two-author">By Grocery Sathi</span>
                <span className="blog-readmore-two-meta-item">
                  Category: <strong>News & Guides</strong>
                </span>
                <span className="blog-readmore-two-meta-item">
                  Updated: <strong>December 5, 2022</strong>
                </span>
              </div>

              <button
                className="blog-readmore-two-share-btn"
                onClick={handleShare}
                aria-label="Share this grocery guide article"
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
                <span>Share Article</span>
              </button>
            </div>

            {/* Sub-heading / Article Introduction */}
            <h2 className="blog-readmore-two-article-title">
              Mastering Fruit & Vegetable Preservation at Home
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-two-feature-img-wrapper">
              <img
                src={blogfruit2}
                alt="Fresh assorted fruits and vegetables stored neatly for optimal kitchen freshness"
                className="blog-readmore-two-feature-img"
                loading="lazy"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-two-text">
              Different fruits and vegetables have distinct storage requirements. Some can be stored at 
              room temperature, while others need refrigeration. For example, bananas, apples, citrus fruits, tomatoes, and onions can be kept at room temperature, while leafy greens, berries, and delicate fruits like peaches and strawberries should be refrigerated. Always refer to specific storage guidelines for each type of produce to reduce household food waste.
            </p>

            <h3 className="blog-readmore-two-bold-heading">
              Managing Ethylene Gas Production in Your Pantry
            </h3>

            <p className="blog-readmore-two-text">
              Some fruits release a natural plant hormone called ethylene gas, which speeds up the ripening process and can cause neighboring fruits and vegetables to spoil faster. Keep ethylene-producing produce like apples, bananas, and avocados safely separate from ethylene-sensitive items like leafy greens, broccoli, and berries.
            </p>

            <p className="blog-readmore-two-text">
              Wash your fruits and vegetables just before you plan to consume or cook them. Rinse them thoroughly under cold running water to eliminate dirt, surface bacteria, or pesticide residues. Use a soft brush for firm produce with rough surfaces, such as potatoes or melons. Handle your grocery items gently to prevent bruising and preserve structural integrity.
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-two-quote">
              <span className="blog-readmore-two-quote-icon" aria-hidden="true">
                “
              </span>
              <p>
                Check your grocery produce regularly and discard items showing early signs of spoilage, such as mold, soft spots, or unpleasant odors. Prompt removal prevents decay from spreading across your kitchen pantry.
              </p>
            </blockquote>

            {/* Tags */}
            <div className="blog-readmore-two-tags">
              <strong>Related Tags:</strong>
              <span className="blog-readmore-two-tag-item">Grocery Sathi</span>,{' '}
              <span className="blog-readmore-two-tag-item">Fruits</span>,{' '}
              <span className="blog-readmore-two-tag-item">Healthy Living</span>,{' '}
              <span className="blog-readmore-two-tag-item">Produce Storage</span>
            </div>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-two-sidebar" aria-label="Sidebar Content">
            
            {/* Related Articles Section */}
            <div className="blog-readmore-two-related-block">
              <h3 className="blog-readmore-two-sidebar-title">Related Articles</h3>

              {relatedArticles.map((article) => (
                <div key={article.id} className="blog-readmore-two-related-card">
                  <div className="blog-readmore-two-card-img-wrapper">
                    <img src={article.image} alt={article.title} loading="lazy" />
                    <span className="blog-readmore-two-card-tag">{article.tag}</span>
                  </div>

                  <div className="blog-readmore-two-card-body">
                    <h4 className="blog-readmore-two-card-title">{article.title}</h4>
                    <p className="blog-readmore-two-card-desc">{article.description}</p>

                    <div className="blog-readmore-two-card-footer">
                      <button
                        className="blog-readmore-two-read-more-btn"
                        aria-label={`Read more about ${article.title}`}
                      >
                        <span>Read More</span>
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

                      <div className="blog-readmore-two-card-author-info">
                        <span className="blog-readmore-two-card-author">{article.author}</span>
                        <span className="blog-readmore-two-card-date">{article.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a Comment Form */}
            <div className="blog-readmore-two-comment-box">
              <h3 className="blog-readmore-two-comment-title">Leave a Comment</h3>

              <form onSubmit={handleCommentSubmit} className="blog-readmore-two-comment-form">
                <div className="blog-readmore-two-form-group">
                  <label htmlFor="comment-name" className="visually-hidden">Name</label>
                  <input
                    id="comment-name"
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="blog-readmore-two-input"
                  />
                </div>

                <div className="blog-readmore-two-form-group">
                  <label htmlFor="comment-email" className="visually-hidden">Email</label>
                  <input
                    id="comment-email"
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleInputChange}
                    placeholder="Your Email Address"
                    required
                    className="blog-readmore-two-input"
                  />
                </div>

                <div className="blog-readmore-two-form-group">
                  <label htmlFor="comment-message" className="visually-hidden">Message</label>
                  <textarea
                    id="comment-message"
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Write your thoughts or feedback here..."
                    rows="4"
                    required
                    className="blog-readmore-two-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="blog-readmore-two-submit-btn">
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

export default BlogReadmoreTwo;
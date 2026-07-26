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
    alert('Thank you for your comment!');
    setCommentForm({ name: '', email: '', message: '' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Delicious Citrus Juices & Smoothies',
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
    headline: 'Delicious Citrus Juices & Smoothies',
    author: {
      '@type': 'Organization',
      name: 'WorkDo'
    },
    datePublished: '2022-12-08',
    keywords: ['Recipes', 'Juice', 'Citrus']
  };

  // Related articles array utilizing imported images
  const relatedArticles = [
    {
      id: 1,
      image: blogfruit1,
      tag: 'news',
      title: 'Fruit is an essential food for our...',
      description:
        'Explore the world of culinary delights with our grocery blog, where we highlight unique ingredients, share delicious recipes, and provide cooking hacks...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit2,
      tag: 'news',
      title: 'Keeping Your Fruits and Ve...',
      description:
        'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need refrigeration...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 3,
      image: blogfruit3,
      tag: 'health',
      title: 'Organic vs Conventional Fruit',
      description:
        'Understanding the nutritional benefits and differences in sustainable farming practice when selecting fresh fruits for your daily health routine...',
      author: 'WorkDo,',
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${blogfruit4})`
        }}
        aria-label="Article Banner"
      >
        <div className="blog-readmore-four-hero-container">
          {/* Back Navigation Button */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-readmore-four-back-btn" title="Return to Homepage">
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
              <span>Back to Home</span>
            </a>
          </nav>

          {/* Meta Badges / Interactive Controls */}
          <div className="blog-readmore-four-hero-meta">
            <span className="blog-readmore-four-badge-featured">Featured</span>
            <button className="blog-readmore-four-meta-pill">
              Category: <strong>recipes</strong>
            </button>
            <button className="blog-readmore-four-meta-pill">
              Date: <strong>December 8, 2022</strong>
            </button>
          </div>

          {/* Hero Main Heading */}
          <h1 className="blog-readmore-four-hero-title">
          Testy Blueberry
            <br />Fragrance Oil
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-four-hero-desc">
           Blueberry fragrance oil can add a delightful and enticing scent to various products. 
           Whether you're making candles, soaps, lotions, or other scented products, the testy...
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
                <span className="blog-readmore-four-author">WorkDo</span>
                <span className="blog-readmore-four-meta-item">
                  Category: <strong>recipes</strong>
                </span>
                <span className="blog-readmore-four-meta-item">
                  Date: <strong>December 8, 2022</strong>
                </span>
              </div>

              <button
                className="blog-readmore-four-share-btn"
                onClick={handleShare}
                aria-label="Share article"
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
            <h2 className="blog-readmore-four-article-title">
              Testy Blueberry Fragrance Oil
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-four-feature-img-wrapper">
              <img
                src={blogfruit4}
                alt="Delicious Citrus Juices & Smoothies"
                className="blog-readmore-four-feature-img"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-four-text">
              Easy-to-make refreshing summer juice recipes packed with antioxidants and natural vitamin C
              boosts to energize your daily routines. Citrus fruits like oranges, lemons, limes, and
              grapefruits offer incredible flavor profiles that can transform your breakfast table.
            </p>

            <h3 className="blog-readmore-four-bold-heading">
             The fragrance oil can be used in different concentrations depending on the desired intensity of the scent.
              It blends well with other fragrance oils and can be combined with complementary notes like vanilla,
              citrus, or floral scents to create unique and captivating blends.
            </h3>

            <p className="blog-readmore-four-text">
              When preparing your fresh smoothies, try blending whole fruit instead of just juicing to keep
              the beneficial dietary fibers intact. Add a dash of ginger or mint leaves for an extra
              revitalizing twist that supports immunity and digestion throughout the day.
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-four-quote">
              <span className="blog-readmore-four-quote-icon" aria-hidden="true">
                “
              </span>
              <p>
                Whether you're crafting homemade candles, soaps, or personal care products,
                 the testy blueberry fragrance oil can enhance your creations with its enticing and delicious
                 scent, leaving a lingering aroma that is sure to please the senses.
              </p>
            </blockquote>

            {/* Tags */}
            <div className="blog-readmore-four-tags">
              <strong>Tags:</strong>
              <span className="blog-readmore-four-tag-item">Recipes</span>
              <span className="blog-readmore-four-tag-comma">,</span>
              <span className="blog-readmore-four-tag-item">Juice</span>
              <span className="blog-readmore-four-tag-comma">,</span>
              <span className="blog-readmore-four-tag-item">Citrus</span>
            </div>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-four-sidebar">
            {/* Related Articles Section */}
            <div className="blog-readmore-four-related-block">
              <h3 className="blog-readmore-four-sidebar-title">Related articles</h3>

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
                    placeholder="Name"
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
                    placeholder="Email"
                    required
                    className="blog-readmore-four-input"
                  />
                </div>

                <div className="blog-readmore-four-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Message"
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
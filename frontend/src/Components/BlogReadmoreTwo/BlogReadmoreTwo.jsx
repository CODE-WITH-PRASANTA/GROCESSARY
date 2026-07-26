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
      alert('Link copied to clipboard!');
    }
  };

  // Structured Data (JSON-LD) for SEO schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Fruit is an essential food for our life',
    author: {
      '@type': 'Organization',
      name: 'WorkDo'
    },
    datePublished: '2022-12-05',
    keywords: ['Food', 'Fruits', 'Orange']
  };

  // Related articles array utilizing imported images
  const relatedArticles = [
    {
      id: 1,
      image: blogfruit1,
      tag: 'news',
      title: 'Fruit is an essential food for our...',
      description:
        'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need refrigeration. For example, bananas, apples, citrus fruits, tomatoes,...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit2,
      tag: 'health',
      title: 'Keeping Your Fruits and Ve...',
      description:
        'Understanding the nutritional benefits and differences in sustainable farming practice when selecting fresh fruits for your daily health routine...',
      author: 'WorkDo,',
      date: 'December 6, 2022'
    },
    {
      id: 3,
      image: blogfruit4,
      tag: 'recipes',
      title: 'Delicious Citrus Juices & Smoothies',
      description:
        'Easy-to-make refreshing summer juice recipes packed with antioxidants and natural vitamin C boosts to energize your daily routines...',
      author: 'WorkDo,',
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
      <section
        className="blog-readmore-two-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${blogfruit2})`
        }}
        aria-label="Article Banner"
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

          {/* Meta Badges / Interactive Controls */}
          <div className="blog-readmore-two-hero-meta">
            <span className="blog-readmore-two-badge-featured">Featured</span>
            <button className="blog-readmore-two-meta-pill">
              Category: <strong>news</strong>
            </button>
            <button className="blog-readmore-two-meta-pill">
              Date: <strong>December 5, 2022</strong>
            </button>
          </div>

          {/* Hero Main Heading */}
          <h1 className="blog-readmore-two-hero-title">
            Keeping Your Fruits and 
            <br />
            Veggies
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-two-hero-desc">
            Different fruits and vegetables have different storage requirements. Some can be stored at 
            room temperature, while others need refrigeration. For example, bananas, apples,...
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
      <main className="blog-readmore-two-main">
        <div className="blog-readmore-two-container">
          {/* LEFT COLUMN: MAIN ARTICLE */}
          <article className="blog-readmore-two-content">
            {/* Meta bar under hero */}
            <div className="blog-readmore-two-author-bar">
              <div className="blog-readmore-two-meta-group">
                <span className="blog-readmore-two-author">WorkDo</span>
                <span className="blog-readmore-two-meta-item">
                  Category: <strong>news</strong>
                </span>
                <span className="blog-readmore-two-meta-item">
                  Date: <strong>December 5, 2022</strong>
                </span>
              </div>

              <button
                className="blog-readmore-two-share-btn"
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
            <h2 className="blog-readmore-two-article-title">
              Fruit is an essential food for our life
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-two-feature-img-wrapper">
              <img
                src={blogfruit2}
                alt="Fruit is an essential food for our life"
                className="blog-readmore-two-feature-img"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-two-text">
              Different fruits and vegetables have different storage requirements.
               Some can be stored at room temperature, while others need refrigeration. For example, bananas, apples, citrus fruits, tomatoes, and onions can be kept at room temperature, while leafy greens, berries, and delicate fruits like peaches and strawberries should be
               refrigerated. Refer to specific storage guidelines for each type of produce.
            </p>

            <h3 className="blog-readmore-two-bold-heading">
              Some fruits release a natural gas called ethylene, which speeds up the ripening 
              process and can cause other fruits and vegetables to spoil faster. Keep ethylene-producing fruits like apples, bananas, and avocados 
              separate from ethylene-sensitive produce like leafy greens, broccoli, and berries.
            </h3>

            <p className="blog-readmore-two-text">
              Wash fruits and vegetables just before you plan to eat or use them. Rinse them under cold
               running water to remove any dirt, bacteria, or pesticide residues. Use a brush for firm 
               produce with a rough surface, like potatoes or melons. Handle with Care: Handle your produce gently to prevent bruising and damage. Avoid squeezing or stacking delicate fruits and vegetables 
              on top of each other. Store them in a way that allows air circulation to maintain freshness
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-two-quote">
              <span className="blog-readmore-two-quote-icon" aria-hidden="true">
                “
              </span>
              <p>
               Check your produce regularly and discard any items that show signs of spoilage, such as mold,
                soft spots, or unpleasant odors.
                By removing spoiled produce promptly, you can prevent the spread of decay to other items.
              </p>
            </blockquote>

            {/* Tags */}
            <div className="blog-readmore-two-tags">
              <strong>Tags:</strong>
              
              <span className="blog-readmore-two-tag-item">Fruits</span>
  
            </div>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-two-sidebar">
            {/* Related Articles Section */}
            <div className="blog-readmore-two-related-block">
              <h3 className="blog-readmore-two-sidebar-title">Related articles</h3>

              {relatedArticles.map((article) => (
                <div key={article.id} className="blog-readmore-two-related-card">
                  <div className="blog-readmore-two-card-img-wrapper">
                    <img src={article.image} alt={article.title} />
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
                  <input
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    required
                    className="blog-readmore-two-input"
                  />
                </div>

                <div className="blog-readmore-two-form-group">
                  <input
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                    className="blog-readmore-two-input"
                  />
                </div>

                <div className="blog-readmore-two-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Message"
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
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
      image: blogfruit2,
      tag: 'news',
      title: 'Keeping Your Fruits and Ve...',
      description:
        'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need refrigeration. For example, bananas, apples, citrus fruits, tomatoes,...',
      author: 'WorkDo,',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit3,
      tag: 'health',
      title: 'Organic vs Conventional Fruit',
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
    <div className="blog-readmore-one-page">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* --- HERO / BREADCRUMB BANNER --- */}
      <section
        className="blog-readmore-one-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${blogfruit1})`
        }}
        aria-label="Article Banner"
      >
        <div className="blog-readmore-one-hero-container">
          {/* Back Navigation Button */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-readmore-one-back-btn" title="Return to Homepage">
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
            <span className="blog-readmore-one-badge-featured">Featured</span>
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
            for our life
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-one-hero-desc">
            Explore the world of culinary delights with our grocery blog, where we highlight unique
            ingredients, share delicious recipes, and provide cooking hacks for all skill levels.
            Fruits a...
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
                <span className="blog-readmore-one-author">WorkDo</span>
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
            <h2 className="blog-readmore-one-article-title">
              Fruit is an essential food for our life
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-one-feature-img-wrapper">
              <img
                src={blogfruit1}
                alt="Fruit is an essential food for our life"
                className="blog-readmore-one-feature-img"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-one-text">
              Explore the world of culinary delights with our grocery blog, where we highlight unique
              ingredients, share delicious recipes, and provide cooking hacks for all skill levels.
            </p>

            <h3 className="blog-readmore-one-bold-heading">
              Fruits are packed with essential vitamins, minerals, and antioxidants that contribute to
              overall health. They are rich in vitamin C, potassium, folate, and dietary fiber, among
              other nutrients. Disease Prevention: Regular consumption of fruits has been associated
              with a reduced risk of chronic diseases, including heart disease, stroke, certain
              cancers, and obesity.
            </h3>

            <p className="blog-readmore-one-text">
              The antioxidants found in fruits help protect the body from oxidative stress and
              inflammation. Hydration and Digestion: Fruits have high water content, which helps keep
              the body hydrated. Additionally, the fiber in fruits aids in digestion, promotes bowel
              regularity, and supports a healthy digestive system. Weight Management: Fruits are
              naturally low in calories and high in fiber, making them a great choice for weight
              management.
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-one-quote">
              <span className="blog-readmore-one-quote-icon" aria-hidden="true">
                “
              </span>
              <p>
                Many fruits are excellent sources of vitamin C, which plays a vital role in supporting
                a healthy immune system. Regular intake of vitamin C-rich fruits can help strengthen
                the body's defenses against infections and illnesses.
              </p>
            </blockquote>

            {/* Tags */}
            <div className="blog-readmore-one-tags">
              <strong>Tags:</strong>
              <span className="blog-readmore-one-tag-item">Food</span>
              <span className="blog-readmore-one-tag-comma">,</span>
              <span className="blog-readmore-one-tag-item">Fruits</span>
              <span className="blog-readmore-one-tag-comma">,</span>
              <span className="blog-readmore-one-tag-item">Orange</span>
            </div>
          </article>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-one-sidebar">
            {/* Related Articles Section */}
            <div className="blog-readmore-one-related-block">
              <h3 className="blog-readmore-one-sidebar-title">Related articles</h3>

              {relatedArticles.map((article) => (
                <div key={article.id} className="blog-readmore-one-related-card">
                  <div className="blog-readmore-one-card-img-wrapper">
                    <img src={article.image} alt={article.title} />
                    <span className="blog-readmore-one-card-tag">{article.tag}</span>
                  </div>

                  <div className="blog-readmore-one-card-body">
                    <h4 className="blog-readmore-one-card-title">{article.title}</h4>
                    <p className="blog-readmore-one-card-desc">{article.description}</p>

                    <div className="blog-readmore-one-card-footer">
                      <button
                        className="blog-readmore-one-read-more-btn"
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
                    placeholder="Name"
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
                    placeholder="Email"
                    required
                    className="blog-readmore-one-input"
                  />
                </div>

                <div className="blog-readmore-one-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Message"
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
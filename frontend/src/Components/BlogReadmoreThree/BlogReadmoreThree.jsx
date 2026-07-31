import React, { useState } from 'react';
import './BlogReadmoreThree.css';

// Image Imports
import blogfruit1 from '../../assets/blogfruit1.webp';
import blogfruit2 from '../../assets/blogfruit2.webp';
import blogfruit3 from '../../assets/blogfruit3.webp';
import blogfruit4 from '../../assets/blogfruit4.webp';

const BlogReadmoreThree = () => {
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
          title: 'Fruit is an essential food for our life | Grocery Sathi',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      alert('Link copied to clipboard!');
    }
  };

  // Structured Data (JSON-LD) for SEO schema optimization
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Fruit is an essential food for our life - Grocery Sathi Blog',
    description: 'Learn why fresh fruits and vegetables are essential for daily health, proper storage guidelines, and nutritional benefits with Grocery Sathi.',
    image: [blogfruit3],
    author: {
      '@type': 'Organization',
      name: 'Grocery Sathi'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grocery Sathi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://grocerysathi.com/logo.webp'
      }
    },
    datePublished: '2022-12-05',
    dateModified: '2026-07-29',
    keywords: ['Grocery Sathi', 'Fresh Food', 'Fruits and Vegetables', 'Healthy Living', 'Storage Tips']
  };

  // Related articles array utilizing imported images
  const relatedArticles = [
    {
      id: 1,
      image: blogfruit1,
      tag: 'News',
      title: 'Fruit is an essential food for our...',
      description:
        'Different fruits and vegetables have different storage requirements. Some can be stored at room temperature, while others need refrigeration. For example, bananas, apples, citrus fruits, tomatoes,...',
      author: 'Grocery Sathi',
      date: 'December 5, 2022'
    },
    {
      id: 2,
      image: blogfruit2,
      tag: 'Health',
      title: 'Keeping Your Fruits and Vegetables Fresh...',
      description:
        'Understanding the nutritional benefits and differences in sustainable farming practice when selecting fresh fruits for your daily health routine...',
      author: 'Grocery Sathi',
      date: 'December 6, 2022'
    }
  ];

  return (
    <article className="blog-readmore-three-page">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* --- HERO / BREADCRUMB BANNER --- */}
      <header
        className="blog-readmore-three-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${blogfruit3})`
        }}
        aria-label="Grocery Sathi Article Banner"
      >
        <div className="blog-readmore-three-hero-container">
          {/* Back Navigation Button */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="blog-readmore-three-back-btn" title="Return to Grocery Sathi Homepage">
              <span className="blog-readmore-three-arrow-circle" aria-hidden="true">
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
          <div className="blog-readmore-three-hero-meta">
            <span className="blog-readmore-three-badge-featured">Grocery Sathi Featured</span>
            <span className="blog-readmore-three-meta-pill">
              Category: <strong>Fresh Produce & Nutrition</strong>
            </span>
            <span className="blog-readmore-three-meta-pill">
              Published: <time dateTime="2022-12-05">December 5, 2022</time>
            </span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="blog-readmore-three-hero-title">
            Tasty Fruits &amp;
            <br />
            Essential Vegetables
          </h1>

          {/* Hero Subtitle */}
          <p className="blog-readmore-three-hero-desc">
            Strawberries, blueberries, raspberries, and blackberries from Grocery Sathi are not only delicious but also
            packed with antioxidants and vitamins. Add them to your morning cereal, yogurt, or daily diet...
          </p>
        </div>
      </header>

      {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
      <div className="blog-readmore-three-main">
        <div className="blog-readmore-three-container">
          {/* LEFT COLUMN: MAIN ARTICLE */}
          <section className="blog-readmore-three-content">
            {/* Meta bar under hero */}
            <div className="blog-readmore-three-author-bar">
              <div className="blog-readmore-three-meta-group">
                <span className="blog-readmore-three-author">Grocery Sathi Editorial</span>
                <span className="blog-readmore-three-meta-item">
                  Category: <strong>Nutrition</strong>
                </span>
                <span className="blog-readmore-three-meta-item">
                  Updated: <time dateTime="2022-12-05">December 5, 2022</time>
                </span>
              </div>

              <button
                className="blog-readmore-three-share-btn"
                onClick={handleShare}
                aria-label="Share article on social media"
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

            {/* Article Heading */}
            <h2 className="blog-readmore-three-article-title">
              Fruit is an essential food for our life &mdash; Grocery Sathi Guide
            </h2>

            {/* Featured Image */}
            <div className="blog-readmore-three-feature-img-wrapper">
              <img
                src={blogfruit3}
                alt="Fresh assortment of essential fruits and vegetables from Grocery Sathi"
                className="blog-readmore-three-feature-img"
              />
            </div>

            {/* Paragraph Content */}
            <p className="blog-readmore-three-text">
              Different fruits and vegetables ordered through Grocery Sathi require specialized storage conditions to maintain maximum freshness and nutritional density.
              Some items thrive at room temperature, while others require consistent refrigeration. For instance, bananas, apples, citrus selections, tomatoes, and onions can safely sit at room temperature, whereas leafy greens, fresh berries, and tender fruits like peaches and strawberries must be refrigerated immediately. Always consult specific storage guidelines for each grocery item.
            </p>

            <h3 className="blog-readmore-three-bold-heading">
              Managing Ethylene Gas Production for Longer Shelf Life
            </h3>

            <p className="blog-readmore-three-text">
              Certain natural fruits release a plant hormone called ethylene gas, which accelerates the ripening process and can cause neighboring produce to spoil prematurely. To prevent early spoilage, store high ethylene-producing items like apples, bananas, and avocados entirely separate from sensitive produce such as leafy greens, broccoli, and fresh berries.
            </p>

            <p className="blog-readmore-three-text">
              Wash your Grocery Sathi fresh produce deliveries right before you plan to prepare or consume them. Gently rinse under cool running water to eliminate dust, natural elements, or surface residues. For firmer produce with textured skins like potatoes or melons, use a soft vegetable brush. Handle all items with care to avoid bruising and maintain proper airflow in storage spaces.
            </p>

            {/* Italic Quote Block */}
            <blockquote className="blog-readmore-three-quote">
              <span className="blog-readmore-three-quote-icon" aria-hidden="true">
                &ldquo;
              </span>
              <p>
                Inspect your fresh food stock regularly and discard any items displaying signs of deterioration, such as blemishes, soft areas, or unexpected odors. Prompt removal safeguards the freshness of your entire pantry inventory.
              </p>
            </blockquote>

            {/* Tags */}
            <footer className="blog-readmore-three-tags">
              <strong>Tags:</strong>
              <span className="blog-readmore-three-tag-item">Grocery Sathi</span>,{' '}
              <span className="blog-readmore-three-tag-item">Fresh Fruits</span>,{' '}
              <span className="blog-readmore-three-tag-item">Healthy Diet</span>
            </footer>
          </section>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-readmore-three-sidebar" aria-label="Sidebar Content">
            {/* Related Articles Section */}
            <div className="blog-readmore-three-related-block">
              <h3 className="blog-readmore-three-sidebar-title">Related Grocery Articles</h3>

              {relatedArticles.map((article) => (
                <div key={article.id} className="blog-readmore-three-related-card">
                  <div className="blog-readmore-three-card-img-wrapper">
                    <img src={article.image} alt={article.title} />
                    <span className="blog-readmore-three-card-tag">{article.tag}</span>
                  </div>

                  <div className="blog-readmore-three-card-body">
                    <h4 className="blog-readmore-three-card-title">{article.title}</h4>
                    <p className="blog-readmore-three-card-desc">{article.description}</p>

                    <div className="blog-readmore-three-card-footer">
                      <button
                        className="blog-readmore-three-read-more-btn"
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

                      <div className="blog-readmore-three-card-author-info">
                        <span className="blog-readmore-three-card-author">{article.author}</span>
                        <span className="blog-readmore-three-card-date">{article.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a Comment Form */}
            <div className="blog-readmore-three-comment-box">
              <h3 className="blog-readmore-three-comment-title">Leave a Comment</h3>

              <form onSubmit={handleCommentSubmit} className="blog-readmore-three-comment-form">
                <div className="blog-readmore-three-form-group">
                  <input
                    type="text"
                    name="name"
                    value={commentForm.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="blog-readmore-three-input"
                  />
                </div>

                <div className="blog-readmore-three-form-group">
                  <input
                    type="email"
                    name="email"
                    value={commentForm.email}
                    onChange={handleInputChange}
                    placeholder="Your Email Address"
                    required
                    className="blog-readmore-three-input"
                  />
                </div>

                <div className="blog-readmore-three-form-group">
                  <textarea
                    name="message"
                    value={commentForm.message}
                    onChange={handleInputChange}
                    placeholder="Share your thoughts on fresh fruits..."
                    rows="4"
                    required
                    className="blog-readmore-three-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="blog-readmore-three-submit-btn">
                  Post Comment
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
};

export default BlogReadmoreThree;
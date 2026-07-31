import React from 'react';
import './AboutUsBreadcrumb.css';

const AboutUsBreadcrumb = () => {
  // Structured Data (JSON-LD) for SEO schema customized for Grocery Sathi
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.grocerysathi.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "item": "https://www.grocerysathi.com/about-us"
      }
    ]
  };

  return (
    <>
      {/* Inject Schema JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Container using Semantic <nav> / <section> */}
      <section className="breadcrumb-container" aria-label="About Us Breadcrumb Banner">
        <div className="breadcrumb-content">
          
          {/* Back Navigation with ARIA Label */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="back-link" title="Return to Grocery Sathi Homepage">
              <span className="arrow-circle" aria-hidden="true">
                <svg
                  className="arrow-icon"
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
              <span className="back-text">Back to Home</span>
            </a>
          </nav>

          {/* Primary Page Heading (H1 for SEO) */}
          <h1 className="breadcrumb-title">About Grocery Sathi</h1>

          {/* SEO Description Paragraph */}
          <p className="breadcrumb-description">
            Discover the story behind Grocery Sathi. We are committed to bringing farm-fresh organic vegetables, 
            daily essentials, and high-quality groceries directly to your doorstep with unmatched reliability and care.
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutUsBreadcrumb;
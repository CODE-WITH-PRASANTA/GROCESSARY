import React from 'react';
import './AboutUsBreadcrumb.css';

import breadcrumbBg from '../../assets/a-grocery.jpg'; 

const AboutUsBreadcrumb = () => {
  // Structured Data (JSON-LD) for SEO schema
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
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Section with Inline Background Style */}
      <section 
        className="about-us-breadcrumb" 
        style={{ backgroundImage: `url(${breadcrumbBg})` }}
        aria-label="About Us Breadcrumb Banner"
      >
        <div className="about-us-breadcrumb__overlay">
          <div className="about-us-breadcrumb__container">
            
            {/* Back Navigation */}
            <nav className="about-us-breadcrumb__nav" aria-label="Breadcrumb Navigation">
              <a 
                href="/" 
                className="about-us-breadcrumb__back-link" 
                title="Return to Grocery Sathi Homepage"
              >
                <span className="about-us-breadcrumb__arrow-circle" aria-hidden="true">
                  <svg
                    className="about-us-breadcrumb__arrow-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </span>
                <span className="about-us-breadcrumb__back-text">Back to Home</span>
              </a>
            </nav>

            {/* Heading & Content */}
            <div className="about-us-breadcrumb__text-group">
              <span className="about-us-breadcrumb__badge">Who We Are</span>
              <h1 className="about-us-breadcrumb__title">About Grocery Sathi</h1>
              <p className="about-us-breadcrumb__description">
                Discover the story behind Grocery Sathi. We are committed to bringing
                farm-fresh organic produce, everyday pantry essentials, and premium groceries
                directly to your doorstep with unmatched reliability and care.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsBreadcrumb;
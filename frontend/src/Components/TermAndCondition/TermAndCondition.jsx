import React from 'react';
import './TermAndCondition.css';

const TermAndCondition = () => {
  // SEO Schema markup for Breadcrumbs
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
        "name": "Terms & Conditions",
        "item": "https://yourwebsite.com/terms-and-conditions"
      }
    ]
  };

  return (
    <div className="term-and-condition-page">
      {/* Schema JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* --- BREADCRUMB / HERO BANNER SECTION --- */}
      <section className="term-and-condition-breadcrumb" aria-label="Breadcrumb Banner">
        <div className="term-and-condition-breadcrumb-container">
          
          {/* Back Button Link */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="term-and-condition-back-link" title="Return to Home">
              <span className="term-and-condition-arrow-circle" aria-hidden="true">
                <svg
                  className="term-and-condition-arrow-icon"
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
              <span className="term-and-condition-back-text">Back to Home</span>
            </a>
          </nav>

          {/* Banner Title */}
          <h1 className="term-and-condition-banner-title">Terms &amp; Conditions</h1>

          {/* Banner Subtext */}
          <p className="term-and-condition-banner-desc">
            We value the diverse perspectives and experiences of our users, and we encourage 
            collaboration and community engagement. Our platform provides opportunities for users 
            to contribute their knowledge, share their opinions, and engage in discussions with like-minded 
            individuals.
          </p>

        </div>
      </section>

      {/* --- MAIN TERMS CONTENT SECTION --- */}
      <main className="term-and-condition-main">
        <article className="term-and-condition-main-container">
          
          <h2 className="term-and-condition-section-title">Terms &amp; Conditions</h2>

          {/* Section 1 */}
          <section className="term-and-condition-block">
            <h3 className="term-and-condition-subtitle">1. GENERAL CONDITIONS</h3>
            <p className="term-and-condition-text">
              We reserve the right to refuse service to anyone for any reason at any time.
            </p>
            <p className="term-and-condition-text">
              You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.
            </p>
            <p className="term-and-condition-text">
              You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.
            </p>
            <p className="term-and-condition-text">
              The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="term-and-condition-block">
            <h3 className="term-and-condition-subtitle">2. ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</h3>
            <p className="term-and-condition-text">
              We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.
            </p>
            <p className="term-and-condition-text">
              This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site.
            </p>
          </section>

          {/* Section 3 */}
          <section className="term-and-condition-block">
            <h3 className="term-and-condition-subtitle">3. MODIFICATIONS TO THE SERVICE AND PRICES</h3>
            <p className="term-and-condition-text">
              Prices for our products are subject to change without notice.
            </p>
            <p className="term-and-condition-text">
              We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
            </p>
            <p className="term-and-condition-text">
              We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
            </p>
          </section>

          {/* Section 4 */}
          <section className="term-and-condition-block">
            <h3 className="term-and-condition-subtitle">4. PRODUCTS OR SERVICES (if applicable)</h3>
            <p className="term-and-condition-text">
              Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
            </p>
            <p className="term-and-condition-text">
              We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
            </p>
            <p className="term-and-condition-text">
              We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.
            </p>
          </section>

        </article>
      </main>
    </div>
  );
};

export default TermAndCondition;
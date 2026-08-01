import React from 'react';
import './TermAndCondition.css';

const TermAndCondition = () => {
  // SEO Schema markup for Breadcrumbs & WebPage Legal Info
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
        "name": "Terms & Conditions",
        "item": "https://www.grocerysathi.com/terms-and-conditions"
      }
    ]
  };

  const legalDocumentSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms and Conditions - Grocery Sathi",
    "url": "https://www.grocerysathi.com/terms-and-conditions",
    "description": "Read the terms and conditions for using Grocery Sathi, your trusted online farm-fresh grocery delivery service in Rajgarh, Rajasthan.",
    "publisher": {
      "@type": "Organization",
      "name": "Grocery Sathi",
      "url": "https://www.grocerysathi.com",
      "logo": "https://www.grocerysathi.com/logo.png"
    }
  };

  return (
    <>
      {/* Schema JSON-LD Injection for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalDocumentSchema) }}
      />

      <div className="term-and-condition-page">
        
        {/* --- BREADCRUMB / HERO BANNER SECTION --- */}
        <section className="term-and-condition-breadcrumb" aria-label="Breadcrumb Banner">
          <div className="term-and-condition-breadcrumb-container">
            
            {/* Back Button Link */}
            <nav aria-label="Breadcrumb Navigation">
              <a href="/" className="term-and-condition-back-link" title="Return to Grocery Sathi Home">
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
              Welcome to Grocery Sathi! By accessing or using our website, mobile application, and farm-fresh grocery delivery services based in Rajgarh, Rajasthan, you agree to comply with and be bound by the following terms and conditions.
            </p>

          </div>
        </section>

        {/* --- MAIN TERMS CONTENT SECTION --- */}
        <main className="term-and-condition-main">
          <article className="term-and-condition-main-container">
            
            <h2 className="term-and-condition-section-title">Grocery Sathi Service Agreements</h2>

            {/* Section 1 */}
            <section className="term-and-condition-block">
              <h3 className="term-and-condition-subtitle">1. GENERAL CONDITIONS</h3>
              <p className="term-and-condition-text">
                Grocery Sathi reserves the right to refuse service, terminate accounts, or cancel orders at our sole discretion for any reason at any time.
              </p>
              <p className="term-and-condition-text">
                You understand that your user information and account details (excluding credit card and payment data) may be transferred unencrypted over various networks and adapted to technical requirements. Payment data is always encrypted using secure SSL protocols during transmission over networks.
              </p>
              <p className="term-and-condition-text">
                You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Grocery Sathi platform, product listings, or delivery services without express written permission from us.
              </p>
              <p className="term-and-condition-text">
                The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
              </p>
            </section>

            {/* Section 2 */}
            <section className="term-and-condition-block">
              <h3 className="term-and-condition-subtitle">2. ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</h3>
              <p className="term-and-condition-text">
                We are not responsible if information made available on this site regarding grocery pricing, organic farming sources, or nutritional facts is not accurate, complete, or current. Material on this site is provided for general information only and should not be relied upon as the sole basis for making decisions without consulting primary sources.
              </p>
              <p className="term-and-condition-text">
                We reserve the right to modify the contents, daily stock availability, and delivery schedules on our site at any time without prior notice. You agree that it is your responsibility to monitor changes to our platform.
              </p>
            </section>

            {/* Section 3 */}
            <section className="term-and-condition-block">
              <h3 className="term-and-condition-subtitle">3. MODIFICATIONS TO THE SERVICE AND PRICES</h3>
              <p className="term-and-condition-text">
                Prices for our farm-fresh vegetables, dairy, and grocery products are subject to change without notice based on seasonal availability and market conditions in Rajasthan.
              </p>
              <p className="term-and-condition-text">
                We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice. We shall not be liable to you or any third-party for any modification, price change, delivery slot suspension, or discontinuance.
              </p>
            </section>

            {/* Section 4 */}
            <section className="term-and-condition-block">
              <h3 className="term-and-condition-subtitle">4. PRODUCTS OR SERVICES &amp; LOCAL DELIVERY</h3>
              <p className="term-and-condition-text">
                Certain grocery items or organic packages may be available exclusively online through Grocery Sathi. These items may have limited stock quantities and are subject to return or exchange only in accordance with our return and freshness guarantee policy.
              </p>
              <p className="term-and-condition-text">
                We make every effort to display product packaging, colors, and farm freshness as accurately as possible. However, actual packaging or organic produce appearance may slightly vary.
              </p>
              <p className="term-and-condition-text">
                We reserve the right to limit sales of our groceries to specific geographic regions (such as Rajgarh, Thana, and surrounding areas). Any order or service offer made on this platform is void where prohibited by local regulations.
              </p>
            </section>

          </article>
        </main>
      </div>
    </>
  );
};

export default TermAndCondition;
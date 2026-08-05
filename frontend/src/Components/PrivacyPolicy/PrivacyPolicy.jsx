import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
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
        "name": "Privacy Policy",
        "item": "https://www.grocerysathi.com/privacy-policy"
      }
    ]
  };

  const privacyPolicySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Grocery Sathi",
    "url": "https://www.grocerysathi.com/privacy-policy",
    "description": "Learn how Grocery Sathi collects, uses, and protects your personal and order data when you use our farm-fresh grocery delivery service in Rajgarh, Rajasthan.",
    "publisher": {
      "@type": "Organization",
      "name": "Grocery Sathi",
      "url": "https://www.grocerysathi.com",
      "logo": "https://www.grocerysathi.com/logo.png"
    }
  };

  return (
    <>
      {/* Inject Schema JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyPolicySchema) }}
      />

      <div className="privacy-policy-page">
        
        {/* --- HERO / BREADCRUMB BANNER --- */}
        <section className="privacy-policy-breadcrumb" aria-label="Privacy Policy Banner">
          <div className="privacy-policy-breadcrumb-container">
            
            {/* Back Navigation */}
            <nav aria-label="Breadcrumb Navigation">
              <a href="/" className="privacy-policy-back-link" title="Return to Grocery Sathi Homepage">
                <span className="privacy-policy-arrow-circle" aria-hidden="true">
                  <svg
                    className="privacy-policy-arrow-icon"
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
                <span className="privacy-policy-back-text">Back to Home</span>
              </a>
            </nav>

            {/* Banner Heading */}
            <h1 className="privacy-policy-banner-title">Privacy Policy</h1>

            {/* Banner Short Description */}
            <p className="privacy-policy-banner-desc">
              At Grocery Sathi, we deeply value your trust and privacy. This policy outlines how we collect, use, and protect your personal data when you use our online farm-fresh grocery delivery platform based in Rajgarh, Rajasthan.
            </p>
          </div>
        </section>

        {/* --- MAIN POLICY CONTENT --- */}
        <main className="privacy-policy-main">
          <article className="privacy-policy-main-container">
            
            <h2 className="privacy-policy-section-title">Grocery Sathi Data Protection &amp; Privacy</h2>

            {/* Highlighted Intro Paragraph */}
            <p className="privacy-policy-intro-text">
              When you visit or purchase from Grocery Sathi, we automatically collect certain information about your device, 
              including information about your web browser, IP address, time zone, and some of the 
              cookies installed on your device. Additionally, as you browse the platform, we collect 
              information about the individual grocery pages or organic products you view, what websites or 
              search terms referred you to us, and how you interact with our services. 
              We refer to this automatically-collected information as <strong>“Device Information”</strong>.
            </p>

            {/* Regular Text */}
            <p className="privacy-policy-text">
              Additionally, when you place an order or attempt to make a purchase through Grocery Sathi, 
              we collect necessary information from you, including your name, billing address, local delivery address in Rajgarh, 
              payment details, email address, and phone number. We refer to this information as 
              <strong>“Order Information”</strong>. When we refer to <strong>“Personal Information”</strong> in this 
              Privacy Policy, we mean both Device Information and Order Information.
            </p>

            {/* Subheading */}
            <h3 className="privacy-policy-subtitle">
              How do we use your personal information?
            </h3>

            <p className="privacy-policy-text">
              We use the Order Information that we collect generally to fulfill any orders placed through 
              our platform (including processing your payment information, arranging local farm-fresh deliveries in Rajgarh, and 
              providing you with invoices and order confirmations). Additionally, we use this Order Information to:
            </p>

            {/* Bulleted List */}
            <ul className="privacy-policy-list">
              <li>Communicate with you regarding delivery slots and order status.</li>
              <li>Screen our grocery orders for potential risk, fraud, or delivery errors.</li>
              <li>Provide you with updates, promotional offers, or advertising relating to our farm-fresh products in line with your shared preferences.</li>
              <li>Improve our local logistics and customer support experience.</li>
            </ul>

            <p className="privacy-policy-text">
              We use the Device Information that we collect to help us screen for potential risk and fraud 
              (in particular, your IP address), and more generally to improve and optimize the Grocery Sathi platform (for 
              example, by generating analytics about how our customers browse and interact with our store, 
              and to assess the success of our local marketing and delivery campaigns).
            </p>

          </article>
        </main>
      </div>
    </>
  );
};

export default PrivacyPolicy;
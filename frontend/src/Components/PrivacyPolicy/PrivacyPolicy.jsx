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
        "item": "https://yourwebsite.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": "https://yourwebsite.com/privacy-policy"
      }
    ]
  };

  return (
    <div className="privacy-policy-page">
      {/* Inject Schema JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* --- HERO / BREADCRUMB BANNER --- */}
      <section className="privacy-policy-breadcrumb" aria-label="Privacy Policy Banner">
        <div className="privacy-policy-breadcrumb-container">
          
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="privacy-policy-back-link" title="Return to Homepage">
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
            We value the diverse perspectives and experiences of our users, and we encourage 
            collaboration and community engagement. Our platform provides opportunities for users 
            to contribute their knowledge, share their opinions, and engage in discussions with like-minded 
            individuals.
          </p>
        </div>
      </section>

      {/* --- MAIN POLICY CONTENT --- */}
      <main className="privacy-policy-main">
        <article className="privacy-policy-main-container">
          
          <h2 className="privacy-policy-section-title">Privacy Policy</h2>

          {/* Highlighted Intro Paragraph */}
          <p className="privacy-policy-intro-text">
            When you visit the Site, we automatically collect certain information about your device, 
            including information about your web browser, IP address, time zone, and some of the 
            cookies that are installed on your device. Additionally, as you browse the Site, we collect 
            information about the individual web pages or products that you view, what websites or 
            search terms referred you to the Site, and information about how you interact with the Site. 
            We refer to this automatically-collected information as <strong>“Device Information”</strong>.
          </p>

          {/* Regular Text */}
          <p className="privacy-policy-text">
            Additionally when you make a purchase or attempt to make a purchase through the Site, 
            we collect certain information from you, including your name, billing address, shipping address, 
            payment information, email address, and phone number. We refer to this information as 
            <strong>“Order Information”</strong>. When we talk about <strong>“Personal Information”</strong> in this 
            Privacy Policy, we are talking both about Device Information and Order Information.
          </p>

          {/* Subheading */}
          <h3 className="privacy-policy-subtitle">
            How do we use your personal information?
          </h3>

          <p className="privacy-policy-text">
            We use the Order Information that we collect generally to fulfill any orders placed through 
            the Site (including processing your payment information, arranging for shipping, and 
            providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
          </p>

          {/* Bulleted List */}
          <ul className="privacy-policy-list">
            <li>Communicate with you.</li>
            <li>Screen our orders for potential risk or fraud.</li>
            <li>When in line with the preferences you have shared with us.</li>
            <li>provide you with information or advertising relating to our products or services.</li>
          </ul>

          <p className="privacy-policy-text">
            We use the Device Information that we collect to help us screen for potential risk and fraud 
            (in particular, your IP address), and more generally to improve and optimize our Site (for 
            example, by generating analytics about how our customers browse and interact with the Site, 
            and to assess the success of our marketing and advertising campaigns).
          </p>

        </article>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
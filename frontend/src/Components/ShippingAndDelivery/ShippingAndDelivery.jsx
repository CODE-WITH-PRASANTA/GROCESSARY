import React from 'react';
import './ShippingAndDelivery.css';

const ShippingAndDelivery = () => {
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
        "name": "Shipping & Delivery",
        "item": "https://www.grocerysathi.com/shipping-and-delivery"
      }
    ]
  };

  const deliveryServiceSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Shipping & Delivery Policy - Grocery Sathi",
    "url": "https://www.grocerysathi.com/shipping-and-delivery",
    "description": "Learn about Grocery Sathi's fast and reliable farm-fresh grocery shipping, local delivery slots, and order policies across Rajgarh, Rajasthan.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(deliveryServiceSchema) }}
      />

      <div className="shipping-and-delivery-page">
        
        {/* --- HERO / BREADCRUMB BANNER --- */}
        <section className="shipping-and-delivery-breadcrumb" aria-label="Breadcrumb Banner">
          <div className="shipping-and-delivery-breadcrumb-container">
            
            {/* Back Navigation with ARIA Label */}
            <nav aria-label="Breadcrumb Navigation">
              <a href="/" className="shipping-and-delivery-back-link" title="Return to Grocery Sathi Homepage">
                <span className="shipping-and-delivery-arrow-circle" aria-hidden="true">
                  <svg
                    className="shipping-and-delivery-arrow-icon"
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
                <span className="shipping-and-delivery-back-text">Back to Home</span>
              </a>
            </nav>

            {/* Primary Page Heading */}
            <h1 className="shipping-and-delivery-breadcrumb-title">Shipping &amp; Delivery</h1>

            {/* SEO / Page Description Paragraph */}
            <p className="shipping-and-delivery-breadcrumb-description">
              At Grocery Sathi, we ensure prompt and dependable doorstep delivery of farm-fresh groceries, daily essentials, and organic items right to your home in Rajgarh, Rajasthan.
            </p>
          </div>
        </section>

        {/* --- MAIN CONTENT SECTION --- */}
        <main className="shipping-and-delivery-main">
          <div className="shipping-and-delivery-container">

            <header className="shipping-and-delivery-header">
              <h2>Grocery Sathi Shipping &amp; Delivery Policy</h2>

              <p>
                Welcome to Grocery Sathi! We take pride in delivering farm-fresh produce and quality household essentials directly to your doorstep. This policy outlines our local delivery terms, timeframes, and shipping guidelines.
              </p>

              <p>
                To ensure maximum freshness, all grocery items are carefully packaged and handled according to strict quality standards before they leave our local fulfillment center.
              </p>

              <div className="shipping-and-delivery-list-wrapper">
                <p className="shipping-and-delivery-bold-label">Key Delivery Highlights:</p>
                <ul>
                  <li>Same-day and scheduled delivery slots available across Rajgarh.</li>
                  <li>Temperature-controlled transit for perishable fruits, vegetables, and dairy items.</li>
                  <li>Real-time order updates and delivery notifications sent directly to your registered phone or email.</li>
                </ul>
              </div>

              <p>
                We require a valid delivery address and active phone number at checkout to ensure seamless communication with our local delivery partners.
              </p>
            </header>

            <section className="shipping-and-delivery-section">
              <h3>Delivery Timelines &amp; Slots</h3>

              <p>
                Standard delivery orders placed through Grocery Sathi are generally fulfilled within our designated daily delivery windows. Delivery times may vary depending on order volume, traffic, or weather conditions in Rajgarh.
              </p>

              <p>
                If your delivery is expected to experience a significant delay due to unforeseen local circumstances, our support team will notify you promptly via phone call or SMS.
              </p>

              <h4>Perishable &amp; Fresh Produce Guidelines</h4>

              <p>
                Because we specialize in farm-fresh items (such as fresh vegetables, fruits, and dairy), we request that someone be available at the shipping address to receive the delivery during your chosen time slot. 
              </p>

              <p>
                If you are unavailable to receive perishable items, please reach out to our customer service team immediately to reschedule. Grocery Sathi cannot take responsibility for perishable items left unattended for extended periods.
              </p>
            </section>

            <section className="shipping-and-delivery-section">
              <h3>Shipping Charges &amp; Minimum Orders</h3>

              <p>
                Delivery fees (if applicable) are calculated and displayed transparently at checkout based on your order value and delivery location within Rajgarh. We frequently offer free delivery promotions for qualifying order amounts.
              </p>
            </section>

            <section className="shipping-and-delivery-section">
              <h3>Damaged or Missing Items on Delivery</h3>

              <p>
                We inspect all orders before dispatch. However, if you receive an item that is damaged, spoiled, or missing from your delivery package, please report it to us within 24 hours of receipt.
              </p>

              <p>
                You can contact our support team at <strong>support@grocerysathi.com</strong> or via our helpdesk with your order ID and photo proof of any damaged goods so we can process a prompt replacement or refund.
              </p>
            </section>

          </div>
        </main>
      </div>
    </>
  );
};

export default ShippingAndDelivery;
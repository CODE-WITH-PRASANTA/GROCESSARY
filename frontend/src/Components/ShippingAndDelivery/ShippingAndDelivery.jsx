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
        "item": "https://yourwebsite.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shipping & Delivery",
        "item": "https://yourwebsite.com/shipping-and-delivery"
      }
    ]
  };

  return (
    <div className="shipping-and-delivery-page">
      {/* Inject Schema JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* --- HERO / BREADCRUMB BANNER --- */}
      <section className="shipping-and-delivery-breadcrumb" aria-label="Breadcrumb Banner">
        <div className="shipping-and-delivery-breadcrumb-container">
          
          {/* Back Navigation with ARIA Label */}
          <nav aria-label="Breadcrumb Navigation">
            <a href="/" className="shipping-and-delivery-back-link" title="Return to Homepage">
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
            We value the diverse perspectives and experiences of our users, and we encourage
            collaboration and community engagement. Our platform provides opportunities for users
            to contribute their knowledge, share their opinions, and engage in discussions with like-minded individuals.
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT SECTION --- */}
      <main className="shipping-and-delivery-main">
        <div className="shipping-and-delivery-container">

          <header className="shipping-and-delivery-header">
            <h2>Shipping &amp; Delivery</h2>

            <p>
              Our policy lasts 30 days. If 30 days have passed since your purchase,
              unfortunately we can't offer you a refund or exchange.
            </p>

            <p>
              To be eligible for a return, your item must be unused and in the same
              condition that you received it. It must also be in the original
              packaging.
            </p>

            <p>
              Several types of goods are exempt from being returned. Perishable
              products such as food, flowers, newspapers or magazines cannot be
              returned. We also do not accept products that are intimate or
              sanitary goods, hazardous materials, flammable liquids or gases.
            </p>

            <div className="shipping-and-delivery-list-wrapper">
              <p className="shipping-and-delivery-bold-label">Additional non-returnable items:</p>
              <ul>
                <li>Gift cards</li>
                <li>Downloadable software products</li>
                <li>Some health and personal care items</li>
              </ul>
            </div>

            <p>
              To complete your return, we require a receipt or proof of purchase.
            </p>

            <p>
              Please do not send your purchase back to the manufacturer.
            </p>

            <p>
              There are certain situations where only partial refunds are granted
              (if applicable):
            </p>

            <ul>
              <li>Books with obvious signs of use.</li>
              <li>
                CDs, DVDs, VHS tapes, software, video games, cassette tapes or
                vinyl records that have been opened.
              </li>
              <li>
                Any item that is not in its original condition, is damaged or
                missing parts for reasons not due to our error.
              </li>
              <li>
                Any item returned more than 30 days after delivery.
              </li>
            </ul>
          </header>

          <section className="shipping-and-delivery-section">
            <h3>Refunds (if applicable)</h3>

            <p>
              Once your return is received and inspected, we will send you an email
              to notify you that we have received your returned item. We will also
              notify you of the approval or rejection of your refund.
            </p>

            <p>
              If you are approved, then your refund will be processed and a credit
              will automatically be applied to your credit card or original method
              of payment within a certain amount of days.
            </p>

            <h4>Late or Missing Refunds (if applicable)</h4>

            <p>
              If you haven't received a refund yet, first check your bank account
              again.
            </p>

            <p>
              Then contact your credit card company, it may take some time before
              your refund is officially posted.
            </p>

            <p>
              Next contact your bank. There is often some processing time before a
              refund is posted.
            </p>

            <p>
              If you've done all of this and you still have not received your
              refund, please contact us at
              <strong> support@yourstore.com</strong>.
            </p>

            <h4>Sale Items (if applicable)</h4>

            <p>
              Only regular priced items may be refunded. Unfortunately sale items
              cannot be refunded.
            </p>
          </section>

          <section className="shipping-and-delivery-section">
            <h3>Exchanges (if applicable)</h3>

            <p>
              We only replace items if they are defective or damaged. If you need
              to exchange it for the same item, send us an email and return your
              item to our warehouse.
            </p>
          </section>

          <section className="shipping-and-delivery-section">
            <h3>Gifts</h3>

            <p>
              If the item was marked as a gift when purchased and shipped directly
              to you, you'll receive a gift credit for the value of your return.
              Once the returned item is received, a gift certificate will be mailed
              to you.
            </p>

            <p>
              If the item wasn't marked as a gift when purchased, or the gift giver
              had the order shipped to themselves to give to you later, we will
              send a refund to the gift giver.
            </p>
          </section>

          <section className="shipping-and-delivery-section">
            <h3>Shipping</h3>

            <p>
              To return your product, you should mail your product to our returns
              centre.
            </p>

            <p>
              You will be responsible for paying your own shipping costs for
              returning your item. Shipping costs are non-refundable. If you
              receive a refund, the cost of return shipping will be deducted from
              your refund.
            </p>

            <p>
              Depending on where you live, the time it may take for your exchanged
              product to reach you may vary.
            </p>

            <p>
              If you are shipping an item over £75, you should consider using a
              trackable shipping service or purchasing shipping insurance. We don't
              guarantee that we will receive your returned item.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default ShippingAndDelivery;
import React, { useState } from 'react';
import './FaqSection.css';

const FaqSection = () => {
  // Store only the ID of currently open card (null if all closed)
  const [openId, setOpenId] = useState(1);

  const faqData = [
    {
      id: 1,
      question: 'How do I place an order on Grocery Sathi?',
      answer:
        'Ordering farm-fresh groceries is simple! Browse our catalog, add your favorite organic items, fruits, vegetables, and daily essentials to your cart, and proceed to checkout with your preferred delivery slot and payment method.',
    },
    {
      id: 2,
      question: 'What are the delivery timings available?',
      answer:
        'We offer flexible morning, afternoon, and evening delivery windows to fit your schedule. You can select your preferred delivery slot during the checkout process.',
    },
    {
      id: 3,
      question: 'Is there a minimum order value for free delivery?',
      answer:
        'Yes, we offer free doorstep delivery on all orders above a specified threshold amount. You can check the live cart details to see if your order qualifies for free delivery.',
    },
    {
      id: 4,
      question: 'How can I track the status of my grocery order?',
      answer:
        'By creating an account on Grocery Sathi, you can easily track your order live, view real-time delivery status updates, and look back at your previously ordered items for quick re-ordering.',
    },
    {
      id: 5,
      question: 'What payment methods does Grocery Sathi accept?',
      answer:
        'We accept a wide range of secure payment options including credit/debit cards, UPI, net banking, popular digital wallets, and Cash on Delivery (COD) for your convenience.',
    },
    {
      id: 6,
      question: 'Are the fruits and vegetables 100% organic and fresh?',
      answer:
        'Absolutely! We source our produce directly from trusted local farmers and organic growers daily to ensure maximum freshness, high nutritional quality, and strict quality control standards.',
    },
    {
      id: 7,
      question: 'What should I do if an item is missing or damaged upon delivery?',
      answer:
        'If you encounter any issues with missing or damaged items, you can instantly report it through your order history or contact our 24/7 customer support team for an immediate replacement or refund.',
    },
    {
      id: 8,
      question: 'Can I modify or cancel my order after placing it?',
      answer:
        'You can modify or cancel your order directly from your account dashboard before our delivery partner starts packing or dispatching the items from the local fulfillment hub.',
    },
    {
      id: 9,
      question: 'How do I apply promotional discount coupons?',
      answer:
        'During the checkout process, you will find a promo code box. Simply enter your valid coupon code and click apply to instantly reflect the discount on your total cart value.',
    },
    {
      id: 10,
      question: 'Do you offer subscription plans for daily essentials like milk?',
      answer:
        'Yes! With Grocery Sathi Subscriptions, you can set up recurring daily or weekly deliveries for essential items like fresh milk, bread, eggs, and newspapers so you never run out.',
    },
    {
      id: 11,
      question: 'How do I reset my account password?',
      answer:
        'Click on the "Sign In" button at the top of the page, select "Forgot Password", and enter your registered email address. We will send you a secure link to reset your password instantly.',
    },
    {
      id: 12,
      question: 'How can I join the Grocery Sathi farmer partnership program?',
      answer:
        'If you are a local farmer or organic producer looking to supply fresh goods through our platform, please reach out via our Contact Us page or email our vendor onboarding desk.',
    },
    {
      id: 13,
      question: 'Are there any hidden charges or handling fees?',
      answer:
        'We believe in complete pricing transparency. All item prices, taxes, and any applicable delivery fees are clearly itemized on the checkout screen before you confirm payment.',
    },
    {
      id: 14,
      question: 'How do I update my delivery address or phone number?',
      answer:
        'You can manage, add, or edit multiple delivery addresses and update your contact number anytime by navigating to your Account Profile settings.',
    },
    {
      id: 15,
      question: 'How can I contact Grocery Sathi customer support?',
      answer:
        'Our friendly support team is available round-the-clock. You can call us, email support@grocerysathi.com, or use our live chat feature for prompt assistance.',
    },
  ];

  // Toggle function (accordion style - only 1 item open at a time)
  const toggleFaq = (id) => {
    setOpenId((prevId) => (prevId === id ? null : id));
  };

  // Structured Data (JSON-LD) for SEO Rich Results
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
        "name": "FAQ",
        "item": "https://www.grocerysathi.com/faq"
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {/* Combined Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="faq-section-wrapper" itemScope itemType="https://schema.org/FAQPage">
        {/* Top Breadcrumb Banner */}
        <section className="faq-section-breadcrumb-container" aria-label="FAQ Breadcrumb Banner">
          <div className="faq-section-breadcrumb-content">
            
            <nav aria-label="Breadcrumb Navigation">
              <a href="/" className="faq-section-back-link" title="Return to Grocery Sathi Homepage">
                <span className="faq-section-arrow-circle" aria-hidden="true">
                  <svg
                    className="faq-section-arrow-icon"
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
                <span className="faq-section-back-text">Back to Home</span>
              </a>
            </nav>

            <h1 className="faq-section-breadcrumb-title">Grocery Sathi FAQ's</h1>

            <p className="faq-section-breadcrumb-description">
              Find instant answers to questions regarding online grocery ordering, farm-fresh produce delivery slots, secure payment options, and account management.
            </p>
          </div>
        </section>

        {/* Bottom About Shop Grid */}
        <section className="faq-section-about-container" aria-label="Grocery Sathi Customer Support FAQ Grid">
          <div className="faq-section-about-wrapper">
            <h2 className="faq-section-about-title">Frequently Asked Questions</h2>

            <div className="faq-section-about-grid">
              {faqData.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`faq-section-about-card ${isOpen ? 'open' : ''}`}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                  >
                    <button
                      className="faq-section-about-header"
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <span className="faq-section-about-question" itemProp="name">
                        {item.question}
                      </span>
                      <span className="faq-section-about-icon" aria-hidden="true">
                        <svg
                          className={`faq-section-chevron-icon ${isOpen ? 'rotate' : ''}`}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </button>

                    <div
                      id={`faq-answer-${item.id}`}
                      className={`faq-section-about-body-wrapper ${isOpen ? 'expanded' : ''}`}
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <div className="faq-section-about-body-content">
                        <p className="faq-section-about-answer" itemProp="text">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FaqSection;
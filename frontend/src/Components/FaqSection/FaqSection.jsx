import React, { useState } from 'react';
import './FaqSection.css';

const FaqSection = () => {
  // Store only the ID of currently open card (null if all closed)
  const [openId, setOpenId] = useState(1);

  const faqData = [
    {
      id: 1,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 2,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 3,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 4,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 5,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 6,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 7,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 8,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 9,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 10,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 11,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 12,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 13,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 14,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
    {
      id: 15,
      question: 'How to setup a page with custom fields?',
      answer:
        'By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.By creating an account you will be able to shop faster, be up to date on an order\'s status, and keep track of the orders you have previously made.',
    },
  ];

  // Toggle function (accordion style - only 1 item open at a time)
  const toggleFaq = (id) => {
    setOpenId((prevId) => (prevId === id ? null : id));
  };

  // Structured Data (JSON-LD) for SEO
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
        "name": "FAQ",
        "item": "https://yourwebsite.com/faq"
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

      <div className="faq-section-wrapper">
        {/* Top Breadcrumb Banner */}
        <section className="faq-section-breadcrumb-container" aria-label="FAQ Breadcrumb Banner">
          <div className="faq-section-breadcrumb-content">
            
            <nav aria-label="Breadcrumb Navigation">
              <a href="/" className="faq-section-back-link" title="Return to Homepage">
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

            <h1 className="faq-section-breadcrumb-title">Faq's</h1>

            <p className="faq-section-breadcrumb-description">
              People will always seek help and advice. They are unwilling to pick up the phone, walk into a store, or wait hours (even minutes) for that information or insight to become accessible.
            </p>
          </div>
        </section>

        {/* Bottom About Shop Grid */}
        <section className="faq-section-about-container" aria-label="About Shop FAQ Section">
          <div className="faq-section-about-wrapper">
            <h2 className="faq-section-about-title">About Shop</h2>

            <div className="faq-section-about-grid">
              {faqData.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`faq-section-about-card ${isOpen ? 'open' : ''}`}
                  >
                    <button
                      className="faq-section-about-header"
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <span className="faq-section-about-question">{item.question}</span>
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
                    >
                      <div className="faq-section-about-body-content">
                        <p className="faq-section-about-answer">{item.answer}</p>
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
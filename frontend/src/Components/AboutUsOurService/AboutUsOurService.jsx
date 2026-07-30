import React from 'react';
import './AboutUsOurService.css';

const AboutUsOurService = () => {
  // Service cards data customized for Grocery Sathi
  const services = [
    {
      id: 1,
      title: 'Fast Delivery',
      description:
        'Get farm-fresh vegetables, dairy, and household essentials delivered right to your doorstep. Track your grocery delivery in real-time with our reliable logistics network.',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="20" r="1"></circle>
          <circle cx="18" cy="20" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          <line x1="1" y1="5" x2="4" y2="5"></line>
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Exciting Offers',
      description:
        'Save more on your monthly grocery bills! Grocery Sathi brings you daily discounts, combo deals, seasonal clearance sales, and cashback rewards on top brands.',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z"></path>
          <line x1="9" y1="15" x2="15" y2="9"></line>
          <circle cx="9.5" cy="9.5" r=".5" fill="currentColor"></circle>
          <circle cx="14.5" cy="14.5" r=".5" fill="currentColor"></circle>
        </svg>
      ),
    },
    {
      id: 3,
      title: '24/7 Support',
      description:
        'Have questions about your order or product quality? Our dedicated customer care team is available 24 hours a day, 7 days a week via phone, email, or chat.',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
  ];

  // Schema markup for Services
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": services.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": service.title,
      "description": service.description
    }))
  };

  return (
    <>
      {/* JSON-LD Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />

      <section className="our-services-container" aria-label="Grocery Sathi Services">
        <div className="our-services-wrapper">
          {/* Header Section */}
          <div className="services-header">
            <h2 className="services-title">About Our Services</h2>
            <p className="services-subtitle">
              At Grocery Sathi, our mission is to make online grocery shopping seamless, 
              affordable, and dependable. Discover how we bring convenience straight to your kitchen table.
            </p>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="card-top">
                  <h3 className="card-title">{service.title}</h3>
                  <div className="card-icon">{service.icon}</div>
                </div>
                <p className="card-description">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsOurService;
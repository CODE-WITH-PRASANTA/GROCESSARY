import React from 'react';
import './AboutUsOurService.css';

const AboutUsOurService = () => {
  // Service cards data with inline SVG icons matching your design
  const services = [
    {
      id: 1,
      title: 'Fast delivery',
      description:
        'The specific delivery time will vary depending on the shipping address and the selected delivery option. Customers can track their order online to see the estimated delivery date.',
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
        >
          {/* Fast Delivery / Cart Icon */}
          <circle cx="9" cy="20" r="1"></circle>
          <circle cx="18" cy="20" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          <line x1="1" y1="5" x2="4" y2="5"></line>
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Many offers',
      description:
        'CMS also offers a variety of training and technical assistance to help providers and state agencies meet their responsibilities under Medicare, Medicaid, and SCHIP.',
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
        >
          {/* Discount Badge / Offer Icon */}
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z"></path>
          <line x1="9" y1="15" x2="15" y2="9"></line>
          <circle cx="9.5" cy="9.5" r=".5" fill="currentColor"></circle>
          <circle cx="14.5" cy="14.5" r=".5" fill="currentColor"></circle>
        </svg>
      ),
    },
    {
      id: 3,
      title: '24/7 support',
      description:
        'CMS Service support is available 24 hours a day, 7 days a week. You can reach them by phone, email, or chat. Here are the contact information for CMS Service support.',
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
        >
          {/* Phone Call / Support Icon */}
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="our-services-container">
      <div className="our-services-wrapper">
        {/* Header Section */}
        <div className="services-header">
          <h2 className="services-title">About our Services</h2>
          <p className="services-subtitle">
            Our mission is to empower individuals with knowledge and facilitate meaningful connections
            through our platform. We understand the importance of reliable and up-to-date information in
            today's fast-paced world.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.id}>
              <div className="card-top">
                <h3 className="card-title">{service.title}</h3>
                <div className="card-icon">{service.icon}</div>
              </div>
              <p className="card-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsOurService;
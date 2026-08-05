import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: '',
  });

  const [wordCount, setWordCount] = useState(0);

  // Handle description text with UNLIMITED word count
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);

    setFormData((prev) => ({ ...prev, description: text }));
    setWordCount(words.length);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Your message has been sent successfully to Grocery Sathi support!');
  };

  // Structured Data (JSON-LD) for SEO Rich Results & Local Business Contact
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
        "name": "Contact Us",
        "item": "https://www.grocerysathi.com/contact"
      }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "name": "Grocery Sathi",
    "image": "https://www.grocerysathi.com/logo.png",
    "@id": "https://www.grocerysathi.com/#store",
    "url": "https://www.grocerysathi.com/contact",
    "telephone": "+919887868746",
    "email": "support@grocerysathi.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tehla bypass Alwar road, Rajgarh, Thana",
      "addressLocality": "Rajgarh",
      "addressRegion": "Rajasthan",
      "postalCode": "301408",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 27.2281, // Approximate coordinate reference for Rajgarh region
      "longitude": 76.6231
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "07:00",
      "closes": "21:00"
    }
  };

  return (
    <>
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="contact-us-page">
        {/* Top Banner Section (Light Gray Background) */}
        <section className="top-banner-section">
          <div className="banner-content">
            {/* Back Navigation */}
            <nav aria-label="Breadcrumb Navigation">
              <a href="/" className="back-link" title="Return to Grocery Sathi Homepage">
                <span className="arrow-circle" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
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
                <span className="back-text">Back to Home</span>
              </a>
            </nav>

            {/* Banner Titles */}
            <div className="banner-grid">
              <div className="left-header">
                <h1 className="main-heading">Contact Grocery Sathi</h1>
                <p className="main-description">
                  We are here to help! Whether you have questions about your farm-fresh grocery orders, delivery slots, organic quality standards, or subscription plans, our support desk in Rajgarh is ready to assist you.
                </p>
              </div>
              <div className="right-header">
                <h2 className="form-heading">Send a Message</h2>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area overlapping top section */}
        <section className="main-content-section">
          <div className="content-container">
            
            {/* Contact Details (Left Side) */}
            <div className="contact-info-block" itemScope itemType="https://schema.org/PostalAddress">
              <div className="info-row">
                <div className="info-col">
                  <h3 className="info-label">CALL US</h3>
                  <p className="info-text">
                    <a href="tel:+919887868746" className="info-link">+91 98878 68746</a>
                  </p>
                </div>

                <div className="info-col">
                  <h3 className="info-label">ADDRESS:</h3>
                  <p className="info-text" itemProp="streetAddress">
                    Tehla bypass Alwar road,<br />
                    Rajgarh, Thana,<br />
                    Rajasthan <span itemProp="postalCode">301408</span>
                  </p>
                </div>
              </div>

              <div className="info-row single">
                <div className="info-col">
                  <h3 className="info-label">EMAIL:</h3>
                  <p className="info-text">
                    <a href="mailto:support@grocerysathi.com" className="info-link">support@grocerysathi.com</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Form Container (Right Side) */}
            <div className="form-card-wrapper">
              <form className="contact-form" onSubmit={handleSubmit} autoComplete="on">
                
                {/* First Name & Last Name */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="firstName">
                      First name<span className="star">*</span> :
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="lastName">
                      Last name<span className="star">*</span> :
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="email">
                      Email<span className="star">*</span> :
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="support@grocerysathi.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone number<span className="star">*</span> :
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+91 98878 68746"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                {/* Description Field (Unlimited Words) */}
                <div className="form-field full">
                  <div className="desc-header">
                    <label htmlFor="description">Description:</label>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="How can Grocery Sathi help you today?"
                    rows={6}
                    value={formData.description}
                    onChange={handleDescriptionChange}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="form-btn-wrapper">
                  <button type="submit" className="send-msg-btn">
                    <span>Send Message</span>
                    <svg
                      className="arrow-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>

              </form>
            </div>

          </div>
        </section>

        {/* Google Map Location Section for Tehla bypass Alwar road, Rajgarh, Rajasthan */}
        <section className="location-map-section" aria-label="Grocery Sathi Store Map Location">
          <iframe
            title="Grocery Sathi Location Map - Rajgarh Rajasthan"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.851253609823!2d76.6210!3d27.2281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDEzJzQxLjIiTiA3NsKwMzcnMTUuMiJF!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>
      </div>
    </>
  );
};

export default ContactUs;
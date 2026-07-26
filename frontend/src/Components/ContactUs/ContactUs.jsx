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
    alert('Your message has been sent successfully!');
  };

  return (
    <div className="contact-us-page">
      {/* Top Banner Section (Light Gray Background) */}
      <section className="top-banner-section">
        <div className="banner-content">
          {/* Back Navigation */}
          <a href="/" className="back-link">
            <span className="arrow-circle">
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

          {/* Banner Titles */}
          <div className="banner-grid">
            <div className="left-header">
              <h1 className="main-heading">Contact us</h1>
              <p className="main-description">
                With that in mind, we strive to deliver accurate, trustworthy, and engaging
                content to our users. Our team of experts, researchers, and writers work
                tirelessly to curate high-quality articles, guides, and resources that cover
                various domains such as technology, science, health, business, and more.
              </p>
            </div>
            <div className="right-header">
              <h2 className="form-heading">Contact form</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area overlapping top section */}
      <section className="main-content-section">
        <div className="content-container">
          
          {/* Contact Details (Left Side) */}
          <div className="contact-info-block">
            <div className="info-row">
              <div className="info-col">
                <h3 className="info-label">CALL US</h3>
                <p className="info-text">+48 0021-32-12</p>
              </div>

              <div className="info-col">
                <h3 className="info-label">ADDRESS:</h3>
                <p className="info-text">
                  1093 Marigold Lane,<br />
                  Coral Way, Miami,<br />
                  Florida, 33169
                </p>
              </div>
            </div>

            <div className="info-row single">
              <div className="info-col">
                <h3 className="info-label">EMAIL:</h3>
                <p className="info-text">shop@company.com</p>
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
                    placeholder="shop@company.com"
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
                    placeholder="Phone number"
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
                  placeholder="How Can We Help?"
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

      {/* Google Map Location Section */}
      <section className="location-map-section">
        <iframe
          title="Google Map Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2381.821430985532!2d-6.260309684161541!3d53.3437939799781!2m3!1f0!0f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48670e9b11e2f753%3A0xb3a8244248a3d5e2!2s1-2%20Adam%20Court%2C%20Sr%C3%A1id%20Grafton%2C%20Dublin%202%2C%20D02%20W0Y7%2C%20Ireland!5e0!3m2!1sen!2s!4v1680000000000!5m2!1sen!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactUs;
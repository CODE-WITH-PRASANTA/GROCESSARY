import React, { useState } from 'react';
import './FloatingForm.css';
import { FaPhoneAlt, FaWhatsapp, FaPaperPlane, FaTimes } from 'react-icons/fa';

const FloatingForm = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process lead data or trigger API call here
    console.log('Grocery Sathi Lead Captured:', formData);
    alert('Thank you! Your request has been submitted to Grocery Sathi.');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* SEO Structured Data for Lead Form Web Application */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Grocery Sathi Quick Inquiry & Quote Form",
          "description": "Connect instantly with Grocery Sathi for fresh organic grocery deliveries, custom quotes, and order support.",
          "publisher": {
            "@type": "Organization",
            "name": "Grocery Sathi"
          }
        })}
      </script>

      <div className="floating-overlay" role="presentation" onClick={() => setIsOpen(false)}>
        <div 
          className="floating-form-card" 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Grocery Sathi Quick Quote Form"
        >
          <button 
            type="button"
            className="floating-close-btn" 
            onClick={() => setIsOpen(false)}
            aria-label="Close inquiry form"
          >
            <FaTimes aria-hidden="true" />
          </button>

          <div className="floating-form-header">
            <h3>Grocery Sathi Express Order</h3>
            <p>Share your details for instant callbacks or quick grocery quotes.</p>
          </div>

          <form onSubmit={handleSubmit} className="floating-form-body">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="e.g. Aakash Mattoo"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="e.g. 9887868746"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="e.g. name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">What are you looking for?</label>
              <textarea
                id="notes"
                name="notes"
                rows="2"
                placeholder="Mention fresh vegetables, fruits, or organic items..."
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="action-buttons">
              <button type="submit" className="btn-action btn-submit" aria-label="Submit inquiry">
                <FaPaperPlane aria-hidden="true" /> <span>Submit</span>
              </button>

              <a 
                href={`tel:${formData.phone || '+919887868746'}`} 
                className="btn-action btn-call"
                aria-label="Call Grocery Sathi customer support"
              >
                <FaPhoneAlt aria-hidden="true" /> <span>Call</span>
              </a>

              <a 
                href={`https://wa.me/${formData.phone.replace(/[^0-9]/g, '') || '919887868746'}?text=${encodeURIComponent('Hi Grocery Sathi, I am interested in your fresh organic products.')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-action btn-whatsapp"
                aria-label="Chat with Grocery Sathi on WhatsApp"
              >
                <FaWhatsapp aria-hidden="true" /> <span>WhatsApp</span>
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FloatingForm;
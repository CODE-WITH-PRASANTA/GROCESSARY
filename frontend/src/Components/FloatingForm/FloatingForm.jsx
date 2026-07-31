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
    // Process cold lead data here
    console.log('Lead Captured:', formData);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="floating-overlay">
      <div className="floating-form-card">
        <button 
          className="floating-close-btn" 
          onClick={() => setIsOpen(false)}
          aria-label="Close form"
        >
          <FaTimes />
        </button>

        <div className="floating-form-header">
          <h3>Get a Quick Quote</h3>
          <p>Leave your details and we'll connect shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="floating-form-body">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="e.g. full Name"
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
              placeholder="phone no"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">How can we help?</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              placeholder="Tell us what you're looking for..."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="action-buttons">
            <button type="submit" className="btn-action btn-submit">
              <FaPaperPlane /> <span>Submit</span>
            </button>

            <a href={`tel:${formData.phone || '+91 9887868746'}`} className="btn-action btn-call">
              <FaPhoneAlt /> <span>Call</span>
            </a>

            <a 
              href={`https://wa.me/${formData.phone.replace(/[^0-9]/g, '') || '+91 9887868746'}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-action btn-whatsapp"
            >
              <FaWhatsapp /> <span>WhatsApp</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloatingForm;
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import './Footer.css';

// Path & Title configuration matching the Navbar setup
const FOOTER_PATHS = {
  SEARCH: '/search',
  CART: '/cart',
  COLLECTION: '/collections',
  WISHLIST: '/wishlist',
  COMPARE: '/compare',
  ABOUT: '/about-us',
  CONTACT: '/contact-us',
  FAQ: '/faq',
  SHIPPING: '/shipping-delivery',
  PRIVACY: '/privacy-policy',
  TERMS: '/terms-and-conditions',
};

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed with: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* TOP SECTION */}
        <div className="footer-top">
          
          {/* Column 1: Brand Info */}
          <div className="footer-col footer-col-brand">
            <h2 className="footer-logo">grocery</h2>
            <p className="footer-description">
              Grocery shopping can be a challenge, but it can also be a rewarding experience. 
              By following these tips, you can make the process easier and save money.
            </p>

            {/* Social Media Links with Inline SVGs */}
            <div className="footer-socials">
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Messenger */}
              <a href="https://messenger.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Messenger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.96 3.129 3.26 5.889-3.26-6.559 6.96z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="X">
                <span className="footer-x-icon">X</span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="footer-col">
            <h3 className="footer-col-title">Navigation:</h3>
            <ul className="footer-links-list">
              <li><a href={FOOTER_PATHS.SEARCH}>Search</a></li>
              <li><a href={FOOTER_PATHS.CART}>My Cart</a></li>
              <li><a href={FOOTER_PATHS.COLLECTION}>All Collection</a></li>
              <li><a href={FOOTER_PATHS.WISHLIST}>My Wishlist</a></li>
              <li><a href={FOOTER_PATHS.COMPARE}>My Compare</a></li>
            </ul>
          </div>

          {/* Column 3: About Us Links */}
          <div className="footer-col">
            <h3 className="footer-col-title">About Us:</h3>
            <ul className="footer-links-list">
              <li><a href={FOOTER_PATHS.ABOUT}>About Us</a></li>
              <li><a href={FOOTER_PATHS.CONTACT}>Contact with us</a></li>
              <li><a href={FOOTER_PATHS.FAQ}>Faq's</a></li>
              <li><a href={FOOTER_PATHS.SHIPPING}>Shipping & Delivery</a></li>
              <li><a href={FOOTER_PATHS.PRIVACY}>Privacy Policy</a></li>
              <li><a href={FOOTER_PATHS.TERMS}>Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col footer-col-newsletter">
            <h3 className="footer-newsletter-title">Subscribe newsletter and get -20% off</h3>
            <p className="footer-newsletter-sub">
              subscriptions can give you access to exclusive content or features that you wouldn't be able to get otherwise
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter email address..." 
                className="footer-newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026, Grocery WorkDo, Powered by WorkDo.io
          </div>

          {/* Payment Badges */}
          <div className="footer-payment-icons">
            <span className="footer-payment-badge visa">VISA</span>
            <span className="footer-payment-badge mastercard">
              <span className="mc-circle mc-red"></span>
              <span className="mc-circle mc-yellow"></span>
            </span>
            <span className="footer-payment-badge amex">
              <span className="amex-line">AM</span>
              <span className="amex-line">EX</span>
            </span>
            <span className="footer-payment-badge paypal">
              <i>P</i>
            </span>
            <span className="footer-payment-badge diners">
              <span className="diners-circle"></span>
            </span>
            <span className="footer-payment-badge discover">DISCOVER</span>
          </div>

          {/* Footer Legal Links */}
          <div className="footer-legal-links">
            <a href={FOOTER_PATHS.PRIVACY}>Policy Privacy</a>
            <a href={FOOTER_PATHS.TERMS}>Terms and conditions</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
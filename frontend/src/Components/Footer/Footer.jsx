import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import './Footer.css';

// Path & Title configuration matching the Grocery Sathi setup
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
      alert(`Thank you for subscribing to Grocery Sathi with: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer 
      className="footer" 
      role="contentinfo"
      itemScope 
      itemType="https://schema.org/WPFooter"
    >
      <div className="footer-container">
        
        {/* TOP SECTION */}
        <div className="footer-top">
          
          {/* Column 1: Brand Info */}
          <div 
            className="footer-col footer-col-brand"
            itemScope 
            itemType="https://schema.org/Organization"
          >
            <meta itemProp="name" content="Grocery Sathi" />
            <meta itemProp="url" content="https://www.grocerysathi.com" />
            
            <h2 className="footer-logo" itemProp="alternateName">grocery sathi</h2>
            <p className="footer-description" itemProp="description">
              Grocery Sathi is your trusted online supermarket for farm-fresh organic vegetables, juicy fruits, bakery essentials, and daily household supplies delivered straight to your doorstep.
            </p>

            {/* Social Media Links with Inline SVGs & Schema Metadata */}
            <div className="footer-socials" aria-label="Grocery Sathi official social media profiles">
              {/* YouTube */}
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon" 
                aria-label="Visit Grocery Sathi YouTube Channel"
                itemProp="sameAs"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Messenger */}
              <a 
                href="https://messenger.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon" 
                aria-label="Chat with Grocery Sathi on Messenger"
                itemProp="sameAs"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.96 3.129 3.26 5.889-3.26-6.559 6.96z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon" 
                aria-label="Follow Grocery Sathi on Instagram"
                itemProp="sameAs"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon" 
                aria-label="Follow Grocery Sathi on X (Twitter)"
                itemProp="sameAs"
              >
                <span className="footer-x-icon">X</span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <nav className="footer-col" aria-label="Footer Quick Navigation">
            <h3 className="footer-col-title">Navigation</h3>
            <ul className="footer-links-list">
              <li><a href={FOOTER_PATHS.SEARCH}>Search Grocery</a></li>
              <li><a href={FOOTER_PATHS.CART}>My Cart</a></li>
              <li><a href={FOOTER_PATHS.COLLECTION}>All Collections</a></li>
              <li><a href={FOOTER_PATHS.WISHLIST}>My Wishlist</a></li>
              <li><a href={FOOTER_PATHS.COMPARE}>Compare Products</a></li>
            </ul>
          </nav>

          {/* Column 3: About Us & Support Links */}
          <nav className="footer-col" aria-label="Footer Customer Support">
            <h3 className="footer-col-title">Customer Care</h3>
            <ul className="footer-links-list">
              <li><a href={FOOTER_PATHS.ABOUT}>About Grocery Sathi</a></li>
              <li><a href={FOOTER_PATHS.CONTACT}>Contact Us</a></li>
              <li><a href={FOOTER_PATHS.FAQ}>FAQs & Help</a></li>
              <li><a href={FOOTER_PATHS.SHIPPING}>Shipping & Delivery</a></li>
              <li><a href={FOOTER_PATHS.PRIVACY}>Privacy Policy</a></li>
              <li><a href={FOOTER_PATHS.TERMS}>Terms & Conditions</a></li>
            </ul>
          </nav>

          {/* Column 4: Newsletter */}
          <div className="footer-col footer-col-newsletter">
            <h3 className="footer-newsletter-title">Subscribe & Get 20% Off</h3>
            <p className="footer-newsletter-sub">
              Sign up for our weekly newsletter to receive exclusive grocery deals, seasonal recipes, and special discounts directly in your inbox.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                className="footer-newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address for newsletter subscription"
                required
              />
              <button type="submit" className="footer-newsletter-btn" aria-label="Submit newsletter subscription">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026, Grocery Sathi, Powered by WorkDo.io
          </div>

          {/* Payment Badges (Semantic Presentation) */}
          <div className="footer-payment-icons" aria-label="Accepted secure payment methods">
            <span className="footer-payment-badge visa" title="Visa">VISA</span>
            <span className="footer-payment-badge mastercard" title="Mastercard">
              <span className="mc-circle mc-red"></span>
              <span className="mc-circle mc-yellow"></span>
            </span>
            <span className="footer-payment-badge amex" title="American Express">
              <span className="amex-line">AM</span>
              <span className="amex-line">EX</span>
            </span>
            <span className="footer-payment-badge paypal" title="PayPal">
              <i>P</i>
            </span>
            <span className="footer-payment-badge diners" title="Diners Club">
              <span className="diners-circle"></span>
            </span>
            <span className="footer-payment-badge discover" title="Discover">DISCOVER</span>
          </div>

          {/* Footer Legal Links */}
          <div className="footer-legal-links">
            <a href={FOOTER_PATHS.PRIVACY}>Privacy Policy</a>
            <a href={FOOTER_PATHS.TERMS}>Terms & Conditions</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
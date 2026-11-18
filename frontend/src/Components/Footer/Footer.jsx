import React from 'react';
import { Phone, ArrowUpRight } from 'lucide-react';
import './Footer.css';

const PHONE_DISPLAY = '+91 98878 68746';
const PHONE_TEL = '+919887868746';
const WHATSAPP_LINK = 'https://wa.me/919887868746';

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

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
      <div className="footer-container">
        {/* TOP SECTION */}
        <div className="footer-top">
          {/* Column 1: Brand + Contact */}
          <div
            className="footer-col footer-col-brand"
            itemScope
            itemType="https://schema.org/Organization"
          >
            <meta itemProp="name" content="Grocery Sathi" />
            <meta itemProp="url" content="https://www.grocerysathi.com" />
            <meta itemProp="telephone" content={PHONE_TEL} />

            <h2 className="footer-logo" itemProp="alternateName">Grocery Sathi</h2>
            <p className="footer-description" itemProp="description">
              Your trusted online supermarket for farm-fresh vegetables, juicy fruits, bakery
              essentials, and daily household supplies delivered straight to your doorstep.
            </p>

            <div className="footer-contact">
              <a
                href={`tel:${PHONE_TEL}`}
                className="footer-contact-btn footer-contact-call"
                aria-label={`Call Grocery Sathi at ${PHONE_DISPLAY}`}
              >
                <span className="footer-contact-icon"><Phone size={18} /></span>
                <span className="footer-contact-text">
                  <small>Call Us</small>
                  <strong>{PHONE_DISPLAY}</strong>
                </span>
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-btn footer-contact-whatsapp"
                aria-label={`Chat with Grocery Sathi on WhatsApp at ${PHONE_DISPLAY}`}
              >
                <span className="footer-contact-icon"><WhatsAppIcon /></span>
                <span className="footer-contact-text">
                  <small>WhatsApp</small>
                  <strong>{PHONE_DISPLAY}</strong>
                </span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
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

          {/* Column 3: Customer Care */}
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
        </div>

        {/* BOTTOM SECTION */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 Grocery Sathi. All rights reserved.
          </div>

          {/* Payment Badges */}
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

          {/* Legal Links */}
          <div className="footer-legal-links">
            <a href={FOOTER_PATHS.PRIVACY}>Privacy Policy</a>
            <a href={FOOTER_PATHS.TERMS}>Terms & Conditions</a>
          </div>
        </div>

        {/* CREDIT LINE */}
        <div className="footer-credit">
          Powered by{' '}
          <a
            href="https://prwebstock.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-powered-link"
          >
            PR WEBSTOCK <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
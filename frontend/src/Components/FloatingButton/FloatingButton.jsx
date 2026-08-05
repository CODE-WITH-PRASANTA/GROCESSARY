import React, { useState, useEffect } from "react";
import "./FloatingButton.css";
import { FaWhatsapp, FaPhoneAlt, FaArrowUp } from "react-icons/fa";

const FloatingButton = () => {
  const [showTop, setShowTop] = useState(false);

  // Clean formatted phone number configuration
  const rawNumber = "919887868746";
  const displayPhone = "+91 98878 68746";

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* SEO Structured Data for Quick Customer Service Access */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Grocery Sathi",
          "telephone": displayPhone,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": displayPhone,
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
          }
        })}
      </script>

      <nav className="FloatingButton" aria-label="Quick Contact & Page Navigation">
        {/* CALL BUTTON */}
        <a
          href={`tel:+${rawNumber}`}
          className="FloatingButton-call"
          aria-label={`Call Grocery Sathi customer support at ${displayPhone}`}
        >
          <FaPhoneAlt aria-hidden="true" />
        </a>

        {/* WHATSAPP BUTTON */}
        <a
          href={`https://wa.me/${rawNumber}?text=${encodeURIComponent('Hi Grocery Sathi, I want to place an order or inquire about fresh groceries.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="FloatingButton-whatsapp"
          aria-label="Chat with Grocery Sathi on WhatsApp"
        >
          <FaWhatsapp aria-hidden="true" />
        </a>

        {/* SCROLL TO TOP BUTTON */}
        {showTop && (
          <button
            type="button"
            className="FloatingButton-top"
            onClick={scrollToTop}
            aria-label="Scroll back to top of page"
          >
            <FaArrowUp aria-hidden="true" />
          </button>
        )}
      </nav>
    </>
  );
};

export default FloatingButton;
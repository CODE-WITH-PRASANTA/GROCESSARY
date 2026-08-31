import React, { useState, useEffect } from "react";

import "./FloatingButton.css";

import {
  FaWhatsapp,
  FaPhoneAlt,
  FaArrowUp,
} from "react-icons/fa";

const FloatingButton = () => {
  const [showTop, setShowTop] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const rawNumber = "919887868746";
  const displayPhone = "+91 98878 68746";

  // ======================================================
  // SCROLL + CART STATE
  // ======================================================

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };

    const checkCartState = () => {
      setCartOpen(
        document.body.classList.contains(
          "cart-is-open"
        )
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    // Check immediately
    checkCartState();

    // Watch body class changes
    const observer =
      new MutationObserver(
        checkCartState
      );

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      observer.disconnect();
    };
  }, []);

  // ======================================================
  // SCROLL TO TOP
  // ======================================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context":
            "https://schema.org",
          "@type":
            "Organization",
          name: "Grocery Sathi",
          telephone: displayPhone,
          contactPoint: {
            "@type":
              "ContactPoint",
            telephone:
              displayPhone,
            contactType:
              "customer service",
            areaServed: "IN",
            availableLanguage: [
              "English",
              "Hindi",
            ],
          },
        })}
      </script>

      <nav
        className="FloatingButton"
        aria-label="Quick Contact & Page Navigation"
      >
        {/* CALL BUTTON */}

        {!cartOpen && (
          <a
            href={`tel:+${rawNumber}`}
            className="FloatingButton-call"
            aria-label={`Call Grocery Sathi customer support at ${displayPhone}`}
          >
            <FaPhoneAlt aria-hidden="true" />
          </a>
        )}

        {/* WHATSAPP BUTTON */}

        {!cartOpen && (
          <a
            href={`https://wa.me/${rawNumber}?text=${encodeURIComponent(
              "Hi Grocery Sathi, I want to place an order or inquire about fresh groceries."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="FloatingButton-whatsapp"
            aria-label="Chat with Grocery Sathi on WhatsApp"
          >
            <FaWhatsapp aria-hidden="true" />
          </a>
        )}

        {/* SCROLL TO TOP */}

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
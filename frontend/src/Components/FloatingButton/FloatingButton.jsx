import React, { useState, useEffect } from "react";
import "./FloatingButton.css";

import { FaWhatsapp, FaPhoneAlt, FaArrowUp } from "react-icons/fa";

const FloatingButton = () => {
  const [showTop, setShowTop] = useState(false);

  // Your phone number
  const phoneNumber = "91 9887868746";

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
    <div className="FloatingButton">
      {/* CALL BUTTON */}
      <a
        href={`tel:+${phoneNumber}`}
        className="FloatingButton-call"
        aria-label="Call Us"
      >
        <FaPhoneAlt />
      </a>

      {/* WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="FloatingButton-whatsapp"
        aria-label="WhatsApp Us"
      >
        <FaWhatsapp />
      </a>

      {/* SCROLL TO TOP BUTTON */}
      {showTop && (
        <button
          className="FloatingButton-top"
          onClick={scrollToTop}
          aria-label="Scroll to Top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default FloatingButton;
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

import { 
  FaPhoneAlt, 
  FaFileUpload, 
  FaReceipt, 
  FaClock, 
  FaTruck,
  FaPercentage,
  FaLeaf,
  FaStore
} from 'react-icons/fa';

import bgImage from '../../assets/grocory-bg.png';
import './MobileSection.css';
import DeliveryTime from "../DeliveryTime/DeliveryTime";
import ListUpload from "../ListUpload/ListUpload";
import MyOrders from '../MyOrders/MyOrders';

const MobileSection = () => {
  const navigate = useNavigate();
  const [isDeliveryTimeOpen, setIsDeliveryTimeOpen] = useState(false);
  const [isListUploadOpen, setIsListUploadOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false); // Added state for My Orders popup

  // Mouse Parallax Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for card rotation based on cursor location
  const mouseX = useSpring(x, { stiffness: 220, damping: 18 });
  const mouseY = useSpring(y, { stiffness: 220, damping: 18 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const currentX = (e.clientX / innerWidth) - 0.5;
    const currentY = (e.clientY / innerHeight) - 0.5;
    x.set(currentX);
    y.set(currentY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Banner Slides for Inner Card
  const banners = [
    { tag: "25% OFF", title: "TODAY'S SPECIAL!", sub: "25% OFF Fresh Fruits & Veg!" },
    { tag: "FREE SHIP", title: "EXPRESS DELIVERY", sub: "Under 30 Minutes Guaranteed" },
    { tag: "CASHBACK", title: "SUPER SAVINGS", sub: "Get 10% Cashback on First Order" }
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section 
      className="MobileSection-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Grocery Sathi Mobile App and Services Overview"
    >
      {/* Background Image Layer with SEO-friendly fallback styling */}
      <div 
        className="MobileSection-bg-gradient" 
        style={{ backgroundImage: `url(${bgImage})` }}
        role="img"
        aria-label="Fresh organic groceries background"
      />
      <div className="MobileSection-bg-noise" />
      <div className="MobileSection-bg-glow-1" />
      <div className="MobileSection-bg-glow-2" />

      {/* Floating Ambient Particles */}
      <div className="MobileSection-particles-container" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="MobileSection-particle"
            style={{
              top: `${20 + i * 12}%`,
              left: `${15 + i * 14}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Floating Leaves */}
      <motion.div 
        className="MobileSection-floating-leaf"
        style={{ top: '15%', left: '8%' }}
        animate={{
          rotate: [-20, 20, -20],
          y: [0, -15, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <FaLeaf />
      </motion.div>

      <motion.div 
        className="MobileSection-floating-leaf"
        style={{ bottom: '20%', right: '38%' }}
        animate={{
          rotate: [15, -15, 15],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden="true"
      >
        <FaLeaf style={{ color: '#81c784' }} />
      </motion.div>

      {/* Hero Content Grid */}
      <div className="MobileSection-container">
        
        {/* LEFT COLUMN - SEO Optimized Copy & Structured Hierarchy */}
        <div className="MobileSection-left">
          <span className="MobileSection-badge">
            Har Ghar Ka Saathi
          </span>

          <h1 className="MobileSection-title">
            Your Trusted Daily <span>Online Grocery Partner</span>
          </h1>

          <p className="MobileSection-description">
            Experience farm-fresh vegetables, organic fruits, and daily household essentials delivered straight to your doorstep. Best prices, guaranteed quality, and lightning-fast grocery delivery with Grocery Sathi.
          </p>

          <div className="MobileSection-features">
            <article className="MobileSection-feature-card">
              <FaTruck className="MobileSection-feature-icon" aria-hidden="true" />
              <div className="MobileSection-feature-text">
                <h3>Fast Delivery</h3>
                <p>On-Time Doorstep Delivery</p>
              </div>
            </article>
            <article className="MobileSection-feature-card">
              <FaPercentage className="MobileSection-feature-icon" aria-hidden="true" />
              <div className="MobileSection-feature-text">
                <h3>Best Offers</h3>
                <p>Great Daily Discounts</p>
              </div>
            </article>
          </div>
        </div>

        {/* CENTER COLUMN (3D FLOATING INTERACTIVE CARD) */}
        <div className="MobileSection-center">
          <motion.div 
            className="MobileSection-main-card"
            style={{
              rotateX,
              rotateY,
            }}
            initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: 30 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            {/* Banner Slider Inside Card */}
            <div className="MobileSection-banner-slider" aria-live="polite">
              <span className="MobileSection-banner-tag">{banners[currentBanner].tag}</span>
              <p className="MobileSection-banner-title">{banners[currentBanner].title}</p>
              <p className="MobileSection-banner-sub">{banners[currentBanner].sub}</p>
            </div>

            <div className="MobileSection-card-header">
              <FaStore aria-hidden="true" /> Grocery <span>Sathi</span>
            </div>

            {/* 3D Interactive Stack Buttons */}
            <nav className="MobileSection-buttons-stack" aria-label="Quick Actions">
              
              {/* Call Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.a 
                  href="tel:+911234567890"
                  className="MobileSection-btn-3d btn-call"
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  aria-label="Call Grocery Sathi Helpline"
                >
                  <div className="MobileSection-btn-bottom" aria-hidden="true" />
                  <div className="MobileSection-btn-middle" aria-hidden="true" />
                  <div className="MobileSection-btn-top">
                    <motion.div 
                      className="MobileSection-btn-icon"
                      animate={{ rotate: [-12, 12, -12] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <FaPhoneAlt />
                    </motion.div>
                    <span>Call Now</span>
                    <div className="MobileSection-shine" aria-hidden="true" />
                  </div>
                </motion.a>
              </motion.div>

              {/* List Upload Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <motion.button 
                  className="MobileSection-btn-3d btn-list"
                  onClick={() => setIsListUploadOpen(true)}
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  aria-label="Upload your grocery list"
                >
                  <div className="MobileSection-btn-bottom" aria-hidden="true" />
                  <div className="MobileSection-btn-middle" aria-hidden="true" />
                  <div className="MobileSection-btn-top">
                    <motion.div 
                      className="MobileSection-btn-icon"
                      animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaFileUpload />
                    </motion.div>
                    <span>List Upload</span>
                    <div className="MobileSection-shine" aria-hidden="true" />
                  </div>
                </motion.button>
              </motion.div>

              {/* My Orders Button - Connected to popup state */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
               <motion.button
                  className="MobileSection-btn-3d btn-orders"
                  onClick={() => setIsMyOrdersOpen(true)}
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  aria-label="View your grocery orders"
                >
                  <div className="MobileSection-btn-bottom" aria-hidden="true" />
                  <div className="MobileSection-btn-middle" aria-hidden="true" />
                  <div className="MobileSection-btn-top">
                    <motion.div
                      className="MobileSection-btn-icon"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
                    >
                      <FaReceipt />
                    </motion.div>

                    <span>My Orders</span>
                    <motion.div
                      className="MobileSection-shine"
                      animate={{ x: ['-250%', '250%'] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                    />
                    <div className="MobileSection-shine" aria-hidden="true" />
                  </div>
                </motion.button>
              </motion.div>

              {/* Delivery Time Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              >
                <motion.button 
                  className="MobileSection-btn-3d btn-delivery"
                  onClick={() => setIsDeliveryTimeOpen(true)}
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  aria-label="Check estimated delivery time"
                >
                  <div className="MobileSection-btn-bottom" aria-hidden="true" />
                  <div className="MobileSection-btn-middle" aria-hidden="true" />
                  <div className="MobileSection-btn-top">
                    <motion.div 
                      className="MobileSection-btn-icon"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <FaClock />
                    </motion.div>
                    <span>DELIVERY TIME</span>
                    <div className="MobileSection-shine" aria-hidden="true" />
                  </div>
                </motion.button>
              </motion.div>

            </nav>

            <div className="MobileSection-helpline">
              <span>HELP LINE NO.</span>
              <a href="tel:+911234567890"><h3>+91 1234567890</h3></a>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (3D PHONE MOCKUP & GRAPHICS) */}
        <div className="MobileSection-right" aria-hidden="true">
          <motion.div 
            className="MobileSection-phone-wrapper"
            initial={{ opacity: 0, x: 100 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -20, 0],
              rotate: [-8, -5, -8]
            }}
            transition={{ 
              x: { duration: 1, delay: 0.6 },
              opacity: { duration: 1, delay: 0.6 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="MobileSection-phone-notch" />
            
            <div className="MobileSection-phone-screen">
              <div className="MobileSection-phone-mini-banner">
                <p style={{ margin: 0 }}>TODAY'S SPECIAL</p>
                <h4 style={{ margin: 0 }}>25% OFF Fresh Items</h4>
              </div>

              <div className="MobileSection-phone-mini-btn phone-btn-1">
                <FaPhoneAlt /> Call Now
              </div>
              <div 
                className="MobileSection-phone-mini-btn phone-btn-2"
                onClick={() => setIsListUploadOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <FaFileUpload /> List Upload
              </div>
              <div className="MobileSection-phone-mini-btn phone-btn-3" onClick={() => setIsMyOrdersOpen(true)} style={{ cursor: "pointer" }}>
                <FaReceipt /> My Orders
              </div>
              <div
                className="MobileSection-phone-mini-btn phone-btn-4"
                onClick={() => setIsDeliveryTimeOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <FaClock /> Delivery Time
              </div>
            </div>
          </motion.div>

          {/* Floating Fruit Highlights */}
          <motion.div 
            className="MobileSection-fruit fruit-1"
            animate={{ rotate: [0, 15, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🍎
          </motion.div>

          <motion.div 
            className="MobileSection-fruit fruit-2"
            animate={{ rotate: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            🥦
          </motion.div>

          <motion.div 
            className="MobileSection-fruit fruit-3"
            animate={{ rotate: [0, 10, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            🍊
          </motion.div>
        </div>

      </div>

      {/* Modals */}
      {isDeliveryTimeOpen && (
        <DeliveryTime
          onClose={() => setIsDeliveryTimeOpen(false)}
        />
      )}

      {isListUploadOpen && (
        <ListUpload
          onClose={() => setIsListUploadOpen(false)}
        />
      )}

      {isMyOrdersOpen && (
        <MyOrders
          onClose={() => setIsMyOrdersOpen(false)}
        />
      )}
    </section>
  );
};

export default MobileSection;
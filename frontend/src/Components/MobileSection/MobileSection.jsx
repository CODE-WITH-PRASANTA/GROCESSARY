import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

import { 
  FaPhoneAlt, 
  FaFileUpload, 
  FaReceipt, 
  FaClock, 
  FaShoppingCart, 
  FaStore,
  FaArrowRight,
  FaLeaf,
  FaPercentage,
  FaTruck
} from 'react-icons/fa';

import bgImage from '../../assets/grocory-bg.png'; // Path to your background image
import './MobileSection.css';
import DeliveryTime from "../DeliveryTime/DeliveryTime";
import ListUpload from "../ListUpload/ListUpload"; // Make sure path matches your project structure

const MobileSection = () => {
  const navigate = useNavigate();
  const [isDeliveryTimeOpen, setIsDeliveryTimeOpen] = useState(false);
  const [isListUploadOpen, setIsListUploadOpen] = useState(false);

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
    <div 
      className="MobileSection-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image Layer */}
      <div 
        className="MobileSection-bg-gradient" 
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="MobileSection-bg-noise" />
      <div className="MobileSection-bg-glow-1" />
      <div className="MobileSection-bg-glow-2" />

      {/* Floating Ambient Particles */}
      <div className="MobileSection-particles-container">
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
      >
        <FaLeaf style={{ color: '#81c784' }} />
      </motion.div>

      {/* Hero Content Grid */}
      <div className="MobileSection-container">
        
        {/* LEFT COLUMN */}
        <div className="MobileSection-left">
          <motion.span 
            className="MobileSection-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Har Ghar Ka Saathi
          </motion.span>

          <motion.h1 
            className="MobileSection-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Daily <span>Grocery Partner</span>
          </motion.h1>

          <motion.p 
            className="MobileSection-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Fresh Products. Best Prices. Fast Delivery. Grocery Sathi brings everything you need right to your doorstep!
          </motion.p>

          <div className="MobileSection-features">
            <div className="MobileSection-feature-card">
              <FaTruck className="MobileSection-feature-icon" />
              <div className="MobileSection-feature-text">
                <h4>Fast Delivery</h4>
                <p>On-Time Delivery</p>
              </div>
            </div>
            <div className="MobileSection-feature-card">
              <FaPercentage className="MobileSection-feature-icon" />
              <div className="MobileSection-feature-text">
                <h4>Best Offers</h4>
                <p>Great Discounts</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (3D FLOATING MAIN CARD) */}
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
            <div className="MobileSection-banner-slider">
              <span className="MobileSection-banner-tag">{banners[currentBanner].tag}</span>
              <p className="MobileSection-banner-title">{banners[currentBanner].title}</p>
              <p className="MobileSection-banner-sub">{banners[currentBanner].sub}</p>
            </div>

            <div className="MobileSection-card-header">
              <FaStore /> Grocery <span>Sathi</span>
            </div>

            {/* 3D Interactive Stack Buttons */}
            <div className="MobileSection-buttons-stack">
              
              {/* Call Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.button 
                  className="MobileSection-btn-3d btn-call"
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="MobileSection-btn-bottom" />
                  <div className="MobileSection-btn-middle" />
                  <div className="MobileSection-btn-top">
                    <motion.div 
                      className="MobileSection-btn-icon"
                      animate={{ rotate: [-12, 12, -12] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <FaPhoneAlt />
                    </motion.div>
                    <span>Call Now</span>
                    <motion.div 
                      className="MobileSection-shine"
                      animate={{ x: ['-250%', '250%'] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                </motion.button>
              </motion.div>

              {/* List Upload Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <motion.button 
                  className="MobileSection-btn-3d btn-list"
                  onClick={() => setIsListUploadOpen(true)}
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="MobileSection-btn-bottom" />
                  <div className="MobileSection-btn-middle" />
                  <div className="MobileSection-btn-top">
                    <motion.div 
                      className="MobileSection-btn-icon"
                      animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaFileUpload />
                    </motion.div>
                    <span>List Upload</span>
                    <motion.div 
                      className="MobileSection-shine"
                      animate={{ x: ['-250%', '250%'] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                </motion.button>
              </motion.div>

              {/* My Orders Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
               <motion.button
                  className="MobileSection-btn-3d btn-orders"
                  onClick={() => navigate("/myorders")}
                  whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                  whileTap={{ y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="MobileSection-btn-bottom" />
                  <div className="MobileSection-btn-middle" />
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
                  </div>
                </motion.button>
              </motion.div>

              {/* Delivery Time Button */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
               <motion.button
                 className="MobileSection-btn-3d btn-delivery"
                 whileHover={{ y: -12, rotateX: 15, scale: 1.05 }}
                 whileTap={{ y: 8, scale: 0.96 }}
                 transition={{ type: "spring", stiffness: 300, damping: 15 }}
                 onClick={() => setIsDeliveryTimeOpen(true)}
                >
                  <div className="MobileSection-btn-bottom" />
                  <div className="MobileSection-btn-middle" />
                  <div className="MobileSection-btn-top">
                    <motion.div 
                      className="MobileSection-btn-icon"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <FaClock />
                    </motion.div>
                    <span>DELIVERY TIME</span>
                    <motion.div 
                      className="MobileSection-shine"
                      animate={{ x: ['-250%', '250%'] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                    />
                  </div>
                </motion.button>
              </motion.div>

            </div>

            <div className="MobileSection-helpline">
              <span>HELP LINE NO.</span>
              <h3>+91 1234567890</h3>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (3D PHONE MOCKUP & GROCERY) */}
        <div className="MobileSection-right">
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
              <div className="MobileSection-phone-mini-btn phone-btn-3">
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
    </div>
  );
};

export default MobileSection;
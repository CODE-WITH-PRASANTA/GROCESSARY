import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingBag, 
  FaTimes, 
  FaBox, 
  FaShieldAlt, 
  FaPaperPlane, 
  FaPhoneAlt, 
  FaCopy, 
  FaCheckCircle, 
  FaSpinner, 
  FaTruck, 
  FaHome, 
  FaClock 
} from 'react-icons/fa';
import './MyOrders.css';

const MyOrders = () => {
  const [orderId, setOrderId] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      setShowStatus(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId || 'GS1234567890');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="MyOrders-wrapper">
      <div className="MyOrders-container">
        
        {/* Track My Order Card */}
        <div className="MyOrders-card MyOrders-track-card">
          <button className="MyOrders-close-btn" aria-label="Close">
            <FaTimes />
          </button>

          <div className="MyOrders-header-icon">
            <FaShoppingBag />
          </div>

          <h2 className="MyOrders-title">Track My Order</h2>
          <p className="MyOrders-subtitle">Enter your Order ID to check real-time status</p>

          <div className="MyOrders-illustration">
            {/* Delivery Scooter Illustration Mock */}
            <div className="MyOrders-scooter-scene">
              <div className="MyOrders-sun-spot" />
              <div className="MyOrders-scooter-icon-wrap">
                <FaTruck className="MyOrders-scooter-icon" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="MyOrders-form">
            <div className="MyOrders-input-group">
              <label htmlFor="orderIdInput">Order ID</label>
              <div className="MyOrders-input-wrapper">
                <FaBox className="MyOrders-input-prefix-icon" />
                <input 
                  id="orderIdInput"
                  type="text" 
                  placeholder="Enter your Order ID" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="MyOrders-security-note">
              <FaShieldAlt className="MyOrders-security-icon" />
              <span>Your order details will be secured and private</span>
            </div>

            <motion.button 
              type="submit" 
              className="MyOrders-submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPaperPlane />
              <span>Submit</span>
            </motion.button>
          </form>

          <div className="MyOrders-help-footer">
            <span>Need help? Call us on</span>
            <a href="tel:+9111234567890" className="MyOrders-phone-link">
              <FaPhoneAlt /> +9111234567890
            </a>
          </div>
        </div>

        {/* Order Status Popup / Card */}
        <AnimatePresence>
          {showStatus && (
            <motion.div 
              className="MyOrders-status-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="MyOrders-card MyOrders-status-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <button 
                  className="MyOrders-close-btn" 
                  onClick={() => setShowStatus(false)}
                  aria-label="Close Status"
                >
                  <FaTimes />
                </button>

                <div className="MyOrders-header-icon success-icon">
                  <FaCheckCircle />
                </div>

                <h2 className="MyOrders-title">Order Status</h2>
                <p className="MyOrders-subtitle">Here is the latest update for your order</p>

                <div className="MyOrders-id-display-box">
                  <div className="MyOrders-id-info">
                    <span className="MyOrders-id-label">Order ID</span>
                    <span className="MyOrders-id-value">{orderId || 'GS1234567890'}</span>
                  </div>
                  <button className="MyOrders-copy-btn" onClick={handleCopy} title="Copy Order ID">
                    {copied ? <FaCheckCircle style={{ color: '#2e7d32' }} /> : <FaCopy />}
                  </button>
                </div>

                <div className="MyOrders-timeline">
                  {/* Step 1 */}
                  <div className="MyOrders-timeline-item completed">
                    <div className="MyOrders-timeline-icon-wrap">
                      <FaCheckCircle />
                    </div>
                    <div className="MyOrders-timeline-content">
                      <h4>Order Placed</h4>
                      <p>Your order has been placed successfully</p>
                      <span className="MyOrders-time">10 May 2025, 10:30 AM</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="MyOrders-timeline-item completed">
                    <div className="MyOrders-timeline-icon-wrap">
                      <FaCheckCircle />
                    </div>
                    <div className="MyOrders-timeline-content">
                      <h4>Confirmed</h4>
                      <p>Your order has been confirmed</p>
                      <span className="MyOrders-time">10 May 2025, 10:32 AM</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="MyOrders-timeline-item active">
                    <div className="MyOrders-timeline-icon-wrap">
                      <FaSpinner className="spin-anim" />
                    </div>
                    <div className="MyOrders-timeline-content">
                      <h4 className="active-text">Processing</h4>
                      <p>We are preparing your items</p>
                      <span className="MyOrders-time">10 May 2025, 11:15 AM</span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="MyOrders-timeline-item pending">
                    <div className="MyOrders-timeline-icon-wrap">
                      <FaTruck />
                    </div>
                    <div className="MyOrders-timeline-content">
                      <h4>Out for Delivery</h4>
                      <p>Your order is on the way</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="MyOrders-timeline-item pending last">
                    <div className="MyOrders-timeline-icon-wrap">
                      <FaHome />
                    </div>
                    <div className="MyOrders-timeline-content">
                      <h4>Delivered</h4>
                      <p>Your order has been delivered</p>
                    </div>
                  </div>
                </div>

                <div className="MyOrders-estimated-box">
                  <FaClock className="MyOrders-est-icon" />
                  <div className="MyOrders-est-text">
                    <span className="MyOrders-est-label">Estimated Delivery</span>
                    <span className="MyOrders-est-value">Today, 10 May 2025 by 12:30 PM</span>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MyOrders;
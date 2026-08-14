import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeBack.css';

// --- IMAGE IMPORTS ---
import bannerImg from '../../assets/g1.png'; 
import riceImg from '../../assets/bas.png'; 
import oilImg from '../../assets/fortune.png'; 
import milkImg from '../../assets/amul.png'; 

// --- SAMPLE DATA ---
const ALL_RECENT_ORDERS = [
  { id: 1, name: 'Daawat Basmati Rice 1kg', image: riceImg, price: '₹120.00', qty: '1 Qty', date: '12 May 2025' },
  { id: 2, name: 'Fortune Sunflower Oil 1L', image: oilImg, price: '₹135.00', qty: '1 Qty', date: '10 May 2025' },
  { id: 3, name: 'Amul Taaza Milk 1L', image: milkImg, price: '₹56.00', qty: '2 Qty', date: '08 May 2025' },
  { id: 4, name: 'Sample Extra Item 1', image: riceImg, price: '₹150.00', qty: '1 Qty', date: '07 May 2025' },
  { id: 5, name: 'Sample Extra Item 2', image: oilImg, price: '₹200.00', qty: '3 Qty', date: '06 May 2025' },
  { id: 6, name: 'Sample Extra Item 3', image: milkImg, price: '₹68.00', qty: '1 Qty', date: '05 May 2025' },
];

const WelcomeBack = () => {
  const [showAllOrders, setShowAllOrders] = useState(false);
  const navigate = useNavigate();

  // Determine which orders to display
  const displayedOrders = showAllOrders ? ALL_RECENT_ORDERS : ALL_RECENT_ORDERS.slice(0, 3);

  const toggleOrders = () => {
    setShowAllOrders(!showAllOrders);
  };

  const handleShopNow = () => {
    navigate('/shop');
  };

  return (
    <div className="wb-container">
      {/* --- Header --- */}
      <header className="wb-header">
        <h1 className="wb-title">Welcome back, Jagan! <span className="wb-wave">👋</span></h1>
        <p className="wb-subtitle">Here's what's happening with your account today.</p>
      </header>

      {/* --- Stat Cards --- */}
      <div className="wb-stats-grid">
        {/* Total Orders */}
        <div className="wb-stat-card wb-total-orders">
          <div className="wb-icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 13.5H19.5V16.5H16.5V13.5Z" fill="#16A34A"/>
              <path d="M7.5 13.5H10.5V16.5H7.5V13.5Z" fill="#16A34A"/>
              <path d="M7.5 19.5H10.5V22.5H7.5V19.5Z" fill="#16A34A"/>
              <path d="M16.5 19.5H19.5V22.5H16.5V19.5Z" fill="#16A34A"/>
              <path d="M12 3L21 6V21H3V6L12 3ZM12 5.51L5 7.84V19H19V7.84L12 5.51Z" fill="#16A34A"/>
              <path d="M12 8.25C13.2426 8.25 14.25 7.24264 14.25 6C14.25 4.75736 13.2426 3.75 12 3.75C10.7574 3.75 9.75 4.75736 9.75 6C9.75 7.24264 10.7574 8.25 12 8.25Z" fill="#16A34A"/>
            </svg>
          </div>
          <div className="wb-stat-info">
            <span className="wb-stat-label">Total Orders</span>
            <span className="wb-stat-value">24</span>
            <a href="/orders" className="wb-stat-link">View all orders <span>&rarr;</span></a>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="wb-stat-card wb-wallet-balance">
          <div className="wb-icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7.28V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16.17C16.44 3 16.69 3.11 16.88 3.29L20.71 7.12C20.89 7.31 21 7.56 21 7.83V7.28ZM5 5V19H19V8.67L15.33 5H5Z" fill="#16A34A"/>
              <path d="M12 11V16H10V11H12Z" fill="#16A34A"/>
              <path d="M16 11V16H14V11H16Z" fill="#16A34A"/>
              <path d="M17 17H7V19H17V17Z" fill="#16A34A"/>
            </svg>
          </div>
          <div className="wb-stat-info">
            <span className="wb-stat-label">Wallet Balance</span>
            <span className="wb-stat-value">₹1,250.00</span>
            <a href="/wallet" className="wb-stat-link">Add money <span>&rarr;</span></a>
          </div>
        </div>

        {/* Available Coupons */}
        <div className="wb-stat-card wb-available-coupons">
          <div className="wb-icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.65 1.65L1.65 12.65L12.65 23.65L23.65 12.65L12.65 1.65ZM12.65 20.82L4.48 12.65L12.65 4.48L20.82 12.65L12.65 20.82Z" fill="#FF8A00"/>
              <path d="M12.65 10.65H14.65V14.65H12.65V10.65Z" fill="#FF8A00"/>
              <path d="M9.65 12.15C10.4784 12.15 11.15 11.4784 11.15 10.65C11.15 9.82157 10.4784 9.15 9.65 9.15C8.82157 9.15 8.15 9.82157 8.15 10.65C8.15 11.4784 8.82157 12.15 9.65 12.15Z" fill="#FF8A00"/>
              <path d="M15.65 12.15C16.4784 12.15 17.15 11.4784 17.15 10.65C17.15 9.82157 16.4784 9.15 15.65 9.15C14.8216 9.15 14.15 9.82157 14.15 10.65C14.15 11.4784 14.8216 12.15 15.65 12.15Z" fill="#FF8A00"/>
            </svg>
          </div>
          <div className="wb-stat-info">
            <span className="wb-stat-label">Available Coupons</span>
            <span className="wb-stat-value">08</span>
            <a href="/coupons" className="wb-stat-link">View coupons <span>&rarr;</span></a>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="wb-stat-card wb-wishlist-items">
          <div className="wb-icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#7C3AED"/>
            </svg>
          </div>
          <div className="wb-stat-info">
            <span className="wb-stat-label">Wishlist Items</span>
            <span className="wb-stat-value">15</span>
            <a href="/wishlist" className="wb-stat-link">View wishlist <span>&rarr;</span></a>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="wb-content-grid">
        {/* Left Side: Banner Section */}
        <section className="wb-banner-section">
          <img src={bannerImg} alt="Fresh groceries in a paper bag" className="wb-banner-image" />
          <div className="wb-banner-overlay">
            <h2 className="wb-banner-title">Fresh Groceries<br />Delivered to Your Home</h2>
            <p className="wb-banner-text">Get the best quality products at your doorstep with fast delivery.</p>
            
            <button className="wb-banner-button" onClick={handleShopNow}>
              Shop Now
            </button>
          </div>
        </section>

        {/* Right Side: Recent Orders Section */}
        <section className="wb-recent-orders-section">
          <div className="wb-recent-orders-header">
            <h3 className="wb-recent-orders-title">Recent Order</h3>
            <button className="wb-view-all-button" onClick={toggleOrders}>
              {showAllOrders ? 'Show Less' : 'View All'} <span>&rarr;</span>
            </button>
          </div>

          <ul className={`wb-recent-orders-list ${showAllOrders ? 'scrollable' : ''}`}>
            {displayedOrders.map((order) => (
              <li key={order.id} className="wb-order-item">
                <div className="wb-order-image-container">
                  <img src={order.image} alt={order.name} />
                </div>
                <div className="wb-order-details">
                  <span className="wb-order-name">{order.name}</span>
                  <span className="wb-order-meta">{order.price} • {order.qty}</span>
                </div>
                <div className="wb-order-status">
                  <span className="wb-status-text">Delivered</span>
                  <span className="wb-date-text">{order.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default WelcomeBack;
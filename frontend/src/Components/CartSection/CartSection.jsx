import React, { useState } from 'react';
import './CartSection.css';

// --- IMPORT YOUR LOCAL IMAGES HERE ---
import avocadoImg from '../../assets/avocadoCart.webp';
import orangeImg from '../../assets/lemoncart.avif';
import grapeImg from "../../assets/garpecart.avif";
import mangoImg from '../../assets/mangocart.avif';

const CartSection = ({ isOpen: externalIsOpen, onClose }) => {
  // Internal state to handle drawer open/close
  const [internalIsOpen, setInternalIsOpen] = useState(true);

  // Determine if the drawer is active
  const isCartOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleCloseCart = () => {
    setInternalIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // --- Cart Items State ---
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Avocado Fresh Fruit',
      price: 640,
      size: '300 Grams',
      quantity: 2,
      image: avocadoImg,
    },
  ]);

  // --- 3 Recommendation Items using your images ---
  const recommendations = [
    {
      id: 101,
      name: 'Sliced Whole Orange',
      price: 400,
      image: orangeImg,
    },
    {
      id: 102,
      name: 'Garden Grape Fruit',
      price: 500,
      image: grapeImg,
    },
    {
      id: 103,
      name: 'Fresh Organic Mango',
      price: 350,
      image: mangoImg,
    },
  ];

  const [activeRecIndex, setActiveRecIndex] = useState(0);

  // --- Cart Handlers ---
  const handleIncrease = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Free shipping progress logic (Target: ₹1000)
  const freeShippingThreshold = 1000;
  const progressPercent = Math.min((subtotalAmount / freeShippingThreshold) * 100, 100);

  return (
    <>
      {/* Re-open button if tested in standalone view */}
      {!isCartOpen && (
        <button 
          className="reopen-cart-btn" 
          onClick={() => setInternalIsOpen(true)}
        >
          🛒 Open Cart
        </button>
      )}

      {/* --- CART DRAWER OVERLAY --- */}
      <div 
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={handleCloseCart}
      >
        <div 
          className={`cart-drawer-container ${isCartOpen ? 'slide-in' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- DRAWER HEADER --- */}
          <div className="cart-header">
            <button 
              type="button" 
              className="cart-close-btn" 
              onClick={handleCloseCart} 
              aria-label="Close Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h2 className="cart-header-title">Your Cart</h2>
          </div>

          {/* --- CART CONTENT CONDITION --- */}
          {cartItems.length === 0 ? (
            /* EMPTY CART VIEW */
            <div className="empty-cart-container">
              <div className="empty-cart-icon-wrap">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm0-3h11.23c.77 0 1.45-.44 1.77-1.12l3.58-6.49A1.003 1.003 0 0 0 22.7 6c-.33-.51-.92-.81-1.53-.81H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z" />
                  <path d="M11 9.5c0-.28.22-.5.5-.5s.5.22.5.5v1c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1zm5 0c0-.28.22-.5.5-.5s.5.22.5.5v1c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1zm-6 4c0 1.1 1.34 2 3 2s3-.9 3-2h-6z" />
                </svg>
              </div>
              <h3 className="empty-cart-title">Your cart is empty</h3>
              <button className="btn-continue-shopping" onClick={handleCloseCart}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Continue shopping
              </button>
            </div>
          ) : (
            /* POPULATED CART VIEW */
            <>
              {/* --- SCROLLABLE BODY --- */}
              <div className="cart-body">
                {/* Animated Free Shipping Bar Section */}
                <div className="shipping-bar-container">
                  <p className="shipping-msg">
                    <strong>Congrats!</strong> You are eligible for <strong>FREE Shipping</strong>
                  </p>
                  
                  <div className="shipping-progress-track">
                    <div 
                      className="shipping-progress-fill animated-stripes" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                    <div 
                      className="shipping-truck-icon-wrap bouncing-truck"
                      style={{ left: `calc(${progressPercent}% - 18px)` }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#102a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="2"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-img-wrap">
                        <img src={item.image} alt={item.name} />
                      </div>
                      
                      <div className="cart-item-details">
                        <div className="cart-item-header-row">
                          <h4 className="cart-item-title">{item.name}</h4>
                          <button 
                            className="cart-item-delete-btn" 
                            onClick={() => handleRemove(item.id)}
                            aria-label="Remove item"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>

                        <p className="cart-item-price">₹{item.price.toFixed(2)} INR</p>
                        <p className="cart-item-size">Size: {item.size}</p>

                        {/* Quantity Selector */}
                        <div className="cart-item-qty-control">
                          <button onClick={() => handleDecrease(item.id)} aria-label="Decrease quantity">-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleIncrease(item.id)} aria-label="Increase quantity">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations / You May Also Like Section */}
                <div className="cart-recommendations-section">
                  <h3 className="recommendations-title">You may also like</h3>

                  <div className="recommendation-card">
                    <div className="rec-img-wrap">
                      <img 
                        src={recommendations[activeRecIndex].image} 
                        alt={recommendations[activeRecIndex].name} 
                      />
                    </div>
                    <div className="rec-details">
                      <h4 className="rec-title">{recommendations[activeRecIndex].name}</h4>
                      <p className="rec-price">₹{recommendations[activeRecIndex].price.toFixed(2)}</p>
                      <a 
                        href="#details" 
                        className="rec-details-link" 
                        onClick={(e) => { e.preventDefault(); alert('Product Details clicked'); }}
                      >
                        Details
                      </a>
                    </div>
                  </div>

                  {/* 3 Dots Navigation */}
                  <div className="carousel-dots">
                    {recommendations.map((_, idx) => (
                      <span
                        key={idx}
                        className={`dot ${activeRecIndex === idx ? 'active' : ''}`}
                        onClick={() => setActiveRecIndex(idx)}
                      ></span>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- DRAWER FOOTER --- */}
              <div className="cart-footer">
                {/* Coupon / Summary Badge Row */}
                <div className="cart-badges-row">
                  <div className="cart-badge-card">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="15" x2="15.01" y2="15"></line>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                  </div>
                  <div className="cart-badge-card">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 12 20 22 4 22 4 12"></polyline>
                      <rect x="2" y="7" width="20" height="5"></rect>
                      <line x1="12" y1="22" x2="12" y2="7"></line>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="cart-totals-row">
                  <div className="total-col">
                    <span className="total-label">Total Item</span>
                    <span className="total-value">{totalItemsCount}</span>
                  </div>
                  <div className="total-col right">
                    <span className="total-label">Subtotal</span>
                    <span className="total-value">₹{subtotalAmount.toFixed(2)} INR</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="cart-action-buttons">
                  <button className="btn-view-cart" onClick={() => alert('Opening View Cart...')}>
                    View Cart
                  </button>
                  <button className="btn-checkout" onClick={() => alert('Opening Checkout...')}>
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSection;
import React, { useState } from 'react';
import './Categories.css';

// High quality image URLs
const IMAGES = {
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=100&q=80',
  staples: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=100&q=80',
  beverages: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?auto=format&fit=crop&w=100&q=80',
  snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=100&q=80',
  personalCare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=100&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=150&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=150&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=150&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=150&q=80',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=150&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=150&q=80',
};

// Spending datasets mapped by timeframe
const SPENDING_DATASETS = {
  'This Month': {
    total: '₹2,850.00',
    change: '18% more than last month',
    points: [
      { date: '1 May', amount: 500 },
      { date: '7 May', amount: 1200 },
      { date: '14 May', amount: 1800 },
      { date: '21 May', amount: 1600 },
      { date: '28 May', amount: 2200 },
      { date: '31 May', amount: 2850 },
    ],
  },
  'Last Month': {
    total: '₹2,410.00',
    change: '5% less than March',
    points: [
      { date: '1 Apr', amount: 400 },
      { date: '7 Apr', amount: 900 },
      { date: '14 Apr', amount: 1500 },
      { date: '21 Apr', amount: 2000 },
      { date: '28 Apr', amount: 2100 },
      { date: '30 Apr', amount: 2410 },
    ],
  },
  'Last 3 Months': {
    total: '₹7,820.00',
    change: '12% increase overall',
    points: [
      { date: 'March', amount: 2560 },
      { date: 'April', amount: 2410 },
      { date: 'May', amount: 2850 },
    ],
  },
};

const Categories = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [cart, setCart] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  const currentDataset = SPENDING_DATASETS[selectedTimeframe];

  // Helper function to map data points to SVG coordinate space
  const svgWidth = 300;
  const svgHeight = 130;
  const maxVal = 3000;

  const pointsCoordinates = currentDataset.points.map((pt, i, arr) => {
    const x = 10 + (i / (arr.length - 1)) * (svgWidth - 20);
    const y = svgHeight - (pt.amount / maxVal) * (svgHeight - 20) - 10;
    return { x, y, ...pt };
  });

  // Generate smooth SVG Bezier Spline path string
  const generateSmoothPath = (pts) => {
    if (!pts.length) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const linePathD = generateSmoothPath(pointsCoordinates);
  const areaPathD = `${linePathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x},${svgHeight} L ${pointsCoordinates[0].x},${svgHeight} Z`;

  // Categories & Recommended static datasets
  const categoriesData = [
    { id: 1, name: 'Fruits & Vegetables', percentage: 45, image: IMAGES.fruits, totalSpent: '₹1,282.50' },
    { id: 2, name: 'Dairy & Bakery', percentage: 30, image: IMAGES.dairy, totalSpent: '₹855.00' },
    { id: 3, name: 'Staples', percentage: 15, image: IMAGES.staples, totalSpent: '₹427.50' },
    { id: 4, name: 'Beverages', percentage: 10, image: IMAGES.beverages, totalSpent: '₹285.00' },
    { id: 5, name: 'Snacks & Branded Foods', percentage: 8, image: IMAGES.snacks, totalSpent: '₹228.00' },
    { id: 6, name: 'Personal Care', percentage: 5, image: IMAGES.personalCare, totalSpent: '₹142.50' },
  ];

  const recommendedItems = [
    { id: 'rec-1', name: 'Apple Royal Gala', unit: '1kg', price: 150.0, image: IMAGES.apple },
    { id: 'rec-2', name: 'Banana', unit: '1 Dozen', price: 60.0, image: IMAGES.banana },
    { id: 'rec-3', name: 'Potato', unit: '1kg', price: 25.0, image: IMAGES.potato },
    { id: 'rec-4', name: 'Tomato', unit: '1kg', price: 30.0, image: IMAGES.tomato },
    { id: 'rec-5', name: 'Onion', unit: '1kg', price: 28.0, image: IMAGES.onion },
    { id: 'rec-6', name: 'Fresh Orange', unit: '1kg', price: 120.0, image: IMAGES.orange },
    { id: 'rec-7', name: 'Whole Wheat Bread', unit: '400g', price: 45.0, image: IMAGES.bread },
    { id: 'rec-8', name: 'Toned Milk', unit: '1 Litre', price: 66.0, image: IMAGES.milk },
  ];

  const handleAddToCart = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="dashboard-container">
      {/* Top Grid Section */}
      <div className="top-grid">
        
        {/* Card 1: Categories You Buy */}
        <div className="dashboard-card categories-card">
          <div className="card-header">
            <h3>Categories You Buy</h3>
            <button className="view-all-btn" onClick={() => setActiveModal('categories')}>
              View All <span className="arrow">→</span>
            </button>
          </div>
          <div className="categories-list">
            {categoriesData.slice(0, 4).map((cat) => (
              <div key={cat.id} className="category-item">
                <div className="category-img-wrapper">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <div className="category-details">
                  <span className="category-name">{cat.name}</span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="category-percentage">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Interactive Live Monthly Spending Chart */}
        <div className="dashboard-card spending-card">
          <div className="card-header">
            <h3>Monthly Spending</h3>
            <select
              className="timeframe-select"
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setHoveredPointIndex(null);
              }}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
            </select>
          </div>

          <div className="spending-summary">
            <h2 className="amount">{currentDataset.total}</h2>
            <div className="spending-badge">
              <span className="up-arrow">↑</span>
              <span>{currentDataset.change}</span>
            </div>
          </div>

          {/* Fully Interactive Live Graph Chart */}
          <div className="chart-wrapper">
            <div className="y-axis">
              <span>₹3k</span>
              <span>₹2k</span>
              <span>₹1k</span>
              <span>₹0</span>
            </div>
            
            <div className="chart-container">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="0" y1="10" x2={svgWidth} y2="10" className="grid-line" />
                <line x1="0" y1="50" x2={svgWidth} y2="50" className="grid-line" />
                <line x1="0" y1="90" x2={svgWidth} y2="90" className="grid-line" />
                <line x1="0" y1="120" x2={svgWidth} y2="120" className="grid-line" />

                {/* Gradient Fill under Line */}
                <path d={areaPathD} fill="url(#chartGradient)" />

                {/* Main Graph Curved Line */}
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="smooth-path"
                />

                {/* Interactive Points with Hover Tooltips */}
                {pointsCoordinates.map((pt, idx) => {
                  const isHovered = hoveredPointIndex === idx;
                  const isLastPoint = idx === pointsCoordinates.length - 1;

                  return (
                    <g key={idx} className="chart-point-group">
                      {/* Vertical Indicator Line on Hover */}
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1="10"
                          x2={pt.x}
                          y2={svgHeight}
                          stroke="#22c55e"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Interactive Hover Circle Trigger */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : isLastPoint ? 4 : 3}
                        className={`chart-circle ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />

                      {/* Custom Tooltip */}
                      {isHovered && (
                        <g transform={`translate(${Math.min(Math.max(pt.x - 35, 0), svgWidth - 70)}, ${Math.max(pt.y - 35, 5)})`}>
                          <rect width="70" height="25" rx="5" fill="#1e293b" opacity="0.9" />
                          <text x="35" y="16" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">
                            ₹{pt.amount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic X-Axis Labels */}
              <div className="x-axis">
                {currentDataset.points.map((pt, idx) => (
                  <span
                    key={idx}
                    className={hoveredPointIndex === idx ? 'active-label' : ''}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    {pt.date}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Exclusive Banner Offers */}
        <div className="dashboard-card exclusive-card">
          <div className="card-header">
            <h3>Exclusive For You</h3>
            <button className="view-all-btn" onClick={() => setActiveModal('offers')}>
              View All <span className="arrow">→</span>
            </button>
          </div>

          <div className="offers-container">
            <div className="offer-banner green-banner">
              <div className="offer-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div className="offer-info">
                <h4>Free Delivery</h4>
                <p>On orders above ₹499</p>
                <button className="offer-action-btn" onClick={() => setActiveModal('shopNow')}>
                  Shop Now
                </button>
              </div>
            </div>

            <div className="offer-banner yellow-banner">
              <div className="offer-icon yellow-icon">
                <span>%</span>
              </div>
              <div className="offer-info">
                <h4>Weekend Special</h4>
                <p>Up to 30% OFF on selected items</p>
                <button className="offer-action-btn" onClick={() => setActiveModal('exploreDeals')}>
                  Explore Deals
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recommended for You */}
      <div className="dashboard-card recommended-card">
        <div className="card-header">
          <h3>Recommended for You</h3>
          <button className="view-all-btn" onClick={() => setActiveModal('recommended')}>
            View All <span className="arrow">→</span>
          </button>
        </div>

        <div className="recommended-grid">
          {recommendedItems.slice(0, 5).map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-image-container">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="product-details">
                <h4 className="product-title">{item.name}</h4>
                <span className="product-unit">{item.unit}</span>
                <div className="product-footer">
                  <span className="product-price">₹{item.price.toFixed(2)}</span>
                  <button
                    className={`add-btn ${cart[item.id] ? 'added' : ''}`}
                    onClick={() => handleAddToCart(item.id)}
                    title="Add to Cart"
                  >
                    {cart[item.id] ? `+${cart[item.id]}` : '+'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>✕</button>

            {activeModal === 'categories' && (
              <div className="modal-body">
                <h2>All Purchased Categories</h2>
                <div className="modal-list">
                  {categoriesData.map((cat) => (
                    <div key={cat.id} className="modal-item">
                      <img src={cat.image} alt={cat.name} className="modal-item-img" />
                      <div className="modal-item-info">
                        <h4>{cat.name}</h4>
                        <p>Total Spent: {cat.totalSpent}</p>
                      </div>
                      <span className="modal-badge">{cat.percentage}% share</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'offers' && (
              <div className="modal-body">
                <h2>Active Offers & Coupons</h2>
                <div className="offers-modal-grid">
                  <div className="coupon-card">
                    <h3>FREEDEL499</h3>
                    <p>Free Delivery on orders above ₹499</p>
                    <button className="apply-coupon-btn" onClick={closeModal}>Apply Code</button>
                  </div>
                  <div className="coupon-card">
                    <h3>WEEKEND30</h3>
                    <p>30% OFF on Fruits and Vegetables</p>
                    <button className="apply-coupon-btn" onClick={closeModal}>Apply Code</button>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'shopNow' && (
              <div className="modal-body">
                <h2>Free Delivery Activated!</h2>
                <p>Add ₹499 or more worth of groceries to your cart to enjoy zero delivery fees.</p>
                <button className="modal-primary-btn" onClick={closeModal}>Continue Shopping</button>
              </div>
            )}

            {activeModal === 'exploreDeals' && (
              <div className="modal-body">
                <h2>Weekend Special Deals (Up to 30% OFF)</h2>
                <div className="deals-grid">
                  {recommendedItems.map((item) => (
                    <div key={item.id} className="deal-card">
                      <span className="discount-tag">30% OFF</span>
                      <img src={item.image} alt={item.name} />
                      <h4>{item.name}</h4>
                      <p className="deal-price">₹{item.price.toFixed(2)}</p>
                      <button className="offer-action-btn" onClick={() => handleAddToCart(item.id)}>
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'recommended' && (
              <div className="modal-body">
                <h2>All Recommended Products</h2>
                <div className="recommended-grid modal-grid">
                  {recommendedItems.map((item) => (
                    <div key={item.id} className="product-card">
                      <div className="product-image-container">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="product-details">
                        <h4 className="product-title">{item.name}</h4>
                        <span className="product-unit">{item.unit}</span>
                        <div className="product-footer">
                          <span className="product-price">₹{item.price.toFixed(2)}</span>
                          <button
                            className={`add-btn ${cart[item.id] ? 'added' : ''}`}
                            onClick={() => handleAddToCart(item.id)}
                          >
                            {cart[item.id] ? `+${cart[item.id]}` : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
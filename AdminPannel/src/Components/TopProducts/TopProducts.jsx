import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './TopProducts.css';

const TopProducts = () => {
  // Modal state management
  const [activeModal, setActiveModal] = useState(null); // 'topProducts' | 'inventory' | 'lowStock' | null
  
  // Dropdown state for Revenue Breakup
  const [revenueTimeframe, setRevenueTimeframe] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeOptions = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];

  // Mock Datasets matching the images
  const topSellingData = [
    { id: 1, name: 'All Type Bell Pepper', icon: '🫑', sold: '1200+ Sold', price: '₹175.00' },
    { id: 2, name: 'Organic Bananas', icon: '🍌', sold: '950+ Sold', price: '₹60.00' },
    { id: 3, name: 'Amul Fresh Milk 1L', icon: '🥛', sold: '850+ Sold', price: '₹60.00' },
    { id: 4, name: 'Farm Fresh Eggs (12)', icon: '🥚', sold: '670+ Sold', price: '₹80.00' },
    { id: 5, name: 'Tata Salt 1kg', icon: '🧂', sold: '560+ Sold', price: '₹40.00' },
  ];

  const inventorySummaryData = [
    { label: 'Total Products', value: '1,248', color: 'default' },
    { label: 'Active Products', value: '1,186', color: 'default' },
    { label: 'Low Stock Items', value: '86', color: 'orange' },
    { label: 'Out of Stock Items', value: '28', color: 'red' },
    { label: 'Total Categories', value: '28', color: 'default' },
  ];

  const lowStockData = [
    { id: 1, name: 'Amul Fresh Milk 1L', icon: '🥛', stock: '12 units' },
    { id: 2, name: 'Organic Spinach', icon: '🥬', stock: '8 units' },
    { id: 3, name: 'Fortune Sunflower Oil 1L', icon: '🌻', stock: '15 units' },
    { id: 4, name: 'Tata Salt 1kg', icon: '🧂', stock: '10 units' },
  ];

  return (
    <div className="tp-dashboard-container">
      <div className="tp-grid">

        {/* CARD 1: TOP SELLING PRODUCTS */}
        <div className="tp-card">
          <div className="tp-card__header">
            <h3 className="tp-card__title">Top Selling Products</h3>
            <button 
              type="button" 
              className="tp-card__view-all" 
              onClick={() => setActiveModal('topProducts')}
            >
              View All
            </button>
          </div>
          <div className="tp-card__body">
            <div className="tp-product-list">
              {topSellingData.map((item) => (
                <div key={item.id} className="tp-product-item">
                  <span className="tp-product-item__rank">{item.id}</span>
                  <div className="tp-product-item__icon-wrapper">
                    <span>{item.icon}</span>
                  </div>
                  <div className="tp-product-item__details">
                    <div className="tp-product-item__name">{item.name}</div>
                    <div className="tp-product-item__sold">{item.sold}</div>
                  </div>
                  <div className="tp-product-item__price">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: REVENUE BREAKUP */}
        <div className="tp-card">
          <div className="tp-card__header">
            <h3 className="tp-card__title">Revenue<br />Breakup</h3>
            <div className="tp-dropdown-container">
              <button 
                type="button" 
                className="tp-dropdown-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {revenueTimeframe} <ChevronDown size={14} />
              </button>
              {isDropdownOpen && (
                <ul className="tp-dropdown-menu">
                  {timeOptions.map((option) => (
                    <li 
                      key={option} 
                      onClick={() => {
                        setRevenueTimeframe(option);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="tp-card__body">
            {/* SVG Donut Chart */}
            <div className="tp-chart-wrapper">
              <svg viewBox="0 0 100 100" className="tp-donut-svg">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="11" strokeDasharray="122.5 116.3" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563eb" strokeWidth="11" strokeDasharray="62.5 176.3" strokeDashoffset="-123.5" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="11" strokeDasharray="31.2 207.6" strokeDashoffset="-187" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="11" strokeDasharray="14.8 224" strokeDashoffset="-219" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#64748b" strokeWidth="11" strokeDasharray="9.6 229.2" strokeDashoffset="-234.5" />
              </svg>
              <div className="tp-chart-center">
                <div className="tp-chart-center__amount">₹2,48,560</div>
                <div className="tp-chart-center__label">Total Revenue</div>
              </div>
            </div>

            {/* Donut Legend List */}
            <div className="tp-legend-list">
              <div className="tp-legend-item">
                <div className="tp-legend-item__label">
                  <span className="tp-legend-item__dot" style={{ backgroundColor: '#10b981' }}></span>
                  Groceries
                </div>
                <div className="tp-legend-item__value">₹1,25,680 <span>(50.6%)</span></div>
              </div>
              <div className="tp-legend-item">
                <div className="tp-legend-item__label">
                  <span className="tp-legend-item__dot" style={{ backgroundColor: '#2563eb' }}></span>
                  Fruits & Vegetables
                </div>
                <div className="tp-legend-item__value">₹65,200 <span>(26.2%)</span></div>
              </div>
              <div className="tp-legend-item">
                <div className="tp-legend-item__label">
                  <span className="tp-legend-item__dot" style={{ backgroundColor: '#f59e0b' }}></span>
                  Dairy & Bakery
                </div>
                <div className="tp-legend-item__value">₹32,450 <span>(13.0%)</span></div>
              </div>
              <div className="tp-legend-item">
                <div className="tp-legend-item__label">
                  <span className="tp-legend-item__dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                  Beverages
                </div>
                <div className="tp-legend-item__value">₹15,230 <span>(6.2%)</span></div>
              </div>
              <div className="tp-legend-item">
                <div className="tp-legend-item__label">
                  <span className="tp-legend-item__dot" style={{ backgroundColor: '#64748b' }}></span>
                  Others
                </div>
                <div className="tp-legend-item__value">₹10,000 <span>(4.0%)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: INVENTORY SUMMARY */}
        <div className="tp-card">
          <div className="tp-card__header">
            <h3 className="tp-card__title">Inventory<br />Summary</h3>
            <button 
              type="button" 
              className="tp-card__view-all" 
              onClick={() => setActiveModal('inventory')}
            >
              View All
            </button>
          </div>
          <div className="tp-card__body">
            <div className="tp-inventory-list">
              {inventorySummaryData.map((item, index) => (
                <div key={index} className="tp-inventory-item">
                  <span className={`tp-inventory-item__label tp-inventory-item__label--${item.color}`}>
                    {item.label}
                  </span>
                  <span className={`tp-inventory-item__value tp-inventory-item__value--${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4: LOW STOCK ALERT */}
        <div className="tp-card">
          <div className="tp-card__header">
            <h3 className="tp-card__title">Low Stock Alert</h3>
            <button 
              type="button" 
              className="tp-card__view-all" 
              onClick={() => setActiveModal('lowStock')}
            >
              View All
            </button>
          </div>
          <div className="tp-card__body">
            <div className="tp-stock-list">
              {lowStockData.map((item) => (
                <div key={item.id} className="tp-stock-item">
                  <div className="tp-stock-item__icon">{item.icon}</div>
                  <div className="tp-stock-item__details">
                    <div className="tp-stock-item__name">{item.name}</div>
                    <div className="tp-stock-item__qty">Stock: {item.stock}</div>
                  </div>
                  <button type="button" className="tp-stock-item__reorder-btn">Reorder Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* POPUP MODAL 1: TOP SELLING PRODUCTS (IMAGE 2) */}
      {activeModal === 'topProducts' && (
        <div className="tp-modal-overlay">
          <div className="tp-modal">
            <div className="tp-modal__header">
              <h3 className="tp-modal__title">Top Selling Products</h3>
              <button type="button" className="tp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="tp-modal__body">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Product</th>
                    <th>Sold</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingData.map((item) => (
                    <tr key={item.id}>
                      <td className="tp-table__col-rank">{item.id}</td>
                      <td>
                        <div className="tp-table__product-cell">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="tp-table__col-sold">{item.sold}</td>
                      <td className="tp-table__col-price">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: INVENTORY SUMMARY (IMAGE 3) */}
      {activeModal === 'inventory' && (
        <div className="tp-modal-overlay">
          <div className="tp-modal">
            <div className="tp-modal__header">
              <h3 className="tp-modal__title">Inventory Summary</h3>
              <button type="button" className="tp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="tp-modal__body">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th style={{ textAlign: 'right' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventorySummaryData.map((item, index) => (
                    <tr key={index}>
                      <td className="tp-table__col-metric">{item.label}</td>
                      <td className="tp-table__col-metric-val">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: LOW STOCK ITEMS (IMAGE 4) */}
      {activeModal === 'lowStock' && (
        <div className="tp-modal-overlay">
          <div className="tp-modal">
            <div className="tp-modal__header">
              <h3 className="tp-modal__title">Low Stock Items</h3>
              <button type="button" className="tp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="tp-modal__body">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="tp-table__product-cell">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="tp-table__col-stock">{item.stock}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="tp-table__reorder-btn">Reorder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TopProducts;
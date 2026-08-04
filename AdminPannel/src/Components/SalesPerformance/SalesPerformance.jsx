import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ShoppingBag, 
  RotateCcw, 
  AlertTriangle, 
  PlusCircle, 
  List, 
  FolderPlus, 
  FileText, 
  Tag, 
  Image as ImageIcon, 
  Settings, 
  X,
  ArrowRight,
  Download
} from 'lucide-react';
import './SalesPerformance.css';

// Real Sales Bar Chart Data
const salesBarData = [
  { day: '01', sales: 24000 },
  { day: '02', sales: 18000 },
  { day: '03', sales: 32000 },
  { day: '04', sales: 21000 },
  { day: '05', sales: 28000 },
  { day: '06', sales: 15000 },
  { day: '07', sales: 35000 },
  { day: '08', sales: 22000 },
  { day: '09', sales: 29000 },
  { day: '10', sales: 38000 },
  { day: '11', sales: 24000 },
  { day: '12', sales: 31000 },
  { day: '13', sales: 26000 },
  { day: '14', sales: 34000 },
  { day: '15', sales: 29000 },
  { day: '16', sales: 37000 },
  { day: '17', sales: 30000 },
  { day: '18', sales: 39000 },
  { day: '19', sales: 33000 },
  { day: '20', sales: 36000 },
];

// Customer List Data
const customerData = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@example.com', orders: 18, total: '₹24,560' },
  { id: 2, name: 'Priya Nair', email: 'priya.nair@example.com', orders: 12, total: '₹15,230' },
  { id: 3, name: 'Amit Verma', email: 'amit.verma@example.com', orders: 27, total: '₹38,900' },
  { id: 4, name: 'Sneha Patil', email: 'sneha.patil@example.com', orders: 5, total: '₹6,410' },
];

// Orders List Data
const ordersData = [
  { id: 'ORD-2026-08765', customer: 'Rahul Sharma', items: 4, total: '₹1,240', status: 'Processing' },
  { id: 'ORD-2026-08764', customer: 'Priya Nair', items: 2, total: '₹560', status: 'Shipped' },
  { id: 'ORD-2026-08763', customer: 'Amit Verma', items: 7, total: '₹2,180', status: 'Delivered' },
  { id: 'ORD-2026-08762', customer: 'Sneha Patil', items: 1, total: '₹175', status: 'Delivered' },
  { id: 'ORD-2026-08761', customer: 'Karan Mehta', items: 3, total: '₹920', status: 'Processing' },
];

// Manage Returns Data
const returnsData = [
  { id: 'RET-2026-00124', customer: 'Sneha Patil', product: 'Amul Fresh Milk 1L', reason: 'Damaged', status: 'Pending', action: 'Approve' },
  { id: 'RET-2026-00123', customer: 'Karan Mehta', product: 'Organic Bananas', reason: 'Wrong Item', status: 'Approved', action: '—' },
  { id: 'RET-2026-00122', customer: 'Rahul Sharma', product: 'Tata Salt 1kg', reason: 'Not Needed', status: 'Rejected', action: '—' },
];

// Categories Data
const categoriesData = [
  { name: 'Groceries', count: 412 },
  { name: 'Fruits & Vegetables', count: 268 },
  { name: 'Dairy & Bakery', count: 154 },
  { name: 'Beverages', count: 96 },
];

// Stock Report Data
const stockReportData = [
  { product: 'Amul Fresh Milk 1L', stock: '12 units' },
  { product: 'Organic Spinach', stock: '8 units' },
  { product: 'Fortune Sunflower Oil 1L', stock: '15 units' },
  { product: 'Tata Salt 1kg', stock: '10 units' },
  { product: 'All Type Bell Pepper', stock: 'In Stock' },
  { product: 'Organic Bananas', stock: 'In Stock' },
  { product: 'Amul Fresh Milk 1L', stock: 'In Stock' },
  { product: 'Farm Fresh Eggs (12)', stock: 'In Stock' },
  { product: 'Tata Salt 1kg', stock: 'In Stock' },
];

// Coupons Data
const couponsData = [
  { code: 'WELCOME10', discount: '10%', expiry: '31 Aug 2026', status: 'Active' },
  { code: 'FESTIVE50', discount: '₹50', expiry: '15 Aug 2026', status: 'Active' },
  { code: 'SUMMER20', discount: '20%', expiry: '01 Jun 2026', status: 'Expired' },
];

// Banners Data
const bannersData = [
  { title: 'Monsoon Grocery Sale', placement: 'Homepage Top', status: 'Live' },
  { title: 'Fresh Fruits Combo', placement: 'Category Page', status: 'Live' },
  { title: 'Diwali Early Bird', placement: 'Homepage Top', status: 'Scheduled' },
];

// Custom Bar Chart Hover Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="sp-chart-tooltip">
        <p className="sp-chart-tooltip__label">May {label}</p>
        <p className="sp-chart-tooltip__value">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

const SalesPerformance = () => {
  // Modal state handler: 'customers' | 'orders' | 'activities' | 'addProduct' | 'returns' | 'category' | 'stockReport' | 'salesReport' | 'coupons' | 'banners' | 'siteSettings' | null
  const [activeModal, setActiveModal] = useState(null);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing': return 'sp-badge--processing';
      case 'Shipped': return 'sp-badge--shipped';
      case 'Delivered': return 'sp-badge--delivered';
      case 'Pending': return 'sp-badge--processing';
      case 'Approved': return 'sp-badge--delivered';
      case 'Rejected': return 'sp-badge--shipped';
      case 'Active': return 'sp-badge--delivered';
      case 'Expired': return 'sp-badge--shipped';
      case 'Live': return 'sp-badge--delivered';
      case 'Scheduled': return 'sp-badge--processing';
      default: return '';
    }
  };

  return (
    <div className="sp-container">
      {/* TOP CARDS GRID */}
      <div className="sp-top-grid">

        {/* CARD 1: SALES PERFORMANCE & GRAPH */}
        <div className="sp-card sp-card--sales">
          <h3 className="sp-card__title">Sales Performance</h3>
          
          <div className="sp-sales-metrics">
            <div className="sp-metric-box">
              <span className="sp-metric-box__title">Today's Sales</span>
              <span className="sp-metric-box__value">₹18,560</span>
              <span className="sp-metric-box__growth">↑ 12.6%</span>
            </div>
            <div className="sp-metric-box">
              <span className="sp-metric-box__title">Yesterday's Sales</span>
              <span className="sp-metric-box__value">₹16,240</span>
              <span className="sp-metric-box__growth">↑ 8.3%</span>
            </div>
            <div className="sp-metric-box">
              <span className="sp-metric-box__title">This Week</span>
              <span className="sp-metric-box__value">₹1,25,680</span>
              <span className="sp-metric-box__growth">↑ 15.9%</span>
            </div>
            <div className="sp-metric-box">
              <span className="sp-metric-box__title">This Month</span>
              <span className="sp-metric-box__value">₹2,48,560</span>
              <span className="sp-metric-box__growth">↑ 18.6%</span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="sp-chart-container">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={salesBarData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => `${v / 1000}K`}
                  domain={[0, 40000]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD 2: CUSTOMER OVERVIEW */}
        <div className="sp-card">
          <div className="sp-card__header">
            <h3 className="sp-card__title">Customer Overview</h3>
            <button type="button" className="sp-card__view-all" onClick={() => setActiveModal('customers')}>
              View All
            </button>
          </div>

          <div className="sp-customer-list">
            <div className="sp-customer-item">
              <div className="sp-customer-item__icon sp-customer-item__icon--green">
                <UserPlus size={18} />
              </div>
              <div className="sp-customer-item__details">
                <span className="sp-customer-item__title">New Customers</span>
                <div className="sp-customer-item__sub">
                  <strong>128</strong> <span className="sp-growth-tag">↑ 15.2%</span>
                </div>
              </div>
              <svg className="sp-sparkline" viewBox="0 0 60 20">
                <path d="M0,15 Q15,18 30,8 T60,2" fill="none" stroke="#10b981" strokeWidth="2.5" />
              </svg>
            </div>

            <div className="sp-customer-item">
              <div className="sp-customer-item__icon sp-customer-item__icon--blue">
                <UserCheck size={18} />
              </div>
              <div className="sp-customer-item__details">
                <span className="sp-customer-item__title">Returning Customers</span>
                <div className="sp-customer-item__sub">
                  <strong>728</strong> <span className="sp-growth-tag">↑ 8.6%</span>
                </div>
              </div>
              <svg className="sp-sparkline" viewBox="0 0 60 20">
                <path d="M0,12 Q15,2 30,16 T60,6" fill="none" stroke="#2563eb" strokeWidth="2.5" />
              </svg>
            </div>

            <div className="sp-customer-item">
              <div className="sp-customer-item__icon sp-customer-item__icon--purple">
                <Users size={18} />
              </div>
              <div className="sp-customer-item__details">
                <span className="sp-customer-item__title">Total Customers</span>
                <div className="sp-customer-item__sub">
                  <strong>856</strong> <span className="sp-growth-tag">↑ 10.3%</span>
                </div>
              </div>
              <svg className="sp-sparkline" viewBox="0 0 60 20">
                <path d="M0,14 Q15,8 30,12 T60,4" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 3: RECENT ACTIVITIES */}
        <div className="sp-card">
          <div className="sp-card__header">
            <h3 className="sp-card__title">Recent Activities</h3>
            <button type="button" className="sp-card__view-all" onClick={() => setActiveModal('activities')}>
              View All
            </button>
          </div>

          <div className="sp-activity-list">
            <div className="sp-activity-item">
              <div className="sp-activity-item__icon sp-activity-item__icon--green">
                <ShoppingBag size={18} />
              </div>
              <div className="sp-activity-item__details">
                <span className="sp-activity-item__title">New Order Received</span>
                <span className="sp-activity-item__sub">ORD-2026-08765</span>
              </div>
              <span className="sp-activity-item__time">2 mins ago</span>
            </div>

            <div className="sp-activity-item">
              <div className="sp-activity-item__icon sp-activity-item__icon--orange">
                <RotateCcw size={18} />
              </div>
              <div className="sp-activity-item__details">
                <span className="sp-activity-item__title">Return Request</span>
                <span className="sp-activity-item__sub">RET-2026-00124</span>
              </div>
              <span className="sp-activity-item__time">15 mins ago</span>
            </div>

            <div className="sp-activity-item">
              <div className="sp-activity-item__icon sp-activity-item__icon--red">
                <AlertTriangle size={18} />
              </div>
              <div className="sp-activity-item__details">
                <span className="sp-activity-item__title">Low Stock Alert</span>
                <span className="sp-activity-item__sub">Amul Fresh Milk 1L</span>
              </div>
              <span className="sp-activity-item__time">30 mins ago</span>
            </div>

            <div className="sp-activity-item">
              <div className="sp-activity-item__icon sp-activity-item__icon--blue">
                <UserPlus size={18} />
              </div>
              <div className="sp-activity-item__details">
                <span className="sp-activity-item__title">New Customer Registered</span>
                <span className="sp-activity-item__sub">Rahul Sharma</span>
              </div>
              <span className="sp-activity-item__time">1 hour ago</span>
            </div>
          </div>
        </div>

        {/* CARD 4: GREEN BANNER CARD */}
        <div className="sp-banner-card">
          <div className="sp-banner-card__content">
            <h2 className="sp-banner-card__title">
              Fast<br />Delivery<br />Happy<br />Customers
            </h2>
            <p className="sp-banner-card__desc">
              Manage orders and deliver happiness to your customers.
            </p>
          </div>
          <button 
            type="button" 
            className="sp-banner-card__btn"
            onClick={() => setActiveModal('orders')}
          >
            View Orders <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="sp-quick-actions-card">
        <h3 className="sp-quick-actions__title">Quick Actions</h3>
        <div className="sp-quick-actions__grid">
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('addProduct')}>
            <PlusCircle size={16} className="sp-action-btn__icon--green" /> Add Product
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('orders')}>
            <List size={16} className="sp-action-btn__icon--purple" /> View Orders
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('returns')}>
            <RotateCcw size={16} className="sp-action-btn__icon--orange" /> Manage Returns
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('customers')}>
            <Users size={16} className="sp-action-btn__icon--blue" /> Customers
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('category')}>
            <FolderPlus size={16} className="sp-action-btn__icon--green" /> Add Category
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('stockReport')}>
            <FileText size={16} className="sp-action-btn__icon--red" /> Stock Report
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('salesReport')}>
            <FileText size={16} className="sp-action-btn__icon--teal" /> Sales Report
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('coupons')}>
            <Tag size={16} className="sp-action-btn__icon--purple" /> Coupons
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('banners')}>
            <ImageIcon size={16} className="sp-action-btn__icon--orange" /> Banners
          </button>
          <button type="button" className="sp-action-btn" onClick={() => setActiveModal('siteSettings')}>
            <Settings size={16} className="sp-action-btn__icon--gray" /> Site Settings
          </button>
        </div>
      </div>

      {/* POPUP 1: MANAGE RETURNS (IMAGE 1) */}
      {activeModal === 'returns' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal sp-modal--large">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Manage Returns</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <div className="sp-table-scroll">
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Return ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnsData.map((ret) => (
                      <tr key={ret.id}>
                        <td className="sp-table__cell-muted">{ret.id}</td>
                        <td className="sp-table__cell-bold">{ret.customer}</td>
                        <td>{ret.product}</td>
                        <td className="sp-table__cell-muted">{ret.reason}</td>
                        <td>
                          <span className={`sp-badge ${getStatusBadgeClass(ret.status)}`}>
                            {ret.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {ret.action === 'Approve' ? (
                            <button type="button" className="sp-btn-approve">Approve</button>
                          ) : (
                            <span className="sp-table__cell-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: ADD CATEGORY (IMAGE 2) */}
      {activeModal === 'category' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Add Category</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <form onSubmit={(e) => e.preventDefault()} className="sp-form">
                <div className="sp-form-group">
                  <label className="sp-form-label">Category Name</label>
                  <input type="text" className="sp-form-input" placeholder="e.g. Frozen Foods" />
                </div>
                <div className="sp-form-group">
                  <label className="sp-form-label">Parent Category</label>
                  <select className="sp-form-select">
                    <option>None (Top-level category)</option>
                    <option>Groceries</option>
                  </select>
                </div>
                <button type="submit" className="sp-form-submit-btn">Save Category</button>
              </form>

              <div className="sp-modal-divider"></div>

              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Products</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesData.map((cat, i) => (
                    <tr key={i}>
                      <td>{cat.name}</td>
                      <td style={{ textAlign: 'right' }}>{cat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: STOCK REPORT (IMAGE 3) */}
      {activeModal === 'stockReport' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Stock Report</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReportData.map((st, i) => (
                    <tr key={i}>
                      <td>{st.product}</td>
                      <td style={{ textAlign: 'right' }} className="sp-table__cell-muted">{st.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="sp-modal-footer">
                <button type="button" className="sp-btn-csv">
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 4: SALES REPORT (IMAGE 4) */}
      {activeModal === 'salesReport' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal sp-modal--large">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Sales Report</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <div className="sp-modal-chart-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salesBarData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v / 1000}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="sp-modal-footer">
                <button type="button" className="sp-btn-csv">
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 5: COUPONS (IMAGE 5) */}
      {activeModal === 'coupons' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Coupons</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <form onSubmit={(e) => e.preventDefault()} className="sp-form">
                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label className="sp-form-label">Coupon Code</label>
                    <input type="text" className="sp-form-input" placeholder="e.g. SAVE15" />
                  </div>
                  <div className="sp-form-group">
                    <label className="sp-form-label">Discount</label>
                    <input type="text" className="sp-form-input" placeholder="e.g. 15% or ₹50" />
                  </div>
                </div>
                <div className="sp-form-group">
                  <label className="sp-form-label">Expiry Date</label>
                  <input type="date" className="sp-form-input" />
                </div>
                <button type="submit" className="sp-form-submit-btn sp-form-submit-btn--purple">Create Coupon</button>
              </form>

              <div className="sp-modal-divider"></div>

              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Expiry</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {couponsData.map((cp, i) => (
                    <tr key={i}>
                      <td className="sp-table__cell-bold">{cp.code}</td>
                      <td>{cp.discount}</td>
                      <td className="sp-table__cell-muted">{cp.expiry}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`sp-badge ${getStatusBadgeClass(cp.status)}`}>
                          {cp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 6: BANNERS (IMAGE 6) */}
      {activeModal === 'banners' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Banners</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <form onSubmit={(e) => e.preventDefault()} className="sp-form">
                <div className="sp-form-group">
                  <label className="sp-form-label">Banner Title</label>
                  <input type="text" className="sp-form-input" placeholder="e.g. Weekend Flash Sale" />
                </div>
                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label className="sp-form-label">Placement</label>
                    <select className="sp-form-select">
                      <option>Select placement</option>
                      <option>Homepage Top</option>
                      <option>Category Page</option>
                    </select>
                  </div>
                  <div className="sp-form-group">
                    <label className="sp-form-label">Go Live Date</label>
                    <input type="date" className="sp-form-input" />
                  </div>
                </div>
                <button type="submit" className="sp-form-submit-btn sp-form-submit-btn--orange">Save Banner</button>
              </form>

              <div className="sp-modal-divider"></div>

              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Placement</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bannersData.map((bn, i) => (
                    <tr key={i}>
                      <td>{bn.title}</td>
                      <td className="sp-table__cell-muted">{bn.placement}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`sp-badge ${getStatusBadgeClass(bn.status)}`}>
                          {bn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 7: SITE SETTINGS (IMAGE 7) */}
      {activeModal === 'siteSettings' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Site Settings</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <form onSubmit={(e) => e.preventDefault()} className="sp-form">
                <div className="sp-form-group">
                  <label className="sp-form-label">Store Name</label>
                  <input type="text" className="sp-form-input" defaultValue="AICWA Grocery Store" />
                </div>
                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label className="sp-form-label">Support Email</label>
                    <input type="email" className="sp-form-input" defaultValue="support@aicwa.example.com" />
                  </div>
                  <div className="sp-form-group">
                    <label className="sp-form-label">Currency</label>
                    <select className="sp-form-select">
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                </div>
                <div className="sp-form-group">
                  <label className="sp-form-label">Low Stock Threshold</label>
                  <input type="number" className="sp-form-input" defaultValue={15} />
                </div>
                <button type="submit" className="sp-form-submit-btn sp-form-submit-btn--dark">Save Settings</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 8: CUSTOMERS (FROM PREVIOUS) */}
      {activeModal === 'customers' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Customers</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th style={{ textAlign: 'right' }}>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.map((cust) => (
                    <tr key={cust.id}>
                      <td className="sp-table__cell-bold">{cust.name}</td>
                      <td className="sp-table__cell-muted">{cust.email}</td>
                      <td>{cust.orders}</td>
                      <td className="sp-table__cell-price">{cust.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 9: ORDERS (FROM PREVIOUS) */}
      {activeModal === 'orders' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Orders</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.map((ord) => (
                    <tr key={ord.id}>
                      <td className="sp-table__cell-bold">{ord.id}</td>
                      <td>{ord.customer}</td>
                      <td>{ord.items}</td>
                      <td><strong>{ord.total}</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`sp-badge ${getStatusBadgeClass(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 10: RECENT ACTIVITIES (INCREASED HEIGHT & SCROLLABLE) */}
      {activeModal === 'activities' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal sp-modal--tall">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Recent Activities</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body sp-modal__body--scroll">
              <div className="sp-activity-list-expanded">
                <div className="sp-activity-item">
                  <div className="sp-activity-item__icon sp-activity-item__icon--green"><ShoppingBag size={18} /></div>
                  <div className="sp-activity-item__details">
                    <span className="sp-activity-item__title">New Order Received</span>
                    <span className="sp-activity-item__sub">ORD-2026-08765</span>
                  </div>
                  <span className="sp-activity-item__time">2 mins ago</span>
                </div>
                <div className="sp-activity-item">
                  <div className="sp-activity-item__icon sp-activity-item__icon--orange"><RotateCcw size={18} /></div>
                  <div className="sp-activity-item__details">
                    <span className="sp-activity-item__title">Return Request</span>
                    <span className="sp-activity-item__sub">RET-2026-00124</span>
                  </div>
                  <span className="sp-activity-item__time">15 mins ago</span>
                </div>
                <div className="sp-activity-item">
                  <div className="sp-activity-item__icon sp-activity-item__icon--red"><AlertTriangle size={18} /></div>
                  <div className="sp-activity-item__details">
                    <span className="sp-activity-item__title">Low Stock Alert</span>
                    <span className="sp-activity-item__sub">Amul Fresh Milk 1L</span>
                  </div>
                  <span className="sp-activity-item__time">30 mins ago</span>
                </div>
                <div className="sp-activity-item">
                  <div className="sp-activity-item__icon sp-activity-item__icon--blue"><UserPlus size={18} /></div>
                  <div className="sp-activity-item__details">
                    <span className="sp-activity-item__title">New Customer Registered</span>
                    <span className="sp-activity-item__sub">Rahul Sharma</span>
                  </div>
                  <span className="sp-activity-item__time">1 hour ago</span>
                </div>
                <div className="sp-activity-item">
                  <div className="sp-activity-item__icon sp-activity-item__icon--green"><ShoppingBag size={18} /></div>
                  <div className="sp-activity-item__details">
                    <span className="sp-activity-item__title">Order Delivered</span>
                    <span className="sp-activity-item__sub">ORD-2026-08762</span>
                  </div>
                  <span className="sp-activity-item__time">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 11: ADD PRODUCT FORM */}
      {activeModal === 'addProduct' && (
        <div className="sp-modal-overlay">
          <div className="sp-modal sp-modal--form">
            <div className="sp-modal__header">
              <h3 className="sp-modal__title">Add Product</h3>
              <button type="button" className="sp-modal__close" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="sp-modal__body">
              <form onSubmit={(e) => e.preventDefault()} className="sp-form">
                <div className="sp-form-group">
                  <label className="sp-form-label">Product Name</label>
                  <input type="text" className="sp-form-input" placeholder="e.g. Organic Bananas" />
                </div>
                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label className="sp-form-label">Category</label>
                    <select className="sp-form-select">
                      <option value="">Select category</option>
                      <option value="groceries">Groceries</option>
                    </select>
                  </div>
                  <div className="sp-form-group">
                    <label className="sp-form-label">Price (₹)</label>
                    <input type="text" className="sp-form-input" placeholder="0.00" />
                  </div>
                </div>
                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label className="sp-form-label">Stock Quantity</label>
                    <input type="number" className="sp-form-input" placeholder="0" />
                  </div>
                  <div className="sp-form-group">
                    <label className="sp-form-label">SKU</label>
                    <input type="text" className="sp-form-input" placeholder="e.g. GRC-0142" />
                  </div>
                </div>
                <div className="sp-form-group">
                  <label className="sp-form-label">Description</label>
                  <input type="text" className="sp-form-input" placeholder="Short product description" />
                </div>
                <button type="submit" className="sp-form-submit-btn">Add Product</button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesPerformance;
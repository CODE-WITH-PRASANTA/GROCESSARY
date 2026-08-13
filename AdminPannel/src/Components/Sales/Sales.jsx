import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { ChevronDown, X } from 'lucide-react';
import './Sales.css';

// Sample Orders Dataset
const initialOrders = [
  { id: 'ORD-2026-08765', icon: '🥐', customer: 'Rahul Sharma', date: '20 May, 10:30 AM', amount: '₹1,248', status: 'Delivered', payment: 'Paid (Online UPI)' },
  { id: 'ORD-2026-08764', icon: '🧃', customer: 'Priya Verma', date: '20 May, 09:15 AM', amount: '₹2,560', status: 'Processing', payment: 'Paid (Online UPI)' },
  { id: 'ORD-2026-08763', icon: '🧴', customer: 'Amit Kumar', date: '20 May, 08:00 AM', amount: '₹980', status: 'Shipped', payment: 'Paid (Debit Card)' },
  { id: 'ORD-2026-08762', icon: '🥬', customer: 'Sneha Reddy', date: '19 May, 07:20 PM', amount: '₹1,450', status: 'Delivered', payment: 'Paid (Credit Card)' },
  { id: 'ORD-2026-08761', icon: '🧴', customer: 'Anish Patel', date: '19 May, 06:05 PM', amount: '₹730', status: 'Cancelled', payment: 'Refunded' },
  { id: 'ORD-2026-08760', icon: '🥗', customer: 'Vikram Singh', date: '19 May, 04:40 PM', amount: '₹1,890', status: 'Delivered', payment: 'Paid (Net Banking)' },
  { id: 'ORD-2026-08759', icon: '🍫', customer: 'Kavita Shah', date: '19 May, 02:10 PM', amount: '₹620', status: 'Shipped', payment: 'Paid (UPI)' }
];

// Real Chart Datasets
const chartDataThisMonth = [
  { name: '01 May', current: 2800, previous: 4200, growth: '-33%' },
  { name: '05 May', current: 5400, previous: 3800, growth: '+42%' },
  { name: '10 May', current: 4100, previous: 6100, growth: '-32%' },
  { name: '15 May', current: 7800, previous: 4300, growth: '+81%' },
  { name: '20 May', current: 9200, previous: 2800, growth: '+228%' },
  { name: '25 May', current: 6900, previous: 4900, growth: '+40%' },
  { name: '31 May', current: 10000, previous: 3800, growth: '+163%' }
];

const chartDataLastMonth = [
  { name: '01 Apr', current: 4200, previous: 3100, growth: '+35%' },
  { name: '05 Apr', current: 3800, previous: 4500, growth: '-15%' },
  { name: '10 Apr', current: 6100, previous: 5000, growth: '+22%' },
  { name: '15 Apr', current: 4300, previous: 6200, growth: '-30%' },
  { name: '20 Apr', current: 2800, previous: 5400, growth: '-48%' },
  { name: '25 Apr', current: 4900, previous: 4100, growth: '+19%' },
  { name: '30 Apr', current: 3800, previous: 3300, growth: '+15%' }
];

// Custom Floating Dark Tooltip Box
const CustomTooltip = ({ active, payload, label, activeTab }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.current;
    return (
      <div className="sales-chart-tooltip">
        <div className="sales-chart-tooltip__header">
          <span>{label}</span>
          <span className={`sales-chart-tooltip__growth ${data.growth.startsWith('+') ? 'sales-chart-tooltip__growth--pos' : 'sales-chart-tooltip__growth--neg'}`}>
            {data.growth}
          </span>
        </div>
        <div className="sales-chart-tooltip__body">
          <div className="sales-chart-tooltip__amount">
            ₹{value.toLocaleString('en-IN')}
          </div>
          <div className="sales-chart-tooltip__sub">
            {activeTab === 'thisMonth' ? 'This Month Sales' : 'Last Month Sales'}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const Sales = () => {
  // Navigation & Dropdown States
  const [salesRange, setSalesRange] = useState('This Quarter');
  const [statusRange, setStatusRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('thisMonth'); // 'thisMonth' | 'lastMonth'

  const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modal States
  const [isAllOrdersModalOpen, setIsAllOrdersModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chartSegmentDetails, setChartSegmentDetails] = useState(null);

  const timeOptions = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];

  // Order Status Pie Chart Data
  const orderStats = [
    { label: 'Delivered', count: 856, percent: '68.5%', color: '#10b981' },
    { label: 'Processing', count: 256, percent: '20.5%', color: '#3b82f6' },
    { label: 'Shipped', count: 98, percent: '7.8%', color: '#f59e0b' },
    { label: 'Cancelled', count: 38, percent: '3.0%', color: '#ef4444' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'sales-status-badge--delivered';
      case 'Processing': return 'sales-status-badge--processing';
      case 'Shipped': return 'sales-status-badge--shipped';
      case 'Cancelled': return 'sales-status-badge--cancelled';
      default: return '';
    }
  };

  const activeChartData = activeTab === 'thisMonth' ? chartDataThisMonth : chartDataLastMonth;

  return (
    <div className="sales-dashboard">
      <div className="sales-dashboard__grid">

        {/* 1. SALES OVERVIEW LINE/AREA CHART CARD */}
        <div className="sales-card sales-card--chart">
          <div className="sales-card__header">
            <div>
              <h2 className="sales-card__title">Sales Overview</h2>
              <p className="sales-card__subtitle">Track your sales performance compared to last month.</p>
            </div>

            <div className="sales-card__controls">
              {/* Interactive Tabs */}
              <div className="sales-card__legend">
                <button
                  type="button"
                  className={`sales-card__legend-btn ${activeTab === 'thisMonth' ? 'sales-card__legend-btn--active' : ''}`}
                  onClick={() => setActiveTab('thisMonth')}
                >
                  <span className="sales-card__dot sales-card__dot--green"></span> This Month
                </button>
                <button
                  type="button"
                  className={`sales-card__legend-btn ${activeTab === 'lastMonth' ? 'sales-card__legend-btn--active' : ''}`}
                  onClick={() => setActiveTab('lastMonth')}
                >
                  <span className="sales-card__dot sales-card__dot--gray"></span> Last Month
                </button>
              </div>

              {/* Time Range Dropdown */}
              <div className="sales-dropdown">
                <button
                  type="button"
                  className="sales-dropdown__btn"
                  onClick={() => setIsSalesDropdownOpen(!isSalesDropdownOpen)}
                >
                  {salesRange} <ChevronDown size={14} />
                </button>
                {isSalesDropdownOpen && (
                  <ul className="sales-dropdown__menu">
                    {timeOptions.map((opt) => (
                      <li
                        key={opt}
                        onClick={() => {
                          setSalesRange(opt);
                          setIsSalesDropdownOpen(false);
                        }}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Real Recharts Component */}
          <div className="sales-chart-wrapper">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={activeChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorGray" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000}K`}
                  domain={[0, 10000]}
                />

                <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '3 3' }} />

                {/* Secondary/Dashed Comparison Line */}
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none" 
                />

                {/* Main Curve Area */}
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stroke={activeTab === 'thisMonth' ? '#10b981' : '#64748b'} 
                  strokeWidth={3.5}
                  fillOpacity={1} 
                  fill={activeTab === 'thisMonth' ? 'url(#colorGreen)' : 'url(#colorGray)'}
                  activeDot={{ r: 6, fill: activeTab === 'thisMonth' ? '#10b981' : '#64748b', stroke: '#ffffff', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. ORDER STATUS DONUT CHART CARD */}
        <div className="sales-card">
          <div className="sales-card__header">
            <h2 className="sales-card__title">Order Status</h2>
            <div className="sales-dropdown">
              <button
                type="button"
                className="sales-dropdown__btn"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                {statusRange} <ChevronDown size={14} />
              </button>
              {isStatusDropdownOpen && (
                <ul className="sales-dropdown__menu">
                  {timeOptions.map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setStatusRange(opt);
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="sales-donut-container">
            <svg viewBox="0 0 100 100" className="sales-donut-svg">
              <circle
                cx="50" cy="50" r="38"
                fill="transparent" stroke="#10b981" strokeWidth="12"
                strokeDasharray="163.5 75.3" strokeDashoffset="0"
                className="sales-donut-segment"
                onClick={() => setChartSegmentDetails({ label: 'Delivered', count: 856, percent: '68.5%' })}
              />
              <circle
                cx="50" cy="50" r="38"
                fill="transparent" stroke="#3b82f6" strokeWidth="12"
                strokeDasharray="48.9 189.9" strokeDashoffset="-165.5"
                className="sales-donut-segment"
                onClick={() => setChartSegmentDetails({ label: 'Processing', count: 256, percent: '20.5%' })}
              />
              <circle
                cx="50" cy="50" r="38"
                fill="transparent" stroke="#f59e0b" strokeWidth="12"
                strokeDasharray="18.6 220.2" strokeDashoffset="-216.4"
                className="sales-donut-segment"
                onClick={() => setChartSegmentDetails({ label: 'Shipped', count: 98, percent: '7.8%' })}
              />
              <circle
                cx="50" cy="50" r="38"
                fill="transparent" stroke="#ef4444" strokeWidth="12"
                strokeDasharray="7.1 231.7" strokeDashoffset="-236"
                className="sales-donut-segment"
                onClick={() => setChartSegmentDetails({ label: 'Cancelled', count: 38, percent: '3.0%' })}
              />
            </svg>

            <div className="sales-donut-center">
              <span className="sales-donut-center__label">Total</span>
              <span className="sales-donut-center__value">1,248</span>
            </div>
          </div>

          {chartSegmentDetails && (
            <div className="sales-donut-toast">
              <span><strong>{chartSegmentDetails.label}</strong>: {chartSegmentDetails.count} ({chartSegmentDetails.percent})</span>
              <button type="button" onClick={() => setChartSegmentDetails(null)}><X size={14} /></button>
            </div>
          )}

          <div className="sales-donut-legend">
            {orderStats.map((stat) => (
              <div key={stat.label} className="sales-donut-legend__row">
                <div className="sales-donut-legend__label">
                  <span className="sales-card__dot" style={{ backgroundColor: stat.color }}></span>
                  {stat.label}
                </div>
                <div className="sales-donut-legend__value">
                  <strong>{stat.count}</strong>
                  <span className="sales-donut-legend__percent">({stat.percent})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RECENT ORDERS LIST CARD */}
        <div className="sales-card">
          <div className="sales-card__header">
            <h2 className="sales-card__title">Recent Orders</h2>
            <button type="button" className="sales-card__view-all" onClick={() => setIsAllOrdersModalOpen(true)}>
              View All
            </button>
          </div>

          <div className="sales-orders-list">
            {/* Slice set to 4 to strictly fit inside the card without overflowing */}
            {initialOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="sales-order-item" onClick={() => setSelectedOrder(order)}>
                <div className="sales-order-item__left">
                  <div className="sales-order-item__icon">{order.icon}</div>
                  <div>
                    <div className="sales-order-item__id">{order.id}</div>
                    <div className="sales-order-item__date">{order.date}</div>
                  </div>
                </div>
                <div className="sales-order-item__right">
                  <div className="sales-order-item__amount">{order.amount}</div>
                  <span className={`sales-status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: VIEW ALL RECENT ORDERS */}
      {isAllOrdersModalOpen && (
        <div className="sales-modal-overlay">
          <div className="sales-modal sales-modal--large">
            <div className="sales-modal__header">
              <h3 className="sales-modal__title">All Recent Orders ({initialOrders.length})</h3>
              <button type="button" className="sales-modal__close" onClick={() => setIsAllOrdersModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="sales-modal__body">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {initialOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="sales-table__row"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="sales-table__cell-id">
                        <span className="sales-table__emoji">{order.icon}</span>
                        <strong>{order.id}</strong>
                      </td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td><strong>{order.amount}</strong></td>
                      <td>
                        <span className={`sales-status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
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

      {/* MODAL 2: ORDER DETAILS */}
      {selectedOrder && (
        <div className="sales-modal-overlay">
          <div className="sales-modal sales-modal--small">
            <div className="sales-modal__header">
              <h3 className="sales-modal__title">Order Details</h3>
              <button type="button" className="sales-modal__close" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="sales-modal__body">
              <div className="sales-detail__hero">
                <div className="sales-detail__icon-box">{selectedOrder.icon}</div>
                <div>
                  <h2 className="sales-detail__id">{selectedOrder.id}</h2>
                  <span className={`sales-status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="sales-detail__info-list">
                <div className="sales-detail__info-row">
                  <span className="sales-detail__label">Customer Name:</span>
                  <span className="sales-detail__value">{selectedOrder.customer}</span>
                </div>
                <div className="sales-detail__info-row">
                  <span className="sales-detail__label">Order Date & Time:</span>
                  <span className="sales-detail__value">{selectedOrder.date}</span>
                </div>
                <div className="sales-detail__info-row">
                  <span className="sales-detail__label">Total Bill Amount:</span>
                  <span className="sales-detail__value sales-detail__value--highlight">{selectedOrder.amount}</span>
                </div>
                <div className="sales-detail__info-row">
                  <span className="sales-detail__label">Payment Status:</span>
                  <span className="sales-detail__value">{selectedOrder.payment}</span>
                </div>
              </div>

              <button type="button" className="sales-detail__print-btn" onClick={() => window.print()}>
                Print Order Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sales;
import React, { useState, useMemo, useRef, useEffect } from 'react';
import './OrderHistory.css';

const INITIAL_ORDERS = [
  {
    id: '#GS10028',
    items: [
      { name: 'Daawat Basmati Rice 1kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80' },
      { name: 'Fortune Oil 1L', img: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-05-31',
    displayDate: '31 May 2025',
    time: '10:45 AM',
    amount: '220.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusSubtext: '31 May 2025'
  },
  {
    id: '#GS10027',
    items: [
      { name: 'Amul Taaza Milk 1L', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&auto=format&fit=crop&q=80' },
      { name: 'Potato 1kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-05-30',
    displayDate: '30 May 2025',
    time: '09:20 AM',
    amount: '118.00',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusSubtext: '30 May 2025'
  },
  {
    id: '#GS10026',
    items: [
      { name: 'Banana 1 Dozen', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&auto=format&fit=crop&q=80' },
      { name: 'Apple Royal Gala 1kg', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-05-29',
    displayDate: '29 May 2025',
    time: '08:15 AM',
    amount: '210.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Processing',
    statusSubtext: 'Estimated 31 May'
  },
  {
    id: '#GS10025',
    items: [
      { name: 'Tomato 1kg', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop&q=80' },
      { name: 'Onion 1kg', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-05-28',
    displayDate: '28 May 2025',
    time: '07:10 PM',
    amount: '58.00',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusSubtext: '28 May 2025'
  },
  {
    id: '#GS10024',
    items: [
      { name: 'Daawat Basmati Rice 1kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-05-27',
    displayDate: '27 May 2025',
    time: '06:05 PM',
    amount: '120.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Cancelled',
    statusSubtext: '27 May 2025'
  },
  {
    id: '#GS10023',
    items: [
      { name: 'Aashirvaad Atta 1kg', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=80' },
      { name: 'Fortune Oil 1L', img: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-05-26',
    displayDate: '26 May 2025',
    time: '05:30 PM',
    amount: '180.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusSubtext: '26 May 2025'
  },
  {
    id: '#GS10022',
    items: [
      { name: 'Fresh Avocado 2pcs', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-04-15',
    displayDate: '15 Apr 2025',
    time: '03:15 PM',
    amount: '150.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusSubtext: '15 Apr 2025'
  },
  {
    id: '#GS10021',
    items: [
      { name: 'Amul Taaza Milk 1L', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '2025-04-01',
    displayDate: '01 Apr 2025',
    time: '01:10 PM',
    amount: '68.00',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusSubtext: '01 Apr 2025'
  }
];

const ITEMS_PER_PAGE = 6;

const OrderHistory = () => {
  const [orders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Date Range Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const datePickerRef = useRef(null);
  const filterRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Summary Stat Calculations
  const totalCount = orders.length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  // Filter Algorithm (Search + Status + Date Range)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query Match
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // 2. Status Match
      const matchesStatus =
        statusFilter === 'All' || order.status === statusFilter;

      // 3. Date Range Match
      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = order.date >= startDate && order.date <= endDate;
      } else if (startDate) {
        matchesDate = order.date >= startDate;
      } else if (endDate) {
        matchesDate = order.date <= endDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  // Pagination Variables
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Quick Date Range Presets
  const handleQuickDateSelect = (type) => {
    const today = new Date('2025-05-31'); // Base reference date
    const formatDateStr = (d) => d.toISOString().split('T')[0];

    if (type === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (type === '7days') {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 7);
      setStartDate(formatDateStr(pastDate));
      setEndDate(formatDateStr(today));
    } else if (type === '30days') {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 30);
      setStartDate(formatDateStr(pastDate));
      setEndDate(formatDateStr(today));
    }
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  // Helper function to format display text on date picker button
  const getDateRangeLabel = () => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return '01 Apr 2025 - 31 May 2025';
  };

  // Download Invoice Handler
  const handleDownloadInvoice = (order) => {
    const invoiceContent = `
========================================
             INVOICE
========================================
Order ID:       ${order.id}
Date:           ${order.displayDate} (${order.time})
Status:         ${order.status}
Payment Method: ${order.paymentMethod} (${order.paymentStatus})
----------------------------------------
ITEMS PURCHASED:
${order.items.map((item, i) => `${i + 1}. ${item.name}`).join('\n')}
----------------------------------------
TOTAL AMOUNT:   ₹${order.amount}
========================================
Thank you for shopping with us!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.id.replace('#', '')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="oh-container">
      {/* Top Stat Summary Cards */}
      <div className="oh-cards-grid">
        <div
          className={`oh-card ${statusFilter === 'All' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
        >
          <div className="oh-card-icon icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Total Orders</p>
            <h3 className="oh-card-value">{totalCount}</h3>
            <span className="oh-card-link text-green">View all orders &rarr;</span>
          </div>
        </div>

        <div
          className={`oh-card ${statusFilter === 'Delivered' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('Delivered'); setCurrentPage(1); }}
        >
          <div className="oh-card-icon icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Delivered Orders</p>
            <h3 className="oh-card-value">{deliveredCount}</h3>
            <span className="oh-card-link text-emerald">View delivered &rarr;</span>
          </div>
        </div>

        <div
          className={`oh-card ${statusFilter === 'Processing' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('Processing'); setCurrentPage(1); }}
        >
          <div className="oh-card-icon icon-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Processing Orders</p>
            <h3 className="oh-card-value">{processingCount}</h3>
            <span className="oh-card-link text-orange">View processing &rarr;</span>
          </div>
        </div>

        <div
          className={`oh-card ${statusFilter === 'Cancelled' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('Cancelled'); setCurrentPage(1); }}
        >
          <div className="oh-card-icon icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Cancelled Orders</p>
            <h3 className="oh-card-value">{cancelledCount}</h3>
            <span className="oh-card-link text-purple">View cancelled &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="oh-table-wrapper">
        <div className="oh-header">
          <div className="oh-title-group">
            <h2 className="oh-title">Order History</h2>
            <p className="oh-subtitle">Track and view all your past orders</p>
          </div>

          <div className="oh-controls">
            {/* Search Input */}
            <div className="oh-search-box">
              <input
                type="text"
                placeholder="Search by order ID or item..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <svg className="oh-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            {/* Filter Dropdown */}
            <div className="oh-filter-wrapper" ref={filterRef}>
              <button
                className="oh-filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filter {statusFilter !== 'All' ? `(${statusFilter})` : ''}
              </button>

              {showFilterDropdown && (
                <div className="oh-filter-menu">
                  {['All', 'Delivered', 'Processing', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      className={`oh-filter-item ${statusFilter === status ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                        setCurrentPage(1);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* WORKING CALENDAR / DATE RANGE PICKER */}
            <div className="oh-datepicker-wrapper" ref={datePickerRef}>
              <div
                className={`oh-datepicker-box ${startDate || endDate ? 'active-date' : ''}`}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{getDateRangeLabel()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              {/* Date Picker Modal Dropdown */}
              {showDatePicker && (
                <div className="oh-datepicker-modal">
                  <div className="oh-datepicker-header">
                    <h4>Filter by Date Range</h4>
                    <button className="oh-date-clear-btn" onClick={() => handleQuickDateSelect('all')}>Clear</button>
                  </div>

                  <div className="oh-datepicker-inputs">
                    <div className="oh-date-field">
                      <label>From Date:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div className="oh-date-field">
                      <label>To Date:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  <div className="oh-datepicker-presets">
                    <span>Quick Select:</span>
                    <button onClick={() => handleQuickDateSelect('7days')}>Last 7 Days</button>
                    <button onClick={() => handleQuickDateSelect('30days')}>Last 30 Days</button>
                    <button onClick={() => handleQuickDateSelect('all')}>All Time</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="oh-table-container">
          <table className="oh-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="oh-id">{order.id}</td>
                    <td>
                      <div className="oh-items-cell">
                        <div className="oh-thumbs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="oh-thumb-wrapper">
                              <img src={item.img} alt={item.name} title={item.name} />
                            </div>
                          ))}
                        </div>
                        <div className="oh-items-info">
                          <p className="oh-item-names">
                            {order.items.map((i) => i.name).join(', ')}
                          </p>
                          <span className="oh-item-count">
                            {order.items.length} {order.items.length > 1 ? 'items' : 'item'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="oh-date-cell">
                        <div>{order.displayDate}</div>
                        <div className="oh-subtext">{order.time}</div>
                      </div>
                    </td>
                    <td className="oh-amount">₹{order.amount}</td>
                    <td>
                      <div className="oh-payment-cell">
                        <div>{order.paymentMethod}</div>
                        <div className="oh-subtext">{order.paymentStatus}</div>
                      </div>
                    </td>
                    <td>
                      <div className={`oh-status-badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                        <span className="oh-status-subtext">{order.statusSubtext}</span>
                      </div>
                    </td>
                    <td>
                      <div className="oh-actions-cell">
                        {/* View Details Button */}
                        <button
                          className="oh-view-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          <span>View Details</span>
                        </button>

                        {/* Download Invoice Button */}
                        <button
                          className="oh-download-btn"
                          title="Download Invoice"
                          onClick={() => handleDownloadInvoice(order)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="oh-empty-state">
                    No orders found matching your date or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="oh-footer">
          <div className="oh-footer-text">
            Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </div>

          <div className="oh-pagination">
            <button
              className="oh-page-btn arrow-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`oh-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="oh-page-btn arrow-btn"
              disabled={currentPage === totalPages || filteredOrders.length === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Details Modal */}
      {selectedOrder && (
        <div className="oh-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="oh-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>Order Summary ({selectedOrder.id})</h3>
              <button className="oh-modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="oh-modal-body">
              <p><strong>Status:</strong> {selectedOrder.status} ({selectedOrder.statusSubtext})</p>
              <p><strong>Order Date:</strong> {selectedOrder.displayDate} at {selectedOrder.time}</p>
              <p><strong>Total Amount:</strong> ₹{selectedOrder.amount}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod} - {selectedOrder.paymentStatus}</p>
              
              <h4 className="oh-modal-subtitle">Purchased Items:</h4>
              <div className="oh-modal-items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="oh-modal-item">
                    <img src={item.img} alt={item.name} className="oh-modal-img" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
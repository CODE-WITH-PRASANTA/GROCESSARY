import React, { useState, useMemo, useRef, useEffect } from 'react';
import './Orders.css';

const AVAILABLE_PRODUCTS = [
  { id: 1, name: 'Fortune Oil 1L', price: 220, img: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=100&auto=format&fit=crop&q=80' },
  { id: 2, name: 'Daawat Basmati Rice 1kg', price: 120, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Amul Taaza Milk 1L', price: 68, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&auto=format&fit=crop&q=80' },
  { id: 4, name: 'Banana 1 Dozen', price: 60, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&auto=format&fit=crop&q=80' },
  { id: 5, name: 'Potato 1kg', price: 40, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&auto=format&fit=crop&q=80' },
  { id: 6, name: 'Tomato 1kg', price: 35, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop&q=80' }
];

const INITIAL_ORDERS = [
  {
    id: '#GS10024',
    items: [
      { name: 'Daawat Basmati Rice 1kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80' },
      { name: 'Fortune Oil 1L', img: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '12 May 2025',
    time: '10:30 AM',
    amount: '220.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusDate: '12 May 2025'
  },
  {
    id: '#GS10023',
    items: [
      { name: 'Amul Taaza Milk 1L', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&auto=format&fit=crop&q=80' },
      { name: 'Potato 1kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '11 May 2025',
    time: '09:15 AM',
    amount: '118.00',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusDate: '11 May 2025'
  },
  {
    id: '#GS10022',
    items: [
      { name: 'Banana 1 Dozen', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&auto=format&fit=crop&q=80' },
      { name: 'Apple Royal Gala 1kg', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '10 May 2025',
    time: '08:45 AM',
    amount: '210.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Processing',
    statusDate: '10 May 2025'
  },
  {
    id: '#GS10021',
    items: [
      { name: 'Tomato 1kg', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop&q=80' },
      { name: 'Onion 1kg', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '09 May 2025',
    time: '07:20 PM',
    amount: '58.00',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusDate: '09 May 2025'
  },
  {
    id: '#GS10020',
    items: [
      { name: 'Daawat Basmati Rice 1kg', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '08 May 2025',
    time: '06:10 PM',
    amount: '120.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Cancelled',
    statusDate: '08 May 2025'
  },
  {
    id: '#GS10019',
    items: [
      { name: 'Fresh Avocado 2pcs', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '07 May 2025',
    time: '05:30 PM',
    amount: '150.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Processing',
    statusDate: '07 May 2025'
  },
  {
    id: '#GS10018',
    items: [
      { name: 'Potato 1kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '06 May 2025',
    time: '04:15 PM',
    amount: '40.00',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusDate: '06 May 2025'
  },
  {
    id: '#GS10017',
    items: [
      { name: 'Amul Taaza Milk 1L', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&auto=format&fit=crop&q=80' }
    ],
    date: '05 May 2025',
    time: '02:10 PM',
    amount: '68.00',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
    statusDate: '05 May 2025'
  }
];

const ITEMS_PER_PAGE = 6;

const Orders = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Order Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState('Rahul Sharma');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderAddress, setNewOrderAddress] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([
    { id: 1, name: 'Fortune Oil 1L', price: 220, qty: 1, img: AVAILABLE_PRODUCTS[0].img },
    { id: 4, name: 'Banana 1 Dozen', price: 60, qty: 2, img: AVAILABLE_PRODUCTS[3].img }
  ]);
  const [gstTax, setGstTax] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('UPI');
  const [newOrderDate, setNewOrderDate] = useState('2025-11-12T10:35');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2025-11-15');

  const menuRef = useRef(null);
  const productDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Summary Counts
  const totalCount = orders.length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  // Search & Filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'All' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete order ${id}?`)) {
      setOrders((prev) => prev.filter((order) => order.id !== id));
      setOpenMenuId(null);
      if (currentOrders.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
    setOpenMenuId(null);
  };

  // Add Order Form Logic
  const handleAddProduct = (prod) => {
    const existing = orderItems.find((item) => item.id === prod.id);
    if (existing) {
      setOrderItems(orderItems.map((item) => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setOrderItems([...orderItems, { ...prod, qty: 1 }]);
    }
    setIsProductDropdownOpen(false);
    setProductSearch('');
  };

  const handleUpdateQty = (id, delta) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const subtotal = orderItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const taxAmount = Number(gstTax) || 0;
  const discountAmount = discountCode.toLowerCase() === 'save10' ? subtotal * 0.1 : discountCode ? 20 : 0;
  const totalOrderAmount = Math.max(0, subtotal + taxAmount - discountAmount).toFixed(2);

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    const newId = `#GS${10025 + orders.length}`;
    const dateObj = new Date(newOrderDate);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id: newId,
      items: orderItems.map((item) => ({ name: `${item.name}`, img: item.img })),
      date: formattedDate,
      time: formattedTime,
      amount: totalOrderAmount,
      paymentMethod: newPaymentMethod,
      paymentStatus: 'Paid',
      status: 'Processing',
      statusDate: formattedDate
    };

    setOrders([newOrder, ...orders]);
    setIsAddModalOpen(false);
    // Reset modal form
    setOrderItems([
      { id: 1, name: 'Fortune Oil 1L', price: 220, qty: 1, img: AVAILABLE_PRODUCTS[0].img }
    ]);
  };

  const filteredProducts = AVAILABLE_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="orders-container">
      {/* Top Summary Cards */}
      <div className="orders-cards-grid">
        <div
          className={`orders-card ${statusFilter === 'All' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
        >
          <div className="orders-card-icon icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Total Orders</p>
            <h3 className="orders-card-value">{totalCount}</h3>
            <span className="orders-card-link text-green">View all orders &rarr;</span>
          </div>
        </div>

        <div
          className={`orders-card ${statusFilter === 'Delivered' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('Delivered'); setCurrentPage(1); }}
        >
          <div className="orders-card-icon icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Delivered Orders</p>
            <h3 className="orders-card-value">{deliveredCount}</h3>
            <span className="orders-card-link text-emerald">View delivered &rarr;</span>
          </div>
        </div>

        <div
          className={`orders-card ${statusFilter === 'Processing' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('Processing'); setCurrentPage(1); }}
        >
          <div className="orders-card-icon icon-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Processing Orders</p>
            <h3 className="orders-card-value">{processingCount}</h3>
            <span className="orders-card-link text-orange">View processing &rarr;</span>
          </div>
        </div>

        <div
          className={`orders-card ${statusFilter === 'Cancelled' ? 'active-card' : ''}`}
          onClick={() => { setStatusFilter('Cancelled'); setCurrentPage(1); }}
        >
          <div className="orders-card-icon icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Cancelled Orders</p>
            <h3 className="orders-card-value">{cancelledCount}</h3>
            <span className="orders-card-link text-purple">View cancelled &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="orders-table-wrapper">
        <div className="orders-header">
          <h2 className="orders-title">My Orders</h2>

          <div className="orders-controls">
            {/* Search */}
            <div className="orders-search-box">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <svg className="orders-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            {/* Filter */}
            <div className="orders-filter-wrapper">
              <button
                className="orders-filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filter {statusFilter !== 'All' ? `(${statusFilter})` : ''}
              </button>

              {showFilterDropdown && (
                <div className="orders-filter-menu">
                  {['All', 'Delivered', 'Processing', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      className={`orders-filter-item ${statusFilter === status ? 'active' : ''}`}
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

            {/* Add New Order Button */}
            <button
              className="orders-add-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Order
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="orders-table-container">
          <table className="orders-table">
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
                    <td className="orders-id">{order.id}</td>
                    <td>
                      <div className="orders-items-cell">
                        <div className="orders-thumbs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="orders-thumb-wrapper">
                              <img src={item.img} alt={item.name} title={item.name} />
                            </div>
                          ))}
                        </div>
                        <div className="orders-items-info">
                          <p className="orders-item-names">
                            {order.items.map((i) => i.name).join(', ')}
                          </p>
                          <span className="orders-item-count">
                            {order.items.length} {order.items.length > 1 ? 'items' : 'item'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="orders-date-cell">
                        <div>{order.date}</div>
                        <div className="orders-subtext">{order.time}</div>
                      </div>
                    </td>
                    <td className="orders-amount">₹{order.amount}</td>
                    <td>
                      <div className="orders-payment-cell">
                        <div>{order.paymentMethod}</div>
                        <div className="orders-subtext">{order.paymentStatus}</div>
                      </div>
                    </td>
                    <td>
                      <div className={`orders-status-badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                        <span className="orders-status-date">{order.statusDate}</span>
                      </div>
                    </td>
                    <td>
                      <div className="orders-actions-cell">
                        <button
                          className="orders-action-btn delete-btn"
                          title="Delete Order"
                          onClick={() => handleDelete(order.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>

                        <button
                          className="orders-view-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          <span>View Details</span>
                        </button>

                        <div className="orders-menu-wrapper" ref={openMenuId === order.id ? menuRef : null}>
                          <button
                            className={`orders-action-btn menu-btn ${openMenuId === order.id ? 'active' : ''}`}
                            title="Update Status"
                            onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                          </button>

                          {openMenuId === order.id && (
                            <div className="orders-dropdown-menu">
                              <span className="orders-dropdown-header">Change Status</span>
                              <button
                                className={`orders-dropdown-item ${order.status === 'Delivered' ? 'selected' : ''}`}
                                onClick={() => handleStatusChange(order.id, 'Delivered')}
                              >
                                Delivered
                              </button>
                              <button
                                className={`orders-dropdown-item ${order.status === 'Processing' ? 'selected' : ''}`}
                                onClick={() => handleStatusChange(order.id, 'Processing')}
                              >
                                Processing
                              </button>
                              <button
                                className={`orders-dropdown-item ${order.status === 'Cancelled' ? 'selected' : ''}`}
                                onClick={() => handleStatusChange(order.id, 'Cancelled')}
                              >
                                Cancelled
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="orders-empty-state">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="orders-footer">
          <div className="orders-footer-text">
            Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </div>

          <div className="orders-pagination">
            <button
              className="orders-page-btn arrow-btn"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              title="Previous Page"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`orders-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handlePageClick(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="orders-page-btn arrow-btn"
              disabled={currentPage === totalPages || filteredOrders.length === 0}
              onClick={handleNextPage}
              title="Next Page"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedOrder && (
        <div className="orders-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="orders-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h3>Order Summary ({selectedOrder.id})</h3>
              <button className="orders-modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="orders-modal-body">
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Order Date:</strong> {selectedOrder.date} ({selectedOrder.time})</p>
              <p><strong>Total Amount:</strong> ₹{selectedOrder.amount}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod} - {selectedOrder.paymentStatus}</p>
              
              <h4 className="orders-modal-subtitle">Purchased Items:</h4>
              <div className="orders-modal-items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="orders-modal-item">
                    <img src={item.img} alt={item.name} className="orders-modal-img" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW ORDER MODAL */}
      {isAddModalOpen && (
        <div className="orders-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="orders-modal-content add-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h3 className="add-modal-title">Add New Order</h3>
              <button className="orders-modal-close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateOrder} className="add-order-form">
              <div className="form-section-title">Customer & Order Details</div>

              {/* Customer Info Row */}
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Customer</label>
                  <select
                    value={newOrderCustomer}
                    onChange={(e) => setNewOrderCustomer(e.target.value)}
                    className="form-input"
                  >
                    <option value="Rahul Sharma">Rahul Sharma</option>
                    <option value="Priya Patel">Priya Patel</option>
                    <option value="Amit Kumar">Amit Kumar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Customer Phone</label>
                  <input
                    type="text"
                    placeholder="Enter phone..."
                    value={newOrderPhone}
                    onChange={(e) => setNewOrderPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Shipping Address</label>
                  <input
                    type="text"
                    placeholder="Enter address..."
                    value={newOrderAddress}
                    onChange={(e) => setNewOrderAddress(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="add-order-items-grid">
                <div className="form-group relative" ref={productDropdownRef}>
                  <label>Items</label>
                  <div
                    className="product-search-input-wrap"
                    onClick={() => setIsProductDropdownOpen(true)}
                  >
                    <input
                      type="text"
                      placeholder="Search and Add Products"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsProductDropdownOpen(true);
                      }}
                      className="form-input product-search-input"
                    />
                    <svg className="dropdown-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  </div>

                  {isProductDropdownOpen && (
                    <div className="product-search-dropdown">
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="product-search-item"
                          onClick={() => handleAddProduct(prod)}
                        >
                          <img src={prod.img} alt={prod.name} className="product-item-img" />
                          <div className="product-item-info">
                            <span className="product-name">{prod.name}</span>
                            <span className="product-meta">Qty 1, ₹{prod.price}</span>
                          </div>
                          <span className="product-price">₹{prod.price}.00</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Items List */}
                <div className="selected-items-panel">
                  <div className="selected-items-header">
                    <span>Items</span>
                    <span>Qty</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="selected-items-list">
                    {orderItems.map((item, idx) => (
                      <div key={item.id} className="selected-item-row">
                        <div className="selected-item-name">
                          <span>{idx + 1}. {item.name}</span>
                          <small>(Qty {item.qty}, ₹{item.price})</small>
                        </div>
                        <div className="qty-counter">
                          <button type="button" onClick={() => handleUpdateQty(item.id, -1)}>&minus;</button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => handleUpdateQty(item.id, 1)}>&#43;</button>
                        </div>
                        <div className="selected-item-price">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="add-product-btn-wrap">
                    <button
                      type="button"
                      className="btn-add-product"
                      onClick={() => setIsProductDropdownOpen(true)}
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="pricing-grid">
                <div className="form-group">
                  <label>Order Subtotal</label>
                  <div className="read-only-box">₹{subtotal.toFixed(2)}</div>
                </div>
                <div className="form-group">
                  <label>GST/Tax</label>
                  <input
                    type="number"
                    placeholder="₹0.00"
                    value={gstTax}
                    onChange={(e) => setGstTax(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Discount</label>
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount</label>
                  <div className="total-amount-display">₹{totalOrderAmount}</div>
                </div>
              </div>

              {/* Payment & Shipping */}
              <div className="form-section-title">Payment & Shipping</div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="form-input"
                  >
                    <option value="UPI">UPI</option>
                    <option value="COD">COD</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Order Date/Time</label>
                  <input
                    type="datetime-local"
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-place-order">
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
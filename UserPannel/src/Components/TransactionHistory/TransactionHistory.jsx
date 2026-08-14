import React, { useState, useMemo, useRef, useEffect } from 'react';
import './TransactionHistory.css';

const INITIAL_TRANSACTIONS = [
  {
    id: 'GS1250513001',
    date: '13 May 2025',
    time: '10:45 AM',
    type: 'Order Payment',
    title: 'Order #GS1250',
    subtitle: 'Grocery Items',
    amount: 789.50,
    isDebit: true,
    status: 'Success',
    method: 'UPI',
    methodType: 'upi'
  },
  {
    id: 'GS1250512002',
    date: '12 May 2025',
    time: '08:30 PM',
    type: 'Order Payment',
    title: 'Order #GS1249',
    subtitle: 'Fruits & Vegetables',
    amount: 420.00,
    isDebit: true,
    status: 'Success',
    method: 'Credit Card',
    methodType: 'card'
  },
  {
    id: 'GS1250512003',
    date: '12 May 2025',
    time: '05:15 PM',
    type: 'Cashback Received',
    title: 'Cashback for Order #GS1248',
    subtitle: '',
    amount: 50.00,
    isDebit: false,
    status: 'Success',
    method: 'Grocery Sathi Wallet',
    methodType: 'wallet'
  },
  {
    id: 'GS1250511004',
    date: '11 May 2025',
    time: '11:20 AM',
    type: 'Order Payment',
    title: 'Order #GS1247',
    subtitle: 'Dairy Products',
    amount: 315.00,
    isDebit: true,
    status: 'Success',
    method: 'UPI',
    methodType: 'upi'
  },
  {
    id: 'GS1250510005',
    date: '10 May 2025',
    time: '09:10 PM',
    type: 'Wallet Topup',
    title: 'Added Money',
    subtitle: '',
    amount: 1000.00,
    isDebit: false,
    status: 'Success',
    method: 'Paytm Wallet',
    methodType: 'paytm'
  },
  {
    id: 'GS1250510006',
    date: '10 May 2025',
    time: '07:45 PM',
    type: 'Order Payment',
    title: 'Order #GS1246',
    subtitle: 'Kitchen Essentials',
    amount: 285.00,
    isDebit: true,
    status: 'Failed',
    method: 'UPI',
    methodType: 'upi'
  },
  {
    id: 'GS1250509007',
    date: '09 May 2025',
    time: '06:30 PM',
    type: 'Cashback Received',
    title: 'Cashback for Order #GS1245',
    subtitle: '',
    amount: 30.00,
    isDebit: false,
    status: 'Success',
    method: 'Grocery Sathi Wallet',
    methodType: 'wallet'
  },
  {
    id: 'GS1250508008',
    date: '08 May 2025',
    time: '02:15 PM',
    type: 'Order Payment',
    title: 'Order #GS1244',
    subtitle: 'Beverages & Snacks',
    amount: 540.00,
    isDebit: true,
    status: 'Success',
    method: 'UPI',
    methodType: 'upi'
  },
  {
    id: 'GS1250507009',
    date: '07 May 2025',
    time: '04:10 PM',
    type: 'Wallet Topup',
    title: 'Added Money',
    subtitle: '',
    amount: 1000.00,
    isDebit: false,
    status: 'Success',
    method: 'Credit Card',
    methodType: 'card'
  },
  {
    id: 'GS1250506010',
    date: '06 May 2025',
    time: '01:50 PM',
    type: 'Order Payment',
    title: 'Order #GS1243',
    subtitle: 'Personal Care',
    amount: 390.00,
    isDebit: true,
    status: 'Success',
    method: 'Grocery Sathi Wallet',
    methodType: 'wallet'
  },
  {
    id: 'GS1250505011',
    date: '05 May 2025',
    time: '11:05 AM',
    type: 'Cashback Received',
    title: 'Cashback for Order #GS1242',
    subtitle: '',
    amount: 70.00,
    isDebit: false,
    status: 'Success',
    method: 'Grocery Sathi Wallet',
    methodType: 'wallet'
  },
  {
    id: 'GS1250504012',
    date: '04 May 2025',
    time: '09:20 AM',
    type: 'Order Payment',
    title: 'Order #GS1241',
    subtitle: 'Fresh Bakery',
    amount: 180.00,
    isDebit: true,
    status: 'Success',
    method: 'UPI',
    methodType: 'upi'
  }
];

const ITEMS_PER_PAGE = 8;

const TransactionHistory = () => {
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.method.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Success' && t.status === 'Success') ||
        (selectedFilter === 'Failed' && t.status === 'Failed') ||
        (selectedFilter === 'Debit' && t.isDebit) ||
        (selectedFilter === 'Credit' && !t.isDebit);

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchTerm, selectedFilter]);

  // Pagination Logic (8 items per page)
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  // Helper for Payment Icons
  const renderPaymentIcon = (type) => {
    switch (type) {
      case 'upi':
        return (
          <span className="th-pay-icon upi-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M4 18L10 6L14 14L20 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        );
      case 'card':
        return (
          <span className="th-pay-icon card-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" fill="#3b82f6" />
              <line x1="2" y1="10" x2="22" y2="10" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </span>
        );
      case 'wallet':
        return (
          <span className="th-pay-icon wallet-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#10b981">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <circle cx="16" cy="12.5" r="1.5" fill="#ffffff" />
            </svg>
          </span>
        );
      case 'paytm':
        return (
          <span className="th-pay-icon paytm-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#0284c7">
              <path d="M4 8h16v8H4z" rx="1" />
              <path d="M7 11h2v3H7z" fill="#ffffff" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="th-container">
      {/* TOP 4 STAT CARDS */}
      <div className="th-cards-grid">
        {/* Card 1 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-green-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Total Transactions</span>
            <h3 className="th-card-value">28</h3>
            <span className="th-card-subtext">This Month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-green-solid">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.99 1-1.72V9c0-.73-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Total Spent</span>
            <h3 className="th-card-value">₹4,890.50</h3>
            <span className="th-card-subtext">This Month</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-blue-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Total Cashback</span>
            <h3 className="th-card-value">₹350.00</h3>
            <span className="th-card-subtext">This Month</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-orange-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Wallet Topup</span>
            <h3 className="th-card-value">₹2,000.00</h3>
            <span className="th-card-subtext">This Month</span>
          </div>
        </div>
      </div>

      {/* MAIN TRANSACTIONS TABLE WRAPPER */}
      <div className="th-table-wrapper">
        {/* Header Controls */}
        <div className="th-header">
          <h2 className="th-title">All Transactions</h2>

          <div className="th-controls">
            {/* Search Input */}
            <div className="th-search-box">
              <svg className="th-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter Button */}
            <div className="th-filter-wrapper" ref={filterRef}>
              <button
                type="button"
                className={`th-filter-btn ${isFilterOpen ? 'active' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>Filter</span>
              </button>

              {isFilterOpen && (
                <div className="th-filter-menu">
                  {['All', 'Success', 'Failed', 'Debit', 'Credit'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`th-filter-item ${selectedFilter === item ? 'selected' : ''}`}
                      onClick={() => handleFilterSelect(item)}
                    >
                      {item === 'Debit' ? 'Payments (Debit)' : item === 'Credit' ? 'Refunds/Cashback (Credit)' : item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="th-table-container">
          <table className="th-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    {/* Date & Time */}
                    <td>
                      <div className="th-cell-datetime">
                        <span className="th-date">{tx.date}</span>
                        <span className="th-time">{tx.time}</span>
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="th-tx-id">{tx.id}</td>

                    {/* Type with directional pill icon */}
                    <td>
                      <div className="th-type-cell">
                        <span
                          className={`th-type-badge-icon ${
                            tx.type === 'Wallet Topup'
                              ? 'type-topup'
                              : tx.isDebit
                              ? 'type-debit'
                              : 'type-credit'
                          }`}
                        >
                          {tx.isDebit ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <polyline points="19 12 12 19 5 12" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="19" x2="12" y2="5" />
                              <polyline points="5 12 12 5 19 12" />
                            </svg>
                          )}
                        </span>
                        <span className="th-type-text">{tx.type}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td>
                      <div className="th-desc-cell">
                        <span className="th-desc-title">{tx.title}</span>
                        {tx.subtitle && <span className="th-desc-sub">{tx.subtitle}</span>}
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className={`th-amount ${tx.isDebit ? 'amount-debit' : 'amount-credit'}`}>
                        {tx.isDebit ? `- ₹${tx.amount.toFixed(2)}` : `+ ₹${tx.amount.toFixed(2)}`}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`th-status-pill status-${tx.status.toLowerCase()}`}>
                        <span className="th-status-dot" />
                        {tx.status}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td>
                      <div className="th-method-cell">
                        {renderPaymentIcon(tx.methodType)}
                        <span>{tx.method}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="th-empty-row">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER (8 Items Per Page) */}
        <div className="th-footer">
          <div className="th-footer-count">
            Showing {filteredTransactions.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
          </div>

          <div className="th-pagination">
            <button
              type="button"
              className="th-page-nav"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`th-page-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="th-page-nav"
              disabled={currentPage === totalPages || filteredTransactions.length === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
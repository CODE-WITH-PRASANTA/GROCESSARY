import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReturnManagement.css';

const Icon = ({ name }) => {
  switch (name) {
    case 'export':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
    case 'download':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'print':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
    case 'refresh':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
    case 'search':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'eye':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'inspection':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    case 'refund':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case 'info':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
    case 'check-circle':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'repeat':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
    case 'truck':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'box':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case 'activity':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'chevron-down':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
    default:
      return null;
  }
};

const CustomDropdown = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="ReturnManagement-custom-dropdown" ref={dropdownRef}>
      <div 
        className="ReturnManagement-dropdown-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`ReturnManagement-dropdown-arrow ${isOpen ? 'open' : ''}`}>
          <Icon name="chevron-down" />
        </span>
      </div>
      {isOpen && (
        <div className="ReturnManagement-dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`ReturnManagement-dropdown-item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const INITIAL_DATA = [
  {
    id: 'RET-2026-00124',
    orderId: 'ORD-2026-08765',
    customer: { name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul@example.com' },
    product: { name: 'Amul Fresh Milk 1L', img: '🥛', sku: 'MILK-001', price: '₹60.00' },
    qty: 2,
    reason: 'Damaged Product',
    date: '20 May 2026',
    time: '10:20 AM',
    type: 'Refund',
    amount: '₹120.00',
    status: 'Pending',
    statusClass: 'pending',
    assignedTo: 'Neha Verma',
  },
  {
    id: 'RET-2026-00123',
    orderId: 'ORD-2026-08762',
    customer: { name: 'Priya Singh', phone: '+91 9123456780', email: 'priya@example.com' },
    product: { name: 'Fortune Sunflower Oil 1L', img: '🍾', sku: 'OIL-004', price: '₹180.00' },
    qty: 1,
    reason: 'Wrong Product',
    date: '19 May 2026',
    time: '04:15 PM',
    type: 'Replacement',
    amount: '₹0.00',
    status: 'Pickup Scheduled',
    statusClass: 'scheduled',
    assignedTo: 'Amit Kumar',
  },
  {
    id: 'RET-2026-00122',
    orderId: 'ORD-2026-08760',
    customer: { name: 'Vikash Yadav', phone: '+91 9988776655', email: 'vikash@example.com' },
    product: { name: 'Fresh Apples 1kg', img: '🍎', sku: 'FRUIT-012', price: '₹85.00' },
    qty: 1,
    reason: 'Poor Quality',
    date: '19 May 2026',
    time: '11:05 AM',
    type: 'Refund',
    amount: '₹85.00',
    status: 'In Inspection',
    statusClass: 'inspection',
    assignedTo: 'Rohit Das',
  },
  {
    id: 'RET-2026-00121',
    orderId: 'ORD-2026-08758',
    customer: { name: 'Meena Patel', phone: '+91 9090909090', email: 'meena@example.com' },
    product: { name: 'Tata Salt 1kg', img: '🧂', sku: 'SALT-002', price: '₹20.00' },
    qty: 2,
    reason: 'Customer Changed Mind',
    date: '18 May 2026',
    time: '02:30 PM',
    type: 'Refund',
    amount: '₹40.00',
    status: 'Refund Processing',
    statusClass: 'processing',
    assignedTo: 'Neha Verma',
  }
];

const ReturnManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('This Month');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.id.toLowerCase().includes(query) ||
        item.orderId.toLowerCase().includes(query) ||
        item.customer.name.toLowerCase().includes(query) ||
        item.product.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRangeFilter('This Month');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const handleStatusUpdate = (newStatus, statusClass) => {
    if (!selectedRowId) {
      alert('Please select a return record from the table first.');
      return;
    }
    setData((prev) =>
      prev.map((item) =>
        item.id === selectedRowId ? { ...item, status: newStatus, statusClass } : item
      )
    );
  };

  const handleViewAction = (actionType, item = null) => {
    const targetData = item || data.find((d) => d.id === selectedRowId);
    if (!targetData) {
      alert('Please select a row from the table first.');
      return;
    }
    
    const routes = {
      'Return Details': '/returns/details',
      'Quality Inspection': '/returns/inspection',
      'Refund Details': '/returns/refund',
      'Product Info': '/returns/product-info',
      'Return Approval': '/returns/approval',
      'Replacement Details': '/returns/replacement-details',
      'Pickup Management': '/returns/pickup-management',
      'Inventory Adjustment': '/returns/inventory-adjustment',
      'Activity Log': '/returns/activity-log',
    };
    
    if(routes[actionType]) {
        navigate(routes[actionType], { state: { returnData: targetData } });
    }
  };

  return (
    <div className="ReturnManagement-container">
      {/* Header */}
      <div className="ReturnManagement-header">
        <div className="ReturnManagement-header-text">
          <h1 className="ReturnManagement-title">Return Management</h1>
          <div className="ReturnManagement-breadcrumb">
            Dashboard <span>/</span> Orders <span>/</span> Return Management
          </div>
        </div>

        <div className="ReturnManagement-top-actions">
          <button className="ReturnManagement-btn" onClick={() => alert('Exporting CSV...')}>
            <Icon name="export" /> <span>Export</span>
          </button>
          <button className="ReturnManagement-btn" onClick={() => alert('Generating PDF...')}>
            <Icon name="download" /> <span>Report</span>
          </button>
          <button className="ReturnManagement-btn ReturnManagement-hide-mobile" onClick={() => window.print()}>
            <Icon name="print" /> <span>Print</span>
          </button>
          <button className="ReturnManagement-btn" onClick={() => setData([...INITIAL_DATA])}>
            <Icon name="refresh" /> <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="ReturnManagement-metrics">
        {[
          { icon: '🛒', color: 'green', label: 'Return Requests', val: '124', sub: 'Total Requests' },
          { icon: '⏳', color: 'yellow', label: 'Pending Approval', val: '18', sub: 'Awaiting Review' },
          { icon: '✓', color: 'emerald', label: 'Approved', val: '74', sub: 'This Month' },
          { icon: '✕', color: 'red', label: 'Rejected', val: '12', sub: 'This Month' },
          { icon: '↺', color: 'blue', label: 'Refund Completed', val: '56', sub: 'This Month' },
          { icon: '📦', color: 'purple', label: 'Replacement Pending', val: '9', sub: 'Awaiting Dispatch' },
          { icon: '⇄', color: 'cyan', label: 'Exchange Done', val: '20', sub: 'This Month' },
          { icon: '₹', color: 'lime', label: 'Total Value', val: '₹85.6k', sub: 'This Month' },
        ].map((metric, idx) => (
          <div className="ReturnManagement-card" key={idx}>
            <div className={`ReturnManagement-card-icon ReturnManagement-icon-${metric.color}`}>{metric.icon}</div>
            <div className="ReturnManagement-card-content">
              <div className="ReturnManagement-card-label">{metric.label}</div>
              <div className="ReturnManagement-card-val">{metric.val}</div>
              <div className="ReturnManagement-card-sub">{metric.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="ReturnManagement-panel">
        <div className="ReturnManagement-filters">
          <div className="ReturnManagement-search-box">
            <span className="ReturnManagement-search-icon"><Icon name="search" /></span>
            <input
              type="text"
              placeholder="Search ID, Customer, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ReturnManagement-filter-dropdowns">
            <div className="ReturnManagement-select-wrap">
              <CustomDropdown
                value={dateRangeFilter}
                placeholder="Date Range"
                options={[
                  { value: 'Today', label: 'Today' },
                  { value: 'This Week', label: 'This Week' },
                  { value: 'This Month', label: 'This Month' }
                ]}
                onChange={setDateRangeFilter}
              />
            </div>
            
            <div className="ReturnManagement-select-wrap">
              <CustomDropdown
                value={statusFilter}
                placeholder="All Statuses"
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Pickup Scheduled', label: 'Pickup Scheduled' },
                  { value: 'In Inspection', label: 'In Inspection' },
                  { value: 'Refund Processing', label: 'Refund Processing' }
                ]}
                onChange={setStatusFilter}
              />
            </div>

            <button className="ReturnManagement-btn ReturnManagement-btn-clear" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="ReturnManagement-table-wrapper">
          <table className="ReturnManagement-table">
            <thead>
              <tr>
                <th className="ReturnManagement-col-check"></th>
                <th>Return ID</th>
                <th>Order ID</th>
                <th>Customer Details</th>
                <th>Product Information</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Assignee</th>
                <th className="ReturnManagement-text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedRowId === row.id ? 'ReturnManagement-row-selected' : ''}
                    onClick={() => setSelectedRowId(row.id)}
                  >
                    <td className="ReturnManagement-col-check">
                      <div className="ReturnManagement-radio-wrapper">
                        <input
                          type="radio"
                          name="selectedReturn"
                          checked={selectedRowId === row.id}
                          onChange={() => setSelectedRowId(row.id)}
                        />
                      </div>
                    </td>
                    <td className="ReturnManagement-code">{row.id}</td>
                    <td className="ReturnManagement-code-alt">{row.orderId}</td>
                    <td>
                      <div className="ReturnManagement-name">{row.customer.name}</div>
                      <div className="ReturnManagement-sub">{row.customer.phone}</div>
                    </td>
                    <td>
                      <div className="ReturnManagement-product">
                        <span className="ReturnManagement-product-icon">{row.product.img}</span>
                        <div className="ReturnManagement-product-details">
                          <span className="ReturnManagement-product-name">{row.product.name}</span>
                          <span className="ReturnManagement-product-sku">{row.product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="ReturnManagement-font-semibold">{row.qty}</td>
                    <td><span className="ReturnManagement-reason-pill">{row.reason}</span></td>
                    <td>
                      <div className="ReturnManagement-date">{row.date}</div>
                      <div className="ReturnManagement-sub">{row.time}</div>
                    </td>
                    <td className="ReturnManagement-font-medium">{row.type}</td>
                    <td className="ReturnManagement-bold">{row.amount}</td>
                    <td>
                      <span className={`ReturnManagement-badge ReturnManagement-badge-${row.statusClass}`}>
                        <span className="ReturnManagement-badge-dot" /> {row.status}
                      </span>
                    </td>
                    <td>{row.assignedTo}</td>
                    <td className="ReturnManagement-text-right">
                      <div className="ReturnManagement-row-actions">
                        <button className="ReturnManagement-table-btn" title="View Details" onClick={(e) => { e.stopPropagation(); handleViewAction('Return Details', row); }}><Icon name="eye" /></button>
                        <button className="ReturnManagement-table-btn" title="Inspect" onClick={(e) => { e.stopPropagation(); handleViewAction('Quality Inspection', row); }}><Icon name="inspection" /></button>
                        <button className="ReturnManagement-table-btn" title="Refund Info" onClick={(e) => { e.stopPropagation(); handleViewAction('Refund Details', row); }}><Icon name="refund" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="ReturnManagement-empty-state">No return records found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ReturnManagement-pagination-bar">
          <div className="ReturnManagement-entries-count">
            Showing <span>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of {filteredData.length} entries
          </div>
          <div className="ReturnManagement-pagination">
            <button className="ReturnManagement-page-nav" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>&lt;</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                className={`ReturnManagement-page-btn ${currentPage === i + 1 ? 'ReturnManagement-page-active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="ReturnManagement-page-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Expandable Footer Actions */}
      <div className="ReturnManagement-footer">
        {selectedRowId && (
            <div className="ReturnManagement-footer-selection-label">
                Active Selection: <strong>{selectedRowId}</strong>
            </div>
        )}
        
        <div className="ReturnManagement-footer-nav-scroll">
          <button className="ReturnManagement-action-btn ReturnManagement-btn-details" onClick={() => handleViewAction('Return Details')}><Icon name="eye" /> Return Details</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-inspection" onClick={() => handleViewAction('Quality Inspection')}><Icon name="inspection" /> Quality Inspection</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-refund-details" onClick={() => handleViewAction('Refund Details')}><Icon name="refund" /> Refund Details</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-product-info" onClick={() => handleViewAction('Product Info')}><Icon name="info" /> Product Info</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-approval" onClick={() => handleViewAction('Return Approval')}><Icon name="check-circle" /> Return Approval</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-replacement" onClick={() => handleViewAction('Replacement Details')}><Icon name="repeat" /> Replacement Details</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-pickup" onClick={() => handleViewAction('Pickup Management')}><Icon name="truck" /> Pickup Management</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-inventory" onClick={() => handleViewAction('Inventory Adjustment')}><Icon name="box" /> Inventory Adjustment</button>
          <button className="ReturnManagement-action-btn ReturnManagement-btn-activity" onClick={() => handleViewAction('Activity Log')}><Icon name="activity" /> Activity</button>
        </div>

        <div className="ReturnManagement-footer-state-actions">
          <button className="ReturnManagement-state-btn ReturnManagement-btn-approve" onClick={() => handleStatusUpdate('Approved', 'scheduled')}>
             Approve Return
          </button>
          <button className="ReturnManagement-state-btn ReturnManagement-btn-reject" onClick={() => handleStatusUpdate('Rejected', 'pending')}>
             Reject Return
          </button>
          <button className="ReturnManagement-state-btn ReturnManagement-btn-process" onClick={() => handleStatusUpdate('Refund Processed', 'processing')}>
             Process Refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnManagement;
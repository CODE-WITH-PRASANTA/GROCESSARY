import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Upload,
  X,
  Truck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import './Order.css';

// Anchor date so "Today / This Week / This Month" chips behave predictably
// against the mock data below, regardless of the real current date.
const TODAY = new Date('2026-07-24');

const AVATAR_COLORS = ['#e0e7ff', '#dcfce7', '#fef3c7', '#fee2e2', '#e0f2fe', '#f3e8ff'];
const AVATAR_TEXT = ['#4338ca', '#15803d', '#b45309', '#b91c1c', '#0369a1', '#7e22ce'];

const initialOrders = [
  { id: 'ORD12345', refCode: 'GRO-S4587', customer: 'Rahul Kumar', email: 'rahul@gmail.com', items: 8, amount: 1049.00, amountUsd: 125.80, paymentMethod: 'Online', paymentStatus: 'Paid', status: 'Delivered', date: '2026-07-24', time: '10:30 AM' },
  { id: 'ORD12344', refCode: 'GRO-S4586', customer: 'Priya Sharma', email: 'priya@gmail.com', items: 5, amount: 654.00, amountUsd: 78.60, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'Processing', date: '2026-07-24', time: '09:45 AM' },
  { id: 'ORD12343', refCode: 'GRO-S4585', customer: 'Amit Verma', email: 'amit@gmail.com', items: 12, amount: 1745.00, amountUsd: 210.20, paymentMethod: 'Credit Card', paymentStatus: 'Paid', status: 'Shipped', date: '2026-07-24', time: '08:20 AM' },
  { id: 'ORD12342', refCode: 'GRO-S4584', customer: 'Neha Singh', email: 'neha@gmail.com', items: 3, amount: 378.00, amountUsd: 45.30, paymentMethod: 'Cash on Delivery', paymentStatus: 'COD', status: 'Pending', date: '2026-07-23', time: '07:15 PM' },
  { id: 'ORD12341', refCode: 'GRO-S4583', customer: 'Vikash Gupta', email: 'vikash@gmail.com', items: 7, amount: 815.00, amountUsd: 98.00, paymentMethod: 'Wallet', paymentStatus: 'Paid', status: 'Delivered', date: '2026-07-23', time: '06:10 PM' },
  { id: 'ORD12340', refCode: 'GRO-S4582', customer: 'Pooja Patel', email: 'pooja@gmail.com', items: 4, amount: 504.00, amountUsd: 60.50, paymentMethod: 'UPI', paymentStatus: 'Failed', status: 'Cancelled', date: '2026-07-23', time: '05:40 PM' },
  { id: 'ORD12339', refCode: 'GRO-S4581', customer: 'Ramesh Yadav', email: 'ramesh@gmail.com', items: 6, amount: 916.00, amountUsd: 110.00, paymentMethod: 'Net Banking', paymentStatus: 'Paid', status: 'Delivered', date: '2026-07-23', time: '04:25 PM' },
  { id: 'ORD12338', refCode: 'GRO-S4580', customer: 'Anjali Rao', email: 'anjali@gmail.com', items: 2, amount: 240.00, amountUsd: 28.90, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'Processing', date: '2026-07-22', time: '11:05 AM' },
  { id: 'ORD12337', refCode: 'GRO-S4579', customer: 'Suresh Nair', email: 'suresh@gmail.com', items: 9, amount: 1320.00, amountUsd: 158.60, paymentMethod: 'Credit Card', paymentStatus: 'Paid', status: 'Shipped', date: '2026-07-21', time: '02:50 PM' },
  { id: 'ORD12336', refCode: 'GRO-S4578', customer: 'Kavita Joshi', email: 'kavita@gmail.com', items: 1, amount: 120.00, amountUsd: 14.40, paymentMethod: 'Cash on Delivery', paymentStatus: 'COD', status: 'Pending', date: '2026-07-20', time: '09:00 AM' },
  { id: 'ORD12335', refCode: 'GRO-S4577', customer: 'Deepak Menon', email: 'deepak@gmail.com', items: 11, amount: 1590.00, amountUsd: 191.00, paymentMethod: 'Wallet', paymentStatus: 'Paid', status: 'Delivered', date: '2026-07-18', time: '01:15 PM' },
  { id: 'ORD12334', refCode: 'GRO-S4576', customer: 'Meena Iyer', email: 'meena@gmail.com', items: 6, amount: 742.00, amountUsd: 89.20, paymentMethod: 'UPI', paymentStatus: 'Paid', status: 'Delivered', date: '2026-07-15', time: '03:30 PM' },
];

const statusMeta = {
  Delivered: { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
  Processing: { color: '#d97706', bg: '#fef3c7', icon: RefreshCw },
  Shipped: { color: '#2563eb', bg: '#dbeafe', icon: Truck },
  Pending: { color: '#d97706', bg: '#fef3c7', icon: Clock },
  Cancelled: { color: '#dc2626', bg: '#fee2e2', icon: XCircle },
};

const paymentBadgeMeta = {
  Paid: { color: '#16a34a', bg: '#dcfce7' },
  COD: { color: '#475569', bg: '#f1f5f9' },
  Failed: { color: '#dc2626', bg: '#fee2e2' },
};

const topProducts = [
  { name: 'Basmati Rice 5kg', orders: 240, emoji: '🍚', bg: '#f1f5f9' },
  { name: 'Fortune Sunflower Oil 1L', orders: 210, emoji: '🛢️', bg: '#fef3c7' },
  { name: 'Tata Salt 1kg', orders: 185, emoji: '🧂', bg: '#fee2e2' },
  { name: 'Toor Dal 1kg', orders: 150, emoji: '🫘', bg: '#fef9c3' },
  { name: 'Aashirvaad Atta 5kg', orders: 130, emoji: '🌾', bg: '#fee2e2' },
];

const formatINR = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const emptyForm = { customer: '', email: '', items: 1, amount: '', paymentMethod: 'Online', paymentStatus: 'Paid', status: 'Pending' };

const Order = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payment Status');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [quickChip, setQuickChip] = useState('All Time');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewOrder, setViewOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  // ---------- Derived stats (always from the full order list) ----------
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const processing = orders.filter((o) => o.status === 'Processing').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    return { total, pending, processing, delivered, cancelled };
  }, [orders]);

  const donutData = useMemo(() => {
    const total = orders.length || 1;
    const counts = {
      Delivered: orders.filter((o) => o.status === 'Delivered').length,
      Processing: orders.filter((o) => o.status === 'Processing').length,
      Pending: orders.filter((o) => o.status === 'Pending').length,
      Shipped: orders.filter((o) => o.status === 'Shipped').length,
      Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    };
    const colors = { Delivered: '#22c55e', Processing: '#f59e0b', Pending: '#fb923c', Shipped: '#3b82f6', Cancelled: '#ef4444' };
    let cursor = 0;
    const segments = Object.entries(counts).map(([label, count]) => {
      const pct = (count / total) * 100;
      const seg = { label, count, pct, color: colors[label], start: cursor };
      cursor += pct;
      return seg;
    });
    return { segments, total: orders.length };
  }, [orders]);

  // ---------- Filtering ----------
  const matchesQuickChip = (order) => {
    if (quickChip === 'All Time') return true;
    const d = new Date(order.date);
    if (quickChip === 'Today') {
      return d.toDateString() === TODAY.toDateString();
    }
    if (quickChip === 'This Week') {
      const weekAgo = new Date(TODAY);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= TODAY;
    }
    if (quickChip === 'This Month') {
      return d.getMonth() === TODAY.getMonth() && d.getFullYear() === TODAY.getFullYear();
    }
    return true;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        o.id.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.email.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'All Status' || o.status === statusFilter;
      const matchesPayment = paymentFilter === 'All Payment Status' || o.paymentStatus === paymentFilter;

      const orderDate = new Date(o.date);
      const matchesStart = !dateStart || orderDate >= new Date(dateStart);
      const matchesEnd = !dateEnd || orderDate <= new Date(dateEnd);

      return matchesSearch && matchesStatus && matchesPayment && matchesStart && matchesEnd && matchesQuickChip(o);
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateStart, dateEnd, quickChip]);

  // Reset to page 1 whenever the filtered result set changes shape
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, dateStart, dateEnd, quickChip]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageOrders = filteredOrders.slice(pageStart, pageStart + pageSize);

  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) pages.push(p);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  }, [totalPages, safePage]);

  // ---------- Selection ----------
  const allVisibleSelected = pageOrders.length > 0 && pageOrders.every((o) => selectedIds.has(o.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        pageOrders.forEach((o) => next.delete(o.id));
      } else {
        pageOrders.forEach((o) => next.add(o.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ---------- Actions ----------
  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setSearchTerm('');
      setStatusFilter('All Status');
      setPaymentFilter('All Payment Status');
      setDateStart('');
      setDateEnd('');
      setQuickChip('All Time');
      setSelectedIds(new Set());
      setIsRefreshing(false);
      showToast('Orders refreshed');
    }, 650);
  };

  const handleExport = () => {
    const header = ['Order ID', 'Customer', 'Email', 'Items', 'Amount (INR)', 'Payment Method', 'Payment Status', 'Status', 'Date', 'Time'];
    const rows = filteredOrders.map((o) => [o.id, o.customer, o.email, o.items, o.amount, o.paymentMethod, o.paymentStatus, o.status, o.date, o.time]);
    const csv = [header, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${filteredOrders.length}-rows.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredOrders.length} orders`);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = String(evt.target.result || '');
        const lines = text.split(/\r?\n/).filter(Boolean);
        const dataLines = lines[0]?.toLowerCase().includes('customer') ? lines.slice(1) : lines;

        const imported = dataLines.map((line, idx) => {
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          const [customer = `Imported Customer ${idx + 1}`, email = '', items = '1', amount = '0'] = cols;
          const nextNum = 12345 + orders.length + idx + 1;
          return {
            id: `ORD${nextNum}`,
            refCode: `GRO-S${4587 + orders.length + idx + 1}`,
            customer,
            email: email || 'unknown@example.com',
            items: parseInt(items, 10) || 1,
            amount: parseFloat(amount) || 0,
            amountUsd: (parseFloat(amount) || 0) / 83,
            paymentMethod: 'Online',
            paymentStatus: 'Paid',
            status: 'Pending',
            date: TODAY.toISOString().slice(0, 10),
            time: '12:00 PM',
          };
        });

        setOrders((prev) => [...imported, ...prev]);
        showToast(`Imported ${imported.length} order${imported.length === 1 ? '' : 's'}`);
      } catch (err) {
        showToast('Could not read that file — expected a CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!form.customer.trim() || !form.amount) return;

    const nextNum = 12345 + orders.length + 1;
    const newOrder = {
      id: `ORD${nextNum}`,
      refCode: `GRO-S${4587 + orders.length + 1}`,
      customer: form.customer.trim(),
      email: form.email.trim() || 'unknown@example.com',
      items: Number(form.items) || 1,
      amount: Number(form.amount) || 0,
      amountUsd: (Number(form.amount) || 0) / 83,
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      status: form.status,
      date: TODAY.toISOString().slice(0, 10),
      time: '12:00 PM',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setForm(emptyForm);
    setShowAddModal(false);
    showToast(`Order ${newOrder.id} created`);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setPaymentFilter('All Payment Status');
    setDateStart('');
    setDateEnd('');
    setQuickChip('All Time');
  };

  const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const avatarStyle = (idx) => ({ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: AVATAR_TEXT[idx % AVATAR_TEXT.length] });

  return (
    <div className="Order">
      {/* Header */}
      <div className="Order-header">
        <div>
          <h1 className="Order-title">Orders</h1>
          <div className="Order-breadcrumb">
            <span>Dashboard</span>
            <ChevronRight size={13} />
            <span>Orders</span>
            <ChevronRight size={13} />
            <span className="Order-breadcrumb-current">All Orders</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="Order-stats">
        <div className="Order-stat-card">
          <div className="Order-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShoppingBag size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Total Orders</p>
            <p className="Order-stat-value">{stats.total}</p>
            <span className="Order-stat-delta up"><ArrowUp size={12} /> 12.5% this month</span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div className="Order-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Pending Orders</p>
            <p className="Order-stat-value">{stats.pending}</p>
            <span className="Order-stat-delta up"><ArrowUp size={12} /> 5.2% this month</span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div className="Order-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <RefreshCw size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Processing Orders</p>
            <p className="Order-stat-value">{stats.processing}</p>
            <span className="Order-stat-delta up"><ArrowUp size={12} /> 8.1% this month</span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div className="Order-stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Delivered Orders</p>
            <p className="Order-stat-value">{stats.delivered}</p>
            <span className="Order-stat-delta up"><ArrowUp size={12} /> 15.3% this month</span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div className="Order-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Cancelled Orders</p>
            <p className="Order-stat-value">{stats.cancelled}</p>
            <span className="Order-stat-delta down"><ArrowDown size={12} /> 2.1% this month</span>
          </div>
        </div>
      </div>

      <div className="Order-layout">
        {/* Main column */}
        <div className="Order-main">
          {/* Filters bar */}
          <div className="Order-filters-card">
            <div className="Order-filters-row">
              <div className="Order-field Order-field-search">
                <label>Search Order</label>
                <div className="Order-search-box">
                  <Search size={16} className="Order-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="Order-field">
                <label>Order Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>

              <div className="Order-field">
                <label>Payment Status</label>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                  <option>All Payment Status</option>
                  <option>Paid</option>
                  <option>COD</option>
                  <option>Failed</option>
                </select>
              </div>

              <div className="Order-field">
                <label>Date Range</label>
                <div className="Order-date-range">
                  <Calendar size={15} />
                  <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
                  <span>–</span>
                  <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                </div>
              </div>

              <button
                type="button"
                className={`Order-btn Order-btn-outline ${showFilterPanel ? 'active' : ''}`}
                onClick={() => setShowFilterPanel((v) => !v)}
              >
                <Filter size={15} /> Filters
              </button>
            </div>

            {showFilterPanel && (
              <div className="Order-quick-chips">
                {['Today', 'This Week', 'This Month', 'All Time'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={`Order-chip ${quickChip === chip ? 'active' : ''}`}
                    onClick={() => setQuickChip(chip)}
                  >
                    {chip}
                  </button>
                ))}
                <button type="button" className="Order-chip Order-chip-clear" onClick={clearAllFilters}>
                  Clear all filters
                </button>
              </div>
            )}

            <div className="Order-actions-row">
              <span className="Order-result-count">
                {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'} found
                {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}
              </span>
              <div className="Order-actions-buttons">
                <button type="button" className="Order-btn Order-btn-outline" onClick={handleImportClick}>
                  <Upload size={15} /> Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
                <button type="button" className="Order-btn Order-btn-outline" onClick={handleExport}>
                  <Download size={15} /> Export
                </button>
                <button type="button" className="Order-btn Order-btn-primary" onClick={handleRefresh}>
                  <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} /> Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="Order-table-card">
            <div className="Order-table-scroll">
              <table className="Order-table">
                <thead>
                  <tr>
                    <th className="Order-th-check">
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
                    </th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="Order-empty-row">No orders match your filters.</td>
                    </tr>
                  )}
                  {pageOrders.map((o, idx) => {
                    const meta = statusMeta[o.status] || statusMeta.Pending;
                    const StatusIcon = meta.icon;
                    const payMeta = paymentBadgeMeta[o.paymentStatus] || paymentBadgeMeta.COD;
                    return (
                      <tr key={o.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(o.id)}
                            onChange={() => toggleSelectOne(o.id)}
                          />
                        </td>
                        <td>
                          <p className="Order-cell-strong">#{o.id}</p>
                          <p className="Order-cell-muted">{o.refCode}</p>
                        </td>
                        <td>
                          <div className="Order-customer-cell">
                            <div className="Order-avatar" style={avatarStyle(idx)}>{initials(o.customer)}</div>
                            <div>
                              <p className="Order-cell-strong">{o.customer}</p>
                              <p className="Order-cell-muted">{o.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="Order-cell-strong">{o.items} Items</p>
                          <button type="button" className="Order-view-items-link" onClick={() => setViewOrder(o)}>
                            View Items
                          </button>
                        </td>
                        <td>
                          <p className="Order-cell-strong">${o.amountUsd.toFixed(2)}</p>
                          <p className="Order-cell-muted">{formatINR(o.amount)}</p>
                        </td>
                        <td>
                          <span className="Order-badge" style={{ background: payMeta.bg, color: payMeta.color }}>
                            {o.paymentStatus}
                          </span>
                          <p className="Order-cell-muted" style={{ marginTop: 3 }}>{o.paymentMethod}</p>
                        </td>
                        <td>
                          <span className="Order-status-badge" style={{ background: meta.bg, color: meta.color }}>
                            {o.status} <StatusIcon size={12} />
                          </span>
                        </td>
                        <td>
                          <p className="Order-cell-strong">{new Date(o.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="Order-cell-muted">{o.time}</p>
                        </td>
                        <td>
                          <button type="button" className="Order-icon-btn" onClick={() => setViewOrder(o)} aria-label="View order">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="Order-pagination">
              <span className="Order-pagination-info">
                Showing {filteredOrders.length === 0 ? 0 : pageStart + 1} to {Math.min(pageStart + pageSize, filteredOrders.length)} of {filteredOrders.length} orders
              </span>

              <div className="Order-pagination-controls">
                <button type="button" className="Order-page-btn" disabled={safePage === 1} onClick={() => setCurrentPage(1)}>
                  <ChevronsLeft size={15} />
                </button>
                <button type="button" className="Order-page-btn" disabled={safePage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="Order-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`Order-page-btn ${p === safePage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button type="button" className="Order-page-btn" disabled={safePage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={15} />
                </button>
                <button type="button" className="Order-page-btn" disabled={safePage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                  <ChevronsRight size={15} />
                </button>
              </div>

              <div className="Order-pagesize">
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="Order-side">
          <div className="Order-card">
            <div className="Order-card-header">
              <h3>Order Summary</h3>
              <select defaultValue="This Month" className="Order-mini-select">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="Order-donut-wrap">
              <div
                className="Order-donut"
                style={{
                  background: `conic-gradient(${donutData.segments
                    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
                    .join(', ')})`,
                }}
              >
                <div className="Order-donut-hole">
                  <span className="Order-donut-total">{donutData.total}</span>
                  <span className="Order-donut-caption">Total Orders</span>
                </div>
              </div>

              <ul className="Order-legend">
                {donutData.segments.map((s) => (
                  <li key={s.label}>
                    <span className="Order-legend-dot" style={{ background: s.color }} />
                    <span className="Order-legend-label">{s.label}</span>
                    <span className="Order-legend-value">{s.count} ({s.pct.toFixed(1)}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="Order-card">
            <div className="Order-card-header">
              <h3>Top Selling Products</h3>
              <button type="button" className="Order-link-btn">View All</button>
            </div>
            <ul className="Order-product-list">
              {topProducts.map((p) => (
                <li key={p.name}>
                  <div className="Order-product-thumb" style={{ background: p.bg }}>{p.emoji}</div>
                  <div>
                    <p className="Order-cell-strong">{p.name}</p>
                    <p className="Order-cell-muted">{p.orders} Orders</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="Order-card">
            <h3 className="Order-quick-title">Quick Actions</h3>
            <div className="Order-quick-actions">
              <button type="button" className="Order-btn Order-btn-primary Order-quick-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={15} /> Add New Order
              </button>
              <button type="button" className="Order-btn Order-btn-outline Order-quick-btn" onClick={handleImportClick}>
                <Upload size={15} /> Import Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View order modal */}
      {viewOrder && (
        <div className="Order-modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="Order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="Order-modal-header">
              <h3>Order #{viewOrder.id}</h3>
              <button type="button" className="Order-icon-btn" onClick={() => setViewOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="Order-modal-body">
              <div className="Order-modal-row"><span>Customer</span><strong>{viewOrder.customer}</strong></div>
              <div className="Order-modal-row"><span>Email</span><strong>{viewOrder.email}</strong></div>
              <div className="Order-modal-row"><span>Items</span><strong>{viewOrder.items} items</strong></div>
              <div className="Order-modal-row"><span>Amount</span><strong>{formatINR(viewOrder.amount)}</strong></div>
              <div className="Order-modal-row"><span>Payment</span><strong>{viewOrder.paymentMethod} · {viewOrder.paymentStatus}</strong></div>
              <div className="Order-modal-row">
                <span>Status</span>
                <strong style={{ color: (statusMeta[viewOrder.status] || {}).color }}>{viewOrder.status}</strong>
              </div>
              <div className="Order-modal-row"><span>Placed on</span><strong>{viewOrder.date} · {viewOrder.time}</strong></div>
              <div className="Order-modal-row"><span>Reference</span><strong>{viewOrder.refCode}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Add order modal */}
      {showAddModal && (
        <div className="Order-modal-overlay" onClick={() => setShowAddModal(false)}>
          <form className="Order-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleAddOrder}>
            <div className="Order-modal-header">
              <h3>Add New Order</h3>
              <button type="button" className="Order-icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="Order-modal-body">
              <label className="Order-form-label">Customer Name
                <input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
              </label>
              <label className="Order-form-label">Email
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <div className="Order-form-grid">
                <label className="Order-form-label">Items
                  <input type="number" min="1" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
                </label>
                <label className="Order-form-label">Amount (INR)
                  <input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </label>
              </div>
              <div className="Order-form-grid">
                <label className="Order-form-label">Payment Method
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                    <option>Online</option>
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Cash on Delivery</option>
                    <option>Wallet</option>
                    <option>Net Banking</option>
                  </select>
                </label>
                <label className="Order-form-label">Payment Status
                  <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                    <option>Paid</option>
                    <option>COD</option>
                    <option>Failed</option>
                  </select>
                </label>
              </div>
              <label className="Order-form-label">Order Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </label>
            </div>
            <div className="Order-modal-footer">
              <button type="button" className="Order-btn Order-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="Order-btn Order-btn-primary">Create Order</button>
            </div>
          </form>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="Order-toast">{toast}</div>}
    </div>
  );
};

export default Order;
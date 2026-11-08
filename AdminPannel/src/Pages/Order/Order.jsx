import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Calendar,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
  Send,
  Building2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import API, { BASE_URL } from "../../api/axios";
import { downloadOrderInvoicePdf } from "../../Utils/directInvoiceDownloader";
import InvoiceModal from "../../Components/InvoiceModal/InvoiceModal";
import "./Order.css";

const Order = () => {
  // =======================================================
  // STATES
  // =======================================================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [previewInvoiceOrder, setPreviewInvoiceOrder] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Status Update Modal State
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    status: "",
    note: "",
    courierName: "",
    currentHub: "",
    deliveryDate: "",
    trackingId: "",
    trackingUrl: "",
    agentName: "",
    agentPhone: "",
  });
  const [savingStatus, setSavingStatus] = useState(false);

  // View Details Modal State
  const [detailsModalOrder, setDetailsModalOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // =======================================================
  // HELPER: ONLY SHOW SUCCESSFUL PAYMENTS (EXCLUDE FAILED)
  // =======================================================
  const isPaymentSuccessful = (order) => {
    if (!order) return false;
    const pStatus = String(order.paymentStatus || "").toLowerCase();
    const pMethod = String(order.paymentMethod || "").toLowerCase();
    const oStatus = String(order.orderStatus || "").toLowerCase();

    // Never show failed or refunded failed payments
    if (pStatus === "failed") return false;

    // Online orders (Razorpay, Cards, UPI, Netbanking) must have successful payment
    if (pMethod === "razorpay" || pMethod === "online") {
      return pStatus === "paid";
    }

    // COD orders: confirmed and active (not cancelled without payment)
    if (pMethod === "cod") {
      return oStatus !== "cancelled";
    }

    return pStatus === "paid";
  };

  // =======================================================
  // LOAD ORDERS FROM BACKEND
  // =======================================================
  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await API.get("/orders");
      const list = res.data?.orders || res.data?.data || [];
      const paidOnly = Array.isArray(list) ? list.filter(isPaymentSuccessful) : [];
      setOrders(paidOnly);
    } catch (err) {
      console.error("Fetch orders error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Orders",
        text: err.response?.data?.message || "Could not retrieve orders from server.",
        confirmButtonColor: "#059669",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // =======================================================
  // COPY HELPER
  // =======================================================
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // =======================================================
  // HELPER: RESOLVE PRODUCT IMAGE
  // =======================================================
  const getProductImage = (image) => {
    if (!image) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";
    if (typeof image === "object") {
      image = image?.url || image?.path || image?.secure_url || "";
    }
    const str = String(image).trim();
    if (!str) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";
    if (str.startsWith("http://") || str.startsWith("https://")) return str;
    return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
  };

  // =======================================================
  // STATS CALCULATIONS
  // =======================================================
  const stats = useMemo(() => {
    const total = orders.length;
    let pending = 0;
    let confirmed = 0;
    let shipped = 0;
    let outForDelivery = 0;
    let delivered = 0;
    let cancelled = 0;
    let revenue = 0;

    orders.forEach((o) => {
      const s = String(o.orderStatus || "").toLowerCase();
      if (s === "pending") pending++;
      else if (s === "confirmed") confirmed++;
      else if (s === "shipped") shipped++;
      else if (s === "out_for_delivery") outForDelivery++;
      else if (s === "delivered") delivered++;
      else if (s === "cancelled" || s === "refunded") cancelled++;

      if (s !== "cancelled" && s !== "refunded") {
        revenue += Number(o.payableAmount ?? o.totalAmount ?? 0);
      }
    });

    return { total, pending, confirmed, shipped, outForDelivery, delivered, cancelled, revenue };
  }, [orders]);

  // =======================================================
  // FILTERING LOGIC
  // =======================================================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!isPaymentSuccessful(order)) return false;
      const status = String(order.orderStatus || "").toLowerCase();
      const paymentMethod = String(order.paymentMethod || "").toLowerCase();
      const customerName = String(order.deliveryAddress?.name || "").toLowerCase();
      const customerPhone = String(order.deliveryAddress?.mobile || "");
      const orderNum = String(order.orderNumber || order._id || "").toLowerCase();

      // Tab filter
      if (activeTab !== "all") {
        if (activeTab === "pending" && status !== "pending") return false;
        if (activeTab === "confirmed" && status !== "confirmed") return false;
        if (activeTab === "shipped" && status !== "shipped") return false;
        if (activeTab === "out_for_delivery" && status !== "out_for_delivery") return false;
        if (activeTab === "delivered" && status !== "delivered") return false;
        if (activeTab === "cancelled" && status !== "cancelled" && status !== "refunded") return false;
      }

      // Payment filter
      if (paymentFilter !== "all") {
        if (paymentFilter === "cod" && paymentMethod !== "cod") return false;
        if (paymentFilter === "online" && paymentMethod === "cod") return false;
      }

      // Date filter
      if (dateFilter !== "all" && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (dateFilter === "today") {
          const check = new Date(orderDate);
          check.setHours(0, 0, 0, 0);
          if (check.getTime() !== now.getTime()) return false;
        } else if (dateFilter === "7days") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateFilter === "month") {
          if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          orderNum.includes(q) ||
          customerName.includes(q) ||
          customerPhone.includes(q) ||
          (order.deliveryAddress?.city && order.deliveryAddress.city.toLowerCase().includes(q)) ||
          (order.deliveryAddress?.pincode && String(order.deliveryAddress.pincode).includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [orders, activeTab, paymentFilter, dateFilter, searchQuery]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, paymentFilter, dateFilter, searchQuery]);

  // =======================================================
  // OPEN STATUS UPDATE MODAL
  // =======================================================
  const handleOpenStatusModal = (order) => {
    const ship = order.shippingDetails || {};
    const formattedDate = ship.deliveryDate ? new Date(ship.deliveryDate).toISOString().slice(0, 10) : "";

    setStatusModalOrder(order);
    setStatusFormData({
      status: order.orderStatus || "confirmed",
      note: "",
      courierName: ship.courierName || "Delhivery",
      currentHub: ship.currentHub || "",
      deliveryDate: formattedDate,
      trackingId: ship.trackingId || "",
      trackingUrl: ship.trackingUrl || "",
      agentName: ship.agentName || "",
      agentPhone: ship.agentPhone || "",
    });
  };

  // =======================================================
  // SUBMIT STATUS UPDATE
  // =======================================================
  const handleSaveStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalOrder) return;

    try {
      setSavingStatus(true);
      const payload = {
        status: statusFormData.status,
        note: statusFormData.note.trim() || `Status updated to ${statusFormData.status}`,
        shippingDetails: {
          courierName: statusFormData.courierName.trim(),
          currentHub: statusFormData.currentHub.trim(),
          deliveryDate: statusFormData.deliveryDate || null,
          trackingId: statusFormData.trackingId.trim(),
          trackingUrl: statusFormData.trackingUrl.trim(),
          agentName: statusFormData.agentName.trim(),
          agentPhone: statusFormData.agentPhone.trim(),
        },
      };

      const res = await API.put(`/orders/${statusModalOrder._id}/status`, payload);
      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Order #${statusModalOrder.orderNumber || statusModalOrder._id} marked as ${statusFormData.status.toUpperCase()}.`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Update in state
        setOrders((prev) =>
          prev.map((o) => (o._id === statusModalOrder._id ? res.data.order || { ...o, ...payload } : o))
        );
        setStatusModalOrder(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: res.data?.message || "Could not update order status.",
          confirmButtonColor: "#059669",
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to communicate with server.",
        confirmButtonColor: "#059669",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  // =======================================================
  // EXPORT TO CSV
  // =======================================================
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Orders to Export",
        text: "There are no orders matching your current filter criteria.",
        confirmButtonColor: "#059669",
      });
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "Pincode",
      "Total Items",
      "Total Amount",
      "Payment Mode",
      "Payment Status",
      "Order Status",
      "Courier Name",
      "Current Hub",
      "Tracking ID",
      "Agent Phone",
    ];

    const rows = filteredOrders.map((o) => {
      const a = o.deliveryAddress || {};
      const s = o.shippingDetails || {};
      return [
        `"${o.orderNumber || o._id}"`,
        `"${o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : ""}"`,
        `"${(a.name || "").replace(/"/g, '""')}"`,
        `"${a.mobile || ""}"`,
        `"${(a.address || "").replace(/"/g, '""')}"`,
        `"${a.city || ""}"`,
        `"${a.pincode || ""}"`,
        (o.items || []).length,
        Number(o.payableAmount ?? o.totalAmount ?? 0).toFixed(2),
        `"${o.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}"`,
        `"${o.paymentStatus || "paid"}"`,
        `"${o.orderStatus || ""}"`,
        `"${s.courierName || ""}"`,
        `"${s.currentHub || ""}"`,
        `"${s.trackingId || ""}"`,
        `"${s.agentPhone || ""}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Component
  const renderStatusPill = (status) => {
    const s = String(status || "pending").toLowerCase();
    const config = {
      pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", icon: Clock },
      confirmed: { label: "Confirmed", bg: "#ecfdf5", color: "#065f46", icon: CheckCircle2 },
      shipped: { label: "Shipped", bg: "#eff6ff", color: "#1e40af", icon: Truck },
      processing: { label: "Shipped", bg: "#eff6ff", color: "#1e40af", icon: Truck },
      out_for_delivery: { label: "Out for Delivery", bg: "#f5f3ff", color: "#6b21a8", icon: Package },
      delivered: { label: "Delivered", bg: "#d1fae5", color: "#065f46", icon: CheckCircle2 },
      cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b", icon: XCircle },
      refunded: { label: "Refunded", bg: "#f1f5f9", color: "#475569", icon: RefreshCw },
    };

    const cur = config[s] || config.confirmed;
    const Icon = cur.icon;

    return (
      <span className="admin-status-pill" style={{ backgroundColor: cur.bg, color: cur.color }}>
        <Icon size={12} />
        <span>{cur.label}</span>
      </span>
    );
  };

  return (
    <div className="admin-orders-page-wrapper">
      <div className="admin-orders-container">
        {/* =======================================================
            PAGE HEADER & CONTROLS
        ======================================================== */}
        <div className="admin-orders-header">
          <div className="header-text-block">
            <h1 className="header-title">Orders Management</h1>
            <p className="header-subtitle">
              Manage fulfillment, update live courier hubs, assign agents, and monitor orders.
            </p>
          </div>

          <div className="header-actions-row">
            <button
              type="button"
              className="btn-action-refresh"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              title="Refresh Orders"
            >
              <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>


          </div>
        </div>

        {/* =======================================================
            KPI SUMMARY STATS CARDS
        ======================================================== */}
        <div className="orders-stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon-wrapper bg-blue">
              <ShoppingBag size={20} />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Total Orders</span>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>

          <div className="stat-card stat-confirmed">
            <div className="stat-icon-wrapper bg-green">
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Confirmed</span>
              <h3 className="stat-value">{stats.confirmed + stats.pending}</h3>
            </div>
          </div>

          <div className="stat-card stat-shipped">
            <div className="stat-icon-wrapper bg-sky">
              <Truck size={20} />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Shipped</span>
              <h3 className="stat-value">{stats.shipped}</h3>
            </div>
          </div>

          <div className="stat-card stat-out">
            <div className="stat-icon-wrapper bg-purple">
              <Package size={20} />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Out for Delivery</span>
              <h3 className="stat-value">{stats.outForDelivery}</h3>
            </div>
          </div>

          <div className="stat-card stat-delivered">
            <div className="stat-icon-wrapper bg-emerald">
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Delivered</span>
              <h3 className="stat-value">{stats.delivered}</h3>
            </div>
          </div>

          <div className="stat-card stat-revenue">
            <div className="stat-icon-wrapper bg-amber">
              <CreditCard size={20} />
            </div>
            <div className="stat-meta">
              <span className="stat-label">Total Revenue</span>
              <h3 className="stat-value">₹{stats.revenue.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        </div>

        {/* =======================================================
            FILTER TABS & SEARCH BAR
        ======================================================== */}
        <div className="orders-filter-section">
          {/* Status Tabs */}
          <div className="orders-status-tabs-nav">
            {[
              { key: "all", label: "All Orders", count: stats.total },
              { key: "confirmed", label: "Confirmed", count: stats.confirmed },
              { key: "shipped", label: "Shipped", count: stats.shipped },
              { key: "out_for_delivery", label: "Out for Delivery", count: stats.outForDelivery },
              { key: "delivered", label: "Delivered", count: stats.delivered },
              { key: "pending", label: "Pending", count: stats.pending },
              { key: "cancelled", label: "Cancelled", count: stats.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`status-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="tab-count-badge">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Controls Bar: Search, Payment Filter, Date Filter */}
          <div className="orders-controls-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID, customer, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-dropdowns-group">
              <div className="select-pill-wrapper">
                <span className="select-label">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Successful Payments</option>
                  <option value="online">Online Paid (Success)</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <div className="select-pill-wrapper">
                <span className="select-label">Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            ORDERS TABLE & MOBILE CARDS
        ======================================================== */}
        <div className="orders-table-card">
          {loading ? (
            <div className="admin-orders-loading">
              <div className="spinner-loader"></div>
              <span>Loading orders from database...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-orders-empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <h3>No Orders Found</h3>
              <p>No orders matched your current search and filter selections.</p>
              {(searchQuery || activeTab !== "all" || paymentFilter !== "all" || dateFilter !== "all") && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                    setPaymentFilter("all");
                    setDateFilter("all");
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="table-responsive-wrapper">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID & Date</th>
                      <th>Customer Details</th>
                      <th>Items Preview</th>
                      <th>Amount & Payment</th>
                      <th>Order Status</th>
                      <th>Live Shipping / Courier Info</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => {
                      const addr = order.deliveryAddress || {};
                      const ship = order.shippingDetails || {};
                      const items = order.items || [];
                      const firstItem = items[0] || {};
                      const totalQty = items.reduce((s, it) => s + Number(it.quantity || 1), 0);
                      const amount = Number(order.payableAmount ?? order.totalAmount ?? 0);
                      const dateStr = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-";

                      return (
                        <tr key={order._id} className="admin-order-row">
                          {/* Order ID & Date */}
                          <td>
                            <div className="order-id-cell">
                              <span
                                className="order-number-text"
                                onClick={() => setDetailsModalOrder(order)}
                                title="View details"
                              >
                                #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
                              </span>
                              <span className="order-date-text">{dateStr}</span>
                            </div>
                          </td>

                          {/* Customer Details */}
                          <td>
                            <div className="customer-cell">
                              <span className="customer-name">{addr.name || "Customer"}</span>
                              {addr.mobile && (
                                <span className="customer-phone">
                                  <Phone size={11} /> {addr.mobile}
                                </span>
                              )}
                              <span className="customer-city">
                                {addr.city ? `${addr.city}, ` : ""}
                                {addr.pincode || ""}
                              </span>
                            </div>
                          </td>

                          {/* Items Preview */}
                          <td>
                            <div className="items-summary-cell">
                              <div className="items-thumb-box">
                                <img
                                  src={getProductImage(firstItem.image)}
                                  alt="Item"
                                  className="thumb-img"
                                />
                                {items.length > 1 && (
                                  <span className="items-badge-count">+{items.length - 1}</span>
                                )}
                              </div>
                              <div className="items-desc">
                                <span className="first-item-name">
                                  {firstItem.productName || "Grocery Item"}
                                </span>
                                <span className="total-items-count">{totalQty} items total</span>
                              </div>
                            </div>
                          </td>

                          {/* Amount & Payment */}
                          <td>
                            <div className="amount-cell">
                              <span className="amount-val">₹{amount.toFixed(2)}</span>
                              <span className={`payment-pill ${order.paymentMethod === "cod" ? "cod" : "online"}`}>
                                {order.paymentMethod === "cod" ? "COD" : "Payment Success"}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td>{renderStatusPill(order.orderStatus)}</td>

                          {/* Live Shipping Info */}
                          <td>
                            <div className="shipping-info-cell">
                              {order.orderStatus === "shipped" ? (
                                <div className="shipping-badge-box shipped-box">
                                  <div className="ship-line">
                                    <strong>{ship.courierName || "Courier"}:</strong>{" "}
                                    {ship.trackingId ? (
                                      <span className="track-id-code">{ship.trackingId}</span>
                                    ) : (
                                      <span className="text-muted">No Tracking ID</span>
                                    )}
                                  </div>
                                  {ship.currentHub && (
                                    <div className="ship-line hub-line">
                                      <Building2 size={11} />
                                      <span>{ship.currentHub}</span>
                                    </div>
                                  )}
                                  {ship.deliveryDate && (
                                    <div className="ship-line date-line">
                                      <Calendar size={11} />
                                      <span>
                                        Exp: {new Date(ship.deliveryDate).toLocaleDateString("en-IN")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : order.orderStatus === "out_for_delivery" ? (
                                <div className="shipping-badge-box out-box">
                                  <div className="ship-line agent-line">
                                    <User size={11} />
                                    <span>
                                      Agent: {ship.agentName || "Assigned"}{" "}
                                      {ship.agentPhone ? `(${ship.agentPhone})` : ""}
                                    </span>
                                  </div>
                                  {ship.currentHub && (
                                    <div className="ship-line hub-line">
                                      <Building2 size={11} />
                                      <span>Hub: {ship.currentHub}</span>
                                    </div>
                                  )}
                                  {ship.deliveryDate && (
                                    <div className="ship-line date-line">
                                      <Calendar size={11} />
                                      <span>
                                        Delivery: {new Date(ship.deliveryDate).toLocaleDateString("en-IN")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : order.orderStatus === "delivered" ? (
                                <span className="delivered-check-text">
                                  <CheckCircle2 size={13} /> Delivered to customer
                                </span>
                              ) : order.orderStatus === "cancelled" ? (
                                <span className="cancelled-text-badge">Cancelled</span>
                              ) : (
                                <span className="ready-to-dispatch-text">Ready for Dispatch</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="text-right">
                            <div className="action-buttons-group">
                              {/* ONLY SHOW INVOICE AFTER ORDER IS DELIVERED */}
                              {order.orderStatus === "delivered" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn-preview-invoice-action"
                                    onClick={() => setPreviewInvoiceOrder(order)}
                                    title="View Invoice Modal"
                                  >
                                    <FileText size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-view-invoice-action"
                                    onClick={async () => {
                                      setDownloadingOrderId(order._id);
                                      try {
                                        await downloadOrderInvoicePdf(order);
                                      } finally {
                                        setDownloadingOrderId(null);
                                      }
                                    }}
                                    disabled={downloadingOrderId === order._id}
                                    title="Direct Download Tax Invoice (PDF)"
                                  >
                                    <Download size={14} />
                                    <span>{downloadingOrderId === order._id ? "Downloading..." : "Invoice"}</span>
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                className="btn-update-status-action"
                                onClick={() => handleOpenStatusModal(order)}
                                title="Update order status & shipping details"
                              >
                                <Truck size={14} />
                                <span>Update Status</span>
                              </button>

                              <button
                                type="button"
                                className="btn-view-details-action"
                                onClick={() => setDetailsModalOrder(order)}
                                title="View order details"
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS (SHOWN ON MOBILE PHONES) */}
              <div className="mobile-orders-cards-list">
                {paginatedOrders.map((order) => {
                  const addr = order.deliveryAddress || {};
                  const ship = order.shippingDetails || {};
                  const items = order.items || [];
                  const amount = Number(order.payableAmount ?? order.totalAmount ?? 0);

                  return (
                    <div key={order._id} className="admin-mobile-order-card">
                      <div className="card-top-header">
                        <div>
                          <h4
                            className="card-order-id"
                            onClick={() => setDetailsModalOrder(order)}
                          >
                            #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
                          </h4>
                          <span className="card-order-date">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN")
                              : ""}
                          </span>
                        </div>
                        {renderStatusPill(order.orderStatus)}
                      </div>

                      <div className="card-customer-row">
                        <strong>{addr.name || "Customer"}</strong>
                        {addr.mobile && <span>• {addr.mobile}</span>}
                        {addr.city && <span>• {addr.city}</span>}
                      </div>

                      <div className="card-items-preview-bar">
                        <span>{items.length} items</span>
                        <strong className="card-amount">₹{amount.toFixed(2)}</strong>
                        <span className={`payment-pill ${order.paymentMethod === "cod" ? "cod" : "online"}`}>
                          {order.paymentMethod === "cod" ? "COD" : "Paid Success"}
                        </span>
                      </div>

                      {/* Live Shipping on Mobile */}
                      {(order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery") && (
                        <div className="card-mobile-shipping-info">
                          {order.orderStatus === "shipped" ? (
                            <>
                              <div className="ship-line">
                                <strong>{ship.courierName || "Courier"}:</strong>{" "}
                                {ship.trackingId || "In Transit"}
                              </div>
                              {ship.currentHub && <div className="ship-line">Hub: {ship.currentHub}</div>}
                              {ship.deliveryDate && (
                                <div className="ship-line">
                                  Delivery: {new Date(ship.deliveryDate).toLocaleDateString("en-IN")}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="ship-line">
                                <strong>Agent:</strong> {ship.agentName || "Assigned"} ({ship.agentPhone})
                              </div>
                              {ship.currentHub && <div className="ship-line">Hub: {ship.currentHub}</div>}
                            </>
                          )}
                        </div>
                      )}

                      <div className="card-actions-footer">
                        {order.orderStatus === "delivered" && (
                          <>
                            <button
                              type="button"
                              className="btn-preview-invoice-action mobile-btn"
                              onClick={() => setPreviewInvoiceOrder(order)}
                              title="View Invoice"
                            >
                              <FileText size={14} />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              className="btn-view-invoice-action mobile-btn"
                              onClick={async () => {
                                setDownloadingOrderId(order._id);
                                try {
                                  await downloadOrderInvoicePdf(order);
                                } finally {
                                  setDownloadingOrderId(null);
                                }
                              }}
                              disabled={downloadingOrderId === order._id}
                            >
                              <Download size={14} />
                              <span>{downloadingOrderId === order._id ? "Downloading..." : "Invoice"}</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="btn-update-status-action mobile-btn"
                          onClick={() => handleOpenStatusModal(order)}
                        >
                          <Truck size={14} />
                          <span>Update Status</span>
                        </button>

                        <button
                          type="button"
                          className="btn-view-details-action mobile-btn"
                          onClick={() => setDetailsModalOrder(order)}
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION BAR */}
              <div className="table-pagination-footer">
                <div className="pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </div>

                <div className="pagination-controls">
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="pagination-page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =======================================================
          MODAL 1: STATUS UPDATE & LIVE COURIER / AGENT HUB MODAL
      ======================================================== */}
      {statusModalOrder && (
        <div className="admin-modal-backdrop" onClick={() => setStatusModalOrder(null)}>
          <div className="admin-status-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-box">
                <Truck size={20} className="modal-icon" />
                <div>
                  <h3>Update Order Fulfillment</h3>
                  <p>
                    Order #{statusModalOrder.orderNumber || statusModalOrder._id} •{" "}
                    {statusModalOrder.deliveryAddress?.name || "Customer"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setStatusModalOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="admin-status-form">
              {/* SELECT STATUS CHIPS */}
              <div className="form-group">
                <label className="form-label">Select Order Status</label>
                <div className="status-selector-grid">
                  {[
                    { key: "confirmed", label: "Confirmed" },
                    { key: "shipped", label: "Shipped" },
                    { key: "out_for_delivery", label: "Out for Delivery" },
                    { key: "delivered", label: "Delivered" },
                    { key: "cancelled", label: "Cancelled" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`status-choice-chip ${statusFormData.status === s.key ? "selected" : ""}`}
                      onClick={() => setStatusFormData((prev) => ({ ...prev, status: s.key }))}
                    >
                      <span className="radio-dot" />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC FIELDS: WHEN SHIPPED */}
              {statusFormData.status === "shipped" && (
                <div className="dynamic-status-fields-container highlight-blue">
                  <div className="dynamic-fields-header">
                    <Truck size={16} />
                    <h4>Courier & Tracking Details (Shipped)</h4>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-group">
                      <label className="form-label">Courier Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhivery, BlueDart, Shadowfax, DTDC"
                        value={statusFormData.courierName}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, courierName: e.target.value })
                        }
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Current Courier Hub <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bhubaneswar Central Sorting Facility"
                        value={statusFormData.currentHub}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, currentHub: e.target.value })
                        }
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-group">
                      <label className="form-label">
                        Expected Delivery Date <span className="req">*</span>
                      </label>
                      <input
                        type="date"
                        value={statusFormData.deliveryDate}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, deliveryDate: e.target.value })
                        }
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tracking ID / AWB No.</label>
                      <input
                        type="text"
                        placeholder="e.g. DLHV987654321"
                        value={statusFormData.trackingId}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, trackingId: e.target.value })
                        }
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: WHEN OUT FOR DELIVERY */}
              {statusFormData.status === "out_for_delivery" && (
                <div className="dynamic-status-fields-container highlight-purple">
                  <div className="dynamic-fields-header">
                    <Package size={16} />
                    <h4>Delivery Agent & Final Hub (Out for Delivery)</h4>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-group">
                      <label className="form-label">
                        Delivery Agent Phone No. <span className="req">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={statusFormData.agentPhone}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, agentPhone: e.target.value })
                        }
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Delivery Agent Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={statusFormData.agentName}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, agentName: e.target.value })
                        }
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-group">
                      <label className="form-label">
                        Current Hub / Delivery Center <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Patia Local Distribution Center"
                        value={statusFormData.currentHub}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, currentHub: e.target.value })
                        }
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Date of Delivery <span className="req">*</span>
                      </label>
                      <input
                        type="date"
                        value={statusFormData.deliveryDate}
                        onChange={(e) =>
                          setStatusFormData({ ...statusFormData, deliveryDate: e.target.value })
                        }
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS UPDATE NOTE */}
              <div className="form-group">
                <label className="form-label">Internal Note / Customer Notification (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched from primary warehouse via express cargo."
                  value={statusFormData.note}
                  onChange={(e) => setStatusFormData({ ...statusFormData, note: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* MODAL FOOTER */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setStatusModalOrder(null)}
                  disabled={savingStatus}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit-status" disabled={savingStatus}>
                  {savingStatus ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <span>Save & Update Status</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 2: FULL ORDER DETAILS DRAWER / MODAL
      ======================================================== */}
      {detailsModalOrder && (
        <div className="admin-modal-backdrop" onClick={() => setDetailsModalOrder(null)}>
          <div className="admin-details-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-box">
                <ShoppingBag size={20} className="modal-icon" />
                <div>
                  <h3>Order Inspection</h3>
                  <div className="drawer-header-meta">
                    <span>#{detailsModalOrder.orderNumber || detailsModalOrder._id}</span>
                    <button
                      type="button"
                      className="btn-copy-sm"
                      onClick={() =>
                        handleCopyText(detailsModalOrder.orderNumber || detailsModalOrder._id)
                      }
                    >
                      {copiedId ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setDetailsModalOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-drawer-scroll-body">
              {/* TOP STATUS & PAYMENT BAR */}
              <div className="drawer-status-summary-bar">
                <div className="summary-col">
                  <span className="caption">Order Status</span>
                  <div className="mt-1">{renderStatusPill(detailsModalOrder.orderStatus)}</div>
                </div>

                <div className="summary-col">
                  <span className="caption">Payment Mode</span>
                  <div className="mt-1">
                    <span
                      className={`payment-pill ${
                        detailsModalOrder.paymentMethod === "cod" ? "cod" : "online"
                      }`}
                    >
                      {detailsModalOrder.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Payment Success (Paid)"}
                    </span>
                  </div>
                </div>

                <div className="summary-col">
                  <span className="caption">Order Placed</span>
                  <div className="mt-1 date-val">
                    {detailsModalOrder.createdAt
                      ? new Date(detailsModalOrder.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </div>
                </div>

                <div className="summary-col">
                  <span className="caption">Total Amount</span>
                  <div className="mt-1 total-hero-val">
                    ₹{Number(detailsModalOrder.payableAmount ?? detailsModalOrder.totalAmount ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 2-COLUMN PREMIUM DASHBOARD GRID */}
              <div className="drawer-two-columns-layout">
                {/* LEFT COLUMN: ORDERED PRODUCTS & CUSTOMER INFO */}
                <div className="drawer-col-left">
                  {/* ORDER ITEMS */}
                  <div className="drawer-section-card">
                    <div className="drawer-card-header">
                      <h4>Ordered Products ({(detailsModalOrder.items || []).length})</h4>
                    </div>
                    <div className="drawer-items-list">
                      {(detailsModalOrder.items || []).map((it, idx) => {
                        const prod = it.product && typeof it.product === "object" ? it.product : {};
                        const name = it.productName || prod.productName || prod.name || "Item";
                        const img = getProductImage(
                          it.image || (Array.isArray(prod.images) && prod.images[0]) || prod.image
                        );
                        const qty = Number(it.quantity || 1);
                        const price = Number(it.price || 0);
                        const total = Number(it.itemTotal || price * qty);

                        return (
                          <div key={idx} className="drawer-item-row">
                            <img src={img} alt={name} className="drawer-item-img" />
                            <div className="drawer-item-info">
                              <span className="item-name">{name}</span>
                              <span className="item-unit">{it.unit || prod.unit || "1 unit"}</span>
                            </div>
                            <div className="drawer-item-calc">
                              <span>
                                ₹{price.toFixed(2)} × {qty}
                              </span>
                              <strong className="item-total">₹{total.toFixed(2)}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CUSTOMER & DELIVERY ADDRESS */}
                  <div className="drawer-section-card">
                    <div className="drawer-card-header">
                      <h4>Customer & Delivery Address</h4>
                    </div>
                    <div className="drawer-address-box">
                      <div className="name-phone-row">
                        <strong>{detailsModalOrder.deliveryAddress?.name || "Customer"}</strong>
                        {detailsModalOrder.deliveryAddress?.mobile && (
                          <span>• {detailsModalOrder.deliveryAddress.mobile}</span>
                        )}
                      </div>
                      <p className="address-text">
                        {detailsModalOrder.deliveryAddress?.address || "Address not provided"}
                        {detailsModalOrder.deliveryAddress?.landmark
                          ? `, Near ${detailsModalOrder.deliveryAddress.landmark}`
                          : ""}
                        {detailsModalOrder.deliveryAddress?.city
                          ? `, ${detailsModalOrder.deliveryAddress.city}`
                          : ""}
                        {detailsModalOrder.deliveryAddress?.state
                          ? `, ${detailsModalOrder.deliveryAddress.state}`
                          : ""}
                        {detailsModalOrder.deliveryAddress?.pincode
                          ? ` - ${detailsModalOrder.deliveryAddress.pincode}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: SHIPPING DETAILS, BILL BREAKDOWN & TIMELINE */}
                <div className="drawer-col-right">
                  {/* LIVE SHIPPING DETAILS CARD - ONLY IF DATA EXISTS */}
                  {detailsModalOrder.shippingDetails &&
                    (detailsModalOrder.shippingDetails.courierName ||
                      detailsModalOrder.shippingDetails.currentHub ||
                      detailsModalOrder.shippingDetails.trackingId ||
                      detailsModalOrder.shippingDetails.agentPhone) && (
                      <div className="drawer-section-card shipping-highlight-card">
                        <div className="drawer-card-header">
                          <Truck size={16} className="text-emerald" />
                          <h4>Live Shipping & Tracking</h4>
                        </div>
                        <div className="shipping-grid-details">
                          {detailsModalOrder.shippingDetails.courierName && (
                            <div className="ship-field">
                              <span className="label">Courier Service:</span>
                              <strong className="val">{detailsModalOrder.shippingDetails.courierName}</strong>
                            </div>
                          )}

                          {detailsModalOrder.shippingDetails.currentHub && (
                            <div className="ship-field">
                              <span className="label">Current Hub:</span>
                              <strong className="val">{detailsModalOrder.shippingDetails.currentHub}</strong>
                            </div>
                          )}

                          {detailsModalOrder.shippingDetails.deliveryDate && (
                            <div className="ship-field">
                              <span className="label">Expected Delivery:</span>
                              <strong className="val">
                                {new Date(detailsModalOrder.shippingDetails.deliveryDate).toLocaleDateString(
                                  "en-IN"
                                )}
                              </strong>
                            </div>
                          )}

                          {detailsModalOrder.shippingDetails.trackingId && (
                            <div className="ship-field">
                              <span className="label">Tracking ID / AWB:</span>
                              <span className="val-code">{detailsModalOrder.shippingDetails.trackingId}</span>
                            </div>
                          )}

                          {detailsModalOrder.shippingDetails.agentPhone && (
                            <div className="ship-field">
                              <span className="label">Delivery Agent Phone:</span>
                              <a
                                href={`tel:${detailsModalOrder.shippingDetails.agentPhone}`}
                                className="agent-phone-link"
                              >
                                <Phone size={12} />
                                <span>{detailsModalOrder.shippingDetails.agentPhone}</span>
                              </a>
                            </div>
                          )}

                          {detailsModalOrder.shippingDetails.agentName && (
                            <div className="ship-field">
                              <span className="label">Agent Name:</span>
                              <strong className="val">{detailsModalOrder.shippingDetails.agentName}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* PRICE BREAKDOWN */}
                  <div className="drawer-section-card">
                    <div className="drawer-card-header">
                      <h4>Financial Summary</h4>
                    </div>
                    <div className="drawer-bill-summary">
                      <div className="bill-line">
                        <span>Items Subtotal:</span>
                        <span>₹{Number(detailsModalOrder.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="bill-line">
                        <span>Delivery Charge:</span>
                        <span className="text-emerald font-semibold">
                          {Number(detailsModalOrder.deliveryCharge || 0) === 0
                            ? "FREE"
                            : `₹${Number(detailsModalOrder.deliveryCharge).toFixed(2)}`}
                        </span>
                      </div>
                      {Number(detailsModalOrder.walletUsed || 0) > 0 && (
                        <div className="bill-line discount">
                          <span>Wallet Used:</span>
                          <span>-₹{Number(detailsModalOrder.walletUsed).toFixed(2)}</span>
                        </div>
                      )}
                      {Number(detailsModalOrder.pointsValue || 0) > 0 && (
                        <div className="bill-line discount">
                          <span>Points Used:</span>
                          <span>-₹{Number(detailsModalOrder.pointsValue).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="bill-divider" />
                      <div className="bill-line total">
                        <span>Total Paid:</span>
                        <span className="total-val">
                          ₹
                          {Number(
                            detailsModalOrder.payableAmount ?? detailsModalOrder.totalAmount ?? 0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TIMELINE HISTORY */}
                  {Array.isArray(detailsModalOrder.statusHistory) &&
                    detailsModalOrder.statusHistory.length > 0 && (
                      <div className="drawer-section-card">
                        <div className="drawer-card-header">
                          <h4>Status History</h4>
                        </div>
                        <div className="status-history-timeline">
                          {detailsModalOrder.statusHistory.map((h, i) => (
                            <div key={i} className="timeline-entry">
                              <span className="timeline-dot" />
                              <div className="timeline-content">
                                <span className="status-title">{h.status?.toUpperCase()}</span>
                                {h.note && <p className="status-note">{h.note}</p>}
                                <span className="status-time">
                                  {h.at
                                    ? new Date(h.at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="drawer-footer-actions">
              {detailsModalOrder.orderStatus === "delivered" && (
                <>
                  <button
                    type="button"
                    className="btn-drawer-preview-invoice"
                    onClick={() => setPreviewInvoiceOrder(detailsModalOrder)}
                    title="View & Preview Invoice"
                  >
                    <FileText size={15} />
                    <span>View Invoice</span>
                  </button>

                  <button
                    type="button"
                    className="btn-drawer-invoice"
                    onClick={async () => {
                      setDownloadingOrderId(detailsModalOrder._id);
                      try {
                        await downloadOrderInvoicePdf(detailsModalOrder);
                      } finally {
                        setDownloadingOrderId(null);
                      }
                    }}
                    disabled={downloadingOrderId === detailsModalOrder._id}
                  >
                    <Download size={15} />
                    <span>
                      {downloadingOrderId === detailsModalOrder._id
                        ? "Downloading..."
                        : "Download Invoice"}
                    </span>
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn-drawer-update"
                onClick={() => {
                  const ord = detailsModalOrder;
                  setDetailsModalOrder(null);
                  handleOpenStatusModal(ord);
                }}
              >
                <Truck size={15} />
                <span>Update Status</span>
              </button>

              <button
                type="button"
                className="btn-drawer-close"
                onClick={() => setDetailsModalOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      <InvoiceModal
        order={previewInvoiceOrder}
        isOpen={Boolean(previewInvoiceOrder)}
        onClose={() => setPreviewInvoiceOrder(null)}
      />
    </div>
  );
};

export default Order;

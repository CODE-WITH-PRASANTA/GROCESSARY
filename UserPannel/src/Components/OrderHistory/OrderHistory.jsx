import React, { useState, useMemo, useRef, useEffect } from "react";
import API, { BASE_URL } from "../../api/axios";
import "./OrderHistory.css";
import jsPDF from "jspdf";

const ITEMS_PER_PAGE = 6;

// ======================================================
// HELPERS
// ======================================================

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image?.url || image?.path || image?.secure_url || image?.src || "";
  }

  if (!image) return "";

  const str = String(image).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) return str;

  return `${BASE_URL}${str.startsWith("/") ? str : `/${str}`}`;
};

const formatDisplayDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatTime = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const formatISODate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const mapStatus = (orderStatus) => {
  const s = String(orderStatus || "").toLowerCase();
  if (s === "delivered") return "Delivered";
  if (s === "cancelled" || s === "refunded") return "Cancelled";
  return "Processing";
};

const mapPaymentMethod = (method) => {
  const m = String(method || "").toLowerCase();
  if (m === "cod") return "COD";
  if (m === "razorpay") return "Razorpay";
  if (m === "wallet") return "Wallet";
  return method || "-";
};

const mapPaymentStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "Paid";
  if (s === "refunded") return "Refunded";
  if (s === "failed") return "Failed";
  return "Pending";
};

const mapBackendOrder = (order) => {
  const uiStatus = mapStatus(order.orderStatus);

  const lastStatus =
    Array.isArray(order.statusHistory) && order.statusHistory.length > 0
      ? order.statusHistory[order.statusHistory.length - 1]
      : null;

  return {
    id: order.orderNumber || order._id,
    _id: order._id,

    items: (order.items || []).map((it) => ({
      name: it.productName || "Product",
      img: getImageUrl(it.image),
      price: Number(it.price || 0),
      qty: Number(it.quantity || 1),
    })),

    date: formatISODate(order.createdAt),
    displayDate: formatDisplayDate(order.createdAt),
    time: formatTime(order.createdAt),

    amount: Number(order.totalAmount || 0).toFixed(2),

    paymentMethod: mapPaymentMethod(order.paymentMethod),
    paymentStatus: mapPaymentStatus(order.paymentStatus),

    status: uiStatus,
    statusSubtext: formatDisplayDate(
      lastStatus?.at || order.updatedAt || order.createdAt,
    ),

    address: order.deliveryAddress
      ? [
          order.deliveryAddress.address,
          order.deliveryAddress.landmark,
          order.deliveryAddress.city,
          order.deliveryAddress.state,
          order.deliveryAddress.pincode,
        ]
          .filter(Boolean)
          .join(", ")
      : "",

    walletUsed: Number(order.walletUsed || 0),
    pointsUsed: Number(order.pointsUsed || 0),
    pointsValue: Number(order.pointsValue || 0),
  };
};

// ======================================================
// COMPONENT
// ======================================================

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Date Range Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const datePickerRef = useRef(null);
  const filterRef = useRef(null);

  // ======================================================
  // FETCH ORDERS
  // ======================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your order history.");
        setOrders([]);
        return;
      }

      const { data } = await API.get("/orders/my");

      if (data.success && Array.isArray(data.orders)) {
        // Only Delivered + Cancelled orders live on this page
        const historyOnly = data.orders.filter((o) => {
          const s = String(o.orderStatus || "").toLowerCase();
          return ["delivered", "cancelled", "refunded"].includes(s);
        });

        setOrders(historyOnly.map(mapBackendOrder));
      } else {
        setError(data.message || "Failed to load order history.");
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch order history error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load order history.",
        );
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ======================================================
  // OUTSIDE CLICK
  // ======================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======================================================
  // COUNTS
  // ======================================================

  const totalCount = orders.length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;
  const processingCount = orders.filter(
    (o) => o.status === "Processing",
  ).length;

  // ======================================================
  // FILTER
  // ======================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

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

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  // ======================================================
  // DATE PRESETS
  // ======================================================

  const handleQuickDateSelect = (type) => {
    const today = new Date();
    const formatDateStr = (d) => d.toISOString().split("T")[0];

    if (type === "all") {
      setStartDate("");
      setEndDate("");
    } else if (type === "7days") {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 7);
      setStartDate(formatDateStr(pastDate));
      setEndDate(formatDateStr(today));
    } else if (type === "30days") {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 30);
      setStartDate(formatDateStr(pastDate));
      setEndDate(formatDateStr(today));
    }
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  const getDateRangeLabel = () => {
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return "All dates";
  };

  // ======================================================
  // DOWNLOAD INVOICE (Delivered only)
  // ======================================================

  const handleDownloadInvoice = (order) => {
    if (order.status !== "Delivered") {
      alert("Invoices are only available for delivered orders.");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const margin = 40;
    let y = margin;

    const brandGreen = [22, 163, 74];
    const darkText = [30, 41, 59];
    const mutedText = [100, 116, 139];
    const lightLine = [226, 232, 240];

    // ---------- HEADER ----------
    doc.setFillColor(...brandGreen);
    doc.rect(0, 0, pageW, 70, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Grocery Sathi", margin, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Delivery Invoice / Receipt", margin, 54);

    doc.setFontSize(9);
    doc.text(`Invoice Date: ${order.displayDate}`, pageW - margin, 38, {
      align: "right",
    });
    doc.text(
      `Invoice No: INV-${String(order.id).replace(/[^0-9A-Z]/gi, "")}`,
      pageW - margin,
      54,
      { align: "right" },
    );

    y = 100;

    // ---------- ORDER META ----------
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Order Details", margin, y);

    doc.setDrawColor(...lightLine);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...mutedText);

    const leftX = margin;
    const rightX = pageW / 2 + 10;

    doc.text(`Order ID: ${order.id}`, leftX, y);
    doc.text(`Order Date: ${order.displayDate} ${order.time}`, rightX, y);
    y += 16;
    doc.text(`Payment Method: ${order.paymentMethod}`, leftX, y);
    doc.text(`Payment Status: ${order.paymentStatus}`, rightX, y);
    y += 16;
    doc.text(`Status: ${order.status}`, leftX, y);
    doc.text(`Delivered On: ${order.statusSubtext}`, rightX, y);
    y += 22;

    // ---------- DELIVERY ADDRESS ----------
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Delivered To", margin, y);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...mutedText);
    const addressLines = doc.splitTextToSize(
      order.address || "N/A",
      pageW - margin * 2,
    );
    doc.text(addressLines, margin, y);
    y += addressLines.length * 14 + 12;

    // ---------- ITEMS TABLE ----------
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Items Purchased", margin, y);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 20;

    // Table header
    const colName = margin;
    const colQty = pageW - margin - 180;
    const colPrice = pageW - margin - 110;
    const colTotal = pageW - margin;

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 12, pageW - margin * 2, 22, "F");

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Item", colName + 6, y + 2);
    doc.text("Qty", colQty, y + 2, { align: "right" });
    doc.text("Price", colPrice, y + 2, { align: "right" });
    doc.text("Total", colTotal, y + 2, { align: "right" });
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkText);

    let subtotal = 0;

    order.items.forEach((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 1);
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const nameLines = doc.splitTextToSize(item.name, colQty - colName - 30);
      const rowH = Math.max(nameLines.length * 14, 18);

      // Page break if needed
      if (y + rowH > pageH - 120) {
        doc.addPage();
        y = margin;
      }

      doc.text(nameLines, colName + 6, y);
      doc.text(String(qty), colQty, y, { align: "right" });
      doc.text(`Rs. ${price.toFixed(2)}`, colPrice, y, { align: "right" });
      doc.text(`Rs. ${lineTotal.toFixed(2)}`, colTotal, y, { align: "right" });

      y += rowH;

      doc.setDrawColor(...lightLine);
      doc.line(margin, y - 4, pageW - margin, y - 4);
    });

    y += 14;

    // ---------- TOTALS ----------
    const wallet = Number(order.walletUsed || 0);
    const pointsValue = Number(order.pointsValue || 0);
    const grandTotal = Number(order.amount || 0);

    const totalsX = pageW - margin - 200;
    const totalsValX = pageW - margin;

    doc.setFontSize(10);
    doc.setTextColor(...mutedText);
    doc.text("Subtotal", totalsX, y);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, totalsValX, y, { align: "right" });
    y += 16;

    if (wallet > 0) {
      doc.text("Wallet Used", totalsX, y);
      doc.text(`- Rs. ${wallet.toFixed(2)}`, totalsValX, y, { align: "right" });
      y += 16;
    }

    if (pointsValue > 0) {
      doc.text(`Points (${order.pointsUsed} pts)`, totalsX, y);
      doc.text(`- Rs. ${pointsValue.toFixed(2)}`, totalsValX, y, {
        align: "right",
      });
      y += 16;
    }

    doc.setDrawColor(...lightLine);
    doc.line(totalsX, y - 6, pageW - margin, y - 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...brandGreen);
    doc.text("Total Paid", totalsX, y + 8);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, totalsValX, y + 8, {
      align: "right",
    });

    // ---------- FOOTER ----------
    const footerY = pageH - 60;
    doc.setDrawColor(...lightLine);
    doc.line(margin, footerY - 20, pageW - margin, footerY - 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text("Thank you for shopping with Grocery Sathi!", pageW / 2, footerY, {
      align: "center",
    });
    doc.text("Support: support@grocerysathi.com", pageW / 2, footerY + 14, {
      align: "center",
    });
    doc.text(
      "This is a computer-generated invoice and does not require a signature.",
      pageW / 2,
      footerY + 28,
      { align: "center" },
    );

    // ---------- SAVE ----------
    doc.save(`Invoice_${String(order.id).replace(/[^0-9A-Z]/gi, "")}.pdf`);
  };

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  if (loading) {
    return (
      <div className="oh-container">
        <div className="oh-loading">Loading your order history…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="oh-container">
        <div className="oh-error">
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="oh-container">
      {/* Top Stat Summary Cards */}
      <div className="oh-cards-grid">
        <div
          className={`oh-card ${statusFilter === "All" ? "active-card" : ""}`}
          onClick={() => {
            setStatusFilter("All");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-green">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Total Orders</p>
            <h3 className="oh-card-value">{totalCount}</h3>
            <span className="oh-card-link text-green">
              View all orders &rarr;
            </span>
          </div>
        </div>

        <div
          className={`oh-card ${
            statusFilter === "Delivered" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("Delivered");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-emerald">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Delivered Orders</p>
            <h3 className="oh-card-value">{deliveredCount}</h3>
            <span className="oh-card-link text-emerald">
              Invoices available &rarr;
            </span>
          </div>
        </div>

        <div
          className={`oh-card ${
            statusFilter === "Processing" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("Processing");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-orange">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Processing Orders</p>
            <h3 className="oh-card-value">{processingCount}</h3>
            <span className="oh-card-link text-orange">
              Currently active &rarr;
            </span>
          </div>
        </div>

        <div
          className={`oh-card ${
            statusFilter === "Cancelled" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("Cancelled");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-purple">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Cancelled Orders</p>
            <h3 className="oh-card-value">{cancelledCount}</h3>
            <span className="oh-card-link text-purple">
              View cancelled &rarr;
            </span>
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
            {/* Search */}
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
              <svg
                className="oh-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            {/* Filter */}
            <div className="oh-filter-wrapper" ref={filterRef}>
              <button
                className="oh-filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter {statusFilter !== "All" ? `(${statusFilter})` : ""}
              </button>

              {showFilterDropdown && (
                <div className="oh-filter-menu">
                  {["All", "Delivered", "Processing", "Cancelled"].map(
                    (status) => (
                      <button
                        key={status}
                        className={`oh-filter-item ${
                          statusFilter === status ? "active" : ""
                        }`}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowFilterDropdown(false);
                          setCurrentPage(1);
                        }}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="oh-datepicker-wrapper" ref={datePickerRef}>
              <div
                className={`oh-datepicker-box ${
                  startDate || endDate ? "active-date" : ""
                }`}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{getDateRangeLabel()}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {showDatePicker && (
                <div className="oh-datepicker-modal">
                  <div className="oh-datepicker-header">
                    <h4>Filter by Date Range</h4>
                    <button
                      className="oh-date-clear-btn"
                      onClick={() => handleQuickDateSelect("all")}
                    >
                      Clear
                    </button>
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
                    <button onClick={() => handleQuickDateSelect("7days")}>
                      Last 7 Days
                    </button>
                    <button onClick={() => handleQuickDateSelect("30days")}>
                      Last 30 Days
                    </button>
                    <button onClick={() => handleQuickDateSelect("all")}>
                      All Time
                    </button>
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
                  <tr key={order._id || order.id}>
                    <td className="oh-id">{order.id}</td>

                    <td>
                      <div className="oh-items-cell">
                        <div className="oh-thumbs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="oh-thumb-wrapper">
                              {item.img ? (
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  title={item.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : null}
                            </div>
                          ))}
                        </div>
                        <div className="oh-items-info">
                          <p className="oh-item-names">
                            {order.items.map((i) => i.name).join(", ")}
                          </p>
                          <span className="oh-item-count">
                            {order.items.length}{" "}
                            {order.items.length > 1 ? "items" : "item"}
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
                      <div
                        className={`oh-status-badge badge-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                        <span className="oh-status-subtext">
                          {order.statusSubtext}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="oh-actions-cell">
                        {/* View Details */}
                        <button
                          className="oh-view-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>View Details</span>
                        </button>

                        {/* Download Invoice — only for Delivered */}
                        {order.status === "Delivered" && (
                          <button
                            className="oh-download-btn"
                            title="Download Invoice"
                            onClick={() => handleDownloadInvoice(order)}
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                          </button>
                        )}
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
            Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} of{" "}
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  className={`oh-page-btn ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              className="oh-page-btn arrow-btn"
              disabled={
                currentPage === totalPages || filteredOrders.length === 0
              }
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Details Modal */}
      {selectedOrder && (
        <div
          className="oh-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="oh-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="oh-modal-header">
              <h3>Order Summary ({selectedOrder.id})</h3>
              <button
                className="oh-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className="oh-modal-body">
              <p>
                <strong>Status:</strong> {selectedOrder.status} (
                {selectedOrder.statusSubtext})
              </p>
              <p>
                <strong>Order Date:</strong> {selectedOrder.displayDate} at{" "}
                {selectedOrder.time}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{selectedOrder.amount}
              </p>

              {selectedOrder.walletUsed > 0 && (
                <p>
                  <strong>Wallet Used:</strong> ₹
                  {selectedOrder.walletUsed.toFixed(2)}
                </p>
              )}

              {selectedOrder.pointsUsed > 0 && (
                <p>
                  <strong>Points Used:</strong> {selectedOrder.pointsUsed} pts
                  (₹{selectedOrder.pointsValue.toFixed(2)})
                </p>
              )}

              <p>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod} -{" "}
                {selectedOrder.paymentStatus}
              </p>

              {selectedOrder.address && (
                <p>
                  <strong>Delivered To:</strong> {selectedOrder.address}
                </p>
              )}

              <h4 className="oh-modal-subtitle">Purchased Items:</h4>
              <div className="oh-modal-items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="oh-modal-item">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="oh-modal-img"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="oh-modal-item-info">
                      <span className="oh-modal-item-name">{item.name}</span>
                      {item.qty > 0 && (
                        <span className="oh-modal-item-qty">
                          Qty: {item.qty}
                          {item.price ? ` × ₹${item.price.toFixed(2)}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder.status === "Delivered" && (
                <button
                  className="oh-modal-receipt-btn"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

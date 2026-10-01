import React, { useState, useMemo, useRef, useEffect } from "react";
import API, { BASE_URL } from "../../api/axios";
import "./OrderHistory.css";
import jsPDF from "jspdf";

const ITEMS_PER_PAGE = 6;

const DEFAULT_RETURN_WINDOW_DAYS = 7;
const DEFAULT_RETURN_REASONS = [
  "Damaged product",
  "Expired product",
  "Wrong item delivered",
  "Quality not as expected",
  "Missing item",
  "Other",
];

const CONDITIONS = [
  { value: "good", label: "Good" },
  { value: "damaged", label: "Damaged" },
  { value: "opened", label: "Opened / Used" },
  { value: "expired", label: "Expired" },
  { value: "wrong", label: "Wrong Item" },
  { value: "other", label: "Other" },
];

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

const formatDateTime = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    orderStatus: order.orderStatus,
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

    // ---- Return fields ----
    returnStatus: order.returnStatus || "none",
    returnReason: order.returnReason || "",
    returnNote: order.returnNote || "",
    returnRequestedAt: order.returnRequestedAt || null,
    returnResolvedAt: order.returnResolvedAt || null,
    deliveredAt: order.deliveredAt || null,
    statusHistory: order.statusHistory || [],

    // ---- Pickup / inspection ----
    pickupDetails: order.pickupDetails || null,
    pickupProof: order.pickupProof || null,
    inspectionReport: order.inspectionReport || null,
  };
};

// ======================================================
// RETURN ELIGIBILITY
// ======================================================

const computeReturnInfo = (order, windowDays) => {
  const fallback = {
    eligible: false,
    reason: "",
    daysLeft: 0,
    expired: false,
    deliveredDate: null,
    deadline: null,
  };

  if (!order) return fallback;

  if (String(order.orderStatus || "").toLowerCase() !== "delivered") {
    return { ...fallback, reason: "not_delivered" };
  }

  if (order.returnStatus && order.returnStatus !== "none") {
    return { ...fallback, reason: "already_requested" };
  }

  let delivered = order.deliveredAt;

  if (!delivered && Array.isArray(order.statusHistory)) {
    const hit = [...order.statusHistory]
      .reverse()
      .find((h) => h.status === "delivered" && h.at);
    if (hit?.at) delivered = hit.at;
  }

  if (!delivered) {
    return { ...fallback, reason: "no_delivery_date" };
  }

  const deliveredDate = new Date(delivered);
  const deadline = new Date(deliveredDate);
  deadline.setDate(deadline.getDate() + windowDays);

  const now = new Date();
  const msLeft = deadline.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const expired = msLeft <= 0;

  return {
    eligible: !expired,
    reason: expired ? "expired" : "ok",
    daysLeft,
    expired,
    deliveredDate,
    deadline,
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

  // Date Range Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Return config
  const [returnWindowDays, setReturnWindowDays] = useState(
    DEFAULT_RETURN_WINDOW_DAYS,
  );
  const [returnReasons, setReturnReasons] = useState(DEFAULT_RETURN_REASONS);

  // Return modal
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // ---- Pickup modal ----
  const [pickupModalOrder, setPickupModalOrder] = useState(null);
  const [pickupData, setPickupData] = useState(null);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [proofCondition, setProofCondition] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [proofFiles, setProofFiles] = useState([]);
  const [proofBusy, setProofBusy] = useState(false);

  const datePickerRef = useRef(null);
  const filterRef = useRef(null);

  // ======================================================
  // FETCH RETURN CONFIG
  // ======================================================
  useEffect(() => {
    const loadReturnConfig = async () => {
      try {
        const { data } = await API.get("/orders/return-config");
        if (data?.success && data?.data) {
          if (Number.isFinite(Number(data.data.windowDays))) {
            setReturnWindowDays(Number(data.data.windowDays));
          }
          if (Array.isArray(data.data.reasons) && data.data.reasons.length) {
            setReturnReasons(data.data.reasons);
          }
        }
      } catch (err) {
        console.warn("Return config fetch failed, using defaults:", err?.message);
      }
    };
    loadReturnConfig();
  }, []);

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
        setError(err.response?.data?.message || "Failed to load order history.");
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
  // COUNTS / FILTER / PAGINATION
  // ======================================================
  const totalCount = orders.length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;
  const processingCount = orders.filter((o) => o.status === "Processing").length;

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

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

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
  // INVOICE (unchanged)
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
    doc.text(`Invoice Date: ${order.displayDate}`, pageW - margin, 38, { align: "right" });
    doc.text(
      `Invoice No: INV-${String(order.id).replace(/[^0-9A-Z]/gi, "")}`,
      pageW - margin,
      54,
      { align: "right" },
    );

    y = 100;
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

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Delivered To", margin, y);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...mutedText);
    const addressLines = doc.splitTextToSize(order.address || "N/A", pageW - margin * 2);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 14 + 12;

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Items Purchased", margin, y);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 20;

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
      doc.text(`- Rs. ${pointsValue.toFixed(2)}`, totalsValX, y, { align: "right" });
      y += 16;
    }

    doc.setDrawColor(...lightLine);
    doc.line(totalsX, y - 6, pageW - margin, y - 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...brandGreen);
    doc.text("Total Paid", totalsX, y + 8);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, totalsValX, y + 8, { align: "right" });

    const footerY = pageH - 60;
    doc.setDrawColor(...lightLine);
    doc.line(margin, footerY - 20, pageW - margin, footerY - 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text("Thank you for shopping with Grocery Sathi!", pageW / 2, footerY, { align: "center" });
    doc.text("Support: support@grocerysathi.com", pageW / 2, footerY + 14, { align: "center" });
    doc.text(
      "This is a computer-generated invoice and does not require a signature.",
      pageW / 2,
      footerY + 28,
      { align: "center" },
    );
    doc.save(`Invoice_${String(order.id).replace(/[^0-9A-Z]/gi, "")}.pdf`);
  };

  // ======================================================
  // SUBMIT RETURN REQUEST
  // ======================================================
  const handleSubmitReturn = async () => {
    if (!returnModalOrder?._id || !returnReason) return;

    try {
      setSubmittingReturn(true);
      const { data } = await API.post(
        `/orders/${returnModalOrder._id}/return`,
        { reason: returnReason, note: returnNote },
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === returnModalOrder._id
            ? {
                ...o,
                returnStatus: "requested",
                returnReason,
                returnNote,
                returnRequestedAt: new Date().toISOString(),
              }
            : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev && prev._id === returnModalOrder._id
          ? {
              ...prev,
              returnStatus: "requested",
              returnReason,
              returnNote,
              returnRequestedAt: new Date().toISOString(),
            }
          : prev,
      );

      setReturnModalOrder(null);
      setReturnReason("");
      setReturnNote("");
      alert(data?.message || "Return request submitted successfully.");
    } catch (err) {
      console.error("Return request error:", err);
      alert(err.response?.data?.message || "Failed to submit return request.");
      if (err.response?.status === 400) {
        await fetchOrders();
      }
    } finally {
      setSubmittingReturn(false);
    }
  };

  // ======================================================
  // PICKUP MODAL
  // ======================================================
  const openPickupModal = async (order) => {
    try {
      setPickupModalOrder(order);
      setPickupData(null);
      setOtpInput("");
      setOtpVerified(false);
      setProofCondition("");
      setProofNote("");
      setProofFiles([]);
      setPickupLoading(true);

      const { data } = await API.get(`/orders/${order._id}/return-pickup`);

      if (data?.success) {
        setPickupData(data.data);
        if (data.data?.pickupDetails?.otpVerified) {
          setOtpVerified(true);
        }
      }
    } catch (err) {
      console.error("Pickup load error:", err);
      alert(err.response?.data?.message || "Failed to load pickup details.");
      setPickupModalOrder(null);
    } finally {
      setPickupLoading(false);
    }
  };

  const closePickupModal = () => {
    if (otpBusy || proofBusy) return;
    setPickupModalOrder(null);
    setPickupData(null);
    setOtpInput("");
    setOtpVerified(false);
    setProofCondition("");
    setProofNote("");
    setProofFiles([]);
  };

  const submitOtp = async () => {
    if (!pickupModalOrder?._id || !otpInput.trim()) return;

    try {
      setOtpBusy(true);
      const { data } = await API.post(
        `/orders/${pickupModalOrder._id}/verify-pickup-otp`,
        { otp: otpInput.trim() },
      );
      if (data?.success) {
        setOtpVerified(true);
        alert("OTP verified. Please upload product images.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpBusy(false);
    }
  };

  const submitProof = async () => {
    if (!pickupModalOrder?._id) return;

    if (!proofFiles.length) {
      alert("Please upload at least one image.");
      return;
    }
    if (!proofCondition) {
      alert("Please select the product condition.");
      return;
    }

    try {
      setProofBusy(true);

      const formData = new FormData();
      proofFiles.forEach((f) => formData.append("images", f));
      formData.append("condition", proofCondition);
      formData.append("note", proofNote);

      await API.post(
        `/orders/${pickupModalOrder._id}/upload-pickup-proof`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      alert("Images uploaded. The return will be processed shortly.");
      closePickupModal();
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setProofBusy(false);
    }
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Total Orders</p>
            <h3 className="oh-card-value">{totalCount}</h3>
            <span className="oh-card-link text-green">View all orders &rarr;</span>
          </div>
        </div>

        <div
          className={`oh-card ${statusFilter === "Delivered" ? "active-card" : ""}`}
          onClick={() => {
            setStatusFilter("Delivered");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Delivered Orders</p>
            <h3 className="oh-card-value">{deliveredCount}</h3>
            <span className="oh-card-link text-emerald">Invoices available &rarr;</span>
          </div>
        </div>

        <div
          className={`oh-card ${statusFilter === "Processing" ? "active-card" : ""}`}
          onClick={() => {
            setStatusFilter("Processing");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="oh-card-info">
            <p className="oh-card-title">Processing Orders</p>
            <h3 className="oh-card-value">{processingCount}</h3>
            <span className="oh-card-link text-orange">Currently active &rarr;</span>
          </div>
        </div>

        <div
          className={`oh-card ${statusFilter === "Cancelled" ? "active-card" : ""}`}
          onClick={() => {
            setStatusFilter("Cancelled");
            setCurrentPage(1);
          }}
        >
          <div className="oh-card-icon icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
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
              <svg className="oh-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div className="oh-filter-wrapper" ref={filterRef}>
              <button
                className="oh-filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter {statusFilter !== "All" ? `(${statusFilter})` : ""}
              </button>

              {showFilterDropdown && (
                <div className="oh-filter-menu">
                  {["All", "Delivered", "Processing", "Cancelled"].map((status) => (
                    <button
                      key={status}
                      className={`oh-filter-item ${statusFilter === status ? "active" : ""}`}
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

            <div className="oh-datepicker-wrapper" ref={datePickerRef}>
              <div
                className={`oh-datepicker-box ${startDate || endDate ? "active-date" : ""}`}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{getDateRangeLabel()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {showDatePicker && (
                <div className="oh-datepicker-modal">
                  <div className="oh-datepicker-header">
                    <h4>Filter by Date Range</h4>
                    <button className="oh-date-clear-btn" onClick={() => handleQuickDateSelect("all")}>
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
                    <button onClick={() => handleQuickDateSelect("7days")}>Last 7 Days</button>
                    <button onClick={() => handleQuickDateSelect("30days")}>Last 30 Days</button>
                    <button onClick={() => handleQuickDateSelect("all")}>All Time</button>
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
                currentOrders.map((order) => {
                  const returnInfo = computeReturnInfo(order, returnWindowDays);
                  const hasReturn =
                    order.returnStatus && order.returnStatus !== "none";
                  const isPickupScheduled =
                    order.returnStatus === "pickup_scheduled";

                  return (
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
                        <div className={`oh-status-badge badge-${order.status.toLowerCase()}`}>
                          {order.status}
                          <span className="oh-status-subtext">{order.statusSubtext}</span>
                        </div>

                        {hasReturn && (
                          <div
                            className={`oh-return-badge return-${order.returnStatus}`}
                            title={
                              order.returnReason
                                ? `Return: ${order.returnStatus} — ${order.returnReason}`
                                : `Return: ${order.returnStatus}`
                            }
                          >
                            Return: {order.returnStatus}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="oh-actions-cell">
                          {/* View Details */}
                          <button className="oh-view-btn" onClick={() => setSelectedOrder(order)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View Details</span>
                          </button>

                          {/* Download Invoice */}
                          {order.status === "Delivered" && (
                            <button
                              className="oh-download-btn"
                              title="Download Invoice"
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                          )}

                          {/* Return button */}
                          {!hasReturn && returnInfo.eligible && (
                            <button
                              className="oh-return-btn"
                              title={`Request Return (${returnInfo.daysLeft} day${returnInfo.daysLeft === 1 ? "" : "s"} left)`}
                              onClick={() => {
                                setReturnModalOrder(order);
                                setReturnReason("");
                                setReturnNote("");
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7v6h6"></path>
                                <path d="M21 17a9 9 0 0 0-15-6.7L3 13"></path>
                              </svg>
                              <span>Return</span>
                            </button>
                          )}

                          {/* Pickup button — shown when return is scheduled for pickup */}
                          {isPickupScheduled && (
                            <button
                              className="oh-pickup-btn"
                              title="View pickup details and OTP"
                              onClick={() => openPickupModal(order)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                              </svg>
                              <span>Pickup</span>
                            </button>
                          )}

                          {/* Expired return hint */}
                          {!hasReturn && returnInfo.expired && (
                            <button
                              className="oh-return-btn disabled"
                              title="Return window expired"
                              disabled
                              aria-disabled="true"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 7v6h6"></path>
                                <path d="M21 17a9 9 0 0 0-15-6.7L3 13"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

        {/* Pagination */}
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`oh-page-btn ${currentPage === pageNum ? "active" : ""}`}
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

      {/* View Details Modal */}
      {selectedOrder && (
        <div className="oh-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="oh-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>Order Summary ({selectedOrder.id})</h3>
              <button className="oh-modal-close" onClick={() => setSelectedOrder(null)}>
                &times;
              </button>
            </div>

            <div className="oh-modal-body">
              <p><strong>Status:</strong> {selectedOrder.status} ({selectedOrder.statusSubtext})</p>
              <p><strong>Order Date:</strong> {selectedOrder.displayDate} at {selectedOrder.time}</p>
              <p><strong>Total Amount:</strong> ₹{selectedOrder.amount}</p>

              {selectedOrder.walletUsed > 0 && (
                <p><strong>Wallet Used:</strong> ₹{selectedOrder.walletUsed.toFixed(2)}</p>
              )}
              {selectedOrder.pointsUsed > 0 && (
                <p>
                  <strong>Points Used:</strong> {selectedOrder.pointsUsed} pts (₹
                  {selectedOrder.pointsValue.toFixed(2)})
                </p>
              )}

              <p>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod} -{" "}
                {selectedOrder.paymentStatus}
              </p>

              {selectedOrder.address && (
                <p><strong>Delivered To:</strong> {selectedOrder.address}</p>
              )}

              {/* Return info */}
              {selectedOrder.returnStatus && selectedOrder.returnStatus !== "none" && (
                <>
                  <h4 className="oh-modal-subtitle">Return Request</h4>
                  <div className={`oh-return-details return-${selectedOrder.returnStatus}`}>
                    <p><strong>Status:</strong> <span className="oh-return-status-text">{selectedOrder.returnStatus}</span></p>
                    {selectedOrder.returnReason && (<p><strong>Reason:</strong> {selectedOrder.returnReason}</p>)}
                    {selectedOrder.returnNote && (<p><strong>Note:</strong> {selectedOrder.returnNote}</p>)}
                    {selectedOrder.returnRequestedAt && (
                      <p><strong>Requested:</strong> {formatDisplayDate(selectedOrder.returnRequestedAt)}</p>
                    )}
                    {selectedOrder.returnResolvedAt && (
                      <p><strong>Resolved:</strong> {formatDisplayDate(selectedOrder.returnResolvedAt)}</p>
                    )}
                  </div>
                </>
              )}

              {/* Pickup summary if scheduled */}
              {selectedOrder.pickupDetails?.scheduledAt && (
                <>
                  <h4 className="oh-modal-subtitle">Pickup</h4>
                  <div className="oh-pickup-details">
                    <p><strong>When:</strong> {formatDateTime(selectedOrder.pickupDetails.scheduledAt)}</p>
                    {selectedOrder.pickupDetails.slot && (
                      <p><strong>Slot:</strong> {selectedOrder.pickupDetails.slot}</p>
                    )}
                    {selectedOrder.pickupDetails.agent && (
                      <p><strong>Agent:</strong> {selectedOrder.pickupDetails.agent}</p>
                    )}
                    {selectedOrder.pickupDetails.otpVerified ? (
                      <p><strong>OTP:</strong> <span className="oh-verified">Verified ✓</span></p>
                    ) : (
                      <p><strong>OTP:</strong> <span className="oh-pending">Pending</span></p>
                    )}
                  </div>
                </>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div
          className="oh-modal-overlay"
          onClick={() => {
            if (!submittingReturn) setReturnModalOrder(null);
          }}
        >
          <div className="oh-modal-content oh-return-modal" onClick={(e) => e.stopPropagation()}>
            <div className="oh-modal-header">
              <h3>Request Return — {returnModalOrder.id}</h3>
              <button
                className="oh-modal-close"
                onClick={() => setReturnModalOrder(null)}
                disabled={submittingReturn}
              >
                &times;
              </button>
            </div>

            <div className="oh-modal-body">
              {(() => {
                const info = computeReturnInfo(returnModalOrder, returnWindowDays);
                return (
                  <p className="oh-return-window-note">
                    You have <strong>{info.daysLeft}</strong> day
                    {info.daysLeft === 1 ? "" : "s"} left to request a return.
                  </p>
                );
              })()}

              <label className="oh-form-label">
                Reason *
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  disabled={submittingReturn}
                >
                  <option value="">Select a reason…</option>
                  {returnReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>

              <label className="oh-form-label">
                Additional notes (optional)
                <textarea
                  rows="3"
                  maxLength={300}
                  placeholder="Describe the issue…"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  disabled={submittingReturn}
                />
              </label>

              <div className="oh-return-actions">
                <button
                  type="button"
                  className="oh-btn-secondary"
                  onClick={() => setReturnModalOrder(null)}
                  disabled={submittingReturn}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="oh-btn-primary"
                  disabled={!returnReason || submittingReturn}
                  onClick={handleSubmitReturn}
                >
                  {submittingReturn ? "Submitting…" : "Submit Return Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          PICKUP MODAL
      ====================================================== */}
      {pickupModalOrder && (
        <div className="oh-modal-overlay" onClick={closePickupModal}>
          <div
            className="oh-modal-content oh-pickup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="oh-modal-header">
              <h3>Pickup Details — {pickupModalOrder.id}</h3>
              <button
                className="oh-modal-close"
                onClick={closePickupModal}
                disabled={otpBusy || proofBusy}
              >
                &times;
              </button>
            </div>

            <div className="oh-modal-body">
              {pickupLoading ? (
                <p>Loading pickup details…</p>
              ) : !pickupData ? (
                <p>No pickup details found.</p>
              ) : (
                <>
                  {/* Pickup info */}
                  <div className="oh-pickup-info">
                    {pickupData.pickupDetails?.scheduledAt && (
                      <p><strong>Pickup Date:</strong> {formatDateTime(pickupData.pickupDetails.scheduledAt)}</p>
                    )}
                    {pickupData.pickupDetails?.slot && (
                      <p><strong>Slot:</strong> {pickupData.pickupDetails.slot}</p>
                    )}
                    {pickupData.pickupDetails?.agent && (
                      <p>
                        <strong>Agent:</strong> {pickupData.pickupDetails.agent}
                        {pickupData.pickupDetails.agentPhone ? ` · ${pickupData.pickupDetails.agentPhone}` : ""}
                      </p>
                    )}
                    {pickupData.pickupDetails?.address && (
                      <p><strong>Address:</strong> {pickupData.pickupDetails.address}</p>
                    )}
                    {pickupData.pickupDetails?.instructions && (
                      <p><strong>Instructions:</strong> {pickupData.pickupDetails.instructions}</p>
                    )}
                  </div>

                  {/* OTP stage */}
                  {!otpVerified ? (
                    <div className="oh-otp-block">
                      <h4>Confirm pickup with OTP</h4>
                      <p className="oh-otp-hint">
                        Share this OTP with the delivery agent when they arrive.
                        Then enter it below to confirm.
                      </p>

                      <div className="oh-otp-row">
                        <span className="oh-otp-code">
                          {pickupData.pickupDetails?.otp || "----"}
                        </span>
                      </div>

                      <label className="oh-form-label">
                        Enter OTP to confirm
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="••••"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                          disabled={otpBusy}
                        />
                      </label>

                      <button
                        type="button"
                        className="oh-btn-primary"
                        disabled={otpInput.length < 4 || otpBusy}
                        onClick={submitOtp}
                      >
                        {otpBusy ? "Verifying…" : "Verify OTP"}
                      </button>
                    </div>
                  ) : (
                    <div className="oh-proof-block">
                      <h4>Upload product photos</h4>
                      <p className="oh-otp-hint">
                        Upload clear photos of the product being returned, and
                        describe its condition.
                      </p>

                      <label className="oh-form-label">
                        Product Condition *
                        <select
                          value={proofCondition}
                          onChange={(e) => setProofCondition(e.target.value)}
                          disabled={proofBusy}
                        >
                          <option value="">Select…</option>
                          {CONDITIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="oh-form-label">
                        Photos (up to 5)
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={proofBusy}
                          onChange={(e) =>
                            setProofFiles(Array.from(e.target.files).slice(0, 5))
                          }
                        />
                      </label>

                      {proofFiles.length > 0 && (
                        <div className="oh-proof-thumbs">
                          {proofFiles.map((f, i) => (
                            <img
                              key={i}
                              src={URL.createObjectURL(f)}
                              alt={`preview-${i}`}
                            />
                          ))}
                        </div>
                      )}

                      <label className="oh-form-label">
                        Additional notes (optional)
                        <textarea
                          rows="2"
                          maxLength={300}
                          value={proofNote}
                          onChange={(e) => setProofNote(e.target.value)}
                          disabled={proofBusy}
                        />
                      </label>

                      <button
                        type="button"
                        className="oh-btn-primary"
                        disabled={proofBusy || !proofCondition || proofFiles.length === 0}
                        onClick={submitProof}
                      >
                        {proofBusy ? "Uploading…" : "Upload & Submit"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
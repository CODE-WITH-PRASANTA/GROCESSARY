import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
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
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Upload,
  X,
  Truck,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react";
import API, { BASE_URL } from "../../api/axios";
import "./Order.css";

// ======================================================
// HELPERS
// ======================================================

const AVATAR_COLORS = [
  "#e0e7ff",
  "#dcfce7",
  "#fef3c7",
  "#fee2e2",
  "#e0f2fe",
  "#f3e8ff",
];
const AVATAR_TEXT = [
  "#4338ca",
  "#15803d",
  "#b45309",
  "#b91c1c",
  "#0369a1",
  "#7e22ce",
];

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const formatDate = (date) => {
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

const getProductImage = (image) => {
  if (!image) return "";
  if (typeof image === "object") {
    image = image?.url || image?.path || image?.secure_url || image?.src || "";
  }
  if (!image) return "";
  const str = String(image).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE_URL}${str.startsWith("/") ? str : `/${str}`}`;
};

// Map backend status → UI label (keep all 8 distinct)
const mapStatus = (orderStatus) => {
  const s = String(orderStatus || "").toLowerCase();
  switch (s) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
};

// Map UI label → backend status
const reverseMapStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Processing: "processing",
  Shipped: "shipped",
  "Out for Delivery": "out_for_delivery",
  Delivered: "delivered",
  Cancelled: "cancelled",
  Refunded: "refunded",
};

// Map backend payment method
const mapPaymentMethod = (method) => {
  const m = String(method || "").toLowerCase();
  if (m === "cod") return "Cash on Delivery";
  if (m === "razorpay") return "Online";
  if (m === "wallet") return "Wallet";
  return method || "Online";
};

// Map backend payment status
const mapPaymentStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "Paid";
  if (s === "failed") return "Failed";
  if (s === "refunded") return "Failed";
  if (s === "pending") return "COD";
  return "COD";
};

// Map backend order → UI shape
const mapBackendOrder = (order) => {
  const user = order.user || {};
  const address = order.deliveryAddress || {};

  const customerName =
    address.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Customer";

  return {
    id: order.orderNumber || order._id,
    _id: order._id,
    refCode: order.orderNumber || "",
    customer: customerName,
    email: user.email || "",
    mobile: address.mobile || user.mobile || "",
    items:
      Array.isArray(order.items) &&
      order.items.reduce((sum, it) => sum + Number(it.quantity || 0), 0),
    itemList: (order.items || []).map((it) => ({
      name: it.productName || "Product",
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 0),
      image: getProductImage(it.image),
      unit: it.unit || "",
    })),
    amount: Number(order.totalAmount || 0),
    payableAmount: Number(order.payableAmount || 0),
    walletUsed: Number(order.walletUsed || 0),
    pointsUsed: Number(order.pointsUsed || 0),
    pointsValue: Number(order.pointsValue || 0),
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    status: mapStatus(order.orderStatus),
    orderStatus: order.orderStatus,
    date: formatISODate(order.createdAt),
    time: formatTime(order.createdAt),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveryAddress: address,
    statusHistory: order.statusHistory || [],
  };
};

// ======================================================
// STATIC DATA
// ======================================================

const statusMeta = {
  Delivered: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  "Out for Delivery": { color: "#0891b2", bg: "#cffafe", icon: Truck },
  Shipped: { color: "#2563eb", bg: "#dbeafe", icon: Truck },
  Processing: { color: "#d97706", bg: "#fef3c7", icon: RefreshCw },
  Confirmed: { color: "#7c3aed", bg: "#ede9fe", icon: CheckCircle2 },
  Pending: { color: "#d97706", bg: "#fef3c7", icon: Clock },
  Cancelled: { color: "#dc2626", bg: "#fee2e2", icon: XCircle },
  Refunded: { color: "#9333ea", bg: "#f3e8ff", icon: RefreshCw },
};

const paymentBadgeMeta = {
  Paid: { color: "#16a34a", bg: "#dcfce7" },
  COD: { color: "#475569", bg: "#f1f5f9" },
  Failed: { color: "#dc2626", bg: "#fee2e2" },
};

const topProducts = [
  { name: "Basmati Rice 5kg", orders: 240, emoji: "🍚", bg: "#f1f5f9" },
  { name: "Fortune Sunflower Oil 1L", orders: 210, emoji: "🛢️", bg: "#fef3c7" },
  { name: "Tata Salt 1kg", orders: 185, emoji: "🧂", bg: "#fee2e2" },
  { name: "Toor Dal 1kg", orders: 150, emoji: "🫘", bg: "#fef9c3" },
  { name: "Aashirvaad Atta 5kg", orders: 130, emoji: "🌾", bg: "#fee2e2" },
];

// ======================================================
// COMPONENT
// ======================================================

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payment Status");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [quickChip, setQuickChip] = useState("All Time");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    email: "",
    items: 1,
    amount: "",
    paymentMethod: "Online",
    paymentStatus: "Paid",
    status: "Pending",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  // ======================================================
  // TOKEN
  // ======================================================

  const getToken = () => {
    try {
      return (
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        null
      );
    } catch {
      return null;
    }
  };

  // ======================================================
  // FETCH ALL ORDERS (ADMIN)
  // ======================================================

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setLoading(true);

      setError("");

      // 👇 no localStorage check — cookie is sent automatically
      const { data } = await API.get("/orders", {
        params: { limit: 500 },
      });

      const list = Array.isArray(data?.orders) ? data.orders : [];
      setOrders(list.map(mapBackendOrder));
    } catch (err) {
      console.error("Fetch admin orders error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view orders.");
      } else {
        setError(err.response?.data?.message || "Failed to load orders.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Close actions menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".Order-actions-dropdown-wrap")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // ======================================================
  // STATS
  // ======================================================

  const stats = useMemo(() => {
    const by = (label) => orders.filter((o) => o.status === label).length;
    return {
      total: orders.length,
      pending: by("Pending"),
      confirmed: by("Confirmed"),
      processing: by("Processing"),
      shipped: by("Shipped"),
      ofd: by("Out for Delivery"),
      delivered: by("Delivered"),
      cancelled: by("Cancelled"),
      refunded: by("Refunded"),
    };
  }, [orders]);

  const donutData = useMemo(() => {
    const total = orders.length || 1;
    const counts = {
      Delivered: orders.filter((o) => o.status === "Delivered").length,
      "Out for Delivery": orders.filter((o) => o.status === "Out for Delivery")
        .length,
      Shipped: orders.filter((o) => o.status === "Shipped").length,
      Processing: orders.filter((o) => o.status === "Processing").length,
      Confirmed: orders.filter((o) => o.status === "Confirmed").length,
      Pending: orders.filter((o) => o.status === "Pending").length,
      Cancelled: orders.filter((o) => o.status === "Cancelled").length,
      Refunded: orders.filter((o) => o.status === "Refunded").length,
    };
    const colors = {
      Delivered: "#22c55e",
      "Out for Delivery": "#06b6d4",
      Shipped: "#3b82f6",
      Processing: "#f59e0b",
      Confirmed: "#8b5cf6",
      Pending: "#fb923c",
      Cancelled: "#ef4444",
      Refunded: "#a855f7",
    };
    let cursor = 0;
    const segments = Object.entries(counts).map(([label, count]) => {
      const pct = (count / total) * 100;
      const seg = { label, count, pct, color: colors[label], start: cursor };
      cursor += pct;
      return seg;
    });
    return { segments, total: orders.length };
  }, [orders]);

  // ======================================================
  // FILTERING
  // ======================================================

  const matchesQuickChip = (order) => {
    if (quickChip === "All Time") return true;

    const d = new Date(order.createdAt || order.date);
    const today = new Date();

    if (quickChip === "Today") {
      return d.toDateString() === today.toDateString();
    }
    if (quickChip === "This Week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= today;
    }
    if (quickChip === "This Month") {
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
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
        o.email.toLowerCase().includes(term) ||
        o.mobile.includes(term);

      const matchesStatus =
        statusFilter === "All Status" || o.status === statusFilter;

      const matchesPayment =
        paymentFilter === "All Payment Status" ||
        o.paymentStatus === paymentFilter;

      const orderDate = new Date(o.createdAt || o.date);
      const matchesStart = !dateStart || orderDate >= new Date(dateStart);
      const matchesEnd = !dateEnd || orderDate <= new Date(dateEnd);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesStart &&
        matchesEnd &&
        matchesQuickChip(o)
      );
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentFilter,
    dateStart,
    dateEnd,
    quickChip,
  ]);

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
      if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
        pages.push(p);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  }, [totalPages, safePage]);

  // ======================================================
  // SELECTION
  // ======================================================

  const allVisibleSelected =
    pageOrders.length > 0 && pageOrders.every((o) => selectedIds.has(o.id));

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

  // ======================================================
  // UPDATE STATUS
  // ======================================================

  const handleUpdateStatus = async (order, newStatus) => {
    const backendStatus = reverseMapStatus[newStatus];
    if (!backendStatus) return;

    try {
      setUpdatingId(order._id);

      await API.put(`/orders/${order._id}/status`, {
        status: backendStatus,
        note: `Status changed to ${newStatus} by admin`,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                status: newStatus,
                orderStatus: backendStatus,
                updatedAt: new Date().toISOString(),
              }
            : o,
        ),
      );

      setActiveMenuId(null);
      showToast(`Order #${order.id} marked as ${newStatus}`);
    } catch (err) {
      console.error("Update status error:", err);
      alert(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // CANCEL ORDER
  // ======================================================

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.id}?`,
    );
    if (!confirmed) return;

    try {
      setUpdatingId(order._id);

      await API.put(`/orders/${order._id}/status`, {
        status: "cancelled",
        note: "Cancelled by admin",
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, status: "Cancelled", orderStatus: "cancelled" }
            : o,
        ),
      );

      setActiveMenuId(null);
      showToast(`Order #${order.id} cancelled`);
    } catch (err) {
      console.error("Cancel order error:", err);
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // EDIT ORDER (local-only)
  // ======================================================

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editOrder) return;

    try {
      // Only status persists to backend
      if (editOrder.orderStatus !== reverseMapStatus[editOrder.status]) {
        await API.put(`/orders/${editOrder._id}/status`, {
          status: reverseMapStatus[editOrder.status],
          note: "Status updated via edit form",
        });
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === editOrder._id ? { ...o, ...editOrder } : o)),
      );

      showToast(`Order #${editOrder.id} updated`);
      setEditOrder(null);
    } catch (err) {
      console.error("Edit order error:", err);
      alert(err.response?.data?.message || "Failed to update order.");
    }
  };

  // ======================================================
  // FILTERS
  // ======================================================

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setPaymentFilter("All Payment Status");
    setDateStart("");
    setDateEnd("");
    setQuickChip("All Time");
  };

  const handleRefresh = () => {
    fetchOrders(true);
    setSelectedIds(new Set());
  };

  // ======================================================
  // EXPORT
  // ======================================================

  const handleExport = () => {
    const header = [
      "Order ID",
      "Customer",
      "Email",
      "Mobile",
      "Items",
      "Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Status",
      "Date",
      "Time",
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      o.customer,
      o.email,
      o.mobile,
      o.items,
      o.amount,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.date,
      o.time,
    ]);

    const csv = [header, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-export-${filteredOrders.length}-rows.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredOrders.length} orders`);
  };

  // ======================================================
  // IMPORT (local demo)
  // ======================================================

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = String(evt.target.result || "");
        const lines = text.split(/\r?\n/).filter(Boolean);
        const dataLines = lines[0]?.toLowerCase().includes("customer")
          ? lines.slice(1)
          : lines;

        const imported = dataLines.map((line, idx) => {
          const cols = line
            .split(",")
            .map((c) => c.replace(/^"|"$/g, "").trim());
          const [
            customer = `Imported Customer ${idx + 1}`,
            email = "",
            items = "1",
            amount = "0",
          ] = cols;

          return {
            id: `IMP-${Date.now()}-${idx}`,
            refCode: "IMPORTED",
            customer,
            email: email || "unknown@example.com",
            mobile: "",
            items: parseInt(items, 10) || 1,
            amount: parseFloat(amount) || 0,
            paymentMethod: "Online",
            paymentStatus: "Paid",
            status: "Pending",
            date: new Date().toISOString().slice(0, 10),
            time: "12:00 PM",
            createdAt: new Date().toISOString(),
            _local: true,
          };
        });

        setOrders((prev) => [...imported, ...prev]);
        showToast(
          `Imported ${imported.length} order${imported.length === 1 ? "" : "s"} (local only)`,
        );
      } catch (err) {
        showToast("Could not read that file — expected a CSV");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ======================================================
  // ADD ORDER (local)
  // ======================================================

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!form.customer.trim() || !form.amount) return;

    const newOrder = {
      id: `NEW-${Date.now()}`,
      refCode: "MANUAL",
      customer: form.customer.trim(),
      email: form.email.trim() || "unknown@example.com",
      mobile: "",
      items: Number(form.items) || 1,
      amount: Number(form.amount) || 0,
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      status: form.status,
      date: new Date().toISOString().slice(0, 10),
      time: "12:00 PM",
      createdAt: new Date().toISOString(),
      _local: true,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setForm({
      customer: "",
      email: "",
      items: 1,
      amount: "",
      paymentMethod: "Online",
      paymentStatus: "Paid",
      status: "Pending",
    });
    setShowAddModal(false);
    showToast(`Order ${newOrder.id} created (local only)`);
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const initials = (name) =>
    String(name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "U";

  const avatarStyle = (idx) => ({
    backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    color: AVATAR_TEXT[idx % AVATAR_TEXT.length],
  });

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  if (loading) {
    return (
      <div className="Order">
        <div className="Order-loading">Loading orders…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Order">
        <div className="Order-error">
          <p>{error}</p>
          <button onClick={() => fetchOrders()}>Try Again</button>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="Order">
      {/* HEADER */}
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

      {/* STATS */}
      <div className="Order-stats">
        <div className="Order-stat-card">
          <div
            className="Order-stat-icon"
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <ShoppingBag size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Total Orders</p>
            <p className="Order-stat-value">{stats.total}</p>
            <span className="Order-stat-delta up">
              <ArrowUp size={12} /> 12.5% this month
            </span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div
            className="Order-stat-icon"
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <Clock size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Pending Orders</p>
            <p className="Order-stat-value">{stats.pending}</p>
            <span className="Order-stat-delta up">
              <ArrowUp size={12} /> 5.2% this month
            </span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div
            className="Order-stat-icon"
            style={{ background: "#dbeafe", color: "#2563eb" }}
          >
            <RefreshCw size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Processing Orders</p>
            <p className="Order-stat-value">{stats.processing}</p>
            <span className="Order-stat-delta up">
              <ArrowUp size={12} /> 8.1% this month
            </span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div
            className="Order-stat-icon"
            style={{ background: "#f3e8ff", color: "#9333ea" }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Delivered Orders</p>
            <p className="Order-stat-value">{stats.delivered}</p>
            <span className="Order-stat-delta up">
              <ArrowUp size={12} /> 15.3% this month
            </span>
          </div>
        </div>

        <div className="Order-stat-card">
          <div
            className="Order-stat-icon"
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            <XCircle size={20} />
          </div>
          <div className="Order-stat-body">
            <p className="Order-stat-label">Cancelled Orders</p>
            <p className="Order-stat-value">{stats.cancelled}</p>
            <span className="Order-stat-delta down">
              <ArrowDown size={12} /> 2.1% this month
            </span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="Order-main">
        {/* FILTERS */}
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>
                <option>Refunded</option>
              </select>
            </div>

            <div className="Order-field">
              <label>Payment Status</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
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
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
                <span>–</span>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className={`Order-btn Order-btn-outline ${showFilterPanel ? "active" : ""}`}
              onClick={() => setShowFilterPanel((v) => !v)}
            >
              <Filter size={15} /> Filters
            </button>
          </div>

          {showFilterPanel && (
            <div className="Order-quick-chips">
              {["Today", "This Week", "This Month", "All Time"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`Order-chip ${quickChip === chip ? "active" : ""}`}
                  onClick={() => setQuickChip(chip)}
                >
                  {chip}
                </button>
              ))}
              <button
                type="button"
                className="Order-chip Order-chip-clear"
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="Order-actions-row">
            <span className="Order-result-count">
              {filteredOrders.length} order
              {filteredOrders.length === 1 ? "" : "s"} found
              {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ""}
            </span>
            <div className="Order-actions-buttons">
              <button
                type="button"
                className="Order-btn Order-btn-outline"
                onClick={handleImportClick}
              >
                <Upload size={15} /> Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportFile}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="Order-btn Order-btn-outline"
                onClick={handleExport}
              >
                <Download size={15} /> Export
              </button>
              <button
                type="button"
                className="Order-btn Order-btn-primary"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw size={15} className={isRefreshing ? "spin" : ""} />{" "}
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="Order-table-card">
          <div className="Order-table-scroll">
            <table className="Order-table">
              <thead>
                <tr>
                  <th className="Order-th-check">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="Order-empty-row">
                      No orders match your filters.
                    </td>
                  </tr>
                )}

                {pageOrders.map((o, idx) => {
                  const meta = statusMeta[o.status] || statusMeta.Pending;
                  const StatusIcon = meta.icon;
                  const payMeta =
                    paymentBadgeMeta[o.paymentStatus] || paymentBadgeMeta.COD;
                  const isUpdating = updatingId === o._id;

                  return (
                    <tr key={o._id || o.id}>
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
                          <div
                            className="Order-avatar"
                            style={avatarStyle(idx)}
                          >
                            {initials(o.customer)}
                          </div>
                          <div>
                            <p className="Order-cell-strong">{o.customer}</p>
                            <p className="Order-cell-muted">
                              {o.email || o.mobile || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="Order-cell-strong">{o.items} Items</p>
                        <button
                          type="button"
                          className="Order-view-items-link"
                          onClick={() => setViewOrder(o)}
                        >
                          View Items
                        </button>
                      </td>
                      <td>
                        <p className="Order-cell-strong">
                          {formatINR(o.amount)}
                        </p>
                      </td>
                      <td>
                        <span
                          className="Order-badge"
                          style={{
                            background: payMeta.bg,
                            color: payMeta.color,
                          }}
                        >
                          {o.paymentStatus}
                        </span>
                        <p
                          className="Order-cell-muted"
                          style={{ marginTop: 3 }}
                        >
                          {o.paymentMethod}
                        </p>
                      </td>
                      <td>
                        <span
                          className="Order-status-badge"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {o.status} <StatusIcon size={12} />
                        </span>
                      </td>
                      <td>
                        <p className="Order-cell-strong">{o.date}</p>
                        <p className="Order-cell-muted">{o.time}</p>
                      </td>
                      <td>
                        <div className="Order-row-actions">
                          <button
                            type="button"
                            className="Order-icon-btn"
                            onClick={() => setEditOrder(o)}
                            title="Edit Order"
                            aria-label="Edit order"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            className="Order-icon-btn"
                            onClick={() => setViewOrder(o)}
                            title="View Details"
                            aria-label="View order details"
                          >
                            <Eye size={15} />
                          </button>

                          <div className="Order-actions-dropdown-wrap">
                            <button
                              type="button"
                              className="Order-icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(
                                  activeMenuId === o.id ? null : o.id,
                                );
                              }}
                              title="Update Status"
                              aria-label="Status menu"
                              disabled={isUpdating}
                            >
                              <MoreVertical size={15} />
                            </button>

                            {activeMenuId === o.id && (
                              <div className="Order-dropdown-menu">
                                <div className="Order-dropdown-header">
                                  Update Status
                                </div>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Pending")
                                  }
                                >
                                  <Clock size={14} className="icon-amber" /> Set
                                  Pending
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Confirmed")
                                  }
                                >
                                  <CheckCircle2
                                    size={14}
                                    className="icon-purple"
                                  />{" "}
                                  Set Confirmed
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Processing")
                                  }
                                >
                                  <RefreshCw size={14} className="icon-amber" />{" "}
                                  Set Processing
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Shipped")
                                  }
                                >
                                  <Truck size={14} className="icon-blue" /> Set
                                  Shipped
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Out for Delivery")
                                  }
                                >
                                  <Truck size={14} className="icon-cyan" /> Set
                                  Out for Delivery
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Delivered")
                                  }
                                >
                                  <CheckCircle2
                                    size={14}
                                    className="icon-green"
                                  />{" "}
                                  Set Delivered
                                </button>
                                <div className="Order-dropdown-divider" />
                                <button
                                  onClick={() => handleCancelOrder(o)}
                                  style={{ color: "#dc2626" }}
                                >
                                  <XCircle size={14} /> Cancel Order
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(o, "Refunded")
                                  }
                                  style={{ color: "#9333ea" }}
                                >
                                  <RefreshCw size={14} /> Mark Refunded
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="Order-pagination">
            <span className="Order-pagination-info">
              Showing {filteredOrders.length === 0 ? 0 : pageStart + 1} to{" "}
              {Math.min(pageStart + pageSize, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </span>

            <div className="Order-pagination-controls">
              <button
                type="button"
                className="Order-page-btn"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                type="button"
                className="Order-page-btn"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} />
              </button>

              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="Order-page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`Order-page-btn ${p === safePage ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                className="Order-page-btn"
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight size={15} />
              </button>
              <button
                type="button"
                className="Order-page-btn"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronsRight size={15} />
              </button>
            </div>

            <div className="Order-pagesize">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={8}>8 / page</option>
                <option value={16}>16 / page</option>
                <option value={24}>24 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="Order-bottom-horizontal">
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
                  .join(", ")})`,
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
                  <span
                    className="Order-legend-dot"
                    style={{ background: s.color }}
                  />
                  <span className="Order-legend-label">{s.label}</span>
                  <span className="Order-legend-value">
                    {s.count} ({s.pct.toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="Order-card">
          <div className="Order-card-header">
            <h3>Top Selling Products</h3>
            <button type="button" className="Order-link-btn">
              View All
            </button>
          </div>
          <ul className="Order-product-list">
            {topProducts.map((p) => (
              <li key={p.name}>
                <div
                  className="Order-product-thumb"
                  style={{ background: p.bg }}
                >
                  {p.emoji}
                </div>
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
            <button
              type="button"
              className="Order-btn Order-btn-green Order-quick-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Add New Order
            </button>
            <button
              type="button"
              className="Order-btn Order-btn-outline Order-quick-btn"
              onClick={handleImportClick}
            >
              <Upload size={16} /> Import Orders
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewOrder && (
        <div className="Order-modal-overlay" onClick={() => setViewOrder(null)}>
          <div
            className="Order-modal Order-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Order-modal-header">
              <div className="Order-view-title-wrap">
                <h3>Order #{viewOrder.id}</h3>
                <span className="Order-view-ref">{viewOrder.refCode}</span>
              </div>
              <button
                type="button"
                className="Order-close-btn"
                onClick={() => setViewOrder(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="Order-modal-body Order-view-body">
              <div className="Order-view-user-card">
                <div className="Order-avatar large" style={avatarStyle(0)}>
                  {initials(viewOrder.customer)}
                </div>
                <div>
                  <p className="Order-view-user-name">{viewOrder.customer}</p>
                  <p className="Order-view-user-email">
                    {viewOrder.email || viewOrder.mobile}
                  </p>
                </div>
              </div>

              <div className="Order-view-grid">
                <div className="Order-view-item">
                  <span className="Order-view-label">Order Status</span>
                  <span
                    className="Order-status-badge"
                    style={{
                      background: (statusMeta[viewOrder.status] || {}).bg,
                      color: (statusMeta[viewOrder.status] || {}).color,
                    }}
                  >
                    {viewOrder.status}
                  </span>
                </div>

                <div className="Order-view-item">
                  <span className="Order-view-label">Payment Status</span>
                  <span
                    className="Order-badge"
                    style={{
                      background: (
                        paymentBadgeMeta[viewOrder.paymentStatus] || {}
                      ).bg,
                      color: (paymentBadgeMeta[viewOrder.paymentStatus] || {})
                        .color,
                    }}
                  >
                    {viewOrder.paymentStatus}
                  </span>
                </div>

                <div className="Order-view-item">
                  <span className="Order-view-label">Total Amount</span>
                  <span className="Order-view-value highlight">
                    {formatINR(viewOrder.amount)}
                  </span>
                </div>

                <div className="Order-view-item">
                  <span className="Order-view-label">Payment Method</span>
                  <span className="Order-view-value">
                    {viewOrder.paymentMethod}
                  </span>
                </div>

                <div className="Order-view-item">
                  <span className="Order-view-label">Total Items</span>
                  <span className="Order-view-value">
                    {viewOrder.items} Items
                  </span>
                </div>

                <div className="Order-view-item">
                  <span className="Order-view-label">Placed Date</span>
                  <span className="Order-view-value">
                    {viewOrder.date} · {viewOrder.time}
                  </span>
                </div>
              </div>

              {/* ITEMS */}
              {viewOrder.itemList?.length > 0 && (
                <div className="Order-view-items-list">
                  <h4 className="Order-view-items-title">Items</h4>
                  <ul>
                    {viewOrder.itemList.map((it, i) => (
                      <li key={i} className="Order-view-item-row">
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="Order-view-item-img"
                          />
                        )}
                        <div className="Order-view-item-info">
                          <span className="Order-cell-strong">{it.name}</span>
                          <span className="Order-cell-muted">
                            {it.unit ? `${it.unit} · ` : ""}₹
                            {it.price.toFixed(2)} × {it.quantity}
                          </span>
                        </div>
                        <span className="Order-view-item-total">
                          ₹{(it.price * it.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ADDRESS */}
              {viewOrder.deliveryAddress && (
                <div className="Order-view-address">
                  <h4 className="Order-view-items-title">Delivery Address</h4>
                  <p className="Order-view-address-text">
                    <strong>{viewOrder.deliveryAddress.name}</strong>
                    <br />
                    {viewOrder.deliveryAddress.address}
                    {viewOrder.deliveryAddress.landmark
                      ? `, ${viewOrder.deliveryAddress.landmark}`
                      : ""}
                    <br />
                    {viewOrder.deliveryAddress.city},{" "}
                    {viewOrder.deliveryAddress.state} -{" "}
                    {viewOrder.deliveryAddress.pincode}
                    <br />
                    📞 {viewOrder.deliveryAddress.mobile}
                  </p>
                </div>
              )}
            </div>

            <div className="Order-modal-footer">
              <button
                type="button"
                className="Order-btn Order-btn-outline"
                onClick={() => setViewOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOrder && (
        <div className="Order-modal-overlay" onClick={() => setEditOrder(null)}>
          <form
            className="Order-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveEdit}
          >
            <div className="Order-modal-header">
              <h3>Edit Order #{editOrder.id}</h3>
              <button
                type="button"
                className="Order-close-btn"
                onClick={() => setEditOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="Order-modal-body">
              <label className="Order-form-label">
                Customer Name
                <input
                  required
                  value={editOrder.customer}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, customer: e.target.value })
                  }
                />
              </label>

              <label className="Order-form-label">
                Email
                <input
                  type="email"
                  value={editOrder.email}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, email: e.target.value })
                  }
                />
              </label>

              <div className="Order-form-grid">
                <label className="Order-form-label">
                  Items
                  <input
                    type="number"
                    min="1"
                    value={editOrder.items}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        items: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="Order-form-label">
                  Amount (INR)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editOrder.amount}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className="Order-form-grid">
                <label className="Order-form-label">
                  Payment Method
                  <select
                    value={editOrder.paymentMethod}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <option>Online</option>
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Cash on Delivery</option>
                    <option>Wallet</option>
                    <option>Net Banking</option>
                  </select>
                </label>

                <label className="Order-form-label">
                  Payment Status
                  <select
                    value={editOrder.paymentStatus}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        paymentStatus: e.target.value,
                      })
                    }
                  >
                    <option>Paid</option>
                    <option>COD</option>
                    <option>Failed</option>
                  </select>
                </label>
              </div>

              <label className="Order-form-label">
                Order Status
                <select
                  value={editOrder.status}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, status: e.target.value })
                  }
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                  <option>Refunded</option>
                </select>
              </label>

              <p className="Order-form-note">
                ⚠️ Only the order status will be saved to the backend. Other
                fields are local-only.
              </p>
            </div>

            <div className="Order-modal-footer">
              <button
                type="button"
                className="Order-btn Order-btn-outline"
                onClick={() => setEditOrder(null)}
              >
                Cancel
              </button>
              <button type="submit" className="Order-btn Order-btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div
          className="Order-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <form
            className="Order-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddOrder}
          >
            <div className="Order-modal-header">
              <h3>Add New Order</h3>
              <button
                type="button"
                className="Order-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="Order-modal-body">
              <label className="Order-form-label">
                Customer Name
                <input
                  required
                  value={form.customer}
                  onChange={(e) =>
                    setForm({ ...form, customer: e.target.value })
                  }
                />
              </label>
              <label className="Order-form-label">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <div className="Order-form-grid">
                <label className="Order-form-label">
                  Items
                  <input
                    type="number"
                    min="1"
                    value={form.items}
                    onChange={(e) =>
                      setForm({ ...form, items: e.target.value })
                    }
                  />
                </label>
                <label className="Order-form-label">
                  Amount (INR)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="Order-form-grid">
                <label className="Order-form-label">
                  Payment Method
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                  >
                    <option>Online</option>
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Cash on Delivery</option>
                    <option>Wallet</option>
                    <option>Net Banking</option>
                  </select>
                </label>
                <label className="Order-form-label">
                  Payment Status
                  <select
                    value={form.paymentStatus}
                    onChange={(e) =>
                      setForm({ ...form, paymentStatus: e.target.value })
                    }
                  >
                    <option>Paid</option>
                    <option>COD</option>
                    <option>Failed</option>
                  </select>
                </label>
              </div>
              <label className="Order-form-label">
                Order Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </label>

              <p className="Order-form-note">
                ⚠️ This creates a local-only order. Add a backend endpoint to
                persist it.
              </p>
            </div>

            <div className="Order-modal-footer">
              <button
                type="button"
                className="Order-btn Order-btn-outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="Order-btn Order-btn-green">
                Create Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="Order-toast">{toast}</div>}
    </div>
  );
};

export default Order;

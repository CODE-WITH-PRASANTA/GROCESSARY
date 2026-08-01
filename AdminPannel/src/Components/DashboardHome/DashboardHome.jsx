import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Calendar,
  ChevronDown,
  Download,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./DashboardHome.css";

/* ------------------------------------------------------------------ */
/* Mock Data                                                         */
/* ------------------------------------------------------------------ */

const STAT_CARDS = [
  {
    id: "sales",
    label: "Total Sales",
    value: "₹2,48,560",
    change: 18.6,
    icon: DollarSign,
    tone: "green",
    spark: [4, 6, 5, 8, 7, 10, 9, 12, 10, 14, 13, 16],
  },
  {
    id: "orders",
    label: "Total Orders",
    value: "1,248",
    change: 12.4,
    icon: ShoppingBag,
    tone: "purple",
    spark: [8, 6, 9, 7, 11, 8, 10, 9, 13, 10, 12, 11],
  },
  {
    id: "customers",
    label: "Total Customers",
    value: "856",
    change: 8.3,
    icon: Users,
    tone: "blue",
    spark: [5, 7, 6, 8, 6, 9, 8, 10, 9, 11, 10, 12],
  },
  {
    id: "aov",
    label: "Avg. Order Value",
    value: "₹1,248",
    change: 6.7,
    icon: ShoppingCart,
    tone: "orange",
    spark: [9, 8, 10, 9, 11, 10, 9, 12, 11, 10, 13, 12],
  },
  {
    id: "products",
    label: "Total Products",
    value: "1,248",
    change: 5.2,
    icon: Package,
    tone: "green",
    spark: [6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 13],
  },
  {
    id: "revenue",
    label: "Total Revenue",
    value: "₹2,48,560",
    change: 18.6,
    icon: CreditCard,
    tone: "red",
    spark: [7, 9, 8, 11, 9, 13, 11, 15, 13, 17, 15, 19],
  },
];

const SALES_DATA = [
  { date: "01 May", thisMonth: 12000, lastMonth: 18000 },
  { date: "05 May", thisMonth: 19000, lastMonth: 14000 },
  { date: "10 May", thisMonth: 15000, lastMonth: 21000 },
  { date: "15 May", thisMonth: 24000, lastMonth: 16000 },
  { date: "20 May", thisMonth: 28560, lastMonth: 12000 },
  { date: "25 May", thisMonth: 22000, lastMonth: 19000 },
  { date: "31 May", thisMonth: 30000, lastMonth: 15000 },
];

const ORDER_STATUS = [
  { key: "delivered", label: "Delivered", value: 856, pct: 68.5, color: "#17a15a" },
  { key: "processing", label: "Processing", value: 256, pct: 20.5, color: "#2e7bf6" },
  { key: "shipped", label: "Shipped", value: 98, pct: 7.8, color: "#f5a524" },
  { key: "cancelled", label: "Cancelled", value: 38, pct: 3.0, color: "#ef4b56" },
];

const RECENT_ORDERS = [
  { id: "ORD-2026-08765", date: "20 May, 10:30 AM", amount: 1248, status: "delivered", emoji: "🥐", customer: "Rahul Sharma" },
  { id: "ORD-2026-08764", date: "20 May, 09:15 AM", amount: 2560, status: "processing", emoji: "🧃", customer: "Priya Verma" },
  { id: "ORD-2026-08763", date: "20 May, 08:00 AM", amount: 980, status: "shipped", emoji: "🧴", customer: "Amit Kumar" },
  { id: "ORD-2026-08762", date: "19 May, 07:20 PM", amount: 1450, status: "delivered", emoji: "🥬", customer: "Sneha Reddy" },
  { id: "ORD-2026-08761", date: "19 May, 06:05 PM", amount: 730, status: "cancelled", emoji: "🧴", customer: "Anish Patel" },
  { id: "ORD-2026-08760", date: "19 May, 04:40 PM", amount: 1890, status: "delivered", emoji: "🥗", customer: "Vikram Singh" },
  { id: "ORD-2026-08759", date: "19 May, 02:10 PM", amount: 620, status: "shipped", emoji: "🍫", customer: "Kavita Shah" },
];

const PERIOD_OPTIONS = ["This Month", "Last Month", "This Quarter", "This Year"];

const STATUS_BADGE_CLASS = {
  delivered: "order-status-badge--delivered",
  processing: "order-status-badge--processing",
  shipped: "order-status-badge--shipped",
  cancelled: "order-status-badge--cancelled",
};

/* ------------------------------------------------------------------ */
/* Presentational Helpers                                            */
/* ------------------------------------------------------------------ */

function useOutsideClose(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

function Sparkline({ data, tone }) {
  const strokeMap = {
    green: "#17a15a",
    purple: "#8b5cf6",
    blue: "#2e7bf6",
    orange: "#f5a524",
    red: "#ef4b56",
  };
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="stat-card__sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={strokeMap[tone]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload.find((p) => p.dataKey === "thisMonth") || payload[0];
  if (!val) return null;
  return (
    <div className="chart-tooltip">
      {"₹" + val.value.toLocaleString("en-IN")}
      <div className="chart-tooltip__sub">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

const DashboardHome = () => {
  const [activeSeries, setActiveSeries] = useState("thisMonth");

  // Header State
  const [dateRange, setDateRange] = useState("This Month");
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useOutsideClose(() => setDateOpen(false));

  const [downloading, setDownloading] = useState(false);

  // Sales Period State
  const [periodOpen, setPeriodOpen] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState("This Month");
  const periodRef = useOutsideClose(() => setPeriodOpen(false));

  // Status Period State
  const [statusPeriodOpen, setStatusPeriodOpen] = useState(false);
  const [statusPeriod, setStatusPeriod] = useState("This Month");
  const statusPeriodRef = useOutsideClose(() => setStatusPeriodOpen(false));

  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Modal / Selected Order State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      triggerToast("Store summary report downloaded successfully!");
    }, 1500);
  };

  const totalOrders = useMemo(
    () => ORDER_STATUS.reduce((sum, s) => sum + s.value, 0),
    []
  );

  return (
    <div className="dashboard">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="dashboard-toast">
          <CheckCircle size={16} /> {toastMessage}
        </div>
      )}

      {/* Dashboard Top Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">
            Dashboard Overview <span className="dashboard-header__wave">👋</span>
          </h1>
          <p className="dashboard-header__subtitle">
            Welcome back! Here is what's happening with your store today.
          </p>
        </div>

        <div className="dashboard-header__actions">
          {/* Global Date Range Picker */}
          <div className="date-picker" ref={dateRef}>
            <button
              type="button"
              className="date-picker__trigger"
              onClick={() => setDateOpen((o) => !o)}
              data-open={dateOpen}
              aria-haspopup="listbox"
            >
              <Calendar size={16} />
              <span>{dateRange}</span>
              <ChevronDown size={14} />
            </button>
            {dateOpen && (
              <div className="date-picker__menu" role="listbox">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="date-picker__option"
                    data-active={opt === dateRange}
                    onClick={() => {
                      setDateRange(opt);
                      setDateOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Report Button */}
          <button
            type="button"
            className="btn-download"
            onClick={handleDownload}
            data-state={downloading ? "loading" : "idle"}
          >
            <Download size={16} />
            <span>{downloading ? "Exporting..." : "Download Report"}</span>
          </button>
        </div>
      </header>

      {/* Stat cards (Grid 3 x 2) */}
      <section className="stats-grid" aria-label="Store metrics">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const isUp = card.change >= 0;
          return (
            <article className="stat-card" key={card.id}>
              <div className="stat-card__top">
                <div className={`stat-card__icon stat-card__icon--${card.tone}`}>
                  <Icon />
                </div>
                <div>
                  <p className="stat-card__label">{card.label}</p>
                  <p className="stat-card__value">{card.value}</p>
                </div>
              </div>

              <span className={`stat-card__change stat-card__change--${isUp ? "up" : "down"}`}>
                {isUp ? <ArrowUp /> : <ArrowDown />}
                {Math.abs(card.change)}%
                <span className="stat-card__change-label">vs last month</span>
              </span>

              <Sparkline data={card.spark} tone={card.tone} />
            </article>
          );
        })}
      </section>

      {/* Main Grid: Charts & Tables */}
      <section className="main-grid">
        {/* Sales Overview Chart */}
        <div className="panel panel--sales">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">Sales Overview</h2>
              <p className="panel__subtitle">Track your sales performance compared to last month.</p>
            </div>

            <div className="panel__header-controls">
              {/* Legend Series Toggle */}
              <div className="legend-toggle">
                <button
                  type="button"
                  className="legend-toggle__item"
                  data-active={activeSeries === "thisMonth"}
                  onClick={() => setActiveSeries("thisMonth")}
                >
                  <span className="legend-toggle__dot legend-toggle__dot--solid" />
                  This Month
                </button>
                <button
                  type="button"
                  className="legend-toggle__item"
                  data-active={activeSeries === "lastMonth"}
                  onClick={() => setActiveSeries("lastMonth")}
                >
                  <span className="legend-toggle__dot legend-toggle__dot--dashed" />
                  Last Month
                </button>
              </div>

              {/* Filter Period Dropdown */}
              <div className="period-select" ref={periodRef}>
                <button
                  type="button"
                  className="period-select__trigger"
                  onClick={() => setPeriodOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={periodOpen}
                >
                  {salesPeriod}
                  <ChevronDown size={14} />
                </button>
                {periodOpen && (
                  <div className="period-select__menu" role="listbox">
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="period-select__option"
                        data-active={opt === salesPeriod}
                        onClick={() => {
                          setSalesPeriod(opt);
                          setPeriodOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA} margin={{ top: 24, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#17a15a" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#17a15a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#b3b7c6" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v / 1000}K`}
                  tick={{ fontSize: 11, fill: "#b3b7c6" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<SalesTooltip />} />
                <Area
                  type="monotone"
                  dataKey="lastMonth"
                  stroke="#c8cbd6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="transparent"
                  dot={false}
                  opacity={activeSeries === "lastMonth" ? 1 : 0.4}
                />
                <Area
                  type="monotone"
                  dataKey="thisMonth"
                  stroke="#17a15a"
                  strokeWidth={2.5}
                  fill="url(#salesFill)"
                  dot={false}
                  opacity={activeSeries === "thisMonth" ? 1 : 0.4}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut Chart */}
        <div className="panel panel--status">
          <div className="panel__header">
            <h2 className="panel__title">Order Status</h2>
            <div className="period-select" ref={statusPeriodRef}>
              <button
                type="button"
                className="period-select__trigger"
                onClick={() => setStatusPeriodOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={statusPeriodOpen}
              >
                {statusPeriod}
                <ChevronDown size={14} />
              </button>
              {statusPeriodOpen && (
                <div className="period-select__menu" role="listbox">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="period-select__option"
                      data-active={opt === statusPeriod}
                      onClick={() => {
                        setStatusPeriod(opt);
                        setStatusPeriodOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ORDER_STATUS}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {ORDER_STATUS.map((s) => (
                    <Cell
                      key={s.key}
                      fill={s.color}
                      opacity={hoveredStatus && hoveredStatus !== s.key ? 0.25 : 1}
                      onMouseEnter={() => setHoveredStatus(s.key)}
                      onMouseLeave={() => setHoveredStatus(null)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span className="donut-center__label">Total</span>
              <span className="donut-center__value">{totalOrders.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="status-legend">
            {ORDER_STATUS.map((s) => (
              <button
                type="button"
                className="status-legend__row"
                key={s.key}
                data-dim={hoveredStatus && hoveredStatus !== s.key}
                onMouseEnter={() => setHoveredStatus(s.key)}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                <span className="status-legend__left">
                  <span className="status-legend__dot" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span>
                  <span className="status-legend__count">{s.value}</span>
                  <span className="status-legend__pct">({s.pct.toFixed(1)}%)</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="panel panel--orders">
          <div className="panel__header">
            <h2 className="panel__title">Recent Orders</h2>
            <button
              type="button"
              className="panel__link"
              onClick={() => setOrdersModalOpen(true)}
            >
              View All
            </button>
          </div>

          <div className="orders-list">
            {RECENT_ORDERS.slice(0, 5).map((order) => (
              <button
                type="button"
                className="order-row"
                key={order.id}
                onClick={() => setSelectedOrder(order)}
              >
                <span className="order-row__thumb" aria-hidden="true">
                  {order.emoji}
                </span>
                <span className="order-row__info">
                  <p className="order-row__id">{order.id}</p>
                  <p className="order-row__meta">{order.date}</p>
                </span>
                <span className="order-row__right">
                  <span className="order-row__amount">
                    {"₹" + order.amount.toLocaleString("en-IN")}
                  </span>
                  <span className={`order-status-badge ${STATUS_BADGE_CLASS[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Orders Modal */}
      {ordersModalOpen && (
        <div className="dashboard-modal-overlay" onClick={() => setOrdersModalOpen(false)}>
          <div className="dashboard-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">All Recent Orders ({RECENT_ORDERS.length})</h3>
              <button className="dashboard-modal-close" onClick={() => setOrdersModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="dashboard-modal-body">
              <div className="modal-table-wrap">
                <table className="dashboard-modal-table">
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
                    {RECENT_ORDERS.map((ord) => (
                      <tr key={ord.id} onClick={() => { setSelectedOrder(ord); setOrdersModalOpen(false); }} className="clickable-row">
                        <td><strong>{ord.emoji} {ord.id}</strong></td>
                        <td>{ord.customer}</td>
                        <td>{ord.date}</td>
                        <td>{"₹" + ord.amount.toLocaleString("en-IN")}</td>
                        <td>
                          <span className={`order-status-badge ${STATUS_BADGE_CLASS[ord.status]}`}>
                            {ord.status.charAt(0).toUpperCase() + ord.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="dashboard-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="dashboard-modal-card sm" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">Order Details</h3>
              <button className="dashboard-modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="dashboard-modal-body">
              <div className="order-detail-header">
                <span className="order-detail-emoji">{selectedOrder.emoji}</span>
                <div>
                  <h4 className="order-detail-id">{selectedOrder.id}</h4>
                  <span className={`order-status-badge ${STATUS_BADGE_CLASS[selectedOrder.status]}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-detail-info">
                <div className="order-detail-row">
                  <span>Customer Name:</span>
                  <strong>{selectedOrder.customer}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Order Date & Time:</span>
                  <strong>{selectedOrder.date}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Total Bill Amount:</span>
                  <strong className="text-green">{"₹" + selectedOrder.amount.toLocaleString("en-IN")}</strong>
                </div>
                <div className="order-detail-row">
                  <span>Payment Status:</span>
                  <strong>Paid (Online UPI)</strong>
                </div>
              </div>

              <button className="btn-modal-action" onClick={() => { triggerToast(`Receipt sent for ${selectedOrder.id}`); setSelectedOrder(null); }}>
                Print Order Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  ReceiptText,
  Boxes,
  Users,
  RotateCcw,
  RefreshCw,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import API, { BASE_URL } from "../../api/axios";
import "./Dashboard.css";

// ======================================================
// Helpers
// ======================================================
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 1,
  }).format(num);
};

const formatNumber = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN").format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ======================================================
// Custom Tooltip for Recharts
// ======================================================
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="dash-chart-tooltip">
        <p className="dash-tooltip-date">{data.label || label}</p>
        <div className="dash-tooltip-row total">
          <span>Gross Revenue:</span>
          <strong>{formatCurrency(data.totalRevenue)}</strong>
        </div>
        <div className="dash-tooltip-row online">
          <span>Online Store:</span>
          <strong>{formatCurrency(data.onlineRevenue)}</strong>
        </div>
        <div className="dash-tooltip-row pos">
          <span>Counter POS:</span>
          <strong>{formatCurrency(data.posRevenue)}</strong>
        </div>
        <div className="dash-tooltip-divider" />
        <div className="dash-tooltip-row orders">
          <span>Orders / Bills:</span>
          <span>{data.orders || 0} online • {data.bills || 0} POS</span>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();

  // State
  const [range, setRange] = useState("all"); // 'all' | 'today' | 'week' | 'month'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'bills'

  // Fetch Dashboard Analytics from API
  const fetchDashboardStats = useCallback(
    async (selectedRange = range, isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const res = await API.get(`/admin/dashboard-stats`, {
          params: { range: selectedRange },
        });

        if (res.data?.success) {
          setStats(res.data);
        } else {
          throw new Error(res.data?.message || "Failed to load dashboard data.");
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to connect to analytics service. Please check your connection."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    fetchDashboardStats(range);
  }, [range, fetchDashboardStats]);

  // Handle CSV Export
  const handleExportReport = () => {
    if (!stats) return;
    const { financials, inventory, customers, returns } = stats;

    const rows = [
      ["GrocerySathi Executive Analytics Report"],
      [`Generated at: ${new Date().toLocaleString("en-IN")}`],
      [`Timeframe: ${range.toUpperCase()}`],
      [],
      ["METRIC", "VALUE"],
      ["Gross Revenue", formatCurrency(financials?.grossRevenue)],
      ["Online Revenue", formatCurrency(financials?.onlineRevenue)],
      ["POS Counter Revenue", formatCurrency(financials?.posRevenue)],
      ["Total Transactions", financials?.totalTransactions],
      ["Online Orders Count", financials?.onlineOrdersCount],
      ["POS Bills Count", financials?.posBillsCount],
      ["Average Order Value", formatCurrency(financials?.avgOrderValue)],
      ["Today Revenue", formatCurrency(financials?.todayRevenue)],
      ["Total Catalog Products", inventory?.totalProducts],
      ["Active Products", inventory?.activeProducts],
      ["Total Units in Stock", inventory?.totalStockUnits],
      ["Inventory Valuation", formatCurrency(inventory?.totalStockValue)],
      ["Out of Stock Items", inventory?.outOfStockCount],
      ["Low Stock Warning Items", inventory?.lowStockCount],
      ["Registered Customers", customers?.totalUsers],
      ["Cold Leads", customers?.totalColdLeads],
      ["Return Requests", returns?.totalReturnsCount],
      ["Returns Amount", formatCurrency(returns?.totalReturnsAmount)],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `GrocerySathi_Analytics_${range}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe destructuring
  const financials = stats?.financials || {};
  const ordersPipeline = stats?.ordersPipeline || {};
  const inventory = stats?.inventory || {};
  const customers = stats?.customers || {};
  const returns = stats?.returns || {};
  const paymentMethods = stats?.paymentMethods || [];
  const categoryDistribution = stats?.categoryDistribution || [];
  const revenueTrend = stats?.revenueTrend || [];
  const recentOrders = stats?.recentActivity?.orders || [];
  const recentBills = stats?.recentActivity?.bills || [];

  // Channel percentages
  const channelMetrics = useMemo(() => {
    const gross = financials.grossRevenue || 0;
    if (gross <= 0) return { onlinePct: 50, posPct: 50 };
    const onlinePct = Math.round(((financials.onlineRevenue || 0) / gross) * 100);
    const posPct = 100 - onlinePct;
    return { onlinePct, posPct };
  }, [financials.grossRevenue, financials.onlineRevenue]);

  return (
    <div className="dash-container">
      {/* ==================================================== */}
      {/* TOP HEADER & CONTROL BAR (INTEGRATED SINGLE LINE)    */}
      {/* ==================================================== */}
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="dash-title-row">
            <h1>GrocerySathi Executive Dashboard</h1>
          </div>
          <p className="dash-header-desc">
            Real-time business intelligence across Online Store, POS Counter, Catalog Health & Customers.
          </p>
        </div>

        <div className="dash-header-controls">
          {/* Timeframe Filter Tabs */}
          <div className="dash-time-filter" role="tablist">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`dash-time-btn ${range === t.id ? "active" : ""}`}
                onClick={() => setRange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <button
            type="button"
            className="dash-action-btn refresh-btn"
            onClick={() => fetchDashboardStats(range, true)}
            title="Refresh Live Data"
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* QUICK LAUNCH SHORTCUTS */}
      {/* ==================================================== */}
      <div className="dash-shortcuts-bar">
        <button
          type="button"
          className="dash-shortcut-chip"
          onClick={() => navigate("/products/add-product")}
        >
          <div className="shortcut-icon plus">
            <Plus size={14} />
          </div>
          <span>Add Product</span>
        </button>

        <button
          type="button"
          className="dash-shortcut-chip"
          onClick={() => navigate("/billing")}
        >
          <div className="shortcut-icon pos">
            <ReceiptText size={14} />
          </div>
          <span>POS Counter</span>
        </button>

        <button
          type="button"
          className="dash-shortcut-chip"
          onClick={() => navigate("/orders")}
        >
          <div className="shortcut-icon orders">
            <ShoppingBag size={14} />
          </div>
          <span>Manage Orders</span>
        </button>

        <button
          type="button"
          className="dash-shortcut-chip"
          onClick={() => navigate("/orders/returns")}
        >
          <div className="shortcut-icon returns">
            <RotateCcw size={14} />
          </div>
          <span>Return Management</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="dash-error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboardStats(range)}
            className="dash-retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* HERO KPI CARDS */}
      {/* ==================================================== */}
      <section className="dash-kpi-grid">
        {/* KPI 1: Gross Revenue */}
        <div className="dash-kpi-card revenue-card">
          <div className="kpi-top">
            <span className="kpi-label">Gross Revenue</span>
            <div className="kpi-icon-wrap emerald">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? (
              <div className="dash-skeleton val" />
            ) : (
              formatCurrency(financials.grossRevenue)
            )}
          </div>
          <div className="kpi-footer">
            <span className="kpi-sub-pill online">
              Online: {formatCurrency(financials.onlineRevenue)}
            </span>
            <span className="kpi-sub-pill pos">
              POS: {formatCurrency(financials.posRevenue)}
            </span>
          </div>
        </div>

        {/* KPI 2: Total Transactions */}
        <div className="dash-kpi-card transactions-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Transactions</span>
            <div className="kpi-icon-wrap blue">
              <ReceiptText size={19} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? (
              <div className="dash-skeleton val" />
            ) : (
              formatNumber(financials.totalTransactions)
            )}
          </div>
          <div className="kpi-footer">
            <span className="kpi-hint">
              Avg Order Value: <strong>{formatCurrency(financials.avgOrderValue)}</strong>
            </span>
            <span className="kpi-tag">
              {financials.onlineOrdersCount || 0} Web • {financials.posBillsCount || 0} POS
            </span>
          </div>
        </div>

        {/* KPI 3: Catalog & Inventory */}
        <div className="dash-kpi-card inventory-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Catalog</span>
            <div className="kpi-icon-wrap violet">
              <Boxes size={19} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? (
              <div className="dash-skeleton val" />
            ) : (
              `${formatNumber(inventory.totalProducts)} Products`
            )}
          </div>
          <div className="kpi-footer">
            <span className="kpi-hint">
              Stock Units: <strong>{formatNumber(inventory.totalStockUnits)}</strong>
            </span>
            <span className="kpi-tag green">
              Val: {formatCurrency(inventory.totalStockValue)}
            </span>
          </div>
        </div>

        {/* KPI 4: Customer Network */}
        <div className="dash-kpi-card customers-card">
          <div className="kpi-top">
            <span className="kpi-label">Customer Network</span>
            <div className="kpi-icon-wrap amber">
              <Users size={19} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? (
              <div className="dash-skeleton val" />
            ) : (
              `${formatNumber(customers.totalUsers)} Customers`
            )}
          </div>
          <div className="kpi-footer">
            <span className="kpi-hint">
              Active: <strong>{customers.activeUsers || 0}</strong>
            </span>
            <span className="kpi-tag orange">
              {customers.totalColdLeads || 0} Leads
            </span>
          </div>
        </div>

        {/* KPI 5: Returns & Refunds */}
        <div className="dash-kpi-card returns-card">
          <div className="kpi-top">
            <span className="kpi-label">Returns & Refunds</span>
            <div className="kpi-icon-wrap rose">
              <RotateCcw size={19} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? (
              <div className="dash-skeleton val" />
            ) : (
              `${formatNumber(returns.totalReturnsCount)} Returns`
            )}
          </div>
          <div className="kpi-footer">
            <span className="kpi-hint">
              Refunds: <strong>{formatCurrency(returns.totalReturnsAmount)}</strong>
            </span>
            <span className="kpi-tag rose">
              {returns.statusMap?.refunded || 0} Resolved
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* ROW 1: REVENUE TREND & SALES BREAKDOWN */}
      {/* ==================================================== */}
      <section className="dash-analytics-row">
        {/* Main Chart: Revenue Trend */}
        <div className="dash-panel chart-panel">
          <div className="panel-header">
            <div>
              <h3>Revenue Trajectory & Sales Trend</h3>
              <p>Day-by-day revenue breakdown combining Online Web Orders and In-store POS Counters.</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item total">
                <span className="legend-dot" /> Gross Total
              </span>
              <span className="legend-item online">
                <span className="legend-dot" /> Online
              </span>
              <span className="legend-item pos">
                <span className="legend-dot" /> In-Store POS
              </span>
            </div>
          </div>

          <div className="chart-body">
            {loading ? (
              <div className="dash-chart-skeleton" />
            ) : revenueTrend.length === 0 ? (
              <div className="dash-empty-state">
                <Clock size={32} />
                <p>No transaction history recorded for this timeframe.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <AreaChart
                  data={revenueTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="onlineRevenue"
                    stroke="#3b82f6"
                    strokeWidth={1.8}
                    fillOpacity={1}
                    fill="url(#colorOnline)"
                  />
                  <Area
                    type="monotone"
                    dataKey="posRevenue"
                    stroke="#8b5cf6"
                    strokeWidth={1.8}
                    fillOpacity={1}
                    fill="url(#colorPos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Channel & Payment Distribution */}
        <div className="dash-panel side-panel">
          <div className="panel-header">
            <div>
              <h3>Sales Channel & Payment Split</h3>
              <p>Contribution by store channel & payment methods</p>
            </div>
          </div>

          <div className="side-panel-content">
            {/* Sales Channel Ratio Bar */}
            <div className="channel-split-wrap">
              <div className="split-labels">
                <span>
                  <strong>Online Store:</strong> {channelMetrics.onlinePct}% (
                  {formatCurrency(financials.onlineRevenue)})
                </span>
                <span>
                  <strong>POS Billing:</strong> {channelMetrics.posPct}% (
                  {formatCurrency(financials.posRevenue)})
                </span>
              </div>
              <div className="split-progress-bar">
                <div
                  className="progress-segment online"
                  style={{ width: `${channelMetrics.onlinePct}%` }}
                  title={`Online: ${channelMetrics.onlinePct}%`}
                />
                <div
                  className="progress-segment pos"
                  style={{ width: `${channelMetrics.posPct}%` }}
                  title={`POS: ${channelMetrics.posPct}%`}
                />
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="payment-methods-list">
              <h4>Payment Methods</h4>
              {paymentMethods.length === 0 ? (
                <p className="dash-hint-text">No payment breakdown data available.</p>
              ) : (
                paymentMethods.map((pm, idx) => {
                  const gross = financials.grossRevenue || 1;
                  const pct = Math.min(100, Math.round((pm.amount / gross) * 100));
                  return (
                    <div key={idx} className="pm-row">
                      <div className="pm-icon-title">
                        {pm.name.toLowerCase().includes("upi") ? (
                          <Wallet size={16} className="pm-icon upi" />
                        ) : pm.name.toLowerCase().includes("cash") ? (
                          <CreditCard size={16} className="pm-icon cash" />
                        ) : (
                          <ShoppingBag size={16} className="pm-icon card" />
                        )}
                        <div>
                          <div className="pm-name">{pm.name}</div>
                          <div className="pm-count">{pm.count} transactions</div>
                        </div>
                      </div>
                      <div className="pm-amount-wrap">
                        <span className="pm-amount">{formatCurrency(pm.amount)}</span>
                        <span className="pm-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* ROW 2: FULFILLMENT PIPELINE & CATEGORIES */}
      {/* ==================================================== */}
      <section className="dash-analytics-row">
        {/* Order Fulfillment Pipeline */}
        <div className="dash-panel pipeline-panel">
          <div className="panel-header">
            <div>
              <h3>Order Fulfillment Funnel</h3>
              <p>Live progress tracking of all online customer orders</p>
            </div>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => navigate("/orders")}
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="pipeline-steps-grid">
            <div className="pipe-step pending">
              <div className="pipe-step-num">01</div>
              <div className="pipe-step-count">{ordersPipeline.pending || 0}</div>
              <div className="pipe-step-label">Pending Approval</div>
            </div>

            <div className="pipe-step processing">
              <div className="pipe-step-num">02</div>
              <div className="pipe-step-count">{ordersPipeline.processing || 0}</div>
              <div className="pipe-step-label">Processing / Packaged</div>
            </div>

            <div className="pipe-step dispatch">
              <div className="pipe-step-num">03</div>
              <div className="pipe-step-count">{ordersPipeline.outForDelivery || 0}</div>
              <div className="pipe-step-label">Out for Delivery</div>
            </div>

            <div className="pipe-step delivered">
              <div className="pipe-step-num">04</div>
              <div className="pipe-step-count">{ordersPipeline.delivered || 0}</div>
              <div className="pipe-step-label">Delivered Successfully</div>
            </div>

            <div className="pipe-step cancelled">
              <div className="pipe-step-num">05</div>
              <div className="pipe-step-count">{ordersPipeline.cancelled || 0}</div>
              <div className="pipe-step-label">Cancelled / Returned</div>
            </div>
          </div>
        </div>

        {/* Top Category Distribution */}
        <div className="dash-panel categories-panel">
          <div className="panel-header">
            <div>
              <h3>Top Categories</h3>
              <p>Product distribution across departments</p>
            </div>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => navigate("/categories")}
            >
              <span>All ({inventory.categoriesCount || 0})</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="categories-list">
            {categoryDistribution.length === 0 ? (
              <p className="dash-hint-text">No category statistics available.</p>
            ) : (
              categoryDistribution.map((cat, i) => {
                const total = inventory.totalProducts || 1;
                const pct = Math.min(100, Math.round((cat.productCount / total) * 100));
                return (
                  <div key={cat.id || i} className="cat-item-row">
                    <div className="cat-info">
                      <span className="cat-name">{cat.name}</span>
                      <span className="cat-stock">
                        {cat.productCount} Items • {cat.totalStock || 0} Units
                      </span>
                    </div>
                    <div className="cat-progress-wrap">
                      <div className="cat-bar">
                        <div
                          className="cat-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="cat-pct">{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* ROW 3: INVENTORY HEALTH & ATTENTION RADAR */}
      {/* ==================================================== */}
      <section className="dash-radar-section">
        <div className="dash-panel radar-panel">
          <div className="panel-header">
            <div className="radar-header-title">
              <div className="radar-icon-wrap">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3>Inventory Attention Radar</h3>
                <p>Critical stock levels requiring immediate restock or procurement.</p>
              </div>
            </div>
            <div className="radar-stats-chips">
              <span className="chip out">
                Out of Stock: <strong>{inventory.outOfStockCount || 0}</strong>
              </span>
              <span className="chip low">
                Low Stock Warning: <strong>{inventory.lowStockCount || 0}</strong>
              </span>
            </div>
          </div>

          <div className="radar-table-wrap">
            {inventory.lowStockItems && inventory.lowStockItems.length > 0 ? (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU Code</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Alert Limit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.lowStockItems.map((item) => (
                    <tr key={item._id}>
                      <td className="product-cell">
                        <div className="prod-thumb">
                          {item.images?.[0] ? (
                            <img
                              src={
                                item.images[0].startsWith("http")
                                  ? item.images[0]
                                  : `${BASE_URL}${item.images[0].startsWith("/") ? "" : "/"}${item.images[0]}`
                              }
                              alt={item.productName}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Boxes size={16} />
                          )}
                        </div>
                        <span className="prod-name">{item.productName}</span>
                      </td>
                      <td className="sku-cell">{item.sku || "—"}</td>
                      <td className="price-cell">{formatCurrency(item.price)}</td>
                      <td className="stock-cell">
                        <span className="stock-badge low">
                          {item.stockQuantity} Left
                        </span>
                      </td>
                      <td className="alert-cell">{item.lowStockAlert || 5} units</td>
                      <td className="action-cell">
                        <button
                          type="button"
                          className="dash-table-btn restock"
                          onClick={() => navigate(`/products/add-product/${item._id}`)}
                        >
                          Restock / Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="dash-all-healthy">
                <CheckCircle2 size={24} className="healthy-icon" />
                <div>
                  <strong>All Inventory Healthy!</strong>
                  <p>All catalog products are stocked safely above minimum threshold limits.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* ROW 4: RECENT TRANSACTIONS STREAM (DUAL TABS) */}
      {/* ==================================================== */}
      <section className="dash-activity-section">
        <div className="dash-panel activity-panel">
          <div className="panel-header activity-header">
            <div>
              <h3>Recent Live Transactions</h3>
              <p>Real-time audit log of latest customer orders and in-store counter slips</p>
            </div>

            {/* Tab switch */}
            <div className="activity-tabs">
              <button
                type="button"
                className={`act-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <ShoppingBag size={14} />
                <span>Online Orders ({recentOrders.length})</span>
              </button>
              <button
                type="button"
                className={`act-tab-btn ${activeTab === "bills" ? "active" : ""}`}
                onClick={() => setActiveTab("bills")}
              >
                <ReceiptText size={14} />
                <span>POS Bills ({recentBills.length})</span>
              </button>
            </div>
          </div>

          <div className="activity-content">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="dash-table-wrap">
                {recentOrders.length === 0 ? (
                  <p className="dash-empty-text">No recent online orders found.</p>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Date & Time</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Order Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="bold-cell">#{ord.orderNumber}</td>
                          <td>
                            <div className="cust-info">
                              <span>{ord.customer}</span>
                              {ord.phone && <small>{ord.phone}</small>}
                            </div>
                          </td>
                          <td className="date-cell">{formatDate(ord.date)}</td>
                          <td>{ord.itemsCount} items</td>
                          <td className="price-cell">{formatCurrency(ord.amount)}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                ord.paymentStatus === "paid" ? "paid" : "pending"
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill status-${ord.status}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dash-table-btn view"
                              onClick={() => navigate("/orders")}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Bills Tab */}
            {activeTab === "bills" && (
              <div className="dash-table-wrap">
                {recentBills.length === 0 ? (
                  <p className="dash-empty-text">No recent POS billing records found.</p>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Cashier</th>
                        <th>Date & Time</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Payment Method</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBills.map((bill) => (
                        <tr key={bill.id}>
                          <td className="bold-cell">#{bill.invoiceNumber}</td>
                          <td>
                            <div className="cust-info">
                              <span>{bill.customer}</span>
                              {bill.phone && <small>{bill.phone}</small>}
                            </div>
                          </td>
                          <td className="cashier-cell">{bill.cashier}</td>
                          <td className="date-cell">{formatDate(bill.date)}</td>
                          <td>{bill.itemsCount} items</td>
                          <td className="price-cell">{formatCurrency(bill.amount)}</td>
                          <td>
                            <span className={`status-pill method-${bill.paymentMethod.toLowerCase()}`}>
                              {bill.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dash-table-btn view"
                              onClick={() => navigate("/billing-history")}
                            >
                              View Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

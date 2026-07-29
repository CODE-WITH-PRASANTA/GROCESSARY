import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Clock,
  ArrowUp,
  ChevronDown,
  Plus,
  FileText,
  Tag,
  Image as ImageIcon,
  Settings,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import "./Product.css";

/* ------------------------------------------------------------------ */
/* Mock Data matching the reference UI                                */
/* ------------------------------------------------------------------ */

const TOP_SELLING = [
  { id: 1, name: "All Type Bell Pepper", sold: "1200+ Sold", price: "₹175.00", emoji: "🫑" },
  { id: 2, name: "Organic Bananas", sold: "950+ Sold", price: "₹60.00", emoji: "🍌" },
  { id: 3, name: "Amul Fresh Milk 1L", sold: "850+ Sold", price: "₹60.00", emoji: "🥛" },
  { id: 4, name: "Farm Fresh Eggs (12)", sold: "670+ Sold", price: "₹80.00", emoji: "🥚" },
  { id: 5, name: "Tata Salt 1kg", sold: "560+ Sold", price: "₹40.00", emoji: "🧂" },
];

const REVENUE_BREAKUP = [
  { name: "Groceries", value: 125680, pct: "50.6%", color: "#16a34a" },
  { name: "Fruits & Vegetables", value: 65200, pct: "26.2%", color: "#2563eb" },
  { name: "Dairy & Bakery", value: 32450, pct: "13.0%", color: "#f59e0b" },
  { name: "Beverages", value: 15230, pct: "6.2%", color: "#8b5cf6" },
  { name: "Others", value: 10000, pct: "4.0%", color: "#64748b" },
];

const INVENTORY_SUMMARY = [
  { label: "Total Products", value: "1,248" },
  { label: "Active Products", value: "1,186" },
  { label: "Low Stock Items", value: "86", highlight: "warning" },
  { label: "Out of Stock Items", value: "28", highlight: "danger" },
  { label: "Total Categories", value: "28" },
];

const LOW_STOCK_ITEMS = [
  { id: 1, name: "Amul Fresh Milk 1L", stock: "12 units", emoji: "🥛" },
  { id: 2, name: "Organic Spinach", stock: "8 units", emoji: "🥬" },
  { id: 3, name: "Fortune Sunflower Oil 1L", stock: "15 units", emoji: "🌻" },
  { id: 4, name: "Tata Salt 1kg", stock: "10 units", emoji: "🧂" },
];

const SALES_PERFORMANCE_BARS = [
  { day: "01", val: 24000 }, { day: "02", val: 18000 }, { day: "03", val: 32000 },
  { day: "04", val: 21000 }, { day: "05", val: 28000 }, { day: "06", val: 15000 },
  { day: "07", val: 35000 }, { day: "08", val: 22000 }, { day: "09", val: 29000 },
  { day: "10", val: 38000 }, { day: "11", val: 24000 }, { day: "12", val: 31000 },
  { day: "13", val: 26000 }, { day: "14", val: 34000 }, { day: "15", val: 29000 },
  { day: "16", val: 37000 }, { day: "17", val: 30000 }, { day: "18", val: 39000 },
  { day: "19", val: 33000 }, { day: "20", val: 36000 },
];

const RECENT_ACTIVITIES = [
  { title: "New Order Received", sub: "ORD-2026-08765", time: "2 mins ago", icon: ShoppingBag, color: "green" },
  { title: "Return Request", sub: "RET-2026-00124", time: "15 mins ago", icon: TrendingUp, color: "orange" },
  { title: "Low Stock Alert", sub: "Amul Fresh Milk 1L", time: "30 mins ago", icon: AlertTriangle, color: "red" },
  { title: "New Customer Registered", sub: "Rahul Sharma", time: "1 hour ago", icon: Users, color: "blue" },
];

const PERIOD_OPTIONS = ["This Month", "Last Month", "This Year"];

/* ------------------------------------------------------------------ */
/* Outside click helper for custom dropdowns                         */
/* ------------------------------------------------------------------ */
function useOutsideClick(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                    */
/* ------------------------------------------------------------------ */

const Product = () => {
  const [revenuePeriodOpen, setRevenuePeriodOpen] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState("This Month");
  const revenueRef = useOutsideClick(() => setRevenuePeriodOpen(false));

  const [hoveredSlice, setHoveredSlice] = useState(null);

  return (
    <div className="product-dashboard">
      {/* Top Row: Top Selling, Revenue Breakup, Inventory Summary, Low Stock Alert */}
      <div className="product-dashboard__top-grid">
        {/* Top Selling Products */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Top Selling Products</h3>
            <button className="product-card__link">View All</button>
          </div>
          <div className="product-list">
            {TOP_SELLING.map((item, idx) => (
              <div className="product-list__item" key={item.id}>
                <span className="product-list__rank">{idx + 1}</span>
                <span className="product-list__emoji">{item.emoji}</span>
                <div className="product-list__info">
                  <p className="product-list__name">{item.name}</p>
                  <span className="product-list__sold">{item.sold}</span>
                </div>
                <span className="product-list__price">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakup */}
        <div className="product-card product-card--revenue">
          <div className="product-card__header">
            <h3 className="product-card__title">Revenue Breakup</h3>
            <div className="product-dropdown" ref={revenueRef}>
              <button
                className="product-dropdown__trigger"
                onClick={() => setRevenuePeriodOpen((o) => !o)}
              >
                {revenuePeriod} <ChevronDown size={14} />
              </button>
              {revenuePeriodOpen && (
                <div className="product-dropdown__menu">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      className={`product-dropdown__option ${opt === revenuePeriod ? "active" : ""}`}
                      onClick={() => {
                        setRevenuePeriod(opt);
                        setRevenuePeriodOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="revenue-content">
            <div className="revenue-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={REVENUE_BREAKUP}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    stroke="none"
                    paddingAngle={3}
                  >
                    {REVENUE_BREAKUP.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        opacity={hoveredSlice && hoveredSlice !== entry.name ? 0.3 : 1}
                        onMouseEnter={() => setHoveredSlice(entry.name)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="revenue-center-text">
                <span className="revenue-center-value">₹2,48,560</span>
                <span className="revenue-center-label">Total Revenue</span>
              </div>
            </div>
            <div className="revenue-legend">
              {REVENUE_BREAKUP.map((item) => (
                <div
                  key={item.name}
                  className="revenue-legend-item"
                  onMouseEnter={() => setHoveredSlice(item.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="revenue-legend-left">
                    <span className="revenue-dot" style={{ backgroundColor: item.color }} />
                    <span className="revenue-legend-name">{item.name}</span>
                  </div>
                  <div className="revenue-legend-right">
                    <span className="revenue-legend-val">₹{item.value.toLocaleString("en-IN")}</span>
                    <span className="revenue-legend-pct">({item.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Inventory Summary</h3>
            <button className="product-card__link">View All</button>
          </div>
          <div className="inventory-summary-list">
            {INVENTORY_SUMMARY.map((row, idx) => (
              <div className="inventory-summary-row" key={idx}>
                <span className={`inventory-label ${row.highlight ? `inventory-label--${row.highlight}` : ""}`}>
                  {row.label}
                </span>
                <span className={`inventory-value ${row.highlight ? `inventory-value--${row.highlight}` : ""}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Low Stock Alert</h3>
            <button className="product-card__link">View All</button>
          </div>
          <div className="low-stock-list">
            {LOW_STOCK_ITEMS.map((item) => (
              <div className="low-stock-item" key={item.id}>
                <span className="low-stock-emoji">{item.emoji}</span>
                <div className="low-stock-info">
                  <p className="low-stock-name">{item.name}</p>
                  <span className="low-stock-qty">Stock: {item.stock}</span>
                </div>
                <button className="btn-reorder">Reorder Now</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Performance, Customer Overview, Recent Activities, Promo Banner */}
      <div className="product-dashboard__middle-grid">
        {/* Sales Performance */}
        <div className="product-card product-card--sales-perf">
          <div className="product-card__header">
            <h3 className="product-card__title">Sales Performance</h3>
          </div>
          <div className="sales-metrics-row">
            <div className="sales-metric-box">
              <span className="metric-box-title">Today's Sales</span>
              <span className="metric-box-val">₹18,560</span>
              <span className="metric-box-trend positive"><ArrowUp size={12} /> 12.6%</span>
            </div>
            <div className="sales-metric-box">
              <span className="metric-box-title">Yesterday's Sales</span>
              <span className="metric-box-val">₹16,240</span>
              <span className="metric-box-trend positive"><ArrowUp size={12} /> 8.3%</span>
            </div>
            <div className="sales-metric-box">
              <span className="metric-box-title">This Week</span>
              <span className="metric-box-val">₹1,25,680</span>
              <span className="metric-box-trend positive"><ArrowUp size={12} /> 15.9%</span>
            </div>
            <div className="sales-metric-box">
              <span className="metric-box-title">This Month</span>
              <span className="metric-box-val">₹2,48,560</span>
              <span className="metric-box-trend positive"><ArrowUp size={12} /> 18.6%</span>
            </div>
          </div>
          <div className="sales-bar-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_PERFORMANCE_BARS} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip cursor={{ fill: "rgba(22, 163, 74, 0.05)" }} />
                <Bar dataKey="val" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Overview */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Customer Overview</h3>
            <button className="product-card__link">View All</button>
          </div>
          <div className="customer-overview-list">
            <div className="customer-overview-item">
              <div className="customer-overview-icon green"><Users size={18} /></div>
              <div className="customer-overview-details">
                <span className="cust-title">New Customers</span>
                <span className="cust-count">128 <span className="cust-trend pos"><ArrowUp size={10} />15.2%</span></span>
              </div>
              <div className="cust-mini-chart">
                <ResponsiveContainer width="1000%" height="100%">
                  <LineChart data={[{v:10},{v:15},{v:12},{v:18},{v:22}]}>
                    <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="customer-overview-item">
              <div className="customer-overview-icon blue"><Users size={18} /></div>
              <div className="customer-overview-details">
                <span className="cust-title">Returning Customers</span>
                <span className="cust-count">728 <span className="cust-trend pos"><ArrowUp size={10} />8.6%</span></span>
              </div>
              <div className="cust-mini-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{v:20},{v:18},{v:25},{v:23},{v:28}]}>
                    <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="customer-overview-item">
              <div className="customer-overview-icon purple"><Users size={18} /></div>
              <div className="customer-overview-details">
                <span className="cust-title">Total Customers</span>
                <span className="cust-count">856 <span className="cust-trend pos"><ArrowUp size={10} />10.3%</span></span>
              </div>
              <div className="cust-mini-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{v:30},{v:35},{v:32},{v:40},{v:45}]}>
                    <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Recent Activities</h3>
            <button className="product-card__link">View All</button>
          </div>
          <div className="activities-list">
            {RECENT_ACTIVITIES.map((act, idx) => {
              const IconComp = act.icon;
              return (
                <div className="activity-item" key={idx}>
                  <div className={`activity-icon-wrap ${act.color}`}>
                    <IconComp size={16} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{act.title}</p>
                    <span className="activity-sub">{act.sub}</span>
                  </div>
                  <span className="activity-time">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promo Delivery Banner */}
        <div className="product-card product-card--promo">
          <div className="promo-content">
            <h3 className="promo-title">Fast Delivery Happy Customers!</h3>
            <p className="promo-desc">Manage orders and deliver happiness to your customers.</p>
            <button className="btn-promo-action">
              View Orders <ArrowRight size={16} />
            </button>
          </div>
          <div className="promo-illustration">
            <div className="delivery-scooter-art">🛵</div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Actions Bar */}
      <div className="product-card product-card--quick-actions">
        <h3 className="product-card__title quick-actions-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn"><Plus size={16} className="text-green" /> Add Product</button>
          <button className="quick-action-btn"><ShoppingBag size={16} className="text-purple" /> View Orders</button>
          <button className="quick-action-btn"><TrendingUp size={16} className="text-orange" /> Manage Returns</button>
          <button className="quick-action-btn"><Users size={16} className="text-blue" /> Customers</button>
          <button className="quick-action-btn"><Package size={16} className="text-green" /> Add Category</button>
          <button className="quick-action-btn"><FileText size={16} className="text-red" /> Stock Report</button>
          <button className="quick-action-btn"><FileText size={16} className="text-cyan" /> Sales Report</button>
          <button className="quick-action-btn"><Tag size={16} className="text-purple" /> Coupons</button>
          <button className="quick-action-btn"><ImageIcon size={16} className="text-orange" /> Banners</button>
          <button className="quick-action-btn"><Settings size={16} className="text-slate" /> Site Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Product;
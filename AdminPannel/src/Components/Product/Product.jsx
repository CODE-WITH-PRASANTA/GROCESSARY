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
  X,
  CheckCircle,
  Download,
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
} from "recharts";
import "./Product.css";

/* ------------------------------------------------------------------ */
/* Mock Data                                                          */
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

const ORDERS_DATA = [
  { id: "ORD-2026-08765", customer: "Rahul Sharma", items: 4, total: "₹1,240", status: "Processing", statusColor: "yellow" },
  { id: "ORD-2026-08764", customer: "Priya Nair", items: 2, total: "₹560", status: "Shipped", statusColor: "blue" },
  { id: "ORD-2026-08763", customer: "Amit Verma", items: 7, total: "₹2,180", status: "Delivered", statusColor: "green" },
  { id: "ORD-2026-08762", customer: "Sneha Patil", items: 1, total: "₹175", status: "Delivered", statusColor: "green" },
  { id: "ORD-2026-08761", customer: "Karan Mehta", items: 3, total: "₹920", status: "Processing", statusColor: "yellow" },
];

const RETURNS_DATA = [
  { id: "RET-2026-00124", customer: "Sneha Patil", product: "Amul Fresh Milk 1L", reason: "Damaged", status: "Pending", statusColor: "yellow" },
  { id: "RET-2026-00123", customer: "Karan Mehta", product: "Organic Bananas", reason: "Wrong Item", status: "Approved", statusColor: "green" },
  { id: "RET-2026-00122", customer: "Rahul Sharma", product: "Tata Salt 1kg", reason: "Not Needed", status: "Rejected", statusColor: "blue" },
];

const CUSTOMERS_DATA = [
  { id: 1, name: "Rahul Sharma", email: "rahul.sharma@example.com", orders: 18, spent: "₹24,560" },
  { id: 2, name: "Priya Nair", email: "priya.nair@example.com", orders: 12, spent: "₹15,230" },
  { id: 3, name: "Amit Verma", email: "amit.verma@example.com", orders: 27, spent: "₹38,900" },
  { id: 4, name: "Sneha Patil", email: "sneha.patil@example.com", orders: 5, spent: "₹6,410" },
];

const CATEGORIES_DATA = [
  { id: 1, name: "Groceries", products: 412 },
  { id: 2, name: "Fruits & Vegetables", products: 268 },
  { id: 3, name: "Dairy & Bakery", products: 154 },
  { id: 4, name: "Beverages", products: 96 },
];

const COUPONS_DATA = [
  { id: 1, code: "WELCOME10", discount: "10%", expiry: "31 Aug 2026", status: "Active", statusColor: "green" },
  { id: 2, code: "FESTIVE50", discount: "₹50", expiry: "15 Aug 2026", status: "Active", statusColor: "green" },
  { id: 3, code: "SUMMER20", discount: "20%", expiry: "01 Jun 2026", status: "Expired", statusColor: "blue" },
];

const BANNERS_DATA = [
  { id: 1, title: "Monsoon Grocery Sale", placement: "Homepage Top", status: "Live", statusColor: "green" },
  { id: 2, title: "Fresh Fruits Combo", placement: "Category Page", status: "Live", statusColor: "green" },
  { id: 3, title: "Diwali Early Bird", placement: "Homepage Top", status: "Scheduled", statusColor: "yellow" },
];

const PERIOD_OPTIONS = ["This Month", "Last Month", "This Year"];

/* ------------------------------------------------------------------ */
/* Outside click helper                                               */
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
/* Inline SVG Sparkline Component for Seamless Curves                */
/* ------------------------------------------------------------------ */
const Sparkline = ({ strokeColor, fillColor, id }) => (
  <svg className="sparkline-svg" viewBox="0 0 80 32" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path
      d="M 0,22 Q 15,28 30,14 T 60,18 T 80,6 L 80,32 L 0,32 Z"
      fill={`url(#gradient-${id})`}
    />
    <path
      d="M 0,22 Q 15,28 30,14 T 60,18 T 80,6"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Modal Wrapper                                                      */
/* ------------------------------------------------------------------ */
const Modal = ({ title, onClose, children }) => {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */

const Product = () => {
  const [revenuePeriodOpen, setRevenuePeriodOpen] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState("This Month");
  const revenueRef = useOutsideClick(() => setRevenuePeriodOpen(false));

  const [hoveredSlice, setHoveredSlice] = useState(null);

  // which modal is open: null | "addProduct" | "viewOrders" | "manageReturns" |
  // "customers" | "addCategory" | "stockReport" | "salesReport" | "coupons" |
  // "banners" | "siteSettings" | "topSelling" | "lowStock" | "inventory"
  const [activeModal, setActiveModal] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => () => toastTimer.current && clearTimeout(toastTimer.current), []);

  const closeModal = () => setActiveModal(null);

  const handleReorder = (item) => {
    showToast(`Reorder placed for "${item.name}"`);
  };

  const handleFormSubmit = (e, successMessage) => {
    e.preventDefault();
    closeModal();
    showToast(successMessage);
  };

  const handleExport = (label) => {
    showToast(`${label} export started — check your downloads`);
  };

  /* ------------------------------------------------------------------ */
  /* Modal content renderers                                            */
  /* ------------------------------------------------------------------ */

  const renderAddProductModal = () => (
    <Modal title="Add Product" onClose={closeModal}>
      <form className="modal-form" onSubmit={(e) => handleFormSubmit(e, "Product added successfully")}>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" placeholder="e.g. Organic Bananas" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select required defaultValue="">
              <option value="" disabled>Select category</option>
              {CATEGORIES_DATA.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input type="number" min="0" step="0.01" placeholder="0.00" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" min="0" placeholder="0" required />
          </div>
          <div className="form-group">
            <label>SKU</label>
            <input type="text" placeholder="e.g. GRC-0142" />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" placeholder="Short product description" />
        </div>
        <button type="submit" className="modal-submit-btn green">Add Product</button>
      </form>
    </Modal>
  );

  const renderAddCategoryModal = () => (
    <Modal title="Add Category" onClose={closeModal}>
      <form className="modal-form" onSubmit={(e) => handleFormSubmit(e, "Category added successfully")}>
        <div className="form-group">
          <label>Category Name</label>
          <input type="text" placeholder="e.g. Frozen Foods" required />
        </div>
        <div className="form-group">
          <label>Parent Category</label>
          <select defaultValue="">
            <option value="">None (Top-level category)</option>
            {CATEGORIES_DATA.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="modal-submit-btn green">Save Category</button>
      </form>
      <div className="modal-table-wrap" style={{ marginTop: 18 }}>
        <table className="modal-table">
          <thead>
            <tr><th>Category</th><th>Products</th></tr>
          </thead>
          <tbody>
            {CATEGORIES_DATA.map((c) => (
              <tr key={c.id}><td>{c.name}</td><td>{c.products}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderViewOrdersModal = () => (
    <Modal title="Orders" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ORDERS_DATA.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.items}</td>
                <td>{o.total}</td>
                <td><span className={`badge ${o.statusColor}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderManageReturnsModal = () => (
    <Modal title="Manage Returns" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>Return ID</th><th>Customer</th><th>Product</th><th>Reason</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {RETURNS_DATA.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.customer}</td>
                <td>{r.product}</td>
                <td>{r.reason}</td>
                <td><span className={`badge ${r.statusColor}`}>{r.status}</span></td>
                <td>
                  {r.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="action-btn-sm green"
                        onClick={() => showToast(`Return ${r.id} approved`)}
                      >
                        Approve
                      </button>
                      <button
                        className="action-btn-sm red"
                        onClick={() => showToast(`Return ${r.id} rejected`)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderCustomersModal = () => (
    <Modal title="Customers" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent</th></tr>
          </thead>
          <tbody>
            {CUSTOMERS_DATA.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.orders}</td>
                <td>{c.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderStockReportModal = () => (
    <Modal title="Stock Report" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>Product</th><th>In Stock</th></tr>
          </thead>
          <tbody>
            {LOW_STOCK_ITEMS.map((i) => (
              <tr key={i.id}><td>{i.name}</td><td>{i.stock}</td></tr>
            ))}
            {TOP_SELLING.map((i) => (
              <tr key={`ts-${i.id}`}><td>{i.name}</td><td>In Stock</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="modal-submit-btn slate"
        style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, width: "auto" }}
        onClick={() => handleExport("Stock report")}
      >
        <Download size={14} /> Export CSV
      </button>
    </Modal>
  );

  const renderSalesReportModal = () => (
    <Modal title="Sales Report" onClose={closeModal}>
      <div style={{ height: 200, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SALES_PERFORMANCE_BARS} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
            <Tooltip cursor={{ fill: "rgba(22, 163, 74, 0.05)" }} />
            <Bar dataKey="val" fill="#16a34a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <button
        type="button"
        className="modal-submit-btn slate"
        style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, width: "auto" }}
        onClick={() => handleExport("Sales report")}
      >
        <Download size={14} /> Export CSV
      </button>
    </Modal>
  );

  const renderCouponsModal = () => (
    <Modal title="Coupons" onClose={closeModal}>
      <form className="modal-form" onSubmit={(e) => handleFormSubmit(e, "Coupon created successfully")}>
        <div className="form-row">
          <div className="form-group">
            <label>Coupon Code</label>
            <input type="text" placeholder="e.g. SAVE15" required />
          </div>
          <div className="form-group">
            <label>Discount</label>
            <input type="text" placeholder="e.g. 15% or ₹50" required />
          </div>
        </div>
        <div className="form-group">
          <label>Expiry Date</label>
          <input type="date" required />
        </div>
        <button type="submit" className="modal-submit-btn purple">Create Coupon</button>
      </form>
      <div className="modal-table-wrap" style={{ marginTop: 18 }}>
        <table className="modal-table">
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Expiry</th><th>Status</th></tr>
          </thead>
          <tbody>
            {COUPONS_DATA.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.discount}</td>
                <td>{c.expiry}</td>
                <td><span className={`badge ${c.statusColor}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderBannersModal = () => (
    <Modal title="Banners" onClose={closeModal}>
      <form className="modal-form" onSubmit={(e) => handleFormSubmit(e, "Banner scheduled successfully")}>
        <div className="form-group">
          <label>Banner Title</label>
          <input type="text" placeholder="e.g. Weekend Flash Sale" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Placement</label>
            <select required defaultValue="">
              <option value="" disabled>Select placement</option>
              <option value="Homepage Top">Homepage Top</option>
              <option value="Category Page">Category Page</option>
              <option value="Checkout Page">Checkout Page</option>
            </select>
          </div>
          <div className="form-group">
            <label>Go Live Date</label>
            <input type="date" required />
          </div>
        </div>
        <button type="submit" className="modal-submit-btn orange">Save Banner</button>
      </form>
      <div className="modal-table-wrap" style={{ marginTop: 18 }}>
        <table className="modal-table">
          <thead>
            <tr><th>Title</th><th>Placement</th><th>Status</th></tr>
          </thead>
          <tbody>
            {BANNERS_DATA.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.placement}</td>
                <td><span className={`badge ${b.statusColor}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderSiteSettingsModal = () => (
    <Modal title="Site Settings" onClose={closeModal}>
      <form className="modal-form" onSubmit={(e) => handleFormSubmit(e, "Settings saved successfully")}>
        <div className="form-group">
          <label>Store Name</label>
          <input type="text" defaultValue="AICWA Grocery Store" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Support Email</label>
            <input type="email" defaultValue="support@aicwa.example.com" required />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select defaultValue="INR">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Low Stock Threshold</label>
          <input type="number" min="0" defaultValue="15" />
        </div>
        <button type="submit" className="modal-submit-btn slate">Save Settings</button>
      </form>
    </Modal>
  );

  const renderTopSellingModal = () => (
    <Modal title="Top Selling Products" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>#</th><th>Product</th><th>Sold</th><th>Price</th></tr>
          </thead>
          <tbody>
            {TOP_SELLING.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.emoji} {item.name}</td>
                <td>{item.sold}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderLowStockModal = () => (
    <Modal title="Low Stock Items" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>Product</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {LOW_STOCK_ITEMS.map((item) => (
              <tr key={item.id}>
                <td>{item.emoji} {item.name}</td>
                <td>{item.stock}</td>
                <td>
                  <button className="action-btn-sm red" onClick={() => handleReorder(item)}>
                    Reorder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const renderInventoryModal = () => (
    <Modal title="Inventory Summary" onClose={closeModal}>
      <div className="modal-table-wrap">
        <table className="modal-table">
          <thead>
            <tr><th>Metric</th><th>Value</th></tr>
          </thead>
          <tbody>
            {INVENTORY_SUMMARY.map((row, idx) => (
              <tr key={idx}><td>{row.label}</td><td>{row.value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );

  const MODAL_RENDERERS = {
    addProduct: renderAddProductModal,
    addCategory: renderAddCategoryModal,
    viewOrders: renderViewOrdersModal,
    manageReturns: renderManageReturnsModal,
    customers: renderCustomersModal,
    stockReport: renderStockReportModal,
    salesReport: renderSalesReportModal,
    coupons: renderCouponsModal,
    banners: renderBannersModal,
    siteSettings: renderSiteSettingsModal,
    topSelling: renderTopSellingModal,
    lowStock: renderLowStockModal,
    inventory: renderInventoryModal,
  };

  return (
    <div className="product-dashboard">
      {/* Top Row: Top Selling, Revenue Breakup, Inventory Summary, Low Stock Alert */}
      <div className="product-dashboard__top-grid">
        {/* Top Selling Products */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Top Selling Products</h3>
            <button className="product-card__link" onClick={() => setActiveModal("topSelling")}>View All</button>
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
                        showToast(`Revenue breakup updated for ${opt}`);
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
            <button className="product-card__link" onClick={() => setActiveModal("inventory")}>View All</button>
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
            <button className="product-card__link" onClick={() => setActiveModal("lowStock")}>View All</button>
          </div>
          <div className="low-stock-list">
            {LOW_STOCK_ITEMS.map((item) => (
              <div className="low-stock-item" key={item.id}>
                <span className="low-stock-emoji">{item.emoji}</span>
                <div className="low-stock-info">
                  <p className="low-stock-name">{item.name}</p>
                  <span className="low-stock-qty">Stock: {item.stock}</span>
                </div>
                <button className="btn-reorder" onClick={() => handleReorder(item)}>Reorder Now</button>
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
            <button className="product-card__link" onClick={() => setActiveModal("customers")}>View All</button>
          </div>
          <div className="customer-overview-list">
            <div className="customer-overview-item">
              <div className="customer-overview-icon green"><Users size={18} /></div>
              <div className="customer-overview-details">
                <span className="cust-title">New Customers</span>
                <span className="cust-count">128 <span className="cust-trend pos"><ArrowUp size={10} />15.2%</span></span>
              </div>
              <div className="cust-mini-chart">
                <Sparkline strokeColor="#16a34a" fillColor="#16a34a" id="green" />
              </div>
            </div>
            <div className="customer-overview-item">
              <div className="customer-overview-icon blue"><Users size={18} /></div>
              <div className="customer-overview-details">
                <span className="cust-title">Returning Customers</span>
                <span className="cust-count">728 <span className="cust-trend pos"><ArrowUp size={10} />8.6%</span></span>
              </div>
              <div className="cust-mini-chart">
                <Sparkline strokeColor="#2563eb" fillColor="#2563eb" id="blue" />
              </div>
            </div>
            <div className="customer-overview-item">
              <div className="customer-overview-icon purple"><Users size={18} /></div>
              <div className="customer-overview-details">
                <span className="cust-title">Total Customers</span>
                <span className="cust-count">856 <span className="cust-trend pos"><ArrowUp size={10} />10.3%</span></span>
              </div>
              <div className="cust-mini-chart">
                <Sparkline strokeColor="#8b5cf6" fillColor="#8b5cf6" id="purple" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="product-card">
          <div className="product-card__header">
            <h3 className="product-card__title">Recent Activities</h3>
            <button
              className="product-card__link"
              onClick={() => showToast("Showing all recent activity")}
            >
              View All
            </button>
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
            <button className="btn-promo-action" onClick={() => setActiveModal("viewOrders")}>
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
          <button className="quick-action-btn" onClick={() => setActiveModal("addProduct")}>
            <Plus size={16} className="text-green" /> Add Product
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("viewOrders")}>
            <ShoppingBag size={16} className="text-purple" /> View Orders
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("manageReturns")}>
            <TrendingUp size={16} className="text-orange" /> Manage Returns
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("customers")}>
            <Users size={16} className="text-blue" /> Customers
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("addCategory")}>
            <Package size={16} className="text-green" /> Add Category
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("stockReport")}>
            <FileText size={16} className="text-red" /> Stock Report
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("salesReport")}>
            <FileText size={16} className="text-cyan" /> Sales Report
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("coupons")}>
            <Tag size={16} className="text-purple" /> Coupons
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("banners")}>
            <ImageIcon size={16} className="text-orange" /> Banners
          </button>
          <button className="quick-action-btn" onClick={() => setActiveModal("siteSettings")}>
            <Settings size={16} className="text-slate" /> Site Settings
          </button>
        </div>
      </div>

      {/* Active Modal */}
      {activeModal && MODAL_RENDERERS[activeModal] && MODAL_RENDERERS[activeModal]()}

      {/* Toast Feedback */}
      {toast && (
        <div className="dashboard-toast">
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </div>
  );
};

export default Product;
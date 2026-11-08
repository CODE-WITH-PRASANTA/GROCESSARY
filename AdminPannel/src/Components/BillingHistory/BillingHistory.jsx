import React, { useMemo, useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  CalendarDays,
  Minus,
  WalletCards,
  X,
  Plus,
  RotateCcw,
  Eye,
  Printer,
  Trash2,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserRound,
  ShoppingBasket,
  CreditCard,
  Smartphone,
  Banknote,
  Clock3,
  Users,
  AlertCircle,
} from "lucide-react";

import Swal from "sweetalert2";
import API, { BASE_URL } from "../../api/axios";
import { downloadOrderInvoicePdf } from "../../Utils/directInvoiceDownloader";
import InvoiceModal from "../InvoiceModal/InvoiceModal";
import "./BillingHistory.css";

// =========================================================
// HELPERS
// =========================================================
const resolveImage = (path) => {
  if (!path) return "";
  const str = String(path).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
};

const formatDateTime = (iso) => {
  if (!iso) return { date: "-", time: "-" };
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-GB"),
      time: d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: "-", time: "-" };
  }
};

const formatISODate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const normalizeBills = (data) => {
  if (Array.isArray(data?.bills)) return data.bills;
  if (Array.isArray(data?.data?.bills)) return data.data.bills;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// =========================================================
// COMPONENT
// =========================================================
const BillingHistory = () => {
  const [activeTab, setActiveTab] = useState("All Bills");

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [previewInvoiceBill, setPreviewInvoiceBill] = useState(null);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingBillId, setDownloadingBillId] = useState(null);

  const billsPerPage = 8;

  // =========================================================
  // FETCH BILLS
  // =========================================================
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { limit: 200 };
      if (paymentMethod !== "All") params.paymentMethod = paymentMethod;
      if (dateFrom) params.startDate = `${dateFrom}T00:00:00.000Z`;
      if (dateTo) params.endDate = `${dateTo}T23:59:59.999Z`;

      const { data } = await API.get("/bills", { params });
      const list = normalizeBills(data);

      // Normalize into UI-friendly shape
      const formatted = list.map((b) => {
        const { date, time } = formatDateTime(b.createdAt);
        const count = Array.isArray(b.items) ? b.items.length : 0;

        return {
          ...b,
          rawBill: b,
          id: b._id,
          _id: b._id,
          invoice: b.invoiceNumber,
          invoiceNumber: b.invoiceNumber,
          date,
          time,
          createdAt: b.createdAt,
          itemsCount: count,
          items: (b.items || []).map((it) => ({
            ...it,
            productName: it.productName || it.name || "Product",
            name: it.productName || it.name || "Product",
            unit: it.unit || "",
            price: Number(it.price || 0),
            quantity: Number(it.quantity || it.qty || 1),
            qty: Number(it.quantity || it.qty || 1),
            total: Number(it.itemTotal || it.total || Number(it.price || 0) * Number(it.quantity || it.qty || 1)),
            itemTotal: Number(it.itemTotal || it.total || Number(it.price || 0) * Number(it.quantity || it.qty || 1)),
            image: resolveImage(it.image),
          })),
          total: Number(b.totalAmount || 0),
          totalAmount: Number(b.totalAmount || 0),
          subtotal: Number(b.subtotal || 0),
          discount: Number(b.discountAmount || 0),
          discountAmount: Number(b.discountAmount || 0),
          totalSavings: Number(b.totalSavings || 0),
          payment: b.paymentMethod || "Cash",
          paymentMethod: b.paymentMethod || "Cash",
          customer: b.customer?.name || (typeof b.customer === "string" ? b.customer : "Walk-in"),
          contact: b.customer?.mobile || "-",
          address: "-",
          cashier: b.cashier?.name || b.cashier?.email || "",
          upiTransactionId: b.upiTransactionId || "",
          amountReceived: Number(b.amountReceived || b.totalAmount || 0),
          changeReturned: Number(b.changeReturned || 0),
          products: (b.items || []).map((it) => ({
            name: it.productName || it.name || "Product",
            productName: it.productName || it.name || "Product",
            variant: it.unit ? `(${it.unit})` : "",
            unit: it.unit || "",
            price: Number(it.price || 0),
            qty: Number(it.quantity || it.qty || 1),
            quantity: Number(it.quantity || it.qty || 1),
            total: Number(it.itemTotal || it.total || Number(it.price || 0) * Number(it.quantity || it.qty || 1)),
            image: resolveImage(it.image),
          })),
        };
      });

      setBills(formatted);
    } catch (err) {
      console.error("Fetch bills error:", err);
      setError(err.response?.data?.message || "Failed to load bills.");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, dateFrom, dateTo]);

  // =========================================================
  // FILTER (client-side search + tabs)
  // =========================================================
  const filteredBills = useMemo(() => {
    let result = [...bills];
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-GB");

    if (search.trim()) {
      const value = search.toLowerCase().trim();
      result = result.filter((b) => {
        const matchInvoice = String(b.invoice || "")
          .toLowerCase()
          .includes(value);
        const matchCustomer = String(b.customer || "")
          .toLowerCase()
          .includes(value);
        const matchProduct = b.products?.some((p) =>
          String(p.name || "")
            .toLowerCase()
            .includes(value),
        );
        return matchInvoice || matchCustomer || matchProduct;
      });
    }

    if (activeTab === "Today") {
      result = result.filter((b) => b.date === todayStr);
    } else if (activeTab === "Yesterday") {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      result = result.filter((b) => b.date === y.toLocaleDateString("en-GB"));
    } else if (activeTab === "This Week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      result = result.filter((b) => new Date(b.createdAt) >= weekAgo);
    } else if (activeTab === "This Month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      result = result.filter((b) => new Date(b.createdAt) >= monthStart);
    }

    return result;
  }, [bills, search, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBills.length / billsPerPage),
  );

  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * billsPerPage,
    currentPage * billsPerPage,
  );

  // =========================================================
  // STATS
  // =========================================================
  const stats = useMemo(() => {
    const totalBills = filteredBills.length;
    const totalSales = filteredBills.reduce(
      (sum, b) => sum + Number(b.total || 0),
      0,
    );
    const avgValue = totalBills > 0 ? totalSales / totalBills : 0;
    const totalItems = filteredBills.reduce(
      (sum, b) =>
        sum +
        Number(
          b.itemsCount ??
            (Array.isArray(b.items) ? b.items.length : b.items || 0),
        ),
      0,
    );
    return { totalBills, totalSales, avgValue, totalItems };
  }, [filteredBills]);

  // =========================================================
  // ACTIONS
  // =========================================================
  const handleViewBill = (bill) => {
    setPreviewInvoiceBill(bill);
  };

  const handleDelete = async (id) => {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Invalid bill",
        text: "No id to delete.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete this bill?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
    });

    if (!confirm.isConfirmed) return;

    try {
      const { data } = await API.delete(`/bills/${id}`);

      if (!data?.success) {
        throw new Error(data?.message || "Delete failed.");
      }

      // Remove from local state
      setBills((prev) => prev.filter((b) => b.id !== id));
      fetchBills();
      Swal.fire({
        icon: "success",
        title: "Bill deleted",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Delete bill error:", err);
      Swal.fire({
        icon: "error",
        title: "Could not delete bill",
        text: err.response?.data?.message || err.message || "Please try again.",
        confirmButtonColor: "#0aad4b",
      });
    }
  };

  const handleReset = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPaymentMethod("All");
    setActiveTab("All Bills");
    setCurrentPage(1);
    fetchBills();
  };

  const handleDirectDownloadInvoice = async (bill) => {
    if (!bill) return;
    setDownloadingBillId(bill.id || bill._id || "active");
    try {
      await downloadOrderInvoicePdf(bill);
    } finally {
      setDownloadingBillId(null);
    }
  };

  const getPaymentIcon = (payment) => {
    if (payment === "UPI") return <Smartphone size={17} />;
    if (payment === "Card") return <CreditCard size={17} />;
    return <Banknote size={17} />;
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="BillingHistory">
      <div className="BillingHistory-body">
        <main className="BillingHistory-main">
          {/* PAGE HEADING */}
          <div className="BillingHistory-pageHeader">
            <div className="BillingHistory-titleArea">
              <div className="BillingHistory-titleIcon">
                <Clock3 size={38} />
              </div>

              <div>
                <h2>Billing History</h2>
                <p>View, search and manage all your past bills</p>
              </div>
            </div>

            <button
              className="BillingHistory-newBillButton"
              onClick={() => (window.location.href = "/admin/billing")}
            >
              <Plus size={21} />
              New Bill
            </button>
          </div>

          {/* FILTER CARD */}
          <section className="BillingHistory-filterCard">
            <div className="BillingHistory-filterGrid">
              <div className="BillingHistory-filterGroup">
                <label>Date From</label>
                <div className="BillingHistory-inputBox">
                  <CalendarDays size={17} />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="BillingHistory-filterGroup">
                <label>Date To</label>
                <div className="BillingHistory-inputBox">
                  <CalendarDays size={17} />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="BillingHistory-filterGroup">
                <label>Payment Method</label>
                <div className="BillingHistory-inputBox">
                  <WalletCards size={17} />
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option>All</option>
                    <option>Cash</option>
                    <option>UPI</option>
                  </select>
                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="BillingHistory-filterGroup">
                <label>Search</label>
                <div className="BillingHistory-inputBox">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="Invoice no, customer, product..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="BillingHistory-filterBottom">
              <div className="BillingHistory-tabs">
                {[
                  "All Bills",
                  "Today",
                  "Yesterday",
                  "This Week",
                  "This Month",
                ].map((tab) => (
                  <button
                    key={tab}
                    className={
                      activeTab === tab
                        ? "BillingHistory-tab BillingHistory-activeTab"
                        : "BillingHistory-tab"
                    }
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="BillingHistory-filterActions">
                <button
                  className="BillingHistory-resetButton"
                  onClick={handleReset}
                >
                  <RotateCcw size={17} />
                  Reset
                </button>

                <button
                  className="BillingHistory-searchButton"
                  onClick={() => fetchBills()}
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="BillingHistory-statGrid">
            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon green">
                <FileText size={24} />
              </div>
              <div>
                <span>Total Bills</span>
                <strong>{stats.totalBills}</strong>
                <small>From current filter</small>
              </div>
            </div>

            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon blue">
                <WalletCards size={24} />
              </div>
              <div>
                <span>Total Sales</span>
                <strong>₹{stats.totalSales.toLocaleString("en-IN")}</strong>
                <small>From current filter</small>
              </div>
            </div>

            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon orange">
                <ShoppingBasket size={24} />
              </div>
              <div>
                <span>Avg. Bill Value</span>
                <strong>₹{stats.avgValue.toFixed(0)}</strong>
                <small>Per bill</small>
              </div>
            </div>

            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon purple">
                <Users size={24} />
              </div>
              <div>
                <span>Total Items Sold</span>
                <strong>{stats.totalItems}</strong>
                <small>From current filter</small>
              </div>
            </div>
          </section>

          {/* TABLE */}
          <section className="BillingHistory-tableCard">
            {loading ? (
              <div
                className="BillingHistory-emptyState"
                style={{ padding: 60 }}
              >
                <Clock3 size={42} />
                <strong>Loading bills…</strong>
              </div>
            ) : error ? (
              <div
                className="BillingHistory-emptyState"
                style={{ padding: 60 }}
              >
                <AlertCircle size={42} />
                <strong>{error}</strong>
                <button
                  className="BillingHistory-searchButton"
                  onClick={fetchBills}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="BillingHistory-tableWrapper">
                <table className="BillingHistory-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Invoice No</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Customer</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedBills.length > 0 ? (
                      paginatedBills.map((bill, index) => (
                        <tr key={bill.id}>
                          <td>
                            {(currentPage - 1) * billsPerPage + index + 1}
                          </td>

                          <td>
                            <div className="BillingHistory-dateCell">
                              <strong>{bill.date}</strong>
                              <span>{bill.time}</span>
                            </div>
                          </td>

                          <td>
                            <span className="BillingHistory-invoiceNumber">
                              {bill.invoice}
                            </span>
                          </td>

                          <td>
                            {bill.itemsCount ??
                              (Array.isArray(bill.items)
                                ? bill.items.length
                                : 0)}
                          </td>

                          <td>
                            <strong className="BillingHistory-totalCell">
                              ₹ {bill.total.toLocaleString("en-IN")}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`BillingHistory-paymentBadge ${bill.payment.toLowerCase()}`}
                            >
                              {getPaymentIcon(bill.payment)}
                              {bill.payment}
                            </span>
                          </td>

                          <td>{bill.customer}</td>

                          <td>
                            <div className="BillingHistory-actionButtons">
                              <button
                                title="View Tax Invoice"
                                onClick={() => setPreviewInvoiceBill(bill)}
                                className="BillingHistory-viewAction"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                title="Download Invoice PDF"
                                onClick={() => handleDirectDownloadInvoice(bill)}
                                className="BillingHistory-printAction"
                                disabled={downloadingBillId === bill.id}
                              >
                                <Download size={17} />
                              </button>

                              <button
                                title="Delete"
                                onClick={() => handleDelete(bill.id)}
                                className="BillingHistory-deleteAction"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="BillingHistory-emptyState">
                          <FileText size={42} />
                          <strong>No bills found</strong>
                          <span>Try changing your search or filters.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            <div className="BillingHistory-pagination">
              <span>
                Showing{" "}
                <strong>
                  {filteredBills.length === 0
                    ? 0
                    : (currentPage - 1) * billsPerPage + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(currentPage * billsPerPage, filteredBills.length)}
                </strong>{" "}
                of <strong>{filteredBills.length}</strong> bills
              </span>

              <div className="BillingHistory-pageNumbers">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft size={17} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.max(5, currentPage + 2),
                  )
                  .map((page) => (
                    <button
                      key={page}
                      className={
                        currentPage === page ? "BillingHistory-activePage" : ""
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="BillingHistory-perPage">
                <span>{billsPerPage} per page</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* INVOICE MODAL PREVIEW */}
      <InvoiceModal
        order={previewInvoiceBill}
        isOpen={Boolean(previewInvoiceBill)}
        onClose={() => setPreviewInvoiceBill(null)}
      />
    </div>
  );
};

export default BillingHistory;

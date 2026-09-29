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
  const [detailsOpen, setDetailsOpen] = useState(true);

  const [activeTab, setActiveTab] = useState("All Bills");

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const firstItem = b.items?.[0] || {};

        return {
          id: b._id,
          invoice: b.invoiceNumber,
          date,
          time,
          createdAt: b.createdAt,
          items: Array.isArray(b.items) ? b.items.length : 0,
          total: Number(b.totalAmount || 0),
          subtotal: Number(b.subtotal || 0),
          discount: Number(b.discountAmount || 0),
          totalSavings: Number(b.totalSavings || 0),
          payment: b.paymentMethod || "Cash",
          customer: b.customer?.name || "Walk-in",
          contact: b.customer?.mobile || "-",
          address: "-",
          cashier: b.cashier?.name || b.cashier?.email || "",
          upiTransactionId: b.upiTransactionId || "",
          amountReceived: Number(b.amountReceived || 0),
          changeReturned: Number(b.changeReturned || 0),
          products: (b.items || []).map((it) => ({
            name: it.productName || "Product",
            variant: it.unit ? `(${it.unit})` : "",
            price: Number(it.price || 0),
            qty: Number(it.quantity || 1),
            image: resolveImage(it.image),
          })),
        };
      });

      setBills(formatted);

      // Keep selection if it still exists
      if (selectedBill) {
        const stillThere = formatted.find((x) => x.id === selectedBill.id);
        setSelectedBill(stillThere || null);
      }
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

  const activeBill = selectedBill || filteredBills[0] || bills[0] || null;

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
      (sum, b) => sum + Number(b.items || 0),
      0,
    );
    return { totalBills, totalSales, avgValue, totalItems };
  }, [filteredBills]);

  // =========================================================
  // ACTIONS
  // =========================================================
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setDetailsOpen(true);
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
      if (selectedBill?.id === id) setSelectedBill(null);
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

  const handlePrint = () => {
    if (!activeBill) return;

    const itemsHtml = (activeBill.products || [])
      .map(
        (p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.name}<br/><small>${p.variant || ""}</small></td>
          <td>₹${p.price}</td>
          <td>${p.qty}</td>
          <td>₹${p.price * p.qty}</td>
        </tr>`,
      )
      .join("");

    const cashLines =
      activeBill.payment === "Cash"
        ? `
        <div class="row"><span>Amount Received</span><strong>₹${activeBill.amountReceived}</strong></div>
        <div class="row"><span>Change</span><strong>₹${activeBill.changeReturned}</strong></div>`
        : "";

    const upiLine =
      activeBill.payment === "UPI" && activeBill.upiTransactionId
        ? `<div class="details"><span>UPI Txn: ${activeBill.upiTransactionId}</span></div>`
        : "";

    const w = window.open("", "_blank", "width=450,height=750");
    if (!w) {
      Swal.fire({
        icon: "error",
        title: "Print blocked",
        text: "Please allow popups.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activeBill.invoice}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 25px; font-family: Arial, sans-serif; }
          .receipt { max-width: 430px; margin: auto; }
          .logo { text-align: center; color: #078c3e; font-size: 27px; font-weight: 800; }
          .tagline { text-align: center; font-size: 13px; color: #475569; margin-bottom: 20px; }
          .details { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
          th { background: #f1f5f9; text-align: left; }
          th, td { padding: 8px 5px; border-bottom: 1px solid #e5e7eb; }
          .grand { margin-top: 8px; padding: 12px; background: #eaffed; border-radius: 8px; color: #087b38; font-weight: 800; font-size: 18px; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="logo">Grocery Sati</div>
          <div class="tagline">Fresh Grocery, Better Living!</div>

          <div class="details">
            <span>Invoice: ${activeBill.invoice}</span>
            <span>Date: ${activeBill.date}</span>
          </div>

          <div class="details">
            <span>Customer: ${activeBill.customer}</span>
            <span>Mobile: ${activeBill.contact}</span>
          </div>

          <div class="details">
            <span>Payment: ${activeBill.payment}</span>
          </div>

          ${upiLine}

          <table>
            <thead>
              <tr><th>#</th><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="margin-top:18px">
            <div class="row"><span>Subtotal</span><strong>₹${activeBill.subtotal}</strong></div>
            <div class="row"><span>Discount</span><strong>₹${activeBill.discount}</strong></div>
            <div class="grand">
              <div class="row"><span>Total Amount</span><span>₹${activeBill.total}</span></div>
            </div>
            ${cashLines}
          </div>

          <div style="text-align:center;margin-top:25px;font-size:13px;color:#475569">
            Thank you for shopping with us!
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  const handleDownload = () => {
    if (!activeBill) return;
    const invoice = activeBill.invoice || "invoice";

    const itemLines = (activeBill.products || [])
      .map(
        (p, i) =>
          `${String(i + 1).padEnd(3)} ${p.name.padEnd(25)} ${
            p.qty
          }   ₹${p.price * p.qty}`,
      )
      .join("\n");

    const content = `
GROCERY SATI
Offline Billing Software

Invoice No: ${invoice}
Date: ${activeBill.date}
Time: ${activeBill.time}

Customer: ${activeBill.customer}
Mobile: ${activeBill.contact}
Payment: ${activeBill.payment}

----------------------------------------
#   ITEM                    QTY    TOTAL
----------------------------------------
${itemLines}
----------------------------------------

Subtotal: ₹${activeBill.subtotal}
Discount: ₹${activeBill.discount}

TOTAL: ₹${activeBill.total}

Thank you for shopping with us!
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
                        <tr
                          key={bill.id}
                          className={
                            activeBill?.id === bill.id
                              ? "BillingHistory-selectedRow"
                              : ""
                          }
                        >
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

                          <td>{bill.items}</td>

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
                                title="View"
                                onClick={() => handleViewBill(bill)}
                                className="BillingHistory-viewAction"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                title="Print"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setTimeout(handlePrint, 50);
                                }}
                                className="BillingHistory-printAction"
                              >
                                <Printer size={17} />
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

        {/* DETAILS PANEL */}
        {detailsOpen && activeBill && (
          <aside className="BillingHistory-detailsPanel">
            <div className="BillingHistory-detailsHeader">
              <div>
                <FileText size={23} />
                <h3>Bill Details</h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="BillingHistory-closeDetails"
              >
                <X size={22} />
              </button>
            </div>

            <div className="BillingHistory-detailsContent">
              <div className="BillingHistory-invoiceBanner">
                <div className="BillingHistory-invoiceCart">
                  <ShoppingCart size={36} />
                </div>
                <div>
                  <strong>Invoice #{activeBill.invoice}</strong>
                  <span>
                    {activeBill.date} &nbsp;•&nbsp; {activeBill.time}
                  </span>
                </div>
              </div>

              <div className="BillingHistory-customerSection">
                <div className="BillingHistory-sectionTitle">
                  <UserRound size={20} />
                  <strong>Customer Details</strong>
                </div>

                <div className="BillingHistory-customerRows">
                  <div>
                    <span>Name</span>
                    <b>:</b>
                    <strong>{activeBill.customer}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <b>:</b>
                    <strong>{activeBill.contact}</strong>
                  </div>
                  <div>
                    <span>Cashier</span>
                    <b>:</b>
                    <strong>{activeBill.cashier || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="BillingHistory-itemsSection">
                <div className="BillingHistory-sectionTitle">
                  <ShoppingCart size={20} />
                  <strong>Items ({activeBill.products?.length || 0})</strong>
                </div>

                <div className="BillingHistory-itemTable">
                  <div className="BillingHistory-itemHeader">
                    <span>#</span>
                    <span>Item Name</span>
                    <span>Price</span>
                    <span>Qty</span>
                    <span>Total</span>
                  </div>

                  {(activeBill.products || []).map((product, index) => (
                    <div
                      className="BillingHistory-itemRow"
                      key={`${product.name}-${index}`}
                    >
                      <span>{index + 1}</span>

                      <div className="BillingHistory-productInfo">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span>
                          {product.name}
                          <small>{product.variant}</small>
                        </span>
                      </div>

                      <span>₹ {product.price}</span>
                      <span>{product.qty}</span>
                      <strong>₹ {product.price * product.qty}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="BillingHistory-totalSection">
                <div>
                  <span>Subtotal</span>
                  <strong>₹ {activeBill.subtotal}</strong>
                </div>
                <div>
                  <span>Discount</span>
                  <strong>₹ {activeBill.discount}</strong>
                </div>
                <div className="BillingHistory-grandTotal">
                  <span>Total Amount</span>
                  <strong>₹ {activeBill.total}</strong>
                </div>
              </div>
            </div>

            <div className="BillingHistory-detailsActions">
              <button
                className="BillingHistory-printBill"
                onClick={handlePrint}
              >
                <Printer size={19} />
                Print Bill
              </button>

              <button
                className="BillingHistory-downloadBill"
                onClick={handleDownload}
              >
                <Download size={19} />
                Download
              </button>

              <button
                className="BillingHistory-deleteBill"
                onClick={() => handleDelete(activeBill.id)}
              >
                <Trash2 size={19} />
                Delete
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;

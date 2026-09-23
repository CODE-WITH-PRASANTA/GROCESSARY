import React, { useState, useMemo, useRef, useEffect } from "react";
import API from "../../api/axios";
import "./TransactionHistory.css";

const ITEMS_PER_PAGE = 8;

// ======================================================
// HELPERS
// ======================================================

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

// Human-readable labels for wallet txns
const WALLET_TYPE_LABELS = {
  add_money: "Wallet Topup",
  order_payment: "Order Payment",
  refund: "Refund",
  referral_bonus: "Referral Bonus",
  cashback: "Cashback Received",
  withdrawal: "Money Sent to Bank",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
  points_conversion: "Points Converted",
};

// Human-readable labels for points txns
const POINTS_TYPE_LABELS = {
  earned_order: "Points Earned",
  earned_referral: "Referral Points",
  earned_welcome: "Welcome Bonus",
  redeemed_order: "Points Redeemed",
  redeemed_wallet: "Points Converted",
  expired: "Points Expired",
  admin_adjust: "Points Adjustment",
};

// Payment-method icon mapping
const mapMethodType = (method = "") => {
  const m = String(method).toLowerCase();
  if (m.includes("upi") || m.includes("phonepe") || m.includes("gpay") || m.includes("paytm"))
    return "upi";
  if (m.includes("card") || m.includes("credit") || m.includes("debit"))
    return "card";
  if (m.includes("wallet")) return "wallet";
  if (m.includes("bank")) return "bank";
  if (m.includes("cod") || m.includes("cash")) return "cod";
  return "upi";
};

// ======================================================
// COMPONENT
// ======================================================

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filterRef = useRef(null);

  // ======================================================
  // FETCH WALLET + POINTS
  // ======================================================

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your transaction history.");
        setTransactions([]);
        return;
      }

      const [walletRes, pointsRes] = await Promise.all([
        API.get("/wallet"),
        API.get("/points"),
      ]);

      const walletTxns = walletRes.data?.wallet?.transactions || [];
      const pointsTxns = pointsRes.data?.points?.transactions || [];

      // ---------- Map wallet transactions ----------
      const mappedWallet = walletTxns.map((t) => {
        const isCredit = t.direction === "credit";

        return {
          id: t._id || `${t.createdAt}-${t.type}`,
          date: formatDate(t.createdAt),
          time: formatTime(t.createdAt),
          rawDate: new Date(t.createdAt),

          type: WALLET_TYPE_LABELS[t.type] || t.type,
          title:
            t.type === "order_payment"
              ? `Order #${t.reference || ""}`
              : t.type === "referral_bonus"
              ? `Referral Bonus`
              : t.type === "add_money"
              ? "Added to Wallet"
              : t.type === "withdrawal"
              ? "Withdrawal to Bank"
              : WALLET_TYPE_LABELS[t.type] || t.type,

          subtitle: t.reference || t.meta?.reason || "",

          amount: Number(t.amount || 0),
          isDebit: !isCredit,

          status:
            t.status === "success"
              ? "Success"
              : t.status === "failed"
              ? "Failed"
              : "Pending",

          method: t.reference || "Grocery Sathi Wallet",
          methodType: mapMethodType(t.reference || "wallet"),
        };
      });

      // ---------- Map points transactions ----------
      const mappedPoints = pointsTxns.map((t) => {
        const isCredit = t.direction === "credit";

        // Convert points to a rough rupee equivalent for display
        const rupeeValue = Number(t.points || 0) * 0.25;

        return {
          id: t._id || `${t.createdAt}-${t.type}`,
          date: formatDate(t.createdAt),
          time: formatTime(t.createdAt),
          rawDate: new Date(t.createdAt),

          type: POINTS_TYPE_LABELS[t.type] || t.type,
          title:
            t.type === "earned_order"
              ? `Earned on Order #${t.reference || ""}`
              : t.type === "earned_referral"
              ? "Referral Reward"
              : t.type === "redeemed_order"
              ? `Redeemed on Order #${t.reference || ""}`
              : t.type === "earned_welcome"
              ? "Welcome Bonus"
              : POINTS_TYPE_LABELS[t.type] || t.type,

          subtitle: `${t.points || 0} pts`,
          amount: rupeeValue,
          isDebit: !isCredit,

          status: "Success",
          method: "Reward Points",
          methodType: "wallet",
        };
      });

      // ---------- Merge & sort newest first ----------
      const merged = [...mappedWallet, ...mappedPoints].sort(
        (a, b) => b.rawDate - a.rawDate,
      );

      setTransactions(merged);
    } catch (err) {
      console.error("Fetch transactions error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load transactions.",
        );
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ======================================================
  // OUTSIDE CLICK
  // ======================================================

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ======================================================
  // SUMMARY METRICS
  // ======================================================

  const summary = useMemo(() => {
    let totalCount = transactions.length;
    let totalSpent = 0;
    let totalCashback = 0;
    let totalTopup = 0;

    for (const t of transactions) {
      if (t.isDebit && t.type === "Order Payment") {
        totalSpent += t.amount;
      } else if (t.type === "Cashback Received" || t.type === "Referral Bonus") {
        totalCashback += t.amount;
      } else if (t.type === "Wallet Topup") {
        totalTopup += t.amount;
      }
    }

    return { totalCount, totalSpent, totalCashback, totalTopup };
  }, [transactions]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.method.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Success" && t.status === "Success") ||
        (selectedFilter === "Failed" && t.status === "Failed") ||
        (selectedFilter === "Debit" && t.isDebit) ||
        (selectedFilter === "Credit" && !t.isDebit);

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchTerm, selectedFilter]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages =
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  // ======================================================
  // PAYMENT ICON
  // ======================================================

  const renderPaymentIcon = (type) => {
    switch (type) {
      case "upi":
        return (
          <span className="th-pay-icon upi-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M4 18L10 6L14 14L20 6"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      case "card":
        return (
          <span className="th-pay-icon card-icon">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            >
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                fill="#3b82f6"
              />
              <line
                x1="2"
                y1="10"
                x2="22"
                y2="10"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </span>
        );
      case "wallet":
        return (
          <span className="th-pay-icon wallet-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#10b981">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <circle cx="16" cy="12.5" r="1.5" fill="#ffffff" />
            </svg>
          </span>
        );
      case "bank":
        return (
          <span className="th-pay-icon paytm-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#0284c7">
              <rect x="4" y="8" width="16" height="8" rx="1" />
              <path d="M7 11h2v3H7z" fill="#ffffff" />
            </svg>
          </span>
        );
      case "cod":
        return (
          <span className="th-pay-icon paytm-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#f59e0b">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <circle cx="12" cy="12" r="3" fill="#ffffff" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  if (loading) {
    return (
      <div className="th-container">
        <div className="th-loading">Loading your transactions…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="th-container">
        <div className="th-error">
          <p>{error}</p>
          <button onClick={fetchTransactions}>Try Again</button>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="th-container">
      {/* TOP 4 STAT CARDS */}
      <div className="th-cards-grid">
        {/* Card 1 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-green-soft">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Total Transactions</span>
            <h3 className="th-card-value">{summary.totalCount}</h3>
            <span className="th-card-subtext">All time</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-green-solid">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.99 1-1.72V9c0-.73-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" />
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Total Spent</span>
            <h3 className="th-card-value">
              ₹{summary.totalSpent.toFixed(2)}
            </h3>
            <span className="th-card-subtext">All time</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-blue-soft">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Total Cashback</span>
            <h3 className="th-card-value">
              ₹{summary.totalCashback.toFixed(2)}
            </h3>
            <span className="th-card-subtext">All time</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="th-card">
          <div className="th-card-icon-wrapper icon-orange-soft">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          </div>
          <div className="th-card-body">
            <span className="th-card-label">Wallet Topup</span>
            <h3 className="th-card-value">
              ₹{summary.totalTopup.toFixed(2)}
            </h3>
            <span className="th-card-subtext">All time</span>
          </div>
        </div>
      </div>

      {/* MAIN TABLE WRAPPER */}
      <div className="th-table-wrapper">
        {/* Header Controls */}
        <div className="th-header">
          <h2 className="th-title">All Transactions</h2>

          <div className="th-controls">
            {/* Search */}
            <div className="th-search-box">
              <svg
                className="th-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Filter */}
            <div className="th-filter-wrapper" ref={filterRef}>
              <button
                type="button"
                className={`th-filter-btn ${isFilterOpen ? "active" : ""}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>Filter</span>
              </button>

              {isFilterOpen && (
                <div className="th-filter-menu">
                  {["All", "Success", "Failed", "Debit", "Credit"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        className={`th-filter-item ${
                          selectedFilter === item ? "selected" : ""
                        }`}
                        onClick={() => handleFilterSelect(item)}
                      >
                        {item === "Debit"
                          ? "Payments (Debit)"
                          : item === "Credit"
                          ? "Refunds/Cashback (Credit)"
                          : item}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="th-table-container">
          <table className="th-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="th-cell-datetime">
                        <span className="th-date">{tx.date}</span>
                        <span className="th-time">{tx.time}</span>
                      </div>
                    </td>

                    <td className="th-tx-id">
                      {String(tx.id).slice(0, 16)}
                    </td>

                    <td>
                      <div className="th-type-cell">
                        <span
                          className={`th-type-badge-icon ${
                            tx.type === "Wallet Topup"
                              ? "type-topup"
                              : tx.isDebit
                              ? "type-debit"
                              : "type-credit"
                          }`}
                        >
                          {tx.isDebit ? (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <polyline points="19 12 12 19 5 12" />
                            </svg>
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <line x1="12" y1="19" x2="12" y2="5" />
                              <polyline points="5 12 12 5 19 12" />
                            </svg>
                          )}
                        </span>
                        <span className="th-type-text">{tx.type}</span>
                      </div>
                    </td>

                    <td>
                      <div className="th-desc-cell">
                        <span className="th-desc-title">{tx.title}</span>
                        {tx.subtitle && (
                          <span className="th-desc-sub">{tx.subtitle}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`th-amount ${
                          tx.isDebit ? "amount-debit" : "amount-credit"
                        }`}
                      >
                        {tx.isDebit
                          ? `- ₹${tx.amount.toFixed(2)}`
                          : `+ ₹${tx.amount.toFixed(2)}`}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`th-status-pill status-${tx.status.toLowerCase()}`}
                      >
                        <span className="th-status-dot" />
                        {tx.status}
                      </span>
                    </td>

                    <td>
                      <div className="th-method-cell">
                        {renderPaymentIcon(tx.methodType)}
                        <span>{tx.method}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="th-empty-row">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="th-footer">
          <div className="th-footer-count">
            Showing {filteredTransactions.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(
              startIndex + ITEMS_PER_PAGE,
              filteredTransactions.length,
            )}{" "}
            of {filteredTransactions.length} transactions
          </div>

          <div className="th-pagination">
            <button
              type="button"
              className="th-page-nav"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`th-page-number ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              type="button"
              className="th-page-nav"
              disabled={
                currentPage === totalPages ||
                filteredTransactions.length === 0
              }
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
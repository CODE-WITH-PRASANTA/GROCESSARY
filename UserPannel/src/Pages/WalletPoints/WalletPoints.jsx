import React, { useEffect, useState } from "react";
import {
  FaWallet,
  FaStar,
  FaGift,
  FaArrowRight,
  FaPlusCircle,
  FaUniversity,
  FaTicketAlt,
  FaHistory,
  FaReceipt,
  FaShoppingBag,
  FaTimes,
} from "react-icons/fa";
import API from "../../api/axios";
import "./WalletPoints.css";

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
};

const formatDateShort = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

// Human-readable labels for each backend transaction type
const WALLET_TXN_LABELS = {
  add_money: "Added Money",
  order_payment: "Order Payment",
  refund: "Refund",
  referral_bonus: "Referral Bonus",
  cashback: "Cashback Received",
  withdrawal: "Money Sent to Bank",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
  points_conversion: "Points Converted",
};

const POINTS_TXN_LABELS = {
  earned_order: "Points Earned",
  earned_referral: "Referral Reward",
  earned_welcome: "Welcome Bonus",
  redeemed_order: "Points Used",
  redeemed_wallet: "Converted to Wallet",
  expired: "Points Expired",
  admin_adjust: "Adjustment",
};

// Icon map — keeps JSX clean
const getWalletTxnIcon = (type) => {
  switch (type) {
    case "add_money":
    case "admin_credit":
      return <FaPlusCircle />;
    case "order_payment":
      return <FaShoppingBag />;
    case "referral_bonus":
    case "cashback":
      return <FaReceipt />;
    case "withdrawal":
      return <FaUniversity />;
    default:
      return <FaWallet />;
  }
};

// ======================================================
// COMPONENT
// ======================================================

const WalletPoints = () => {
  // ---- WALLET ----
  const [balance, setBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  // ---- POINTS ----
  const [rewardPoints, setRewardPoints] = useState(0);
  const [pointsTotalEarned, setPointsTotalEarned] = useState(0);
  const [pointsTotalUsed, setPointsTotalUsed] = useState(0);
  const [pointsActivity, setPointsActivity] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [pointsError, setPointsError] = useState("");

  // ---- MODAL ----
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("UPI - PhonePe");
  const [saving, setSaving] = useState(false);

  // ======================================================
  // FETCH WALLET
  // ======================================================

  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setWalletError("Please login to view your wallet.");
        return;
      }

      const { data } = await API.get("/wallet");

      if (data.success) {
        const wallet = data.wallet || {};
        setBalance(Number(wallet.balance) || 0);

        const txns = (wallet.transactions || []).map((t) => ({
          id: t._id,
          type: WALLET_TXN_LABELS[t.type] || t.type,
          subtext: t.reference || "",
          date: formatDateTime(t.createdAt),
          amount: `${
            t.direction === "credit" ? "+" : "-"
          } ₹${formatCurrency(t.amount)}`,
          status: t.status === "success" ? "Success" : t.status,
          isCredit: t.direction === "credit",
          icon: getWalletTxnIcon(t.type),
        }));

        setWalletTransactions(txns);
      } else {
        setWalletError(data.message || "Failed to load wallet.");
      }
    } catch (err) {
      console.error("Fetch wallet error:", err);
      setWalletError(
        err.response?.data?.message || "Failed to load wallet."
      );
    } finally {
      setWalletLoading(false);
    }
  };

  // ======================================================
  // FETCH POINTS
  // ======================================================

  const fetchPoints = async () => {
    try {
      setPointsLoading(true);
      setPointsError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setPointsError("Please login to view your points.");
        return;
      }

      const { data } = await API.get("/points");

      if (data.success) {
        const points = data.points || {};
        setRewardPoints(Number(points.availablePoints) || 0);
        setPointsTotalEarned(Number(points.totalEarned) || 0);
        setPointsTotalUsed(Number(points.totalUsed) || 0);

        const activity = (points.transactions || []).map((t) => ({
          id: t._id,
          title: POINTS_TXN_LABELS[t.type] || t.type,
          subtext: t.reference || t.note || "",
          date: formatDateShort(t.createdAt),
          points: `${t.direction === "credit" ? "+" : "-"}${t.points} pts`,
          isCredit: t.direction === "credit",
        }));

        setPointsActivity(activity);
      } else {
        setPointsError(data.message || "Failed to load points.");
      }
    } catch (err) {
      console.error("Fetch points error:", err);
      setPointsError(
        err.response?.data?.message || "Failed to load points."
      );
    } finally {
      setPointsLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchWallet();
    fetchPoints();
  }, []);

  // ======================================================
  // MODAL HANDLERS
  // ======================================================

  const handleOpenModal = () => setIsAddMoneyOpen(true);

  const handleCloseModal = () => {
    setIsAddMoneyOpen(false);
    setAddAmount("");
    setSaving(false);
  };

  const handleQuickAdd = (value) => {
    setAddAmount((prev) => String(Number(prev || 0) + value));
  };

  // ======================================================
  // ADD MONEY (backend)
  // ======================================================

  const handleConfirmAddMoney = async (e) => {
    e.preventDefault();

    const numValue = parseFloat(addAmount);
    if (isNaN(numValue) || numValue <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      // NOTE: this calls your existing /api/wallet/add.
      // If you later add a Razorpay flow for wallet top-ups,
      // replace this with /wallet/create-order + /wallet/verify.
      const { data } = await API.post("/wallet/add", {
        amount: numValue,
        method: selectedMethod,
      });

      if (!data.success) {
        alert(data.message || "Failed to add money.");
        return;
      }

      // Refresh wallet from backend to get accurate balance + txn history
      await fetchWallet();

      handleCloseModal();
    } catch (err) {
      console.error("Add money error:", err);
      alert(err.response?.data?.message || "Failed to add money.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // OTHER ACTIONS
  // ======================================================

  const handleSendToBank = () => {
    const amount = prompt("Enter amount to withdraw (₹):");
    if (!amount) return;

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      alert("Invalid amount.");
      return;
    }

    API.post("/wallet/withdraw", { amount: value })
      .then(({ data }) => {
        if (data.success) {
          alert("Withdrawal request submitted.");
          fetchWallet();
        } else {
          alert(data.message || "Withdrawal failed.");
        }
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Withdrawal failed.");
      });
  };

  const handleVouchers = () => alert("My Vouchers opened!");
  const handlePointsHistory = () => alert("Navigating to Points History!");
  const handleShopNow = () => alert("Redirecting to Shop!");

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="WalletPoints-container">
      {/* ==================================================
          TOP CARDS
      ================================================== */}

      <div className="WalletPoints-top-grid">
        {/* WALLET CARD */}
        <div className="WalletPoints-card WalletPoints-balance-card">
          <div className="WalletPoints-card-header">
            <div className="WalletPoints-icon-wrapper green-bg">
              <FaWallet className="WalletPoints-icon green-text" />
            </div>

            <div className="WalletPoints-title-group">
              <span className="WalletPoints-card-label">Wallet Balance</span>
              <h2 className="WalletPoints-balance-amount">
                ₹{formatCurrency(balance)}
              </h2>
            </div>
          </div>

          <div className="WalletPoints-card-footer">
            <span className="WalletPoints-badge green-badge">
              Total Balance
            </span>

            <button
              className="WalletPoints-btn-primary"
              onClick={handleOpenModal}
            >
              <FaPlusCircle /> Add Money
            </button>
          </div>
        </div>

        {/* POINTS CARD */}
        <div className="WalletPoints-card WalletPoints-points-card">
          <div className="WalletPoints-card-header">
            <div className="WalletPoints-icon-wrapper orange-bg">
              <FaStar className="WalletPoints-icon orange-text" />
            </div>

            <div className="WalletPoints-title-group">
              <span className="WalletPoints-card-label">Reward Points</span>
              <h2 className="WalletPoints-points-amount">
                {rewardPoints}{" "}
                <span className="WalletPoints-pts-unit">pts</span>
              </h2>
            </div>
          </div>

          <div className="WalletPoints-card-footer">
            <span className="WalletPoints-badge orange-badge">
              Available Points
            </span>

            <button
              className="WalletPoints-btn-secondary"
              onClick={() =>
                alert(
                  "Earn 5% of every order value as points. Redeem 1 pt = ₹0.25 at checkout."
                )
              }
            >
              <FaGift /> How to Earn Points
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================
          ACTION BAR
      ================================================== */}

      <div className="WalletPoints-actions-bar">
        <div className="WalletPoints-action-item" onClick={handleOpenModal}>
          <div className="WalletPoints-action-icon green-bg-light">
            <FaPlusCircle className="green-text" />
          </div>
          <div className="WalletPoints-action-text">
            <h4>Add Money</h4>
            <p>Add money to your wallet securely</p>
          </div>
        </div>

        <div className="WalletPoints-action-item" onClick={handleSendToBank}>
          <div className="WalletPoints-action-icon blue-bg-light">
            <FaUniversity className="blue-text" />
          </div>
          <div className="WalletPoints-action-text">
            <h4>Send to Bank</h4>
            <p>Transfer your wallet balance to bank</p>
          </div>
        </div>

        <div className="WalletPoints-action-item" onClick={handleVouchers}>
          <div className="WalletPoints-action-icon purple-bg-light">
            <FaTicketAlt className="purple-text" />
          </div>
          <div className="WalletPoints-action-text">
            <h4>My Vouchers</h4>
            <p>View and manage your vouchers</p>
          </div>
        </div>

        <div className="WalletPoints-action-item" onClick={handlePointsHistory}>
          <div className="WalletPoints-action-icon orange-bg-light">
            <FaHistory className="orange-text" />
          </div>
          <div className="WalletPoints-action-text">
            <h4>Points History</h4>
            <p>View your points earned & used</p>
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="WalletPoints-main-grid">
        {/* LEFT: WALLET TRANSACTIONS */}
        <div className="WalletPoints-card WalletPoints-transactions-card">
          <div className="WalletPoints-section-header">
            <div className="WalletPoints-header-left">
              <FaReceipt className="WalletPoints-section-icon green-text" />
              <h3>Recent Wallet Transactions</h3>
            </div>

            <button
              className="WalletPoints-link-btn"
              onClick={fetchWallet}
            >
              Refresh <FaArrowRight />
            </button>
          </div>

          <div className="WalletPoints-list">
            {walletLoading && (
              <div className="WalletPoints-list-item">
                <p className="WalletPoints-subtext">Loading transactions…</p>
              </div>
            )}

            {!walletLoading && walletError && (
              <div className="WalletPoints-list-item">
                <p className="WalletPoints-subtext">{walletError}</p>
              </div>
            )}

            {!walletLoading && !walletError && walletTransactions.length === 0 && (
              <div className="WalletPoints-list-item">
                <p className="WalletPoints-subtext">
                  No wallet transactions yet.
                </p>
              </div>
            )}

            {!walletLoading &&
              walletTransactions.map((item) => (
                <div key={item.id} className="WalletPoints-list-item">
                  <div className="WalletPoints-item-left">
                    <div
                      className={`WalletPoints-item-icon ${
                        item.isCredit
                          ? "blue-bg-light blue-text"
                          : "pink-bg-light pink-text"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="WalletPoints-item-details">
                      <h4>{item.type}</h4>
                      {item.subtext && (
                        <p className="WalletPoints-subtext">{item.subtext}</p>
                      )}
                      <span className="WalletPoints-date">{item.date}</span>
                    </div>
                  </div>

                  <div className="WalletPoints-item-right">
                    <span
                      className={`WalletPoints-amount ${
                        item.isCredit ? "credit" : "debit"
                      }`}
                    >
                      {item.amount}
                    </span>
                    <span className="WalletPoints-status">{item.status}</span>
                  </div>
                </div>
              ))}
          </div>

          {walletTransactions.length > 0 && (
            <div className="WalletPoints-center-btn">
              <button
                className="WalletPoints-link-btn bold"
                onClick={fetchWallet}
              >
                View All Transactions <FaArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="WalletPoints-right-column">
          {/* POINTS SUMMARY */}
          <div className="WalletPoints-card WalletPoints-summary-card">
            <div className="WalletPoints-section-header">
              <div className="WalletPoints-header-left">
                <FaStar className="WalletPoints-section-icon green-text" />
                <h3>Points Summary</h3>
              </div>
            </div>

            <div className="WalletPoints-summary-content">
              <div className="WalletPoints-summary-rows">
                <div className="WalletPoints-summary-row">
                  <span>Total Points Earned</span>
                  <strong>{pointsTotalEarned} pts</strong>
                </div>

                <div className="WalletPoints-summary-row">
                  <span>Total Points Used</span>
                  <strong>{pointsTotalUsed} pts</strong>
                </div>

                <div className="WalletPoints-summary-row">
                  <span>Available Points</span>
                  <strong className="orange-text">{rewardPoints} pts</strong>
                </div>
              </div>

              <div className="WalletPoints-trophy-illustration">🏆</div>
            </div>
          </div>

          {/* POINTS ACTIVITY */}
          <div className="WalletPoints-card WalletPoints-activity-card">
            <div className="WalletPoints-section-header">
              <div className="WalletPoints-header-left">
                <FaReceipt className="WalletPoints-section-icon green-text" />
                <h3>Recent Points Activity</h3>
              </div>

              <button
                className="WalletPoints-link-btn"
                onClick={fetchPoints}
              >
                Refresh <FaArrowRight />
              </button>
            </div>

            <div className="WalletPoints-list">
              {pointsLoading && (
                <div className="WalletPoints-list-item">
                  <p className="WalletPoints-subtext">Loading activity…</p>
                </div>
              )}

              {!pointsLoading && pointsError && (
                <div className="WalletPoints-list-item">
                  <p className="WalletPoints-subtext">{pointsError}</p>
                </div>
              )}

              {!pointsLoading && !pointsError && pointsActivity.length === 0 && (
                <div className="WalletPoints-list-item">
                  <p className="WalletPoints-subtext">
                    No points activity yet.
                  </p>
                </div>
              )}

              {!pointsLoading &&
                pointsActivity.map((act) => (
                  <div key={act.id} className="WalletPoints-list-item">
                    <div className="WalletPoints-item-left">
                      <div className="WalletPoints-item-icon orange-bg-light orange-text">
                        <FaStar />
                      </div>

                      <div className="WalletPoints-item-details">
                        <h4>{act.title}</h4>
                        {act.subtext && (
                          <p className="WalletPoints-subtext">{act.subtext}</p>
                        )}
                      </div>
                    </div>

                    <div className="WalletPoints-item-right">
                      <span
                        className={`WalletPoints-amount ${
                          act.isCredit ? "credit" : "debit"
                        }`}
                      >
                        {act.points}
                      </span>
                      <span className="WalletPoints-date">{act.date}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          PROMO BANNER
      ================================================== */}

      <div className="WalletPoints-promo-banner">
        <div className="WalletPoints-promo-left">
          <div className="WalletPoints-promo-icon">👛</div>
          <div className="WalletPoints-promo-text">
            <h3>Use your wallet balance for faster checkout!</h3>
            <p>
              Your wallet balance can be used to pay for orders, get exclusive
              discounts and much more.
            </p>
          </div>
        </div>

        <button className="WalletPoints-btn-shop" onClick={handleShopNow}>
          Shop Now
        </button>
      </div>

      {/* ==================================================
          ADD MONEY MODAL
      ================================================== */}

      {isAddMoneyOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Money to Wallet</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleConfirmAddMoney}>
              <div className="modal-body">
                <label className="input-label">Enter Amount (₹)</label>
                <input
                  type="number"
                  className="modal-input"
                  placeholder="e.g. 500"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="1"
                  required
                  autoFocus
                />

                <div className="quick-add-chips">
                  <button type="button" onClick={() => handleQuickAdd(100)}>
                    + ₹100
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(200)}>
                    + ₹200
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(500)}>
                    + ₹500
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(1000)}>
                    + ₹1000
                  </button>
                </div>

                <label className="input-label" style={{ marginTop: "16px" }}>
                  Select Payment Method
                </label>
                <select
                  className="modal-select"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  <option value="UPI - PhonePe">UPI - PhonePe</option>
                  <option value="UPI - Google Pay">UPI - Google Pay</option>
                  <option value="UPI - Paytm">UPI - Paytm</option>
                  <option value="Credit / Debit Card">
                    Credit / Debit Card
                  </option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="WalletPoints-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Processing…" : "Proceed to Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPoints;
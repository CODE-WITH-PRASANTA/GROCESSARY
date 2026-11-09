import React, { useState, useEffect, useCallback } from "react";
import {
  Gift,
  Users,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Wallet,
} from "lucide-react";
import API from "../../api/axios";
import "./ReferralManagement.css";

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalReferrerPaid: 0,
    totalFriendBonusPaid: 0,
    totalPointsAwarded: 0,
    config: {
      referrerWalletBonus: 30,
      referrerPointsBonus: 50,
      friendWalletBonus: 20,
      friendPointsBonus: 100,
    },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await API.get("/referrals/admin/all", { params });
      if (res.data?.success) {
        setReferrals(res.data.referrals || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load admin referrals:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="referral-mgmt-wrapper">
      {/* HEADER */}
      <div className="referral-mgmt-header">
        <div>
          <div className="referral-badge-pill">
            <Gift size={14} /> Referral & Affiliate Program
          </div>
          <h1 className="referral-mgmt-title">Referrals & Rewards Management</h1>
          <p className="referral-mgmt-subtitle">
            Monitor customer referrals, track first-order wallet bonuses, and verify automated payouts.
          </p>
        </div>

        <button
          type="button"
          className="btn-refresh-referrals"
          onClick={fetchReferrals}
          disabled={loading}
          title="Refresh referral records"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="referral-metrics-grid">
        <div className="ref-metric-card blue">
          <div className="ref-metric-icon">
            <Users size={22} />
          </div>
          <div className="ref-metric-content">
            <span className="ref-metric-label">Total Referrals</span>
            <span className="ref-metric-val">{summary.totalReferrals || 0}</span>
            <span className="ref-metric-hint">Invited friends on platform</span>
          </div>
        </div>

        <div className="ref-metric-card green">
          <div className="ref-metric-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="ref-metric-content">
            <span className="ref-metric-label">Completed Purchases</span>
            <span className="ref-metric-val">{summary.completedReferrals || 0}</span>
            <span className="ref-metric-hint">1st delivered order rewarded</span>
          </div>
        </div>

        <div className="ref-metric-card amber">
          <div className="ref-metric-icon">
            <Clock size={22} />
          </div>
          <div className="ref-metric-content">
            <span className="ref-metric-label">Pending First Orders</span>
            <span className="ref-metric-val">{summary.pendingReferrals || 0}</span>
            <span className="ref-metric-hint">Signed up, awaiting 1st order</span>
          </div>
        </div>

        <div className="ref-metric-card purple">
          <div className="ref-metric-icon">
            <Wallet size={22} />
          </div>
          <div className="ref-metric-content">
            <span className="ref-metric-label">Referrer Cash Paid</span>
            <span className="ref-metric-val">₹{summary.totalReferrerPaid || 0}</span>
            <span className="ref-metric-hint">Direct wallet cash credited</span>
          </div>
        </div>

        <div className="ref-metric-card emerald">
          <div className="ref-metric-icon">
            <Sparkles size={22} />
          </div>
          <div className="ref-metric-content">
            <span className="ref-metric-label">Welcome Bonuses Paid</span>
            <span className="ref-metric-val">₹{summary.totalFriendBonusPaid || 0}</span>
            <span className="ref-metric-hint">₹20 bonus credited to friends</span>
          </div>
        </div>
      </div>

      {/* CURRENT RULES INFO BANNER */}
      <div className="referral-rules-banner">
        <div className="rules-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="rules-text">
          <strong>Automated Reward Structure:</strong>
          <span>
            {" "}When a new friend registers using a referral link or code, they instantly receive a{" "}
            <strong>₹{summary.config?.friendWalletBonus || 20} Wallet Bonus</strong> +{" "}
            <strong>{summary.config?.friendPointsBonus || 100} Reward Points</strong>. When their first order is delivered, the referrer automatically receives{" "}
            <strong>₹{summary.config?.referrerWalletBonus || 30} Wallet Cash</strong> +{" "}
            <strong>{summary.config?.referrerPointsBonus || 50} Points</strong> to spend on groceries!
          </span>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="referral-toolbar">
        <div className="referral-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by referrer name, email, friend, or referral code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="referral-filter-tabs">
          <button
            type="button"
            className={`ref-filter-tab ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Referrals ({summary.totalReferrals || 0})
          </button>
          <button
            type="button"
            className={`ref-filter-tab ${statusFilter === "completed" ? "active" : ""}`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed ({summary.completedReferrals || 0})
          </button>
          <button
            type="button"
            className={`ref-filter-tab ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({summary.pendingReferrals || 0})
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="referral-table-card">
        {loading ? (
          <div className="referral-loading-box">
            <RefreshCw size={24} className="spin" />
            <p>Loading referral records...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="referral-empty-box">
            <Gift size={40} className="empty-icon" />
            <h3>No referrals found</h3>
            <p>
              {search || statusFilter !== "all"
                ? "Try clearing your search query or switching filters."
                : "No customer referral invites have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="referral-table">
              <thead>
                <tr>
                  <th>Referrer (Inviter)</th>
                  <th>Referral Code</th>
                  <th>Friend (Invited)</th>
                  <th>Status</th>
                  <th>Referrer Reward</th>
                  <th>Friend Welcome Bonus</th>
                  <th>First Order Trigger</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((row) => {
                  const referrerName = `${row.referrer?.firstName || "Customer"} ${
                    row.referrer?.lastName || ""
                  }`.trim();
                  const friendName = `${row.referred?.firstName || "New User"} ${
                    row.referred?.lastName || ""
                  }`.trim();
                  const isCompleted = row.status === "completed";

                  return (
                    <tr key={row._id}>
                      {/* REFERRER */}
                      <td>
                        <div className="user-profile-cell">
                          <div className="user-avatar-circle">
                            {referrerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="user-meta-block">
                            <strong className="user-name">{referrerName}</strong>
                            <span className="user-subtext">
                              {row.referrer?.email || row.referrer?.mobile || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CODE */}
                      <td>
                        <div className="ref-code-cell">
                          <code className="ref-code-tag">{row.referralCode}</code>
                          <button
                            type="button"
                            className="ref-code-copy-btn"
                            onClick={() => handleCopy(row.referralCode)}
                            title="Copy Code"
                          >
                            {copiedCode === row.referralCode ? (
                              <Check size={13} className="text-green" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* FRIEND */}
                      <td>
                        <div className="user-profile-cell">
                          <div className="user-avatar-circle friend">
                            {friendName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="user-meta-block">
                            <strong className="user-name">{friendName}</strong>
                            <span className="user-subtext">
                              {row.referred?.email || row.referred?.mobile || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        {isCompleted ? (
                          <span className="ref-status-badge completed">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        ) : (
                          <span className="ref-status-badge pending">
                            <Clock size={13} /> Pending 1st Order
                          </span>
                        )}
                      </td>

                      {/* REFERRER REWARD */}
                      <td>
                        <div className="reward-cell">
                          <strong className={isCompleted ? "reward-cash" : "reward-pending"}>
                            ₹{row.rewardAmount || summary.config?.referrerWalletBonus || 30}
                          </strong>
                          <span className="reward-sub">
                            +{row.rewardPoints || summary.config?.referrerPointsBonus || 50} pts
                          </span>
                        </div>
                      </td>

                      {/* FRIEND BONUS */}
                      <td>
                        <div className="reward-cell">
                          <strong className="friend-cash">
                            ₹{row.friendRewardAmount || summary.config?.friendWalletBonus || 20}
                          </strong>
                          <span className="reward-sub">
                            +{row.friendRewardPoints || summary.config?.friendPointsBonus || 100} pts
                          </span>
                        </div>
                      </td>

                      {/* FIRST ORDER */}
                      <td>
                        {row.firstOrderId ? (
                          <div className="first-order-info">
                            <span className="order-tag">
                              <ShoppingBag size={12} />
                              {row.firstOrderId.orderId ? `#${row.firstOrderId.orderId.slice(-6)}` : "Delivered"}
                            </span>
                            {row.firstOrderId.totalAmount && (
                              <span className="order-amt">₹{row.firstOrderId.totalAmount}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">No orders yet</span>
                        )}
                      </td>

                      {/* DATE */}
                      <td>
                        <span className="date-cell">
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralManagement;


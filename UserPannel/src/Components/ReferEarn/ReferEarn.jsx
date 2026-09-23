import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "./ReferEarn.css";

const ITEMS_PER_PAGE = 4;

// ======================================================
// HELPERS
// ======================================================

const formatDate = (date) => {
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

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "U";

const ReferEarn = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ======================================================
  // BACKEND DATA
  // ======================================================

  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({
    totalReferrals: 0,
    completed: 0,
    pending: 0,
    totalEarned: 0,
  });
  const [referralLink, setReferralLink] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH REFERRAL DATA
  // ======================================================

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your referrals.");
        setReferrals([]);
        return;
      }

      const [listRes, linkRes] = await Promise.all([
        API.get("/referrals/me"),
        API.get("/referrals/link"),
      ]);

      const rawReferrals = listRes.data?.referrals || [];

      const normalized = rawReferrals.map((r) => {
        const referred = r.referred || {};
        const isCompleted = r.status === "completed";

        return {
          id: r._id,
          name: referred.name || "Friend",
          phone: referred.phone || "-",
          joinedOn: formatDate(r.createdAt || r.joinedAt),
          firstOrder: r.firstOrderAt ? formatDate(r.firstOrderAt) : "-",
          status: isCompleted ? "Completed" : "Pending",
          earned: isCompleted ? Number(r.rewardAmount || 0).toFixed(2) : "0.00",
          avatar: referred.avatar || "",
          initials: getInitials(referred.name || "Friend"),
        };
      });

      setReferrals(normalized);
      setSummary(
        listRes.data?.summary || {
          totalReferrals: normalized.length,
          completed: normalized.filter((r) => r.status === "Completed").length,
          pending: normalized.filter((r) => r.status === "Pending").length,
          totalEarned: normalized
            .filter((r) => r.status === "Completed")
            .reduce((s, r) => s + Number(r.earned), 0),
        }
      );

      setReferralLink(linkRes.data?.link || "");
      setReferralCode(linkRes.data?.code || "");
    } catch (err) {
      console.error("Fetch referral data error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
      } else {
        setError(err.response?.data?.message || "Failed to load referral data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================================================
  // COPY HELPERS
  // ======================================================

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    }
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await copyToClipboard(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    await copyToClipboard(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ======================================================
  // SOCIAL SHARE
  // ======================================================

  const handleShare = (platform) => {
    if (!referralCode && !referralLink) {
      alert("Referral data is not ready yet. Please try again.");
      return;
    }

    const shareText = `Join Grocery Sathi using my referral code *${referralCode}* and get exciting rewards! Sign up here: ${referralLink}`;
    const encodedText = encodeURIComponent(shareText);

    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;

      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          referralLink
        )}&quote=${encodeURIComponent(`Use my code: ${referralCode}`)}`;
        break;

      case "instagram":
        copyToClipboard(`${referralCode}\n${referralLink}`);
        alert(
          `Referral code copied!\n\nCode: ${referralCode}\nLink: ${referralLink}\n\nYou can paste it into your Instagram bio, story, or DM.`
        );
        return;

      case "native":
        if (navigator.share) {
          navigator
            .share({
              title: "Grocery Sathi Referral",
              text: `Use my referral code *${referralCode}* to join Grocery Sathi and get rewards!`,
              url: referralLink,
            })
            .catch(() => {});
          return;
        } else {
          handleCopyCode();
          return;
        }

      default:
        break;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.ceil(referrals.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReferrals = referrals.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [referrals.length]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="re-container">
        <div className="re-empty">Loading your referrals…</div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="re-container">
      {/* PAGE HEADER */}
      <div className="re-header">
        <div className="re-header-text">
          <h1 className="re-title">Refer &amp; Earn</h1>
          <p className="re-subtitle">
            Share your code, invite friends, and earn exciting rewards
          </p>
        </div>

        <div className="re-header-illustration">
          <svg viewBox="0 0 200 100" width="160" height="80" fill="none">
            <circle cx="100" cy="50" r="45" fill="#e8f5e9" opacity="0.6" />
            <circle cx="65" cy="38" r="14" fill="#ffcc80" />
            <path d="M53 34 C53 22 77 22 77 34 Z" fill="#263238" />
            <path d="M50 75 C50 54 80 54 80 75 Z" fill="#2e7d32" />
            <rect x="74" y="55" width="8" height="14" rx="2" fill="#212121" />
            <circle cx="135" cy="38" r="14" fill="#ffe0b2" />
            <path d="M121 34 C121 16 149 16 149 34 Z" fill="#37474f" />
            <path d="M120 75 C120 54 150 54 150 75 Z" fill="#ffb300" />
            <rect x="118" y="55" width="8" height="14" rx="2" fill="#212121" />
            <rect x="90" y="48" width="20" height="20" rx="3" fill="#ffb300" />
            <rect x="88" y="43" width="24" height="6" rx="2" fill="#ffa000" />
            <rect x="98" y="43" width="4" height="25" fill="#e53935" />
            <circle cx="97" cy="40" r="3" fill="#e53935" />
            <circle cx="103" cy="40" r="3" fill="#e53935" />
          </svg>
        </div>
      </div>

      {error && <div className="re-empty">{error}</div>}

      {/* TOP 4 STAT CARDS */}
      <div className="re-cards-grid">
        {/* Total Referrals */}
        <div className="re-card">
          <div className="re-card-icon-wrap icon-green">
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Total Referrals</span>
            <h3 className="re-card-value">{summary.totalReferrals}</h3>
            <span className="re-card-sub">Friends joined</span>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="re-card">
          <div className="re-card-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.99 1-1.72V9c0-.73-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" />
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Total Earnings</span>
            <h3 className="re-card-value">
              ₹{Number(summary.totalEarned || 0).toFixed(2)}
            </h3>
            <span className="re-card-sub">All time earnings</span>
          </div>
        </div>

        {/* Pending */}
        <div className="re-card">
          <div className="re-card-icon-wrap icon-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3c-1.28 0-2.37.8-2.82 1.94L12 4.41l-.18-.47A2.996 2.996 0 0 0 9 2a3 3 0 0 0-3 3c0 .35.07.69.18 1H4a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a2 2 0 0 0-2-2zm-11-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM3 14v6a2 2 0 0 0 2 2h6V14H3zm10 8h6a2 2 0 0 0 2-2v-6h-8v8z" />
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Pending Referrals</span>
            <h3 className="re-card-value">{summary.pending}</h3>
            <span className="re-card-sub">Waiting for first order</span>
          </div>
        </div>

        {/* Completed */}
        <div className="re-card">
          <div className="re-card-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Completed</span>
            <h3 className="re-card-value">{summary.completed}</h3>
            <span className="re-card-sub">Rewarded referrals</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          SHARE REFERRAL SECTION
          — CODE IS THE PRIMARY ITEM
      ====================================================== */}

      <div className="re-share-box">
        <div className="re-share-left">
          <h3 className="re-share-title">Your Referral Code</h3>
          <p className="re-share-desc">
            Share this code with friends. They can enter it during registration
            to get a welcome bonus — and you'll earn when they place their first
            order.
          </p>

          {/* CODE DISPLAY */}
          <div className="re-code-display">
            <span className="re-code-label">Referral Code</span>
            <div className="re-code-value-wrap">
              <span className="re-code-value">
                {referralCode || "Generating…"}
              </span>

              <button
                type="button"
                className={`re-code-copy-btn ${copiedCode ? "copied" : ""}`}
                onClick={handleCopyCode}
                disabled={!referralCode}
              >
                {copiedCode ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LINK AS SECONDARY OPTION */}
          {/* <div className="re-link-wrapper">
            <div className="re-link-input-group">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>

              <input
                type="text"
                readOnly
                value={referralLink || "Loading…"}
                className="re-link-input"
              />

              <button
                type="button"
                className={`re-copy-btn ${copiedLink ? "copied" : ""}`}
                onClick={handleCopyLink}
                disabled={!referralLink}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="re-share-divider">or share via</div>

            <div className="re-social-group">
              <div className="re-social-icons">
                <button
                  type="button"
                  className="re-social-btn whatsapp"
                  onClick={() => handleShare("whatsapp")}
                  title="Share on WhatsApp"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 16.66c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="re-social-btn facebook"
                  onClick={() => handleShare("facebook")}
                  title="Share on Facebook"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="re-social-btn instagram"
                  onClick={() => handleShare("instagram")}
                  title="Share on Instagram"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="re-social-btn share"
                  onClick={() => handleShare("native")}
                  title="More share options"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div> */}
        </div>

        {/* Reward Callout Box */}
        <div className="re-reward-badge-card">
          <div className="re-reward-gift-icon">
            <svg viewBox="0 0 80 80" width="60" height="60" fill="none">
              <circle cx="40" cy="40" r="35" fill="#f0fdf4" />
              <rect x="25" y="34" width="30" height="28" rx="4" fill="#22c55e" />
              <rect x="23" y="28" width="34" height="8" rx="3" fill="#16a34a" />
              <rect x="37" y="28" width="6" height="34" fill="#facc15" />
              <circle cx="34" cy="24" r="5" fill="#facc15" />
              <circle cx="46" cy="24" r="5" fill="#facc15" />
              <circle cx="20" cy="58" r="4" fill="#facc15" />
              <circle cx="60" cy="58" r="4" fill="#facc15" />
            </svg>
          </div>
          <div className="re-reward-content">
            <h4 className="re-reward-title">You earn ₹30</h4>
            <p className="re-reward-text">
              When your friend places their first order
            </p>
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="re-content-layout">
        {/* LEFT COLUMN: HOW IT WORKS */}
        <div className="re-how-it-works-box">
          <h3 className="re-section-title">How it Works</h3>

          <div className="re-steps-timeline">
            <div className="re-step-item">
              <div className="re-step-node">
                <div className="re-step-icon icon-green-soft">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </div>
                <div className="re-step-line"></div>
              </div>
              <div className="re-step-details">
                <h4 className="re-step-title">1. Share Your Code</h4>
                <p className="re-step-desc">
                  Share your referral code with friends and family.
                </p>
              </div>
            </div>

            <div className="re-step-item">
              <div className="re-step-node">
                <div className="re-step-icon icon-orange-soft">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <div className="re-step-line"></div>
              </div>
              <div className="re-step-details">
                <h4 className="re-step-title">
                  2. Friend Registers With Your Code
                </h4>
                <p className="re-step-desc">
                  Your friend signs up and enters your code during registration.
                </p>
              </div>
            </div>

            <div className="re-step-item">
              <div className="re-step-node">
                <div className="re-step-icon icon-purple-soft">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="6" y1="4" x2="18" y2="4"></line>
                    <line x1="6" y1="9" x2="18" y2="9"></line>
                    <path d="M6 14h6a4 4 0 0 0 0-8"></path>
                    <line x1="6" y1="9" x2="14" y2="20"></line>
                  </svg>
                </div>
              </div>
              <div className="re-step-details">
                <h4 className="re-step-title">3. You Earn Rewards</h4>
                <p className="re-step-desc">
                  You earn ₹30 instantly once their order is delivered.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROMO + TABLE */}
        <div className="re-right-column">
          {/* PROMO BANNER */}
          <div className="re-promo-banner">
            <div className="re-promo-trophy">
              <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
                <path
                  d="M30 25 H70 V48 C70 60 58 68 50 68 C42 68 30 60 30 48 Z"
                  fill="#ffb300"
                />
                <path
                  d="M36 25 H64 V45 C64 54 55 60 50 60 C45 60 36 54 36 45 Z"
                  fill="#ffd54f"
                />
                <path
                  d="M30 30 H20 C16 30 14 38 18 45 C22 50 28 50 30 50"
                  stroke="#ffb300"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M70 30 H80 C84 30 86 38 82 45 C78 50 72 50 70 50"
                  stroke="#ffb300"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <rect x="46" y="68" width="8" height="12" fill="#ffa000" />
                <rect x="35" y="80" width="30" height="8" rx="2" fill="#37474f" />
                <circle
                  cx="22"
                  cy="74"
                  r="9"
                  fill="#ffca28"
                  stroke="#ffa000"
                  strokeWidth="2"
                />
                <circle
                  cx="78"
                  cy="74"
                  r="9"
                  fill="#ffca28"
                  stroke="#ffa000"
                  strokeWidth="2"
                />
                <text
                  x="50"
                  y="47"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#f57c00"
                >
                  ₹
                </text>
              </svg>
            </div>
            <div className="re-promo-content">
              <h3 className="re-promo-title">Earn More, Save More!</h3>
              <p className="re-promo-desc">
                The more friends you refer, the more you earn. There's no limit!
              </p>
              <button
                type="button"
                className="re-promo-cta"
                onClick={() => handleShare("native")}
              >
                Invite Now
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* REFERRALS TABLE */}
          <div className="re-table-card">
            <div className="re-table-header">
              <h3 className="re-table-title">Your Referrals</h3>
              <button
                type="button"
                className="re-view-all-btn"
                onClick={() => setCurrentPage(1)}
              >
                View All
              </button>
            </div>

            <div className="re-table-container">
              <table className="re-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Joined On</th>
                    <th>First Order</th>
                    <th>Reward Status</th>
                    <th className="text-right">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReferrals.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "24px" }}
                      >
                        You haven't referred anyone yet.
                      </td>
                    </tr>
                  )}

                  {currentReferrals.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="re-user-cell">
                          {row.avatar ? (
                            <img
                              src={row.avatar}
                              alt={row.name}
                              className="re-user-avatar"
                            />
                          ) : (
                            <div
                              className="re-user-avatar"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#e8f5e9",
                                color: "#2e7d32",
                                fontWeight: 700,
                                fontSize: "12px",
                              }}
                            >
                              {row.initials}
                            </div>
                          )}
                          <span className="re-user-name">{row.name}</span>
                        </div>
                      </td>

                      <td className="re-cell-phone">{row.phone}</td>
                      <td className="re-cell-date">{row.joinedOn}</td>
                      <td className="re-cell-date">{row.firstOrder}</td>

                      <td>
                        <span
                          className={`re-status-badge ${row.status.toLowerCase()}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td
                        className={`text-right re-earned-amount ${
                          row.status === "Completed"
                            ? "earned-active"
                            : "earned-zero"
                        }`}
                      >
                        ₹{row.earned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="re-pagination-footer">
              <div className="re-footer-text">
                Showing {referrals.length > 0 ? startIndex + 1 : 0} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, referrals.length)} of{" "}
                {referrals.length} referrals
              </div>

              <div className="re-pagination-controls">
                <button
                  type="button"
                  className="re-page-arrow"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  title="Previous Page"
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
                      className={`re-page-num ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="re-page-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  title="Next Page"
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
      </div>
    </div>
  );
};

export default ReferEarn;
import React, { useState } from 'react';
import './ReferEarn.css';

const INITIAL_REFERRALS = [
  {
    id: 1,
    name: 'Rohit Kumar',
    phone: '+91 98765 43210',
    joinedOn: '12 May 2025',
    firstOrder: '13 May 2025',
    status: 'Completed',
    earned: '30.00',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Neha Patel',
    phone: '+91 91234 56789',
    joinedOn: '10 May 2025',
    firstOrder: '11 May 2025',
    status: 'Completed',
    earned: '30.00',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Vikash Mahato',
    phone: '+91 92345 67890',
    joinedOn: '08 May 2025',
    firstOrder: '-',
    status: 'Pending',
    earned: '0.00',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Anjali Sharma',
    phone: '+91 93456 78901',
    joinedOn: '05 May 2025',
    firstOrder: '06 May 2025',
    status: 'Completed',
    earned: '30.00',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    name: 'Suresh Raina',
    phone: '+91 98111 22334',
    joinedOn: '03 May 2025',
    firstOrder: '04 May 2025',
    status: 'Completed',
    earned: '30.00',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    name: 'Pooja Hegde',
    phone: '+91 97222 33445',
    joinedOn: '01 May 2025',
    firstOrder: '-',
    status: 'Pending',
    earned: '0.00',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 7,
    name: 'Aakash Verma',
    phone: '+91 96333 44556',
    joinedOn: '28 Apr 2025',
    firstOrder: '29 Apr 2025',
    status: 'Completed',
    earned: '30.00',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80'
  },
  {
    id: 8,
    name: 'Deepika Sen',
    phone: '+91 95444 55667',
    joinedOn: '25 Apr 2025',
    firstOrder: '26 Apr 2025',
    status: 'Completed',
    earned: '30.00',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80'
  }
];

const ITEMS_PER_PAGE = 4;
const REFERRAL_LINK = 'https://grocerysathi.com/refer/ARJUN123';

const ReferEarn = () => {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [referrals] = useState(INITIAL_REFERRALS);

  // Copy Link Handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Social Share Handlers
  const handleShare = (platform) => {
    const text = encodeURIComponent(`Join Grocery Sathi using my referral link and get exciting rewards! ${REFERRAL_LINK}`);
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(REFERRAL_LINK)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(REFERRAL_LINK);
        alert('Referral link copied to clipboard! You can share it on Instagram.');
        return;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'Grocery Sathi Referral',
            text: 'Join Grocery Sathi with my referral code!',
            url: REFERRAL_LINK
          }).catch(() => {});
          return;
        } else {
          handleCopyLink();
          return;
        }
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Pagination Logic (4 items per page)
  const totalPages = Math.ceil(referrals.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReferrals = referrals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="re-container">
      {/* PAGE HEADER */}
      <div className="re-header">
        <div className="re-header-text">
          <h1 className="re-title">Refer &amp; Earn</h1>
          <p className="re-subtitle">Invite your friends and earn exciting rewards</p>
        </div>
        <div className="re-header-illustration">
          <svg viewBox="0 0 200 100" width="160" height="80" fill="none">
            <circle cx="100" cy="50" r="45" fill="#e8f5e9" opacity="0.6" />
            {/* Man */}
            <circle cx="65" cy="38" r="14" fill="#ffcc80" />
            <path d="M53 34 C53 22 77 22 77 34 Z" fill="#263238" />
            <path d="M50 75 C50 54 80 54 80 75 Z" fill="#2e7d32" />
            <rect x="74" y="55" width="8" height="14" rx="2" fill="#212121" />
            {/* Woman */}
            <circle cx="135" cy="38" r="14" fill="#ffe0b2" />
            <path d="M121 34 C121 16 149 16 149 34 Z" fill="#37474f" />
            <path d="M120 75 C120 54 150 54 150 75 Z" fill="#ffb300" />
            <rect x="118" y="55" width="8" height="14" rx="2" fill="#212121" />
            {/* Gift Box Center */}
            <rect x="90" y="48" width="20" height="20" rx="3" fill="#ffb300" />
            <rect x="88" y="43" width="24" height="6" rx="2" fill="#ffa000" />
            <rect x="98" y="43" width="4" height="25" fill="#e53935" />
            <circle cx="97" cy="40" r="3" fill="#e53935" />
            <circle cx="103" cy="40" r="3" fill="#e53935" />
          </svg>
        </div>
      </div>

      {/* TOP 4 STAT CARDS */}
      <div className="re-cards-grid">
        <div className="re-card">
          <div className="re-card-icon-wrap icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Total Referrals</span>
            <h3 className="re-card-value">18</h3>
            <span className="re-card-sub">Friends joined</span>
          </div>
        </div>

        <div className="re-card">
          <div className="re-card-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.99 1-1.72V9c0-.73-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Total Earnings</span>
            <h3 className="re-card-value">&#8377;540.00</h3>
            <span className="re-card-sub">All time earnings</span>
          </div>
        </div>

        <div className="re-card">
          <div className="re-card-icon-wrap icon-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3c-1.28 0-2.37.8-2.82 1.94L12 4.41l-.18-.47A2.996 2.996 0 0 0 9 2a3 3 0 0 0-3 3c0 .35.07.69.18 1H4a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a2 2 0 0 0-2-2zm-11-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM3 14v6a2 2 0 0 0 2 2h6V14H3zm10 8h6a2 2 0 0 0 2-2v-6h-8v8z"/>
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Pending Earnings</span>
            <h3 className="re-card-value">&#8377;120.00</h3>
            <span className="re-card-sub">Will be added to wallet</span>
          </div>
        </div>

        <div className="re-card">
          <div className="re-card-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
          </div>
          <div className="re-card-info">
            <span className="re-card-label">Withdrawn Earnings</span>
            <h3 className="re-card-value">&#8377;420.00</h3>
            <span className="re-card-sub">Total withdrawn</span>
          </div>
        </div>
      </div>

      {/* SHARE REFERRAL SECTION */}
      <div className="re-share-box">
        <div className="re-share-left">
          <h3 className="re-share-title">Your Referral Link</h3>
          <p className="re-share-desc">Share your link with friends and earn when they place their first order.</p>

          <div className="re-link-wrapper">
            <div className="re-link-input-group">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input type="text" readOnly value={REFERRAL_LINK} className="re-link-input" />
              <button
                type="button"
                className={`re-copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="re-share-divider">or</div>

            <div className="re-social-group">
              <span className="re-social-label">Share via</span>
              <div className="re-social-icons">
                <button
                  type="button"
                  className="re-social-btn whatsapp"
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 16.66c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className="re-social-btn facebook"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className="re-social-btn instagram"
                  onClick={() => handleShare('instagram')}
                  title="Share on Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className="re-social-btn share"
                  onClick={() => handleShare('native')}
                  title="More share options"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
            <h4 className="re-reward-title">You earn &#8377;30</h4>
            <p className="re-reward-text">When your friend places their first order</p>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: HOW IT WORKS + BANNER & REFERRALS TABLE */}
      <div className="re-content-layout">
        {/* LEFT COLUMN: HOW IT WORKS */}
        <div className="re-how-it-works-box">
          <h3 className="re-section-title">How it Works</h3>

          <div className="re-steps-timeline">
            {/* Step 1 */}
            <div className="re-step-item">
              <div className="re-step-node">
                <div className="re-step-icon icon-green-soft">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <h4 className="re-step-title">1. Share Your Link</h4>
                <p className="re-step-desc">Share your referral link with friends and family.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="re-step-item">
              <div className="re-step-node">
                <div className="re-step-icon icon-orange-soft">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <div className="re-step-line"></div>
              </div>
              <div className="re-step-details">
                <h4 className="re-step-title">2. Friend Places First Order</h4>
                <p className="re-step-desc">Your friend signs up and places their first order.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="re-step-item">
              <div className="re-step-node">
                <div className="re-step-icon icon-purple-soft">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="4" x2="18" y2="4"></line>
                    <line x1="6" y1="9" x2="18" y2="9"></line>
                    <path d="M6 14h6a4 4 0 0 0 0-8"></path>
                    <line x1="6" y1="9" x2="14" y2="20"></line>
                  </svg>
                </div>
              </div>
              <div className="re-step-details">
                <h4 className="re-step-title">3. You Earn Rewards</h4>
                <p className="re-step-desc">You earn &#8377;30 instantly once their order is delivered.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROMO BANNER + TABLE */}
        <div className="re-right-column">
          {/* PROMOTIONAL BANNER */}
          <div className="re-promo-banner">
            <div className="re-promo-trophy">
              <svg viewBox="0 0 100 100" width="90" height="90" fill="none">
                {/* Trophy Cup */}
                <path d="M30 25 H70 V48 C70 60 58 68 50 68 C42 68 30 60 30 48 Z" fill="#ffb300" />
                <path d="M36 25 H64 V45 C64 54 55 60 50 60 C45 60 36 54 36 45 Z" fill="#ffd54f" />
                <path d="M30 30 H20 C16 30 14 38 18 45 C22 50 28 50 30 50" stroke="#ffb300" strokeWidth="4" strokeLinecap="round" />
                <path d="M70 30 H80 C84 30 86 38 82 45 C78 50 72 50 70 50" stroke="#ffb300" strokeWidth="4" strokeLinecap="round" />
                {/* Stem & Base */}
                <rect x="46" y="68" width="8" height="12" fill="#ffa000" />
                <rect x="35" y="80" width="30" height="8" rx="2" fill="#37474f" />
                {/* Coins */}
                <circle cx="22" cy="74" r="9" fill="#ffca28" stroke="#ffa000" strokeWidth="2" />
                <circle cx="78" cy="74" r="9" fill="#ffca28" stroke="#ffa000" strokeWidth="2" />
                {/* Rupee symbol in Trophy */}
                <text x="50" y="47" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f57c00">&#8377;</text>
              </svg>
            </div>
            <div className="re-promo-content">
              <h3 className="re-promo-title">Earn More, Save More!</h3>
              <p className="re-promo-desc">The more friends you refer, the more you earn. There's no limit!</p>
              <button
                type="button"
                className="re-promo-cta"
                onClick={() => handleShare('native')}
              >
                Invite Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* YOUR REFERRALS TABLE */}
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
                  {currentReferrals.map((row) => (
                    <tr key={row.id}>
                      {/* Name + Avatar */}
                      <td>
                        <div className="re-user-cell">
                          <img src={row.avatar} alt={row.name} className="re-user-avatar" />
                          <span className="re-user-name">{row.name}</span>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="re-cell-phone">{row.phone}</td>

                      {/* Joined On */}
                      <td className="re-cell-date">{row.joinedOn}</td>

                      {/* First Order */}
                      <td className="re-cell-date">{row.firstOrder}</td>

                      {/* Status */}
                      <td>
                        <span className={`re-status-badge ${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>

                      {/* Earned */}
                      <td className={`text-right re-earned-amount ${row.status === 'Completed' ? 'earned-active' : 'earned-zero'}`}>
                        &#8377;{row.earned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER (4 items per page) */}
            <div className="re-pagination-footer">
              <div className="re-footer-text">
                Showing {referrals.length > 0 ? startIndex + 1 : 0} to{' '}
                {Math.min(startIndex + ITEMS_PER_PAGE, referrals.length)} of{' '}
                {referrals.length} referrals
              </div>

              <div className="re-pagination-controls">
                <button
                  type="button"
                  className="re-page-arrow"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  title="Previous Page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`re-page-num ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="re-page-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  title="Next Page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
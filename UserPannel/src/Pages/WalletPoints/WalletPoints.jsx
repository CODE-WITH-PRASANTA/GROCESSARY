import React, { useState } from 'react';
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
  FaTimes 
} from 'react-icons/fa';
import './WalletPoints.css';

const WalletPoints = () => {
  const [balance, setBalance] = useState(1250.00);
  const [rewardPoints, setRewardPoints] = useState(850);

  // Modal State
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('UPI - PhonePe');

  // Sample data matching the reference image exactly
  const [walletTransactions, setWalletTransactions] = useState([
    {
      id: 1,
      type: 'Added Money',
      subtext: 'Via UPI - PhonePe',
      date: '25 May 2026, 10:30 AM',
      amount: '+ ₹500.00',
      status: 'Success',
      isCredit: true,
      icon: <FaPlusCircle />
    },
    {
      id: 2,
      type: 'Order Payment',
      subtext: 'Order #FM12548',
      date: '24 May 2026, 07:45 PM',
      amount: '- ₹349.00',
      status: 'Success',
      isCredit: false,
      icon: <FaShoppingBag />
    },
    {
      id: 3,
      type: 'Cashback Received',
      subtext: 'Order #FM12520',
      date: '22 May 2026, 06:20 PM',
      amount: '+ ₹50.00',
      status: 'Success',
      isCredit: true,
      icon: <FaReceipt />
    },
    {
      id: 4,
      type: 'Money Sent to Bank',
      subtext: 'To HDFC Bank •••• 4321',
      date: '20 May 2026, 11:15 AM',
      amount: '- ₹300.00',
      status: 'Success',
      isCredit: false,
      icon: <FaUniversity />
    },
    {
      id: 5,
      type: 'Added Money',
      subtext: 'Via UPI - Google Pay',
      date: '18 May 2026, 09:40 AM',
      amount: '+ ₹300.00',
      status: 'Success',
      isCredit: true,
      icon: <FaPlusCircle />
    }
  ]);

  const pointsActivity = [
    {
      id: 1,
      title: 'Points Earned',
      subtext: 'Order #FM12548',
      date: '24 May 2026',
      points: '+150 pts',
      isCredit: true
    },
    {
      id: 2,
      title: 'Points Used',
      subtext: 'Order Discount',
      date: '22 May 2026',
      points: '-100 pts',
      isCredit: false
    },
    {
      id: 3,
      title: 'Points Earned',
      subtext: 'Order #FM12520',
      date: '20 May 2026',
      points: '+120 pts',
      isCredit: true
    },
    {
      id: 4,
      title: 'Welcome Bonus',
      subtext: 'Account Created',
      date: '15 May 2026',
      points: '+200 pts',
      isCredit: true
    }
  ];

  const handleOpenModal = () => setIsAddMoneyOpen(true);
  const handleCloseModal = () => {
    setIsAddMoneyOpen(false);
    setAddAmount('');
  };

  const handleQuickAdd = (value) => {
    setAddAmount((prev) => (Number(prev || 0) + value).toString());
  };

  const handleConfirmAddMoney = (e) => {
    e.preventDefault();
    const numValue = parseFloat(addAmount);
    if (isNaN(numValue) || numValue <= 0) return;

    // Update balance
    setBalance((prev) => prev + numValue);

    // Add new transaction log
    const newTxn = {
      id: Date.now(),
      type: 'Added Money',
      subtext: `Via ${selectedMethod}`,
      date: 'Just Now',
      amount: `+ ₹${numValue.toFixed(2)}`,
      status: 'Success',
      isCredit: true,
      icon: <FaPlusCircle />
    };

    setWalletTransactions([newTxn, ...walletTransactions]);
    handleCloseModal();
  };

  const handleSendToBank = () => alert('Send to Bank action triggered!');
  const handleVouchers = () => alert('My Vouchers opened!');
  const handlePointsHistory = () => alert('Navigating to Points History!');
  const handleShopNow = () => alert('Redirecting to Shop!');

  return (
    <div className="WalletPoints-container">
      {/* Top Cards Section */}
      <div className="WalletPoints-top-grid">
        {/* Wallet Balance Card */}
        <div className="WalletPoints-card WalletPoints-balance-card">
          <div className="WalletPoints-card-header">
            <div className="WalletPoints-icon-wrapper green-bg">
              <FaWallet className="WalletPoints-icon green-text" />
            </div>
            <div className="WalletPoints-title-group">
              <span className="WalletPoints-card-label">Wallet Balance</span>
              <h2 className="WalletPoints-balance-amount">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
          <div className="WalletPoints-card-footer">
            <span className="WalletPoints-badge green-badge">Total Balance</span>
            <button className="WalletPoints-btn-primary" onClick={handleOpenModal}>
              <FaPlusCircle /> Add Money
            </button>
          </div>
        </div>

        {/* Reward Points Card */}
        <div className="WalletPoints-card WalletPoints-points-card">
          <div className="WalletPoints-card-header">
            <div className="WalletPoints-icon-wrapper orange-bg">
              <FaStar className="WalletPoints-icon orange-text" />
            </div>
            <div className="WalletPoints-title-group">
              <span className="WalletPoints-card-label">Reward Points</span>
              <h2 className="WalletPoints-points-amount">
                {rewardPoints} <span className="WalletPoints-pts-unit">pts</span>
              </h2>
            </div>
          </div>
          <div className="WalletPoints-card-footer">
            <span className="WalletPoints-badge orange-badge">Available Points</span>
            <button className="WalletPoints-btn-secondary" onClick={() => alert('Earn Points Information')}>
              <FaGift /> How to Earn Points
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar Section */}
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

      {/* Main Content Grid */}
      <div className="WalletPoints-main-grid">
        {/* Left Column: Recent Wallet Transactions */}
        <div className="WalletPoints-card WalletPoints-transactions-card">
          <div className="WalletPoints-section-header">
            <div className="WalletPoints-header-left">
              <FaReceipt className="WalletPoints-section-icon green-text" />
              <h3>Recent Wallet Transactions</h3>
            </div>
            <button className="WalletPoints-link-btn" onClick={() => alert('View All Transactions')}>
              View All <FaArrowRight />
            </button>
          </div>

          <div className="WalletPoints-list">
            {walletTransactions.map((item) => (
              <div key={item.id} className="WalletPoints-list-item">
                <div className="WalletPoints-item-left">
                  <div className={`WalletPoints-item-icon ${item.isCredit ? 'blue-bg-light blue-text' : 'pink-bg-light pink-text'}`}>
                    {item.icon}
                  </div>
                  <div className="WalletPoints-item-details">
                    <h4>{item.type}</h4>
                    <p className="WalletPoints-subtext">{item.subtext}</p>
                    <span className="WalletPoints-date">{item.date}</span>
                  </div>
                </div>
                <div className="WalletPoints-item-right">
                  <span className={`WalletPoints-amount ${item.isCredit ? 'credit' : 'debit'}`}>
                    {item.amount}
                  </span>
                  <span className="WalletPoints-status">{item.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="WalletPoints-center-btn">
            <button className="WalletPoints-link-btn bold" onClick={() => alert('View All Transactions')}>
              View All Transactions <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Right Column: Points Summary & Recent Activity */}
        <div className="WalletPoints-right-column">
          {/* Points Summary Card */}
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
                  <strong>1,250 pts</strong>
                </div>
                <div className="WalletPoints-summary-row">
                  <span>Total Points Used</span>
                  <strong>400 pts</strong>
                </div>
                <div className="WalletPoints-summary-row">
                  <span>Available Points</span>
                  <strong className="orange-text">850 pts</strong>
                </div>
              </div>
              <div className="WalletPoints-trophy-illustration">🏆</div>
            </div>
          </div>

          {/* Recent Points Activity Card */}
          <div className="WalletPoints-card WalletPoints-activity-card">
            <div className="WalletPoints-section-header">
              <div className="WalletPoints-header-left">
                <FaReceipt className="WalletPoints-section-icon green-text" />
                <h3>Recent Points Activity</h3>
              </div>
              <button className="WalletPoints-link-btn" onClick={() => alert('View All Points Activity')}>
                View All <FaArrowRight />
              </button>
            </div>

            <div className="WalletPoints-list">
              {pointsActivity.map((act) => (
                <div key={act.id} className="WalletPoints-list-item">
                  <div className="WalletPoints-item-left">
                    <div className="WalletPoints-item-icon orange-bg-light orange-text">
                      <FaStar />
                    </div>
                    <div className="WalletPoints-item-details">
                      <h4>{act.title}</h4>
                      <p className="WalletPoints-subtext">{act.subtext}</p>
                    </div>
                  </div>
                  <div className="WalletPoints-item-right">
                    <span className={`WalletPoints-amount ${act.isCredit ? 'credit' : 'debit'}`}>
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

      {/* Bottom Promo Banner */}
      <div className="WalletPoints-promo-banner">
        <div className="WalletPoints-promo-left">
          <div className="WalletPoints-promo-icon">👛</div>
          <div className="WalletPoints-promo-text">
            <h3>Use your wallet balance for faster checkout!</h3>
            <p>Your wallet balance can be used to pay for orders, get exclusive discounts and much more.</p>
          </div>
        </div>
        <button className="WalletPoints-btn-shop" onClick={handleShopNow}>
          Shop Now
        </button>
      </div>

      {/* Smooth Add Money Modal */}
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
                  <button type="button" onClick={() => handleQuickAdd(100)}>+ ₹100</button>
                  <button type="button" onClick={() => handleQuickAdd(200)}>+ ₹200</button>
                  <button type="button" onClick={() => handleQuickAdd(500)}>+ ₹500</button>
                  <button type="button" onClick={() => handleQuickAdd(1000)}>+ ₹1000</button>
                </div>

                <label className="input-label" style={{ marginTop: '16px' }}>Select Payment Method</label>
                <select
                  className="modal-select"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  <option value="UPI - PhonePe">UPI - PhonePe</option>
                  <option value="UPI - Google Pay">UPI - Google Pay</option>
                  <option value="UPI - Paytm">UPI - Paytm</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="WalletPoints-btn-primary">
                  Proceed to Pay
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
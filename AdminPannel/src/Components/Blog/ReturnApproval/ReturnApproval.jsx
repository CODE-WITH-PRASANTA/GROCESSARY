import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ReturnApproval.css';

const ReturnApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const returnData = location.state?.returnData || {
    id: 'RET-2026-00124',
    orderId: 'ORD-2026-08765',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    product: { name: 'Amul Fresh Milk 1L', qty: 2 },
    reason: 'Damaged Product',
    amount: '₹120.00',
  };

  const [activeAction, setActiveAction] = useState(null);

  const handleActionClick = (actionName) => {
    setActiveAction(actionName);
    alert(`Successfully applied "${actionName}" for Return ID: ${returnData.id}`);
  };

  return (
    <div className="ReturnApproval-container">
      {/* Header & Back Navigation */}
      <div className="ReturnApproval-header">
        <button type="button" className="ReturnApproval-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
        <h2 className="ReturnApproval-page-title">Approval Dashboard</h2>
      </div>

      {/* Summary Card */}
      <div className="ReturnApproval-summary-card">
        <div className="ReturnApproval-summary-grid">
          <div>
            <span className="ReturnApproval-label">Return ID</span>
            <span className="ReturnApproval-value ReturnApproval-text-green">{returnData.id}</span>
          </div>
          <div>
            <span className="ReturnApproval-label">Order ID</span>
            <span className="ReturnApproval-value">{returnData.orderId}</span>
          </div>
          <div>
            <span className="ReturnApproval-label">Customer</span>
            <span className="ReturnApproval-value">{returnData.customer.name}</span>
          </div>
          <div>
            <span className="ReturnApproval-label">Product</span>
            <span className="ReturnApproval-value">{returnData.product.name} (x{returnData.product.qty})</span>
          </div>
          <div>
            <span className="ReturnApproval-label">Reason</span>
            <span className="ReturnApproval-value">{returnData.reason}</span>
          </div>
          <div>
            <span className="ReturnApproval-label">Refund Amount</span>
            <span className="ReturnApproval-value ReturnApproval-font-bold">{returnData.amount}</span>
          </div>
        </div>
      </div>

      {/* Main Approval Action Panel */}
      <div className="ReturnApproval-card">
        <div className="ReturnApproval-title-wrapper">
          <h3 className="ReturnApproval-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Return Approval & Resolution
          </h3>
          <span className="ReturnApproval-id-badge">{returnData.id}</span>
        </div>
        
        <div className="ReturnApproval-grid">
          {/* Row 1: Primary Decision Actions */}
          <div className="ReturnApproval-row ReturnApproval-row-primary">
            <button 
              className={`ReturnApproval-action-btn ReturnApproval-btn-approve ${activeAction === 'Approve Return' ? 'active' : ''}`}
              onClick={() => handleActionClick('Approve Return')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Approve Return
            </button>
            <button 
              className={`ReturnApproval-action-btn ReturnApproval-btn-reject ${activeAction === 'Reject Return' ? 'active' : ''}`}
              onClick={() => handleActionClick('Reject Return')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Reject Return
            </button>
            <button 
              className={`ReturnApproval-action-btn ReturnApproval-btn-info ${activeAction === 'Need More Info' ? 'active' : ''}`}
              onClick={() => handleActionClick('Need More Info')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Need More Info
            </button>
          </div>
          
          {/* Row 2: Secondary Resolution Actions */}
          <div className="ReturnApproval-row">
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Pickup Required' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Pickup Required')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              Pickup Required
            </button>
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Replacement' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Replacement')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
              Replacement
            </button>
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Refund Required' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Refund Required')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Refund Required
            </button>
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Exchange' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Exchange')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="14" x2="21" y2="3"></line><polyline points="8 21 3 21 3 16"></polyline><line x1="20" y1="10" x2="3" y2="21"></line></svg>
              Exchange
            </button>
          </div>

          {/* Row 3: Product Disposition Actions */}
          <div className="ReturnApproval-row">
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Restock Inventory' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Restock Inventory')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              Restock Inventory
            </button>
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Destroy Product' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Destroy Product')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Destroy Product
            </button>
            <button className={`ReturnApproval-action-btn ReturnApproval-btn-secondary ${activeAction === 'Repair Product' ? 'active-secondary' : ''}`} onClick={() => handleActionClick('Repair Product')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              Repair Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnApproval;
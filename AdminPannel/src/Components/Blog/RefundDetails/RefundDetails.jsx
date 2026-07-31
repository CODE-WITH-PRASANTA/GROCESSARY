import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './RefundDetails.css';

const RefundDetails = ({ returnIdProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeParamId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const targetReturnId = returnIdProp || location.state?.returnData?.id || routeParamId || 'RET-2026-00124';

  useEffect(() => {
    const fetchRefundDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Optimistic load from Router State
        const passedData = location.state?.returnData;
        if (passedData && passedData.id === targetReturnId) {
          setData({
            paymentMethod: passedData.paymentMethod || 'UPI / GPay',
            originalAmount: passedData.amount || '₹120.00',
            discount: passedData.discount || '₹0.00',
            tax: passedData.tax || '₹0.00',
            shipping: passedData.shipping || '₹0.00',
            refundAmount: passedData.amount || '₹120.00',
            refundMode: passedData.refundMode || 'Original Payment Source',
            refundDate: passedData.refundDate || 'Processing...',
            transactionId: passedData.transactionId || 'Pending Generation',
            refundStatus: passedData.status || 'Pending',
            statusClass: passedData.statusClass || 'pending',
          });
          setLoading(false);
          return;
        }

        // 2. Mock API Fallback (Simulates backend response)
        setTimeout(() => {
          setData({
            paymentMethod: 'Credit Card (ends in 4242)',
            originalAmount: '₹850.00',
            discount: '-₹50.00',
            tax: '₹42.50',
            shipping: '₹0.00',
            refundAmount: '₹842.50',
            refundMode: 'Original Payment Source',
            refundDate: '21 May 2026, 02:15 PM',
            transactionId: 'TXN-9876543210ABC',
            refundStatus: 'Refund Processed',
            statusClass: 'completed',
          });
          setLoading(false);
        }, 500);

      } catch (err) {
        setError('Unable to retrieve refund details. Please try again.');
        setLoading(false);
      }
    };

    fetchRefundDetails();
  }, [targetReturnId, location.state]);

  const handleDownload = () => {
    alert(`Downloading refund receipt for ${targetReturnId}...`);
  };

  if (loading) return <div className="RefundDetails-container"><div className="RefundDetails-loader">Loading refund details...</div></div>;
  
  if (error) return (
    <div className="RefundDetails-container">
      <button type="button" className="RefundDetails-back-btn" onClick={() => navigate(-1)}>← Back to Returns</button>
      <div className="RefundDetails-error-card"><h3>Error</h3><p>{error}</p></div>
    </div>
  );

  return (
    <div className="RefundDetails-container">
      {/* Header Navigation */}
      <div className="RefundDetails-header">
        <button type="button" className="RefundDetails-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      {/* Main Card */}
      <div className="RefundDetails-card">
        
        {/* Title Header */}
        <div className="RefundDetails-title-wrapper">
          <h2 className="RefundDetails-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Refund Details
          </h2>
          <span className="RefundDetails-id-badge">{targetReturnId}</span>
        </div>

        {/* Content Structure */}
        <div className="RefundDetails-content">
          
          {/* Row 1 */}
          <div className="RefundDetails-row">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label">Payment Method</span>
              <span className="RefundDetails-val RefundDetails-font-semibold">{data.paymentMethod}</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className="RefundDetails-label">Original Amount</span>
              <span className="RefundDetails-val RefundDetails-font-medium">{data.originalAmount}</span>
            </div>
          </div>

          {/* Row 2: Breakdown Grid */}
          <div className="RefundDetails-breakdown-grid">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label">Discount</span>
              <span className="RefundDetails-val RefundDetails-muted">{data.discount}</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-center">
              <span className="RefundDetails-label">Tax</span>
              <span className="RefundDetails-val RefundDetails-muted">{data.tax}</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className="RefundDetails-label">Shipping</span>
              <span className="RefundDetails-val RefundDetails-muted">{data.shipping}</span>
            </div>
          </div>

          {/* Row 3: Highlighted Refund Amount */}
          <div className="RefundDetails-highlight-box">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label RefundDetails-font-medium">Total Refund Amount</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className="RefundDetails-amount-large">{data.refundAmount}</span>
            </div>
          </div>

          {/* Remaining Details */}
          <div className="RefundDetails-row">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label">Refund Mode</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className="RefundDetails-val RefundDetails-font-medium">{data.refundMode}</span>
            </div>
          </div>

          <div className="RefundDetails-row">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label">Refund Date</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className="RefundDetails-val">{data.refundDate}</span>
            </div>
          </div>

          <div className="RefundDetails-row">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label">Transaction ID</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className="RefundDetails-val RefundDetails-font-mono">{data.transactionId}</span>
            </div>
          </div>

          <div className="RefundDetails-row RefundDetails-align-center">
            <div className="RefundDetails-col">
              <span className="RefundDetails-label">Refund Status</span>
            </div>
            <div className="RefundDetails-col RefundDetails-text-right">
              <span className={`RefundDetails-badge RefundDetails-badge-${data.statusClass}`}>
                <span className="RefundDetails-badge-dot"></span> {data.refundStatus}
              </span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="RefundDetails-actions">
           <button className="RefundDetails-submit-btn" onClick={handleDownload}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
             Download Receipt
           </button>
        </div>
      </div>
    </div>
  );
};

export default RefundDetails;
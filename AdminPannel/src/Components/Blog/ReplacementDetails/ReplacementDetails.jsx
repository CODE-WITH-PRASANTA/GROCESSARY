import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ReplacementDetails.css';

const ReplacementDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const passedData = location.state?.returnData;

    if (passedData) {
      // Use passed data
      setDetails({
        returnId: passedData.id,
        orderId: passedData.orderId,
        status: passedData.status,
        statusClass: passedData.statusClass || 'pending',
        productName: passedData.product?.name || 'Unknown Product',
        customerName: passedData.customer?.name || 'Unknown Customer',
        dispatchDate: passedData.status === 'Pickup Scheduled' ? '21 May 2026' : 'Pending Allocation',
        courier: passedData.status === 'Pickup Scheduled' ? 'BlueDart Express' : 'Pending',
        trackingNumber: passedData.status === 'Pickup Scheduled' ? 'BD987654321IN' : 'N/A',
        estimatedDelivery: passedData.status === 'Pickup Scheduled' ? '24 May 2026' : 'N/A',
        deliveredDate: '-',
      });
      setLoading(false);
    } else {
      // Mock API Fallback if accessed directly (prevents hard crash)
      setTimeout(() => {
        setDetails({
          returnId: 'RET-2026-MOCK',
          orderId: 'ORD-2026-MOCK',
          status: 'Dispatched',
          statusClass: 'scheduled',
          productName: 'Amul Fresh Milk 1L',
          customerName: 'Rahul Sharma',
          dispatchDate: '21 May 2026',
          courier: 'Delhivery',
          trackingNumber: 'DLV1234567890',
          estimatedDelivery: '23 May 2026',
          deliveredDate: '-',
        });
        setLoading(false);
      }, 500);
    }
  }, [location.state]);

  const handleTrackShipment = () => {
    if (details.trackingNumber === 'N/A') {
      alert('Tracking number is not available yet.');
    } else {
      alert(`Redirecting to courier tracking for ${details.trackingNumber}...`);
    }
  };

  if (loading) {
    return <div className="ReplacementDetails-container"><div className="ReplacementDetails-loader">Loading replacement details...</div></div>;
  }

  return (
    <div className="ReplacementDetails-container">
      {/* Header & Back Navigation */}
      <div className="ReplacementDetails-header">
        <button type="button" className="ReplacementDetails-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      {/* Main Replacement Details Section */}
      <div className="ReplacementDetails-section">
        
        <div className="ReplacementDetails-title-wrapper">
          <h3 className="ReplacementDetails-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Replacement Details
          </h3>
          <span className="ReplacementDetails-id-badge">{details.returnId}</span>
        </div>
        
        <div className="ReplacementDetails-card">
          <div className="ReplacementDetails-grid">
            
            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Customer Name</span>
              <span className="ReplacementDetails-value">{details.customerName}</span>
            </div>

            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Product Name</span>
              <span className="ReplacementDetails-value">{details.productName}</span>
            </div>

            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Original Order ID</span>
              <span className="ReplacementDetails-value ReplacementDetails-font-mono ReplacementDetails-font-bold text-dark">{details.orderId}</span>
            </div>
            
            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Replacement Status</span>
              <span className={`ReplacementDetails-status-badge badge-${details.statusClass}`}>
                {details.status}
              </span>
            </div>
            
            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Dispatch Date</span>
              <span className="ReplacementDetails-value">{details.dispatchDate}</span>
            </div>
            
            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Courier</span>
              <span className="ReplacementDetails-value">{details.courier}</span>
            </div>
            
            <div className="ReplacementDetails-field ReplacementDetails-tracking-highlight">
              <span className="ReplacementDetails-label">Tracking Number</span>
              <span className="ReplacementDetails-value ReplacementDetails-font-bold ReplacementDetails-text-blue">{details.trackingNumber}</span>
            </div>
            
            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Estimated Delivery</span>
              <span className="ReplacementDetails-value">{details.estimatedDelivery}</span>
            </div>
            
            <div className="ReplacementDetails-field">
              <span className="ReplacementDetails-label">Delivered Date</span>
              <span className="ReplacementDetails-value ReplacementDetails-muted">{details.deliveredDate}</span>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="ReplacementDetails-actions">
           <button 
             className="ReplacementDetails-submit-btn" 
             onClick={handleTrackShipment}
             disabled={details.trackingNumber === 'N/A'}
           >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
             Track Shipment
           </button>
        </div>

      </div>
    </div>
  );
};

export default ReplacementDetails;
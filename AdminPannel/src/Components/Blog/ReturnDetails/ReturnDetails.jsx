import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './ReturnDetails.css';

const ReturnDetails = ({ returnIdProp, onUpdateAssignedTo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeParamId } = useParams();

  const targetReturnId = 
    returnIdProp || 
    location.state?.returnData?.id || 
    routeParamId || 
    'RET-2026-00124';

  const passedData = location.state?.returnData;

  const [loading, setLoading] = useState(!passedData);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(() => {
    if (passedData && passedData.id === targetReturnId) {
      return {
        returnId: passedData.id,
        orderId: passedData.orderId,
        orderDate: passedData.orderDate || '18 May 2026',
        returnDate: `${passedData.date} ${passedData.time || ''}`.trim(),
        customerName: passedData.customer?.name,
        phoneNumber: passedData.customer?.phone,
        emailAddress: passedData.customer?.email,
        deliveryAddress: passedData.deliveryAddress || '123, Civil Lines, Near Central Mall, New Delhi - 110001',
        pickupAddress: passedData.pickupAddress || 'Same as Delivery Address',
        assignedTo: passedData.assignedTo,
      };
    }
    return null;
  });

  const [assignedTo, setAssignedTo] = useState(() => passedData?.assignedTo || 'Neha Verma');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (details) return;

    const fetchReturnDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        setTimeout(() => {
          const mockFetchedData = {
            returnId: targetReturnId,
            orderId: 'ORD-2026-08765',
            orderDate: '18 May 2026',
            returnDate: '20 May 2026, 10:20 AM',
            customerName: 'Rahul Sharma',
            phoneNumber: '9876543210',
            emailAddress: 'rahul@example.com',
            deliveryAddress: '123, Civil Lines, New Delhi - 110001',
            pickupAddress: 'Same as Delivery Address',
            assignedTo: 'Neha Verma',
          };
          setDetails(mockFetchedData);
          setAssignedTo(mockFetchedData.assignedTo);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Return details could not be found.');
        setLoading(false);
      }
    };

    fetchReturnDetails();
  }, [targetReturnId, details]);

  const handleAssignmentChange = async (e) => {
    const newAgent = e.target.value;
    const previousAgent = assignedTo;
    
    setAssignedTo(newAgent);
    setIsUpdating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (onUpdateAssignedTo) {
        onUpdateAssignedTo(details.returnId, newAgent);
      }

      setToastMessage(`Successfully assigned to ${newAgent}`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      setAssignedTo(previousAgent);
      alert('Failed to update assignment on server. Reverting changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="ReturnDetails-container"><div className="ReturnDetails-loader">Loading return details...</div></div>;
  }

  if (error || !details) {
    return (
      <div className="ReturnDetails-container">
        <button type="button" className="ReturnDetails-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
        <div className="ReturnDetails-error-card">
          <h3>Error Loading Details</h3>
          <p>{error || 'Return details could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ReturnDetails-container">
      {toastMessage && <div className="ReturnDetails-toast">{toastMessage}</div>}

      <div className="ReturnDetails-header">
        <button type="button" className="ReturnDetails-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      <div className="ReturnDetails-card">
        <div className="ReturnDetails-title-wrapper">
          <div className="ReturnDetails-title-main">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2 className="ReturnDetails-title">Return Details</h2>
          </div>
          <span className="ReturnDetails-id-badge">{details.returnId}</span>
        </div>

        <div className="ReturnDetails-content">
          <h3 className="ReturnDetails-section-title">Case Information</h3>

          <div className="ReturnDetails-grid">
            <div className="ReturnDetails-label">Return ID</div>
            <div className="ReturnDetails-value ReturnDetails-font-mono ReturnDetails-text-green">{details.returnId}</div>

            <div className="ReturnDetails-label">Order ID</div>
            <div className="ReturnDetails-value ReturnDetails-font-mono ReturnDetails-text-blue">{details.orderId}</div>

            <div className="ReturnDetails-label">Order Date</div>
            <div className="ReturnDetails-value">{details.orderDate}</div>

            <div className="ReturnDetails-label">Return Date</div>
            <div className="ReturnDetails-value">{details.returnDate}</div>

            <div className="ReturnDetails-label">Customer Name</div>
            <div className="ReturnDetails-value ReturnDetails-font-bold">{details.customerName}</div>

            <div className="ReturnDetails-label">Phone Number</div>
            <div className="ReturnDetails-value">{details.phoneNumber}</div>

            <div className="ReturnDetails-label">Email Address</div>
            <div className="ReturnDetails-value">{details.emailAddress}</div>

            <div className="ReturnDetails-label">Delivery Address</div>
            <div className="ReturnDetails-value">{details.deliveryAddress}</div>

            <div className="ReturnDetails-label">Pickup Address</div>
            <div className="ReturnDetails-value">{details.pickupAddress}</div>

            <div className="ReturnDetails-label">Assigned To</div>
            <div className="ReturnDetails-value">
              <div className="ReturnDetails-select-wrapper">
                <select
                  className="ReturnDetails-select"
                  value={assignedTo}
                  onChange={handleAssignmentChange}
                  disabled={isUpdating}
                >
                  <option value="Neha Verma">Neha Verma</option>
                  <option value="Amit Kumar">Amit Kumar</option>
                  <option value="Rohit Das">Rohit Das</option>
                </select>
                {isUpdating && <span className="ReturnDetails-spinner"></span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetails;
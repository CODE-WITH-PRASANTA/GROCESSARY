import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PickupManagement.css';

const PickupManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedData = location.state?.returnData;

  const [formData, setFormData] = useState({
    partner: '',
    date: '',
    time: '10:00 AM - 12:00 PM',
    tracking: '',
    driverName: '',
    driverContact: '',
    otp: ''
  });

  useEffect(() => {
    if (passedData) {
      if (passedData.status === 'Pickup Scheduled') {
        setFormData({
          partner: 'Delhivery',
          date: '2026-05-21',
          time: '10:00 AM - 12:00 PM',
          tracking: 'DLV123456789',
          driverName: 'Sandeep Kumar',
          driverContact: '9812345678',
          otp: '7291'
        });
      } else {
        setFormData(prev => ({
          ...prev,
          partner: 'Pending Assignment',
          date: '', 
          tracking: 'Pending'
        }));
      }
    }
  }, [passedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Mock save functionality
    alert(`Pickup details updated successfully for ${passedData.id}!`);
    navigate(-1);
  };

  if (!passedData) {
    return (
      <div className="PickupManagement-container">
        <button type="button" className="PickupManagement-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
        <div className="PickupManagement-error-card">
          <h3>No Data Found</h3>
          <p>Please select a return record from the Return Management table first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="PickupManagement-container">
      <div className="PickupManagement-header">
        <button type="button" className="PickupManagement-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      <div className="PickupManagement-section">
        <div className="PickupManagement-card-header">
          <h3 className="PickupManagement-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Pickup Management
          </h3>
          <span className="PickupManagement-id-badge">{passedData.id}</span>
        </div>
        
        <div className="PickupManagement-card">
          {/* Top Row */}
          <div className="PickupManagement-grid-top">
            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Pickup Partner</label>
              <input 
                type="text" 
                name="partner"
                className="PickupManagement-input" 
                value={formData.partner}
                onChange={handleChange}
                placeholder="e.g. Delhivery"
              />
            </div>

            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Pickup Date</label>
              <input 
                type="date" 
                name="date"
                className="PickupManagement-input" 
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Pickup Time</label>
              <select 
                name="time"
                className="PickupManagement-input PickupManagement-select" 
                value={formData.time}
                onChange={handleChange}
              >
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="PickupManagement-grid-bottom">
            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Tracking Number</label>
              <input 
                type="text" 
                name="tracking"
                className="PickupManagement-input" 
                value={formData.tracking}
                onChange={handleChange}
                placeholder="Enter tracking ID"
              />
            </div>

            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Driver Name</label>
              <input 
                type="text" 
                name="driverName"
                className="PickupManagement-input" 
                value={formData.driverName}
                onChange={handleChange}
                placeholder="Name of executive"
              />
            </div>

            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Driver Contact</label>
              <input 
                type="tel" 
                name="driverContact"
                className="PickupManagement-input" 
                value={formData.driverContact}
                onChange={handleChange}
                placeholder="10-digit number"
              />
            </div>

            <div className="PickupManagement-field">
              <label className="PickupManagement-label">Pickup OTP</label>
              <input 
                type="text" 
                name="otp"
                className="PickupManagement-input" 
                value={formData.otp}
                onChange={handleChange}
                placeholder="4-digit PIN"
                maxLength="6"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="PickupManagement-actions">
          <button type="button" className="PickupManagement-submit-btn" onClick={handleSave}>
            Save / Update Pickup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupManagement;
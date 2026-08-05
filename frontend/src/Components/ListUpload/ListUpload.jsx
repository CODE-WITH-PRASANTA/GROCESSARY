import React, { useState } from 'react';
import './ListUpload.css';
import {
  HiDocumentText,
  HiPhone,
  HiLocationMarker,
  HiUpload,
  HiShieldCheck,
  HiPaperAirplane,
  HiX,
  HiCheck,
  HiClock,
  HiSupport,
  HiDownload,
  HiTruck,
  HiCube,
  HiSearch
} from 'react-icons/hi';

const ListUpload = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    listName: '',
    FullName: '',
    countryCode: '+91',
    phoneNumber: '',
    deliveryAddress: '',
    uploadedFile: null,
  });

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Handle standard inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, uploadedFile: e.target.files[0] }));
    }
  };

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({ ...prev, uploadedFile: e.dataTransfer.files[0] }));
    }
  };

  // Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setFormData((prev) => ({ ...prev, deliveryAddress: data.display_name }));
          } else {
            setFormData((prev) => ({ ...prev, deliveryAddress: `Lat: ${latitude}, Lon: ${longitude}` }));
          }
        } catch (error) {
          setFormData((prev) => ({ ...prev, deliveryAddress: `Lat: ${latitude}, Lon: ${longitude}` }));
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        alert('Unable to retrieve your location');
        setLoadingLocation(false);
      }
    );
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.listName || !formData.FullName || !formData.phoneNumber || !formData.deliveryAddress || !formData.uploadedFile) {
      alert('Please fill out all required fields and upload a list.');
      return;
    }

    const randomReceipt = Math.floor(100000 + Math.random() * 900000);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const submissionData = {
      ...formData,
      orderId: `GS-240804-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNo: `#${randomReceipt}`,
      orderDate: formattedDate,
    };

    setOrderDetails(submissionData);
    setIsSubmitted(true);

    if (onSubmit) {
      onSubmit(submissionData);
    }
  };

  if (isSubmitted && orderDetails) {
    return (
      <div className="listupload-overlay">
        <div className="listupload-card success-view-card">
          <button className="listupload-close-btn" onClick={onClose} aria-label="Close">
            <HiX />
          </button>

          <div className="success-content-wrapper">
            <div className="success-brand-header">
              <div className="success-logo-badge">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80"
                  alt="Groicessary Sathiu"
                />
              </div>
              <div className="success-brand-title">
                <h3>Groicessary <span>Sathiu</span></h3>
              </div>
            </div>

            <div className="success-main-grid">
              <div className="success-left-col">
                <div className="success-badge-container">
                  <div className="success-green-circle-glow">
                    <div className="success-green-circle">
                      <HiCheck className="success-check-icon" />
                    </div>
                  </div>
                  <div className="success-ribbon">Order Confirmed!</div>
                </div>

                <div className="success-thankyou-text">
                  <h3>Thank you! 💚</h3>
                  <p>Your grocery list has been received successfully. Our team will review and contact you shortly.</p>
                </div>

                <div className="success-help-box">
                  <div className="success-help-icon">
                    <HiSupport />
                  </div>
                  <div className="success-help-info">
                    <h4>Need Help?</h4>
                    <p>We're here for you!</p>
                    <span className="help-phone">+91 98765 43210</span>
                    <span className="help-email">support@groicessarysathiu.com</span>
                  </div>
                </div>
              </div>

              <div className="success-right-col">
                <div className="receipt-box">
                  <div className="receipt-title-row">
                    <div className="receipt-title-left">
                      <HiDocumentText className="receipt-head-icon" />
                      <h4>Your Order Receipt</h4>
                    </div>
                  </div>

                  <div className="receipt-meta-grid">
                    <div className="receipt-meta-item">
                      <span className="meta-label">ORDER ID</span>
                      <span className="meta-val">{orderDetails.orderId}</span>
                    </div>
                    <div className="receipt-meta-item">
                      <span className="meta-label">RECEIPT NO.</span>
                      <span className="meta-val">{orderDetails.receiptNo}</span>
                    </div>
                    <div className="receipt-meta-item status-item">
                      <span className="meta-label">STATUS</span>
                      <span className="status-badge"><span className="status-dot"></span> Received</span>
                    </div>
                  </div>

                  <div className="receipt-divider"></div>

                  <div className="receipt-details-list">
                    <div className="receipt-detail-row">
                      <div className="detail-icon-box"><HiClock /></div>
                      <div className="detail-content">
                        <span className="detail-title">Order Date & Time</span>
                        <span className="detail-desc">{orderDetails.orderDate}</span>
                      </div>
                    </div>

                    <div className="receipt-detail-row">
                      <div className="detail-icon-box"><HiDocumentText /></div>
                      <div className="detail-content">
                        <span className="detail-title">Customer Name</span>
                        <span className="detail-desc">{orderDetails.FullName}</span>
                      </div>
                    </div>

                    <div className="receipt-detail-row">
                      <div className="detail-icon-box"><HiPhone /></div>
                      <div className="detail-content">
                        <span className="detail-title">Phone Number</span>
                        <span className="detail-desc">{orderDetails.countryCode} {orderDetails.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="receipt-detail-row">
                      <div className="detail-icon-box"><HiLocationMarker /></div>
                      <div className="detail-content">
                        <span className="detail-title">Delivery Address</span>
                        <span className="detail-desc address-desc">{orderDetails.deliveryAddress}</span>
                      </div>
                    </div>

                    <div className="receipt-detail-row">
                      <div className="detail-icon-box"><HiDocumentText /></div>
                      <div className="detail-content">
                        <span className="detail-title">Uploaded List</span>
                        <div className="uploaded-file-row">
                          <span className="file-name-tag">{orderDetails.uploadedFile.name}</span>
                          <span className="uploaded-badge"><HiCheck /> Uploaded</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-progress-section">
              <div className="progress-title-row">
                <span className="progress-decor-line"></span>
                <h4>Order Progress</h4>
                <span className="progress-decor-line"></span>
              </div>

              <div className="progress-steps-container">
                <div className="progress-step active">
                  <div className="step-icon-wrapper"><HiCube /></div>
                  <span>Received</span>
                </div>
                <div className="progress-line"></div>
                <div className="progress-step">
                  <div className="step-icon-wrapper"><HiSearch /></div>
                  <span>Reviewing List</span>
                </div>
                <div className="progress-line"></div>
                <div className="progress-step">
                  <div className="step-icon-wrapper"><HiCube /></div>
                  <span>Packing</span>
                </div>
                <div className="progress-line"></div>
                <div className="progress-step">
                  <div className="step-icon-wrapper"><HiTruck /></div>
                  <span>Out for Delivery</span>
                </div>
              </div>

              <div className="estimated-time-banner">
                <HiClock className="est-icon" /> Estimated Response Time: <strong>15 – 30 Minutes</strong>
              </div>
            </div>

            <div className="success-action-buttons">
              <button type="button" className="action-btn download-btn" onClick={() => alert('Receipt downloaded successfully!')}>
                <HiDownload /> Download Receipt
              </button>
              <button type="button" className="action-btn track-btn" onClick={() => alert('Tracking order status...')}>
                <HiLocationMarker /> Track Order
              </button>
              <button type="button" className="action-btn close-action-btn" onClick={onClose}>
                <HiX /> Close
              </button>
            </div>

            <div className="success-veg-footer">
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"
                alt="Fresh Vegetables Banner"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listupload-overlay">
      <div className="listupload-card">
        <button className="listupload-close-btn" onClick={onClose} aria-label="Close">
          <HiX />
        </button>

        <div className="listupload-header">
          <div className="listupload-header-img-container">
            <div className="listupload-grocery-bag">
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80"
                alt="Grocery Bag"
              />
            </div>
            <div className="listupload-main-icon-badge">
              <HiDocumentText />
            </div>
          </div>
          <h2>Upload Your List</h2>
          <p>Share your grocery list and we'll take care of the rest!</p>
          <div className="listupload-header-underline"></div>
        </div>

        <form className="listupload-form" onSubmit={handleSubmit}>
          <div className="listupload-field-group">
            <label className="listupload-label">
              <HiDocumentText className="listupload-label-icon green" /> List Name <span>*</span>
            </label>
            <input
              type="text"
              name="listName"
              className="listupload-input"
              placeholder="e.g. Weekly Groceries, Party List, Monthly Needs"
              value={formData.listName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="listupload-field-group">
            <label className="listupload-label">
              <HiDocumentText className="listupload-label-icon green" /> Full Name <span>*</span>
            </label>
            <input
              type="text"
              name="FullName"
              className="listupload-input"
              placeholder="Enter Your Name.."
              value={formData.FullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="listupload-field-group">
            <label className="listupload-label">
              <HiPhone className="listupload-label-icon green" /> Phone Number <span>*</span>
            </label>
            <div className="listupload-phone-container">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="listupload-select-code"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+61">+61</option>
              </select>
              <input
                type="tel"
                name="phoneNumber"
                className="listupload-input phone-input"
                placeholder="Enter 10 digit mobile number"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="listupload-field-group">
            <label className="listupload-label">
              <HiLocationMarker className="listupload-label-icon green" /> Delivery Address <span>*</span>
            </label>
            <div className="listupload-textarea-wrapper">
              <textarea
                name="deliveryAddress"
                className="listupload-textarea"
                placeholder="House / Flat No., Area, Street, Landmark&#10;City, State - PIN Code"
                rows="3"
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="listupload-location-btn"
                onClick={handleUseMyLocation}
              >
                <HiLocationMarker className="listupload-location-icon" />
                {loadingLocation ? 'Locating...' : 'Use My Location'}
              </button>
            </div>
          </div>

          <div className="listupload-field-group">
            <label className="listupload-label">
              <HiUpload className="listupload-label-icon green" /> Upload List (Image / PDF) <span>*</span>
            </label>
            <div
              className={`listupload-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="listupload-file-input"
                className="listupload-file-input"
                accept="image/jpeg, image/png, application/pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="listupload-file-input" className="listupload-dropzone-label">
                <div className="listupload-upload-icon-circle">
                  <HiUpload />
                </div>
                <div className="listupload-dropzone-text">
                  <span className="bold-upload-text">Click to upload</span> or drag & drop
                </div>
                <div className="listupload-dropzone-subtext">
                  {formData.uploadedFile
                    ? `Selected: ${formData.uploadedFile.name}`
                    : 'Supports JPG, PNG, PDF (Max 5MB)'}
                </div>
              </label>
            </div>
          </div>

          <div className="listupload-secure-banner">
            <div className="listupload-shield-icon">
              <HiShieldCheck />
            </div>
            <div className="listupload-secure-text">
              <h4>100% Secure & Private</h4>
              <p>Your information is safe with us and used only for delivering your order.</p>
            </div>
          </div>

          <div className="listupload-actions">
            <button
              type="button"
              className="listupload-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="listupload-submit-btn"
            >
              <HiPaperAirplane className="listupload-submit-icon" /> Submit List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListUpload;
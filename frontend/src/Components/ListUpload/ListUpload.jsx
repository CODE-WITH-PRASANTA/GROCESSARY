import React, { useState } from 'react';
import './ListUpload.css';
import { 
  HiDocumentText, 
  HiPhone, 
  HiLocationMarker, 
  HiUpload, 
  HiShieldCheck, 
  HiPaperAirplane, 
  HiX
} from 'react-icons/hi';

const ListUpload = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    listName: '',
    countryCode: '+91',
    phoneNumber: '',
    deliveryAddress: '',
    uploadedFile: null,
  });

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    if (!formData.listName || !formData.phoneNumber || !formData.deliveryAddress || !formData.uploadedFile) {
      alert('Please fill out all required fields and upload a list.');
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Form Submitted Successfully:', formData);
      alert('List submitted successfully!');
    }
  };

  return (
    <div className="listupload-overlay">
      <div className="listupload-card">
        {/* Close Button */}
        <button className="listupload-close-btn" onClick={onClose} aria-label="Close">
          <HiX />
        </button>

        {/* Top Header Graphics & Titles */}
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

        {/* Form Body */}
        <form className="listupload-form" onSubmit={handleSubmit}>
          
          {/* List Name Input */}
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

          {/* Phone Number Input */}
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
                placeholder="Enter your 10 digit mobile number"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength="10"
                required
              />
            </div>
          </div>

          {/* Delivery Address Input */}
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

          {/* Upload List (Image / PDF) */}
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

          {/* Secure & Private Banner */}
          <div className="listupload-secure-banner">
            <div className="listupload-shield-icon">
              <HiShieldCheck />
            </div>
            <div className="listupload-secure-text">
              <h4>100% Secure & Private</h4>
              <p>Your information is safe with us and used only for delivering your order.</p>
            </div>
          </div>

          {/* Footer Action Buttons */}
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
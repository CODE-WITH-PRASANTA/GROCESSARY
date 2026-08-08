import React, { useState } from 'react';
import './DeliveryTime.css';
import {
  IoMdTime,
  IoMdClose,
  IoMdInformationCircle,
  IoMdNotifications
} from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { 
  FaMotorcycle, 
  FaLocationCrosshairs, 
  FaBolt, 
  FaTruck, 
  FaRegCalendarDays 
} from "react-icons/fa6";

const DeliveryTime = ({ onClose }) => {
  const [selectedSlot, setSelectedSlot] = useState('30mins');
  const [locationInput, setLocationInput] = useState('');

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock location update using coordinates or generic fetched text
          setLocationInput(`Lat: ${position.coords.latitude.toFixed(2)}, Long: ${position.coords.longitude.toFixed(2)} (Current Location)`);
        },
        (error) => {
          alert("Unable to retrieve your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="delivery-time-overlay">
      <div className="delivery-time-modal">
        
        {/* Header */}
        <div className="delivery-time-header">
          <div className="header-title-wrapper">
            <div className="header-icon-container">
              <IoMdTime className="header-main-icon" />
            </div>
            <div>
              <h2>Delivery Time</h2>
              <p>Check delivery time for your location</p>
            </div>
          </div>
        <button
  className="close-btn"
  aria-label="Close"
  onClick={onClose}
>
            <IoMdClose />
          </button>
        </div>

        {/* Promo Banner */}
        <div className="delivery-time-banner">
          <div className="banner-text">
            <h3>We deliver fast & on time!</h3>
            <p>Get your groceries delivered at your convenience.</p>
          </div>
          <div className="banner-illustration">
            <FaMotorcycle className="ill-scooter" />
            <div className="ill-route"></div>
          </div>
        </div>

        {/* Location Input Section */}
        <div className="delivery-time-section">
          <label className="section-label">
            <IoLocationSharp className="label-icon" /> Enter Your Delivery Location
          </label>
          <div className="location-input-group">
            <span className="input-inner-icon"><IoLocationSharp /></span>
            <input 
              type="text" 
              placeholder="Enter your area, street or pincode" 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <button className="use-location-btn" onClick={handleUseMyLocation}>
              <FaLocationCrosshairs /> Use My Location
            </button>
          </div>
        </div>

        {/* Estimated Delivery Time Cards */}
        <div className="delivery-time-section">
          <label className="section-label">
            <IoMdTime className="label-icon" /> Estimated Delivery Time
          </label>
          
          <div className="time-cards-grid">
            
            {/* Card 1 */}
            <div 
              className={`time-card ${selectedSlot === '30mins' ? 'active' : ''}`}
              onClick={() => setSelectedSlot('30mins')}
            >
              <div className="card-icon-box orange">
                <FaBolt />
              </div>
              <div className="card-time">30 mins</div>
              <div className="card-desc">Express Delivery</div>
              <span className="badge fastest">FASTEST</span>
            </div>

            {/* Card 2 */}
            <div 
              className={`time-card ${selectedSlot === '60mins' ? 'active' : ''}`}
              onClick={() => setSelectedSlot('60mins')}
            >
              <div className="card-icon-box yellow">
                <FaTruck />
              </div>
              <div className="card-time">60 mins</div>
              <div className="card-desc">Standard Delivery</div>
              <span className="badge popular">POPULAR</span>
            </div>

            {/* Card 3 */}
            <div 
              className={`time-card ${selectedSlot === '90mins' ? 'active' : ''}`}
              onClick={() => setSelectedSlot('90mins')}
            >
              <div className="card-icon-box blue">
                <FaMotorcycle />
              </div>
              <div className="card-time">90 mins</div>
              <div className="card-desc">Scheduled Delivery</div>
              <span className="badge schedule">SCHEDULE</span>
            </div>

            {/* Card 4 */}
            <div 
              className={`time-card ${selectedSlot === 'custom' ? 'active' : ''}`}
              onClick={() => setSelectedSlot('custom')}
            >
              <div className="card-icon-box purple">
                <FaRegCalendarDays />
              </div>
              <div className="card-time">Custom Time</div>
              <div className="card-desc">Choose Slot</div>
              <span className="badge flexible">FLEXIBLE</span>
            </div>

          </div>
        </div>

        {/* Sub-banner notification */}
        <div className="delivery-sub-banner">
          <div className="sub-banner-left">
            <IoMdTime className="sub-banner-icon" />
            <span><strong>Fastest delivery in your area</strong><br/>Place your order within the next 20 mins to get 30 mins delivery</span>
          </div>
          <span className="limited-badge">Limited slots left!</span>
        </div>

        {/* Delivery Information Box */}
        <div className="delivery-info-card">
          <div className="info-card-header">
            <IoMdInformationCircle className="info-title-icon" /> Delivery Information
          </div>
          <div className="info-row">
            <span className="info-label"><IoMdTime /> Order Cut-off Time</span>
            <span className="info-value">10:00 PM</span>
          </div>
          <div className="info-row">
            <span className="info-label"><FaRegCalendarDays /> Delivering On</span>
            <span className="info-value">Today, 10 May 2025</span>
          </div>
          <div className="info-row">
            <span className="info-label"><IoLocationSharp /> Serviceable In</span>
            <span className="info-value">Your selected location</span>
          </div>

          <div className="info-alert">
            <IoMdNotifications className="alert-icon" />
            Timings may vary slightly due to traffic or weather conditions.
          </div>
        </div>

        {/* Action Button */}
        <button className="continue-shopping-btn">
          <IoMdTime /> Got It, Continue Shopping
        </button>

      </div>
    </div>
  );
};

export default DeliveryTime;
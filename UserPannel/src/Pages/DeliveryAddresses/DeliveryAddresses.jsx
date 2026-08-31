// DeliveryAddresses.jsx
import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPlus, 
  FaHome, 
  FaBuilding, 
  FaUsers, 
  FaHeart, 
  FaPencilAlt, 
  FaTrashAlt, 
  FaShieldAlt, 
  FaTimes 
} from 'react-icons/fa';
import './DeliveryAddresses.css';

const DeliveryAddresses = () => {
  // Initial state matching reference image cards exactly
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      isDefault: true,
      selected: true,
      name: 'John Doe',
      phone: '+91 98765 43210',
      addressLine: 'Plot No. 123, Kharvel Nagar,',
      cityStateZip: 'Bhubaneswar, Odisha - 751001',
      landmark: 'Near Kharvel Nagar Police Station',
      iconType: 'home'
    },
    {
      id: 2,
      type: 'Work',
      isDefault: false,
      selected: false,
      name: 'John Doe',
      phone: '+91 87654 32109',
      addressLine: 'PR Webstock Office, 2nd Floor,',
      cityStateZip: 'Infocity Square, Patia, Bhubaneswar, Odisha - 751024',
      landmark: 'Near Infosys Campus',
      iconType: 'work'
    },
    {
      id: 3,
      type: "Parents Home",
      isDefault: false,
      selected: false,
      name: 'John Doe',
      phone: '+91 76543 21098',
      addressLine: 'At - Puri Sadar, Grand Road,',
      cityStateZip: 'Puri, Odisha - 752001',
      landmark: 'Near Gundicha Temple',
      iconType: 'parents'
    },
    {
      id: 4,
      type: "Friend's Home",
      isDefault: false,
      selected: false,
      name: 'John Doe',
      phone: '+91 65432 10987',
      addressLine: 'Flat No. 4B, Sai Apartment,',
      cityStateZip: 'Lewis Road, Cuttack, Odisha - 753001',
      landmark: 'Near CDA Market',
      iconType: 'friend'
    }
  ]);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    name: '',
    phone: '',
    addressLine: '',
    cityStateZip: '',
    landmark: '',
    isDefault: false,
    iconType: 'home'
  });

  // Select Address Action
  const handleSelectAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      selected: addr.id === id
    })));
  };

  // Open Modal for Add New Address
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      type: 'Home',
      name: 'John Doe',
      phone: '',
      addressLine: '',
      cityStateZip: '',
      landmark: '',
      isDefault: false,
      iconType: 'home'
    });
    setIsModalOpen(true);
  };

  // Open Modal for Editing Address
  const handleOpenEditModal = (addr, e) => {
    e.stopPropagation();
    setEditingId(addr.id);
    setFormData({ ...addr });
    setIsModalOpen(true);
  };

  // Delete Address Action
  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updated = addresses.filter(addr => addr.id !== id);
      // If deleted address was selected, select the first available address
      if (updated.length > 0 && addresses.find(a => a.id === id)?.selected) {
        updated[0].selected = true;
      }
      setAddresses(updated);
    }
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    let updatedAddresses = [...addresses];

    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }

    if (editingId) {
      // Update existing address
      setAddresses(updatedAddresses.map(addr => 
        addr.id === editingId ? { ...formData, id: editingId } : addr
      ));
    } else {
      // Create new address
      const newAddress = {
        ...formData,
        id: Date.now(),
        selected: addresses.length === 0
      };
      setAddresses([...updatedAddresses, newAddress]);
    }
    setIsModalOpen(false);
  };

  // Set selected address as default explicitly
  const handleSetDeliverHere = (id, e) => {
    e.stopPropagation();
    setAddresses(addresses.map(addr => ({
      ...addr,
      selected: addr.id === id,
      isDefault: addr.id === id ? true : (addr.isDefault && addr.id === id)
    })));
  };

  // Render Category Icon dynamically based on type
  const renderCategoryIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'home':
        return <FaHome className="DeliveryAddresses-type-icon green" />;
      case 'work':
        return <FaBuilding className="DeliveryAddresses-type-icon blue" />;
      case 'parents home':
      case 'parents':
        return <FaUsers className="DeliveryAddresses-type-icon orange" />;
      case "friend's home":
      case 'friend':
        return <FaHeart className="DeliveryAddresses-type-icon pink" />;
      default:
        return <FaMapMarkerAlt className="DeliveryAddresses-type-icon green" />;
    }
  };

  return (
    <div className="DeliveryAddresses-container">
      {/* Top Header */}
      <div className="DeliveryAddresses-header">
        <div className="DeliveryAddresses-header-title">
          <FaMapMarkerAlt className="DeliveryAddresses-main-icon" />
          <div>
            <h2>Delivery Addresses</h2>
            <p>Manage all your saved delivery addresses</p>
          </div>
        </div>
        <button className="DeliveryAddresses-add-btn" onClick={handleOpenAddModal}>
          <FaPlus /> Add New Address
        </button>
      </div>

      {/* Addresses List Container */}
      <div className="DeliveryAddresses-list">
        {addresses.map((addr) => (
          <div 
            key={addr.id} 
            className={`DeliveryAddresses-card ${addr.selected ? 'selected' : ''}`}
            onClick={() => handleSelectAddress(addr.id)}
          >
            {/* Top pill for Default Address */}
            {addr.isDefault && (
              <span className="DeliveryAddresses-top-pill">Default Address</span>
            )}

            <div className="DeliveryAddresses-card-body">
              {/* Left Selection Radio Indicator */}
              <div className="DeliveryAddresses-radio-wrapper">
                <span className={`DeliveryAddresses-radio ${addr.selected ? 'checked' : ''}`}></span>
              </div>

              {/* Icon Box */}
              <div className={`DeliveryAddresses-icon-box ${addr.iconType || addr.type.toLowerCase().split(' ')[0]}`}>
                {renderCategoryIcon(addr.type)}
              </div>

              {/* Middle Section: Name, Phone & Address Badge */}
              <div className="DeliveryAddresses-info">
                <div className="DeliveryAddresses-type-row">
                  <h3 className="DeliveryAddresses-type-title">{addr.type}</h3>
                  {addr.isDefault && <span className="DeliveryAddresses-badge-default">Default</span>}
                </div>
                <p className="DeliveryAddresses-person-name">{addr.name}</p>
                <p className="DeliveryAddresses-person-phone">{addr.phone}</p>

                {addr.selected && (
                  <button 
                    className="DeliveryAddresses-deliver-here-btn"
                    onClick={(e) => handleSetDeliverHere(addr.id, e)}
                  >
                    Deliver here
                  </button>
                )}
              </div>

              {/* Detail Address Lines */}
              <div className="DeliveryAddresses-details">
                <div className="DeliveryAddresses-address-line-wrapper">
                  <FaMapMarkerAlt className="DeliveryAddresses-pin-icon" />
                  <div className="DeliveryAddresses-address-text">
                    <p>{addr.addressLine}</p>
                    <p>{addr.cityStateZip}</p>
                    <p className="DeliveryAddresses-landmark">{addr.landmark}</p>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="DeliveryAddresses-actions">
                <button 
                  className="DeliveryAddresses-action-btn edit"
                  onClick={(e) => handleOpenEditModal(addr, e)}
                >
                  <FaPencilAlt /> Edit
                </button>
                <button 
                  className="DeliveryAddresses-action-btn delete"
                  onClick={(e) => handleDeleteAddress(addr.id, e)}
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Security Banner */}
      <div className="DeliveryAddresses-banner">
        <div className="DeliveryAddresses-banner-left">
          <div className="DeliveryAddresses-shield-icon">
            <FaShieldAlt />
          </div>
          <div className="DeliveryAddresses-banner-text">
            <h4>Safe & Secure Deliveries</h4>
            <p>Your addresses are safe with us. We ensure secure and hassle-free deliveries every time you order.</p>
          </div>
        </div>
        <div className="DeliveryAddresses-banner-illustration">
          <div className="DeliveryAddresses-scooter">🛵</div>
          <div className="DeliveryAddresses-map-graphic">📍</div>
        </div>
      </div>

      {/* Modal Popup for Add/Edit Address */}
      {isModalOpen && (
        <div className="DeliveryAddresses-modal-overlay">
          <div className="DeliveryAddresses-modal">
            <div className="DeliveryAddresses-modal-header">
              <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button className="DeliveryAddresses-close-btn" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="DeliveryAddresses-form">
              <div className="DeliveryAddresses-form-group">
                <label>Address Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => {
                    const val = e.target.value;
                    let iconVal = 'home';
                    if (val === 'Work') iconVal = 'work';
                    if (val.includes('Parents')) iconVal = 'parents';
                    if (val.includes('Friend')) iconVal = 'friend';
                    setFormData({ ...formData, type: val, iconType: iconVal });
                  }}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Parents Home">Parents Home</option>
                  <option value="Friend's Home">Friend's Home</option>
                </select>
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>Flat / Plot / House No.</label>
                <input 
                  type="text" 
                  required
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Plot No. 123, Kharvel Nagar"
                />
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>City, State & Pincode</label>
                <input 
                  type="text" 
                  required
                  value={formData.cityStateZip}
                  onChange={(e) => setFormData({ ...formData, cityStateZip: e.target.value })}
                  placeholder="Bhubaneswar, Odisha - 751001"
                />
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>Landmark (Optional)</label>
                <input 
                  type="text" 
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near Police Station"
                />
              </div>

              <div className="DeliveryAddresses-checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  Make this my default address
                </label>
              </div>

              <div className="DeliveryAddresses-modal-footer">
                <button type="button" className="DeliveryAddresses-cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="DeliveryAddresses-save-btn">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddresses;
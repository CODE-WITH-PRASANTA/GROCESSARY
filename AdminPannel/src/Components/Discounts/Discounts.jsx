import React, { useState, useEffect } from 'react';
import { 
  FaTag, FaCheckCircle, FaClock, FaChartLine, FaFilter, 
  FaSync, FaEdit, FaTrash, FaEllipsisV, FaCloudUploadAlt, FaSave, FaUndo 
} from 'react-icons/fa';
import './Discounts.css';

// Initial Mock Data matching the design
const INITIAL_DISCOUNTS = [
  { id: 1, name: 'Summer Sale', subtext: 'Big savings on summer', type: 'Percentage', appliesTo: 'All Products', value: '30% OFF', minOrder: '₹599', duration: '01 Jun - 08 Jun', days: '8 Days', status: 'Active', usage: 1245, color: '#004d40' },
  { id: 2, name: 'Weekend Special', subtext: 'Weekend exclusive offer', type: 'Percentage', appliesTo: 'Percentage', value: '15% OFF', minOrder: '₹399', duration: '31 May - 01 Jun', days: '2 Days', status: 'Active', usage: 842, color: '#e65100' },
  { id: 3, name: 'Mega Discount', subtext: 'Limited time mega offer', type: 'Percentage', appliesTo: 'Percentage', value: '50% OFF', minOrder: '₹999', duration: '15 Jun - 22 Jun', days: '8 Days', status: 'Upcoming', usage: 0, color: '#311b92' },
  { id: 4, name: 'Veggie Discount', subtext: 'On all vegetables', type: 'Percentage', appliesTo: 'Percentage', value: '10% OFF', minOrder: '₹199', duration: '20 May - 31 May', days: '12 Days', status: 'Expired', usage: 568, color: '#2e7d32' },
  { id: 5, name: 'Dairy Delight', subtext: 'Dairy products offer', type: 'Fixed Amount', appliesTo: 'Fixed Amount', value: '₹50 OFF', minOrder: '₹299', duration: '10 Jun - 16 Jun', days: '7 Days', status: 'Active', usage: 1032, color: '#1565c0' },
  { id: 6, name: 'Personal Care Sale', subtext: 'Care for you', type: 'Percentage', appliesTo: 'Percentage', value: '20% OFF', minOrder: '₹499', duration: '05 Jun - 12 Jun', days: '8 Days', status: 'Active', usage: 743, color: '#c2185b' },
  { id: 7, name: 'Festive Offer', subtext: 'Festive season special', type: 'Percentage', appliesTo: 'Percentage', value: '25% OFF', minOrder: '₹699', duration: '01 Jul - 07 Jul', days: '7 Days', status: 'Upcoming', usage: 0, color: '#00838f' },
  { id: 8, name: 'Welcome Offer', subtext: 'For new users only', type: 'Fixed Amount', appliesTo: 'Fixed Amount', value: '₹100 OFF', minOrder: '₹499', duration: '01 Jun - 30 Jun', days: '30 Days', status: 'Active', usage: 2110, color: '#d32f2f' },
  { id: 9, name: 'Flash Sale', subtext: '24 hour special', type: 'Percentage', appliesTo: 'All Products', value: '40% OFF', minOrder: '₹799', duration: '10 Jul - 11 Jul', days: '1 Day', status: 'Upcoming', usage: 0, color: '#6a1b9a' },
  { id: 10, name: 'Monsoon Discount', subtext: 'Rainy day deals', type: 'Fixed Amount', appliesTo: 'All Products', value: '₹80 OFF', minOrder: '₹349', duration: '12 Jul - 18 Jul', days: '6 Days', status: 'Inactive', usage: 120, color: '#0277bd' },
];

const INITIAL_FORM_STATE = {
  id: null,
  name: '',
  type: 'Percentage',
  value: '',
  appliesTo: '',
  category: '',
  minOrder: '',
  startDate: '2025-06-01T00:00',
  endDate: '2025-06-08T23:59',
  status: 'Active',
  description: '',
  bannerUrl: null
};

const Discounts = () => {
  // State Management
  const [discountsList, setDiscountsList] = useState(INITIAL_DISCOUNTS);
  const [filteredList, setFilteredList] = useState(INITIAL_DISCOUNTS);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Dropdown & Pagination state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter effect
  useEffect(() => {
    let list = [...discountsList];
    if (statusFilter !== 'All') {
      list = list.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
    }
    setFilteredList(list);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [statusFilter, discountsList]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, bannerUrl: imageUrl }));
    }
  };

  const handleSaveDiscount = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.value) {
      alert("Please fill in required fields.");
      return;
    }

    if (formData.id) {
      // Edit existing
      setDiscountsList(prev => prev.map(item => item.id === formData.id ? {
        ...item,
        name: formData.name,
        type: formData.type,
        value: formData.type === 'Percentage' ? `${formData.value}% OFF` : `₹${formData.value} OFF`,
        minOrder: `₹${formData.minOrder || 0}`,
        status: formData.status
      } : item));
    } else {
      // Create new
      const newDiscount = {
        id: Date.now(),
        name: formData.name,
        subtext: formData.description || 'Special store discount',
        type: formData.type,
        appliesTo: formData.appliesTo || 'All Products',
        value: formData.type === 'Percentage' ? `${formData.value}% OFF` : `₹${formData.value} OFF`,
        minOrder: `₹${formData.minOrder || 0}`,
        duration: '01 Jul - 07 Jul',
        days: '7 Days',
        status: formData.status,
        usage: 0,
        color: '#004d40'
      };
      setDiscountsList(prev => [newDiscount, ...prev]);
    }

    handleResetForm();
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  const handleEditClick = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      type: item.type,
      value: item.value.replace(/[^0-9]/g, ''),
      appliesTo: item.appliesTo,
      category: '',
      minOrder: item.minOrder.replace(/[^0-9]/g, ''),
      startDate: '2025-06-01T00:00',
      endDate: '2025-06-08T23:59',
      status: item.status === 'Inactive' ? 'Inactive' : 'Active',
      description: item.subtext,
      bannerUrl: null
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      setDiscountsList(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleStatusChangeFromDropdown = (id, newStatus) => {
    setDiscountsList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setActiveDropdown(null);
  };

  const handleRefresh = () => {
    setStatusFilter('All');
    setDiscountsList(INITIAL_DISCOUNTS);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="dsc-container">
      {/* Top 4 Stat Cards */}
      <div className="dsc-stats-grid">
        <div className="dsc-stat-card">
          <div className="dsc-stat-icon green"><FaTag /></div>
          <div className="dsc-stat-info">
            <span className="dsc-stat-title">Total Discounts</span>
            <h2>{discountsList.length}</h2>
            <span className="dsc-stat-sub">All time created</span>
          </div>
        </div>

        <div className="dsc-stat-card">
          <div className="dsc-stat-icon blue"><FaCheckCircle /></div>
          <div className="dsc-stat-info">
            <span className="dsc-stat-title">Active Discounts</span>
            <h2>{discountsList.filter(d => d.status === 'Active').length}</h2>
            <span className="dsc-stat-sub">Currently active</span>
          </div>
        </div>

        <div className="dsc-stat-card">
          <div className="dsc-stat-icon orange"><FaClock /></div>
          <div className="dsc-stat-info">
            <span className="dsc-stat-title">Upcoming Discounts</span>
            <h2>{discountsList.filter(d => d.status === 'Upcoming').length}</h2>
            <span className="dsc-stat-sub">Starting soon</span>
          </div>
        </div>

        <div className="dsc-stat-card">
          <div className="dsc-stat-icon purple"><FaChartLine /></div>
          <div className="dsc-stat-info">
            <span className="dsc-stat-title">Total Usage</span>
            <h2>8,542</h2>
            <span className="dsc-stat-sub">Times used</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: 50% Left / 50% Right */}
      <div className="dsc-main-content">
        
        {/* Left Side: Form (50%) */}
        <div className="dsc-form-section">
          <h3>Add / Edit Discount</h3>
          <p className="dsc-subtitle">Create or update a discount for your store.</p>

          <form onSubmit={handleSaveDiscount}>
            <div className="dsc-form-group">
              <label>Discount Name <span className="req">*</span></label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter discount name" 
                value={formData.name}
                onChange={handleInputChange} 
                required 
              />
              <span className="dsc-hint">Example: Summer Sale, Festive Offer</span>
            </div>

            <div className="dsc-form-group">
              <label>Discount Type <span className="req">*</span></label>
              <div className="dsc-radio-group">
                <label className="dsc-radio">
                  <input 
                    type="radio" 
                    name="type" 
                    value="Percentage" 
                    checked={formData.type === 'Percentage'} 
                    onChange={handleInputChange} 
                  />
                  Percentage (%)
                </label>
                <label className="dsc-radio">
                  <input 
                    type="radio" 
                    name="type" 
                    value="Fixed Amount" 
                    checked={formData.type === 'Fixed Amount'} 
                    onChange={handleInputChange} 
                  />
                  Fixed Amount (₹)
                </label>
              </div>
            </div>

            <div className="dsc-form-group">
              <label>Discount Value <span className="req">*</span></label>
              <div className="dsc-input-suffix">
                <input 
                  type="number" 
                  name="value" 
                  placeholder="0" 
                  value={formData.value}
                  onChange={handleInputChange} 
                  required 
                />
                <span>{formData.type === 'Percentage' ? '%' : '₹'}</span>
              </div>
              <span className="dsc-hint">Enter percentage value (e.g. 10 for 10%)</span>
            </div>

            {/* Banner Upload Option */}
            <div className="dsc-form-group">
              <label>Banner Image (Optional)</label>
              <div className="dsc-upload-box">
                <input type="file" id="bannerUpload" accept="image/*" onChange={handleBannerUpload} hidden />
                <label htmlFor="bannerUpload" className="dsc-upload-label">
                  <FaCloudUploadAlt className="dsc-upload-icon" />
                  <span>{formData.bannerUrl ? "Change Banner Image" : "Click to Upload Banner"}</span>
                </label>
                {formData.bannerUrl && (
                  <div className="dsc-banner-preview">
                    <img src={formData.bannerUrl} alt="Banner Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="dsc-form-group">
              <label>Applies To <span className="req">*</span></label>
              <select name="appliesTo" value={formData.appliesTo} onChange={handleInputChange}>
                <option value="">Select target</option>
                <option value="All Products">All Products</option>
                <option value="Specific Category">Specific Category</option>
                <option value="Specific Product">Specific Product</option>
              </select>
              <span className="dsc-hint">Choose where this discount will apply</span>
            </div>

            <div className="dsc-form-group">
              <label>Select Category / Product (Optional)</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="">Select category or product</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy">Dairy</option>
                <option value="Personal Care">Personal Care</option>
              </select>
              <span className="dsc-hint">Leave empty to apply on all</span>
            </div>

            <div className="dsc-form-group">
              <label>Minimum Order Amount (₹)</label>
              <input 
                type="number" 
                name="minOrder" 
                placeholder="Enter minimum order amount" 
                value={formData.minOrder}
                onChange={handleInputChange} 
              />
              <span className="dsc-hint">Minimum cart value to apply discount (optional)</span>
            </div>

            <div className="dsc-form-row">
              <div className="dsc-form-group">
                <label>Start Date & Time <span className="req">*</span></label>
                <input 
                  type="datetime-local" 
                  name="startDate" 
                  value={formData.startDate}
                  onChange={handleInputChange} 
                />
              </div>
              <div className="dsc-form-group">
                <label>End Date & Time <span className="req">*</span></label>
                <input 
                  type="datetime-local" 
                  name="endDate" 
                  value={formData.endDate}
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="dsc-form-group">
              <label>Status</label>
              <div className="dsc-status-toggle">
                <button 
                  type="button" 
                  className={`dsc-btn-toggle ${formData.status === 'Active' ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, status: 'Active' }))}
                >
                  Active
                </button>
                <button 
                  type="button" 
                  className={`dsc-btn-toggle ${formData.status === 'Inactive' ? 'active' : ''}`}
                  onClick={() => setFormData(p => ({ ...p, status: 'Inactive' }))}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="dsc-form-group">
              <label>Description (Optional)</label>
              <textarea 
                name="description" 
                rows="3" 
                maxLength="200"
                placeholder="Enter description..." 
                value={formData.description}
                onChange={handleInputChange}
              />
              <span className="dsc-char-count">{formData.description.length}/200</span>
            </div>

            <div className="dsc-form-actions">
              <button type="button" className="dsc-btn-reset" onClick={handleResetForm}>
                <FaUndo /> Reset
              </button>
              <button type="submit" className="dsc-btn-save">
                <FaSave /> Save Discount
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Table View (50%) */}
        <div className="dsc-table-section">
          <div className="dsc-table-header">
            <div>
              <h3>All Discounts</h3>
              <p className="dsc-subtitle">Manage all discounts and their performance.</p>
            </div>
            
            <div className="dsc-table-controls">
              <div className="dsc-filter-box">
                <FaFilter className="dsc-icon" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button className="dsc-btn-icon" title="Refresh List" onClick={handleRefresh}>
                <FaSync />
              </button>
            </div>
          </div>

          {/* Discounts Table */}
          <div className="dsc-table-wrapper">
            <table className="dsc-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Applies To</th>
                  <th>Value</th>
                  <th>Min. Order</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Usage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <div className="dsc-item-badge">
                          <div className="dsc-badge-preview" style={{ backgroundColor: item.color }}>
                            <span>{item.name.toUpperCase()}</span>
                            <small>{item.value}</small>
                          </div>
                          <div className="dsc-item-details">
                            <strong>{item.name}</strong>
                            <span>{item.subtext}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.type}</td>
                      <td>{item.appliesTo}</td>
                      <td><strong>{item.value}</strong></td>
                      <td>{item.minOrder}</td>
                      <td>
                        <div className="dsc-duration">
                          <span>{item.duration}</span>
                          <small>{item.days}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`dsc-status-tag ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="dsc-usage">
                          <strong>{item.usage.toLocaleString()}</strong>
                          <small>times</small>
                        </div>
                      </td>
                      <td>
                        <div className="dsc-action-btns">
                          <button 
                            className="dsc-act-btn edit" 
                            title="Edit"
                            onClick={() => handleEditClick(item)}
                          >
                            <FaEdit />
                          </button>
                          
                          <button 
                            className="dsc-act-btn delete" 
                            title="Delete"
                            onClick={() => handleDelete(item.id)}
                          >
                            <FaTrash />
                          </button>

                          {/* 3-dots Menu with Dropdown */}
                          <div className="dsc-dropdown-container">
                            <button 
                              className="dsc-act-btn menu"
                              onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                            >
                              <FaEllipsisV />
                            </button>
                            
                            {activeDropdown === item.id && (
                              <div className="dsc-dropdown-menu">
                                <button onClick={() => handleStatusChangeFromDropdown(item.id, 'Active')}>
                                  Set Active
                                </button>
                                <button onClick={() => handleStatusChangeFromDropdown(item.id, 'Inactive')}>
                                  Set Inactive
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="dsc-empty">No discounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="dsc-pagination-wrapper">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length} entries
            </span>

            <div className="dsc-pagination">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Lower Insights Section */}
      <div className="dsc-insights-section">
        <h4 className="dsc-insights-title">Discount Performance Insights</h4>
        <div className="dsc-insights-grid">
          
          <div className="dsc-insight-card">
            <div className="dsc-insight-icon green"><FaTag /></div>
            <div>
              <span className="dsc-insight-label">Best Performing</span>
              <p className="dsc-insight-value">Mega Discount</p>
              <small>2,154 uses</small>
            </div>
          </div>

          <div className="dsc-insight-card">
            <div className="dsc-insight-icon green"><FaChartLine /></div>
            <div>
              <span className="dsc-insight-label">Most Revenue</span>
              <p className="dsc-insight-value">Summer Sale</p>
              <small>₹1,25,430</small>
            </div>
          </div>

          <div className="dsc-insight-card">
            <div className="dsc-insight-icon green"><FaClock /></div>
            <div>
              <span className="dsc-insight-label">Avg. Order Value</span>
              <p className="dsc-insight-value">₹786</p>
              <small>With discounts</small>
            </div>
          </div>

          <div className="dsc-insight-card">
            <div className="dsc-insight-icon green"><FaCheckCircle /></div>
            <div>
              <span className="dsc-insight-label">Conversion Boost</span>
              <p className="dsc-insight-value">18.6%</p>
              <small>More orders</small>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Discounts;
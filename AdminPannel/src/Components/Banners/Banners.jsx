import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Banners.css';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  ChevronDown, 
  Save,
  MoreVertical,
  CheckCircle,
  XCircle,
  CheckSquare,
  XSquare,
  TrendingUp,
  Layers
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/banners';
const ITEMS_PER_PAGE = 8;

const Banners = () => {
  // --- Form States ---
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    linkType: 'Product',
    product: '',
    linkUrl: '',
    order: 0,
    status: 'Active',
    bannerUrl: null,
    imageFile: null
  });

  const fileInputRef = useRef(null);

  // --- List, Search, Filter & Pagination States ---
  const [bannersList, setBannersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Banners on Mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setBannersList(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.banner-dropdown-container')) {
        setActiveDropdownId(null);
      }
      if (!e.target.closest('.banner-filter-container')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle Banner Image Selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit!');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, bannerUrl: imageUrl, imageFile: file }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      linkType: 'Product',
      product: '',
      linkUrl: '',
      order: 0,
      status: 'Active',
      bannerUrl: null,
      imageFile: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Refresh Table and Controls
  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('All');
    fetchBanners();
    setCurrentPage(1);
  };

  // Save / Submit Banner (Add or Edit)
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert('Please enter a Banner Title');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subTitle', formData.description || 'Special Offer');
    data.append('linkType', formData.linkType);
    data.append('target', formData.product || formData.linkUrl || 'Custom Target');
    data.append('order', formData.order);
    data.append('status', formData.status);
    if (formData.imageFile) {
      data.append('bannerImage', formData.imageFile);
    }

    try {
      if (formData.id) {
        // Edit API Call
        await axios.put(`${API_BASE_URL}/${formData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Add API Call
        await axios.post(API_BASE_URL, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchBanners();
      handleReset();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  // Status Change via Dropdown Action
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/${id}/status`, { status: newStatus });
      setBannersList(prev =>
        prev.map(b => b._id === id ? { ...b, status: newStatus } : b)
      );
      setActiveDropdownId(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Edit Action
  const handleEdit = (banner) => {
    setFormData({
      id: banner._id,
      title: banner.title,
      description: banner.subTitle || '',
      linkType: banner.linkType || 'Product',
      product: banner.target,
      linkUrl: '',
      order: banner.order,
      status: banner.status,
      bannerUrl: banner.bannerUrl ? `http://localhost:5000${banner.bannerUrl}` : null,
      imageFile: null
    });
    setActiveDropdownId(null);
  };

  // Delete Action
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        setBannersList(prev => prev.filter(b => b._id !== id));
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
    setActiveDropdownId(null);
  };

  // Calculate Metrics for Top Cards
  const totalBannersCount = bannersList.length;
  const activeBannersCount = bannersList.filter(b => b.status === 'Active').length;
  const inactiveBannersCount = bannersList.filter(b => b.status === 'Inactive').length;

  // Filter Logic
  const filteredBanners = bannersList.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalEntries = filteredBanners.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBanners = filteredBanners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="banner-page-container">
      
      {/* ================= TOP 4 METRIC CARDS ================= */}
      <div className="banner-top-cards-grid">
        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-blue"><Layers size={20} /></div>
          <div className="banner-card-content">
            <span className="banner-card-label">Total Banners</span>
            <h3 className="banner-card-value">{totalBannersCount}</h3>
            <span className="banner-card-sub">All banners</span>
          </div>
        </div>

        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-green"><CheckSquare size={20} /></div>
          <div className="banner-card-content">
            <span className="banner-card-label">Active Banners</span>
            <h3 className="banner-card-value">{activeBannersCount}</h3>
            <span className="banner-card-sub">Currently live</span>
          </div>
        </div>

        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-red"><XSquare size={20} /></div>
          <div className="banner-card-content">
            <span className="banner-card-label">Inactive Banners</span>
            <h3 className="banner-card-value">{inactiveBannersCount}</h3>
            <span className="banner-card-sub">Not active</span>
          </div>
        </div>

        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-purple"><TrendingUp size={20} /></div>
          <div className="banner-card-content">
            <span className="banner-card-label">Total Clicks</span>
            <h3 className="banner-card-value">2,458</h3>
            <span className="banner-card-sub">This month</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="banner-grid">
        
        {/* ================= LEFT SECTION: FORM ================= */}
        <div className="banner-left-column">
          <div className="banner-card banner-form-section">
            <div className="banner-header">
              <h2>{formData.id ? 'Edit Banner' : 'Add Banner'}</h2>
              <p>Create or update a banner for your store.</p>
            </div>

            <form onSubmit={handleSaveBanner} className="banner-form">
              <div className="banner-form-group">
                <label>Banner Image <span className="banner-required">*</span></label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg, image/webp" 
                  style={{ display: 'none' }} 
                />
                <div 
                  className="banner-upload-box" 
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  {formData.bannerUrl ? (
                    <div className="banner-preview-wrapper">
                      <img src={formData.bannerUrl} alt="Banner Preview" className="banner-preview-img" />
                      <button 
                        type="button" 
                        className="banner-remove-img"
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, bannerUrl: null, imageFile: null })); }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="banner-upload-content">
                      <div className="banner-upload-icon-circle"><UploadCloud size={24} /></div>
                      <p className="banner-upload-title">Click to upload banner image</p>
                      <span className="banner-upload-meta">Auto-converts to WebP</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="banner-form-group">
                <label>Banner Title</label>
                <div className="banner-input-count-wrapper">
                  <input 
                    type="text" 
                    name="title"
                    placeholder="Enter banner title" 
                    maxLength={100}
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  <span className="banner-char-count">{formData.title.length}/100</span>
                </div>
              </div>

              <div className="banner-form-group">
                <label>Description (Optional)</label>
                <div className="banner-textarea-wrapper">
                  <textarea 
                    name="description"
                    placeholder="Enter description"
                    rows="3"
                    maxLength={150}
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  <span className="banner-char-count">{formData.description.length}/150</span>
                </div>
              </div>

              <div className="banner-form-group">
                <label>Link Type</label>
                <div className="banner-select-wrapper">
                  <select name="linkType" value={formData.linkType} onChange={handleInputChange}>
                    <option value="Product">Product</option>
                    <option value="Category">Category</option>
                    <option value="Custom URL">Custom URL</option>
                  </select>
                  <ChevronDown className="banner-select-arrow" size={16} />
                </div>
              </div>

              <div className="banner-form-group">
                <label>Target / Product</label>
                <input 
                  type="text" 
                  name="product"
                  placeholder="Target value or link" 
                  value={formData.product}
                  onChange={handleInputChange}
                />
              </div>

              <div className="banner-form-group">
                <label>Display Order</label>
                <input 
                  type="number" 
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                />
              </div>

              <div className="banner-form-group">
                <label>Status</label>
                <div className="banner-status-segment">
                  <button 
                    type="button" 
                    className={`banner-segment-btn ${formData.status === 'Active' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'Active' }))}
                  >
                    Active
                  </button>
                  <button 
                    type="button" 
                    className={`banner-segment-btn ${formData.status === 'Inactive' ? 'inactive' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 'Inactive' }))}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div className="banner-form-actions">
                <button type="button" className="banner-btn banner-btn-outline" onClick={handleReset}>Reset</button>
                <button type="submit" className="banner-btn banner-btn-primary">
                  <Save size={16} /> Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= RIGHT SECTION: TABLE ================= */}
        <div className="banner-right-column">
          <div className="banner-card banner-list-section">
            <div className="banner-list-header">
              <div>
                <h2>All Banners</h2>
                <p>Manage all banners and settings.</p>
              </div>

              <div className="banner-controls">
                <div className="banner-select-wrapper banner-status-filter-select">
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="All">All Status</option>
                    <option value="Active">Active Only</option>
                    <option value="Inactive">Inactive Only</option>
                  </select>
                  <ChevronDown className="banner-select-arrow" size={14} />
                </div>

                <button className="banner-btn-icon" onClick={handleRefresh} title="Refresh Table">
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            <div className="banner-table-wrapper">
              <table className="banner-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Banner</th>
                    <th>Title</th>
                    <th>Link Type</th>
                    <th>Target</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBanners.length > 0 ? (
                    currentBanners.map((item, index) => (
                      <tr key={item._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <div className="banner-thumb-box" style={{ background: item.bgGradient }}>
                            {item.bannerUrl ? (
                              <img src={`http://localhost:5000${item.bannerUrl}`} alt={item.title} className="banner-thumb-img" />
                            ) : (
                              <div className="banner-thumb-mock">
                                <span>{item.title}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="banner-title-group">
                            <span className="banner-main-title">{item.title}</span>
                            <span className="banner-sub-title">{item.subTitle}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`banner-link-pill ${item.linkType === 'Custom URL' ? 'blue' : 'green'}`}>
                            {item.linkType}
                          </span>
                        </td>
                        <td className="banner-target-cell">{item.target}</td>
                        <td>{item.order}</td>
                        <td>
                          <span className={`banner-badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="banner-action-wrapper">
                            <button className="banner-action-btn banner-edit-btn" onClick={() => handleEdit(item)} title="Edit">
                              <Edit3 size={14} />
                            </button>
                            <button className="banner-action-btn banner-delete-btn" onClick={() => handleDelete(item._id)} title="Delete">
                              <Trash2 size={14} />
                            </button>

                            <div className="banner-dropdown-container">
                              <button 
                                className="banner-action-btn banner-more-btn"
                                onClick={() => setActiveDropdownId(activeDropdownId === item._id ? null : item._id)}
                              >
                                <MoreVertical size={14} />
                              </button>

                              {activeDropdownId === item._id && (
                                <div className="banner-action-dropdown">
                                  <button onClick={() => handleStatusChange(item._id, 'Active')}>
                                    <CheckCircle size={14} className="icon-green" /> Set Active
                                  </button>
                                  <button onClick={() => handleStatusChange(item._id, 'Inactive')}>
                                    <XCircle size={14} className="icon-red" /> Set Inactive
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
                      <td colSpan="8" className="banner-no-data">No banners found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="banner-pagination-wrapper">
              <span className="banner-entries-info">
                Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + ITEMS_PER_PAGE, totalEntries)} of {totalEntries} entries
              </span>
              <div className="banner-pagination">
                <button className="banner-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>&lt;</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} className={`banner-page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                ))}
                <button className="banner-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>&gt;</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Banners;
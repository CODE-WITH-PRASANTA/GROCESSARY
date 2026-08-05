import React, { useState, useRef, useEffect } from 'react';
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
  Image as ImageIcon,
  CheckSquare,
  XSquare,
  TrendingUp,
  Layers
} from 'lucide-react';

const initialBanners = [
  { id: 1, title: 'Fresh Groceries', subTitle: 'Up to 30% OFF', linkType: 'Category', target: 'Groceries', order: 1, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #054f31, #10b981)' },
  { id: 2, title: 'Mega Sale', subTitle: 'Up to 50% OFF', linkType: 'Category', target: 'All Products', order: 2, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
  { id: 3, title: 'Healthy & Organic', subTitle: 'Up to 25% OFF', linkType: 'Category', target: 'Organic', order: 3, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #d9f99d, #84cc16)' },
  { id: 4, title: 'Beverages', subTitle: 'Refreshing Drinks', linkType: 'Category', target: 'Beverages', order: 4, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { id: 5, title: 'Snacks Store', subTitle: 'Crunchy & Tasty', linkType: 'Category', target: 'Snacks', order: 5, status: 'Inactive', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #0284c7, #38bdf8)' },
  { id: 6, title: 'Dairy Products', subTitle: 'Fresh & Pure', linkType: 'Category', target: 'Dairy', order: 6, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #eab308, #fef08a)' },
  { id: 7, title: 'Personal Care', subTitle: 'Up to 20% OFF', linkType: 'Category', target: 'Personal Care', order: 7, status: 'Inactive', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #f43f5e, #fda4af)' },
  { id: 8, title: 'Festive Offer', subTitle: 'Big Discounts', linkType: 'Custom URL', target: 'Custom Link', order: 8, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #064e3b, #047857)' },
  { id: 9, title: 'Summer Refreshers', subTitle: 'Cool Drinks', linkType: 'Category', target: 'Beverages', order: 9, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #06b6d4, #67e8f9)' },
  { id: 10, title: 'Bakery Specials', subTitle: 'Freshly Baked', linkType: 'Category', target: 'Bakery', order: 10, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #78350f, #f59e0b)' },
  { id: 11, title: 'Household Needs', subTitle: 'Cleaning Essentials', linkType: 'Category', target: 'Household', order: 11, status: 'Inactive', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #475569, #94a3b8)' },
  { id: 12, title: 'Baby Essentials', subTitle: 'Care & Love', linkType: 'Category', target: 'Baby Care', order: 12, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #f472b6, #fbcfe8)' },
  { id: 13, title: 'Weekend Bonanza', subTitle: 'Extra 10% OFF', linkType: 'Custom URL', target: 'Promo Link', order: 13, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  { id: 14, title: 'Spices & Flavors', subTitle: 'Pure Taste', linkType: 'Category', target: 'Spices', order: 14, status: 'Inactive', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #b91c1c, #f87171)' },
  { id: 15, title: 'Pantry Cleanout', subTitle: 'Buy 1 Get 1', linkType: 'Category', target: 'Groceries', order: 15, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #15803d, #4ade80)' },
  { id: 16, title: 'Frozen Feasts', subTitle: 'Ready to Eat', linkType: 'Category', target: 'Frozen Food', order: 16, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #0369a1, #7dd3fc)' },
  { id: 17, title: 'Gourmet Treats', subTitle: 'Imported Quality', linkType: 'Category', target: 'Gourmet', order: 17, status: 'Inactive', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
  { id: 18, title: 'New Arrivals', subTitle: 'Check Out Latest', linkType: 'Custom URL', target: 'New Products', order: 18, status: 'Active', bannerUrl: null, bgGradient: 'linear-gradient(135deg, #0d9488, #5eead4)' }
];

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
    bannerUrl: null
  });

  const fileInputRef = useRef(null);

  // --- List, Search, Filter & Pagination States ---
  const [bannersList, setBannersList] = useState(initialBanners);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Handle Banner Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit!');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, bannerUrl: imageUrl }));
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
      bannerUrl: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Refresh Table and Controls
  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setBannersList(initialBanners);
    setCurrentPage(1);
  };

  // Save / Submit Banner
  const handleSaveBanner = (e) => {
    e.preventDefault();
    if (!formData.title) return alert('Please enter a Banner Title');

    if (formData.id) {
      // Edit
      setBannersList(prev =>
        prev.map(b => b.id === formData.id 
          ? { 
              ...b, 
              title: formData.title,
              subTitle: formData.description || 'Special Offer',
              linkType: formData.linkType,
              target: formData.product || formData.linkUrl || 'Custom Target',
              order: formData.order, 
              status: formData.status,
              bannerUrl: formData.bannerUrl || b.bannerUrl
            } 
          : b
        )
      );
    } else {
      // Add
      const newBanner = {
        id: Date.now(),
        title: formData.title,
        subTitle: formData.description || 'Special Offer',
        linkType: formData.linkType === 'Product' ? 'Category' : 'Custom URL',
        target: formData.product || formData.linkUrl || 'New Target',
        order: Number(formData.order) || bannersList.length + 1,
        status: formData.status,
        bannerUrl: formData.bannerUrl,
        bgGradient: 'linear-gradient(135deg, #054f31, #10b981)'
      };
      setBannersList(prev => [...prev, newBanner]);
    }

    handleReset();
  };

  // Status Change via Dropdown Action
  const handleStatusChange = (id, newStatus) => {
    setBannersList(prev =>
      prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
    );
    setActiveDropdownId(null);
  };

  // Edit Action
  const handleEdit = (banner) => {
    setFormData({
      id: banner.id,
      title: banner.title,
      description: banner.subTitle || '',
      linkType: banner.linkType === 'Category' ? 'Product' : 'Custom URL',
      product: banner.target,
      linkUrl: '',
      order: banner.order,
      status: banner.status,
      bannerUrl: banner.bannerUrl
    });
    setActiveDropdownId(null);
  };

  // Delete Action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      setBannersList(prev => prev.filter(b => b.id !== id));
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

  // Pagination Logic (8 Items Per Page)
  const totalEntries = filteredBanners.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBanners = filteredBanners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="banner-page-container">
      
      {/* ================= TOP 4 METRIC CARDS WITH HOVER ================= */}
      <div className="banner-top-cards-grid">
        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-blue">
            <Layers size={20} />
          </div>
          <div className="banner-card-content">
            <span className="banner-card-label">Total Banners</span>
            <h3 className="banner-card-value">{totalBannersCount}</h3>
            <span className="banner-card-sub">All banners</span>
          </div>
        </div>

        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-green">
            <CheckSquare size={20} />
          </div>
          <div className="banner-card-content">
            <span className="banner-card-label">Active Banners</span>
            <h3 className="banner-card-value">{activeBannersCount}</h3>
            <span className="banner-card-sub">Currently live</span>
          </div>
        </div>

        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-red">
            <XSquare size={20} />
          </div>
          <div className="banner-card-content">
            <span className="banner-card-label">Inactive Banners</span>
            <h3 className="banner-card-value">{inactiveBannersCount}</h3>
            <span className="banner-card-sub">Not active</span>
          </div>
        </div>

        <div className="banner-metric-card">
          <div className="banner-card-icon-box bg-purple">
            <TrendingUp size={20} />
          </div>
          <div className="banner-card-content">
            <span className="banner-card-label">Total Clicks</span>
            <h3 className="banner-card-value">2,458</h3>
            <span className="banner-card-sub">This month</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN 50 / 50 GRID ================= */}
      <div className="banner-grid">
        
        {/* ================= LEFT SECTION (50%) ================= */}
        <div className="banner-left-column">
          <div className="banner-card banner-form-section">
            <div className="banner-header">
              <h2>{formData.id ? 'Edit Banner' : 'Add / Edit Banner'}</h2>
              <p>Create or update a banner for your store.</p>
            </div>

            <form onSubmit={handleSaveBanner} className="banner-form">
              {/* Banner Image Upload */}
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
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, bannerUrl: null })); }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="banner-upload-content">
                      <div className="banner-upload-icon-circle">
                        <UploadCloud size={24} />
                      </div>
                      <p className="banner-upload-title">Click to upload banner image</p>
                      <span className="banner-upload-sub">or drag and drop</span>
                      <span className="banner-upload-meta">Recommended size: 1920 x 600px</span>
                      <span className="banner-upload-meta">Max file size: 2MB (JPG, PNG, WEBP)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Title */}
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

              {/* Description */}
              <div className="banner-form-group">
                <label>Description (Optional)</label>
                <div className="banner-textarea-wrapper">
                  <textarea 
                    name="description"
                    placeholder="Enter banner description"
                    rows="3"
                    maxLength={150}
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  <span className="banner-char-count">{formData.description.length}/150</span>
                </div>
              </div>

              {/* Link Type */}
              <div className="banner-form-group">
                <label>Link Type</label>
                <div className="banner-select-wrapper">
                  <select 
                    name="linkType"
                    value={formData.linkType}
                    onChange={handleInputChange}
                  >
                    <option value="Product">Product</option>
                    <option value="Category">Category</option>
                    <option value="Custom URL">Custom URL</option>
                  </select>
                  <ChevronDown className="banner-select-arrow" size={16} />
                </div>
              </div>

              {/* Select Product / Target */}
              <div className="banner-form-group">
                <label>Select Product</label>
                <div className="banner-select-wrapper">
                  <div className="banner-search-select">
                    <Search size={14} className="banner-select-search-icon" />
                    <select 
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                    >
                      <option value="">Search and select product</option>
                      <option value="Groceries">Groceries</option>
                      <option value="All Products">All Products</option>
                      <option value="Organic">Organic</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>
                  <ChevronDown className="banner-select-arrow" size={16} />
                </div>
              </div>

              {/* Link (URL) */}
              <div className="banner-form-group">
                <label>Link (URL)</label>
                <input 
                  type="text" 
                  name="linkUrl"
                  placeholder="https://example.com or product link" 
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                />
              </div>

              {/* Display Order */}
              <div className="banner-form-group">
                <label>Display Order</label>
                <input 
                  type="number" 
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                />
                <span className="banner-help-text">Lower number shows first</span>
              </div>

              {/* Status Segment Toggle */}
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

              {/* Form Actions */}
              <div className="banner-form-actions">
                <button type="button" className="banner-btn banner-btn-outline" onClick={handleReset}>
                  Reset
                </button>
                <button type="submit" className="banner-btn banner-btn-primary">
                  <Save size={16} /> Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= RIGHT SECTION (50%) ================= */}
        <div className="banner-right-column">
          <div className="banner-card banner-list-section">
            {/* Header Controls */}
            <div className="banner-list-header">
              <div>
                <h2>All Banners</h2>
                <p>Manage all banners and their settings.</p>
              </div>

              <div className="banner-controls">
                {/* Status Selector Select */}
                <div className="banner-select-wrapper banner-status-filter-select">
                  <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active Only</option>
                    <option value="Inactive">Inactive Only</option>
                  </select>
                  <ChevronDown className="banner-select-arrow" size={14} />
                </div>

                {/* Filter Button */}
                <div className="banner-filter-container">
                  <button 
                    className={`banner-btn-icon ${statusFilter !== 'All' ? 'active-filter' : ''}`}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter size={15} /> Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="banner-filter-dropdown">
                      <p className="banner-filter-title">Filter Status</p>
                      <button className={statusFilter === 'All' ? 'selected' : ''} onClick={() => { setStatusFilter('All'); setShowFilterDropdown(false); }}>All Banners</button>
                      <button className={statusFilter === 'Active' ? 'selected' : ''} onClick={() => { setStatusFilter('Active'); setShowFilterDropdown(false); }}>Active</button>
                      <button className={statusFilter === 'Inactive' ? 'selected' : ''} onClick={() => { setStatusFilter('Inactive'); setShowFilterDropdown(false); }}>Inactive</button>
                    </div>
                  )}
                </div>

                {/* Refresh */}
                <button className="banner-btn-icon" onClick={handleRefresh} title="Refresh Table">
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            {/* Table */}
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
                    currentBanners.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          <div className="banner-thumb-box" style={{ background: item.bgGradient }}>
                            {item.bannerUrl ? (
                              <img src={item.bannerUrl} alt={item.title} className="banner-thumb-img" />
                            ) : (
                              <div className="banner-thumb-mock">
                                <span>{item.title}</span>
                                <small>{item.subTitle}</small>
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
                            <button 
                              className="banner-action-btn banner-edit-btn" 
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              className="banner-action-btn banner-delete-btn" 
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>

                            {/* Three Dots Dropdown */}
                            <div className="banner-dropdown-container">
                              <button 
                                className="banner-action-btn banner-more-btn"
                                onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                              >
                                <MoreVertical size={14} />
                              </button>

                              {activeDropdownId === item.id && (
                                <div className="banner-action-dropdown">
                                  <button onClick={() => handleStatusChange(item.id, 'Active')}>
                                    <CheckCircle size={14} className="icon-green" /> Set Active
                                  </button>
                                  <button onClick={() => handleStatusChange(item.id, 'Inactive')}>
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
                <button 
                  className="banner-page-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={`banner-page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  className="banner-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Banners;
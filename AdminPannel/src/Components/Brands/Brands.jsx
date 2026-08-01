import React, { useState, useRef, useEffect } from 'react';
import './Brands.css';
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
  XCircle
} from 'lucide-react';

const initialBrands = [
  { id: 1, name: 'Nestlé', tagline: 'Good Food, Good Life', category: 'Food & Beverages', catColor: 'green', products: 120, order: 1, status: 'Active', logoUrl: null },
  { id: 2, name: 'Amul', tagline: 'The Taste of India', category: 'Dairy & Dairy Products', catColor: 'blue', products: 85, order: 2, status: 'Active', logoUrl: null },
  { id: 3, name: 'Tata Salt', tagline: 'Desh Ka Namak', category: 'Grocery Essentials', catColor: 'orange', products: 45, order: 3, status: 'Active', logoUrl: null },
  { id: 4, name: 'Fortune', tagline: 'Pure and Healthy', category: 'Cooking Oils', catColor: 'red', products: 38, order: 4, status: 'Active', logoUrl: null },
  { id: 5, name: 'Bourn Vita', tagline: 'Tayyari Jeet Ki', category: 'Health & Nutrition', catColor: 'purple', products: 32, order: 5, status: 'Active', logoUrl: null },
  { id: 6, name: 'Maggi', tagline: 'Taste Bhi, Health Bhi', category: 'Food & Beverages', catColor: 'green', products: 28, order: 6, status: 'Active', logoUrl: null },
  { id: 7, name: 'Dabur', tagline: 'Celebrating Life!', category: 'Personal Care', catColor: 'teal', products: 60, order: 7, status: 'Inactive', logoUrl: null },
  { id: 8, name: 'Patanjali', tagline: 'Prakriti Ka Aashirwad', category: 'Health & Wellness', catColor: 'peach', products: 52, order: 8, status: 'Active', logoUrl: null },
  { id: 9, name: 'Britannia', tagline: 'Eat Healthy, Think Better', category: 'Food & Beverages', catColor: 'green', products: 95, order: 9, status: 'Active', logoUrl: null },
  { id: 10, name: 'Cadbury', tagline: 'Free the Joy', category: 'Snacks & Sweets', catColor: 'purple', products: 110, order: 10, status: 'Active', logoUrl: null },
  { id: 11, name: 'Lays', tagline: 'Betcha Can\'t Eat Just One', category: 'Snacks & Sweets', catColor: 'orange', products: 40, order: 11, status: 'Inactive', logoUrl: null },
  { id: 12, name: 'Nivea', tagline: 'Care for Skin', category: 'Personal Care', catColor: 'blue', products: 75, order: 12, status: 'Active', logoUrl: null }
];

const ITEMS_PER_PAGE = 8;

const Brands = () => {
  // --- Form States ---
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    tagline: '',
    slug: '',
    category: '',
    description: '',
    order: 0,
    status: true,
    logoUrl: null
  });

  const fileInputRef = useRef(null);

  // --- List, Search, Filter & Pagination States ---
  const [brandsList, setBrandsList] = useState(initialBrands);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.brand-dropdown-container')) {
        setActiveDropdownId(null);
      }
      if (!e.target.closest('.brand-filter-container')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit!');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        logoUrl: imageUrl
      }));
    }
  };

  // Auto-generate Slug
  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: generatedSlug
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      id: null,
      name: '',
      tagline: '',
      slug: '',
      category: '',
      description: '',
      order: 0,
      status: true,
      logoUrl: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Refresh Table and Controls
  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setBrandsList(initialBrands);
    setCurrentPage(1);
  };

  // Save / Update Brand
  const handleSaveBrand = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Please enter a Brand Name');

    if (formData.id) {
      // Edit
      setBrandsList(prev =>
        prev.map(b => b.id === formData.id 
          ? { 
              ...b, 
              name: formData.name,
              slug: formData.slug,
              category: formData.category || 'General',
              order: formData.order, 
              status: formData.status ? 'Active' : 'Inactive',
              logoUrl: formData.logoUrl || b.logoUrl
            } 
          : b
        )
      );
    } else {
      // Add
      const newBrand = {
        id: Date.now(),
        name: formData.name,
        tagline: 'Brand Tagline',
        category: formData.category || 'General',
        catColor: 'green',
        products: 0,
        order: Number(formData.order) || brandsList.length + 1,
        status: formData.status ? 'Active' : 'Inactive',
        logoUrl: formData.logoUrl
      };
      setBrandsList(prev => [...prev, newBrand]);
    }

    handleReset();
  };

  // Status Change via Dropdown
  const handleStatusChange = (id, newStatus) => {
    setBrandsList(prev =>
      prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
    );
    setActiveDropdownId(null);
  };

  // Edit action
  const handleEdit = (brand) => {
    setFormData({
      id: brand.id,
      name: brand.name,
      tagline: brand.tagline || '',
      slug: brand.name.toLowerCase().trim().replace(/[\s\W-]+/g, '-'),
      category: brand.category,
      description: '',
      order: brand.order,
      status: brand.status === 'Active',
      logoUrl: brand.logoUrl
    });
    setActiveDropdownId(null);
  };

  // Delete action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      setBrandsList(prev => prev.filter(b => b.id !== id));
    }
    setActiveDropdownId(null);
  };

  // Filter Logic
  const filteredBrands = brandsList.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic (8 items per page)
  const totalEntries = filteredBrands.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBrands = filteredBrands.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="brand-page-container">
      <div className="brand-grid">
        
        {/* ================= LEFT SECTION (50%) ================= */}
        <div className="brand-card brand-form-section">
          <div className="brand-header">
            <h2>{formData.id ? 'Edit Brand' : 'Add / Edit Brand'}</h2>
            <p>Fill in the details to create or update a brand.</p>
          </div>

          <form onSubmit={handleSaveBrand} className="brand-form">
            {/* Logo Upload Box */}
            <div className="brand-form-group">
              <label>Brand Logo <span className="brand-required">*</span></label>
              <div className="brand-upload-box">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/png, image/jpeg, image/svg+xml" 
                  style={{ display: 'none' }} 
                />
                <div 
                  className="brand-upload-circle" 
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="brand-preview-img" />
                  ) : (
                    <UploadCloud className="brand-upload-icon" size={24} />
                  )}
                </div>
                <div className="brand-upload-info">
                  <p className="brand-upload-title">Upload Logo</p>
                  <span>JPG, PNG or SVG</span>
                  <span>Max size 2MB</span>
                  {formData.logoUrl && (
                    <button 
                      type="button" 
                      className="brand-remove-btn"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: null }))}
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div className="brand-form-group">
              <label>Brand Name <span className="brand-required">*</span></label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter brand name" 
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>

            {/* Slug */}
            <div className="brand-form-group">
              <label>Slug (URL Friendly) <span className="brand-required">*</span></label>
              <input 
                type="text" 
                name="slug"
                placeholder="enter-brand-slug" 
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
              <span className="brand-help-text">This will be used in the URL. Example: nestle</span>
            </div>

            {/* Category */}
            <div className="brand-form-group">
              <label>Category (Optional)</label>
              <div className="brand-select-wrapper">
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Dairy & Dairy Products">Dairy & Dairy Products</option>
                  <option value="Grocery Essentials">Grocery Essentials</option>
                  <option value="Cooking Oils">Cooking Oils</option>
                  <option value="Health & Nutrition">Health & Nutrition</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
                <ChevronDown className="brand-select-arrow" size={16} />
              </div>
            </div>

            {/* Description */}
            <div className="brand-form-group">
              <label>Description</label>
              <div className="brand-textarea-wrapper">
                <textarea 
                  name="description"
                  placeholder="Enter brand description..."
                  rows="3"
                  maxLength={200}
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
                <span className="brand-char-count">{formData.description.length} / 200</span>
              </div>
            </div>

            {/* Display Order */}
            <div className="brand-form-group">
              <label>Display Order</label>
              <input 
                type="number" 
                name="order"
                value={formData.order}
                onChange={handleInputChange}
              />
              <span className="brand-help-text">Lower number shows first</span>
            </div>

            {/* Status Switch */}
            <div className="brand-form-group">
              <label>Status</label>
              <div className="brand-toggle-wrapper">
                <label className="brand-switch">
                  <input 
                    type="checkbox" 
                    name="status"
                    checked={formData.status} 
                    onChange={handleInputChange} 
                  />
                  <span className="brand-slider round"></span>
                </label>
                <span className="brand-status-label">{formData.status ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="brand-form-actions">
              <button type="button" className="brand-btn brand-btn-outline" onClick={handleReset}>
                <RotateCcw size={16} /> Reset
              </button>
              <button type="submit" className="brand-btn brand-btn-primary">
                <Save size={16} /> Save Brand
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT SECTION (50%) ================= */}
        <div className="brand-card brand-list-section">
          {/* Header Controls */}
          <div className="brand-list-header">
            <div>
              <h2>All Brands</h2>
              <p>Manage and organize all your brands</p>
            </div>

            <div className="brand-controls">
              <div className="brand-search-box">
                <Search size={16} className="brand-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search brands..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {/* Filter */}
              <div className="brand-filter-container">
                <button 
                  className={`brand-btn-icon ${statusFilter !== 'All' ? 'active-filter' : ''}`}
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter size={16} /> Filter
                </button>
                {showFilterDropdown && (
                  <div className="brand-filter-dropdown">
                    <p className="brand-filter-title">Filter Status</p>
                    <button className={statusFilter === 'All' ? 'selected' : ''} onClick={() => { setStatusFilter('All'); setShowFilterDropdown(false); }}>All Brands</button>
                    <button className={statusFilter === 'Active' ? 'selected' : ''} onClick={() => { setStatusFilter('Active'); setShowFilterDropdown(false); }}>Active</button>
                    <button className={statusFilter === 'Inactive' ? 'selected' : ''} onClick={() => { setStatusFilter('Inactive'); setShowFilterDropdown(false); }}>Inactive</button>
                  </div>
                )}
              </div>

              {/* Refresh */}
              <button className="brand-btn-icon" onClick={handleRefresh} title="Refresh Table">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="brand-table-wrapper">
            <table className="brand-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Logo</th>
                  <th>Brand Name</th>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBrands.length > 0 ? (
                  currentBrands.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div className="brand-logo-circle">
                          {item.logoUrl ? (
                            <img src={item.logoUrl} alt={item.name} className="brand-table-logo" />
                          ) : (
                            <span className="brand-logo-text">{item.name.charAt(0)}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="brand-name-group">
                          <span className="brand-title-text">{item.name}</span>
                          <span className="brand-sub-text">{item.tagline}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`brand-cat-tag ${item.catColor}`}>
                          {item.category}
                        </span>
                      </td>
                      <td>{item.products}</td>
                      <td>{item.order}</td>
                      <td>
                        <span className={`brand-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="brand-action-wrapper">
                          <button 
                            className="brand-action-btn brand-edit-btn" 
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="brand-action-btn brand-delete-btn" 
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>

                          {/* Three Dots Dropdown */}
                          <div className="brand-dropdown-container">
                            <button 
                              className="brand-action-btn brand-more-btn"
                              onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                            >
                              <MoreVertical size={14} />
                            </button>

                            {activeDropdownId === item.id && (
                              <div className="brand-action-dropdown">
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
                    <td colSpan="8" className="brand-no-data">No brands found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="brand-pagination-wrapper">
            <span className="brand-entries-info">
              Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + ITEMS_PER_PAGE, totalEntries)} of {totalEntries} entries
            </span>
            <div className="brand-pagination">
              <button 
                className="brand-page-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`brand-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                className="brand-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Brands;
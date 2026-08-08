import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  XCircle,
  Loader2
} from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const API_BASE_URL = 'http://localhost:5000';
const ITEMS_PER_PAGE = 8;

const Brands = () => {
  // --- Form States ---
  const [formData, setFormData] = useState({
    _id: null,
    name: '',
    tagline: '',
    slug: '',
    category: '',
    description: '',
    order: 0,
    status: true,
    logoUrl: null,
    logoFile: null
  });

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // --- List, Search, Filter, Pagination & Loading States ---
  const [brandsList, setBrandsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Brands from API ---
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);

      const res = await fetch(`${API_BASE_URL}/api/brands?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch brands');
      const data = await res.json();
      setBrandsList(data);
    } catch (err) {
      console.error('Error loading brands:', err);
      alert('Could not connect to server or load brands.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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

  // Handle Logo File Upload (Client side preview)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit!');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        logoFile: file,
        logoUrl: previewUrl
      }));
    }
  };

  // Auto-generate Slug from Brand Name
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

  // Handle TinyMCE Editor Change
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      _id: null,
      name: '',
      tagline: '',
      slug: '',
      category: '',
      description: '',
      order: 0,
      status: true,
      logoUrl: null,
      logoFile: null
    });
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Refresh Table and Controls
  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCurrentPage(1);
    fetchBrands();
  };

  // Save / Update Brand via Backend API
  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Please enter a Brand Name');
    if (!formData.slug) return alert('Please enter a valid Slug');

    setSubmitting(true);
    try {
      const bodyData = new FormData();
      bodyData.append('name', formData.name);
      bodyData.append('tagline', formData.tagline || '');
      bodyData.append('slug', formData.slug);
      bodyData.append('category', formData.category || 'General');
      bodyData.append('description', formData.description || '');
      bodyData.append('order', formData.order);
      bodyData.append('status', formData.status);

      if (formData.logoFile) {
        bodyData.append('logo', formData.logoFile);
      }

      const isEdit = Boolean(formData._id);
      const url = isEdit 
        ? `${API_BASE_URL}/api/brands/${formData._id}` 
        : `${API_BASE_URL}/api/brands`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: bodyData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Operation failed');
      }

      alert(`Brand ${isEdit ? 'updated' : 'added'} successfully!`);
      handleReset();
      fetchBrands();
    } catch (err) {
      console.error('Error saving brand:', err);
      alert(err.message || 'Error saving brand.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Change via Dropdown (Active / Inactive)
  const handleStatusChange = async (id, newStatus) => {
    setActiveDropdownId(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/brands/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setBrandsList(prev =>
        prev.map(b => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Could not update status');
    }
  };

  // Edit action
  const handleEdit = (brand) => {
    const fullLogoUrl = brand.logoUrl 
      ? brand.logoUrl.startsWith('http') ? brand.logoUrl : `${API_BASE_URL}${brand.logoUrl}` 
      : null;

    setFormData({
      _id: brand._id,
      name: brand.name,
      tagline: brand.tagline || '',
      slug: brand.slug || brand.name.toLowerCase().trim().replace(/[\s\W-]+/g, '-'),
      category: brand.category || '',
      description: brand.description || '',
      order: brand.order || 0,
      status: brand.status === 'Active',
      logoUrl: fullLogoUrl,
      logoFile: null
    });

    if (editorRef.current) {
      editorRef.current.setContent(brand.description || '');
    }
    setActiveDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete action
  const handleDelete = async (id) => {
    setActiveDropdownId(null);
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete brand');

      setBrandsList(prev => prev.filter(b => b._id !== id));
      alert('Brand deleted successfully');
    } catch (err) {
      console.error('Error deleting brand:', err);
      alert('Failed to delete brand');
    }
  };

  // Pagination Logic
  const totalEntries = brandsList.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBrands = brandsList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="brand-page-container">
      <div className="brand-grid">
        
        {/* ================= LEFT SECTION (50%) ================= */}
        <div className="brand-card brand-form-section">
          <div className="brand-header">
            <h2>{formData._id ? 'Edit Brand' : 'Add / Edit Brand'}</h2>
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
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/svg+xml" 
                  style={{ display: 'none' }} 
                />
                <div 
                  className="brand-upload-circle" 
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Click to upload logo"
                >
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Preview" className="brand-preview-img" />
                  ) : (
                    <UploadCloud className="brand-upload-icon" size={24} />
                  )}
                </div>
                <div className="brand-upload-info">
                  <p className="brand-upload-title">Upload Logo</p>
                  <span>JPG, PNG, AVIF or SVG</span>
                  <span className="brand-convert-badge">Auto-converts to .WEBP</span>
                  {formData.logoUrl && (
                    <button 
                      type="button" 
                      className="brand-remove-btn"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: null, logoFile: null }))}
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

            {/* Tagline */}
            <div className="brand-form-group">
              <label>Tagline</label>
              <input 
                type="text" 
                name="tagline"
                placeholder="Enter brand tagline" 
                value={formData.tagline}
                onChange={handleInputChange}
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
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Snacks & Sweets">Snacks & Sweets</option>
                </select>
                <ChevronDown className="brand-select-arrow" size={16} />
              </div>
            </div>

            {/* Description (TinyMCE Integration) */}
            <div className="brand-form-group">
              <label>Description</label>
              <div className="brand-editor-wrapper">
                <Editor
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                  onInit={(evt, editor) => editorRef.current = editor}
                  value={formData.description}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 200,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                      'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Inter,sans-serif; font-size:14px }',
                    statusbar: false,
                    branding: false
                  }}
                />
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
              <button 
                type="button" 
                className="brand-btn brand-btn-outline" 
                onClick={handleReset}
                disabled={submitting}
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button 
                type="submit" 
                className="brand-btn brand-btn-primary"
                disabled={submitting}
              >
                {submitting ? <Loader2 size={16} className="brand-spinner" /> : <Save size={16} />} 
                {formData._id ? 'Update Brand' : 'Save Brand'}
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT SECTION (50%) ================= */}
        <div className="brand-card brand-list-section">
          <div>
            {/* Header Controls */}
            <div className="brand-list-header">
              <div>
                <h2>All Brands</h2>
                <p>Manage and organize all your brands</p>
              </div>

              <div className="brand-controls">
                {/* Search */}
                <div className="brand-search-box">
                  <Search size={16} className="brand-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search brands..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="brand-filter-container">
                  <button 
                    type="button"
                    className={`brand-btn-icon ${statusFilter !== 'All' ? 'active-filter' : ''}`}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter size={16} /> Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="brand-filter-dropdown">
                      <p className="brand-filter-title">Filter Status</p>
                      <button 
                        type="button" 
                        className={statusFilter === 'All' ? 'selected' : ''} 
                        onClick={() => { setStatusFilter('All'); setCurrentPage(1); setShowFilterDropdown(false); }}
                      >
                        All Brands
                      </button>
                      <button 
                        type="button" 
                        className={statusFilter === 'Active' ? 'selected' : ''} 
                        onClick={() => { setStatusFilter('Active'); setCurrentPage(1); setShowFilterDropdown(false); }}
                      >
                        Active
                      </button>
                      <button 
                        type="button" 
                        className={statusFilter === 'Inactive' ? 'selected' : ''} 
                        onClick={() => { setStatusFilter('Inactive'); setCurrentPage(1); setShowFilterDropdown(false); }}
                      >
                        Inactive
                      </button>
                    </div>
                  )}
                </div>

                {/* Refresh */}
                <button type="button" className="brand-btn-icon" onClick={handleRefresh} title="Refresh Table">
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
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="brand-no-data">
                        <div className="brand-loading-flex">
                          <Loader2 className="brand-spinner" size={20} /> Loading brands...
                        </div>
                      </td>
                    </tr>
                  ) : currentBrands.length > 0 ? (
                    currentBrands.map((item, index) => {
                      const logoSrc = item.logoUrl 
                        ? item.logoUrl.startsWith('http') ? item.logoUrl : `${API_BASE_URL}${item.logoUrl}` 
                        : null;

                      return (
                        <tr key={item._id}>
                          <td>{startIndex + index + 1}</td>
                          <td>
                            <div className="brand-logo-circle">
                              {logoSrc ? (
                                <img src={logoSrc} alt={item.name} className="brand-table-logo" />
                              ) : (
                                <span className="brand-logo-text">{item.name.charAt(0)}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="brand-name-group">
                              <span className="brand-title-text">{item.name}</span>
                              {item.tagline && <span className="brand-sub-text">{item.tagline}</span>}
                            </div>
                          </td>
                          <td>
                            <span className="brand-cat-tag">
                              {item.category}
                            </span>
                          </td>
                          <td>{item.order}</td>
                          <td>
                            <span className={`brand-badge ${item.status ? item.status.toLowerCase() : ''}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="brand-action-wrapper">
                              <button 
                                type="button"
                                className="brand-action-btn brand-edit-btn" 
                                onClick={() => handleEdit(item)}
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                type="button"
                                className="brand-action-btn brand-delete-btn" 
                                onClick={() => handleDelete(item._id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>

                              {/* Three Dots Dropdown */}
                              <div className="brand-dropdown-container">
                                <button 
                                  type="button"
                                  className="brand-action-btn brand-more-btn"
                                  onClick={() => setActiveDropdownId(activeDropdownId === item._id ? null : item._id)}
                                  title="More Options"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {activeDropdownId === item._id && (
                                  <div className="brand-action-dropdown">
                                    <button type="button" onClick={() => handleStatusChange(item._id, 'Active')}>
                                      <CheckCircle size={14} className="icon-green" /> Set Active
                                    </button>
                                    <button type="button" onClick={() => handleStatusChange(item._id, 'Inactive')}>
                                      <XCircle size={14} className="icon-red" /> Set Inactive
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="brand-no-data">No brands found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="brand-pagination-wrapper">
            <span className="brand-entries-info">
              Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + ITEMS_PER_PAGE, totalEntries)} of {totalEntries} entries
            </span>
            <div className="brand-pagination">
              <button 
                type="button"
                className="brand-page-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  type="button"
                  key={page}
                  className={`brand-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                type="button"
                className="brand-page-btn"
                disabled={currentPage === totalPages || totalPages === 0}
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
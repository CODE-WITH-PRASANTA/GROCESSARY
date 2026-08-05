import React, { useState, useRef, useEffect } from 'react';
import './Categories.css';
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
import { Editor } from '@tinymce/tinymce-react';

const initialCategories = [
  { id: 1, name: 'Food Grains', parent: '—', order: 1, status: 'Active', icon: '🌾', iconUrl: null },
  { id: 2, name: 'Cooking Oils', parent: 'Food Grains', order: 2, status: 'Active', icon: '🍾', iconUrl: null },
  { id: 3, name: 'Spices & Masala', parent: '—', order: 3, status: 'Active', icon: '🍲', iconUrl: null },
  { id: 4, name: 'Dairy & Eggs', parent: '—', order: 4, status: 'Active', icon: '🧃', iconUrl: null },
  { id: 5, name: 'Snacks & Beverages', parent: '—', order: 5, status: 'Active', icon: '🍿', iconUrl: null },
  { id: 6, name: 'Household Essentials', parent: '—', order: 6, status: 'Active', icon: '🧴', iconUrl: null },
  { id: 7, name: 'Organic & Healthy', parent: '—', order: 7, status: 'Inactive', icon: '🍃', iconUrl: null },
  { id: 8, name: 'Baby Care', parent: '—', order: 8, status: 'Active', icon: '🍼', iconUrl: null },
  { id: 9, name: 'Bakery & Biscuits', parent: '—', order: 9, status: 'Active', icon: '🍞', iconUrl: null },
  { id: 10, name: 'Beauty & Hygiene', parent: '—', order: 10, status: 'Active', icon: '🧼', iconUrl: null },
  { id: 11, name: 'Cleaning & Household', parent: '—', order: 11, status: 'Inactive', icon: '🧹', iconUrl: null },
  { id: 12, name: 'Pet Care', parent: '—', order: 12, status: 'Active', icon: '🐶', iconUrl: null },
  { id: 13, name: 'Frozen Foods', parent: '—', order: 13, status: 'Active', icon: '🧊', iconUrl: null },
  { id: 14, name: 'Beverages & Drinks', parent: '—', order: 14, status: 'Active', icon: '🥤', iconUrl: null },
  { id: 15, name: 'Instant & Ready Food', parent: '—', order: 15, status: 'Active', icon: '🍜', iconUrl: null },
  { id: 16, name: 'Sauces & Spreads', parent: '—', order: 16, status: 'Active', icon: '🥫', iconUrl: null },
  { id: 17, name: 'Sweets & Chocolates', parent: '—', order: 17, status: 'Active', icon: '🍫', iconUrl: null },
  { id: 18, name: 'Tea & Coffee', parent: 'Beverages & Drinks', order: 18, status: 'Active', icon: '☕', iconUrl: null },
  { id: 19, name: 'Meat & Seafood', parent: '—', order: 19, status: 'Inactive', icon: '🥩', iconUrl: null },
  { id: 20, name: 'Gourmet & World Food', parent: '—', order: 20, status: 'Active', icon: '🧀', iconUrl: null }
];

const ITEMS_PER_PAGE = 8;

const Categories = () => {
  // --- Form States ---
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    slug: '',
    parent: '',
    description: '',
    order: 0,
    status: true,
    icon: '📦',
    iconUrl: null
  });

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // --- Table, Search, Filter & Pagination States ---
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.cat-page-dropdown-container')) {
        setActiveDropdownId(null);
      }
      if (!e.target.closest('.cat-page-filter-container')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle Upload Icon
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size exceeds 1MB limit!');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        iconUrl: imageUrl
      }));
    }
  };

  // Auto-generate Slug from Category Name
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
      id: null,
      name: '',
      slug: '',
      parent: '',
      description: '',
      order: 0,
      status: true,
      icon: '📦',
      iconUrl: null
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
    setCategoriesList(initialCategories);
    setCurrentPage(1);
  };

  // Save / Submit Category
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Please enter a Category Name');

    if (formData.id) {
      // Update existing
      setCategoriesList(prev =>
        prev.map(cat => cat.id === formData.id 
          ? { 
              ...cat, 
              name: formData.name, 
              parent: formData.parent || '—', 
              order: Number(formData.order), 
              status: formData.status ? 'Active' : 'Inactive',
              iconUrl: formData.iconUrl || cat.iconUrl
            } 
          : cat
        )
      );
    } else {
      // Add new
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        parent: formData.parent || '—',
        order: Number(formData.order) || categoriesList.length + 1,
        status: formData.status ? 'Active' : 'Inactive',
        icon: '📁',
        iconUrl: formData.iconUrl
      };
      setCategoriesList(prev => [...prev, newCategory]);
    }

    handleReset();
  };

  // Update Status via Action Dropdown
  const handleStatusChange = (id, newStatus) => {
    setCategoriesList(prev =>
      prev.map(cat => cat.id === id ? { ...cat, status: newStatus } : cat)
    );
    setActiveDropdownId(null);
  };

  // Edit Action
  const handleEdit = (category) => {
    const cleanSlug = category.name.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    setFormData({
      id: category.id,
      name: category.name,
      slug: cleanSlug,
      parent: category.parent === '—' ? '' : category.parent,
      description: '',
      order: category.order,
      status: category.status === 'Active',
      icon: category.icon,
      iconUrl: category.iconUrl
    });

    if (editorRef.current) {
      editorRef.current.setContent('');
    }
    setActiveDropdownId(null);
  };

  // Delete Action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategoriesList(prev => prev.filter(cat => cat.id !== id));
    }
    setActiveDropdownId(null);
  };

  // Filter Categories
  const filteredCategories = categoriesList.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cat.parent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalEntries = filteredCategories.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="cat-page-container">
      <div className="cat-page-grid">
        
        {/* ================= LEFT SECTION (50%) ================= */}
        <div className="cat-page-card cat-page-form-section">
          <div className="cat-page-header">
            <h2>{formData.id ? 'Edit Category' : 'Add / Edit Category'}</h2>
            <p>Fill in the details to create or update a category.</p>
          </div>

          <form onSubmit={handleSaveCategory} className="cat-page-form">
            {/* Upload Icon Box */}
            <div className="cat-page-upload-wrapper">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleIconUpload} 
                accept="image/png, image/jpeg, image/svg+xml" 
                style={{ display: 'none' }} 
              />
              <div 
                className="cat-page-upload-circle" 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Click to upload icon"
              >
                {formData.iconUrl ? (
                  <img src={formData.iconUrl} alt="Uploaded Icon" className="cat-page-uploaded-img" />
                ) : (
                  <UploadCloud className="cat-page-upload-icon" size={28} />
                )}
              </div>
              <div className="cat-page-upload-text">
                <p><strong>Upload Icon <span className="cat-page-required">*</span></strong></p>
                <span>JPG, PNG or SVG</span>
                <span>Max size 1MB</span>
                {formData.iconUrl && (
                  <button 
                    type="button" 
                    className="cat-page-remove-img-btn"
                    onClick={() => setFormData(prev => ({ ...prev, iconUrl: null }))}
                  >
                    Remove Icon
                  </button>
                )}
              </div>
            </div>

            {/* Category Name */}
            <div className="cat-page-form-group">
              <label>Category Name <span className="cat-page-required">*</span></label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter category name" 
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>

            {/* Slug */}
            <div className="cat-page-form-group">
              <label>Slug (URL Friendly) <span className="cat-page-required">*</span></label>
              <input 
                type="text" 
                name="slug"
                placeholder="enter-category-slug" 
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
              <span className="cat-page-help-text">This will be used in the URL. Example: food-grains</span>
            </div>

            {/* Parent Category */}
            <div className="cat-page-form-group">
              <label>Parent Category</label>
              <div className="cat-page-select-wrapper">
                <select 
                  name="parent"
                  value={formData.parent}
                  onChange={handleInputChange}
                >
                  <option value="">Select parent category (optional)</option>
                  {categoriesList
                    .filter(c => c.id !== formData.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))
                  }
                </select>
                <ChevronDown className="cat-page-select-arrow" size={16} />
              </div>
            </div>

            {/* Description (TinyMCE Integration) */}
            <div className="cat-page-form-group">
              <label>Description</label>
              <div className="cat-page-editor-wrapper">
                <Editor
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu" 
                  onInit={(evt, editor) => editorRef.current = editor}
                  value={formData.description}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 220,
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
            <div className="cat-page-form-group">
              <label>Display Order</label>
              <input 
                type="number" 
                name="order"
                value={formData.order}
                onChange={handleInputChange}
              />
              <span className="cat-page-help-text">Lower number shows first</span>
            </div>

            {/* Status Switch */}
            <div className="cat-page-form-group">
              <label>Status</label>
              <div className="cat-page-toggle-wrapper">
                <label className="cat-page-switch">
                  <input 
                    type="checkbox" 
                    name="status"
                    checked={formData.status} 
                    onChange={handleInputChange} 
                  />
                  <span className="cat-page-slider round"></span>
                </label>
                <span className="cat-page-status-label">{formData.status ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="cat-page-form-actions">
              <button type="button" className="cat-page-btn cat-page-btn-outline" onClick={handleReset}>
                <RotateCcw size={16} /> Reset
              </button>
              <button type="submit" className="cat-page-btn cat-page-btn-primary">
                <Save size={16} /> Save Category
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT SECTION (50%) ================= */}
        <div className="cat-page-card cat-page-list-section">
          <div>
            {/* Header Bar */}
            <div className="cat-page-list-header">
              <div>
                <h2>All Categories</h2>
                <p>Manage your product categories</p>
              </div>

              <div className="cat-page-controls">
                {/* Search Box */}
                <div className="cat-page-search-box">
                  <Search size={16} className="cat-page-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search categories..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>

                {/* Filter */}
                <div className="cat-page-filter-container">
                  <button 
                    type="button"
                    className={`cat-page-btn-icon ${statusFilter !== 'All' ? 'active-filter' : ''}`}
                    onClick={() => setShowFilterDropdown(prev => !prev)}
                  >
                    <Filter size={16} /> Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="cat-page-filter-dropdown">
                      <p className="cat-page-filter-title">Filter Status</p>
                      <button type="button" className={statusFilter === 'All' ? 'selected' : ''} onClick={() => { setStatusFilter('All'); setShowFilterDropdown(false); }}>All</button>
                      <button type="button" className={statusFilter === 'Active' ? 'selected' : ''} onClick={() => { setStatusFilter('Active'); setShowFilterDropdown(false); }}>Active</button>
                      <button type="button" className={statusFilter === 'Inactive' ? 'selected' : ''} onClick={() => { setStatusFilter('Inactive'); setShowFilterDropdown(false); }}>Inactive</button>
                    </div>
                  )}
                </div>

                {/* Refresh */}
                <button type="button" className="cat-page-btn-icon" onClick={handleRefresh} title="Refresh Table">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="cat-page-table-wrapper">
              <table className="cat-page-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Icon</th>
                    <th>Category Name</th>
                    <th>Parent Category</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.length > 0 ? (
                    currentCategories.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          <div className="cat-page-table-icon">
                            {item.iconUrl ? (
                              <img src={item.iconUrl} alt={item.name} className="cat-page-table-img" />
                            ) : (
                              item.icon
                            )}
                          </div>
                        </td>
                        <td className="cat-page-font-semibold">{item.name}</td>
                        <td className="cat-page-text-muted">{item.parent}</td>
                        <td>{item.order}</td>
                        <td>
                          <span className={`cat-page-badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="cat-page-action-wrapper">
                            <button 
                              type="button"
                              className="cat-page-btn-action cat-page-edit-btn"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              type="button"
                              className="cat-page-btn-action cat-page-delete-btn"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>

                            {/* Three Dots Dropdown */}
                            <div className="cat-page-dropdown-container">
                              <button 
                                type="button"
                                className="cat-page-btn-action cat-page-more-btn"
                                onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                                title="More Options"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {activeDropdownId === item.id && (
                                <div className="cat-page-action-dropdown">
                                  <button type="button" onClick={() => handleStatusChange(item.id, 'Active')}>
                                    <CheckCircle size={14} className="cat-icon-active" /> Set Active
                                  </button>
                                  <button type="button" onClick={() => handleStatusChange(item.id, 'Inactive')}>
                                    <XCircle size={14} className="cat-icon-inactive" /> Set Inactive
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
                      <td colSpan="7" className="cat-page-no-data">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="cat-page-pagination-wrapper">
            <span className="cat-page-text-muted">
              Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + ITEMS_PER_PAGE, totalEntries)} of {totalEntries} entries
            </span>
            <div className="cat-page-pagination">
              <button 
                type="button"
                className="cat-page-page-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  type="button"
                  key={page}
                  className={`cat-page-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                type="button"
                className="cat-page-page-btn"
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

export default Categories;
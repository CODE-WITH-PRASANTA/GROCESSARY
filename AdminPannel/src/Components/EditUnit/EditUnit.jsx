import React, { useState, useEffect } from 'react';
import './EditUnit.css';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  Save,
  MoreVertical,
  CheckCircle,
  XCircle,
  Lightbulb
} from 'lucide-react';

const initialUnits = [
  { id: 1, name: 'Kilogram', subType: 'Weight', symbol: 'kg', type: 'Weight', typeColor: 'green', order: 1, status: 'Active' },
  { id: 2, name: 'Gram', subType: 'Weight', symbol: 'g', type: 'Weight', typeColor: 'green', order: 2, status: 'Active' },
  { id: 3, name: 'Litre', subType: 'Volume', symbol: 'L', type: 'Volume', typeColor: 'blue', order: 3, status: 'Active' },
  { id: 4, name: 'Millilitre', subType: 'Volume', symbol: 'ml', type: 'Volume', typeColor: 'blue', order: 4, status: 'Active' },
  { id: 5, name: 'Piece', subType: 'Count', symbol: 'pc', type: 'Count', typeColor: 'orange', order: 5, status: 'Active' },
  { id: 6, name: 'Packet', subType: 'Count', symbol: 'pkt', type: 'Count', typeColor: 'orange', order: 6, status: 'Active' },
  { id: 7, name: 'Bottle', subType: 'Count', symbol: 'btl', type: 'Count', typeColor: 'orange', order: 7, status: 'Active' },
  { id: 8, name: 'Box', subType: 'Count', symbol: 'box', type: 'Count', typeColor: 'purple', order: 8, status: 'Active' },
  { id: 9, name: 'Meter', subType: 'Length', symbol: 'm', type: 'Length', typeColor: 'teal', order: 9, status: 'Active' },
  { id: 10, name: 'Centimeter', subType: 'Length', symbol: 'cm', type: 'Length', typeColor: 'teal', order: 10, status: 'Inactive' },
  { id: 11, name: 'Dozen', subType: 'Count', symbol: 'dz', type: 'Count', typeColor: 'orange', order: 11, status: 'Active' },
  { id: 12, name: 'Carton', subType: 'Count', symbol: 'ctn', type: 'Count', typeColor: 'purple', order: 12, status: 'Active' }
];

const ITEMS_PER_PAGE = 8;

const EditUnit = () => {
  // --- Form States ---
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    symbol: '',
    type: '',
    order: 0,
    status: true
  });

  // --- Table, Search, Filter & Pagination States ---
  const [unitsList, setUnitsList] = useState(initialUnits);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.unit-page-dropdown-container')) {
        setActiveDropdownId(null);
      }
      if (!e.target.closest('.unit-page-filter-container')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      symbol: '',
      type: '',
      order: 0,
      status: true
    });
  };

  // Refresh Table & Controls
  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setUnitsList(initialUnits);
    setCurrentPage(1);
  };

  // Save / Submit Unit
  const handleSaveUnit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Please enter a Unit Name');
    if (!formData.symbol) return alert('Please enter a Unit Symbol');

    // Color mapper based on type
    const getTypeColor = (type) => {
      switch (type.toLowerCase()) {
        case 'weight': return 'green';
        case 'volume': return 'blue';
        case 'count': return 'orange';
        case 'length': return 'teal';
        default: return 'purple';
      }
    };

    if (formData.id) {
      // Edit existing
      setUnitsList(prev =>
        prev.map(u => u.id === formData.id 
          ? { 
              ...u, 
              name: formData.name, 
              symbol: formData.symbol, 
              type: formData.type || 'Count',
              subType: formData.type || 'Count',
              typeColor: getTypeColor(formData.type || 'Count'),
              order: formData.order, 
              status: formData.status ? 'Active' : 'Inactive'
            } 
          : u
        )
      );
    } else {
      // Add new
      const newUnit = {
        id: Date.now(),
        name: formData.name,
        symbol: formData.symbol,
        subType: formData.type || 'Count',
        type: formData.type || 'Count',
        typeColor: getTypeColor(formData.type || 'Count'),
        order: Number(formData.order) || unitsList.length + 1,
        status: formData.status ? 'Active' : 'Inactive'
      };
      setUnitsList(prev => [...prev, newUnit]);
    }

    handleReset();
  };

  // Status toggle from action dropdown
  const handleStatusChange = (id, newStatus) => {
    setUnitsList(prev =>
      prev.map(u => u.id === id ? { ...u, status: newStatus } : u)
    );
    setActiveDropdownId(null);
  };

  // Edit Action
  const handleEdit = (unit) => {
    setFormData({
      id: unit.id,
      name: unit.name,
      symbol: unit.symbol,
      type: unit.type,
      order: unit.order,
      status: unit.status === 'Active'
    });
    setActiveDropdownId(null);
  };

  // Delete Action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      setUnitsList(prev => prev.filter(u => u.id !== id));
    }
    setActiveDropdownId(null);
  };

  // Filter Units
  const filteredUnits = unitsList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic (8 Items Per Page)
  const totalEntries = filteredUnits.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUnits = filteredUnits.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="unit-page-container">
      <div className="unit-page-grid">
        
        {/* ================= LEFT SECTION (50%) ================= */}
        <div className="unit-page-left">
          <div className="unit-page-card unit-page-form-section">
            <div className="unit-page-header">
              <h2>{formData.id ? 'Edit Unit' : 'Add / Edit Unit'}</h2>
              <p>Fill in the details to create or update a unit.</p>
            </div>

            <form onSubmit={handleSaveUnit} className="unit-page-form">
              {/* Unit Name */}
              <div className="unit-page-form-group">
                <label>Unit Name <span className="unit-page-required">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter unit name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <span className="unit-page-help-text">Example: Kilogram, Litre, Piece</span>
              </div>

              {/* Unit Symbol */}
              <div className="unit-page-form-group">
                <label>Unit Symbol <span className="unit-page-required">*</span></label>
                <input 
                  type="text" 
                  name="symbol"
                  placeholder="Enter unit symbol" 
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                />
                <span className="unit-page-help-text">Example: kg, l, pc</span>
              </div>

              {/* Unit Type */}
              <div className="unit-page-form-group">
                <label>Unit Type</label>
                <div className="unit-page-select-wrapper">
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select unit type</option>
                    <option value="Weight">Weight</option>
                    <option value="Volume">Volume</option>
                    <option value="Count">Count</option>
                    <option value="Length">Length</option>
                  </select>
                  <ChevronDown className="unit-page-select-arrow" size={16} />
                </div>
                <span className="unit-page-help-text">Helps in better management and reporting</span>
              </div>

              {/* Display Order */}
              <div className="unit-page-form-group">
                <label>Display Order</label>
                <input 
                  type="number" 
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                />
                <span className="unit-page-help-text">Lower number shows first</span>
              </div>

              {/* Status Switch */}
              <div className="unit-page-form-group">
                <label>Status</label>
                <div className="unit-page-toggle-wrapper">
                  <label className="unit-page-switch">
                    <input 
                      type="checkbox" 
                      name="status"
                      checked={formData.status} 
                      onChange={handleInputChange} 
                    />
                    <span className="unit-page-slider round"></span>
                  </label>
                  <span className="unit-page-status-label">{formData.status ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="unit-page-form-actions">
                <button type="button" className="unit-page-btn unit-page-btn-outline" onClick={handleReset}>
                  <RotateCcw size={16} /> Reset
                </button>
                <button type="submit" className="unit-page-btn unit-page-btn-primary">
                  <Save size={16} /> Save Unit
                </button>
              </div>
            </form>
          </div>

          {/* Tips Box */}
          <div className="unit-page-tips-card">
            <div className="unit-page-tips-header">
              <Lightbulb size={18} className="unit-page-tips-icon" />
              <span>Tips</span>
            </div>
            <p className="unit-page-tips-body">Use clear and standard unit names.</p>
            <p className="unit-page-tips-example">Example: Kilogram (kg), Litre (L), Piece (pc)</p>
          </div>
        </div>

        {/* ================= RIGHT SECTION (50%) ================= */}
        <div className="unit-page-right">
          <div className="unit-page-card unit-page-list-section">
            <div>
              {/* Header Bar */}
              <div className="unit-page-list-header">
                <div>
                  <h2>All Units</h2>
                  <p>Manage and organize all product units.</p>
                </div>

                <div className="unit-page-controls">
                  {/* Search Box */}
                  <div className="unit-page-search-box">
                    <Search size={16} className="unit-page-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search units..." 
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                  </div>

                  {/* Filter */}
                  <div className="unit-page-filter-container">
                    <button 
                      type="button"
                      className={`unit-page-btn-icon ${statusFilter !== 'All' ? 'active-filter' : ''}`}
                      onClick={() => setShowFilterDropdown(prev => !prev)}
                    >
                      <Filter size={16} /> Filter
                    </button>
                    {showFilterDropdown && (
                      <div className="unit-page-filter-dropdown">
                        <p className="unit-page-filter-title">Filter Status</p>
                        <button type="button" className={statusFilter === 'All' ? 'selected' : ''} onClick={() => { setStatusFilter('All'); setShowFilterDropdown(false); }}>All</button>
                        <button type="button" className={statusFilter === 'Active' ? 'selected' : ''} onClick={() => { setStatusFilter('Active'); setShowFilterDropdown(false); }}>Active</button>
                        <button type="button" className={statusFilter === 'Inactive' ? 'selected' : ''} onClick={() => { setStatusFilter('Inactive'); setShowFilterDropdown(false); }}>Inactive</button>
                      </div>
                    )}
                  </div>

                  {/* Refresh */}
                  <button type="button" className="unit-page-btn-icon" onClick={handleRefresh} title="Refresh Table">
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="unit-page-table-wrapper">
                <table className="unit-page-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Unit Name</th>
                      <th>Symbol</th>
                      <th>Type</th>
                      <th>Display Order</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUnits.length > 0 ? (
                      currentUnits.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            <div className="unit-page-name-cell">
                              <div className={`unit-page-symbol-circle ${item.typeColor}`}>
                                {item.symbol}
                              </div>
                              <div className="unit-page-name-group">
                                <span className="unit-page-font-semibold">{item.name}</span>
                                <span className="unit-page-text-sub">{item.subType}</span>
                              </div>
                            </div>
                          </td>
                          <td className="unit-page-font-semibold">{item.symbol}</td>
                          <td>
                            <span className={`unit-page-type-tag ${item.typeColor}`}>
                              {item.type}
                            </span>
                          </td>
                          <td>{item.order}</td>
                          <td>
                            <span className={`unit-page-badge ${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="unit-page-action-wrapper">
                              <button 
                                type="button"
                                className="unit-page-btn-action unit-page-edit-btn"
                                onClick={() => handleEdit(item)}
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                type="button"
                                className="unit-page-btn-action unit-page-delete-btn"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>

                              {/* Three Dots Dropdown */}
                              <div className="unit-page-dropdown-container">
                                <button 
                                  type="button"
                                  className="unit-page-btn-action unit-page-more-btn"
                                  onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                                  title="More Options"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {activeDropdownId === item.id && (
                                  <div className="unit-page-action-dropdown">
                                    <button type="button" onClick={() => handleStatusChange(item.id, 'Active')}>
                                      <CheckCircle size={14} className="unit-icon-active" /> Set Active
                                    </button>
                                    <button type="button" onClick={() => handleStatusChange(item.id, 'Inactive')}>
                                      <XCircle size={14} className="unit-icon-inactive" /> Set Inactive
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
                        <td colSpan="7" className="unit-page-no-data">No units found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination (8 Items Per Page) */}
            <div className="unit-page-pagination-wrapper">
              <span className="unit-page-text-muted">
                Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + ITEMS_PER_PAGE, totalEntries)} of {totalEntries} entries
              </span>
              <div className="unit-page-pagination">
                <button 
                  type="button"
                  className="unit-page-page-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    type="button"
                    key={page}
                    className={`unit-page-page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  type="button"
                  className="unit-page-page-btn"
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
    </div>
  );
};

export default EditUnit;
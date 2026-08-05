import React, { useState } from 'react';
import './ListUploads.css';

const INITIAL_DATA = [
  { id: 1, name: 'Daily Groceries', file: 'daily_groceries.xlsx', user: 'Rohit Sharma', role: 'Customer', phone: '+91 9876543210', items: 24, downloads: 45, todayDL: 8, status: 'Active', date: '2025-05-10 10:30 AM', price: '748.00', serviceCharge: '10.00', handlingCharge: '20.00', gst: '0' },
  { id: 2, name: 'Weekly Essentials', file: 'weekly_essentials.pdf', user: 'Priya Patnaik', role: 'Customer', phone: '+91 8765432109', items: 18, downloads: 32, todayDL: 5, status: 'Active', date: '2025-05-10 10:25 AM', price: '800.00', serviceCharge: '40.00', handlingCharge: '20.00', gst: '18' },
  { id: 3, name: 'Monthly Shopping', file: 'monthly_shopping.xlsx', user: 'Amit Kumar', role: 'Customer', phone: '+91 7654321098', items: 32, downloads: 68, todayDL: 12, status: 'Active', date: '2025-05-10 10:20 AM', price: '2500.00', serviceCharge: '100.00', handlingCharge: '50.00', gst: '18' },
  { id: 4, name: 'Party List', file: 'party_list.pdf', user: 'Sneha Rani', role: 'Customer', phone: '+91 6543210987', items: 15, downloads: 28, todayDL: 4, status: 'Active', date: '2025-05-10 10:15 AM', price: '1500.00', serviceCharge: '75.00', handlingCharge: '40.00', gst: '18' },
  { id: 5, name: 'Fruits & Vegetables', file: 'fruits_vegetables.xlsx', user: 'Manoj Behera', role: 'Customer', phone: '+91 5432109876', items: 8, downloads: 12, todayDL: 2, status: 'Expired', date: '2025-05-09 09:55 AM', price: '500.00', serviceCharge: '25.00', handlingCharge: '15.00', gst: '18' },
  { id: 6, name: 'Office Supplies', file: 'office_supplies.xlsx', user: 'Rohan Mehta', role: 'Customer', phone: '+91 9988776655', items: 40, downloads: 15, todayDL: 1, status: 'Active', date: '2025-05-08 11:20 AM', price: '3000.00', serviceCharge: '120.00', handlingCharge: '60.00', gst: '18' },
  { id: 7, name: 'Home Electronics', file: 'electronics.pdf', user: 'Kavita Das', role: 'Customer', phone: '+91 8877665544', items: 12, downloads: 50, todayDL: 9, status: 'Active', date: '2025-05-07 03:45 PM', price: '12000.00', serviceCharge: '300.00', handlingCharge: '150.00', gst: '18' },
  { id: 8, name: 'Hardware Items', file: 'hardware.xlsx', user: 'Suresh Verma', role: 'Customer', phone: '+91 7766554433', items: 20, downloads: 8, todayDL: 0, status: 'Expired', date: '2025-05-06 01:10 PM', price: '4500.00', serviceCharge: '150.00', handlingCharge: '80.00', gst: '18' }
];

const ListUploads = () => {
  const [lists, setLists] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [userFilter, setUserFilter] = useState('All Users');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);
  const [downloadInvoiceModal, setDownloadInvoiceModal] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    title: '',
    uploadedBy: '',
    phone: '',
    items: '',
    file: null,
    price: '',
    serviceCharge: '',
    handlingCharge: '',
    gst: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtering Logic
  const filteredLists = lists.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
    const matchesUser = userFilter === 'All Users' || item.user === userFilter;

    let matchesDate = true;
    if (startDate && endDate) {
      const itemTimestamp = new Date(item.date).getTime();
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      matchesDate = itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
    }

    return matchesSearch && matchesStatus && matchesUser && matchesDate;
  });

  // Calculate Pagination Slices
  const totalItems = filteredLists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDisplayedLists = filteredLists.slice(startIndex, endIndex);

  // Pagination Handlers
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleStatusFilterChange = (e) => { setStatusFilter(e.target.value); setCurrentPage(1); };
  const handleUserFilterChange = (e) => { setUserFilter(e.target.value); setCurrentPage(1); };

  // Action Handlers
  const handleDownload = (item) => {
    setDownloadInvoiceModal(item);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const toggleStatus = (id) => {
    setLists(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return item;
    }));
    setActiveDropdownId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setLists(prev => prev.filter(item => item.id !== id));
      setActiveDropdownId(null);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.name,
      uploadedBy: item.user,
      phone: item.phone,
      items: item.items || '',
      file: null,
      price: item.price || '',
      serviceCharge: item.serviceCharge || '',
      handlingCharge: item.handlingCharge || '',
      gst: item.gst || ''
    });
    setIsUploadModalOpen(true);
    setActiveDropdownId(null);
  };

  const openNewUploadModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setLists(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: formData.title,
            user: formData.uploadedBy,
            phone: formData.phone,
            items: formData.items ? Number(formData.items) : item.items,
            file: formData.file ? formData.file.name : item.file,
            price: formData.price,
            serviceCharge: formData.serviceCharge,
            handlingCharge: formData.handlingCharge,
            gst: formData.gst
          };
        }
        return item;
      }));
    } else {
      const newItem = {
        id: Date.now(),
        name: formData.title || 'Untitled List',
        file: formData.file ? formData.file.name : 'new_upload.xlsx',
        user: formData.uploadedBy || 'Guest User',
        role: 'Customer',
        phone: formData.phone || '+91 0000000000',
        items: formData.items ? Number(formData.items) : 10,
        downloads: 0,
        todayDL: 0,
        status: 'Active',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        price: formData.price || '0.00',
        serviceCharge: formData.serviceCharge || '0.00',
        handlingCharge: formData.handlingCharge || '0.00',
        gst: formData.gst || '0'
      };
      setLists([newItem, ...lists]);
    }

    setIsUploadModalOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  return (
    <div className="list-uploads-container">

      {/* 1. TOP STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-box icon-total">📄</div>
          <div className="stat-info">
            <h4>Total Lists</h4>
            <div className="stat-value">{lists.length}</div>
            <p className="stat-sub text-green">+12 this month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-downloads">📥</div>
          <div className="stat-info">
            <h4>Total Downloads</h4>
            <div className="stat-value">295</div>
            <p className="stat-sub text-green">+18.5% this month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-active">☑️</div>
          <div className="stat-info">
            <h4>Active Lists</h4>
            <div className="stat-value">{lists.filter(i => i.status === 'Active').length}</div>
            <p className="stat-sub text-green">62.5% of total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-pending">🕒</div>
          <div className="stat-info">
            <h4>Pending Lists</h4>
            <div className="stat-value">1</div>
            <p className="stat-sub text-green">12.5% of total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-expired">❌</div>
          <div className="stat-info">
            <h4>Expired Lists</h4>
            <div className="stat-value">{lists.filter(i => i.status === 'Expired').length}</div>
            <p className="stat-sub text-red">12.5% of total</p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE TABLE SECTION */}
      <div className="table-container">
        <div className="header-row">
          <div>
            <h2>All Uploaded Lists</h2>
            <p>View, manage and download all uploaded lists</p>
          </div>
          <button className="btn-primary" onClick={openNewUploadModal}>
            + Upload New List
          </button>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <input 
            type="text" 
            placeholder="Search by list name or user..." 
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select className="select-input" value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="select-input" value={userFilter} onChange={handleUserFilterChange}>
            <option value="All Users">All Users</option>
            {Array.from(new Set(lists.map(i => i.user))).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <input type="date" className="date-input" onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="date-input" onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>List Name</th>
                <th>Uploaded By</th>
                <th>Phone Number</th>
                <th>Items</th>
                <th>Downloads</th>
                <th>Status</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDisplayedLists.length > 0 ? (
                currentDisplayedLists.map((row, index) => (
                  <tr key={row.id}>
                    {/* Calculated Serial Number */}
                    <td>
                      <strong>{startIndex + index + 1}</strong>
                    </td>
                    <td>
                      <div className="file-cell">
                        <div>
                          <strong>{row.name}</strong>
                          <br/><small style={{color: '#64748b'}}>{row.file}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-circle">{row.user.charAt(0)}</div>
                        <div>
                          <strong>{row.user}</strong>
                          <br/><small style={{color: '#64748b'}}>{row.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>{row.phone}</td>
                    <td>{row.items} items</td>
                    <td>
                      <strong>{row.downloads}</strong>
                      <br/><small className="text-green">+{row.todayDL} today</small>
                    </td>
                    <td>
                      <span className={`badge ${row.status === 'Active' ? 'badge-active' : row.status === 'Expired' ? 'badge-expired' : 'badge-inactive'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn" onClick={() => handleDownload(row)} title="Download Invoice">📥</button>
                        <button className="icon-btn" onClick={() => setViewDetailsModal(row)} title="View Details">👁️</button>
                        
                        {/* Toggle Status Button */}
                        <button 
                          className={`status-btn ${row.status === 'Active' ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => toggleStatus(row.id)}
                          title="Toggle Status"
                        >
                          {row.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Three Dots Button */}
                        <button className="icon-btn" onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}>⋮</button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdownId === row.id && (
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => handleEdit(row)}>
                              ✏️ Edit
                            </button>
                            <button className="dropdown-item" onClick={() => toggleStatus(row.id)}>
                              🔄 Set {row.status === 'Active' ? 'Inactive' : 'Active'}
                            </button>
                            <button className="dropdown-item text-danger" onClick={() => handleDelete(row.id)}>
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="pagination-row">
          <span>
            Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalItems)} of {totalItems} lists
          </span>

          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button 
                key={page} 
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="info-banner">
          <span>💡 <strong>Tips for Better Results:</strong> Upload clear and well-structured lists in Excel (.xlsx) or PDF format for fast processing.</span>
          <span>📋</span>
        </div>
      </div>

      {/* 3. BOTTOM HORIZONTAL SECTION */}
      <div className="bottom-horizontal-grid">
        <div className="bottom-card">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 12}}>
            <strong>Upload Summary</strong>
            <small style={{color: '#64748b'}}>This Month Overview</small>
          </div>
          <div className="donut-wrapper">
            <div className="donut-inner">
              <strong>{lists.length}</strong>
              <span>Total Lists</span>
            </div>
          </div>
          <ul className="legend-list">
            <li className="legend-item"><span>🟢 Active</span> <strong>{lists.filter(i => i.status === 'Active').length}</strong></li>
            <li className="legend-item"><span>🟡 Pending</span> <strong>1</strong></li>
            <li className="legend-item"><span>🔴 Expired</span> <strong>{lists.filter(i => i.status === 'Expired').length}</strong></li>
            <li className="legend-item"><span>🔵 Downloaded</span> <strong>295</strong></li>
          </ul>
        </div>

        <div className="bottom-card">
          <h4 style={{marginTop:0}}>👤 How List Upload Works?</h4>
          <ol style={{paddingLeft: 18, fontSize: 13, lineHeight: '1.8', margin: 0}}>
            <li><strong className="text-green">1.</strong> Upload your list (Excel/PDF)</li>
            <li><strong className="text-green">2.</strong> We process and validate it</li>
            <li><strong className="text-green">3.</strong> Available for download</li>
            <li><strong className="text-green">4.</strong> Get items delivered fast</li>
          </ol>
        </div>

        <div className="bottom-card">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 12}}>
            <strong>Recent Uploads</strong>
            <small className="text-green" style={{cursor:'pointer'}}>View All</small>
          </div>
          {lists.slice(0, 3).map(i => (
            <div key={i.id} style={{fontSize: 12, marginBottom: 10}}>
              <strong>{i.file}</strong>
              <div style={{color:'#64748b'}}>{i.date}</div>
            </div>
          ))}
        </div>

        <div className="bottom-card" style={{background: '#ecfdf5', borderColor: '#a7f3d0'}}>
          <h4 style={{marginTop:0}}>🎧 Need Help?</h4>
          <p style={{fontSize: 13, color: '#047857'}}>Our support team is here to help you with uploads.</p>
          <button className="btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: 16}}>
            Contact Support
          </button>
        </div>
      </div>

      {/* ================= MODAL 1: UPLOAD / EDIT LIST ================= */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-custom-styled">
            <div className="modal-header">
              <h3>{editingId ? 'Edit List Details' : 'Upload New List'}</h3>
              <button className="close-btn" onClick={() => setIsUploadModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="ref-modal-form">
              <div className="form-group">
                <label>List Title <span className="req-asterisk">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Daily Groceries" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Uploaded By <span className="req-asterisk">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  required 
                  value={formData.uploadedBy}
                  onChange={(e) => setFormData({...formData, uploadedBy: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+91 9876543210" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Items Count <span className="req-asterisk">*</span></label>
                <input 
                  type="number" 
                  placeholder="e.g. 15" 
                  required
                  min="1"
                  value={formData.items}
                  onChange={(e) => setFormData({...formData, items: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Attach File (.xlsx or .pdf) <span className="req-asterisk">*</span></label>
                <div className="ref-drop-zone">
                  <div className="cloud-icon">☁️</div>
                  <input 
                    type="file" 
                    required={!editingId} 
                    style={{display: 'none'}} 
                    id="fileInput" 
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  />
                  <label htmlFor="fileInput" className="file-label">
                    {formData.file ? formData.file.name : 'Click to select file'}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Price <span className="req-asterisk">*</span></label>
                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>
                  <input 
                    type="text" 
                    placeholder="e.g. 1000.00" 
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Service Charge <span className="req-asterisk">*</span></label>
                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>
                  <input 
                    type="text" 
                    placeholder="e.g. 50.00" 
                    required 
                    value={formData.serviceCharge}
                    onChange={(e) => setFormData({...formData, serviceCharge: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Handling Charge <span className="req-asterisk">*</span></label>
                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>
                  <input 
                    type="text" 
                    placeholder="e.g. 30.00" 
                    required 
                    value={formData.handlingCharge}
                    onChange={(e) => setFormData({...formData, handlingCharge: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GST (%) <span className="req-asterisk">*</span></label>
                <div className="input-group-addon">
                  <input 
                    type="text" 
                    placeholder="e.g. 18" 
                    required 
                    value={formData.gst}
                    onChange={(e) => setFormData({...formData, gst: e.target.value})} 
                  />
                  <span className="addon-suffix">%</span>
                </div>
              </div>

              <div className="modal-footer ref-modal-footer">
                <button type="button" className="btn-ref-cancel" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-ref-submit">{editingId ? 'Save Changes' : 'Upload List'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: VIEW DETAILS ================= */}
      {viewDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-custom-styled">
            <div className="modal-header">
              <h3>View List Details</h3>
              <button className="close-btn" onClick={() => setViewDetailsModal(null)}>×</button>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className="ref-modal-form">
              <div className="form-group">
                <label>List Title</label>
                <input type="text" value={viewDetailsModal.name || ''} readOnly />
              </div>

              <div className="form-group">
                <label>Uploaded By</label>
                <input type="text" value={`${viewDetailsModal.user || ''} (${viewDetailsModal.role || 'Customer'})`} readOnly />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={viewDetailsModal.phone || 'N/A'} readOnly />
              </div>

              <div className="form-group">
                <label>Items</label>
                <input type="text" value={`${viewDetailsModal.items || 0} items`} readOnly />
              </div>

              <div className="form-group">
                <label>File Name</label>
                <input type="text" value={viewDetailsModal.file || 'N/A'} readOnly />
              </div>

              <div className="form-group">
                <label>Price</label>
                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>
                  <input type="text" value={viewDetailsModal.price || '0.00'} readOnly />
                </div>
              </div>

              {viewDetailsModal.serviceCharge && (
                <div className="form-group">
                  <label>Service Charge</label>
                  <div className="input-group-addon">
                    <span className="addon-prefix">₹</span>
                    <input type="text" value={viewDetailsModal.serviceCharge} readOnly />
                  </div>
                </div>
              )}

              {viewDetailsModal.handlingCharge && (
                <div className="form-group">
                  <label>Handling Charge</label>
                  <div className="input-group-addon">
                    <span className="addon-prefix">₹</span>
                    <input type="text" value={viewDetailsModal.handlingCharge} readOnly />
                  </div>
                </div>
              )}

              {viewDetailsModal.gst && (
                <div className="form-group">
                  <label>GST (%)</label>
                  <div className="input-group-addon">
                    <input type="text" value={viewDetailsModal.gst} readOnly />
                    <span className="addon-suffix">%</span>
                  </div>
                </div>
              )}

              <div className="modal-footer ref-modal-footer">
                <button type="button" className="btn-ref-cancel" onClick={() => setViewDetailsModal(null)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: INVOICE / RECEIPT DOWNLOAD (REF IMAGE MATCHED) ================= */}
      {downloadInvoiceModal && (
        <div className="modal-overlay print-modal-overlay">
          <div className="invoice-container printable-area">
            
            {/* Non-printable Control Header */}
            <div className="invoice-controls no-print">
              <span>Receipt Preview</span>
              <div>
                <button className="btn-primary print-trigger-btn" onClick={handlePrintReceipt}>
                  🖨️ Print / Save PDF
                </button>
                <button className="close-btn modal-close-icon" onClick={() => setDownloadInvoiceModal(null)}>×</button>
              </div>
            </div>

            {/* Receipt Header Branding */}
            <div className="invoice-header">
              <div className="brand-box">
                <div className="brand-logo">🛍️</div>
                <div>
                  <h2 className="brand-title">Groicessary<br/><span>Sathi</span></h2>
                  <p className="brand-sub">Your Grocery, Our Responsibility</p>
                </div>
              </div>

              <div className="invoice-meta-box">
                <h1 className="invoice-title-badge">INVOICE / RECEIPT</h1>
                <p className="thankyou-tag">Thank you for shopping with us!</p>
                
                <table className="meta-table">
                  <tbody>
                    <tr>
                      <td>Invoice Date</td>
                      <td>:</td>
                      <td>04 Aug 2026</td>
                    </tr>
                    <tr>
                      <td>Invoice Time</td>
                      <td>:</td>
                      <td>11:42 AM</td>
                    </tr>
                    <tr>
                      <td>Receipt No.</td>
                      <td>:</td>
                      <td>GS-INV-{downloadInvoiceModal.id}458921</td>
                    </tr>
                    <tr>
                      <td>Payment Status</td>
                      <td>:</td>
                      <td><span className="badge-green-pill">Received</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="confirmed-seal">
                <span>ORDER CONFIRMED</span>
                <span className="check-mark">✓</span>
              </div>
            </div>

            {/* Order Banner */}
            <div className="order-id-banner">
              <div className="order-id-icon">📄</div>
              <div>
                <small>ORDER ID</small>
                <h3>GS-240804-{downloadInvoiceModal.id}025</h3>
              </div>
              <p className="banner-msg">Your grocery list has been received successfully. Our team will review and contact you shortly.</p>
              <div className="handwritten-thankyou">Thank You! ♥</div>
            </div>

            {/* Middle Grid */}
            <div className="invoice-body-grid">
              
              {/* Left Column */}
              <div className="invoice-left-col">
                <div className="info-block">
                  <h4>👤 CUSTOMER DETAILS</h4>
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>Name</td>
                        <td>:</td>
                        <td><strong>{downloadInvoiceModal.user}</strong></td>
                      </tr>
                      <tr>
                        <td>Phone</td>
                        <td>:</td>
                        <td>{downloadInvoiceModal.phone}</td>
                      </tr>
                      <tr>
                        <td>Email</td>
                        <td>:</td>
                        <td>customer@example.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="info-block">
                  <h4>📍 DELIVERY ADDRESS</h4>
                  <p className="address-text">
                    House No. 12, Green Park,<br/>
                    Patia, Bhubaneswar,<br/>
                    Odisha - 751024
                  </p>
                </div>

                <div className="info-block">
                  <h4>📋 UPLOADED LIST</h4>
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>List Name</td>
                        <td>:</td>
                        <td><strong>{downloadInvoiceModal.name}</strong></td>
                      </tr>
                      <tr>
                        <td>File Name</td>
                        <td>:</td>
                        <td>{downloadInvoiceModal.file}</td>
                      </tr>
                      <tr>
                        <td>File Type</td>
                        <td>:</td>
                        <td>{downloadInvoiceModal.file.endsWith('.pdf') ? 'PDF' : 'EXCEL'}</td>
                      </tr>
                      <tr>
                        <td>Upload Status</td>
                        <td>:</td>
                        <td><span className="text-green font-bold">✓ Uploaded Successfully</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="response-time-card">
                  <span className="clock-icon">🕒</span>
                  <div>
                    <small>Estimated Response Time</small>
                    <div className="time-val">15 - 30 Minutes</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Billing Calculations */}
              <div className="invoice-right-col">
                <table className="price-breakdown-table">
                  <thead>
                    <tr>
                      <th>DESCRIPTION</th>
                      <th style={{textAlign: 'right'}}>AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Items Total (As per List)</td>
                      <td style={{textAlign: 'right'}}>₹{Number(downloadInvoiceModal.price || 748).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Service Charge</td>
                      <td style={{textAlign: 'right'}}>₹{Number(downloadInvoiceModal.serviceCharge || 10).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Handling & Packing</td>
                      <td style={{textAlign: 'right'}}>₹{Number(downloadInvoiceModal.handlingCharge || 20).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Delivery Charge</td>
                      <td style={{textAlign: 'right'}}>₹30.00</td>
                    </tr>
                    <tr>
                      <td>GST ({downloadInvoiceModal.gst || 0}%)</td>
                      <td style={{textAlign: 'right'}}>₹0.00</td>
                    </tr>
                    <tr className="total-row">
                      <td>TOTAL AMOUNT</td>
                      <td style={{textAlign: 'right', fontSize: 18, color: '#00b074'}}>
                        ₹{(
                          Number(downloadInvoiceModal.price || 748) + 
                          Number(downloadInvoiceModal.serviceCharge || 10) + 
                          Number(downloadInvoiceModal.handlingCharge || 20) + 
                          30
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="amount-received-card">
                  <div className="wallet-icon">👛</div>
                  <div>
                    <small>Amount Received</small>
                    <h3>₹{(
                      Number(downloadInvoiceModal.price || 748) + 
                      Number(downloadInvoiceModal.serviceCharge || 10) + 
                      Number(downloadInvoiceModal.handlingCharge || 20) + 
                      30
                    ).toFixed(2)}</h3>
                  </div>
                </div>

                <p className="trust-note">
                  Thank you for trusting Groicessary Sathi.<br/>
                  We look forward to serving you!
                </p>
              </div>

            </div>

            {/* Order Progress Line */}
            <div className="order-progress-wrapper">
              <h4 className="progress-title">ORDER PROGRESS</h4>
              <div className="progress-steps">
                <div className="step active">
                  <div className="step-icon">📋</div>
                  <strong>Received</strong>
                  <small>04 Aug 2026<br/>11:42 AM</small>
                </div>
                <div className="step-line">➔</div>
                <div className="step">
                  <div className="step-icon">🔍</div>
                  <strong>Reviewing List</strong>
                  <small>In Progress</small>
                </div>
                <div className="step-line">➔</div>
                <div className="step">
                  <div className="step-icon">📦</div>
                  <strong>Packing</strong>
                  <small>Pending</small>
                </div>
                <div className="step-line">➔</div>
                <div className="step">
                  <div className="step-icon">🛵</div>
                  <strong>Out for Delivery</strong>
                  <small>Pending</small>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="invoice-footer-bar">
              <div className="footer-support-card">
                <h5>Need Help?</h5>
                <p>📞 +91 98765 43210</p>
                <p>✉️ support@groicessarysathi.com</p>
                <p>🌐 www.groicessarysathi.com</p>
              </div>

              <div className="footer-gratitude">
                <h3>Thank You! ♥</h3>
                <p>We appreciate your trust in Groicessary Sathi.</p>
                <div className="stars">★★★★★</div>
              </div>

              <div className="footer-qr-card">
                <small>Scan to Track Your Order</small>
                <div className="qr-code-placeholder">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=GroicessarySathiuTrackOrder" alt="QR Code" />
                </div>
              </div>
            </div>

            <div className="green-bottom-strip">
              <span>🔒 100% Secure & Private</span>
              <span>🌱 Fresh | Safe | On Time</span>
              <span>Follow Us On: 📘 📷 💬</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ListUploads;
import React, { useState } from 'react';
import './ListUploads.css';

const INITIAL_DATA = [
  { id: 1, name: 'Daily Groceries', file: 'daily_groceries.xlsx', user: 'Rohit Sharma', role: 'Customer', phone: '+91 9876543210', items: 24, downloads: 45, todayDL: 8, status: 'Active', date: '2025-05-10 10:30 AM' },
  { id: 2, name: 'Weekly Essentials', file: 'weekly_essentials.pdf', user: 'Priya Patnaik', role: 'Customer', phone: '+91 8765432109', items: 18, downloads: 32, todayDL: 5, status: 'Active', date: '2025-05-10 10:25 AM' },
  { id: 3, name: 'Monthly Shopping', file: 'monthly_shopping.xlsx', user: 'Amit Kumar', role: 'Customer', phone: '+91 7654321098', items: 32, downloads: 68, todayDL: 12, status: 'Active', date: '2025-05-10 10:20 AM' },
  { id: 4, name: 'Party List', file: 'party_list.pdf', user: 'Sneha Rani', role: 'Customer', phone: '+91 6543210987', items: 15, downloads: 28, todayDL: 4, status: 'Active', date: '2025-05-10 10:15 AM' },
  { id: 5, name: 'Fruits & Vegetables', file: 'fruits_vegetables.xlsx', user: 'Manoj Behera', role: 'Customer', phone: '+91 5432109876', items: 8, downloads: 12, todayDL: 2, status: 'Expired', date: '2025-05-09 09:55 AM' },
  { id: 6, name: 'Office Supplies', file: 'office_supplies.xlsx', user: 'Rohan Mehta', role: 'Customer', phone: '+91 9988776655', items: 40, downloads: 15, todayDL: 1, status: 'Active', date: '2025-05-08 11:20 AM' },
  { id: 7, name: 'Home Electronics', file: 'electronics.pdf', user: 'Kavita Das', role: 'Customer', phone: '+91 8877665544', items: 12, downloads: 50, todayDL: 9, status: 'Active', date: '2025-05-07 03:45 PM' },
  { id: 8, name: 'Hardware Items', file: 'hardware.xlsx', user: 'Suresh Verma', role: 'Customer', phone: '+91 7766554433', items: 20, downloads: 8, todayDL: 0, status: 'Expired', date: '2025-05-06 01:10 PM' }
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

  const [formData, setFormData] = useState({ title: '', uploadedBy: '', phone: '', file: null });

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

  // Pagination Change Handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  // Action Handlers
  const handleDownload = (fileName) => {
    alert(`Starting download for: ${fileName}`);
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

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      name: formData.title || 'Untitled List',
      file: formData.file ? formData.file.name : 'new_upload.xlsx',
      user: formData.uploadedBy || 'Guest User',
      role: 'Customer',
      phone: formData.phone || '+91 0000000000',
      items: 10,
      downloads: 0,
      todayDL: 0,
      status: 'Active',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLists([newItem, ...lists]);
    setIsUploadModalOpen(false);
    setFormData({ title: '', uploadedBy: '', phone: '', file: null });
  };

  return (
    <div className="list-uploads-container">
      
      {/* 1. TOP 5 STATS CARDS */}
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

      {/* 2. MIDDLE LIST TABLE SECTION */}
      <div className="table-container">
        <div className="header-row">
          <div>
            <h2>All Uploaded Lists</h2>
            <p>View, manage and download all uploaded lists</p>
          </div>
          <button className="btn-primary" onClick={() => setIsUploadModalOpen(true)}>
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
                currentDisplayedLists.map((row) => (
                  <tr key={row.id}>
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
                        <button className="icon-btn" onClick={() => handleDownload(row.file)} title="Download">📥</button>
                        <button className="icon-btn" onClick={() => setViewDetailsModal(row)} title="View Details">👁️</button>
                        <button className="icon-btn" onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}>⋮</button>
                        
                        {activeDropdownId === row.id && (
                          <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={() => toggleStatus(row.id)}>
                              Set {row.status === 'Active' ? 'Inactive' : 'Active'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
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
        
        {/* Widget 1: Summary Chart */}
        <div className="bottom-card">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 12}}>
            <strong>Upload Summary</strong>
            <small style={{color: '#64748b'}}>This Month Overview</small>
          </div>
          <div className="donut-wrapper">
            <div className="donut-inner">
              <strong>8</strong>
              <span>Total Lists</span>
            </div>
          </div>
          <ul className="legend-list">
            <li className="legend-item"><span>🟢 Active</span> <strong>5 (62.5%)</strong></li>
            <li className="legend-item"><span>🟡 Pending</span> <strong>1 (12.5%)</strong></li>
            <li className="legend-item"><span>🔴 Expired</span> <strong>1 (12.5%)</strong></li>
            <li className="legend-item"><span>🔵 Downloaded</span> <strong>295</strong></li>
          </ul>
        </div>

        {/* Widget 2: Steps Instructions */}
        <div className="bottom-card">
          <h4 style={{marginTop:0}}>👤 How List Upload Works?</h4>
          <ol style={{paddingLeft: 18, fontSize: 13, lineHeight: '1.8', margin: 0}}>
            <li><strong className="text-green">1.</strong> Upload your list (Excel/PDF)</li>
            <li><strong className="text-green">2.</strong> We process and validate it</li>
            <li><strong className="text-green">3.</strong> Available for download</li>
            <li><strong className="text-green">4.</strong> Get items delivered fast</li>
          </ol>
        </div>

        {/* Widget 3: Recent Activity */}
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

        {/* Widget 4: Support */}
        <div className="bottom-card" style={{background: '#ecfdf5', borderColor: '#a7f3d0'}}>
          <h4 style={{marginTop:0}}>🎧 Need Help?</h4>
          <p style={{fontSize: 13, color: '#047857'}}>Our support team is here to help you with uploads.</p>
          <button className="btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: 16}}>
            Contact Support
          </button>
        </div>

      </div>

      {/* ================= MODAL 1: UPLOAD NEW LIST ================= */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload New List</h3>
              <button className="close-btn" onClick={() => setIsUploadModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>List Title <span style={{color:'red'}}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Daily Groceries" 
                  required 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Uploaded By <span style={{color:'red'}}>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  required 
                  onChange={(e) => setFormData({...formData, uploadedBy: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+91 9876543210" 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Attach File (.xlsx or .pdf) <span style={{color:'red'}}>*</span></label>
                <div className="drop-zone">
                  <div style={{fontSize: 24, color: 'var(--primary)'}}>☁️</div>
                  <input 
                    type="file" 
                    required 
                    style={{display: 'none'}} 
                    id="fileInput" 
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  />
                  <label htmlFor="fileInput" style={{cursor:'pointer', fontWeight: 'bold', color: 'var(--primary)'}}>
                    {formData.file ? formData.file.name : 'Click to select file'}
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload List</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: VIEW DETAILS ================= */}
      {viewDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>View List Details</h3>
              <button className="close-btn" onClick={() => setViewDetailsModal(null)}>×</button>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>List Title</label>
                <input 
                  type="text" 
                  value={viewDetailsModal.name} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label>Uploaded By</label>
                <input 
                  type="text" 
                  value={`${viewDetailsModal.user} (${viewDetailsModal.role})`} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={viewDetailsModal.phone} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label>File Name</label>
                <input 
                  type="text" 
                  value={viewDetailsModal.file} 
                  readOnly 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setViewDetailsModal(null)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListUploads;
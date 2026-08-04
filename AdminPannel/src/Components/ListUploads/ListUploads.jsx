import React, { useState, useEffect, useRef } from 'react';
import { 
  FaFileAlt, FaDownload, FaCheckCircle, FaClock, FaTimesCircle, 
  FaPlus, FaSearch, FaFilter, FaEye, FaEllipsisV, 
  FaLightbulb, FaHeadset, FaTimes, FaFileExcel, FaFilePdf, FaCloudUploadAlt, FaCalendarAlt, FaUndo
} from 'react-icons/fa';
import './ListUploads.css';

// Mock Data
const INITIAL_LISTS = [
  { id: 1, name: 'Daily Groceries', fileName: 'daily_groceries.xlsx', type: 'excel', uploadedBy: 'Rohit Sharma', role: 'Customer', avatar: 'R', avatarBg: '#00838f', phone: '+91 9876543210', itemsCount: 24, items: '24 items', downloads: 45, todayDownloads: '+8 today', status: 'Active', uploadedOn: '2025-05-10', time: '10:30 AM' },
  { id: 2, name: 'Weekly Essentials', fileName: 'weekly_essentials.pdf', type: 'pdf', uploadedBy: 'Priya Patnaik', role: 'Customer', avatar: 'P', avatarBg: '#3f51b5', phone: '+91 8765432109', itemsCount: 18, items: '18 items', downloads: 32, todayDownloads: '+5 today', status: 'Active', uploadedOn: '2025-05-10', time: '10:25 AM' },
  { id: 3, name: 'Monthly Shopping', fileName: 'monthly_shopping.xlsx', type: 'excel', uploadedBy: 'Amit Kumar', role: 'Customer', avatar: 'A', avatarBg: '#5c6bc0', phone: '+91 7654321098', itemsCount: 32, items: '32 items', downloads: 68, todayDownloads: '+12 today', status: 'Active', uploadedOn: '2025-05-10', time: '10:20 AM' },
  { id: 4, name: 'Party List', fileName: 'party_list.pdf', type: 'pdf', uploadedBy: 'Sneha Rani', role: 'Customer', avatar: 'S', avatarBg: '#1e88e5', phone: '+91 6543210987', itemsCount: 15, items: '15 items', downloads: 28, todayDownloads: '+4 today', status: 'Active', uploadedOn: '2025-05-10', time: '10:15 AM' },
  { id: 5, name: 'Fruits & Vegetables', fileName: 'fruits_vegetables.xlsx', type: 'excel', uploadedBy: 'Manoj Behera', role: 'Customer', avatar: 'M', avatarBg: '#039be5', phone: '+91 5432109876', itemsCount: 8, items: '8 items', downloads: 12, todayDownloads: '+2 today', status: 'Expired', uploadedOn: '2025-05-09', time: '09:55 AM' },
  { id: 6, name: 'Office Supplies', fileName: 'office_supplies.pdf', type: 'pdf', uploadedBy: 'Karan Singh', role: 'Vendor', avatar: 'K', avatarBg: '#8e24aa', phone: '+91 9988776655', itemsCount: 50, items: '50 items', downloads: 15, todayDownloads: '+1 today', status: 'Pending', uploadedOn: '2025-05-08', time: '04:12 PM' },
  { id: 7, name: 'Hardware Items', fileName: 'hardware_tools.xlsx', type: 'excel', uploadedBy: 'Anil Kumar', role: 'Customer', avatar: 'A', avatarBg: '#d81b60', phone: '+91 8877665544', itemsCount: 42, items: '42 items', downloads: 90, todayDownloads: '+15 today', status: 'Active', uploadedOn: '2025-05-08', time: '02:30 PM' },
  { id: 8, name: 'Bakery Orders', fileName: 'bakery_list.pdf', type: 'pdf', uploadedBy: 'Pooja Roy', role: 'Customer', avatar: 'P', avatarBg: '#43a047', phone: '+91 7766554433', itemsCount: 11, items: '11 items', downloads: 5, todayDownloads: '+0 today', status: 'Inactive', uploadedOn: '2025-05-07', time: '11:10 AM' },
];

const ListUploads = () => {
  // Main Data States
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [filteredLists, setFilteredLists] = useState(INITIAL_LISTS);
  
  // Search & Basic Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  // Calendar Date Range Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expandable Advanced Filter Panel State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState('All');
  const [minItemsFilter, setMinItemsFilter] = useState('');

  // Pagination (5 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dropdown Menu State
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    listName: '',
    uploadedBy: '',
    phone: '',
    file: null
  });

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combined Filtering logic (Search + Status + Role + Calendar Dates + File Format + Item Count)
  useEffect(() => {
    let result = [...lists];

    // 1. Search Bar Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.uploadedBy.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q)
      );
    }

    // 2. Status Dropdown Filter
    if (statusFilter !== 'All') {
      result = result.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // 3. User Role Filter
    if (userFilter !== 'All') {
      result = result.filter(item => item.role.toLowerCase() === userFilter.toLowerCase());
    }

    // 4. File Type Filter
    if (fileTypeFilter !== 'All') {
      result = result.filter(item => item.type.toLowerCase() === fileTypeFilter.toLowerCase());
    }

    // 5. Min Items Filter
    if (minItemsFilter) {
      result = result.filter(item => item.itemsCount >= parseInt(minItemsFilter, 10));
    }

    // 6. Date Range Filtering
    if (startDate) {
      result = result.filter(item => new Date(item.uploadedOn) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(item => new Date(item.uploadedOn) <= new Date(endDate));
    }

    setFilteredLists(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, userFilter, startDate, endDate, fileTypeFilter, minItemsFilter, lists]);

  // Actions
  const handleStatusChange = (id, newStatus) => {
    setLists(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setActiveDropdown(null);
  };

  const handleDownload = (fileName) => {
    alert(`Downloading ${fileName}...`);
  };

  const handleView = (item) => {
    alert(`Details:\nList Name: ${item.name}\nFile Name: ${item.fileName}\nUploaded On: ${item.uploadedOn}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setUserFilter('All');
    setStartDate('');
    setEndDate('');
    setFileTypeFilter('All');
    setMinItemsFilter('');
  };

  // Upload Submission
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFormData.listName || !uploadFormData.uploadedBy || !uploadFormData.file) {
      alert('Please fill in all required fields and upload a file.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isPdf = uploadFormData.file.name.endsWith('.pdf');
    
    const newList = {
      id: Date.now(),
      name: uploadFormData.listName,
      fileName: uploadFormData.file.name,
      type: isPdf ? 'pdf' : 'excel',
      uploadedBy: uploadFormData.uploadedBy,
      role: 'Customer',
      avatar: uploadFormData.uploadedBy.charAt(0).toUpperCase(),
      avatarBg: '#004d40',
      phone: uploadFormData.phone || '+91 9999999999',
      itemsCount: 10,
      items: '10 items',
      downloads: 0,
      todayDownloads: '+0 today',
      status: 'Active',
      uploadedOn: todayStr,
      time: 'Just now'
    };

    setLists([newList, ...lists]);
    setIsModalOpen(false);
    setUploadFormData({ listName: '', uploadedBy: '', phone: '', file: null });
  };

  // Stats Calculations
  const totalListsCount = lists.length;
  const activeCount = lists.filter(l => l.status === 'Active').length;
  const pendingCount = lists.filter(l => l.status === 'Pending').length;
  const expiredCount = lists.filter(l => l.status === 'Expired').length;
  const totalDownloadsCount = lists.reduce((acc, curr) => acc + curr.downloads, 0);

  // Pagination Math
  const totalPages = Math.ceil(filteredLists.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredLists.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="lu-container">
      {/* Top 5 Stat Cards - Full Width Covering Layout */}
      <div className="lu-full-width-section">
        <div className="lu-stats-grid">
          <div className="lu-stat-card">
            <div className="lu-stat-icon green"><FaFileAlt /></div>
            <div className="lu-stat-info">
              <span className="lu-stat-title">Total Lists</span>
              <h2>{totalListsCount}</h2>
              <span className="lu-stat-sub green-text">+12 this month</span>
            </div>
          </div>

          <div className="lu-stat-card">
            <div className="lu-stat-icon orange"><FaDownload /></div>
            <div className="lu-stat-info">
              <span className="lu-stat-title">Total Downloads</span>
              <h2>{totalDownloadsCount}</h2>
              <span className="lu-stat-sub green-text">+18.5% this month</span>
            </div>
          </div>

          <div className="lu-stat-card">
            <div className="lu-stat-icon blue"><FaCheckCircle /></div>
            <div className="lu-stat-info">
              <span className="lu-stat-title">Active Lists</span>
              <h2>{activeCount}</h2>
              <span className="lu-stat-sub green-text">{((activeCount / totalListsCount) * 100 || 0).toFixed(1)}% of total</span>
            </div>
          </div>

          <div className="lu-stat-card">
            <div className="lu-stat-icon purple"><FaClock /></div>
            <div className="lu-stat-info">
              <span className="lu-stat-title">Pending Lists</span>
              <h2>{pendingCount}</h2>
              <span className="lu-stat-sub green-text">{((pendingCount / totalListsCount) * 100 || 0).toFixed(1)}% of total</span>
            </div>
          </div>

          <div className="lu-stat-card">
            <div className="lu-stat-icon red"><FaTimesCircle /></div>
            <div className="lu-stat-info">
              <span className="lu-stat-title">Expired Lists</span>
              <h2>{expiredCount}</h2>
              <span className="lu-stat-sub red-text">{((expiredCount / totalListsCount) * 100 || 0).toFixed(1)}% of total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="lu-main-layout">
        
        {/* Left Column: Table & Filters */}
        <div className="lu-left-column">
          
          <div className="lu-table-header">
            <div>
              <h3>All Uploaded Lists</h3>
              <p className="lu-subtitle">View, manage and download all uploaded lists</p>
            </div>
            <button className="lu-btn-primary" onClick={() => setIsModalOpen(true)}>
              <FaPlus /> Upload New List
            </button>
          </div>

          {/* Primary Filter & Search Bar */}
          <div className="lu-filter-bar">
            {/* Search Input */}
            <div className="lu-search-box">
              <FaSearch className="lu-search-icon" />
              <input 
                type="text" 
                placeholder="Search by list name or user..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Selector */}
            <select className="lu-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* User Role Selector */}
            <select className="lu-select" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="All">All Users</option>
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor</option>
            </select>

            {/* CALENDAR DATE RANGE PICKER */}
            <div className="lu-date-range-container">
              <FaCalendarAlt className="lu-calendar-icon" />
              <input 
                type="date" 
                className="lu-date-input"
                title="Start Date"
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
              <span className="lu-date-separator">-</span>
              <input 
                type="date" 
                className="lu-date-input"
                title="End Date"
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>

            {/* FILTER BUTTON WITH TOGGLE DRAWER */}
            <button 
              className={`lu-btn-filter ${isFilterPanelOpen ? 'active' : ''}`}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            >
              <FaFilter /> Filter
            </button>

            {(startDate || endDate || searchQuery || statusFilter !== 'All' || userFilter !== 'All' || fileTypeFilter !== 'All' || minItemsFilter) && (
              <button className="lu-btn-reset" title="Reset All Filters" onClick={handleResetFilters}>
                <FaUndo /> Reset
              </button>
            )}
          </div>

          {/* Expandable Advanced Filter Drawer */}
          {isFilterPanelOpen && (
            <div className="lu-filter-drawer">
              <div className="lu-drawer-group">
                <label>File Format</label>
                <select value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)}>
                  <option value="All">All Formats</option>
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>

              <div className="lu-drawer-group">
                <label>Min Items Count</label>
                <input 
                  type="number" 
                  placeholder="e.g. 15" 
                  value={minItemsFilter} 
                  onChange={(e) => setMinItemsFilter(e.target.value)} 
                />
              </div>

              <button className="lu-btn-clear-drawer" onClick={handleResetFilters}>
                Clear All
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="lu-table-wrapper">
            <table className="lu-table">
              <thead>
                <tr>
                  <th>List Name</th>
                  <th>Uploaded By</th>
                  <th>Phone Number</th>
                  <th>Items</th>
                  <th>Downloads</th>
                  <th>Status</th>
                  <th>Uploaded On</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="lu-file-cell">
                          {item.type === 'excel' ? (
                            <div className="lu-file-icon excel"><FaFileExcel /></div>
                          ) : (
                            <div className="lu-file-icon pdf"><FaFilePdf /></div>
                          )}
                          <div>
                            <strong className="lu-file-title">{item.name}</strong>
                            <span className="lu-file-sub">{item.fileName}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="lu-user-cell">
                          <div className="lu-avatar" style={{ backgroundColor: item.avatarBg }}>
                            {item.avatar}
                          </div>
                          <div>
                            <strong className="lu-user-name">{item.uploadedBy}</strong>
                            <span className="lu-user-role">{item.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="lu-phone">{item.phone}</td>

                      <td>
                        <span className="lu-item-badge">{item.items}</span>
                      </td>

                      <td>
                        <div className="lu-downloads-cell">
                          <strong>{item.downloads}</strong>
                          <small>{item.todayDownloads}</small>
                        </div>
                      </td>

                      <td>
                        <span className={`lu-status-tag ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="lu-date-cell">
                          <span>{item.uploadedOn}</span>
                          <small>{item.time}</small>
                        </div>
                      </td>

                      <td>
                        <div className="lu-actions-cell">
                          <button 
                            className="lu-action-btn" 
                            title="Download List"
                            onClick={() => handleDownload(item.fileName)}
                          >
                            <FaDownload />
                          </button>
                          <button 
                            className="lu-action-btn" 
                            title="View Details"
                            onClick={() => handleView(item)}
                          >
                            <FaEye />
                          </button>

                          <div className="lu-dropdown-container">
                            <button 
                              className="lu-action-btn" 
                              title="More Actions"
                              onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                            >
                              <FaEllipsisV />
                            </button>

                            {activeDropdown === item.id && (
                              <div className="lu-dropdown-menu" ref={dropdownRef}>
                                <button onClick={() => handleStatusChange(item.id, 'Active')}>
                                  Set Active
                                </button>
                                <button onClick={() => handleStatusChange(item.id, 'Inactive')}>
                                  Set Inactive
                                </button>
                                <button onClick={() => handleStatusChange(item.id, 'Pending')}>
                                  Set Pending
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
                    <td colSpan="8" className="lu-empty">No lists matching selected filters or date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="lu-pagination-wrapper">
            <span className="lu-pagination-info">
              Showing {filteredLists.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLists.length)} of {filteredLists.length} lists
            </span>

            <div className="lu-pagination">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Bottom Green Tip Card */}
          <div className="lu-tips-banner">
            <div className="lu-tip-content">
              <div className="lu-tip-icon"><FaLightbulb /></div>
              <div>
                <strong>Tips for Better Results</strong>
                <p>Upload clear and well-structured lists in Excel (.xlsx) or PDF format. Make sure all items are readable for fast processing.</p>
              </div>
            </div>
            <div className="lu-tip-graphic">📋</div>
          </div>

        </div>

        {/* Right Sidebar Widgets */}
        <div className="lu-right-column">
          
          <div className="lu-card lu-summary-card">
            <div className="lu-card-header">
              <h4>Upload Summary</h4>
              <span>This Month Overview</span>
            </div>

            <div className="lu-chart-container">
              <div className="lu-donut-chart">
                <div className="lu-chart-center">
                  <h3>{totalListsCount}</h3>
                  <span>Total Lists</span>
                </div>
              </div>
            </div>

            <div className="lu-summary-list">
              <div className="lu-summary-item">
                <span className="lu-dot active"></span>
                <span className="label">Active</span>
                <span className="value">{activeCount} ({((activeCount/totalListsCount)*100 || 0).toFixed(1)}%)</span>
              </div>
              <div className="lu-summary-item">
                <span className="lu-dot pending"></span>
                <span className="label">Pending</span>
                <span className="value">{pendingCount} ({((pendingCount/totalListsCount)*100 || 0).toFixed(1)}%)</span>
              </div>
              <div className="lu-summary-item">
                <span className="lu-dot expired"></span>
                <span className="label">Expired</span>
                <span className="value">{expiredCount} ({((expiredCount/totalListsCount)*100 || 0).toFixed(1)}%)</span>
              </div>
              <div className="lu-summary-item">
                <span className="lu-dot downloaded"></span>
                <span className="label">Downloaded</span>
                <span className="value">{totalDownloadsCount}</span>
              </div>
            </div>
          </div>

          <div className="lu-card">
            <h4 className="lu-card-title green-title">👤 How List Upload Works?</h4>
            <ul className="lu-steps-list">
              <li><span>1.</span> Upload your list (Excel/PDF)</li>
              <li><span>2.</span> We process and validate it</li>
              <li><span>3.</span> Available for download</li>
              <li><span>4.</span> Get items delivered fast</li>
            </ul>
          </div>

          <div className="lu-card">
            <div className="lu-card-header">
              <h4 className="lu-card-title">Recent Uploads</h4>
              <a href="#view-all" className="lu-link">View All</a>
            </div>
            <div className="lu-recent-list">
              {lists.slice(0, 3).map((item) => (
                <div key={item.id} className="lu-recent-item">
                  <div className={`lu-recent-icon ${item.type}`}>
                    {item.type === 'excel' ? <FaFileExcel /> : <FaFilePdf />}
                  </div>
                  <div>
                    <strong>{item.fileName}</strong>
                    <span>{item.uploadedOn}, {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lu-card lu-help-card">
            <h4 className="lu-card-title"><FaHeadset /> Need Help?</h4>
            <p className="lu-help-text">Our support team is here to help you</p>
            <button className="lu-btn-support">
              <FaHeadset /> Contact Support
            </button>
          </div>

        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="lu-modal-overlay">
          <div className="lu-modal">
            <div className="lu-modal-header">
              <h3>Upload New List</h3>
              <button className="lu-modal-close" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit}>
              <div className="lu-modal-body">
                <div className="lu-form-group">
                  <label>List Title <span className="req">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Daily Groceries" 
                    value={uploadFormData.listName} 
                    onChange={(e) => setUploadFormData({...uploadFormData, listName: e.target.value})}
                    required
                  />
                </div>

                <div className="lu-form-group">
                  <label>Uploaded By <span className="req">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={uploadFormData.uploadedBy} 
                    onChange={(e) => setUploadFormData({...uploadFormData, uploadedBy: e.target.value})}
                    required
                  />
                </div>

                <div className="lu-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 9876543210" 
                    value={uploadFormData.phone} 
                    onChange={(e) => setUploadFormData({...uploadFormData, phone: e.target.value})}
                  />
                </div>

                <div className="lu-form-group">
                  <label>Attach File (.xlsx or .pdf) <span className="req">*</span></label>
                  <div className="lu-file-dropzone">
                    <input 
                      type="file" 
                      id="modalFileInput"
                      accept=".pdf, .xlsx, .xls"
                      onChange={(e) => setUploadFormData({...uploadFormData, file: e.target.files[0]})}
                      hidden 
                    />
                    <label htmlFor="modalFileInput" className="lu-file-label">
                      <FaCloudUploadAlt className="lu-upload-icon" />
                      <span>{uploadFormData.file ? uploadFormData.file.name : "Click to select file"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="lu-modal-footer">
                <button type="button" className="lu-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="lu-btn-primary">
                  Upload List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListUploads;
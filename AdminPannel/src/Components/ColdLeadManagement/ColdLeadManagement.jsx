import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import './ColdLeadManagement.css';

// SVG Icons
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a148c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const MoreVerticalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ColdLeadManagement = () => {
  const API_URL = '/cold-leads';

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  // Pagination State
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState(false);

  // Form State
  const defaultFormState = {
    name: '',
    phone: '',
    email: '',
    lookingFor: 'Fresh Vegetables',
    source: 'Website',
    date: new Date().toISOString().split('T')[0],
    status: 'New',
    notes: ''
  };
  const [formData, setFormData] = useState(defaultFormState);

  // Fetch leads from backend
  const fetchLeads = async () => {
    try {
      setLoading(true);

      const response = await API.get(API_URL);

      if (response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (error) {
      console.error('Fetch Leads Error:', error);
      alert(
        error.response?.data?.message ||
        'Unable to fetch leads. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Calculations for current page rows
  const totalLeads = leads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentLeads = leads.slice(startIndex, startIndex + pageSize);

  const newLeads = leads.filter(lead => lead.status === 'New').length;
  const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;

  // Handle Select All (for current visible page)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = currentLeads.map(lead => lead._id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = currentLeads.map(lead => lead._id);
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)));
    }
  };

  // Handle Single Row Select
  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle Page Size Change
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to page 1
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingLeadId(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (lead) => {
    setEditingLeadId(lead._id);

    setFormData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      lookingFor: lead.lookingFor || 'Fresh Vegetables',
      source: lead.source || 'Website',
      date: lead.date || new Date().toISOString().split('T')[0],
      status: lead.status || 'New',
      notes: lead.notes || ''
    });

    setActiveActionMenu(null);
    setIsModalOpen(true);
  };

  // Handle Delete Lead
  const handleDeleteLead = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this lead?'
    );

    if (!confirmed) return;

    try {
      await API.delete(`${API_URL}/${id}`);

      setLeads(previous =>
        previous.filter(lead => lead._id !== id)
      );

      setSelectedIds(previous =>
        previous.filter(selectedId => selectedId !== id)
      );

      setActiveActionMenu(null);

      // Keep pagination valid after deletion
      setCurrentPage(previousPage => {
        const remaining = leads.length - 1;
        const newTotalPages = Math.ceil(remaining / pageSize) || 1;
        return Math.min(previousPage, newTotalPages);
      });

      alert('Lead deleted successfully.');
    } catch (error) {
      console.error('Delete Lead Error:', error);
      alert(
        error.response?.data?.message ||
        'Unable to delete lead.'
      );
    }
  };

  // Handle Add/Edit Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      setSubmitLoading(true);

      if (editingLeadId) {
        // UPDATE
        const response = await API.put(
          `${API_URL}/${editingLeadId}`,
          formData
        );

        if (response.data.success) {
          setLeads(previous =>
            previous.map(lead =>
              lead._id === editingLeadId
                ? response.data.data
                : lead
            )
          );

          alert('Lead updated successfully.');
        }
      } else {
        // CREATE
        const response = await API.post(
          API_URL,
          formData
        );

        if (response.data.success) {
          setLeads(previous => [
            response.data.data,
            ...previous
          ]);

          setCurrentPage(1);

          alert('Lead added successfully.');
        }
      }

      setIsModalOpen(false);
      setEditingLeadId(null);
      setFormData({
        ...defaultFormState,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Save Lead Error:', error);

      alert(
        error.response?.data?.message ||
        'Unable to save lead.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="ColdLeadManagement-container">
      {/* 4 Cards Summary */}
      <div className="ColdLeadManagement-cards-grid">
        <div className="ColdLeadManagement-card">
          <div className="ColdLeadManagement-card-icon ColdLeadManagement-bg-green">
            <UsersIcon />
          </div>
          <div className="ColdLeadManagement-card-content">
            <span className="ColdLeadManagement-card-title">Total Leads</span>
            <span className="ColdLeadManagement-card-value">{totalLeads}</span>
            <span className="ColdLeadManagement-card-sub">All time leads</span>
          </div>
        </div>

        <div className="ColdLeadManagement-card">
          <div className="ColdLeadManagement-card-icon ColdLeadManagement-bg-orange">
            <SparklesIcon />
          </div>
          <div className="ColdLeadManagement-card-content">
            <span className="ColdLeadManagement-card-title">New Leads</span>
            <span className="ColdLeadManagement-card-value">{newLeads}</span>
            <span className="ColdLeadManagement-card-sub">This month</span>
          </div>
        </div>

        <div className="ColdLeadManagement-card">
          <div className="ColdLeadManagement-card-icon ColdLeadManagement-bg-purple">
            <PhoneIcon />
          </div>
          <div className="ColdLeadManagement-card-content">
            <span className="ColdLeadManagement-card-title">Contacted</span>
            <span className="ColdLeadManagement-card-value">{contactedLeads}</span>
            <span className="ColdLeadManagement-card-sub">Total contacted</span>
          </div>
        </div>

        <div className="ColdLeadManagement-card">
          <div className="ColdLeadManagement-card-icon ColdLeadManagement-bg-lightgreen">
            <CheckCircleIcon />
          </div>
          <div className="ColdLeadManagement-card-content">
            <span className="ColdLeadManagement-card-title">Converted</span>
            <span className="ColdLeadManagement-card-value">{convertedLeads}</span>
            <span className="ColdLeadManagement-card-sub">Successful</span>
          </div>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="ColdLeadManagement-toolbar">
        <div className="ColdLeadManagement-toolbar-actions">
          <button 
            className="ColdLeadManagement-btn ColdLeadManagement-btn-primary" 
            onClick={handleOpenAddModal}
          >
            <PlusIcon /> Add Lead
          </button>
          <button 
            className="ColdLeadManagement-btn ColdLeadManagement-btn-outline" 
            onClick={() => alert("Import functionality triggered")}
          >
            <UploadIcon /> Import Leads
          </button>
          <button 
            className={`ColdLeadManagement-btn ColdLeadManagement-btn-outline ${filterActive ? 'active' : ''}`} 
            onClick={() => setFilterActive(!filterActive)}
          >
            <FilterIcon /> Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="ColdLeadManagement-table-wrapper">
        <table className="ColdLeadManagement-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={currentLeads.length > 0 && currentLeads.every(l => selectedIds.includes(l._id))} 
                  onChange={handleSelectAll} 
                  className="ColdLeadManagement-checkbox"
                />
              </th>
              <th>#</th>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>Looking For</th>
              <th>Lead Source</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading leads...
                </td>
              </tr>
            ) : currentLeads.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>
                  No leads found.
                </td>
              </tr>
            ) : currentLeads.map((lead, index) => (
              <tr key={lead._id} className={selectedIds.includes(lead._id) ? 'selected-row' : ''}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(lead._id)} 
                    onChange={() => handleSelectRow(lead._id)} 
                    className="ColdLeadManagement-checkbox"
                  />
                </td>
                <td>{startIndex + index + 1}</td>
                <td className="ColdLeadManagement-font-medium">{lead.name}</td>
                <td>{lead.phone}</td>
                <td>{lead.email}</td>
                <td>{lead.lookingFor}</td>
                <td>{lead.source}</td>
                <td>{lead.date}</td>
                <td>
                  <span className={`ColdLeadManagement-status-badge status-${lead.status.toLowerCase().replace(/\s+/g, '')}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="ColdLeadManagement-actions-cell">
                  <button 
                    className="ColdLeadManagement-action-trigger"
                    onClick={() => setActiveActionMenu(activeActionMenu === lead._id ? null : lead._id)}
                  >
                    <MoreVerticalIcon />
                  </button>
                  {activeActionMenu === lead._id && (
                    <div className="ColdLeadManagement-dropdown">
                      <button className="edit-btn" onClick={() => handleOpenEditModal(lead)}>
                        <EditIcon /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteLead(lead._id)}>
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer & Controls */}
      <div className="ColdLeadManagement-footer">
        <div className="ColdLeadManagement-footer-info">
          <span>
            Showing {totalLeads === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalLeads)} of {totalLeads} leads
          </span>
          <div className="ColdLeadManagement-page-selector">
            <label htmlFor="pageSize">Show: </label>
            <select 
              id="pageSize" 
              value={pageSize} 
              onChange={handlePageSizeChange}
              className="ColdLeadManagement-select"
            >
              <option value={5}>5 pages</option>
              <option value={10}>10 pages</option>
              <option value={15}>15 pages</option>
              <option value={25}>25 pages</option>
            </select>
          </div>
        </div>

        {/* Page Buttons */}
        <div className="ColdLeadManagement-pagination">
          <button 
            className="ColdLeadManagement-page-btn" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
          >
            &lt;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button 
              key={pageNum}
              className={`ColdLeadManagement-page-btn ${currentPage === pageNum ? 'active' : ''}`} 
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button 
            className="ColdLeadManagement-page-btn" 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Add / Edit Animated Popup Modal */}
      {isModalOpen && (
        <div className="ColdLeadManagement-modal-overlay">
          <div className="ColdLeadManagement-modal-content">
            <div className="ColdLeadManagement-modal-header">
              <h2>{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button className="ColdLeadManagement-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="ColdLeadManagement-form-grid">
                <div className="ColdLeadManagement-form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <div className="ColdLeadManagement-input-icon-wrapper">
                    <span className="input-icon"><UserIcon /></span>
                    <input 
                      type="text" 
                      name="name" placeholder="Enter your name" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData(previous => ({...previous, name: e.target.value}))}
                    />
                  </div>
                  <span className="ColdLeadManagement-field-hint">Enter the complete name</span>
                </div>

                <div className="ColdLeadManagement-form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <div className="ColdLeadManagement-input-icon-wrapper">
                    <span className="input-icon"><PhoneIcon /></span>
                    <input 
                      type="text" 
                      name="phone" placeholder="Enter phone number" 
                      required 
                      value={formData.phone} 
                      onChange={e => setFormData(previous => ({...previous, phone: e.target.value}))}
                    />
                  </div>
                  <span className="ColdLeadManagement-field-hint">Enter a valid 10-digit mobile number</span>
                </div>

                <div className="ColdLeadManagement-form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <div className="ColdLeadManagement-input-icon-wrapper">
                    <span className="input-icon"><MailIcon /></span>
                    <input 
                      type="email" 
                      name="email" placeholder="Enter email address" 
                      required 
                      value={formData.email} 
                      onChange={e => setFormData(previous => ({...previous, email: e.target.value}))}
                    />
                  </div>
                  <span className="ColdLeadManagement-field-hint">Enter a valid email address</span>
                </div>

                <div className="ColdLeadManagement-form-group">
                  <label>Looking For <span className="required">*</span></label>
                  <select 
                    name="lookingFor" value={formData.lookingFor} 
                    onChange={e => setFormData(previous => ({...previous, lookingFor: e.target.value}))}
                  >
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Organic Items">Organic Items</option>
                    <option value="Fresh Fruits">Fresh Fruits</option>
                  </select>
                  <span className="ColdLeadManagement-field-hint">Choose the product or service</span>
                </div>

                <div className="ColdLeadManagement-form-group">
                  <label>Lead Source <span className="required">*</span></label>
                  <select 
                    name="source" value={formData.source} 
                    onChange={e => setFormData(previous => ({...previous, source: e.target.value}))}
                  >
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Referral">Referral</option>
                  </select>
                  <span className="ColdLeadManagement-field-hint">Select where you found this lead</span>
                </div>

                <div className="ColdLeadManagement-form-group">
                  <label>Date <span className="required">*</span></label>
                  <div className="ColdLeadManagement-input-icon-wrapper">
                    <span className="input-icon"><CalendarIcon /></span>
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date} 
                      onChange={e => setFormData(previous => ({...previous, date: e.target.value}))}
                    />
                  </div>
                  <span className="ColdLeadManagement-field-hint">Select the date</span>
                </div>

                <div className="ColdLeadManagement-form-group ColdLeadManagement-full-width">
                  <label>Status <span className="required">*</span></label>
                  <select 
                    name="status" value={formData.status} 
                    onChange={e => setFormData(previous => ({...previous, status: e.target.value}))}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Converted">Converted</option>
                  </select>
                  <span className="ColdLeadManagement-field-hint">Select the current status of this lead</span>
                </div>

                <div className="ColdLeadManagement-form-group ColdLeadManagement-full-width">
                  <label>Notes</label>
                  <textarea 
                    rows="3" 
                    placeholder="Enter any additional notes here..." 
                    name="notes" value={formData.notes} 
                    onChange={e => setFormData(previous => ({...previous, notes: e.target.value}))}
                  ></textarea>
                  <span className="ColdLeadManagement-field-hint">Add any extra information about this lead</span>
                </div>
              </div>

              <div className="ColdLeadManagement-modal-footer">
                <button 
                  type="button" 
                  className="ColdLeadManagement-btn-cancel" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="ColdLeadManagement-btn-submit"
                >
                  <SendIcon /> {submitLoading ? 'Saving...' : editingLeadId ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdLeadManagement;
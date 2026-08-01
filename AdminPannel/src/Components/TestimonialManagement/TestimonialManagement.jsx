import React, { useState, useRef } from 'react';
import { 
  FiPlus, FiMessageSquare, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp, 
  FiFilter, FiRefreshCw, FiEdit2, FiTrash2, FiUploadCloud, FiStar, 
  FiChevronLeft, FiChevronRight, FiX, FiCheck, FiExternalLink, FiChevronDown
} from 'react-icons/fi';
import './TestimonialManagement.css';

const TestimonialManagement = () => {
  // Initial Testimonials State
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      customerName: "Priyanka Sahoo",
      designation: "Home Chef",
      location: "Bhubaneswar, Odisha",
      rating: 5.0,
      testimonial: "FreshMart has completely changed the way I shop for groceries. The quality and freshness are unmatched!",
      category: "Nutrition",
      status: "Published",
      views: "1,245",
      date: "18 May, 2025 10:30 AM",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      customerName: "Rohit Verma",
      designation: "Fitness Trainer",
      location: "Cuttack, Odisha",
      rating: 5.0,
      testimonial: "I love the organic range and fast delivery. It's now my go-to store for healthy living.",
      category: "Health Tips",
      status: "Published",
      views: "842",
      date: "16 May, 2025 09:15 AM",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      customerName: "Anita Das",
      designation: "Nutritionist",
      location: "Puri, Odisha",
      rating: 5.0,
      testimonial: "Wide variety of organic products and great customer service! Highly recommended.",
      category: "Organic Food",
      status: "Published",
      views: "1,032",
      date: "14 May, 2025 08:45 AM",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      customerName: "Sandeep Patnaik",
      designation: "IT Professional",
      location: "Bhubaneswar, Odisha",
      rating: 4.5,
      testimonial: "Good quality products and reasonable prices. Delivery is always on time.",
      category: "Superfoods",
      status: "Pending",
      views: "—",
      date: "13 May, 2025 11:20 AM",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      customerName: "Meera Acharya",
      designation: "Home Maker",
      location: "Berhampur, Odisha",
      rating: 5.0,
      testimonial: "Very happy with the packaging and freshness of fruits & veggies. Keep it up FreshMart!",
      category: "Recipes",
      status: "Published",
      views: "1,458",
      date: "11 May, 2025 07:40 AM",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      customerName: "Vikash Singh",
      designation: "Business Owner",
      location: "Rourkela, Odisha",
      rating: 4.0,
      testimonial: "Great experience overall. Could add more payment options.",
      category: "Superfoods",
      status: "Inactive",
      views: "523",
      date: "08 May, 2025 06:30 PM",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80"
    }
  ]);

  // Filter & Pagination State
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Main Form State (Left Column - Add/Edit Mode)
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    designation: '',
    customerImage: null,
    imagePreview: '',
    rating: 5,
    testimonial: '',
    category: '',
    location: '',
    status: 'Published'
  });

  // Modal State (Popup for quick Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalEditingId, setModalEditingId] = useState(null);
  const [modalData, setModalData] = useState({
    customerName: '',
    designation: '',
    customerImage: null,
    imagePreview: '',
    rating: 5,
    testimonial: '',
    category: '',
    location: '',
    status: 'Published'
  });

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload Handlers
  const handleImageChange = (e, isModal = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isModal) {
        setModalData(prev => ({ ...prev, customerImage: file, imagePreview: previewUrl }));
      } else {
        setFormData(prev => ({ ...prev, customerImage: file, imagePreview: previewUrl }));
      }
    }
  };

  // Reset Left Form
  const handleReset = () => {
    setEditingId(null);
    setFormData({
      customerName: '',
      designation: '',
      customerImage: null,
      imagePreview: '',
      rating: 5,
      testimonial: '',
      category: '',
      location: '',
      status: 'Published'
    });
  };

  // Submit Left Form (Create New or Update existing)
  const handleSubmitTestimonial = (e, statusType) => {
    e.preventDefault();
    if (!formData.customerName || !formData.testimonial) {
      alert("Please enter customer name and testimonial content.");
      return;
    }

    const finalStatus = statusType || formData.status || "Published";

    if (editingId) {
      // Update existing item from left form
      setTestimonials(testimonials.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            customerName: formData.customerName,
            designation: formData.designation,
            location: formData.location || item.location,
            rating: Number(formData.rating),
            testimonial: formData.testimonial,
            category: formData.category || item.category,
            status: finalStatus,
            image: formData.imagePreview || item.image
          };
        }
        return item;
      }));
      alert("Testimonial updated successfully!");
    } else {
      // Create new item
      const newItem = {
        id: Date.now(),
        customerName: formData.customerName,
        designation: formData.designation || "Customer",
        location: formData.location || "Odisha, India",
        rating: Number(formData.rating) || 5.0,
        testimonial: formData.testimonial,
        category: formData.category || "Nutrition",
        status: finalStatus,
        views: "0",
        date: "Just now",
        image: formData.imagePreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      };
      setTestimonials([newItem, ...testimonials]);
      alert("Testimonial published successfully!");
    }
    handleReset();
  };

  // Triggered when user clicks Edit icon on table row -> Loads data into Left Form AND opens modal optionally
  const handleEditRow = (item) => {
    setEditingId(item.id);
    setFormData({
      customerName: item.customerName,
      designation: item.designation,
      customerImage: null,
      imagePreview: item.image,
      rating: item.rating,
      testimonial: item.testimonial,
      category: item.category,
      location: item.location,
      status: item.status
    });
    // Smooth scroll to left form for user convenience on desktop
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Modal for Add New
  const handleOpenAddModal = () => {
    setModalMode('add');
    setModalEditingId(null);
    setModalData({
      customerName: '',
      designation: '',
      customerImage: null,
      imagePreview: '',
      rating: 5,
      testimonial: '',
      category: '',
      location: '',
      status: 'Published'
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setModalEditingId(item.id);
    setModalData({
      customerName: item.customerName,
      designation: item.designation,
      customerImage: null,
      imagePreview: item.image,
      rating: item.rating,
      testimonial: item.testimonial,
      category: item.category,
      location: item.location,
      status: item.status
    });
    setIsModalOpen(true);
  };

  // Save Modal Form (Popup Add/Edit)
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!modalData.customerName || !modalData.testimonial) {
      alert("Customer Name and Testimonial are required");
      return;
    }

    if (modalMode === 'edit') {
      setTestimonials(testimonials.map(item => {
        if (item.id === modalEditingId) {
          return {
            ...item,
            customerName: modalData.customerName,
            designation: modalData.designation,
            location: modalData.location,
            rating: Number(modalData.rating),
            testimonial: modalData.testimonial,
            category: modalData.category,
            status: modalData.status,
            image: modalData.imagePreview || item.image
          };
        }
        return item;
      }));
    } else {
      const newItem = {
        id: Date.now(),
        customerName: modalData.customerName,
        designation: modalData.designation || "Customer",
        location: modalData.location || "Odisha, India",
        rating: Number(modalData.rating) || 5.0,
        testimonial: modalData.testimonial,
        category: modalData.category || "Nutrition",
        status: modalData.status || "Published",
        views: "0",
        date: "Just now",
        image: modalData.imagePreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      };
      setTestimonials([newItem, ...testimonials]);
    }

    setIsModalOpen(false);
  };

  // Delete Handler
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      setTestimonials(testimonials.filter(item => item.id !== id));
      if (editingId === id) {
        handleReset();
      }
    }
  };

  // Filter Trigger Actions
  const handleStatusChange = (e) => {
    setSelectedStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedStatusFilter('All Status');
    setCurrentPage(1);
  };

  // Filter & Pagination Logic
  const filteredTestimonials = selectedStatusFilter === 'All Status' 
    ? testimonials 
    : testimonials.filter(item => item.status.toLowerCase() === selectedStatusFilter.toLowerCase());

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTestimonials = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="TestimonialManagement">
      {/* Top Action Bar */}
      <div className="TestimonialManagement-top-action">
        <button type="button" className="TestimonialManagement-add-btn" onClick={handleOpenAddModal}>
          <FiPlus /> Add New Testimonial
        </button>
      </div>

      {/* Top Metric Cards Row */}
      <div className="TestimonialManagement-metrics-grid">
        <div className="TestimonialManagement-metric-card">
          <div className="TestimonialManagement-metric-icon green"><FiMessageSquare /></div>
          <div className="TestimonialManagement-metric-info">
            <h3>Total Testimonials</h3>
            <h2>{testimonials.length}</h2>
            <p>All time</p>
          </div>
        </div>
        <div className="TestimonialManagement-metric-card">
          <div className="TestimonialManagement-metric-icon blue"><FiCheckCircle /></div>
          <div className="TestimonialManagement-metric-info">
            <h3>Published</h3>
            <h2>{testimonials.filter(t => t.status === 'Published').length}</h2>
            <p>Visible on website</p>
          </div>
        </div>
        <div className="TestimonialManagement-metric-card">
          <div className="TestimonialManagement-metric-icon yellow"><FiClock /></div>
          <div className="TestimonialManagement-metric-info">
            <h3>Pending Review</h3>
            <h2>{testimonials.filter(t => t.status === 'Pending').length}</h2>
            <p>Awaiting approval</p>
          </div>
        </div>
        <div className="TestimonialManagement-metric-card">
          <div className="TestimonialManagement-metric-icon red"><FiXCircle /></div>
          <div className="TestimonialManagement-metric-info">
            <h3>Inactive</h3>
            <h2>{testimonials.filter(t => t.status === 'Inactive').length}</h2>
            <p>Not displayed</p>
          </div>
        </div>
        <div className="TestimonialManagement-metric-card">
          <div className="TestimonialManagement-metric-icon purple"><FiTrendingUp /></div>
          <div className="TestimonialManagement-metric-info">
            <h3>Total Views</h3>
            <h2>12,458</h2>
            <p>Across all testimonials</p>
          </div>
        </div>
      </div>

      {/* Main 50/50 Layout Section */}
      <div className="TestimonialManagement-main-layout">
        
        {/* Left Section: Add / Edit Testimonial Inline Form (Strict 50% Width) */}
        <div className="TestimonialManagement-form-section">
          <div className="TestimonialManagement-section-header">
            <h3>{editingId ? 'Edit Testimonial' : 'Add / Edit Testimonial'}</h3>
            <p>{editingId ? `Editing ID: #${editingId}` : 'Create a new testimonial or update an existing one.'}</p>
          </div>

          <form className="TestimonialManagement-form" onSubmit={(e) => handleSubmitTestimonial(e)}>
            <div className="TestimonialManagement-input-group">
              <label>Customer Name *</label>
              <input 
                type="text" 
                name="customerName"
                placeholder="Enter customer name" 
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Designation / Role</label>
              <input 
                type="text" 
                name="designation"
                placeholder="e.g., Home Chef, Nutritionist" 
                value={formData.designation}
                onChange={handleInputChange}
              />
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Customer Image</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, false)} 
              />
              <div className="TestimonialManagement-dropzone" onClick={() => fileInputRef.current.click()}>
                {formData.imagePreview ? (
                  <div className="TestimonialManagement-preview-container">
                    <img src={formData.imagePreview} alt="Preview" className="TestimonialManagement-uploaded-preview" />
                    <span>Click or drag to change image</span>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="TestimonialManagement-upload-icon" />
                    <p>Click to upload image<br />or drag and drop</p>
                    <span>Recommended: 200 x 200px (Max 2MB)<br />JPG, PNG, WEBP</span>
                  </>
                )}
              </div>
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Rating</label>
              <div className="TestimonialManagement-rating-input-row">
                <div className="TestimonialManagement-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      className={star <= formData.rating ? "star-filled" : "star-empty"}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    />
                  ))}
                </div>
                <span>({Number(formData.rating).toFixed(1)})</span>
              </div>
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Testimonial Content *</label>
              <textarea 
                ref={contentTextareaRef}
                name="testimonial"
                placeholder="Write customer testimonial..." 
                rows="4"
                value={formData.testimonial}
                onChange={handleInputChange}
                maxLength={500}
                required
              ></textarea>
              <span className="TestimonialManagement-char-count">{formData.testimonial.length}/500</span>
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Product / Category (Optional)</label>
              <div className="TestimonialManagement-select-wrapper">
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="">Select product or category</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Health Tips">Health Tips</option>
                  <option value="Organic Food">Organic Food</option>
                  <option value="Recipes">Recipes</option>
                  <option value="Superfoods">Superfoods</option>
                </select>
                <FiChevronDown className="TestimonialManagement-select-arrow" />
              </div>
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Location (Optional)</label>
              <input 
                type="text" 
                name="location"
                placeholder="e.g., Bhubaneswar, Odisha" 
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            <div className="TestimonialManagement-input-group">
              <label>Status</label>
              <div className="TestimonialManagement-status-toggle-row">
                <button 
                  type="button" 
                  className={`TestimonialManagement-status-pill ${formData.status === 'Published' ? 'active-published' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Published' }))}
                >
                  Published
                </button>
                <button 
                  type="button" 
                  className={`TestimonialManagement-status-pill ${formData.status === 'Pending' ? 'active-pending' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Pending' }))}
                >
                  Pending
                </button>
                <button 
                  type="button" 
                  className={`TestimonialManagement-status-pill ${formData.status === 'Inactive' ? 'active-inactive' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Inactive' }))}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="TestimonialManagement-form-actions">
              <button type="button" className="TestimonialManagement-reset-btn" onClick={handleReset}>
                {editingId ? 'Cancel Edit' : 'Reset'}
              </button>
              <button type="button" className="TestimonialManagement-draft-btn" onClick={(e) => handleSubmitTestimonial(e, 'Pending')}>
                Save as Draft
              </button>
              <button type="submit" className="TestimonialManagement-publish-btn">
                <FiCheck /> {editingId ? 'Update Changes' : 'Publish'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: All Testimonials Table (Strict 50% Width) */}
        <div className="TestimonialManagement-table-section">
          <div className="TestimonialManagement-table-header-row">
            <div className="TestimonialManagement-table-title-area">
              <h3>All Testimonials</h3>
              <p>Manage and organize customer testimonials.</p>
            </div>
            <div className="TestimonialManagement-table-controls">
              <select 
                className="TestimonialManagement-filter-select"
                value={selectedStatusFilter}
                onChange={handleStatusChange}
              >
                <option value="All Status">All Status</option>
                <option value="Published">Published</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button type="button" className="TestimonialManagement-control-btn" onClick={handleApplyFilter}><FiFilter /> Filter</button>
              <button type="button" className="TestimonialManagement-control-btn" onClick={handleResetFilter} title="Reset Filter"><FiRefreshCw /></button>
            </div>
          </div>

          <div className="TestimonialManagement-table-container">
            <table className="TestimonialManagement-testimonials-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Testimonial</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentTestimonials.length > 0 ? (
                  currentTestimonials.map((item, index) => (
                    <tr key={item.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td className="TestimonialManagement-customer-cell">
                        <img src={item.image} alt="" className="TestimonialManagement-row-thumb" />
                        <div>
                          <strong>{item.customerName}</strong>
                          <p>{item.designation}</p>
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td>
                        <div className="TestimonialManagement-rating-cell">
                          <FiStar className="star-filled" />
                          <span>{Number(item.rating).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="TestimonialManagement-content-cell">
                        <p>"{item.testimonial}"</p>
                      </td>
                      <td>
                        <span className={`TestimonialManagement-badge status-${(item.status || 'published').toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="TestimonialManagement-date-cell">{item.date}</td>
                      <td>{item.views}</td>
                      <td>
                        <div className="TestimonialManagement-action-btns">
                          <button 
                            type="button" 
                            className="TestimonialManagement-action-edit" 
                            onClick={() => handleEditRow(item)} 
                            title="Edit Inline"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            type="button" 
                            className="TestimonialManagement-action-edit modal-trigger-btn" 
                            onClick={() => handleOpenEditModal(item)} 
                            title="Edit in Modal"
                          >
                            <FiExternalLink />
                          </button>
                          <button 
                            type="button" 
                            className="TestimonialManagement-action-delete" 
                            onClick={() => handleDelete(item.id)} 
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No testimonials found for status: "{selectedStatusFilter}". Try clearing or resetting the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Pagination Footer */}
          <div className="TestimonialManagement-table-footer">
            <span>Showing {filteredTestimonials.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredTestimonials.length)} of {filteredTestimonials.length} entries</span>
            <div className="TestimonialManagement-pagination">
              <button 
                type="button"
                className="TestimonialManagement-page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  type="button"
                  key={num} 
                  className={`TestimonialManagement-page-btn ${currentPage === num ? 'active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button 
                type="button"
                className="TestimonialManagement-page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Website Preview Widget Card */}
          <div className="TestimonialManagement-preview-widget">
            <div className="TestimonialManagement-widget-header">
              <div>
                <h4>Website Preview</h4>
                <p>See how testimonials appear on your website.</p>
              </div>
              <button type="button" className="TestimonialManagement-external-link-btn">
                View on Website <FiExternalLink />
              </button>
            </div>
            
            <div className="TestimonialManagement-preview-slider-box">
              <button type="button" className="slider-arrow left"><FiChevronLeft /></button>
              <div className="TestimonialManagement-slider-cards-grid">
                <div className="TestimonialManagement-preview-card">
                  <div className="stars-row">★★★★★</div>
                  <p>"FreshMart has completely changed the way I shop for groceries. The quality and freshness are unmatched!"</p>
                  <div className="client-info">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80" alt="" />
                    <div>
                      <strong>Priyanka Sahoo</strong>
                      <span>Home Chef, Bhubaneswar</span>
                    </div>
                  </div>
                </div>
                <div className="TestimonialManagement-preview-card">
                  <div className="stars-row">★★★★★</div>
                  <p>"I love the organic range and fast delivery. It's now my go-to store for healthy living."</p>
                  <div className="client-info">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&auto=format&fit=crop&q=80" alt="" />
                    <div>
                      <strong>Rohit Verma</strong>
                      <span>Fitness Trainer, Cuttack</span>
                    </div>
                  </div>
                </div>
                <div className="TestimonialManagement-preview-card">
                  <div className="stars-row">★★★★★</div>
                  <p>"Wide variety of organic products and great customer service! Highly recommended."</p>
                  <div className="client-info">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&auto=format&fit=crop&q=80" alt="" />
                    <div>
                      <strong>Anita Das</strong>
                      <span>Nutritionist, Puri</span>
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" className="slider-arrow right"><FiChevronRight /></button>
            </div>
            <div className="TestimonialManagement-slider-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>

      </div>

      {/* Smooth Popup Modal for Quick Add / Edit Testimonial */}
      {isModalOpen && (
        <div className="TestimonialManagement-modal-overlay">
          <div className="TestimonialManagement-modal-content">
            <div className="TestimonialManagement-modal-header">
              <h3>{modalMode === 'edit' ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
              <button type="button" className="TestimonialManagement-modal-close" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="TestimonialManagement-input-group">
                <label>Customer Name *</label>
                <input 
                  type="text" 
                  name="customerName" 
                  value={modalData.customerName} 
                  onChange={handleModalInputChange} 
                  placeholder="Enter name..."
                  required 
                />
              </div>

              <div className="TestimonialManagement-input-group">
                <label>Designation / Role</label>
                <input 
                  type="text" 
                  name="designation" 
                  value={modalData.designation} 
                  onChange={handleModalInputChange} 
                  placeholder="e.g. Home Chef" 
                />
              </div>

              <div className="TestimonialManagement-input-group">
                <label>Customer Image</label>
                <input 
                  type="file" 
                  ref={modalFileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, true)} 
                />
                <div className="TestimonialManagement-dropzone" onClick={() => modalFileInputRef.current.click()}>
                  {modalData.imagePreview ? (
                    <div className="TestimonialManagement-preview-container">
                      <img src={modalData.imagePreview} alt="Preview" className="TestimonialManagement-uploaded-preview" />
                      <span>Click to replace image</span>
                    </div>
                  ) : (
                    <>
                      <FiUploadCloud className="TestimonialManagement-upload-icon" />
                      <p>Click to upload image</p>
                    </>
                  )}
                </div>
              </div>

              <div className="TestimonialManagement-input-group">
                <label>Rating</label>
                <div className="TestimonialManagement-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      className={star <= modalData.rating ? "star-filled" : "star-empty"}
                      onClick={() => setModalData(prev => ({ ...prev, rating: star }))}
                    />
                  ))}
                </div>
              </div>

              <div className="TestimonialManagement-input-group">
                <label>Testimonial Content *</label>
                <textarea 
                  name="testimonial" 
                  value={modalData.testimonial} 
                  onChange={handleModalInputChange} 
                  placeholder="Write customer testimonial..."
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="TestimonialManagement-input-group">
                <label>Status</label>
                <select name="status" value={modalData.status} onChange={handleModalInputChange}>
                  <option value="Published">Published</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="TestimonialManagement-modal-actions">
                <button type="button" className="TestimonialManagement-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="TestimonialManagement-save-btn">
                  {modalMode === 'edit' ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;
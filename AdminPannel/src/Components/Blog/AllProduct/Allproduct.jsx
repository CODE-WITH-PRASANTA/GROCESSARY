import React, { useState } from 'react';
import './AllProduct.css';

// Initial Mock Data
const INITIAL_PRODUCTS = [
  { id: 1, name: 'All Type Bell Pepper', sku: 'VGT-1001', category: 'Vegetables', price: 230.00, discountPrice: 175.00, stock: 120, status: 'Active', image: 'https://via.placeholder.com/40' },
  { id: 2, name: 'Crunchy Healthy Cookies', sku: 'BAK-1002', category: 'Bakery', price: 700.00, discountPrice: 500.00, stock: 85, status: 'Active', image: 'https://via.placeholder.com/40' },
  { id: 3, name: 'Raw Yellow Potato', sku: 'VGT-1003', category: 'Vegetables', price: 350.00, discountPrice: 300.00, stock: 200, status: 'Active', image: 'https://via.placeholder.com/40' },
  { id: 4, name: 'Grater With 3 Blades', sku: 'KTN-1004', category: 'Kitchen', price: 680.00, discountPrice: 632.00, stock: 60, status: 'Active', image: 'https://via.placeholder.com/40' },
  { id: 5, name: 'Organic Spinach', sku: 'ORG-1005', category: 'Organic Veggies', price: 120.00, discountPrice: 95.00, stock: 150, status: 'Active', image: 'https://via.placeholder.com/40' },
  { id: 6, name: 'Fresh Green Apple', sku: 'FRT-1006', category: 'Fresh Fruits', price: 180.00, discountPrice: 150.00, stock: 90, status: 'Active', image: 'https://via.placeholder.com/40' },
  { id: 7, name: 'Sweet Honey', sku: 'SWT-1007', category: 'Cookies and Sweetener', price: 400.00, discountPrice: 350.00, stock: 45, status: 'Inactive', image: 'https://via.placeholder.com/40' },
  { id: 8, name: 'Carrot Bunch', sku: 'VGT-1008', category: 'Root Vegetables', price: 90.00, discountPrice: 70.00, stock: 0, status: 'Out of Stock', image: 'https://via.placeholder.com/40' },
];

const CATEGORIES = [
  { name: 'All Categories', count: null, icon: '📁' },
  { name: 'Vegetables', count: 32, icon: '🥦' },
  { name: 'Fresh Fruits', count: 28, icon: '🍎' },
  { name: 'Cookies and Sweetener', count: 18, icon: '🍪' },
  { name: 'Home Accessories', count: 24, icon: '🏡' },
  { name: 'Bestseller', count: 16, icon: '⭐' },
  { name: 'Organic Veggies', count: 12, icon: '🌱' },
  { name: 'Leafy Greens', count: 14, icon: '🥬' },
  { name: 'Root Vegetables', count: 10, icon: '🥕' },
  { name: 'Exotic Veggies', count: 8, icon: '🫑' },
];

const Allproduct = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState('All Products');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Filter and Search State
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State (4 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Vegetables',
    price: '',
    discountPrice: '',
    stock: '',
    status: 'Active'
  });

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({ name: '', sku: '', category: 'Vegetables', price: '', discountPrice: '', stock: '', status: 'Active' });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    setShowEditModal(true);
  };

  // Open View Modal
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Add Product
  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      discountPrice: parseFloat(formData.discountPrice),
      stock: parseInt(formData.stock),
      image: 'https://via.placeholder.com/40'
    };
    setProducts([newProduct, ...products]);
    setShowAddModal(false);
  };

  // Edit Product
  const handleUpdateProduct = (e) => {
    e.preventDefault();
    setProducts(products.map(p => p.id === selectedProduct.id ? { 
      ...p, 
      ...formData, 
      price: parseFloat(formData.price), 
      discountPrice: parseFloat(formData.discountPrice), 
      stock: parseInt(formData.stock) 
    } : p));
    setShowEditModal(false);
  };

  // Delete Product
  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Export to CSV Functionality
  const handleExportCSV = () => {
    const headers = ["ID,Name,SKU,Category,Price,DiscountPrice,Stock,Status\n"];
    const csvRows = filteredProducts.map(p => 
      `${p.id},"${p.name}",${p.sku},${p.category},${p.price},${p.discountPrice},${p.stock},${p.status}`
    ).join("\n");

    const blob = new Blob([...headers, csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'products_export.csv');
    a.click();
  };

  // Filter Products Logic
  const filteredProducts = products.filter(p => {
    // Tab Filter
    let matchesTab = true;
    if (activeTab === 'Active') matchesTab = p.status === 'Active';
    else if (activeTab === 'Inactive') matchesTab = p.status === 'Inactive';
    else if (activeTab === 'Out of Stock') matchesTab = p.stock === 0 || p.status === 'Out of Stock';
    else if (activeTab === 'Low Stock') matchesTab = p.stock > 0 && p.stock < 70;

    // Category Filter
    let matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;

    // Search Term Filter
    let matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  // Pagination Calculation (4 items per page)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="ap-container">
      {/* Header Section */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Products</h1>
          <p className="ap-breadcrumb">Dashboard &gt; Products &gt; <span>All Products</span></p>
        </div>
        <button className="ap-btn-primary" onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      {/* Top 4 Metrics Cards with Hover Effects */}
      <div className="ap-metrics-grid">
        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-1">🛒</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Total Products</span>
            <h2 className="ap-metric-value">{products.length}</h2>
            <span className="ap-metric-trend ap-trend-up">↑ 12.5% this month</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-2">📁</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Categories</span>
            <h2 className="ap-metric-value">28</h2>
            <span className="ap-metric-trend ap-trend-up">↑ 8.3% this month</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-3">👁️</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Active Products</span>
            <h2 className="ap-metric-value">{products.filter(p => p.status === 'Active').length}</h2>
            <span className="ap-metric-trend ap-trend-up">↑ 10.2% this month</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-4">🚫</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Inactive Products</span>
            <h2 className="ap-metric-value">{products.filter(p => p.status === 'Inactive').length}</h2>
            <span className="ap-metric-trend ap-trend-down">↓ 4.1% this month</span>
          </div>
        </div>
      </div>

      {/* Main Content Area (50% Categories / 50% Products) */}
      <div className="ap-main-content">
        {/* Left Side: Categories Panel */}
        <div className="ap-categories-panel">
          <div className="ap-panel-header">
            <h3>Categories</h3>
            <button className="ap-btn-plus">+</button>
          </div>
          <ul className="ap-category-list">
            {CATEGORIES.map((cat, index) => (
              <li 
                key={index} 
                className={`ap-category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
              >
                <span className="ap-cat-name">
                  <span className="ap-cat-icon">{cat.icon}</span> {cat.name}
                </span>
                {cat.count !== null && <span className="ap-cat-count">{cat.count}</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Products Table Panel */}
        <div className="ap-products-panel">
          {/* Tabs and Action Bar */}
          <div className="ap-filter-bar">
            <div className="ap-tabs">
              {['All Products', 'Active', 'Inactive', 'Out of Stock', 'Low Stock'].map(tab => (
                <button 
                  key={tab} 
                  className={`ap-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="ap-action-btns">
              <button 
                className={`ap-btn-outline ${showFilterBar ? 'active' : ''}`} 
                onClick={() => setShowFilterBar(!showFilterBar)}
              >
                ⚙️ Filters
              </button>
              <button className="ap-btn-outline" onClick={handleExportCSV}>
                📥 Export
              </button>
            </div>
          </div>

          {/* Collapsible Search/Filter Field */}
          {showFilterBar && (
            <div className="ap-search-container">
              <input 
                type="text" 
                placeholder="Search product by name or SKU..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="ap-search-input"
              />
            </div>
          )}

          {/* Table */}
          <div className="ap-table-wrapper">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Discount Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className="ap-product-cell">
                          <img src={prod.image} alt={prod.name} className="ap-product-img" />
                          <div>
                            <div className="ap-product-title">{prod.name}</div>
                            <div className="ap-product-sku">SKU: {prod.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ap-badge-category">{prod.category}</span>
                      </td>
                      <td>${parseFloat(prod.price).toFixed(2)}</td>
                      <td className="ap-text-success">${parseFloat(prod.discountPrice).toFixed(2)}</td>
                      <td>{prod.stock}</td>
                      <td>
                        <span className={`ap-status-badge ${prod.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td>
                        <div className="ap-action-icons">
                          <button className="ap-icon-btn edit" title="Edit" onClick={() => openEditModal(prod)}>✏️</button>
                          <button className="ap-icon-btn view" title="View" onClick={() => openViewModal(prod)}>👁️</button>
                          <button className="ap-icon-btn delete" title="Delete" onClick={() => handleDeleteProduct(prod.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="ap-no-data">No products found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (4 Items Per Page) */}
          <div className="ap-pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="ap-page-btn"
            >
              Previous
            </button>
            <span className="ap-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="ap-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- POPUP MODALS --- */}

      {/* Add / Edit Form Modal */}
      {(showAddModal || showEditModal) && (
        <div className="ap-modal-overlay">
          <div className="ap-modal">
            <div className="ap-modal-header">
              <h3>{showAddModal ? 'Add New Product' : 'Edit Product'}</h3>
              <button className="ap-close-btn" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>✕</button>
            </div>
            <form onSubmit={showAddModal ? handleAddProduct : handleUpdateProduct}>
              <div className="ap-form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter product name" />
              </div>
              <div className="ap-form-group">
                <label>SKU Code</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} required placeholder="e.g. VGT-1001" />
              </div>
              <div className="ap-form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Organic Veggies">Organic Veggies</option>
                  <option value="Fresh Fruits">Fresh Fruits</option>
                  <option value="Cookies and Sweetener">Cookies and Sweetener</option>
                  <option value="Root Vegetables">Root Vegetables</option>
                </select>
              </div>
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="ap-form-group">
                  <label>Discount Price ($)</label>
                  <input type="number" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                </div>
                <div className="ap-form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="ap-modal-actions">
                <button type="button" className="ap-btn-cancel" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</button>
                <button type="submit" className="ap-btn-primary">{showAddModal ? 'Add Product' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Colorful View Product Details Modal */}
      {showViewModal && selectedProduct && (
        <div className="ap-modal-overlay">
          <div className="ap-modal ap-view-modal">
            <div className="ap-modal-header">
              <h3>Product Details</h3>
              <button className="ap-close-btn" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            
            <div className="ap-view-card">
              <div className="ap-view-header">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="ap-view-img" />
                <div>
                  <h4 className="ap-view-title">{selectedProduct.name}</h4>
                  <span className="ap-view-sku">SKU: {selectedProduct.sku}</span>
                </div>
              </div>

              <div className="ap-view-grid">
                <div className="ap-view-box">
                  <span className="ap-view-label">Category</span>
                  <span className="ap-view-val cat-badge">{selectedProduct.category}</span>
                </div>

                <div className="ap-view-box">
                  <span className="ap-view-label">Status</span>
                  <span className={`ap-status-badge ${selectedProduct.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedProduct.status}
                  </span>
                </div>

                <div className="ap-view-box">
                  <span className="ap-view-label">Regular Price</span>
                  <span className="ap-view-val price-regular">${parseFloat(selectedProduct.price).toFixed(2)}</span>
                </div>

                <div className="ap-view-box">
                  <span className="ap-view-label">Discount Price</span>
                  <span className="ap-view-val price-discount">${parseFloat(selectedProduct.discountPrice).toFixed(2)}</span>
                </div>

                <div className="ap-view-box full-width">
                  <span className="ap-view-label">Available Stock</span>
                  <span className="ap-view-val stock-val">{selectedProduct.stock} Items in Stock</span>
                </div>
              </div>
            </div>

            <div className="ap-modal-actions">
              <button className="ap-btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allproduct;
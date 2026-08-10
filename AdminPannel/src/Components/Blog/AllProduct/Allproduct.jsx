import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllProduct.css';

const API_BASE_URL = 'http://localhost:5000';

const CATEGORIES = [
  { name: 'All Categories', icon: '📁' },
  { name: 'vegetables', icon: '🥦' },
  { name: 'fruits', icon: '🍎' },
  { name: 'dairy', icon: '🥛' },
  { name: 'beverages', icon: '🥤' },
];

const Allproduct = () => {
  const navigate = useNavigate();

  // API Data & Loading States
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Tab & Category Filter State
  const [activeTab, setActiveTab] = useState('All Products');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Search & Filter Bar
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // GET: Fetch products list
  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setErrorMessage(error.message || 'Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Redirect to Add/Edit Page with existing product data
  const handleEditProduct = (product) => {
    navigate('/add-product', { state: { product } });
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Resolve Image Path
  const getImageUrl = (imageArray) => {
    if (imageArray && imageArray.length > 0) {
      const imgPath = imageArray[0];
      return imgPath.startsWith('http') ? imgPath : `${API_BASE_URL}${imgPath}`;
    }
    return 'https://via.placeholder.com/40';
  };

  // DELETE: Delete Product API Call
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to delete product');

        alert('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID,Name,SKU,Category,Price,DiscountPrice,Stock,Status\n'];
    const csvRows = filteredProducts
      .map(
        (p) =>
          `"${p._id}","${p.productName}","${p.sku}","${p.category}",${p.price},${p.discountPrice || 0},${p.stockQuantity},"${p.status}"`
      )
      .join('\n');

    const blob = new Blob([...headers, csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'products_export.csv');
    a.click();
  };

  // Filter Products Logic
  const filteredProducts = products.filter((p) => {
    const pStatus = (p.status || '').toLowerCase();
    const pName = (p.productName || '').toLowerCase();
    const pSku = (p.sku || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();

    // Tab Filter
    let matchesTab = true;
    if (activeTab === 'Active') matchesTab = pStatus === 'active';
    else if (activeTab === 'Inactive') matchesTab = pStatus === 'inactive';
    else if (activeTab === 'Out of Stock') matchesTab = p.stockQuantity === 0 || p.isOutOfStock;
    else if (activeTab === 'Low Stock') matchesTab = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockAlert || 5);

    // Category Filter
    let matchesCategory =
      selectedCategory === 'All Categories' ||
      pCat === selectedCategory.toLowerCase();

    // Search Term Filter
    let matchesSearch =
      pName.includes(searchTerm.toLowerCase()) ||
      pSku.includes(searchTerm.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  // Pagination Calculations
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
          <p className="ap-breadcrumb">
            Dashboard &gt; Products &gt; <span>All Products</span>
          </p>
        </div>
        <button className="ap-btn-primary" onClick={() => navigate('/add-product')}>
          + Add New Product
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="ap-metrics-grid">
        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-1">🛒</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Total Products</span>
            <h2 className="ap-metric-value">{products.length}</h2>
            <span className="ap-metric-trend ap-trend-up">↑ Updated live</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-2">📁</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Categories</span>
            <h2 className="ap-metric-value">
              {new Set(products.map((p) => p.category)).size}
            </h2>
            <span className="ap-metric-trend ap-trend-up">↑ Active categories</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-3">👁️</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Active Products</span>
            <h2 className="ap-metric-value">
              {products.filter((p) => (p.status || '').toLowerCase() === 'active').length}
            </h2>
            <span className="ap-metric-trend ap-trend-up">↑ Live in store</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon ap-icon-bg-4">🚫</div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Inactive Products</span>
            <h2 className="ap-metric-value">
              {products.filter((p) => (p.status || '').toLowerCase() === 'inactive').length}
            </h2>
            <span className="ap-metric-trend ap-trend-down">↓ Drafts/Hidden</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ap-main-content">
        {/* Left Side: Categories Panel */}
        <div className="ap-categories-panel">
          <div className="ap-panel-header">
            <h3>Categories</h3>
            <button className="ap-btn-plus" onClick={() => navigate('/add-product')}>+</button>
          </div>
          <ul className="ap-category-list">
            {CATEGORIES.map((cat, index) => {
              const catCount =
                cat.name === 'All Categories'
                  ? products.length
                  : products.filter(
                      (p) => (p.category || '').toLowerCase() === cat.name.toLowerCase()
                    ).length;

              return (
                <li
                  key={index}
                  className={`ap-category-item ${
                    selectedCategory === cat.name ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPage(1);
                  }}
                >
                  <span className="ap-cat-name">
                    <span className="ap-cat-icon">{cat.icon}</span> {cat.name}
                  </span>
                  <span className="ap-cat-count">{catCount}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Side: Products Table Panel */}
        <div className="ap-products-panel">
          <div className="ap-filter-bar">
            <div className="ap-tabs">
              {['All Products', 'Active', 'Inactive', 'Out of Stock', 'Low Stock'].map((tab) => (
                <button
                  key={tab}
                  className={`ap-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
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

          {/* Search Bar */}
          {showFilterBar && (
            <div className="ap-search-container">
              <input
                type="text"
                placeholder="Search product by name or SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="ap-search-input"
              />
            </div>
          )}

          {/* Table */}
          <div className="ap-table-wrapper">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
            ) : errorMessage ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                {errorMessage}
              </div>
            ) : (
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
                      <tr key={prod._id}>
                        <td>
                          <div className="ap-product-cell">
                            <img
                              src={getImageUrl(prod.images)}
                              alt={prod.productName}
                              className="ap-product-img"
                            />
                            <div>
                              <div className="ap-product-title">{prod.productName}</div>
                              <div className="ap-product-sku">SKU: {prod.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="ap-badge-category">{prod.category}</span>
                        </td>
                        <td>₹{parseFloat(prod.price || 0).toFixed(2)}</td>
                        <td className="ap-text-success">
                          ₹{parseFloat(prod.discountPrice || 0).toFixed(2)}
                        </td>
                        <td>{prod.stockQuantity} {prod.unit || ''}</td>
                        <td>
                          <span
                            className={`ap-status-badge ${(prod.status || 'active')
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td>
                          <div className="ap-action-icons">
                            <button
                              className="ap-icon-btn edit"
                              title="Edit"
                              onClick={() => handleEditProduct(prod)}
                            >
                              ✏️
                            </button>
                            <button
                              className="ap-icon-btn view"
                              title="View"
                              onClick={() => openViewModal(prod)}
                            >
                              👁️
                            </button>
                            <button
                              className="ap-icon-btn delete"
                              title="Delete"
                              onClick={() => handleDeleteProduct(prod._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="ap-no-data">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="ap-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="ap-page-btn"
            >
              Previous
            </button>
            <span className="ap-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="ap-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedProduct && (
        <div className="ap-modal-overlay">
          <div className="ap-modal ap-view-modal">
            <div className="ap-modal-header">
              <h3>Product Details</h3>
              <button className="ap-close-btn" onClick={() => setShowViewModal(false)}>
                ✕
              </button>
            </div>

            <div className="ap-view-card">
              <div className="ap-view-header">
                <img
                  src={getImageUrl(selectedProduct.images)}
                  alt={selectedProduct.productName}
                  className="ap-view-img"
                />
                <div>
                  <h4 className="ap-view-title">{selectedProduct.productName}</h4>
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
                  <span
                    className={`ap-status-badge ${(selectedProduct.status || 'active')
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>

                <div className="ap-view-box">
                  <span className="ap-view-label">Regular Price</span>
                  <span className="ap-view-val price-regular">
                    ₹{parseFloat(selectedProduct.price || 0).toFixed(2)}
                  </span>
                </div>

                <div className="ap-view-box">
                  <span className="ap-view-label">Discount Price</span>
                  <span className="ap-view-val price-discount">
                    ₹{parseFloat(selectedProduct.discountPrice || 0).toFixed(2)}
                  </span>
                </div>

                <div className="ap-view-box full-width">
                  <span className="ap-view-label">Available Stock</span>
                  <span className="ap-view-val stock-val">
                    {selectedProduct.stockQuantity} {selectedProduct.unit || 'Items'} in Stock
                  </span>
                </div>
              </div>
            </div>

            <div className="ap-modal-actions">
              <button className="ap-btn-primary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allproduct;
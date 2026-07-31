import React, { useState } from 'react';
import './Allproduct.css';

const initialProducts = [
  { id: 1, name: "All Type Bell Pepper", sku: "VGT-1001", category: "Vegetables", price: "$230.00", discountPrice: "$175.00", stock: 120, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 2, name: "Crunchy Healthy Cookies", sku: "BAK-1002", category: "Bakery", price: "$700.00", discountPrice: "$500.00", stock: 85, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 3, name: "Raw Yellow Potato", sku: "VGT-1003", category: "Vegetables", price: "$350.00", discountPrice: "$300.00", stock: 200, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 4, name: "Grater With 3 Blades", sku: "KTN-1004", category: "Kitchen", price: "$680.00", discountPrice: "$632.00", stock: 60, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 5, name: "Organic Spinach", sku: "ORG-1005", category: "Organic Veggies", price: "$120.00", discountPrice: "$95.00", stock: 150, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 6, name: "Fresh Red Apple", sku: "FRU-1006", category: "Fresh Fruits", price: "$180.00", discountPrice: "$140.00", stock: 100, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 7, name: "Organic Carrot", sku: "ORG-1007", category: "Root Vegetables", price: "$110.00", discountPrice: "$80.00", stock: 130, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 8, name: "Fresh Banana", sku: "FRU-1008", category: "Fresh Fruits", price: "$60.00", discountPrice: "$50.00", stock: 180, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 9, name: "Whole Wheat Bread", sku: "BAK-1009", category: "Bakery", price: "$90.00", discountPrice: "$75.00", stock: 45, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 10, name: "Green Broccoli", sku: "VGT-1010", category: "Vegetables", price: "$150.00", discountPrice: "$120.00", stock: 90, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 11, name: "Organic Tomato", sku: "ORG-1011", category: "Organic Veggies", price: "$80.00", discountPrice: "$65.00", stock: 210, status: "Active", img: "https://via.placeholder.com/40" },
  { id: 12, name: "Chef Knife 8 Inch", sku: "KTN-1012", category: "Kitchen", price: "$450.00", discountPrice: "$400.00", stock: 30, status: "Active", img: "https://via.placeholder.com/40" }
];

const categoriesList = [
  { name: "Vegetables", count: 32, icon: "🥦" },
  { name: "Fresh Fruits", count: 28, icon: "🍎" },
  { name: "Cookies and Sweetener", count: 18, icon: "🍪" },
  { name: "Home Accessories", count: 24, icon: "🏠" },
  { name: "Bestseller", count: 16, icon: "⭐" },
  { name: "Organic Veggies", count: 12, icon: "🌱" },
  { name: "Leafy Greens", count: 14, icon: "🥬" },
  { name: "Root Vegetables", count: 10, icon: "🥕" },
  { name: "Exotic Veggies", count: 8, icon: "🫑" },
];

const Allproduct = () => {
  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // एक पेज पर जितने प्रोडक्ट्स दिखाने हैं

  // Filter products by Tab and Category
  const filteredProducts = products.filter(product => {
    if (activeTab === 'active' && product.status !== 'Active') return false;
    if (activeTab === 'inactive' && product.status !== 'Inactive') return false;
    if (activeTab === 'lowstock' && product.stock > 50) return false;
    if (activeTab === 'outofstock' && product.stock !== 0) return false;

    if (selectedCategory && product.category !== selectedCategory) return false;

    return true;
  });

  // --- Pagination Logic ---
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // वर्तमान पेज के प्रोडक्ट्स Calculate करना
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Filter या Tab बदलने पर पहले पेज पर रिसेट करना
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Pagination Controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Action Handlers
  const handleAddNewProduct = () => {
    const name = prompt("Enter Product Name:");
    if (!name) return;
    
    const newProduct = {
      id: Date.now(),
      name: name,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: "Vegetables",
      price: "$100.00",
      discountPrice: "$80.00",
      stock: 50,
      status: "Active",
      img: "https://via.placeholder.com/40"
    };

    setProducts([newProduct, ...products]);
  };

  const handleExport = () => {
    const headers = "Name,SKU,Category,Price,DiscountPrice,Stock,Status\n";
    const rows = filteredProducts.map(p => `${p.name},${p.sku},${p.category},${p.price},${p.discountPrice},${p.stock},${p.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-list.csv';
    a.click();
  };

  const handleEdit = (id) => alert(`Editing product ID: ${id}`);
  const handleView = (id) => {
    const product = products.find(p => p.id === id);
    alert(`Product Details:\nName: ${product.name}\nSKU: ${product.sku}\nPrice: ${product.price}`);
  };
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="all-products-container">
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Products</h1>
          <div className="breadcrumbs">
            Dashboard &gt; Products &gt; <span className="active">All Products</span>
          </div>
        </div>
        <button className="btn-add-product" onClick={handleAddNewProduct}>
          <span>+</span> Add New Product
        </button>
      </div>

      {/* Top Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg bg-green">🛒</div>
          <div className="stat-info">
            <p className="stat-title">Total Products</p>
            <p className="stat-value">{products.length}</p>
            <p className="stat-change positive">↑ 12.5% <span>this month</span></p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg bg-yellow">📂</div>
          <div className="stat-info">
            <p className="stat-title">Categories</p>
            <p className="stat-value">28</p>
            <p className="stat-change positive">↑ 8.3% <span>this month</span></p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg bg-blue">👁️</div>
          <div className="stat-info">
            <p className="stat-title">Active Products</p>
            <p className="stat-value">{products.filter(p => p.status === 'Active').length}</p>
            <p className="stat-change positive">↑ 10.2% <span>this month</span></p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg bg-red">🚫</div>
          <div className="stat-info">
            <p className="stat-title">Inactive Products</p>
            <p className="stat-value">{products.filter(p => p.status === 'Inactive').length}</p>
            <p className="stat-change negative">↓ 4.1% <span>this month</span></p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">

        {/* Sidebar Categories */}
        <div className="categories-sidebar">
          <div className="sidebar-title">
            Categories
            <button className="add-cat-btn">+</button>
          </div>
          <ul className="categories-list">
            <li 
              className={`category-item ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => handleCategoryChange(null)}
            >
              <div className="cat-info">
                <span>📁</span>
                <span>All Categories</span>
              </div>
            </li>
            {categoriesList.map((cat, idx) => (
              <li 
                key={idx} 
                className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.name)}
              >
                <div className="cat-info">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
                <span className="cat-count">{cat.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Table Area */}
        <div className="table-container">
          
          {/* Controls Bar */}
          <div className="table-controls">
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => handleTabChange('all')}>All Products</button>
              <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => handleTabChange('active')}>Active</button>
              <button className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => handleTabChange('inactive')}>Inactive</button>
              <button className={`tab-btn ${activeTab === 'outofstock' ? 'active' : ''}`} onClick={() => handleTabChange('outofstock')}>Out of Stock</button>
              <button className={`tab-btn ${activeTab === 'lowstock' ? 'active' : ''}`} onClick={() => handleTabChange('lowstock')}>Low Stock</button>
            </div>
            
            <div className="action-tools">
              <button className="btn-tool">⚙️ Filters</button>
              <button className="btn-tool" onClick={handleExport}>📥 Export</button>
            </div>
          </div>

          {/* Table */}
          <table className="products-table">
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
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                currentProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <img src={p.img} alt={p.name} className="product-img" />
                        <div>
                          <div className="product-name">{p.name}</div>
                          <div className="product-sku">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{p.category}</span>
                    </td>
                    <td>{p.price}</td>
                    <td className="discount-price">{p.discountPrice}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`status-badge ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" title="Edit" onClick={() => handleEdit(p.id)}>✏️</button>
                        <button className="action-btn view" title="View" onClick={() => handleView(p.id)}>👁️</button>
                        <button className="action-btn delete" title="Remove" onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Dynamic Working Pagination */}
          <div className="pagination-container">
            <div>
              Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} products
            </div>

            <div className="pagination-controls">
              {/* Previous Button */}
              <button 
                className="page-btn nav-btn" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <button
                  key={number}
                  className={`page-btn ${currentPage === number ? 'active' : ''}`}
                  onClick={() => handlePageClick(number)}
                >
                  {number}
                </button>
              ))}

              {/* Next Button */}
              <button 
                className="page-btn nav-btn" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages || totalItems === 0}
              >
                &gt;
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Allproduct;
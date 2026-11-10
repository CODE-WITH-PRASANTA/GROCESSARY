import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import "./AllProduct.css";
import API, { BASE_URL } from "../../../api/axios";
import BulkProductModal, { downloadSampleExcelTemplate } from "./BulkProductModal";

const Allproduct = () => {
  const navigate = useNavigate();

  // ======================================================
  // API DATA
  // ======================================================
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // BULK PRODUCT MANAGEMENT
  // ======================================================
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // ======================================================
  // FILTERS & SEARCH
  // ======================================================
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // ======================================================
  // PAGINATION
  // ======================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // ======================================================
  // VIEW MODAL
  // ======================================================
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ======================================================
  // GET ALL PRODUCTS
  // ======================================================
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await API.get("/products?limit=1000");
      const result = response.data;

      let productList = [];
      if (Array.isArray(result?.products)) {
        productList = result.products;
      } else if (Array.isArray(result?.data)) {
        productList = result.data;
      } else if (Array.isArray(result?.result)) {
        productList = result.result;
      } else if (Array.isArray(result)) {
        productList = result;
      }

      setProducts(productList);
    } catch (error) {
      console.error("Fetch Products Error:", error);
      setProducts([]);
      setErrorMessage(
        error.response?.data?.message || error.message || "Error connecting to server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================
  const getImageUrl = (imageArray) => {
    if (Array.isArray(imageArray) && imageArray.length > 0) {
      const imgPath = imageArray[0];
      if (!imgPath) return "https://via.placeholder.com/80?text=No+Image";
      if (
        imgPath.startsWith("http://") ||
        imgPath.startsWith("https://") ||
        imgPath.startsWith("blob:")
      ) {
        return imgPath;
      }
      return `${BASE_URL}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
    }
    return "https://via.placeholder.com/80?text=No+Image";
  };

  const getCategoryName = (product) => {
    if (!product) return "";
    if (product.category && typeof product.category === "object") {
      return product.category.name || "";
    }
    if (typeof product.category === "string") {
      return product.category;
    }
    return "";
  };

  const getBrandName = (product) => {
    if (!product) return "";
    if (product.brand && typeof product.brand === "object") {
      return product.brand.name || "";
    }
    if (typeof product.brand === "string") {
      return product.brand;
    }
    return "";
  };

  const getUnitName = (product) => {
    if (!product) return "";
    if (product.unit && typeof product.unit === "object") {
      return product.unit.shortName || product.unit.name || "";
    }
    if (typeof product.unit === "string") {
      return product.unit;
    }
    return "";
  };

  // ======================================================
  // CATEGORIES LIST
  // ======================================================
  const categoriesList = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const name = getCategoryName(p);
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [products]);

  // ======================================================
  // METRICS COMPUTATION
  // ======================================================
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter(
      (p) => (p.status || "").toLowerCase() === "active"
    ).length;
    const outOfStock = products.filter(
      (p) =>
        Number(p.stockQuantity || 0) <= 0 ||
        p.isOutOfStock === true ||
        Number(p.stockQuantity || 0) <= Number(p.lowStockAlert || 5)
    ).length;
    const totalCategories = categoriesList.length;

    return { total, active, outOfStock, totalCategories };
  }, [products, categoriesList]);

  // ======================================================
  // FILTER & SORT PRODUCTS
  // ======================================================
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const pStatus = (p.status || "").toLowerCase();
        const pName = (p.productName || "").toLowerCase();
        const pSku = (p.sku || "").toLowerCase();
        const pCat = getCategoryName(p).toLowerCase();
        const pBrand = getBrandName(p).toLowerCase();
        const search = searchTerm.toLowerCase().trim();
        const stock = Number(p.stockQuantity || 0);
        const lowAlert = Number(p.lowStockAlert || 5);

        // Status Tab Filter
        let matchesTab = true;
        if (activeTab === "Active") {
          matchesTab = pStatus === "active";
        } else if (activeTab === "Inactive") {
          matchesTab = pStatus === "inactive";
        } else if (activeTab === "In Stock") {
          matchesTab = stock > lowAlert && !p.isOutOfStock;
        } else if (activeTab === "Low Stock") {
          matchesTab = stock > 0 && stock <= lowAlert;
        } else if (activeTab === "Out of Stock") {
          matchesTab = stock <= 0 || p.isOutOfStock === true;
        }

        // Category Filter
        const matchesCategory =
          selectedCategory === "All" ||
          pCat === selectedCategory.toLowerCase();

        // Search Filter
        const matchesSearch =
          !search ||
          pName.includes(search) ||
          pSku.includes(search) ||
          pCat.includes(search) ||
          pBrand.includes(search);

        return matchesTab && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") {
          const priceA = Number(a.discountPrice || a.price || 0);
          const priceB = Number(b.discountPrice || b.price || 0);
          return priceA - priceB;
        }
        if (sortBy === "price-high") {
          const priceA = Number(a.discountPrice || a.price || 0);
          const priceB = Number(b.discountPrice || b.price || 0);
          return priceB - priceA;
        }
        if (sortBy === "stock-low") {
          return Number(a.stockQuantity || 0) - Number(b.stockQuantity || 0);
        }
        if (sortBy === "name-asc") {
          return (a.productName || "").localeCompare(b.productName || "");
        }
        // Default newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, activeTab, selectedCategory, searchTerm, sortBy]);

  // ======================================================
  // PAGINATION CALCULATIONS
  // ======================================================
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  // ======================================================
  // ACTION HANDLERS
  // ======================================================
  const handleAddProduct = () => {
    navigate("/products/add-product");
  };

  const handleEditProduct = (product) => {
    if (!product?._id) return;
    navigate(`/products/add-product/${product._id}`);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || "this product"}"?`)) {
      return;
    }

    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSelectedProductIds((prev) => prev.filter((pid) => pid !== id));
    } catch (error) {
      console.error("Delete Product Error:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product."
      );
    }
  };

  // ======================================================
  // BULK ACTIONS HANDLERS
  // ======================================================
  const handleSelectAllOnPage = (e) => {
    if (e.target.checked) {
      const pageIds = currentProducts.map((p) => p._id);
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIdSet = new Set(currentProducts.map((p) => p._id));
      setSelectedProductIds((prev) => prev.filter((id) => !pageIdSet.has(id)));
    }
  };

  const handleToggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleBulkPublish = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      setIsBulkActionLoading(true);
      await API.put("/products/bulk-publish", { ids: selectedProductIds });
      await fetchProducts();
      setSelectedProductIds([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish selected products.");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      setIsBulkActionLoading(true);
      await API.put("/products/bulk-unpublish", { ids: selectedProductIds });
      await fetchProducts();
      setSelectedProductIds([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unpublish selected products.");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${selectedProductIds.length} selected product(s)? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setIsBulkActionLoading(true);
      await API.post("/products/bulk-delete", { ids: selectedProductIds });
      await fetchProducts();
      setSelectedProductIds([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete selected products.");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleExportCatalog = () => {
    const dataToExport = (filteredProducts.length > 0 ? filteredProducts : products).map(
      (p, i) => ({
        "No": i + 1,
        "Product Name": p.productName || p.name || "",
        "SKU": p.sku || "",
        "Category": getCategoryName(p),
        "Brand": getBrandName(p),
        "Unit": typeof p.unit === "object" ? p.unit?.name || "" : p.unit || "",
        "Unit No": p.unitNo || 1,
        "Selling Price": p.price || 0,
        "MRP": p.writtenPrice || p.originalPrice || 0,
        "Purchase Price": p.purchasePrice || 0,
        "Stock": p.stockQuantity || 0,
        "Barcode": p.barcode || "",
        "Status": p.status || "active",
        "Created At": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      })
    );

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catalog");
    XLSX.writeFile(
      wb,
      `GrocerySathi_Catalog_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="ap-wrapper">
      {/* TOP HEADER */}
      <div className="ap-header">
        <div className="ap-header-left">
          <h1 className="ap-title">Products Inventory</h1>
          <p className="ap-subtitle">
            Manage your store catalog, real-time inventory, pricing and visibility.
          </p>
        </div>

        <div className="ap-header-actions">
          <button
            type="button"
            className="ap-btn-outline"
            onClick={downloadSampleExcelTemplate}
            title="Download Sample Excel Template"
          >
            <Download size={16} />
            <span>Sample</span>
          </button>

          <button
            type="button"
            className="ap-btn-secondary"
            onClick={() => setIsBulkModalOpen(true)}
            title="Bulk import products from Excel or CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Bulk Product Import</span>
          </button>

          <button className="ap-btn-primary" onClick={handleAddProduct}>
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="ap-metrics-grid">
        <div className="ap-metric-card">
          <div className="ap-metric-icon bg-emerald">
            <Package size={22} />
          </div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Total Products</span>
            <div className="ap-metric-value">{metrics.total}</div>
            <span className="ap-metric-sub">Full catalog count</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon bg-blue">
            <CheckCircle2 size={22} />
          </div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Active Storefront</span>
            <div className="ap-metric-value">{metrics.active}</div>
            <span className="ap-metric-sub">Published & live to buy</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon bg-amber">
            <AlertTriangle size={22} />
          </div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Low / Out of Stock</span>
            <div className="ap-metric-value">{metrics.outOfStock}</div>
            <span className="ap-metric-sub">Requires restocking</span>
          </div>
        </div>

        <div className="ap-metric-card">
          <div className="ap-metric-icon bg-purple">
            <Layers size={22} />
          </div>
          <div className="ap-metric-info">
            <span className="ap-metric-label">Active Categories</span>
            <div className="ap-metric-value">{metrics.totalCategories}</div>
            <span className="ap-metric-sub">Organized product groups</span>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: STATUS TABS, SEARCH, CATEGORY FILTER, SORT */}
      <div className="ap-controls-card">
        {/* Status Tabs */}
        <div className="ap-status-tabs">
          {[
            { id: "All", label: "All Products" },
            { id: "Active", label: "Active" },
            { id: "Inactive", label: "Inactive" },
            { id: "In Stock", label: "In Stock" },
            { id: "Low Stock", label: "Low Stock" },
            { id: "Out of Stock", label: "Out of Stock" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`ap-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter and Search Inputs */}
        <div className="ap-filters-row">
          <div className="ap-search-box">
            <Search size={17} className="ap-search-icon" />
            <input
              type="text"
              placeholder="Search by product name, SKU, category, brand..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="ap-search-clear"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ap-filter-dropdowns">
            {/* Category Selector */}
            <div className="ap-select-wrap">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Categories ({products.length})</option>
                {categoriesList.map((cat) => {
                  const count = products.filter(
                    (p) =>
                      getCategoryName(p).toLowerCase() === cat.toLowerCase()
                  ).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="ap-select-wrap">
              <label>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock-low">Stock: Low to High</option>
              </select>
            </div>

            <button
              className="ap-btn-refresh"
              onClick={fetchProducts}
              title="Refresh Products"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedProductIds.length > 0 && (
        <div className="ap-bulk-bar">
          <div className="ap-bulk-count">
            <CheckCircle2 size={18} />
            <span>{selectedProductIds.length} product(s) selected</span>
          </div>

          <div className="ap-bulk-actions">
            <button
              type="button"
              className="ap-bulk-btn publish"
              onClick={handleBulkPublish}
              disabled={isBulkActionLoading}
              title="Set selected products to Active storefront status"
            >
              Publish Selected
            </button>

            <button
              type="button"
              className="ap-bulk-btn unpublish"
              onClick={handleBulkUnpublish}
              disabled={isBulkActionLoading}
              title="Set selected products to Inactive"
            >
              Unpublish Selected
            </button>

            <button
              type="button"
              className="ap-bulk-btn delete"
              onClick={handleBulkDelete}
              disabled={isBulkActionLoading}
              title="Permanently remove selected products"
            >
              <Trash2 size={15} />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              className="ap-bulk-btn-clear"
              onClick={handleClearSelection}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* FULL-WIDTH TABLE CONTAINER */}
      <div className="ap-table-card">
        {isLoading ? (
          <div className="ap-state-container">
            <div className="ap-spinner"></div>
            <p>Loading products inventory...</p>
          </div>
        ) : errorMessage ? (
          <div className="ap-state-container">
            <AlertTriangle size={36} color="#ef4444" />
            <p className="ap-error-text">{errorMessage}</p>
            <button className="ap-btn-primary" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="ap-state-container">
            <Package size={40} color="#94a3b8" />
            <h3>No products found</h3>
            <p>
              {searchTerm || selectedCategory !== "All" || activeTab !== "All"
                ? "Try adjusting your search criteria or filters."
                : "Your store catalog is currently empty. Add your first product to get started!"}
            </p>
            {(searchTerm || selectedCategory !== "All" || activeTab !== "All") && (
              <button
                className="ap-btn-outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setActiveTab("All");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="ap-table-responsive">
            <table className="ap-table">
              <thead>
                <tr>
                  <th style={{ width: "42px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      className="ap-checkbox"
                      checked={
                        currentProducts.length > 0 &&
                        currentProducts.every((p) =>
                          selectedProductIds.includes(p._id)
                        )
                      }
                      onChange={handleSelectAllOnPage}
                      title="Select / deselect all products on this page"
                    />
                  </th>
                  <th style={{ width: "30%" }}>Product Information</th>
                  <th style={{ width: "16%" }}>Category & Brand</th>
                  <th style={{ width: "14%" }}>Pricing</th>
                  <th style={{ width: "14%" }}>Stock Level</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((prod) => {
                  const regularPrice = Number(prod.price || 0);
                  const discountPrice = Number(prod.discountPrice || 0);
                  const hasDiscount = discountPrice > 0 && discountPrice < regularPrice;
                  const stock = Number(prod.stockQuantity || 0);
                  const lowAlert = Number(prod.lowStockAlert || 5);
                  const isOutOfStock = stock <= 0 || prod.isOutOfStock;
                  const isLowStock = !isOutOfStock && stock <= lowAlert;
                  const isActive = (prod.status || "").toLowerCase() === "active";
                  const isSelected = selectedProductIds.includes(prod._id);

                  return (
                    <tr
                      key={prod._id}
                      className={`ap-table-row ${isSelected ? "ap-row-selected" : ""}`}
                    >
                      {/* Selection Checkbox */}
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="ap-checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(prod._id)}
                        />
                      </td>
                      {/* Product Thumbnail & Name */}
                      <td>
                        <div className="ap-product-flex">
                          <img
                            src={getImageUrl(prod.images)}
                            alt={prod.productName || "Product"}
                            className="ap-product-thumb"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/80?text=No+Img";
                            }}
                          />
                          <div className="ap-product-meta">
                            <span
                              className="ap-product-title"
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowViewModal(true);
                              }}
                              title={prod.productName}
                            >
                              {prod.productName}
                            </span>
                            <div className="ap-product-submeta">
                              {prod.sku && (
                                <span className="ap-sku-pill">
                                  SKU: {prod.sku}
                                </span>
                              )}
                              {prod.barcode && (
                                <span className="ap-barcode-pill">
                                  #{prod.barcode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td>
                        <div className="ap-cat-brand-cell">
                          <span className="ap-category-badge">
                            {getCategoryName(prod) || "General"}
                          </span>
                          {getBrandName(prod) && (
                            <span className="ap-brand-sub">
                              {getBrandName(prod)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td>
                        <div className="ap-pricing-cell">
                          {hasDiscount ? (
                            <>
                              <div className="ap-price-current">
                                ₹{discountPrice.toFixed(2)}
                              </div>
                              <div className="ap-price-old">
                                ₹{regularPrice.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="ap-price-current">
                              ₹{regularPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td>
                        <div className="ap-stock-cell">
                          {isOutOfStock ? (
                            <span className="ap-stock-badge out-of-stock">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="ap-stock-badge low-stock">
                              Low: {stock} {getUnitName(prod)}
                            </span>
                          ) : (
                            <span className="ap-stock-badge in-stock">
                              {stock} {getUnitName(prod) || "in stock"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`ap-status-pill ${
                            isActive ? "status-active" : "status-inactive"
                          }`}
                        >
                          <span className="ap-status-dot"></span>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="ap-action-btns-wrap">
                          <button
                            className="ap-action-btn view"
                            title="Quick View"
                            onClick={() => {
                              setSelectedProduct(prod);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="ap-action-btn edit"
                            title="Edit Product"
                            onClick={() => handleEditProduct(prod)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="ap-action-btn delete"
                            title="Delete Product"
                            onClick={() =>
                              handleDeleteProduct(prod._id, prod.productName)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="ap-pagination-bar">
            <div className="ap-pagination-summary">
              Showing{" "}
              <strong>
                {startIndex + 1} -{" "}
                {Math.min(startIndex + pageSize, filteredProducts.length)}
              </strong>{" "}
              of <strong>{filteredProducts.length}</strong> products
            </div>

            <div className="ap-pagination-controls">
              <div className="ap-page-size-selector">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="ap-page-nav-btns">
                <button
                  className="ap-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                <span className="ap-page-indicator">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="ap-nav-btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK VIEW DETAILS MODAL */}
      {showViewModal && selectedProduct && (
        <div
          className="ap-modal-overlay"
          onClick={() => {
            setShowViewModal(false);
            setSelectedProduct(null);
          }}
        >
          <div
            className="ap-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ap-modal-header">
              <div className="ap-modal-header-info">
                <h3>Product Details</h3>
                <span className="ap-modal-sku">
                  SKU: {selectedProduct.sku || "N/A"}
                </span>
              </div>
              <button
                className="ap-modal-close-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="ap-modal-body">
              {/* Product Header Hero */}
              <div className="ap-modal-product-hero">
                <img
                  src={getImageUrl(selectedProduct.images)}
                  alt={selectedProduct.productName}
                  className="ap-modal-product-img"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/120?text=No+Img";
                  }}
                />
                <div className="ap-modal-hero-details">
                  <h4 className="ap-modal-product-title">
                    {selectedProduct.productName}
                  </h4>
                  <div className="ap-modal-badges">
                    <span className="ap-category-badge">
                      {getCategoryName(selectedProduct) || "General"}
                    </span>
                    {getBrandName(selectedProduct) && (
                      <span className="ap-brand-sub">
                        Brand: {getBrandName(selectedProduct)}
                      </span>
                    )}
                    <span
                      className={`ap-status-pill ${
                        (selectedProduct.status || "").toLowerCase() ===
                        "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      <span className="ap-status-dot"></span>
                      {selectedProduct.status || "active"}
                    </span>
                  </div>

                  <div className="ap-modal-price-display">
                    {Number(selectedProduct.discountPrice || 0) > 0 ? (
                      <>
                        <span className="ap-modal-sale-price">
                          ₹
                          {Number(
                            selectedProduct.discountPrice || 0
                          ).toFixed(2)}
                        </span>
                        <span className="ap-modal-old-price">
                          ₹{Number(selectedProduct.price || 0).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="ap-modal-sale-price">
                        ₹{Number(selectedProduct.price || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="ap-modal-specs-grid">
                <div className="ap-spec-item">
                  <span className="ap-spec-label">Unit</span>
                  <span className="ap-spec-value">
                    {getUnitName(selectedProduct) || "1 Piece"} (
                    {selectedProduct.unitNo || 1})
                  </span>
                </div>

                <div className="ap-spec-item">
                  <span className="ap-spec-label">Available Stock</span>
                  <span className="ap-spec-value highlight">
                    {selectedProduct.stockQuantity || 0}{" "}
                    {getUnitName(selectedProduct) || "Units"}
                  </span>
                </div>

                <div className="ap-spec-item">
                  <span className="ap-spec-label">Low Stock Threshold</span>
                  <span className="ap-spec-value">
                    {selectedProduct.lowStockAlert || 5} units
                  </span>
                </div>

                <div className="ap-spec-item">
                  <span className="ap-spec-label">Cost / Purchase Price</span>
                  <span className="ap-spec-value">
                    ₹{Number(selectedProduct.costPrice || 0).toFixed(2)}
                  </span>
                </div>

                <div className="ap-spec-item">
                  <span className="ap-spec-label">Barcode</span>
                  <span className="ap-spec-value">
                    {selectedProduct.barcode || "Not configured"}
                  </span>
                </div>

                <div className="ap-spec-item">
                  <span className="ap-spec-label">Slug / URL</span>
                  <span className="ap-spec-value code-font">
                    /{selectedProduct.slug || "n-a"}
                  </span>
                </div>
              </div>

              {/* Short & Full Description */}
              {selectedProduct.shortDescription && (
                <div className="ap-modal-desc-box">
                  <span className="ap-spec-label">Short Summary</span>
                  <p>{selectedProduct.shortDescription}</p>
                </div>
              )}

              {selectedProduct.fullDescription && (
                <div className="ap-modal-desc-box">
                  <span className="ap-spec-label">Full Description</span>
                  <p>{selectedProduct.fullDescription}</p>
                </div>
              )}
            </div>

            <div className="ap-modal-footer">
              <button
                className="ap-btn-outline"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
              >
                Close
              </button>
              <button
                className="ap-btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditProduct(selectedProduct);
                }}
              >
                <Edit2 size={15} />
                <span>Edit Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PRODUCT IMPORT MODAL */}
      <BulkProductModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
        }}
      />
    </div>
  );
};

export default Allproduct;

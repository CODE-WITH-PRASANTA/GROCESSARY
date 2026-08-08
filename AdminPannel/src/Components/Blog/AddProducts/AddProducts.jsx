import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Tag,
  Image as ImageIcon,
  UploadCloud,
  RotateCcw,
  Save,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import './AddProducts.css';

const AddProducts = () => {
  const navigate = useNavigate();

  // Initial state for easy resetting
  const initialFormState = {
    productName: '',
    category: '',
    subCategory: '',
    brand: '',
    sku: '',
    unit: '',
    tags: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    discountPrice: '',
    costPrice: '',
    stockQuantity: '',
    lowStockAlert: '',
    tax: '',
    isOutOfStock: false,
    status: 'active', // 'active' | 'inactive'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [productImages, setProductImages] = useState([]);

  // Handle Text/Select/Checkbox Inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle File Uploads (Limit to 5)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + productImages.length > 5) {
      alert('You can upload up to 5 images only.');
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setProductImages((prev) => [...prev, ...newImages]);
  };

  // Remove Single Image
  const handleRemoveImage = (indexToRemove) => {
    setProductImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Reset Form
  const handleReset = () => {
    setFormData(initialFormState);
    setProductImages([]);
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    console.log('Uploaded Images:', productImages);
    alert('Product Saved Successfully!');
  };

  // Navigation Back
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="gs-add-product-container">
      {/* Top Bar Header */}
      <div className="gs-header-bar">
        <div className="gs-header-title-group">
          <h1>Add New Product</h1>
          <div className="gs-breadcrumb">
            <span>Dashboard</span> &gt; <span>Products</span> &gt;{' '}
            <span className="active">Add New Product</span>
          </div>
        </div>
        <button type="button" className="gs-btn-back" onClick={handleBack}>
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="gs-main-layout-grid gs-grid-50-50">
        {/* LEFT COLUMN (50%) */}
        <div className="gs-column">
          <div className="gs-card">
            <div className="gs-card-header">
              <div className="gs-card-icon-wrap">
                <FileText size={18} />
              </div>
              <h2>Product Information</h2>
            </div>

            {/* Product Name */}
            <div className="gs-form-group">
              <label>
                Product Name <span className="gs-required">*</span>
              </label>
              <input
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category & Sub Category */}
            <div className="gs-form-row col-2">
              <div className="gs-form-group">
                <label>
                  Category <span className="gs-required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fresh Fruits</option>
                  <option value="dairy">Dairy & Bakery</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>

              <div className="gs-form-group">
                <label>Sub Category</label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                >
                  <option value="">Select Sub Category</option>
                  <option value="leafy">Leafy Greens</option>
                  <option value="exotic">Exotic Veggies</option>
                  <option value="organic">Organic</option>
                </select>
              </div>
            </div>

            {/* Brand */}
            <div className="gs-form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                placeholder="Enter brand name"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            {/* SKU */}
            <div className="gs-form-group">
              <label>
                SKU (Stock Keeping Unit) <span className="gs-required">*</span>
              </label>
              <input
                type="text"
                name="sku"
                placeholder="Enter SKU code"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>

            {/* Unit & Tags */}
            <div className="gs-form-row col-2">
              <div className="gs-form-group">
                <label>
                  Unit <span className="gs-required">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kg</option>
                  <option value="gm">Gram</option>
                  <option value="ltr">Litre</option>
                  <option value="pcs">Pcs</option>
                  <option value="pack">Pack</option>
                </select>
              </div>

              <div className="gs-form-group">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="Enter tags (e.g. organic, fresh)"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="gs-form-group">
              <label>Short Description</label>
              <div className="gs-textarea-wrapper">
                <textarea
                  name="shortDescription"
                  rows="3"
                  maxLength="200"
                  placeholder="Enter short description about the product..."
                  value={formData.shortDescription}
                  onChange={handleChange}
                ></textarea>
                <span className="gs-char-counter">
                  {formData.shortDescription.length}/200
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div className="gs-form-group">
              <label>Full Description</label>
              <div className="gs-textarea-wrapper">
                <textarea
                  name="fullDescription"
                  rows="5"
                  maxLength="1000"
                  placeholder="Enter full description about the product..."
                  value={formData.fullDescription}
                  onChange={handleChange}
                ></textarea>
                <span className="gs-char-counter">
                  {formData.fullDescription.length}/1000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (50%) */}
        <div className="gs-column">
          {/* Pricing & Stock Card */}
          <div className="gs-card">
            <div className="gs-card-header">
              <div className="gs-card-icon-wrap">
                <Tag size={18} />
              </div>
              <h2>Pricing &amp; Stock</h2>
            </div>

            <div className="gs-form-row col-2">
              <div className="gs-form-group">
                <label>
                  Price (₹) <span className="gs-required">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="gs-form-group">
                <label>Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="discountPrice"
                  placeholder="0.00"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="gs-form-row col-2">
              <div className="gs-form-group">
                <label>Cost Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="costPrice"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="gs-form-group">
                <label>
                  Stock Quantity <span className="gs-required">*</span>
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="gs-form-row col-2">
              <div className="gs-form-group">
                <label>Low Stock Alert</label>
                <input
                  type="number"
                  name="lowStockAlert"
                  placeholder="Enter minimum stock level"
                  value={formData.lowStockAlert}
                  onChange={handleChange}
                />
              </div>

              <div className="gs-form-group">
                <label>Tax (%)</label>
                <input
                  type="number"
                  name="tax"
                  placeholder="0"
                  value={formData.tax}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="gs-checkbox-group">
              <label className="gs-checkbox-label">
                <input
                  type="checkbox"
                  name="isOutOfStock"
                  checked={formData.isOutOfStock}
                  onChange={handleChange}
                />
                <span>This product is out of stock</span>
              </label>
            </div>
          </div>

          {/* Product Images Card */}
          <div className="gs-card">
            <div className="gs-card-header">
              <div className="gs-card-icon-wrap">
                <ImageIcon size={18} />
              </div>
              <h2>Product Images</h2>
            </div>

            <div className="gs-upload-zone-container">
              <label htmlFor="gs-file-input" className="gs-dropzone">
                <div className="gs-upload-circle-icon">
                  <UploadCloud size={24} />
                </div>
                <h3 className="gs-upload-title">Upload Product Images</h3>
                <p className="gs-upload-desc">
                  Drag &amp; drop images here or click to browse<br />
                  JPG, PNG or WEBP (Max. 5MB each)
                </p>
                <span className="gs-upload-note">You can upload up to 5 images</span>
              </label>
              <input
                id="gs-file-input"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Image Preview List */}
            {productImages.length > 0 && (
              <div className="gs-image-preview-grid">
                {productImages.map((imgObj, idx) => (
                  <div key={idx} className="gs-preview-item">
                    <img src={imgObj.url} alt={`Product ${idx + 1}`} />
                    <button
                      type="button"
                      className="gs-remove-img-btn"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Status Card */}
          <div className="gs-card">
            <div className="gs-card-header">
              <div className="gs-card-icon-wrap">
                <Tag size={18} />
              </div>
              <h2>Product Status</h2>
            </div>

            <div className="gs-status-options-grid">
              {/* Active Option */}
              <label
                className={`gs-status-card ${
                  formData.status === 'active' ? 'selected-active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                />
                <div className="gs-status-radio-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="gs-status-info">
                  <div className="gs-status-title">Active</div>
                  <div className="gs-status-sub">Product is available</div>
                </div>
              </label>

              {/* Inactive Option */}
              <label
                className={`gs-status-card ${
                  formData.status === 'inactive' ? 'selected-inactive' : ''
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={handleChange}
                />
                <div className="gs-status-radio-icon">
                  <XCircle size={20} />
                </div>
                <div className="gs-status-info">
                  <div className="gs-status-title">Inactive</div>
                  <div className="gs-status-sub">Product is not available</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* BOTTOM FULL WIDTH ACTION BUTTONS */}
        <div className="gs-footer-actions-row">
          <button type="button" className="gs-btn-reset" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </button>
          <button type="submit" className="gs-btn-save">
            <Save size={16} /> Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
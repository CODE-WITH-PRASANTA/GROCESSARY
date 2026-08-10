import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Loader,
} from 'lucide-react';
import './AddProducts.css';

const API_BASE_URL = 'http://localhost:5000';

const AddProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we navigated with a product object for editing
  const editingProduct = location.state?.product || null;

  const initialFormState = {
    productName: editingProduct?.productName || '',
    category: editingProduct?.category || '',
    subCategory: editingProduct?.subCategory || '',
    brand: editingProduct?.brand || '',
    sku: editingProduct?.sku || '',
    unit: editingProduct?.unit || '',
    tags: editingProduct?.tags || '',
    shortDescription: editingProduct?.shortDescription || '',
    fullDescription: editingProduct?.fullDescription || '',
    price: editingProduct?.price || '',
    discountPrice: editingProduct?.discountPrice || '',
    costPrice: editingProduct?.costPrice || '',
    stockQuantity: editingProduct?.stockQuantity || '',
    lowStockAlert: editingProduct?.lowStockAlert || '',
    tax: editingProduct?.tax || '',
    isOutOfStock: editingProduct?.isOutOfStock || false,
    status: editingProduct?.status || 'active',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [productImages, setProductImages] = useState([]);
  const [existingImages, setExistingImages] = useState(editingProduct?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      productImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [productImages]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + productImages.length + existingImages.length > 5) {
      alert('You can upload up to 5 images only.');
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setProductImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveNewImage = (indexToRemove) => {
    URL.revokeObjectURL(productImages[indexToRemove].url);
    setProductImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleReset = () => {
    productImages.forEach((img) => URL.revokeObjectURL(img.url));
    setFormData(initialFormState);
    setProductImages([]);
    setExistingImages(editingProduct?.images || []);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append new file uploads
      productImages.forEach((imgObj) => {
        data.append('images', imgObj.file);
      });

      // Append retained existing image paths
      data.append('existingImages', JSON.stringify(existingImages));

      const isEditMode = Boolean(editingProduct?._id);
      const url = isEditMode
        ? `${API_BASE_URL}/api/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/products`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save product');
      }

      alert(`Product ${isEditMode ? 'Updated' : 'Created'} Successfully!`);
      handleReset();
      navigate('/products');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <div className="gs-add-product-container">
      <div className="gs-header-bar">
        <div className="gs-header-title-group">
          <h1>{editingProduct ? 'Edit Product' : 'Add New Product'}</h1>
          <div className="gs-breadcrumb">
            <span>Dashboard</span> &gt; <span>Products</span> &gt;{' '}
            <span className="active">{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
          </div>
        </div>
        <button type="button" className="gs-btn-back" onClick={handleBack}>
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>

      {errorMsg && (
        <div className="gs-error-alert" style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="gs-main-layout-grid gs-grid-50-50">
        {/* LEFT COLUMN */}
        <div className="gs-column">
          <div className="gs-card">
            <div className="gs-card-header">
              <div className="gs-card-icon-wrap">
                <FileText size={18} />
              </div>
              <h2>Product Information</h2>
            </div>

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
                  <option value="dairy">Dairy &amp; Bakery</option>
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

            <div className="gs-form-group">
              <label>Short Description</label>
              <div className="gs-textarea-wrapper">
                <textarea
                  name="shortDescription"
                  rows="3"
                  maxLength="200"
                  placeholder="Enter short description..."
                  value={formData.shortDescription}
                  onChange={handleChange}
                ></textarea>
                <span className="gs-char-counter">
                  {formData.shortDescription.length}/200
                </span>
              </div>
            </div>

            <div className="gs-form-group">
              <label>Full Description</label>
              <div className="gs-textarea-wrapper">
                <textarea
                  name="fullDescription"
                  rows="5"
                  maxLength="1000"
                  placeholder="Enter full description..."
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

        {/* RIGHT COLUMN */}
        <div className="gs-column">
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
                  placeholder="Minimum stock level"
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
                  JPG, PNG or WEBP (Max 5MB each)
                </p>
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

            {/* Existing + New Image Previews */}
            {(existingImages.length > 0 || productImages.length > 0) && (
              <div className="gs-image-preview-grid">
                {/* Existing Images */}
                {existingImages.map((imgPath, idx) => (
                  <div key={`existing-${idx}`} className="gs-preview-item">
                    <img src={`${API_BASE_URL}${imgPath}`} alt={`Existing ${idx}`} />
                    <button
                      type="button"
                      className="gs-remove-img-btn"
                      onClick={() => handleRemoveExistingImage(idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {productImages.map((imgObj, idx) => (
                  <div key={`new-${idx}`} className="gs-preview-item">
                    <img src={imgObj.url} alt={`New upload ${idx}`} />
                    <button
                      type="button"
                      className="gs-remove-img-btn"
                      onClick={() => handleRemoveNewImage(idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="gs-card">
            <div className="gs-card-header">
              <div className="gs-card-icon-wrap">
                <Tag size={18} />
              </div>
              <h2>Product Status</h2>
            </div>

            <div className="gs-status-options-grid">
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
                  <div className="gs-status-sub">Product is visible in shop</div>
                </div>
              </label>

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
                  <div className="gs-status-sub">Product is hidden from shop</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="gs-footer-actions-row">
          <button
            type="button"
            className="gs-btn-reset"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button type="submit" className="gs-btn-save" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size={16} className="spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> {editingProduct ? 'Update Product' : 'Save Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
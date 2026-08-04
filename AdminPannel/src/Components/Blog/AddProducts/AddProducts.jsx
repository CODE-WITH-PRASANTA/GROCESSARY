import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import './AddProducts.css';

const AddProducts = () => {
  const navigate = useNavigate();

  // Form State Management
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    brand: '',
    unit: '',
    productType: 'Simple',
    sku: '',
    barcode: '',
    shortDescription: '',
    fullDescription: '',
    regularPrice: '',
    discountPrice: '',
    tax: '0',
    stockQuantity: '',
    lowStockAlert: '',
    allowBackorders: false,
    status: true, // Active
    featuredProduct: false,
    newArrival: false,
  });

  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // Handle Standard Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle TinyMCE Description Change
  const handleEditorChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      fullDescription: content,
    }));
  };

  // Handle Main Image Upload
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(URL.createObjectURL(file));
    }
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + galleryImages.length > 5) {
      alert('You can upload up to 5 images in gallery.');
      return;
    }
    const newImages = files.map((file) => URL.createObjectURL(file));
    setGalleryImages((prev) => [...prev, ...newImages]);
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      productName: '',
      category: '',
      brand: '',
      unit: '',
      productType: 'Simple',
      sku: '',
      barcode: '',
      shortDescription: '',
      fullDescription: '',
      regularPrice: '',
      discountPrice: '',
      tax: '0',
      stockQuantity: '',
      lowStockAlert: '',
      allowBackorders: false,
      status: true,
      featuredProduct: false,
      newArrival: false,
    });
    setMainImage(null);
    setGalleryImages([]);
  };

  // Save Handlers
  const handleSaveProduct = (e) => {
    e.preventDefault();
    console.log('Saved Product Data:', { ...formData, mainImage, galleryImages });
    alert('Product Saved Successfully!');
  };

  const handleSaveDraft = () => {
    alert('Product Saved as Draft!');
  };

  // Back Button Navigation
  const handleBackToProducts = () => {
    if (navigate) {
      navigate('/products'); // Adjust target path as needed
    } else {
      window.history.back();
    }
  };

  return (
    <div className="an-page-container">
      {/* Top Header Section */}
      <div className="an-header-bar">
        <div className="an-header-title-group">
          <h1>Add New Product</h1>
          <div className="an-breadcrumb">
            <span>Dashboard</span> &gt; <span>Products</span> &gt; <span className="active">Add New Product</span>
          </div>
        </div>
        <button className="an-btn-back" type="button" onClick={handleBackToProducts}>
          &larr; Back to Products
        </button>
      </div>

      <form onSubmit={handleSaveProduct} className="an-main-layout-grid">
        {/* LEFT COLUMN: 50% Width */}
        <div className="an-left-column">
          
          {/* Product Information Card */}
          <div className="an-card">
            <h2 className="an-card-title">Product Information</h2>
            
            <div className="an-form-row col-2">
              <div className="an-form-group">
                <label>Product Name <span className="an-required">*</span></label>
                <input
                  type="text"
                  name="productName"
                  placeholder="Enter product name"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-form-group">
                <label>Category <span className="an-required">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Water Bottles">Water Bottles</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
            </div>

            <div className="an-form-row col-3-custom">
              <div className="an-form-group">
                <label>Brand</label>
                <select name="brand" value={formData.brand} onChange={handleChange}>
                  <option value="">Select brand</option>
                  <option value="AquaPure">AquaPure</option>
                  <option value="Bisleri">Bisleri</option>
                  <option value="Kinley">Kinley</option>
                </select>
              </div>

              <div className="an-form-group">
                <label>Unit <span className="an-required">*</span></label>
                <select name="unit" value={formData.unit} onChange={handleChange} required>
                  <option value="">Select unit</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Box">Box</option>
                  <option value="Ltr">Ltr</option>
                </select>
              </div>

              <div className="an-form-group">
                <label>Product Type</label>
                <div className="an-radio-group">
                  <label className="an-radio-label">
                    <input
                      type="radio"
                      name="productType"
                      value="Simple"
                      checked={formData.productType === 'Simple'}
                      onChange={handleChange}
                    />
                    <span className="radio-custom green-dot"></span> Simple
                  </label>
                  <label className="an-radio-label">
                    <input
                      type="radio"
                      name="productType"
                      value="Variable"
                      checked={formData.productType === 'Variable'}
                      onChange={handleChange}
                    />
                    <span className="radio-custom"></span> Variable
                  </label>
                </div>
              </div>
            </div>

            <div className="an-form-row col-2">
              <div className="an-form-group">
                <label>SKU (Stock Keeping Unit) <span className="an-required">*</span></label>
                <input
                  type="text"
                  name="sku"
                  placeholder="Enter SKU"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-form-group">
                <label>Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  placeholder="Enter barcode (optional)"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="an-form-group">
              <label>Short Description</label>
              <textarea
                name="shortDescription"
                rows="3"
                placeholder="Enter short description about the product"
                value={formData.shortDescription}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* TinyMCE Rich Text Editor */}
            <div className="an-form-group">
              <label>Full Description</label>
              <div className="an-tinymce-container">
                <Editor
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu" 
                  value={formData.fullDescription}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 280,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px }',
                    skin: 'oxide',
                    border: '1px solid #cbd5e1'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="an-card">
            <h2 className="an-card-title">Pricing &amp; Stock</h2>

            <div className="an-form-row col-3">
              <div className="an-form-group">
                <label>Regular Price (USD) <span className="an-required">*</span></label>
                <input
                  type="text"
                  name="regularPrice"
                  placeholder="0.00"
                  value={formData.regularPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-form-group">
                <label>Discount Price (USD)</label>
                <input
                  type="text"
                  name="discountPrice"
                  placeholder="0.00"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="an-form-group">
                <label>Tax (%)</label>
                <div className="an-input-suffix-wrap">
                  <input
                    type="text"
                    name="tax"
                    placeholder="0"
                    value={formData.tax}
                    onChange={handleChange}
                  />
                  <span className="suffix">%</span>
                </div>
              </div>
            </div>

            <div className="an-form-row col-2">
              <div className="an-form-group">
                <label>Stock Quantity <span className="an-required">*</span></label>
                <input
                  type="text"
                  name="stockQuantity"
                  placeholder="Enter stock quantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="an-form-group">
                <label>Low Stock Alert</label>
                <input
                  type="text"
                  name="lowStockAlert"
                  placeholder="Enter low stock alert"
                  value={formData.lowStockAlert}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="an-checkbox-group">
              <label className="an-checkbox-label">
                <input
                  type="checkbox"
                  name="allowBackorders"
                  checked={formData.allowBackorders}
                  onChange={handleChange}
                />
                <span className="checkbox-text">Allow Backorders</span>
              </label>
              <small className="an-help-text">Allow customers to order even if product is out of stock</small>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 50% Width */}
        <div className="an-right-column">
          
          {/* Product Images Card */}
          <div className="an-card">
            <h2 className="an-card-title">Product Images</h2>

            {/* Main Image Upload */}
            <div className="an-upload-box-wrapper">
              <label className="an-upload-label-title">Main Image <span className="an-required">*</span></label>
              <label htmlFor="main-image-file" className="an-dropzone">
                {mainImage ? (
                  <img src={mainImage} alt="Main Preview" className="an-image-preview" />
                ) : (
                  <div className="an-dropzone-content">
                    <div className="an-cloud-icon">&#9729;</div>
                    <p className="an-dropzone-title">Upload main image</p>
                    <p className="an-dropzone-sub">PNG, JPG or WEBP (Max. 2MB)</p>
                  </div>
                )}
              </label>
              <input
                id="main-image-file"
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Gallery Images Upload */}
            <div className="an-upload-box-wrapper">
              <label className="an-upload-label-title">Gallery Images</label>
              <label htmlFor="gallery-images-file" className="an-dropzone">
                <div className="an-dropzone-content">
                  <div className="an-cloud-icon">&#9729;</div>
                  <p className="an-dropzone-title">Upload gallery images</p>
                  <p className="an-dropzone-sub">You can upload up to 5 images</p>
                </div>
              </label>
              <input
                id="gallery-images-file"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                style={{ display: 'none' }}
              />

              {galleryImages.length > 0 && (
                <div className="an-gallery-previews">
                  {galleryImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Gallery ${idx}`} className="an-gallery-thumb" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Variants Card */}
          <div className="an-card">
            <h2 className="an-card-title">Product Variants (Optional)</h2>
            <p className="an-card-subtitle">This is a variable product with options like size, color, etc.</p>
            <button type="button" className="an-btn-add-variant" onClick={() => alert('Add variant modal triggered')}>
              + Add Variant
            </button>
          </div>

          {/* Product Status Card */}
          <div className="an-card">
            <h2 className="an-card-title">Product Status</h2>

            <div className="an-status-row">
              <span className="an-status-label">Status <span className="an-required">*</span></span>
              <div className="an-toggle-flex">
                <label className="an-switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                  />
                  <span className="an-slider round"></span>
                </label>
                <span className="an-toggle-text">{formData.status ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="an-status-row">
              <span className="an-status-label">Featured Product</span>
              <div className="an-toggle-flex">
                <label className="an-switch">
                  <input
                    type="checkbox"
                    name="featuredProduct"
                    checked={formData.featuredProduct}
                    onChange={handleChange}
                  />
                  <span className="an-slider round"></span>
                </label>
                <span className="an-toggle-text">{formData.featuredProduct ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="an-status-row">
              <span className="an-status-label">New Arrival</span>
              <div className="an-toggle-flex">
                <label className="an-switch">
                  <input
                    type="checkbox"
                    name="newArrival"
                    checked={formData.newArrival}
                    onChange={handleChange}
                  />
                  <span className="an-slider round"></span>
                </label>
                <span className="an-toggle-text">{formData.newArrival ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BUTTONS ROW */}
        <div className="an-footer-actions-row">
          <button type="button" className="an-btn-draft" onClick={handleSaveDraft}>
            Save as Draft
          </button>
          <button type="button" className="an-btn-reset" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="an-btn-save-product">
            <span className="save-icon">&#128190;</span> Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
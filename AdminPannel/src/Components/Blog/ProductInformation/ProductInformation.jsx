import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './ProductInformation.css';

const ProductInformation = ({ returnIdProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeParamId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [returnReason, setReturnReason] = useState('Damaged Product');
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  const targetReturnId = returnIdProp || location.state?.returnData?.id || routeParamId || 'RET-2026-00124';

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Optimistic Load from Router State
        if (location.state?.returnData && location.state.returnData.id === targetReturnId) {
          const passed = location.state.returnData;
          setProductData({
            productName: passed.product?.name || 'Amul Fresh Milk 1L',
            sku: passed.product?.sku || 'MILK-AM-1L',
            barcode: '8901262134567',
            brand: 'Amul',
            category: 'Dairy',
            unit: 'Piece',
            quantity: passed.qty || 2,
            sellingPrice: passed.product?.price || '₹60.00',
            discount: '- ₹5.00',
            tax: '₹2.75',
            finalPrice: '₹57.75',
            imgUrl: passed.product?.imgUrl || 'https://via.placeholder.com/150?text=Milk',
          });
          setReturnReason(passed.reason || 'Damaged Product');
          setCustomerRemarks(passed.inspectionDetails?.notes || 'Milk packet is leaking and damaged.');
          setUploadedImages([
            'https://via.placeholder.com/100?text=Leak+1',
            'https://via.placeholder.com/100?text=Leak+2',
          ]);
          setUploadedVideos([
            {
              name: 'video_proof_01.mp4',
              size: '2.4 MB',
              url: '#',
              thumbnail: 'https://via.placeholder.com/80?text=▶',
            },
          ]);
          setLoading(false);
          return;
        }

        // Mock API Fetch Fallback
        setTimeout(() => {
          setProductData({
            productName: 'Sample Product', sku: 'SMP-001', barcode: '123456789', brand: 'Generic', category: 'Misc', unit: 'Box', quantity: 1, sellingPrice: '₹100', discount: '₹0', tax: '₹5', finalPrice: '₹105', imgUrl: 'https://via.placeholder.com/150'
          });
          setLoading(false);
        }, 500);

      } catch (err) {
        setError('Something went wrong while fetching product details.');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [targetReturnId, location.state]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => [...prev, ...newUrls]);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[indexToRemove]); // Free memory
      newImages.splice(indexToRemove, 1);
      return newImages;
    });
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newVideos = files.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
      thumbnail: 'https://via.placeholder.com/80?text=▶',
    }));
    setUploadedVideos((prev) => [...prev, ...newVideos]);
  };

  if (loading) return <div className="ProductInfo-container"><div className="ProductInfo-loader">Loading product information...</div></div>;
  if (error) return (
    <div className="ProductInfo-container">
      <button className="ProductInfo-back-btn" onClick={() => navigate(-1)}>← Back to Returns</button>
      <div className="ProductInfo-error-card"><h3>Error</h3><p>{error}</p></div>
    </div>
  );

  return (
    <div className="ProductInfo-container">
      <div className="ProductInfo-header">
        <button type="button" className="ProductInfo-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      <div className="ProductInfo-card">
        {/* SECTION 1: Product Specs */}
        <div className="ProductInfo-section-header">
           <h3 className="ProductInfo-section-title">Product Information</h3>
           <span className="ProductInfo-badge">{targetReturnId}</span>
        </div>

        <div className="ProductInfo-top-grid">
          <div className="ProductInfo-img-wrapper">
            <img src={productData.imgUrl} alt={productData.productName} className="ProductInfo-product-img" />
          </div>

          <div className="ProductInfo-spec-col">
            <div className="ProductInfo-row"><span className="ProductInfo-label">Product Name</span><span className="ProductInfo-value ProductInfo-bold">{productData.productName}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">SKU</span><span className="ProductInfo-value ProductInfo-bold ProductInfo-mono">{productData.sku}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Barcode</span><span className="ProductInfo-value ProductInfo-mono">{productData.barcode}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Brand</span><span className="ProductInfo-value">{productData.brand}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Category</span><span className="ProductInfo-value">{productData.category}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Unit</span><span className="ProductInfo-value">{productData.unit}</span></div>
          </div>

          <div className="ProductInfo-price-col">
            <div className="ProductInfo-row"><span className="ProductInfo-label">Quantity</span><span className="ProductInfo-value">{productData.quantity}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Selling Price</span><span className="ProductInfo-value">{productData.sellingPrice}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Discount</span><span className="ProductInfo-value ProductInfo-text-red">{productData.discount}</span></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Tax (5%)</span><span className="ProductInfo-value">{productData.tax}</span></div>
            <div className="ProductInfo-divider"></div>
            <div className="ProductInfo-row"><span className="ProductInfo-label">Final Price</span><span className="ProductInfo-value ProductInfo-bold">{productData.finalPrice}</span></div>
          </div>
        </div>

        {/* SECTION 2: Return Reason & Images */}
        <div className="ProductInfo-middle-grid">
          <div className="ProductInfo-reason-col">
            <h3 className="ProductInfo-section-title">Return Details</h3>
            
            <div className="ProductInfo-form-group">
              <label className="ProductInfo-sublabel">Reason for Return</label>
              <select className="ProductInfo-select" value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                <option value="Damaged Product">Damaged Product</option>
                <option value="Wrong Product">Wrong Product</option>
                <option value="Poor Quality">Poor Quality</option>
                <option value="Customer Changed Mind">Customer Changed Mind</option>
              </select>
            </div>

            <div className="ProductInfo-form-group">
              <label className="ProductInfo-sublabel">Customer Remarks</label>
              <textarea className="ProductInfo-textarea" rows="4" value={customerRemarks} onChange={(e) => setCustomerRemarks(e.target.value)} />
            </div>
          </div>

          <div className="ProductInfo-uploads-col">
            <div className="ProductInfo-title-with-hint">
              <h3 className="ProductInfo-section-title">Image Proof</h3>
              <span className="ProductInfo-hint-text">({uploadedImages.length}/10)</span>
            </div>

            <div className="ProductInfo-gallery">
              {uploadedImages.map((src, index) => (
                <div key={index} className="ProductInfo-gallery-item">
                  <img src={src} alt={`Proof ${index + 1}`} />
                  <button className="ProductInfo-remove-img" onClick={() => removeImage(index)}>×</button>
                </div>
              ))}

              {uploadedImages.length < 10 && (
                <label className="ProductInfo-upload-btn">
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  <span className="ProductInfo-upload-plus">+</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Videos & Actions */}
        <div className="ProductInfo-video-section">
          <h3 className="ProductInfo-section-title">Video Evidence</h3>
          
          <div className="ProductInfo-video-grid">
            {uploadedVideos.map((video, index) => (
              <div key={index} className="ProductInfo-video-card">
                <div className="ProductInfo-video-thumb"><img src={video.thumbnail} alt="preview" /></div>
                <div className="ProductInfo-video-info">
                  <span className="ProductInfo-video-name">{video.name}</span>
                  <span className="ProductInfo-video-size">{video.size}</span>
                </div>
                <a href={video.url} download={video.name} className="ProductInfo-video-download">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              </div>
            ))}

            <label className="ProductInfo-video-upload-card">
              <input type="file" accept="video/*" multiple onChange={handleVideoUpload} style={{ display: 'none' }} />
              <span className="ProductInfo-upload-icon">+</span>
              <span className="ProductInfo-upload-text">Add Video</span>
            </label>
          </div>
        </div>

        <div className="ProductInfo-actions">
           <button className="ProductInfo-submit-btn" onClick={() => { alert('Details saved!'); navigate(-1); }}>
             Save Information
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInformation;
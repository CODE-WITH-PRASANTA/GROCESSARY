import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Tag,
  Image as ImageIcon,
  UploadCloud,
  RotateCcw,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Loader,
  DollarSign,
  Package,
  Layers,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import "./AddProducts.css";
import API, { BASE_URL } from "../../../api/axios";

const AddProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [editingProduct, setEditingProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Helper: get ID from string or populated object
  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  };

  // Format Date for HTML input[type="date"] (YYYY-MM-DD)
  const formatDateForInput = (val) => {
    if (!val) return "";
    try {
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
        return val.trim();
      }
      if (typeof val === "string" && val.includes("T")) {
        const parts = val.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(parts)) return parts;
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const initialFormState = {
    productName: "",
    slug: "",
    category: "",
    brand: "",
    sku: "",
    barcode: "",
    unit: "",
    unitNo: 1,
    tags: "",
    shortDescription: "",
    fullDescription: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    price: "",
    writtenPrice: "",
    discountPrice: "",
    costPrice: "",
    manufactureDate: "",
    expiryDate: "",
    stockQuantity: "",
    lowStockAlert: 5,
    tax: "",
    isOutOfStock: false,
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingMasterData, setLoadingMasterData] = useState(false);

  // Fetch Master Data (Categories, Brands, Units)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingMasterData(true);
        setErrorMsg("");

        const [catRes, brandRes, unitRes] = await Promise.allSettled([
          API.get("/categories"),
          API.get("/brands"),
          API.get("/units"),
        ]);

        if (catRes.status === "fulfilled") {
          const catData =
            catRes.value.data?.data ||
            catRes.value.data?.categories ||
            catRes.value.data ||
            [];
          setCategories(Array.isArray(catData) ? catData : []);
        }

        if (brandRes.status === "fulfilled") {
          const brandData =
            brandRes.value.data?.data ||
            brandRes.value.data?.brands ||
            brandRes.value.data ||
            [];
          const dynamicBrands = Array.isArray(brandData)
            ? brandData.filter(
                (b) =>
                  b &&
                  b.name &&
                  !["dummy", "fallback", "default", "generic"].includes(
                    String(b.name).toLowerCase().trim()
                  )
              )
            : [];
          setBrands(dynamicBrands);
        }

        if (unitRes.status === "fulfilled") {
          const unitData =
            unitRes.value.data?.data ||
            unitRes.value.data?.units ||
            unitRes.value.data ||
            [];
          setUnits(Array.isArray(unitData) ? unitData : []);
        }
      } catch (error) {
        console.error("Master data load error:", error);
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch product when in edit mode
  useEffect(() => {
    if (!id) {
      setEditingProduct(null);
      return;
    }

    const fetchProductById = async (productId) => {
      try {
        setLoadingProduct(true);
        setErrorMsg("");

        const response = await API.get(`/products/${productId}`);
        const product =
          response.data?.product || response.data?.data || response.data;

        if (!product?._id) {
          throw new Error("Product details not found.");
        }

        setEditingProduct(product);

        setFormData({
          productName: product.productName || product.name || "",
          slug: product.slug || "",
          category: getId(product.category),
          brand: getId(product.brand),
          sku: product.sku || "",
          barcode: product.barcode || "",
          unit: getId(product.unit),
          unitNo: product.unitNo ?? 1,
          tags: Array.isArray(product.tags)
            ? product.tags.join(", ")
            : product.tags || "",
          shortDescription: product.shortDescription || "",
          fullDescription: product.fullDescription || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          metaKeywords: Array.isArray(product.metaKeywords)
            ? product.metaKeywords
            : product.metaKeywords
            ? product.metaKeywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : [],
          price: product.price ?? product.sellingPrice ?? "",
          writtenPrice: product.writtenPrice ?? "",
          discountPrice: product.discountPrice ?? "",
          costPrice: product.costPrice ?? product.purchasePrice ?? "",
          manufactureDate: formatDateForInput(product.manufactureDate),
          expiryDate: formatDateForInput(product.expiryDate),
          stockQuantity: product.stockQuantity ?? product.stock ?? "",
          lowStockAlert: product.lowStockAlert ?? 5,
          tax: product.tax ?? "",
          isOutOfStock: product.isOutOfStock || false,
          status: product.status || "active",
        });

        setExistingImages(Array.isArray(product.images) ? product.images : []);

        // Dynamically ensure the product's brand is included in the brands list
        if (product.brand && typeof product.brand === "object" && product.brand._id) {
          setBrands((prev) => {
            const exists = prev.some(
              (b) => String(b._id || b.id) === String(product.brand._id)
            );
            if (!exists) {
              return [...prev, product.brand];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Fetch product error:", error);
        setErrorMsg(
          error.response?.data?.message ||
            error.message ||
            "Failed to load product."
        );
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductById(id);
  }, [id]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      productImages.forEach((img) => {
        if (img.url) URL.revokeObjectURL(img.url);
      });
    };
  }, [productImages]);

  // Form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Auto-generate slug if product name changes while adding new product
      if (name === "productName" && !editingProduct) {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return next;
    });
  };

  // Image Upload Handling
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length + productImages.length + existingImages.length > 5) {
      alert("You can upload a maximum of 5 images per product.");
      e.target.value = "";
      return;
    }

    const invalidSize = files.find((file) => file.size > 5 * 1024 * 1024);
    if (invalidSize) {
      alert("Each image must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const invalidType = files.find((file) => !validTypes.includes(file.type));
    if (invalidType) {
      alert("Allowed image formats: JPG, PNG, WEBP.");
      e.target.value = "";
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setProductImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveNewImage = (idxToRemove) => {
    const img = productImages[idxToRemove];
    if (img?.url) URL.revokeObjectURL(img.url);
    setProductImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleRemoveExistingImage = (idxToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Meta keywords
  const handleMetaKeywordKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const keyword = e.target.value.trim();
    if (!keyword) return;

    const exists = formData.metaKeywords.some(
      (k) => k.toLowerCase() === keyword.toLowerCase()
    );
    if (exists) {
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      metaKeywords: [...prev.metaKeywords, keyword],
    }));
    e.target.value = "";
  };

  const removeMetaKeyword = (keywordToRemove) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((k) => k !== keywordToRemove),
    }));
  };

  // Price calculations
  const priceCalculations = useMemo(() => {
    const regular = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discountPrice) || 0;
    const cost = parseFloat(formData.costPrice) || 0;

    let discountPercent = 0;
    if (regular > 0 && discount > 0 && discount < regular) {
      discountPercent = Math.round(((regular - discount) / regular) * 100);
    }

    let profitMargin = 0;
    const effectivePrice = discount > 0 ? discount : regular;
    if (effectivePrice > 0 && cost > 0) {
      profitMargin = Math.round(((effectivePrice - cost) / effectivePrice) * 100);
    }

    return { discountPercent, profitMargin, effectivePrice };
  }, [formData.price, formData.discountPrice, formData.costPrice]);

  // Validation
  const validateForm = () => {
    if (!formData.productName.trim()) return "Product Name is required.";
    if (!formData.category) return "Please select a Category.";
    if (!formData.sku.trim()) return "Product SKU code is required.";
    if (!formData.unit) return "Please select a Unit type.";
    if (!formData.unitNo || Number(formData.unitNo) < 1)
      return "Unit value must be at least 1.";
    if (formData.price === "" || Number(formData.price) < 0)
      return "Valid regular price is required.";
    if (formData.discountPrice !== "" && Number(formData.discountPrice) < 0)
      return "Discount price cannot be negative.";
    if (formData.stockQuantity !== "" && Number(formData.stockQuantity) < 0)
      return "Stock quantity cannot be negative.";
    return "";
  };

  // Reset form
  const handleReset = () => {
    if (!window.confirm("Discard all unsaved changes in this form?")) return;

    productImages.forEach((img) => {
      if (img.url) URL.revokeObjectURL(img.url);
    });
    setProductImages([]);
    setErrorMsg("");
    setSuccessMsg("");

    if (editingProduct) {
      navigate(`/products/add-product/${editingProduct._id}`, { replace: true });
    } else {
      setFormData(initialFormState);
      setExistingImages([]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "metaKeywords") {
          data.append(key, JSON.stringify(formData.metaKeywords || []));
        } else {
          data.append(key, formData[key] ?? "");
        }
      });

      productImages.forEach((imgObj) => {
        data.append("images", imgObj.file);
      });

      data.append("existingImages", JSON.stringify(existingImages));

      const isEditMode = Boolean(editingProduct?._id);
      if (isEditMode) {
        await API.put(`/products/${editingProduct._id}`, data);
      } else {
        await API.post("/products", data);
      }

      setSuccessMsg(
        `Product successfully ${isEditMode ? "updated" : "created"}!`
      );

      productImages.forEach((img) => {
        if (img.url) URL.revokeObjectURL(img.url);
      });
      setProductImages([]);

      setTimeout(() => {
        navigate("/products/all-products", { replace: true });
      }, 700);
    } catch (error) {
      console.error("Save product error:", error);
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Failed to save product. Please try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "object") {
      img = img.url || img.path || img.fileName || "";
    }
    if (!img) return "";
    if (/^https?:\/\//i.test(img)) return img;
    return `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div className="addp-wrapper">
      {/* TOP HEADER */}
      <div className="addp-header">
        <div className="addp-header-left">
          <div className="addp-title-wrap">
            <h1 className="addp-title">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h1>
            <span className="addp-subtitle">
              {editingProduct
                ? `Updating: ${editingProduct.productName || "Product"}`
                : "Fill in the details below to publish a new product to your store catalog."}
            </span>
          </div>
        </div>

        <div className="addp-header-actions">
          <button
            type="button"
            className="addp-btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw size={15} />
            <span>Discard</span>
          </button>

          <button
            type="button"
            className="addp-btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="addp-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{editingProduct ? "Update Product" : "Save Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {errorMsg && (
        <div className="addp-alert error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
          <button
            type="button"
            className="addp-alert-close"
            onClick={() => setErrorMsg("")}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="addp-alert success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MAIN ASYMMETRICAL 2-COLUMN FORM */}
      <form onSubmit={handleSubmit} className="addp-form-layout">
        {/* LEFT COLUMN: MAIN CONTENT (68%) */}
        <div className="addp-main-col">
          {/* CARD 1: GENERAL INFORMATION */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-icon emerald">
                <FileText size={18} />
              </div>
              <div className="addp-card-heading">
                <h2>Product Information</h2>
                <p>Provide the essential customer-facing name and descriptions.</p>
              </div>
            </div>

            <div className="addp-card-body">
              {/* Product Name */}
              <div className="addp-field">
                <label>
                  Product Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  placeholder="e.g. Fresh Farm Organic Tomatoes"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Slug */}
              <div className="addp-field">
                <label>
                  Product Slug / URL handle <span className="req">*</span>
                </label>
                <div className="addp-input-prefix-wrap">
                  <span className="addp-input-prefix">store.com/product/</span>
                  <input
                    type="text"
                    name="slug"
                    placeholder="fresh-farm-organic-tomatoes"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="addp-field">
                <div className="addp-label-row">
                  <label>Short Summary</label>
                  <span className="addp-counter">
                    {formData.shortDescription.length}/200
                  </span>
                </div>
                <textarea
                  name="shortDescription"
                  rows={2}
                  maxLength={200}
                  placeholder="Brief 1-2 sentence highlight shown in quick views and cart previews..."
                  value={formData.shortDescription}
                  onChange={handleChange}
                />
              </div>

              {/* Full Description */}
              <div className="addp-field">
                <div className="addp-label-row">
                  <label>Detailed Description</label>
                  <span className="addp-counter">
                    {formData.fullDescription.length}/1000
                  </span>
                </div>
                <textarea
                  name="fullDescription"
                  rows={5}
                  maxLength={1000}
                  placeholder="Complete product details, nutritional information, origin, storage instructions, etc..."
                  value={formData.fullDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: MEDIA & GALLERY */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-icon blue">
                <ImageIcon size={18} />
              </div>
              <div className="addp-card-heading">
                <h2>Product Images</h2>
                <p>Upload clear photos. The first image will be set as primary.</p>
              </div>
            </div>

            <div className="addp-card-body">
              {/* Upload Dropzone */}
              <label htmlFor="addp-file-input" className="addp-dropzone">
                <div className="addp-dropzone-icon">
                  <UploadCloud size={28} />
                </div>
                <div className="addp-dropzone-text">
                  <span className="addp-dropzone-title">
                    Click to browse or drop images here
                  </span>
                  <span className="addp-dropzone-hint">
                    PNG, JPG, or WEBP up to 5MB each (Up to 5 images)
                  </span>
                </div>
                <input
                  id="addp-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>

              {/* Images Preview Grid */}
              {(existingImages.length > 0 || productImages.length > 0) && (
                <div className="addp-preview-grid">
                  {/* Existing Images */}
                  {existingImages.map((imgPath, idx) => (
                    <div key={`exist-${idx}`} className="addp-preview-card">
                      <img
                        src={getImageUrl(imgPath)}
                        alt={`Product ${idx}`}
                        className="addp-preview-img"
                      />
                      {idx === 0 && (
                        <span className="addp-primary-badge">Primary</span>
                      )}
                      <button
                        type="button"
                        className="addp-remove-img-btn"
                        onClick={() => handleRemoveExistingImage(idx)}
                        title="Remove image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  {/* New Images */}
                  {productImages.map((imgObj, idx) => {
                    const isFirstOverall =
                      existingImages.length === 0 && idx === 0;
                    return (
                      <div key={`new-${idx}`} className="addp-preview-card">
                        <img
                          src={imgObj.url}
                          alt={`Upload ${idx}`}
                          className="addp-preview-img"
                        />
                        {isFirstOverall && (
                          <span className="addp-primary-badge">Primary</span>
                        )}
                        <button
                          type="button"
                          className="addp-remove-img-btn"
                          onClick={() => handleRemoveNewImage(idx)}
                          title="Remove image"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CARD 3: PRICING & INVENTORY */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-icon emerald">
                <DollarSign size={18} />
              </div>
              <div className="addp-card-heading">
                <h2>Pricing & Margins</h2>
                <p>Configure pricing, discounts, and monitor estimated profit margins.</p>
              </div>
            </div>

            <div className="addp-card-body">
              <div className="addp-grid-3">
                {/* Regular Price */}
                <div className="addp-field">
                  <label>
                    Regular Price (₹) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Discounted / Selling Price */}
                <div className="addp-field">
                  <label>Sale / Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="discountPrice"
                    placeholder="0.00"
                    value={formData.discountPrice}
                    onChange={handleChange}
                  />
                </div>

                {/* Cost Price */}
                <div className="addp-field">
                  <label>Purchase Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="costPrice"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Dynamic Calculation Insights */}
              {(priceCalculations.discountPercent > 0 ||
                priceCalculations.profitMargin > 0) && (
                <div className="addp-pricing-insights">
                  <Sparkles size={16} className="addp-sparkle" />
                  <div className="addp-insight-chips">
                    {priceCalculations.discountPercent > 0 && (
                      <span className="addp-insight-chip discount">
                        Customer Discount: {priceCalculations.discountPercent}% OFF
                      </span>
                    )}
                    {priceCalculations.profitMargin > 0 && (
                      <span className="addp-insight-chip margin">
                        Gross Margin: {priceCalculations.profitMargin}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="addp-grid-2">
                {/* Written / MRP Price */}
                <div className="addp-field">
                  <label>Written / MRP Label (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="writtenPrice"
                    placeholder="Printed packaging MRP"
                    value={formData.writtenPrice}
                    onChange={handleChange}
                  />
                </div>

                {/* Tax */}
                <div className="addp-field">
                  <label>Tax / GST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="tax"
                    placeholder="e.g. 5 or 18"
                    value={formData.tax}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: SEO & METADATA */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-icon purple">
                <Tag size={18} />
              </div>
              <div className="addp-card-heading">
                <h2>Search Engine Optimization (SEO)</h2>
                <p>Enhance visibility in Google and organic search results.</p>
              </div>
            </div>

            <div className="addp-card-body">
              <div className="addp-field">
                <label>Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  placeholder="e.g. Buy Fresh Organic Tomatoes Online at Best Price"
                  value={formData.metaTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="addp-field">
                <div className="addp-label-row">
                  <label>Meta Description</label>
                  <span className="addp-counter">
                    {formData.metaDescription.length}/300
                  </span>
                </div>
                <textarea
                  name="metaDescription"
                  rows={3}
                  maxLength={300}
                  placeholder="Summary snippet displayed beneath your page title in search engine results..."
                  value={formData.metaDescription}
                  onChange={handleChange}
                />
              </div>

              {/* Meta Keywords Pill Input */}
              <div className="addp-field">
                <label>Meta Keywords</label>
                <div className="addp-keyword-box">
                  {formData.metaKeywords.map((keyword) => (
                    <span key={keyword} className="addp-keyword-pill">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeMetaKeyword(keyword)}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Type keyword and press Enter..."
                    onKeyDown={handleMetaKeywordKeyDown}
                  />
                </div>
                <span className="addp-field-hint">
                  Press Enter after each keyword to add it as a tag.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR CONTROLS (32%) */}
        <div className="addp-side-col">
          {/* SIDE CARD 1: PRODUCT STATUS */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-heading">
                <h2>Product Status</h2>
                <p>Control whether this item is published to shoppers.</p>
              </div>
            </div>

            <div className="addp-card-body">
              <div className="addp-status-toggle-grid">
                <label
                  className={`addp-status-option ${
                    formData.status === "active" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === "active"}
                    onChange={handleChange}
                  />
                  <div className="addp-status-opt-left">
                    <CheckCircle2 size={18} className="addp-status-check" />
                    <div>
                      <span className="addp-status-opt-title">Active</span>
                      <span className="addp-status-opt-desc">
                        Visible and live in store
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`addp-status-option ${
                    formData.status === "inactive" ? "inactive" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === "inactive"}
                    onChange={handleChange}
                  />
                  <div className="addp-status-opt-left">
                    <XCircle size={18} className="addp-status-x" />
                    <div>
                      <span className="addp-status-opt-title">Inactive</span>
                      <span className="addp-status-opt-desc">
                        Hidden draft / archived
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="addp-checkbox-row">
                <input
                  type="checkbox"
                  id="isOutOfStock"
                  name="isOutOfStock"
                  checked={formData.isOutOfStock}
                  onChange={handleChange}
                />
                <label htmlFor="isOutOfStock">
                  Mark as forcefully Out of Stock
                </label>
              </div>
            </div>
          </div>

          {/* SIDE CARD 2: CATEGORY & CLASSIFICATION */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-heading">
                <h2>Organization</h2>
                <p>Categorize for easy customer discovery.</p>
              </div>
            </div>

            <div className="addp-card-body">
              {/* Category */}
              <div className="addp-field">
                <label>
                  Category <span className="req">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="addp-field">
                <label>Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id || brand.id} value={brand._id || brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit & Unit No */}
              <div className="addp-grid-2">
                <div className="addp-field">
                  <label>
                    Unit <span className="req">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {loadingMasterData ? "Loading..." : "Unit"}
                    </option>
                    {units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.name} ({unit.shortName || unit.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="addp-field">
                  <label>
                    Unit Qty <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    name="unitNo"
                    min="1"
                    placeholder="1"
                    value={formData.unitNo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="addp-field">
                <label>Product Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g. organic, fresh, summer"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SIDE CARD 3: INVENTORY & TRACKING */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-heading">
                <h2>Inventory & Barcode</h2>
                <p>Stock levels and warehouse identifiers.</p>
              </div>
            </div>

            <div className="addp-card-body">
              {/* SKU */}
              <div className="addp-field">
                <label>
                  SKU (Stock Keeping Unit) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="e.g. GRO-TOM-01"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Barcode */}
              <div className="addp-field">
                <label>Barcode / UPC</label>
                <input
                  type="text"
                  name="barcode"
                  placeholder="Scan or enter barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>

              {/* Stock Quantity */}
              <div className="addp-grid-2">
                <div className="addp-field">
                  <label>
                    Stock Qty <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="stockQuantity"
                    placeholder="0"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="addp-field">
                  <label>Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    name="lowStockAlert"
                    placeholder="5"
                    value={formData.lowStockAlert}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SIDE CARD 4: DATES & LIFECYCLE */}
          <div className="addp-card">
            <div className="addp-card-header">
              <div className="addp-card-icon purple">
                <Calendar size={18} />
              </div>
              <div className="addp-card-heading">
                <h2>Dates & Lifecycle</h2>
                <p>Manufacturing and expiration dates.</p>
              </div>
            </div>

            <div className="addp-card-body">
              <div className="addp-field">
                <label>Manufacture Date</label>
                <input
                  type="date"
                  name="manufactureDate"
                  value={formData.manufactureDate || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="addp-field">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;

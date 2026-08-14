import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
} from "lucide-react";

import "./AddProducts.css";

const API_BASE_URL = "http://localhost:5000";

const AddProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  const editingProduct =
    location.state?.product || null;

  // =====================================================
  // HELPER
  // GET ID FROM STRING OR POPULATED OBJECT
  // =====================================================

  const getId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
      return value._id || value.id || "";
    }

    return value;
  };

  // =====================================================
  // INITIAL FORM
  // =====================================================

  const initialFormState = {
    productName:
      editingProduct?.productName || "",

    slug:
      editingProduct?.slug || "",

    category:
      getId(editingProduct?.category),

    brand:
      getId(editingProduct?.brand),

    sku:
      editingProduct?.sku || "",

    unit:
      getId(editingProduct?.unit),

    tags:
      Array.isArray(editingProduct?.tags)
        ? editingProduct.tags.join(", ")
        : editingProduct?.tags || "",

    shortDescription:
      editingProduct?.shortDescription || "",

    fullDescription:
      editingProduct?.fullDescription || "",

    // ===================================================
    // SEO
    // ===================================================

    metaTitle:
      editingProduct?.metaTitle || "",

    metaDescription:
      editingProduct?.metaDescription || "",

    metaKeywords:
      Array.isArray(
        editingProduct?.metaKeywords
      )
        ? editingProduct.metaKeywords.join(
            ", "
          )
        : editingProduct?.metaKeywords || "",

    // ===================================================
    // PRICE
    // ===================================================

    price:
      editingProduct?.price ?? "",

    discountPrice:
      editingProduct?.discountPrice ?? "",

    costPrice:
      editingProduct?.costPrice ?? "",

    stockQuantity:
      editingProduct?.stockQuantity ?? "",

    lowStockAlert:
      editingProduct?.lowStockAlert ?? "",

    tax:
      editingProduct?.tax ?? "",

    isOutOfStock:
      editingProduct?.isOutOfStock || false,

    status:
      editingProduct?.status || "active",
  };

  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] =
    useState(initialFormState);

  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  const [categories, setCategories] =
    useState([]);

  const [brands, setBrands] =
    useState([]);

  const [units, setUnits] =
    useState([]);

  // =====================================================
  // IMAGE STATE
  // =====================================================

  const [productImages, setProductImages] =
    useState([]);

  const [existingImages, setExistingImages] =
    useState(
      editingProduct?.images || []
    );

  // =====================================================
  // UI STATE
  // =====================================================

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [loadingMasterData, setLoadingMasterData] =
    useState(false);

  // =====================================================
  // FETCH MASTER DATA
  // =====================================================

  useEffect(() => {
    fetchMasterData();
  }, []);

  // =====================================================
  // FETCH CATEGORY / BRAND / UNIT
  // =====================================================

  const fetchMasterData = async () => {
    try {
      setLoadingMasterData(true);
      setErrorMsg("");

      const [
        categoryResponse,
        brandResponse,
        unitResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/categories`
        ),

        fetch(
          `${API_BASE_URL}/api/brands`
        ),

        fetch(
          `${API_BASE_URL}/api/units`
        ),
      ]);

      const [
        categoryResult,
        brandResult,
        unitResult,
      ] = await Promise.all([
        categoryResponse.json(),
        brandResponse.json(),
        unitResponse.json(),
      ]);

      // =================================================
      // CATEGORY
      // =================================================

      if (categoryResponse.ok) {
        setCategories(
          categoryResult?.data || []
        );
      } else {
        console.error(
          "Category API error:",
          categoryResult
        );
      }

      // =================================================
      // BRAND
      // =================================================

      if (brandResponse.ok) {
        setBrands(
          brandResult?.data || []
        );
      } else {
        console.error(
          "Brand API error:",
          brandResult
        );
      }

      // =================================================
      // UNIT
      // =================================================

      if (unitResponse.ok) {
        setUnits(
          unitResult?.data || []
        );
      } else {
        console.error(
          "Unit API error:",
          unitResult
        );
      }
    } catch (error) {
      console.error(
        "Master data error:",
        error
      );

      setErrorMsg(
        "Failed to load category, brand or unit data."
      );
    } finally {
      setLoadingMasterData(false);
    }
  };

  // =====================================================
  // REVOKE OBJECT URL
  // =====================================================

  useEffect(() => {
    return () => {
      productImages.forEach(
        (img) => {
          if (img.url) {
            URL.revokeObjectURL(
              img.url
            );
          }
        }
      );
    };
  }, [productImages]);

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    // ===================================================
    // PRODUCT NAME -> AUTO SLUG
    // ONLY WHEN CREATING
    // ===================================================

    if (
      name === "productName" &&
      !editingProduct
    ) {
      const generatedSlug =
        value
          .toLowerCase()
          .trim()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );

      setFormData((prev) => ({
        ...prev,
        productName: value,
        slug: generatedSlug,
      }));
    }
  };

  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  const handleImageUpload = (e) => {
    const files =
      Array.from(
        e.target.files || []
      );

    if (!files.length) {
      return;
    }

    // ===================================================
    // CHECK TOTAL IMAGE COUNT
    // ===================================================

    if (
      files.length +
        productImages.length +
        existingImages.length >
      5
    ) {
      alert(
        "You can upload up to 5 images only."
      );

      e.target.value = "";

      return;
    }

    // ===================================================
    // CHECK FILE SIZE
    // ===================================================

    const invalidFile =
      files.find(
        (file) =>
          file.size >
          5 * 1024 * 1024
      );

    if (invalidFile) {
      alert(
        "Each image must be less than 5MB."
      );

      e.target.value = "";

      return;
    }

    // ===================================================
    // CHECK FILE TYPE
    // ===================================================

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidType =
      files.find(
        (file) =>
          !validTypes.includes(
            file.type
          )
      );

    if (invalidType) {
      alert(
        "Only JPG, PNG and WEBP images are allowed."
      );

      e.target.value = "";

      return;
    }

    // ===================================================
    // CREATE PREVIEWS
    // ===================================================

    const newImages =
      files.map((file) => ({
        file,

        url:
          URL.createObjectURL(
            file
          ),
      }));

    setProductImages(
      (prev) => [
        ...prev,
        ...newImages,
      ]
    );

    // Allow selecting same file again
    e.target.value = "";
  };

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  const handleRemoveNewImage =
    (indexToRemove) => {
      const image =
        productImages[
          indexToRemove
        ];

      if (image?.url) {
        URL.revokeObjectURL(
          image.url
        );
      }

      setProductImages(
        (prev) =>
          prev.filter(
            (_, idx) =>
              idx !==
              indexToRemove
          )
      );
    };

  // =====================================================
  // REMOVE EXISTING IMAGE
  // =====================================================

  const handleRemoveExistingImage =
    (indexToRemove) => {
      setExistingImages(
        (prev) =>
          prev.filter(
            (_, idx) =>
              idx !==
              indexToRemove
          )
      );
    };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    productImages.forEach(
      (img) => {
        if (img.url) {
          URL.revokeObjectURL(
            img.url
          );
        }
      }
    );

    setFormData(
      initialFormState
    );

    setProductImages([]);

    setExistingImages(
      editingProduct?.images || []
    );

    setErrorMsg("");
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    if (
      !formData.productName.trim()
    ) {
      return "Product name is required.";
    }

    if (!formData.category) {
      return "Please select a category.";
    }

    if (!formData.sku.trim()) {
      return "SKU is required.";
    }

    if (!formData.unit) {
      return "Please select a unit.";
    }

    if (
      formData.price === "" ||
      formData.price === null ||
      formData.price === undefined
    ) {
      return "Price is required.";
    }

    if (
      Number(formData.price) < 0
    ) {
      return "Price cannot be negative.";
    }

    if (
      formData.discountPrice !==
        "" &&
      Number(
        formData.discountPrice
      ) < 0
    ) {
      return "Discount price cannot be negative.";
    }

    if (
      formData.costPrice !==
        "" &&
      Number(
        formData.costPrice
      ) < 0
    ) {
      return "Cost price cannot be negative.";
    }

    if (
      formData.stockQuantity !==
        "" &&
      Number(
        formData.stockQuantity
      ) < 0
    ) {
      return "Stock quantity cannot be negative.";
    }

    if (
      formData.tax !== "" &&
      Number(formData.tax) < 0
    ) {
      return "Tax cannot be negative.";
    }

    if (
      existingImages.length +
        productImages.length >
      5
    ) {
      return "Maximum 5 images are allowed.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setErrorMsg("");

      // =================================================
      // VALIDATION
      // =================================================

      const validationError =
        validateForm();

      if (validationError) {
        setErrorMsg(
          validationError
        );

        return;
      }

      setIsSubmitting(true);

      try {
        // ===============================================
        // FORM DATA
        // ===============================================

        const data =
          new FormData();

        // ===============================================
        // NORMAL FORM FIELDS
        // ===============================================

        Object.keys(
          formData
        ).forEach((key) => {
          data.append(
            key,
            formData[key] ??
              ""
          );
        });

        // ===============================================
        // NEW IMAGES
        // ===============================================

        productImages.forEach(
          (imgObj) => {
            data.append(
              "images",
              imgObj.file
            );
          }
        );

        // ===============================================
        // EXISTING IMAGES
        // ===============================================

        data.append(
          "existingImages",
          JSON.stringify(
            existingImages
          )
        );

        // ===============================================
        // EDIT OR CREATE
        // ===============================================

        const isEditMode =
          Boolean(
            editingProduct?._id
          );

        const url =
          isEditMode
            ? `${API_BASE_URL}/api/products/${editingProduct._id}`
            : `${API_BASE_URL}/api/products`;

        // ===============================================
        // REQUEST
        // ===============================================

        const response =
          await fetch(url, {
            method:
              isEditMode
                ? "PUT"
                : "POST",

            body: data,
          });

        // ===============================================
        // RESPONSE
        // ===============================================

        let result;

        try {
          result =
            await response.json();
        } catch (jsonError) {
          throw new Error(
            "Invalid response from server."
          );
        }

        // ===============================================
        // ERROR
        // ===============================================

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to save product."
          );
        }

        // ===============================================
        // SUCCESS
        // ===============================================

        alert(
          `Product ${
            isEditMode
              ? "Updated"
              : "Created"
          } Successfully!`
        );

        // ===============================================
        // CLEANUP
        // ===============================================

        productImages.forEach(
          (img) => {
            if (img.url) {
              URL.revokeObjectURL(
                img.url
              );
            }
          }
        );

        setProductImages([]);

        // ===============================================
        // NAVIGATE
        // ===============================================

        navigate(
          "/products/all-products",
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Save product error:",
          err
        );

        setErrorMsg(
          err.message ||
            "Something went wrong while saving."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(
      "/products/all-products",
      {
        replace: true,
      }
    );
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (
    imgPath
  ) => {
    if (!imgPath) {
      return "";
    }

    if (
      /^https?:\/\//i.test(
        imgPath
      )
    ) {
      return imgPath;
    }

    return `${API_BASE_URL}${
      imgPath.startsWith("/")
        ? ""
        : "/"
    }${imgPath}`;
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="gs-add-product-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="gs-header-bar">

        <div className="gs-header-title-group">

          <h1>
            {editingProduct
              ? "Edit Product"
              : "Add New Product"}
          </h1>

          <div className="gs-breadcrumb">

            <span>
              Dashboard
            </span>

            {" > "}

            <span>
              Products
            </span>

            {" > "}

            <span className="active">
              {editingProduct
                ? "Edit Product"
                : "Add New Product"}
            </span>

          </div>

        </div>

        <button
          type="button"
          className="gs-btn-back"
          onClick={
            handleBack
          }
        >
          <ArrowLeft
            size={16}
          />

          Back to Products
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {errorMsg && (
        <div
          className="gs-error-alert"
          style={{
            color: "red",
            marginBottom:
              "1rem",
            fontWeight:
              "bold",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={
          handleSubmit
        }
        className="gs-main-layout-grid gs-grid-50-50"
      >

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="gs-column">

          <div className="gs-card">

            <div className="gs-card-header">

              <div className="gs-card-icon-wrap">

                <FileText
                  size={18}
                />

              </div>

              <h2>
                Product Information
              </h2>

            </div>

            {/* ===========================================
                PRODUCT NAME
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Product Name{" "}
                <span className="gs-required">
                  *
                </span>
              </label>

              <input
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={
                  formData.productName
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* ===========================================
                SLUG
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Slug{" "}
                <span className="gs-required">
                  *
                </span>
              </label>

              <input
                type="text"
                name="slug"
                placeholder="product-slug"
                value={
                  formData.slug
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* ===========================================
                CATEGORY
            =========================================== */}

            <div className="gs-form-row col-2">

              <div className="gs-form-group">

                <label>
                  Category{" "}
                  <span className="gs-required">
                    *
                  </span>
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    {loadingMasterData
                      ? "Loading..."
                      : "Select Category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category._id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* ===========================================
                BRAND
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Brand
              </label>

              <select
                name="brand"
                value={
                  formData.brand
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  {loadingMasterData
                    ? "Loading..."
                    : "Select Brand"}
                </option>

                {brands.map(
                  (brand) => (
                    <option
                      key={
                        brand._id
                      }
                      value={
                        brand._id
                      }
                    >
                      {
                        brand.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ===========================================
                SKU
            =========================================== */}

            <div className="gs-form-group">

              <label>
                SKU (Stock Keeping Unit){" "}
                <span className="gs-required">
                  *
                </span>
              </label>

              <input
                type="text"
                name="sku"
                placeholder="Enter SKU code"
                value={
                  formData.sku
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* ===========================================
                UNIT / TAGS
            =========================================== */}

            <div className="gs-form-row col-2">

              <div className="gs-form-group">

                <label>
                  Unit{" "}
                  <span className="gs-required">
                    *
                  </span>
                </label>

                <select
                  name="unit"
                  value={
                    formData.unit
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    {loadingMasterData
                      ? "Loading..."
                      : "Select Unit"}
                  </option>

                  {units.map(
                    (unit) => (
                      <option
                        key={
                          unit._id
                        }
                        value={
                          unit._id
                        }
                      >
                        {unit.name}

                        {unit.shortName
                          ? ` (${unit.shortName})`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="gs-form-group">

                <label>
                  Tags
                </label>

                <input
                  type="text"
                  name="tags"
                  placeholder="Enter tags (e.g. organic, fresh)"
                  value={
                    formData.tags
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* ===========================================
                SHORT DESCRIPTION
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Short Description
              </label>

              <div className="gs-textarea-wrapper">

                <textarea
                  name="shortDescription"
                  rows="3"
                  maxLength="200"
                  placeholder="Enter short description..."
                  value={
                    formData.shortDescription
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="gs-char-counter">

                  {
                    formData
                      .shortDescription
                      .length
                  }
                  /200

                </span>

              </div>

            </div>

            {/* ===========================================
                FULL DESCRIPTION
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Full Description
              </label>

              <div className="gs-textarea-wrapper">

                <textarea
                  name="fullDescription"
                  rows="5"
                  maxLength="1000"
                  placeholder="Enter full description..."
                  value={
                    formData.fullDescription
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="gs-char-counter">

                  {
                    formData
                      .fullDescription
                      .length
                  }
                  /1000

                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              SEO CARD
          ================================================= */}

          <div className="gs-card">

            <div className="gs-card-header">

              <div className="gs-card-icon-wrap">

                <Tag
                  size={18}
                />

              </div>

              <h2>
                SEO Information
              </h2>

            </div>

            {/* ===========================================
                META TITLE
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Meta Title
              </label>

              <input
                type="text"
                name="metaTitle"
                placeholder="Enter SEO meta title"
                value={
                  formData.metaTitle
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* ===========================================
                META DESCRIPTION
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Meta Description
              </label>

              <div className="gs-textarea-wrapper">

                <textarea
                  name="metaDescription"
                  rows="4"
                  maxLength="300"
                  placeholder="Enter SEO meta description..."
                  value={
                    formData.metaDescription
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="gs-char-counter">

                  {
                    formData
                      .metaDescription
                      .length
                  }
                  /300

                </span>

              </div>

            </div>

            {/* ===========================================
                META KEYWORDS
            =========================================== */}

            <div className="gs-form-group">

              <label>
                Meta Keywords
              </label>

              <input
                type="text"
                name="metaKeywords"
                placeholder="organic, fresh, vegetables"
                value={
                  formData.metaKeywords
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div className="gs-column">

          {/* =================================================
              PRICING & STOCK
          ================================================= */}

          <div className="gs-card">

            <div className="gs-card-header">

              <div className="gs-card-icon-wrap">

                <Tag
                  size={18}
                />

              </div>

              <h2>
                Pricing & Stock
              </h2>

            </div>

            {/* ===========================================
                PRICE
            =========================================== */}

            <div className="gs-form-row col-2">

              <div className="gs-form-group">

                <label>
                  Price (₹){" "}
                  <span className="gs-required">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  placeholder="0.00"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="gs-form-group">

                <label>
                  Discount Price (₹)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="discountPrice"
                  placeholder="0.00"
                  value={
                    formData.discountPrice
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* ===========================================
                COST / STOCK
            =========================================== */}

            <div className="gs-form-row col-2">

              <div className="gs-form-group">

                <label>
                  Cost Price (₹)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="costPrice"
                  placeholder="0.00"
                  value={
                    formData.costPrice
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="gs-form-group">

                <label>
                  Stock Quantity{" "}
                  <span className="gs-required">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  name="stockQuantity"
                  placeholder="0"
                  value={
                    formData.stockQuantity
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

            </div>

            {/* ===========================================
                LOW STOCK / TAX
            =========================================== */}

            <div className="gs-form-row col-2">

              <div className="gs-form-group">

                <label>
                  Low Stock Alert
                </label>

                <input
                  type="number"
                  min="0"
                  name="lowStockAlert"
                  placeholder="Minimum stock level"
                  value={
                    formData.lowStockAlert
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="gs-form-group">

                <label>
                  Tax (%)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="tax"
                  placeholder="0"
                  value={
                    formData.tax
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

            {/* ===========================================
                OUT OF STOCK
            =========================================== */}

            <div className="gs-checkbox-group">

              <label className="gs-checkbox-label">

                <input
                  type="checkbox"
                  name="isOutOfStock"
                  checked={
                    formData.isOutOfStock
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  This product is out of stock
                </span>

              </label>

            </div>

          </div>

          {/* =================================================
              PRODUCT IMAGES
          ================================================= */}

          <div className="gs-card">

            <div className="gs-card-header">

              <div className="gs-card-icon-wrap">

                <ImageIcon
                  size={18}
                />

              </div>

              <h2>
                Product Images
              </h2>

            </div>

            <div className="gs-upload-zone-container">

              <label
                htmlFor="gs-file-input"
                className="gs-dropzone"
              >

                <div className="gs-upload-circle-icon">

                  <UploadCloud
                    size={24}
                  />

                </div>

                <h3 className="gs-upload-title">
                  Upload Product Images
                </h3>

                <p className="gs-upload-desc">

                  Drag & drop images here or click to browse
                  <br />

                  JPG, PNG or WEBP (Max 5MB each)

                </p>

              </label>

              <input
                id="gs-file-input"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                onChange={
                  handleImageUpload
                }
                style={{
                  display: "none",
                }}
              />

            </div>

            {/* ===========================================
                EXISTING + NEW IMAGE PREVIEWS
            =========================================== */}

            {(
              existingImages.length >
                0 ||
              productImages.length >
                0
            ) && (

              <div className="gs-image-preview-grid">

                {/* ========================================
                    EXISTING IMAGES
                ======================================== */}

                {existingImages.map(
                  (
                    imgPath,
                    idx
                  ) => (

                    <div
                      key={`existing-${idx}`}
                      className="gs-preview-item"
                    >

                      <img
                        src={getImageUrl(
                          imgPath
                        )}
                        alt={`Existing ${idx}`}
                      />

                      <button
                        type="button"
                        className="gs-remove-img-btn"
                        onClick={() =>
                          handleRemoveExistingImage(
                            idx
                          )
                        }
                      >

                        <X
                          size={14}
                        />

                      </button>

                    </div>

                  )
                )}

                {/* ========================================
                    NEW IMAGES
                ======================================== */}

                {productImages.map(
                  (
                    imgObj,
                    idx
                  ) => (

                    <div
                      key={`new-${idx}`}
                      className="gs-preview-item"
                    >

                      <img
                        src={
                          imgObj.url
                        }
                        alt={`New upload ${idx}`}
                      />

                      <button
                        type="button"
                        className="gs-remove-img-btn"
                        onClick={() =>
                          handleRemoveNewImage(
                            idx
                          )
                        }
                      >

                        <X
                          size={14}
                        />

                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* =================================================
              PRODUCT STATUS
          ================================================= */}

          <div className="gs-card">

            <div className="gs-card-header">

              <div className="gs-card-icon-wrap">

                <Tag
                  size={18}
                />

              </div>

              <h2>
                Product Status
              </h2>

            </div>

            <div className="gs-status-options-grid">

              {/* =========================================
                  ACTIVE
              ========================================= */}

              <label
                className={`gs-status-card ${
                  formData.status ===
                  "active"
                    ? "selected-active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={
                    formData.status ===
                    "active"
                  }
                  onChange={
                    handleChange
                  }
                />

                <div className="gs-status-radio-icon">

                  <CheckCircle
                    size={20}
                  />

                </div>

                <div className="gs-status-info">

                  <div className="gs-status-title">
                    Active
                  </div>

                  <div className="gs-status-sub">
                    Product is visible in shop
                  </div>

                </div>

              </label>

              {/* =========================================
                  INACTIVE
              ========================================= */}

              <label
                className={`gs-status-card ${
                  formData.status ===
                  "inactive"
                    ? "selected-inactive"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={
                    formData.status ===
                    "inactive"
                  }
                  onChange={
                    handleChange
                  }
                />

                <div className="gs-status-radio-icon">

                  <XCircle
                    size={20}
                  />

                </div>

                <div className="gs-status-info">

                  <div className="gs-status-title">
                    Inactive
                  </div>

                  <div className="gs-status-sub">
                    Product is hidden from shop
                  </div>

                </div>

              </label>

            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <div className="gs-footer-actions-row">

          <button
            type="button"
            className="gs-btn-reset"
            onClick={
              handleReset
            }
            disabled={
              isSubmitting
            }
          >

            <RotateCcw
              size={16}
            />

            Reset

          </button>

          <button
            type="submit"
            className="gs-btn-save"
            disabled={
              isSubmitting
            }
          >

            {isSubmitting ? (
              <>
                <Loader
                  size={16}
                  className="spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save
                  size={16}
                />

                {editingProduct
                  ? "Update Product"
                  : "Save Product"}
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
};

export default AddProducts;
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import "./Brands.css";

import {
  Search,
  Filter,
  RotateCcw,
  Edit3,
  Trash2,
  UploadCloud,
  ChevronDown,
  Save,
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { Editor } from "@tinymce/tinymce-react";

import API, { BASE_URL } from "../../api/axios";


// ==========================================================
// CONSTANTS
// ==========================================================

const ITEMS_PER_PAGE = 8;


// ==========================================================
// COMPONENT
// ==========================================================

const Brands = () => {

  // ========================================================
  // FORM STATES
  // ========================================================

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    tagline: "",
    slug: "",
    category: "",
    description: "",
    order: 0,
    status: true,
    logoUrl: null,
    logoFile: null,
  });


  // ========================================================
  // REFS
  // ========================================================

  const fileInputRef = useRef(null);

  const editorRef = useRef(null);


  // ========================================================
  // LIST STATES
  // ========================================================

  const [brandsList, setBrandsList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showFilterDropdown, setShowFilterDropdown] =
    useState(false);

  const [activeDropdownId, setActiveDropdownId] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);


  // ========================================================
  // FETCH BRANDS
  // ========================================================

  const fetchBrands = useCallback(async () => {

    try {

      setLoading(true);


      const params = {};


      // ----------------------------------------------------
      // SEARCH
      // ----------------------------------------------------

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }


      // ----------------------------------------------------
      // STATUS FILTER
      // ----------------------------------------------------

      if (statusFilter !== "All") {
        params.status = statusFilter;
      }


      // ----------------------------------------------------
      // API
      // ----------------------------------------------------

      const res = await API.get(
        "/brands",
        {
          params,
        }
      );


      /*
        Backend response:

        {
          success: true,
          data: [...]
        }

        So we read res.data.data.
      */

      const brands =
        res.data?.data || [];


      setBrandsList(brands);


      /*
        If current page becomes invalid
        after search/delete, reset to page 1.
      */

      setCurrentPage((previousPage) => {

        const calculatedPages =
          Math.ceil(
            brands.length /
              ITEMS_PER_PAGE
          ) || 1;


        if (
          previousPage >
          calculatedPages
        ) {
          return 1;
        }


        return previousPage;
      });

    } catch (error) {

      console.error(
        "Error loading brands:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Could not connect to server or load brands."
      );

    } finally {

      setLoading(false);
    }

  }, [
    searchQuery,
    statusFilter,
  ]);


  // ========================================================
  // FETCH ON SEARCH / FILTER
  // ========================================================

  useEffect(() => {

    fetchBrands();

  }, [fetchBrands]);


  // ========================================================
  // CLOSE DROPDOWNS
  // ========================================================

  useEffect(() => {

    const handleClickOutside = (e) => {

      // ----------------------------------------------------
      // ACTION DROPDOWN
      // ----------------------------------------------------

      if (
        !e.target.closest(
          ".brand-dropdown-container"
        )
      ) {

        setActiveDropdownId(null);
      }


      // ----------------------------------------------------
      // FILTER DROPDOWN
      // ----------------------------------------------------

      if (
        !e.target.closest(
          ".brand-filter-container"
        )
      ) {

        setShowFilterDropdown(false);
      }
    };


    document.addEventListener(
      "click",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "click",
        handleClickOutside
      );

    };

  }, []);


  // ========================================================
  // LOGO FILE UPLOAD
  // ========================================================

  const handleLogoUpload = (e) => {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    // ------------------------------------------------------
    // CLIENT SIDE SIZE CHECK
    // ------------------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "File size exceeds 5MB limit!"
      );


      e.target.value = "";

      return;
    }


    // ------------------------------------------------------
    // FILE TYPE CHECK
    // ------------------------------------------------------

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/avif",
      "image/svg+xml",
    ];


    /*
      Your current backend middleware does NOT allow SVG.
      Therefore don't allow it from the frontend either.
    */

    if (
      !allowedTypes.includes(
        file.type
      ) ||
      file.type === "image/svg+xml"
    ) {

      alert(
        "Please select JPG, PNG, WEBP or AVIF image."
      );


      e.target.value = "";

      return;
    }


    // ------------------------------------------------------
    // PREVIEW
    // ------------------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);


    setFormData((prev) => ({

      ...prev,

      logoFile: file,

      logoUrl: previewUrl,

    }));

  };


  // ========================================================
  // AUTO GENERATE SLUG
  // ========================================================

  const handleNameChange = (e) => {

    const val =
      e.target.value;


    const generatedSlug =
      val
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-");


    setFormData((prev) => ({

      ...prev,

      name: val,

      slug: generatedSlug,

    }));

  };


  // ========================================================
  // INPUT CHANGE
  // ========================================================

  const handleInputChange = (e) => {

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

  };


  // ========================================================
  // TINYMCE CHANGE
  // ========================================================

  const handleEditorChange = (
    content
  ) => {

    setFormData((prev) => ({

      ...prev,

      description: content,

    }));

  };


  // ========================================================
  // RESET FORM
  // ========================================================

  const handleReset = () => {

    setFormData({

      _id: null,

      name: "",

      tagline: "",

      slug: "",

      category: "",

      description: "",

      order: 0,

      status: true,

      logoUrl: null,

      logoFile: null,

    });


    // ------------------------------------------------------
    // RESET TINYMCE
    // ------------------------------------------------------

    if (editorRef.current) {

      editorRef.current.setContent("");

    }


    // ------------------------------------------------------
    // RESET FILE INPUT
    // ------------------------------------------------------

    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  };


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = async () => {

    setSearchQuery("");

    setStatusFilter("All");

    setCurrentPage(1);

    setActiveDropdownId(null);

    setShowFilterDropdown(false);


    /*
      Fetch current data from backend.
    */

    try {

      setLoading(true);


      const res =
        await API.get(
          "/brands"
        );


      setBrandsList(
        res.data?.data || []
      );

    } catch (error) {

      console.error(
        "Refresh Brands Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to refresh brands"
      );

    } finally {

      setLoading(false);
    }

  };


  // ========================================================
  // SAVE / UPDATE BRAND
  // ========================================================

  const handleSaveBrand = async (
    e
  ) => {

    e.preventDefault();


    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (!formData.name.trim()) {

      alert(
        "Please enter a Brand Name"
      );

      return;
    }


    if (!formData.slug.trim()) {

      alert(
        "Please enter a valid Slug"
      );

      return;
    }


    try {

      setSubmitting(true);


      // ====================================================
      // FORMDATA
      // ====================================================

      const bodyData =
        new FormData();


      bodyData.append(
        "name",
        formData.name.trim()
      );


      bodyData.append(
        "tagline",
        formData.tagline || ""
      );


      bodyData.append(
        "slug",
        formData.slug.trim()
      );


      bodyData.append(
        "category",
        formData.category ||
          "General"
      );


      bodyData.append(
        "description",
        formData.description || ""
      );


      bodyData.append(
        "order",
        Number(formData.order) || 0
      );


      bodyData.append(
        "status",
        formData.status
      );


      // ----------------------------------------------------
      // LOGO
      // ----------------------------------------------------

      if (formData.logoFile) {

        bodyData.append(
          "logo",
          formData.logoFile
        );

      }


      // ====================================================
      // CREATE / UPDATE
      // ====================================================

      let response;


      if (formData._id) {

        // --------------------------------------------------
        // UPDATE
        // --------------------------------------------------

        response =
          await API.put(
            `/brands/${formData._id}`,
            bodyData
          );

      } else {

        // --------------------------------------------------
        // CREATE
        // --------------------------------------------------

        response =
          await API.post(
            "/brands",
            bodyData
          );

      }


      // ====================================================
      // SUCCESS
      // ====================================================

      console.log(
        "Brand saved:",
        response.data
      );


      alert(
        formData._id
          ? "Brand updated successfully!"
          : "Brand added successfully!"
      );


      // ----------------------------------------------------
      // RESET FORM
      // ----------------------------------------------------

      handleReset();


      // ----------------------------------------------------
      // RESET PAGE
      // ----------------------------------------------------

      setCurrentPage(1);


      // ----------------------------------------------------
      // REFRESH FROM DATABASE
      // ----------------------------------------------------

      await fetchBrands();

    } catch (error) {

      console.error(
        "Error saving brand:",
        error
      );


      alert(
        error.response?.data?.message ||
        error.message ||
        "Error saving brand."
      );

    } finally {

      setSubmitting(false);
    }

  };


  // ========================================================
  // STATUS CHANGE
  // ========================================================

  const handleStatusChange = async (
    id,
    newStatus
  ) => {

    setActiveDropdownId(null);


    try {

      const response =
        await API.patch(
          `/brands/${id}/status`,
          {
            status: newStatus,
          }
        );


      console.log(
        "Status updated:",
        response.data
      );


      /*
        Update UI immediately.
      */

      setBrandsList(
        (previousBrands) =>
          previousBrands.map(
            (brand) =>
              brand._id === id
                ? {
                    ...brand,
                    status: newStatus,
                  }
                : brand
          )
      );

    } catch (error) {

      console.error(
        "Error updating status:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Could not update status"
      );

    }

  };


  // ========================================================
  // EDIT BRAND
  // ========================================================

  const handleEdit = (
    brand
  ) => {

    // ------------------------------------------------------
    // LOGO URL
    // ------------------------------------------------------

    let fullLogoUrl =
      null;


    if (brand.logoUrl) {

      if (
        brand.logoUrl.startsWith(
          "http"
        )
      ) {

        fullLogoUrl =
          brand.logoUrl;

      } else {

        fullLogoUrl =
          `${BASE_URL}/${brand.logoUrl.replace(
            /^\/+/,
            ""
          )}`;

      }

    }


    // ------------------------------------------------------
    // FORM DATA
    // ------------------------------------------------------

    setFormData({

      _id:
        brand._id,

      name:
        brand.name || "",

      tagline:
        brand.tagline || "",

      slug:
        brand.slug ||
        brand.name
          ?.toLowerCase()
          .trim()
          .replace(
            /[\s\W-]+/g,
            "-"
          ),

      category:
        brand.category || "",

      description:
        brand.description || "",

      order:
        brand.order || 0,

      status:
        brand.status === "Active",

      logoUrl:
        fullLogoUrl,

      logoFile:
        null,

    });


    // ------------------------------------------------------
    // TINYMCE
    // ------------------------------------------------------

    if (editorRef.current) {

      editorRef.current.setContent(
        brand.description || ""
      );

    }


    // ------------------------------------------------------
    // CLOSE DROPDOWN
    // ------------------------------------------------------

    setActiveDropdownId(null);


    // ------------------------------------------------------
    // SCROLL TOP
    // ------------------------------------------------------

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ========================================================
  // DELETE BRAND
  // ========================================================

  const handleDelete = async (
    id
  ) => {

    setActiveDropdownId(null);


    // ------------------------------------------------------
    // CONFIRM
    // ------------------------------------------------------

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this brand?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setLoading(true);


      // ----------------------------------------------------
      // DELETE
      // ----------------------------------------------------

      await API.delete(
        `/brands/${id}`
      );


      alert(
        "Brand deleted successfully"
      );


      // ----------------------------------------------------
      // REFRESH DATABASE DATA
      // ----------------------------------------------------

      await fetchBrands();

    } catch (error) {

      console.error(
        "Error deleting brand:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to delete brand"
      );

    } finally {

      setLoading(false);
    }

  };


  // ========================================================
  // PAGINATION
  // ========================================================

  const totalEntries =
    brandsList.length;


  const totalPages =
    Math.ceil(
      totalEntries /
        ITEMS_PER_PAGE
    ) || 1;


  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;


  const currentBrands =
    brandsList.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );


  // ========================================================
  // UI
  // ========================================================

  return (

    <div className="brand-page-container">

      <div className="brand-grid">


        {/* ==================================================
            LEFT SECTION
        ================================================== */}

        <div className="brand-card brand-form-section">

          <div className="brand-header">

            <h2>
              {formData._id
                ? "Edit Brand"
                : "Add / Edit Brand"}
            </h2>

            <p>
              Fill in the details to create or
              update a brand.
            </p>

          </div>


          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSaveBrand}
            className="brand-form"
          >


            {/* ==================================================
                LOGO UPLOAD
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Brand Logo{" "}

                <span className="brand-required">
                  *
                </span>
              </label>


              <div className="brand-upload-box">

                <input
                  type="file"

                  ref={fileInputRef}

                  onChange={
                    handleLogoUpload
                  }

                  accept="
                    image/png,
                    image/jpeg,
                    image/jpg,
                    image/webp,
                    image/avif
                  "

                  style={{
                    display: "none",
                  }}
                />


                <div
                  className="brand-upload-circle"

                  onClick={() =>
                    fileInputRef.current &&
                    fileInputRef.current.click()
                  }

                  title="Click to upload logo"
                >

                  {formData.logoUrl ? (

                    <img
                      src={formData.logoUrl}
                      alt="Logo Preview"
                      className="brand-preview-img"
                    />

                  ) : (

                    <UploadCloud
                      className="brand-upload-icon"
                      size={24}
                    />

                  )}

                </div>


                <div className="brand-upload-info">

                  <p className="brand-upload-title">
                    Upload Logo
                  </p>

                  <span>
                    JPG, PNG, WEBP or AVIF
                  </span>

                  <span className="brand-convert-badge">
                    Auto-converts to .WEBP
                  </span>


                  {formData.logoUrl && (

                    <button
                      type="button"

                      className="brand-remove-btn"

                      onClick={() => {

                        setFormData(
                          (prev) => ({
                            ...prev,

                            logoUrl: null,

                            logoFile: null,
                          })
                        );


                        if (
                          fileInputRef.current
                        ) {

                          fileInputRef.current.value =
                            "";

                        }

                      }}
                    >
                      Remove Logo
                    </button>

                  )}

                </div>

              </div>

            </div>


            {/* ==================================================
                BRAND NAME
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Brand Name{" "}

                <span className="brand-required">
                  *
                </span>
              </label>


              <input
                type="text"

                name="name"

                placeholder="Enter brand name"

                value={
                  formData.name
                }

                onChange={
                  handleNameChange
                }

                required
              />

            </div>


            {/* ==================================================
                TAGLINE
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Tagline
              </label>


              <input
                type="text"

                name="tagline"

                placeholder="Enter brand tagline"

                value={
                  formData.tagline
                }

                onChange={
                  handleInputChange
                }
              />

            </div>


            {/* ==================================================
                SLUG
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Slug (URL Friendly){" "}

                <span className="brand-required">
                  *
                </span>
              </label>


              <input
                type="text"

                name="slug"

                placeholder="enter-brand-slug"

                value={
                  formData.slug
                }

                onChange={
                  handleInputChange
                }

                required
              />


              <span className="brand-help-text">
                This will be used in the URL.
                Example: nestle
              </span>

            </div>


            {/* ==================================================
                CATEGORY
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Category (Optional)
              </label>


              <div className="brand-select-wrapper">

                <select
                  name="category"

                  value={
                    formData.category
                  }

                  onChange={
                    handleInputChange
                  }
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Food & Beverages">
                    Food & Beverages
                  </option>

                  <option value="Dairy & Dairy Products">
                    Dairy & Dairy Products
                  </option>

                  <option value="Grocery Essentials">
                    Grocery Essentials
                  </option>

                  <option value="Cooking Oils">
                    Cooking Oils
                  </option>

                  <option value="Health & Nutrition">
                    Health & Nutrition
                  </option>

                  <option value="Personal Care">
                    Personal Care
                  </option>

                  <option value="Health & Wellness">
                    Health & Wellness
                  </option>

                  <option value="Snacks & Sweets">
                    Snacks & Sweets
                  </option>

                </select>


                <ChevronDown
                  className="brand-select-arrow"
                  size={16}
                />

              </div>

            </div>


            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Description
              </label>


              <div className="brand-editor-wrapper">

                <Editor
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"

                  onInit={(
                    evt,
                    editor
                  ) => {
                    editorRef.current =
                      editor;
                  }}

                  value={
                    formData.description
                  }

                  onEditorChange={
                    handleEditorChange
                  }

                  init={{
                    height: 200,

                    menubar: false,

                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "charmap",
                      "preview",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "table",
                      "help",
                      "wordcount",
                    ],

                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "removeformat | help",

                    content_style:
                      "body { font-family:Inter,sans-serif; font-size:14px }",

                    statusbar: false,

                    branding: false,
                  }}
                />

              </div>

            </div>


            {/* ==================================================
                DISPLAY ORDER
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Display Order
              </label>


              <input
                type="number"

                name="order"

                value={
                  formData.order
                }

                onChange={
                  handleInputChange
                }
              />


              <span className="brand-help-text">
                Lower number shows first
              </span>

            </div>


            {/* ==================================================
                STATUS
            ================================================== */}

            <div className="brand-form-group">

              <label>
                Status
              </label>


              <div className="brand-toggle-wrapper">

                <label className="brand-switch">

                  <input
                    type="checkbox"

                    name="status"

                    checked={
                      formData.status
                    }

                    onChange={
                      handleInputChange
                    }
                  />


                  <span className="brand-slider round"></span>

                </label>


                <span className="brand-status-label">

                  {formData.status
                    ? "Active"
                    : "Inactive"}

                </span>

              </div>

            </div>


            {/* ==================================================
                FORM ACTIONS
            ================================================== */}

            <div className="brand-form-actions">

              <button
                type="button"

                className="brand-btn brand-btn-outline"

                onClick={
                  handleReset
                }

                disabled={
                  submitting
                }
              >

                <RotateCcw
                  size={16}
                />

                Reset

              </button>


              <button
                type="submit"

                className="brand-btn brand-btn-primary"

                disabled={
                  submitting
                }
              >

                {submitting ? (

                  <Loader2
                    size={16}
                    className="brand-spinner"
                  />

                ) : (

                  <Save size={16} />

                )}


                {formData._id
                  ? "Update Brand"
                  : "Save Brand"}

              </button>

            </div>

          </form>

        </div>


        {/* ==================================================
            RIGHT SECTION
        ================================================== */}

        <div className="brand-card brand-list-section">

          <div>


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="brand-list-header">

              <div>

                <h2>
                  All Brands
                </h2>

                <p>
                  Manage and organize all your brands
                </p>

              </div>


              <div className="brand-controls">


                {/* ==================================================
                    SEARCH
                ================================================== */}

                <div className="brand-search-box">

                  <Search
                    size={16}
                    className="brand-search-icon"
                  />


                  <input
                    type="text"

                    placeholder="Search brands..."

                    value={
                      searchQuery
                    }

                    onChange={(e) => {

                      setSearchQuery(
                        e.target.value
                      );

                      setCurrentPage(
                        1
                      );

                    }}
                  />

                </div>


                {/* ==================================================
                    FILTER
                ================================================== */}

                <div className="brand-filter-container">

                  <button
                    type="button"

                    className={`brand-btn-icon ${
                      statusFilter !== "All"
                        ? "active-filter"
                        : ""
                    }`}

                    onClick={() =>
                      setShowFilterDropdown(
                        (prev) =>
                          !prev
                      )
                    }
                  >

                    <Filter
                      size={16}
                    />

                    Filter

                  </button>


                  {showFilterDropdown && (

                    <div className="brand-filter-dropdown">

                      <p className="brand-filter-title">
                        Filter Status
                      </p>


                      <button
                        type="button"

                        className={
                          statusFilter ===
                          "All"
                            ? "selected"
                            : ""
                        }

                        onClick={() => {

                          setStatusFilter(
                            "All"
                          );

                          setCurrentPage(
                            1
                          );

                          setShowFilterDropdown(
                            false
                          );

                        }}
                      >
                        All Brands
                      </button>


                      <button
                        type="button"

                        className={
                          statusFilter ===
                          "Active"
                            ? "selected"
                            : ""
                        }

                        onClick={() => {

                          setStatusFilter(
                            "Active"
                          );

                          setCurrentPage(
                            1
                          );

                          setShowFilterDropdown(
                            false
                          );

                        }}
                      >
                        Active
                      </button>


                      <button
                        type="button"

                        className={
                          statusFilter ===
                          "Inactive"
                            ? "selected"
                            : ""
                        }

                        onClick={() => {

                          setStatusFilter(
                            "Inactive"
                          );

                          setCurrentPage(
                            1
                          );

                          setShowFilterDropdown(
                            false
                          );

                        }}
                      >
                        Inactive
                      </button>

                    </div>

                  )}

                </div>


                {/* ==================================================
                    REFRESH
                ================================================== */}

                <button
                  type="button"

                  className="brand-btn-icon"

                  onClick={
                    handleRefresh
                  }

                  title="Refresh Table"

                  disabled={
                    loading
                  }
                >

                  <RotateCcw
                    size={16}
                  />

                </button>

              </div>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="brand-table-wrapper">

              <table className="brand-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Logo
                    </th>

                    <th>
                      Brand Name
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Order
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="brand-no-data"
                      >

                        <div className="brand-loading-flex">

                          <Loader2
                            className="brand-spinner"
                            size={20}
                          />

                          Loading brands...

                        </div>

                      </td>

                    </tr>

                  ) : currentBrands.length > 0 ? (

                    currentBrands.map(
                      (
                        item,
                        index
                      ) => {

                        // ==================================================
                        // LOGO URL
                        // ==================================================

                        let logoSrc =
                          null;


                        if (
                          item.logoUrl
                        ) {

                          if (
                            item.logoUrl.startsWith(
                              "http"
                            )
                          ) {

                            logoSrc =
                              item.logoUrl;

                          } else {

                            logoSrc =
                              `${BASE_URL}/${item.logoUrl.replace(
                                /^\/+/,
                                ""
                              )}`;

                          }

                        }


                        return (

                          <tr
                            key={
                              item._id
                            }
                          >

                            {/* ==================================================
                                NUMBER
                            ================================================== */}

                            <td>
                              {startIndex +
                                index +
                                1}
                            </td>


                            {/* ==================================================
                                LOGO
                            ================================================== */}

                            <td>

                              <div className="brand-logo-circle">

                                {logoSrc ? (

                                  <img
                                    src={
                                      logoSrc
                                    }

                                    alt={
                                      item.name
                                    }

                                    className="brand-table-logo"

                                    onError={(
                                      e
                                    ) => {

                                      e.currentTarget.style.display =
                                        "none";

                                    }}
                                  />

                                ) : (

                                  <span className="brand-logo-text">

                                    {item.name
                                      ?.charAt(
                                        0
                                      )
                                      ?.toUpperCase()}

                                  </span>

                                )}

                              </div>

                            </td>


                            {/* ==================================================
                                BRAND NAME
                            ================================================== */}

                            <td>

                              <div className="brand-name-group">

                                <span className="brand-title-text">

                                  {item.name}

                                </span>


                                {item.tagline && (

                                  <span className="brand-sub-text">

                                    {
                                      item.tagline
                                    }

                                  </span>

                                )}

                              </div>

                            </td>


                            {/* ==================================================
                                CATEGORY
                            ================================================== */}

                            <td>

                              <span className="brand-cat-tag">

                                {
                                  item.category ||
                                  "General"
                                }

                              </span>

                            </td>


                            {/* ==================================================
                                ORDER
                            ================================================== */}

                            <td>
                              {
                                item.order
                              }
                            </td>


                            {/* ==================================================
                                STATUS
                            ================================================== */}

                            <td>

                              <span
                                className={`brand-badge ${
                                  item.status
                                    ? item.status.toLowerCase()
                                    : ""
                                }`}
                              >

                                {
                                  item.status
                                }

                              </span>

                            </td>


                            {/* ==================================================
                                ACTION
                            ================================================== */}

                            <td>

                              <div className="brand-action-wrapper">


                                {/* ==================================================
                                    EDIT
                                ================================================== */}

                                <button
                                  type="button"

                                  className="brand-action-btn brand-edit-btn"

                                  onClick={() =>
                                    handleEdit(
                                      item
                                    )
                                  }

                                  title="Edit"
                                >

                                  <Edit3
                                    size={14}
                                  />

                                </button>


                                {/* ==================================================
                                    DELETE
                                ================================================== */}

                                <button
                                  type="button"

                                  className="brand-action-btn brand-delete-btn"

                                  onClick={() =>
                                    handleDelete(
                                      item._id
                                    )
                                  }

                                  title="Delete"
                                >

                                  <Trash2
                                    size={14}
                                  />

                                </button>


                                {/* ==================================================
                                    MORE DROPDOWN
                                ================================================== */}

                                <div className="brand-dropdown-container">

                                  <button
                                    type="button"

                                    className="brand-action-btn brand-more-btn"

                                    onClick={() =>
                                      setActiveDropdownId(
                                        activeDropdownId ===
                                          item._id
                                          ? null
                                          : item._id
                                      )
                                    }

                                    title="More Options"
                                  >

                                    <MoreVertical
                                      size={14}
                                    />

                                  </button>


                                  {activeDropdownId ===
                                    item._id && (

                                    <div className="brand-action-dropdown">


                                      {/* ACTIVE */}

                                      <button
                                        type="button"

                                        onClick={() =>
                                          handleStatusChange(
                                            item._id,
                                            "Active"
                                          )
                                        }
                                      >

                                        <CheckCircle
                                          size={14}
                                          className="icon-green"
                                        />

                                        Set Active

                                      </button>


                                      {/* INACTIVE */}

                                      <button
                                        type="button"

                                        onClick={() =>
                                          handleStatusChange(
                                            item._id,
                                            "Inactive"
                                          )
                                        }
                                      >

                                        <XCircle
                                          size={14}
                                          className="icon-red"
                                        />

                                        Set Inactive

                                      </button>

                                    </div>

                                  )}

                                </div>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="brand-no-data"
                      >
                        No brands found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>


          {/* ==================================================
              PAGINATION
          ================================================== */}

          <div className="brand-pagination-wrapper">

            <span className="brand-entries-info">

              Showing{" "}

              {totalEntries > 0
                ? startIndex + 1
                : 0}

              {" "}to{" "}

              {Math.min(
                startIndex +
                  ITEMS_PER_PAGE,
                totalEntries
              )}

              {" "}of{" "}

              {totalEntries}

              {" "}entries

            </span>


            <div className="brand-pagination">


              {/* ==================================================
                  PREVIOUS
              ================================================== */}

              <button
                type="button"

                className="brand-page-btn"

                disabled={
                  currentPage === 1 ||
                  loading
                }

                onClick={() =>
                  setCurrentPage(
                    (p) =>
                      Math.max(
                        p - 1,
                        1
                      )
                  )
                }
              >
                Previous
              </button>


              {/* ==================================================
                  PAGE NUMBERS
              ================================================== */}

              {Array.from(
                {
                  length:
                    totalPages,
                },

                (_, i) =>
                  i + 1

              ).map((page) => (

                <button
                  type="button"

                  key={page}

                  className={`brand-page-btn ${
                    currentPage ===
                    page
                      ? "active"
                      : ""
                  }`}

                  onClick={() =>
                    setCurrentPage(
                      page
                    )
                  }

                  disabled={
                    loading
                  }
                >

                  {page}

                </button>

              ))}


              {/* ==================================================
                  NEXT
              ================================================== */}

              <button
                type="button"

                className="brand-page-btn"

                disabled={
                  currentPage ===
                    totalPages ||
                  totalPages === 0 ||
                  loading
                }

                onClick={() =>
                  setCurrentPage(
                    (p) =>
                      Math.min(
                        p + 1,
                        totalPages
                      )
                  )
                }
              >

                Next

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


export default Brands;
import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import "./Categories.css";

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
} from "lucide-react";

import { Editor } from "@tinymce/tinymce-react";

import API, { BASE_URL } from "../../api/axios";


// ======================================================
// ITEMS PER PAGE
// ======================================================

const ITEMS_PER_PAGE = 8;


// ======================================================
// PARENT CATEGORY DATA
// KEEPING YOUR ORIGINAL DATA EXACTLY
// ======================================================

const PARENT_CATEGORY_DATA = [
  {
    name: "Food Grains",
    icon: "🌾",
  },
  {
    name: "Cooking Oils",
    icon: "🍾",
  },
  {
    name: "Spices & Masala",
    icon: "🍲",
  },
  {
    name: "Dairy & Eggs",
    icon: "🧃",
  },
  {
    name: "Snacks & Beverages",
    icon: "🍿",
  },
  {
    name: "Household Essentials",
    icon: "🧴",
  },
  {
    name: "Organic & Healthy",
    icon: "🍃",
  },
  {
    name: "Baby Care",
    icon: "🍼",
  },
  {
    name: "Bakery & Biscuits",
    icon: "🍞",
  },
  {
    name: "Beauty & Hygiene",
    icon: "🧼",
  },
  {
    name: "Cleaning & Household",
    icon: "🧹",
  },
  {
    name: "Pet Care",
    icon: "🐶",
  },
  {
    name: "Frozen Foods",
    icon: "🧊",
  },
  {
    name: "Beverages & Drinks",
    icon: "🥤",
  },
  {
    name: "Instant & Ready Food",
    icon: "🍜",
  },
  {
    name: "Sauces & Spreads",
    icon: "🥫",
  },
  {
    name: "Sweets & Chocolates",
    icon: "🍫",
  },
  {
    name: "Tea & Coffee",
    icon: "☕",
  },
  {
    name: "Meat & Seafood",
    icon: "🥩",
  },
  {
    name: "Gourmet & World Food",
    icon: "🧀",
  },
];


// ======================================================
// INITIAL FORM
// ======================================================

const initialFormData = {
  id: null,
  name: "",
  slug: "",
  parent: "",
  description: "",
  order: 0,
  status: true,
  icon: "📦",
  iconUrl: null,
};


// ======================================================
// COMPONENT
// ======================================================

const Categories = () => {

  // ====================================================
  // FORM STATE
  // ====================================================

  const [formData, setFormData] =
    useState(initialFormData);


  // ====================================================
  // FILE
  // ====================================================

  const [selectedFile, setSelectedFile] =
    useState(null);


  // ====================================================
  // LOADING
  // ====================================================

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  // ====================================================
  // REFS
  // ====================================================

  const fileInputRef =
    useRef(null);

  const editorRef =
    useRef(null);


  // ====================================================
  // TABLE
  // ====================================================

  const [categoriesList, setCategoriesList] =
    useState([]);


  // ====================================================
  // SEARCH
  // ====================================================

  const [searchQuery, setSearchQuery] =
    useState("");


  // ====================================================
  // STATUS FILTER
  // ====================================================

  const [statusFilter, setStatusFilter] =
    useState("All");


  // ====================================================
  // DROPDOWNS
  // ====================================================

  const [showFilterDropdown, setShowFilterDropdown] =
    useState(false);

  const [activeDropdownId, setActiveDropdownId] =
    useState(null);


  // ====================================================
  // PAGINATION
  // ====================================================

  const [currentPage, setCurrentPage] =
    useState(1);


  // ====================================================
  // LOAD DATA
  // ====================================================

  useEffect(() => {

    fetchCategories();

  }, []);


  // ====================================================
  // FETCH CATEGORIES
  // ====================================================

  const fetchCategories = async () => {

    try {

      setLoading(true);


      const params = {};


      if (
        searchQuery.trim()
      ) {

        params.search =
          searchQuery.trim();

      }


      if (
        statusFilter !==
        "All"
      ) {

        params.status =
          statusFilter;

      }


      const response =
        await API.get(
          "/categories",
          {
            params,
          }
        );


      const data =
        response.data?.data ||
        response.data ||
        [];


      setCategoriesList(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Fetch categories error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to fetch categories"
      );

    } finally {

      setLoading(false);

    }

  };


  // ====================================================
  // SEARCH / FILTER
  // ====================================================

  useEffect(() => {

    const timer =
      setTimeout(() => {

        fetchCategories();

      }, 400);


    return () => {

      clearTimeout(timer);

    };

  }, [
    searchQuery,
    statusFilter,
  ]);


  // ====================================================
  // CLOSE DROPDOWNS
  // ====================================================

  useEffect(() => {

    const handleClickOutside = (
      e
    ) => {

      if (
        !e.target.closest(
          ".cat-page-dropdown-container"
        )
      ) {

        setActiveDropdownId(
          null
        );

      }


      if (
        !e.target.closest(
          ".cat-page-filter-container"
        )
      ) {

        setShowFilterDropdown(
          false
        );

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


  // ====================================================
  // IMAGE URL
  // ====================================================

  const getImageUrl = (
    image
  ) => {

    if (!image) {

      return null;

    }


    if (
      image.startsWith("blob:")
    ) {

      return image;

    }


    if (
      /^https?:\/\//i.test(
        image
      )
    ) {

      return image;

    }


    return `${BASE_URL}/${image.replace(
      /^\/+/,
      ""
    )}`;

  };


  // ====================================================
  // IMAGE UPLOAD
  // ====================================================

  const handleIconUpload = (
    e
  ) => {

    const file =
      e.target.files?.[0];


    if (!file) {

      return;

    }


    // 1 MB
    if (
      file.size >
      1024 * 1024
    ) {

      alert(
        "File size exceeds 1MB limit!"
      );


      e.target.value =
        "";

      return;

    }


    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        "Please upload JPG, PNG, WEBP or AVIF image."
      );


      e.target.value =
        "";

      return;

    }


    if (
      formData.iconUrl?.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        formData.iconUrl
      );

    }


    const imageUrl =
      URL.createObjectURL(
        file
      );


    setSelectedFile(
      file
    );


    setFormData(
      (prev) => ({
        ...prev,
        iconUrl:
          imageUrl,
      })
    );

  };


  // ====================================================
  // NAME + SLUG
  // ====================================================

  const handleNameChange = (
    e
  ) => {

    const val =
      e.target.value;


    const generatedSlug =
      val
        .toLowerCase()
        .trim()
        .replace(
          /[\s\W-]+/g,
          "-"
        );


    setFormData(
      (prev) => ({
        ...prev,
        name:
          val,
        slug:
          generatedSlug,
      })
    );

  };


  // ====================================================
  // INPUT CHANGE
  // ====================================================

  const handleInputChange = (
    e
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setFormData(
      (prev) => ({
        ...prev,
        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );

  };


  // ====================================================
  // EDITOR
  // ====================================================

  const handleEditorChange = (
    content
  ) => {

    setFormData(
      (prev) => ({
        ...prev,
        description:
          content,
      })
    );

  };


  // ====================================================
  // RESET
  // ====================================================

  const handleReset = () => {

    if (
      formData.iconUrl?.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        formData.iconUrl
      );

    }


    setFormData(
      initialFormData
    );


    setSelectedFile(
      null
    );


    if (
      editorRef.current
    ) {

      editorRef.current.setContent(
        ""
      );

    }


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }

  };


  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh = async () => {

    setSearchQuery(
      ""
    );

    setStatusFilter(
      "All"
    );

    setCurrentPage(
      1
    );


    // Direct fetch without old filter
    try {

      setLoading(true);


      const response =
        await API.get(
          "/categories"
        );


      const data =
        response.data?.data ||
        response.data ||
        [];


      setCategoriesList(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Refresh error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ====================================================
  // SAVE CATEGORY
  // ====================================================

  const handleSaveCategory = async (
    e
  ) => {

    e.preventDefault();


    if (
      !formData.name.trim()
    ) {

      alert(
        "Please enter a Category Name"
      );

      return;

    }


    if (
      !formData.slug.trim()
    ) {

      alert(
        "Please enter a Category Slug"
      );

      return;

    }


    try {

      setSaving(
        true
      );


      const data =
        new FormData();


      data.append(
        "name",
        formData.name.trim()
      );


      data.append(
        "slug",
        formData.slug.trim().toLowerCase()
      );


      // ==================================================
      // PARENT CATEGORY
      //
      // EXACTLY AS ORIGINAL:
      // Empty string = no parent
      // Category name = parent
      // ==================================================

      data.append(
        "parent",
        formData.parent || ""
      );


      data.append(
        "description",
        formData.description ||
          ""
      );


      data.append(
        "order",
        String(
          Number(
            formData.order
          ) || 0
        )
      );


      data.append(
        "status",
        formData.status
          ? "true"
          : "false"
      );


      data.append(
        "icon",
        formData.icon ||
          "📦"
      );


      // ==================================================
      // IMAGE
      // ==================================================

      if (
        selectedFile
      ) {

        data.append(
          "icon",
          selectedFile
        );

      }


      // ==================================================
      // UPDATE
      // ==================================================

      if (
        formData.id
      ) {

        if (
          !formData.iconUrl &&
          !selectedFile
        ) {

          data.append(
            "removeIcon",
            "true"
          );

        }


        const response =
          await API.put(
            `/categories/${formData.id}`,
            data
          );


        alert(
          response.data?.message ||
          "Category updated successfully"
        );

      }


      // ==================================================
      // CREATE
      // ==================================================

      else {

        const response =
          await API.post(
            "/categories",
            data
          );


        alert(
          response.data?.message ||
          "Category created successfully"
        );

      }


      handleReset();


      await fetchCategories();


    } catch (error) {

      console.error(
        "Save category error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to save category"
      );

    } finally {

      setSaving(
        false
      );

    }

  };


  // ====================================================
  // STATUS CHANGE
  // ====================================================

  const handleStatusChange = async (
    id,
    newStatus
  ) => {

    try {

      const response =
        await API.put(
          `/categories/${id}/status`,
          {
            status:
              newStatus,
          }
        );


      const updated =
        response.data?.data;


      if (
        updated
      ) {

        setCategoriesList(
          (prev) =>
            prev.map(
              (cat) =>
                cat._id ===
                updated._id
                  ? updated
                  : cat
            )
        );

      }


      setActiveDropdownId(
        null
      );


    } catch (error) {

      console.error(
        "Status change error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to update status"
      );

    }

  };


  // ====================================================
  // EDIT CATEGORY
  // ====================================================

  const handleEdit = (
    category
  ) => {

    setFormData({

      id:
        category._id,

      name:
        category.name ||
        "",

      slug:
        category.slug ||
        "",

      // ================================================
      // KEEP EXISTING PARENT
      // ================================================

      parent:
        category.parent ===
          "—"
          ? ""
          : category.parent ||
            "",

      description:
        category.description ||
        "",

      order:
        category.order ||
        0,

      status:
        category.status ===
        "Active",

      icon:
        category.icon ||
        "📦",

      iconUrl:
        category.iconUrl
          ? getImageUrl(
              category.iconUrl
            )
          : null,

    });


    setSelectedFile(
      null
    );


    if (
      editorRef.current
    ) {

      editorRef.current.setContent(
        category.description ||
          ""
      );

    }


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }


    setActiveDropdownId(
      null
    );


    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });

  };


  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this category?"
      );


    if (!confirmed) {

      return;

    }


    try {

      await API.delete(
        `/categories/${id}`
      );


      setCategoriesList(
        (prev) =>
          prev.filter(
            (cat) =>
              cat._id !== id
          )
      );


      if (
        formData.id === id
      ) {

        handleReset();

      }


      setActiveDropdownId(
        null
      );


      alert(
        "Category deleted successfully"
      );


    } catch (error) {

      console.error(
        "Delete category error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to delete category"
      );

    }

  };


  // ====================================================
  // REMOVE ICON
  // ====================================================

  const handleRemoveIcon = () => {

    if (
      formData.iconUrl?.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        formData.iconUrl
      );

    }


    setFormData(
      (prev) => ({
        ...prev,
        iconUrl:
          null,
      })
    );


    setSelectedFile(
      null
    );


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }

  };


  // ====================================================
  // FILTER
  // ====================================================

  const filteredCategories =
    categoriesList.filter(
      (cat) => {

        const name =
          String(
            cat.name ||
              ""
          ).toLowerCase();


        const parent =
          String(
            cat.parent ||
              ""
          ).toLowerCase();


        const search =
          searchQuery.toLowerCase();


        const matchesSearch =
          name.includes(
            search
          ) ||
          parent.includes(
            search
          );


        const matchesStatus =
          statusFilter ===
            "All" ||
          cat.status ===
            statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );


  // ====================================================
  // PAGINATION
  // ====================================================

  const totalEntries =
    filteredCategories.length;


  const totalPages =
    Math.ceil(
      totalEntries /
        ITEMS_PER_PAGE
    ) || 1;


  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;


  const currentCategories =
    filteredCategories.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );


  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="cat-page-container">

      <div className="cat-page-grid">


        {/* ================= LEFT SECTION ================= */}

        <div className="cat-page-card cat-page-form-section">

          <div className="cat-page-header">

            <h2>
              {formData.id
                ? "Edit Category"
                : "Add / Edit Category"}
            </h2>

            <p>
              Fill in the details to create or update a category.
            </p>

          </div>


          <form
            onSubmit={
              handleSaveCategory
            }
            className="cat-page-form"
          >


            {/* Upload Icon */}

            <div className="cat-page-upload-wrapper">

              <input
                type="file"
                ref={
                  fileInputRef
                }
                onChange={
                  handleIconUpload
                }
                accept="image/png, image/jpeg, image/svg+xml"
                style={{
                  display:
                    "none",
                }}
              />


              <div
                className="cat-page-upload-circle"
                onClick={() =>
                  fileInputRef.current &&
                  fileInputRef.current.click()
                }
                title="Click to upload icon"
              >

                {formData.iconUrl ? (

                  <img
                    src={
                      getImageUrl(
                        formData.iconUrl
                      )
                    }
                    alt="Uploaded Icon"
                    className="cat-page-uploaded-img"
                  />

                ) : (

                  <UploadCloud
                    className="cat-page-upload-icon"
                    size={28}
                  />

                )}

              </div>


              <div className="cat-page-upload-text">

                <p>
                  <strong>
                    Upload Icon{" "}
                    <span className="cat-page-required">
                      *
                    </span>
                  </strong>
                </p>

                <span>
                  JPG, PNG or SVG
                </span>

                <span>
                  Max size 1MB
                </span>


                {formData.iconUrl && (

                  <button
                    type="button"
                    className="cat-page-remove-img-btn"
                    onClick={
                      handleRemoveIcon
                    }
                  >
                    Remove Icon
                  </button>

                )}

              </div>

            </div>


            {/* Category Name */}

            <div className="cat-page-form-group">

              <label>
                Category Name{" "}
                <span className="cat-page-required">
                  *
                </span>
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter category name"
                value={
                  formData.name
                }
                onChange={
                  handleNameChange
                }
                required
              />

            </div>


            {/* Slug */}

            <div className="cat-page-form-group">

              <label>
                Slug (URL Friendly){" "}
                <span className="cat-page-required">
                  *
                </span>
              </label>

              <input
                type="text"
                name="slug"
                placeholder="enter-category-slug"
                value={
                  formData.slug
                }
                onChange={
                  handleInputChange
                }
                required
              />

              <span className="cat-page-help-text">
                This will be used in the URL. Example: food-grains
              </span>

            </div>


            {/* ==================================================
                PARENT CATEGORY
                SAME DATA AS ORIGINAL
                ================================================== */}

            <div className="cat-page-form-group">

              <label>
                Parent Category
              </label>

              <div className="cat-page-select-wrapper">

                <select
                  name="parent"
                  value={
                    formData.parent
                  }
                  onChange={
                    handleInputChange
                  }
                >

                  <option value="">
                    Select parent category (optional)
                  </option>


                  {PARENT_CATEGORY_DATA
                    .filter(
                      (parent) =>
                        parent.name !==
                        formData.name
                    )
                    .map(
                      (
                        parent
                      ) => (

                        <option
                          key={
                            parent.name
                          }
                          value={
                            parent.name
                          }
                        >
                          {parent.name}
                        </option>

                      )
                    )}

                </select>


                <ChevronDown
                  className="cat-page-select-arrow"
                  size={16}
                />

              </div>

            </div>


            {/* Description */}

            <div className="cat-page-form-group">

              <label>
                Description
              </label>

              <div className="cat-page-editor-wrapper">

                <Editor
                  apiKey="8hswbe7bfeeneui9eb9gjgsym8ku30nx5gwre9808ajdzniu"
                  onInit={(
                    evt,
                    editor
                  ) =>
                    (editorRef.current =
                      editor)
                  }
                  value={
                    formData.description
                  }
                  onEditorChange={
                    handleEditorChange
                  }
                  init={{
                    height: 220,

                    menubar:
                      false,

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

                    statusbar:
                      false,

                    branding:
                      false,
                  }}
                />

              </div>

            </div>


            {/* Display Order */}

            <div className="cat-page-form-group">

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

              <span className="cat-page-help-text">
                Lower number shows first
              </span>

            </div>


            {/* Status */}

            <div className="cat-page-form-group">

              <label>
                Status
              </label>

              <div className="cat-page-toggle-wrapper">

                <label className="cat-page-switch">

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

                  <span className="cat-page-slider round">
                  </span>

                </label>

                <span className="cat-page-status-label">
                  {formData.status
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

            </div>


            {/* Actions */}

            <div className="cat-page-form-actions">

              <button
                type="button"
                className="cat-page-btn cat-page-btn-outline"
                onClick={
                  handleReset
                }
                disabled={
                  saving
                }
              >

                <RotateCcw
                  size={16}
                />

                Reset

              </button>


              <button
                type="submit"
                className="cat-page-btn cat-page-btn-primary"
                disabled={
                  saving
                }
              >

                <Save
                  size={16}
                />

                {saving
                  ? "Saving..."
                  : "Save Category"}

              </button>

            </div>

          </form>

        </div>


        {/* ================= RIGHT SECTION ================= */}

        <div className="cat-page-card cat-page-list-section">

          <div>

            {/* Header */}

            <div className="cat-page-list-header">

              <div>

                <h2>
                  All Categories
                </h2>

                <p>
                  Manage your product categories
                </p>

              </div>


              <div className="cat-page-controls">


                {/* Search */}

                <div className="cat-page-search-box">

                  <Search
                    size={16}
                    className="cat-page-search-icon"
                  />

                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={
                      searchQuery
                    }
                    onChange={(
                      e
                    ) => {

                      setSearchQuery(
                        e.target.value
                      );

                      setCurrentPage(
                        1
                      );

                    }}
                  />

                </div>


                {/* Filter */}

                <div className="cat-page-filter-container">

                  <button
                    type="button"
                    className={`cat-page-btn-icon ${
                      statusFilter !==
                      "All"
                        ? "active-filter"
                        : ""
                    }`}
                    onClick={() =>
                      setShowFilterDropdown(
                        (
                          prev
                        ) =>
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

                    <div className="cat-page-filter-dropdown">

                      <p className="cat-page-filter-title">
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

                          setShowFilterDropdown(
                            false
                          );

                          setCurrentPage(
                            1
                          );

                        }}
                      >
                        All
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

                          setShowFilterDropdown(
                            false
                          );

                          setCurrentPage(
                            1
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

                          setShowFilterDropdown(
                            false
                          );

                          setCurrentPage(
                            1
                          );

                        }}
                      >
                        Inactive
                      </button>

                    </div>

                  )}

                </div>


                {/* Refresh */}

                <button
                  type="button"
                  className="cat-page-btn-icon"
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


            {/* Table */}

            <div className="cat-page-table-wrapper">

              <table className="cat-page-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Icon
                    </th>

                    <th>
                      Category Name
                    </th>

                    <th>
                      Parent Category
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
                        className="cat-page-no-data"
                      >
                        Loading categories...
                      </td>

                    </tr>

                  ) : currentCategories.length >
                    0 ? (

                    currentCategories.map(
                      (
                        item,
                        index
                      ) => (

                        <tr
                          key={
                            item._id
                          }
                        >

                          <td>
                            {startIndex +
                              index +
                              1}
                          </td>


                          <td>

                            <div className="cat-page-table-icon">

                              {item.iconUrl ? (

                                <img
                                  src={
                                    getImageUrl(
                                      item.iconUrl
                                    )
                                  }
                                  alt={
                                    item.name
                                  }
                                  className="cat-page-table-img"
                                />

                              ) : (

                                item.icon ||
                                "📦"

                              )}

                            </div>

                          </td>


                          <td className="cat-page-font-semibold">

                            {
                              item.name
                            }

                          </td>


                          <td className="cat-page-text-muted">

                            {
                              item.parent ||
                              "—"
                            }

                          </td>


                          <td>

                            {
                              item.order
                            }

                          </td>


                          <td>

                            <span
                              className={`cat-page-badge ${String(
                                item.status ||
                                  ""
                              ).toLowerCase()}`}
                            >

                              {
                                item.status
                              }

                            </span>

                          </td>


                          <td>

                            <div className="cat-page-action-wrapper">


                              {/* Edit */}

                              <button
                                type="button"
                                className="cat-page-btn-action cat-page-edit-btn"
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


                              {/* Delete */}

                              <button
                                type="button"
                                className="cat-page-btn-action cat-page-delete-btn"
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


                              {/* More */}

                              <div className="cat-page-dropdown-container">

                                <button
                                  type="button"
                                  className="cat-page-btn-action cat-page-more-btn"
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

                                  <div className="cat-page-action-dropdown">

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
                                        className="cat-icon-active"
                                      />

                                      Set Active

                                    </button>


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
                                        className="cat-icon-inactive"
                                      />

                                      Set Inactive

                                    </button>

                                  </div>

                                )}

                              </div>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="cat-page-no-data"
                      >
                        No categories found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>


          {/* Pagination */}

          <div className="cat-page-pagination-wrapper">

            <span className="cat-page-text-muted">

              Showing{" "}

              {totalEntries >
              0
                ? startIndex +
                  1
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


            <div className="cat-page-pagination">

              <button
                type="button"
                className="cat-page-page-btn"
                disabled={
                  currentPage ===
                  1
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


              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, i) =>
                  i + 1
              ).map(
                (
                  page
                ) => (

                  <button
                    type="button"
                    key={
                      page
                    }
                    className={`cat-page-page-btn ${
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
                  >
                    {
                      page
                    }
                  </button>

                )
              )}


              <button
                type="button"
                className="cat-page-page-btn"
                disabled={
                  currentPage ===
                  totalPages
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


export default Categories;
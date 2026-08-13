import React, { useState, useEffect } from "react";
import "./EditUnit.css";

import {
  Search,
  Filter,
  RotateCcw,
  Edit3,
  Trash2,
  ChevronDown,
  Save,
  MoreVertical,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";

import API from "../../api/axios";


// ==========================================================
// ITEMS PER PAGE
// ==========================================================

const ITEMS_PER_PAGE = 8;


// ==========================================================
// COMPONENT
// ==========================================================

const EditUnit = () => {

  // ========================================================
  // FORM STATES
  // ========================================================

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    symbol: "",
    type: "",
    order: 0,
    status: true,
  });


  // ========================================================
  // TABLE STATES
  // ========================================================

  const [unitsList, setUnitsList] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [showFilterDropdown, setShowFilterDropdown] =
    useState(false);

  const [activeDropdownId, setActiveDropdownId] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);


  // ========================================================
  // PAGINATION STATES
  // ========================================================

  const [totalEntries, setTotalEntries] = useState(0);

  const [totalPages, setTotalPages] = useState(1);


  // ========================================================
  // LOADING
  // ========================================================

  const [loading, setLoading] = useState(false);


  // ========================================================
  // CLOSE DROPDOWNS
  // ========================================================

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        !e.target.closest(
          ".unit-page-dropdown-container"
        )
      ) {
        setActiveDropdownId(null);
      }


      if (
        !e.target.closest(
          ".unit-page-filter-container"
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
  // GET TYPE COLOR
  // ========================================================

  const getTypeColor = (type) => {

    switch ((type || "").toLowerCase()) {

      case "weight":
        return "green";

      case "volume":
        return "blue";

      case "count":
        return "orange";

      case "length":
        return "teal";

      default:
        return "purple";
    }
  };


  // ========================================================
  // FORMAT BACKEND UNIT
  // ========================================================

  const formatUnit = (unit) => {

    return {
      ...unit,

      // MongoDB _id -> frontend id
      id: unit._id || unit.id,

      name: unit.name || "",

      symbol: unit.symbol || "",

      subType: unit.type || "Count",

      type: unit.type || "Count",

      typeColor: getTypeColor(unit.type),

      order: Number(unit.order) || 0,

      // Backend boolean -> UI string
      status: unit.status
        ? "Active"
        : "Inactive",
    };
  };


  // ========================================================
  // FETCH UNITS
  // ========================================================

  const fetchUnits = async () => {

    try {

      setLoading(true);


      const res = await API.get("/units", {
        params: {
          search: searchQuery,
          status: statusFilter,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });


      const data = res.data?.data || [];

      const pagination =
        res.data?.pagination || {};


      setUnitsList(
        data.map(formatUnit)
      );


      setTotalEntries(
        pagination.totalEntries || 0
      );


      setTotalPages(
        pagination.totalPages || 1
      );


    } catch (error) {

      console.error(
        "Fetch Units Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to fetch units"
      );

    } finally {

      setLoading(false);
    }
  };


  // ========================================================
  // FETCH WHEN SEARCH / FILTER / PAGE CHANGES
  // ========================================================

  useEffect(() => {

    fetchUnits();

  }, [
    searchQuery,
    statusFilter,
    currentPage,
  ]);


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
  // RESET FORM
  // ========================================================

  const handleReset = () => {

    setFormData({
      id: null,
      name: "",
      symbol: "",
      type: "",
      order: 0,
      status: true,
    });
  };


  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = () => {

    setSearchQuery("");

    setStatusFilter("All");

    setCurrentPage(1);

    setActiveDropdownId(null);

    handleReset();

    /*
      fetchUnits is automatically called
      because search/filter/page changes.
    */
  };


  // ========================================================
  // SAVE / UPDATE UNIT
  // ========================================================

  const handleSaveUnit = async (e) => {

    e.preventDefault();


    // ------------------------------------------------------
    // FRONTEND VALIDATION
    // ------------------------------------------------------

    if (!formData.name.trim()) {

      alert("Please enter a Unit Name");

      return;
    }


    if (!formData.symbol.trim()) {

      alert("Please enter a Unit Symbol");

      return;
    }


    try {

      setLoading(true);


      // ----------------------------------------------------
      // REQUEST BODY
      // ----------------------------------------------------

      const payload = {
        name: formData.name.trim(),

        symbol: formData.symbol.trim(),

        type: formData.type || "Count",

        order:
          Number(formData.order) || 0,

        status: Boolean(formData.status),
      };


      // ====================================================
      // UPDATE
      // ====================================================

      if (formData.id) {

        await API.put(
          `/units/${formData.id}`,
          payload
        );


        alert(
          "Unit updated successfully"
        );

      }

      // ====================================================
      // CREATE
      // ====================================================

      else {

        await API.post(
          "/units",
          payload
        );


        alert(
          "Unit created successfully"
        );
      }


      // ----------------------------------------------------
      // RESET
      // ----------------------------------------------------

      handleReset();


      // ----------------------------------------------------
      // GO TO FIRST PAGE
      // ----------------------------------------------------

      setCurrentPage(1);


      // ----------------------------------------------------
      // FETCH UPDATED DATA
      // ----------------------------------------------------

      /*
        Search/filter may already have the same value,
        so directly fetching here guarantees the table
        is updated immediately.
      */

      await fetchUnits();


    } catch (error) {

      console.error(
        "Save Unit Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to save unit"
      );

    } finally {

      setLoading(false);
    }
  };


  // ========================================================
  // STATUS CHANGE
  // ========================================================

  const handleStatusChange = async (
    id,
    newStatus
  ) => {

    try {

      const statusValue =
        newStatus === "Active";


      await API.put(
        `/units/${id}/status`,
        {
          status: statusValue,
        }
      );


      setActiveDropdownId(null);


      alert(
        statusValue
          ? "Unit activated successfully"
          : "Unit deactivated successfully"
      );


      await fetchUnits();


    } catch (error) {

      console.error(
        "Status Change Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to change unit status"
      );
    }
  };


  // ========================================================
  // EDIT
  // ========================================================

  const handleEdit = (unit) => {

    setFormData({
      id: unit.id,

      name: unit.name,

      symbol: unit.symbol,

      type: unit.type,

      order: unit.order,

      status:
        unit.status === "Active",
    });


    setActiveDropdownId(null);


    /*
      Scroll to form so the user can
      immediately see the selected data.
    */

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ========================================================
  // DELETE
  // ========================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this unit?"
    );


    if (!confirmed) {
      return;
    }


    try {

      setLoading(true);


      await API.delete(
        `/units/${id}`
      );


      alert(
        "Unit deleted successfully"
      );


      setActiveDropdownId(null);


      /*
        If the current page becomes empty
        after deleting the last item,
        move to previous page.
      */

      if (
        unitsList.length === 1 &&
        currentPage > 1
      ) {

        setCurrentPage(
          (prev) => prev - 1
        );

      } else {

        await fetchUnits();
      }


    } catch (error) {

      console.error(
        "Delete Unit Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to delete unit"
      );

    } finally {

      setLoading(false);
    }
  };


  // ========================================================
  // UI
  // ========================================================

  return (
    <div className="unit-page-container">

      <div className="unit-page-grid">


        {/* ==================================================
            LEFT SECTION
        ================================================== */}

        <div className="unit-page-left">

          <div className="unit-page-card unit-page-form-section">

            <div className="unit-page-header">

              <h2>
                {formData.id
                  ? "Edit Unit"
                  : "Add / Edit Unit"}
              </h2>

              <p>
                Fill in the details to create or
                update a unit.
              </p>

            </div>


            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSaveUnit}
              className="unit-page-form"
            >


              {/* ==================================================
                  UNIT NAME
              ================================================== */}

              <div className="unit-page-form-group">

                <label>
                  Unit Name{" "}

                  <span className="unit-page-required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter unit name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <span className="unit-page-help-text">
                  Example: Kilogram, Litre, Piece
                </span>

              </div>


              {/* ==================================================
                  UNIT SYMBOL
              ================================================== */}

              <div className="unit-page-form-group">

                <label>
                  Unit Symbol{" "}

                  <span className="unit-page-required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="symbol"
                  placeholder="Enter unit symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                />

                <span className="unit-page-help-text">
                  Example: kg, l, pc
                </span>

              </div>


              {/* ==================================================
                  UNIT TYPE
              ================================================== */}

              <div className="unit-page-form-group">

                <label>
                  Unit Type
                </label>

                <div className="unit-page-select-wrapper">

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >

                    <option value="">
                      Select unit type
                    </option>

                    <option value="Weight">
                      Weight
                    </option>

                    <option value="Volume">
                      Volume
                    </option>

                    <option value="Count">
                      Count
                    </option>

                    <option value="Length">
                      Length
                    </option>

                  </select>

                  <ChevronDown
                    className="unit-page-select-arrow"
                    size={16}
                  />

                </div>

                <span className="unit-page-help-text">
                  Helps in better management and reporting
                </span>

              </div>


              {/* ==================================================
                  DISPLAY ORDER
              ================================================== */}

              <div className="unit-page-form-group">

                <label>
                  Display Order
                </label>

                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                />

                <span className="unit-page-help-text">
                  Lower number shows first
                </span>

              </div>


              {/* ==================================================
                  STATUS
              ================================================== */}

              <div className="unit-page-form-group">

                <label>
                  Status
                </label>

                <div className="unit-page-toggle-wrapper">

                  <label className="unit-page-switch">

                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                    />

                    <span className="unit-page-slider round"></span>

                  </label>

                  <span className="unit-page-status-label">
                    {formData.status
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

              </div>


              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="unit-page-form-actions">

                <button
                  type="button"
                  className="unit-page-btn unit-page-btn-outline"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <RotateCcw size={16} />

                  Reset
                </button>


                <button
                  type="submit"
                  className="unit-page-btn unit-page-btn-primary"
                  disabled={loading}
                >
                  <Save size={16} />

                  {loading
                    ? "Saving..."
                    : "Save Unit"}
                </button>

              </div>

            </form>

          </div>


          {/* ==================================================
              TIPS
          ================================================== */}

          <div className="unit-page-tips-card">

            <div className="unit-page-tips-header">

              <Lightbulb
                size={18}
                className="unit-page-tips-icon"
              />

              <span>
                Tips
              </span>

            </div>

            <p className="unit-page-tips-body">
              Use clear and standard unit names.
            </p>

            <p className="unit-page-tips-example">
              Example: Kilogram (kg), Litre (L), Piece (pc)
            </p>

          </div>

        </div>


        {/* ==================================================
            RIGHT SECTION
        ================================================== */}

        <div className="unit-page-right">

          <div className="unit-page-card unit-page-list-section">

            <div>

              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="unit-page-list-header">

                <div>

                  <h2>
                    All Units
                  </h2>

                  <p>
                    Manage and organize all product units.
                  </p>

                </div>


                <div className="unit-page-controls">


                  {/* ==================================================
                      SEARCH
                  ================================================== */}

                  <div className="unit-page-search-box">

                    <Search
                      size={16}
                      className="unit-page-search-icon"
                    />

                    <input
                      type="text"
                      placeholder="Search units..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(
                          e.target.value
                        );

                        setCurrentPage(1);
                      }}
                    />

                  </div>


                  {/* ==================================================
                      FILTER
                  ================================================== */}

                  <div className="unit-page-filter-container">

                    <button
                      type="button"
                      className={`unit-page-btn-icon ${
                        statusFilter !== "All"
                          ? "active-filter"
                          : ""
                      }`}
                      onClick={() =>
                        setShowFilterDropdown(
                          (prev) => !prev
                        )
                      }
                    >

                      <Filter size={16} />

                      Filter

                    </button>


                    {showFilterDropdown && (

                      <div className="unit-page-filter-dropdown">

                        <p className="unit-page-filter-title">
                          Filter Status
                        </p>


                        <button
                          type="button"
                          className={
                            statusFilter === "All"
                              ? "selected"
                              : ""
                          }
                          onClick={() => {

                            setStatusFilter(
                              "All"
                            );

                            setCurrentPage(1);

                            setShowFilterDropdown(
                              false
                            );
                          }}
                        >
                          All
                        </button>


                        <button
                          type="button"
                          className={
                            statusFilter === "Active"
                              ? "selected"
                              : ""
                          }
                          onClick={() => {

                            setStatusFilter(
                              "Active"
                            );

                            setCurrentPage(1);

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
                            statusFilter === "Inactive"
                              ? "selected"
                              : ""
                          }
                          onClick={() => {

                            setStatusFilter(
                              "Inactive"
                            );

                            setCurrentPage(1);

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
                    className="unit-page-btn-icon"
                    onClick={handleRefresh}
                    title="Refresh Table"
                    disabled={loading}
                  >
                    <RotateCcw size={16} />
                  </button>

                </div>

              </div>


              {/* ==================================================
                  TABLE
              ================================================== */}

              <div className="unit-page-table-wrapper">

                <table className="unit-page-table">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Unit Name
                      </th>

                      <th>
                        Symbol
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Display Order
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

                    {loading && unitsList.length === 0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="unit-page-no-data"
                        >
                          Loading units...
                        </td>

                      </tr>

                    ) : unitsList.length > 0 ? (

                      unitsList.map(
                        (item, index) => (

                          <tr
                            key={item.id}
                          >

                            {/* ==================================================
                                NUMBER
                            ================================================== */}

                            <td>
                              {(
                                (currentPage - 1) *
                                  ITEMS_PER_PAGE
                              ) +
                                index +
                                1}
                            </td>


                            {/* ==================================================
                                NAME
                            ================================================== */}

                            <td>

                              <div className="unit-page-name-cell">

                                <div
                                  className={`unit-page-symbol-circle ${item.typeColor}`}
                                >
                                  {item.symbol}
                                </div>


                                <div className="unit-page-name-group">

                                  <span className="unit-page-font-semibold">
                                    {item.name}
                                  </span>

                                  <span className="unit-page-text-sub">
                                    {item.subType}
                                  </span>

                                </div>

                              </div>

                            </td>


                            {/* ==================================================
                                SYMBOL
                            ================================================== */}

                            <td className="unit-page-font-semibold">
                              {item.symbol}
                            </td>


                            {/* ==================================================
                                TYPE
                            ================================================== */}

                            <td>

                              <span
                                className={`unit-page-type-tag ${item.typeColor}`}
                              >
                                {item.type}
                              </span>

                            </td>


                            {/* ==================================================
                                ORDER
                            ================================================== */}

                            <td>
                              {item.order}
                            </td>


                            {/* ==================================================
                                STATUS
                            ================================================== */}

                            <td>

                              <span
                                className={`unit-page-badge ${item.status.toLowerCase()}`}
                              >
                                {item.status}
                              </span>

                            </td>


                            {/* ==================================================
                                ACTION
                            ================================================== */}

                            <td>

                              <div className="unit-page-action-wrapper">


                                {/* EDIT */}

                                <button
                                  type="button"
                                  className="unit-page-btn-action unit-page-edit-btn"
                                  onClick={() =>
                                    handleEdit(item)
                                  }
                                  title="Edit"
                                >
                                  <Edit3 size={14} />
                                </button>


                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="unit-page-btn-action unit-page-delete-btn"
                                  onClick={() =>
                                    handleDelete(item.id)
                                  }
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>


                                {/* MORE */}

                                <div className="unit-page-dropdown-container">

                                  <button
                                    type="button"
                                    className="unit-page-btn-action unit-page-more-btn"
                                    onClick={() =>
                                      setActiveDropdownId(
                                        activeDropdownId ===
                                          item.id
                                          ? null
                                          : item.id
                                      )
                                    }
                                    title="More Options"
                                  >
                                    <MoreVertical size={14} />
                                  </button>


                                  {activeDropdownId ===
                                    item.id && (

                                    <div className="unit-page-action-dropdown">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStatusChange(
                                            item.id,
                                            "Active"
                                          )
                                        }
                                      >

                                        <CheckCircle
                                          size={14}
                                          className="unit-icon-active"
                                        />

                                        Set Active

                                      </button>


                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStatusChange(
                                            item.id,
                                            "Inactive"
                                          )
                                        }
                                      >

                                        <XCircle
                                          size={14}
                                          className="unit-icon-inactive"
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
                          className="unit-page-no-data"
                        >
                          No units found.
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

            <div className="unit-page-pagination-wrapper">

              <span className="unit-page-text-muted">

                Showing{" "}

                {totalEntries > 0
                  ? (currentPage - 1) *
                      ITEMS_PER_PAGE +
                    1
                  : 0}

                {" "}to{" "}

                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  totalEntries
                )}

                {" "}of{" "}

                {totalEntries}

                {" "}entries

              </span>


              <div className="unit-page-pagination">


                {/* PREVIOUS */}

                <button
                  type="button"
                  className="unit-page-page-btn"
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


                {/* PAGE NUMBERS */}

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, i) => i + 1
                ).map((page) => (

                  <button
                    type="button"
                    key={page}
                    className={`unit-page-page-btn ${
                      currentPage === page
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    disabled={loading}
                  >
                    {page}
                  </button>

                ))}


                {/* NEXT */}

                <button
                  type="button"
                  className="unit-page-page-btn"
                  disabled={
                    currentPage ===
                      totalPages ||
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

    </div>
  );
};


export default EditUnit;
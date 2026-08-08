import React, { useEffect, useState } from "react";
import "./ListUploads.css";

import API from "../../api/axios";

// ======================================================
// BACKEND DATA -> EXISTING UI DATA
// ======================================================

const mapBackendItem = (item) => {
  const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();

  return {
    id: item._id,

    name: item.listName || "",

    file: item.uploadedFile?.originalName || item.originalFileName || "N/A",

    fileUrl: item.uploadedFile?.url || "",

    fileType: item.uploadedFile?.fileType || "",

    user: item.fullName || "Unknown User",

    role: item.role || "Customer",

    phone: `${item.countryCode || ""} ${item.phoneNumber || ""}`.trim(),

    countryCode: item.countryCode || "+91",

    phoneNumber: item.phoneNumber || "",

    deliveryAddress: item.deliveryAddress || "",

    items: Number(item.items || 0),

    downloads: Number(item.downloads || 0),

    todayDL: Number(item.todayDL || 0),

    status: item.status || "Received",

    // ==========================================
    // ADD THIS
    // ==========================================

    statusHistory: item.statusHistory || [],
    deliveryDateTime: item.deliveryDateTime || "",
    date: createdDate.toLocaleString(),

    createdAt: item.createdAt,

    updatedAt: item.updatedAt,

    orderId: item.orderId || "",

    receiptNo: item.receiptNo || "",

    price: item.price ?? "0.00",

    serviceCharge: item.serviceCharge ?? "0.00",

    handlingCharge: item.handlingCharge ?? "0.00",

    gst: item.gst ?? "0",
  };
};

const ListUploads = () => {
  // ======================================================
  // STATES
  // ======================================================

  const [lists, setLists] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All Status");

  const [userFilter, setUserFilter] = useState("All Users");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  // Pagination State

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [viewDetailsModal, setViewDetailsModal] = useState(null);

  const [downloadInvoiceModal, setDownloadInvoiceModal] = useState(null);

  const [editingId, setEditingId] = useState(null);

  // ======================================================
  // FORM
  // ======================================================

  const initialFormState = {
    title: "",
    uploadedBy: "",
    phone: "",
    items: "",
    file: null,
    price: "",
    serviceCharge: "",
    handlingCharge: "",
    gst: "",
    deliveryDateTime: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // ======================================================
  // GET ALL LISTS FROM BACKEND
  // ======================================================

  const fetchLists = async () => {
    try {
      setLoading(true);

      const response = await API.get("/list-upload");

      console.log("List Upload Response:", response.data);

      const backendLists = response.data?.data || [];

      const mappedLists = backendLists.map(mapBackendItem);

      setLists(mappedLists);
    } catch (error) {
      console.error("Fetch Lists Error:", error);

      alert(error.response?.data?.message || "Failed to load uploaded lists");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    fetchLists();
  }, []);

  // ======================================================
  // FILTERING
  // ======================================================

  const filteredLists = lists.filter((item) => {
    const itemName = item.name || "";

    const itemUser = item.user || "";

    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemUser.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;

    const matchesUser = userFilter === "All Users" || item.user === userFilter;

    let matchesDate = true;

    if (startDate || endDate) {
      const itemTimestamp = new Date(item.createdAt || item.date).getTime();

      if (startDate) {
        const startTimestamp = new Date(`${startDate}T00:00:00`).getTime();

        matchesDate = matchesDate && itemTimestamp >= startTimestamp;
      }

      if (endDate) {
        const endTimestamp = new Date(`${endDate}T23:59:59`).getTime();

        matchesDate = matchesDate && itemTimestamp <= endTimestamp;
      }
    }

    return matchesSearch && matchesStatus && matchesUser && matchesDate;
  });

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalItems = filteredLists.length;

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const currentDisplayedLists = filteredLists.slice(startIndex, endIndex);

  // ======================================================
  // PAGINATION HANDLERS
  // ======================================================

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);

    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);

    setCurrentPage(1);
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);

    setCurrentPage(1);
  };

  // ======================================================
  // DOWNLOAD / OPEN FILE
  // ======================================================

  const handleDownload = (item) => {
    setDownloadInvoiceModal(item);
  };

  // ======================================================
  // OPEN UPLOADED IMAGE / PDF
  // ======================================================

  const handleOpenUploadedFile = (item) => {
    if (!item.fileUrl) {
      alert("Uploaded file URL not found");

      return;
    }

    window.open(item.fileUrl, "_blank", "noopener,noreferrer");
  };

  // ======================================================
  // PRINT RECEIPT
  // ======================================================

  const handlePrintReceipt = () => {
    window.print();
  };

  // ======================================================
  // STATUS MAPPING
  //
  // Backend currently supports:
  // Received
  // Reviewing List
  // Packing
  // Out for Delivery
  // Delivered
  // Cancelled
  //
  // Your old UI used Active/Inactive/Expired.
  // We keep the same UI class names but send
  // backend-valid statuses.
  // ======================================================

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await API.put(`/list-upload/${id}/status`, {
        status: newStatus,
      });

      console.log("STATUS UPDATE RESPONSE:", response.data);
      console.log("STATUS HISTORY:", response.data?.statusHistory);

      const updated = mapBackendItem(response.data.data);

      setLists((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      console.error("Update Status Error:", error);

      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this list?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/list-upload/${id}`);

      setLists((prev) => prev.filter((item) => item.id !== id));

      setActiveDropdownId(null);

      if (currentDisplayedLists.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Delete Error:", error);

      alert(error.response?.data?.message || "Failed to delete list");
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    // Convert backend date to datetime-local format
    let formattedDeliveryDateTime = "";

    if (item.deliveryDateTime) {
      const date = new Date(item.deliveryDateTime);

      // datetime-local requires:
      // YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      formattedDeliveryDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setFormData({
      title: item.name,

      uploadedBy: item.user,

      phone: item.phoneNumber || item.phone,

      items: item.items || "",

      // ============================
      // DELIVERY DATE & TIME
      // ============================
      deliveryDateTime: formattedDeliveryDateTime,

      file: null,

      price: item.price || "",

      serviceCharge: item.serviceCharge || "",

      handlingCharge: item.handlingCharge || "",

      gst: item.gst || "",
    });

    setIsUploadModalOpen(true);

    setActiveDropdownId(null);
  };

  // ======================================================
  // NEW UPLOAD
  // ======================================================

  const openNewUploadModal = () => {
    setEditingId(null);

    setFormData(initialFormState);

    setIsUploadModalOpen(true);
  };

  // ======================================================
  // FILE VALIDATION
  // Backend supports JPG/PNG/WEBP/PDF
  // ======================================================

  const handleAdminFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, WEBP and PDF files are allowed.");

      e.target.value = "";

      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 5MB.");

      e.target.value = "";

      return;
    }

    setFormData({
      ...formData,
      file,
    });
  };

  // ======================================================
  // EXTRACT PHONE
  // ======================================================

  const getPhoneData = (phone) => {
    let cleaned = String(phone || "")
      .trim()
      .replace(/\s+/g, "");

    let countryCode = "+91";

    let phoneNumber = cleaned;

    if (cleaned.startsWith("+91")) {
      countryCode = "+91";

      phoneNumber = cleaned.substring(3);
    } else if (cleaned.startsWith("+1")) {
      countryCode = "+1";

      phoneNumber = cleaned.substring(2);
    } else if (cleaned.startsWith("+44")) {
      countryCode = "+44";

      phoneNumber = cleaned.substring(3);
    } else if (cleaned.startsWith("+61")) {
      countryCode = "+61";

      phoneNumber = cleaned.substring(3);
    }

    return {
      countryCode,
      phoneNumber,
    };
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      const { countryCode, phoneNumber } = getPhoneData(formData.phone);

      const payload = new FormData();

      // ----------------------------------
      // Backend fields
      // ----------------------------------

      payload.append("listName", formData.title);

      payload.append("FullName", formData.uploadedBy);

      payload.append("countryCode", countryCode);

      payload.append("phoneNumber", phoneNumber);

      /*
        Your admin modal currently has no
        delivery address input.

        For newly created admin records we
        still need to satisfy the current
        customer backend validation.

        If your model makes deliveryAddress
        optional for admin uploads, you can
        remove this.
      */

      payload.append("deliveryAddress", editingId ? "" : "Admin Upload");

      payload.append("items", formData.items);
      payload.append("deliveryDateTime", formData.deliveryDateTime);
      payload.append("price", formData.price);

      payload.append("serviceCharge", formData.serviceCharge);

      payload.append("handlingCharge", formData.handlingCharge);

      payload.append("gst", formData.gst);

      // ----------------------------------
      // New / replacement file
      // ----------------------------------

      if (formData.file) {
        payload.append("uploadedFile", formData.file);
      }

      let response;

      // ==================================
      // UPDATE
      // ==================================

      if (editingId) {
        response = await API.put(`/list-upload/${editingId}`, payload);
      }

      // ==================================
      // CREATE
      // ==================================
      else {
        if (!formData.file) {
          alert("Please select a file");

          return;
        }

        response = await API.post("/list-upload", payload);
      }

      const savedItem = mapBackendItem(response.data.data);

      // ==================================
      // Update frontend immediately
      // ==================================

      if (editingId) {
        setLists((prev) =>
          prev.map((item) => (item.id === editingId ? savedItem : item)),
        );
      } else {
        setLists((prev) => [savedItem, ...prev]);
      }

      setIsUploadModalOpen(false);

      setFormData(initialFormState);

      setEditingId(null);

      setCurrentPage(1);
    } catch (error) {
      console.error("Upload / Update Error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save list",
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // STATS
  // ======================================================

  const activeLists = lists.filter(
    (item) => item.status !== "Cancelled" && item.status !== "Delivered",
  ).length;

  const pendingLists = lists.filter(
    (item) => item.status === "Reviewing List" || item.status === "Packing",
  ).length;

  const expiredLists = lists.filter(
    (item) => item.status === "Cancelled",
  ).length;

  const totalDownloads = lists.reduce(
    (total, item) => total + Number(item.downloads || 0),
    0,
  );

  const getStatusDateTime = (status) => {
    if (!downloadInvoiceModal) {
      return "Pending";
    }

    const history = downloadInvoiceModal.statusHistory || [];

    const statusItem = history.find((item) => item.status === status);

    if (!statusItem?.date) {
      return "Pending";
    }

    return new Date(statusItem.date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="list-uploads-container">
      {/* 1. TOP STATS CARDS */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-box icon-total">📄</div>

          <div className="stat-info">
            <h4>Total Lists</h4>

            <div className="stat-value">{lists.length}</div>

            <p className="stat-sub text-green">+12 this month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-downloads">📥</div>

          <div className="stat-info">
            <h4>Total Downloads</h4>

            <div className="stat-value">{totalDownloads}</div>

            <p className="stat-sub text-green">+18.5% this month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-active">☑️</div>

          <div className="stat-info">
            <h4>Active Lists</h4>

            <div className="stat-value">{activeLists}</div>

            <p className="stat-sub text-green">62.5% of total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-pending">🕒</div>

          <div className="stat-info">
            <h4>Pending Lists</h4>

            <div className="stat-value">{pendingLists}</div>

            <p className="stat-sub text-green">12.5% of total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-expired">❌</div>

          <div className="stat-info">
            <h4>Expired Lists</h4>

            <div className="stat-value">{expiredLists}</div>

            <p className="stat-sub text-red">12.5% of total</p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE TABLE SECTION */}

      <div className="table-container">
        <div className="header-row">
          <div>
            <h2>All Uploaded Lists</h2>

            <p>View, manage and download all uploaded lists</p>
          </div>

          <button className="btn-primary" onClick={openNewUploadModal}>
            + Upload New List
          </button>
        </div>

        {/* Filter Controls */}

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search by list name or user..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <select
            className="select-input"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="All Status">All Status</option>

            <option value="Received">Received</option>

            <option value="Reviewing List">Reviewing List</option>

            <option value="Packing">Packing</option>

            <option value="Out for Delivery">Out for Delivery</option>

            <option value="Delivered">Delivered</option>

            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            className="select-input"
            value={userFilter}
            onChange={handleUserFilterChange}
          >
            <option value="All Users">All Users</option>

            {Array.from(new Set(lists.map((i) => i.user))).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);

              setCurrentPage(1);
            }}
          />

          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);

              setCurrentPage(1);
            }}
          />
        </div>

        {/* Data Table */}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>List Name</th>
                <th>Uploaded By</th>
                <th>Phone Number</th>
                <th>Items</th>
                <th>Downloads</th>
                <th>Status</th>
                <th>Uploaded On</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#64748b",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentDisplayedLists.length > 0 ? (
                currentDisplayedLists.map((row, index) => (
                  <tr key={row.id}>
                    {/* ============================= */}
                    {/* SL NO */}
                    {/* ============================= */}

                    <td>
                      <strong>{startIndex + index + 1}</strong>
                    </td>

                    {/* ============================= */}
                    {/* LIST NAME */}
                    {/* ============================= */}

                    <td>
                      <div className="file-cell">
                        <div>
                          <strong>{row.name}</strong>

                          <br />

                          <small
                            style={{
                              color: "#64748b",
                            }}
                          >
                            {row.file}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* ============================= */}
                    {/* UPLOADED BY */}
                    {/* ============================= */}

                    <td>
                      <div className="user-cell">
                        <div className="avatar-circle">
                          {row.user?.charAt(0)?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <strong>{row.user}</strong>

                          <br />

                          <small
                            style={{
                              color: "#64748b",
                            }}
                          >
                            {row.role}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* ============================= */}
                    {/* PHONE */}
                    {/* ============================= */}

                    <td>{row.phone}</td>

                    {/* ============================= */}
                    {/* ITEMS */}
                    {/* ============================= */}

                    <td>{row.items} items</td>

                    {/* ============================= */}
                    {/* DOWNLOADS */}
                    {/* ============================= */}

                    <td>
                      <strong>{row.downloads}</strong>

                      <br />

                      <small className="text-green">+{row.todayDL} today</small>
                    </td>

                    {/* ============================= */}
                    {/* STATUS DROPDOWN */}
                    {/* ============================= */}

                    <td>
                      <select
                        className={`badge ${
                          row.status === "Cancelled"
                            ? "badge-expired"
                            : row.status === "Delivered"
                              ? "badge-inactive"
                              : "badge-active"
                        }`}
                        value={row.status}
                        onChange={(e) =>
                          handleStatusChange(row.id, e.target.value)
                        }
                      >
                        <option value="Received">Received</option>

                        <option value="Reviewing List">Reviewing List</option>

                        <option value="Packing">Packing</option>

                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>

                        <option value="Delivered">Delivered</option>

                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* ============================= */}
                    {/* UPLOADED DATE */}
                    {/* ============================= */}

                    <td>{row.date}</td>

                    {/* ============================= */}
                    {/* ACTIONS */}
                    {/* ============================= */}

                    <td>
                      <div className="action-buttons">
                        {/* DOWNLOAD INVOICE */}

                        <button
                          className="icon-btn"
                          onClick={() => handleDownload(row)}
                          title="Download Invoice"
                        >
                          📥
                        </button>

                        {/* VIEW DETAILS */}

                        <button
                          className="icon-btn"
                          onClick={() => setViewDetailsModal(row)}
                          title="View Details"
                        >
                          👁️
                        </button>

                        {/* THREE DOT MENU */}

                        <button
                          className="icon-btn"
                          onClick={() =>
                            setActiveDropdownId(
                              activeDropdownId === row.id ? null : row.id,
                            )
                          }
                          title="More Actions"
                        >
                          ⋮
                        </button>

                        {/* ============================= */}
                        {/* DROPDOWN MENU */}
                        {/* ============================= */}

                        {activeDropdownId === row.id && (
                          <div className="dropdown-menu">
                            {/* EDIT */}

                            <button
                              className="dropdown-item"
                              onClick={() => handleEdit(row)}
                            >
                              ✏️ Edit
                            </button>

                            {/* VIEW FILE */}

                            {row.fileUrl && (
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  handleOpenUploadedFile(row);

                                  setActiveDropdownId(null);
                                }}
                              >
                                📄 View File
                              </button>
                            )}

                            {/* DELETE */}

                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(row.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#64748b",
                    }}
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}

        <div className="pagination-row">
          <span>
            Showing {totalItems > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, totalItems)} of {totalItems} lists
          </span>

          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1,
            ).map((page) => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="info-banner">
          <span>
            💡 <strong>Tips for Better Results:</strong> Upload clear and
            well-structured lists in image or PDF format for fast processing.
          </span>

          <span>📋</span>
        </div>
      </div>

      {/* 3. BOTTOM HORIZONTAL SECTION */}

      <div className="bottom-horizontal-grid">
        <div className="bottom-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <strong>Upload Summary</strong>

            <small
              style={{
                color: "#64748b",
              }}
            >
              This Month Overview
            </small>
          </div>

          <div className="donut-wrapper">
            <div className="donut-inner">
              <strong>{lists.length}</strong>

              <span>Total Lists</span>
            </div>
          </div>

          <ul className="legend-list">
            <li className="legend-item">
              <span>🟢 Active</span>

              <strong>{activeLists}</strong>
            </li>

            <li className="legend-item">
              <span>🟡 Pending</span>

              <strong>{pendingLists}</strong>
            </li>

            <li className="legend-item">
              <span>🔴 Expired</span>

              <strong>{expiredLists}</strong>
            </li>

            <li className="legend-item">
              <span>🔵 Downloaded</span>

              <strong>{totalDownloads}</strong>
            </li>
          </ul>
        </div>

        <div className="bottom-card">
          <h4
            style={{
              marginTop: 0,
            }}
          >
            👤 How List Upload Works?
          </h4>

          <ol
            style={{
              paddingLeft: 18,
              fontSize: 13,
              lineHeight: "1.8",
              margin: 0,
            }}
          >
            <li>
              <strong className="text-green">1.</strong> Upload your list
              (Image/PDF)
            </li>

            <li>
              <strong className="text-green">2.</strong> We process and validate
              it
            </li>

            <li>
              <strong className="text-green">3.</strong> Available for download
            </li>

            <li>
              <strong className="text-green">4.</strong> Get items delivered
              fast
            </li>
          </ol>
        </div>

        <div className="bottom-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <strong>Recent Uploads</strong>

            <small
              className="text-green"
              style={{
                cursor: "pointer",
              }}
            >
              View All
            </small>
          </div>

          {lists.slice(0, 3).map((i) => (
            <div
              key={i.id}
              style={{
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              <strong>{i.file}</strong>

              <div
                style={{
                  color: "#64748b",
                }}
              >
                {i.date}
              </div>
            </div>
          ))}
        </div>

        <div
          className="bottom-card"
          style={{
            background: "#ecfdf5",
            borderColor: "#a7f3d0",
          }}
        >
          <h4
            style={{
              marginTop: 0,
            }}
          >
            🎧 Need Help?
          </h4>

          <p
            style={{
              fontSize: 13,
              color: "#047857",
            }}
          >
            Our support team is here to help you with uploads.
          </p>

          <button
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* ================= MODAL 1: UPLOAD / EDIT LIST ================= */}

      {/* ================= MODAL: UPLOAD / EDIT LIST ================= */}

      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-custom-styled">
            {/* ================= HEADER ================= */}

            <div className="modal-header">
              <h3>{editingId ? "Edit List Details" : "Upload New List"}</h3>

              <button
                type="button"
                className="close-btn"
                onClick={() => setIsUploadModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* ================= FORM ================= */}

            <form onSubmit={handleUploadSubmit} className="ref-modal-form">
              {/* ================= LIST TITLE ================= */}

              <div className="form-group">
                <label>
                  List Title <span className="req-asterisk">*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Daily Groceries"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* ================= UPLOADED BY ================= */}

              <div className="form-group">
                <label>
                  Uploaded By <span className="req-asterisk">*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  value={formData.uploadedBy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      uploadedBy: e.target.value,
                    })
                  }
                />
              </div>

              {/* ================= PHONE ================= */}

              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              {/* ================= ITEMS ================= */}

              <div className="form-group">
                <label>
                  Items Count <span className="req-asterisk">*</span>
                </label>

                <input
                  type="number"
                  placeholder="e.g. 15"
                  required
                  min="1"
                  value={formData.items}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      items: e.target.value,
                    })
                  }
                />
              </div>

              {/* ============================================= */}
              {/* DELIVERY DATE & TIME */}
              {/* ============================================= */}

              <div className="form-group">
                <label>
                  Delivery Date & Time <span className="req-asterisk">*</span>
                </label>

                <input
                  type="datetime-local"
                  required
                  value={formData.deliveryDateTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryDateTime: e.target.value,
                    })
                  }
                />
              </div>

              {/* ================= FILE ================= */}

              <div className="form-group">
                <label>
                  Attach File (Image or PDF){" "}
                  <span className="req-asterisk">*</span>
                </label>

                <div className="ref-drop-zone">
                  <div className="cloud-icon">☁️</div>

                  <input
                    type="file"
                    required={!editingId}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    style={{
                      display: "none",
                    }}
                    id="fileInput"
                    onChange={handleAdminFileChange}
                  />

                  <label htmlFor="fileInput" className="file-label">
                    {formData.file
                      ? formData.file.name
                      : editingId
                        ? "Click to replace file"
                        : "Click to select file"}
                  </label>
                </div>
              </div>

              {/* ================= PRICE ================= */}

              <div className="form-group">
                <label>
                  Price <span className="req-asterisk">*</span>
                </label>

                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>

                  <input
                    type="text"
                    placeholder="e.g. 1000.00"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ================= SERVICE CHARGE ================= */}

              <div className="form-group">
                <label>
                  Service Charge <span className="req-asterisk">*</span>
                </label>

                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>

                  <input
                    type="text"
                    placeholder="e.g. 50.00"
                    required
                    value={formData.serviceCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceCharge: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ================= HANDLING CHARGE ================= */}

              <div className="form-group">
                <label>
                  Handling Charge <span className="req-asterisk">*</span>
                </label>

                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>

                  <input
                    type="text"
                    placeholder="e.g. 30.00"
                    required
                    value={formData.handlingCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        handlingCharge: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ================= GST ================= */}

              <div className="form-group">
                <label>
                  GST (%) <span className="req-asterisk">*</span>
                </label>

                <div className="input-group-addon">
                  <input
                    type="text"
                    placeholder="e.g. 18"
                    required
                    value={formData.gst}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gst: e.target.value,
                      })
                    }
                  />

                  <span className="addon-suffix">%</span>
                </div>
              </div>

              {/* ================= FOOTER ================= */}

              <div className="modal-footer ref-modal-footer">
                <button
                  type="button"
                  className="btn-ref-cancel"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-ref-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Upload List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: VIEW DETAILS ================= */}

      {viewDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-custom-styled">
            <div className="modal-header">
              <h3>View List Details</h3>

              <button
                className="close-btn"
                onClick={() => setViewDetailsModal(null)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="ref-modal-form"
            >
              <div className="form-group">
                <label>List Title</label>

                <input
                  type="text"
                  value={viewDetailsModal.name || ""}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Uploaded By</label>

                <input
                  type="text"
                  value={`${viewDetailsModal.user || ""} (${viewDetailsModal.role || "Customer"})`}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="text"
                  value={viewDetailsModal.phone || "N/A"}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Items</label>

                <input
                  type="text"
                  value={`${viewDetailsModal.items || 0} items`}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>File Name</label>

                <input
                  type="text"
                  value={viewDetailsModal.file || "N/A"}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Price</label>

                <div className="input-group-addon">
                  <span className="addon-prefix">₹</span>

                  <input
                    type="text"
                    value={viewDetailsModal.price || "0.00"}
                    readOnly
                  />
                </div>
              </div>

              {viewDetailsModal.serviceCharge && (
                <div className="form-group">
                  <label>Service Charge</label>

                  <div className="input-group-addon">
                    <span className="addon-prefix">₹</span>

                    <input
                      type="text"
                      value={viewDetailsModal.serviceCharge}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {viewDetailsModal.handlingCharge && (
                <div className="form-group">
                  <label>Handling Charge</label>

                  <div className="input-group-addon">
                    <span className="addon-prefix">₹</span>

                    <input
                      type="text"
                      value={viewDetailsModal.handlingCharge}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {viewDetailsModal.gst !== undefined && (
                <div className="form-group">
                  <label>GST (%)</label>

                  <div className="input-group-addon">
                    <input type="text" value={viewDetailsModal.gst} readOnly />

                    <span className="addon-suffix">%</span>
                  </div>
                </div>
              )}

              {viewDetailsModal.fileUrl && (
                <div className="modal-footer ref-modal-footer">
                  <button
                    type="button"
                    className="btn-ref-submit"
                    onClick={() => handleOpenUploadedFile(viewDetailsModal)}
                  >
                    View Uploaded File
                  </button>
                </div>
              )}

              <div className="modal-footer ref-modal-footer">
                <button
                  type="button"
                  className="btn-ref-cancel"
                  onClick={() => setViewDetailsModal(null)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* MODAL 3: INVOICE / RECEIPT DOWNLOAD */}
      {/* ====================================================== */}

      {downloadInvoiceModal && (
        <div className="modal-overlay print-modal-overlay">
          <div className="invoice-container printable-area">
            {/* ================================================== */}
            {/* NON-PRINTABLE CONTROL HEADER */}
            {/* ================================================== */}

            <div className="invoice-controls no-print">
              <span>Receipt Preview</span>

              <div>
                <button
                  className="btn-primary print-trigger-btn"
                  onClick={handlePrintReceipt}
                  type="button"
                >
                  🖨️ Print / Save PDF
                </button>

                <button
                  className="close-btn modal-close-icon"
                  onClick={() => setDownloadInvoiceModal(null)}
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>

            {/* ================================================== */}
            {/* RECEIPT HEADER */}
            {/* ================================================== */}

            <div className="invoice-header">
              {/* BRAND */}

              <div className="brand-box">
                <div className="brand-logo">🛍️</div>

                <div>
                  <h2 className="brand-title">
                    Groicessary
                    <br />
                    <span>Sathi</span>
                  </h2>

                  <p className="brand-sub">Your Grocery, Our Responsibility</p>
                </div>
              </div>

              {/* INVOICE INFORMATION */}

              <div className="invoice-meta-box">
                <h1 className="invoice-title-badge">INVOICE / RECEIPT</h1>

                <p className="thankyou-tag">Thank you for shopping with us!</p>

                <table className="meta-table">
                  <tbody>
                    {/* INVOICE DATE */}

                    <tr>
                      <td>Invoice Date</td>

                      <td>:</td>

                      <td>
                        {downloadInvoiceModal.createdAt
                          ? new Date(
                              downloadInvoiceModal.createdAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>

                    {/* INVOICE TIME */}

                    <tr>
                      <td>Invoice Time</td>

                      <td>:</td>

                      <td>
                        {downloadInvoiceModal.createdAt
                          ? new Date(
                              downloadInvoiceModal.createdAt,
                            ).toLocaleTimeString()
                          : "N/A"}
                      </td>
                    </tr>

                    {/* RECEIPT NUMBER */}

                    <tr>
                      <td>Receipt No.</td>

                      <td>:</td>

                      <td>{downloadInvoiceModal.receiptNo || "N/A"}</td>
                    </tr>

                    {/* PAYMENT / ORDER STATUS */}

                    <tr>
                      <td>Payment Status</td>

                      <td>:</td>

                      <td>
                        <span className="badge-green-pill">
                          {downloadInvoiceModal.status || "Received"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CONFIRMED SEAL */}

              <div className="confirmed-seal">
                <span>ORDER CONFIRMED</span>

                <span className="check-mark">✓</span>
              </div>
            </div>

            {/* ================================================== */}
            {/* ORDER ID BANNER */}
            {/* ================================================== */}

            <div className="order-id-banner">
              <div className="order-id-icon">📄</div>

              <div>
                <small>ORDER ID</small>

                <h3>
                  {downloadInvoiceModal.orderId || downloadInvoiceModal.id}
                </h3>
              </div>

              <p className="banner-msg">
                Your grocery list has been received successfully. Our team will
                review and contact you shortly.
              </p>

              <div className="handwritten-thankyou">Thank You! ♥</div>
            </div>

            {/* ================================================== */}
            {/* INVOICE BODY */}
            {/* ================================================== */}

            <div className="invoice-body-grid">
              {/* ================================================= */}
              {/* LEFT COLUMN */}
              {/* ================================================= */}

              <div className="invoice-left-col">
                {/* =============================================== */}
                {/* CUSTOMER DETAILS */}
                {/* =============================================== */}

                <div className="info-block">
                  <h4>👤 CUSTOMER DETAILS</h4>

                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>Name</td>

                        <td>:</td>

                        <td>
                          <strong>{downloadInvoiceModal.user || "N/A"}</strong>
                        </td>
                      </tr>

                      <tr>
                        <td>Phone</td>

                        <td>:</td>

                        <td>{downloadInvoiceModal.phone || "N/A"}</td>
                      </tr>

                      <tr>
                        <td>Email</td>

                        <td>:</td>

                        <td>
                          {downloadInvoiceModal.email || "customer@example.com"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* =============================================== */}
                {/* DELIVERY ADDRESS */}
                {/* =============================================== */}

                <div className="info-block">
                  <h4>📍 DELIVERY ADDRESS</h4>

                  <p className="address-text">
                    {downloadInvoiceModal.deliveryAddress ||
                      "Delivery address not available"}
                  </p>
                </div>

                {/* =============================================== */}
                {/* UPLOADED LIST */}
                {/* =============================================== */}

                <div className="info-block">
                  <h4>📋 UPLOADED LIST</h4>

                  <table className="details-table">
                    <tbody>
                      {/* LIST NAME */}

                      <tr>
                        <td>List Name</td>

                        <td>:</td>

                        <td>
                          <strong>{downloadInvoiceModal.name || "N/A"}</strong>
                        </td>
                      </tr>

                      {/* FILE NAME */}

                      <tr>
                        <td>File Name</td>

                        <td>:</td>

                        <td>{downloadInvoiceModal.file || "N/A"}</td>
                      </tr>

                      {/* FILE TYPE */}

                      <tr>
                        <td>File Type</td>

                        <td>:</td>

                        <td>
                          {downloadInvoiceModal.fileType
                            ? downloadInvoiceModal.fileType.toUpperCase()
                            : downloadInvoiceModal.file
                                  ?.toLowerCase()
                                  .endsWith(".pdf")
                              ? "PDF"
                              : "IMAGE"}
                        </td>
                      </tr>

                      {/* UPLOAD STATUS */}

                      <tr>
                        <td>Upload Status</td>

                        <td>:</td>

                        <td>
                          <span className="text-green font-bold">
                            ✓ Uploaded Successfully
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* VIEW FILE */}

                  {downloadInvoiceModal.fileUrl && (
                    <button
                      type="button"
                      className="btn-primary no-print"
                      onClick={() =>
                        handleOpenUploadedFile(downloadInvoiceModal)
                      }
                    >
                      View Uploaded File
                    </button>
                  )}
                </div>

                {/* =============================================== */}
                {/* ESTIMATED RESPONSE TIME */}
                {/* =============================================== */}

                <div className="response-time-card">
                  <span className="clock-icon">🕒</span>

                  <div>
                    <small>Estimated Response Time</small>

                    <div className="time-val">15 - 30 Minutes</div>
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* RIGHT COLUMN */}
              {/* ================================================= */}

              <div className="invoice-right-col">
                {/* =============================================== */}
                {/* PRICE TABLE */}
                {/* =============================================== */}

                <table className="price-breakdown-table">
                  <thead>
                    <tr>
                      <th>DESCRIPTION</th>

                      <th
                        style={{
                          textAlign: "right",
                        }}
                      >
                        AMOUNT (₹)
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* ITEMS TOTAL */}

                    <tr>
                      <td>Items Total (As per List)</td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        ₹{Number(downloadInvoiceModal.price || 0).toFixed(2)}
                      </td>
                    </tr>

                    {/* SERVICE CHARGE */}

                    <tr>
                      <td>Service Charge</td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        ₹
                        {Number(
                          downloadInvoiceModal.serviceCharge || 0,
                        ).toFixed(2)}
                      </td>
                    </tr>

                    {/* HANDLING */}

                    <tr>
                      <td>Handling & Packing</td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        ₹
                        {Number(
                          downloadInvoiceModal.handlingCharge || 0,
                        ).toFixed(2)}
                      </td>
                    </tr>

                    {/* DELIVERY */}

                    <tr>
                      <td>Delivery Charge</td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        ₹30.00
                      </td>
                    </tr>

                    {/* GST */}

                    <tr>
                      <td>
                        GST ({downloadInvoiceModal.gst || 0}
                        %)
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        ₹
                        {(
                          (Number(downloadInvoiceModal.price || 0) +
                            Number(downloadInvoiceModal.serviceCharge || 0) +
                            Number(downloadInvoiceModal.handlingCharge || 0)) *
                          (Number(downloadInvoiceModal.gst || 0) / 100)
                        ).toFixed(2)}
                      </td>
                    </tr>

                    {/* =========================================== */}
                    {/* TOTAL */}
                    {/* =========================================== */}

                    <tr className="total-row">
                      <td>TOTAL AMOUNT</td>

                      <td
                        style={{
                          textAlign: "right",
                          fontSize: 18,
                          color: "#00b074",
                        }}
                      >
                        ₹
                        {(
                          Number(downloadInvoiceModal.price || 0) +
                          Number(downloadInvoiceModal.serviceCharge || 0) +
                          Number(downloadInvoiceModal.handlingCharge || 0) +
                          30 +
                          (Number(downloadInvoiceModal.price || 0) +
                            Number(downloadInvoiceModal.serviceCharge || 0) +
                            Number(downloadInvoiceModal.handlingCharge || 0)) *
                            (Number(downloadInvoiceModal.gst || 0) / 100)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* =============================================== */}
                {/* AMOUNT RECEIVED */}
                {/* =============================================== */}

                <div className="amount-received-card">
                  <div className="wallet-icon">👛</div>

                  <div>
                    <small>Amount Received</small>

                    <h3>
                      ₹
                      {(
                        Number(downloadInvoiceModal.price || 0) +
                        Number(downloadInvoiceModal.serviceCharge || 0) +
                        Number(downloadInvoiceModal.handlingCharge || 0) +
                        30 +
                        (Number(downloadInvoiceModal.price || 0) +
                          Number(downloadInvoiceModal.serviceCharge || 0) +
                          Number(downloadInvoiceModal.handlingCharge || 0)) *
                          (Number(downloadInvoiceModal.gst || 0) / 100)
                      ).toFixed(2)}
                    </h3>
                  </div>
                </div>

                {/* =============================================== */}
                {/* TRUST NOTE */}
                {/* =============================================== */}

                <p className="trust-note">
                  Thank you for trusting Groicessary Sathi.
                  <br />
                  We look forward to serving you!
                </p>
              </div>
            </div>

            {/* ================================================== */}
            {/* ORDER PROGRESS */}
            {/* ================================================== */}

            {/* ====================================================== */}
            {/* ORDER PROGRESS */}
            {/* ====================================================== */}

            <div className="order-progress-section">
              <h4 className="order-progress-title">ORDER PROGRESS</h4>

              <div className="order-progress">
                {/* =============================================== */}
                {/* RECEIVED */}
                {/* =============================================== */}

                <div
                  className={`progress-step ${
                    downloadInvoiceModal.status === "Received"
                      ? "active"
                      : downloadInvoiceModal.status === "Cancelled"
                        ? "pending"
                        : "completed"
                  }`}
                >
                  <div className="progress-icon">📋</div>

                  <strong>Received</strong>

                  <small>{getStatusDateTime("Received")}</small>
                </div>

                <div className="progress-arrow">➜</div>

                {/* =============================================== */}
                {/* REVIEWING LIST */}
                {/* =============================================== */}

                <div
                  className={`progress-step ${
                    downloadInvoiceModal.status === "Reviewing List"
                      ? "active"
                      : ["Packing", "Out for Delivery", "Delivered"].includes(
                            downloadInvoiceModal.status,
                          )
                        ? "completed"
                        : "pending"
                  }`}
                >
                  <div className="progress-icon">🔍</div>

                  <strong>Reviewing List</strong>

                  <small>{getStatusDateTime("Reviewing List")}</small>
                </div>

                <div className="progress-arrow">➜</div>

                {/* =============================================== */}
                {/* PACKING */}
                {/* =============================================== */}

                <div
                  className={`progress-step ${
                    downloadInvoiceModal.status === "Packing"
                      ? "active"
                      : ["Out for Delivery", "Delivered"].includes(
                            downloadInvoiceModal.status,
                          )
                        ? "completed"
                        : "pending"
                  }`}
                >
                  <div className="progress-icon">📦</div>

                  <strong>Packing</strong>

                  <small>{getStatusDateTime("Packing")}</small>
                </div>

                <div className="progress-arrow">➜</div>

                {/* =============================================== */}
                {/* OUT FOR DELIVERY */}
                {/* =============================================== */}

                <div
                  className={`progress-step ${
                    downloadInvoiceModal.status === "Out for Delivery"
                      ? "active"
                      : downloadInvoiceModal.status === "Delivered"
                        ? "completed"
                        : "pending"
                  }`}
                >
                  <div className="progress-icon">🛵</div>

                  <strong>Out for Delivery</strong>

                  <small>{getStatusDateTime("Out for Delivery")}</small>
                </div>

                <div className="progress-arrow">➜</div>

                {/* =============================================== */}
                {/* DELIVERED */}
                {/* =============================================== */}

                <div
                  className={`progress-step ${
                    downloadInvoiceModal.status === "Delivered"
                      ? "completed"
                      : "pending"
                  }`}
                >
                  <div className="progress-icon">🏠</div>

                  <strong>Delivered</strong>

                  <small>{getStatusDateTime("Delivered")}</small>
                </div>
              </div>
            </div>

            {/* ================================================== */}
            {/* RECEIPT FOOTER */}
            {/* ================================================== */}

            <div className="invoice-footer-bar">
              {/* SUPPORT */}

              <div className="footer-support-card">
                <h5>Need Help?</h5>

                <p>📞 +91 98765 43210</p>

                <p>✉️ support@groicessarysathi.com</p>

                <p>🌐 www.groicessarysathi.com</p>
              </div>

              {/* GRATITUDE */}

              <div className="footer-gratitude">
                <h3>Thank You! ♥</h3>

                <p>We appreciate your trust in Groicessary Sathi.</p>

                <div className="stars">★★★★★</div>
              </div>

              {/* QR CODE */}

              <div className="footer-qr-card">
                <small>Scan to Track Your Order</small>

                <div className="qr-code-placeholder">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=GroicessarySathiuTrackOrder"
                    alt="QR Code"
                  />
                </div>
              </div>
            </div>

            {/* ================================================== */}
            {/* GREEN BOTTOM STRIP */}
            {/* ================================================== */}

            <div className="green-bottom-strip">
              <span>🔒 100% Secure & Private</span>

              <span>🌱 Fresh | Safe | On Time</span>

              <span>Follow Us On: 📘 📷 💬</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUploads;

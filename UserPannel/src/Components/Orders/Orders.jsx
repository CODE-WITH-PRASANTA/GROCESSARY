import React, { useState, useMemo, useRef, useEffect } from "react";
import API, { BASE_URL } from "../../api/axios"; // 👈 import BASE_URL
import "./Orders.css";

const ITEMS_PER_PAGE = 6;

// ======================================================
// HELPERS
// ======================================================

const formatDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatTime = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

// 👇 use BASE_URL from axios config
const getProductImage = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image?.url || image?.path || image?.secure_url || image?.src || "";
  }

  if (!image) return "";

  const str = String(image).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) return str;

  return `${BASE_URL}${str.startsWith("/") ? str : `/${str}`}`;
};

const mapBackendOrder = (order) => {
  // 1:1 mapping — show the real status, no collapsing
  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };

  const uiStatus = statusMap[order.orderStatus] || "Pending";

  return {
    id: order.orderNumber || order._id,
    _id: order._id,
    items: (order.items || []).map((item) => ({
      name: item.productName || "Product",
      img: getProductImage(item.image),
      price: item.price,
      quantity: item.quantity,
    })),
    date: formatDate(order.createdAt),
    time: formatTime(order.createdAt),
    amount: Number(order.totalAmount || 0).toFixed(2),
    payableAmount: Number(order.payableAmount || 0).toFixed(2),
    walletUsed: order.walletUsed || 0,
    pointsUsed: order.pointsUsed || 0,
    pointsValue: order.pointsValue || 0,
    paymentMethod: (order.paymentMethod || "razorpay").toUpperCase(),
    paymentStatus:
      order.paymentStatus === "paid"
        ? "Paid"
        : order.paymentStatus === "failed"
          ? "Failed"
          : order.paymentStatus === "refunded"
            ? "Refunded"
            : "Pending",
    status: uiStatus,
    orderStatus: order.orderStatus,
    statusDate: formatDate(order.updatedAt || order.createdAt),
    deliveryAddress: order.deliveryAddress || null,
    statusHistory: order.statusHistory || [],
  };
};

// ======================================================
// COMPONENT
// ======================================================

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 👈 new
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const menuRef = useRef(null);

  // ======================================================
  // FETCH ORDERS
  // ======================================================

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your orders.");
        setOrders([]);
        return;
      }

      const { data } = await API.get("/orders/my");

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders.map(mapBackendOrder));
      } else {
        setError(data.message || "Failed to load orders.");
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);

      // 👇 handle 401 like OrderHistory
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please login again.");
      } else {
        setError(err.response?.data?.message || "Failed to load orders.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ======================================================
  // CLICK OUTSIDE
  // ======================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======================================================
  // COUNTS
  // ======================================================

  const countBy = (label) => orders.filter((o) => o.status === label).length;

  const totalCount = orders.length;
  const pendingCount = countBy("Pending");
  const confirmedCount = countBy("Confirmed");
  const processingCount = countBy("Processing");
  const shippedCount = countBy("Shipped");
  const ofdCount = countBy("Out for Delivery");
  const deliveredCount = countBy("Delivered");
  const cancelledCount = countBy("Cancelled");
  const refundedCount = countBy("Refunded");

  // ======================================================
  // FILTER
  // ======================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (pageNum) => setCurrentPage(pageNum);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ======================================================
  // CANCEL ORDER
  // ======================================================

  const handleDelete = async (order) => {
    if (!order?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.id}?`,
    );
    if (!confirmed) return;

    try {
      setUpdatingId(order._id);

      await API.post(`/orders/${order._id}/abandon`);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                status: "Cancelled",
                orderStatus: "cancelled",
                paymentStatus: "Failed",
                statusDate: formatDate(new Date()),
              }
            : o,
        ),
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error("Cancel order error:", err);
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // STATUS CHANGE (kept for admin use)
  // ======================================================

  const handleStatusChange = async (order, newStatus) => {
    if (!order?._id) return;

    const backendStatusMap = {
      Delivered: "delivered",
      Processing: "processing",
      Cancelled: "cancelled",
    };

    const backendStatus = backendStatusMap[newStatus];
    if (!backendStatus) return;

    try {
      setUpdatingId(order._id);

      await API.put(`/orders/${order._id}/status`, {
        status: backendStatus,
        note: `Status changed to ${newStatus}`,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                status: newStatus,
                orderStatus: backendStatus,
                statusDate: formatDate(new Date()),
              }
            : o,
        ),
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error("Update status error:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================================================
  // LOADING / ERROR
  // ======================================================

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-loading">Loading your orders…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-error">
          <p>{error}</p>
          <button onClick={() => fetchOrders(false)}>Try Again</button>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="orders-container">
      {/* Top Summary Cards */}
      <div className="orders-cards-grid">
        <div
          className={`orders-card ${
            statusFilter === "All" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("All");
            setCurrentPage(1);
          }}
        >
          <div className="orders-card-icon icon-green">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Total Orders</p>
            <h3 className="orders-card-value">{totalCount}</h3>
            <span className="orders-card-link text-green">
              View all orders &rarr;
            </span>
          </div>
        </div>

        <div
          className={`orders-card ${
            statusFilter === "Delivered" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("Delivered");
            setCurrentPage(1);
          }}
        >
          <div className="orders-card-icon icon-emerald">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Delivered Orders</p>
            <h3 className="orders-card-value">{deliveredCount}</h3>
            <span className="orders-card-link text-emerald">
              View delivered &rarr;
            </span>
          </div>
        </div>

        <div
          className={`orders-card ${
            statusFilter === "Processing" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("Processing");
            setCurrentPage(1);
          }}
        >
          <div className="orders-card-icon icon-orange">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Processing Orders</p>
            <h3 className="orders-card-value">{processingCount}</h3>
            <span className="orders-card-link text-orange">
              View processing &rarr;
            </span>
          </div>
        </div>

        <div
          className={`orders-card ${
            statusFilter === "Cancelled" ? "active-card" : ""
          }`}
          onClick={() => {
            setStatusFilter("Cancelled");
            setCurrentPage(1);
          }}
        >
          <div className="orders-card-icon icon-purple">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </div>
          <div className="orders-card-info">
            <p className="orders-card-title">Cancelled Orders</p>
            <h3 className="orders-card-value">{cancelledCount}</h3>
            <span className="orders-card-link text-purple">
              View cancelled &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="orders-table-wrapper">
        <div className="orders-header">
          <h2 className="orders-title">My Orders</h2>

          <div className="orders-controls">
            <div className="orders-search-box">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <svg
                className="orders-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div className="orders-filter-wrapper">
              <button
                className="orders-filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter {statusFilter !== "All" ? `(${statusFilter})` : ""}
              </button>

              {showFilterDropdown && (
                <div className="orders-filter-menu">
                  {[
                    "All",
                    "Pending",
                    "Confirmed",
                    "Processing",
                    "Shipped",
                    "Out for Delivery",
                    "Delivered",
                    "Cancelled",
                    "Refunded",
                  ].map((status) => (
                    <button
                      key={status}
                      className={`orders-filter-item ${statusFilter === status ? "active" : ""}`}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                        setCurrentPage(1);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 👇 Refresh disabled while loading */}
            <button
              className="orders-add-btn"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="orders-id">{order.id}</td>

                    <td>
                      <div className="orders-items-cell">
                        <div className="orders-thumbs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="orders-thumb-wrapper">
                              {item.img ? (
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  title={item.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : null}
                            </div>
                          ))}
                        </div>
                        <div className="orders-items-info">
                          <p className="orders-item-names">
                            {order.items.map((i) => i.name).join(", ")}
                          </p>
                          <span className="orders-item-count">
                            {order.items.length}{" "}
                            {order.items.length > 1 ? "items" : "item"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="orders-date-cell">
                        <div>{order.date}</div>
                        <div className="orders-subtext">{order.time}</div>
                      </div>
                    </td>

                    <td className="orders-amount">₹{order.amount}</td>

                    <td>
                      <div className="orders-payment-cell">
                        <div>{order.paymentMethod}</div>
                        <div className="orders-subtext">
                          {order.paymentStatus}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div
                        className={`orders-status-badge badge-${order.orderStatus}`}
                      >
                        {order.status}
                        <span className="orders-status-date">
                          {order.statusDate}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="orders-actions-cell">
                        {order.orderStatus !== "cancelled" &&
                          order.orderStatus !== "delivered" && (
                            <button
                              className="orders-action-btn delete-btn"
                              title="Cancel Order"
                              disabled={updatingId === order._id}
                              onClick={() => handleDelete(order)}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}

                        <button
                          className="orders-view-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="orders-empty-state">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="orders-footer">
          <div className="orders-footer-text">
            Showing {filteredOrders.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </div>

          <div className="orders-pagination">
            <button
              className="orders-page-btn arrow-btn"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              title="Previous Page"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  className={`orders-page-btn ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  onClick={() => handlePageClick(pageNum)}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              className="orders-page-btn arrow-btn"
              disabled={
                currentPage === totalPages || filteredOrders.length === 0
              }
              onClick={handleNextPage}
              title="Next Page"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedOrder && (
        <div
          className="orders-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="orders-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="orders-modal-header">
              <h3>Order Summary ({selectedOrder.id})</h3>
              <button
                className="orders-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className="orders-modal-body">
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Order Date:</strong> {selectedOrder.date} (
                {selectedOrder.time})
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{selectedOrder.amount}
              </p>

              {Number(selectedOrder.walletUsed) > 0 && (
                <p>
                  <strong>Wallet Used:</strong> ₹
                  {Number(selectedOrder.walletUsed).toFixed(2)}
                </p>
              )}

              {Number(selectedOrder.pointsUsed) > 0 && (
                <p>
                  <strong>Points Used:</strong> {selectedOrder.pointsUsed} pts
                  (₹{Number(selectedOrder.pointsValue).toFixed(2)})
                </p>
              )}

              <p>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod} -{" "}
                {selectedOrder.paymentStatus}
              </p>

              {selectedOrder.deliveryAddress && (
                <>
                  <h4 className="orders-modal-subtitle">Delivery Address:</h4>
                  <p className="orders-modal-address">
                    <strong>{selectedOrder.deliveryAddress.name}</strong>
                    <br />
                    {selectedOrder.deliveryAddress.address}
                    {selectedOrder.deliveryAddress.landmark
                      ? `, ${selectedOrder.deliveryAddress.landmark}`
                      : ""}
                    <br />
                    {selectedOrder.deliveryAddress.city},{" "}
                    {selectedOrder.deliveryAddress.state} -{" "}
                    {selectedOrder.deliveryAddress.pincode}
                    <br />
                    📞 {selectedOrder.deliveryAddress.mobile}
                  </p>
                </>
              )}

              <h4 className="orders-modal-subtitle">Purchased Items:</h4>
              <div className="orders-modal-items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="orders-modal-item">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="orders-modal-img"
                      />
                    ) : null}
                    <div className="orders-modal-item-info">
                      <span className="orders-modal-item-name">
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="orders-modal-item-qty">
                          Qty: {item.quantity}
                          {item.price
                            ? ` × ₹${Number(item.price).toFixed(2)}`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

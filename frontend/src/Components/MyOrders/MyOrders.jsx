import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaShoppingBag,
  FaTimes,
  FaBox,
  FaShieldAlt,
  FaPaperPlane,
  FaPhoneAlt,
  FaCopy,
  FaCheckCircle,
  FaSpinner,
  FaTruck,
  FaHome,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";

import "./MyOrders.css";

import API from "../../api/axios";

const MyOrders = ({ onClose }) => {
  // ========================================
  // STATES
  // ========================================

  const [orderId, setOrderId] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  // ========================================
  // ORDER STATUS
  // ========================================

  const statusSteps = [
    "Received",
    "Reviewing List",
    "Packing",
    "Out for Delivery",
    "Delivered",
  ];

  // ========================================
  // CURRENT STATUS INDEX
  // ========================================

  const getCurrentStatusIndex = () => {
    if (!order) {
      return -1;
    }

    return statusSteps.indexOf(order.status);
  };

  // ========================================
  // GET STEP STATE
  // completed / active / pending
  // ========================================

  const getStepState = (step) => {
    if (!order) {
      return "pending";
    }

    if (order.status === "Cancelled") {
      return "pending";
    }

    const currentIndex = getCurrentStatusIndex();
    const stepIndex = statusSteps.indexOf(step);

    if (stepIndex < currentIndex) {
      return "completed";
    }

    if (stepIndex === currentIndex) {
      if (step === "Delivered") {
        return "completed";
      }

      return "active";
    }

    return "pending";
  };

  // ========================================
  // CHECK COMPLETED
  // ========================================

  const isStepCompleted = (step) => {
    if (!order) {
      return false;
    }

    if (order.status === "Cancelled") {
      return false;
    }

    const currentIndex = getCurrentStatusIndex();
    const stepIndex = statusSteps.indexOf(step);

    return stepIndex < currentIndex;
  };

  // ========================================
  // CHECK ACTIVE
  // ========================================

  const isStepActive = (step) => {
    if (!order) {
      return false;
    }

    return order.status === step;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========================================
  // GET STATUS DATE/TIME
  // ========================================

  const getStatusDate = (status) => {
    if (!order) {
      return null;
    }

    // ----------------------------------------
    // First try statusHistory from backend
    // ----------------------------------------

    if (
      Array.isArray(order.statusHistory) &&
      order.statusHistory.length > 0
    ) {
      const historyItem = order.statusHistory.find(
        (item) => item.status === status
      );

      if (historyItem?.date) {
        return historyItem.date;
      }

      // Support statusHistory using changedAt
      if (historyItem?.changedAt) {
        return historyItem.changedAt;
      }

      // Support statusHistory using createdAt
      if (historyItem?.createdAt) {
        return historyItem.createdAt;
      }
    }

    // ----------------------------------------
    // Received fallback
    // ----------------------------------------

    if (status === "Received") {
      return order.createdAt || null;
    }

    // ----------------------------------------
    // Delivered fallback
    // ----------------------------------------

    if (
      status === "Delivered" &&
      order.status === "Delivered"
    ) {
      return order.updatedAt || null;
    }

    return null;
  };

  // ========================================
  // STATUS TIME OR PENDING
  // ========================================

  const getStatusTimeText = (status) => {
    const date = getStatusDate(status);

    if (date) {
      return formatDate(date);
    }

    if (isStepActive(status)) {
      return "In Progress";
    }

    if (isStepCompleted(status)) {
      return "Completed";
    }

    return "Pending";
  };

  // ========================================
  // TRACK ORDER
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedOrderId = orderId.trim();

    if (!cleanedOrderId) {
      setError("Please enter your Order ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);
      setShowStatus(false);

      // ====================================
      // API
      // ====================================

      const response = await API.get(
        `/list-upload/track/${encodeURIComponent(
          cleanedOrderId
        )}`
      );

      console.log(
        "Track Order Response:",
        response.data
      );

      if (
        !response.data?.success ||
        !response.data?.data
      ) {
        throw new Error("Order data not found");
      }

      setOrder(response.data.data);
      setShowStatus(true);
    } catch (error) {
      console.error(
        "Track Order Error:",
        error
      );

      setOrder(null);
      setShowStatus(false);

      if (error.response?.status === 404) {
        setError(
          error.response?.data?.message ||
            "Order not found. Please check your Order ID."
        );
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to track your order. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // COPY ORDER ID
  // ========================================

  const handleCopy = async () => {
    const valueToCopy =
      order?.orderId || orderId;

    if (!valueToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        valueToCopy
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy Order ID Error:",
        error
      );
    }
  };

  // ========================================
  // BACK
  // ========================================

  const handleBack = () => {
    setShowStatus(false);
    setOrder(null);
    setError("");
  };

  // ========================================
  // ORDER ID CHANGE
  // ========================================

  const handleOrderIdChange = (e) => {
    setOrderId(e.target.value);

    if (error) {
      setError("");
    }
  };

  // ========================================
  // DELIVERY DATE/TIME
  // ========================================

  const getEstimatedDeliveryText = () => {
    if (!order) {
      return "";
    }

    if (order.status === "Delivered") {
      if (getStatusDate("Delivered")) {
        return `Delivered on ${formatDate(
          getStatusDate("Delivered")
        )}`;
      }

      return "Your order has been delivered";
    }

    if (order.status === "Cancelled") {
      return "Order Cancelled";
    }

    // New backend field
    if (order.deliveryDateTime) {
      return formatDate(
        order.deliveryDateTime
      );
    }

    // Support old field also
    if (order.estimatedDelivery) {
      return formatDate(
        order.estimatedDelivery
      );
    }

    return "Delivery time will be updated shortly";
  };

  // ========================================
  // CAN DOWNLOAD RECEIPT
  //
  // Show when status reaches:
  // Out for Delivery
  // Delivered
  // ========================================

  const canDownloadReceipt = () => {
    if (!order) {
      return false;
    }

    return [
      "Out for Delivery",
      "Delivered",
    ].includes(order.status);
  };

  // ========================================
  // GET RECEIPT URL
  // ========================================

  const getReceiptUrl = () => {
    if (!order) {
      return "";
    }

    // If you save separate receipt file
    if (order.receiptFile?.url) {
      return order.receiptFile.url;
    }

    // Currently use uploaded list file
    if (order.uploadedFile?.url) {
      return order.uploadedFile.url;
    }

    return "";
  };

  // ========================================
  // DOWNLOAD RECEIPT
  // ========================================

  const handleDownloadReceipt = () => {
    const fileUrl = getReceiptUrl();

    if (!fileUrl) {
      setError(
        "Receipt file is not available."
      );

      return;
    }

    const link =
      document.createElement("a");

    link.href = fileUrl;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.download =
      order?.receiptFile?.fileName ||
      order?.uploadedFile?.fileName ||
      `${order?.orderId || "order"}-receipt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="MyOrders-app-background">

      <AnimatePresence>

        <div className="MyOrders-modal-overlay">

          <motion.div
            className="MyOrders-container"
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >

            <AnimatePresence mode="wait">

              {!showStatus ? (

                // =====================================
                // TRACK FORM
                // =====================================

                <motion.div
                  key="track-form"
                  className="MyOrders-card MyOrders-track-card"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >

                  <button
                    className="MyOrders-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                    type="button"
                  >
                    <FaTimes />
                  </button>

                  <div className="MyOrders-header-icon">
                    <FaShoppingBag />
                  </div>

                  <h2 className="MyOrders-title">
                    Track My Order
                  </h2>

                  <p className="MyOrders-subtitle">
                    Enter your Order ID to check real-time status
                  </p>

                  <div className="MyOrders-illustration">

                    <div className="MyOrders-scooter-scene">

                      <div className="MyOrders-sun-spot" />

                      <div className="MyOrders-scooter-icon-wrap">
                        <FaTruck className="MyOrders-scooter-icon" />
                      </div>

                    </div>

                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="MyOrders-form"
                  >

                    <div className="MyOrders-input-group">

                      <label htmlFor="orderIdInput">
                        Order ID
                      </label>

                      <div className="MyOrders-input-wrapper">

                        <FaBox className="MyOrders-input-prefix-icon" />

                        <input
                          id="orderIdInput"
                          type="text"
                          placeholder="Enter your Order ID"
                          value={orderId}
                          onChange={
                            handleOrderIdChange
                          }
                          required
                          autoComplete="off"
                        />

                      </div>

                    </div>

                    <div className="MyOrders-security-note">

                      <FaShieldAlt className="MyOrders-security-icon" />

                      <span>
                        Your order details will be secured and private
                      </span>

                    </div>

                    {error && (
                      <div
                        style={{
                          color: "#dc2626",
                          fontSize: "13px",
                          textAlign: "center",
                          marginBottom: "12px",
                        }}
                      >
                        {error}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      className="MyOrders-submit-btn"
                      whileHover={{
                        scale: loading
                          ? 1
                          : 1.02,
                      }}
                      whileTap={{
                        scale: loading
                          ? 1
                          : 0.98,
                      }}
                      disabled={loading}
                    >

                      {loading ? (
                        <>
                          <FaSpinner className="spin-anim" />
                          <span>
                            Tracking...
                          </span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          <span>
                            Submit
                          </span>
                        </>
                      )}

                    </motion.button>

                  </form>

                  <div className="MyOrders-help-footer">

                    <span>
                      Need help? Call us on
                    </span>

                    <a
                      href="tel:+9111234567890"
                      className="MyOrders-phone-link"
                    >
                      <FaPhoneAlt />
                      +9111234567890
                    </a>

                  </div>

                </motion.div>

              ) : (

                // =====================================
                // ORDER STATUS
                // =====================================

                <motion.div
                  key="status-card"
                  className="MyOrders-card MyOrders-status-card"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >

                  <button
                    className="MyOrders-close-btn"
                    onClick={handleBack}
                    aria-label="Back to Form"
                    title="Back"
                    type="button"
                  >
                    <FaArrowLeft />
                  </button>

                  <div className="MyOrders-header-icon success-icon">
                    <FaCheckCircle />
                  </div>

                  <h2 className="MyOrders-title">
                    Order Status
                  </h2>

                  <p className="MyOrders-subtitle">
                    Here is the latest update for your order
                  </p>

                  {/* ================================= */}
                  {/* ORDER ID */}
                  {/* ================================= */}

                  <div className="MyOrders-id-display-box">

                    <div className="MyOrders-id-info">

                      <span className="MyOrders-id-label">
                        Order ID
                      </span>

                      <span className="MyOrders-id-value">
                        {order?.orderId ||
                          orderId}
                      </span>

                    </div>

                    <button
                      className="MyOrders-copy-btn"
                      onClick={handleCopy}
                      title="Copy Order ID"
                      type="button"
                    >

                      {copied ? (
                        <FaCheckCircle
                          style={{
                            color:
                              "#2e7d32",
                          }}
                        />
                      ) : (
                        <FaCopy />
                      )}

                    </button>

                  </div>

                  {/* ================================= */}
                  {/* CANCELLED */}
                  {/* ================================= */}

                  {order?.status ===
                    "Cancelled" && (

                    <div
                      style={{
                        padding: "12px",
                        marginBottom: "15px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      This order has been cancelled.
                    </div>

                  )}

                  {/* ================================= */}
                  {/* TIMELINE */}
                  {/* ================================= */}

                  <div className="MyOrders-timeline">

                    {/* RECEIVED */}

                    <div
                      className={`MyOrders-timeline-item ${getStepState(
                        "Received"
                      )}`}
                    >

                      <div className="MyOrders-timeline-icon-wrap">

                        {isStepActive(
                          "Received"
                        ) ? (
                          <FaSpinner className="spin-anim" />
                        ) : (
                          <FaCheckCircle />
                        )}

                      </div>

                      <div className="MyOrders-timeline-content">

                        <h4
                          className={
                            isStepActive(
                              "Received"
                            )
                              ? "active-text"
                              : ""
                          }
                        >
                          Order Placed
                        </h4>

                        <p>
                          Your order has been placed successfully
                        </p>

                        <span className="MyOrders-time">
                          {getStatusTimeText(
                            "Received"
                          )}
                        </span>

                      </div>

                    </div>

                    {/* REVIEWING LIST */}

                    <div
                      className={`MyOrders-timeline-item ${getStepState(
                        "Reviewing List"
                      )}`}
                    >

                      <div className="MyOrders-timeline-icon-wrap">

                        {isStepActive(
                          "Reviewing List"
                        ) ? (
                          <FaSpinner className="spin-anim" />
                        ) : isStepCompleted(
                            "Reviewing List"
                          ) ? (
                          <FaCheckCircle />
                        ) : (
                          <FaCheckCircle />
                        )}

                      </div>

                      <div className="MyOrders-timeline-content">

                        <h4
                          className={
                            isStepActive(
                              "Reviewing List"
                            )
                              ? "active-text"
                              : ""
                          }
                        >
                          Confirmed
                        </h4>

                        <p>
                          Your order has been confirmed
                        </p>

                        <span className="MyOrders-time">
                          {getStatusTimeText(
                            "Reviewing List"
                          )}
                        </span>

                      </div>

                    </div>

                    {/* PACKING */}

                    <div
                      className={`MyOrders-timeline-item ${getStepState(
                        "Packing"
                      )}`}
                    >

                      <div className="MyOrders-timeline-icon-wrap">

                        {isStepActive(
                          "Packing"
                        ) ? (
                          <FaSpinner className="spin-anim" />
                        ) : isStepCompleted(
                            "Packing"
                          ) ? (
                          <FaCheckCircle />
                        ) : (
                          <FaBox />
                        )}

                      </div>

                      <div className="MyOrders-timeline-content">

                        <h4
                          className={
                            isStepActive(
                              "Packing"
                            )
                              ? "active-text"
                              : ""
                          }
                        >
                          Processing
                        </h4>

                        <p>
                          We are preparing your items
                        </p>

                        <span className="MyOrders-time">
                          {getStatusTimeText(
                            "Packing"
                          )}
                        </span>

                      </div>

                    </div>

                    {/* OUT FOR DELIVERY */}

                    <div
                      className={`MyOrders-timeline-item ${getStepState(
                        "Out for Delivery"
                      )}`}
                    >

                      <div className="MyOrders-timeline-icon-wrap">

                        {isStepActive(
                          "Out for Delivery"
                        ) ? (
                          <FaSpinner className="spin-anim" />
                        ) : isStepCompleted(
                            "Out for Delivery"
                          ) ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTruck />
                        )}

                      </div>

                      <div className="MyOrders-timeline-content">

                        <h4
                          className={
                            isStepActive(
                              "Out for Delivery"
                            )
                              ? "active-text"
                              : ""
                          }
                        >
                          Out for Delivery
                        </h4>

                        <p>
                          Your order is on the way
                        </p>

                        <span className="MyOrders-time">
                          {getStatusTimeText(
                            "Out for Delivery"
                          )}
                        </span>

                      </div>

                    </div>

                    {/* DELIVERED */}

                    <div
                      className={`MyOrders-timeline-item ${getStepState(
                        "Delivered"
                      )} last`}
                    >

                      <div className="MyOrders-timeline-icon-wrap">

                        {order?.status ===
                        "Delivered" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaHome />
                        )}

                      </div>

                      <div className="MyOrders-timeline-content">

                        <h4
                          className={
                            order?.status ===
                            "Delivered"
                              ? "active-text"
                              : ""
                          }
                        >
                          Delivered
                        </h4>

                        <p>
                          Your order has been delivered
                        </p>

                        <span className="MyOrders-time">
                          {getStatusTimeText(
                            "Delivered"
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ================================= */}
                  {/* DELIVERY DATE/TIME */}
                  {/* ================================= */}

                  <div className="MyOrders-estimated-box">

                    <FaClock className="MyOrders-est-icon" />

                    <div className="MyOrders-est-text">

                      <span className="MyOrders-est-label">

                        {order?.status ===
                        "Delivered"
                          ? "Delivery Status"
                          : order?.status ===
                              "Cancelled"
                            ? "Order Status"
                            : "Estimated Delivery"}

                      </span>

                      <span className="MyOrders-est-value">
                        {getEstimatedDeliveryText()}
                      </span>

                    </div>

                  </div>

                  {/* ================================= */}
                  {/* DOWNLOAD RECEIPT */}
                  {/* SHOW AFTER OUT FOR DELIVERY */}
                  {/* ================================= */}

                  {canDownloadReceipt() &&
                    getReceiptUrl() && (

                    <motion.button
                      type="button"
                      className="MyOrders-submit-btn"
                      onClick={
                        handleDownloadReceipt
                      }
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      style={{
                        marginTop: "15px",
                      }}
                    >
                      <FaPaperPlane />

                      <span>
                        Download Receipt
                      </span>

                    </motion.button>

                  )}

                </motion.div>

              )}

            </AnimatePresence>

          </motion.div>

        </div>

      </AnimatePresence>

    </div>
  );
};

export default MyOrders;
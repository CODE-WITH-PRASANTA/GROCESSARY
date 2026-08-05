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

// ========================================
// AXIOS INSTANCE
// Change path only if your axios file
// is in a different location
// ========================================

import API from "../../api/axios";

const MyOrders = ({ onClose }) => {
  // ========================================
  // STATES
  // ========================================

  const [orderId, setOrderId] = useState("");

  const [showStatus, setShowStatus] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [order, setOrder] =
    useState(null);

  // ========================================
  // BACKEND ORDER STATUS
  // ========================================

  const statusSteps = [
    "Received",
    "Reviewing List",
    "Packing",
    "Out for Delivery",
    "Delivered",
  ];

  // ========================================
  // GET CURRENT STATUS INDEX
  // ========================================

  const getCurrentStatusIndex = () => {
    if (!order) {
      return -1;
    }

    return statusSteps.indexOf(
      order.status
    );
  };

  // ========================================
  // GET TIMELINE STEP STATE
  //
  // completed
  // active
  // pending
  // ========================================

  const getStepState = (step) => {
    if (!order) {
      return "pending";
    }

    // If order is cancelled
    if (order.status === "Cancelled") {
      return "pending";
    }

    const currentIndex =
      getCurrentStatusIndex();

    const stepIndex =
      statusSteps.indexOf(step);

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
  // CHECK STEP COMPLETED
  // ========================================

  const isStepCompleted = (step) => {
    if (!order) {
      return false;
    }

    if (order.status === "Cancelled") {
      return false;
    }

    const currentIndex =
      getCurrentStatusIndex();

    const stepIndex =
      statusSteps.indexOf(step);

    return stepIndex < currentIndex;
  };

  // ========================================
  // CHECK ACTIVE STEP
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

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ========================================
  // TRACK ORDER
  // GET:
  // /api/list-upload/track/:orderId
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedOrderId =
      orderId.trim();

    if (!cleanedOrderId) {
      setError(
        "Please enter your Order ID"
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      setOrder(null);

      setShowStatus(false);

      // ====================================
      // API CALL
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

      // ====================================
      // CHECK RESPONSE
      // ====================================

      if (
        !response.data?.success ||
        !response.data?.data
      ) {
        throw new Error(
          "Order data not found"
        );
      }

      // ====================================
      // SAVE ORDER
      // ====================================

      setOrder(
        response.data.data
      );

      setShowStatus(true);

    } catch (error) {
      console.error(
        "Track Order Error:",
        error
      );

      setOrder(null);

      setShowStatus(false);

      if (
        error.response?.status === 404
      ) {
        setError(
          error.response?.data
            ?.message ||
            "Order not found. Please check your Order ID."
        );
      } else {
        setError(
          error.response?.data
            ?.message ||
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
      order?.orderId ||
      orderId;

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
  // BACK TO SEARCH
  // ========================================

  const handleBack = () => {
    setShowStatus(false);

    setOrder(null);

    setError("");
  };

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleOrderIdChange = (
    e
  ) => {
    setOrderId(
      e.target.value
    );

    if (error) {
      setError("");
    }
  };

  // ========================================
  // ESTIMATED DELIVERY
  //
  // Until you save estimatedDelivery
  // in MongoDB, this shows status-based text.
  // ========================================

  const getEstimatedDeliveryText =
    () => {
      if (!order) {
        return "";
      }

      if (
        order.status === "Delivered"
      ) {
        return "Your order has been delivered";
      }

      if (
        order.status === "Cancelled"
      ) {
        return "Order Cancelled";
      }

      if (
        order.estimatedDelivery
      ) {
        return formatDate(
          order.estimatedDelivery
        );
      }

      return "Delivery time will be updated shortly";
    };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="MyOrders-app-background">

      {/* Pop-up Modal Component for Tracking / Status */}

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

                /* ====================================== */
                /* TRACK MY ORDER FORM CARD */
                /* ====================================== */

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

                  {/* ========================== */}
                  {/* HEADER ICON */}
                  {/* ========================== */}

                  <div className="MyOrders-header-icon">
                    <FaShoppingBag />
                  </div>

                  <h2 className="MyOrders-title">
                    Track My Order
                  </h2>

                  <p className="MyOrders-subtitle">
                    Enter your Order ID to check real-time status
                  </p>

                  {/* ========================== */}
                  {/* ILLUSTRATION */}
                  {/* ========================== */}

                  <div className="MyOrders-illustration">

                    <div className="MyOrders-scooter-scene">

                      <div className="MyOrders-sun-spot" />

                      <div className="MyOrders-scooter-icon-wrap">

                        <FaTruck className="MyOrders-scooter-icon" />

                      </div>

                    </div>

                  </div>

                  {/* ========================== */}
                  {/* FORM */}
                  {/* ========================== */}

                  <form
                    onSubmit={
                      handleSubmit
                    }
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
                          value={
                            orderId
                          }
                          onChange={
                            handleOrderIdChange
                          }
                          required
                          autoComplete="off"
                        />

                      </div>

                    </div>

                    {/* ========================== */}
                    {/* SECURITY NOTE */}
                    {/* ========================== */}

                    <div className="MyOrders-security-note">

                      <FaShieldAlt className="MyOrders-security-icon" />

                      <span>
                        Your order details will be secured and private
                      </span>

                    </div>

                    {/* ========================== */}
                    {/* ERROR */}
                    {/* ========================== */}

                    {error && (
                      <div
                        style={{
                          color:
                            "#dc2626",
                          fontSize:
                            "13px",
                          textAlign:
                            "center",
                          marginBottom:
                            "12px",
                        }}
                      >
                        {error}
                      </div>
                    )}

                    {/* ========================== */}
                    {/* SUBMIT */}
                    {/* ========================== */}

                    <motion.button
                      type="submit"
                      className="MyOrders-submit-btn"
                      whileHover={{
                        scale:
                          loading
                            ? 1
                            : 1.02,
                      }}
                      whileTap={{
                        scale:
                          loading
                            ? 1
                            : 0.98,
                      }}
                      disabled={
                        loading
                      }
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

                  {/* ========================== */}
                  {/* HELP */}
                  {/* ========================== */}

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

                /* ====================================== */
                /* ORDER STATUS INLINE CARD */
                /* ====================================== */

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

                  {/* ========================== */}
                  {/* BACK */}
                  {/* ========================== */}

                  <button
                    className="MyOrders-close-btn"
                    onClick={
                      handleBack
                    }
                    aria-label="Back to Form"
                    title="Back"
                    type="button"
                  >
                    <FaArrowLeft />
                  </button>

                  {/* ========================== */}
                  {/* SUCCESS ICON */}
                  {/* ========================== */}

                  <div className="MyOrders-header-icon success-icon">
                    <FaCheckCircle />
                  </div>

                  <h2 className="MyOrders-title">
                    Order Status
                  </h2>

                  <p className="MyOrders-subtitle">
                    Here is the latest update for your order
                  </p>

                  {/* ========================== */}
                  {/* ORDER ID */}
                  {/* ========================== */}

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
                      onClick={
                        handleCopy
                      }
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

                  {/* ========================== */}
                  {/* CANCELLED MESSAGE */}
                  {/* ========================== */}

                  {order?.status ===
                    "Cancelled" && (
                    <div
                      style={{
                        padding:
                          "12px",
                        marginBottom:
                          "15px",
                        borderRadius:
                          "8px",
                        background:
                          "#fee2e2",
                        color:
                          "#dc2626",
                        textAlign:
                          "center",
                        fontSize:
                          "13px",
                        fontWeight:
                          "600",
                      }}
                    >
                      This order has been cancelled.
                    </div>
                  )}

                  {/* ================================= */}
                  {/* TIMELINE */}
                  {/* ================================= */}

                  <div className="MyOrders-timeline">

                    {/* ============================== */}
                    {/* RECEIVED */}
                    {/* ============================== */}

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

                        {order?.createdAt && (
                          <span className="MyOrders-time">
                            {formatDate(
                              order.createdAt
                            )}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ============================== */}
                    {/* REVIEWING LIST */}
                    {/* ============================== */}

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

                        {isStepActive(
                          "Reviewing List"
                        ) && (
                          <span className="MyOrders-time">
                            Reviewing your grocery list
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ============================== */}
                    {/* PACKING */}
                    {/* ============================== */}

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

                        {isStepActive(
                          "Packing"
                        ) && (
                          <span className="MyOrders-time">
                            Your grocery items are being packed
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ============================== */}
                    {/* OUT FOR DELIVERY */}
                    {/* ============================== */}

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

                        {isStepActive(
                          "Out for Delivery"
                        ) && (
                          <span className="MyOrders-time">
                            Delivery in progress
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ============================== */}
                    {/* DELIVERED */}
                    {/* ============================== */}

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

                        {order?.status ===
                          "Delivered" &&
                          order?.updatedAt && (
                            <span className="MyOrders-time">
                              {formatDate(
                                order.updatedAt
                              )}
                            </span>
                          )}

                      </div>

                    </div>

                  </div>

                  {/* ================================= */}
                  {/* ESTIMATED DELIVERY */}
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
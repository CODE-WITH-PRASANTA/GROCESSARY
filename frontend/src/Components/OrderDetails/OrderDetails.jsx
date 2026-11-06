import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  MessageCircle,
  Download,
  Copy,
  Check,
  AlertCircle,
  XCircle,
  Home,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import API, { BASE_URL } from "../../api/axios";
import { downloadInvoicePdf } from "../../Utils/generateInvoicePdf";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Helper: Resolve product image url
  const resolveImage = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
    if (typeof path === "object") {
      path = path?.url || path?.path || path?.secure_url || "";
    }
    const str = String(path).trim();
    if (!str) return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
    if (str.startsWith("http://") || str.startsWith("https://")) return str;
    return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
  };

  // Fetch Order by ID
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/orders/${id}`);
      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError(res.data?.message || "Order not found.");
      }
    } catch (err) {
      console.error("Fetch order error:", err);
      setError(
        err.response?.data?.message || "Could not load order details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchOrder();
  }, [fetchOrder]);

  // Copy Order ID
  const handleCopyOrderId = () => {
    const textToCopy = order?.orderNumber || id;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cancel Order Handler
  const handleCancelOrder = () => {
    if (!order) return;

    Swal.fire({
      title: "Cancel this Order?",
      text: "Are you sure you want to cancel this order? Any paid amount will be refunded to your account.",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Reason for cancellation (optional)",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "No, Keep Order",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setCancelling(true);
          const res = await API.post(`/orders/${order._id || id}/cancel`, {
            reason: result.value || "Customer requested cancellation",
          });
          if (res.data?.success) {
            Swal.fire({
              icon: "success",
              title: "Order Cancelled",
              text: res.data?.message || "Your order has been cancelled successfully.",
              confirmButtonColor: "#059669",
            });
            fetchOrder();
          } else {
            Swal.fire({
              icon: "error",
              title: "Cancellation Failed",
              text: res.data?.message || "Could not cancel order.",
              confirmButtonColor: "#059669",
            });
          }
        } catch (err) {
          console.error("Cancel order error:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Failed to cancel order.",
            confirmButtonColor: "#059669",
          });
        } finally {
          setCancelling(false);
        }
      }
    });
  };

  // Status Stepper: Shipped added, Processing removed
  const trackerSteps = [
    { key: "pending", label: "Order Placed", icon: ShoppingBag },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "pending":
        return 0;
      case "confirmed":
        return 1;
      case "shipped":
      case "processing":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 1;
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const s = String(status || "pending").toLowerCase();
    const config = {
      pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", icon: Clock },
      confirmed: { label: "Confirmed", bg: "#ecfdf5", color: "#065f46", icon: CheckCircle2 },
      shipped: { label: "Shipped", bg: "#eff6ff", color: "#1e40af", icon: Truck },
      processing: { label: "Shipped", bg: "#eff6ff", color: "#1e40af", icon: Truck },
      out_for_delivery: { label: "Out for Delivery", bg: "#e0e7ff", color: "#3730a3", icon: MapPin },
      delivered: { label: "Delivered", bg: "#d1fae5", color: "#065f46", icon: CheckCircle2 },
      cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b", icon: XCircle },
    };

    const cur = config[s] || config.confirmed;
    const IconComponent = cur.icon;

    return (
      <span
        className="order-status-pill-badge"
        style={{ backgroundColor: cur.bg, color: cur.color }}
      >
        <IconComponent size={14} />
        <span>{cur.label}</span>
      </span>
    );
  };

  // =======================================================
  // LOADING STATE
  // =======================================================
  if (loading) {
    return (
      <div className="order-details-wrapper">
        <div className="order-details-container">
          <div className="order-details-skeleton">
            <div className="skeleton-line skeleton-header"></div>
            <div className="skeleton-line skeleton-tracker"></div>
            <div className="skeleton-grid">
              <div className="skeleton-box"></div>
              <div className="skeleton-box"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // ERROR STATE
  // =======================================================
  if (error || !order) {
    return (
      <div className="order-details-wrapper">
        <div className="order-details-container">
          <div className="order-not-found-card">
            <AlertCircle size={48} className="not-found-icon" />
            <h2>Order Details Unavailable</h2>
            <p>{error || "The requested order could not be located."}</p>
            <button
              type="button"
              className="btn-back-to-orders"
              onClick={() => navigate("/profile?tab=orders")}
            >
              <ArrowLeft size={16} />
              <span>Back to My Orders</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const addr = order.deliveryAddress || {};
  const currentStatus = String(order.orderStatus || "confirmed").toLowerCase();
  const isCancelled = currentStatus === "cancelled";
  const isDelivered = currentStatus === "delivered";
  const currentStepIdx = getStepIndex(currentStatus);

  // Formatted date
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently placed";

  const isCancellable = ["pending", "confirmed"].includes(currentStatus);

  // Resolve user-friendly payment mode name
  const paymentModeLabel =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

  return (
    <div className="order-details-wrapper">
      <div className="order-details-container">
        {/* TOP BAR / BREADCRUMB */}
        <div className="order-top-nav-row no-print">
          <nav className="order-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/profile?tab=orders" className="breadcrumb-link">
              My Orders
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-cur">
              #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
            </span>
          </nav>

          <div className="order-top-actions">
            <button
              type="button"
              className="btn-back-link"
              onClick={() => navigate("/profile?tab=orders")}
            >
              <ArrowLeft size={16} />
              <span>Back to Orders</span>
            </button>

            {/* ONLY SHOW DOWNLOAD INVOICE WHEN ORDER IS DELIVERED */}
            {isDelivered && (
              <button
                type="button"
                className="btn-download-invoice"
                onClick={() => downloadInvoicePdf(order)}
                title="Download Tax Invoice (PDF)"
              >
                <Download size={16} />
                <span>Download Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* ORDER HEADER HERO CARD */}
        <div className="order-hero-card">
          <div className="order-hero-left">
            <div className="order-number-row">
              <h1 className="order-title">
                Order #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
              </h1>
              <button
                type="button"
                className="btn-copy-id"
                onClick={handleCopyOrderId}
                title="Copy Order Number"
              >
                {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="order-meta-info-row">
              <span className="order-meta-date">
                <Calendar size={14} />
                <span>Placed on: {orderDate}</span>
              </span>
              <span className="order-meta-dot">•</span>
              <span className="order-meta-payment">
                <CreditCard size={14} />
                <span>Payment: {paymentModeLabel}</span>
              </span>
            </div>
          </div>

          <div className="order-hero-right">
            <div className="order-status-block">
              <span className="status-label-caption">Order Status</span>
              {renderStatusBadge(order.orderStatus)}
            </div>
          </div>
        </div>

        {/* ORDER PROGRESS TRACKER (SHIPPED ADDED, PROCESSING REMOVED) */}
        {!isCancelled ? (
          <div className="order-tracker-card no-print">
            <h3 className="tracker-heading">Delivery Status</h3>
            <div className="tracker-steps-container">
              {trackerSteps.map((step, idx) => {
                const isCompleted =
                  idx < currentStepIdx || (idx === currentStepIdx && isDelivered);
                const isCurrent = idx === currentStepIdx && !isDelivered;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.key}
                    className={`tracker-step-item ${isCompleted ? "completed" : ""} ${
                      isCurrent ? "active" : ""
                    }`}
                  >
                    <div className="tracker-icon-box">
                      <StepIcon size={18} />
                    </div>
                    <span className="tracker-step-title">{step.label}</span>
                    {idx < trackerSteps.length - 1 && (
                      <div
                        className={`tracker-connecting-bar ${
                          idx < currentStepIdx ? "completed-bar" : ""
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="order-cancelled-banner">
            <XCircle size={24} className="cancelled-icon" />
            <div className="cancelled-text">
              <h4>Order Cancelled</h4>
              <p>
                This order was cancelled. If you already made a payment, the full refund
                will be credited back via your original payment mode or store wallet.
              </p>
            </div>
          </div>
        )}

                {/* LIVE TRACKING & COURIER / AGENT INFORMATION */}
        {order.shippingDetails && (order.shippingDetails.currentHub || order.shippingDetails.trackingId || order.shippingDetails.agentPhone) && (
          <div className="order-live-tracking-card no-print">
            <div className="live-tracking-header">
              <Truck size={18} className="tracking-truck-icon" />
              <h3>Live Shipment & Delivery Details</h3>
              <span className="live-pill">Live Tracking</span>
            </div>

            <div className="live-tracking-grid">
              {order.shippingDetails.courierName && (
                <div className="live-field">
                  <span className="label">Courier Service:</span>
                  <strong>{order.shippingDetails.courierName}</strong>
                </div>
              )}

              {order.shippingDetails.currentHub && (
                <div className="live-field">
                  <span className="label">Current Hub / Location:</span>
                  <strong>{order.shippingDetails.currentHub}</strong>
                </div>
              )}

              {order.shippingDetails.deliveryDate && (
                <div className="live-field">
                  <span className="label">Estimated Delivery Date:</span>
                  <strong className="text-emerald">
                    {new Date(order.shippingDetails.deliveryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              )}

              {order.shippingDetails.trackingId && (
                <div className="live-field">
                  <span className="label">Tracking Number / AWB:</span>
                  <span className="tracking-code">{order.shippingDetails.trackingId}</span>
                </div>
              )}

              {order.shippingDetails.agentPhone && (
                <div className="live-field">
                  <span className="label">Delivery Agent Phone:</span>
                  <a href={`tel:${order.shippingDetails.agentPhone}`} className="agent-link">
                    <Phone size={13} />
                    <span>{order.shippingDetails.agentPhone}</span>
                  </a>
                </div>
              )}

              {order.shippingDetails.agentName && (
                <div className="live-field">
                  <span className="label">Assigned Delivery Agent:</span>
                  <strong>{order.shippingDetails.agentName}</strong>
                </div>
              )}

              {order.shippingDetails.trackingUrl && (
                <div className="live-field full-row">
                  <span className="label">Live Courier Tracking:</span>
                  <a
                    href={order.shippingDetails.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-tracking-btn"
                  >
                    <span>Track on Courier Partner Site</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2-COLUMN MAIN CONTENT GRID */}
        <div className="order-main-grid">
          {/* ==============================================
              LEFT COLUMN: ITEMS & DELIVERY ADDRESS
          =============================================== */}
          <div className="order-grid-left">
            {/* ITEMS CARD */}
            <div className="order-section-card items-section-card">
              <div className="section-card-header">
                <h3>Ordered Items ({items.length})</h3>
                <span className="items-package-badge">
                  <Package size={14} />
                  <span>Standard Package</span>
                </span>
              </div>

              <div className="order-items-list-table">
                {items.map((item, idx) => {
                  const prod =
                    item.product && typeof item.product === "object"
                      ? item.product
                      : {};
                  const itemName =
                    item.productName || prod.productName || prod.name || "Grocery Item";
                  const itemImg = resolveImage(
                    item.image || (Array.isArray(prod.images) && prod.images[0]) || prod.image
                  );
                  const unitLabel = item.unit || prod.unit || "1 unit";
                  const price = Number(item.price || 0);
                  const qty = Number(item.quantity || 1);
                  const itemTotal = Number(item.itemTotal || price * qty);

                  return (
                    <div key={idx} className="order-item-detail-row">
                      <div className="item-img-col">
                        <img src={itemImg} alt={itemName} className="item-detail-img" />
                      </div>

                      <div className="item-info-col">
                        <h4 className="item-title">{itemName}</h4>
                        <span className="item-unit-tag">{unitLabel}</span>
                        <div className="item-unit-pricing">
                          <span className="item-rate">₹{price.toFixed(2)}</span>
                          <span className="item-multiplier">× {qty}</span>
                        </div>
                      </div>

                      <div className="item-total-col">
                        <span className="item-subtotal-price">₹{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DELIVERY ADDRESS CARD */}
            <div className="order-section-card delivery-section-card">
              <div className="section-card-header">
                <h3>Delivery Address</h3>
                <span className="address-type-pill">
                  {addr.addressType === "Work" ? <Briefcase size={12} /> : <Home size={12} />}
                  <span>{addr.addressType || "Home"}</span>
                </span>
              </div>

              <div className="address-details-body">
                <div className="address-recipient-row">
                  <strong className="recipient-name">{addr.name || "Customer"}</strong>
                  {addr.mobile && (
                    <span className="recipient-mobile">
                      <Phone size={13} />
                      <span>{addr.mobile}</span>
                    </span>
                  )}
                </div>

                <p className="full-address-text">
                  {addr.address || "Address details not available"}
                  {addr.landmark ? `, Near ${addr.landmark}` : ""}
                  {addr.city ? `, ${addr.city}` : ""}
                  {addr.state ? `, ${addr.state}` : ""}
                  {addr.pincode ? ` - ${addr.pincode}` : ""}
                </p>

                <div className="doorstep-guarantee-note">
                  <ShieldCheck size={16} />
                  <span>Assured safe & contactless doorstep delivery by Grocery Sathi</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================
              RIGHT COLUMN: PAYMENT & SUMMARY BREAKDOWN
          =============================================== */}
          <div className="order-grid-right">
            {/* PAYMENT INFORMATION CARD */}
            <div className="order-section-card payment-section-card">
              <div className="section-card-header">
                <h3>Payment Details</h3>
                <span className={`payment-status-tag ${order.paymentStatus || "paid"}`}>
                  {order.paymentStatus === "paid" ? "Paid Online" : "Payment Pending"}
                </span>
              </div>

              <div className="payment-details-body">
                <div className="payment-info-line">
                  <span className="label">Payment Mode:</span>
                  <span className="val-bold">
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery (COD)"
                      : "Online Payment (UPI, Cards, Net Banking)"}
                  </span>
                </div>

                {order.razorpayPaymentId && (
                  <div className="payment-info-line">
                    <span className="label">Transaction Ref ID:</span>
                    <span className="val-code">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* BILL SUMMARY BREAKDOWN */}
            <div className="order-section-card bill-section-card">
              <div className="section-card-header">
                <h3>Price Breakdown</h3>
              </div>

              <div className="bill-breakdown-body">
                <div className="bill-row">
                  <span className="bill-label">Items Subtotal:</span>
                  <span className="bill-val">₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>

                <div className="bill-row">
                  <span className="bill-label">Delivery Charges:</span>
                  <span className="bill-val free">
                    {Number(order.deliveryCharge || 0) === 0 ? "FREE" : `₹${Number(order.deliveryCharge).toFixed(2)}`}
                  </span>
                </div>

                {Number(order.walletUsed || 0) > 0 && (
                  <div className="bill-row discount">
                    <span className="bill-label">Wallet Balance Used:</span>
                    <span className="bill-val">-₹{Number(order.walletUsed).toFixed(2)}</span>
                  </div>
                )}

                {Number(order.pointsValue || 0) > 0 && (
                  <div className="bill-row discount">
                    <span className="bill-label">Reward Points Used:</span>
                    <span className="bill-val">-₹{Number(order.pointsValue).toFixed(2)}</span>
                  </div>
                )}

                <div className="bill-divider"></div>

                <div className="bill-row total-row">
                  <span className="bill-label-total">Total Amount:</span>
                  <span className="bill-val-total">
                    ₹{Number(order.payableAmount ?? order.totalAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER ACTIONS & SUPPORT */}
            <div className="order-section-card support-section-card no-print">
              {isCancellable && (
                <button
                  type="button"
                  className="btn-cancel-order"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  <XCircle size={16} />
                  <span>{cancelling ? "Cancelling..." : "Cancel Order"}</span>
                </button>
              )}

              <div className="order-support-box">
                <span className="support-caption">Need assistance with this order?</span>
                <div className="support-actions-row">
                  <a
                    href={`https://wa.me/919887868746?text=Hi%20Grocery%20Sathi,%20I%20need%20help%20with%20Order%20%23${order.orderNumber || id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-support-whatsapp"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>

                  <a href="tel:+919887868746" className="btn-support-call">
                    <Phone size={16} />
                    <span>Call Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

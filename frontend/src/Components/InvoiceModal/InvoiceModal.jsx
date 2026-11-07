import React, { useRef, useState } from "react";
import {
  FileText,
  User,
  CreditCard,
  Phone,
  Calendar,
  CheckCircle,
  RotateCcw,
  Download,
  X,
  Loader2,
} from "lucide-react";
import logoImg from "../../assets/Grocessary Sathi Png.png";
import { exportInvoiceToPdf } from "../../Utils/exportInvoiceToPdf";
import "./InvoiceModal.css";

const InvoiceModal = ({ order, isOpen, onClose }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !order) return null;

  // Format Date: DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString("en-GB");
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return new Date().toLocaleDateString("en-GB");
    }
  };

  const invoiceNo =
    order.invoiceNumber ||
    order.orderNumber ||
    (order._id ? `GS${String(order._id).slice(-10).toUpperCase()}` : "GSINVOICE");

  const customerName =
    order.deliveryAddress?.name ||
    order.customer?.name ||
    order.user?.name ||
    "Valued Customer";

  const customerPhone =
    order.deliveryAddress?.mobile ||
    order.customer?.mobile ||
    order.user?.mobile ||
    "9407057752";

  // Payment Method Clean Display
  const getPaymentDisplay = () => {
    const method = String(order.paymentMethod || "").toLowerCase();
    if (method.includes("cash") || method === "cod") return "Cash";
    if (method.includes("upi")) return "UPI";
    if (method.includes("razorpay") || method.includes("online")) return "Online (Paid)";
    if (method.includes("wallet")) return "Wallet";
    return order.paymentMethod || "Cash";
  };

  // Normalized Items List
  const rawItems = order.items || order.products || [];
  const items = rawItems.map((it, idx) => {
    const prod = it.product && typeof it.product === "object" ? it.product : {};
    const name = it.productName || prod.productName || prod.name || it.name || "Grocery Item";
    const unit = it.unit || prod.unit || "";
    const fullName = unit ? `${name} ${unit}` : name;
    const price = Number(it.price || 0);
    const qty = Number(it.quantity || it.qty || 1);
    const total = Number(it.itemTotal || it.total || price * qty);

    return {
      index: idx + 1,
      name: fullName,
      price,
      qty,
      total,
    };
  });

  // Calculate Subtotal & Discount
  const computedItemsSubtotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const subtotal = Number(order.subtotal ?? computedItemsSubtotal);
  const payableTotal = Number(
    order.payableAmount ?? order.totalAmount ?? order.total ?? computedItemsSubtotal
  );

  const discount =
    Number(order.discountAmount || 0) +
    Number(order.discount || 0) +
    Number(order.walletUsed || 0) +
    Number(order.pointsValue || 0);

  const amountReceived = Number(order.amountReceived ?? payableTotal);
  const changeAmount = Number(order.change ?? 0);

  // Trigger PDF Download without window.print()
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || downloading) return;
    try {
      setDownloading(true);
      await exportInvoiceToPdf(invoiceRef.current, `Invoice_${invoiceNo}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="invoice-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="invoice-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* TOP ACTION BAR - NO PRINT BUTTON */}
        <div className="invoice-modal-actions-bar">
          <button
            type="button"
            className="invoice-btn-download"
            onClick={handleDownloadPdf}
            disabled={downloading}
            title="Download Invoice as PDF"
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="invoice-spin-icon" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="invoice-btn-close"
            onClick={onClose}
            aria-label="Close invoice"
          >
            <X size={18} />
          </button>
        </div>

        {/* INVOICE CARD SHEET (Design matching user image) */}
        <div className="invoice-sheet-container" ref={invoiceRef} id="invoice-receipt-sheet">
          {/* HEADER SECTION */}
          <div className="invoice-header-row">
            {/* LEFT BRAND LOGO & TAGLINE */}
            <div className="invoice-brand-left">
              <div className="invoice-logo-wrapper">
                {logoImg ? (
                  <img
                    src={logoImg}
                    alt="Grocery Sathi"
                    className="invoice-fetched-logo"
                  />
                ) : (
                  <div className="invoice-cart-vector">
                    <svg width="42" height="42" viewBox="0 0 100 100" fill="none">
                      <path
                        d="M15 20 H28 L40 68 H80 L90 32 H32"
                        stroke="#0f2a4a"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="44" cy="80" r="7" fill="#0f2a4a" />
                      <circle cx="76" cy="80" r="7" fill="#0f2a4a" />
                      <path
                        d="M36 44 H86 M39 56 H82 M48 32 V68 M62 32 V68 M76 32 V68"
                        stroke="#0f2a4a"
                        strokeWidth="4"
                      />
                      <path
                        d="M78 30 C78 12 95 6 95 6 C95 6 98 22 86 28 C80 31 78 30 78 30 Z"
                        fill="#22c55e"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="invoice-brand-divider-line" />

              <div className="invoice-brand-text-col">
                <h1 className="invoice-brand-title">
                  <span className="brand-navy">Grocery</span>{" "}
                  <span className="brand-green">Sati</span>
                </h1>
                <p className="invoice-brand-tagline">Fresh Grocery, Better Living!</p>
              </div>
            </div>

            {/* RIGHT PHONE & DATE */}
            <div className="invoice-contact-right">
              <div className="invoice-contact-item">
                <Phone size={15} className="contact-icon text-navy" />
                <span className="contact-val font-bold">9407057752</span>
              </div>
              <div className="invoice-contact-item">
                <Calendar size={15} className="contact-icon text-navy" />
                <span className="contact-val">Date: {formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* GREEN HORIZONTAL DIVIDER */}
          <div className="invoice-green-divider" />

          {/* METADATA INFO: INVOICE ID, CUSTOMER, PAYMENT */}
          <div className="invoice-meta-info-list">
            <div className="invoice-meta-row">
              <FileText size={18} className="meta-icon" />
              <div className="meta-content">
                <span className="meta-label">Invoice:</span>{" "}
                <span className="meta-value font-mono">{invoiceNo}</span>
              </div>
            </div>

            <div className="invoice-meta-row">
              <User size={18} className="meta-icon" />
              <div className="meta-content">
                <span className="meta-label">Customer:</span>{" "}
                <span className="meta-value">{customerName}</span>
              </div>
            </div>

            <div className="invoice-meta-row">
              <CreditCard size={18} className="meta-icon" />
              <div className="meta-content">
                <span className="meta-label">Payment:</span>{" "}
                <span className="meta-value">{getPaymentDisplay()}</span>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="invoice-table-container">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th className="col-item">Item</th>
                  <th className="col-price">Price</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((it) => (
                    <tr key={it.index}>
                      <td className="col-num">{it.index}</td>
                      <td className="col-item">{it.name}</td>
                      <td className="col-price">₹{Math.round(it.price)}</td>
                      <td className="col-qty">{it.qty}</td>
                      <td className="col-total">₹{Math.round(it.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="no-items-cell">
                      Grocery Items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="invoice-summary-section">
            <div className="invoice-summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{Math.round(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="invoice-summary-row discount">
                <span className="summary-label">Discount</span>
                <span className="summary-value">₹{Math.round(discount)}</span>
              </div>
            )}
          </div>

          {/* TOTAL AMOUNT HIGHLIGHT BANNER */}
          <div className="invoice-total-highlight-banner">
            <div className="total-banner-left">Total Amount</div>
            <div className="total-banner-pill">₹{Math.round(payableTotal)}</div>
          </div>

          {/* AMOUNT RECEIVED & CHANGE */}
          <div className="invoice-received-section">
            <div className="received-row">
              <div className="received-left">
                <CheckCircle size={18} className="received-icon check-icon" />
                <span className="received-text">Amount Received</span>
              </div>
              <div className="received-right">₹{Math.round(amountReceived)}</div>
            </div>

            <div className="received-row">
              <div className="received-left">
                <RotateCcw size={18} className="received-icon change-icon" />
                <span className="received-text">Change</span>
              </div>
              <div className="received-right">₹{Math.round(changeAmount)}</div>
            </div>
          </div>

          {/* FOOTER MOTIF & THANK YOU SCRIPT */}
          <div className="invoice-footer-section">
            <div className="invoice-footer-script-row">
              <span className="footer-line" />
              <span className="footer-script-text">Thank you for shopping with us!</span>
              <span className="footer-line" />
            </div>

            {/* TWIN LEAVES MOTIF */}
            <div className="invoice-leaves-motif">
              <span className="motif-subline left" />
              <svg width="44" height="24" viewBox="0 0 60 26" fill="none">
                <path
                  d="M30 20 C24 10 14 6 6 8 C6 8 8 18 18 20 C24 21 28 20 30 20 Z"
                  fill="#16a34a"
                />
                <path
                  d="M30 20 C36 10 46 6 54 8 C54 8 52 18 42 20 C36 21 32 20 30 20 Z"
                  fill="#22c55e"
                />
                <path
                  d="M30 20 C22 13 6 8 6 8"
                  stroke="#15803d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M30 20 C38 13 54 8 54 8"
                  stroke="#15803d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="motif-subline right" />
            </div>
          </div>

          {/* BOTTOM DOUBLE SWEEPING WAVES (Navy & Vibrant Green) */}
          <div className="invoice-bottom-waves-wrapper">
            <svg
              className="invoice-bottom-waves"
              viewBox="0 0 700 80"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Deep Navy Upper Wave */}
              <path
                d="M 0,80 L 0,42 C 180,68 340,15 700,28 L 700,80 Z"
                fill="#0f2a4a"
              />
              {/* Vibrant Green Smooth Bottom Curve */}
              <path
                d="M 0,80 L 0,60 C 200,80 380,38 700,48 L 700,80 Z"
                fill="#16a34a"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;


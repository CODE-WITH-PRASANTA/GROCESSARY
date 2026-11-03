import { jsPDF } from "jspdf";

/**
 * Generate and download professional Tax Invoice PDF using jsPDF
 * @param {Object} order - Full order object
 */
export const downloadInvoicePdf = (order) => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const orderNum = order.orderNumber || String(order._id || "").slice(-8).toUpperCase();
  const addr = order.deliveryAddress || {};
  const items = order.items || [];

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;

  // --- BRAND / HEADER ACCENT BAR ---
  doc.setFillColor(5, 150, 105); // #059669 emerald
  doc.rect(0, 0, pageWidth, 5, "F");

  // --- STORE TITLE & TAX INVOICE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(5, 150, 105);
  doc.text("GROCERY SATHI", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Fresh Groceries & Farm Produce", margin, 23);
  doc.text("Support: +91 98878 68746 | sarojintermiles@gmail.com", margin, 27);

  // Top-Right: INVOICE BADGE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("TAX INVOICE", pageWidth - margin, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: INV-${orderNum}`, pageWidth - margin, 23, { align: "right" });
  doc.text(`Date: ${orderDate}`, pageWidth - margin, 27, { align: "right" });
  doc.text(`Status: DELIVERED (PAID)`, pageWidth - margin, 31, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 35, pageWidth - margin, 35);

  // --- CUSTOMER & SHIPPING INFO ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("BILLED & DELIVERED TO:", margin, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(addr.name || "Customer", margin, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (addr.mobile) {
    doc.text(`Contact: ${addr.mobile}`, margin, 52);
  }

  const addressLines = [
    addr.address || "",
    addr.landmark ? `Near ${addr.landmark}` : "",
    `${addr.city || ""}, ${addr.state || ""} ${addr.pincode ? `- ${addr.pincode}` : ""}`.trim(),
  ].filter(Boolean).join(", ");

  const splitAddress = doc.splitTextToSize(addressLines || "Delivery address verified", 95);
  doc.text(splitAddress, margin, 56);

  // Payment Details (Right Column)
  const rightColX = 125;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("PAYMENT INFORMATION:", rightColX, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const paymentMode = order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (UPI/Cards/Netbanking)";
  doc.text(`Payment Mode: ${paymentMode}`, rightColX, 47);
  doc.text(`Payment Status: Completed / Verified`, rightColX, 52);
  if (order.razorpayPaymentId) {
    doc.text(`Ref ID: ${order.razorpayPaymentId}`, rightColX, 57);
  }

  // --- ITEMS TABLE ---
  let tableY = 72;

  // Header Bar
  doc.setFillColor(5, 150, 105);
  doc.rect(margin, tableY, pageWidth - margin * 2, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("#", margin + 3, tableY + 5.5);
  doc.text("Item Description", margin + 12, tableY + 5.5);
  doc.text("Unit/Pack", margin + 85, tableY + 5.5);
  doc.text("Qty", margin + 115, tableY + 5.5);
  doc.text("Rate (Rs.)", margin + 135, tableY + 5.5);
  doc.text("Total (Rs.)", pageWidth - margin - 3, tableY + 5.5, { align: "right" });

  tableY += 8;

  // Table Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  items.forEach((it, idx) => {
    const prod = it.product && typeof it.product === "object" ? it.product : {};
    const name = it.productName || prod.productName || prod.name || "Grocery Item";
    const unit = it.unit || prod.unit || "1 unit";
    const qty = Number(it.quantity || 1);
    const rate = Number(it.price || 0);
    const total = Number(it.itemTotal || rate * qty);

    // Alternate row shading
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, tableY, pageWidth - margin * 2, 7, "F");
    }

    doc.text(String(idx + 1), margin + 3, tableY + 4.8);
    // Truncate name if too long
    const cleanName = doc.splitTextToSize(name, 68)[0];
    doc.text(cleanName, margin + 12, tableY + 4.8);
    doc.text(String(unit), margin + 85, tableY + 4.8);
    doc.text(String(qty), margin + 115, tableY + 4.8);
    doc.text(rate.toFixed(2), margin + 135, tableY + 4.8);
    doc.text(total.toFixed(2), pageWidth - margin - 3, tableY + 4.8, { align: "right" });

    tableY += 7;
  });

  // Table Bottom Line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, tableY, pageWidth - margin, tableY);
  tableY += 6;

  // --- TOTALS / BREAKDOWN ---
  const subtotal = Number(order.subtotal || 0);
  const delivery = Number(order.deliveryCharge || 0);
  const walletUsed = Number(order.walletUsed || 0);
  const pointsUsed = Number(order.pointsValue || 0);
  const grandTotal = Number(order.payableAmount ?? order.totalAmount ?? 0);

  const summaryXLabel = 130;
  const summaryXVal = pageWidth - margin - 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text("Items Subtotal:", summaryXLabel, tableY);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, summaryXVal, tableY, { align: "right" });
  tableY += 5;

  doc.text("Delivery Charges:", summaryXLabel, tableY);
  doc.setTextColor(5, 150, 105);
  doc.text(delivery === 0 ? "FREE" : `Rs. ${delivery.toFixed(2)}`, summaryXVal, tableY, { align: "right" });
  tableY += 5;

  if (walletUsed > 0) {
    doc.setTextColor(100, 116, 139);
    doc.text("Wallet Discount:", summaryXLabel, tableY);
    doc.setTextColor(5, 150, 105);
    doc.text(`- Rs. ${walletUsed.toFixed(2)}`, summaryXVal, tableY, { align: "right" });
    tableY += 5;
  }

  if (pointsUsed > 0) {
    doc.setTextColor(100, 116, 139);
    doc.text("Reward Points Discount:", summaryXLabel, tableY);
    doc.setTextColor(5, 150, 105);
    doc.text(`- Rs. ${pointsUsed.toFixed(2)}`, summaryXVal, tableY, { align: "right" });
    tableY += 5;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(summaryXLabel - 5, tableY, pageWidth - margin, tableY);
  tableY += 6;

  // Total Paid
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Paid:", summaryXLabel, tableY);
  doc.setTextColor(5, 150, 105);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, summaryXVal, tableY, { align: "right" });

  // --- FOOTER NOTE ---
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text("Thank you for shopping with Grocery Sathi!", pageWidth / 2, footerY + 5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is a computer-generated invoice and requires no physical signature.",
    pageWidth / 2,
    footerY + 9,
    { align: "center" }
  );

  // Save the PDF
  doc.save(`Invoice_${orderNum}.pdf`);
};


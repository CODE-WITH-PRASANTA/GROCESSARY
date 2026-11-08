import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import logoImg from "../assets/Grocessary Sathi Png.png";

/**
 * Pre-convert image asset to base64 DataURL so html2canvas renders it reliably with zero CORS or async delay
 */
const getBase64Image = (imgSrc) => {
  return new Promise((resolve) => {
    if (!imgSrc) return resolve("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        resolve(imgSrc);
      }
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
};

/**
 * Directly generate and download invoice PDF matching user's design without any view modal
 * @param {Object} order - Full order object
 */
export const downloadOrderInvoicePdf = async (order) => {
  if (!order) return;

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
    order.invoice ||
    order.orderNumber ||
    order.orderId ||
    (order._id ? `GS${String(order._id).slice(-10).toUpperCase()}` : "GSINVOICE");

  const customerName =
    order.deliveryAddress?.name ||
    order.customer?.name ||
    (typeof order.customer === "string" && order.customer ? order.customer : null) ||
    order.user?.name ||
    "Valued Customer";

  const customerPhone =
    order.deliveryAddress?.mobile ||
    order.customer?.mobile ||
    (order.contact && order.contact !== "-" ? order.contact : null) ||
    order.mobile ||
    order.user?.mobile ||
    "9407057752";

  // Clean Payment Method String
  const getPaymentDisplay = () => {
    const method = String(order.paymentMethod || order.payment || "").toLowerCase();
    if (method.includes("cash") || method === "cod") return "Cash";
    if (method.includes("upi")) return "UPI";
    if (method.includes("razorpay") || method.includes("online")) return "Online (Paid)";
    if (method.includes("wallet")) return "Wallet";
    return order.paymentMethod || order.payment || "Cash";
  };

  // Normalized Items List (handling arrays safely)
  let rawItems = [];
  if (Array.isArray(order.items)) {
    rawItems = order.items;
  } else if (Array.isArray(order.products)) {
    rawItems = order.products;
  } else if (Array.isArray(order.orderItems)) {
    rawItems = order.orderItems;
  } else if (order.rawBill && Array.isArray(order.rawBill.items)) {
    rawItems = order.rawBill.items;
  }

  const items = rawItems.map((it, idx) => {
    const prod = it.product && typeof it.product === "object" ? it.product : {};
    const name = it.productName || prod.productName || prod.name || it.name || "Grocery Item";
    const unit = it.unit || prod.unit || it.variant || "";
    const fullName = unit ? `${name} ${unit}`.trim() : name;
    const price = Number(it.price || 0);
    const qty = Number(it.quantity || it.qty || 1);
    const total = Number(it.itemTotal || it.total || price * qty);

    return {
      index: idx + 1,
      name: fullName,
      price: Math.round(price),
      qty,
      total: Math.round(total),
    };
  });

  const computedItemsSubtotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const subtotal = Math.round(Number(order.subtotal ?? computedItemsSubtotal));
  const payableTotal = Math.round(
    Number(order.payableAmount ?? order.totalAmount ?? order.total ?? computedItemsSubtotal)
  );

  const discount = Math.round(
    Number(order.discountAmount || 0) +
      Number(order.discount || 0) +
      Number(order.walletUsed || 0) +
      Number(order.pointsValue || 0)
  );

  const amountReceived = Math.round(Number(order.amountReceived ?? payableTotal));
  const changeAmount = Math.round(
    Number(order.changeReturned ?? order.change ?? 0)
  );
  const orderDate = formatDate(order.createdAt || order.date);

  // Pre-load base64 logo for html2canvas
  const logoDataUrl = await getBase64Image(logoImg);

  // Generate table rows HTML
  const itemsRowsHtml =
    items.length > 0
      ? items
          .map(
            (it) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 9px 12px; text-align: center; font-size: 13.5px; font-weight: 600; color: #0f172a; border-right: 1px solid #e2e8f0;">${it.index}</td>
          <td style="padding: 9px 12px; text-align: left; font-size: 13.5px; font-weight: 600; color: #0f172a; border-right: 1px solid #e2e8f0;">${it.name}</td>
          <td style="padding: 9px 12px; text-align: center; font-size: 13.5px; font-weight: 600; color: #0f172a; border-right: 1px solid #e2e8f0;">₹${it.price}</td>
          <td style="padding: 9px 12px; text-align: center; font-size: 13.5px; font-weight: 600; color: #0f172a; border-right: 1px solid #e2e8f0;">${it.qty}</td>
          <td style="padding: 9px 12px; text-align: center; font-size: 13.5px; font-weight: 600; color: #0f172a;">₹${it.total}</td>
        </tr>
      `
          )
          .join("")
      : `
        <tr>
          <td colspan="5" style="padding: 14px; text-align: center; color: #64748b; font-size: 13.5px; font-style: italic;">
            Grocery Items
          </td>
        </tr>
      `;

  // Create off-screen container
  const container = document.createElement("div");
  container.id = "invoice-direct-download-root";
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "640px";
  container.style.zIndex = "-99999";
  container.style.background = "#ffffff";
  container.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

  // Build the complete invoice template matching user image exactly
  container.innerHTML = `
    <div style="background: #ffffff; padding: 28px 32px 20px 32px; position: relative; overflow: hidden; width: 640px; box-sizing: border-box; color: #0f172a;">
      
      <!-- TOP HEADER -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <!-- LEFT BRAND LOGO & TAGLINE -->
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="height: 52px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${
              logoDataUrl
                ? `<img src="${logoDataUrl}" alt="Grocery Sathi" style="height: 50px; width: auto; max-width: 90px; object-fit: contain;" />`
                : `<svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                     <path d="M6 10h8l6.5 26h28l6-19H18" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                     <circle cx="25" cy="48" r="4.5" fill="#16a34a"/>
                     <circle cx="45" cy="48" r="4.5" fill="#16a34a"/>
                     <path d="M42 16 C38 6 48 3 56 4 C58 12 50 18 42 16 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
                     <path d="M44 14 C48 10 54 6 54 6" stroke="#15803d" stroke-width="1.5" stroke-linecap="round"/>
                   </svg>`
            }
          </div>
          <div style="width: 2px; height: 44px; background: #94a3b8; border-radius: 1px;"></div>
          <div style="display: flex; flex-direction: column;">
            <div style="font-size: 26px; font-weight: 800; line-height: 1.15; letter-spacing: -0.5px;">
              <span style="color: #0f2a4a;">Grocery</span> <span style="color: #2e7d32;">Sati</span>
            </div>
            <div style="font-size: 13px; font-style: italic; font-weight: 500; color: #1e293b; margin-top: 2px;">
              Fresh Grocery, Better Living!
            </div>
          </div>
        </div>

        <!-- RIGHT CONTACT & DATE -->
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #0f172a; font-weight: 700;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f2a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>9407057752</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #0f172a; font-weight: 500;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f2a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Date: ${orderDate}</span>
          </div>
        </div>
      </div>

      <!-- GREEN HORIZONTAL LINE -->
      <div style="height: 2.5px; background: #2e7d32; margin: 16px 0 15px 0; border-radius: 2px;"></div>

      <!-- METADATA ROWS -->
      <div style="display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px;">
        <!-- Invoice No -->
        <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #0f172a;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f2a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <div>
            <span style="font-weight: 700;">Invoice:</span>
            <span style="font-weight: 600; font-family: monospace; letter-spacing: 0.3px;"> ${invoiceNo}</span>
          </div>
        </div>

        <!-- Customer -->
        <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #0f172a;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f2a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <div>
            <span style="font-weight: 700;">Customer:</span>
            <span style="font-weight: 600;"> ${customerName}</span>
          </div>
        </div>

        <!-- Payment -->
        <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #0f172a;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f2a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <div>
            <span style="font-weight: 700;">Payment:</span>
            <span style="font-weight: 600;"> ${getPaymentDisplay()}</span>
          </div>
        </div>
      </div>

      <!-- ITEMS TABLE -->
      <div style="border: 1px solid #dbe2ea; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #0f2a4a; color: #ffffff;">
              <th style="padding: 9px 12px; width: 9%; text-align: center; font-size: 13.5px; font-weight: 700;">#</th>
              <th style="padding: 9px 12px; width: 48%; text-align: left; font-size: 13.5px; font-weight: 700;">Item</th>
              <th style="padding: 9px 12px; width: 15%; text-align: center; font-size: 13.5px; font-weight: 700;">Price</th>
              <th style="padding: 9px 12px; width: 11%; text-align: center; font-size: 13.5px; font-weight: 700;">Qty</th>
              <th style="padding: 9px 12px; width: 17%; text-align: center; font-size: 13.5px; font-weight: 700;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- FINANCIAL SUMMARY (RIGHT ALIGNED) -->
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px; padding: 4px 6px 8px 6px;">
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 40px; min-width: 220px; font-size: 14.5px;">
          <span style="font-weight: 700; color: #0f172a;">Subtotal</span>
          <span style="font-weight: 700; color: #0f172a; min-width: 60px; text-align: right;">₹${subtotal}</span>
        </div>
        ${
          discount > 0
            ? `
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 40px; min-width: 220px; font-size: 14.5px;">
            <span style="font-weight: 700; color: #dc2626;">Discount</span>
            <span style="font-weight: 700; color: #dc2626; min-width: 60px; text-align: right;">₹${discount}</span>
          </div>
        `
            : ""
        }
      </div>

      <!-- TOTAL AMOUNT HIGHLIGHT BANNER -->
      <div style="background: #e2eaf2; border-radius: 8px; padding: 9px 18px; display: flex; align-items: center; justify-content: space-between; margin: 4px 0 14px 0;">
        <div style="font-size: 20px; font-weight: 800; color: #0f2a4a; letter-spacing: -0.3px;">
          Total Amount
        </div>
        <div style="background: #0f2a4a; color: #ffffff; font-size: 23px; font-weight: 800; padding: 5px 22px; border-radius: 8px; letter-spacing: 0.5px;">
          ₹${payableTotal}
        </div>
      </div>

      <!-- AMOUNT RECEIVED & CHANGE -->
      <div style="display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 6px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#0f2a4a" stroke="#ffffff" stroke-width="2">
              <circle cx="12" cy="12" r="10" fill="#0f2a4a"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <span style="font-size: 14.5px; font-weight: 600; color: #0f172a;">Amount Received</span>
          </div>
          <div style="font-size: 15.5px; font-weight: 700; color: #0f172a;">₹${amountReceived}</div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 6px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0f2a4a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span style="font-size: 14.5px; font-weight: 600; color: #0f172a;">Change</span>
          </div>
          <div style="font-size: 15.5px; font-weight: 700; color: #0f172a;">₹${changeAmount}</div>
        </div>
      </div>

      <!-- FOOTER SCRIPT & MOTIF -->
      <div style="display: flex; flex-direction: column; align-items: center; margin-top: 4px; margin-bottom: 24px;">
        <div style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 14px;">
          <div style="flex: 1; height: 1.5px; background: #0f2a4a;"></div>
          <div style="font-style: italic; font-size: 16.5px; font-weight: 600; color: #0f2a4a; white-space: nowrap;">
            Thank you for shopping with us!
          </div>
          <div style="flex: 1; height: 1.5px; background: #0f2a4a;"></div>
        </div>

        <!-- TWIN LEAVES MOTIF -->
        <div style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 5px;">
          <div style="width: 60px; height: 1.5px; background: #2e7d32;"></div>
          <svg width="40" height="22" viewBox="0 0 60 26" fill="none">
            <path d="M30 20 C24 10 14 6 6 8 C6 8 8 18 18 20 C24 21 28 20 30 20 Z" fill="#16a34a"/>
            <path d="M30 20 C36 10 46 6 54 8 C54 8 52 18 42 20 C36 21 32 20 30 20 Z" fill="#22c55e"/>
            <path d="M30 20 C22 13 6 8 6 8" stroke="#15803d" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M30 20 C38 13 54 8 54 8" stroke="#15803d" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div style="width: 60px; height: 1.5px; background: #2e7d32;"></div>
        </div>
      </div>

      <!-- BOTTOM DOUBLE SWEEPING WAVES -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 44px; overflow: hidden; pointer-events: none;">
        <svg viewBox="0 0 700 80" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;">
          <path d="M 0,80 L 0,42 C 180,68 340,15 700,28 L 700,80 Z" fill="#0f2a4a" />
          <path d="M 0,80 L 0,60 C 200,80 380,38 700,48 L 700,80 Z" fill="#16a34a" />
        </svg>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  // Wait for any images to settle
  const imgElement = container.querySelector("img");
  if (imgElement && !imgElement.complete) {
    await new Promise((resolve) => {
      imgElement.onload = resolve;
      imgElement.onerror = resolve;
      setTimeout(resolve, 250);
    });
  }

  try {
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 640,
      windowWidth: 640,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const printableWidth = pdfWidth - margin * 2;
    const computedHeight = (imgHeight * printableWidth) / imgWidth;

    let targetHeight = computedHeight;
    let targetWidth = printableWidth;

    if (targetHeight > pdfHeight - margin * 2) {
      targetHeight = pdfHeight - margin * 2;
      targetWidth = (imgWidth * targetHeight) / imgHeight;
    }

    const xPos = margin + (printableWidth - targetWidth) / 2;
    const yPos = margin;

    pdf.addImage(imgData, "PNG", xPos, yPos, targetWidth, targetHeight, undefined, "FAST");
    pdf.save(`Invoice_${invoiceNo}.pdf`);

    // Quick Toast Notification
    Swal.fire({
      icon: "success",
      title: "Invoice Downloaded",
      text: `Invoice #${invoiceNo} downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
    return true;
  } catch (err) {
    console.error("Direct invoice download failed:", err);
    Swal.fire({
      icon: "error",
      title: "Download Failed",
      text: "Could not generate invoice PDF. Please try again.",
      confirmButtonColor: "#059669",
    });
    throw err;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

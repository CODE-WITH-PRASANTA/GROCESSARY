import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  ScanLine,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  CreditCard,
  Printer,
  Check,
  FileText,
  X,
  CalendarDays,
  Package,
  Banknote,
  Smartphone,
  AlertCircle,
} from "lucide-react";

import Swal from "sweetalert2";
import API, { BASE_URL } from "../../api/axios";
import BarcodeScanner from "../BarcodeScanner/BarcodeScanner";
import "./Billing.css";

// =========================================================
// HELPERS
// =========================================================

const resolveImage = (path) => {
  if (!path) return "";
  const str = String(path).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE_URL}/${str.replace(/^\/+/, "")}`;
};

const normalizeDiscounts = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.discounts)) return data.discounts;
  if (Array.isArray(data?.todayDiscounts)) return data.todayDiscounts;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.discounts)) return data.data.discounts;
  return [];
};

const normalizeProducts = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  return [];
};

const formatCountdown = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// =========================================================
// COMPONENT
// =========================================================

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 👇 snapshot of the completed sale — used by receipt + print
  const [completedBill, setCompletedBill] = useState(null);

  // ---- UPI state ----
  const [upiQr, setUpiQr] = useState(null);
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiCountdown, setUpiCountdown] = useState(0);
  const [upiRefreshKey, setUpiRefreshKey] = useState(0);

  // =========================================================
  // FETCH + MERGE PRODUCTS
  // =========================================================
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const [productsRes, discountsRes] = await Promise.all([
        API.get("/products"),
        API.get("/today-discounts/active").catch(() => ({ data: [] })),
      ]);

      const rawProducts = normalizeProducts(productsRes.data);
      const rawDiscounts = normalizeDiscounts(discountsRes.data);

      const discountMap = new Map();
      rawDiscounts.forEach((d) => {
        if (!d) return;

        const pid =
          typeof d.product === "object"
            ? d.product?._id || d.product?.id
            : d.product;

        if (!pid) return;

        const now = new Date();
        const status = String(d.status || "active").toLowerCase();
        if (status !== "active") return;
        if (d.startDate && new Date(d.startDate) > now) return;
        if (d.endDate && new Date(d.endDate) < now) return;

        const dp = Number(d.discountPrice || 0);
        if (dp > 0) discountMap.set(String(pid), dp);
      });

      const merged = rawProducts
        .filter((p) => {
          const status = String(p?.status ?? "active").toLowerCase();
          return status === "active" || status === "true" || status === "1";
        })
        .map((p) => {
          const productId = String(p._id || p.id);
          const todayDiscountPrice = discountMap.get(productId) || 0;

          const basePrice = Number(p.price || 0);
          const writtenPrice = Number(p.writtenPrice || 0);
          const productDiscountPrice = Number(p.discountPrice || 0);

          let effectivePrice = basePrice;
          let originalPrice =
            writtenPrice > basePrice ? writtenPrice : basePrice;

          if (todayDiscountPrice > 0 && todayDiscountPrice < basePrice) {
            effectivePrice = todayDiscountPrice;
            originalPrice = basePrice;
          } else if (
            productDiscountPrice > 0 &&
            productDiscountPrice < basePrice
          ) {
            effectivePrice = productDiscountPrice;
            originalPrice = basePrice;
          }

          const discountPercent =
            originalPrice > effectivePrice && originalPrice > 0
              ? Math.round(
                  ((originalPrice - effectivePrice) / originalPrice) * 100,
                )
              : 0;

          let rawImage = "";
          if (Array.isArray(p.images) && p.images.length > 0) {
            rawImage = p.images[0];
          } else {
            rawImage = p.image || p.thumbnail || "";
          }
          const image =
            typeof rawImage === "object"
              ? rawImage.url || rawImage.path || rawImage.src || ""
              : rawImage;

          return {
            id: productId,
            name: p.productName || p.name || "Product",
            sku: p.sku || "",
            barcode: p.barcode || "",
            category:
              typeof p.category === "object"
                ? p.category?.name || "Other"
                : p.category || "Other",
            quantityLabel: p.unitNo ? `${p.unitNo}` : "1 unit",
            price: effectivePrice,
            originalPrice,
            discountPercent,
            hasDiscount: discountPercent > 0,
            stockQuantity: Number(p.stockQuantity || 0),
            image,
          };
        });

      setProducts(merged);
    } catch (err) {
      console.error("Billing fetch error:", err);
      setProductsError(
        err.response?.data?.message || "Failed to load products.",
      );
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // CATEGORIES
  // =========================================================
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  // =========================================================
  // DATE / TIME
  // =========================================================
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB");
  const formattedTime = currentDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // =========================================================
  // FILTER
  // =========================================================
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "All" || product.category === selectedCategory;

      if (!q) return categoryMatch;

      const searchMatch =
        (product.name || "").toLowerCase().includes(q) ||
        (product.sku || "").toLowerCase().includes(q) ||
        (product.barcode || "").toLowerCase().includes(q) ||
        (product.category || "").toLowerCase().includes(q);

      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, search]);

  // =========================================================
  // BILL CALCULATIONS
  // =========================================================
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalSavings = cart.reduce((total, item) => {
    const savedPerUnit = Math.max(0, (item.originalPrice || 0) - item.price);
    return total + savedPerUnit * item.quantity;
  }, 0);

  const discountAmount =
    discountType === "percentage"
      ? (subtotal * Number(discount || 0)) / 100
      : Number(discount || 0);

  const safeDiscount = Math.min(discountAmount, subtotal);
  const totalAmount = Math.max(0, subtotal - safeDiscount);
  const received = Number(amountReceived || 0);
  const change = Math.max(0, received - totalAmount);

  // =========================================================
  // UPI QR — AUTO-GENERATE WHEN UPI SELECTED
  // Only generate when NOT saleCompleted
  // =========================================================
  useEffect(() => {
    if (paymentMethod !== "UPI" || saleCompleted) {
      setUpiQr(null);
      setUpiCountdown(0);
      return;
    }

    if (cart.length === 0 || totalAmount <= 0) {
      setUpiQr(null);
      return;
    }

    let cancelled = false;
    let tickInterval = null;

    const loadQr = async () => {
      try {
        setUpiLoading(true);

        const { data } = await API.post("/bills/upi-init", {
          amount: totalAmount,
        });

        if (!cancelled && data?.success && data?.data) {
          setUpiQr(data.data);

          const expiresAt = Date.now() + 5 * 60 * 1000;
          setUpiCountdown(Math.floor((expiresAt - Date.now()) / 1000));

          tickInterval = setInterval(() => {
            const secs = Math.max(
              0,
              Math.floor((expiresAt - Date.now()) / 1000),
            );
            setUpiCountdown(secs);
            if (secs <= 0 && tickInterval) clearInterval(tickInterval);
          }, 1000);
        }
      } catch (err) {
        console.error("UPI init error:", err);
        if (!cancelled) setUpiQr(null);
      } finally {
        if (!cancelled) setUpiLoading(false);
      }
    };

    const timer = setTimeout(loadQr, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [paymentMethod, totalAmount, cart.length, upiRefreshKey, saleCompleted]);

  // =========================================================
  // CART ACTIONS
  // =========================================================
  const addToBill = (product) => {
    if (!product?.id || saleCompleted) return;

    setCart((previousCart) => {
      const existing = previousCart.find((item) => item.id === product.id);

      if (existing) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (id) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );

  const decreaseQuantity = (id) =>
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );

  const removeFromBill = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  // =========================================================
  // SCANNER
  // =========================================================
  const handleBarcodeDetected = (barcode) => {
    setScannerOpen(false);
    if (!barcode || saleCompleted) return;

    const clean = String(barcode).trim();
    const match = products.find(
      (p) => String(p.barcode || "").trim() === clean,
    );

    if (!match) {
      Swal.fire({
        icon: "error",
        title: "Product not found",
        text: `No product matches barcode: ${clean}`,
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    addToBill(match);

    Swal.fire({
      icon: "success",
      title: "Added",
      text: `${match.name} added to bill.`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1100,
    });
  };

  // =========================================================
  // RESET HELPERS
  // =========================================================
  const resetBillState = () => {
    setCart([]);
    setDiscount(0);
    setAmountReceived("");
    setCustomerName("");
    setCustomerMobile("");
    setSaleCompleted(false);
    setUpiTransactionId("");
    setUpiQr(null);
    setInvoiceNumber("");
    setCompletedBill(null);
    setPaymentMethod("Cash");
    setDiscountType("percentage");
    setSearch("");
    setSelectedCategory("All");
  };

  const clearBill = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Bill is already empty",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Clear current bill?",
      text: "All added products will be removed.",
      showCancelButton: true,
      confirmButtonText: "Yes, Clear",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      resetBillState();
      Swal.fire({
        icon: "success",
        title: "Bill Cleared",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  // =========================================================
  // COMPLETE SALE
  // =========================================================
  const completeSale = async () => {
    if (saleCompleted) return; // 👈 guard

    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No products added",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    const trimmedMobile = customerMobile.trim();
    if (trimmedMobile && !/^\d{10}$/.test(trimmedMobile)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter a valid 10-digit mobile number.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    if (paymentMethod === "Cash") {
      if (received < totalAmount) {
        Swal.fire({
          icon: "error",
          title: "Insufficient Cash",
          text: `Customer needs to pay ₹${totalAmount.toFixed(0)}.`,
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
    } else if (paymentMethod === "UPI") {
      if (!upiQr) {
        Swal.fire({
          icon: "error",
          title: "QR not ready",
          text: "Please wait for the UPI QR to generate.",
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
      if (upiCountdown <= 0) {
        Swal.fire({
          icon: "warning",
          title: "QR Expired",
          text: "Please refresh the QR code before completing the sale.",
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
      if (!upiTransactionId.trim() || upiTransactionId.trim().length < 4) {
        Swal.fire({
          icon: "error",
          title: "UPI Transaction ID Required",
          text: "Please enter the UPI reference number from the customer.",
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
    }

    // Snapshot everything BEFORE clearing state
    const snapshot = {
      items: cart.map((item) => ({ ...item })),
      customerName: customerName.trim(),
      customerMobile: trimmedMobile,
      paymentMethod,
      discountType,
      discountValue: Number(discount || 0),
      discountAmount: safeDiscount,
      subtotal,
      totalAmount,
      received,
      change,
      upiTransactionId: paymentMethod === "UPI" ? upiTransactionId.trim() : "",
      upiVpa: paymentMethod === "UPI" ? upiQr?.vpa || "" : "",
      date: formattedDate,
      time: formattedTime,
    };

    const payload = {
      items: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
      })),
      customer: {
        name: customerName.trim(),
        mobile: trimmedMobile,
      },
      discountType,
      discountValue: Number(discount || 0),
      discountAmount: safeDiscount,
      paymentMethod,
      amountReceived:
        paymentMethod === "Cash" ? Number(amountReceived || 0) : totalAmount,
      upiTransactionId: paymentMethod === "UPI" ? upiTransactionId.trim() : "",
    };

    try {
      setSubmitting(true);
      const { data } = await API.post("/bills", payload);

      if (!data?.success || !data?.bill) {
        throw new Error(data?.message || "Failed to save bill.");
      }

      const savedBill = data.bill;

      // Save snapshot + invoice number
      setCompletedBill({ ...snapshot, invoiceNumber: savedBill.invoiceNumber });
      setInvoiceNumber(savedBill.invoiceNumber);

      // 👇 Clear cart + QR, mark sale complete
      setCart([]);
      setUpiQr(null);
      setUpiCountdown(0);
      setUpiTransactionId("");
      setCustomerName("");
      setCustomerMobile("");
      setDiscount(0);
      setAmountReceived("");
      setSaleCompleted(true);

      Swal.fire({
        icon: "success",
        title: "Bill Generated Successfully!",
        text: `Invoice #${savedBill.invoiceNumber}`,
        confirmButtonColor: "#0aad4b",
      });

      fetchProducts();
    } catch (err) {
      console.error("Save bill error:", err);
      Swal.fire({
        icon: "error",
        title: "Could not save bill",
        text: err.response?.data?.message || err.message || "Please try again.",
        confirmButtonColor: "#0aad4b",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const newBill = async () => {
    if (cart.length > 0 && !saleCompleted) {
      const result = await Swal.fire({
        icon: "question",
        title: "Start New Bill?",
        text: "The current bill will be cleared.",
        showCancelButton: true,
        confirmButtonText: "Yes, New Bill",
        confirmButtonColor: "#0aad4b",
      });
      if (!result.isConfirmed) return;
    }

    resetBillState();
    fetchProducts();
  };

  // =========================================================
  // PRINT — uses completedBill snapshot
  // =========================================================
  const printBill = () => {
    const bill = completedBill;

    if (!bill || !invoiceNumber) {
      Swal.fire({
        icon: "info",
        title: "Complete the sale first",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    const printWindow = window.open("", "_blank", "width=450,height=750");
    if (!printWindow) {
      Swal.fire({
        icon: "error",
        title: "Print blocked",
        text: "Please allow popups.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    const receiptItems = bill.items
      .map(
        (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}<br/><small>${item.quantityLabel}</small></td>
          <td>₹${item.price}</td>
          <td>${item.quantity}</td>
          <td>₹${(item.price * item.quantity).toFixed(0)}</td>
        </tr>`,
      )
      .join("");

    const upiLine = bill.upiTransactionId
      ? `<div class="details"><span>UPI Txn: ${bill.upiTransactionId}</span></div>`
      : "";

    const upiVpaLine = bill.upiVpa
      ? `<div class="details"><span>Paid To: ${bill.upiVpa}</span></div>`
      : "";

    const cashLines =
      bill.paymentMethod === "Cash"
        ? `
        <div class="row"><span>Amount Received</span><strong>₹${Number(
          bill.received || 0,
        ).toFixed(0)}</strong></div>
        <div class="row"><span>Change</span><strong>₹${Number(
          bill.change || 0,
        ).toFixed(0)}</strong></div>`
        : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${invoiceNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 25px; font-family: Arial, sans-serif; }
          .receipt { max-width: 430px; margin: auto; }
          .logo { text-align: center; color: #078c3e; font-size: 27px; font-weight: 800; }
          .tagline { text-align: center; font-size: 13px; color: #475569; margin-bottom: 20px; }
          .success { text-align: center; border: 1px solid #bbf7d0; background: #ecfdf5; padding: 12px; border-radius: 10px; color: #087b38; font-weight: 700; margin-bottom: 18px; }
          .details { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
          th { background: #f1f5f9; text-align: left; }
          th, td { padding: 8px 5px; border-bottom: 1px solid #e5e7eb; }
          .grand { margin-top: 8px; padding: 12px; background: #eaffed; border-radius: 8px; color: #087b38; font-weight: 800; font-size: 18px; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="success">BILL GENERATED SUCCESSFULLY</div>
          <div class="logo">Grocery Sati</div>
          <div class="tagline">Fresh Grocery, Better Living!</div>

          <div class="details">
            <span>Invoice: ${invoiceNumber}</span>
            <span>Date: ${bill.date}</span>
          </div>

          <div class="details">
            <span>Customer: ${bill.customerName || "Walk-in Customer"}</span>
            <span>Mobile: ${bill.customerMobile || "—"}</span>
          </div>

          <div class="details">
            <span>Payment: ${bill.paymentMethod}</span>
          </div>

          ${upiLine}
          ${upiVpaLine}

          <table>
            <thead>
              <tr><th>#</th><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr>
            </thead>
            <tbody>${receiptItems}</tbody>
          </table>

          <div style="margin-top:18px">
            <div class="row"><span>Subtotal</span><strong>₹${Number(
              bill.subtotal || 0,
            ).toFixed(0)}</strong></div>
            <div class="row"><span>Discount</span><strong>₹${Number(
              bill.discountAmount || 0,
            ).toFixed(0)}</strong></div>
            <div class="grand">
              <div class="row"><span>Total Amount</span><span>₹${Number(
                bill.totalAmount || 0,
              ).toFixed(0)}</span></div>
            </div>
            ${cashLines}
          </div>

          <div style="text-align:center;margin-top:25px;font-size:13px;color:#475569">
            Thank you for shopping with us!<br/>
            Visit Again • Fresh Products • Everyday Low Prices
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const PaymentIcon = ({ method }) => {
    if (method === "Cash") return <Banknote size={19} />;
    if (method === "UPI") return <Smartphone size={19} />;
    return <CreditCard size={19} />;
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="Billing-page">
      <header className="Billing-header">
        <div className="Billing-brand">
          <div className="Billing-logoIcon">
            <ShoppingCart size={30} strokeWidth={2.5} />
          </div>
          <div className="Billing-brandText">
            <h1>Grocery Sathi</h1>
            <span> Billing Software</span>
          </div>
        </div>

        <div className="Billing-headerRight">
          <div className="Billing-dateTime">
            <CalendarDays size={17} />
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </header>

      <main className="Billing-main">
        {/* PRODUCTS */}
        <section className="Billing-productsSection">
          <div className="Billing-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={saleCompleted}
            />
            <button
              type="button"
              className="Billing-scanButton"
              title="Scan Barcode"
              onClick={() => setScannerOpen(true)}
              disabled={saleCompleted}
            >
              <ScanLine size={21} />
            </button>
          </div>

          <div className="Billing-categories">
            {categories.map((category) => (
              <button
                key={category}
                className={`Billing-category ${
                  selectedCategory === category ? "Billing-categoryActive" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {productsLoading ? (
            <div className="Billing-noProducts">
              <Package size={45} />
              <h3>Loading products…</h3>
            </div>
          ) : productsError ? (
            <div className="Billing-noProducts">
              <AlertCircle size={45} />
              <h3>{productsError}</h3>
              <button className="Billing-addButton" onClick={fetchProducts}>
                Try Again
              </button>
            </div>
          ) : (
            <div className="Billing-productsGrid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div className="Billing-productCard" key={product.id}>
                    <div className="Billing-productImage">
                      <img
                        src={resolveImage(product.image)}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/150?text=Product";
                        }}
                      />
                      {product.hasDiscount && (
                        <span className="Billing-discountBadge">
                          {product.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="Billing-productName">{product.name}</div>
                    <div className="Billing-productQuantity">
                      {product.quantityLabel}
                    </div>

                    <div className="Billing-productPrice">
                      <strong>₹{product.price}</strong>
                      {product.hasDiscount && (
                        <span className="Billing-originalPrice">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      className="Billing-addButton"
                      onClick={() => {
                        addToBill(product);
                        Swal.fire({
                          icon: "success",
                          title: "Added",
                          text: `${product.name} added to bill.`,
                          toast: true,
                          position: "top-end",
                          showConfirmButton: false,
                          timer: 1100,
                        });
                      }}
                      disabled={saleCompleted}
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="Billing-noProducts">
                  <Package size={45} />
                  <h3>No products found</h3>
                  <p>Try another search or category.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* BILL */}
        <section className="Billing-currentBill">
          <div className="Billing-currentBillHeader">
            <div className="Billing-currentBillTitle">
              <ShoppingCart size={24} />
              <h2>Current Bill</h2>
            </div>
            <button
              className="Billing-clearButton"
              onClick={clearBill}
              disabled={saleCompleted}
            >
              <Trash2 size={17} /> Clear All
            </button>
          </div>

          <div className="Billing-itemsTableWrapper">
            {cart.length === 0 ? (
              <div className="Billing-emptyCart">
                <ShoppingCart size={45} />
                <h3>
                  {saleCompleted
                    ? "Sale completed — view receipt"
                    : "Your bill is empty"}
                </h3>
                <p>
                  {saleCompleted
                    ? "Start a new bill to continue."
                    : "Add products from the left side."}
                </p>
              </div>
            ) : (
              <table className="Billing-itemsTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="Billing-tableProduct">
                          <img
                            src={resolveImage(item.image)}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/150?text=P";
                            }}
                          />
                          <div>
                            <strong>{item.name}</strong>
                            <small>{item.quantityLabel}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        ₹{item.price}
                        {item.hasDiscount && (
                          <>
                            {" "}
                            <s style={{ color: "#94a3b8", fontSize: "11px" }}>
                              ₹{item.originalPrice}
                            </s>
                          </>
                        )}
                      </td>
                      <td>
                        <div className="Billing-quantityControl">
                          <button onClick={() => decreaseQuantity(item.id)}>
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.id)}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <strong>
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </strong>
                      </td>
                      <td>
                        <button
                          className="Billing-deleteItem"
                          onClick={() => removeFromBill(item.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="Billing-billFooter">
            {totalSavings > 0 && (
              <div className="Billing-savingsBanner">
                🎉 Customer saves <strong>₹{totalSavings.toFixed(0)}</strong>{" "}
                with today's discounts
              </div>
            )}

            {/* Customer */}
            <div className="Billing-customerRow">
              <div className="Billing-customerField">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  maxLength={60}
                  disabled={saleCompleted}
                />
              </div>

              <div className="Billing-customerField">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={customerMobile}
                  onChange={(e) =>
                    setCustomerMobile(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="10-digit mobile"
                  maxLength={10}
                  disabled={saleCompleted}
                />
              </div>
            </div>

            {/* Discount */}
            <div className="Billing-discountRow">
              <div className="Billing-discountType">
                <button
                  className={
                    discountType === "percentage"
                      ? "Billing-discountActive"
                      : ""
                  }
                  onClick={() => setDiscountType("percentage")}
                  disabled={saleCompleted}
                >
                  <Percent size={15} />
                </button>
                <button
                  className={
                    discountType === "amount" ? "Billing-discountActive" : ""
                  }
                  onClick={() => setDiscountType("amount")}
                  disabled={saleCompleted}
                >
                  ₹
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                disabled={saleCompleted}
              />
            </div>

            {/* Summary */}
            <div className="Billing-summary">
              <div className="Billing-summaryRow">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(0)}</strong>
              </div>
              <div className="Billing-summaryRow">
                <span>Discount</span>
                <strong>₹{safeDiscount.toFixed(0)}</strong>
              </div>
              <div className="Billing-total">
                <span>Total Amount</span>
                <strong>₹{totalAmount.toFixed(0)}</strong>
              </div>
            </div>

            {/* Payment */}
            <div className="Billing-payment">
              <h3>Payment Method</h3>
              <div className="Billing-paymentMethods">
                {["Cash", "UPI"].map((method) => (
                  <button
                    key={method}
                    className={
                      paymentMethod === method ? "Billing-paymentActive" : ""
                    }
                    onClick={() => setPaymentMethod(method)}
                    disabled={saleCompleted}
                  >
                    <PaymentIcon method={method} />
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* CASH */}
            {paymentMethod === "Cash" && !saleCompleted && (
              <>
                <div className="Billing-amountRow">
                  <label>Amount Received</label>
                  <input
                    type="number"
                    min="0"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="Billing-change">
                  <span>Change</span>
                  <strong>₹{change.toFixed(0)}</strong>
                </div>
              </>
            )}

            {/* UPI — only when NOT completed */}
            {paymentMethod === "UPI" && !saleCompleted && (
              <div className="Billing-upiPanel">
                {upiLoading ? (
                  <div className="Billing-upiLoading">
                    <Package size={32} />
                    <p>Generating UPI QR…</p>
                  </div>
                ) : upiQr ? (
                  <>
                    <div className="Billing-upiQrWrap">
                      <img
                        src={upiQr.qrUrl}
                        alt="UPI QR"
                        className="Billing-upiQrImg"
                      />
                      <div className="Billing-upiQrMeta">
                        <span className="Billing-upiAmount">
                          ₹{Number(upiQr.amount).toFixed(2)}
                        </span>
                        <span className="Billing-upiTo">
                          To: <strong>{upiQr.merchantName}</strong>
                        </span>
                        <span className="Billing-upiVpa">{upiQr.vpa}</span>
                      </div>
                    </div>

                    <div className="Billing-upiCountdown">
                      <span>QR valid for</span>
                      <strong>{formatCountdown(upiCountdown)}</strong>
                    </div>

                    <div className="Billing-upiActions">
                      <a
                        href={upiQr.upiLink}
                        className="Billing-upiOpenBtn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Smartphone size={16} />
                        Open in UPI App
                      </a>
                      <button
                        type="button"
                        className="Billing-upiRefreshBtn"
                        onClick={() => {
                          setUpiQr(null);
                          setUpiRefreshKey((k) => k + 1);
                        }}
                      >
                        Refresh QR
                      </button>
                    </div>

                    <p className="Billing-upiHintText">
                      Ask the customer to scan with any UPI app (GPay, PhonePe,
                      Paytm, BHIM). Money goes directly to{" "}
                      <strong>{upiQr.merchantName}</strong>.
                    </p>

                    <div className="Billing-upiTxnWrap">
                      <label className="Billing-upiTxnLabel">
                        UPI Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={upiTransactionId}
                        onChange={(e) =>
                          setUpiTransactionId(e.target.value.trim())
                        }
                        placeholder="Enter the UPI reference number"
                        maxLength={40}
                        className="Billing-upiTxnInput"
                      />
                      <p className="Billing-upiTxnHint">
                        Shown in the customer's UPI app after payment.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="Billing-upiLoading">
                    <AlertCircle size={32} />
                    <p>Could not generate QR. Try refreshing.</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="Billing-actionButtons">
              <button
                className="Billing-printButton"
                onClick={printBill}
                disabled={!saleCompleted}
              >
                <Printer size={19} />
                Print Bill
              </button>
              <button
                className="Billing-completeButton"
                onClick={completeSale}
                disabled={saleCompleted || submitting || cart.length === 0}
              >
                <Check size={19} />
                {submitting
                  ? "Saving…"
                  : saleCompleted
                    ? "Sale Completed"
                    : "Complete Sale"}
              </button>
            </div>
          </div>
        </section>

        {/* RECEIPT — uses completedBill snapshot */}
        {saleCompleted && completedBill && (
          <section className="Billing-receiptSection">
            <button
              className="Billing-receiptClose"
              onClick={() => setSaleCompleted(false)}
            >
              <X size={21} />
            </button>

            <div className="Billing-successBox">
              <div className="Billing-successIcon">
                <Check size={30} />
              </div>
              <h2>Bill Generated Successfully!</h2>
              <p>Invoice #{invoiceNumber}</p>
            </div>

            <div className="Billing-receipt">
              <div className="Billing-receiptBrand">Grocery Sathi</div>
              <div className="Billing-receiptTagline">
                Fresh Grocery, Better Living!
              </div>
              <div className="Billing-receiptLine" />

              <div className="Billing-receiptDetails">
                <span>
                  Invoice No: <strong>{invoiceNumber}</strong>
                </span>
                <span>
                  Date: <strong>{completedBill.date}</strong>
                </span>
                <span>
                  Time: <strong>{completedBill.time}</strong>
                </span>
                <span>
                  Mode: <strong>{completedBill.paymentMethod}</strong>
                </span>
                {completedBill.customerName && (
                  <span>
                    Customer: <strong>{completedBill.customerName}</strong>
                  </span>
                )}
                {completedBill.customerMobile && (
                  <span>
                    Mobile: <strong>{completedBill.customerMobile}</strong>
                  </span>
                )}
                {completedBill.paymentMethod === "UPI" &&
                  completedBill.upiVpa && (
                    <span>
                      UPI VPA: <strong>{completedBill.upiVpa}</strong>
                    </span>
                  )}
                {completedBill.paymentMethod === "UPI" &&
                  completedBill.upiTransactionId && (
                    <span>
                      UPI Txn: <strong>{completedBill.upiTransactionId}</strong>
                    </span>
                  )}
              </div>

              <table className="Billing-receiptTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {completedBill.items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>₹{(item.price * item.quantity).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="Billing-receiptSummary">
                <div>
                  <span>Subtotal</span>
                  <strong>₹{Number(completedBill.subtotal).toFixed(0)}</strong>
                </div>
                <div>
                  <span>Discount</span>
                  <strong>
                    ₹{Number(completedBill.discountAmount).toFixed(0)}
                  </strong>
                </div>
                <div className="Billing-receiptGrandTotal">
                  <span>Total Amount</span>
                  <strong>
                    ₹{Number(completedBill.totalAmount).toFixed(0)}
                  </strong>
                </div>
              </div>

              <div className="Billing-thankYou">
                <strong>Thank you for shopping with us!</strong>
                <span>
                  Visit Again &nbsp; | &nbsp; Fresh Products &nbsp; | &nbsp;
                  Everyday Low Prices
                </span>
              </div>
            </div>

            <div className="Billing-receiptActions">
              <button onClick={printBill} className="Billing-printAgain">
                <Printer size={18} />
                Print Again
              </button>
              <button onClick={newBill} className="Billing-newBill">
                <FileText size={18} />
                New Bill
              </button>
              <button
                onClick={() => setSaleCompleted(false)}
                className="Billing-doneButton"
              >
                <Check size={18} />
                Done
              </button>
            </div>
          </section>
        )}

        <BarcodeScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onDetected={handleBarcodeDetected}
        />
      </main>
    </div>
  );
};

export default Billing;

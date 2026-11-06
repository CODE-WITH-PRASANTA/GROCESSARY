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
  Download,
  Tag,
  Check,
  CheckCircle2,
  RotateCcw,
  FileText,
  X,
  CalendarDays,
  Package,
  Banknote,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";

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

  // ---- Coupon state ----
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // 👇 snapshot of the completed sale — used by receipt + download
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

  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons?status=Active");
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setAvailableCoupons(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch active coupons:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
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

  // Coupon discount calculation
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let amt = 0;
    if (appliedCoupon.discountType === "percentage") {
      amt = (subtotal * Number(appliedCoupon.discountValue || 0)) / 100;
      if (appliedCoupon.maxDiscount && amt > Number(appliedCoupon.maxDiscount)) {
        amt = Number(appliedCoupon.maxDiscount);
      }
    } else {
      amt = Number(appliedCoupon.discountValue || 0);
    }
    return Math.min(amt, subtotal);
  }, [appliedCoupon, subtotal]);

  const manualDiscountAmount = useMemo(() => {
    if (appliedCoupon) return 0;
    const val = Number(discount || 0);
    if (discountType === "percentage") {
      return (subtotal * val) / 100;
    }
    return val;
  }, [appliedCoupon, discount, discountType, subtotal]);

  const safeDiscount = Math.min(
    appliedCoupon ? couponDiscountAmount : manualDiscountAmount,
    subtotal,
  );
  const totalAmount = Math.max(0, subtotal - safeDiscount);
  const received = Number(amountReceived || 0);
  const change = Math.max(0, received - totalAmount);

  // If subtotal drops below coupon minimum purchase, auto-remove coupon
  useEffect(() => {
    if (
      appliedCoupon &&
      subtotal > 0 &&
      subtotal < (appliedCoupon.minPurchase || 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Coupon Removed",
        text: `Coupon '${appliedCoupon.code}' requires a min purchase of ₹${appliedCoupon.minPurchase}. Current subtotal is ₹${subtotal.toFixed(0)}.`,
        confirmButtonColor: "#0aad4b",
      });
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput || "").trim().toUpperCase();
    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Coupon Code Required",
        text: "Please enter or select a coupon code.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }
    if (cart.length === 0 || subtotal <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Cart is Empty",
        text: "Add items to your cart before applying a coupon.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    try {
      setCouponLoading(true);
      const { data } = await API.post("/coupons/validate", {
        code,
        orderAmount: subtotal,
      });

      if (data?.success && data?.data) {
        setAppliedCoupon(data.data);
        setCouponInput("");
        setDiscount(0);
        Swal.fire({
          icon: "success",
          title: "Coupon Applied!",
          text: data.message || `Saved ₹${data.data.discountAmount}`,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data?.message || "Invalid coupon");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to validate coupon.";
      Swal.fire({
        icon: "error",
        title: "Coupon Invalid",
        text: msg,
        confirmButtonColor: "#0aad4b",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

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
          setAmountReceived(String(totalAmount.toFixed(0)));

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
    setAppliedCoupon(null);
    setCouponInput("");
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
  // DOWNLOAD PDF BILL
  // =========================================================
  const downloadBillPDF = (bill) => {
    const targetBill = bill || completedBill;
    if (!targetBill) {
      Swal.fire({
        icon: "info",
        title: "No Completed Bill",
        text: "Please complete a sale first to download the bill.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    try {
      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
      });

      const invNo = targetBill.invoiceNumber || invoiceNumber || "INVOICE";

      // Top Brand Header Banner
      doc.setFillColor(10, 173, 75); // #0aad4b
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("GROCERY SATHI", 105, 12, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Fresh Grocery, Better Living | Retail Invoice and Receipt", 105, 18, { align: "center" });

      // Invoice Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice No: ${invNo}`, 14, 34);
      doc.text(`Date: ${targetBill.date || formattedDate}`, 140, 34);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Payment Mode: ${targetBill.paymentMethod || "Cash"}`, 14, 40);
      doc.text(`Time: ${targetBill.time || formattedTime}`, 140, 40);

      let currentY = 46;
      if (targetBill.customerName || targetBill.customerMobile) {
        const parts = [
          targetBill.customerName ? `Customer: ${targetBill.customerName}` : "",
          targetBill.customerMobile ? `Mobile: ${targetBill.customerMobile}` : "",
        ].filter(Boolean).join("   |   ");
        doc.text(parts, 14, currentY);
        currentY += 6;
      }

      if (targetBill.paymentMethod === "UPI" && targetBill.upiVpa) {
        doc.text(`UPI Paid To: ${targetBill.upiVpa}`, 14, currentY);
        currentY += 6;
      }

      currentY += 2;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, currentY, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      doc.text("#", 18, currentY + 5.5);
      doc.text("Item Name", 30, currentY + 5.5);
      doc.text("Unit", 105, currentY + 5.5);
      doc.text("Qty", 130, currentY + 5.5);
      doc.text("Price (Rs.)", 152, currentY + 5.5);
      doc.text("Total (Rs.)", 176, currentY + 5.5);

      currentY += 8;

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      const items = targetBill.items || [];
      items.forEach((item, idx) => {
        if (currentY > 265) {
          doc.addPage();
          currentY = 20;
        }

        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(14, currentY, 182, 8, "F");

        doc.text(String(idx + 1), 18, currentY + 5.5);
        const nameText = item.name ? (item.name.length > 36 ? item.name.slice(0, 33) + "..." : item.name) : "Item";
        doc.text(nameText, 30, currentY + 5.5);
        doc.text(item.quantityLabel || item.unit || "-", 105, currentY + 5.5);
        doc.text(String(item.quantity), 130, currentY + 5.5);
        doc.text(Number(item.price).toFixed(2), 152, currentY + 5.5);
        doc.text((Number(item.price) * Number(item.quantity)).toFixed(2), 176, currentY + 5.5);

        currentY += 8;
      });

      // Divider
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(14, currentY + 2, 196, currentY + 2);
      currentY += 6;

      if (currentY > 235) {
        doc.addPage();
        currentY = 20;
      }

      // Summary
      const subtotalVal = Number(targetBill.subtotal || 0).toFixed(2);
      const discountVal = Number(targetBill.discountAmount || 0).toFixed(2);
      const totalVal = Number(targetBill.totalAmount || 0).toFixed(2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Subtotal:", 135, currentY + 5);
      doc.text(`Rs. ${subtotalVal}`, 176, currentY + 5);
      currentY += 6;

      if (Number(targetBill.discountAmount) > 0) {
        doc.setTextColor(22, 163, 74);
        const discLabel = targetBill.couponCode ? `Coupon (${targetBill.couponCode}):` : "Discount:";
        doc.text(discLabel, 135, currentY + 5);
        doc.text(`-Rs. ${discountVal}`, 176, currentY + 5);
        currentY += 6;
      }

      // Grand Total Box
      doc.setFillColor(240, 253, 244);
      doc.rect(133, currentY + 1, 63, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Grand Total:", 135, currentY + 7);
      doc.text(`Rs. ${totalVal}`, 176, currentY + 7);
      currentY += 13;

      if (targetBill.paymentMethod === "Cash") {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Cash Received: Rs. ${Number(targetBill.received || 0).toFixed(2)}`, 135, currentY);
        doc.text(`Change Returned: Rs. ${Number(targetBill.change || 0).toFixed(2)}`, 135, currentY + 5);
        currentY += 9;
      }

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY + 6, 196, currentY + 6);
      currentY += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Thank you for shopping at Grocery Sathi!", 105, currentY, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Visit Again  |  Fresh Products  |  Everyday Low Prices", 105, currentY + 5, { align: "center" });
      doc.text("Support: +91 98878 68746  |  support@grocerysathi.com", 105, currentY + 9, { align: "center" });

      doc.save(`${invNo}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      Swal.fire({
        icon: "error",
        title: "Download Error",
        text: "Could not generate PDF bill. Please try again.",
        confirmButtonColor: "#0aad4b",
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
        title: "Cart is Empty",
        text: "Please add products before completing the sale.",
        confirmButtonColor: "#0aad4b",
      });
      return;
    }

    if (totalAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Total Amount is Rs. 0",
        text: "Bill total must be greater than zero. Please adjust items or discounts.",
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
      if (!amountReceived || Number(amountReceived) <= 0) {
        Swal.fire({
          icon: "error",
          title: "Amount Received Required",
          text: `Please enter the cash received (Total: Rs. ${totalAmount.toFixed(0)}).`,
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
      if (received < totalAmount) {
        Swal.fire({
          icon: "error",
          title: "Insufficient Cash",
          text: `Customer owes Rs. ${totalAmount.toFixed(0)}, but only Rs. ${received.toFixed(0)} was entered. Shortfall: Rs. ${(totalAmount - received).toFixed(0)}.`,
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
    } else if (paymentMethod === "UPI") {
      if (!upiQr) {
        Swal.fire({
          icon: "error",
          title: "QR Not Ready",
          text: "Please wait for the UPI QR to generate or click Refresh QR.",
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
      if (upiCountdown <= 0) {
        Swal.fire({
          icon: "warning",
          title: "QR Code Expired",
          text: "The payment session expired. Please click 'Refresh QR' to generate a fresh QR.",
          confirmButtonColor: "#0aad4b",
        });
        return;
      }
    }

    const actualReceived = paymentMethod === "UPI" ? totalAmount : received;
    const actualChange = paymentMethod === "UPI" ? 0 : change;

    // Snapshot everything BEFORE clearing state
    const snapshot = {
      items: cart.map((item) => ({ ...item })),
      customerName: customerName.trim(),
      customerMobile: trimmedMobile,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      discountType: appliedCoupon ? appliedCoupon.discountType : discountType,
      discountValue: appliedCoupon
        ? appliedCoupon.discountValue
        : Number(discount || 0),
      discountAmount: safeDiscount,
      subtotal,
      totalAmount,
      received: actualReceived,
      change: actualChange,
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
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      discountType: appliedCoupon ? appliedCoupon.discountType : discountType,
      discountValue: appliedCoupon
        ? appliedCoupon.discountValue
        : Number(discount || 0),
      discountAmount: safeDiscount,
      paymentMethod,
      amountReceived: actualReceived,
      upiTransactionId:
        paymentMethod === "UPI"
          ? upiTransactionId.trim() || `UPI-${Date.now().toString().slice(-6)}`
          : "",
      upiStatus: paymentMethod === "UPI" ? "received" : "none",
    };

    try {
      setSubmitting(true);
      const { data } = await API.post("/bills", payload);

      if (!data?.success || !data?.bill) {
        throw new Error(data?.message || "Failed to save bill.");
      }

      const savedBill = data.bill;
      const billSnapshot = {
        ...snapshot,
        invoiceNumber: savedBill.invoiceNumber,
        couponCode: savedBill.couponCode || snapshot.couponCode || "",
      };

      // Save snapshot + invoice number
      setCompletedBill(billSnapshot);
      setInvoiceNumber(savedBill.invoiceNumber);

      // Auto-download bill PDF immediately!
      try {
        downloadBillPDF(billSnapshot);
      } catch (pdfErr) {
        console.error("Auto PDF download error:", pdfErr);
      }

      // Clear cart + inputs, mark sale complete
      setCart([]);
      setUpiQr(null);
      setUpiCountdown(0);
      setUpiTransactionId("");
      setCustomerName("");
      setCustomerMobile("");
      setDiscount(0);
      setAppliedCoupon(null);
      setAmountReceived("");
      setSaleCompleted(true);

      Swal.fire({
        icon: "success",
        title: "Bill Generated & Downloaded!",
        text: `Invoice #${savedBill.invoiceNumber} has been generated and PDF downloaded.`,
        confirmButtonColor: "#0aad4b",
      });

      fetchProducts();
      fetchCoupons();
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
    fetchCoupons();
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
                  className={
                    customerMobile && customerMobile.length < 10
                      ? "Billing-input-warn"
                      : customerMobile && customerMobile.length === 10
                      ? "Billing-input-valid"
                      : ""
                  }
                />
                {customerMobile && customerMobile.length < 10 ? (
                  <span className="Billing-inline-err">
                    ⚠️ Enter 10 digits ({customerMobile.length}/10)
                  </span>
                ) : customerMobile && customerMobile.length === 10 ? (
                  <span className="Billing-inline-success">
                    ✓ Valid 10-digit mobile
                  </span>
                ) : null}
              </div>
            </div>

            {/* COUPON & OFFERS SECTION */}
            <div className="Billing-couponSection">
              <div className="Billing-couponHeader">
                <div className="Billing-couponTitle">
                  <Tag size={15} className="text-emerald" />
                  <span>Store Coupons & Offers</span>
                </div>
                {appliedCoupon && (
                  <span className="Billing-couponBadgeApplied">Active</span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="Billing-couponAppliedCard">
                  <div className="Billing-couponAppliedInfo">
                    <CheckCircle2 size={18} className="text-emerald" />
                    <div>
                      <strong className="Billing-couponAppliedCode">
                        {appliedCoupon.code}
                      </strong>
                      <span className="Billing-couponAppliedDesc">
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% OFF`
                          : `₹${appliedCoupon.discountValue} OFF`}
                        {" "}(Saved ₹{couponDiscountAmount.toFixed(0)})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="Billing-couponRemoveBtn"
                    onClick={handleRemoveCoupon}
                    disabled={saleCompleted}
                    title="Remove coupon"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="Billing-couponInputWrap">
                  <div className="Billing-couponInputRow">
                    <input
                      type="text"
                      placeholder="Enter coupon code (e.g. DEMO)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={saleCompleted}
                      className="Billing-couponInput"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon(couponInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(couponInput)}
                      disabled={saleCompleted || !couponInput.trim() || couponLoading}
                      className="Billing-couponApplyBtn"
                    >
                      {couponLoading ? "Checking…" : "Apply"}
                    </button>
                  </div>

                  {availableCoupons.length > 0 && (
                    <div className="Billing-couponList">
                      <span className="Billing-couponListLabel">Available Coupons:</span>
                      <div className="Billing-couponChips">
                        {availableCoupons.map((c) => {
                          const isEligible = subtotal >= (c.minPurchase || 0);
                          return (
                            <button
                              key={c._id || c.code}
                              type="button"
                              className={`Billing-couponChip ${isEligible ? "eligible" : "ineligible"}`}
                              onClick={() => handleApplyCoupon(c.code)}
                              disabled={saleCompleted}
                              title={
                                isEligible
                                  ? `Click to apply ${c.code}`
                                  : `Min cart ₹${c.minPurchase} needed`
                              }
                            >
                              <span className="chip-code">{c.code}</span>
                              <span className="chip-disc">
                                {c.discountType === "percentage"
                                  ? `${c.discountValue}% OFF`
                                  : `₹${c.discountValue} OFF`}
                              </span>
                              {c.minPurchase > 0 && (
                                <span className="chip-min">Min ₹{c.minPurchase}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Discount (Fallback if no coupon) */}
              {!appliedCoupon && (
                <div className="Billing-manualDiscountWrap">
                  <div className="Billing-manualDiscountHeader">
                    <span>Or Custom Discount</span>
                  </div>
                  <div className="Billing-discountRow">
                    <div className="Billing-discountType">
                      <button
                        type="button"
                        className={
                          discountType === "percentage"
                            ? "Billing-discountActive"
                            : ""
                        }
                        onClick={() => setDiscountType("percentage")}
                        disabled={saleCompleted}
                      >
                        <Percent size={14} />
                      </button>
                      <button
                        type="button"
                        className={
                          discountType === "amount"
                            ? "Billing-discountActive"
                            : ""
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
                      max={discountType === "percentage" ? 100 : subtotal}
                      value={discount || ""}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val < 0) val = 0;
                        if (discountType === "percentage" && val > 100) val = 100;
                        if (discountType === "amount" && val > subtotal) val = subtotal;
                        setDiscount(val);
                      }}
                      placeholder="0"
                      disabled={saleCompleted}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="Billing-summary">
              <div className="Billing-summaryRow">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(0)}</strong>
              </div>
              {appliedCoupon ? (
                <div className="Billing-summaryRow Billing-summaryCouponRow">
                  <span>
                    Coupon Discount ({appliedCoupon.code})
                  </span>
                  <strong className="text-emerald">
                    -₹{safeDiscount.toFixed(0)}
                  </strong>
                </div>
              ) : safeDiscount > 0 ? (
                <div className="Billing-summaryRow">
                  <span>Discount</span>
                  <strong>-₹{safeDiscount.toFixed(0)}</strong>
                </div>
              ) : null}
              {totalSavings > 0 && (
                <div className="Billing-summaryRow Billing-summarySavingsRow">
                  <span>Product Savings</span>
                  <strong style={{ color: "#059669" }}>
                    -₹{totalSavings.toFixed(0)}
                  </strong>
                </div>
              )}
              <div className="Billing-total">
                <span>Total Amount to Pay</span>
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
                    onClick={() => {
                      setPaymentMethod(method);
                      if (method === "UPI") {
                        setAmountReceived(String(totalAmount.toFixed(0)));
                        setUpiRefreshKey((k) => k + 1);
                      }
                    }}
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
                    placeholder={`e.g. ${totalAmount.toFixed(0)}`}
                  />
                </div>

                {/* Quick Cash Suggestions */}
                <div className="Billing-quick-cash-row">
                  <button
                    type="button"
                    className="quick-cash-chip exact"
                    onClick={() => setAmountReceived(String(totalAmount.toFixed(0)))}
                  >
                    Exact: ₹{totalAmount.toFixed(0)}
                  </button>
                  {[50, 100, 200, 500, 2000].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="quick-cash-chip"
                      onClick={() => setAmountReceived(String(c))}
                    >
                      ₹{c}
                    </button>
                  ))}
                </div>

                {amountReceived !== "" && received < totalAmount ? (
                  <div className="Billing-cash-shortfall">
                    <AlertCircle size={13} />
                    <span>Shortfall: ₹{(totalAmount - received).toFixed(0)} remaining to collect</span>
                  </div>
                ) : null}

                <div className="Billing-change">
                  <span>Change to Return</span>
                  <strong style={{ color: received >= totalAmount ? "#059669" : "#1f2937" }}>
                    ₹{change.toFixed(0)}
                  </strong>
                </div>
              </>
            )}

            {/* UPI — only when NOT completed */}
            {paymentMethod === "UPI" && !saleCompleted && (
              <div className="Billing-upiPanel">
                {cart.length === 0 || totalAmount <= 0 ? (
                  <div className="Billing-upiLoading">
                    <AlertCircle size={32} color="#f59e0b" />
                    <p style={{ margin: "4px 0 2px", fontWeight: 700, color: "#0f172a" }}>
                      Cart is Empty
                    </p>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Add items to cart to generate a dynamic UPI QR code.
                    </span>
                  </div>
                ) : upiLoading ? (
                  <div className="Billing-upiLoading">
                    <Package size={32} />
                    <p>Generating dynamic UPI QR code…</p>
                  </div>
                ) : upiQr ? (
                  <>
                    <div className="Billing-upi-amount-banner">
                      <span className="upi-banner-caption">Total Amount to Pay</span>
                      <strong className="upi-banner-val">
                        ₹{Number(upiQr.amount).toFixed(2)}
                      </strong>
                    </div>

                    <div
                      className="Billing-upiQrWrap"
                      title="Click QR to refresh or scan with GPay, PhonePe, Paytm, BHIM"
                    >
                      <img
                        src={upiQr.qrUrl}
                        alt="UPI QR"
                        className="Billing-upiQrImg"
                        onClick={() => {
                          setUpiQr(null);
                          setUpiRefreshKey((k) => k + 1);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="Billing-upiQrMeta">
                        <span className="Billing-upiTo">
                          Merchant: <strong>{upiQr.merchantName}</strong>
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
                        <RotateCcw size={14} />
                        Refresh QR
                      </button>
                    </div>

                    {/* RECEIVE AMOUNT CARD */}
                    <div className="Billing-upi-receive-card">
                      <div className="receive-amount-header">
                        <CheckCircle2 size={16} className="text-emerald" />
                        <span>Amount to Receive:</span>
                        <strong className="text-emerald">
                          ₹{Number(upiQr.amount).toFixed(2)}
                        </strong>
                      </div>
                      <p className="receive-amount-hint">
                        Exact amount will be received directly in{" "}
                        <strong>{upiQr.merchantName}</strong> ({upiQr.vpa}) account.
                      </p>
                    </div>

                    <div className="Billing-upiInstructionCard">
                      <CheckCircle2 size={16} className="text-emerald" />
                      <span>Customer can scan and pay with any UPI app. Once paid, click <strong>Complete Sale & Download Bill</strong> below.</span>
                    </div>
                  </>
                ) : (
                  <div className="Billing-upiLoading">
                    <AlertCircle size={32} />
                    <p>Could not generate QR code.</p>
                    <button
                      type="button"
                      className="Billing-upiRefreshBtn"
                      style={{ marginTop: "8px" }}
                      onClick={() => {
                        setUpiQr(null);
                        setUpiRefreshKey((k) => k + 1);
                      }}
                    >
                      <RotateCcw size={14} />
                      Retry Generate QR
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="Billing-actionButtons">
              {saleCompleted ? (
                <>
                  <button
                    type="button"
                    className="Billing-downloadBillBtn"
                    onClick={() => downloadBillPDF(completedBill)}
                  >
                    <Download size={19} />
                    Download Bill (PDF)
                  </button>
                  <button
                    type="button"
                    className="Billing-newBillBtn"
                    onClick={newBill}
                  >
                    <FileText size={19} />
                    New Bill
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="Billing-completeButton full-width"
                  onClick={completeSale}
                  disabled={submitting || cart.length === 0}
                >
                  <Check size={19} />
                  {submitting
                    ? "Saving Bill & Downloading PDF…"
                    : "Complete Sale & Download Bill"}
                </button>
              )}
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
                  <span>
                    {completedBill.couponCode
                      ? `Coupon Discount (${completedBill.couponCode})`
                      : "Discount"}
                  </span>
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
              <button
                type="button"
                onClick={() => downloadBillPDF(completedBill)}
                className="Billing-downloadBillBtn"
              >
                <Download size={18} />
                Download Bill (PDF)
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

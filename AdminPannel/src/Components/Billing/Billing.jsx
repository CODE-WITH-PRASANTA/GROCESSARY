import React, { useMemo, useState } from "react";
import {
  Search,
  ScanLine,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  IndianRupee,
  CreditCard,
  Printer,
  Check,
  FileText,
  X,
  Wifi,
  CalendarDays,
  Settings,
  ChevronDown,
  RotateCcw,
  Package,
  Banknote,
  Smartphone,
} from "lucide-react";

import Swal from "sweetalert2";
import "./Billing.css";

const Billing = () => {
  // =========================================================
  // PRODUCTS
  // =========================================================

  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      quantityLabel: "5 kg",
      price: 245,
      category: "Grocery",
      image:
        "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Fortune Sunflower Oil",
      quantityLabel: "1 L",
      price: 145,
      category: "Grocery",
      image:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Tata Salt",
      quantityLabel: "1 kg",
      price: 28,
      category: "Grocery",
      image:
        "https://images.unsplash.com/photo-1518110925495-5aa9b4e7c0c9?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      name: "Amul Taaza Milk",
      quantityLabel: "1 L",
      price: 60,
      category: "Dairy",
      image:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 5,
      name: "Maggi Noodles",
      quantityLabel: "70 g",
      price: 14,
      category: "Snacks",
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 6,
      name: "Surf Excel",
      quantityLabel: "1 kg",
      price: 155,
      category: "Cleaning",
      image:
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 7,
      name: "Dove Soap",
      quantityLabel: "100 g",
      price: 48,
      category: "Personal Care",
      image:
        "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 8,
      name: "Colgate Toothpaste",
      quantityLabel: "100 g",
      price: 52,
      category: "Personal Care",
      image:
        "https://images.unsplash.com/photo-1559591937-e6b6e4e3f8f4?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 9,
      name: "Lays Chips",
      quantityLabel: "52 g",
      price: 20,
      category: "Snacks",
      image:
        "https://images.unsplash.com/photo-1621939514649-280e2aa8ad9b?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 10,
      name: "Red Bull",
      quantityLabel: "250 ml",
      price: 110,
      category: "Beverages",
      image:
        "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 11,
      name: "Tide Detergent",
      quantityLabel: "1 kg",
      price: 140,
      category: "Cleaning",
      image:
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 12,
      name: "Dettol Handwash",
      quantityLabel: "200 ml",
      price: 85,
      category: "Personal Care",
      image:
        "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 13,
      name: "Thums Up",
      quantityLabel: "750 ml",
      price: 45,
      category: "Beverages",
      image:
        "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 14,
      name: "Parle-G Biscuits",
      quantityLabel: "800 g",
      price: 80,
      category: "Snacks",
      image:
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 15,
      name: "Nescafe Coffee",
      quantityLabel: "100 g",
      price: 320,
      category: "Beverages",
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 16,
      name: "Britannia Bread",
      quantityLabel: "400 g",
      price: 45,
      category: "Dairy",
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const categories = [
    "All",
    "Grocery",
    "Beverages",
    "Snacks",
    "Dairy",
    "Personal Care",
    "Cleaning",
  ];

  // =========================================================
  // STATES
  // =========================================================

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
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const searchMatch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  // =========================================================
  // BILL CALCULATIONS
  // =========================================================

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountAmount =
    discountType === "percentage"
      ? (subtotal * Number(discount || 0)) / 100
      : Number(discount || 0);

  const safeDiscount = Math.min(discountAmount, subtotal);

  const cgst = 0;
  const sgst = 0;

  const totalAmount = Math.max(
    0,
    subtotal - safeDiscount + cgst + sgst
  );

  const received = Number(amountReceived || 0);

  const change = Math.max(0, received - totalAmount);

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const addToBill = (product) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // =========================================================
  // QUANTITY
  // =========================================================

  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromBill = (id) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  };

  // =========================================================
  // CLEAR BILL
  // =========================================================

  const clearBill = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Bill is already empty",
        text: "There are no products in the current bill.",
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
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      setCart([]);
      setDiscount(0);
      setAmountReceived("");
      setCustomerName("");
      setSaleCompleted(false);

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
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No products added",
        text: "Please add at least one product to the bill.",
        confirmButtonColor: "#0aad4b",
      });

      return;
    }

    if (paymentMethod === "Cash" && received < totalAmount) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Amount",
        text: `Customer needs to pay ₹${totalAmount.toFixed(
          0
        )}.`,
        confirmButtonColor: "#0aad4b",
      });

      return;
    }

    const generatedInvoice =
      "GS" +
      new Date()
        .toISOString()
        .replace(/\D/g, "")
        .slice(0, 12);

    setInvoiceNumber(generatedInvoice);
    setSaleCompleted(true);

    Swal.fire({
      icon: "success",
      title: "Bill Generated Successfully!",
      text: `Invoice #${generatedInvoice}`,
      confirmButtonColor: "#0aad4b",
    });
  };

  // =========================================================
  // NEW BILL
  // =========================================================

  const newBill = async () => {
    if (cart.length > 0) {
      const result = await Swal.fire({
        icon: "question",
        title: "Start New Bill?",
        text: "The current bill will be cleared.",
        showCancelButton: true,
        confirmButtonText: "Yes, New Bill",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#0aad4b",
      });

      if (!result.isConfirmed) return;
    }

    setCart([]);
    setDiscount(0);
    setAmountReceived("");
    setCustomerName("");
    setSaleCompleted(false);
    setInvoiceNumber("");
  };

  // =========================================================
  // PRINT RECEIPT
  // =========================================================

  const printBill = () => {
    if (!saleCompleted || !invoiceNumber) {
      Swal.fire({
        icon: "info",
        title: "Complete the sale first",
        text: "Generate the bill before printing it.",
        confirmButtonColor: "#0aad4b",
      });

      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=450,height=750"
    );

    if (!printWindow) {
      Swal.fire({
        icon: "error",
        title: "Print blocked",
        text: "Please allow popups in your browser to print the bill.",
        confirmButtonColor: "#0aad4b",
      });

      return;
    }

    const receiptItems = cart
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              ${item.name}
              <br />
              <small>${item.quantityLabel}</small>
            </td>
            <td>₹${item.price}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price * item.quantity}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${invoiceNumber}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 25px;
            font-family: Arial, sans-serif;
            color: #111827;
          }

          .receipt {
            width: 100%;
            max-width: 430px;
            margin: auto;
          }

          .logo {
            text-align: center;
            color: #078c3e;
            font-size: 27px;
            font-weight: 800;
            margin-bottom: 4px;
          }

          .tagline {
            text-align: center;
            font-size: 13px;
            color: #475569;
            margin-bottom: 20px;
          }

          .success {
            text-align: center;
            border: 1px solid #bbf7d0;
            background: #ecfdf5;
            padding: 12px;
            border-radius: 10px;
            color: #087b38;
            font-weight: 700;
            margin-bottom: 18px;
          }

          .details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 15px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th {
            background: #f1f5f9;
            text-align: left;
          }

          th,
          td {
            padding: 8px 5px;
            border-bottom: 1px solid #e5e7eb;
          }

          .summary {
            margin-top: 18px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 13px;
          }

          .grand {
            margin-top: 8px;
            padding: 12px;
            background: #eaffed;
            border-radius: 8px;
            color: #087b38;
            font-weight: 800;
            font-size: 18px;
          }

          .thankyou {
            text-align: center;
            margin-top: 25px;
            font-size: 13px;
            color: #475569;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>

        <div class="receipt">

          <div class="success">
            BILL GENERATED SUCCESSFULLY
          </div>

          <div class="logo">
            Grocery Sati
          </div>

          <div class="tagline">
            Fresh Grocery, Better Living!
          </div>

          <div class="details">
            <span>
              Invoice: ${invoiceNumber}
            </span>

            <span>
              Date: ${formattedDate}
            </span>
          </div>

          <div class="details">
            <span>
              Customer: ${customerName || "Walk-in Customer"}
            </span>

            <span>
              Payment: ${paymentMethod}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${receiptItems}
            </tbody>
          </table>

          <div class="summary">

            <div class="row">
              <span>Subtotal</span>
              <strong>₹${subtotal.toFixed(0)}</strong>
            </div>

            <div class="row">
              <span>Discount</span>
              <strong>₹${safeDiscount.toFixed(0)}</strong>
            </div>

            <div class="row">
              <span>CGST</span>
              <strong>₹0</strong>
            </div>

            <div class="row">
              <span>SGST</span>
              <strong>₹0</strong>
            </div>

            <div class="grand">
              <div class="row">
                <span>Total Amount</span>
                <span>₹${totalAmount.toFixed(0)}</span>
              </div>
            </div>

            <div class="row">
              <span>Amount Received</span>
              <strong>₹${received.toFixed(0)}</strong>
            </div>

            <div class="row">
              <span>Change</span>
              <strong>₹${change.toFixed(0)}</strong>
            </div>

          </div>

          <div class="thankyou">
            Thank you for shopping with us!
            <br />
            Visit Again • Fresh Products • Everyday Low Prices
          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();

            window.onafterprint = function() {
              window.close();
            };
          };
        </script>

      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // =========================================================
  // PAYMENT ICON
  // =========================================================

  const PaymentIcon = ({ method }) => {
    if (method === "Cash") {
      return <Banknote size={19} />;
    }

    if (method === "UPI") {
      return <Smartphone size={19} />;
    }

    return <CreditCard size={19} />;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="Billing-page">

      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <header className="Billing-header">

        <div className="Billing-brand">

          <div className="Billing-logoIcon">
            <ShoppingCart size={30} strokeWidth={2.5} />
          </div>

          <div className="Billing-brandText">
            <h1>Grocery Sati</h1>

            <span>
              Offline Billing Software
            </span>
          </div>

        </div>

        <div className="Billing-headerRight">

          <div className="Billing-dateTime">
            <CalendarDays size={17} />
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>

          <div className="Billing-offline">
            <Wifi size={17} />
            Offline Mode
          </div>

          <button className="Billing-headerIcon">
            <Settings size={20} />
          </button>

          <div className="Billing-user">
            <div className="Billing-userAvatar">
              SK
            </div>

            <div className="Billing-userInfo">
              <strong>Subha Kant</strong>
              <span>Cashier</span>
            </div>

            <ChevronDown size={17} />
          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="Billing-main">

        {/* ===================================================
            LEFT PRODUCTS SECTION
        ==================================================== */}

        <section className="Billing-productsSection">

          {/* Search */}

          <div className="Billing-search">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search product by name, code or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              type="button"
              className="Billing-scanButton"
              title="Scan Barcode"
              onClick={() => {
                Swal.fire({
                  icon: "info",
                  title: "Barcode Scanner",
                  text: "Barcode scanner is ready. Connect your scanner to use it.",
                  confirmButtonColor: "#0aad4b",
                });
              }}
            >
              <ScanLine size={21} />
            </button>

          </div>

          {/* Categories */}

          <div className="Billing-categories">

            {categories.map((category) => (
              <button
                key={category}
                className={`Billing-category ${
                  selectedCategory === category
                    ? "Billing-categoryActive"
                    : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}

          </div>

          {/* Products */}

          <div className="Billing-productsGrid">

            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  className="Billing-productCard"
                  key={product.id}
                >

                  <div className="Billing-productImage">
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/150?text=Product";
                      }}
                    />
                  </div>

                  <div className="Billing-productName">
                    {product.name}
                  </div>

                  <div className="Billing-productQuantity">
                    {product.quantityLabel}
                  </div>

                  <div className="Billing-productPrice">
                    ₹{product.price}
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
                <p>
                  Try another search or category.
                </p>
              </div>
            )}

          </div>

        </section>

        {/* ===================================================
            CURRENT BILL
        ==================================================== */}

        <section className="Billing-currentBill">

          <div className="Billing-currentBillHeader">

            <div className="Billing-currentBillTitle">

              <ShoppingCart size={24} />

              <h2>
                Current Bill
              </h2>

            </div>

            <button
              className="Billing-clearButton"
              onClick={clearBill}
            >
              <Trash2 size={17} />
              Clear All
            </button>

          </div>

          {/* Bill Items */}

          <div className="Billing-itemsTableWrapper">

            {cart.length === 0 ? (
              <div className="Billing-emptyCart">

                <ShoppingCart size={45} />

                <h3>Your bill is empty</h3>

                <p>
                  Add products from the left side.
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

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <div className="Billing-tableProduct">

                          <img
                            src={item.image}
                            alt={item.name}
                          />

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            <small>
                              {item.quantityLabel}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        ₹{item.price}
                      </td>

                      <td>

                        <div className="Billing-quantityControl">

                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                          >
                            <Minus size={13} />
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                          >
                            <Plus size={13} />
                          </button>

                        </div>

                      </td>

                      <td>
                        <strong>
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(0)}
                        </strong>
                      </td>

                      <td>

                        <button
                          className="Billing-deleteItem"
                          onClick={() =>
                            removeFromBill(item.id)
                          }
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

          {/* Bill Footer */}

          <div className="Billing-billFooter">

            {/* Discount */}

            <div className="Billing-discountRow">

              <div className="Billing-discountType">

                <button
                  className={
                    discountType === "percentage"
                      ? "Billing-discountActive"
                      : ""
                  }
                  onClick={() =>
                    setDiscountType("percentage")
                  }
                >
                  <Percent size={15} />
                </button>

                <button
                  className={
                    discountType === "amount"
                      ? "Billing-discountActive"
                      : ""
                  }
                  onClick={() =>
                    setDiscountType("amount")
                  }
                >
                  ₹
                </button>

              </div>

              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value)
                }
                placeholder="0"
              />

            </div>

            {/* Summary */}

            <div className="Billing-summary">

              <div className="Billing-summaryRow">
                <span>Subtotal</span>
                <strong>
                  ₹{subtotal.toFixed(0)}
                </strong>
              </div>

              <div className="Billing-summaryRow">
                <span>Discount</span>
                <strong>
                  ₹{safeDiscount.toFixed(0)}
                </strong>
              </div>

              <div className="Billing-summaryRow">
                <span>CGST (0%)</span>
                <strong>
                  ₹0
                </strong>
              </div>

              <div className="Billing-summaryRow">
                <span>SGST (0%)</span>
                <strong>
                  ₹0
                </strong>
              </div>

              <div className="Billing-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹{totalAmount.toFixed(0)}
                </strong>

              </div>

            </div>

            {/* Payment */}

            <div className="Billing-payment">

              <h3>
                Payment Method
              </h3>

              <div className="Billing-paymentMethods">

                {["Cash", "UPI", "Card"].map(
                  (method) => (
                    <button
                      key={method}
                      className={
                        paymentMethod === method
                          ? "Billing-paymentActive"
                          : ""
                      }
                      onClick={() =>
                        setPaymentMethod(method)
                      }
                    >
                      <PaymentIcon
                        method={method}
                      />

                      {method}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* Amount */}

            <div className="Billing-amountRow">

              <label>
                Amount Received
              </label>

              <input
                type="number"
                min="0"
                value={amountReceived}
                onChange={(e) =>
                  setAmountReceived(
                    e.target.value
                  )
                }
                placeholder="0"
              />

            </div>

            {/* Change */}

            <div className="Billing-change">

              <span>
                Change
              </span>

              <strong>
                ₹{change.toFixed(0)}
              </strong>

            </div>

            {/* Buttons */}

            <div className="Billing-actionButtons">

              <button
                className="Billing-printButton"
                onClick={printBill}
              >
                <Printer size={19} />
                Print Bill
              </button>

              <button
                className="Billing-completeButton"
                onClick={completeSale}
              >
                <Check size={19} />
                Complete Sale
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            RECEIPT SECTION
        ==================================================== */}

        {saleCompleted && (
          <section className="Billing-receiptSection">

            <button
              className="Billing-receiptClose"
              onClick={() =>
                setSaleCompleted(false)
              }
            >
              <X size={21} />
            </button>

            <div className="Billing-successBox">

              <div className="Billing-successIcon">
                <Check size={30} />
              </div>

              <h2>
                Bill Generated Successfully!
              </h2>

              <p>
                Invoice #{invoiceNumber}
              </p>

            </div>

            <div className="Billing-receipt">

              <div className="Billing-receiptBrand">
                Grocery Sati
              </div>

              <div className="Billing-receiptTagline">
                Fresh Grocery, Better Living!
              </div>

              <div className="Billing-receiptLine" />

              <div className="Billing-receiptDetails">

                <span>
                  Invoice No:
                  <strong>
                    {invoiceNumber}
                  </strong>
                </span>

                <span>
                  Date:
                  <strong>
                    {formattedDate}
                  </strong>
                </span>

                <span>
                  Time:
                  <strong>
                    {formattedTime}
                  </strong>
                </span>

                <span>
                  Mode:
                  <strong>
                    {paymentMethod}
                  </strong>
                </span>

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

                  {cart.map(
                    (item, index) => (
                      <tr key={item.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {item.name}
                        </td>

                        <td>
                          ₹{item.price}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(0)}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

              <div className="Billing-receiptSummary">

                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹{subtotal.toFixed(0)}
                  </strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>
                    ₹{safeDiscount.toFixed(0)}
                  </strong>
                </div>

                <div>
                  <span>CGST (0%)</span>
                  <strong>
                    ₹0
                  </strong>
                </div>

                <div>
                  <span>SGST (0%)</span>
                  <strong>
                    ₹0
                  </strong>
                </div>

                <div className="Billing-receiptGrandTotal">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹{totalAmount.toFixed(0)}
                  </strong>

                </div>

              </div>

              <div className="Billing-thankYou">

                <strong>
                  Thank you for shopping with us!
                </strong>

                <span>
                  Visit Again &nbsp; | &nbsp;
                  Fresh Products &nbsp; | &nbsp;
                  Everyday Low Prices
                </span>

              </div>

            </div>

            <div className="Billing-receiptActions">

              <button
                onClick={printBill}
                className="Billing-printAgain"
              >
                <Printer size={18} />
                Print Again
              </button>

              <button
                onClick={newBill}
                className="Billing-newBill"
              >
                <FileText size={18} />
                New Bill
              </button>

              <button
                onClick={() =>
                  setSaleCompleted(false)
                }
                className="Billing-doneButton"
              >
                <Check size={18} />
                Done
              </button>

            </div>

          </section>
        )}

      </main>

    </div>
  );
};

export default Billing;
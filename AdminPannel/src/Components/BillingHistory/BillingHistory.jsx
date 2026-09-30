import React, { useMemo, useState } from "react";
import {
  Menu,
  ShoppingCart,
  Search,
  CalendarDays,
  Wifi,
  Settings,
  Minus,
  Maximize2,
  UserCircle,
  LayoutDashboard,
  FilePlus2,
  ReceiptText,
  Package,
  Grid2X2,
  Users,
  WalletCards,
  BarChart3,
  X,
  Plus,
  RotateCcw,
  Eye,
  Printer,
  Trash2,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserRound,
  ShoppingBasket,
  CreditCard,
  Smartphone,
  Banknote,
  Clock3,
} from "lucide-react";

import "./BillingHistory.css";

const BillingHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const [activeTab, setActiveTab] = useState("All Bills");

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("2026-09-01");
  const [dateTo, setDateTo] = useState("2026-09-28");
  const [paymentMethod, setPaymentMethod] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);

  const billsPerPage = 8;

  const [bills, setBills] = useState([
    {
      id: 1,
      date: "28/09/2026",
      time: "11:25 AM",
      invoice: "GS20260928001",
      items: 4,
      total: 391,
      payment: "Cash",
      customer: "Walk-in",
      contact: "-",
      address: "-",
      products: [
        {
          name: "Aashirvaad Atta",
          variant: "(5 kg)",
          price: 245,
          qty: 1,
          image:
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150",
        },
        {
          name: "Tata Salt",
          variant: "(1 kg)",
          price: 28,
          qty: 2,
          image:
            "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150",
        },
        {
          name: "Maggi Noodles",
          variant: "(70 g)",
          price: 14,
          qty: 3,
          image:
            "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=150",
        },
        {
          name: "Dove Soap",
          variant: "(100 g)",
          price: 48,
          qty: 1,
          image:
            "https://images.unsplash.com/photo-1607006344380-b6775a0824c7?w=150",
        },
      ],
    },
    {
      id: 2,
      date: "28/09/2026",
      time: "10:47 AM",
      invoice: "GS20260928002",
      items: 6,
      total: 625,
      payment: "UPI",
      customer: "Rajesh Kumar",
      contact: "9876543210",
      address: "Cuttack, Odisha",
      products: [],
    },
    {
      id: 3,
      date: "27/09/2026",
      time: "06:32 PM",
      invoice: "GS20260927005",
      items: 3,
      total: 220,
      payment: "Card",
      customer: "Walk-in",
      contact: "-",
      address: "-",
      products: [],
    },
    {
      id: 4,
      date: "27/09/2026",
      time: "04:15 PM",
      invoice: "GS20260927004",
      items: 8,
      total: 1245,
      payment: "Cash",
      customer: "Anita Sahu",
      contact: "9123456789",
      address: "Bhubaneswar, Odisha",
      products: [],
    },
    {
      id: 5,
      date: "27/09/2026",
      time: "11:08 AM",
      invoice: "GS20260927003",
      items: 5,
      total: 482,
      payment: "UPI",
      customer: "Walk-in",
      contact: "-",
      address: "-",
      products: [],
    },
    {
      id: 6,
      date: "26/09/2026",
      time: "07:55 PM",
      invoice: "GS20260926008",
      items: 7,
      total: 965,
      payment: "Card",
      customer: "Suresh Das",
      contact: "9345678123",
      address: "Cuttack, Odisha",
      products: [],
    },
    {
      id: 7,
      date: "26/09/2026",
      time: "01:20 PM",
      invoice: "GS20260926007",
      items: 2,
      total: 145,
      payment: "Cash",
      customer: "Walk-in",
      contact: "-",
      address: "-",
      products: [],
    },
    {
      id: 8,
      date: "26/09/2026",
      time: "11:10 AM",
      invoice: "GS20260926006",
      items: 9,
      total: 1580,
      payment: "UPI",
      customer: "Priya Mehta",
      contact: "9988776655",
      address: "Bhubaneswar, Odisha",
      products: [],
    },
  ]);

  const defaultProducts = [
    {
      name: "Aashirvaad Atta",
      variant: "(5 kg)",
      price: 245,
      qty: 1,
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150",
    },
    {
      name: "Tata Salt",
      variant: "(1 kg)",
      price: 28,
      qty: 2,
      image:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150",
    },
    {
      name: "Maggi Noodles",
      variant: "(70 g)",
      price: 14,
      qty: 3,
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=150",
    },
    {
      name: "Dove Soap",
      variant: "(100 g)",
      price: 48,
      qty: 1,
      image:
        "https://images.unsplash.com/photo-1607006344380-b6775a0824c7?w=150",
    },
  ];

  const activeBill = selectedBill || bills[0];

  const filteredBills = useMemo(() => {
    let result = [...bills];

    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter(
        (bill) =>
          bill.invoice.toLowerCase().includes(value) ||
          bill.customer.toLowerCase().includes(value)
      );
    }

    if (paymentMethod !== "All") {
      result = result.filter((bill) => bill.payment === paymentMethod);
    }

    if (activeTab === "Today") {
      result = result.filter((bill) => bill.date === "28/09/2026");
    }

    if (activeTab === "Yesterday") {
      result = result.filter((bill) => bill.date === "27/09/2026");
    }

    return result;
  }, [bills, search, paymentMethod, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBills.length / billsPerPage)
  );

  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * billsPerPage,
    currentPage * billsPerPage
  );

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setDetailsOpen(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (!confirmDelete) return;

    setBills((prev) => prev.filter((bill) => bill.id !== id));

    if (selectedBill?.id === id) {
      setSelectedBill(null);
    }
  };

  const handleReset = () => {
    setSearch("");
    setDateFrom("2026-09-01");
    setDateTo("2026-09-28");
    setPaymentMethod("All");
    setActiveTab("All Bills");
    setCurrentPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const invoice = activeBill?.invoice || "invoice";

    const content = `
GROCERY SATI
Offline Billing Software

Invoice No: ${invoice}
Date: ${activeBill?.date}
Time: ${activeBill?.time}

Customer: ${activeBill?.customer}

--------------------------------
ITEM                 QTY    TOTAL
--------------------------------
Aashirvaad Atta       1     ₹245
Tata Salt             2     ₹56
Maggi Noodles         3     ₹42
Dove Soap             1     ₹48
--------------------------------

Subtotal: ₹391
Discount: ₹0
CGST: ₹0
SGST: ₹0

TOTAL: ₹391

Thank you for shopping with us!
`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const getPaymentIcon = (payment) => {
    if (payment === "UPI") return <Smartphone size={17} />;
    if (payment === "Card") return <CreditCard size={17} />;
    return <Banknote size={17} />;
  };

  return (
    <div className="BillingHistory">
      {/* ================= HEADER ================= */}
      

      {/* ================= BODY ================= */}
      <div className="BillingHistory-body">
        {/* ================= SIDEBAR ================= */}
      

        {sidebarOpen && (
          <div
            className="BillingHistory-sidebarOverlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className="BillingHistory-main">
          {/* PAGE HEADING */}
          <div className="BillingHistory-pageHeader">
            <div className="BillingHistory-titleArea">
              <div className="BillingHistory-titleIcon">
                <Clock3 size={38} />
              </div>

              <div>
                <h2>Billing History</h2>
                <p>View, search and manage all your past bills</p>
              </div>
            </div>

            <button className="BillingHistory-newBillButton">
              <Plus size={21} />
              New Bill
            </button>
          </div>

          {/* ================= FILTER CARD ================= */}
          <section className="BillingHistory-filterCard">
            <div className="BillingHistory-filterGrid">
              <div className="BillingHistory-filterGroup">
                <label>Date From</label>

                <div className="BillingHistory-inputBox">
                  <CalendarDays size={17} />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
              </div>

              <div className="BillingHistory-filterGroup">
                <label>Date To</label>

                <div className="BillingHistory-inputBox">
                  <CalendarDays size={17} />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="BillingHistory-filterGroup">
                <label>Payment Method</label>

                <div className="BillingHistory-inputBox">
                  <WalletCards size={17} />

                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option>All</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>

                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="BillingHistory-filterGroup">
                <label>Search</label>

                <div className="BillingHistory-inputBox">
                  <Search size={17} />

                  <input
                    type="text"
                    placeholder="Invoice no, customer, product..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="BillingHistory-filterBottom">
              <div className="BillingHistory-tabs">
                {[
                  "All Bills",
                  "Today",
                  "Yesterday",
                  "This Week",
                  "This Month",
                  "Custom",
                ].map((tab) => (
                  <button
                    key={tab}
                    className={
                      activeTab === tab
                        ? "BillingHistory-tab BillingHistory-activeTab"
                        : "BillingHistory-tab"
                    }
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="BillingHistory-filterActions">
                <button
                  className="BillingHistory-resetButton"
                  onClick={handleReset}
                >
                  <RotateCcw size={17} />
                  Reset
                </button>

                <button className="BillingHistory-searchButton">
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>
          </section>

          {/* ================= STATISTICS ================= */}
          <section className="BillingHistory-statGrid">
            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon green">
                <FileText size={24} />
              </div>

              <div>
                <span>Total Bills</span>
                <strong>156</strong>
                <small>↗ +12% from last month</small>
              </div>
            </div>

            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon blue">
                <WalletCards size={24} />
              </div>

              <div>
                <span>Total Sales</span>
                <strong>₹24,658</strong>
                <small>↗ +8% from last month</small>
              </div>
            </div>

            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon orange">
                <ShoppingBasket size={24} />
              </div>

              <div>
                <span>Avg. Bill Value</span>
                <strong>₹158</strong>
                <small>↗ +5% from last month</small>
              </div>
            </div>

            <div className="BillingHistory-statCard">
              <div className="BillingHistory-statIcon purple">
                <Users size={24} />
              </div>

              <div>
                <span>Total Items Sold</span>
                <strong>412</strong>
                <small>↗ +10% from last month</small>
              </div>
            </div>
          </section>

          {/* ================= BILL TABLE ================= */}
          <section className="BillingHistory-tableCard">
            <div className="BillingHistory-tableWrapper">
              <table className="BillingHistory-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date & Time</th>
                    <th>Invoice No</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                    <th>Customer</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedBills.length > 0 ? (
                    paginatedBills.map((bill, index) => (
                      <tr
                        key={bill.id}
                        className={
                          activeBill?.id === bill.id
                            ? "BillingHistory-selectedRow"
                            : ""
                        }
                      >
                        <td>{index + 1}</td>

                        <td>
                          <div className="BillingHistory-dateCell">
                            <strong>{bill.date}</strong>
                            <span>{bill.time}</span>
                          </div>
                        </td>

                        <td>
                          <span className="BillingHistory-invoiceNumber">
                            {bill.invoice}
                          </span>
                        </td>

                        <td>{bill.items}</td>

                        <td>
                          <strong className="BillingHistory-totalCell">
                            ₹ {bill.total.toLocaleString("en-IN")}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`BillingHistory-paymentBadge ${bill.payment.toLowerCase()}`}
                          >
                            {getPaymentIcon(bill.payment)}
                            {bill.payment}
                          </span>
                        </td>

                        <td>{bill.customer}</td>

                        <td>
                          <div className="BillingHistory-actionButtons">
                            <button
                              title="View"
                              onClick={() => handleViewBill(bill)}
                              className="BillingHistory-viewAction"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              title="Print"
                              onClick={handlePrint}
                              className="BillingHistory-printAction"
                            >
                              <Printer size={17} />
                            </button>

                            <button
                              title="Delete"
                              onClick={() => handleDelete(bill.id)}
                              className="BillingHistory-deleteAction"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="BillingHistory-emptyState"
                      >
                        <FileText size={42} />
                        <strong>No bills found</strong>
                        <span>Try changing your search or filters.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="BillingHistory-pagination">
              <span>
                Showing{" "}
                <strong>
                  {filteredBills.length === 0
                    ? 0
                    : (currentPage - 1) * billsPerPage + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(
                    currentPage * billsPerPage,
                    filteredBills.length
                  )}
                </strong>{" "}
                of <strong>156</strong> bills
              </span>

              <div className="BillingHistory-pageNumbers">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft size={17} />
                </button>

                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "BillingHistory-activePage"
                        : ""
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button>...</button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPages, prev + 1)
                    )
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="BillingHistory-perPage">
                <select defaultValue="8">
                  <option value="8">8 per page</option>
                  <option value="16">16 per page</option>
                  <option value="24">24 per page</option>
                </select>

                <ChevronDown size={15} />
              </div>
            </div>
          </section>
        </main>

        {/* ================= BILL DETAILS ================= */}
        {detailsOpen && (
          <aside className="BillingHistory-detailsPanel">
            <div className="BillingHistory-detailsHeader">
              <div>
                <FileText size={23} />
                <h3>Bill Details</h3>
              </div>

              <button
                onClick={() => setDetailsOpen(false)}
                className="BillingHistory-closeDetails"
              >
                <X size={22} />
              </button>
            </div>

            <div className="BillingHistory-detailsContent">
              {/* Invoice banner */}
              <div className="BillingHistory-invoiceBanner">
                <div className="BillingHistory-invoiceCart">
                  <ShoppingCart size={36} />
                </div>

                <div>
                  <strong>Invoice #{activeBill.invoice}</strong>
                  <span>
                    {activeBill.date} &nbsp;•&nbsp; {activeBill.time}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div className="BillingHistory-customerSection">
                <div className="BillingHistory-sectionTitle">
                  <UserRound size={20} />
                  <strong>Customer Details</strong>
                </div>

                <div className="BillingHistory-customerRows">
                  <div>
                    <span>Name</span>
                    <b>:</b>
                    <strong>{activeBill.customer}</strong>
                  </div>

                  <div>
                    <span>Contact</span>
                    <b>:</b>
                    <strong>{activeBill.contact || "-"}</strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <b>:</b>
                    <strong>{activeBill.address || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="BillingHistory-itemsSection">
                <div className="BillingHistory-sectionTitle">
                  <ShoppingCart size={20} />
                  <strong>
                    Items (
                    {activeBill.products?.length || activeBill.items})
                  </strong>
                </div>

                <div className="BillingHistory-itemTable">
                  <div className="BillingHistory-itemHeader">
                    <span>#</span>
                    <span>Item Name</span>
                    <span>Price</span>
                    <span>Qty</span>
                    <span>Total</span>
                  </div>

                  {(activeBill.products?.length
                    ? activeBill.products
                    : defaultProducts
                  ).map((product, index) => (
                    <div
                      className="BillingHistory-itemRow"
                      key={`${product.name}-${index}`}
                    >
                      <span>{index + 1}</span>

                      <div className="BillingHistory-productInfo">
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />

                        <span>
                          {product.name}
                          <small>{product.variant}</small>
                        </span>
                      </div>

                      <span>₹ {product.price}</span>

                      <span>{product.qty}</span>

                      <strong>
                        ₹ {product.price * product.qty}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="BillingHistory-totalSection">
                <div>
                  <span>Subtotal</span>
                  <strong>₹ 391</strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>₹ 0</strong>
                </div>

                <div>
                  <span>CGST (0%)</span>
                  <strong>₹ 0</strong>
                </div>

                <div>
                  <span>SGST (0%)</span>
                  <strong>₹ 0</strong>
                </div>

                <div className="BillingHistory-grandTotal">
                  <span>Total Amount</span>
                  <strong>₹ {activeBill.total}</strong>
                </div>
              </div>
            </div>

            {/* Details Actions */}
            <div className="BillingHistory-detailsActions">
              <button
                className="BillingHistory-printBill"
                onClick={handlePrint}
              >
                <Printer size={19} />
                Print Bill
              </button>

              <button
                className="BillingHistory-downloadBill"
                onClick={handleDownload}
              >
                <Download size={19} />
                Download
              </button>

              <button
                className="BillingHistory-deleteBill"
                onClick={() => handleDelete(activeBill.id)}
              >
                <Trash2 size={19} />
                Delete
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;
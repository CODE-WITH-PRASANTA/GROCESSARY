import React, { useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  ChevronDown,
  Download,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";

import "./Overview.css";

const Overview = () => {
  const [selectedRange, setSelectedRange] = useState("This Month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dashboard metrics
  const metrics = [
    {
      id: 1,
      title: "Total Sales",
      value: "₹2,48,560",
      change: "18.6%",
      isPositive: true,
      icon: DollarSign,
      iconBg: "green",
    },
    {
      id: 2,
      title: "Total Orders",
      value: "1,248",
      change: "12.4%",
      isPositive: true,
      icon: ShoppingBag,
      iconBg: "purple",
    },
    {
      id: 3,
      title: "Total Customers",
      value: "856",
      change: "8.3%",
      isPositive: true,
      icon: Users,
      iconBg: "blue",
    },
    {
      id: 4,
      title: "Avg. Order Value",
      value: "₹1,248",
      change: "6.7%",
      isPositive: true,
      icon: ShoppingCart,
      iconBg: "orange",
    },
    {
      id: 5,
      title: "Total Products",
      value: "1,248",
      change: "5.2%",
      isPositive: true,
      icon: Package,
      iconBg: "teal",
    },

    // Billing History replaces Total Revenue
    {
      id: 6,
      title: "Billing History",
      value: "156 Bills",
      change: "12.0%",
      isPositive: true,
      icon: ReceiptText,
      iconBg: "green",
    },
  ];

  const timeRanges = [
    "Today",
    "This Week",
    "This Month",
    "This Quarter",
    "This Year",
  ];

  // Download CSV Report
  const handleDownloadReport = () => {
    const csvHeader = "Metric,Value,Growth\n";

    const csvRows = metrics
      .map(
        (item) =>
          `"${item.title}","${item.value}","${item.change}"`
      )
      .join("\n");

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvHeader +
      csvRows;

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);

    link.setAttribute(
      "download",
      `dashboard_report_${selectedRange
        .toLowerCase()
        .replace(/\s+/g, "_")}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="overview">
      {/* ================= HEADER ================= */}
      <header className="overview__header">
        <div className="overview__titles">
          <h1 className="overview__title">
            Dashboard Overview{" "}
            <span className="overview__wave">👋</span>
          </h1>

          <p className="overview__subtitle">
            Welcome back! Here is what's happening with your
            store today.
          </p>
        </div>

        <div className="overview__actions">
          {/* ================= DATE DROPDOWN ================= */}
          <div className="overview__dropdown-container">
            <button
              type="button"
              className="overview__dropdown-btn"
              onClick={() =>
                setIsDropdownOpen(!isDropdownOpen)
              }
            >
              <Calendar
                className="overview__btn-icon"
                size={18}
              />

              <span>{selectedRange}</span>

              <ChevronDown
                className={`overview__chevron ${
                  isDropdownOpen
                    ? "overview__chevron--open"
                    : ""
                }`}
                size={16}
              />
            </button>

            {isDropdownOpen && (
              <ul className="overview__dropdown-menu">
                {timeRanges.map((range) => (
                  <li
                    key={range}
                    className={`overview__dropdown-item ${
                      selectedRange === range
                        ? "overview__dropdown-item--active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedRange(range);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {range}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ================= DOWNLOAD ================= */}
          <button
            type="button"
            className="overview__download-btn"
            onClick={handleDownloadReport}
          >
            <Download size={18} />
            <span>Download Report</span>
          </button>
        </div>
      </header>

      {/* ================= METRICS ================= */}
      <div className="overview__grid">
        {metrics.map((item) => {
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              className="overview-card"
            >
              {/* CARD HEADER */}
              <div className="overview-card__header">
                <div
                  className={`overview-card__icon overview-card__icon--${item.iconBg}`}
                >
                  <IconComponent size={22} />
                </div>

                <div className="overview-card__info">
                  <span className="overview-card__label">
                    {item.title}
                  </span>

                  <h3 className="overview-card__value">
                    {item.value}
                  </h3>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="overview-card__footer">
                <span className="overview-card__badge">
                  <ArrowUpRight size={14} />
                  {item.change}
                </span>

                <span className="overview-card__comparison">
                  vs last month
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Overview;
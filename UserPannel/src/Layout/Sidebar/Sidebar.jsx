import React from "react";
import {
  MdDashboard,
  MdShoppingBag,
  MdFavorite,
  MdAccountBalanceWallet,
  MdLocationOn,
  MdReceiptLong,
  MdLockReset,
  MdClose,
  MdReceipt,
  MdWindow,
} from "react-icons/md";

import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import Logo from "../../assets/Grocessary Sathi.png";


const Sidebar = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard />,
    },
    {
      title: "My Orders",
      path: "/my-orders",
      icon: <MdShoppingBag />,
      count: 3, // Active orders count
    },
    {
      title: "Wishlist",
      path: "/wishlist",
      icon: <MdFavorite />,
      count: 8,
    },
    {
      title: "Wallet & Points",
      path: "/wallet",
      icon: <MdAccountBalanceWallet />,
    },
    {
      title: "Delivery Addresses",
      path: "/addresses",
      icon: <MdLocationOn />,
    },
    {
      title: "Order History",
      path: "/order-history",
      icon: <MdReceiptLong />,
    },
   
    {
      title: "Transaction History",
      path: "trasanction-history",
      icon: <MdReceipt />,
    },
   
    {
      title: "Change Password",
      path: "/change-password",
      icon: <MdLockReset />,
    },
    {
      title: "Refer & Earn",
      path: "/rafer-earn",
      icon: <MdWindow />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="Sidebar_Backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`Sidebar ${collapsed ? "Sidebar_Collapsed" : ""} ${
          mobileOpen ? "Sidebar_MobileOpen" : ""
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="Sidebar_Header">
          <img src={Logo} alt="Grocery Sathi Logo" />

          {!collapsed && <h2>Grocery Sathi</h2>}

          <button
            className="Sidebar_Close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close Sidebar"
          >
            <MdClose />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="Sidebar_Menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "Sidebar_Link Sidebar_LinkActive"
                  : "Sidebar_Link"
              }
            >
              <span className="Sidebar_Icon">{item.icon}</span>

              {!collapsed && (
                <>
                  <p className="Sidebar_Title">{item.title}</p>
                  {item.count !== undefined && (
                    <span className="Sidebar_Badge">{item.count}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
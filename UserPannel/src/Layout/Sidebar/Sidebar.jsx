import React, { useEffect, useState, useCallback } from "react";

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
  MdShoppingCart,
} from "react-icons/md";

import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import Logo from "../../assets/Grocessary Sathi.png";
import API from "../../api/axios";

const Sidebar = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // ======================================================
  // GET CART COUNT
  // ======================================================

  const fetchCartCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await API.get("/cart");

      if (response.data?.success) {
        const items = response.data?.cart?.items || [];

        const totalQuantity = items.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );

        setCartCount(totalQuantity);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
      setCartCount(0);
    }
  }, []);

  // ======================================================
  // GET WISHLIST COUNT
  // ======================================================

  const fetchWishlistCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setWishlistCount(0);
        return;
      }

      const response = await API.get("/wishlist");

      if (response.data?.success) {
        const wishlist = response.data?.wishlist || [];
        setWishlistCount(wishlist.length);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist count:", error);
      setWishlistCount(0);
    }
  }, []);

  // ======================================================
  // GET ORDER COUNT (DYNAMIC)
  // ======================================================

  const fetchOrderCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setOrderCount(0);
        return;
      }

      const response = await API.get("/orders/my");

      if (response.data?.success && Array.isArray(response.data.orders)) {
        // Show total orders placed by the user
        setOrderCount(response.data.orders.length);
      } else {
        setOrderCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch order count:", error);
      setOrderCount(0);
    }
  }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    fetchOrderCount();
  }, [fetchCartCount, fetchWishlistCount, fetchOrderCount]);

  // ======================================================
  // REFRESH WHEN CART UPDATES
  // ======================================================

  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [fetchCartCount]);

  // ======================================================
  // REFRESH WHEN WISHLIST UPDATES
  // ======================================================

  useEffect(() => {
    const handleWishlistUpdated = () => {
      fetchWishlistCount();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, [fetchWishlistCount]);

  // ======================================================
  // REFRESH WHEN ORDER UPDATES
  // ======================================================

  useEffect(() => {
    const handleOrderUpdated = () => {
      fetchOrderCount();
    };

    window.addEventListener("orderUpdated", handleOrderUpdated);

    return () => {
      window.removeEventListener("orderUpdated", handleOrderUpdated);
    };
  }, [fetchOrderCount]);

  // ======================================================
  // REFRESH WHEN AUTH CHANGES (LOGIN / LOGOUT)
  // ======================================================

  useEffect(() => {
    const handleAuthChanged = () => {
      fetchCartCount();
      fetchWishlistCount();
      fetchOrderCount();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, [fetchCartCount, fetchWishlistCount, fetchOrderCount]);

  // ======================================================
  // MENU ITEMS
  // ======================================================

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
      count: orderCount, // 👈 dynamic now
    },

    {
      title: "Wishlist",
      path: "/wishlist",
      icon: <MdFavorite />,
      count: wishlistCount,
    },

    {
      title: "Cart",
      path: "/cart",
      icon: <MdShoppingCart />,
      count: cartCount,
    },

    {
      title: "Order History",
      path: "/order-history",
      icon: <MdReceiptLong />,
    },

    {
      title: "Transaction History",
      path: "/trasanction-history",
      icon: <MdReceipt />,
    },

    {
      title: "Delivery Addresses",
      path: "/addresses",
      icon: <MdLocationOn />,
    },
    {
      title: "Refer & Earn",
      path: "/rafer-earn",
      icon: <MdWindow />,
    },
    {
      title: "Wallet & Points",
      path: "/wallet",
      icon: <MdAccountBalanceWallet />,
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
                isActive ? "Sidebar_Link Sidebar_LinkActive" : "Sidebar_Link"
              }
            >
              <span className="Sidebar_Icon">{item.icon}</span>

              {!collapsed && (
                <>
                  <p className="Sidebar_Title">{item.title}</p>

                  {item.count !== undefined && item.count > 0 && (
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
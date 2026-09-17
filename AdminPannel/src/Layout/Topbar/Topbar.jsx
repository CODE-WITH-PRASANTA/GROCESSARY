import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  CheckCircle,
  Package,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "./Topbar.css";

const notificationsData = [
  {
    id: 1,
    title: "New Order Received",
    time: "2 min ago",
    icon: ShoppingBag,
    color: "#2563EB",
  },
  {
    id: 2,
    title: "New User Registered",
    time: "5 min ago",
    icon: UserPlus,
    color: "#22C55E",
  },
  {
    id: 3,
    title: "Inventory Updated",
    time: "20 min ago",
    icon: Package,
    color: "#F59E0B",
  },
  {
    id: 4,
    title: "Payment Successful",
    time: "1 hour ago",
    icon: CheckCircle,
    color: "#16A34A",
  },
];

const Topbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch logged-in admin profile
  const fetchAdminProfile = async () => {
    try {
      const response = await API.get("/admin/profile");
      setAdmin(response.data.admin);
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);

      // If token is invalid or expired
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigate to profile pages
  const handleProfileNavigation = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await API.post("/admin/logout");

      setAdmin(null);
      setProfileOpen(false);

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      // Redirect anyway because the frontend session should be cleared
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const adminName = admin?.name || "Admin";
  const adminEmail = admin?.email || "";
  const adminAvatar = adminName.charAt(0).toUpperCase();

  return (
    <header className="Topbar">
      <div className="Topbar-left">
        <button
          className="Topbar-toggleBtn"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="SearchBar">
          <Search size={18} className="SearchBar-icon" />

          <input
            type="text"
            placeholder="Search products..."
            className="SearchBar-input"
          />
        </div>
      </div>

      <div className="Topbar-right">
        {/* Notification Container */}
        <div className="Notification" ref={notificationRef}>
          <button
            className="Notification-btn"
            onClick={() => {
              setNotificationOpen((previous) => !previous);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="Notification-badge">5</span>
          </button>

          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                className="NotificationItem-popup"
                initial={{
                  opacity: 0,
                  scale: 0.85,
                  translateY: -10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  translateY: -10,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
              >
                <div className="NotificationItem-header">
                  <h3>Notifications</h3>
                </div>

                <div className="NotificationItem-list">
                  {notificationsData.map((item) => {
                    const IconComponent = item.icon;

                    return (
                      <div
                        key={item.id}
                        className="NotificationItem-single"
                      >
                        <div
                          className="NotificationItem-iconWrapper"
                          style={{
                            backgroundColor: `${item.color}15`,
                            color: item.color,
                          }}
                        >
                          <IconComponent size={16} />
                        </div>

                        <div className="NotificationItem-content">
                          <p className="NotificationItem-title">
                            {item.title}
                          </p>

                          <span className="NotificationItem-time">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="NotificationItem-footer">
                  <button
                    onClick={() => setNotificationOpen(false)}
                  >
                    View All
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="ProfileMenu" ref={profileRef}>
          <button
            type="button"
            className="ProfileMenu-trigger"
            onClick={() => {
              setProfileOpen((previous) => !previous);
              setNotificationOpen(false);
            }}
          >
            <div className="ProfileMenu-avatar">{adminAvatar}</div>

            <div className="ProfileMenu-userInfo">
              <span className="ProfileMenu-name">{adminName}</span>

              {/* {adminEmail && (
                <small className="ProfileMenu-email">
                  {adminEmail}
                </small>
              )} */}
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="ProfileMenu-dropdown"
                initial={{
                  opacity: 0,
                  y: 12,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
              >
                <div className="ProfileMenu-dropdownHeader">
                  <div className="ProfileMenu-avatar large">
                    {adminAvatar}
                  </div>

                  <div>
                    <strong>{adminName}</strong>
                    {/* <span>{adminEmail}</span> */}
                  </div>
                </div>

                <div className="ProfileMenu-divider" />

                <button
                  type="button"
                  className="ProfileMenu-item"
                  onClick={() =>
                    handleProfileNavigation("/admin/profile")
                  }
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  className="ProfileMenu-item"
                  onClick={() =>
                    handleProfileNavigation("/admin/settings")
                  }
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  className="ProfileMenu-item"
                  onClick={() =>
                    handleProfileNavigation("/admin/help")
                  }
                >
                  <HelpCircle size={16} />
                  <span>Help</span>
                </button>

                <div className="ProfileMenu-divider" />

                <button
                  type="button"
                  className="ProfileMenu-item danger"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={16} />

                  <span>
                    {loggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
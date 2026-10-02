import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MdMenu,
  MdNotifications,
  MdPerson,
  MdHistory,
  MdLogout,
  MdCheck,
  MdDelete,
  MdDoneAll,
  MdShoppingBag,
  MdPayment,
  MdAssignmentReturn,
  MdLocalOffer,
  MdInfoOutline,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";
import API from "../../api/axios";

// ======================================================
// HELPERS
// ======================================================
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString("en-GB");
};

const iconForType = (type) => {
  switch (type) {
    case "order":
      return MdShoppingBag;
    case "payment":
      return MdPayment;
    case "return":
      return MdAssignmentReturn;
    case "offer":
      return MdLocalOffer;
    default:
      return MdInfoOutline;
  }
};

// ======================================================
// COMPONENT
// ======================================================
const Topbar = ({ toggleSidebar, setMobileOpen }) => {
  const navigate = useNavigate();

  const [showNotification, setShowNotification] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // ======================================================
  // GET LOGGED-IN USER
  // ======================================================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }

        const response = await API.get("/auth/me");
        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch logged-in user:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // ======================================================
  // FETCH NOTIFICATIONS
  // ======================================================
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setNotifLoading(true);
      setNotifError("");

      const { data } = await API.get("/notifications", {
        params: { limit: 50 },
      });

      if (data?.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(Number(data.unreadCount || 0));
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setNotifError("Failed to load notifications.");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 60s while the tab is visible
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Refetch on tab focus
  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  // ======================================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // ======================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======================================================
  // NOTIFICATION ACTIONS
  // ======================================================
  const handleMarkAsRead = async (id) => {
    if (!id) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      await API.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Mark read error:", err);
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      await API.put("/notifications/read-all");
    } catch (err) {
      console.error("Mark all read error:", err);
      fetchNotifications();
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      const wasUnread = notifications.find(
        (n) => n._id === id && !n.isRead
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      await API.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Delete notification error:", err);
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif) return;
    if (!notif.isRead) await handleMarkAsRead(notif._id);
    setShowNotification(false);
    if (notif.link) navigate(notif.link);
  };

  // ======================================================
  // USER HELPERS
  // ======================================================
  const getUserName = () => {
    if (!user) return "Guest";

    if (user.name && typeof user.name === "string" && user.name.trim()) {
      return user.name.trim();
    }

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (fullName) return fullName;

    if (user.email) return user.email.split("@")[0];
    return "User";
  };

  const getUserEmail = () => user?.email || "";

  const getProfileImage = () => {
    if (user?.profileImage) return user.profileImage;
    if (user?.avatar) return user.avatar;
    if (user?.image) return user.image;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      getUserName()
    )}`;
  };

  // ======================================================
  // NAV / LOGOUT
  // ======================================================
  const handleProfile = () => {
    setShowProfile(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    setUser(null);
    setShowProfile(false);

    const project1Url =
      import.meta.env.VITE_PROJECT1_URL || "https://grocerysathi.com";
    window.location.href = `${project1Url}/?logout=1`;
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <header className="Topbar">
      {/* LEFT */}
      <div className="Topbar_Left">
        <button className="Topbar_Menu" onClick={toggleSidebar}>
          <MdMenu />
        </button>

        <button
          className="Topbar_MobileMenu"
          onClick={() => setMobileOpen(true)}
        >
          <MdMenu />
        </button>
      </div>

      {/* RIGHT */}
      <div className="Topbar_Right">
        {/* NOTIFICATION */}
        <div className="Topbar_NotificationWrapper" ref={notificationRef}>
          <button
            className="Topbar_Notification"
            onClick={() => {
              setShowNotification((v) => !v);
              setShowProfile(false);
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <MdNotifications />
            {unreadCount > 0 && (
              <span className="Topbar_NotificationBadge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div
            className={`Topbar_NotificationCard ${
              showNotification ? "Topbar_NotificationCardActive" : ""
            }`}
          >
            <div className="Topbar_NotificationHeader">
              <h3>
                Notifications
                {unreadCount > 0 && (
                  <span className="Topbar_NotificationHeaderBadge">
                    {unreadCount} new
                  </span>
                )}
              </h3>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="Topbar_NotificationMarkAll"
                  onClick={handleMarkAllRead}
                >
                  <MdDoneAll />
                  Mark all read
                </button>
              )}
            </div>

            <div className="Topbar_NotificationList">
              {notifLoading ? (
                <div className="Topbar_NotificationEmpty">
                  <p>Loading…</p>
                </div>
              ) : notifError ? (
                <div className="Topbar_NotificationEmpty">
                  <p>{notifError}</p>
                  <button
                    type="button"
                    className="Topbar_NotificationRetry"
                    onClick={fetchNotifications}
                  >
                    Try Again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="Topbar_NotificationEmpty">
                  <MdNotifications />
                  <p>No notifications yet</p>
                  <span>You're all caught up!</span>
                </div>
              ) : (
                notifications.map((item) => {
                  const Icon = iconForType(item.type);
                  return (
                    <div
                      key={item._id}
                      className={`Topbar_NotificationItem ${
                        !item.isRead ? "Topbar_NotificationItemUnread" : ""
                      }`}
                      onClick={() => handleNotificationClick(item)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="Topbar_NotificationIcon">
                        <Icon />
                      </div>

                      <div className="Topbar_NotificationContent">
                        <h4>{item.title}</h4>
                        {item.message && <p>{item.message}</p>}
                        <span className="Topbar_NotificationTime">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>

                      <div className="Topbar_NotificationActions">
                        {!item.isRead && (
                          <button
                            type="button"
                            className="Topbar_NotificationAction"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(item._id);
                            }}
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <MdCheck />
                          </button>
                        )}
                        <button
                          type="button"
                          className="Topbar_NotificationAction Topbar_NotificationDelete"
                          onClick={(e) => handleDelete(item._id, e)}
                          title="Delete"
                          aria-label="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="Topbar_NotificationFooter">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotification(false);
                    navigate("/notifications");
                  }}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE */}
        <div className="Topbar_ProfileWrapper" ref={profileRef}>
          <div
            className="Topbar_Profile"
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotification(false);
            }}
          >
            <img src={getProfileImage()} alt="Profile" />
            <div className="Topbar_ProfileInfo">
              <h4>{loadingUser ? "Loading..." : getUserName()}</h4>
              <p>{loadingUser ? "" : getUserEmail()}</p>
            </div>
          </div>

          <div
            className={`Topbar_ProfileCard ${
              showProfile ? "Topbar_ProfileCardActive" : ""
            }`}
          >
            <div className="Topbar_ProfileCardHeader">
              <img src={getProfileImage()} alt="Profile" />
              <h3>{getUserName()}</h3>
              <p>{getUserEmail()}</p>
            </div>

            <div className="Topbar_ProfileCardMenu">
              <button onClick={handleProfile}>
                <MdPerson />
                <span>My Profile</span>
              </button>

              <button>
                <MdHistory />
                <span>Activity Logs</span>
              </button>

              <button
                className="Topbar_ProfileLogout"
                onClick={handleLogout}
              >
                <MdLogout />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
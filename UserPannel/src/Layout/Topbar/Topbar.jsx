import React, { useState, useEffect, useRef } from "react";
import {
  MdMenu,
  MdNotifications,
  MdPerson,
  MdHistory,
  MdLogout,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";
import API from "../../api/axios";

const Topbar = ({ toggleSidebar, setMobileOpen }) => {
  const navigate = useNavigate();

  const [showNotification, setShowNotification] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    { title: "Project approved", time: "4 hours ago" },
    { title: "New files available", time: "10 hours ago" },
    { title: "Review received", time: "1 day ago" },
    { title: "Updates available", time: "2 days ago" },
    { title: "Fee submitted", time: "3 days ago" },
    { title: "Admission confirmed", time: "5 days ago" },
    { title: "Attendance updated", time: "1 week ago" },
  ];

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    return "https://i.pravatar.cc/150?img=32";
  };

  // ======================================================
  // NAVIGATION & ACTIONS
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

    const project1Url = import.meta.env.VITE_PROJECT1_URL || "https://grocerysathi.com";
    window.location.href = `${project1Url}/?logout=1`;
  };

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
              setShowNotification(!showNotification);
              setShowProfile(false);
            }}
          >
            <MdNotifications />
            <span>{notifications.length}</span>
          </button>

          <div
            className={`Topbar_NotificationCard ${
              showNotification ? "Topbar_NotificationCardActive" : ""
            }`}
          >
            <div className="Topbar_NotificationHeader">
              <h3>{notifications.length} Notifications</h3>
            </div>

            <div className="Topbar_NotificationList">
              {notifications.map((item, index) => (
                <div key={index} className="Topbar_NotificationItem">
                  <h4>{item.title}</h4>
                  <p>{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div className="Topbar_ProfileWrapper" ref={profileRef}>
          <div
            className="Topbar_Profile"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotification(false);
            }}
          >
            <img src={getProfileImage()} alt="Profile" />
            <div className="Topbar_ProfileInfo">
              <h4>{loadingUser ? "Loading..." : getUserName()}</h4>
              <p>{loadingUser ? "" : getUserEmail()}</p>
            </div>
          </div>

          {/* PROFILE DROPDOWN */}
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

              <button className="Topbar_ProfileLogout" onClick={handleLogout}>
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
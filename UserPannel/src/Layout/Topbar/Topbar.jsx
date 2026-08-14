import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  MdMenu,
  MdNotifications,
  MdPerson,
  MdEdit,
  MdHistory,
  MdSettings,
  MdLogout,
} from "react-icons/md";

import "./Topbar.css";

const Topbar = ({
  toggleSidebar,
  setMobileOpen,
}) => {
  const [showNotification, setShowNotification] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    {
      title: "Project approved",
      time: "4 hours ago",
    },
    {
      title: "New files available",
      time: "10 hours ago",
    },
    {
      title: "Review received",
      time: "1 day ago",
    },
    {
      title: "Updates available",
      time: "2 days ago",
    },
    {
      title: "Fee submitted",
      time: "3 days ago",
    },
    {
      title: "Admission confirmed",
      time: "5 days ago",
    },
    {
      title: "Attendance updated",
      time: "1 week ago",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotification(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <header className="Topbar">
      <div className="Topbar_Left">
        {/* Desktop Sidebar Toggle */}
        <button
          className="Topbar_Menu"
          onClick={toggleSidebar}
        >
          <MdMenu />
        </button>

        {/* Mobile Sidebar Toggle */}
        <button
          className="Topbar_MobileMenu"
          onClick={() => setMobileOpen(true)}
        >
          <MdMenu />
        </button>
      </div>

      <div className="Topbar_Right">

        {/* Notification */}
        <div
          className="Topbar_NotificationWrapper"
          ref={notificationRef}
        >
          <button
            className="Topbar_Notification"
            onClick={() => {
              setShowNotification(
                !showNotification
              );
              setShowProfile(false);
            }}
          >
            <MdNotifications />

            <span>
              {notifications.length}
            </span>
          </button>

          <div
            className={`Topbar_NotificationCard ${
              showNotification
                ? "Topbar_NotificationCardActive"
                : ""
            }`}
          >
            <div className="Topbar_NotificationHeader">
              <h3>
                {notifications.length} Notifications
              </h3>
            </div>

            <div className="Topbar_NotificationList">
              {notifications.map(
                (item, index) => (
                  <div
                    key={index}
                    className="Topbar_NotificationItem"
                  >
                    <h4>{item.title}</h4>

                    <p>{item.time}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div
          className="Topbar_ProfileWrapper"
          ref={profileRef}
        >
          <div
            className="Topbar_Profile"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotification(false);
            }}
          >
            <img
              src="https://i.pravatar.cc/150?img=32"
              alt="Profile"
            />

            <div className="Topbar_ProfileInfo">
              <h4>Popin Kumar</h4>

              <p>Premium Member</p>
            </div>
          </div>

          <div
            className={`Topbar_ProfileCard ${
              showProfile
                ? "Topbar_ProfileCardActive"
                : ""
            }`}
          >
            <div className="Topbar_ProfileCardHeader">
              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="Profile"
              />

              <h3>Popin Kumar</h3>

              <p>Premium Member</p>
            </div>

            <div className="Topbar_ProfileCardMenu">

              <button>
                <MdPerson />
                <span>My Profile</span>
              </button>

              <button>
                <MdEdit />
                <span>Edit Profile</span>
              </button>

              <button>
                <MdHistory />
                <span>Activity Logs</span>
              </button>

              <button>
                <MdSettings />
                <span>
                  Account Settings
                </span>
              </button>

              <button className="Topbar_ProfileLogout">
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
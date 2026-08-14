import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

import "./MainLayout.css";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="MainLayout">

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`MainLayout_Content ${
          collapsed
            ? "MainLayout_ContentCollapsed"
            : ""
        }`}
      >
        <Topbar
          toggleSidebar={() =>
            setCollapsed(!collapsed)
          }
          setMobileOpen={setMobileOpen}
        />

        <main className="MainLayout_Page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
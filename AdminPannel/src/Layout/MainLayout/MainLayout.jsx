import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Handle responsive resizing directly
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setMobileSidebar(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebar((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="MainLayout">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        mobileSidebar={mobileSidebar} 
        setMobileSidebar={setMobileSidebar} 
      />
      <div className={`MainContent-wrapper ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="MainContent">
          <div className="MainContent-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
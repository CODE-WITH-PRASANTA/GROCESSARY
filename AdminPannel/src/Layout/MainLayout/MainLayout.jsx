import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import './MainLayout.css';

// Reusable Breadcrumb inside Layout
const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatPathName = (name) => {
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="Breadcrumb" aria-label="Breadcrumb">
      <ol className="Breadcrumb-list">
        <li className="Breadcrumb-item">
          <Link to="/dashboard" className="Breadcrumb-link">
            <Home size={14} />
          </Link>
        </li>
        {pathnames.length > 0 && <ChevronRight size={14} className="Breadcrumb-separator" />}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="Breadcrumb-item">
              {isLast ? (
                <span className="Breadcrumb-current">{formatPathName(value)}</span>
              ) : (
                <>
                  <Link to={to} className="Breadcrumb-link">
                    {formatPathName(value)}
                  </Link>
                  <ChevronRight size={14} className="Breadcrumb-separator" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

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
          <Breadcrumb />
          <div className="MainContent-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
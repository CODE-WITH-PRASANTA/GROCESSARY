import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Tag,
  Scale,
  ShoppingBag,
  RotateCcw,
  Users,
  Star,
  Image as ImageIcon,
  Percent,
  Ticket,
  Sliders,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Settings,
  ShoppingBasket,
  Notebook,
  Book
} from 'lucide-react';
import './Sidebar.css';

const menuSections = [
  {
    title: null,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'PRODUCTS',
    items: [
      { label: 'All Products', path: '/products/all-products', icon: Package },
      { label: 'Add Product', path: '/products/add-product', icon: PlusCircle },
      { label: 'Categories', path: '/products/categories', icon: FolderTree },
      { label: 'Brands', path: '/products/brands', icon: Tag },
      { label: 'Units', path: '/products/units', icon: Scale },
      { label: 'ListUploads', path: '/products/list-uploads', icon: Book},
    ]
  },
  {
    title: 'ORDERS',
    items: [
      { label: 'Orders', path: '/orders/all-orders', icon: ShoppingBag },
      { label: 'Returns', path: '/orders/returns', icon: RotateCcw },
    ]
  },

  {
    title: 'Blog',
    items: [
      { label: 'Blog management', path: '/blogmanagement', icon: Notebook },
      { label: 'Blog posting', path: '/blog', icon: Book },
      { label: 'Testimonial', path: '/testimonialmanagement', icon: Book },
    ]
  },


  {
    title: 'CUSTOMERS',
    items: [
      { label: 'Customers', path: '/customers/all-customers', icon: Users },
      { label: 'Reviews', path: '/customers/reviews', icon: Star },
    ]
  },
  {
    title: 'MARKETING',
    items: [
      { label: 'Banners', path: '/marketing/banners', icon: ImageIcon },
      { label: 'Discounts', path: '/marketing/discounts', icon: Percent },
      { label: 'Coupons', path: '/marketing/coupons', icon: Ticket },
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Site Settings', path: '/settings/site-settings', icon: Sliders },
      { label: 'Users & Roles', path: '/settings/users-roles', icon: ShieldCheck },
    ]
  }
];

const Sidebar = ({ sidebarOpen, mobileSidebar, setMobileSidebar }) => {
  const [footerDropdownOpen, setFooterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFooterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {mobileSidebar && (
        <div 
          className="Sidebar-overlay" 
          onClick={() => setMobileSidebar(false)}
        />
      )}

      <aside className={`Sidebar ${sidebarOpen ? 'expanded' : 'collapsed'} ${mobileSidebar ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="Sidebar-header">
          <div className="Sidebar-logoIcon">
            <ShoppingBasket size={26} color="#22C55E" />
          </div>
          <AnimatePresence>
            {(sidebarOpen || mobileSidebar) && (
              <motion.div 
                className="Sidebar-brandText"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2>GrocerySathi</h2>
                <span>ADMIN PANEL</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="Sidebar-nav">
          {menuSections.map((section, idx) => (
            <div key={idx} className="SidebarSection">
              {section.title && (sidebarOpen || mobileSidebar) && (
                <div className="SidebarSection-title">{section.title}</div>
              )}
              {section.title && !sidebarOpen && !mobileSidebar && (
                <div className="SidebarSection-divider" />
              )}
              <ul className="Sidebar-menu">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} className="SidebarItem">
                      <NavLink
                        to={item.path}
                        className={`SidebarItem-link ${isActive ? 'active' : ''}`}
                        title={!sidebarOpen ? item.label : ''}
                        onClick={() => setMobileSidebar(false)}
                      >
                        <Icon className="SidebarItem-icon" size={20} />
                        {(sidebarOpen || mobileSidebar) && (
                          <span className="SidebarItem-text">{item.label}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="SidebarFooter" ref={dropdownRef}>
          <AnimatePresence>
            {footerDropdownOpen && (
              <motion.div 
                className="SidebarFooter-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <button className="SidebarFooter-dropdownItem">
                  <User size={16} /> My Profile
                </button>
                <button className="SidebarFooter-dropdownItem">
                  <Settings size={16} /> Settings
                </button>
                <div className="SidebarFooter-divider" />
                <button className="SidebarFooter-dropdownItem danger">
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            className="SidebarFooter-user" 
            onClick={() => setFooterDropdownOpen(!footerDropdownOpen)}
          >
            <div className="SidebarFooter-avatar">A</div>
            {(sidebarOpen || mobileSidebar) && (
              <div className="SidebarFooter-info">
                <span className="SidebarFooter-name">Admin</span>
                <span className="SidebarFooter-role">Super Admin</span>
              </div>
            )}
            {(sidebarOpen || mobileSidebar) && (
              <ChevronDown 
                size={16} 
                className={`SidebarFooter-chevron ${footerDropdownOpen ? 'open' : ''}`} 
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
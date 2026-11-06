import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  ShoppingBasket,
  Book,
  NotebookPen,
  BadgePercent,
  FileText,
  Ticket,
} from "lucide-react";

import "./Sidebar.css";

const menuSections = [
  {
    title: null,
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: null,
    items: [
      {
        label: "Cold Lead",
        path: "/coldlead",
        icon: NotebookPen,
      },
    ],
  },

  {
    title: null,
    items: [
      {
        label: "Billing",
        path: "/billing",
        icon: NotebookPen,
      },
    ],
  },

  {
    title: null,
    items: [
      {
        label: "Billing History",
        path: "/billing-history",
        icon: NotebookPen,
      },
    ],
  },


  {
    title: "PRODUCTS",
    items: [
      {
        label: "All Products",
        path: "/products/all-products",
        icon: Package,
      },
      {
        label: "Add Product",
        path: "/products/add-product",
        icon: PlusCircle,
      },
      {
        label: "Today Discount",
        path: "/today-discounts",
        icon: BadgePercent,
      },
      {
        label: "Coupon",
        path: "/products/coupons",
        icon: Ticket,
      },
      {
        label: "Categories",
        path: "/products/categories",
        icon: FolderTree,
      },
      {
        label: "Brands",
        path: "/products/brands",
        icon: Tag,
      },
      {
        label: "Units",
        path: "/products/units",
        icon: Scale,
      },
    ],
  },

  {
    title: "ORDERS",
    items: [
      {
        label: "All Orders",
        path: "/orders/all-orders",
        icon: ShoppingBag,
      },
      {
        label: "Returns",
        path: "/orders/returns",
        icon: RotateCcw,
      },
    ],
  },

  {
    title: "USERS",
    items: [
      {
        label: "Users",
        path: "/users",
        icon: Users,
      },
      {
        label: "Reviews",
        path: "/customers/reviews",
        icon: Star,
      },
    ],
  },

  {
    title: "BLOG",
    items: [
      {
        label: "Create Blog",
        path: "/blog",
        icon: FileText,
      },
      {
        label: "Blog Management",
        path: "/blogmanagement",
        icon: Book,
      },
    ],
  },
];

const Sidebar = ({
  sidebarOpen,
  mobileSidebar,
  setMobileSidebar,
}) => {
  const location = useLocation();

  const closeMenus = () => {
    setMobileSidebar(false);
  };

  return (
    <>
      {mobileSidebar && (
        <div
          className="Sidebar-overlay"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      <aside
        className={`Sidebar ${
          sidebarOpen ? "expanded" : "collapsed"
        } ${
          mobileSidebar ? "mobile-open" : ""
        }`}
      >
        {/* Header */}
        <div className="Sidebar-header">
          <div className="Sidebar-logoIcon">
            <ShoppingBasket
              size={26}
              color="#22C55E"
            />
          </div>

          <AnimatePresence>
            {(sidebarOpen || mobileSidebar) && (
              <motion.div
                className="Sidebar-brandText"
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -10,
                }}
                transition={{
                  duration: 0.2,
                }}
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
            <div
              key={idx}
              className="SidebarSection"
            >
              {section.title &&
                (sidebarOpen || mobileSidebar) && (
                  <div className="SidebarSection-title">
                    {section.title}
                  </div>
                )}

              {section.title &&
                !sidebarOpen &&
                !mobileSidebar && (
                  <div className="SidebarSection-divider" />
                )}

              <ul className="Sidebar-menu">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li
                      key={item.path}
                      className="SidebarItem"
                    >
                      <NavLink
                        to={item.path}
                        className={`SidebarItem-link ${
                          isActive ? "active" : ""
                        }`}
                        title={!sidebarOpen ? item.label : ""}
                        onClick={closeMenus}
                      >
                        <Icon
                          className="SidebarItem-icon"
                          size={20}
                        />

                        {(sidebarOpen || mobileSidebar) && (
                          <span className="SidebarItem-text">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

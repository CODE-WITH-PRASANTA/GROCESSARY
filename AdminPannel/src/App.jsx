import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./Layout/MainLayout/MainLayout";

// Pages
import Dashboard from "./Pages/Dashboard/Dashboard";
import Order from "./Pages/Order/Order";

// Blog
import Blog from "./Components/Blog/Blog";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import TestimonialManagement from "./Components/TestimonialManagement/TestimonialManagement";

// Products
import Allproduct from "./Components/Blog/AllProduct/Allproduct";
import Addnew from "./Components/Blog/Addnew/Addnew";
import Categories from "./Components/Categories/Categories";
import Brands from "./Components/Brands/Brands";
import EditUnit from "./Components/EditUnit/EditUnit";
import ListUploads from "./Components/ListUploads/ListUploads";

// Marketing
import Discounts from "./Components/Discounts/Discounts";
import Banners from "./Components/Banners/Banners";

// Returns & Reviews
import ReturnManagement from "./Components/Blog/ReturnManagement/ReturnManagement";
import ReviewsManagement from "./Components/Blog/ReviewsManagement/ReviewsManagement";
import ReturnDetails from "./Components/Blog/ReturnDetails/ReturnDetails";
import QualityInspection from "./Components/Blog/QualityInspection/QualityInspection";
import RefundDetails from "./Components/Blog/RefundDetails/RefundDetails";
import ProductInformation from "./Components/Blog/ProductInformation/ProductInformation";
import ReplacementDetails from "./Components/Blog/ReplacementDetails/ReplacementDetails";
import ReturnApproval from "./Components/Blog/ReturnApproval/ReturnApproval";
import PickupManagement from "./Components/Blog/PickupManagement/PickupManagement";
import InventoryAdjustment from "./Components/Blog/InventoryAdjustment/InventoryAdjustment";
import ActivityLog from "./Components/Blog/ActivityLog/ActivityLog";

// Placeholder Component
const PlaceholderPage = ({ title }) => (
  <div
    style={{
      padding: "40px",
      textAlign: "center",
      fontFamily: "sans-serif",
    }}
  >
    <h2>{title}</h2>
    <p>This page is currently under development.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          {/* Default Route */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Blog */}
          <Route path="blog" element={<Blog />} />
          <Route path="blogmanagement" element={<BlogManagement />} />
          <Route
            path="testimonialmanagement"
            element={<TestimonialManagement />}
          />

          {/* Products */}
          <Route
            path="products/all-products"
            element={<Allproduct />}
          />
          <Route
            path="products/add-product"
            element={<Addnew />}
          />
          <Route
            path="products/categories"
            element={<Categories />}
          />
          <Route
            path="products/brands"
            element={<Brands />}
          />
          <Route
            path="products/units"
            element={<EditUnit />}
          />
          <Route
            path="products/list-uploads"
            element={<ListUploads />}
          />

          {/* Orders */}
          <Route
            path="orders/all-orders"
            element={<Order />}
          />
          <Route
            path="orders/returns"
            element={<ReturnManagement />}
          />

          {/* Customers */}
          <Route
            path="customers/all-customers"
            element={<PlaceholderPage title="All Customers" />}
          />
          <Route
            path="customers/reviews"
            element={<ReviewsManagement />}
          />

          {/* Marketing */}
          <Route
            path="marketing/banners"
            element={<Banners />}
          />
          <Route
            path="marketing/discounts"
            element={<Discounts />}
          />
          <Route
            path="marketing/coupons"
            element={<PlaceholderPage title="Coupons" />}
          />

          {/* Returns */}
          <Route
            path="returns/details"
            element={<ReturnDetails />}
          />
          <Route
            path="returns/inspection"
            element={<QualityInspection />}
          />
          <Route
            path="returns/refund"
            element={<RefundDetails />}
          />
          <Route
            path="returns/product-info"
            element={<ProductInformation />}
          />
          <Route
            path="returns/replacement-details"
            element={<ReplacementDetails />}
          />
          <Route
            path="returns/approval"
            element={<ReturnApproval />}
          />
          <Route
            path="returns/pickup-management"
            element={<PickupManagement />}
          />
          <Route
            path="returns/inventory-adjustment"
            element={<InventoryAdjustment />}
          />
          <Route
            path="returns/activity-log"
            element={<ActivityLog />}
          />

          {/* Settings */}
          <Route
            path="settings/site-settings"
            element={<PlaceholderPage title="Site Settings" />}
          />
          <Route
            path="settings/users-roles"
            element={<PlaceholderPage title="Users & Roles" />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<PlaceholderPage title="404 - Page Not Found" />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
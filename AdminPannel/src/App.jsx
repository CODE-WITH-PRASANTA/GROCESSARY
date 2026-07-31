import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./Layout/MainLayout/MainLayout";

// Main Pages
import Dashboard from "./Pages/Dashboard/Dashboard";
import Order from "./Pages/Order/Order";

// Return & Reviews Related Components
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

// Dummy Placeholder Component for missing page components
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{title}</h2>
    <p>This page is under development.</p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Wrapper */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Default Redirect to Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* PRODUCTS SECTION */}
          <Route path="/products/all-products" element={<PlaceholderPage title="All Products" />} />
          <Route path="/products/add-product" element={<PlaceholderPage title="Add Product" />} />
          <Route path="/products/categories" element={<PlaceholderPage title="Categories" />} />
          <Route path="/products/brands" element={<PlaceholderPage title="Brands" />} />
          <Route path="/products/units" element={<PlaceholderPage title="Units" />} />

          {/* ORDERS SECTION */}
          <Route path="/orders/all-orders" element={<Order />} />
          <Route path="/orders/returns" element={<ReturnManagement />} />

          {/* CUSTOMERS SECTION */}
          <Route path="/customers/all-customers" element={<PlaceholderPage title="All Customers" />} />
          <Route path="/customers/reviews" element={<ReviewsManagement />} />

          {/* MARKETING SECTION */}
          <Route path="/marketing/banners" element={<PlaceholderPage title="Banners" />} />
          <Route path="/marketing/discounts" element={<PlaceholderPage title="Discounts" />} />
          <Route path="/marketing/coupons" element={<PlaceholderPage title="Coupons" />} />

          {/* SETTINGS SECTION */}
          <Route path="/settings/site-settings" element={<PlaceholderPage title="Site Settings" />} />
          <Route path="/settings/users-roles" element={<PlaceholderPage title="Users & Roles" />} />

          {/* SUB-ROUTES / NESTED RETURN ACTION ROUTES */}
          <Route path="/returns/details" element={<ReturnDetails />} />
          <Route path="/returns/inspection" element={<QualityInspection />} />
          <Route path="/returns/refund" element={<RefundDetails />} />
          <Route path="/returns/product-info" element={<ProductInformation />} />
          <Route path="/returns/replacement-details" element={<ReplacementDetails />} />
          <Route path="/returns/approval" element={<ReturnApproval />} />
          <Route path="/returns/pickup-management" element={<PickupManagement />} />
          <Route path="/returns/inventory-adjustment" element={<InventoryAdjustment />} />
          <Route path="/returns/activity-log" element={<ActivityLog />} />

          {/* 404 / Fallback Route */}
          <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
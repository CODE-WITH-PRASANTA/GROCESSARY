import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute"; // Adjust path if needed
import Login from "./Components/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Blog from "./Components/Blog/Blog";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import TestimonialManagement from "./Components/TestimonialManagement/TestimonialManagement";
import Allproduct from "./Components/Blog/AllProduct/Allproduct";
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
import Order from "./Pages/Order/Order";
import Categories from "./Components/Categories/Categories";
import Brands from "./Components/Brands/Brands";
import Discounts from "./Components/Discounts/Discounts";
import EditUnit from "./Components/EditUnit/EditUnit";
import ListUploads from "./Components/ListUploads/ListUploads";
import Banners from "./Components/Banners/Banners";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Wrapped with ProtectedRoute & MainLayout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            {/* Redirect root path to dashboard or login */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blogmanagement" element={<BlogManagement />} />
            <Route path="/testimonialmanagement" element={<TestimonialManagement />} />
            <Route path="/products/all-products" element={<Allproduct />} />
            
            {/* Orders & Returns */}
            <Route path="/orders/all-orders" element={<Order />} />
            <Route path="/orders/returns" element={<ReturnManagement />} />
            <Route path="/returns/details" element={<ReturnDetails />} />
            <Route path="/returns/inspection" element={<QualityInspection />} />
            <Route path="/returns/refund" element={<RefundDetails />} />
            <Route path="/returns/product-info" element={<ProductInformation />} />
            <Route path="/returns/replacement-details" element={<ReplacementDetails />} />
            <Route path="/returns/approval" element={<ReturnApproval />} />
            <Route path="/returns/pickup-management" element={<PickupManagement />} />
            <Route path="/returns/inventory-adjustment" element={<InventoryAdjustment />} />
            <Route path="/returns/activity-log" element={<ActivityLog />} />
            
            {/* Management */}
            <Route path="/customers/reviews" element={<ReviewsManagement />} />
            <Route path="/products/categories" element={<Categories />} />
            <Route path="/products/brands" element={<Brands />} />
            <Route path="/products/units" element={<EditUnit />} />
            <Route path="/products/list-uploads" element={<ListUploads />} />
            <Route path="/marketing/discounts" element={<Discounts />} />
            <Route path="/marketing/banners" element={<Banners />} />
          </Route>
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
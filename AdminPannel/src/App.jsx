import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout & Security
import MainLayout from "./Layout/MainLayout/MainLayout";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Login from "./Components/Login/Login";

// Component / Page Imports
import TestimonialManagement from "./Components/TestimonialManagement/TestimonialManagement";
import Allproduct from "./Components/Blog/AllProduct/Allproduct";
import Addnew from "./Components/Blog/AddProducts/AddProducts";
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
import EditUnit from "./Components/EditUnit/EditUnit";
import ListUploads from "./Components/ListUploads/ListUploads";
import Banners from "./Components/Banners/Banners";
import BlogPosting from "./Components/BlogPosting/BlogPosting";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import Categories from "./Components/Categories/Categories";
import Brands from "./Components/Brands/Brands";
import Discounts from "./Components/Discounts/Discounts";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Order from "./Pages/Order/Order";
import ColdLeadManagement from "./Components/ColdLeadManagement/ColdLeadManagement";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route - First point of entry if unauthenticated */}
        <Route path="/login" element={<Login />} />

        {/* Root Redirect: Directs users to login by default if they visit the base URL */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Admin Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Dashboard (Loaded after successful login at /dashboard) */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="coldlead" element={<ColdLeadManagement />} />

            {/* Blog & Testimonials */}
            <Route path="blog" element={<BlogPosting />} />
            <Route path="blogmanagement" element={<BlogManagement />} />
            <Route path="testimonialmanagement" element={<TestimonialManagement />} />

            {/* Products */}
            <Route path="products/all-products" element={<Allproduct />} />
            <Route path="products/add-product" element={<Addnew />} />
            <Route path="products/categories" element={<Categories />} />
            <Route path="products/brands" element={<Brands />} />
            <Route path="products/units" element={<EditUnit />} />
            <Route path="products/list-uploads" element={<ListUploads />} />

            {/* Orders */}
            <Route path="orders/all-orders" element={<Order />} />
            <Route path="orders/returns" element={<ReturnManagement />} />

            {/* Customers */}
            <Route path="customers/reviews" element={<ReviewsManagement />} />

            {/* Marketing */}
            <Route path="marketing/banners" element={<Banners />} />
            <Route path="marketing/discounts" element={<Discounts />} />

            {/* Returns */}
            <Route path="returns/details" element={<ReturnDetails />} />
            <Route path="returns/inspection" element={<QualityInspection />} />
            <Route path="returns/refund" element={<RefundDetails />} />
            <Route path="returns/product-info" element={<ProductInformation />} />
            <Route path="returns/replacement-details" element={<ReplacementDetails />} />
            <Route path="returns/approval" element={<ReturnApproval />} />
            <Route path="returns/pickup-management" element={<PickupManagement />} />
            <Route path="returns/inventory-adjustment" element={<InventoryAdjustment />} />
            <Route path="returns/activity-log" element={<ActivityLog />} />

          </Route>
        </Route>

        {/* Global Fallback Catch-all: Redirects any faulty or unknown URL to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
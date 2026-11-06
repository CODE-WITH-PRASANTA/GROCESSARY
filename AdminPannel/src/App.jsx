import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout & Security
import MainLayout from "./Layout/MainLayout/MainLayout";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

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
import Banners from "./Components/Banners/Banners";
import BlogPosting from "./Components/BlogPosting/BlogPosting";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import Categories from "./Components/Categories/Categories";
import Brands from "./Components/Brands/Brands";
import Discounts from "./Components/Discounts/Discounts";
import Coupons from "./Components/Coupons/Coupons";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Order from "./Pages/Order/Order";

import ColdLeadManagement from "./Components/ColdLeadManagement/ColdLeadManagement";
import Users from "./Components/Users/Users";
import Import from "./Components/Import/Import";
import Catagory from "./Components/Catagory/Catagory";
import TodayDiscounts from "./Components/TodayDiscounts/TodayDiscounts";
import AdminProfile from "./Components/AdminProfile/AdminProfile";
import AdminSettings from "./Components/AdminSettings/AdminSettings";
import Billing from "./Components/Billing/Billing";
import BillingHistory from "./Components/BillingHistory/BillingHistory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Direct Root Access to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="coldlead" element={<ColdLeadManagement />} />

            {/* Blog System Routes */}
            <Route path="blog" element={<BlogPosting />} />
            <Route path="blog/:id" element={<BlogPosting />} />
            <Route path="blog/edit/:id" element={<BlogPosting />} />
            <Route path="blogmanagement" element={<BlogManagement />} />
            <Route path="blog/management" element={<BlogManagement />} />
            <Route path="testimonialmanagement" element={<TestimonialManagement />} />

            {/* Products */}
            <Route path="products/all-products" element={<Allproduct />} />
            <Route path="products/add-product" element={<Addnew />} />
            <Route path="products/add-product/:id" element={<Addnew />} />
            <Route path="products/categories" element={<Categories />} />
            <Route path="products/brands" element={<Brands />} />
            <Route path="products/units" element={<EditUnit />} />
            <Route path="products/coupons" element={<Coupons />} />
            <Route path="today-discounts" element={<TodayDiscounts />} />

            {/* Orders */}
            <Route path="orders/all-orders" element={<Order />} />
            <Route path="orders/returns" element={<ReturnManagement />} />

            {/* Users */}
            <Route path="users" element={<Users />} />
            <Route path="customers/all-customers" element={<Users />} />
            <Route path="customers/reviews" element={<ReviewsManagement />} />

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

            {/* Import */}
            <Route path="import" element={<Import />} />
            <Route path="catagory" element={<Catagory />} />

            {/* Marketing */}
            <Route path="marketing/banners" element={<Banners />} />
            <Route path="marketing/discounts" element={<Discounts />} />

            {/* Settings & Billing */}
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing-history" element={<BillingHistory />} />
          </Route>
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

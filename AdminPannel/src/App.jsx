import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./Layout/MainLayout/MainLayout";

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

// Previously Missing Imports (Update file paths according to your folder structure)


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
        {/* Main Layout Wrap */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Default Redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/coldlead" element={<ColdLeadManagement />} />

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

          {/* Settings */}
         

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
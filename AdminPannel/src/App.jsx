import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
import Blog from "../../frontend/src/Components/Blog/Blog";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import TestimonialManagement from "./Components/TestimonialManagement/TestimonialManagement";
import Allproduct from "./Components/Blog/AllProduct/Allproduct";
import Addnew from "./Components/Blog/Addnew/Addnew";
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
import Dashboard from "./Pages/Dashboard/Dashboard";
import Order from "./Pages/Order/Order";
import Categories from "./Components/Categories/Categories";
import Brands from "./Components/Brands/Brands";
import Discounts from "./Components/Discounts/Discounts";

import EditUnit from "./Components/EditUnit/EditUnit";
import ListUploads from "./Components/ListUploads/ListUploads";
import Banners from "./Components/Banners/Banners";
import Login from "./Components/Login/Login";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";


 
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        {/* Main Layout */}
        <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
             </ProtectedRoute>
         }>
        <Route path="/blog" element={<Blog/>}/>
         <Route path="/blogmanagement" element={<BlogManagement/>}/>
         <Route path="/testimonialmanagement" element={<TestimonialManagement/>}/>
        <Route path="products/all-products" element={<Allproduct/>}/>
        <Route path="products/add-product" element={<Addnew/>}/>
        <Route path="/orders/returns" element={<ReturnManagement />} />
        <Route path="/customers/reviews" element={<ReviewsManagement />} />
        <Route path="/returns/details" element={<ReturnDetails />} />
        <Route path="/returns/inspection" element={<QualityInspection />} />
        <Route path="/returns/refund" element={<RefundDetails />} />
        <Route path="/returns/product-info" element={<ProductInformation />} />
        <Route path="/returns/replacement-details" element={<ReplacementDetails />} />
        <Route path="/returns/approval" element={<ReturnApproval />} />
        <Route path="/returns/pickup-management" element={<PickupManagement />} />
        <Route path="/returns/inventory-adjustment" element={<InventoryAdjustment />} />
        <Route path="//returns/activity-log" element={<ActivityLog />} />
       <Route path="/dashboard"element={<Dashboard/>}/>
        <Route path="/orders/all-orders"element={<Order/>}/>
        <Route path="/products/categories"element={<Categories/>}/>
        <Route path="/products/brands"element={<Brands/>}/>
        <Route path="/marketing/discounts"element={<Discounts/>}/>
        <Route path="/products/units"element={<EditUnit/>}/>
        <Route path="/products/list-uploads"element={<ListUploads/>}/>
        <Route path="/marketing/banners"element={<Banners/>}/>
      
        
        
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;




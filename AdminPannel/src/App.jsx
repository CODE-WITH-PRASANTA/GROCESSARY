import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
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





const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Layout */}
        <Route path="/" element={<MainLayout />}>
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

        
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;




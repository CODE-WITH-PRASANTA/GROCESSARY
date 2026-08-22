import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
import DashBoard from "./Pages/DashBoard/DashBoard";
import Orders from "./Components/Orders/Orders";
import OrderHistory from "./Components/OrderHistory/OrderHistory";
import TrasactionHistory from "./Components/TransactionHistory/TransactionHistory";
import ReferEarn from "./Components/ReferEarn/ReferEarn";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Layout Wrapper */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Default Redirect from "/" to "/dashboard" */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route */}
          <Route path="dashboard" element={<DashBoard />} />

          {/* Add future protected/dashboard nested sub-routes here */}

            <Route path="/my-orders" element={<Orders />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/trasanction-history" element={<TrasactionHistory/>} />
            <Route path="/rafer-earn" element={<ReferEarn/>} />

        </Route>

        {/* 404 Fallback - Redirects unknown URLs back to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
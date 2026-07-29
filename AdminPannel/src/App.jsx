import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Order from "./Pages/Order/Order";





const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Layout */}
        <Route path="/" element={<MainLayout />}>
        <Route path="/dashboard"element={<Dashboard/>}/>
        <Route path="/orders/all-orders"element={<Order/>}/>

        
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
import Allproduct from "./Components/Blog/AllProduct/Allproduct";
import Addnew from "./Components/Blog/Addnew/Addnew";

 
const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Layout */}
        <Route path="/" element={<MainLayout />}>
        <Route path="products/all-products" element={<Allproduct/>}/>
        <Route path="products/add-product" element={<Addnew/>}/>
      
        
        
         
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;

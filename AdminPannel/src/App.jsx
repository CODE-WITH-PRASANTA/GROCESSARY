import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout/MainLayout";
import Blog from "../../frontend/src/Components/Blog/Blog";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import TestimonialManagement from "./Components/TestimonialManagement/TestimonialManagement";





const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Layout */}
        <Route path="/" element={<MainLayout />}>
        <Route path="/blog" element={<Blog/>}/>
         <Route path="/blogmanagement" element={<BlogManagement/>}/>
         <Route path="/testimonialmanagement" element={<TestimonialManagement/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
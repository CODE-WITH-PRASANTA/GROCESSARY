import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

// Pages
import Home from "./Pages/Home/Home";
import AboutUs from "./Pages/AboutUs/AboutUs";
import AboutUsOurService from "./Components/AboutUsOurService/AboutUsOurService";
import ContactUs from "./Components/ContactUs/ContactUs";
import FaqSection from "./Components/FaqSection/FaqSection";
import TermAndCondition from "./Components/TermAndCondition/TermAndCondition";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
import ShippingAndDelivery from "./Components/ShippingAndDelivery/ShippingAndDelivery";
import BlogGrid from "./Components/BlogGrid/BlogGrid";
import BlogReadmoreOne from "./Components/BlogReadmoreOne/BlogReadmoreOne";
import BlogReadmoreTwo from "./Components/BlogReadmoreTwo/BlogReadmoreTwo";
import BlogReadmoreThree from "./Components/BlogReadmoreThree/BlogReadmoreThree";
import BlogReadmoreFour from "./Components/BlogReadmoreFour/BlogReadmoreFour";
import LoginPage from "./Components/LoginPage/LoginPage";
import CartSection from "./Components/CartSection/CartSection";


const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AboutUs" element={<AboutUs/>} />
        <Route path="/AboutUsOurService" element={<AboutUsOurService/>} />
        <Route path="/ContactUs" element={<ContactUs/>} />
        <Route path="/FaqSection" element={<FaqSection/>} />


        <Route path="/TermAndCondition" element={<TermAndCondition/>} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy/>} />
        <Route path="/ShippingAndDelivery" element={<ShippingAndDelivery/>} />
        <Route path="/BlogGrid" element={<BlogGrid/>} />
        <Route path="/BlogReadmoreOne" element={<BlogReadmoreOne/>} />
        <Route path="/BlogReadmoreTwo" element={<BlogReadmoreTwo/>} />
        <Route path="/BlogReadmoreThree" element={<BlogReadmoreThree/>} />
        <Route path="/BlogReadmoreFour" element={<BlogReadmoreFour/>} />


        <Route path="/account" element={<LoginPage/>} />
        <Route path="/cart" element={<CartSection/>} />




    
      
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
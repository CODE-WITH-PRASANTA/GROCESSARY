import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout Components
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import FloatingForm from "./Components/FloatingForm/FloatingForm";
import FloatingButton from "./Components/FloatingButton/FloatingButton";

// Pages & Components
import Home from "./Pages/Home/Home";
import AboutUs from "./Pages/AboutUs/AboutUs";
import AboutUsOurService from "./Components/AboutUsOurService/AboutUsOurService";
import ContactUs from "./Components/ContactUs/ContactUs";
import FaqSection from "./Components/FaqSection/FaqSection";
import TermAndCondition from "./Components/TermAndCondition/TermAndCondition";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
import ShippingAndDelivery from "./Components/ShippingAndDelivery/ShippingAndDelivery";

// Blog Components
import BlogGrid from "./Components/BlogGrid/BlogGrid";
import BlogReadmoreOne from "./Components/BlogReadmoreOne/BlogReadmoreOne";

// User & E-commerce Components
import LoginPage from "./Components/LoginPage/LoginPage";
import CartSection from "./Components/CartSection/CartSection";
import DeliveryTime from "./Components/DeliveryTime/DeliveryTime";
import MyOrders from "./Components/MyOrders/MyOrders";
import ListUpload from "./Components/ListUpload/ListUpload";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/about-us-our-service" element={<AboutUsOurService />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/faq" element={<FaqSection />} />
        <Route path="/terms-and-conditions" element={<TermAndCondition />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-delivery" element={<ShippingAndDelivery />} />

        {/* Blog System Routes */}
        <Route path="/blogs" element={<BlogGrid />} />
        <Route path="/news/:id" element={<BlogReadmoreOne />} />

        {/* User & Store Routes */}
        <Route path="/account" element={<LoginPage />} />
        <Route path="/cart" element={<CartSection />} />
        <Route path="/deliverytime" element={<DeliveryTime />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/listupload" element={<ListUpload />} />
      </Routes>

      <FloatingForm />
      <FloatingButton />
      <Footer />
    </BrowserRouter>
  );
};

export default App;
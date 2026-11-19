
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useDispatch } from "react-redux";
import { fetchCart } from "./Utils/cartSlice";

// Layout & Loader Components
import Pageloader from "./Components/Pageloader/Pageloader";
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
import Wishlist from "./Components/Wishlist/Wishlist";
import UserProfile from "./Components/UserProfile/UserProfile";
import ListUpload from "./Components/ListUpload/ListUpload";
import ProductDetails from "./Pages/ProductDetails/ProductDetails";
import CategoryDetails from "./Pages/CategoryDetails/CategoryDetails";
import OrderDetails from "./Components/OrderDetails/OrderDetails";

const LOADER_DURATION = 1500;

const AppContent = () => {
  const dispatch = useDispatch();

  // Initial loader state
  const [loading, setLoading] = useState(true);

  // Show loader only on first entry or browser refresh
  useEffect(() => {
    const navigationEntry =
      performance.getEntriesByType("navigation")[0];

    const isRefresh =
      navigationEntry?.type === "reload";

    const hasLoaded =
      sessionStorage.getItem("website_loader_shown") === "true";

    if (isRefresh || !hasLoaded) {
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);

        sessionStorage.setItem(
          "website_loader_shown",
          "true"
        );
      }, LOADER_DURATION);

      return () => clearTimeout(timer);
    }

    setLoading(false);
  }, []);

  // Capture referral code from URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(
        window.location.search
      );

      const ref =
        urlParams.get("ref") ||
        urlParams.get("referral");

      if (ref && ref.trim()) {
        const cleanRef = ref.trim().toUpperCase();

        sessionStorage.setItem(
          "grocery_referral_code",
          cleanRef
        );

        localStorage.setItem(
          "grocery_referral_code",
          cleanRef
        );
      }
    } catch (e) {
      console.error("Referral code error:", e);
    }
  }, []);

  // Fetch cart if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <>
      {/* Page Loader */}
      {loading && (
        <Pageloader
          duration={LOADER_DURATION}
          onComplete={() => {
            setLoading(false);

            sessionStorage.setItem(
              "website_loader_shown",
              "true"
            );
          }}
        />
      )}

      {/* Website Content */}
      {!loading && (
        <>
          <Navbar />

          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* About */}
            <Route
              path="/about-us"
              element={<AboutUs />}
            />

            <Route
              path="/about-us-our-service"
              element={<AboutUsOurService />}
            />

            {/* Contact */}
            <Route
              path="/contact-us"
              element={<ContactUs />}
            />

            <Route
              path="/faq"
              element={<FaqSection />}
            />

            {/* Policies */}
            <Route
              path="/terms-and-conditions"
              element={<TermAndCondition />}
            />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/shipping-delivery"
              element={<ShippingAndDelivery />}
            />

            {/* Product Routes */}
            <Route
              path="/product/:slug"
              element={<ProductDetails />}
            />

            <Route
              path="/productdetails/:id"
              element={<ProductDetails />}
            />

            <Route
              path="/productdetails/:slug"
              element={<ProductDetails />}
            />

            {/* Category Routes */}
            <Route
              path="/category"
              element={<CategoryDetails />}
            />

            <Route
              path="/category/:slug"
              element={<CategoryDetails />}
            />

            <Route
              path="/categorydetails/:slug"
              element={<CategoryDetails />}
            />

            {/* Blog Routes */}
            <Route
              path="/blogs"
              element={<BlogGrid />}
            />

            <Route
              path="/news/:id"
              element={<BlogReadmoreOne />}
            />

            <Route
              path="/BlogReadmoreOne"
              element={<BlogReadmoreOne />}
            />

            {/* User & Store Routes */}
            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/signup"
              element={<LoginPage initialView="register" />}
            />

            <Route
              path="/register"
              element={<LoginPage initialView="register" />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/cart"
              element={<CartSection />}
            />

            <Route
              path="/deliverytime"
              element={<Navigate to="/cart" replace />}
            />

            <Route
              path="/profile"
              element={<UserProfile />}
            />

            <Route
              path="/account"
              element={<UserProfile />}
            />

            <Route
              path="/saved-address"
              element={
                <UserProfile defaultTab="addresses" />
              }
            />

            <Route
              path="/myorders"
              element={
                <UserProfile defaultTab="orders" />
              }
            />

            <Route
              path="/listupload"
              element={<ListUpload />}
            />

            <Route
              path="/orders/:id"
              element={<OrderDetails />}
            />

            <Route
              path="/order-details/:id"
              element={<OrderDetails />}
            />
          </Routes>

          {/* Floating Components */}
          <FloatingForm />
          <FloatingButton />

          {/* Footer */}
          <Footer />
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

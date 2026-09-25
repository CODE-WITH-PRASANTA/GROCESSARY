import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";

import DashBoard from "./Pages/DashBoard/DashBoard";
import Orders from "./Components/Orders/Orders";
import OrderHistory from "./Components/OrderHistory/OrderHistory";
import TrasactionHistory from "./Components/TransactionHistory/TransactionHistory";
import ReferEarn from "./Components/ReferEarn/ReferEarn";
import WalletPoints from "./Pages/WalletPoints/WalletPoints";
import DeliveryAddresses from "./Pages/DeliveryAddresses/DeliveryAddresses";
import MyWishlist from "./Pages/MyWishlist/MyWishlist";
import Profile from "./Pages/Profile/Profile";

// SSO
import SSO from "./Pages/SSO/SSO";
import Cart from "./Components/Cart/Cart";

// 👇 new
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            PUBLIC — SSO AUTHENTICATION
            Project 1 → Project 2
        ================================================== */}

        <Route path="/sso" element={<SSO />} />

        {/* ==================================================
            MAIN APPLICATION LAYOUT  (PROTECTED)
        ================================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect */}
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashBoard />} />

          {/* My Orders */}
          <Route path="my-orders" element={<Orders />} />

          {/* Order History */}
          <Route path="order-history" element={<OrderHistory />} />

          {/* Transaction History */}
          <Route
            path="trasanction-history"
            element={<TrasactionHistory />}
          />

          {/* Refer & Earn */}
          <Route path="rafer-earn" element={<ReferEarn />} />

          {/* Wallet */}
          <Route path="wallet" element={<WalletPoints />} />

          {/* Addresses */}
          <Route
            path="addresses"
            element={<DeliveryAddresses />}
          />

          {/* Wishlist */}
          <Route path="wishlist" element={<MyWishlist />} />

          {/* Cart */}
          <Route path="cart" element={<Cart />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ==================================================
            404 FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
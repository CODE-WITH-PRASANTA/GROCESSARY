import React from "react";
import { Outlet } from "react-router-dom";

// Login system removed: all admin routes are open and directly accessible
const ProtectedRoute = () => {
  return <Outlet />;
};

export default ProtectedRoute;

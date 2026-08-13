import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check authorization token presence in localStorage
  const isAuthenticated = Boolean(localStorage.getItem('grocerySathiAuthToken'));

  // Render child routes if authenticated, otherwise redirect to login page
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ======================================================
// PROJECT 1 URL  (where the login page lives)
// ======================================================

const PROJECT1_URL =
  import.meta.env.VITE_PROJECT1_URL ;

const PROJECT1_LOGIN_PATH = "/login";

// ======================================================
// PROTECTED ROUTE
// ======================================================
//
// If there is no token, immediately redirect the browser to
// Project 1's login page. Project 1 will then handle auth and
// bounce the user back to Project 2 via SSO.
//
// ======================================================

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const token = (() => {
    try {
      return (
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        null
      );
    } catch {
      return null;
    }
  })();

  // ======================================================
  // NO TOKEN → REDIRECT TO PROJECT 1 LOGIN
  // ======================================================

  useEffect(() => {
    if (token) return;

    // Save the intended destination so we can restore it after login
    try {
      sessionStorage.setItem(
        "redirectAfterLogin",
        location.pathname + location.search,
      );
    } catch {
      // ignore
    }

    // Full-page redirect to Project 1 login
    window.location.replace(
      `${PROJECT1_URL}${PROJECT1_LOGIN_PATH}`,
    );
  }, [token, location.pathname, location.search]);

  // While the redirect is happening, render nothing to avoid
  // a flash of the protected page.
  if (!token) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
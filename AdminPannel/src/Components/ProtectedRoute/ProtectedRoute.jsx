import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import API from "../../api/axios";

const ProtectedRoute = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAuth = async () => {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsVerifying(false);
        }
        return;
      }

      try {
        // Verify with dedicated admin auth profile endpoint
        const response = await API.get("/admin/auth/me");
        if (response.data?.success && isMounted) {
          setIsAuthenticated(true);
          if (response.data.admin) {
            localStorage.setItem(
              "adminUser",
              JSON.stringify(response.data.admin)
            );
          }
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        // If 401 Unauthorized or 403 Forbidden, token is invalid/expired
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("token");
          localStorage.removeItem("adminUser");
          if (isMounted) setIsAuthenticated(false);
        } else {
          // If offline or network glitch, trust existing valid token to avoid locking out admin
          if (isMounted) setIsAuthenticated(true);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifyAdminAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isVerifying) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#059669",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p
          style={{
            marginTop: "18px",
            color: "#0f172a",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.2px",
          }}
        >
          Verifying Admin Access...
        </p>
        <p style={{ marginTop: "4px", color: "#64748b", fontSize: "13px" }}>
          GrocerySathi Secure Admin Gateway
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

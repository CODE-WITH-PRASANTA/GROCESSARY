import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "./SSO.css";

const SSO = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // GUARD — prevent React 18 StrictMode double-fire
  // ======================================================

  const hasRunRef = useRef(false);

  useEffect(() => {
    // In dev, StrictMode mounts → unmounts → remounts.
    // This guard ensures the code is consumed only ONCE.
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const authenticateUser = async () => {
      try {
        // ==================================================
        // 1. GET ONE-TIME CODE + REDIRECT FROM URL
        // ==================================================

        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");

        let redirectPath = params.get("redirect") || "/";

        if (!code) {
          setError("Login code is missing.");
          setLoading(false);

          setTimeout(() => {
            navigate("/login", {
              replace: true,
            });
          }, 1500);

          return;
        }

        // ==================================================
        // 2. SEND ONE-TIME CODE TO BACKEND
        // ==================================================

        const response = await API.post("/auth/consume-handoff", {
          code,
        });

        // ==================================================
        // 3. CHECK RESPONSE
        // ==================================================

        if (!response.data?.success || !response.data?.token) {
          throw new Error(
            response.data?.message || "Authentication failed."
          );
        }

        const token = response.data.token;

        localStorage.setItem("token", token);

        // ==================================================
        // 4. FORWARD EXTRA FLAGS TO THE REDIRECT PATH
        // ==================================================

        const forwardedParams = new URLSearchParams();

        params.forEach((value, key) => {
          if (key === "code" || key === "redirect") {
            return;
          }

          forwardedParams.append(key, value);
        });

        const redirectQueryIndex = redirectPath.indexOf("?");

        if (redirectQueryIndex !== -1) {
          const pathPart = redirectPath.slice(0, redirectQueryIndex);
          const queryPart = redirectPath.slice(redirectQueryIndex + 1);

          const redirectParams = new URLSearchParams(queryPart);

          redirectParams.forEach((value, key) => {
            if (!forwardedParams.has(key)) {
              forwardedParams.append(key, value);
            }
          });

          redirectPath = pathPart;
        }

        const forwardedQuery = forwardedParams.toString();

        const finalRedirect = forwardedQuery
          ? `${redirectPath}?${forwardedQuery}`
          : redirectPath;

        // ==================================================
        // 5. REMOVE CODE FROM URL
        // ==================================================

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // ==================================================
        // 6. REDIRECT TO REQUESTED PAGE (+ FLAGS)
        // ==================================================

        navigate(finalRedirect, {
          replace: true,
        });
      } catch (error) {
        console.error("SSO authentication error:", error);

        localStorage.removeItem("token");

        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to sign you in."
        );

        setLoading(false);

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1500);
      }
    };

    authenticateUser();
  }, [navigate]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="SSO">
        <div className="SSO-background">
          <div className="SSO-glow SSO-glow-one"></div>
          <div className="SSO-glow SSO-glow-two"></div>
        </div>

        <div className="SSO-card">
          <div className="SSO-logo">
            <span>U</span>
          </div>

          <div className="SSO-loader">
            <div className="SSO-loader-ring"></div>

            <div className="SSO-loader-check">✓</div>
          </div>

          <h1>Signing you in</h1>

          <p className="SSO-description">
            Securely connecting your account...
          </p>

          <div className="SSO-progress">
            <div className="SSO-progress-bar"></div>
          </div>

          <div className="SSO-status">
            <span className="SSO-status-dot"></span>

            <span>Verifying your account</span>
          </div>

          <div className="SSO-secure">
            <span>🔒</span>
            Secure authentication
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  return (
    <div className="SSO">
      <div className="SSO-background">
        <div className="SSO-glow SSO-glow-one"></div>
        <div className="SSO-glow SSO-glow-two"></div>
      </div>

      <div className="SSO-card SSO-error-card">
        <div className="SSO-error-icon">!</div>

        <h1>Authentication Failed</h1>

        <p className="SSO-description">{error}</p>

        <div className="SSO-error-loader">
          <div className="SSO-error-progress"></div>
        </div>

        <div className="SSO-status">
          <span className="SSO-error-dot"></span>

          <span>Redirecting to login...</span>
        </div>
      </div>
    </div>
  );
};

export default SSO;
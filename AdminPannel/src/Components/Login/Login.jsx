import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "./Login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Registration status states
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const navigate = useNavigate();

  // Check whether an admin is already registered
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await API.get("/admin/registration-status");

        setIsRegistered(response.data?.isRegistered === true);
      } catch (error) {
        console.error(
          "Unable to check registration status:",
          error.response?.data || error.message
        );

        // Hide register button if status check fails
        setIsRegistered(true);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/admin/login", {
        email: identifier.trim(),
        password,
      });

      if (response.data?.success) {
        setIsSuccess(true);

        // Backend sets the HTTP-only adminToken cookie.
        // No localStorage token is required.

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2500);
      } else {
        setError(response.data?.message || "Login failed.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Decorative Grocery Elements */}
      <div className="login-bg-pattern" aria-hidden="true">
        <span className="grocery-sketch item-broccoli-1">🥦</span>
        <span className="grocery-sketch item-tomato">🍅</span>
        <span className="grocery-sketch item-leaf-1">🍃</span>
        <span className="grocery-sketch item-cart">🛒</span>
        <span className="grocery-sketch item-bottle">🥛</span>
        <span className="grocery-sketch item-carrot">🥕</span>
        <span className="grocery-sketch item-basket">🧺</span>
      </div>

      {/* Full Page 3D Success Screen Overlay */}
      {isSuccess && (
        <div className="login-success-overlay">
          <div className="login-success-content">
            <div className="login-success-icon-box">
              <svg
                className="login-success-svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="login-success-title">Login Successful!</h1>

            <p className="login-success-subtitle">
              Welcome back to GrocerySathi Admin Panel...
            </p>
          </div>
        </div>
      )}

      {/* Main 3D Card Container */}
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="login-logo-box">
            <svg
              className="login-bag-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 11v2m6-2v2"
              />
            </svg>
          </div>

          <h1 className="login-brand-title">GrocerySathi</h1>

          <div className="login-brand-subtitle-wrapper">
            <span className="login-divider-line"></span>
            <span className="login-brand-subtitle">ADMIN PANEL</span>
            <span className="login-divider-line"></span>
          </div>
        </div>

        {/* Form Body */}
        <div className="login-body">
          <div className="login-form-header">
            <h2 className="login-heading">Admin Login</h2>

            <p className="login-subheading">
              Welcome back! Please login to continue.
            </p>
          </div>

          {error && (
            <div className="login-error-box" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            {/* Identifier Input */}
            <div className="login-input-group">
              <span className="login-input-icon">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>

              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email"
                className="login-input"
                autoComplete="username"
                disabled={loading || isSuccess}
              />
            </div>

            {/* Password Input */}
            <div className="login-input-group">
              <span className="login-input-icon">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="login-input pr-10"
                autoComplete="current-password"
                disabled={loading || isSuccess}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading || isSuccess}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="login-forgot-wrapper">
              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                className="login-link"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading || isSuccess}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Show Register Section Only When No Admin Is Registered */}
          {!checkingRegistration && !isRegistered && (
            <>
              {/* OR Divider */}
              <div className="login-or-separator">
                <span className="login-or-line"></span>
                <span className="login-or-text">OR</span>
                <span className="login-or-line"></span>
              </div>

              {/* Request Access Button */}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="login-request-btn"
                disabled={loading || isSuccess}
              >
                <svg
                  style={{
                    width: "18px",
                    height: "18px",
                    marginRight: "6px",
                    verticalAlign: "middle",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 4v16m8-8H4"
                  />
                </svg>

                Register Admin
              </button>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="login-footer">
          <p className="login-footer-text">
            &copy; {new Date().getFullYear()} GrocerySathi Technologies. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
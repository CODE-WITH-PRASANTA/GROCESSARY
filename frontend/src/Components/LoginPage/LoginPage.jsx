import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User as UserIcon,
  ArrowLeft,
  Gift,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../api/axios";
import { fetchCart } from "../../Utils/cartSlice";
import { syncGuestWishlistOnLogin } from "../../Utils/wishlistService";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const refCodeFromUrl = queryParams.get("ref") || queryParams.get("referral") || "";
  const redirectTarget = queryParams.get("redirect") || "/";

  // Views: 'login' | 'register' | 'forgot'
  const [view, setView] = useState(refCodeFromUrl ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({
    emailOrMobile: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    referralCode: refCodeFromUrl.toUpperCase(),
  });

  const [forgotData, setForgotData] = useState({
    emailOrMobile: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [forgotStep, setForgotStep] = useState(1); // 1 = request OTP, 2 = verify & reset

  // Sync ref parameter if changed in URL
  useEffect(() => {
    if (refCodeFromUrl) {
      setView("register");
      setRegisterData((prev) => ({
        ...prev,
        referralCode: refCodeFromUrl.toUpperCase(),
      }));
    }
  }, [refCodeFromUrl]);

  // Clear notification messages on view change
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [view, forgotStep]);

  // SweetAlert helpers
  const alertSuccess = (title, text = "") => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "Continue",
      confirmButtonColor: "#102a27",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const alertError = (title, text = "") => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#dc2626",
    });
  };

  // Broadcast auth state & update localStorage
  const handleAuthSuccess = (token, user, successTitle, successText) => {
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    // Dispatch global auth event so Navbar/UserAuth update immediately
    window.dispatchEvent(new Event("authChanged"));

    // Sync Wishlist from guest to account
    try {
      syncGuestWishlistOnLogin();
    } catch (e) {}

    // Sync Redux Cart
    try {
      dispatch(fetchCart());
    } catch (e) {
      console.warn("Cart fetch trigger:", e);
    }

    alertSuccess(successTitle, successText).then(() => {
      navigate(redirectTarget);
    });
  };

  // =========================================================
  // HANDLERS: LOGIN
  // =========================================================
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginData.emailOrMobile.trim()) {
      setErrorMessage("Please enter your email or 10-digit mobile number.");
      return;
    }
    if (!loginData.password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", {
        emailOrMobile: loginData.emailOrMobile.trim(),
        password: loginData.password,
      });

      if (res.data?.success) {
        handleAuthSuccess(
          res.data.token,
          res.data.user,
          "Login Successful!",
          res.data.message || "Welcome back to Grocery Sathi!"
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Invalid credentials. Please verify your email/mobile and password.";
      setErrorMessage(msg);
      alertError("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLERS: REGISTER
  // =========================================================
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setRegisterData((prev) => ({ ...prev, mobile: digitsOnly }));
    } else if (name === "referralCode") {
      setRegisterData((prev) => ({
        ...prev,
        referralCode: value.toUpperCase().trim(),
      }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }

    if (errorMessage) setErrorMessage("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!registerData.firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }
    if (!registerData.lastName.trim()) {
      setErrorMessage("Please enter your last name.");
      return;
    }
    if (!registerData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!registerData.mobile.trim() || registerData.mobile.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!registerData.password || registerData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: registerData.email.trim().toLowerCase(),
        mobile: registerData.mobile.trim(),
        password: registerData.password,
        referralCode: registerData.referralCode || undefined,
      };

      const res = await API.post("/auth/register", payload);

      if (res.data?.success) {
        handleAuthSuccess(
          res.data.token,
          res.data.user,
          "Account Created!",
          res.data.message || "Your Grocery Sathi account is ready."
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please check your information and try again.";
      setErrorMessage(msg);
      alertError("Registration Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLERS: FORGOT PASSWORD
  // =========================================================
  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    if (name === "otp") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      setForgotData((prev) => ({ ...prev, otp: digitsOnly }));
    } else {
      setForgotData((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotData.emailOrMobile.trim()) {
      setErrorMessage("Please enter your registered email address or mobile number.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", {
        emailOrMobile: forgotData.emailOrMobile.trim(),
      });

      if (res.data?.success) {
        setSuccessMessage(
          res.data.message || "OTP has been sent to your registered contact."
        );
        setForgotStep(2);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Unable to send OTP. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotData.otp || forgotData.otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return;
    }
    if (!forgotData.newPassword || forgotData.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/reset-password", {
        emailOrMobile: forgotData.emailOrMobile.trim(),
        otp: forgotData.otp.trim(),
        newPassword: forgotData.newPassword,
      });

      if (res.data?.success) {
        await alertSuccess(
          "Password Changed!",
          "Your password has been reset successfully. Please log in."
        );
        // Reset state & return to login
        setForgotData({
          emailOrMobile: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
        setForgotStep(1);
        setView("login");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. Please verify the OTP.";
      setErrorMessage(msg);
      alertError("Reset Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Top Header / Back navigation */}
      <div className="login-top-bar">
        <button
          type="button"
          className="login-back-btn"
          onClick={() => navigate(redirectTarget)}
          aria-label="Back to store"
        >
          <ArrowLeft size={18} />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="login-container">
        {/* Brand Card Header */}
        <div className="login-brand-header">
          <div className="login-logo-pill">
            <Sparkles size={18} className="login-sparkle-icon" />
            <span>Fresh & Fast Grocery</span>
          </div>
          <h1 className="login-brand-title">
            {view === "login" && "Welcome Back"}
            {view === "register" && "Create an Account"}
            {view === "forgot" && "Reset Password"}
          </h1>
          <p className="login-brand-subtitle">
            {view === "login" && "Sign in to manage your orders, wallet points & delivery."}
            {view === "register" && "Join Grocery Sathi for fresh farm deliveries & exclusive rewards."}
            {view === "forgot" && "Verify your identity and create a secure new password."}
          </p>
        </div>

        {/* Invitation / Referral Banner */}
        {view === "register" && registerData.referralCode && (
          <div className="login-referral-alert">
            <Gift size={20} className="login-referral-gift-icon" />
            <div>
              <strong>Invited by a Friend!</strong>
              <p>Sign up now to claim your welcome wallet bonus with code <span>{registerData.referralCode}</span>.</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="login-card">
          {/* View Tab Switcher (Login vs Register) */}
          {view !== "forgot" && (
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab-btn ${view === "login" ? "active" : ""}`}
                onClick={() => setView("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`login-tab-btn ${view === "register" ? "active" : ""}`}
                onClick={() => setView("register")}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Inline Alert / Notification Messages */}
          {errorMessage && (
            <div className="login-banner login-banner-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="login-banner login-banner-success">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: LOGIN */}
          {/* ==================================================== */}
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="loginEmailOrMobile">
                  Email or Mobile Number <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="loginEmailOrMobile"
                    name="emailOrMobile"
                    type="text"
                    value={loginData.emailOrMobile}
                    onChange={handleLoginChange}
                    placeholder="Enter email or 10-digit mobile"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-link">
                  <label htmlFor="loginPassword">
                    Password <span className="req">*</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => {
                      setForgotData((prev) => ({
                        ...prev,
                        emailOrMobile: loginData.emailOrMobile,
                      }));
                      setView("forgot");
                      setForgotStep(1);
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="loginPassword"
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner-wrap">
                    <span className="spinner"></span> Signing in...
                  </span>
                ) : (
                  "Sign In to Your Account"
                )}
              </button>

              <div className="login-footer-switch">
                <span>New to Grocery Sathi?</span>
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => setView("register")}
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* VIEW: REGISTER */}
          {/* ==================================================== */}
          {view === "register" && (
            <form onSubmit={handleRegisterSubmit} className="login-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="regFirstName">
                    First Name <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <UserIcon size={18} className="field-icon" />
                    <input
                      id="regFirstName"
                      name="firstName"
                      type="text"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      placeholder="e.g. Rahul"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="regLastName">
                    Last Name <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <UserIcon size={18} className="field-icon" />
                    <input
                      id="regLastName"
                      name="lastName"
                      type="text"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      placeholder="e.g. Sharma"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regEmail">
                  Email Address <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="regEmail"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regMobile">
                  Mobile Number (10 Digits) <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    id="regMobile"
                    name="mobile"
                    type="tel"
                    value={registerData.mobile}
                    onChange={handleRegisterChange}
                    placeholder="Enter 10-digit mobile number"
                    required
                    maxLength={10}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">
                  Password <span className="req">* (min 6 characters)</span>
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="regPassword"
                    name="password"
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regReferral">
                  Referral Code <span className="opt">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <Gift size={18} className="field-icon" />
                  <input
                    id="regReferral"
                    name="referralCode"
                    type="text"
                    value={registerData.referralCode}
                    onChange={handleRegisterChange}
                    placeholder="Enter friend's referral code"
                    autoComplete="off"
                  />
                </div>
                {registerData.referralCode && (
                  <p className="field-hint-success">
                    ✨ Referral code will be verified and bonus credited on signup.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spinner-wrap">
                    <span className="spinner"></span> Creating Account...
                  </span>
                ) : (
                  "Create Grocery Sathi Account"
                )}
              </button>

              <div className="login-footer-switch">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => setView("login")}
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* VIEW: FORGOT PASSWORD */}
          {/* ==================================================== */}
          {view === "forgot" && (
            <div className="forgot-flow-container">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequestOtp} className="login-form">
                  <div className="forgot-badge">
                    <KeyRound size={22} className="forgot-badge-icon" />
                    <div>
                      <h3>Forgot Your Password?</h3>
                      <p>Enter your registered email address or mobile number. We'll send an OTP to verify your account.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotEmailOrMobile">
                      Email or Mobile Number <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Mail size={18} className="field-icon" />
                      <input
                        id="forgotEmailOrMobile"
                        name="emailOrMobile"
                        type="text"
                        value={forgotData.emailOrMobile}
                        onChange={handleForgotChange}
                        placeholder="Registered email or 10-digit mobile"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="btn-spinner-wrap">
                        <span className="spinner"></span> Sending OTP...
                      </span>
                    ) : (
                      "Send Verification OTP"
                    )}
                  </button>

                  <div className="login-footer-switch">
                    <button
                      type="button"
                      className="switch-link-btn"
                      onClick={() => setView("login")}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="login-form">
                  <div className="forgot-badge">
                    <ShieldCheck size={22} className="forgot-badge-icon" />
                    <div>
                      <h3>Verify & Set New Password</h3>
                      <p>
                        Enter the 6-digit verification code sent to your registered contact along with your new password.
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotOtp">
                      6-Digit OTP <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <KeyRound size={18} className="field-icon" />
                      <input
                        id="forgotOtp"
                        name="otp"
                        type="text"
                        value={forgotData.otp}
                        onChange={handleForgotChange}
                        placeholder="e.g. 123456"
                        required
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotNewPass">
                      New Password <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="forgotNewPass"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={forgotData.newPassword}
                        onChange={handleForgotChange}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotConfirmPass">
                      Confirm New Password <span className="req">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="forgotConfirmPass"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={forgotData.confirmPassword}
                        onChange={handleForgotChange}
                        placeholder="Re-enter your new password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="btn-spinner-wrap">
                        <span className="spinner"></span> Resetting Password...
                      </span>
                    ) : (
                      "Save New Password & Sign In"
                    )}
                  </button>

                  <div className="login-footer-switch space-between">
                    <button
                      type="button"
                      className="switch-link-btn"
                      onClick={() => setForgotStep(1)}
                    >
                      ← Change Email / Mobile
                    </button>
                    <button
                      type="button"
                      className="switch-link-btn"
                      onClick={() => setView("login")}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

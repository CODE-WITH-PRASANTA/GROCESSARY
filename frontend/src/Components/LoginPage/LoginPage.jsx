import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User as UserIcon,
  Gift,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Star,
  Award,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../api/axios";
import { fetchCart } from "../../Utils/cartSlice";
import { syncGuestWishlistOnLogin } from "../../Utils/wishlistService";
import logo from "../../assets/Grocessary Sathi Png.png";
import "./LoginPage.css";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1070313248799-q3r7khugifnf6rr69nh7uhpmucaeurq0.apps.googleusercontent.com";

const GoogleIcon = () => (
  <svg className="google-btn-icon" viewBox="0 0 24 24" width="20" height="20">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.35 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.65 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const LoginPage = ({ initialView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const refCodeFromUrl = queryParams.get("ref") || queryParams.get("referral") || "";
  const redirectTarget = queryParams.get("redirect") || "/profile";

  // Persistent referral code from URL or storage
  const storedRefCode =
    refCodeFromUrl ||
    sessionStorage.getItem("grocery_referral_code") ||
    localStorage.getItem("grocery_referral_code") ||
    "";

  if (refCodeFromUrl) {
    try {
      sessionStorage.setItem("grocery_referral_code", refCodeFromUrl.toUpperCase().trim());
      localStorage.setItem("grocery_referral_code", refCodeFromUrl.toUpperCase().trim());
    } catch (e) {}
  }

  // If user is already authenticated, redirect directly to profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(redirectTarget || "/profile", { replace: true });
    }
  }, [navigate, redirectTarget]);

  const isSignupPath =
    initialView === "register" ||
    location.pathname === "/signup" ||
    location.pathname === "/register" ||
    Boolean(storedRefCode);

  // Views: 'login' | 'register' | 'forgot'
  const [view, setView] = useState(isSignupPath ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Referral code live validation state
  const [referralValidation, setReferralValidation] = useState({
    checking: false,
    valid: null,
    message: "",
    referrerName: "",
    rewardDescription: "",
  });

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
    referralCode: storedRefCode.toUpperCase().trim(),
  });

  // Validate referral code with backend
  const validateReferralCode = useCallback(async (code) => {
    if (!code || !code.trim()) {
      setReferralValidation({
        checking: false,
        valid: false,
        message: "Please enter a referral code to apply.",
        referrerName: "",
        rewardDescription: "",
      });
      return false;
    }

    try {
      setReferralValidation((prev) => ({ ...prev, checking: true, message: "" }));
      const clean = code.trim().toUpperCase();
      const res = await API.get(`/referrals/validate/${encodeURIComponent(clean)}`);

      if (res.data?.valid) {
        setReferralValidation({
          checking: false,
          valid: true,
          message: `Valid Referral Code! ${res.data.rewardDescription} from ${res.data.referrerName}.`,
          referrerName: res.data.referrerName,
          rewardDescription: res.data.rewardDescription,
        });
        setRegisterData((prev) => ({ ...prev, referralCode: clean }));
        return true;
      } else {
        setReferralValidation({
          checking: false,
          valid: false,
          message: res.data?.message || "Referral code does not exist. Please check and try again.",
          referrerName: "",
          rewardDescription: "",
        });
        return false;
      }
    } catch (err) {
      setReferralValidation({
        checking: false,
        valid: false,
        message: "Referral code does not exist. Please check and try again.",
        referrerName: "",
        rewardDescription: "",
      });
      return false;
    }
  }, []);

  // Run validation on initial load if referral code exists
  useEffect(() => {
    if (storedRefCode) {
      validateReferralCode(storedRefCode);
    }
  }, [storedRefCode, validateReferralCode]);

  // Handle explicit "Apply" button click
  const handleApplyReferralCode = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    validateReferralCode(registerData.referralCode);
  };

  const [forgotData, setForgotData] = useState({
    emailOrMobile: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [forgotStep, setForgotStep] = useState(1); // 1 = request OTP, 2 = verify & reset
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleTokenClientRef = useRef(null);

  // Initialize Google Identity Services
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google?.accounts) return;

      try {
        // Initialize Credential (GIS ID Token)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Initialize OAuth2 Token Client for standard Google popup
        if (window.google.accounts.oauth2) {
          googleTokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "email profile openid",
            callback: handleGoogleTokenResponse,
          });
        }
      } catch (err) {
        console.error("Error initializing Google Identity Services:", err);
      }
    };

    if (window.google?.accounts) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          initGoogle();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;

    try {
      setGoogleLoading(true);
      setErrorMessage("");
      const res = await API.post("/auth/google", {
        credential: response.credential,
        referralCode:
          registerData.referralCode ||
          sessionStorage.getItem("grocery_referral_code") ||
          localStorage.getItem("grocery_referral_code") ||
          "",
      });

      if (res.data?.success) {
        const { token, user, message, isNewUser } = res.data;
        handleAuthSuccess(
          token,
          user,
          isNewUser ? "Account Created!" : "Welcome Back!",
          message || (isNewUser ? "Signed up with Google successfully." : "Logged in with Google successfully.")
        );
      } else {
        const failMsg = res.data?.message || "Google sign-in failed. Please try again.";
        setErrorMessage(failMsg);
        alertError("Google Sign-In Failed", failMsg);
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      const msg =
        error.response?.data?.message ||
        "An error occurred while connecting to Google. Please try again.";
      setErrorMessage(msg);
      alertError("Authentication Error", msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleTokenResponse = async (tokenResponse) => {
    if (tokenResponse?.error) {
      console.warn("Google popup closed or error:", tokenResponse.error);
      return;
    }
    if (!tokenResponse?.access_token) return;

    try {
      setGoogleLoading(true);
      setErrorMessage("");
      const res = await API.post("/auth/google", {
        accessToken: tokenResponse.access_token,
        referralCode:
          registerData.referralCode ||
          sessionStorage.getItem("grocery_referral_code") ||
          localStorage.getItem("grocery_referral_code") ||
          "",
      });

      if (res.data?.success) {
        const { token, user, message, isNewUser } = res.data;
        handleAuthSuccess(
          token,
          user,
          isNewUser ? "Account Created!" : "Welcome Back!",
          message || (isNewUser ? "Signed up with Google successfully." : "Logged in with Google successfully.")
        );
      } else {
        const failMsg = res.data?.message || "Google sign-in failed. Please try again.";
        setErrorMessage(failMsg);
        alertError("Google Sign-In Failed", failMsg);
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      const msg =
        error.response?.data?.message ||
        "An error occurred while connecting to Google. Please try again.";
      setErrorMessage(msg);
      alertError("Authentication Error", msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleContinueWithGoogle = () => {
    setErrorMessage("");
    if (googleLoading) return;

    if (googleTokenClientRef.current) {
      googleTokenClientRef.current.requestAccessToken({ prompt: "select_account" });
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      alertError(
        "Google Sign-In",
        "Google Sign-In service is loading. Please check your internet connection and try again."
      );
    }
  };

  // Sync ref parameter and view if changed in URL
  useEffect(() => {
    if (
      initialView === "register" ||
      location.pathname === "/signup" ||
      location.pathname === "/register" ||
      refCodeFromUrl
    ) {
      setView("register");
    }
    if (refCodeFromUrl) {
      setRegisterData((prev) => ({
        ...prev,
        referralCode: refCodeFromUrl.toUpperCase(),
      }));
    }
  }, [initialView, location.pathname, refCodeFromUrl]);

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
      confirmButtonColor: "#047857",
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
      // Reset validation state when user edits
      if (referralValidation.valid !== null) {
        setReferralValidation({
          checking: false,
          valid: null,
          message: "",
          referrerName: "",
          rewardDescription: "",
        });
      }
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

    // Referral code verification check
    let appliedReferralCode = undefined;
    if (registerData.referralCode && registerData.referralCode.trim()) {
      if (referralValidation.valid === false) {
        setErrorMessage("The referral code you entered does not exist. Please check or remove it.");
        return;
      }
      if (referralValidation.valid === true) {
        appliedReferralCode = registerData.referralCode.trim().toUpperCase();
      } else {
        // User typed a code but didn't click "Apply" yet, validate before register
        const isValid = await validateReferralCode(registerData.referralCode);
        if (!isValid) {
          setErrorMessage("Referral code does not exist. Please check and try again, or leave it blank.");
          return;
        }
        appliedReferralCode = registerData.referralCode.trim().toUpperCase();
      }
    }

    try {
      setLoading(true);
      const payload = {
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: registerData.email.trim().toLowerCase(),
        mobile: registerData.mobile.trim(),
        password: registerData.password,
        referralCode: appliedReferralCode,
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
          res.data.message || "Verification OTP sent successfully! Check your inbox or mobile."
        );
        setForgotStep(2);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not send OTP. Please verify your email or mobile and try again.";
      setErrorMessage(msg);
      alertError("Reset Request Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotData.otp || forgotData.otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP code sent to you.");
      return;
    }
    if (!forgotData.newPassword || forgotData.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/verify-otp-reset", {
        emailOrMobile: forgotData.emailOrMobile.trim(),
        otp: forgotData.otp.trim(),
        newPassword: forgotData.newPassword,
      });

      if (res.data?.success) {
        alertSuccess(
          "Password Updated!",
          "Your password has been reset successfully. Please sign in with your new password."
        ).then(() => {
          setView("login");
          setForgotStep(1);
          setLoginData((prev) => ({
            ...prev,
            emailOrMobile: forgotData.emailOrMobile,
            password: "",
          }));
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Password reset failed. Please ensure your OTP is valid and not expired.";
      setErrorMessage(msg);
      alertError("Reset Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page-wrapper">
      <div className="login-split-container">
        {/* ==================================================== */}
        {/* LEFT COLUMN: BRAND HERO, VALUES & TRUST SHOWCASE */}
        {/* ==================================================== */}
        <aside className="login-left-hero" aria-label="Grocery Sathi Showcase">
          <div className="login-hero-glow" aria-hidden="true" />

          <div className="login-hero-inner">
            {/* BRAND LOGO */}
            <div className="login-hero-logo-box">
              <img
                src={logo}
                alt="Grocery Sathi Logo"
                className="login-hero-logo-img"
              />
            </div>

            {/* BADGE */}
            <div className="login-hero-pill-badge">
              <Sparkles size={14} className="sparkle-gold" />
              <span>Fresh Farm Groceries</span>
            </div>

            {/* HEADLINE */}
            <h1 className="login-hero-main-title">
              Farm-Fresh Groceries, Delivered in 30 Minutes.
            </h1>

            <p className="login-hero-lead-text">
              Join thousands of happy families enjoying hand-picked organic vegetables, fresh seasonal fruits, and pantry essentials delivered straight to their doorstep.
            </p>

            {/* PERK TILES */}
            <div className="login-hero-perks-list">
              <div className="hero-perk-row">
                <div className="perk-icon-circle emerald">
                  <ShoppingBag size={20} />
                </div>
                <div className="perk-text-block">
                  <strong className="perk-title">100% Quality Guaranteed</strong>
                  <span className="perk-desc">Strictly inspected fresh organic vegetables and handpicked fruits.</span>
                </div>
              </div>

              <div className="hero-perk-row">
                <div className="perk-icon-circle gold">
                  <Gift size={20} />
                </div>
                <div className="perk-text-block">
                  <strong className="perk-title">Refer &amp; Earn Cash Rewards</strong>
                  <span className="perk-desc">Friends get ₹20 welcome wallet cash; you get ₹30 on their first order!</span>
                </div>
              </div>

              <div className="hero-perk-row">
                <div className="perk-icon-circle blue">
                  <ShieldCheck size={20} />
                </div>
                <div className="perk-text-block">
                  <strong className="perk-title">Safe &amp; Secure Payments</strong>
                  <span className="perk-desc">UPI, Cards, Netbanking, COD, and instant Wallet checkout.</span>
                </div>
              </div>
            </div>

            {/* TRUST CARD AT BOTTOM */}
            <div className="login-hero-trust-box">
              <div className="trust-stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} className="trust-star-filled" />
                ))}
                <span className="trust-rating-num">4.9 / 5.0</span>
              </div>
              <p className="trust-statement">
                Trusted by <strong>50,000+</strong> homes across the region for authentic daily grocery delivery.
              </p>
            </div>
          </div>
        </aside>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM CARD */}
        {/* ==================================================== */}
        <main className="login-right-form-panel">
          <div className="login-form-card">
            {/* HEADER */}
            <div className="login-form-card-header">
              <h2 className="login-form-title">
                {view === "login" && "Welcome Back"}
                {view === "register" && "Create an Account"}
                {view === "forgot" && "Reset Password"}
              </h2>
              <p className="login-form-subtitle">
                {view === "login" && "Sign in with your email or mobile to access your account."}
                {view === "register" && "Fill in your details below to claim your welcome rewards."}
                {view === "forgot" && "Enter your registered credentials to receive your verification code."}
              </p>
            </div>

            {/* SEGMENTED TAB SWITCHER */}
            {view !== "forgot" && (
              <div className="login-split-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "login"}
                  className={`login-split-tab-btn ${view === "login" ? "active" : ""}`}
                  onClick={() => setView("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "register"}
                  className={`login-split-tab-btn ${view === "register" ? "active" : ""}`}
                  onClick={() => setView("register")}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* INLINE STATUS ALERTS */}
            {errorMessage && (
              <div className="login-alert-banner error" role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="login-alert-banner success" role="alert">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 1: SIGN IN */}
            {/* ==================================================== */}
            {view === "login" && (
              <form onSubmit={handleLoginSubmit} className="login-interactive-form">
                <div className="form-field-item">
                  <label htmlFor="loginEmailOrMobile">
                    Email or Mobile Number <span className="req">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="loginEmailOrMobile"
                      name="emailOrMobile"
                      type="text"
                      value={loginData.emailOrMobile}
                      onChange={handleLoginChange}
                      placeholder="Enter registered email or 10-digit mobile"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="form-field-item">
                  <div className="label-flex-row">
                    <label htmlFor="loginPassword">
                      Password <span className="req">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn-forgot-password-link"
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
                  <div className="input-icon-wrapper">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="loginPassword"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your account password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn-eye-toggle"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary-auth"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <span className="spinner-auth-row">
                      <span className="auth-spinner" /> Signing in...
                    </span>
                  ) : (
                    "Sign In to Grocery Sathi"
                  )}
                </button>

                <div className="oauth-divider-line">
                  <span>or continue with</span>
                </div>

                <button
                  type="button"
                  className="btn-google-oauth"
                  onClick={handleContinueWithGoogle}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <span className="spinner-auth-row">
                      <span className="auth-spinner dark" /> Connecting Google...
                    </span>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="auth-bottom-switch">
                  <span>New to Grocery Sathi?</span>
                  <button
                    type="button"
                    className="btn-switch-tab"
                    onClick={() => setView("register")}
                  >
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {/* ==================================================== */}
            {/* VIEW 2: CREATE ACCOUNT */}
            {/* ==================================================== */}
            {view === "register" && (
              <form onSubmit={handleRegisterSubmit} className="login-interactive-form">
                <div className="form-fields-grid-2">
                  <div className="form-field-item">
                    <label htmlFor="regFirstName">
                      First Name <span className="req">*</span>
                    </label>
                    <div className="input-icon-wrapper">
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

                  <div className="form-field-item">
                    <label htmlFor="regLastName">
                      Last Name <span className="req">*</span>
                    </label>
                    <div className="input-icon-wrapper">
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

                <div className="form-field-item">
                  <label htmlFor="regEmail">
                    Email Address <span className="req">*</span>
                  </label>
                  <div className="input-icon-wrapper">
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

                <div className="form-field-item">
                  <label htmlFor="regMobile">
                    Mobile Number (10 Digits) <span className="req">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <Phone size={18} className="field-icon" />
                    <input
                      id="regMobile"
                      name="mobile"
                      type="tel"
                      value={registerData.mobile}
                      onChange={handleRegisterChange}
                      placeholder="10-digit mobile number"
                      required
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="form-field-item">
                  <label htmlFor="regPassword">
                    Password <span className="req">* (min 6 characters)</span>
                  </label>
                  <div className="input-icon-wrapper">
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
                      className="btn-eye-toggle"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* =========================================================
                    REFERRAL CODE WITH EXPLICIT "APPLY" BUTTON & CHECK
                   ========================================================= */}
                <div className="form-field-item referral-field-section">
                  <div className="referral-field-header">
                    <label htmlFor="regReferral">
                      Referral Code <span className="opt">(Optional)</span>
                    </label>

                    {referralValidation.valid === true && (
                      <span className="referral-pill-badge valid">
                        <CheckCircle2 size={13} /> Code Applied
                      </span>
                    )}

                    {referralValidation.valid === false && (
                      <span className="referral-pill-badge invalid">
                        <AlertCircle size={13} /> Code Not Exist
                      </span>
                    )}
                  </div>

                  <div
                    className={`referral-action-input-box ${
                      referralValidation.valid === true
                        ? "is-valid"
                        : referralValidation.valid === false
                        ? "is-invalid"
                        : ""
                    }`}
                  >
                    <Gift size={18} className="field-icon" />
                    <input
                      id="regReferral"
                      name="referralCode"
                      type="text"
                      value={registerData.referralCode}
                      onChange={handleRegisterChange}
                      placeholder="Enter referral code (e.g. SAROA2AB0E)"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className={`btn-apply-referral ${
                        referralValidation.valid === true ? "applied" : ""
                      }`}
                      onClick={handleApplyReferralCode}
                      disabled={referralValidation.checking}
                    >
                      {referralValidation.checking
                        ? "Checking..."
                        : referralValidation.valid === true
                        ? "Applied ✓"
                        : "Apply"}
                    </button>
                  </div>

                  {referralValidation.valid === true && (
                    <p className="referral-feedback valid">
                      <Sparkles size={14} /> {referralValidation.message}
                    </p>
                  )}

                  {referralValidation.valid === false && (
                    <p className="referral-feedback invalid">
                      <AlertCircle size={14} /> {referralValidation.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary-auth"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <span className="spinner-auth-row">
                      <span className="auth-spinner" /> Creating Account...
                    </span>
                  ) : (
                    "Create Grocery Sathi Account"
                  )}
                </button>

                <div className="oauth-divider-line">
                  <span>or continue with</span>
                </div>

                <button
                  type="button"
                  className="btn-google-oauth"
                  onClick={handleContinueWithGoogle}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <span className="spinner-auth-row">
                      <span className="auth-spinner dark" /> Connecting Google...
                    </span>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <div className="auth-bottom-switch">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="btn-switch-tab"
                    onClick={() => setView("login")}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* ==================================================== */}
            {/* VIEW 3: FORGOT PASSWORD */}
            {/* ==================================================== */}
            {view === "forgot" && (
              <div className="forgot-flow-wrapper">
                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotRequestOtp} className="login-interactive-form">
                    <div className="forgot-instruction-badge">
                      <KeyRound size={22} className="forgot-key-icon" />
                      <div>
                        <h4>Account Password Recovery</h4>
                        <p>Enter your registered email address or mobile number. We will send an OTP code to verify your account.</p>
                      </div>
                    </div>

                    <div className="form-field-item">
                      <label htmlFor="forgotEmailOrMobile">
                        Email or Mobile Number <span className="req">*</span>
                      </label>
                      <div className="input-icon-wrapper">
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
                      className="btn-primary-auth"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-auth-row">
                          <span className="auth-spinner" /> Sending OTP...
                        </span>
                      ) : (
                        "Send Verification OTP"
                      )}
                    </button>

                    <div className="auth-bottom-switch">
                      <button
                        type="button"
                        className="btn-switch-tab"
                        onClick={() => setView("login")}
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="login-interactive-form">
                    <div className="forgot-instruction-badge">
                      <ShieldCheck size={22} className="forgot-key-icon" />
                      <div>
                        <h4>Verify &amp; Set New Password</h4>
                        <p>Enter the 6-digit code received along with your new password.</p>
                      </div>
                    </div>

                    <div className="form-field-item">
                      <label htmlFor="forgotOtp">
                        6-Digit OTP Code <span className="req">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <KeyRound size={18} className="field-icon" />
                        <input
                          id="forgotOtp"
                          name="otp"
                          type="text"
                          value={forgotData.otp}
                          onChange={handleForgotChange}
                          placeholder="Enter 6-digit OTP"
                          required
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                      </div>
                    </div>

                    <div className="form-field-item">
                      <label htmlFor="forgotNewPass">
                        New Password <span className="req">*</span>
                      </label>
                      <div className="input-icon-wrapper">
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
                          className="btn-eye-toggle"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-field-item">
                      <label htmlFor="forgotConfirmPass">
                        Confirm New Password <span className="req">*</span>
                      </label>
                      <div className="input-icon-wrapper">
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
                          className="btn-eye-toggle"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary-auth"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-auth-row">
                          <span className="auth-spinner" /> Resetting Password...
                        </span>
                      ) : (
                        "Save New Password & Sign In"
                      )}
                    </button>

                    <div className="auth-bottom-switch space-between">
                      <button
                        type="button"
                        className="btn-switch-tab"
                        onClick={() => setForgotStep(1)}
                      >
                        ← Change Email / Mobile
                      </button>
                      <button
                        type="button"
                        className="btn-switch-tab"
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
        </main>
      </div>
    </div>
  );
};

export default LoginPage;

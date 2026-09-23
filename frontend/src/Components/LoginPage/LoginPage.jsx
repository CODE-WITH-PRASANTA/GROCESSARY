import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/axios";
import "./LoginPage.css";

// =====================================================
// REFERRAL CODE FROM URL
// e.g. /account?ref=USERF44E19
// =====================================================

const getReferralCodeFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref") || params.get("referral") || "";
  } catch {
    return "";
  }
};

const LoginPage = () => {
  const navigate = useNavigate();

  // =====================================================
  // REFERRAL CODE (URL + manual input)
  // =====================================================

  const [enteredReferralCode, setEnteredReferralCode] = useState(
    getReferralCodeFromUrl() || ""
  );

  // =====================================================
  // VIEW
  // login | register | forgot
  // =====================================================

  const [view, setView] = useState(
    getReferralCodeFromUrl() ? "register" : "login"
  );

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN FORM STATE
  // =====================================================

  const [loginData, setLoginData] = useState({
    emailOrMobile: "",
    password: "",
  });

  // =====================================================
  // REGISTER FORM STATE
  // =====================================================

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
  });

  // =====================================================
  // FORGOT PASSWORD STATE
  // =====================================================

  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =====================================================
  // OTP STEP
  // =====================================================

  const [forgotStep, setForgotStep] = useState(1);

  // =====================================================
  // SWEET ALERT HELPERS
  // =====================================================

  const showSuccess = (title, text = "") => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#16a34a",
    });
  };

  const showError = (title, text = "") => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#dc2626",
    });
  };

  const showWarning = (title, text = "") => {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#f59e0b",
    });
  };

  // =====================================================
  // LOGIN CHANGE
  // =====================================================

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // REGISTER CHANGE
  // =====================================================

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // FORGOT PASSWORD CHANGE
  // =====================================================

  const handleForgotChange = (e) => {
    const { name, value } = e.target;

    setForgotData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // LOGIN SUBMIT
  // =====================================================

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.emailOrMobile.trim()) {
      await showWarning(
        "Email or Mobile Required",
        "Please enter your email or mobile number."
      );
      return;
    }

    if (!loginData.password.trim()) {
      await showWarning(
        "Password Required",
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        emailOrMobile: loginData.emailOrMobile.trim(),
        password: loginData.password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      if (response.data.success) {
        const token = response.data.token;
        const user = response.data.user;

        if (token) {
          localStorage.setItem("token", token);
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        await showSuccess(
          "Login Successful!",
          response.data.message || "Welcome back to Grocery Sathi."
        );

        setLoginData({
          emailOrMobile: "",
          password: "",
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Login API Error:", error);
      console.error("Backend Error:", error.response?.data);

      await showError(
        "Login Failed",
        error.response?.data?.message ||
          "Please check your email/mobile and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REGISTER SUBMIT
  // =====================================================

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // =================================================
    // VALIDATION
    // =================================================

    if (!registerData.firstName.trim()) {
      await showWarning(
        "First Name Required",
        "Please enter your first name."
      );
      return;
    }

    if (!registerData.lastName.trim()) {
      await showWarning(
        "Last Name Required",
        "Please enter your last name."
      );
      return;
    }

    if (!registerData.email.trim()) {
      await showWarning(
        "Email Required",
        "Please enter your email."
      );
      return;
    }

    if (!registerData.mobile.trim()) {
      await showWarning(
        "Mobile Required",
        "Please enter your mobile number."
      );
      return;
    }

    if (!/^[0-9]{10}$/.test(registerData.mobile.trim())) {
      await showWarning(
        "Invalid Mobile Number",
        "Please enter a valid 10 digit mobile number."
      );
      return;
    }

    if (!registerData.password.trim()) {
      await showWarning(
        "Password Required",
        "Please enter your password."
      );
      return;
    }

    if (registerData.password.length < 6) {
      await showWarning(
        "Weak Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/register", {
        firstName: registerData.firstName.trim(),

        lastName: registerData.lastName.trim(),

        mobile: registerData.mobile.trim(),

        email: registerData.email.trim().toLowerCase(),

        password: registerData.password,

        // =================================================
        // REFERRAL CODE (from URL or manually typed)
        // =================================================

        referralCode: enteredReferralCode.trim().toUpperCase() || undefined,
      });

      console.log("REGISTER RESPONSE:", response.data);

      if (response.data.success) {
        const token = response.data.token;
        const user = response.data.user;

        if (token) {
          localStorage.setItem("token", token);
        }

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        await showSuccess(
          "Registration Successful!",
          response.data.message ||
            "Your Grocery Sathi account has been created."
        );

        setRegisterData({
          firstName: "",
          lastName: "",
          mobile: "",
          email: "",
          password: "",
        });

        setEnteredReferralCode("");

        // Clean the ?ref= from the URL before navigating
        window.history.replaceState({}, "", window.location.pathname);

        navigate("/");
      }
    } catch (error) {
      console.error("Register API Error:", error);
      console.error("Backend Error:", error.response?.data);

      await showError(
        "Registration Failed",
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORGOT PASSWORD - SEND OTP
  // =====================================================

  const handleForgotSubmit = async (e) => {
    e.preventDefault();

    const email = forgotData.email.trim().toLowerCase();

    if (!email) {
      await showWarning(
        "Email Required",
        "Please enter your registered email address."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await showWarning(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/forgot-password", {
        emailOrMobile: email,
      });

      console.log("FORGOT PASSWORD RESPONSE:", response.data);

      if (response.data.success) {
        setForgotData((prev) => ({
          ...prev,
          email,
        }));

        await showSuccess(
          "OTP Sent!",
          response.data.message ||
            "A password reset OTP has been sent to your email."
        );

        setForgotStep(2);
      } else {
        await showError(
          "Unable to Send OTP",
          response.data.message || "Unable to send OTP."
        );
      }
    } catch (error) {
      console.error("Forgot Password API Error:", error);
      console.error("Backend Error:", error.response?.data);

      await showError(
        "Unable to Send OTP",
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!forgotData.otp.trim()) {
      await showWarning(
        "OTP Required",
        "Please enter the OTP sent to your email."
      );
      return;
    }

    if (forgotData.otp.length !== 6) {
      await showWarning(
        "Invalid OTP",
        "Please enter a valid 6 digit OTP."
      );
      return;
    }

    if (!forgotData.newPassword.trim()) {
      await showWarning(
        "New Password Required",
        "Please enter your new password."
      );
      return;
    }

    if (forgotData.newPassword.length < 6) {
      await showWarning(
        "Weak Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!forgotData.confirmPassword.trim()) {
      await showWarning(
        "Confirm Password Required",
        "Please confirm your new password."
      );
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      await showWarning(
        "Passwords Don't Match",
        "New password and confirm password must match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/reset-password", {
        emailOrMobile: forgotData.email.trim().toLowerCase(),
        otp: forgotData.otp.trim(),
        newPassword: forgotData.newPassword,
      });

      console.log("RESET PASSWORD RESPONSE:", response.data);

      if (response.data.success) {
        await showSuccess(
          "Password Reset Successful!",
          response.data.message ||
            "Your password has been changed successfully."
        );

        setForgotData({
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });

        setForgotStep(1);
        setView("login");
      } else {
        await showError(
          "Password Reset Failed",
          response.data.message || "Unable to reset password."
        );
      }
    } catch (error) {
      console.error("Reset Password API Error:", error);
      console.error("Backend Error:", error.response?.data);

      await showError(
        "Password Reset Failed",
        error.response?.data?.message ||
          "Password reset failed. Please check the OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN FORGOT PASSWORD
  // =====================================================

  const handleOpenForgotPassword = () => {
    setForgotData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });

    setForgotStep(1);
    setView("forgot");
  };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin = () => {
    setView("login");
    setForgotStep(1);

    setForgotData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // =====================================================
  // BACK TO SHOP
  // =====================================================

  const handleBackToShop = () => {
    navigate("/");
  };

  // =====================================================
  // SEO DATA
  // =====================================================

  const pageTitle =
    view === "login"
      ? "Grocery Sathi Login"
      : view === "register"
        ? "Grocery Sathi Registration"
        : "Grocery Sathi Forgot Password";

  // =====================================================
  // JSX
  // =====================================================

  return (
    <main className="auth-page-wrapper">
      {/* SEO STRUCTURED DATA */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: pageTitle,
          description:
            "Access your Grocery Sathi account to manage orders and shop fresh groceries online.",
          publisher: {
            "@type": "Organization",
            name: "Grocery Sathi",
          },
        })}
      </script>

      {/* TOP BACK TO SHOP BUTTON */}
      <nav aria-label="Breadcrumb" className="auth-nav-container">
        <button
          type="button"
          className="auth-back-shop-btn"
          onClick={handleBackToShop}
          aria-label="Back to online grocery shop"
        >
          <span className="auth-back-arrow-circle" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </span>

          <span className="auth-back-text">Back to Shop</span>
        </button>
      </nav>

      {/* PAGE MAIN HEADING */}
      <h1 className="auth-main-heading">
        {view === "login"
          ? "Log In to Grocery Sathi"
          : view === "register"
            ? "Create Account"
            : "Forgot Password"}
      </h1>

      {/* =================================================
          REFERRAL BANNER
      ================================================= */}

      {enteredReferralCode && view === "register" && (
        <div className="auth-referral-banner">
          🎉 You were invited! Sign up to get your welcome bonus.
          <span className="auth-referral-code">
            Code: {enteredReferralCode}
          </span>
        </div>
      )}

      {/* MAIN CARD */}
      <section className="auth-card-box">
        {/* =================================================
            LOGIN
        ================================================= */}

        {view === "login" && (
          <div className="auth-form-container">
            <header className="auth-card-header">
              <h2>Log In</h2>
            </header>

            <form
              onSubmit={handleLoginSubmit}
              className="auth-form-body"
              aria-label="Login Form"
            >
              <p className="auth-subtext">
                Welcome back! Please enter your details.
              </p>

              <div className="auth-form-row">
                <div className="auth-field-group">
                  <label htmlFor="login-email-mobile">
                    Email / Mobile
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="login-email-mobile"
                    type="text"
                    name="emailOrMobile"
                    value={loginData.emailOrMobile}
                    onChange={handleLoginChange}
                    placeholder="Enter email or mobile number"
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="login-password">
                    Password
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="auth-action-row">
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={handleOpenForgotPassword}
                  disabled={loading}
                >
                  Forgot Password?
                </button>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  <span>{loading ? "Logging in..." : "Login"}</span>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              <div className="auth-switch-row">
                <span className="auth-switch-text">
                  Don't have an account?
                </span>

                <button
                  type="button"
                  className="auth-btn-secondary"
                  onClick={() => setView("register")}
                  disabled={loading}
                >
                  <span>Register</span>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =================================================
            REGISTER
        ================================================= */}

        {view === "register" && (
          <div className="auth-form-container">
            <header className="auth-card-header">
              <h2>Register</h2>
            </header>

            <form
              onSubmit={handleRegisterSubmit}
              className="auth-form-body"
              aria-label="Registration Form"
            >
              <fieldset className="auth-section-block">
                <legend className="auth-section-title">
                  Your Personal Details
                </legend>

                <div className="auth-form-row">
                  <div className="auth-field-group">
                    <label htmlFor="reg-firstname">
                      First Name
                      <span className="auth-required" aria-hidden="true">
                        *
                      </span>{" "}
                      :
                    </label>

                    <input
                      id="reg-firstname"
                      type="text"
                      name="firstName"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      placeholder="First name"
                      required
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="auth-field-group">
                    <label htmlFor="reg-lastname">
                      Last Name
                      <span className="auth-required" aria-hidden="true">
                        *
                      </span>{" "}
                      :
                    </label>

                    <input
                      id="reg-lastname"
                      type="text"
                      name="lastName"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      placeholder="Last name"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-email">
                    E-mail
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="Email address"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-mobile">
                    Mobile Number
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="reg-mobile"
                    type="tel"
                    name="mobile"
                    value={registerData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      if (value.length <= 10) {
                        setRegisterData((prev) => ({
                          ...prev,
                          mobile: value,
                        }));
                      }
                    }}
                    placeholder="Enter 10 digit mobile number"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>
              </fieldset>

              <fieldset className="auth-section-block">
                <legend className="auth-section-title">Your Password</legend>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-password">
                    Password
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Create a password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </fieldset>

              {/* =================================================
                  REFERRAL CODE (MANUAL INPUT)
              ================================================= */}

              <fieldset className="auth-section-block">
                <legend className="auth-section-title">
                  Referral Code (Optional)
                </legend>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-referral-code">
                    Have a referral code?
                  </label>

                  <input
                    id="reg-referral-code"
                    type="text"
                    name="referralCode"
                    value={enteredReferralCode}
                    onChange={(e) =>
                      setEnteredReferralCode(
                        e.target.value.trim().toUpperCase()
                      )
                    }
                    placeholder="Enter your friend's referral code"
                    autoComplete="off"
                    maxLength={20}
                  />

                  {enteredReferralCode && (
                    <span className="auth-referral-hint">
                      🎉 Your welcome bonus will be applied after registration.
                    </span>
                  )}
                </div>
              </fieldset>

              <div className="auth-action-row align-end">
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  <span>
                    {loading ? "Creating Account..." : "Create Account"}
                  </span>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              <div className="auth-switch-row">
                <span className="auth-switch-text">
                  Already have an account?
                </span>

                <button
                  type="button"
                  className="auth-btn-secondary"
                  onClick={() => setView("login")}
                  disabled={loading}
                >
                  <span>Login</span>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        {view === "forgot" && (
          <div className="auth-form-container">
            <header className="auth-card-header">
              <h2>Forgot Password</h2>
            </header>

            {forgotStep === 1 && (
              <form
                onSubmit={handleForgotSubmit}
                className="auth-form-body"
                aria-label="Forgot Password Form"
              >
                <p className="auth-subtext">
                  Enter your registered email address. We will send you an OTP
                  to reset your password.
                </p>

                <div className="auth-field-group full-width">
                  <label htmlFor="forgot-email">
                    Email
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="forgot-email"
                    type="email"
                    name="email"
                    value={forgotData.email}
                    onChange={handleForgotChange}
                    placeholder="Enter your registered email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-action-row align-end">
                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={loading}
                  >
                    <span>{loading ? "Sending OTP..." : "Send OTP"}</span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>

                <div className="auth-switch-row">
                  <span className="auth-switch-text">
                    Remember your password?
                  </span>

                  <button
                    type="button"
                    className="auth-btn-secondary"
                    onClick={handleBackToLogin}
                    disabled={loading}
                  >
                    <span>Login</span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form
                onSubmit={handleResetPassword}
                className="auth-form-body"
                aria-label="Reset Password Form"
              >
                <p className="auth-subtext">
                  Enter the OTP sent to your email and create your new password.
                </p>

                <div className="auth-field-group full-width">
                  <label htmlFor="forgot-otp">
                    OTP
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="forgot-otp"
                    type="text"
                    name="otp"
                    value={forgotData.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      if (value.length <= 6) {
                        setForgotData((prev) => ({
                          ...prev,
                          otp: value,
                        }));
                      }
                    }}
                    placeholder="Enter 6 digit OTP"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="auth-field-group full-width">
                  <label htmlFor="forgot-new-password">
                    New Password
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="forgot-new-password"
                    type="password"
                    name="newPassword"
                    value={forgotData.newPassword}
                    onChange={handleForgotChange}
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="auth-field-group full-width">
                  <label htmlFor="forgot-confirm-password">
                    Confirm Password
                    <span className="auth-required" aria-hidden="true">
                      *
                    </span>{" "}
                    :
                  </label>

                  <input
                    id="forgot-confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={forgotData.confirmPassword}
                    onChange={handleForgotChange}
                    placeholder="Confirm new password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="auth-action-row align-end">
                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={loading}
                  >
                    <span>{loading ? "Resetting..." : "Reset Password"}</span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>

                <div className="auth-switch-row">
                  <span className="auth-switch-text">
                    Remember your password?
                  </span>

                  <button
                    type="button"
                    className="auth-btn-secondary"
                    onClick={handleBackToLogin}
                    disabled={loading}
                  >
                    <span>Back to Login</span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default LoginPage;
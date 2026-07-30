import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  // State to toggle between 'login' and 'register' views
  const [view, setView] = useState('login');

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register Form State
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert(`Logging in with: ${loginData.email}`);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert(`Account created for: ${registerData.firstName} ${registerData.lastName}`);
  };

  return (
    <main className="auth-page-wrapper">
      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": view === 'login' ? "Grocery Sathi Login" : "Grocery Sathi Registration",
          "description": "Access your Grocery Sathi account to manage orders and shop fresh groceries online.",
          "publisher": {
            "@type": "Organization",
            "name": "Grocery Sathi"
          }
        })}
      </script>

      {/* --- TOP BACK TO SHOP BUTTON --- */}
      <nav aria-label="Breadcrumb" className="auth-nav-container">
        <button 
          type="button" 
          className="auth-back-shop-btn" 
          onClick={() => alert('Redirecting to Shop...')}
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
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </span>
          <span className="auth-back-text">Back to Shop</span>
        </button>
      </nav>

      {/* --- PAGE MAIN HEADING --- */}
      <h1 className="auth-main-heading">
        {view === 'login' ? 'Log In to Grocery Sathi' : 'Create Account'}
      </h1>

      {/* --- MAIN CARD BOX --- */}
      <section className="auth-card-box">
        {view === 'login' ? (
          /* ================= LOGIN FORM ================= */
          <div className="auth-form-container">
            <header className="auth-card-header">
              <h2>Log In</h2>
            </header>

            <form onSubmit={handleLoginSubmit} className="auth-form-body" aria-label="Login Form">
              <p className="auth-subtext">Welcome back! Please enter your details.</p>

              <div className="auth-form-row">
                <div className="auth-field-group">
                  <label htmlFor="login-email">
                    E-mail<span className="auth-required" aria-hidden="true">*</span> :
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="login-password">
                    Password<span className="auth-required" aria-hidden="true">*</span> :
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

              {/* Action Section (Forgot password & Login button) */}
              <div className="auth-action-row">
                <a
                  href="#forgot"
                  className="auth-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Forgot Password clicked');
                  }}
                >
                  Forgot Password?
                </a>

                <button type="submit" className="auth-btn-primary">
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
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              {/* Bottom Switch to Register Section */}
              <div className="auth-switch-row">
                <span className="auth-switch-text">Don't have an account?</span>
                <button
                  type="button"
                  className="auth-btn-secondary"
                  onClick={() => setView('register')}
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
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================= REGISTER FORM ================= */
          <div className="auth-form-container">
            <header className="auth-card-header">
              <h2>Register</h2>
            </header>

            <form onSubmit={handleRegisterSubmit} className="auth-form-body" aria-label="Registration Form">
              {/* Personal Details Section */}
              <fieldset className="auth-section-block">
                <legend className="auth-section-title">Your Personal Details</legend>

                <div className="auth-form-row">
                  <div className="auth-field-group">
                    <label htmlFor="reg-firstname">
                      First Name<span className="auth-required" aria-hidden="true">*</span> :
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
                      Last Name<span className="auth-required" aria-hidden="true">*</span> :
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
                    E-mail<span className="auth-required" aria-hidden="true">*</span> :
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
              </fieldset>

              {/* Password Section */}
              <fieldset className="auth-section-block">
                <legend className="auth-section-title">Your Password</legend>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-password">
                    Password<span className="auth-required" aria-hidden="true">*</span> :
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

              {/* Create Button Section */}
              <div className="auth-action-row align-end">
                <button type="submit" className="auth-btn-primary">
                  <span>Create Account</span>
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
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              {/* Bottom Switch to Login Section */}
              <div className="auth-switch-row">
                <span className="auth-switch-text">Already have an account?</span>
                <button
                  type="button"
                  className="auth-btn-secondary"
                  onClick={() => setView('login')}
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
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  );
};

export default LoginPage;
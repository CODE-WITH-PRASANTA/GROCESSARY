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
    <div className="auth-page-wrapper">
      {/* --- TOP BACK TO SHOP BUTTON --- */}
      <button 
        type="button" 
        className="auth-back-shop-btn" 
        onClick={() => alert('Redirecting to Shop...')}
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

      {/* --- PAGE MAIN HEADING --- */}
      <h1 className="auth-main-heading">
        {view === 'login' ? 'Log In' : 'Register'}
      </h1>

      {/* --- MAIN CARD BOX --- */}
      <div className="auth-card-box">
        {view === 'login' ? (
          /* ================= LOGIN FORM ================= */
          <div className="auth-form-container">
            <div className="auth-card-header">
              <h2>Log In</h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form-body">
              <p className="auth-subtext">I am a returning customer</p>

              <div className="auth-form-row">
                <div className="auth-field-group">
                  <label htmlFor="login-email">
                    E-mail<span className="auth-required">*</span> :
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label htmlFor="login-password">
                    Password<span className="auth-required">*</span> :
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Password"
                    required
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
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              {/* Bottom Switch to Register Section */}
              <div className="auth-switch-row">
                <span className="auth-switch-text">If you dont have account</span>
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
            <form onSubmit={handleRegisterSubmit} className="auth-form-body">
              {/* Personal Details Section */}
              <div className="auth-section-block">
                <h3 className="auth-section-title">Your Personal Details</h3>

                <div className="auth-form-row">
                  <div className="auth-field-group">
                    <label htmlFor="reg-firstname">
                      First Name<span className="auth-required">*</span> :
                    </label>
                    <input
                      id="reg-firstname"
                      type="text"
                      name="firstName"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="auth-field-group">
                    <label htmlFor="reg-lastname">
                      Last Name<span className="auth-required">*</span> :
                    </label>
                    <input
                      id="reg-lastname"
                      type="text"
                      name="lastName"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-email">
                    E-mail<span className="auth-required">*</span> :
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="auth-section-block">
                <h3 className="auth-section-title">Your Password</h3>

                <div className="auth-field-group full-width">
                  <label htmlFor="reg-password">
                    Password<span className="auth-required">*</span> :
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              {/* Create Button Section */}
              <div className="auth-action-row align-end">
                <button type="submit" className="auth-btn-primary">
                  <span>Create</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
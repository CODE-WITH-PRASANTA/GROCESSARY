// src/Components/AdminRegister/AdminRegister.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "./AdminRegister.css";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      password,
      confirmPassword,
    } = formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/admin/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data?.success) {
        setSuccess(
          "Admin registered successfully. Redirecting to login..."
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        setError(
          response.data?.message || "Registration failed."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to register admin. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>GrocerySathi</h1>
          <p>ADMIN PANEL</p>
        </div>

        <div className="register-body">
          <h2>Create Admin Account</h2>

          <p className="register-subtitle">
            Register your first administrator account
          </p>

          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="register-success" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="register-input-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Admin"}
            </button>
          </form>

          <div className="register-login-link">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
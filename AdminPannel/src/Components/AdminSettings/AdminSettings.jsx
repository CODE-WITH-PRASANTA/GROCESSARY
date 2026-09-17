import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Save, User, Lock, Mail } from "lucide-react";
import API from "../../api/axios";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);

      const response = await API.get("/admin/profile");

      const admin = response.data.admin;

      setFormData((previous) => ({
        ...previous,
        name: admin.name || "",
        email: admin.email || "",
      }));
    } catch (error) {
      console.error("Fetch profile error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to load profile details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (!formData.name.trim()) {
      setMessage({
        type: "error",
        text: "Name is required",
      });
      return;
    }

    if (!formData.email.trim()) {
      setMessage({
        type: "error",
        text: "Email is required",
      });
      return;
    }

    const isChangingPassword =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        setMessage({
          type: "error",
          text: "Enter your current password",
        });
        return;
      }

      if (!formData.newPassword) {
        setMessage({
          type: "error",
          text: "Enter your new password",
        });
        return;
      }

      if (formData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "New password must be at least 6 characters",
        });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({
          type: "error",
          text: "New password and confirm password do not match",
        });
        return;
      }
    }

    try {
      setSaving(true);

      const response = await API.put("/admin/profile", {
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage({
        type: "success",
        text:
          response.data.message ||
          "Profile updated successfully",
      });

      setFormData((previous) => ({
        ...previous,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Update profile error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="AdminSettings-loading">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="AdminSettings-page">
      <div className="AdminSettings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your admin profile and password</p>
        </div>
      </div>

      <form
        className="AdminSettings-form"
        onSubmit={handleSubmit}
      >
        {message.text && (
          <div
            className={`AdminSettings-message ${message.type}`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Information */}
        <div className="AdminSettings-card">
          <div className="AdminSettings-cardHeader">
            <div className="AdminSettings-cardIcon">
              <User size={20} />
            </div>

            <div>
              <h2>Profile Information</h2>
              <p>Update your basic account details</p>
            </div>
          </div>

          <div className="AdminSettings-grid">
            <div className="AdminSettings-field">
              <label htmlFor="name">
                Full Name
              </label>

              <div className="AdminSettings-inputWrapper">
                <User size={17} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="AdminSettings-field">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="AdminSettings-inputWrapper">
                <Mail size={17} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Information */}
        <div className="AdminSettings-card">
          <div className="AdminSettings-cardHeader">
            <div className="AdminSettings-cardIcon">
              <Lock size={20} />
            </div>

            <div>
              <h2>Change Password</h2>
              <p>
                Leave these fields empty if you do not want to
                change your password
              </p>
            </div>
          </div>

          <div className="AdminSettings-passwordGrid">
            <div className="AdminSettings-field">
              <label htmlFor="currentPassword">
                Current Password
              </label>

              <div className="AdminSettings-inputWrapper">
                <Lock size={17} />

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={
                    showPassword.current
                      ? "text"
                      : "password"
                  }
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  className="AdminSettings-eyeBtn"
                  onClick={() =>
                    togglePasswordVisibility("current")
                  }
                >
                  {showPassword.current ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="AdminSettings-field">
              <label htmlFor="newPassword">
                New Password
              </label>

              <div className="AdminSettings-inputWrapper">
                <Lock size={17} />

                <input
                  id="newPassword"
                  name="newPassword"
                  type={
                    showPassword.new
                      ? "text"
                      : "password"
                  }
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  className="AdminSettings-eyeBtn"
                  onClick={() =>
                    togglePasswordVisibility("new")
                  }
                >
                  {showPassword.new ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="AdminSettings-field">
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <div className="AdminSettings-inputWrapper">
                <Lock size={17} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showPassword.confirm
                      ? "text"
                      : "password"
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="AdminSettings-eyeBtn"
                  onClick={() =>
                    togglePasswordVisibility("confirm")
                  }
                >
                  {showPassword.confirm ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="AdminSettings-actions">
          <button
            type="submit"
            className="AdminSettings-saveBtn"
            disabled={saving}
          >
            <Save size={18} />

            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
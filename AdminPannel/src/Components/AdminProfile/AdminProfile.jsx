import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/profile");

      setAdmin(response.data.admin);
    } catch (error) {
      console.error("Profile error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load admin profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  if (loading) {
    return (
      <div className="admin-profile-loading">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-profile-error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <div>
          <h1>My Profile</h1>
          <p>View your complete admin account details</p>
        </div>
      </div>

      <div className="admin-profile-container">
        <div className="admin-profile-card">
          <div className="admin-profile-top">
            <div className="admin-profile-avatar">
              {admin?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2>{admin?.name}</h2>
              <p>{admin?.email}</p>
              <span className="admin-profile-role">
                {admin?.role}
              </span>
            </div>
          </div>

          <div className="admin-profile-details">
            <div className="admin-profile-detail">
              <span>Full Name</span>
              <strong>{admin?.name || "N/A"}</strong>
            </div>

            <div className="admin-profile-detail">
              <span>Email Address</span>
              <strong>{admin?.email || "N/A"}</strong>
            </div>

            <div className="admin-profile-detail">
              <span>Account Role</span>
              <strong>{admin?.role || "N/A"}</strong>
            </div>

            <div className="admin-profile-detail">
              <span>Admin ID</span>
              <strong>{admin?._id || "N/A"}</strong>
            </div>

            <div className="admin-profile-detail">
              <span>Account Created</span>
              <strong>
                {admin?.createdAt
                  ? new Date(
                      admin.createdAt
                    ).toLocaleString()
                  : "N/A"}
              </strong>
            </div>

            <div className="admin-profile-detail">
              <span>Last Updated</span>
              <strong>
                {admin?.updatedAt
                  ? new Date(
                      admin.updatedAt
                    ).toLocaleString()
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
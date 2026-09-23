import React, { useEffect, useState } from "react";

import API from "../../api/axios";

import "./Profile.css";

// ======================================================
// 5 PREDEFINED AVATARS
// ======================================================

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Max",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Milo",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Zoe",
];

const Profile = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // ======================================================
  // FORM DATA
  // ======================================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    profileImage: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDateForInput = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  };

  // ======================================================
  // CREATE FORM DATA
  // ======================================================

  const createFormData = (userData) => {
    return {
      firstName: userData?.firstName || "",

      lastName: userData?.lastName || "",

      email: userData?.email || "",

      mobile: userData?.mobile || "",

      profileImage: userData?.profileImage || "",

      gender: userData?.gender || "",

      dateOfBirth: formatDateForInput(userData?.dateOfBirth),

      address: userData?.address || "",

      city: userData?.city || "",

      state: userData?.state || "",

      country: userData?.country || "",

      pincode: userData?.pincode || "",
    };
  };

  // ======================================================
  // GET LOGGED-IN USER
  // ======================================================

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your profile.");

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await API.get("/auth/me");

        console.log("Logged-in user:", response.data);

        if (response.data?.success && response.data?.user) {
          const userData = response.data.user;

          setUser(userData);

          setFormData(createFormData(userData));
        } else {
          setError(response.data?.message || "Unable to fetch profile.");
        }
      } catch (error) {
        console.error("Profile API error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");

          setUser(null);

          setError("Session expired. Please login again.");
        } else {
          setError(error.response?.data?.message || "Unable to fetch profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedInUser();
  }, []);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // SELECT AVATAR
  // ======================================================

  const handleAvatarSelect = (avatar) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: avatar,
    }));

    setSuccess("");
    setError("");
  };

  // ======================================================
  // START EDIT
  // ======================================================

  const handleEdit = () => {
    setFormData(createFormData(user));

    setError("");
    setSuccess("");

    setIsEditing(true);
  };

  // ======================================================
  // CANCEL EDIT
  // ======================================================

  const handleCancel = () => {
    setFormData(createFormData(user));

    setError("");
    setSuccess("");

    setIsEditing(false);
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      // ==================================================
      // UPDATE PAYLOAD
      // ==================================================

      const payload = {
        firstName: formData.firstName.trim(),

        lastName: formData.lastName.trim(),

        email: formData.email.trim().toLowerCase(),

        mobile: formData.mobile.trim(),

        profileImage: formData.profileImage.trim(),

        gender: formData.gender,

        dateOfBirth: formData.dateOfBirth || null,

        address: formData.address.trim(),

        city: formData.city.trim(),

        state: formData.state.trim(),

        country: formData.country.trim(),

        pincode: formData.pincode.trim(),
      };

      console.log("Profile update payload:", payload);

      // ==================================================
      // PUT /AUTH/ME
      // ==================================================

      const response = await API.put("/auth/me", payload);

      console.log("Profile update response:", response.data);

      // ==================================================
      // UPDATE SUCCESS
      // ==================================================

      if (response.data?.success && response.data?.user) {
        const updatedUser = response.data.user;

        // Update user state
        setUser(updatedUser);

        // Update form state
        setFormData(createFormData(updatedUser));

        // Exit edit mode
        setIsEditing(false);

        setSuccess(response.data.message || "Profile updated successfully.");

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.data?.message || "Unable to update profile.");
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error.response?.data || error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        setUser(null);

        setError("Session expired. Please login again.");

        return;
      }

      setError(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="Profile">
        <div className="Profile-loading">Loading profile...</div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !user) {
    return (
      <div className="Profile">
        <div className="Profile-error">{error}</div>
      </div>
    );
  }

  // ======================================================
  // USER NOT FOUND
  // ======================================================

  if (!user) {
    return (
      <div className="Profile">
        <div className="Profile-error">User profile not found.</div>
      </div>
    );
  }

  // ======================================================
  // FULL NAME
  // ======================================================

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.name ||
    "User";

  // ======================================================
  // FIRST LETTER
  // ======================================================

  const firstLetter = fullName.charAt(0).toUpperCase();

  // ======================================================
  // DATE OF BIRTH
  // ======================================================

  const formattedDateOfBirth = user.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString()
    : "-";

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <div className="Profile">
      <div className="Profile-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="Profile-header">
          <div className="Profile-header-content">
            <h1>My Profile</h1>

            <p>Manage your personal account information</p>
          </div>
        </div>

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <div className="Profile-card">
          {/* ==================================================
              AVATAR SECTION
          ================================================== */}

          <div className="Profile-avatar-section">
            <div className="Profile-avatar">
              {(() => {
                const avatar = isEditing
                  ? formData.profileImage
                  : user.profileImage;

                console.log("DISPLAY AVATAR:", avatar);

                if (avatar) {
                  return (
                    <img
                      key={avatar}
                      src={avatar}
                      alt={fullName}
                      onLoad={() => {
                        console.log("Avatar loaded:", avatar);
                      }}
                      onError={(e) => {
                        console.log("Avatar failed:", avatar);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  );
                }

                return firstLetter;
              })()}
            </div>

            <div className="Profile-user-summary">
              <h2>{fullName}</h2>

              <p>{user.email || "-"}</p>

              {user.role && <span className="Profile-role">{user.role}</span>}
            </div>
          </div>
          {/* ==================================================
              AVATAR OPTIONS
          ================================================== */}

          {isEditing && (
            <div className="Profile-avatar-options">
              <p>Choose Avatar</p>

              <div className="Profile-avatar-list">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    type="button"
                    key={avatar}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={
                      formData.profileImage === avatar
                        ? "Profile-avatar-option selected"
                        : "Profile-avatar-option"
                    }
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && <div className="Profile-success">{success}</div>}

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && <div className="Profile-error">{error}</div>}

          {/* ==================================================
              PROFILE DETAILS
          ================================================== */}

          <div className="Profile-details">
            {/* ==================================================
                PERSONAL INFORMATION TITLE
            ================================================== */}

            <div className="Profile-section-title">
              <h3>Personal Information</h3>

              {!isEditing && (
                <button type="button" onClick={handleEdit}>
                  Edit Profile
                </button>
              )}
            </div>

            {/* ==================================================
                PERSONAL GRID
            ================================================== */}

            <div className="Profile-grid">
              {/* FIRST NAME */}

              <div className="Profile-field">
                <label>First Name</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.firstName || "-"}</div>
                )}
              </div>

              {/* LAST NAME */}

              <div className="Profile-field">
                <label>Last Name</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.lastName || "-"}</div>
                )}
              </div>

              {/* EMAIL */}

              <div className="Profile-field">
                <label>Email</label>

                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.email || "-"}</div>
                )}
              </div>

              {/* MOBILE */}

              <div className="Profile-field">
                <label>Mobile Number</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.mobile || "-"}</div>
                )}
              </div>

              {/* GENDER */}

              <div className="Profile-field">
                <label>Gender</label>

                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>

                    <option value="Male">Male</option>

                    <option value="Female">Female</option>

                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="Profile-value">{user.gender || "-"}</div>
                )}
              </div>

              {/* DATE OF BIRTH */}

              <div className="Profile-field">
                <label>Date of Birth</label>

                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{formattedDateOfBirth}</div>
                )}
              </div>
            </div>

            {/* ==================================================
                ADDRESS
            ================================================== */}

            <div className="Profile-section-title Profile-address-title">
              <h3>Address Information</h3>
            </div>

            <div className="Profile-grid">
              {/* ADDRESS */}

              <div className="Profile-field Profile-field-full">
                <label>Address</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.address || "-"}</div>
                )}
              </div>

              {/* CITY */}

              <div className="Profile-field">
                <label>City</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.city || "-"}</div>
                )}
              </div>

              {/* STATE */}

              <div className="Profile-field">
                <label>State</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.state || "-"}</div>
                )}
              </div>

              {/* COUNTRY */}

              <div className="Profile-field">
                <label>Country</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.country || "-"}</div>
                )}
              </div>

              {/* PINCODE */}

              <div className="Profile-field">
                <label>PIN Code</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="Profile-value">{user.pincode || "-"}</div>
                )}
              </div>
            </div>

            {/* ==================================================
                ACCOUNT INFORMATION
            ================================================== */}

            <div className="Profile-section-title Profile-account-title">
              <h3>Account Information</h3>
            </div>

            <div className="Profile-grid">
              {/* STATUS */}

              <div className="Profile-field">
                <label>Account Status</label>

                <div className="Profile-value">
                  <span
                    className={
                      user.isActive
                        ? "Profile-status active"
                        : "Profile-status inactive"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* ROLE */}

              <div className="Profile-field">
                <label>Role</label>

                <div className="Profile-value">{user.role || "User"}</div>
              </div>

              {/* JOINED */}

              <div className="Profile-field">
                <label>Joined On</label>

                <div className="Profile-value">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </div>
              </div>

              {/* UPDATED */}

              <div className="Profile-field">
                <label>Last Updated</label>

                <div className="Profile-value">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>

            {/* ==================================================
                SAVE / CANCEL
            ================================================== */}

            {isEditing && (
              <div className="Profile-actions">
                <button type="button" onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>

                <button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

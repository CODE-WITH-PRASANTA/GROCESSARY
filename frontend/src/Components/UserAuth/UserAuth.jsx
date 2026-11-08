import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, MapPin, Package, Gift, Copy, Check, LogOut, HelpCircle } from "lucide-react";
import API from "../../api/axios";
import { clearLocalCartOnLogout } from "../../Utils/cartService";
import { clearLocalWishlistOnLogout } from "../../Utils/wishlistService";
import "./UserAuth.css";

// ======================================================
// COMPONENT
// ======================================================

const UserAuth = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  const [referralLink, setReferralLink] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralLoading, setReferralLoading] = useState(false);

  // ======================================================
  // HELPERS
  // ======================================================

  const getToken = () => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  const getUserName = (user) => {
    if (!user) return "";
    const raw =
      user?.name ||
      user?.fullName ||
      user?.username ||
      user?.userName ||
      user?.firstName ||
      user?.email?.split("@")[0] ||
      "User";
    return String(raw).trim();
  };

  const getFirstName = (user) => {
    if (!user) return "";
    if (user?.firstName && user.firstName.trim()) {
      return user.firstName.trim();
    }
    const full = getUserName(user);
    if (!full) return "User";
    // Return only the first name (first word)
    const firstWord = full.trim().split(/\s+/)[0];
    return firstWord || "User";
  };

  const handleNavigate = (path) => {
    if (onNavigate) onNavigate();
    navigate(path);
  };

  // ======================================================
  // FETCH CURRENT USER
  // ======================================================

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        setCurrentUser(null);
        setUserLoading(false);
        return;
      }

      const { data } = await API.get("/auth/me");

      const user = data?.user || data?.data?.user || data?.data || null;
      setCurrentUser(user);
    } catch (error) {
      console.error("NavAuth fetch user error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        clearLocalCartOnLogout();
        clearLocalWishlistOnLogout();
        setCurrentUser(null);
        window.dispatchEvent(new Event("authChanged"));
      }
    } finally {
      setUserLoading(false);
    }
  }, []);

  // ======================================================
  // FETCH REFERRAL LINK
  // ======================================================

  const fetchReferralLink = useCallback(async () => {
    try {
      setReferralLoading(true);

      const token = getToken();
      if (!token) {
        setReferralLink("");
        return;
      }

      const { data } = await API.get("/referrals/link");

      if (data?.success) {
        const code = data.code || data.referralCode || "";
        const fullLink = `${window.location.origin}/login?ref=${encodeURIComponent(code)}`;
        setReferralLink(fullLink);
      }
    } catch (error) {
      console.error("NavAuth fetch referral link error:", error);
    } finally {
      setReferralLoading(false);
    }
  }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [currentUser?.profileImage]);

  useEffect(() => {
    if (currentUser) {
      fetchReferralLink();
    } else {
      setReferralLink("");
    }
  }, [currentUser, fetchReferralLink]);

  // ======================================================
  // AUTO-CLOSE DROPDOWN ON ROUTE CHANGE
  // ======================================================

  useEffect(() => {
    setIsAccountOpen(false);
  }, [location.pathname]);

  // ======================================================
  // CLICK OUTSIDE TO CLOSE DROPDOWN
  // ======================================================

  useEffect(() => {
    if (!isAccountOpen) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest(".navbar-user-logged-in")) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccountOpen]);

  // ======================================================
  // AUTH EVENTS
  // ======================================================

  useEffect(() => {
    const handleAuthChanged = () => {
      fetchCurrentUser();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => window.removeEventListener("authChanged", handleAuthChanged);
  }, [fetchCurrentUser]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "token") {
        fetchCurrentUser();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchCurrentUser]);

  // ======================================================
  // COPY REFERRAL LINK
  // ======================================================

  const handleCopyReferral = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = referralLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  // ======================================================
  // LOGOUT — clear Project 1 and notify Project 2
  // ======================================================

  const handleLogout = () => {
    // 1. Clear all stored auth tokens and user data
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // 2. Automatically clear local cart and wishlist so account items don't linger
    clearLocalCartOnLogout();
    clearLocalWishlistOnLogout();

    // 3. Reset local component state
    setCurrentUser(null);
    setReferralLink("");
    setIsAccountOpen(false);

    // 4. Notify all listeners in this app
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("storage"));

    // 5. Navigate cleanly to login page
    navigate("/login");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      {currentUser ? (
        <div className="navbar-user-logged-in">
          <button
            type="button"
            className="navbar-icon-btn navbar-user-btn"
            aria-label={`Account of ${getUserName(currentUser)}`}
            onClick={() => setIsAccountOpen((previous) => !previous)}
          >
            {currentUser?.profileImage && !avatarLoadError ? (
              <span className="navbar-btn-avatar">
                <img
                  src={currentUser.profileImage}
                  alt={getUserName(currentUser)}
                  className="navbar-btn-avatar-img"
                  onError={() => setAvatarLoadError(true)}
                />
              </span>
            ) : (
              <span className="navbar-btn-avatar navbar-btn-avatar-initial">
                {getUserName(currentUser) ? (
                  getUserName(currentUser).charAt(0).toUpperCase()
                ) : (
                  <User size={16} aria-hidden="true" />
                )}
              </span>
            )}

            {!userLoading && (
              <span className="navbar-user-name">
                {getFirstName(currentUser)}
              </span>
            )}
          </button>

          {isAccountOpen && (
            <div className="navbar-account-dropdown">
              <div className="navbar-account-header">
                <div className="navbar-account-avatar">
                  {currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={getUserName(currentUser)}
                      className="navbar-avatar-img"
                    />
                  ) : (
                    getUserName(currentUser).charAt(0).toUpperCase()
                  )}
                </div>

                <div className="navbar-account-info">
                  <span className="navbar-account-name">
                    {getUserName(currentUser)}
                  </span>
                  <span className="navbar-account-email">
                    {currentUser?.email || ""}
                  </span>
                </div>
              </div>

              <div className="navbar-account-divider" />

              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false);
                  handleNavigate("/profile?tab=profile");
                }}
                className="navbar-account-item"
              >
                <User size={16} />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false);
                  handleNavigate("/profile?tab=addresses");
                }}
                className="navbar-account-item"
              >
                <MapPin size={16} />
                <span>Saved Address</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false);
                  handleNavigate("/profile?tab=orders");
                }}
                className="navbar-account-item"
              >
                <Package size={16} />
                <span>My Order</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false);
                  handleNavigate("/profile?tab=referral");
                }}
                className="navbar-account-item"
              >
                <Gift size={16} />
                <span>Refer &amp; Earn</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false);
                  handleNavigate("/profile?tab=help");
                }}
                className="navbar-account-item"
              >
                <HelpCircle size={16} />
                <span>Help Center</span>
              </button>

              {referralLink && (
                <div className="navbar-account-referral">
                  <span className="navbar-referral-label">
                    Your Referral Link
                  </span>

                  <div className="navbar-referral-box">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="navbar-referral-input"
                    />

                    <button
                      type="button"
                      className={`navbar-referral-copy ${
                        copiedReferral ? "copied" : ""
                      }`}
                      onClick={handleCopyReferral}
                      aria-label="Copy referral link"
                    >
                      {copiedReferral ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {referralLoading && !referralLink && (
                <div className="navbar-referral-loading">
                  Loading referral link…
                </div>
              )}

              <div className="navbar-account-divider" />

              <button
                type="button"
                onClick={handleLogout}
                className="navbar-account-item danger"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/login"
          className="navbar-icon-btn"
          aria-label="Login"
          onClick={onNavigate}
        >
          <User size={22} aria-hidden="true" />

          {!userLoading && <span className="navbar-user-name">Login</span>}
        </Link>
      )}
    </>
  );
};

export default UserAuth;

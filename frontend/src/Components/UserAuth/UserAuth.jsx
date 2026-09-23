import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Gift, Copy, Check, LogOut } from "lucide-react";
import API from "../../api/axios";
import "./UserAuth.css";

const PROJECT2_URL = import.meta.env.VITE_PROJECT2_URL;

// ======================================================
// COMPONENT
// ======================================================

const UserAuth = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

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
        setCurrentUser(null);
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
        setReferralLink(data.link || "");
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
  // OPEN USER PANEL (SSO)
  // ======================================================

  const handleUserPanel = async () => {
    try {
      setAccountLoading(true);

      const token = getToken();

      if (!token) {
        setCurrentUser(null);
        setIsAccountOpen(false);
        handleNavigate("/login");
        return;
      }

      const { data } = await API.post("/auth/create-handoff");

      if (!data?.success) {
        throw new Error(data?.message || "Unable to create login handoff.");
      }

      const code = data?.code;

      if (!code) {
        throw new Error("Handoff code was not returned.");
      }

      setIsAccountOpen(false);

      window.location.href = `${PROJECT2_URL}/sso?code=${encodeURIComponent(
        code,
      )}`;
    } catch (error) {
      console.error("NavAuth user panel error:", error);

      const message = String(error?.message || "").toLowerCase();

      if (message.includes("token") || message.includes("authentication")) {
        localStorage.removeItem("token");
        setCurrentUser(null);
        setIsAccountOpen(false);
        handleNavigate("/login");
      }
    } finally {
      setAccountLoading(false);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setReferralLink("");
    setIsAccountOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    handleNavigate("/");
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
            className="navbar-icon-btn"
            aria-label={`Account of ${getUserName(currentUser)}`}
            onClick={() => setIsAccountOpen((previous) => !previous)}
          >
            <User size={22} aria-hidden="true" />

            {!userLoading && (
              <span className="navbar-user-name">
                {getUserName(currentUser)}
              </span>
            )}
          </button>

          {isAccountOpen && (
            <div className="navbar-account-dropdown">
              <div className="navbar-account-header">
                <div className="navbar-account-avatar">
                  {getUserName(currentUser).charAt(0).toUpperCase()}
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
                onClick={handleUserPanel}
                disabled={accountLoading}
                className="navbar-account-item"
              >
                <User size={16} />
                <span>{accountLoading ? "Opening..." : "My Account"}</span>
              </button>

              {/* <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false);
                  handleNavigate("/refer-earn");
                }}
                className="navbar-account-item"
              >
                <Gift size={16} />
                <span>Refer &amp; Earn</span>
              </button> */}

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
          to="/account"
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

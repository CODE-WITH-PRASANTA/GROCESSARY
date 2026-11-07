import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  User,
  MapPin,
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  X,
  Phone,
  Mail,
  Home,
  Briefcase,
  Camera,
  Gift,
  HelpCircle,
  Share2,
  MessageCircle,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  LogOut,
  Users,
  FileText,
  Download,
  Sparkles,
  Ticket,
} from "lucide-react";
import API from "../../api/axios";
import { downloadOrderInvoicePdf } from "../../Utils/directInvoiceDownloader";
import "./UserProfile.css";

const UserProfile = ({ defaultTab = "profile" }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Tab State: 'profile' | 'addresses' | 'orders' | 'referral' | 'help'
  const currentTab = searchParams.get("tab") || defaultTab;

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // =========================================================
  // USER PROFILE STATES
  // =========================================================
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Referral
  const [referralCode, setReferralCode] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    completed: 0,
    pending: 0,
    totalEarned: 0,
  });
  const [referralList, setReferralList] = useState([]);
  const [referralLoading, setReferralLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "Home",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  // Help Center FAQs
  const [expandedFaq, setExpandedFaq] = useState(0);

  // =========================================================
  // AUTH CHECK & LOAD USER
  // =========================================================
  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUserLoading(true);
      const { data } = await API.get("/auth/me");
      const u = data?.user || data?.data?.user || data?.data;
      if (u) {
        setUser(u);
        setProfileForm({
          firstName: u.firstName || u.name?.split(" ")[0] || "",
          lastName:
            u.lastName ||
            (u.name?.split(" ").slice(1).join(" ") || ""),
          mobile: u.mobile || "",
          email: u.email || "",
        });
      }
    } catch (error) {
      console.error("Load user error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setUserLoading(false);
    }
  }, [navigate]);

  // Load referral details
  const loadReferral = useCallback(async () => {
    try {
      setReferralLoading(true);
      const { data: linkData } = await API.get("/referrals/link");
      if (linkData?.success) {
        const code = linkData.code || linkData.referralCode || "";
        setReferralCode(code);
      }

      const { data: meData } = await API.get("/referrals/me");
      if (meData?.success) {
        if (meData.summary) {
          setReferralStats(meData.summary);
        }
        if (Array.isArray(meData.referrals)) {
          setReferralList(meData.referrals);
        }
      }
    } catch (error) {
      console.error("Load referral error:", error);
    } finally {
      setReferralLoading(false);
    }
  }, []);

  // Load addresses
  const loadAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      const { data } = await API.get("/delivery-address");
      const list = data?.data || data?.addresses || [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load addresses error:", error);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get("/orders/my");
      const list = data?.orders || data?.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load orders error:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Handle user logout
  const handleLogout = () => {
    Swal.fire({
      icon: "question",
      title: "Log out of your account?",
      text: "Are you sure you want to log out of Grocery Sathi?",
      showCancelButton: true,
      confirmButtonText: "Yes, Log Out",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#64748b",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("user");
        sessionStorage.clear();

        window.dispatchEvent(new Event("authChanged"));
        window.dispatchEvent(new Event("storage"));

        navigate("/login");
      }
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadUserData();
    loadReferral();
  }, [loadUserData, loadReferral]);

  useEffect(() => {
    if (currentTab === "addresses") {
      loadAddresses();
    } else if (currentTab === "orders") {
      loadOrders();
    }
  }, [currentTab, loadAddresses, loadOrders]);

  // =========================================================
  // CLIENT-SIDE WEBP IMAGE CONVERTER
  // =========================================================
  const convertImageToWebP = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800; // Optimal size for avatars
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert strictly to image/webp format
          const webpDataUrl = canvas.toDataURL("image/webp", 0.9);
          resolve(webpDataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // =========================================================
  // HANDLER: CHANGE PROFILE PICTURE (CONVERT TO WEBP)
  // =========================================================
  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Please select a valid image file (JPG, PNG, WEBP).",
      });
      return;
    }

    try {
      setAvatarUploading(true);
      // 1. Convert uploaded photo to WebP
      const webpDataUrl = await convertImageToWebP(file);

      // 2. Save converted WebP avatar to backend
      const { data } = await API.put("/auth/me", {
        profileImage: webpDataUrl,
      });

      const updated = data?.user || data?.data?.user || data?.data;
      if (updated) {
        setUser(updated);
      } else {
        setUser((prev) => ({ ...prev, profileImage: webpDataUrl }));
      }

      window.dispatchEvent(new Event("authChanged"));

      Swal.fire({
        icon: "success",
        title: "Profile Photo Updated!",
        text: "Your profile picture was successfully converted to WebP format.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Could not process or update profile photo. Please try again.",
      });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // HANDLER: UPDATE PROFILE DETAILS
  // =========================================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.firstName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "First name is required.",
      });
      return;
    }

    try {
      setProfileSaving(true);
      const { data } = await API.put("/auth/me", {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        mobile: profileForm.mobile.trim(),
      });

      const updated = data?.user || data?.data?.user || data?.data;
      if (updated) {
        setUser(updated);
      }

      setIsEditingProfile(false);
      window.dispatchEvent(new Event("authChanged"));

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile details have been saved.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Save profile error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Could not update profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // =========================================================
  // HANDLERS: ADDRESSES
  // =========================================================
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "",
      mobile: user?.mobile || "",
      address: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      addressType: "Home",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id || addr.id);
    setAddressForm({
      name: addr.name || "",
      mobile: addr.mobile || "",
      address: addr.address || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      addressType: addr.addressType || "Home",
      isDefault: Boolean(addr.isDefault),
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (
      !addressForm.name.trim() ||
      !addressForm.mobile.trim() ||
      !addressForm.address.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all mandatory address fields.",
      });
      return;
    }

    try {
      setAddressSaving(true);
      if (editingAddressId) {
        await API.put(`/delivery-address/${editingAddressId}`, addressForm);
      } else {
        await API.post("/delivery-address", addressForm);
      }

      setIsAddressModalOpen(false);
      await loadAddresses();

      Swal.fire({
        icon: "success",
        title: editingAddressId ? "Address Updated" : "Address Saved",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Save address error:", error);
      Swal.fire({
        icon: "error",
        title: "Could not save address",
        text: error.response?.data?.message || "Please check your inputs.",
      });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    const res = await Swal.fire({
      title: "Delete Address?",
      text: "Are you sure you want to delete this saved delivery address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    });

    if (!res.isConfirmed) return;

    try {
      await API.delete(`/delivery-address/${id}`);
      setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== id));
      Swal.fire({
        icon: "success",
        title: "Address Deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete address error:", error);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await API.put(`/delivery-address/${id}/default`);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: (a._id || a.id) === id,
        }))
      );
      Swal.fire({
        icon: "success",
        title: "Default Address Updated",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Set default address error:", error);
    }
  };

  const [copiedReferralLink, setCopiedReferralLink] = useState(false);

  // Copy referral coupon code
  const handleCopyReferral = () => {
    const code = referralCode || user?.referralCode || "";
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Referral coupon "${code}" copied!`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Copy referral link (Dynamic domain - never mentions localhost)
  const handleCopyReferralLink = () => {
    const code = referralCode || user?.referralCode || "";
    if (!code) return;
    const link = `${window.location.origin}/login?ref=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link);
    setCopiedReferralLink(true);
    setTimeout(() => setCopiedReferralLink(false), 2000);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Referral link copied to clipboard!",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // WhatsApp Share with dynamic domain link
  const handleShareWhatsApp = () => {
    const code = referralCode || user?.referralCode || "";
    if (!code) return;
    const link = `${window.location.origin}/login?ref=${encodeURIComponent(code)}`;
    const msg = encodeURIComponent(
      `🛒 *Grocery Sathi Referral Voucher*\n\nHey! Use my referral coupon code *${code}* on Grocery Sathi to get *₹20 Welcome Wallet Bonus + 100 Reward Points* on fresh groceries!\n\n👉 Sign up directly using this link:\n${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  // Helper: Status badge
  const renderStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("delivered")) {
      return (
        <span className="order-badge delivered">
          <CheckCircle2 size={13} />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes("out for delivery")) {
      return (
        <span className="order-badge out-delivery">
          <Truck size={13} />
          <span>Out for Delivery</span>
        </span>
      );
    }
    if (s.includes("cancel")) {
      return (
        <span className="order-badge cancelled">
          <XCircle size={13} />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="order-badge processing">
        <Clock size={13} />
        <span>{status || "Processing"}</span>
      </span>
    );
  };

  // FAQs List for Help Center
  const faqs = [
    {
      q: "How do I track my grocery order in real-time?",
      a: "You can track your order directly from the 'My Order' tab in your profile or from the tracking link sent via SMS and WhatsApp once your delivery partner is assigned.",
    },
    {
      q: "What is your return and refund policy for fresh produce?",
      a: "We maintain a 100% freshness guarantee. If you receive any damaged or unsatisfactory items, you can request an instant return or refund at the time of delivery or via Help Center within 24 hours.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Wallet credits.",
    },
    {
      q: "How does the Refer & Earn program work?",
      a: "Share your unique referral link with friends. When they register and complete their first grocery order, both of you earn instant grocery credits!",
    },
  ];

  // User display name & initial
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.name || "Customer";
  const userInitial = displayName.charAt(0).toUpperCase();

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* BREADCRUMB */}
        <nav className="profile-breadcrumb">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">My Account</span>
        </nav>

        <div className="user-profile-layout">
          {/* ===================================================
              LEFT SIDEBAR: USER CARD & TABS
          ==================================================== */}
          <aside className="profile-sidebar">
            <div className="profile-user-summary-card">
              {/* PROFILE AVATAR WITH WEBP CHANGE BUTTON */}
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={displayName}
                      className="profile-avatar-img"
                    />
                  ) : (
                    <span className="profile-avatar-initial">
                      {userInitial}
                    </span>
                  )}
                </div>

                {/* CHANGE PROFILE PIC BUTTON */}
                <button
                  type="button"
                  className="profile-avatar-edit-badge"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change profile picture (Converts to WebP)"
                  disabled={avatarUploading}
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfilePicChange}
                />
              </div>

              {/* USER NAME & EMAIL (FULLY VISIBLE) */}
              <div className="profile-user-text">
                <h2 className="profile-name">{displayName}</h2>
                <span className="profile-email">
                  {user?.email || "No email available"}
                </span>
                {avatarUploading && (
                  <span className="avatar-converting-note">
                    Converting to WebP...
                  </span>
                )}
              </div>
            </div>

            {/* SIDEBAR NAVIGATION TABS */}
            <nav className="profile-nav-tabs" aria-label="Account Tabs">
              <button
                type="button"
                className={`profile-tab-btn ${
                  currentTab === "profile" ? "active" : ""
                }`}
                onClick={() => setTab("profile")}
              >
                <User size={18} />
                <span>My Profile</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>

              <button
                type="button"
                className={`profile-tab-btn ${
                  currentTab === "addresses" ? "active" : ""
                }`}
                onClick={() => setTab("addresses")}
              >
                <MapPin size={18} />
                <span>Saved Address</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>

              <button
                type="button"
                className={`profile-tab-btn ${
                  currentTab === "orders" ? "active" : ""
                }`}
                onClick={() => setTab("orders")}
              >
                <Package size={18} />
                <span>My Order</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>

              <button
                type="button"
                className={`profile-tab-btn ${
                  currentTab === "referral" ? "active" : ""
                }`}
                onClick={() => setTab("referral")}
              >
                <Gift size={18} />
                <span>Refer &amp; Earn</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>

              <button
                type="button"
                className={`profile-tab-btn ${
                  currentTab === "help" ? "active" : ""
                }`}
                onClick={() => setTab("help")}
              >
                <HelpCircle size={18} />
                <span>Help Center</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>
            </nav>
          </aside>

          {/* ===================================================
              RIGHT CONTENT PANEL
          ==================================================== */}
          <main className="profile-content-area">
            {/* -------------------------------------------------
                TAB 1: MY PROFILE
            -------------------------------------------------- */}
            {currentTab === "profile" && (
              <section className="profile-tab-content">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Personal Information</h1>
                    <p className="tab-subtitle">
                      Update your account photo and personal grocery profile.
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      className="profile-edit-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit2 size={15} />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  /* EDIT FORM */
                  <form
                    onSubmit={handleSaveProfile}
                    className="profile-edit-form"
                  >
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                          placeholder="Your first name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              lastName: e.target.value,
                            })
                          }
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.mobile}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              mobile: e.target.value,
                            })
                          }
                          placeholder="10-digit mobile number"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="disabled-input"
                          title="Email cannot be changed"
                        />
                      </div>
                    </div>

                    <div className="form-actions-row">
                      <button
                        type="submit"
                        className="btn-save-profile"
                        disabled={profileSaving}
                      >
                        {profileSaving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-edit"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VIEW INFO CARDS */
                  <div className="profile-details-grid">
                    <div className="profile-detail-card">
                      <div className="detail-icon-wrap">
                        <User size={20} />
                      </div>
                      <div className="detail-meta">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{displayName}</span>
                      </div>
                    </div>

                    <div className="profile-detail-card">
                      <div className="detail-icon-wrap">
                        <Mail size={20} />
                      </div>
                      <div className="detail-meta">
                        <span className="detail-label">Email Address</span>
                        <span className="detail-value full-email">
                          {user?.email || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="profile-detail-card">
                      <div className="detail-icon-wrap">
                        <Phone size={20} />
                      </div>
                      <div className="detail-meta">
                        <span className="detail-label">Mobile Number</span>
                        <span className="detail-value">
                          {user?.mobile || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="profile-detail-card">
                      <div className="detail-icon-wrap photo-icon-wrap">
                        <Camera size={20} />
                      </div>
                      <div className="detail-meta">
                        <span className="detail-label">Profile Picture</span>
                        <button
                          type="button"
                          className="btn-quick-photo-change"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Photo (WebP)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* -------------------------------------------------
                TAB 2: SAVED ADDRESS
            -------------------------------------------------- */}
            {currentTab === "addresses" && (
              <section className="profile-tab-content">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Saved Delivery Addresses</h1>
                    <p className="tab-subtitle">
                      Manage your delivery locations for fast 1-tap grocery
                      checkouts.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-add-address"
                    onClick={handleOpenAddAddress}
                  >
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addressLoading ? (
                  <div className="address-loading-grid">
                    {[1, 2].map((n) => (
                      <div key={n} className="address-skeleton-card"></div>
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="address-empty-state">
                    <div className="empty-icon-wrap">
                      <MapPin size={42} />
                    </div>
                    <h3>No Saved Addresses Yet</h3>
                    <p>
                      Add your home or office address to enjoy seamless daily
                      grocery deliveries!
                    </p>
                    <button
                      type="button"
                      className="btn-add-address"
                      onClick={handleOpenAddAddress}
                    >
                      <Plus size={16} />
                      <span>Add Delivery Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="addresses-cards-grid">
                    {addresses.map((addr) => {
                      const id = addr._id || addr.id;
                      return (
                        <div
                          key={id}
                          className={`address-card ${
                            addr.isDefault ? "default-active" : ""
                          }`}
                        >
                          <div className="address-card-header">
                            <div className="address-type-chip">
                              {addr.addressType === "Work" ? (
                                <Briefcase size={14} />
                              ) : (
                                <Home size={14} />
                              )}
                              <span>{addr.addressType || "Home"}</span>
                            </div>

                            {addr.isDefault ? (
                              <span className="default-badge">
                                <Check size={12} />
                                <span>Default</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="set-default-btn"
                                onClick={() => handleSetDefaultAddress(id)}
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          <div className="address-card-body">
                            <h4 className="recipient-name">{addr.name}</h4>
                            <p className="recipient-phone">
                              <Phone size={13} />
                              <span>{addr.mobile}</span>
                            </p>
                            <p className="address-text">
                              {addr.address}
                              {addr.landmark
                                ? `, Near ${addr.landmark}`
                                : ""}
                            </p>
                            <p className="address-location">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>

                          <div className="address-card-actions">
                            <button
                              type="button"
                              className="action-btn edit"
                              onClick={() => handleOpenEditAddress(addr)}
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="action-btn delete"
                              onClick={() => handleDeleteAddress(id)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* -------------------------------------------------
                TAB 3: MY ORDERS
            -------------------------------------------------- */}
            {currentTab === "orders" && (
              <section className="profile-tab-content">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">My Orders</h1>
                    <p className="tab-subtitle">
                      Track and review all your previous grocery purchases.
                    </p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="orders-loading-list">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="order-skeleton-card"></div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="orders-empty-state">
                    <div className="empty-icon-wrap">
                      <ShoppingBag size={46} />
                    </div>
                    <h3>No Orders Placed Yet</h3>
                    <p>
                      You haven't placed any grocery orders yet. Discover our
                      fresh farm vegetables, fruits, and daily staples today!
                    </p>
                    <Link to="/" className="btn-start-shopping">
                      <span>Start Shopping</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="orders-cards-list">
                    {orders.map((ord) => {
                      const id = ord._id || ord.id;
                      const orderDate = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent";

                      const itemsList = ord.items || ord.orderItems || [];
                      const totalAmount = Number(
                        ord.totalAmount ||
                          ord.finalAmount ||
                          ord.amount ||
                          ord.total ||
                          0
                      );

                      return (
                        <div key={id} className="order-card clickable-order-card" onClick={() => navigate(`/orders/${id}`)} title="Click to view full order details">
                          <div className="order-card-header">
                            <div className="order-header-left">
                              <span className="order-id-label">
                                Order ID:{" "}
                                <strong>
                                  #{String(id).slice(-8).toUpperCase()}
                                </strong>
                              </span>
                              <span className="order-date-text">
                                {orderDate}
                              </span>
                            </div>
                            <div className="order-header-right">
                              {renderStatusBadge(
                                ord.orderStatus || ord.status
                              )}
                            </div>
                          </div>

                          {/* ITEMS PREVIEW */}
                          <div className="order-items-preview">
                            {itemsList.slice(0, 4).map((it, idx) => {
                              const p = it.product || it;
                              const img =
                                (Array.isArray(p.images) && p.images[0]) ||
                                p.image ||
                                "/placeholder-grocery.png";
                              return (
                                <div key={idx} className="order-item-chip">
                                  <img
                                    src={img}
                                    alt={p.name || "Item"}
                                    className="order-item-chip-img"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";
                                    }}
                                  />
                                  <div className="order-item-chip-meta">
                                    <span className="chip-name">
                                      {p.name ||
                                        p.productName ||
                                        "Grocery Item"}
                                    </span>
                                    <span className="chip-qty">
                                      Qty: {it.quantity || 1}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {itemsList.length > 4 && (
                              <div className="order-item-more-badge">
                                +{itemsList.length - 4} more
                              </div>
                            )}
                          </div>

                          <div className="order-card-footer">
                            <div className="order-footer-meta">
                              <span className="payment-mode">
                                Mode:{" "}
                                <strong>
                                  {ord.paymentMethod === "razorpay" ? "Online Payment" : (ord.paymentMethod || "Cash on Delivery")}
                                </strong>
                              </span>
                              <span className="order-total-amount">
                                Total:{" "}
                                <strong>₹{totalAmount.toFixed(2)}</strong>
                              </span>
                            </div>

                            <div className="order-actions-row">
                              {/* ONLY SHOW INVOICE AFTER ORDER IS DELIVERED */}
                              {String(ord.orderStatus || ord.status || "").toLowerCase() === "delivered" && (
                                <button
                                  type="button"
                                  className="btn-order-view-invoice"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setDownloadingOrderId(id);
                                    try {
                                      await downloadOrderInvoicePdf(ord);
                                    } finally {
                                      setDownloadingOrderId(null);
                                    }
                                  }}
                                  disabled={downloadingOrderId === id}
                                  title="Direct Download Tax Invoice (PDF)"
                                >
                                  <Download size={14} />
                                  <span>{downloadingOrderId === id ? "Downloading..." : "Invoice"}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn-view-order-details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/orders/${id}`);
                                }}
                              >
                                <span>View Details</span>
                                <ChevronRight size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* -------------------------------------------------
                TAB 4: REFER & EARN (SIDEBAR INTEGRATION)
            -------------------------------------------------- */}
            {currentTab === "referral" && (
              <section className="profile-tab-content">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Refer &amp; Earn Rewards</h1>
                    <p className="tab-subtitle">
                      Invite friends and earn instant grocery shopping credits!
                    </p>
                  </div>
                </div>

                <div className="referral-banner-hero">
                  <div className="referral-banner-icon-bubble">
                    <Gift size={36} />
                  </div>
                  <div className="referral-banner-text">
                    <h2>Earn ₹50 Grocery Credit for Every Friend!</h2>
                    <p>
                      Share your unique referral link. Once your friend places
                      their first order of ₹299 or more, you both receive
                      exclusive wallet points!
                    </p>
                  </div>
                </div>

                {/* 3 STEPS */}
                <div className="referral-steps-grid">
                  <div className="referral-step-card">
                    <span className="step-num">1</span>
                    <h4>Share Code</h4>
                    <p>Share your exclusive referral code with family and friends.</p>
                  </div>
                  <div className="referral-step-card">
                    <span className="step-num">2</span>
                    <h4>Friend Orders</h4>
                    <p>Your friend registers with your code and places their first grocery order.</p>
                  </div>
                  <div className="referral-step-card">
                    <span className="step-num">3</span>
                    <h4>You Both Win</h4>
                    <p>Instant ₹30 wallet credits + 50 points for you, and welcome bonus for your friend!</p>
                  </div>
                </div>

                {/* EXCLUSIVE REFERRAL COUPON VOUCHER */}
                <div className="referral-coupon-voucher-card">
                  <div className="voucher-left-perk">
                    <div className="voucher-store-tag">
                      <Sparkles size={14} /> Official Store Referral Coupon
                    </div>
                    <div className="voucher-headline">
                      Give <strong>₹20 Cash + 100 Pts</strong>
                    </div>
                    <div className="voucher-subline">
                      Get <strong>₹30 Cash + 50 Pts</strong> on friend's first delivered grocery order
                    </div>
                    <div className="voucher-note">
                      ✓ Valid on all fresh organic fruits, vegetables & groceries
                    </div>
                  </div>

                  <div className="voucher-divider">
                    <span className="notch-circle notch-top"></span>
                    <span className="voucher-dashed-line"></span>
                    <span className="notch-circle notch-bottom"></span>
                  </div>

                  <div className="voucher-right-code">
                    <span className="voucher-code-title">COUPON CODE</span>
                    <div className="voucher-code-display">
                      {referralCode || user?.referralCode || "GSREFER"}
                    </div>
                    <button
                      type="button"
                      className={`btn-voucher-copy ${copiedReferral ? "copied" : ""}`}
                      onClick={handleCopyReferral}
                    >
                      {copiedReferral ? (
                        <>
                          <Check size={14} /> <span>Code Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> <span>Copy Coupon</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* SHAREABLE LINK & SOCIAL ACTIONS */}
                <div className="referral-share-section">
                  <label className="referral-box-label">
                    Direct Referral Link (Opens & Auto-applies Coupon):
                  </label>
                  <div className="referral-input-wrapper">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/login?ref=${referralCode || user?.referralCode || ""}`}
                      className="referral-main-input"
                    />
                    <button
                      type="button"
                      className={`btn-referral-copy ${
                        copiedReferralLink ? "copied" : ""
                      }`}
                      onClick={handleCopyReferralLink}
                    >
                      {copiedReferralLink ? (
                        <>
                          <Check size={16} />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="referral-social-actions">
                    <button
                      type="button"
                      className="btn-share-whatsapp"
                      onClick={handleShareWhatsApp}
                    >
                      <MessageCircle size={18} />
                      <span>Share Coupon on WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* REFERRAL PERFORMANCE STATS */}
                <div className="referral-stats-container">
                  <h3 className="referral-section-heading">Your Referral Activity</h3>
                  <div className="referral-summary-grid">
                    <div className="referral-stat-card">
                      <div className="referral-stat-icon-wrap icon-blue">
                        <Users size={22} />
                      </div>
                      <div className="referral-stat-info">
                        <span className="referral-stat-num">{referralStats.totalReferrals || 0}</span>
                        <span className="referral-stat-text">Friends Invited</span>
                      </div>
                    </div>

                    <div className="referral-stat-card">
                      <div className="referral-stat-icon-wrap icon-green">
                        <CheckCircle2 size={22} />
                      </div>
                      <div className="referral-stat-info">
                        <span className="referral-stat-num">{referralStats.completed || 0}</span>
                        <span className="referral-stat-text">Successful Purchases</span>
                      </div>
                    </div>

                    <div className="referral-stat-card">
                      <div className="referral-stat-icon-wrap icon-yellow">
                        <Gift size={22} />
                      </div>
                      <div className="referral-stat-info">
                        <span className="referral-stat-num">₹{referralStats.totalEarned || 0}</span>
                        <span className="referral-stat-text">Wallet Cash Earned</span>
                      </div>
                    </div>
                  </div>

                  {/* REFERRED FRIENDS LIST */}
                  <div className="referral-history-box">
                    <h4 className="referral-history-title">Referred Friends List</h4>
                    {referralLoading ? (
                      <p className="referral-empty-text">Loading referral activity...</p>
                    ) : referralList.length === 0 ? (
                      <div className="referral-empty-state">
                        <Gift size={32} className="referral-empty-icon" />
                        <p>No friends referred yet. Share your code above with friends to start earning rewards!</p>
                      </div>
                    ) : (
                      <div className="referral-friends-list">
                        {referralList.map((item, idx) => {
                          const friendName = item.referred
                            ? `${item.referred.firstName || ""} ${item.referred.lastName || ""}`.trim() || item.referred.email || "Friend"
                            : "New User";
                          const dateJoined = item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recent";

                          return (
                            <div key={item._id || idx} className="referral-friend-row">
                              <div className="referral-friend-meta">
                                <div className="referral-friend-avatar">
                                  {friendName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="referral-friend-name">{friendName}</strong>
                                  <span className="referral-friend-date">Joined {dateJoined}</span>
                                </div>
                              </div>
                              <div className="referral-friend-status">
                                {item.status === "completed" ? (
                                  <span className="referral-badge completed">
                                    <CheckCircle2 size={13} />
                                    <span>Delivered • ₹{item.rewardAmount || 30} Earned</span>
                                  </span>
                                ) : (
                                  <span className="referral-badge pending">
                                    <Clock size={13} />
                                    <span>Awaiting 1st Order</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* -------------------------------------------------
                TAB 5: HELP CENTER (SIDEBAR INTEGRATION)
            -------------------------------------------------- */}
            {currentTab === "help" && (
              <section className="profile-tab-content">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Help &amp; Customer Support</h1>
                    <p className="tab-subtitle">
                      Need help with an order, payment, or delivery? We are here
                      for you 24/7.
                    </p>
                  </div>
                </div>

                {/* QUICK CONTACT CARDS */}
                <div className="help-contact-cards-grid">
                  <div className="help-contact-card">
                    <div className="help-icon-wrap phone-icon">
                      <Phone size={24} />
                    </div>
                    <h4>Phone Support</h4>
                    <p>Talk directly with our friendly grocery care team.</p>
                    <a
                      href="tel:+919887868746"
                      className="help-link-btn"
                    >
                      +91 98878 68746
                    </a>
                  </div>

                  <div className="help-contact-card">
                    <div className="help-icon-wrap email-icon">
                      <Mail size={24} />
                    </div>
                    <h4>Email Support</h4>
                    <p>Send us an email and we will reply within 2 hours.</p>
                    <a
                      href="mailto:support@grocerysathi.com"
                      className="help-link-btn"
                    >
                      support@grocerysathi.com
                    </a>
                  </div>

                  <div className="help-contact-card">
                    <div className="help-icon-wrap hours-icon">
                      <Clock size={24} />
                    </div>
                    <h4>Support Hours</h4>
                    <p>Open 7 Days a week</p>
                    <span className="help-hours-badge">
                      8:00 AM - 9:00 PM
                    </span>
                  </div>
                </div>

                {/* FAQ ACCORDION */}
                <div className="help-faqs-section">
                  <h3 className="faqs-title">Frequently Asked Questions</h3>
                  <div className="faqs-list">
                    {faqs.map((faq, idx) => {
                      const isOpen = expandedFaq === idx;
                      return (
                        <div
                          key={idx}
                          className={`faq-accordion-item ${
                            isOpen ? "open" : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="faq-question-btn"
                            onClick={() =>
                              setExpandedFaq(isOpen ? null : idx)
                            }
                          >
                            <span>{faq.q}</span>
                            <ChevronDown
                              size={18}
                              className={`faq-arrow ${isOpen ? "rotate" : ""}`}
                            />
                          </button>
                          {isOpen && (
                            <div className="faq-answer-body">
                              <p>{faq.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* =======================================================
          MODAL: ADD / EDIT ADDRESS
      ======================================================== */}
      {isAddressModalOpen && (
        <div className="address-modal-overlay">
          <div className="address-modal-box">
            <div className="modal-header">
              <h3>
                {editingAddressId
                  ? "Edit Delivery Address"
                  : "Add Delivery Address"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddressModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="address-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient's Name"
                    value={addressForm.name}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={addressForm.mobile}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, mobile: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address / Flat / House No. *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Apartment, House No., Street, Area"
                  value={addressForm.address}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address: e.target.value })
                  }
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Apollo Hospital"
                    value={addressForm.landmark}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        landmark: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit Pincode"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="address-type-selector">
                <label className="type-group-label">Address Type</label>
                <div className="type-options-row">
                  {["Home", "Work", "Other"].map((t) => (
                    <label key={t} className="type-option">
                      <input
                        type="radio"
                        name="addressType"
                        value={t}
                        checked={addressForm.addressType === t}
                        onChange={() =>
                          setAddressForm({ ...addressForm, addressType: t })
                        }
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <span>Make this my default delivery address</span>
              </label>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={addressSaving}
                >
                  {addressSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

import React, { useState, useEffect, useMemo } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Calendar,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  X,
  Shield,
  CreditCard,
  Tag,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../api/axios";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ==========================================
  // FETCH USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (roleFilter !== "all") params.role = roleFilter;

      const { data } = await API.get("/users", { params });

      if (data?.success) {
        setUsers(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      Swal.fire({
        icon: "error",
        title: "Could Not Load Users",
        text: err.response?.data?.message || "Failed to load registered users.",
        confirmButtonColor: "#0aad4b",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // ==========================================
  // VIEW USER DETAILS
  // ==========================================
  const handleViewUser = async (userId) => {
    try {
      setDetailsLoading(true);
      const { data } = await API.get(`/users/${userId}`);
      if (data?.success && data?.data) {
        setSelectedUser(data.data);
      }
    } catch (err) {
      console.error("Fetch user details error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not load user profile details.",
        confirmButtonColor: "#0aad4b",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // TOGGLE ACTIVE STATUS
  // ==========================================
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    const actionWord = nextStatus ? "activate" : "deactivate";

    const result = await Swal.fire({
      icon: "question",
      title: `${nextStatus ? "Activate" : "Deactivate"} User?`,
      text: `Are you sure you want to ${actionWord} ${user.name}?`,
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionWord}`,
      confirmButtonColor: nextStatus ? "#0aad4b" : "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await API.patch(`/users/${user._id}/status`, {
        isActive: nextStatus,
      });

      if (data?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, isActive: nextStatus } : u
          )
        );
        setStats((prev) => ({
          ...prev,
          active: nextStatus ? prev.active + 1 : Math.max(0, prev.active - 1),
          inactive: !nextStatus ? prev.inactive + 1 : Math.max(0, prev.inactive - 1),
        }));

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `User has been ${nextStatus ? "activated" : "deactivated"}.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Could not update user status.",
        confirmButtonColor: "#0aad4b",
      });
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete User Account?",
      text: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await API.delete(`/users/${user._id}`);
      if (data?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          active: user.isActive ? Math.max(0, prev.active - 1) : prev.active,
          inactive: !user.isActive ? Math.max(0, prev.inactive - 1) : prev.inactive,
        }));

        Swal.fire({
          icon: "success",
          title: "User Deleted",
          text: "User account was removed successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Delete user error:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.response?.data?.message || "Could not delete user.",
        confirmButtonColor: "#0aad4b",
      });
    }
  };

  // ==========================================
  // PAGINATION CALCULATIONS
  // ==========================================
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage]);

  const getInitials = (firstName, lastName) => {
    const f = (firstName || "").charAt(0).toUpperCase();
    const l = (lastName || "").charAt(0).toUpperCase();
    return f + l || "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="Users-page">
      {/* Top Header */}
      <div className="Users-header">
        <div>
          <h1 className="Users-title">User Management</h1>
          <p className="Users-subtitle">
            View, monitor, and manage all registered frontend customers and shoppers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="Users-refreshBtn"
          title="Refresh user list"
        >
          <RotateCcw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="Users-statsGrid">
        <div className="Users-statCard">
          <div className="Users-statIcon icon-primary">
            <UsersIcon size={24} />
          </div>
          <div className="Users-statInfo">
            <span className="Users-statLabel">Total Users</span>
            <strong className="Users-statValue">{stats.total}</strong>
            <span className="Users-statHint">Registered shoppers</span>
          </div>
        </div>

        <div className="Users-statCard">
          <div className="Users-statIcon icon-success">
            <UserCheck size={24} />
          </div>
          <div className="Users-statInfo">
            <span className="Users-statLabel">Active Users</span>
            <strong className="Users-statValue text-emerald">
              {stats.active}
            </strong>
            <span className="Users-statHint">Eligible to shop</span>
          </div>
        </div>

        <div className="Users-statCard">
          <div className="Users-statIcon icon-warning">
            <UserX size={24} />
          </div>
          <div className="Users-statInfo">
            <span className="Users-statLabel">Inactive Users</span>
            <strong className="Users-statValue text-amber">
              {stats.inactive}
            </strong>
            <span className="Users-statHint">Suspended accounts</span>
          </div>
        </div>

        <div className="Users-statCard">
          <div className="Users-statIcon icon-purple">
            <Calendar size={24} />
          </div>
          <div className="Users-statInfo">
            <span className="Users-statLabel">New This Month</span>
            <strong className="Users-statValue text-purple">
              {stats.newThisMonth}
            </strong>
            <span className="Users-statHint">Joined current month</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="Users-toolbar">
        <form onSubmit={handleSearchSubmit} className="Users-searchForm">
          <div className="Users-searchInputWrap">
            <Search size={18} className="Users-searchIcon" />
            <input
              type="text"
              placeholder="Search by name, email, mobile, or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="Users-searchInput"
            />
          </div>
          <button type="submit" className="Users-searchBtn">
            Search
          </button>
        </form>

        <div className="Users-filterGroup">
          <div className="Users-filterField">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="Users-filterField">
            <label>Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="user">Customer (User)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="Users-tableCard">
        <div className="Users-tableResponsive">
          <table className="Users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User Details</th>
                <th>Mobile Number</th>
                <th>City / State</th>
                <th>Orders & Spend</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="Users-emptyCell">
                    <div className="Users-loadingWrap">
                      <div className="Users-spinner" />
                      <span>Loading registered users…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="Users-emptyCell">
                    <UsersIcon size={40} className="Users-emptyIcon" />
                    <p>No registered users found matching your search.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={user._id}>
                      <td className="Users-cell-idx">{globalIdx}</td>
                      <td>
                        <div className="Users-profileCell">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="Users-avatarImg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="Users-avatarFallback">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                          )}
                          <div className="Users-profileMeta">
                            <strong className="Users-profileName">
                              {user.name}
                            </strong>
                            <span className="Users-profileEmail">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="Users-mobileCell">
                          <Phone size={13} />
                          <span>{user.mobile || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="Users-locationText">
                          {[user.city, user.state].filter(Boolean).join(", ") ||
                            "—"}
                        </span>
                      </td>
                      <td>
                        <div className="Users-ordersCell">
                          <span className="orders-count">
                            <ShoppingBag size={13} />
                            {user.orderCount || 0} orders
                          </span>
                          <strong className="orders-amount">
                            ₹{Number(user.totalSpent || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`Users-roleBadge ${
                            user.role === "admin" ? "role-admin" : "role-user"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "Customer"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`Users-statusBadge ${
                            user.isActive ? "status-active" : "status-inactive"
                          }`}
                          title="Click to toggle user status"
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle2 size={13} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <span className="Users-dateText">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="Users-actionButtons">
                          <button
                            type="button"
                            className="Users-actionBtn btn-view"
                            onClick={() => handleViewUser(user._id)}
                            title="View Full Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="Users-actionBtn btn-delete"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {users.length > pageSize && (
          <div className="Users-paginationFooter">
            <span className="Users-pageInfo">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, users.length)} of {users.length} users
            </span>
            <div className="Users-pageButtons">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="Users-pageNavBtn"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`Users-pageBtn ${
                    currentPage === p ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="Users-pageNavBtn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="Users-modalOverlay" onClick={() => setSelectedUser(null)}>
          <div
            className="Users-modalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Users-modalHeader">
              <div className="Users-modalProfileBrief">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="Users-modalAvatarImg"
                  />
                ) : (
                  <div className="Users-modalAvatarFallback">
                    {getInitials(
                      selectedUser.firstName,
                      selectedUser.lastName
                    )}
                  </div>
                )}
                <div>
                  <h2>{selectedUser.name}</h2>
                  <span className="Users-modalSub">
                    User ID: {selectedUser._id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="Users-modalCloseBtn"
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="Users-modalBody">
              {/* Profile Details Grid */}
              <div className="Users-detailSection">
                <h3 className="Users-sectionHeading">
                  <Mail size={16} /> Contact Information
                </h3>
                <div className="Users-detailGrid">
                  <div className="Users-detailItem">
                    <span className="detail-label">Email Address</span>
                    <strong className="detail-value">
                      {selectedUser.email || "—"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Mobile Number</span>
                    <strong className="detail-value">
                      {selectedUser.mobile || "—"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Gender</span>
                    <strong className="detail-value">
                      {selectedUser.gender || "Not specified"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Date of Birth</span>
                    <strong className="detail-value">
                      {formatDate(selectedUser.dateOfBirth)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="Users-detailSection">
                <h3 className="Users-sectionHeading">
                  <MapPin size={16} /> Address Details
                </h3>
                <div className="Users-detailGrid">
                  <div className="Users-detailItem full">
                    <span className="detail-label">Street Address</span>
                    <strong className="detail-value">
                      {selectedUser.address || "No street address on file"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">City</span>
                    <strong className="detail-value">
                      {selectedUser.city || "—"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">State</span>
                    <strong className="detail-value">
                      {selectedUser.state || "—"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Country</span>
                    <strong className="detail-value">
                      {selectedUser.country || "India"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Pincode</span>
                    <strong className="detail-value">
                      {selectedUser.pincode || "—"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Shopping & Account Activity */}
              <div className="Users-detailSection">
                <h3 className="Users-sectionHeading">
                  <ShoppingBag size={16} /> Shopping Activity & Account
                </h3>
                <div className="Users-detailGrid">
                  <div className="Users-detailItem">
                    <span className="detail-label">Total Orders</span>
                    <strong className="detail-value text-emerald">
                      {selectedUser.totalOrders || 0} Orders
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Total Spend</span>
                    <strong className="detail-value text-emerald">
                      ₹{Number(selectedUser.totalSpent || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Referral Code</span>
                    <strong className="detail-value">
                      {selectedUser.referralCode || "—"}
                    </strong>
                  </div>
                  <div className="Users-detailItem">
                    <span className="detail-label">Account Created</span>
                    <strong className="detail-value">
                      {formatDate(selectedUser.createdAt)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="Users-modalFooter">
              <button
                type="button"
                className="Users-modalDoneBtn"
                onClick={() => setSelectedUser(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;


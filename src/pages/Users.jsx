import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "Receptionist"
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/users");
      if (!response) return;

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load users");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await apiFetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response) return;

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setMessage("User created successfully.");
      setForm({
        username: "",
        password: "",
        full_name: "",
        role: "Receptionist"
      });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `Are you sure you want to make ${user.full_name} ${newStatus.toLowerCase()}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await apiFetch(`/api/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response) return;

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      setMessage("User status updated successfully.");
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
  const userPlusIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );

  const closeIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const refreshIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );

  const checkIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const emptyUsersIcon = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M9 21v-2a4 4 0 0 0-4-4H3a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* <div>
          <h4 className="fw-bold mb-1 text-dark">User Management</h4>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Control system access roles, user provisioning, and permissions.
          </p>
        </div> */}

        <button
          className={`btn d-flex align-items-center gap-2 shadow-sm px-4 py-2 rounded-3 fw-medium ${
            showForm ? "btn-light border text-secondary" : "btn-primary"
          }`}
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setMessage("");
          }}
          style={{ fontSize: "0.85rem" }}
        >
          {showForm ? (
            <>
              {closeIcon}
              <span>Close Form</span>
            </>
          ) : (
            <>
              {userPlusIcon}
              <span>Add User</span>
            </>
          )}
        </button>
      </div>

      {/* Alert Banners */}
      {message && (
        <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success d-flex align-items-center gap-2 rounded-3 mb-4 py-2 px-3" style={{ fontSize: "0.9rem" }}>
          {checkIcon}
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-4 py-2 px-3" style={{ fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Add User Form Drawer/Card */}
      {showForm && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ maxWidth: "800px" }}>
          <div className="card-body p-4 p-md-5">
            <h6 className="fw-bold text-dark mb-1">Provision New User Account</h6>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Fill in credentials and role assignment to grant access.
            </p>

            <form onSubmit={handleCreateUser}>
              <div className="row g-3">
                {/* Full name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-control bg-light border-0 py-2 px-3 rounded-3"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Chiarg Jain"
                    required
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                {/* Username */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="form-control bg-light border-0 py-2 px-3 rounded-3"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. cjain"
                    required
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                {/* Password */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control bg-light border-0 py-2 px-3 rounded-3"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength="6"
                    required
                    style={{ fontSize: "0.9rem" }}
                  />
                  <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                    Minimum 6 characters required
                  </small>
                </div>

                {/* Role */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Role <span className="text-danger">*</span>
                  </label>
                  <select
                    name="role"
                    className="form-select bg-light border-0 py-2 px-3 rounded-3"
                    value={form.role}
                    onChange={handleChange}
                    style={{ fontSize: "0.9rem" }}
                  >
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="col-12 d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-4">
                  <button
                    type="button"
                    className="btn btn-light text-secondary border px-3 py-2 rounded-3"
                    onClick={() => setShowForm(false)}
                    style={{ fontSize: "0.85rem" }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary shadow-sm px-4 py-2 rounded-3 fw-medium d-flex align-items-center gap-2"
                    disabled={saving}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create User</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Data Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {/* <h5 className="mb-1 fw-bold text-dark">System Users</h5> */}
              <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                Active staff accounts with portal privileges: <span className="fw-semibold text-dark">{users.length}</span>
              </p>
            </div>

            <button
              className="btn btn-light d-flex align-items-center gap-2 border shadow-sm text-secondary hover-bg-light"
              onClick={loadUsers}
              disabled={loading}
              style={{ fontSize: "0.85rem" }}
            >
              <span className={loading ? "spin-animation" : ""}>{refreshIcon}</span>
              Refresh
            </button>
          </div>
        </div>

        <div className="card-body p-0 mt-3">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Loading registered user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">{emptyUsersIcon}</div>
              <h6 className="fw-semibold text-dark">No users found</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Click "Add User" above to provision the first account.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-nowrap">
                <thead className="table-light text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <tr>
                    <th className="fw-semibold ps-4 border-0 rounded-start">User ID</th>
                    <th className="fw-semibold border-0">Full Name</th>
                    <th className="fw-semibold border-0">Username</th>
                    <th className="fw-semibold border-0">Role</th>
                    <th className="fw-semibold border-0">Status</th>
                    <th className="fw-semibold border-0">Created Date</th>
                    <th className="fw-semibold pe-4 border-0 text-end rounded-end">Action</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="ps-4 py-3 text-muted" style={{ fontSize: "0.85rem" }}>
                        #{user.id}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
                          >
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="fw-semibold text-dark">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{user.username}</td>
                      <td>
                        {user.role === "Admin" ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 fw-medium">
                            Admin
                          </span>
                        ) : (
                          <span className="badge bg-info bg-opacity-10 text-info-emphasis border border-info border-opacity-25 rounded-pill px-3 py-1 fw-medium">
                            Receptionist
                          </span>
                        )}
                      </td>
                      <td>
                        {user.status === "Active" ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 fw-medium">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 fw-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="text-secondary" style={{ fontSize: "0.85rem" }}>
                        {formatDate(user.created_at)}
                      </td>
                      <td className="pe-4 text-end">
                        <button
                          className={`btn btn-sm rounded-3 px-3 py-1 fw-medium transition-all ${
                            user.status === "Active"
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() => handleStatusChange(user)}
                          style={{ fontSize: "0.8rem" }}
                        >
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "—";
  }
}

export default Users;
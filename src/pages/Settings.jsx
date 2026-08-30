import React, { useState } from "react";
import { apiFetch, API_URL } from "../api";

function Settings({ user }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async () => {
    try {
      setError("");
      setMessage("");
      setBackupLoading(true);

      const token = localStorage.getItem("token");
      const baseUrl = API_URL || "http://localhost:5001";
      const response = await fetch(`${baseUrl}/api/settings/backup`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Backup failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const date = new Date().toISOString().slice(0, 10);
      link.download = `reception_backup_${date}.sql`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Database backup downloaded successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBackupLoading(false);
    }
  };
  const keyIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <circle cx="7.5" cy="15.5" r="1.5" />
      <path d="m10.7 12.3 8.8-8.8" />
      <path d="m16 7 2.5 2.5" />
      <path d="m18.5 4.5 2 2" />
    </svg>
  );

  const databaseIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );

  const downloadIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const checkIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const shieldAlertIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  const eyeIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Header */}
      {/* <div className="mb-4">
        <h4 className="fw-bold mb-1 text-dark">Settings & Security</h4>
        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          Manage your account security, profile information, and system backups.
        </p>
      </div> */}

      {/* Global Alerts */}
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

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div 
                  className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center"
                  style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Account Profile</h6>
                  <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Read-only account metadata
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Full Name
                </label>
                <input
                  className="form-control bg-light border-0 py-2 px-3 rounded-3 text-dark fw-medium"
                  value={user?.fullName || "N/A"}
                  disabled
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Username
                </label>
                <input
                  className="form-control bg-light border-0 py-2 px-3 rounded-3 text-dark fw-medium"
                  value={user?.username || "N/A"}
                  disabled
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Assigned Role
                </label>
                <div>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: "0.8rem" }}>
                    {user?.role || "Staff"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-primary">{keyIcon}</span>
                  <h6 className="fw-bold mb-0 text-dark">Change Password</h6>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                  onClick={() => setShowPasswords(!showPasswords)}
                  style={{ fontSize: "0.8rem" }}
                >
                  {showPasswords ? eyeOffIcon : eyeIcon}
                  <span className="ms-1">{showPasswords ? "Hide" : "Show"} Passwords</span>
                </button>
              </div>

              <form onSubmit={changePassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Current Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    className="form-control bg-light border-0 py-2 px-3 rounded-3"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    className="form-control bg-light border-0 py-2 px-3 rounded-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength="6"
                    required
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    className="form-control bg-light border-0 py-2 px-3 rounded-3"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength="6"
                    required
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 px-4 py-2 w-100 fw-medium"
                  disabled={loading}
                  style={{ fontSize: "0.85rem" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Database Backup Card (Admin only) */}
        {user?.role === "Admin" && (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="text-primary">{databaseIcon}</span>
                  <h6 className="fw-bold mb-0 text-dark">Database Management</h6>
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                  Export SQL dump file containing all visitor logs, users, and audit records.
                </p>

                <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 d-flex align-items-center gap-2 text-warning-emphasis mb-4" style={{ fontSize: "0.85rem" }}>
                  {shieldAlertIcon}
                  <span>
                    <strong>Security Warning:</strong> Downloaded backup files contain sensitive organizational data. Ensure backups are stored in an encrypted location.
                  </span>
                </div>

                <button
                  className="btn btn-success d-flex align-items-center gap-2 shadow-sm rounded-3 px-4 py-2 fw-medium"
                  onClick={downloadBackup}
                  disabled={backupLoading}
                  style={{ fontSize: "0.85rem" }}
                >
                  {backupLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Generating SQL Backup...</span>
                    </>
                  ) : (
                    <>
                      {downloadIcon}
                      <span>Download SQL Backup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
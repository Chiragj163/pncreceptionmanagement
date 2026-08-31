import React, { useState } from "react";
import { API_URL } from "../api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const userIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const lockIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  const eyeIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const arrowRightIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div 
        className="card border-0 shadow-sm rounded-4 overflow-hidden w-100" 
        style={{ maxWidth: "420px" }}
      >
        <div className="card-body p-4 p-sm-5">
          {/* Header & Logo */}
          <div className="text-center mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center p-2 rounded-3 bg-white shadow-sm mb-3 border"
              style={{ width: "56px", height: "56px" }}
            >
              <img 
                src="/reception/images.svg" 
                alt="Logo" 
                className="object-fit-contain" 
                style={{ width: "36px", height: "36px" }} 
              />
            </div>
            <h5 className="fw-bold text-dark mb-1">Reception Management</h5>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger border-0 shadow-sm rounded-3 py-2 px-3 mb-4 text-center" style={{ fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-3">
              <label 
                className="form-label fw-semibold text-muted mb-1" 
                style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
              >
                Username
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 ps-3">
                  {userIcon}
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2 pe-3"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label 
                className="form-label fw-semibold text-muted mb-1" 
                style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
              >
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 ps-3">
                  {lockIcon}
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-light border-0 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ fontSize: "0.9rem" }}
                />
                <button
                  type="button"
                  className="btn btn-light bg-light border-0 text-muted pe-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? eyeOffIcon : eyeIcon}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-medium"
              disabled={loading}
              style={{ fontSize: "0.9rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  {arrowRightIcon}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="card-footer bg-light border-top-0 py-3 text-center">
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
            Secure Visitor Access System
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;
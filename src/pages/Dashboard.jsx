import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalToday: 0,
    currentlyInside: 0,
    checkedOut: 0
  });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, visitorsRes] = await Promise.all([
        apiFetch("/api/visitors/dashboard/stats"),
        apiFetch("/api/visitors/dashboard/today")
      ]);

      const statsData = await statsRes.json();
      const visitorsData = await visitorsRes.json();

      if (!statsRes.ok) throw new Error(statsData.message || "Failed to load dashboard statistics");
      if (!visitorsRes.ok) throw new Error(visitorsData.message || "Failed to load today's visitors");

      setStats(statsData.stats);
      setVisitors(visitorsData.visitors);

    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const usersIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* <path d="M16 21v-2a4 4 0 0 0-3-3.87" /> */}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const insideIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );

  const checkoutIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      {/* <line x1="19" y1="8" x2="19" y2="14" /> */}
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );

  const refreshIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );

  const emptyFolderIcon = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      
      {/* Page Header */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Dashboard Overview</h4>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div> */}

      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        {/* Total */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Visitors Today
                  </p>
                  <h2 className="mb-0 fw-bold text-dark">
                    {loading ? <span className="spinner-border spinner-border-sm text-primary" /> : stats.totalToday}
                  </h2>
                </div>
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: "54px", height: "54px" }}>
                  {usersIcon}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inside */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Currently Inside
                  </p>
                  <h2 className="mb-0 fw-bold text-dark">
                    {loading ? <span className="spinner-border spinner-border-sm text-success" /> : stats.currentlyInside}
                  </h2>
                </div>
                <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: "54px", height: "54px" }}>
                  {insideIcon}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checked Out */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Checked Out
                  </p>
                  <h2 className="mb-0 fw-bold text-dark">
                    {loading ? <span className="spinner-border spinner-border-sm text-secondary" /> : stats.checkedOut}
                  </h2>
                </div>
                <div className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center" style={{ width: "54px", height: "54px" }}>
                  {checkoutIcon}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Visitors Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold text-dark">Today's Visitors</h5>
              <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Latest visitor activity in the premises</p>
            </div>
            <button
              className="btn btn-light d-flex align-items-center gap-2 border shadow-sm text-secondary hover-bg-light"
              onClick={loadDashboard}
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
              <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Loading visitor data...</p>
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">{emptyFolderIcon}</div>
              <h6 className="fw-semibold text-dark">No visitors yet</h6>
              {/* <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Registered visitors for today will appear here.</p> */}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-nowrap">
                <thead className="table-light text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <tr>
                    <th className="fw-semibold ps-4 border-0 rounded-start">Visitor</th>
                    <th className="fw-semibold border-0">Company</th>
                    <th className="fw-semibold border-0">Host</th>
                    <th className="fw-semibold border-0">Purpose</th>
                    <th className="fw-semibold border-0">In Time</th>
                    <th className="fw-semibold border-0">Out Time</th>
                    <th className="fw-semibold pe-4 border-0 rounded-end">Status</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {visitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td className="ps-4 py-3">
                        <div className="fw-semibold text-dark">{visitor.visitor_name}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>{visitor.mobile}</div>
                      </td>
                      <td className="text-secondary">{visitor.company_name || "—"}</td>
                      <td className="text-dark fw-medium">{visitor.person_to_meet}</td>
                      <td className="text-secondary">{visitor.purpose}</td>
                      <td className="text-secondary fw-medium">{formatTime(visitor.in_time)}</td>
                      <td className="text-secondary">{visitor.out_time ? formatTime(visitor.out_time) : "—"}</td>
                      <td className="pe-4">
                        {visitor.status === "Inside" ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-medium">
                            Inside
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-2 fw-medium">
                            Checked Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Optional: Add a simple spin animation for the refresh button in your global CSS */}
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

// Format time securely
function formatTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "—";
  }
}

export default Dashboard;
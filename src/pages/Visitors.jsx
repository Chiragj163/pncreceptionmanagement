import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function Visitors({ onViewVisitor, onNewVisitor }) {
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVisitorForCheckout, setSelectedVisitorForCheckout] = useState(null);
  const [timeMode, setTimeMode] = useState("default"); 
  const [manualDateTime, setManualDateTime] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/visitors");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch visitors");
      }

      setVisitors(data.visitors || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const formatForDateTimeInput = (dateObj) => {
    const offset = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);
  };

  const openCheckoutModal = (visitor) => {
    setSelectedVisitorForCheckout(visitor);
    setTimeMode("default");
    setCheckoutError("");
    const now = new Date();
    const inDate = new Date(visitor.in_time);
    const initialPickerDate = now < inDate ? inDate : now;
    setManualDateTime(formatForDateTimeInput(initialPickerDate));
  };

  const handleConfirmCheckout = async () => {
    if (!selectedVisitorForCheckout) return;
    setCheckoutError("");
    const inTime = new Date(selectedVisitorForCheckout.in_time);
    let selectedOutTime;

    if (timeMode === "default") {
      selectedOutTime = new Date();
    } else {
      if (!manualDateTime) {
        setCheckoutError("Please select a valid check-out date and time.");
        return;
      }
      selectedOutTime = new Date(manualDateTime);
    }

    if (selectedOutTime <= inTime) {
      setCheckoutError(
        `Check-out time cannot be earlier than or equal to check-in time (${formatDateTime(
          selectedVisitorForCheckout.in_time
        )}).`
      );
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {};
      if (timeMode === "manual" && manualDateTime) {
        payload.out_time = manualDateTime.replace("T", " ") + ":00";
      }

      const response = await apiFetch(`/api/visitors/${selectedVisitorForCheckout.id}/checkout`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setCheckoutError(data.message || "Checkout failed. Please try again.");
        setCheckoutLoading(false);
        return;
      }

      setSelectedVisitorForCheckout(null);
      fetchVisitors();
    } catch (err) {
      console.error("Checkout caught error:", err);
    setCheckoutError(err.message || "An unexpected error occurred.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const searchText = search.toLowerCase();
    return (
      visitor.visitor_name?.toLowerCase().includes(searchText) ||
      visitor.mobile?.toLowerCase().includes(searchText) ||
      visitor.company_name?.toLowerCase().includes(searchText) ||
      visitor.person_to_meet?.toLowerCase().includes(searchText)
    );
  });

  const userPlusIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );

  const searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const refreshIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );

  const eyeIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const logOutIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
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

  const clockIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return (
    <div className="p-4 bg-light min-vh-100 position-relative">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* <div>
          <h4 className="fw-bold mb-1 text-dark">Visitor Records</h4>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Monitor, inspect, and check out active or past site visitors.
          </p>
        </div> */}

        {onNewVisitor && (
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 py-2 rounded-3 fw-medium"
            onClick={onNewVisitor}
            style={{ fontSize: "0.85rem" }}
          >
            {userPlusIcon}
            <span>New Visitor</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
          <div className="row g-3 align-items-center justify-content-between">
            {/* Search Input */}
            <div className="col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-0 ps-3">
                  {searchIcon}
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2 pe-3"
                  placeholder="Search by name, mobile, company, or host..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: "0.88rem" }}
                />
              </div>
            </div>

            {/* Refresh Button */}
            <div className="col-auto">
              <button
                className="btn btn-light d-flex align-items-center gap-2 border shadow-sm text-secondary hover-bg-light"
                onClick={fetchVisitors}
                disabled={loading}
                style={{ fontSize: "0.85rem" }}
              >
                <span className={loading ? "spin-animation" : ""}>{refreshIcon}</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0 mt-3">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Loading visitor entries...</p>
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">{emptyUsersIcon}</div>
              <h6 className="fw-semibold text-dark">No visitors found</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                {search ? "No records match your search query." : "There are currently no visitor entries."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-nowrap">
                <thead className="table-light text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <tr>
                    <th className="fw-semibold ps-4 border-0 rounded-start">ID</th>
                    <th className="fw-semibold border-0">Visitor</th>
                    <th className="fw-semibold border-0">Company</th>
                    <th className="fw-semibold border-0">Host</th>
                    <th className="fw-semibold border-0">In Time</th>
                    <th className="fw-semibold border-0">Out Time</th>
                    <th className="fw-semibold border-0">Status</th>
                    <th className="fw-semibold pe-4 border-0 text-end rounded-end">Action</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td className="ps-4 py-3 text-muted" style={{ fontSize: "0.85rem" }}>
                        #{visitor.id}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{visitor.visitor_name}</div>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>{visitor.mobile || "—"}</div>
                      </td>
                      <td className="text-secondary">{visitor.company_name || "—"}</td>
                      <td className="text-dark fw-medium">{visitor.person_to_meet}</td>
                      <td className="text-secondary" style={{ fontSize: "0.85rem" }}>
                        {formatDateTime(visitor.in_time)}
                      </td>
                      <td className="text-secondary" style={{ fontSize: "0.85rem" }}>
                        {visitor.out_time ? formatDateTime(visitor.out_time) : "—"}
                      </td>
                      <td>
                        {visitor.status === "Inside" ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 fw-medium">
                            Inside
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-1 fw-medium">
                            Checked Out
                          </span>
                        )}
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-light border text-dark d-flex align-items-center gap-1 rounded-3 px-3 py-1 fw-medium"
                            onClick={() => onViewVisitor(visitor.id)}
                            style={{ fontSize: "0.8rem" }}
                          >
                            {eyeIcon}
                            <span>View</span>
                          </button>

                          {visitor.status === "Inside" && (
                            <button
                              className="btn btn-sm btn-danger shadow-sm d-flex align-items-center gap-1 rounded-3 px-3 py-1 fw-medium"
                              onClick={() => openCheckoutModal(visitor)}
                              style={{ fontSize: "0.8rem" }}
                            >
                              {logOutIcon}
                              <span>Check Out</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedVisitorForCheckout && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom py-3 px-4 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger d-flex align-items-center justify-content-center">
                    {clockIcon}
                  </div>
                  <h6 className="modal-title fw-bold text-dark mb-0">Check Out Visitor</h6>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedVisitorForCheckout(null)}
                />
              </div>

              <div className="modal-body p-4">
                {checkoutError && (
                    <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3 fw-medium">
                      {checkoutError}
                    </div>
                )}
                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                  Confirm checkout for <strong>{selectedVisitorForCheckout.visitor_name}</strong> (Pass #{selectedVisitorForCheckout.id}) and choose the checkout timestamp.
                </p>

                <div className="d-flex flex-column gap-3">
                  {/* Default Time Option */}
                  <label className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer ${timeMode === "default" ? "border-danger bg-danger bg-opacity-10" : "bg-light"}`}>
                    <input
                      type="radio"
                      name="checkout_time_type"
                      checked={timeMode === "default"}
                      onChange={() => setTimeMode("default")}
                      className="form-check-input mt-1"
                    />
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>Current System Time (Default)</div>
                      {/* <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                        Record the current date and time as the checkout timestamp.
                      </small> */}
                    </div>
                  </label>

                  {/* Manual Time Option */}
                  <label className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer ${timeMode === "manual" ? "border-danger bg-danger bg-opacity-10" : "bg-light"}`}>
                    <input
                      type="radio"
                      name="checkout_time_type"
                      checked={timeMode === "manual"}
                      onChange={() => setTimeMode("manual")}
                      className="form-check-input mt-1"
                    />
                    <div className="w-100">
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>Custom / Manual Time</div>
                      {/* <small className="text-muted d-block mb-2" style={{ fontSize: "0.78rem" }}>
                        Specify a past or backdated exit timestamp.
                      </small> */}

                      {timeMode === "manual" && (
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            value={manualDateTime}
                            onChange={(e) => setManualDateTime(e.target.value)}
                            className="form-control form-control-sm bg-white border"
                            required
                            style={{ fontSize: "0.85rem" }}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-4 bg-light d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-3 px-3"
                  onClick={() => setSelectedVisitorForCheckout(null)}
                  disabled={checkoutLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger rounded-3 px-4 fw-medium shadow-sm"
                  onClick={handleConfirmCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Checking Out..." : "Confirm & Check Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

function formatDateTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return "—";
  }
}

export default Visitors;
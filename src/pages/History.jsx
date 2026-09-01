import React, { useState } from "react";
import { apiFetch } from "../api";

function History() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    name: "",
    company: "",
    person: "",
    status: "All"
  });

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.name) params.append("name", filters.name);
      if (filters.company) params.append("company", filters.company);
      if (filters.person) params.append("person", filters.person);
      if (filters.status !== "All") params.append("status", filters.status);

      const response = await apiFetch(`/api/visitors/history/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      setVisitors(data.visitors || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      from: "",
      to: "",
      name: "",
      company: "",
      person: "",
      status: "All"
    });
    setVisitors([]);
    setSearched(false);
    setError("");
  };


  const searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const resetIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );

  const emptySearchIcon = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Header */}
      {/* <div className="mb-4">
        <h4 className="fw-bold mb-1 text-dark">Visitor History</h4>
        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          Filter and query past visitor check-ins across custom parameters.
        </p>
      </div> */}

      {/* Filter Card */}
      <form onSubmit={handleSearch} className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            {/* From Date */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleChange}
                className="form-control form-control-sm bg-light border-0 py-2 px-3 rounded-3"
              />
            </div>

            {/* To Date */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                To Date
              </label>
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleChange}
                className="form-control form-control-sm bg-light border-0 py-2 px-3 rounded-3"
              />
            </div>

            {/* Visitor Name */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Visitor Name
              </label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleChange}
                className="form-control form-control-sm bg-light border-0 py-2 px-3 rounded-3"
                placeholder="Search name"
              />
            </div>

            {/* Company */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Company
              </label>
              <input
                type="text"
                name="company"
                value={filters.company}
                onChange={handleChange}
                className="form-control form-control-sm bg-light border-0 py-2 px-3 rounded-3"
                placeholder="Search company"
              />
            </div>

            {/* Person to Meet */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Host
              </label>
              <input
                type="text"
                name="person"
                value={filters.person}
                onChange={handleChange}
                className="form-control form-control-sm bg-light border-0 py-2 px-3 rounded-3"
                placeholder="Employee name"
              />
            </div>

            {/* Status */}
            <div className="col-md-4 col-lg-2">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="form-select form-select-sm bg-light border-0 py-2 px-3 rounded-3"
              >
                <option value="All">All Statuses</option>
                <option value="Inside">Inside</option>
                <option value="Checked Out">Checked Out</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-2 border-top">
            <button
              type="button"
              className="btn btn-light text-secondary d-flex align-items-center gap-2 border px-3 py-2 rounded-3"
              onClick={handleReset}
              style={{ fontSize: "0.85rem" }}
            >
              {resetIcon}
              Reset
            </button>

            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 py-2 rounded-3"
              disabled={loading}
              style={{ fontSize: "0.85rem" }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                searchIcon
              )}
              {loading ? "Searching..." : "Apply Filters"}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4">
          {error}
        </div>
      )}

      {/* Results Table */}
      {searched && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1 fw-bold text-dark">Search Results</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                  Found <span className="fw-semibold text-dark">{visitors.length}</span> record{visitors.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="card-body p-0 mt-3">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Querying database...</p>
              </div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">{emptySearchIcon}</div>
                <h6 className="fw-semibold text-dark">No records found</h6>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Try relaxing your search criteria or resetting filters.
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
                      <th className="fw-semibold border-0">Purpose</th>
                      <th className="fw-semibold border-0">Host</th>
                      <th className="fw-semibold border-0">Date</th>
                      <th className="fw-semibold border-0">Time</th>
                      <th className="fw-semibold pe-4 border-0 rounded-end">Status</th>
                      <th className="fw-semibold pe-4 border-0 rounded-end">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {visitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td className="ps-4 py-3 text-muted" style={{ fontSize: "0.85rem" }}>
                          #{visitor.id}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{visitor.visitor_name}</div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>{visitor.mobile}</div>
                        </td>
                        <td className="text-secondary">{visitor.company_name || "—"}</td>
                        <td className="text-secondary">{visitor.purpose}</td>
                        <td className="text-dark fw-medium">{visitor.person_to_meet}</td>
                        <td className="text-secondary fw-medium">{formatDate(visitor.visit_date)}</td>
                        <td className="text-secondary" style={{ fontSize: "0.85rem" }}>
                          <span className="text-dark">{formatTime(visitor.in_time)}</span>
                          <span className="text-muted mx-1">→</span>
                          <span>{visitor.out_time ? formatTime(visitor.out_time) : "—"}</span>
                        </td>
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
                        <td className="pe-4 text-dark fw-medium">({visitor.created_by_name || "-"})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
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

export default History;
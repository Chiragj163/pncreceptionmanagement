import React, { useState } from "react";
import * as XLSX from "xlsx";
import { apiFetch } from "../api";

function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [summary, setSummary] = useState({
    totalVisitors: 0,
    currentlyInside: 0,
    checkedOut: 0,
    averageDuration: 0
  });

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const [summaryResponse, visitorsResponse] = await Promise.all([
        apiFetch(`/api/visitors/reports/summary?${params.toString()}`),
        apiFetch(`/api/visitors/reports/visitors?${params.toString()}`)
      ]);

      const summaryData = await summaryResponse.json();
      const visitorsData = await visitorsResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryData.message || "Failed to generate report summary");
      }
      if (!visitorsResponse.ok) {
        throw new Error(visitorsData.message || "Failed to fetch report visitors");
      }

      setSummary(summaryData.summary);
      setVisitors(visitorsData.visitors || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (visitors.length === 0) {
      alert("There is no visitor data to export.");
      return;
    }

    const excelData = visitors.map((visitor) => ({
      "Visitor ID": visitor.id,
      "Visitor Name": visitor.visitor_name,
      "Mobile": visitor.mobile || "",
      // "Address": visitor.address || "",
      "Company": visitor.company_name || "",
      "Purpose": visitor.purpose || "",
      "Person To Meet": visitor.person_to_meet || "",
      "Created By": visitor.created_by_name || "",
      "Visit Date": formatDate(visitor.visit_date),
      "In Time": formatDateTime(visitor.in_time),
      "Out Time": visitor.out_time ? formatDateTime(visitor.out_time) : "",
      "Duration": visitor.out_time
        ? formatDuration(calculateDuration(visitor.in_time, visitor.out_time))
        : "",
      "Status": visitor.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitors");

    let fileName = "Visitor_Report";
    if (from && to) fileName = `Visitor_Report_${from}_to_${to}`;
    else if (from) fileName = `Visitor_Report_from_${from}`;
    else if (to) fileName = `Visitor_Report_upto_${to}`;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const printReport = () => {
    if (visitors.length === 0) {
      alert("There is no visitor data to print.");
      return;
    }
    window.print();
  };

  const resetReport = () => {
    setFrom("");
    setTo("");
    setSummary({
      totalVisitors: 0,
      currentlyInside: 0,
      checkedOut: 0,
      averageDuration: 0
    });
    setVisitors([]);
    setSearched(false);
    setError("");
  };

  const fileTextIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const resetIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );

  const printIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );

  const downloadIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const emptyReportIcon = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Header (Hidden when printing) */}
      {/* <div className="mb-4 d-print-none">
        <h4 className="fw-bold mb-1 text-dark">Analytics & Reports</h4>
        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          Generate summaries and detailed exports for visitor data.
        </p>
      </div> */}

      {/* Filter Card (Hidden when printing) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 d-print-none">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                From Date
              </label>
              <input
                type="date"
                className="form-control bg-light border-0 py-2 px-3 rounded-3"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                To Date
              </label>
              <input
                type="date"
                className="form-control bg-light border-0 py-2 px-3 rounded-3"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="col-md-4 d-flex gap-2">
              <button
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 shadow-sm px-4 py-2 rounded-3 w-100 fw-medium"
                onClick={generateReport}
                disabled={loading}
                style={{ fontSize: "0.85rem" }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  fileTextIcon
                )}
                <span>{loading ? "Generating..." : "Generate Report"}</span>
              </button>

              <button
                className="btn btn-light text-secondary d-flex align-items-center justify-content-center gap-2 border px-3 py-2 rounded-3"
                onClick={resetReport}
                style={{ fontSize: "0.85rem" }}
              >
                {resetIcon}
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4 d-print-none">
          {error}
        </div>
      )}

      {/* Printable Area */}
      {searched && (
        <div id="print-report">
          {/* Print Title Banner */}
          <div className="text-center mb-4 py-2 border-bottom pb-3">
            <h3 className="fw-bold mb-1 text-dark">Visitor Summary Report</h3>
            {/* <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
              Reception Management System
            </p> */}
            {(from || to) && (
              <span className="badge bg-light text-dark border px-3 py-1 rounded-pill" style={{ fontSize: "0.8rem" }}>
                {from && `From: ${formatDate(from)}`}
                {from && to && " — "}
                {to && `To: ${formatDate(to)}`}
              </span>
            )}
          </div>

          {/* Key Metrics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 p-md-4">
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Total Visitors
                  </p>
                  <h3 className="mb-0 fw-bold text-dark">{summary.totalVisitors}</h3>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 p-md-4">
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Currently Inside
                  </p>
                  <h3 className="mb-0 fw-bold text-success">{summary.currentlyInside}</h3>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 p-md-4">
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Checked Out
                  </p>
                  <h3 className="mb-0 fw-bold text-secondary">{summary.checkedOut}</h3>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 p-md-4">
                  <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Avg. Duration
                  </p>
                  <h3 className="mb-0 fw-bold text-primary">{formatDuration(summary.averageDuration)}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Visitor List Card */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4 d-print-none">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold text-dark">Detailed Visitor Logs</h5>
                  <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                    Total records found: <span className="fw-semibold text-dark">{visitors.length}</span>
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light text-dark border shadow-sm d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                    onClick={printReport}
                    disabled={visitors.length === 0}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {printIcon}
                    Print
                  </button>

                  <button
                    className="btn btn-success d-flex align-items-center gap-2 shadow-sm rounded-3 px-3 py-2 fw-medium"
                    onClick={exportToExcel}
                    disabled={visitors.length === 0}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {downloadIcon}
                    Export Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-0 mt-3">
              {loading ? (
                <div className="text-center py-5 d-print-none">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Generating data breakdown...</p>
                </div>
              ) : visitors.length === 0 ? (
                <div className="text-center py-5 d-print-none">
                  <div className="mb-3">{emptyReportIcon}</div>
                  <h6 className="fw-semibold text-dark">No records found</h6>
                  <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                    No visitor logs match the selected timeframe.
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
                        <th className="fw-semibold border-0">Created By</th>
                        <th className="fw-semibold border-0">Date</th>
                        <th className="fw-semibold border-0">In / Out</th>
                        <th className="fw-semibold border-0">Duration</th>
                        <th className="fw-semibold pe-4 border-0 rounded-end">Status</th>
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
                          <td className="text-dark fw-medium">({visitor.created_by_name || "-"})</td>
                          <td className="text-secondary fw-medium">{formatDate(visitor.visit_date)}</td>
                          <td className="text-secondary" style={{ fontSize: "0.85rem" }}>
                            <span className="text-dark">{formatTime(visitor.in_time)}</span>
                            <span className="text-muted mx-1">→</span>
                            <span>{visitor.out_time ? formatTime(visitor.out_time) : "—"}</span>
                          </td>
                          <td className="text-secondary fw-medium" style={{ fontSize: "0.85rem" }}>
                            {visitor.out_time
                              ? formatDuration(calculateDuration(visitor.in_time, visitor.out_time))
                              : "—"}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Rules for Clean Printing */}
      <style>{`
        @media print {
          body {
            background-color: #fff !important;
          }
          .d-print-none {
            display: none !important;
          }
          #print-report {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #dee2e6 !important;
          }
        }
      `}</style>
    </div>
  );
}

// Utility Helper Functions
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

function calculateDuration(start, end) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return Math.round((endTime - startTime) / 60000);
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "0 min";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export default Reports;
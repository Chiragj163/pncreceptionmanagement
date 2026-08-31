import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

function VisitorDetails({ visitorId, onBack, autoPrint = false }) {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVisitor = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/api/visitors/${visitorId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load visitor details");
      }

      setVisitor(data.visitor);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitor();
  }, [visitorId]);
  useEffect(() => {
  if (visitor && autoPrint) {
    const printTimer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(printTimer);
  }
}, [visitor, autoPrint]);
const parseDetailsAndMembers = () => {
    if (!visitor) return { members: [], cleanNotes: "" };

    let members = [];
    let cleanNotes = visitor.other_details || "";
    if (cleanNotes.includes("__GROUP_DATA__")) {
      try {
        const match = cleanNotes.match(/__GROUP_DATA__(.*?)__END_GROUP__/s);
        if (match && match[1]) {
          members = JSON.parse(match[1]);
          // Clean the notes so the internal tag isn't shown on screen or print
          cleanNotes = cleanNotes.replace(/__GROUP_DATA__(.*?)__END_GROUP__\n?/s, "").trim();
        }
      } catch (e) {
        console.error("Failed to parse group data:", e);
      }
    }
    else if (visitor.accompanying_visitors) {
      const raw = visitor.accompanying_visitors;
      if (Array.isArray(raw)) {
        members = raw;
      } else if (typeof raw === "string") {
        try {
          members = JSON.parse(raw);
        } catch {}
      }
    }
    return { members, cleanNotes };
  };
  const { members, cleanNotes } = parseDetailsAndMembers();
  const isGroup = members.length > 0;
  const totalGroupCount = isGroup ? members.length + 1 : 1;
  

  const printVisitorPass = () => {
    window.print();
  };

  const arrowLeftIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );

  const printerIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );

  const checkCircleIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );

  if (loading) {
    return (
      <div className="p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>Loading visitor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-light min-vh-100">
        <button
          className="btn btn-light text-secondary border shadow-sm d-flex align-items-center gap-2 rounded-3 mb-4"
          onClick={onBack}
          style={{ fontSize: "0.85rem" }}
        >
          {arrowLeftIcon}
          Back to Visitors
        </button>
        <div className="alert alert-danger border-0 shadow-sm rounded-3 py-3 px-4">
          {error}
        </div>
      </div>
    );
  }

  if (!visitor) return null;

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Top Navigation & Action Bar (Hidden when printing) */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none" style={{ maxWidth: "680px", margin: "0 auto" }}>
        <button
          className="btn btn-light text-secondary border shadow-sm d-flex align-items-center gap-2 rounded-3 px-3 py-2 fw-medium"
          onClick={onBack}
          style={{ fontSize: "0.85rem" }}
        >
          {arrowLeftIcon}
          <span>Back</span>
        </button>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-3 px-4 py-2 fw-medium"
          onClick={printVisitorPass}
          style={{ fontSize: "0.85rem" }}
        >
          {printerIcon}
          <span>Print Pass</span>
        </button>
      </div>

      {/* Visitor Pass Card */}
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mx-auto print-card"
        id="visitor-pass"
        style={{ maxWidth: "680px" }}
      >
        {/* Pass Header Banner */}
        <div className="bg-primary bg-opacity-10 border-bottom border-primary border-opacity-10 p-4">
          <div className="position-relative d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className="bg-white p-2 rounded-3 shadow-sm border d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px" }}
              >
                <img
                  src="/reception/images.svg"
                  alt="Logo"
                  className="object-fit-contain"
                  style={{ width: "52px", height: "52px" }}
                />
              </div>
              <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ whiteSpace: "nowrap" }}>
                <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "0.5px" }}>VISITOR PASS</h5>
                <span className={`badge mt-1 ${isGroup ? "bg-primary text-white" : "bg-light text-dark border"}`} style={{ fontSize: "0.75rem" }}>
                  {isGroup ? `Group Pass (${totalGroupCount} Persons)` : "Single Visitor Pass"}
                </span>
              </div>
            </div>

            <div className="text-end">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 fw-bold" style={{ fontSize: "0.85rem" }}>
                ID: #{visitor.id}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body Details */}
        <div className="card-body p-4 p-md-5">
          {/* Main Visitor Grid */}
          <div className="row g-3 mb-4">
            <DetailItem
              label={visitor.visitor_type === "Group" ? "Lead Visitor Name" : "Visitor Name"}
              value={visitor.visitor_name}
              isHighlight
            />
            {visitor.visitor_type === "Group" && (
              <DetailItem
                label="Visitor Type"
                value={`Group (${visitor.group_size || (visitor.accompanying_visitors?.length ? visitor.accompanying_visitors.length + 1 : 1)} Persons)`}
              />
            )}

            <DetailItem
              label="Mobile Number"
              value={visitor.mobile || "—"}
            />

            <DetailItem
              label="Company / Organization"
              value={visitor.company_name || "—"}
            />

            <DetailItem
              label="Host / Person to Meet"
              value={visitor.person_to_meet}
            />

            <DetailItem
              label="Purpose of Visit"
              value={visitor.purpose}
            />

            <DetailItem
              label="Visit Date"
              value={formatDate(visitor.visit_date)}
            />

            <DetailItem
              label="In Time"
              value={formatDateTime(visitor.in_time)}
            />

            <DetailItem
              label="Out Time"
              value={
                visitor.out_time ? (
                  formatDateTime(visitor.out_time)
                ) : (
                  <span className="text-success fw-medium d-inline-flex align-items-center gap-1">
                    {checkCircleIcon} Still Inside
                  </span>
                )
              }
            />
            {isGroup && (
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="fw-bold text-uppercase text-muted mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Accompanying Group Members ({members.length})
                  </div>
                  <table className="table table-sm table-bordered bg-white mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "40px" }} className="text-center">#</th>
                        <th>Member Name</th>
                        <th style={{ width: "160px" }}>Mobile Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, i) => (
                        <tr key={i}>
                          <td className="text-center fw-bold">{i + 2}</td>
                          <td className="fw-medium">{member.name}</td>
                          <td>{member.mobile || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="col-12">
              <div className="p-3 bg-light rounded-3 border-0">
                <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Address
                </div>
                <div className="fw-medium text-dark" style={{ fontSize: "0.9rem" }}>
                  {visitor.address || "—"}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {/* {visitor.other_details && (
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border-0">
                  <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Additional Information
                  </div>
                  <div className="text-secondary" style={{ fontSize: "0.9rem" }}>
                    {visitor.other_details}
                  </div>
                </div>
              </div>
            )}
          </div> */}
          {cleanNotes && (
              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border-0">
                  <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Additional Information
                  </div>
                  <div className="text-secondary" style={{ fontSize: "0.9rem", whiteSpace: "pre-line" }}>
                    {cleanNotes}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Badge Footer */}
          <div className="pt-3 border-top d-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              Authorized Visitor Pass
            </div>
            <div className="mt-1" style={{ fontSize: "0.8rem" }}>
              Created by{" "}
              <span className="fw-semibold text-dark">  
                {visitor.created_by_name || visitor.receptionist_name || "Receptionist"}
              </span>
            </div>
  
            <div>
              {visitor.status === "Inside" ? (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-medium" style={{ fontSize: "0.8rem" }}>
                  ● Currently Inside
                </span>
              ) : (
                <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-2 fw-medium" style={{ fontSize: "0.8rem" }}>
                  Checked Out
                </span>
              )}
            </div>
          </div>
          {visitor.accompanying_visitors && visitor.accompanying_visitors.length > 0 && (
          <div className="col-12">
            <div className="p-3 bg-light rounded-3 border-0">
              <div className="fw-semibold text-muted mb-2" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Accompanying Members ({visitor.accompanying_visitors.length})
              </div>
              <div className="d-flex flex-wrap gap-2">
                {visitor.accompanying_visitors.map((member, i) => (
                  <span key={i} className="badge bg-white text-dark border px-3 py-2 rounded-2 fw-normal" style={{ fontSize: "0.85rem" }}>
                    <strong>#{i + 2}:</strong> {member.name} {member.mobile ? `(${member.mobile})` : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Media Print Styling */}
     <style>{`
        @media print {
          body {
            background-color: #fff !important;
            padding: 0 !important;
          }
          .d-print-none {
            display: none !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 1px solid #dee2e6 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          table td, table th {
            background-color: #fff !important;
            border: 1px solid #dee2e6 !important;
            padding: 6px 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

function DetailItem({ label, value, isHighlight }) {
  return (
    <div className="col-md-6">
      <div className="p-3 bg-light rounded-3 border-0 h-100">
        <div className="fw-semibold text-muted mb-1" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </div>
        <div className={`text-dark ${isHighlight ? "fw-bold fs-6 text-primary" : "fw-medium"}`} style={{ fontSize: "0.9rem" }}>
          {value}
        </div>
      </div>
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

function formatDateTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      // dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return "—";
  }
}

export default VisitorDetails;
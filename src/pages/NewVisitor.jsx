import React, { useState } from "react";
import { apiFetch } from "../api";

function NewVisitor({ onViewVisitor }) {
  const initialFormState = {
    visitor_name: "",
    mobile: "",
    address: "",
    company_name: "",
    person_to_meet: "",
    purpose: "",
    other_details: "",
    accompanying_visitors: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeMode, setTimeMode] = useState("default");
  const [manualDateTime, setManualDateTime] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [mobileError, setMobileError] = useState("");
  const handleMobileChange = (e) => {
  const value = e.target.value;

  if (/[^0-9]/.test(value)) {
    setMobileError("Only numbers (0-9) are allowed.");
  } else if (value.length > 0 && value.length < 10) {
    setMobileError("Mobile number should be 10 digits.");
  } else {
    setMobileError("");
  }

  const cleanValue = value.replace(/\D/g, "");

  setFormData((prev) => ({
    ...prev,
    mobile: cleanValue
  }));
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const addAccompanyingMember = () => {
    setFormData((prev) => ({
      ...prev,
      accompanying_visitors: [...prev.accompanying_visitors, { name: "", mobile: "" }]
    }));
  };
  const removeAccompanyingMember = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      accompanying_visitors: prev.accompanying_visitors.filter((_, idx) => idx !== indexToRemove)
    }));
  };
  const handleAccompanyingChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.accompanying_visitors];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, accompanying_visitors: updated };
    });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (mobileError) return;
    setShowTimeModal(true);
  };
  const executeRegistration = async () => {
    setShowTimeModal(false);
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const validMembers = formData.accompanying_visitors.filter(
        (m) => m.name && m.name.trim() !== ""
      );

      let finalOtherDetails = formData.other_details.trim();
      if (validMembers.length > 0) {
        const groupTag = `__GROUP_DATA__${JSON.stringify(validMembers)}__END_GROUP__`;
        finalOtherDetails = finalOtherDetails
          ? `${groupTag}\n${finalOtherDetails}`
          : groupTag;
      }

      const payload = {
        visitor_name: formData.visitor_name,
        mobile: formData.mobile,
        address: formData.address,
        company_name: formData.company_name,
        person_to_meet: formData.person_to_meet,
        purpose: formData.purpose,
        other_details: finalOtherDetails
      };

      // Add manual in_time formatted as 'YYYY-MM-DD HH:mm:ss' if manual mode is chosen
      if (timeMode === "manual" && manualDateTime) {
        payload.in_time = manualDateTime.replace("T", " ") + ":00";
      }

      const response = await apiFetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register visitor");
      }

      setMessage(`Visitor registered successfully. ID: ${data.visitorId}`);
      setFormData(initialFormState);

      if (onViewVisitor && data.visitorId) {
        onViewVisitor(data.visitorId);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = () => {
    setFormData(initialFormState);
    setMessage("");
    setError("");
    setMobileError("");
  };


  const userPlusIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );

  const resetIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );

  const checkIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const clockIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
  const hasGroup = formData.accompanying_visitors.length > 0;
  return (
    <div className="p-4 bg-light min-vh-100">
      {/* Header */}
      {/* <div className="mb-4">
        <h4 className="fw-bold mb-1 text-dark">Register New Visitor</h4>
        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
          Fill in visitor details below to record check-in.
        </p>
      </div> */}

      {/* Form Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ maxWidth: "100%" }}>
        <div className="card-body p-4 p-md-5">
          {/* Notifications */}
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

          <form onSubmit={handleFormSubmit}>
            <div className="row g-4">
              {/* Section 1: Visitor Information */}
              <div className="col-12">
                <div className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  1. Visitor Information {hasGroup && "(Lead / Primary Contact)"}
                </div>
              </div>

              {/* Visitor Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Visitor Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="visitor_name"
                  value={formData.visitor_name}
                  onChange={handleChange}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3"
                  placeholder="e.g. Chirag Jain"
                  required
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              {/* Mobile */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  className={`form-control bg-light border-0 py-2 px-3 rounded-3 ${ mobileError ? "is-invalid" : ""}`}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  required
                  style={{ fontSize: "0.9rem" }}
                />
                {mobileError && (
                  <div className="text-danger mt-1 fw-medium" style={{ fontSize: "0.78rem" }}>
                    {mobileError}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3"
                  rows="2"
                  placeholder="Street address or city"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              {/* Company Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3"
                  placeholder="Organization or company"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
              <div className="col-12 pt-2">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <div className="fw-bold text-uppercase text-muted" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                    Accompanying Persons ({formData.accompanying_visitors.length + 1} Total in Group)
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center gap-1 py-1 px-3 fw-medium"
                    onClick={addAccompanyingMember}
                    style={{ fontSize: "0.8rem" }}
                  >
                    + Add Accompanying Person
                  </button>
                </div>

                {formData.accompanying_visitors.map((member, index) => (
                  <div key={index} className="d-flex align-items-center gap-2 p-2 mb-2 bg-light rounded-3 border">
                    <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: "0.75rem" }}>
                      Person #{index + 2}
                    </span>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={member.name}
                      onChange={(e) => handleAccompanyingChange(index, "name", e.target.value)}
                      className="form-control form-control-sm bg-white border"
                      required
                      style={{ fontSize: "0.85rem" }}
                    />
                    <input
                      type="tel"
                      placeholder="Mobile (Optional)"
                      maxLength={10}
                      value={member.mobile}
                      onChange={(e) => handleAccompanyingChange(index, "mobile", e.target.value.replace(/\D/g, ""))}
                      className="form-control form-control-sm bg-white border"
                      style={{ fontSize: "0.85rem", maxWidth: "160px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm border-0 d-flex align-items-center justify-content-center p-2 rounded-2"
                      onClick={() => removeAccompanyingMember(index)}
                      title="Remove Person"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Section 2: Visit Details */}
              <div className="col-12 pt-2">
                <div className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                  2. Visit Details
                </div>
              </div>

              {/* Person to Meet */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Host / Person to Meet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="person_to_meet"
                  value={formData.person_to_meet}
                  onChange={handleChange}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3"
                  placeholder="Employee or department"
                  required
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              {/* Purpose */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Purpose of Visit <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3"
                  placeholder="e.g. Interview, Business Meeting, Delivery"
                  required
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              {/* Other details */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                  Additional Notes / Details
                </label>
                <textarea
                  name="other_details"
                  value={formData.other_details}
                  onChange={handleChange}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3"
                  rows="2"
                  placeholder="Asset details, pass numbers, or other observations..."
                  style={{ fontSize: "0.9rem" }}
                />
              </div>

              {/* Automatic Timestamp Info */}
              {/* <div className="col-12">
                <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 d-flex align-items-center gap-2 text-primary" style={{ fontSize: "0.85rem" }}>
                  {clockIcon}
                  <span>
                    <strong>Automatic Check-In:</strong> Entry timestamp will be automatically generated upon registration.
                  </span>
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="col-12 d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-light text-secondary d-flex align-items-center gap-2 border px-3 py-2 rounded-3"
                  onClick={handleClear}
                  style={{ fontSize: "0.85rem" }}
                >
                  {resetIcon}
                  Clear Form
                </button>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 py-2 rounded-3 fw-medium"
                  disabled={loading}
                  style={{ fontSize: "0.85rem" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      {userPlusIcon}
                      <span>Register Visitor {hasGroup && `(${formData.accompanying_visitors.length + 1} Persons)`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {showTimeModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom py-3 px-4 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center">
                    {clockIcon}
                  </div>
                  <h6 className="modal-title fw-bold text-dark mb-0">Select Check-In Time</h6>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTimeModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                  Choose how you want to record the entry timestamp for this visitor.
                </p>

                <div className="d-flex flex-column gap-3">
                  {/* Default / System Time Option */}
                  <label className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer ${timeMode === "default" ? "border-primary bg-primary bg-opacity-10" : "bg-light"}`}>
                    <input
                      type="radio"
                      name="checkin_time_type"
                      checked={timeMode === "default"}
                      onChange={() => setTimeMode("default")}
                      className="form-check-input mt-1"
                    />
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>Current System Time (Default)</div>
                      {/* <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                        Automatically capture the exact current date & time.
                      </small> */}
                    </div>
                  </label>

                  {/* Manual Time Option */}
                  <label className={`p-3 border rounded-3 d-flex align-items-start gap-3 cursor-pointer ${timeMode === "manual" ? "border-primary bg-primary bg-opacity-10" : "bg-light"}`}>
                    <input
                      type="radio"
                      name="checkin_time_type"
                      checked={timeMode === "manual"}
                      onChange={() => setTimeMode("manual")}
                      className="form-check-input mt-1"
                    />
                    <div className="w-100">
                      <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>Custom / Manual Time</div>
                      {/* <small className="text-muted d-block mb-2" style={{ fontSize: "0.78rem" }}>
                        Specify a past or backdated entry timestamp.
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
                  onClick={() => setShowTimeModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-3 px-4 fw-medium shadow-sm"
                  onClick={executeRegistration}
                >
                  Confirm & Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default NewVisitor;
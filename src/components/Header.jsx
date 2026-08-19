import React from "react";

function Header({ activePage, user }) {
  // Fallbacks for user info
  const userName = user?.fullName || "Receptionist";
  const userRole = user?.role || "Staff";
  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : "R";

  
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });


  const bellIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const calendarIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  return (
    <header className="bg-white border-bottom border-light-subtle px-4 py-3 sticky-top shadow-sm" style={{ zIndex: 1000 }}>
      <div className="d-flex align-items-center justify-content-between gap-3">
        
        {/* Left Section: Page Title & Date Badge */}
        <div className="d-flex align-items-center gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-0 lh-1">{activePage || "Dashboard"}</h5>
            <div className="d-flex align-items-center gap-2 text-muted mt-1" style={{ fontSize: "0.8rem" }}>
              <span className="d-flex align-items-center gap-1">
                {calendarIcon}
                {formattedDate}
              </span>
              {/* <span>•</span>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill fw-medium px-2 py-1" style={{ fontSize: "0.7rem" }}>
                System Active
              </span> */}
            </div>
          </div>
        </div>

        {/* Center Section: Quick Search Bar */}
        {/* <div className="d-none d-md-block flex-grow-1 max-w-xs mx-4" style={{ maxWidth: "320px" }}>
          <div className="input-group input-group-sm bg-light rounded-3 border-0 px-2 py-1 align-items-center">
            <span className="text-muted d-flex me-2">{searchIcon}</span>
            <input
              type="text"
              className="form-control bg-transparent border-0 p-0 shadow-none text-dark"
              placeholder="Search visitors, hosts..."
              style={{ fontSize: "0.85rem" }}
            />
          </div>
        </div> */}

        {/* Right Section: Actions & User Profile */}
        <div className="d-flex align-items-center gap-3">
          
          {/* Notifications Button */}
          {/* <button
            className="btn btn-light position-relative p-2 rounded-3 border-0 text-secondary hover-bg-light d-flex align-items-center justify-content-center"
            style={{ width: "38px", height: "38px" }}
            title="Notifications"
            aria-label="Notifications"
          >
            {bellIcon}
            <span 
              className="position-absolute bg-primary border border-2 border-white rounded-circle"
              style={{ width: "10px", height: "10px", top: "6px", right: "6px" }}
            />
          </button> */}

          {/* Divider */}
          {/* <div className="vr opacity-25 my-1" style={{ height: "24px" }} /> */}

          {/* User Profile Card */}
          {/* <div className="d-flex align-items-center gap-2 p-1 pe-2 rounded-3 hover-bg-light transition-all cursor-pointer">
            <div className="text-end lh-1 d-none d-sm-block">
              <div className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>
                {userName}
              </div>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                {userRole}
              </small>
            </div>

            <div
              className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
              style={{ width: "36px", height: "36px", fontSize: "0.88rem" }}
            >
              {userInitial}
            </div>
          </div> */}

        </div>
      </div>
    </header>
  );
}

export default Header;
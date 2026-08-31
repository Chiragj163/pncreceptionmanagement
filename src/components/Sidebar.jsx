import React from "react";

function Sidebar({ activePage, setActivePage, onLogout, user, isCollapsed, setIsCollapsed }) {
  const toggleSidebar = (e) => {
    e?.stopPropagation();
    setIsCollapsed((prev) => !prev);
  };

  const handleSidebarClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const mainMenuItems = [
    {
      name: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      name: "New Visitor",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
      )
    },
    {
      name: "Visitors",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* <path d="M17 21v-2a4 4 0 0 0-3-3.87" /> */}
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      name: "History",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      name: "Reports",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    }
  ];

  if (user?.role === "Admin") {
    mainMenuItems.push({
      name: "User Management",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      )
    });
  }

  const settingsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const logoutIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const collapseIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="M16 15l-3-3 3-3" />
    </svg>
  );

  return (
    <aside
      onClick={handleSidebarClick}
      className="d-flex flex-column bg-white border-end position-fixed top-0 start-0 vh-100 p-3 overflow-hidden"
      style={{
        width: isCollapsed ? "72px" : "260px",
        transition: "width 0.25s ease-in-out",
        zIndex: 1020,
        cursor: isCollapsed ? "pointer" : "default"
      }}
    >
      {/* Header & Toggle Button / Collapsed Logo */}
      <div className={`d-flex align-items-center mb-3 ${isCollapsed ? "justify-content-center" : "justify-content-between px-2"}`}>
        {isCollapsed ? (
          /* Show image at top when closed */
          <img 
            src="/reception/images.svg" 
            alt="Logo" 
            className="rounded-3 object-fit-contain" 
            style={{ width: "36px", height: "36px" }} 
            title="Click to expand sidebar"
          />
        ) : (
          /* Show Brand Logo + Title & Toggle Button when open */
          <>
            <div className="d-flex align-items-center gap-3 overflow-hidden">
              <img 
                src="/images.svg" 
                alt="Logo" 
                className="rounded-3 object-fit-contain flex-shrink-0" 
                style={{ width: "36px", height: "36px" }} 
              />
              <div className="lh-sm text-truncate">
                <h6 className="fw-bold mb-0 text-dark text-truncate">Reception</h6>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>Visitor Record</small>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              className="btn btn-sm btn-light text-muted border-0 p-2 d-flex align-items-center justify-content-center"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              {collapseIcon}
            </button>
          </>
        )}
      </div>

      <hr className="my-2 text-muted opacity-25" />

      {/* Main Navigation */}
      <div className="nav nav-pills flex-column gap-1 my-2 flex-grow-1 overflow-hidden">
        {mainMenuItems.map((item) => {
          const isActive = activePage === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              title={isCollapsed ? item.name : undefined}
              className={`btn text-start d-flex align-items-center border-0 rounded-3 ${
                isCollapsed ? "justify-content-center px-0 py-2" : "gap-3 px-3 py-2"
              } ${
                isActive 
                  ? "btn-primary text-white shadow-sm fw-medium" 
                  : "btn-light bg-transparent text-secondary hover-bg-light"
              }`}
              style={{ fontSize: "0.9rem" }}
            >
              <span className={isActive ? "text-white d-flex" : "text-muted d-flex"}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="text-truncate">{item.name}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Admin Settings & Profile */}
      <div className="pt-2 border-top">
        
          <button
            onClick={() => setActivePage("Settings")}
            title={isCollapsed ? "Settings" : undefined}
            className={`btn text-start d-flex align-items-center border-0 rounded-3 mb-2 w-100 ${
              isCollapsed ? "justify-content-center px-0 py-2" : "gap-3 px-3 py-2"
            } ${
              activePage === "Settings"
                ? "btn-primary text-white shadow-sm fw-medium"
                : "btn-light bg-transparent text-secondary"
            }`}
            style={{ fontSize: "0.9rem" }}
          >
            <span className={activePage === "Settings" ? "text-white d-flex" : "text-muted d-flex"}>
              {settingsIcon}
            </span>
            {!isCollapsed && <span className="text-truncate">Settings</span>}
          </button>
        

        {/* User Card & Logout Button */}
        <div className={`d-flex align-items-center rounded-3 bg-light mt-1 ${isCollapsed ? "flex-column gap-2 p-2" : "justify-content-between p-2"}`}>
          <div 
            className="d-flex align-items-center gap-2 overflow-hidden"
            title={isCollapsed ? `${user?.fullName || "User"} (${user?.role || "Staff"})` : undefined}
          >
            <div 
              className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            {!isCollapsed && (
              <div className="lh-1 text-truncate">
                <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "0.85rem" }}>
                  {user?.fullName || "User"}
                </div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  {user?.role || "Staff"}
                </small>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              if (isCollapsed) e.stopPropagation();
              onLogout();
            }}
            className="btn btn-sm text-muted hover-text-danger border-0 p-1 d-flex align-items-center justify-content-center"
            title="Logout"
            aria-label="Logout"
          >
            {logoutIcon}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
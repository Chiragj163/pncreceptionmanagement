import { useState } from "react";
import Users from "./pages/Users";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import VisitorDetails from "./pages/VisitorDetails";
import Dashboard from "./pages/Dashboard";
import NewVisitor from "./pages/NewVisitor";
import Visitors from "./pages/Visitors";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedVisitorId, setSelectedVisitorId] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handlePageChange = (page) => {
    setSelectedVisitorId(null); 
    setAutoPrint(false);
    setActivePage(page);
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setSelectedVisitorId(null);
    setActivePage("Dashboard"); // Guarantee Dashboard opens first
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setSelectedVisitorId(null);
    setActivePage("Dashboard");
  };

  const renderPage = () => {
    if (selectedVisitorId) {
      return (
        <VisitorDetails
          visitorId={selectedVisitorId}
          autoPrint={autoPrint}
          onBack={() => {setSelectedVisitorId(null); setAutoPrint(false);}}
        />
      );
    }

    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;

      case "New Visitor":
        return (
          <NewVisitor
            onViewVisitor={(id) => {
              setSelectedVisitorId(id);
              setAutoPrint(true);
            }}
          />
        );

      case "Visitors":
        return (
          <Visitors
            onViewVisitor={(id) => {setSelectedVisitorId(id); setAutoPrint(false);}}
            onNewVisitor={() => handlePageChange("New Visitor")}
          />
        );

      case "History":
        return <History />;

      case "Reports":
        return <Reports />;

      case "User Management":
        if (user?.role !== "Admin") {
          return <Dashboard />;
        }
        return <Users />;

      case "Settings":
        return <Settings user={user} />;

      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="d-flex min-vh-100 position-relative">
      {/* Sidebar with controlled collapse & navigation state */}
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        onLogout={handleLogout}
        user={user}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Container dynamically shifts width based on sidebar state */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: isSidebarCollapsed ? "72px" : "260px",
          transition: "margin-left 0.25s ease-in-out",
          minHeight: "100vh",
          backgroundColor: "#f5f6f8",
        }}
      >
        <Header activePage={selectedVisitorId ? "Visitor Details" : activePage} user={user} />

        <main className="p-4 flex-grow-1">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
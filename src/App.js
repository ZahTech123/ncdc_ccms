// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/dashboardPage/Dashboard";  // Import Dashboard component
import MapPage from "./pages/MapPage/MapPage";
import Modal from "react-modal";  // Import Modal from react-modal
import ReportsAndAnalysis from "./pages/reportsAnalysisPage/ReportsAndAnalysis";
import HelpAndSupport from "./pages/HelpAndSupport";
import Login from "./pages/loginPage/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";  // Import ProtectedRoute component
import { PermissionsProvider } from "./context/PermissionsContext"; // Import PermissionsProvider
import './styles/scrollbar.css';

const App = () => {
  useEffect(() => {
    // Set the app element for Modal to avoid the warning
    Modal.setAppElement('#root');
  }, []);

  return (
    <Router>
      <PermissionsProvider> {/* Wrap the app in PermissionsProvider */}
        <AppContent />
      </PermissionsProvider>
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation(); // Get the current location
  const [newTickets, setNewTickets] = useState([]); // State to track new tickets

  // Function to handle new ticket submissions
  const handleTicketSubmit = (ticket) => {
    setNewTickets((prevTickets) => [...prevTickets, ticket]);  // Add the new ticket to the list
    console.log("New ticket added to newTickets:", ticket);  // Debugging
  };

  // Function to clear notifications
  const clearNotifications = () => {
    setNewTickets([]);  // Clear the list of new tickets
    console.log("Notifications cleared");  // Debugging
  };

  // Conditionally render the Navbar based on the route
  const showNavbar = location.pathname !== "/login";

  return (
    <>
      {showNavbar && (
        <Navbar newTickets={newTickets} clearNotifications={clearNotifications} />
      )} {/* Render Navbar only if showNavbar is true */}
      <main className={showNavbar ? "pt-20 px-4" : ""}> {/* Adjust padding if Navbar is not shown */}
        <Routes>
          <Route path="/login" element={<Login />} />  {/* Login Page */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard onSubmit={handleTicketSubmit} />
              </ProtectedRoute>
            }
          />  {/* Default route loads Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onSubmit={handleTicketSubmit} />
              </ProtectedRoute>
            }
          />  {/* Dashboard Page */}
          <Route
            path="/reportsAndAnalysis"
            element={
              <ProtectedRoute>
                <ReportsAndAnalysis />
              </ProtectedRoute>
            }
          />  {/* Reports & Analysis Page */}
          <Route
            path="/mapPage"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />  {/* Map Page */}
          <Route
            path="/helpAndSupport"
            element={
              <ProtectedRoute>
                <HelpAndSupport />
              </ProtectedRoute>
            }
          />  {/* Help & Support */}
        </Routes>
      </main>
    </>
  );
};

export default App;
// // src/App.js
// import React, { useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Dashboard from "./pages/dashboardPage/Dashboard";  // Import Dashboard component
// import MapPage from "./pages/MapPage/MapPage";
// import Modal from "react-modal";  // Import Modal from react-modal
// import ReportsAndAnalysis from "./pages/reportsAnalysisPage/ReportsAndAnalysis";
// import HelpAndSupport from "./pages/HelpAndSupport";
// import Login from "./pages/loginPage/LoginPage";
// import ProtectedRoute from "./components/ProtectedRoute";  // Import ProtectedRoute component
// import './styles/scrollbar.css';

// const App = () => {
//   useEffect(() => {
//     // Set the app element for Modal to avoid the warning
//     Modal.setAppElement('#root');
//   }, []);

//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// };

// const AppContent = () => {
//   const location = useLocation(); // Get the current location

//   // Conditionally render the Navbar based on the route
//   const showNavbar = location.pathname !== "/login";

//   return (
//     <>
//       {showNavbar && <Navbar />} {/* Render Navbar only if showNavbar is true */}
//       <main className={showNavbar ? "pt-20 px-4" : ""}> {/* Adjust padding if Navbar is not shown */}
//         <Routes>
//           <Route path="/login" element={<Login />} />  {/* Login Page */}
//           <Route path="/" element={<ProtectedRoute><ReportsAndAnalysis /></ProtectedRoute>} />  {/* Default route loads Dashboard */}
//           <Route path="/dashboard" element={<ProtectedRoute><ReportsAndAnalysis  /></ProtectedRoute>} />  {/* Dashboard Page */}
//           <Route path="/reportsAndAnalysis" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />  {/* Reports & Analysis Page */}
//           <Route path="/mapPage" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />  {/* Map Page */}
//           <Route path="/helpAndSupport" element={<ProtectedRoute><HelpAndSupport /></ProtectedRoute>} />  {/* Help & Support */}
//         </Routes>
//       </main>
//     </>
//   );
// };

// export default App;
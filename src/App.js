import React, { useEffect, useCallback, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore"; // Import Firestore functions
import { db } from "./firebaseConfig"; // Import Firestore instance
import Navbar from "./components/Navbar";
import Dashboard from "./pages/dashboardPage/Dashboard";
import MapPage from "./pages/MapPage/MapPage";
import Modal from "react-modal";
import ReportsAndAnalysis from "./pages/reportsAnalysisPage/ReportsAndAnalysis";
import HelpAndSupport from "./pages/HelpAndSupport";
import Login from "./pages/loginPage/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { PermissionsProvider, usePermissions } from "./context/PermissionsContext";
import { NotificationsProvider, useNotifications } from "./context/NotificationsContext";
import "./styles/scrollbar.css";
import { TicketsProvider } from "./context/TicketsContext";
import { filterUnreadTickets } from "./utils/ticketFilters"; // Import the filtering function

const App = () => {
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <Router>
      <PermissionsProvider>
        <NotificationsProvider>
          <TicketsProvider>
            <AppContent />
          </TicketsProvider>
        </NotificationsProvider>
      </PermissionsProvider>
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { newTickets, setNewTickets } = useNotifications();
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;

  // Fetch tickets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Use filterUnreadTickets instead of duplicating the logic
      const filteredTickets = filterUnreadTickets(tickets, role);
      setNewTickets(filteredTickets); // Pass the filtered tickets to Navbar
    });

    return () => unsubscribe();
  }, [role, setNewTickets]);

  const updateTicketAsRead = useCallback(
    async (ticketId, role) => {
      try {
        const ticketRef = doc(db, "complaints", ticketId);
        await setDoc(
          ticketRef,
          {
            isRead: {
              admin: role === 'admin' ? true : false,
              operator: role === 'operator' ? true : false,
              supervisorC: role === 'supervisorC' ? true : false,
              bU_adminC: role === 'bU_adminC' ? true : false, // Add bU_adminC to isRead
            }
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating ticket:", error);
      }
    },
    []
  );

  const showNavbar = location.pathname !== "/login";

  return (
    <>
      {showNavbar && (
        <Navbar
          unreadTickets={newTickets}
          updateTicketAsRead={updateTicketAsRead}
          submissionsCount={submissionsCount}
        />
      )}
      <main className={showNavbar ? "pt-20 px-4" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard 
                  setNewTickets={setNewTickets}
                  updateTicketAsRead={updateTicketAsRead}
                  setSubmissionsCount={setSubmissionsCount}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard 
                  setNewTickets={setNewTickets}
                  setSubmissionsCount={setSubmissionsCount}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportsAndAnalysis"
            element={
              <ProtectedRoute>
                <ReportsAndAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapPage"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/helpAndSupport"
            element={
              <ProtectedRoute>
                <HelpAndSupport />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
};

export default App;
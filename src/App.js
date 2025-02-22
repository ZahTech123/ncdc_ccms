import React, { useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "./firebaseConfig"; // Import Firestore instance
import Navbar from "./components/Navbar";
import Dashboard from "./pages/dashboardPage/Dashboard";
import MapPage from "./pages/MapPage/MapPage";
import Modal from "react-modal";
import ReportsAndAnalysis from "./pages/reportsAnalysisPage/ReportsAndAnalysis";
import HelpAndSupport from "./pages/HelpAndSupport";
import Login from "./pages/loginPage/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { PermissionsProvider } from "./context/PermissionsContext";
import { NotificationsProvider, useNotifications } from "./context/NotificationsContext";
import "./styles/scrollbar.css";

const App = () => {
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <Router>
      <PermissionsProvider>
        <NotificationsProvider>
          <AppContent />
        </NotificationsProvider>
      </PermissionsProvider>
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { newTickets, setNewTickets, clearNotifications } = useNotifications(); // Destructure clearNotifications

  // Define updateTicketAsRead function
  const updateTicketAsRead = useCallback(async (ticketId) => {
    try {
      // Log the ticket before updating
      const ticketBeforeUpdate = newTickets.find((ticket) => ticket.id === ticketId);
      console.log("Before Update - Ticket:", ticketBeforeUpdate);

      // Update Firestore
      const ticketRef = doc(db, "complaints", ticketId);
      await setDoc(
        ticketRef,
        {
          isRead: true,
          closedTime: new Date().toLocaleTimeString(), // Update closedTime
        },
        { merge: true }
      );

      // Log Firestore update
      console.log(`Firestore updated for ticket ${ticketId}`);

      // Update local state
      setNewTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                isRead: true,
                closedTime: new Date().toLocaleTimeString(), // Update closedTime
              }
            : ticket
        )
      );

      // Log the ticket after updating
      const ticketAfterUpdate = newTickets.find((ticket) => ticket.id === ticketId);
      console.log("After Update - Ticket:", ticketAfterUpdate);

      console.log(`Ticket ${ticketId} marked as read.`);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  }, [newTickets, setNewTickets]);

  // Log newTickets whenever it changes
  useEffect(() => {
    console.log("newTickets in App.js:", newTickets);
  }, [newTickets]);

  // Log clearNotifications to confirm it's being passed correctly
  useEffect(() => {
    console.log("clearNotifications function in App.js:", clearNotifications);
  }, [clearNotifications]);

  const showNavbar = location.pathname !== "/login";

  return (
    <>
      {showNavbar && (
        <Navbar
          unreadTickets={newTickets} // Pass unreadTickets
          clearNotifications={clearNotifications} // Pass clearNotifications
          updateTicketAsRead={updateTicketAsRead} // Pass updateTicketAsRead
        />
      )}
      <main className={showNavbar ? "pt-20 px-4" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard setNewTickets={setNewTickets} updateTicketAsRead={updateTicketAsRead} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard setNewTickets={setNewTickets} updateTicketAsRead={updateTicketAsRead} />
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
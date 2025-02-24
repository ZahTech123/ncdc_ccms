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

  useEffect(() => {
    console.log("User:", role);
  }, [role]);

  // Fetch tickets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter tickets based on role
      const filteredTickets = tickets.filter((ticket) => {
        if (role === "bU_adminC") {
          // For bU_adminC, show only Compliance and Verified tickets that are unread
          return (
            ticket.directorate === "Compliance" &&
            ticket.status === "Verified" &&
            ticket.isRead?.bU_adminC === false // Ensure isRead for bU_adminC is false
          );
        } else {
          // For other roles, use the default filtering logic (based on isRead)
          if (typeof ticket.isRead === 'object' && ticket.isRead !== null) {
            return !ticket.isRead[role]; // Return true if the ticket is unread for the current role
          }
          return !ticket.isRead; // Fallback for boolean isRead
        }
      });

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

  useEffect(() => {
    console.log("newTickets in App.js:", newTickets);
  }, [newTickets]);

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
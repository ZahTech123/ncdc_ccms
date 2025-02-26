import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

export const TicketsContext = createContext();

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]); // Store filtered tickets
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Store user role

  // Fetch tickets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const ticketData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTickets(ticketData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to filter tickets based on role
  const applyRoleFilter = (tickets, role) => {
    if (!role) return tickets; // If no role is set, return all tickets

    // Roles that have full access (no filtering)
    const fullAccessRoles = ["admin", "operator", "supervisorC"];
    if (fullAccessRoles.includes(role)) {
      console.log(`Role ${role} has full access. Returning all tickets.`);
      return tickets;
    }

    // Define filtering conditions for specific roles
    const roleFilters = {
      Compliance: ["bU_adminC", "bU_supervisorC", "bU_managerC", "bU_directorC"],
      "Sustainability & Lifestyle": [
        "bU_adminS&L",
        "bU_supervisorS&L",
        "bU_managerS&L",
        "bU_directorCS&L",
      ],
      "City Planning & Infrastructure": [
        "bU_adminCPI",
        "bU_supervisorCPI",
        "bU_managerCPI",
        "bU_directorCPI",
      ],
    };

    // Find the directorate that matches the user's role
    for (const [directorate, roles] of Object.entries(roleFilters)) {
      if (roles.includes(role)) {
        // Special condition for bU_supervisorC
        if (role === "bU_supervisorC") {
          const filteredTickets = tickets.filter(
            (ticket) =>
              ticket.directorate === directorate &&
              ticket.currentHandler === "Compliance Supervisor"
          );
          console.log(`Role ${role} filtered tickets:`, filteredTickets);
          return filteredTickets;
        }
        // Default filtering for other roles
        const filteredTickets = tickets.filter((ticket) => ticket.directorate === directorate);
        console.log(`Role ${role} filtered tickets:`, filteredTickets);
        return filteredTickets;
      }
    }

    console.log(`Role ${role} has no specific filtering. Returning all tickets.`);
    return tickets; // Default return all if no match found
  };

  // Apply filtering when tickets or userRole change
  useEffect(() => {
    setFilteredTickets(applyRoleFilter(tickets, userRole));
  }, [tickets, userRole]);

  // Update ticket in Firestore
  const updateTicket = useCallback(async (ticketId, updatedData) => {
    try {
      const ticketRef = doc(db, "complaints", ticketId);
      await setDoc(ticketRef, updatedData, { merge: true });

      // Update local state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updatedData } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  }, []);

  // Delete ticket from Firestore
  const deleteTicket = useCallback(async (ticketId) => {
    try {
      const ticketRef = doc(db, "complaints", ticketId);
      await deleteDoc(ticketRef);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }, []);

  return (
    <TicketsContext.Provider
      value={{ tickets, filteredTickets, loading, setUserRole, updateTicket, deleteTicket }}
    >
      {children}
    </TicketsContext.Provider>
  );
};

// Hook to use tickets context
export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketsProvider");
  }
  return context;
};

export default TicketsProvider;

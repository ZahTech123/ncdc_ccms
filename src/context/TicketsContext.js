import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { PermissionsContext } from "./PermissionsContext"; // Import Permissions Context

export const TicketsContext = createContext();

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Access user role and name from PermissionsContext
  const { userPermissions } = useContext(PermissionsContext);
  const { role, name } = userPermissions || {}; // Using 'name' for the logged-in user's name

  // Log when user successfully logs in
  useEffect(() => {
    if (role) {
      console.log(
        `User ${name || "unknown"} with role ${role} logged in successfully.`
      );
    }
  }, [role, name]); // Logs when role or name changes

  console.log(
    `User ${name || "unknown"} with role ${role} logged in successfully.`
  );
  // Fetch tickets from Firestore
  useEffect(() => {
    console.log("Fetching tickets from Firestore...");
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const ticketData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Tickets fetched:", ticketData);
      setTickets(ticketData);
      setLoading(false);
    });

    return () => {
      console.log("Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, []);

  // Function to filter tickets based on role
  // Function to filter tickets based on role
  const applyRoleFilter = (tickets, role) => {
    if (!role) {
      console.error("Role is undefined. Cannot filter tickets.");
      return tickets;
    }

    // Roles that have full access to all tickets
    const fullAccessRoles = ["admin", "operator", "supervisorC"];
    if (fullAccessRoles.includes(role)) {
      console.log("User has full access. Returning all tickets.");
      return tickets;
    }

    // Role-specific filtering logic
    if (role === "bU_supervisorC") {
      console.log("User is a Compliance Supervisor. Filtering tickets.");
      return tickets.filter(
        (ticket) =>
          ticket.directorate === "Compliance" &&
          ticket.currentHandler === "Compliance Supervisor"
      );
    }

    if (role === "bU_managerC") {
      console.log("User is a Compliance Manager. Filtering tickets.");
      return tickets.filter(
        (ticket) =>
          ticket.directorate === "Compliance" &&
          ticket.currentHandler === "Compliance Manager"
      );
    }

    if (role === "bU_directorC") {
      console.log("User is a Compliance Director. Filtering tickets.");
      return tickets.filter(
        (ticket) =>
          ticket.directorate === "Compliance" &&
          ticket.currentHandler === "Compliance Director"
      );
    }

    // Default filtering for other roles
    const roleFilters = {
      Compliance: ["bU_adminC"],
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

    for (const [directorate, roles] of Object.entries(roleFilters)) {
      if (roles.includes(role)) {
        console.log(
          `User role matches directorate ${directorate}. Filtering tickets.`
        );
        return tickets.filter((ticket) => ticket.directorate === directorate);
      }
    }

    console.log("No matching role found. Returning all tickets.");
    return tickets;
  };

  // Apply filtering when tickets or role change
  useEffect(() => {
    if (!role) {
      console.log("Role is undefined. Showing all tickets.");
      setFilteredTickets(tickets);
      return;
    }

    const filtered = applyRoleFilter(tickets, role);
    setFilteredTickets(filtered);
  }, [tickets, role]);

  // Update ticket in Firestore
  const updateTicket = useCallback(async (ticketId, updatedData) => {
    try {
      console.log("Updating ticket:", ticketId, "with data:", updatedData);
      const ticketRef = doc(db, "complaints", ticketId);
      await setDoc(ticketRef, updatedData, { merge: true });

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updatedData } : ticket
        )
      );
      console.log("Ticket updated successfully.");
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  }, []);

  // Delete ticket from Firestore
  const deleteTicket = useCallback(async (ticketId) => {
    try {
      console.log("Deleting ticket:", ticketId);
      const ticketRef = doc(db, "complaints", ticketId);
      await deleteDoc(ticketRef);
      console.log("Ticket deleted successfully.");
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }, []);

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        filteredTickets,
        loading,
        role,
        updateTicket,
        deleteTicket,
      }}
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

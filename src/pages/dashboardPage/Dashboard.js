import React, { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../firebaseConfig"; // Firestore instance
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore"; // Import deleteDoc
import TicketForm from "./TicketForm";
import EditModal from "./EditModal"; // Import the EditModal component
import TicketTracker from "./TicketTracker";
import "../../styles/tableCollapsAnimation.css"; // Import the CSS file
import TicketTable from "./TicketTable"; // Import the new TicketTable component
import { usePermissions } from "../../context/PermissionsContext";
import emailjs from "emailjs-com";
import NotificationModal from "../../components/NotificationModal"; // Import the NotificationModal component

// Initialize EmailJS with your Public Key
emailjs.init("SimW6urql2il_yFhB"); // Replace with your Public Key

const Dashboard = ({ onSubmit, setNewTickets, updateTicketAsRead }) => {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Separate states for each modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // State for selected ticket
  const [selectedTicket, setSelectedTicket] = useState(null);

  // State for expanded view
  const [isExpanded, setIsExpanded] = useState(false);

  const { userPermissions } = usePermissions();

  // Fetch real-time updates from Firestore and filter based on user role
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const ticketData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter tickets based on user role
      const filteredTickets = ticketData.filter((ticket) => {
        if (userPermissions.role === "bU_C_admin") {
          return ticket.directorate === "Compliance"; // Only show Compliance tickets for bU_C_admin
        }
        return true; // Show all tickets for other roles
      });

      setTickets(filteredTickets); // Set the filtered tickets to state
    });

    return () => unsubscribe();
  }, [userPermissions.role]); // Add userPermissions.role as a dependency

  // Memoize filtered tickets (only for status, issueType, and keyword search)
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
      const matchesIssueType = issueTypeFilter ? ticket.issueType === issueTypeFilter : true;
      const matchesKeyword = keywordSearch
        ? Object.values(ticket).some((value) =>
            String(value).toLowerCase().includes(keywordSearch.toLowerCase())
          )
        : true;

      return matchesStatus && matchesIssueType && matchesKeyword;
    });
  }, [tickets, statusFilter, issueTypeFilter, keywordSearch]);

  // Memoize unread tickets
  const unreadTickets = useMemo(() => tickets.filter((ticket) => !ticket.isRead), [tickets]);

  // Monitor tickets for pending status and operator handler
  useEffect(() => {
    const timers = tickets
      .filter((ticket) => ticket.currentHandler === "operator" && ticket.status === "pending")
      .map((ticket) => {
        return setTimeout(async () => {
          // Send email
          try {
            await emailjs.send("service_jlnl89i", "template_gohitig", {
              to_email: "Heni.sarwom@qrfpng.com",
              recipient_name: "Recipient Name",
              ticket_id: ticket.id,
              issue_type: ticket.issueType,
              status: ticket.status,
              date_submitted: ticket.dateSubmitted,
              location: ticket.suburb,
              assigned_to: ticket.team,
              priority: ticket.priority,
              resolution_progress: "Initial Status",
              escalation_info: "N/A",
              completion_date: "N/A",
              resident_feedback: "N/A",
              electorate: ticket.electorate,
              coordinates: `${ticket.latitude}, ${ticket.longitude}`,
              description: ticket.description,
              contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg",
            });
            console.log("Email sent successfully");
          } catch (error) {
            console.error("Failed to send email:", error);
          }

          // Update ticket data
          const updatedData = {
            currentHandler: "Supervisor",
            description: `${ticket.description}\nOperator | ${new Date().toLocaleString()} | Overdue | Ticket overdue - Forwarded to Supervisor`,
            status: "Overdue",
          };

          const ticketRef = doc(db, "complaints", ticket.id);
          await setDoc(ticketRef, updatedData, { merge: true });

          // Update local state
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              t.id === ticket.id ? { ...t, ...updatedData } : t
            )
          );
        }, 24000); // 24 seconds
      });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [tickets]);

  // Update search suggestions based on keyword search
  useEffect(() => {
    if (keywordSearch) {
      const suggestions = filteredTickets
        .filter((ticket) =>
          Object.values(ticket).some((value) =>
            String(value).toLowerCase().includes(keywordSearch.toLowerCase())
          )
        )
        .map((ticket) => ticket.description);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [keywordSearch, filteredTickets]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setStatusFilter("");
    setIssueTypeFilter("");
    setKeywordSearch("");
  }, []);

  // Log new ticket to Firestore
  const logToComplaints = useCallback(async (ticket) => {
    const ticketId = `ticketId_${new Date().getTime()}`;
    const ticketWithId = { ...ticket, id: ticketId, isRead: false }; // Initialize isRead to false

    const complaintsRef = doc(db, "complaints", ticketId);

    try {
      await setDoc(complaintsRef, ticketWithId, { merge: true });
      console.log(`Logged/Updated ticket ${ticketId} in complaints collection`);
    } catch (error) {
      console.error("Error logging to complaints collection:", error);
    }
  }, []);

  // Handle edit button click
  const handleEditClick = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true); // Open the EditModal
  }, []);

  // Handle ticket tracker button click
  const handleTicketTrackerClick = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setIsTrackerModalOpen(true); // Open the TicketTracker modal
  }, []);

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    setIsEditModalOpen(false);
    setIsTrackerModalOpen(false);
    setIsNotificationModalOpen(false);
    setSelectedTicket(null); // Reset the selected ticket
  }, []);

  // Handle saving updated ticket data
  const handleSave = useCallback(async (ticketId, updatedData) => {
    try {
      // Update Firebase
      const ticketRef = doc(db, "complaints", ticketId);
      await setDoc(ticketRef, updatedData, { merge: true });

      // Update local state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updatedData } : ticket
        )
      );

      console.log("Ticket updated successfully!");
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  }, []);

  // Handle deleting a ticket
  const handleDelete = useCallback(async (ticketId) => {
    try {
      const ticketRef = doc(db, "complaints", ticketId);
      await deleteDoc(ticketRef); // Delete the document from Firestore

      // Update local state by removing the deleted ticket
      setTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket.id !== ticketId)
      );

      console.log("Ticket deleted successfully!");
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }, []);

  // Determine if the form should be visible based on the user's role
  const isFormVisible = userPermissions.role === "admin" || userPermissions.role === "operator";

  // Pass unreadTickets to App.js
  useEffect(() => {
    if (setNewTickets) {
      console.log("Calling setNewTickets with:", unreadTickets); // Debug log
      setNewTickets(unreadTickets);
    }
  }, [unreadTickets, setNewTickets]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section - Ticket Table */}
        <TicketTable
          filteredTickets={filteredTickets}
          handleEditClick={handleEditClick}
          handleTicketTrackerClick={handleTicketTrackerClick}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          issueTypeFilter={issueTypeFilter}
          setIssueTypeFilter={setIssueTypeFilter}
          keywordSearch={keywordSearch}
          setKeywordSearch={setKeywordSearch}
          searchSuggestions={searchSuggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          resetFilters={resetFilters}
          isFormVisible={isFormVisible}
        />

        {/* Right Section - Create Ticket Form */}
        {isFormVisible && (
          <div
            className={`ticket-form-container ${
              isExpanded ? "ticket-form-collapsed" : "ticket-form-expanded"
            } bg-gray-800 rounded-lg space-y-6`}
          >
            {!isExpanded && (
              <div className="p-6">
                <div className="text-lg font-semibold slide-down" style={{ animationDelay: "0.1s" }}>
                  Create New Ticket
                </div>
                <TicketForm onSubmit={logToComplaints} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditModal
          ticket={selectedTicket}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Ticket Tracker Modal */}
      {isTrackerModalOpen && (
        <TicketTracker
          ticket={selectedTicket}
          onClose={handleCloseModal}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={async () => {
          console.log("Closing modal and marking tickets as read...");

          // Mark all unread tickets as read
          for (const ticket of unreadTickets) {
            console.log(`Marking ticket ${ticket.id} as read...`);
            await updateTicketAsRead(ticket.id); // Await each update
          }

          // Close the modal
          setIsNotificationModalOpen(false);

          // Clear notifications after all tickets are marked as read
          if (setNewTickets) {
            setNewTickets([]); // Clear the newTickets array
          }
        }}
        newTickets={unreadTickets} // Pass unread tickets
      />
    </div>
  );
};

export default Dashboard;
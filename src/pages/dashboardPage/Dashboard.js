import React, { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../../firebaseConfig"; // Keep only the db import
import { doc, setDoc } from "firebase/firestore"; // Keep only what's needed
import TicketForm from "./TicketForm";
import TicketTracker from "./TicketTracker";
import "../../styles/tableCollapsAnimation.css"; // Import the CSS file
import TicketTable from "./TicketTable"; // Import the new TicketTable component
import { usePermissions } from "../../context/PermissionsContext";
import emailjs from "emailjs-com";
import NotificationModal from "../../components/NotificationModal"; // Import the NotificationModal component
import { useTickets } from "../../context/TicketsContext";
import { filterTickets, filterUnreadTickets } from "../../utils/ticketFilters"; // Import the filtering functions

// Initialize EmailJS with your Public Key
emailjs.init("SimW6urql2il_yFhB"); // Replace with your Public Key

const Dashboard = ({ onSubmit, setNewTickets, updateTicketAsRead, setSubmissionsCount }) => {
  const { tickets, updateTicket } = useTickets();
  const [statusFilter, setStatusFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Separate states for each modal
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // State for selected ticket
  const [selectedTicket, setSelectedTicket] = useState(null);

  // State for expanded view
  const [isExpanded, setIsExpanded] = useState(false);

  const { userPermissions } = usePermissions();
  const { role } = userPermissions;

  // Memoize filtered tickets (only for status, issueType, and keyword search)
  const filteredTickets = useMemo(() => {
    return filterTickets(tickets, statusFilter, issueTypeFilter, keywordSearch, role);
  }, [tickets, statusFilter, issueTypeFilter, keywordSearch, role]);

  // Update the unreadTickets memoization
  const unreadTickets = useMemo(() => {
    return filterUnreadTickets(tickets, role);
  }, [tickets, role]);

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

          // Update local state through context
          updateTicket(ticket.id, updatedData); // Use updateTicket from context instead of setTickets
        }, 24000); // 24 seconds
      });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [tickets, updateTicket]); // Add updateTicket to dependencies

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
    const ticketWithId = { 
      ...ticket, 
      id: ticketId,
      isRead: {
        admin: false,
        operator: false,
        supervisor: false
      }
    };

    // Update submissions count
    if (setSubmissionsCount) {
      setSubmissionsCount(prev => prev + 1);
    }

    // Add notification
    if (setNewTickets) {
      setNewTickets(prev => [...prev, ticketWithId]);
    }

    // Save to Firestore
    const complaintsRef = doc(db, "complaints", ticketId);
    await setDoc(complaintsRef, ticketWithId, { merge: true });
  }, [setNewTickets, setSubmissionsCount]);

  // Handle ticket tracker button click
  const handleDashboardTrackerClick = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setIsTrackerModalOpen(true);
  }, []);

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    setIsTrackerModalOpen(false);
    setIsNotificationModalOpen(false);
    setSelectedTicket(null); // Reset the selected ticket
  }, []);

  // Handle saving updated ticket data
  const handleDashboardSave = useCallback(async (ticketId, updatedData) => {
    try {
      console.log("handleDashboardSave called with:", ticketId, updatedData);
      await updateTicket(ticketId, updatedData);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  }, [updateTicket]);

  // Determine if the form should be visible based on the user's role
  const isFormVisible = role === "admin" || role === "operator";

  // Pass unreadTickets to App.js
  useEffect(() => {
    if (setNewTickets) {
      setNewTickets(unreadTickets);
    }
  }, [unreadTickets, setNewTickets]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section - Ticket Table */}
        <TicketTable
          filteredTickets={filteredTickets}
          handleTicketTrackerClick={handleDashboardTrackerClick}
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
          // Mark all unread tickets as read
          for (const ticket of unreadTickets) {
            await updateTicketAsRead(ticket.id);
          }
          setIsNotificationModalOpen(false);
          if (setNewTickets) {
            setNewTickets([]);
          }
        }}
        newTickets={unreadTickets}
        onSave={handleDashboardSave}
      />
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebaseConfig"; // Firestore instance
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore"; // Import deleteDoc
import TicketForm from "./TicketForm";
import EditModal from "./EditModal"; // Import the EditModal component
import TicketTracker from "./TicketTracker";
import "../../styles/tableCollapsAnimation.css"; // Import the CSS file
import TicketTable from "./TicketTable"; // Import the new TicketTable component
import { usePermissions } from "../../context/PermissionsContext";

const Dashboard = ({ onSubmit }) => {
  // State for tickets and filters
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // State for modal and selected ticket
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openModalType, setOpenModalType] = useState(null); // 'edit' or 'tracker'

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
  const resetFilters = () => {
    setStatusFilter("");
    setIssueTypeFilter("");
    setKeywordSearch("");
  };

  // Log new ticket to Firestore
  const logToComplaints = async (ticket) => {
    const ticketId = `ticketId_${new Date().getTime()}`;
    const ticketWithId = { ...ticket, id: ticketId };

    const complaintsRef = doc(db, "complaints", ticketId);

    try {
      await setDoc(complaintsRef, ticketWithId, { merge: true });
      console.log(`Logged/Updated ticket ${ticketId} in complaints collection`);

      // Notify the parent component (App.js) about the new ticket
      if (onSubmit) {
        onSubmit(ticketWithId);
      }
    } catch (error) {
      console.error("Error logging to complaints collection:", error);
    }
  };

  // Handle edit button click
  const handleEditClick = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModalType("edit");
    setIsModalOpen(true);
  };

  // Handle ticket tracker button click
  const handleTicketTrackerClick = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModalType("tracker");
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOpenModalType(null); // Reset the modal type
  };

  // Handle saving updated ticket data
  const handleSave = async (ticketId, updatedData) => {
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
  };

  // Handle deleting a ticket
  const handleDelete = async (ticketId) => {
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
  };

  // Determine if the form should be visible based on the user's role
  const isFormVisible = userPermissions.role === "admin" || userPermissions.role === "operator";

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
      {isModalOpen && openModalType === "edit" && (
        <EditModal
          ticket={selectedTicket}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
          z-30
        />
      )}

      {/* Ticket Tracker Modal */}
      {isModalOpen && openModalType === "tracker" && (
        <TicketTracker
          ticket={selectedTicket}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
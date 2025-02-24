import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import EditModal from "../pages/dashboardPage/EditModal"; // Import the EditModal component
import "./Navbar.css";
import "../styles/scrollbar.css"; // Import the custom scrollbar styles
import { usePermissions } from "../context/PermissionsContext"; // Import the usePermissions hook
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebaseConfig"; // Import Firestore instance

const NotificationModal = ({ isOpen, onClose, newTickets = [], updateTicketAsRead, onSave }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to manage EditModal visibility
  const [selectedTicket, setSelectedTicket] = useState(null); // State to store the selected ticket for editing
  const { userPermissions } = usePermissions(); // Get user permissions
  const { role } = userPermissions; // Extract role

  // Define clearNotifications locally
  const clearNotifications = () => {
    console.log("Notifications cleared.");
    // Add any additional logic here if needed
  };

  useEffect(() => {
    if (isOpen) {
      console.log("We are in the modal page. Testing tickets and their boolean values:");
      newTickets.forEach((ticket) => {
        console.log(
          `Ticket ID: ${ticket.id}, isRead: ${JSON.stringify(ticket.isRead)}, Type of isRead: ${typeof ticket.isRead}`
        );
      });

      // Log the role and tickets data
      console.log("User Role:", role);
      console.log("Tickets Data:", newTickets);
    }
  }, [isOpen, newTickets, role]);

  const sortedTickets = newTickets
  .filter((ticket) => {
    // Check if the current role is bU_adminC
    if (role === "bU_adminC") {
      // Filter tickets where directorate is "Compliance" and status is "Verified"
      return (
        ticket.directorate === "Compliance" &&
        ticket.status === "Verified"
      );
    }

    // For other roles, use the existing filtering logic
    if (typeof ticket.isRead === 'object' && ticket.isRead !== null) {
      return !ticket.isRead[role]; // Return true if the ticket is unread for the current role
    }
    return !ticket.isRead; // Fallback for boolean isRead
  })
  .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted)); // Sort by date

  // Function to parse the description into its components
  const parseDescription = (description) => {
    const [operator, , status, comment] = description.split(" | "); // Remove unused 'date' variable
    return { operator, status, comment };
  };

  // Function to handle verify button click
  const handleVerifyClick = (ticket) => {
    setSelectedTicket(ticket); // Set the selected ticket
    setIsEditModalOpen(true); // Open the EditModal (or perform verification logic)
  };

  // Function to handle deleting a ticket
  const handleDelete = async (ticketId) => {
    console.log("Deleting ticket:", ticketId);
    setIsEditModalOpen(false);
  };

  const handleClose = async () => {
    // Mark all tickets as read when closing the modal
    for (const ticket of newTickets) {
      try {
        const ticketRef = doc(db, "complaints", ticket.id);
        await setDoc(
          ticketRef,
          {
            isRead: {
              ...ticket.isRead, // Preserve existing values
              [role]: true // Update the current role's isRead to true
            }
          },
          { merge: true } // Merge with existing data
        );
        console.log(`Ticket ${ticket.id} marked as read for role: ${role}`);
      } catch (error) {
        console.error(`Error updating ticket ${ticket.id}:`, error);
      }
    }

    // Call clearNotifications
    clearNotifications();

    // Safely call onClose
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={handleClose} // Use handleClose instead of onClose directly
        contentLabel="Notifications"
        className="notification-modal-content"
        overlayClassName="notification-modal-overlay"
      >
        <div className="notification-modal-container">
          <div className="notification-modal-header">
            <h2 className="notification-modal-title">
              Notifications
            </h2>
            <button onClick={handleClose} className="notification-modal-close-button">
              &times;
            </button>
          </div>
          {/* Apply the custom-scrollbar class to the modal body */}
          <div className="notification-modal-body custom-scrollbar">
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket, index) => {
                const { operator, status, comment } = parseDescription(ticket.description);
                // Truncate the Ticket ID to 24 characters
                const truncatedTicketId = ticket.id.slice(0, 24);
                return (
                  <div key={ticket.id}>
                    <div className="notification-modal-item">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold mb-2">Ticket ID: {truncatedTicketId}</p>
                        {/* Conditionally render the Verify button */}
                        {(role === 'admin' || role === 'supervisorC') && (
                          <button
                            className="verify-button"
                            onClick={() => handleVerifyClick(ticket)}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                      {/* Current Handler and Status on the same line */}
                      <div className="flex justify-between items-center">
                        <span className="notification-modal-operator">
                          Current Handler: {operator}
                        </span>
                        <span className="notification-modal-status">
                          Status: {status}
                        </span>
                      </div>
                      {/* Comments */}
                      <p className="notification-modal-comment">{comment}</p>
                      {/* Date Submitted and Location */}
                      <div className="flex justify-between items-center">
                        <span className="notification-modal-date">
                          Date Submitted: {new Date(ticket.dateSubmitted).toLocaleString()}
                        </span>
                        <span className="notification-modal-date">
                          Location: {ticket.suburb}
                        </span>
                      </div>
                    </div>
                    {/* Add a separator line between notifications (except after the last one) */}
                    {index < sortedTickets.length - 1 && (
                      <hr className="notification-modal-divider" />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="notification-modal-empty">No new notifications.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {isEditModalOpen && selectedTicket && (
        <EditModal
          ticket={selectedTicket} // Pass the selected ticket to EditModal
          onClose={() => setIsEditModalOpen(false)} // Close EditModal
          onSave={onSave}  // Use the onSave prop from Dashboard.js
          onDelete={handleDelete} // Pass the delete handler
        />
      )}
    </>
  );
};

export default NotificationModal;
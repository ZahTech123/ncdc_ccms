import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import EditModal from "../pages/dashboardPage/EditModal"; // Import the EditModal component
import "./Navbar.css";
import "../styles/scrollbar.css"; // Import the custom scrollbar styles

const NotificationModal = ({ isOpen, onClose, newTickets = [] }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to manage EditModal visibility
  const [selectedTicket, setSelectedTicket] = useState(null); // State to store the selected ticket for editing

  useEffect(() => {
    if (isOpen) {
      console.log("We are in the modal page. Testing tickets and their boolean values:");
      newTickets.forEach((ticket) => {
        console.log(
          `Ticket ID: ${ticket.id}, isRead: ${ticket.isRead}, Type of isRead: ${typeof ticket.isRead}`
        );
      });
    }
  }, [isOpen, newTickets]);

  // Sort tickets by dateSubmitted in descending order (most recent first)
  const sortedTickets = newTickets
    .filter((ticket) => !ticket.isRead) // Filter unread tickets
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

  // Function to handle saving changes in the EditModal
  const handleSave = async (ticketId, updatedData) => {
    // Implement your save logic here (e.g., update Firestore)
    console.log("Saving changes for ticket:", ticketId, updatedData);
    // Close the EditModal after saving
    setIsEditModalOpen(false);
  };

  // Function to handle deleting a ticket
  const handleDelete = async (ticketId) => {
    // Implement your delete logic here (e.g., delete from Firestore)
    console.log("Deleting ticket:", ticketId);
    // Close the EditModal after deleting
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose} // Call onClose when the modal is closed
        contentLabel="Notifications"
        className="notification-modal-content"
        overlayClassName="notification-modal-overlay"
      >
        <div className="notification-modal-container">
          <div className="notification-modal-header">
            <h2 className="notification-modal-title">
              Notifications
            </h2>
            <button onClick={onClose} className="notification-modal-close-button">
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
                        {/* Verify Button */}
                        <button
                          className="verify-button"
                          onClick={() => handleVerifyClick(ticket)} // Trigger verification logic
                        >
                          Verify
                        </button>
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
          onSave={handleSave} // Pass the save handler
          onDelete={handleDelete} // Pass the delete handler
        />
      )}
    </>
  );
};

export default NotificationModal;
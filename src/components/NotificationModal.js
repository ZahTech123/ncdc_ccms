import React from "react";
import Modal from "react-modal";
import "./Navbar.css";

const NotificationModal = ({ isOpen, onClose, newTickets }) => {
  // Sort tickets by dateSubmitted (newest first)
  const sortedTickets = [...newTickets].sort((a, b) => {
    return new Date(b.dateSubmitted) - new Date(a.dateSubmitted);
  });

  // Helper function to extract the description text
  const extractDescription = (description) => {
    // Split the description by "|" and get the last part
    const parts = description.split("|");
    return parts[parts.length - 1].trim(); // Trim to remove extra spaces
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Notifications"
      className="notification-modal-content"
      overlayClassName="notification-modal-overlay"
    >
      <div className="notification-modal-container">
        <div className="notification-modal-header">
          <h2 className="notification-modal-title">Notifications</h2>
          <button
            onClick={onClose}
            className="notification-modal-close-button"
          >
            &times;
          </button>
        </div>
        <div className="notification-modal-body">
          {sortedTickets.length > 0 ? (
            sortedTickets.map((ticket, index) => (
              <div key={ticket.id} className="bg-gray-700 p-3 rounded-md mb-4">
                {/* Ticket ID (styled as a title) */}
                <p className="text-lg font-bold mb-2">
                  Ticket ID: {ticket.id} {/* Dynamic data */}
                </p>

                {/* Light opacity line under Ticket ID */}
                <hr className="border-gray-600 opacity-30 mb-3" />

                {/* Current Handler and Status on the same line */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">
                    Current Handler: {ticket.currentHandler} {/* Dynamic data */}
                  </span>
                  <span className="text-sm text-gray-400">
                    Status: {ticket.status} {/* Dynamic data */}
                  </span>
                </div>

                {/* Description (extract only the relevant part) */}
                <p className="text-sm mb-2">
                  {extractDescription(ticket.description)} {/* Dynamic data */}
                </p>

                {/* Submitted on and Location on the same line */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Submitted on: {new Date(ticket.dateSubmitted).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400">
                    Location: {ticket.suburb} {/* Dynamic data */}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="notification-modal-empty">No new notifications.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
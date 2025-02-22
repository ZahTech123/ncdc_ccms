import React, { useEffect } from "react";
import Modal from "react-modal";
import "./Navbar.css";

const NotificationModal = ({ isOpen, onClose, newTickets = [] }) => {
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

  const unreadTickets = newTickets.filter((ticket) => !ticket.isRead);

  return (
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
            {unreadTickets.length > 0 && (
              <span className="notification-badge">{unreadTickets.length}</span>
            )}
          </h2>
          <button onClick={onClose} className="notification-modal-close-button">
            &times;
          </button>
        </div>
        <div className="notification-modal-body">
          {unreadTickets.length > 0 ? (
            unreadTickets.map((ticket) => (
              <div key={ticket.id} className="notification-modal-item">
                <p className="text-lg font-bold mb-2">Ticket ID: {ticket.id}</p>
                <hr className="notification-modal-divider" />
                <p className="notification-modal-description">{ticket.description}</p>
                <div className="flex justify-between items-center">
                  <span className="notification-modal-date">
                    {new Date(ticket.dateSubmitted).toLocaleString()}
                  </span>
                  <span className="notification-modal-date">
                    Location: {ticket.suburb}
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
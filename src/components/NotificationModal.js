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

  // Define handleDropdownChange function
  const handleDropdownChange = (name, value) => {
    setSelectedTicket((prevTicket) => ({
      ...prevTicket,
      [name]: value,
    }));
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

  // Filter and sort tickets
  const sortedTickets = newTickets
    .filter((ticket) => {
      // Add safety check for isRead
      if (!ticket.isRead || typeof ticket.isRead !== 'object') {
        return true; // Treat as unread if isRead is missing or invalid
      }
      
      // Check if the current role is bU_adminC
      if (role === "bU_adminC") {
        return (
          ticket.directorate === "Compliance" &&
          ticket.status === "Verified"
        );
      }

      return !ticket.isRead[role]; // Return true if the ticket is unread for the current role
    })
    .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted)); // Sort by date in descending order (most recent first)

  // Ensure the most recent ticket is at the top
  if (sortedTickets.length > 0) {
    console.log("Most recent ticket:", sortedTickets[0]);
  }

  // Function to parse the description into its components
  const parseDescription = (description) => {
    if (!description) {
      return {
        handler: "Unknown",
        timestamp: "Unknown",
        status: "Unknown",
        comment: "No comment",
      };
    }

    // Split the description into individual entries
    const entries = description.split("|");

    // Group the entries into chunks of 4 (handler, timestamp, status, comment)
    const groupedEntries = [];
    for (let i = 0; i < entries.length; i += 4) {
      // Ensure we don't go out of bounds
      if (i + 3 < entries.length) {
        groupedEntries.push({
          handler: entries[i].trim(),
          timestamp: entries[i + 1].trim(),
          status: entries[i + 2].trim(),
          comment: entries[i + 3].trim(),
        });
      }
    }
    console.log("NotificationModal is rendering"); // Debugging
    // Find the most recent entry based on the timestamp
    let mostRecentEntry = groupedEntries[0]; // Default to the first entry
    for (const entry of groupedEntries) {
      if (new Date(entry.timestamp) > new Date(mostRecentEntry.timestamp)) {
        mostRecentEntry = entry;
      }
    }

    return mostRecentEntry;
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
        onRequestClose={handleClose}
        contentLabel="Notifications"
        className="notification-modal-content"
        overlayClassName="notification-modal-overlay"
      >
        <div className="notification-modal-container">
          <div className="notification-modal-header">
            <h2 className="notification-modal-title">Notifications</h2>
            <button onClick={handleClose} className="notification-modal-close-button">
              &times;
            </button>
          </div>
          <div className="notification-modal-body custom-scrollbar">
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket, index) => {
                const { handler, status, comment } = parseDescription(ticket.description);
                const truncatedTicketId = ticket.id.slice(0, 24);

                return (
                  <div key={ticket.ticketId}>
                    {index === 0 && (
                      <div className="most-recent-notification">
                        <strong>Most Recent Notification</strong>
                      </div>
                    )}
                    <div className="notification-modal-item">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold mb-2">Ticket ID: {truncatedTicketId}</p>
                        {/* Verify Button Logic */}
                        {(role === 'supervisorC' && ticket.status !== 'Verified') && (
                          <button
                            className="verify-button"
                            onClick={() => handleVerifyClick(ticket)}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="notification-modal-operator">
                           {handler}
                        </span>
                        <span className="notification-modal-status">
                          Status: {status}
                        </span>
                      </div>
                      <p className="notification-modal-comment">{comment}</p>
                      <div className="flex justify-between items-center">
                        <span className="notification-modal-date">
                          Date Submitted: {new Date(ticket.dateSubmitted).toLocaleString()}
                        </span>
                        <span className="notification-modal-date">
                          Location: {ticket.suburb}
                        </span>
                      </div>
                    </div>
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
          ticket={selectedTicket}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onSave} // Pass the onSave function here
          onDelete={handleDelete}
          onDropdownChange={handleDropdownChange}
        />
      )}
    </>
  );
};

export default NotificationModal;
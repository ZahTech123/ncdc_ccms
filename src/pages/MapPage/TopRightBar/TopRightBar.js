import React, { useState } from "react";
import { usePermissions } from "../../../context/PermissionsContext";
import { useNotifications } from "../../../context/NotificationsContext";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import { signOut } from "firebase/auth"; // Import signOut
const NavbarTopRight = ({
  toggleMapStyle,
  currentStyleIndex,
  toggleAllTabs,
  allTabsVisible,
  toggleStats,
  toggleFilters,
  isFiltersOpen,
  toggleSidebar,
  isSidebarOpen,
  toggleNotification,
}) => {
  const { userPermissions } = usePermissions();
  const { name, role } = userPermissions;
  const { newTickets, unreadCount } = useNotifications();

  // State for modals
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Function to toggle message modal
  const toggleMessageModal = () => {
    setIsMessageModalOpen(!isMessageModalOpen);
    if (isNotificationModalOpen) setIsNotificationModalOpen(false);
    if (isUserDropdownOpen) setIsUserDropdownOpen(false);
  };
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Logout successful
        console.log("User signed out successfully");
        setIsUserDropdownOpen(false); // Close the dropdown
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  // Function to toggle notification modal
  const handleNotificationClick = () => {
    setIsNotificationModalOpen(!isNotificationModalOpen);
    if (isMessageModalOpen) setIsMessageModalOpen(false);
    if (isUserDropdownOpen) setIsUserDropdownOpen(false);

    if (typeof toggleNotification === "function") {
      toggleNotification();
    }
  };

  // Function to toggle user dropdown
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    if (isMessageModalOpen) setIsMessageModalOpen(false);
    if (isNotificationModalOpen) setIsNotificationModalOpen(false);
  };

  // Calculate unread notifications for the current role
  const currentRoleUnreadCount = unreadCount[role] || 0;

  // Function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    for (const ticket of newTickets) {
      try {
        const ticketRef = doc(db, "complaints", ticket.id);
        await setDoc(
          ticketRef,
          {
            isRead: {
              ...ticket.isRead,
              [role]: true,
            },
          },
          { merge: true }
        );
        console.log(`Ticket ${ticket.id} marked as read for role: ${role}`);
      } catch (error) {
        console.error(`Error updating ticket ${ticket.id}:`, error);
      }
    }
  };

  // Filter and sort tickets
  const sortedTickets = newTickets
    .filter((ticket) => {
      if (!ticket.isRead || typeof ticket.isRead !== "object") {
        return true;
      }

      if (role === "bU_adminC") {
        return (
          ticket.directorate === "Compliance" &&
          ticket.status === "Verified"
        );
      }

      return !ticket.isRead[role];
    })
    .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted));

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

    const entries = description.split("|");
    const groupedEntries = [];
    for (let i = 0; i < entries.length; i += 4) {
      if (i + 3 < entries.length) {
        groupedEntries.push({
          handler: entries[i].trim(),
          timestamp: entries[i + 1].trim(),
          status: entries[i + 2].trim(),
          comment: entries[i + 3].trim(),
        });
      }
    }

    let mostRecentEntry = groupedEntries[0];
    for (const entry of groupedEntries) {
      if (new Date(entry.timestamp) > new Date(mostRecentEntry.timestamp)) {
        mostRecentEntry = entry;
      }
    }

    return mostRecentEntry;
  };

  // Function to get appropriate icon based on current style
  const renderMapIcon = () => {
    switch (currentStyleIndex) {
      case 0: // streets
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
        );
      case 1: // dark
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
          </svg>
        );
      case 2: // satellite
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Get button background color based on style
  const getButtonStyle = () => {
    switch (currentStyleIndex) {
      case 0: return "bg-white";
      case 1: return "bg-gray-800";
      case 2: return "bg-blue-800";
      default: return "bg-white";
    }
  };

  // Get icon color based on style
  const getIconColor = () => {
    return currentStyleIndex === 0 ? "text-gray-700" : "text-white";
  };

  // Get title based on style
  const getButtonTitle = () => {
    const titles = [
      "Switch to dark mode",
      "Switch to satellite view",
      "Switch to streets view"
    ];
    return titles[currentStyleIndex];
  };

  // Check if any tab is open to determine the toggle all button state
  const isAnyTabOpen = allTabsVisible || isFiltersOpen || isSidebarOpen;
  const toggleAllButtonTitle = isAnyTabOpen ? "Hide all tabs" : "Show all tabs";

  // Modal Component
  const Modal = ({ title, content, isOpen, onClose, position = "right-12" }) => {
    if (!isOpen) return null;

    return (
      <div className={`absolute top-16 ${position} z-50`}>
        <div className="bg-white rounded-lg shadow-lg border p-4 w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="text-center py-4">{content}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center bg-transparent">
      <div className="relative flex items-center space-x-4">
        {/* Map Switch Icon (Outside Navbar) */}
        <button
          onClick={toggleMapStyle}
          className={`w-12 h-12 rounded-full overflow-hidden border shadow-lg absolute -left-16 flex items-center justify-center ${getButtonStyle()}`}
          title={getButtonTitle()}
          aria-label={getButtonTitle()}
        >
          <span className={getIconColor()}>{renderMapIcon()}</span>
        </button>

        {/* Rest of the Navbar */}
        <div className="flex items-center space-x-4 bg-white shadow-md rounded-full px-6 py-3 pl-14">
          {/* Master Toggle Button */}
          <button
            onClick={toggleAllTabs}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900"
            title={toggleAllButtonTitle}
            aria-label={toggleAllButtonTitle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          </button>

          {/* Notification Bell with Badge */}
          <button
            className="relative"
            onClick={handleNotificationClick}
            aria-label="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405C18.835 14.21 19 13.105 19 12V8a7 7 0 10-14 0v4c0 1.105.165 2.21.405 3.595L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
              />
            </svg>
            {currentRoleUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {currentRoleUnreadCount}
              </span>
            )}
          </button>

          {/* Email Icon with Notification Badge */}
          <button
            className="relative"
            onClick={toggleMessageModal}
            aria-label="Messages"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l9 6 9-6M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              1
            </span>
          </button>

          {/* Profile Icon with User Name and Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={toggleUserDropdown}
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="white"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A4 4 0 018.914 15h6.172a4 4 0 013.793 2.804M12 11a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              </div>
              <span className="text-gray-500 font-medium">{name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  isUserDropdownOpen ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-700">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    handleLogout();
                    console.log("Logout clicked");
                    setIsUserDropdownOpen(false);
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Message Modal */}
      <Modal
        title="Messages"
        content={<p className="text-gray-700">Message icon was clicked!</p>}
        isOpen={isMessageModalOpen}
        onClose={toggleMessageModal}
        position="right-12"
      />

      {/* Render Notification Modal */}
      <Modal
        title="Notifications"
        content={
          <div className="text-left">
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket, index) => {
                const { handler, status, comment } = parseDescription(ticket.description);
                const truncatedTicketId = ticket.ticketId;

                return (
                  <div key={ticket.ticketId} className="mb-4 text-black">
                    {index === 0 && (
                      <div className="font-bold mb-2">Most Recent Notification</div>
                    )}
                    <div className="notification-modal-item">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold mb-2">Ticket ID: {truncatedTicketId}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="notification-modal-operator">
                          {handler}
                        </span>
                        <span className="notification-modal-status">
                          Status: {status}
                        </span>
                      </div>
                      <p className="text-gray">{comment}</p>
                      <div className="flex justify-between items-center">
                        <span className="notification-modal-date">
                          Date Submitted: {new Date(ticket.dateSubmitted).toLocaleString()}
                        </span>
                        <span className="notification-modal-date">
                          Location: {ticket.suburb}
                        </span>
                      </div>
                    </div>
                    {index < sortedTickets.length - 1 && <hr className="my-2" />}
                  </div>
                );
              })
            ) : (
              <p className="text-black">No new notifications.</p>
            )}
          </div>
        }
        isOpen={isNotificationModalOpen}
        onClose={() => {
          handleMarkAllAsRead();
          setIsNotificationModalOpen(false);
        }}
        position="right-20"
      />
    </div>
  );
};

export default NavbarTopRight;
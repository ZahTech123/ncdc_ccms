import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaQuestionCircle,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { LuTickets } from "react-icons/lu";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import NotificationModal from "./NotificationModal";
import { usePermissions } from "../context/PermissionsContext";
import "./Navbar.css";

const Navbar = ({ unreadTickets = [], clearNotifications, updateTicketAsRead }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { userPermissions } = usePermissions();
  const { role, user } = userPermissions;

  // Filter tickets based on role and isRead status
  const filteredTickets = unreadTickets.filter((ticket) => {
    return role === "supervisorC" && !ticket.isRead; // Only show if role is supervisorC and isRead is false
  });

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out successfully");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="nav-links">
          <img
            src="https://i.ibb.co/SD97QrHS/NCDC-Logo.png"
            alt="NCDC Logo"
            className="h-10 w-auto"
          />

          <NavLink to="/dashboard" className="nav-link">
            <LuTickets className="icon" /> Tickets
          </NavLink>

          <NavLink to="/reportsAndAnalysis" className="nav-link">
            <MdSpaceDashboard className="icon" /> Dashboard
          </NavLink>

          <NavLink to="/mapPage" className="nav-link">
            <FaMapMarkedAlt className="icon" /> Map Page
          </NavLink>

          <NavLink to="/helpAndSupport" className="nav-link">
            <FaQuestionCircle className="icon" /> Help/Support
          </NavLink>
        </div>

        <div className="right-section">
          <div className="user-info">
            {user && (
              <>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{role}</span>
              </>
            )}
          </div>

          <div
            className="notification-icon-container"
            onClick={toggleNotification}
          >
            <FaBell className="icon" />
            {filteredTickets.length > 0 && ( // Show badge only if there are filtered tickets
              <span className="notification-badge">{filteredTickets.length}</span>
            )}
          </div>

          <div className="user-icon-container" ref={dropdownRef}>
            <FaUserCircle
              className="icon cursor-pointer"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <p className="dropdown-email">{auth.currentUser?.email}</p>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={async () => {
          console.log("Closing modal and marking tickets as read...");

          // Mark all filtered tickets as read
          for (const ticket of filteredTickets) {
            console.log(`Marking ticket ${ticket.id} as read...`);
            await updateTicketAsRead(ticket.id); // Await each update
          }

          // Close the modal
          setIsNotificationOpen(false);

          // Clear notifications after all tickets are marked as read
          if (clearNotifications) {
            clearNotifications(); // Clear the newTickets array
          }
        }}
        newTickets={filteredTickets} // Pass filtered tickets
      />
    </>
  );
};

export default Navbar;
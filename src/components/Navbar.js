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
import { useNotifications } from "../context/NotificationsContext";
import "./Navbar.css";

const Navbar = ({
  unreadTickets = [],
  updateTicketAsRead,
  submissionsCount
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { userPermissions } = usePermissions();
  const { name } = userPermissions; // Use name instead of role
  const { unreadCount } = useNotifications();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotification = () => {
    if (unreadTickets.length > 0) {
      setIsNotificationOpen(true);
    }
  };

  const handleSave = async (ticketId) => {
    // Add your save logic here (e.g., update the ticket in Firestore)
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
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

  useEffect(() => {
  }, [unreadCount]);

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
          {/* Notification Icon */}
          <div className="notification-icon-container" onClick={toggleNotification}>
            <FaBell className="icon" />
            {unreadTickets.length > 0 && (
              <span className="notification-badge">
                {unreadTickets.length}
              </span>
            )}
          </div>

          {/* Vertical Separator */}
          <span className="separator">|</span>

          {/* User Icon and Name */}
          <div className="user-info">
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
            <span className="user-name">{name}</span> {/* Display name instead of role */}
          </div>
        </div>
      </nav>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => {
          setIsNotificationOpen(false);
        }}
        newTickets={unreadTickets}
        updateTicketAsRead={updateTicketAsRead}
        onSave={handleSave} 
      />
    </>
  );
};

export default Navbar;
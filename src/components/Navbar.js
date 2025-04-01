import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaQuestionCircle,
  FaBell,

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
  const { name, role } = userPermissions;
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
        setIsDropdownOpen(false);
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

          <NavLink to="/dashboard" className="nav-link bounce-effect">
            <LuTickets className="icon" /> Tickets
          </NavLink>

          <NavLink to="/reportsAndAnalysis" className="nav-link bounce-effect">
            <MdSpaceDashboard className="icon" /> Dashboard
          </NavLink>

          <NavLink to="/mapPage" className="nav-link bounce-effect">
            <FaMapMarkedAlt className="icon" /> Map Page
          </NavLink>

          <NavLink to="/helpAndSupport" className="nav-link bounce-effect">
            <FaQuestionCircle className="icon" /> Help/Support
          </NavLink>
        </div>

        <div className="right-section">
          {/* Notification Icon */}
          <div className="bounce-effect notification-icon-container" onClick={toggleNotification}>
            <FaBell className="icon" />
            {unreadTickets.length > 0 && (
              <span className="notification-badge">
                {unreadTickets.length}
              </span>
            )}
          </div>

          {/* Vertical Separator */}
          <span className="separator">|</span>

          {/* User Icon and Name - Updated to match the first component */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={toggleDropdown}
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
                  isDropdownOpen ? "transform rotate-180" : ""
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

            {/* User Dropdown Menu - Matching the first component */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-700">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
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
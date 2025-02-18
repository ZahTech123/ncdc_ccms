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
import "./Navbar.css";

const Navbar = ({ newTickets, clearNotifications }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the dropdown

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

  // Close dropdown when clicking outside
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
            <MdSpaceDashboard className="icon" /> Dashboard
          </NavLink>

          <NavLink to="/reportsAndAnalysis" className="nav-link">
            <LuTickets className="icon" /> Tickets
          </NavLink>

          <NavLink to="/mapPage" className="nav-link">
            <FaMapMarkedAlt className="icon" /> Map Page
          </NavLink>

          <NavLink to="/helpAndSupport" className="nav-link">
            <FaQuestionCircle className="icon" /> Help/Support
          </NavLink>
        </div>

        <div className="right-section">
          {/* Notification Icon Container */}
          <div className="notification-icon-container" onClick={toggleNotification}>
            <FaBell className="icon" />
            {newTickets.length > 0 && (
              <span className="notification-badge">{newTickets.length}</span>
            )}
          </div>

          {/* User Icon */}
          <div className="user-icon-container" ref={dropdownRef}>
            <FaUserCircle
              className="icon cursor-pointer"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-content">
                  <p className="dropdown-email">
                    {auth.currentUser?.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="logout-button"
                  >
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
        onClose={() => {
          setIsNotificationOpen(false);
          clearNotifications();
        }}
        newTickets={newTickets}
      />
    </>
  );
};

export default Navbar;
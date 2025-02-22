// src/context/NotificationsContext.js
import React, { createContext, useState, useContext } from "react";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [newTickets, setNewTickets] = useState([]);

  const clearNotifications = () => {
    setNewTickets([]);
  };

  return (
    <NotificationsContext.Provider value={{ newTickets, setNewTickets, clearNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [newTickets, setNewTickets] = useState([]);
  const [unreadCount, setUnreadCount] = useState({ admin: 0, operator: 0, supervisorC: 0 });

  const addNotification = useCallback((notification) => {
    setNewTickets(prev => [
      ...prev,
      {
        ...notification,
        isRead: {
          admin: false,
          operator: false,
          supervisorC: false,
          ...notification.isRead // Allow overriding if needed
        }
      }
    ]);
  }, []);

  const markAsRead = useCallback((ticketId, role) => {
    setNewTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              isRead: {
                ...ticket.isRead,
                [role]: true
              }
            }
          : ticket
      )
    );
  }, []);

  const clearNotificationsForRole = useCallback((role) => {
    setNewTickets(prev => 
      prev.map(ticket => ({
        ...ticket,
        isRead: {
          ...ticket.isRead,
          [role]: true
        }
      }))
    );
  }, []);

  useEffect(() => {
    const counts = {
      admin: newTickets.filter(ticket => ticket.isRead && !ticket.isRead.admin).length,
      operator: newTickets.filter(ticket => ticket.isRead && !ticket.isRead.operator).length,
      supervisorC: newTickets.filter(ticket => ticket.isRead && !ticket.isRead.supervisorC).length
    };
    setUnreadCount(counts);
  }, [newTickets]);

  return (
    <NotificationsContext.Provider 
      value={{ 
        newTickets, 
        setNewTickets,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotificationsForRole
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

export default NotificationsProvider;
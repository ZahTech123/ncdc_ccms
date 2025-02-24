import React from "react";

const UnreadTicketsContext = React.createContext({
  unreadTickets: [], // Default value
  setUnreadTickets: () => {}, // Placeholder function
});

export default UnreadTicketsContext;
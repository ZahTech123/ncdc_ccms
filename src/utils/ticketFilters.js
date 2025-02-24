// dataFilters.js

// Filter tickets based on status, issueType, keyword search, and role
export const filterTickets = (tickets, statusFilter, issueTypeFilter, keywordSearch, role) => {
    return tickets.filter((ticket) => {
      // Filter by directorate if role is bU_adminC
      const matchesDirectorate = role === "bU_adminC" ? 
        ticket.directorate === "Compliance" && ticket.status === "Verified" : 
        true;
      const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
      const matchesIssueType = issueTypeFilter ? ticket.issueType === issueTypeFilter : true;
      const matchesKeyword = keywordSearch
        ? Object.values(ticket).some((value) =>
            String(value).toLowerCase().includes(keywordSearch.toLowerCase())
        )
        : true;
  
      return matchesDirectorate && matchesStatus && matchesIssueType && matchesKeyword;
    });
  };
  
  // Filter unread tickets based on role
  export const filterUnreadTickets = (tickets, role) => {
    return tickets.filter(ticket => {
      // For bU_adminC, apply additional conditions
      if (role === "bU_adminC") {
        return (
          ticket.directorate === "Compliance" &&
          ticket.status === "Verified or" &&
          (!ticket.isRead || !ticket.isRead[role]) // Ensure the ticket is unread for bU_adminC
        );
      }
  
      // For other roles, use the default filtering logic (based on isRead)
      return !ticket.isRead || !ticket.isRead[role];
    });
  };
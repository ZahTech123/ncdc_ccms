// dataFilters.js

// Constants for reusable values
const RELEVANT_STATUSES = ["Verified", "In Progress", "Closed"];

// Mapping of roles to their respective directorates
const ROLE_DIRECTORATE_MAPPING = {
  bU_adminC: "Compliance",
  bU_supervisorC: "Compliance",
  bU_managerC: "Compliance",
  bU_directorC: "Compliance",
  bU_adminCPI: "City Planning & Infrastructure",
  bU_supervisorCPI: "City Planning & Infrastructure",
  bU_managerCPI: "City Planning & Infrastructure",
  bU_directorCPI: "City Planning & Infrastructure",
  bU_adminS_L: "Sustainability & Lifestyle",
  bU_supervisorS_L: "Sustainability & Lifestyle",
  bU_managerS_L: "Sustainability & Lifestyle",
  bU_directorS_L: "Sustainability & Lifestyle",
};

// Filter tickets based on status, issueType, keyword search, and role
export const filterTickets = (tickets, statusFilter, issueTypeFilter, keywordSearch, role) => {
  return tickets.filter((ticket) => {
    // Filter by directorate if role is bU_adminC
    const matchesDirectorate =
      role === "bU_adminC"
        ? ticket.directorate === "Compliance" && ticket.status === "Verified"
        : true;

    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesIssueType = !issueTypeFilter || ticket.issueType === issueTypeFilter;
    const matchesKeyword =
      !keywordSearch ||
      Object.values(ticket).some((value) =>
        String(value).toLowerCase().includes(keywordSearch.toLowerCase())
      );

    return matchesDirectorate && matchesStatus && matchesIssueType && matchesKeyword;
  });
};

// Filter unread tickets based on role
export const filterUnreadTickets = (tickets, role) => {
  return tickets.filter((ticket) => {
    const isUnread = !ticket.isRead || !ticket.isRead[role];

    // Check if the role has a specific directorate mapping
    if (ROLE_DIRECTORATE_MAPPING[role]) {
      const isComplianceDirectorate = ticket.directorate === ROLE_DIRECTORATE_MAPPING[role];
      const isRelevantStatus = RELEVANT_STATUSES.includes(ticket.status);

      return isComplianceDirectorate && isRelevantStatus && isUnread;
    }

    // Default unread filter for other roles
    return isUnread;
  });
};
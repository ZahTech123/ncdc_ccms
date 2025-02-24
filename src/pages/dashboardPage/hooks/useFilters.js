// useFilters.js
import { useMemo } from "react";

export const useFilters = (tickets, statusFilter, issueTypeFilter, keywordSearch) => {
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
      const matchesIssueType = issueTypeFilter ? ticket.issueType === issueTypeFilter : true;
      const matchesKeyword = keywordSearch
        ? Object.values(ticket).some((value) =>
            String(value).toLowerCase().includes(keywordSearch.toLowerCase())
          )
        : true;

      return matchesStatus && matchesIssueType && matchesKeyword;
    });
  }, [tickets, statusFilter, issueTypeFilter, keywordSearch]);

  return filteredTickets;
};
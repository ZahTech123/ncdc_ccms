import React from "react";
import { statusColors } from "../../styles/colors"; // Adjust the path as needed

const TicketSummary = ({ tickets, role }) => {
  // Calculate ticket counts
  const totalTickets = tickets.length;
  const newTickets = tickets.filter((t) => t.status === "New").length;
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved").length;
  const overdueTickets = tickets.filter((t) => t.status === "Overdue").length;
  const closedTickets = tickets.filter((t) => t.status === "Closed").length;
  const invalidTickets = tickets.filter((t) => t.status === "Invalid").length;
  const verifiedTickets = tickets.filter((t) => t.status === "Verified").length;

  // Create ticket status category with style
  const TicketCategory = ({ label, count, color }) => (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }}></span>
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <span className="text-sm font-bold" style={{ color: color }}>{count}</span>
    </div>
  );

  // Get total count color - keeping blue for total
  const totalColor = "#3B82F6"; // blue-400 equivalent

  return (
    <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap px-1">
      <TicketCategory label="Total" count={totalTickets} color={totalColor} />
      <TicketCategory label="New" count={newTickets} color={statusColors.New} />
      <TicketCategory label="In Progress" count={inProgressTickets} color={statusColors["In Progress"]} />
      <TicketCategory label="Resolved" count={resolvedTickets} color={statusColors.Resolved} />
      <TicketCategory label="Overdue" count={overdueTickets} color={statusColors.Overdue} />
      <TicketCategory label="Closed" count={closedTickets} color={statusColors.Closed} />
      <TicketCategory label="Verified" count={verifiedTickets} color={statusColors.Verified} />
      {(role === "admin" || role === "supervisor" || role === "operator" || role === "supervisorC") && (
        <TicketCategory label="Invalid" count={invalidTickets} color={statusColors.Invalid} />
      )}
    </div>
  );
};

export default TicketSummary;
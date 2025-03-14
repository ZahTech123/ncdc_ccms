import React from "react";

const TicketSummary = ({ tickets, role }) => {
  // Calculate ticket counts
  const totalTickets = tickets.length;
  const newTickets = tickets.filter((t) => t.status === "New").length;
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved").length;
  const overdueTickets = tickets.filter((t) => t.status === "Overdue").length;
  const closedTickets = tickets.filter((t) => t.status === "Closed").length;
  const invalidTickets = tickets.filter((t) => t.status === "Invalid").length;

  // Create ticket status category with style
  const TicketCategory = ({ label, count, color }) => (
    <div className="flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full bg-${color}`}></span>
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <span className={`text-sm font-bold text-${color}`}>{count}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap px-1">
      <TicketCategory label="Total" count={totalTickets} color="blue-400" />
      <TicketCategory label="New" count={newTickets} color="green-400" />
      <TicketCategory label="In Progress" count={inProgressTickets} color="yellow-500" />
      <TicketCategory label="Resolved" count={resolvedTickets} color="gray-500" />
      <TicketCategory label="Overdue" count={overdueTickets} color="red-400" />
      <TicketCategory label="Closed" count={closedTickets} color="pink-400" />
      {(role === "admin" || role === "supervisor" || role === "operator" || role === "supervisorC") && (
        <TicketCategory label="Invalid" count={invalidTickets} color="purple-400" />
      )}
    </div>
  );
};

export default TicketSummary;
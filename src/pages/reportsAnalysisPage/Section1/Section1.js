import React from "react";
import { usePermissions } from "../../../context/PermissionsContext";
import DonutChart from "./DonutChart"; // Import the DonutChart component
import CardsGrid from "./CardsGrid"; // Import the CardsGrid component
import Tables from "./Tables"; // Import the Tables component

const Section1 = ({ tickets = [] }) => {
  const { userPermissions } = usePermissions();
  const { role, name } = userPermissions; // Destructure name from userPermissions
  console.log("Section1 - Current user role:", role);
  console.log("Section1 - Current user name:", name); // Log the name for debugging

  const getLabels = (role) => {
    if (['bU_adminC', 'bU_supervisorC', 'bU_managerC', 'bU_directorC'].includes(role)) {
      return {
        totalTickets: "Liquor License",
        totalNew: "Building",
        totalInProgress: "Development Control & Physical Planning",
        totalResolved: "Enforcement",
        totalOverdue: "Total Overdue",
        totalHighPriority: "Total High Priority",
        totalMediumPriority: "Total Medium Priority",
        totalLowPriority: "Total Low Priority",
      };
    } else if (['bU_adminS_L', 'bU_supervisorS_L', 'bU_managerS_L', 'bU_directorS_L'].includes(role)) {
      return {
        totalTickets: "Urban Safety",
        totalNew: "Waste Management",
        totalInProgress: "Markets",
        totalResolved: "Parks & Gardens",
        totalOverdue: "Eda City Bus",
        totalHighPriority: "Total High Priority",
        totalMediumPriority: "Total Medium Priority",
        totalLowPriority: "Total Low Priority",
      };
    } else if (['bU_adminCPI', 'bU_supervisorCPI', 'bU_managerCPI', 'bU_directorCPI'].includes(role)) {
      return {
        totalTickets: "Streetlights & Traffic Management",
        totalNew: "Road Furniture & Road Signs",
        totalInProgress: "Potholes & Drainage",
        totalResolved: "Strategic Planning",
        totalOverdue: "Total Tickets", // Updated for CPI group
        totalHighPriority: "Total High Priority",
        totalMediumPriority: "Total Medium Priority",
        totalLowPriority: "Total Low Priority",
      };
    } else {
      return {
        totalTickets: "Total Tickets",
        totalNew: "Total New",
        totalInProgress: "Total In Progress",
        totalResolved: "Total Resolved",
        totalOverdue: "Total Overdue",
        totalHighPriority: "Total High Priority",
        totalMediumPriority: "Total Medium Priority",
        totalLowPriority: "Total Low Priority",
      };
    }
  };

  const labels = getLabels(role);

  const getTicketCounts = (tickets) => {
    const counts = {
      totalTickets: tickets.length,
      totalNew: tickets.filter(ticket => ticket.status === "New").length,
      totalInProgress: tickets.filter(ticket => ticket.status === "In Progress").length,
      totalResolved: tickets.filter(ticket => ticket.status === "Closed").length,
      totalOverdue: tickets.filter(ticket => ticket.status === "Overdue").length,
      totalHighPriority: tickets.filter(ticket => ticket.priority === "High").length,
      totalMediumPriority: tickets.filter(ticket => ticket.priority === "Medium").length,
      totalLowPriority: tickets.filter(ticket => ticket.priority === "Low").length,
    };

    if (['bU_adminCPI', 'bU_supervisorCPI', 'bU_managerCPI', 'bU_directorCPI'].includes(role)) {
      counts.totalTickets = tickets.filter(ticket => ticket.issueType === "Streetlights & Traffic Management").length;
      counts.totalNew = tickets.filter(ticket => ticket.issueType === "Road Furniture & Road Signs").length;
      counts.totalInProgress = tickets.filter(ticket => ticket.issueType === "Potholes & Drainage").length;
      counts.totalResolved = tickets.filter(ticket => ticket.issueType === "Strategic Planning").length;
      counts.totalOverdue = tickets.length; // Total Tickets for CPI group
    }

    return counts;
  };

  const ticketCounts = getTicketCounts(tickets);

  console.log("Section1 tickets:", tickets);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column */}
      <div className="lg:w-1/3">
        <DonutChart tickets={tickets} /> {/* Use the DonutChart component here */}
      </div>

      {/* Right Column */}
      <div className="lg:w-2/3">
        {/* Card Grid */}
        <CardsGrid tickets={tickets} role={role} name={name} /> {/* Pass name to CardsGrid */}

        {/* Complaint Ticket Summary */}
        <div className="bg-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Complaint Ticket Summary</h2>
          <Tables labels={labels} ticketCounts={ticketCounts} />
        </div>
      </div>
    </div>
  );
};

export default Section1;
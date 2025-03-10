import React from "react";
import { usePermissions } from "../../../context/PermissionsContext";
import DonutChart from "./DonutChart"; // Import the DonutChart component
import CardsGrid from "./CardsGrid"; // Import the CardsGrid component
import Tables from "./Tables"; // Import the Tables component
import "./section1.css";
const Section1 = ({ tickets = [] }) => {
  const { userPermissions } = usePermissions();
  const { role, name } = userPermissions;

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
        totalOverdue: "Total Overdue",
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
    let counts = {
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
      const cpiIssues = ["Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"];
      counts = {
        ...counts, // Keep the priority counts
        totalTickets: tickets.filter(ticket => ticket.issueType === "Streetlights & Traffic Management").length,
        totalNew: tickets.filter(ticket => ticket.issueType === "Road Furniture & Road Signs").length,
        totalInProgress: tickets.filter(ticket => ticket.issueType === "Potholes & Drainage").length,
        totalResolved: tickets.filter(ticket => ticket.issueType === "Strategic Planning").length,
        totalOverdue: tickets.filter(ticket => cpiIssues.includes(ticket.issueType) && ticket.status === "Overdue").length,
      };
    } 
    
    else if (['bU_adminC', 'bU_supervisorC', 'bU_managerC', 'bU_directorC'].includes(role)) {
      const communityIssues = ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"];
      counts = {
        ...counts, // Keep the priority counts
        totalTickets: tickets.filter(ticket => ticket.issueType === "Liquor License").length,
        totalNew: tickets.filter(ticket => ticket.issueType === "Building").length,
        totalInProgress: tickets.filter(ticket => ticket.issueType === "Development Control & Physical Planning").length,
        totalResolved: tickets.filter(ticket => ticket.issueType === "Enforcement").length,
        totalOverdue: tickets.filter(ticket => communityIssues.includes(ticket.issueType) && ticket.status === "Overdue").length,
      };
    } 
    
    else if (['bU_adminS_L', 'bU_supervisorS_L', 'bU_managerS_L', 'bU_directorS_L'].includes(role)) {
      const safetyIssues = ["Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus"];
      counts = {
        ...counts, // Keep the priority counts
        totalTickets: tickets.filter(ticket => ticket.issueType === "Urban Safety").length,
        totalNew: tickets.filter(ticket => ticket.issueType === "Waste Management").length,
        totalInProgress: tickets.filter(ticket => ticket.issueType === "Markets").length,
        totalResolved: tickets.filter(ticket => ticket.issueType === "Parks & Gardens").length,
        totalOverdue: tickets.filter(ticket => safetyIssues.includes(ticket.issueType) && ticket.status === "Overdue").length,
      };
    }
  
    return counts;
  };

  const ticketCounts = getTicketCounts(tickets);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column */}
      <div className="lg:w-1/3">
        <DonutChart tickets={tickets} role={role} name={name} /> {/* Use the DonutChart component here */}
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

import React from "react";
import { FaChartLine, FaUserTie, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

const CardsGrid = ({ tickets, role, name }) => {
  // Log the role and name props to confirm they're received correctly
  console.log("CardsGrid - Received role prop:", role);
  console.log("CardsGrid - Received name prop:", name);

  // Define valid roles for Card #1
  const validRoles = [
    "bU_supervisorC", "bU_managerC", "bU_directorC",
    "bU_supervisorS_L", "bU_managerS_L", "bU_directorS_L",
    "bU_supervisorCPI", "bU_managerCPI", "bU_directorCPI"
  ];

  // Card #1: Escalated Cases
  const escalatedCases = tickets.reduce((acc, ticket) => {
    return acc + ticket.previousHandlers.filter(handler => validRoles.includes(handler)).length;
  }, 0);

  // Card #2: Handler Escalations
  const handlerEscalations = tickets.filter(ticket => ticket.previousHandlers.includes(role)).length;

  // Logging for Card #2: Handler Escalations
  console.log("Card #2 - Handler Escalations Calculation:");
  console.log("Role being checked:", role);
  console.log("Name being checked:", name);
  console.log("Tickets with role in previousHandlers:", tickets.filter(ticket => ticket.previousHandlers.includes(role)));
  console.log("Handler Escalations Count:", handlerEscalations);

  // Card #3: Top Complaint
  const issueTypeCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.issueType] = (acc[ticket.issueType] || 0) + 1;
    return acc;
  }, {});

  const topIssueType = Object.entries(issueTypeCounts).sort((a, b) => b[1] - a[1])[0];

  // Shorten "Development Control & Physical Planning" to "DCPP"
  const formatIssueType = (issueType) => {
    return issueType === "Development Control & Physical Planning" 
      ? "DCPP" 
      : issueType;
  };

  const topComplaint = topIssueType
    ? `${formatIssueType(topIssueType[0])}: ${((topIssueType[1] / tickets.length) * 100).toFixed(0)}% of total tickets`
    : "No issues";

  // Card #4: Resolution Rate
  const resolvedTickets = tickets.filter(ticket => ticket.resolved).length;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">

      {[
        {
          icon: <FaChartLine />,
          title: (
            <span>
              Overall <br /> Escalations
            </span>
          ),
          subheading: "Team Focus",
          value: escalatedCases,
          badge: "↓ 10% from last week",
          description: "Total escalated complaints",
        },
        {
          icon: <FaUserTie />,
          title: (
            <span>
              Assigned <br /> Tickets
            </span>
          ),
          subheading: "User Focus",
          value: handlerEscalations,
          badge: `Current User: ${name}`, // Use name instead of role
          description: "Total tickets assigned to current User",
        },
        {
          icon: <FaExclamationCircle />,
          title: "Frequent Complaint",
          subheading: "Team Insight",
          value: topIssueType ? `${topIssueType[1]}` : "0", // Actual value
          badge: topComplaint, // Percentage value in badge
          description: "Most frequently reported complaint among all issue types.",
        },
        {
          icon: <FaCheckCircle />,
          title: "Total Resolutions", // Updated title
          subheading: "Team Performance",
          value: resolvedTickets, // Actual value (number of resolved tickets)
          badge: `↑ 5% from last month`, // Percentage value in badge
          description: "Total number of resolved tickets.", // Updated description
        },
      ].map((card, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-gray-600 to-gray-700 p-4 rounded-lg relative slide-up"
          style={{ animationDelay: `${0.1 + index * 0.2}s`, minHeight: "250px" }}
        >
          <span className="text-yellow-400 absolute top-4 right-4" style={{ fontSize: "3rem" }}>
            {card.icon}
          </span>
          <div className="text-sm text-gray-300">{card.subheading}</div>
          <div className="mt-10 pb-10">
            <div className="flex items-start text-white">
              <span className="text-5xl font-bold">{card.value}</span>
              <div className="ml-2">
                <div className="text-lg font-semibold">{card.title}</div>
              </div>
            </div>
          </div>
          {/* Description moved to bottom left */}
          <div className="absolute bottom-15 left-4 text-xs text-gray-400">
            {card.description}
          </div>
          <div className="absolute bottom-0 right-0 bg-yellow-500 text-black font-semibold p-2 rounded-md" style={{ fontSize: "12px" }}>
            {card.badge}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardsGrid;
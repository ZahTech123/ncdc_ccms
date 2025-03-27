import React, { useMemo } from "react";
import { useTickets } from "../../../context/TicketsContext";
import { usePermissions } from "../../../context/PermissionsContext";
import { filterTicketsRoles } from "../../../utils/ticketFilters";

const Tables = () => {
  const { filteredTickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;

  // Define labels and issue type mappings for each BU
  const getLabelsAndMappings = (role) => {
    // Compliance Directorate
    if (role.startsWith('bU_') && role.endsWith('C')) {
      return {
        labels: {
          totalTickets: "Liquor License",
          totalNew: "Building",
          totalInProgress: "Development Control",
          totalResolved: "Enforcement",
          totalOverdue: "Total Overdue",
          totalHighPriority: "Total High Priority",
          totalMediumPriority: "Total Medium Priority",
          totalLowPriority: "Total Low Priority",
        },
        issueTypeMappings: {
          totalTickets: "Liquor License",
          totalNew: "Building",
          totalInProgress: "Development Control & Physical Planning",
          totalResolved: "Enforcement"
        }
      };
    }
    // Sustainability & Lifestyle Directorate
    else if (role.startsWith('bU_') && role.endsWith('S_L')) {
      return {
        labels: {
          totalTickets: "Urban Safety",
          totalNew: "Waste Management",
          totalInProgress: "Markets",
          totalResolved: "Parks & Gardens",
          totalOverdue: "Eda City Bus",
          totalHighPriority: "Total High Priority",
          totalMediumPriority: "Total Medium Priority",
          totalLowPriority: "Total Low Priority",
        },
        issueTypeMappings: {
          totalTickets: "Urban Safety",
          totalNew: "Waste Management",
          totalInProgress: "Markets",
          totalResolved: "Parks & Gardens",
          totalOverdue: "Eda City Bus"
        }
      };
    }
    // City Planning & Infrastructure Directorate
    else if (role.startsWith('bU_') && role.endsWith('CPI')) {
      return {
        labels: {
          totalTickets: "Streetlights & Traffic",
          totalNew: "Road Furniture & Signs",
          totalInProgress: "Potholes & Drainage",
          totalResolved: "Strategic Planning",
          totalOverdue: "Total Overdue",
          totalHighPriority: "Total High Priority",
          totalMediumPriority: "Total Medium Priority",
          totalLowPriority: "Total Low Priority",
        },
        issueTypeMappings: {
          totalTickets: "Streetlights & Traffic Management",
          totalNew: "Road Furniture & Road Signs",
          totalInProgress: "Potholes & Drainage",
          totalResolved: "Strategic Planning"
        }
      };
    }
    // Default (non-BU roles)
    return {
      labels: {
        totalTickets: "Total Tickets",
        totalNew: "Total New",
        totalInProgress: "Total In Progress",
        totalResolved: "Total Resolved",
        totalOverdue: "Total Overdue",
        totalHighPriority: "Total High Priority",
        totalMediumPriority: "Total Medium Priority",
        totalLowPriority: "Total Low Priority",
      },
      issueTypeMappings: null // No specific issue type mapping for default roles
    };
  };

  const { labels, issueTypeMappings } = getLabelsAndMappings(role);

  // Define colors for each circle
  const colors = {
    gray600: "#4B5563",
    green500: "#10B981",
    amber500: "#F59E0B",
    blue500: "#3B82F6",
    red600: "#DC2626",
    orange600: "#EA580C",
    yellow500: "#EAB308",
    teal500: "#14B8A6",
  };

  // Apply role-based filtering
  const roleFilteredTickets = useMemo(() => {
    return filterTicketsRoles(filteredTickets, role);
  }, [filteredTickets, role]);

  // Calculate ticket counts based on filtered tickets
  const ticketCounts = useMemo(() => {
    if (!issueTypeMappings) {
      // Default counts for non-BU roles
      return {
        totalTickets: roleFilteredTickets.length,
        totalNew: roleFilteredTickets.filter(t => t.status === 'New').length,
        totalInProgress: roleFilteredTickets.filter(t => t.status === 'In Progress').length,
        totalResolved: roleFilteredTickets.filter(t => t.status === 'Resolved').length,
        totalOverdue: roleFilteredTickets.filter(t => t.status === 'Overdue').length,
        totalHighPriority: roleFilteredTickets.filter(t => t.priority === 'High').length,
        totalMediumPriority: roleFilteredTickets.filter(t => t.priority === 'Medium').length,
        totalLowPriority: roleFilteredTickets.filter(t => t.priority === 'Low').length,
      };
    }

    // BU-specific counts based on issue types
    return {
      totalTickets: roleFilteredTickets.filter(t => t.issueType === issueTypeMappings.totalTickets).length,
      totalNew: roleFilteredTickets.filter(t => t.issueType === issueTypeMappings.totalNew).length,
      totalInProgress: roleFilteredTickets.filter(t => t.issueType === issueTypeMappings.totalInProgress).length,
      totalResolved: roleFilteredTickets.filter(t => t.issueType === issueTypeMappings.totalResolved).length,
      totalOverdue: roleFilteredTickets.filter(t => (
        Object.values(issueTypeMappings).includes(t.issueType) && t.status === 'Overdue'
      )).length, // Fixed: Added missing closing parenthesis and removed erroneous closing bracket
      totalHighPriority: roleFilteredTickets.filter(t => t.priority === 'High').length,
      totalMediumPriority: roleFilteredTickets.filter(t => t.priority === 'Medium').length,
      totalLowPriority: roleFilteredTickets.filter(t => t.priority === 'Low').length,
    };
  }, [roleFilteredTickets, issueTypeMappings]);

  return (
    <div className="flex space-x-6">
      {/* Left Table */}
      <div className="flex-1">
        <table className="w-full table-auto text-sm">
          <tbody>
            {[
              { label: labels.totalTickets, value: ticketCounts.totalTickets, color: colors.gray600 },
              { label: labels.totalNew, value: ticketCounts.totalNew, color: colors.green500 },
              { label: labels.totalInProgress, value: ticketCounts.totalInProgress, color: colors.amber500 },
              { label: labels.totalResolved, value: ticketCounts.totalResolved, color: colors.blue500 },
            ].map((row, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="p-2 text-left">{row.label}</td>
                <td className="p-2 text-left">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      backgroundColor: row.color,
                      opacity: 0.7,
                      borderRadius: "50%",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {row.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Table */}
      <div className="flex-1">
        <table className="w-full table-auto text-sm">
          <tbody>
            {[
              { label: labels.totalOverdue, value: ticketCounts.totalOverdue, color: colors.red600 },
              { label: labels.totalHighPriority, value: ticketCounts.totalHighPriority, color: colors.orange600 },
              { label: labels.totalMediumPriority, value: ticketCounts.totalMediumPriority, color: colors.yellow500 },
              { label: labels.totalLowPriority, value: ticketCounts.totalLowPriority, color: colors.teal500 },
            ].map((row, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="p-2 text-left">{row.label}</td>
                <td className="p-2 text-left">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      backgroundColor: row.color,
                      opacity: 0.7,
                      borderRadius: "50%",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {row.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tables;
import React from "react";

const Tables = ({ labels, ticketCounts }) => {
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
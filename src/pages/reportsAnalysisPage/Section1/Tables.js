// Tables.js
import React from "react";

const Tables = ({ labels, ticketCounts }) => {
  return (
    <div className="flex space-x-6">
      {/* Left Table */}
      <div className="flex-1">
        <table className="w-full table-auto text-sm">
          <tbody>
            {[
              { label: labels.totalTickets, value: ticketCounts.totalTickets, color: "gray-500" },
              { label: labels.totalNew, value: ticketCounts.totalNew, color: "green-500" },
              { label: labels.totalInProgress, value: ticketCounts.totalInProgress, color: "yellow-500" },
              { label: labels.totalResolved, value: ticketCounts.totalResolved, color: "blue-500" },
            ].map((row, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="p-2 text-left">{row.label}</td>
                <td className="p-2 text-left">
                  <span className={`inline-flex items-center justify-center w-10 h-10 bg-${row.color} bg-opacity-70 text-center rounded-full font-bold text-white`}>
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
              { label: labels.totalOverdue, value: ticketCounts.totalOverdue, color: "red-500" },
              { label: labels.totalHighPriority, value: ticketCounts.totalHighPriority, color: "red-600" },
              { label: labels.totalMediumPriority, value: ticketCounts.totalMediumPriority, color: "yellow-400" },
              { label: labels.totalLowPriority, value: ticketCounts.totalLowPriority, color: "green-600" },
            ].map((row, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="p-2 text-left">{row.label}</td>
                <td className="p-2 text-left">
                  <span className={`inline-flex items-center justify-center w-10 h-10 bg-${row.color} bg-opacity-70 text-center rounded-full font-bold text-white`}>
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
// src/pages/dashboardPage/TicketTable.js
import React from "react";
import { LuPencil } from "react-icons/lu";
import { PiPaperPlaneTiltFill } from "react-icons/pi";
import { BiExpandHorizontal, BiCollapseHorizontal } from "react-icons/bi";

const TicketTable = ({
  filteredTickets,
  handleEditClick,
  handleTicketTrackerClick,
  isExpanded,
  setIsExpanded,
  statusFilter,
  setStatusFilter,
  issueTypeFilter,
  setIssueTypeFilter,
  keywordSearch,
  setKeywordSearch,
  searchSuggestions,
  showSuggestions,
  setShowSuggestions,
  resetFilters,
}) => {
  return (
    <div
      className={`table-container ${
        isExpanded ? "table-expanded" : "table-collapsed"
      } bg-gray-800 p-6 rounded-lg space-y-6`}
    >
      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <select
            id="statusFilter"
            className="bg-gray-700 text-sm p-2 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" disabled className="text-gray-500">
              Filter by Status
            </option>
            <option value="">All</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            id="issueTypeFilter"
            className="bg-gray-700 text-sm p-2 rounded-md"
            value={issueTypeFilter}
            onChange={(e) => setIssueTypeFilter(e.target.value)}
          >
            <option value="" disabled className="text-gray-500">
              Filter by Issue Type
            </option>
            <option value="">All</option>
            <option value="Garbage">Garbage</option>
            <option value="Crime Alert">Crime Alert</option>
            <option value="Traffic Lights">Traffic Lights</option>
            <option value="Pothole">Pothole</option>
          </select>

          <div className="relative">
            <input
              type="text"
              id="keywordSearch"
              placeholder="Search by description, issue type, status, etc."
              className="bg-gray-700 text-sm p-2 rounded-md"
              value={keywordSearch}
              onChange={(e) => {
                setKeywordSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute bg-gray-700 mt-1 rounded-md shadow-lg z-10 w-full">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => {
                      setKeywordSearch(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion
                      .split(new RegExp(`(${keywordSearch})`, "gi"))
                      .map((part, i) =>
                        part.toLowerCase() === keywordSearch.toLowerCase() ? (
                          <strong key={i} className="text-blue-400">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-sm bg-gray-700 p-2 rounded-md">
            Import request
          </button>
          <button
            className="text-sm bg-gray-700 p-2 rounded-md flex items-center space-x-2"
            onClick={resetFilters}
          >
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Ticket Summary */}
      <div className="my-4 flex items-center space-x-6 relative">
        <span>
          Total tickets:{" "}
          <span className="text-blue-400 bg-gray-700 px-3 py-1 rounded-full font-bold">
            {filteredTickets.length}
          </span>
        </span>
        <span>
          New:{" "}
          <span className="text-green-400 bg-gray-700 px-3 py-1 rounded-full font-bold">
            {filteredTickets.filter((t) => t.status === "New").length}
          </span>
        </span>
        <span>
          In Progress:{" "}
          <span className="text-yellow-500 bg-gray-700 px-3 py-1 rounded-full font-bold">
            {filteredTickets.filter((t) => t.status === "In Progress").length}
          </span>
        </span>
        <span>
          Resolved:{" "}
          <span className="text-gray-500 bg-gray-700 px-3 py-1 rounded-full font-bold">
            {filteredTickets.filter((t) => t.status === "Resolved").length}
          </span>
        </span>
        <span>
          Overdue:{" "}
          <span className="text-red-400 bg-gray-700 px-3 py-1 rounded-full font-bold">
            {filteredTickets.filter((t) => t.status === "Overdue").length}
          </span>
        </span>

        {/* Expand/Collapse Icon */}
        <div className="absolute right-0">
          {isExpanded ? (
            <BiCollapseHorizontal
              className="text-xl text-gray-400 cursor-pointer hover:text-blue-300"
              onClick={() => setIsExpanded(false)}
            />
          ) : (
            <BiExpandHorizontal
              className="text-xl text-gray-400 cursor-pointer hover:text-blue-300"
              onClick={() => setIsExpanded(true)}
            />
          )}
        </div>
      </div>

      {/* Ticket Table */}
      <div className="table-container">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Ticket ID</th>
              <th className="p-2 text-left">Issue Type</th>
              <th className="p-2 text-left">Assigned to</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Current Handler</th>
              <th className="p-2 text-left">Submission Date</th>
              {/* New Columns */}
              {isExpanded && (
                <>
                  <th className="p-2 text-left">Location Suburb</th>
                  <th className="p-2 text-left">Comment</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr
                key={index}
                className="border-b border-gray-600 hover:bg-gray-700"
              >
                <td className="p-2 flex items-center gap-2">
                  <LuPencil
                    className="cursor-pointer text-base hover:text-blue-300"
                    onClick={() => handleEditClick(ticket)}
                  />
                  <PiPaperPlaneTiltFill
                    className="cursor-pointer text-base hover:text-blue-300"
                    onClick={() => handleTicketTrackerClick(ticket)}
                  />
                </td>
                <td className="p-2">{ticket.id}</td>
                <td className="p-2">{ticket.issueType}</td>
                <td className="p-2">{ticket.team}</td>
                <td className="p-2">{ticket.priority}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full ${
                      ticket.status === "Resolved"
                        ? "text-gray-500 bg-gray-700"
                        : ticket.status === "New"
                        ? "text-green-500 bg-gray-700"
                        : ticket.status === "In Progress"
                        ? "text-yellow-500 bg-gray-700"
                        : "text-red-400 bg-gray-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="p-2">{ticket.currentHandler}</td>
                <td className="p-2">
                  {(() => {
                    let dateString =
                      ticket.dateSubmitted || ticket.submissionDate;
                    if (dateString && !dateString.includes("T")) {
                      const [day, month, year] = dateString.split("/");
                      dateString = `20${year}-${month}-${day}`;
                    }
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return "Invalid Date";
                    return `${date
                      .getDate()
                      .toString()
                      .padStart(2, "0")}/${(date.getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}/${date
                      .getFullYear()
                      .toString()
                      .slice(2, 4)}`;
                  })()}
                </td>
                {/* New Columns */}
                {isExpanded && (
                  <>
                    <td className="p-2">{ticket.suburb}</td>
                    <td className="p-2">{ticket.newComment}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
import React, { useState, useEffect } from "react";
import { LuPencil } from "react-icons/lu";
import { BiExpandHorizontal, BiCollapseHorizontal } from "react-icons/bi";
import { usePermissions } from "../../context/PermissionsContext";
import "../../styles/scrollbar.css"; // Import the scrollbar styles
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../../firebaseConfig"; // Import Firestore instance
import EditModal from "./EditModal"; // Import EditModal

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
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Log selectedTicket whenever it changes
  useEffect(() => {
    console.log("Selected Ticket Updated:", selectedTicket);
  }, [selectedTicket]);

  // Force the table to be expanded for roles that are not admin or operator
  const isTableExpanded =
    role !== "admin" && role !== "operator" ? true : isExpanded;

  // Sort the tickets by submission date in descending order
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = new Date(a.dateSubmitted || a.submissionDate);
    const dateB = new Date(b.dateSubmitted || b.submissionDate);
    return dateB - dateA;
  });

  // Function to open the EditModal for verification
  const openEditModal = (ticket) => {
    console.log("Opening EditModal for Ticket:", ticket);
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  // Function to handle dropdown changes
  const handleDropdownChange = (field, value) => {
    console.log(`Dropdown Change - Field: ${field}, Value: ${value}`);
    setSelectedTicket((prevTicket) => ({
      ...prevTicket,
      [field]: value,
    }));
  };

  const handleVerify = async (updatedTicket) => {
    try {
      console.log("Selected Ticket Before Verification, in Ticket Table:", updatedTicket);
  
      const ticketRef = doc(db, "complaints", updatedTicket.id);
  
      let newCurrentHandler = "";
      let handlerForPreviousHandlers = "";
      let updatedPreviousHandlers = [];
  
      if (role === "supervisorC") {
        // Logic for supervisorC
        if (updatedTicket.team === "Compliance") {
          newCurrentHandler = "Admin Compliance";
          handlerForPreviousHandlers = "bU_adminC";
        } else if (updatedTicket.team === "City Planning & Infrastructure") {
          newCurrentHandler = "Admin CPI";
          handlerForPreviousHandlers = "bU_adminCPI";
        } else if (updatedTicket.team === "Sustainability & Lifestyle") {
          newCurrentHandler = "Admin S&L";
          handlerForPreviousHandlers = "bU_adminS_L";
        } else {
          newCurrentHandler = "Admin";
          handlerForPreviousHandlers = "Admin";
        }
  
        // Add the internal handler value to previousHandlers
        updatedPreviousHandlers = [...updatedTicket.previousHandlers, handlerForPreviousHandlers];
      } else {
        // For other roles, use the currentHandler from the dropdown
        newCurrentHandler = updatedTicket.currentHandler;
        updatedPreviousHandlers = updatedTicket.previousHandlers; // No change to previousHandlers
      }
  
      // Additional logic to append "bU_supervisorC" if currentHandler is "Supervisor Compliance"
      if (updatedTicket.currentHandler === "Supervisor Compliance") {
        updatedPreviousHandlers = [...updatedPreviousHandlers, "bU_supervisorC"];
      }
  
      // Format the new comment using previousHandler
      const timestamp = new Date().toLocaleString();
      const newComment = updatedTicket.newComment 
        ? `${updatedTicket.currentHandler} | ${timestamp} | ${updatedTicket.status} | ${updatedTicket.newComment}|`
        : `${updatedTicket.currentHandler} | ${timestamp} | ${updatedTicket.status} | Ticket Verified|`;
  
      // Append the new comment to the existing description
      const updatedDescription = updatedTicket.description
        ? `${updatedTicket.description}\n${newComment}`
        : newComment;
  
      // Prepare the updated data
      const updatedData = {
        status: role === "supervisorC" ? "In Progress" : updatedTicket.status,
        currentHandler: newCurrentHandler,
        previousHandler: updatedTicket.currentHandler,
        previousHandlers: updatedPreviousHandlers,
        description: updatedDescription,
      };
  
      // Log the data being sent to Firestore
      console.log("Data to be updated in Firestore:", updatedData);
  
      // Update the ticket in Firestore
      await setDoc(ticketRef, updatedData, { merge: true });
  
      console.log("Ticket verified successfully. Ticket Table");
      console.log("Updated Data:", updatedData);
  
      setIsEditModalOpen(false); // Close the modal after verification
    } catch (error) {
      console.error("Error verifying ticket:", error);
    }
  };
  // Function to handle deletion
  const handleDelete = async (ticketId) => {
    let ticketSnapshot = null;
    let abortController = new AbortController();

    try {
      const ticketRef = doc(db, "complaints", ticketId);
      const deletedTicketRef = doc(db, "deletedTickets", ticketId);

      // 1. Get the ticket data with abort signal
      ticketSnapshot = await getDoc(ticketRef, { signal: abortController.signal });
      if (!ticketSnapshot.exists()) {
        throw new Error("Ticket not found");
      }

      // 2. Add deletion metadata with fallback values
      const ticketData = {
        ...ticketSnapshot.data(),
        deletedAt: new Date().toISOString(),
        deletedBy: userPermissions?.userId || "unknown_user",
        deletedByName: userPermissions?.userName || "Unknown User",
      };

      // 3. Copy to deletedTickets collection
      await setDoc(deletedTicketRef, ticketData, { signal: abortController.signal });

      // 4. Delete from original collection
      await deleteDoc(ticketRef, { signal: abortController.signal });

      // Close the modal
      setIsEditModalOpen(false);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error deleting ticket:", error);
      }
    } finally {
      // Cleanup
      abortController.abort();
      ticketSnapshot = null;
    }
  };

  return (
    <div
      className={`table-container ${
        isTableExpanded ? "table-expanded" : "table-collapsed"
      } bg-gray-800 p-6 rounded-lg space-y-6`}
    >
      <style jsx>{`
        .status-column {
          min-width: 120px; /* Adjust the width as needed */
        }
      `}</style>

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
            <option value="Urban Safety">Urban Safety</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Markets">Markets</option>
            <option value="Parks & Gardens">Parks & Gardens</option>
            <option value="Eda City Bus">Eda City Bus</option>
            <option value="Liquor License">Liquor License</option>
            <option value="Building">Building</option>
            <option value="Development Control & Physical Planning">
              Development Control & Physical Planning
            </option>
            <option value="Enforcement">Enforcement</option>
            <option value="Streetlights & Traffic Management">
              Streetlights & Traffic Management
            </option>
            <option value="Road Furniture & Road Signs">
              Road Furniture & Road Signs
            </option>
            <option value="Potholes & Drainage">Potholes & Drainage</option>
            <option value="Strategic Planning">Strategic Planning</option>
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

        {/* Expand/Collapse Icon - Conditionally Rendered for Admin and Operator Roles */}
        {(role === "admin" || role === "operator") && (
          <div className="absolute right-0">
            {isTableExpanded ? (
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
        )}
      </div>

      {/* Ticket Table */}
      <div className="custom-scrollbar" style={{ maxHeight: "450px", overflowY: "auto" }}>
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              {/* Conditionally render the Actions column */}
              {(userPermissions.canEditTicket || role === "bU_adminC" || role === "supervisorC") && (
                <th className="p-2 text-left">Actions</th>
              )}
              <th className="p-2 text-left">Ticket ID</th>
              <th className="p-2 text-left">Issue Type</th>
              <th className="p-2 text-left">Assigned to</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left status-column" style={{ minWidth: "120px" }}>
                Status
              </th>
              <th className="p-2 text-left">Current Handler</th>
              <th className="p-2 text-left">Submission Date</th>
              {/* New Columns */}
              {isTableExpanded && (
                <>
                  <th className="p-2 text-left">Location Suburb</th>
                  <th className="p-2 text-left">Comment</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedTickets.map((ticket, index) => (
              <tr
                key={index}
                className="border-b border-gray-600 hover:bg-gray-700"
               >
                {/* Render Verify button for supervisorC */}
                {role === "supervisorC" && (
                  <td className="p-2 flex items-center gap-2">
                    <button
                      className={`p-1 rounded-md text-sm ${
                        ticket.status === "In Progress"
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                      onClick={() => ticket.status !== "In Progress" && openEditModal(ticket)}
                      disabled={ticket.status === "In Progress"}
                    >
                      {ticket.status === "In Progress" ? "Verified" : "Verify"}
                    </button>
                  </td>
                )}

                {/* Render Edit button for admin and bU_adminC */}
                {(role === "admin" || role === "bU_adminC") && (
                  <td className="p-2 flex items-center gap-2">
                    <LuPencil
                      className="cursor-pointer text-base hover:text-blue-300"
                      onClick={() => openEditModal(ticket)}
                    />
                  </td>
                )}
                <td className="p-2">
                  {ticket.id.length > 15
                    ? ticket.id.substring(0, 15) + "..."
                    : ticket.id}
                </td>
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
                        : ticket.status === "Verified"
                        ? "text-blue-500 bg-gray-700"
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
                {isTableExpanded && (
                  <>
                    <td className="p-2">{ticket.suburb}</td>
                    <td className="p-2">
                      {(() => {
                        if (!ticket.description) {
                          console.log("No description found for ticket:", ticket.id);
                          return "No comment";
                        }

                        // Split the description into individual entries, handling newlines
                        const entries = ticket.description.replace(/\n/g, "|").split("|");
                        console.log("Entries for ticket:", ticket.id, entries);

                        // Ensure there are enough entries to extract a comment
                        if (entries.length >= 4) {
                          // The most recent comment is the last non-empty entry
                          const mostRecentComment = entries
                            .map(entry => entry.trim()) // Trim each entry
                            .filter(entry => entry !== "") // Remove empty entries
                            .pop(); // Get the last non-empty entry

                          console.log("Most recent comment for ticket:", ticket.id, mostRecentComment);
                          return mostRecentComment || "No comment";
                        }

                        console.log("Not enough entries for ticket:", ticket.id);
                        return "No comment";
                      })()}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedTicket && (
        <EditModal
          ticket={selectedTicket}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleVerify}
          onDelete={handleDelete}
          onDropdownChange={handleDropdownChange}
        />
      )}
    </div>
  );
};

export default TicketTable;
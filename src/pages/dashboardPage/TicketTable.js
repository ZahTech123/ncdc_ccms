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
  resetFilters,
  role,
}) => {
  const { userPermissions } = usePermissions();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Log selectedTicket whenever it changes
  useEffect(() => {
    console.log("Selected Ticket Updated:", selectedTicket);
  }, [selectedTicket]);

  // Add this useEffect to log filter changes
  useEffect(() => {
    console.log("Status Filter Changed:", statusFilter);
    console.log("Issue Type Filter Changed:", issueTypeFilter);
    console.log("Keyword Search Changed:", keywordSearch);
  }, [statusFilter, issueTypeFilter, keywordSearch]);

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
        // If the status is "Invalid", handle it differently
        if (updatedTicket.status === "Invalid") {
          // Format the new comment
          const timestamp = new Date().toLocaleString();
          const newComment = updatedTicket.newComment 
            ? `${updatedTicket.currentHandler} | ${timestamp} | ${updatedTicket.status} | ${updatedTicket.newComment}|`
            : `${updatedTicket.currentHandler} | ${timestamp} | ${updatedTicket.status} | Ticket Marked as Invalid|`;
  
          // Append the new comment to the existing description
          const updatedDescription = updatedTicket.description
            ? `${updatedTicket.description}\n${newComment}`
            : newComment;
  
          // Prepare the updated data
          const updatedData = {
            status: "Invalid",
            description: updatedDescription,
          };
  
          // Log the data being sent to Firestore
          console.log("Data to be updated in Firestore:", updatedData);
  
          // Update the ticket in Firestore
          await setDoc(ticketRef, updatedData, { merge: true });
  
          console.log("Ticket marked as invalid successfully. Ticket Table");
          console.log("Updated Data:", updatedData);
  
          setIsEditModalOpen(false); // Close the modal after verification
          return;
        }
  
        // Logic for supervisorC for other statuses
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
      } else if (role === "bU_adminC") {
        // Logic for bU_adminC
        newCurrentHandler = updatedTicket.currentHandler;
  
        // Append to previousHandlers based on the selected dropdown value
        if (updatedTicket.currentHandler === "Compliance Supervisor") {
          handlerForPreviousHandlers = "bU_supervisorC";
        } else if (updatedTicket.currentHandler === "Compliance Manager") {
          handlerForPreviousHandlers = "bU_managerC";
        } else if (updatedTicket.currentHandler === "Compliance Director") {
          handlerForPreviousHandlers = "bU_directorC";
        }
  
        // Add the internal handler value to previousHandlers
        updatedPreviousHandlers = [...updatedTicket.previousHandlers, handlerForPreviousHandlers];
      } else {
        // For other roles, use the currentHandler from the dropdown
        newCurrentHandler = updatedTicket.currentHandler;
        updatedPreviousHandlers = updatedTicket.previousHandlers; // No change to previousHandlers
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




// Add this above the TicketTable component
const allIssueTypes = [
  "Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus",
  "Liquor License", "Building", "Development Control & Physical Planning", "Enforcement",
  "Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"
];

const roleToIssueTypes = {
  // Compliance Directorate
  "bU_adminC": ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"],
  "bU_supervisorC": ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"],
  "bU_managerC": ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"],
  "bU_directorC": ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"],
  
  // Sustainability & Lifestyle Directorate
  "bU_adminS_L": ["Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus"],
  "bU_supervisorS_L": ["Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus"],
  "bU_managerS_L": ["Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus"],
  "bU_directorS_L": ["Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus"],
  
  // City Planning & Infrastructure Directorate
  "bU_adminCPI": ["Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"],
  "bU_supervisorCPI": ["Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"],
  "bU_managerCPI": ["Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"],
  "bU_directorCPI": ["Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"],
  
  // These roles see all issue types
  "admin": allIssueTypes,
  "supervisor": allIssueTypes,
  "operator": allIssueTypes,
  "supervisorC": ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"]
};

// Helper function to get issue types for a role
const getIssueTypesForRole = (role) => {
  return roleToIssueTypes[role] || allIssueTypes; // Default to all if role not found
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
          <div className="relative">
            <select
              id="statusFilter"
              className="bg-gray-700 text-sm p-2 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Overdue">Overdue</option>
              <option value="Closed">Closed</option>
              {(role === "admin" || role === "supervisor" || role === "supervisorC") && (
                <option value="Invalid">Invalid</option>
              )}
            </select>
          </div>

          <select
  id="issueTypeFilter"
  className="bg-gray-700 text-sm p-2 rounded-md"
  value={issueTypeFilter}
  onChange={(e) => setIssueTypeFilter(e.target.value)}
>
  <option value="" disabled className="text-gray-500">
    Filter by Issue Type
  </option>
  {getIssueTypesForRole(role).map((issueType) => (
    <option key={issueType} value={issueType}>
      {issueType}
    </option>
  ))}
</select>
          <div className="relative">
            <input
              type="text"
              id="keywordSearch"
              placeholder="Search by description, issue type, status, etc."
              className="bg-gray-700 text-sm p-2 rounded-md"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button className=" bounce-effect  text-sm bg-gray-700 p-2 rounded-md">
            Import Ticket(s)
          </button>
          <button
            className=" bounce-effect  text-sm bg-gray-700 p-2 rounded-md flex items-center space-x-2"
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
        {/* Closed count - visible to all roles */}
        <span>
          Closed:{" "}
          <span className="text-pink-400 bg-gray-700 px-3 py-1 rounded-full font-bold">
            {filteredTickets.filter((t) => t.status === "Closed").length}
          </span>
        </span>
        {/* Invalid count - for admin, supervisor, operator, and supervisorC */}
        {(role === "admin" || role === "supervisor" || role === "operator" || role === "supervisorC") && (
          <span>
            Invalid:{" "}
            <span className="text-purple-400 bg-gray-700 px-3 py-1 rounded-full font-bold">
              {filteredTickets.filter((t) => t.status === "Invalid").length}
            </span>
          </span>
        )}

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
    {(userPermissions.canEditTicket || role === "bU_adminC" || 
  role === "supervisorC" || role === "admin" ||
  role === "bU_supervisorC" || role === "bU_managerC" || role === "bU_directorC" ||
  role === "bU_adminS_L" || role === "bU_supervisorS_L" || role === "bU_managerS_L" || role === "bU_directorS_L" ||
  role === "bU_adminCPI" || role === "bU_supervisorCPI" || role === "bU_managerCPI" || role === "bU_directorCPI") && 
  role !== "operator" && (
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
              ticket.status === "In Progress" || 
              ticket.status === "Invalid" ||
              ticket.status === "Closed" || 
              ticket.status === "Resolved"  // Added new conditions
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            onClick={() => 
              ticket.status !== "In Progress" && 
              ticket.status !== "Invalid" &&
              ticket.status !== "Closed" && 
              ticket.status !== "Resolved" &&  // Added new conditions
              openEditModal(ticket)
            }
            disabled={
              ticket.status === "In Progress" || 
              ticket.status === "Invalid" ||
              ticket.status === "Closed" || 
              ticket.status === "Resolved"  // Added new conditions
            }
          >
            {ticket.status === "In Progress"
              ? "Verified"
              : ticket.status === "Invalid"
              ? "Invalid"
              : ticket.status === "Closed" || ticket.status === "Resolved"  // Added new conditions
              ? "Completed"
              : "Verify"}
          </button>
        </td>
      )}

      {/* Render Edit button for admin, bU_adminC, and other specified roles */}
      {(role === "admin" || role === "bU_adminC" || 
        role === "bU_supervisorC" || role === "bU_managerC" || role === "bU_directorC" ||
        role === "bU_adminS_L" || role === "bU_supervisorS_L" || role === "bU_managerS_L" || role === "bU_directorS_L" ||
        role === "bU_adminCPI" || role === "bU_supervisorCPI" || role === "bU_managerCPI" || role === "bU_directorCPI") && (
        <td className="p-2 flex items-center gap-2">
          <LuPencil
            className="cursor-pointer text-base hover:text-blue-300"
            onClick={() => openEditModal(ticket)}
          />
        </td>
      )}

      {/* Rest of the table row */}
      <td className="p-2">
        {ticket.ticketId && ticket.ticketId.length > 15
          ? ticket.ticketId.substring(0, 15) + "..."
          : ticket.ticketId}
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
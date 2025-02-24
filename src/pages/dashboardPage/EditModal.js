import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaLightbulb,
  FaExclamationTriangle,
  FaTrafficLight,
  FaHardHat,
  FaShoppingCart,
  FaTree,
  FaBus,
  FaGlassCheers,
  FaBuilding,
  FaProjectDiagram,
  FaGavel,
  FaRoad,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { usePermissions } from "../../context/PermissionsContext";

const iconSize = 50;

// Mapping of issue types to icons
const ISSUE_TYPE_ICONS = {
  "Garbage and Sanitation": <FaTrash size={iconSize} className="text-gray-400" />,
  "Street Lights": <FaLightbulb size={iconSize} className="text-gray-400" />,
  "Crime Alert": <FaExclamationTriangle size={iconSize} className="text-gray-400" />,
  "Traffic Lights": <FaTrafficLight size={iconSize} className="text-gray-400" />,
  "Pothole Roads": <FaHardHat size={iconSize} className="text-gray-400" />,
  "Urban Safety": <FaExclamationTriangle size={iconSize} className="text-gray-400" />,
  "Waste Management": <FaTrash size={iconSize} className="text-gray-400" />,
  Markets: <FaShoppingCart size={iconSize} className="text-gray-400" />,
  "Parks & Gardens": <FaTree size={iconSize} className="text-gray-400" />,
  "Eda City Bus": <FaBus size={iconSize} className="text-gray-400" />,
  "Liquor License": <FaGlassCheers size={iconSize} className="text-gray-400" />,
  Building: <FaBuilding size={iconSize} className="text-gray-400" />,
  "Development Control & Physical Planning": (
    <FaProjectDiagram size={iconSize} className="text-gray-400" />
  ),
  Enforcement: <FaGavel size={iconSize} className="text-gray-400" />,
  "Streetlights & Traffic Management": (
    <FaTrafficLight size={iconSize} className="text-gray-400" />
  ),
  "Road Furniture & Road Signs": <FaRoad size={iconSize} className="text-gray-400" />,
  "Potholes & Drainage": <FaHardHat size={iconSize} className="text-gray-400" />,
  "Strategic Planning": <FaMapMarkedAlt size={iconSize} className="text-gray-400" />,
};

const EditModal = ({ ticket, onClose, onSave, onDelete }) => {
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;

  // Determine CURRENT_HANDLER_OPTIONS based on role
// Determine CURRENT_HANDLER_OPTIONS based on role
const getCurrentHandlerOptions = (role) => {
  switch (role) {
    case "supervisorC":
      return [
        { label: "City Planning & Infrastructure", disabled: true },
        { label: "Compliance", disabled: true },
        { label: "Sustainability & Lifestyle", disabled: true },
      ];
    case "admin":
      return [
        { label: "City Planning & Infrastructure", disabled: false },
        { label: "Compliance", disabled: false },
        { label: "Sustainability & Lifestyle", disabled: false },
      ];
    case "bU_adminC":
      return [
        { label: "Compliance Supervisor", disabled: false },
        { label: "Compliance Manager", disabled: false },
        { label: "Compliance Director", disabled: false },
        { label: "Response Team", disabled: false },
      ];
    case "bU_C_supervisor":
      return [
        { label: "City Planning & Infrastructure", disabled: true },
        { label: "Compliance", disabled: true },
        { label: "Sustainability & Lifestyle", disabled: true },
      ];
    case "bU_C_manager":
      return [
        { label: "City Planning & Infrastructure", disabled: true },
        { label: "Compliance", disabled: true },
        { label: "Sustainability & Lifestyle", disabled: true },
      ];
    case "bU_C_director":
      return [
        { label: "City Planning & Infrastructure", disabled: true },
        { label: "Compliance", disabled: true },
        { label: "Sustainability & Lifestyle", disabled: true },
      ];
    default:
      return [];
  }
};

// Determine STATUS_OPTIONS based on role
const getStatusOptions = (role) => {
  switch (role) {
    case "supervisorC":
      return ["In Progress", "Verified"];
    case "admin":
      return ["In Progress", "Resolved", "Overdue", "Closed", "Verified"];
    case "bU_C_admin":
    case "bU_C_supervisor":
    case "bU_C_manager":
    case "bU_C_director":
      return ["In Progress", "Resolved", "Overdue", "Closed", "Verified"];
    case "bU_adminC":
      return ["In Progress", "Closed"];
    default:
      return ["In Progress", "Resolved", "Overdue", "Closed"];
  }
};

  const CURRENT_HANDLER_OPTIONS = getCurrentHandlerOptions(role);
  const STATUS_OPTIONS = getStatusOptions(role);

  // State to manage the form fields
  const [formData, setFormData] = useState({
    issueType: ticket.issueType, // Read-only
    status: "", // Initialize with empty value to show placeholder
    currentHandler: "", // Initialize with empty value to show placeholder
    description: ticket.description, // Initial description
    newComment: "", // New comment input
  });

  // Reset form data when the ticket prop changes
  useEffect(() => {
    // Determine the initial status based on the role
    const initialStatus = role === "supervisorC" ? "Verified" : ticket.status;

    // Determine the initial current handler based on the ticket's directorate
    const initialCurrentHandler = ticket.directorate || "";

    setFormData({
      issueType: ticket.issueType,
      status: initialStatus, // Set initial status based on role
      currentHandler: initialCurrentHandler, // Set initial current handler based on directorate
      description: ticket.description,
      newComment: "",
    });
  }, [ticket, role]);

  // State to manage delete confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Add check for onSave existence
    if (!onSave) {
      console.error("onSave function is undefined");
      setIsLoading(false);
      return;
    }
  
    // Log the onSave function to inspect its definition
    console.log("onSave function:", onSave.toString()); // This will show the function's code
  
    // Function to map directorate to the corresponding admin handler
    const getAdminHandler = (directorate) => {
      switch (directorate) {
        case "Compliance":
          return "Compliance Admin";
        case "City Planning & Infrastructure":
          return "C&L Admin";
        case "Sustainability & Lifestyle":
          return "S&L Admin";
        default:
          return directorate; // Fallback to the original value
      }
    };
  
    // Update the currentHandler for supervisorC
    let updatedCurrentHandler = formData.currentHandler;
    if (role === "supervisorC") {
      updatedCurrentHandler = getAdminHandler(ticket.directorate);
      console.log("Updated currentHandler:", updatedCurrentHandler); // Debug log
    }
  
    // Use pre-filled or user-selected values
    const updatedStatus = formData.status || (role === "supervisorC" ? "Verified" : ticket.status); // Use pre-filled "Verified" for supervisorC if not changed
    const updatedNewComment = formData.newComment || ""; // Use empty string if no new comment
  
    // Append the new comment to the description with a timestamp, handler name, and current status
    const timestamp = new Date().toLocaleString();
    const updatedDescription = updatedNewComment
      ? `${formData.description}\n${updatedCurrentHandler}|${timestamp}|${updatedStatus}|${updatedNewComment}`
      : formData.description; // Only append if there's a new comment
  
    // Prepare the updated data
    const updatedData = {
      status: updatedStatus, // Use updated status
      currentHandler: updatedCurrentHandler, // Use updated handler
      description: updatedDescription, // Updated description with status included
    };
  
    console.log("Calling onSave with:", ticket.id, updatedData);
  
    try {
      await onSave(ticket.id, updatedData);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  
    setIsLoading(false);
    onClose();
  };
  // Handle delete button click (show confirmation modal)
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  // Handle actual delete action
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(ticket.id); // This will call the handleDelete function
      // Optionally add a success message or state update here
    } catch (error) {
      console.error("Error deleting ticket:", error);
      // Optionally add an error message here
    }
    setIsLoading(false);
    setShowConfirmDelete(false);
    onClose(); // Close the modal
  };

  // Function to determine if an option should be disabled
  const isOptionDisabled = (handler) => {
    const currentHandlerIndex = CURRENT_HANDLER_OPTIONS.findIndex(
      (option) => option.label === ticket.currentHandler // Use the current handler from the ticket prop
    );
    const optionIndex = CURRENT_HANDLER_OPTIONS.findIndex((option) => option.label === handler);
    return optionIndex <= currentHandlerIndex; // Disable options lower or equal in the hierarchy
  };

  // Parse the description into an array of comments and reverse the order
  const parseDescription = (description) => {
    return description
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [handler, timestamp, status, comment] = line.split("|");
        return { handler, timestamp, status, comment };
      })
      .reverse(); // Reverse the array to show the most recent comment first
  };

  // Get the icon for the current issue type
  const issueTypeIcon =
    ISSUE_TYPE_ICONS[formData.issueType] || (
      <HiOutlineQuestionMarkCircle size={20} className="text-gray-400" />
    );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} // Close modal on outside click
    >
      <div
        className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full sm:w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent click from propagating to the outer div
      >
        <div className="mb-1">
          {/* Header with Icon (Top Left) */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold">
              {formData.issueType}
            </h2>
            {/* Icon on the right side */}
            <div className="mr-6">{issueTypeIcon}</div>
          </div>

          {/* Column Layout for Team and Location */}
          <div className="flex flex-col">
            <p className="text-sm text-gray-400 leading-tight whitespace-nowrap overflow-hidden overflow-ellipsis">
              <span className="font-semibold">Team:</span> {ticket.team}
            </p>
            <p className="text-sm text-gray-400 leading-tight whitespace-nowrap overflow-hidden overflow-ellipsis">
              <span className="font-semibold">Location:</span> {ticket.suburb}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
         >
          <div className="space-y-4 flex-1 overflow-hidden">
            {/* Status Field */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="bg-gray-700 text-sm sm:text-base p-2 rounded-md w-full"
                aria-label="Status"
              >
                <option value="" disabled>
                  Select Current Status
                </option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Handler Field */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">
                Assigned to
              </label>
              <select
                name="currentHandler"
                value={formData.currentHandler}
                onChange={handleChange}
                className="bg-gray-700 text-sm sm:text-base p-2 rounded-md w-full"
                aria-label="Current Handler"
                disabled={ticket.currentHandler === "Response Team"} // Disable dropdown if current handler is Response Team
              >
                <option value="" disabled>
                  Select Current Handler
                </option>
                {CURRENT_HANDLER_OPTIONS.map((handler) => (
                  <option
                    key={handler.label}
                    value={handler.label}
                    disabled={handler.disabled || isOptionDisabled(handler.label)} // Disable based on hierarchy
                  >
                    {handler.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Field */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm sm:text-base font-medium mb-1">
                Description
              </label>
              <div className="bg-gray-700 p-3 rounded-md flex-1 flex flex-col">
                {/* Scrollable previous comments container */}
                <div
                  className="text-sm opacity-80 flex-1 overflow-y-auto mb-4 custom-scrollbar"
                  style={{ maxHeight: "100px" }}
                >
                  {parseDescription(formData.description).map(
                    (comment, index) => (
                      <React.Fragment key={index}>
                        {/* Handler Name and Date/Time on the same line */}
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            {comment.handler}
                          </span>
                          <span className="text-gray-400">
                            {comment.timestamp}
                          </span>
                        </div>

                        {/* Description and Status on the same line */}
                        <div className="flex justify-between items-start mt-1">
                          <span className="flex-1">{comment.comment}</span>
                          <span className="text-gray-400 ml-4">
                            Status: {comment.status} {/* Use the saved status */}
                          </span>
                        </div>

                        {/* Divider with low opacity */}
                        <hr className="border-gray-600 my-2 opacity-30" />
                      </React.Fragment>
                    )
                  )}
                </div>

                {/* Divider with low opacity */}
                <hr className="border-gray-600 my-2 opacity-30" />

                {/* New Comment Input (Non-scrollable) */}
                <textarea
                  name="newComment"
                  value={formData.newComment}
                  onChange={handleChange}
                  className="bg-gray-800 text-sm sm:text-base p-2 rounded-md w-full"
                  aria-label="New Comment"
                  rows={3}
                  placeholder="Add a new comment..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Conditionally render Delete button */}
            {role !== "supervisorC" && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors w-full sm:w-auto"
                aria-label="Delete"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            )}

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {/* Move Cancel button to the left if role is supervisorC */}
              {role === "supervisorC" && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30 w-full sm:w-auto"
                  aria-label="Cancel"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}

              {/* Save/Verify button */}
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md transition-colors text-black w-full sm:w-auto"
                aria-label="Save Changes"
                disabled={isLoading}
              >
                {isLoading
                  ? "Saving..."
                  : userPermissions.role === "supervisorC"
                  ? "Verify"
                  : "Save Changes"}
              </button>

              {/* Keep Cancel button in its original position for other roles */}
              {role !== "supervisorC" && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30 w-full sm:w-auto"
                  aria-label="Cancel"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div
          role="dialog"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowConfirmDelete(false)} // Close modal on outside click
        >
          <div
            className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full sm:w-11/12 md:w-1/3 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent click from propagating to the outer div
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this ticket?</p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="p-2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors"
                aria-label="Confirm Delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditModal;
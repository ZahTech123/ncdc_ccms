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

// Constants for current handler options (in hierarchical order)
const CURRENT_HANDLER_OPTIONS = [
  "Controls Operator",
  "Supervisor",
  "BU Admin",
  "BU Supervisor",
  "BU Director",
];

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
  const { userPermissions } = usePermissions(); // Use the hook inside the component

  // Constants for status options (removed "New")
  const STATUS_OPTIONS = [
    "In Progress",
    "Resolved",
    "Overdue",
    "Closed",
    ...(userPermissions.role === "supervisorC" ? ["Verified"] : []),
  ];

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
    setFormData({
      issueType: ticket.issueType,
      status: "", // Reset to empty to show placeholder
      currentHandler: ticket.currentHandler === "Response Team" ? "Response Team" : "", // Preserve Response Team
      description: ticket.description,
      newComment: "",
    });
  }, [ticket]);

  // State to manage delete confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // State to manage form errors
  const [errors, setErrors] = useState({});

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when the user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.status.trim()) newErrors.status = "Status is required";
    if (!formData.currentHandler.trim() && ticket.currentHandler !== "Response Team")
      newErrors.currentHandler = "Current Handler is required";
    if (!formData.newComment.trim())
      newErrors.newComment = "Comment is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      // Append the new comment to the description with a timestamp, handler name, and current status
      const timestamp = new Date().toLocaleString();
      const updatedDescription = `${formData.description}\n${formData.currentHandler}|${timestamp}|${formData.status}|${formData.newComment}`;

      // Save the updated description and other fields
      await onSave(ticket.id, {
        ...formData,
        description: updatedDescription, // Updated description with status included
      });

      setIsLoading(false);
      onClose(); // Close the modal
    }
  };

  // Handle delete button click (show confirmation modal)
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  // Handle actual delete action
  const confirmDelete = async () => {
    setIsLoading(true);
    await onDelete(ticket.id); // Pass the ticket ID to the parent component
    setIsLoading(false);
    setShowConfirmDelete(false);
    onClose(); // Close the modal
  };

  // Function to determine if an option should be disabled
  const isOptionDisabled = (handler) => {
    const currentHandlerIndex = CURRENT_HANDLER_OPTIONS.indexOf(
      ticket.currentHandler // Use the current handler from the ticket prop
    );
    const optionIndex = CURRENT_HANDLER_OPTIONS.indexOf(handler);
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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" // Added z-50
      onClick={onClose} // Close modal on outside click
    >
      <div
        className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full sm:w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 max-h-[90vh] flex flex-col " // Responsive width
        onClick={(e) => e.stopPropagation()} // Prevent click from propagating to the outer div
      >
        <div className="mb-1">
          {/* Header with Icon (Top Left) */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold">
              {formData.issueType}
            </h2>
            {/* Icon on the right side */}
            <div className="mr-6"  >{issueTypeIcon}</div>
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
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            {/* Current Handler Field */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">
                Current Handler
              </label>
              <select
                name="currentHandler"
                value={ticket.currentHandler === "Response Team" ? "Response Team" : formData.currentHandler}
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
                    key={handler}
                    value={handler}
                    disabled={isOptionDisabled(handler)} // Disable based on hierarchy
                  >
                    {handler}
                  </option>
                ))}
              </select>
              {errors.currentHandler && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentHandler}
                </p>
              )}
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
                {errors.newComment && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newComment}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors w-full sm:w-auto"
              aria-label="Delete"
              disabled={isLoading}
            >
              Delete
            </button>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30 w-full sm:w-auto"
                aria-label="Cancel"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md transition-colors text-black w-full sm:w-auto"
                aria-label="Save Changes"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" // Added z-50
        >
          <div className="bg-gray-800 p-6 rounded-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Are you sure you want to delete this record?
            </h3>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 p-2 rounded-md w-full sm:w-auto"
                autoFocus // Focus on this button when the modal opens
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Yes"}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-700 p-2 rounded-md w-full sm:w-auto"
                disabled={isLoading}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditModal;
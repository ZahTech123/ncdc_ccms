import React, { useState, useEffect, useCallback } from "react";
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

const EditModal = ({ ticket, onClose, onSave, onDelete, onDropdownChange }) => {
  const { userPermissions } = usePermissions();
  const { role, name } = userPermissions;

  // Define the roles that require mandatory fields
  const mandatoryRoles = [
    "bU_adminC",
    "bU_supervisorC",
    "bU_managerC",
    "bU_directorC",
    "bU_adminS&L",
    "bU_supervisorS&L",
    "bU_managerS&L",
    "bU_directorCS&L",
    "bU_adminCPI",
    "bU_supervisorCPI",
    "bU_managerCPI",
    "bU_directorCPI",
  ];

  // Check if the current role requires mandatory fields
  const isMandatory = mandatoryRoles.includes(role);

  // Determine CURRENT_HANDLER_OPTIONS based on role
  const getCurrentHandlerOptions = (role) => {
    switch (role) {
      case "supervisorC":
        return [
          { label: "City Planning & Infrastructure", disabled: false },
          { label: "Compliance", disabled: false },
          { label: "Sustainability & Lifestyle", disabled: false },
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
      default:
        return [];
    }
  };

  // Determine STATUS_OPTIONS based on role
  const getStatusOptions = (role) => {
    switch (role) {
      case "supervisorC":
        return ["Verified","Invalid"];
      case "admin":
        return ["In Progress", "Resolved", "Overdue", "Closed", "Verified"];
      case "bU_adminC":
        return ["In Progress", "Closed"];
      default:
        return ["In Progress", "Resolved", "Overdue", "Closed"];
    }
  };

  const CURRENT_HANDLER_OPTIONS = getCurrentHandlerOptions(role);
  const STATUS_OPTIONS = getStatusOptions(role);

  // Initialize state with first option for non-mandatory roles
  const [status, setStatus] = useState(
    !isMandatory && STATUS_OPTIONS.length > 0 ? STATUS_OPTIONS[0] : ""
  );
  const [currentHandler, setCurrentHandler] = useState(
    !isMandatory && CURRENT_HANDLER_OPTIONS.length > 0 
      ? CURRENT_HANDLER_OPTIONS[0].label 
      : ""
  );

  // Add log for role and name
  useEffect(() => {
    console.log(`EditModal opened by - Role: ${role}, Name: ${name}`);
  }, [role, name]);

  // State to track validation errors
  const [errors, setErrors] = useState({});

  // Update parent state with initial values for non-mandatory roles
  useEffect(() => {
    if (!isMandatory) {
      if (STATUS_OPTIONS.length > 0) {
        onDropdownChange('status', STATUS_OPTIONS[0]);
      }
      if (CURRENT_HANDLER_OPTIONS.length > 0) {
        onDropdownChange('currentHandler', CURRENT_HANDLER_OPTIONS[0].label);
      }
    }
  }, [isMandatory, STATUS_OPTIONS, CURRENT_HANDLER_OPTIONS, onDropdownChange]);

  // Handle dropdown changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Update local state for dropdowns
    if (name === "status") {
      setStatus(value);
    } else if (name === "currentHandler") {
      setCurrentHandler(value);
    }

    // Update parent state
    onDropdownChange(name, value);
  }, [onDropdownChange]);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (isMandatory) {
      // Only validate status and comment for mandatory roles
      if (!status) newErrors.status = "Status is required";
      if (!ticket.newComment) newErrors.newComment = "Comment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const handlerValue = currentHandler || ticket.currentHandler;
    const updatedTicket = {
      ...ticket,
      status,
      currentHandler: handlerValue,
    };

    setIsLoading(true);
    await onSave(updatedTicket);
    setIsLoading(false);
    onClose();
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  // Handle actual delete action
  const confirmDelete = async () => {
    setIsLoading(true);
    await onDelete(ticket.id);
    setIsLoading(false);
    setShowConfirmDelete(false);
    onClose();
  };

  // Parse the description into an array of comments
  const parseDescription = (description) => {
    return description
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [handler, timestamp, status, comment] = line.split("|");
        return { handler, timestamp, status, comment };
      })
      .reverse();
  };

  // Get the icon for the current issue type
  const issueTypeIcon =
    ISSUE_TYPE_ICONS[ticket.issueType] || (
      <HiOutlineQuestionMarkCircle size={20} className="text-gray-400" />
    );

  // State to manage delete confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full sm:w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold">{ticket.issueType}</h2>
            <div className="mr-6">{issueTypeIcon}</div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-400 leading-tight whitespace-nowrap overflow-hidden overflow-ellipsis">
              <span className="font-semibold">Team:</span> {ticket.team}
            </p>
            <p className="text-sm text-gray-400 leading-tight whitespace-nowrap overflow-hidden overflow-ellipsis">
              <span className="font-semibold">Location:</span> {ticket.suburb}
            </p>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-4 flex-1 overflow-hidden">
            {/* Status Dropdown */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">Status</label>
              <select
                name="status"
                value={status}
                onChange={handleChange}
                className="bg-gray-700 text-sm sm:text-base p-2 rounded-md w-full"
                required={isMandatory}
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
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>

            {/* Assigned To Dropdown */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">Assigned to</label>
              <select
                name="currentHandler"
                value={currentHandler}
                onChange={handleChange}
                className="bg-gray-700 text-sm sm:text-base p-2 rounded-md w-full"
              >
                <option value="" disabled>
                  Select Current Handler
                </option>
                {CURRENT_HANDLER_OPTIONS.map((handler) => (
                  <option key={handler.label} value={handler.label}>
                    {handler.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Section */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm sm:text-base font-medium mb-1">Description</label>
              <div className="bg-gray-700 p-3 rounded-md flex-1 flex flex-col">
                <div
                  className="text-sm opacity-80 flex-1 overflow-y-auto mb-4 custom-scrollbar"
                  style={{ maxHeight: "100px" }}
                >
                  {parseDescription(ticket.description).map((comment, index) => (
                    <React.Fragment key={index}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{comment.handler}</span>
                        <span className="text-gray-400">{comment.timestamp}</span>
                      </div>
                      <div className="flex justify-between items-start mt-1">
                        <span className="flex-1">{comment.comment}</span>
                        <span className="text-gray-400 ml-4">Status: {comment.status}</span>
                      </div>
                      <hr className="border-gray-600 my-2 opacity-30" />
                    </React.Fragment>
                  ))}
                </div>
                <hr className="border-gray-600 my-2 opacity-30" />
                <textarea
                  name="newComment"
                  value={ticket.newComment || ""}
                  onChange={handleChange}
                  className="bg-gray-800 text-sm sm:text-base p-2 rounded-md w-full"
                  rows={3}
                  placeholder="Add a new comment..."
                  required={isMandatory}
                />
                {errors.newComment && <p className="text-red-500 text-sm mt-1">{errors.newComment}</p>}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {role !== "supervisorC" && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            )}

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-md transition-colors text-black w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : role === "supervisorC" ? "Submit" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30 w-full sm:w-auto"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div
          role="dialog"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full sm:w-11/12 md:w-1/3 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this ticket?</p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="p-2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors"
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
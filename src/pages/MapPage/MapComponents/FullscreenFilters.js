import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "../../../context/PermissionsContext";
import "../../../styles/scrollbar.css";

// Mapping of Directorates to their respective issue types
const directorateIssueTypeMapping = {
  "Sustainability & Lifestyle": [
    "Urban Safety",
    "Waste Management",
    "Markets",
    "Parks & Gardens",
    "Eda City Bus",
  ],
  "Compliance": [
    "Liquor License",
    "Building",
    "Development Control & Physical Planning",
    "Enforcement",
  ],
  "City Planning & Infrastructure": [
    "Streetlights & Traffic Management",
    "Road Furniture & Road Signs",
    "Potholes & Drainage",
    "Strategic Planning",
  ],
};

// Role to Directorate mapping
const roleToDirectorateMapping = {
  // Compliance roles
  "bU_adminC": "Compliance",
  "bU_supervisorC": "Compliance",
  "bU_managerC": "Compliance",
  "bU_directorC": "Compliance",
  
  // Sustainability & Lifestyle roles
  "bU_adminS_L": "Sustainability & Lifestyle",
  "bU_supervisorS_L": "Sustainability & Lifestyle",
  "bU_managerS_L": "Sustainability & Lifestyle",
  "bU_directorS_L": "Sustainability & Lifestyle",
  
  // City Planning & Infrastructure roles
  "bU_adminCPI": "City Planning & Infrastructure",
  "bU_supervisorCPI": "City Planning & Infrastructure",
  "bU_managerCPI": "City Planning & Infrastructure",
  "bU_directorCPI": "City Planning & Infrastructure",
};

const FullscreenFilters = ({
  isOpen,
  selectedCity,
  setSelectedCity,
  category,
  setCategory,
  date,
  setDate,
  locationKeyword,
  setLocationKeyword,
  priority,
  setPriority,
  resetFiltersAndZoom,
  selectedDirectorate,
  setSelectedDirectorate,
  zoomToBounds,
  manualZoomOut,
  markerClicked,
  toggleFilters,
  showStats,
}) => {
  const { userPermissions } = usePermissions();
  const role = userPermissions?.role;

  // Set default directorate based on role when component mounts
  useEffect(() => {
    if (role && roleToDirectorateMapping[role] && !selectedDirectorate) {
      const defaultDirectorate = roleToDirectorateMapping[role];
      setSelectedDirectorate(defaultDirectorate);
    }
    // Set category to empty string (shows all) initially
    if (category === undefined) {
      setCategory("");
    }
  }, [role, selectedDirectorate, category, setSelectedDirectorate, setCategory]);

  // Get issue types based on selected directorate
  const getFilteredIssueTypes = () => {
    if (!selectedDirectorate) {
      // Return all issue types EXCEPT "All" when no directorate is selected
      return [
        ...directorateIssueTypeMapping["Sustainability & Lifestyle"],
        ...directorateIssueTypeMapping.Compliance,
        ...directorateIssueTypeMapping["City Planning & Infrastructure"],
      ];
    }
    return directorateIssueTypeMapping[selectedDirectorate] || [];
  };

  // Get directorate options based on role
  const getDirectorateOptions = () => {
    if (!role) return ["All", "Sustainability & Lifestyle", "Compliance", "City Planning & Infrastructure"];
    
    const userDirectorate = roleToDirectorateMapping[role];
    if (userDirectorate) {
      // For BU-specific roles, only show their directorate
      return ["All", userDirectorate];
    }
    
    // For admin/operator/supervisor, show all options
    return ["All", "Sustainability & Lifestyle", "Compliance", "City Planning & Infrastructure"];
  };

  // Handle directorate change
  const handleDirectorateChange = (e) => {
    const value = e.target.value === "All" ? "" : e.target.value;
    setSelectedDirectorate(value);
    // Reset category to empty string (shows all) when directorate changes
    setCategory("");
  };

  // Trigger zoom bounds whenever filters change, but ONLY if no marker is clicked
  useEffect(() => {
    if (markerClicked) return;
    const timer = setTimeout(() => {
      zoomToBounds();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCity, category, date, locationKeyword, priority, selectedDirectorate, zoomToBounds, markerClicked]);

  const handleReset = () => {
    resetFiltersAndZoom();
    // After reset, set the defaults based on role again
    if (role && roleToDirectorateMapping[role]) {
      const defaultDirectorate = roleToDirectorateMapping[role];
      setSelectedDirectorate(defaultDirectorate);
    }
    // Reset category to empty string (shows all)
    setCategory("");
  };

  const handleCloseFilters = () => {
    if (typeof toggleFilters === 'function') {
      toggleFilters();
    } else if (typeof manualZoomOut === 'function') {
      manualZoomOut();
    }
  };

  const getFilterHeight = () => {
    return showStats ? 'calc(68vh - 4rem)' : 'calc(95vh - 4rem)';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 mt-20 mr-4 w-80 bg-white shadow-lg rounded-lg z-20 flex flex-col border border-gray-300" style={{ height: getFilterHeight() }}>
      <div className="p-6 pb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Filters</h3>
          <button
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={handleCloseFilters}
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className="space-y-5">
          {/* City Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Select Electorate:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All</option>
              <option value="Moresby North-East Open">Moresby North-East Open</option>
              <option value="Moresby North-West Open">Moresby North-West Open</option>
              <option value="Moresby South Open">Moresby South Open</option>
            </select>
          </div>

          {/* Directorate Dropdown - now filtered based on role */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Select Directorate:</label>
            <select
              value={selectedDirectorate || "All"}
              onChange={handleDirectorateChange}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              disabled={role && roleToDirectorateMapping[role]} // Disable if user has a BU-specific role
            >
              {getDirectorateOptions().map((directorate) => (
                <option key={directorate} value={directorate}>
                  {directorate}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown - shows only relevant issue types */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Issue Type:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All</option>
              {getFilteredIssueTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {/* Location Keyword Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Location Keyword:</label>
            <input
              type="text"
              value={locationKeyword}
              onChange={(e) => setLocationKeyword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Enter keyword"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-md mt-4"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenFilters;
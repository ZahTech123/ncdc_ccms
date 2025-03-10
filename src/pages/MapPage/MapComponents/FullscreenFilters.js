import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "../../../styles/scrollbar.css"; // Import the scrollbar CSS

// Mapping of Directorates to their respective issue types
const directorateIssueTypeMapping = {
  "Sustainability & Lifestyle": [
    "Urban Safety",
    "Waste Management",
    "Markets",
    "Parks & Gardens",
    "Eda City Bus",
  ],
  Compliance: ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"],
  "City Planning & Infrastructure": [
    "Streetlights & Traffic Management",
    "Road Furniture & Road Signs",
    "Potholes & Drainage",
    "Strategic Planning",
  ],
};

// Combined list of issue types from all directorates
const allIssueTypes = [
  "All",
  ...directorateIssueTypeMapping["Sustainability & Lifestyle"],
  ...directorateIssueTypeMapping.Compliance,
  ...directorateIssueTypeMapping["City Planning & Infrastructure"],
];

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
  showStats, // Added showStats prop
}) => {
  // Get issue types based on selected directorate
  const getFilteredIssueTypes = () => {
    if (!selectedDirectorate) {
      return allIssueTypes;
    }

    return directorateIssueTypeMapping[selectedDirectorate] || allIssueTypes;
  };

  // Trigger zoom bounds whenever filters change, but ONLY if no marker is clicked
  useEffect(() => {
    // Skip auto-zooming if a marker is clicked
    if (markerClicked) return;
    
    // Small delay to allow markers to update first
    const timer = setTimeout(() => {
      zoomToBounds();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [selectedCity, category, date, locationKeyword, priority, selectedDirectorate, zoomToBounds, markerClicked]);

  // Single handler for reset button
  const handleReset = () => {
    resetFiltersAndZoom();
  };

  // Handler for closing the filter panel - with safety check for toggleFilters
  const handleCloseFilters = () => {
    // Use the provided toggleFilters if it's a function
    if (typeof toggleFilters === 'function') {
      toggleFilters(); // Close the filter panel
    } else {
      console.warn('toggleFilters prop is not a function or not provided');
      // Fallback to manualZoomOut if available
      if (typeof manualZoomOut === 'function') {
        manualZoomOut();
      }
    }
  };

  // Calculate the height based on whether stats are shown
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

      {/* Added scrollable container with custom-scrollbar class */}
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

          {/* Directorate Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Select Directorate:</label>
            <select
              value={selectedDirectorate}
              onChange={(e) => setSelectedDirectorate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All</option>
              <option value="Sustainability & Lifestyle">Sustainability & Lifestyle</option>
              <option value="Compliance">Compliance</option>
              <option value="City Planning & Infrastructure">City Planning & Infrastructure</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Issue Type:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">Select Issue Type</option>
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

          {/* Reset Button - Changed to Yellow */}
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
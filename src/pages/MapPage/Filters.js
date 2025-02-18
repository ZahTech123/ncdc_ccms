// Filters.js
import React from "react";

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

const Filters = ({
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
}) => {
  return (
    <div className="w-1/4 bg-gray-700 p-6 rounded-lg space-y-6">
      <h2 className="text-lg font-semibold text-white">Filters</h2>

      {/* City Dropdown */}
      <div className="space-y-2">
        <label className="text-sm text-white">Select Electorate:</label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white"
        >
          <option value="">All</option>
          <option value="Moresby North-East Open">Moresby North-East Open</option>
          <option value="Moresby North-West Open">Moresby North-West Open</option>
          <option value="Moresby South Open">Moresby South Open</option>
        </select>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <label className="text-sm text-white">Issue Type:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white"
        >
          {allIssueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Dropdown */}
      <div className="space-y-2">
        <label className="text-sm text-white">Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white"
        >
          <option value="">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="space-y-2">
        <label className="text-sm text-white">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white"
        />
      </div>

      {/* Location Keyword Filter */}
      <div className="space-y-2">
        <label className="text-sm text-white">Location Keyword:</label>
        <input
          type="text"
          value={locationKeyword}
          onChange={(e) => setLocationKeyword(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white"
          placeholder="Enter keyword"
        />
      </div>

      {/* Apply Filter Button */}
      <button
        onClick={resetFiltersAndZoom}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold p-2 rounded-md transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default Filters;
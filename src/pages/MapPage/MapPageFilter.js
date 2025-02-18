import React, { useState} from 'react';

const MapPageFilter = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [locationKeyword, setLocationKeyword] = useState('');

  // Reset filters and zoom function (assuming it's defined elsewhere)
  const resetFiltersAndZoom = () => {
    setSelectedCity('');
    setCategory('');
    setDate('');
    setLocationKeyword('');
    // Add any zoom reset logic here
  };

  return (
    <div className="w-1/4 bg-gray-700 p-6 rounded-lg space-y-6">
      <h2 className="text-lg font-semibold text-white">Filterss</h2>

      {/* City Dropdown */}
      <div className="space-y-2">
        <label className="text-sm text-white">Select City:</label>
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
        <label className="text-sm text-white">Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-600 text-white"
        >
          <option value="">All</option>
          <option value="Garbage">Garbage</option>
          <option value="Crime Alert">Crime Alert</option>
          <option value="Traffic Light">Traffic Light</option>
          <option value="Pothole">Pothole</option>
          <option value="Water Leak">Water Leak</option>
          <option value="Road Damage">Road Damage</option>
          <option value="Streetlight">Streetlight</option>
          <option value="Vandalism">Vandalism</option>
          <option value="Traffic Jam">Traffic Jam</option>
          <option value="Power Outage">Power Outage</option>
          <option value="Fire Hazard">Fire Hazard</option>
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

export default MapPageFilter;

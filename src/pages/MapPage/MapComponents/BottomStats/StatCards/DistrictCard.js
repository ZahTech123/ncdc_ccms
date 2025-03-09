import React, { useState, useMemo } from 'react';
import { useTickets } from "../../../../../context/TicketsContext";

const DistrictCard = () => {
  const { filteredTickets } = useTickets();
  const [activeDistrict, setActiveDistrict] = useState('northwest');
  const [isDistrictMenuOpen, setIsDistrictMenuOpen] = useState(false);

  // Log initial filtered tickets
  console.log('Initial filtered tickets:', filteredTickets);

  // Move districtMapping inside useMemo or wrap it in its own useMemo
  const districtMapping = useMemo(() => ({
    northwest: "Moresby North-West Open",
    northeast: "Moresby North-East Open",
    south: "Moresby South Open"
  }), []);

  // Process tickets data for the selected district
  const districtTickets = useMemo(() => {
    const electorate = districtMapping[activeDistrict];
    const filtered = filteredTickets.filter(ticket => 
      ticket.electorate === electorate
    );
    console.log(`Filtered tickets for ${activeDistrict}:`, filtered);
    return filtered;
  }, [filteredTickets, activeDistrict, districtMapping]);

  // Calculate statistics
  const districtStats = useMemo(() => {
    const totalTickets = districtTickets.length;
    const resolvedTickets = districtTickets.filter(t => t.status === 'Resolved').length;
    const resolvedPercentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // Calculate the percentage of total tickets for the selected district out of all tickets
    const totalTicketsPercentage = filteredTickets.length > 0 ? Math.round((totalTickets / filteredTickets.length) * 100) : 0;

    console.log('District statistics:', {
      totalTickets,
      resolvedTickets,
      resolvedPercentage,
      totalTicketsPercentage
    });

    return {
      totalTickets,
      resolvedTickets,
      resolvedPercentage,
      totalTicketsPercentage
    };
  }, [districtTickets, filteredTickets]);

  // Define districts with dynamic data
  const districts = {
    northwest: {
      title: "Moresby North-West Open",
      subtitle: "",
      additionalInfo: {
        label: "Building",
        value: `${districtStats.resolvedTickets} Resolved` // Resolved tickets count
      }
    },
    northeast: {
      title: "Moresby North-East Open",
      subtitle: "",
      additionalInfo: {
        label: "Road",
        value: `${districtStats.resolvedTickets} Resolved` // Resolved tickets count
      }
    },
    south: {
      title: "Moresby South Open",
      subtitle: "",
      additionalInfo: {
        label: "Water",
        value: `${districtStats.resolvedTickets} Resolved` // Resolved tickets count
      }
    }
  };

  // Active district data
  const activeDistrictData = {
    ...districts[activeDistrict],
    count: districtStats.totalTickets, // Total tickets for the district
    percentage: `${districtStats.totalTicketsPercentage}%`, // Percentage of total tickets out of all tickets
    totalComplaints: districtStats.totalTickets, // Total tickets for the district
    resolvedPercentage: `${districtStats.resolvedPercentage}%` // Resolved percentage
  };

  const toggleDistrictMenu = () => {
    console.log('Toggling district menu. Current state:', isDistrictMenuOpen);
    setIsDistrictMenuOpen(!isDistrictMenuOpen);
  };

  const selectDistrict = (district) => {
    console.log('Selected district:', district);
    setActiveDistrict(district);
    setIsDistrictMenuOpen(false);
  };

  // Log active district data
  console.log('Active district data:', activeDistrictData);

  return (
    <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm flex flex-col relative" style={{ height: "100%" }}>
      {/* District Card */}
      <div className="flex justify-between items-start">
        <div className="border-b pb-2">
          <h3 className="text-sm font-semibold text-blue-700">{activeDistrictData.title}</h3>
          {activeDistrictData.subtitle && <p className="text-xs text-gray-600">{activeDistrictData.subtitle}</p>}
        </div>
        <div className="ml-2">
          <button
            onClick={toggleDistrictMenu}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* District Dropdown Menu */}
      {isDistrictMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {Object.keys(districts).map((districtKey) => (
              <button
                key={districtKey}
                onClick={() => selectDistrict(districtKey)}
                className={`block px-4 py-2 text-sm text-left w-full ${
                  activeDistrict === districtKey ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {districts[districtKey].title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* District Card Content */}
      <div className="flex-1 mt-4 space-y-3 w-full">
        <div className="flex justify-between items-center py-2">
          <div className="text-center">
            {/* Percentage of Total Tickets */}
            {activeDistrictData.percentage && (
              <>
                <p className="text-2xl font-bold text-blue-600">{activeDistrictData.percentage}</p>
                <p className="text-xs text-gray-500">of all Complaints</p>
              </>
            )}
          </div>

          <div className="border-l pl-3">
            <p className="text-xs font-medium text-gray-700">Total of</p>
            <p className="text-lg font-bold text-gray-800">{activeDistrictData.totalComplaints}</p>
            <p className="text-xs font-medium text-gray-700">Complaints</p>
          </div>
        </div>
      </div>

      {/* Additional Info for District */}
      {activeDistrictData.additionalInfo && (
        <div className="bg-gray-50 p-2 rounded mt-auto">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-700">{activeDistrictData.additionalInfo.label}</p>
            <p className="text-xs font-bold text-blue-600">{activeDistrictData.additionalInfo.value}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictCard;
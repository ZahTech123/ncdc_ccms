import React, { useState, useMemo } from 'react';
import { useTickets } from "../../../../../context/TicketsContext";

const DirectorateCard = () => {
  const { filteredTickets } = useTickets();
  const [activeDirectorate, setActiveDirectorate] = useState('compliance');
  const [isDirectorateMenuOpen, setIsDirectorateMenuOpen] = useState(false);

  // Log initial filtered tickets
  console.log('Initial filtered tickets:', filteredTickets);

  // Process tickets data for the selected directorate
  const directorateTickets = useMemo(() => {
    const filtered = filteredTickets.filter(ticket => 
      ticket.directorate?.toLowerCase() === activeDirectorate.toLowerCase()
    );
    console.log(`Filtered tickets for ${activeDirectorate}:`, filtered);
    return filtered;
  }, [filteredTickets, activeDirectorate]);

  // Calculate statistics
  const directorateStats = useMemo(() => {
    const totalTickets = directorateTickets.length;
    const resolvedTickets = directorateTickets.filter(t => t.status === 'Resolved').length;
    const resolvedPercentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // Calculate the percentage of total tickets for the selected directorate out of all tickets
    const totalTicketsPercentage = filteredTickets.length > 0 ? Math.round((totalTickets / filteredTickets.length) * 100) : 0;

    console.log('Directorate statistics:', {
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
  }, [directorateTickets, filteredTickets]);

  // Define directorates with dynamic data
  const directorates = {
    compliance: {
      title: "Compliance Directorate",
      subtitle: "",
      additionalInfo: {
        label: "Resolved Complaints",
        value: `${directorateStats.resolvedTickets} Resolved`
      }
    },
    sustainability: {
      title: "Sustainability & Livelihood Directorate",
      subtitle: "",
      additionalInfo: {
        label: "Projects",
        value: `${directorateStats.resolvedTickets} Resolved`
      }
    },
    cityPlanning: {
      title: "City Planning & Infrastructure Directorate",
      subtitle: "",
      additionalInfo: {
        label: "Infrastructure",
        value: `${directorateStats.resolvedTickets} Resolved`
      }
    }
  };

  // Active directorate data
  const activeDirectorateData = {
    ...directorates[activeDirectorate],
    percentage: `${directorateStats.totalTicketsPercentage}%`, // Percentage of total tickets out of all tickets
    totalComplaints: directorateStats.totalTickets, // Total tickets for the directorate
    resolvedPercentage: `${directorateStats.resolvedPercentage}%` // Resolved percentage
  };

  const toggleDirectorateMenu = () => {
    console.log('Toggling directorate menu. Current state:', isDirectorateMenuOpen);
    setIsDirectorateMenuOpen(!isDirectorateMenuOpen);
  };

  const selectDirectorate = (directorate) => {
    console.log('Selected directorate:', directorate);
    setActiveDirectorate(directorate);
    setIsDirectorateMenuOpen(false);
  };

  // Log active directorate data
  console.log('Active directorate data:', activeDirectorateData);

  return (
    <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm flex flex-col relative" style={{ height: "100%" }}>
      {/* Directorate Card */}
      <div className="flex justify-between items-start">
        <div className="border-b pb-2">
          <h3 className="text-sm font-semibold text-blue-700">{activeDirectorateData.title}</h3>
          {activeDirectorateData.subtitle && <p className="text-xs text-gray-600">{activeDirectorateData.subtitle}</p>}
        </div>
        <div className="ml-2">
          <button
            onClick={toggleDirectorateMenu}
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

      {/* Directorate Dropdown Menu */}
      {isDirectorateMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {Object.keys(directorates).map((directorateKey) => (
              <button
                key={directorateKey}
                onClick={() => selectDirectorate(directorateKey)}
                className={`block px-4 py-2 text-sm text-left w-full ${
                  activeDirectorate === directorateKey ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {directorates[directorateKey].title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Directorate Card Content */}
      <div className="flex-1 mt-4 space-y-3 w-full">
        <div className="flex justify-between items-center py-2">
          <div className="text-center">
            {/* Percentage of Total Tickets */}
            {activeDirectorateData.percentage && (
              <>
                <p className="text-2xl font-bold text-blue-600">{activeDirectorateData.percentage}</p>
                <p className="text-xs text-gray-500">of all Complaints</p>
              </>
            )}
          </div>

          <div className="border-l pl-3">
            <p className="text-xs font-medium text-gray-700">Total of</p>
            <p className="text-lg font-bold text-gray-800">{activeDirectorateData.totalComplaints}</p>
            <p className="text-xs font-medium text-gray-700">Complaints</p>
          </div>
        </div>
      </div>

      {/* Additional Info for Directorate */}
      {activeDirectorateData.additionalInfo && (
        <div className="bg-gray-50 p-2 rounded mt-auto">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-700">{activeDirectorateData.additionalInfo.label}</p>
            <p className="text-xs font-bold text-blue-600">{activeDirectorateData.additionalInfo.value}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorateCard;
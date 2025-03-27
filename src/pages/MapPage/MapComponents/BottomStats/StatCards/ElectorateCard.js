import React, { useState, useMemo } from 'react';
import { useTickets } from "../../../../../context/TicketsContext";
import { usePermissions } from "../../../../../context/PermissionsContext";
import { filterTicketsRoles } from "../../../../../utils/ticketFilters";

const districtsData = {
  northwest: {
    title: "Moresby North-West Open",
    subtitle: "",
    additionalInfoLabel: "Building"
  },
  northeast: {
    title: "Moresby North-East Open",
    subtitle: "",
    additionalInfoLabel: "Road"
  },
  south: {
    title: "Moresby South Open",
    subtitle: "",
    additionalInfoLabel: "Water"
  }
};

const DistrictCard = () => {
  const { filteredTickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  
  const [activeDistrict, setActiveDistrict] = useState('northwest');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Filter tickets based on user role
  const roleFilteredTickets = useMemo(() => {
    return filterTicketsRoles(filteredTickets, role);
  }, [filteredTickets, role]);

  // Process tickets data for the selected district
  const filteredTicketsByDistrict = useMemo(() => {
    const districtName = districtsData[activeDistrict].title;
    return roleFilteredTickets.filter(ticket => 
      ticket.electorate === districtName
    );
  }, [roleFilteredTickets, activeDistrict]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTickets = filteredTicketsByDistrict.length;
    const resolvedTickets = filteredTicketsByDistrict.filter(t => t.status === 'Resolved').length;
    const resolvedPercentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    const totalTicketsPercentage = roleFilteredTickets.length > 0 
      ? Math.round((totalTickets / roleFilteredTickets.length) * 100) 
      : 0;

    return {
      totalTickets,
      resolvedTickets,
      resolvedPercentage,
      totalTicketsPercentage
    };
  }, [filteredTicketsByDistrict, roleFilteredTickets]);

  // Compose active data for display
  const activeData = useMemo(() => {
    const district = districtsData[activeDistrict];
    return {
      title: district.title,
      subtitle: district.subtitle,
      additionalInfo: {
        label: district.additionalInfoLabel,
        value: `${stats.resolvedTickets} Resolved`
      },
      percentage: `${stats.totalTicketsPercentage}%`,
      totalComplaints: stats.totalTickets,
      resolvedPercentage: `${stats.resolvedPercentage}%`
    };
  }, [activeDistrict, stats]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const selectDistrict = (district) => {
    setActiveDistrict(district);
    setIsMenuOpen(false);
  };

  return (
    <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm flex flex-col relative" style={{ height: "100%" }}>
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div className="border-b pb-2">
          <h3 className="text-sm font-semibold text-blue-700">{activeData.title}</h3>
          {activeData.subtitle && <p className="text-xs text-gray-600">{activeData.subtitle}</p>}
        </div>
        <div className="ml-2">
          <button
            onClick={toggleMenu}
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

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {Object.keys(districtsData).map((districtKey) => (
              <button
                key={districtKey}
                onClick={() => selectDistrict(districtKey)}
                className={`block px-4 py-2 text-sm text-left w-full ${
                  activeDistrict === districtKey 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {districtsData[districtKey].title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="flex-1 mt-4 space-y-3 w-full">
        <div className="flex justify-between items-center py-2">
          <div className="text-center">
            {activeData.percentage && (
              <>
                <p className="text-2xl font-bold text-blue-600">{activeData.percentage}</p>
                <p className="text-xs text-gray-500">of all Complaints</p>
              </>
            )}
          </div>

          <div className="border-l pl-3">
            <p className="text-xs font-medium text-gray-700">Total of</p>
            <p className="text-lg font-bold text-gray-800">{activeData.totalComplaints}</p>
            <p className="text-xs font-medium text-gray-700">Complaints</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {activeData.additionalInfo && (
        <div className="bg-gray-50 p-2 rounded mt-auto">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-700">{activeData.additionalInfo.label}</p>
            <p className="text-xs font-bold text-blue-600">{activeData.additionalInfo.value}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictCard;
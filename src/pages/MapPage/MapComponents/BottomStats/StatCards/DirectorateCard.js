import React, { useState, useMemo } from 'react';
import { useTickets } from "../../../../../context/TicketsContext";
import { usePermissions } from "../../../../../context/PermissionsContext";
import { filterTicketsRoles } from "../../../../../utils/ticketFilters";

const directoratesData = {
  compliance: {
    title: "Compliance Directorate",
    issueTypes: ["Liquor License", "Building", "Development Control & Physical Planning", "Enforcement"],
    subtitle: "",
    additionalInfoLabel: "Resolved Complaints"
  },
  sustainability: {
    title: "Sustainability & Lifestyle Directorate",
    issueTypes: ["Urban Safety", "Waste Management", "Markets", "Parks & Gardens", "Eda City Bus"],
    subtitle: "",
    additionalInfoLabel: "Resolved Projects"
  },
  cityPlanning: {
    title: "City Planning & Infrastructure Directorate",
    issueTypes: ["Streetlights & Traffic Management", "Road Furniture & Road Signs", "Potholes & Drainage", "Strategic Planning"],
    subtitle: "",
    additionalInfoLabel: "Resolved Infrastructure"
  }
};

const DirectorateCard = () => {
  const { filteredTickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  
  const [activeTab, setActiveTab] = useState('directorate');
  const [activeDirectorate, setActiveDirectorate] = useState('compliance');
  const [activeIssueType, setActiveIssueType] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine if user is admin/supervisor/operator
  const isGeneralRole = useMemo(() => {
    return ['admin', 'supervisor', 'operator'].includes(role?.toLowerCase());
  }, [role]);

  const roleFilteredTickets = useMemo(() => {
    return filterTicketsRoles(filteredTickets, role);
  }, [filteredTickets, role]);

  const filteredTicketsBySelection = useMemo(() => {
    if (isGeneralRole || activeTab === 'directorate') {
      const directorateMap = {
        compliance: "Compliance",
        sustainability: "Sustainability & Lifestyle",
        cityPlanning: "City Planning & Infrastructure"
      };
      
      const directorateName = directorateMap[activeDirectorate];
      return roleFilteredTickets.filter(ticket => 
        ticket.directorate?.toLowerCase() === directorateName.toLowerCase()
      );
    } else if (activeTab === 'issueType' && activeIssueType) {
      return roleFilteredTickets.filter(ticket => 
        ticket.issueType === activeIssueType
      );
    }
    return [];
  }, [roleFilteredTickets, activeTab, activeDirectorate, activeIssueType, isGeneralRole]);

  const stats = useMemo(() => {
    const totalTickets = filteredTicketsBySelection.length;
    const resolvedTickets = filteredTicketsBySelection.filter(t => t.status === 'Resolved').length;
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
  }, [filteredTicketsBySelection, roleFilteredTickets]);

  const activeData = useMemo(() => {
    if (isGeneralRole || activeTab === 'directorate') {
      const directorate = directoratesData[activeDirectorate];
      return {
        title: directorate.title,
        subtitle: directorate.subtitle,
        additionalInfo: {
          label: directorate.additionalInfoLabel,
          value: `${stats.resolvedTickets} Resolved`
        },
        percentage: `${stats.totalTicketsPercentage}%`,
        totalComplaints: stats.totalTickets,
        resolvedPercentage: `${stats.resolvedPercentage}%`
      };
    } else if (activeTab === 'issueType' && activeIssueType) {
      const directorate = directoratesData[activeDirectorate];
      return {
        title: activeIssueType,
        subtitle: `Under ${directorate.title}`,
        additionalInfo: {
          label: "Resolved Issues",
          value: `${stats.resolvedTickets} Resolved`
        },
        percentage: `${stats.totalTicketsPercentage}%`,
        totalComplaints: stats.totalTickets,
        resolvedPercentage: `${stats.resolvedPercentage}%`
      };
    }
    return {};
  }, [activeTab, activeDirectorate, activeIssueType, stats, isGeneralRole]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const selectDirectorate = (directorate) => {
    setActiveDirectorate(directorate);
    setActiveIssueType(null);
    setActiveTab('directorate');
    setIsMenuOpen(false);
  };

  const selectIssueType = (issueType) => {
    setActiveIssueType(issueType);
    setActiveTab('issueType');
    setIsMenuOpen(false);
  };

  // Get current directorate based on role for BU-specific roles
  const getCurrentDirectorateForRole = () => {
    if (role?.startsWith('bU_adminC') || role?.startsWith('bU_supervisorC') || 
       role?.startsWith('bU_managerC') || role?.startsWith('bU_directorC')) {
      return 'compliance';
    } else if (role?.startsWith('bU_adminS_L') || role?.startsWith('bU_supervisorS_L') || 
              role?.startsWith('bU_managerS_L') || role?.startsWith('bU_directorS_L')) {
      return 'sustainability';
    } else if (role?.startsWith('bU_adminCPI') || role?.startsWith('bU_supervisorCPI') || 
              role?.startsWith('bU_managerCPI') || role?.startsWith('bU_directorCPI')) {
      return 'cityPlanning';
    }
    return activeDirectorate;
  };

  const currentDirectorate = getCurrentDirectorateForRole();
  const currentIssueTypes = directoratesData[currentDirectorate]?.issueTypes || [];

  return (
    <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm flex flex-col relative" style={{ height: "100%" }}>
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div className="border-b pb-2">
          <h3 className="text-sm font-semibold text-blue-700">{activeData.title}</h3>
          {activeData.subtitle && <p className="text-xs text-gray-600">{activeData.subtitle}</p>}
        </div>
        {(!isGeneralRole && currentIssueTypes.length > 0) || isGeneralRole ? (
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
        ) : null}
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {isGeneralRole ? (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500">Directorates</div>
                {Object.keys(directoratesData).map((directorateKey) => (
                  <button
                    key={`dir-${directorateKey}`}
                    onClick={() => selectDirectorate(directorateKey)}
                    className={`block px-4 py-2 text-sm text-left w-full ${
                      activeTab === 'directorate' && activeDirectorate === directorateKey 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {directoratesData[directorateKey].title}
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500">Issue Types</div>
                {currentIssueTypes.map((issueType) => (
                  <button
                    key={`issue-${issueType}`}
                    onClick={() => selectIssueType(issueType)}
                    className={`block px-4 py-2 text-sm text-left w-full ${
                      activeTab === 'issueType' && activeIssueType === issueType
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {issueType}
                  </button>
                ))}
              </>
            )}
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
                <p className="text-xs text-gray-500">of all {isGeneralRole ? 'Complaints' : 'Issues'}</p>
              </>
            )}
          </div>

          <div className="border-l pl-3">
            <p className="text-xs font-medium text-gray-700">Total of</p>
            <p className="text-lg font-bold text-gray-800">{activeData.totalComplaints}</p>
            <p className="text-xs font-medium text-gray-700">{isGeneralRole ? 'Complaints' : 'Issues'}</p>
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

export default DirectorateCard;
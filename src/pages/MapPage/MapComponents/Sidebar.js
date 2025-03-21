import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiMenu } from 'react-icons/fi';
import DynamicCards2 from '../DynamicCards2';
import TicketSummary from '../TicketSummary';

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  handleSearchChange,
  searchedComplaints = [],
  markersRef,
  flyToLocation,
  setSelectedComplaint,
  setShowModal,
  isFullscreen,
  toggleSidebar,
  role,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Improved search function with fuzzy matching
  const fuzzyMatch = (text, query) => {
    if (!text || !query) return false;
    const textStr = String(text).toLowerCase();
    const queryStr = query.toLowerCase();
    
    // Use a more flexible matching approach
    const queryTerms = queryStr.split(/\s+/).filter(term => term.length > 0);
    
    // If any term matches, consider it a match
    return queryTerms.some(term => textStr.includes(term));
  };

  // Memoize filtered suggestions with improved search
  const filteredSuggestions = useMemo(() => {
    if (localSearchQuery.trim() === '') return [];

    return searchedComplaints
      .map(complaint => {
        // Calculate match score across all relevant fields
        const fields = [
          'ticketId',
          'team',
          'suburb',
          'electorate',
          'directorate',
          'status',  // This includes "Verified" if present in tickets
          'issueType',
          'currentHandler',
          'description'
        ];

        let score = 0;
        const matches = {};

        fields.forEach(field => {
          const fieldValue = complaint[field] || '';
          if (fuzzyMatch(fieldValue, localSearchQuery)) {
            matches[field] = true;
            // Weight different fields differently
            if (field === 'ticketId') {
              score += 3;
            } else if (field === 'description') {
              score += 1.5;
            } else if (field === 'status' || field === 'issueType') {
              score += 2;
            } else {
              score += 1;
            }
          } else {
            matches[field] = false;
          }
        });

        return { ...complaint, score, _matches: matches };
      })
      .filter(complaint => complaint.score > 0) // Only include matches
      .sort((a, b) => b.score - a.score); // Sort by relevance
  }, [localSearchQuery, searchedComplaints]);

  // Update local search query when parent search query changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setLocalSearchQuery(newQuery);

    // Only filter if there's actual input
    if (newQuery.trim() !== '') {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Update parent component's search query as well
    if (handleSearchChange) {
      const syntheticEvent = { target: { value: newQuery } };
      handleSearchChange(syntheticEvent);
    }
  };

  // Improved highlight function for partial matches that handles word boundaries
  const highlightMatch = (text, query) => {
    if (!text || !query || query.trim() === '') return text;
    
    const textStr = String(text);
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    if (queryTerms.length === 0) return text;
    
    // Create array of parts to build highlighted text
    let parts = [textStr];
    
    queryTerms.forEach(term => {
      const newParts = [];
      
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        
        const lowerPart = part.toLowerCase();
        const splitIndex = lowerPart.indexOf(term);
        
        if (splitIndex === -1) {
          newParts.push(part);
          return;
        }
        
        const before = part.substring(0, splitIndex);
        const match = part.substring(splitIndex, splitIndex + term.length);
        const after = part.substring(splitIndex + term.length);
        
        if (before) newParts.push(before);
        newParts.push(
          <span key={`highlight-${Math.random()}`} className="bg-yellow-200 font-medium">
            {match}
          </span>
        );
        if (after) newParts.push(after);
      });
      
      parts = newParts;
    });
    
    return <>{parts}</>;
  };

  // Handle suggestion click - IMPORTANT CHANGE: Keep the search query as is
  const handleSuggestionClick = (complaint) => {
    // Do not change the search query to just the ticketId
    // Instead, keep whatever the user typed that matched this complaint
    setShowSuggestions(false);
    flyToLocation(complaint.longitude, complaint.latitude);
    
    // Select the complaint but don't change the search text
    setSelectedComplaint(complaint);
  };

  // Function to determine what to display based on what matched the search
  const getDisplayInfo = (complaint, query) => {
    if (!complaint._matches) return null;

    // First priority - always show ticketId at the top
    const primaryInfo = complaint.ticketId;

    // Determine which fields to show based on what matched
    let leftInfo = [];
    let rightInfo = [];

    // Always include Issue Type and Current Handler on the left
    leftInfo.push(
      <span key="issueType">
        <span className="font-medium">Issue type:</span>{" "}
        <span className={`font-bold ${complaint._matches.issueType ? "text-blue-600" : ""}`}>
          {highlightMatch(complaint.issueType, query)}
        </span>
      </span>
    );

    if (complaint.currentHandler) {
      leftInfo.push(
        <span key="handler" className={complaint._matches.currentHandler ? "text-blue-600" : ""}>
          {" "}{highlightMatch(complaint.currentHandler, query)}
        </span>
      );
    }

    // Always include Suburb and Status on the right
    if (complaint.suburb) {
      rightInfo.push(
        <span key="suburb" className={complaint._matches.suburb ? "text-blue-600" : ""}>
          {highlightMatch(complaint.suburb, query)}
        </span>
      );
    }

    if (complaint.status) {
      rightInfo.push(
        <span key="status" className={complaint._matches.status ? "text-blue-600" : ""}>
          {highlightMatch(complaint.status, query)}
        </span>
      );
    }

    // Add any additional matched fields that we don't normally show
    const addInfo = [];
    
    if (complaint._matches.team) {
      addInfo.push(
        <div key="team" className="text-xs text-blue-600 mt-1">
          Team: {highlightMatch(complaint.team, query)}
        </div>
      );
    }

    if (complaint._matches.electorate) {
      addInfo.push(
        <div key="electorate" className="text-xs text-blue-600 mt-1">
          Electorate: {highlightMatch(complaint.electorate, query)}
        </div>
      );
    }

    if (complaint._matches.directorate) {
      addInfo.push(
        <div key="directorate" className="text-xs text-blue-600 mt-1">
          Directorate: {highlightMatch(complaint.directorate, query)}
        </div>
      );
    }
    
    // Add description preview if it matched
    if (complaint._matches.description && complaint.description) {
      const previewText = complaint.description.length > 60 
        ? complaint.description.substring(0, 60) + '...' 
        : complaint.description;
        
      addInfo.push(
        <div key="description" className="text-xs text-blue-600 mt-1 italic">
          "{highlightMatch(previewText, query)}"
        </div>
      );
    }

    return { 
      primaryInfo, 
      leftInfo, 
      rightInfo, 
      addInfo: addInfo.length > 0 ? addInfo : undefined 
    };
  };

  return (
    <>
      {/* Top Bar with Burger Icon, Search Bar, and Ticket Summary */}
      <div className="absolute top-5 left-4 z-50 flex flex-col gap-2">
        {/* First row: Burger, Search, and Ticket Summary */}
        <div className="flex items-start gap-2">
          {/* Burger Icon */}
          <button
            onClick={toggleSidebar}
            className="bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
            style={{ width: '40px', height: '40px' }}
          >
            <FiMenu className="w-5 h-5 text-gray-500" />
          </button>

          {/* Search Bar and Ticket Summary */}
          <div className="flex flex-row gap-2">
            {/* Search Bar */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg p-2 flex items-center w-80">
                <FiSearch className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search by any ticket info..."
                  className="outline-none flex-1 text-black"
                  value={localSearchQuery}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (localSearchQuery.trim() !== '') {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </div>

              {/* Suggestions Dropdown - Only show when there's a search query */}
              {showSuggestions && localSearchQuery.trim() !== '' && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((complaint) => {
                      const displayInfo = getDisplayInfo(complaint, localSearchQuery);
                      if (!displayInfo) return null;

                      return (
                        <div
                          key={complaint.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                          onMouseDown={() => handleSuggestionClick(complaint)}
                        >
                          <p className={`text-sm font-medium ${complaint._matches.ticketId ? "text-blue-700" : "text-gray-700"}`}>
                            {highlightMatch(displayInfo.primaryInfo, localSearchQuery)}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                              {displayInfo.leftInfo}
                            </p>
                            <p className="text-xs text-gray-700">
                              {displayInfo.rightInfo.length > 0 ? displayInfo.rightInfo.reduce((prev, curr, i) => [
                                prev, 
                                i > 0 ? <span key={`dot-${i}`}> • </span> : null, 
                                curr
                              ].filter(Boolean)) : null}
                            </p>
                          </div>
                          {displayInfo.addInfo && displayInfo.addInfo}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No results found for "{localSearchQuery}"</div>
                  )}
                  {filteredSuggestions.length > 0 && (
                    <div className="p-2 text-xs text-gray-400 text-center bg-gray-50">
                      {filteredSuggestions.length} result{filteredSuggestions.length !== 1 ? 's' : ''} found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ticket Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 overflow-x-auto">
              <TicketSummary tickets={searchedComplaints} role={role} />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <div
        className="absolute top-28 left-4 z-50 transform transition-all duration-300 ease-in-out rounded-lg"
        style={{
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-110%)',
          opacity: isSidebarOpen ? 1 : 0,
          height: 'calc(100vh - 140px)', // Adjusted to account for the extra height of ticket summary
          width: '320px',
        }}
      >
        <DynamicCards2
          filteredComplaints={searchedComplaints}
          markersRef={markersRef}
          flyToLocation={flyToLocation}
          setSelectedComplaint={setSelectedComplaint}
          setShowModal={setShowModal}
          isFullscreen={isFullscreen}
        />
      </div>
    </>
  );
};

export default Sidebar;
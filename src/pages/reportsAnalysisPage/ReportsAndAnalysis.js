import React, { useMemo, useState } from "react";
import Section1 from './Section1/Section1';
import Section2 from "./Section2/Section2";
import Section3 from "./Section3/Section3";
import DateFilter from "./DateFilter"; // Import the new component
import { useTickets } from "../../context/TicketsContext";
import { filterTicketsRoles } from "../../utils/ticketFilters";
import { usePermissions } from "../../context/PermissionsContext";

const ReportsAnalysis3 = () => {
  const { tickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  
  // Add state for date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter tickets based on role and date range
  const filteredTickets = useMemo(() => {
    let filteredByRole = filterTicketsRoles(tickets, role);
    
    // Apply date filtering if dates are provided
    if (startDate || endDate) {
      return filteredByRole.filter(ticket => {
        const ticketDate = new Date(ticket.dateSubmitted);
        
        // Check if the ticket date is within the selected range
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // Set to end of day
          return ticketDate >= start && ticketDate <= end;
        } 
        // Only start date is provided
        else if (startDate) {
          const start = new Date(startDate);
          return ticketDate >= start;
        } 
        // Only end date is provided
        else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // Set to end of day
          return ticketDate <= end;
        }
        
        return true;
      });
    }
    
    return filteredByRole;
  }, [tickets, role, startDate, endDate]);

  // Handle change in date inputs
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (filteredTickets.length === 0) {
    return (
      <div className="p-4">
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onClearFilters={clearDateFilters}
        />
        <div className="p-6 bg-gray-700 rounded-md shadow-sm text-center">
          <p>No tickets found matching the current criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Use the DateFilter component */}
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onClearFilters={clearDateFilters}
        resultsCount={filteredTickets.length}
      />
      
      {/* Pass the filtered tickets to each section */}
      <Section1 tickets={filteredTickets} />
      <Section2 tickets={filteredTickets} />
      <Section3 tickets={filteredTickets} />
    </div>
  );
};

export default ReportsAnalysis3;
import React, { useMemo } from "react";
import Section1 from './Section1/Section1';
import Section2 from "./Section2";
import Section3 from "./Section3";
import { useTickets } from "../../context/TicketsContext";
import { filterTicketsRoles } from "../../utils/ticketFilters";
import { usePermissions } from "../../context/PermissionsContext"; // Updated import path


const ReportsAnalysis3 = () => {
  const { tickets } = useTickets();
  const { userPermissions } = usePermissions(); // Get user permissions
  const { role } = userPermissions;

  const filteredTickets = useMemo(() => {
    return filterTicketsRoles(tickets, role);
  }, [tickets, role]);

  // Log the full data and its type
  console.log("ReportsAndAnalysis received data (full):", filteredTickets);
  console.log("Data type of filteredTickets:", typeof filteredTickets);
  console.log("Is filteredTickets an array?", Array.isArray(filteredTickets));

  // Check if filteredTickets is empty
  if (filteredTickets.length === 0) {
    console.log("No tickets data available");
  }

  return (
    <div className="bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        {/* Pass the data as `tickets` prop to Section1 */}
        <Section1 tickets={filteredTickets} />
        <Section2 tickets={filteredTickets} />
        <Section3 />
      </div>
    </div>
  );
};

export default ReportsAnalysis3;




// Set Mapbox access token

// We should use AI analytics to link to all of the nodes and lables of the data
//When user clicks on the analyrics, it provides suggestions to the user for the analytics needed
//or the user can command the AI to do provide the users prefered analytics
//When doing, after the UI changes accordingly, the user can print it. 

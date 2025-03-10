import React, { useMemo } from "react";
import Section1 from './Section1/Section1';
import Section2 from "./Section2/Section2";
import Section3 from "./Section3/Section3";
import { useTickets } from "../../context/TicketsContext";
import { filterTicketsRoles } from "../../utils/ticketFilters";
import { usePermissions } from "../../context/PermissionsContext"; // Updated import path


const ReportsAnalysis3 = () => {
  const { tickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;

  const filteredTickets = useMemo(() => {
    return filterTicketsRoles(tickets, role);
  }, [tickets, role]);

  if (filteredTickets.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white p-6" >
      <div className="container mx-auto">
        <Section1 tickets={filteredTickets} />
        <Section2 tickets={filteredTickets} />
        <Section3 tickets={filteredTickets} />
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

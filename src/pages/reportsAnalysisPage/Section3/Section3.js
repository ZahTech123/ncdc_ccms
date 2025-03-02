import React from "react";
import ComplaintStatusChart from "./ComplaintStatusChart";
import GeneratedReports from "./GeneratedReports";

const Section3 = ({ tickets = [] }) => {
  // Log tickets received by Section3
  console.log("Section3 received tickets:", tickets);
  console.log("Section3 tickets type:", typeof tickets);
  console.log("Section3 tickets is array?", Array.isArray(tickets));

  // Reports data remains here
  const reports = [
    { date: '24/01/2025' },
    { date: '2/12/2024' },
    { date: '23/11/2024' },
    { date: '12/11/2024' },
  ];

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  const handleReportClick = (date) => {
    console.log(`Downloading report from ${date}`);
    // Add your download logic here
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <GeneratedReports 
        reports={reports} 
        onGenerateReport={handleGenerateReport} 
        onReportClick={handleReportClick} 
      />
      <ComplaintStatusChart tickets={tickets} />
    </div>
  );
};

export default Section3;
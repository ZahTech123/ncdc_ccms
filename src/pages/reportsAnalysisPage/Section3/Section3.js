import React from "react";
import ComplaintStatusChart from "./ComplaintStatusChart";
import GeneratedReports from "./GeneratedReports";

const Section3 = ({ tickets = [] }) => {
  const reports = [
    { date: '24/01/2025' },
    { date: '2/12/2024' },
    { date: '23/11/2024' },
    { date: '12/11/2024' },
  ];

  const handleGenerateReport = () => {
    // Generate report logic
  };

  const handleReportClick = (date) => {
    // Download report logic
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
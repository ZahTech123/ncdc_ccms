import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Make sure to install Chart.js
import 'chartjs-adapter-date-fns';

const Section3 = ({ tickets = [] }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const complaints = [
      { issueType: "Garbage", status: "New" },
      { issueType: "Crime Alert", status: "In Progress" },
      { issueType: "Garbage", status: "New" },
      { issueType: "Crime Alert", status: "Resolved" },
      { issueType: "Traffic Light", status: "Overdue" },
      { issueType: "Garbage", status: "New" },
      { issueType: "Traffic Light", status: "Resolved" },
      { issueType: "Pothole", status: "In Progress" },
      { issueType: "Garbage", status: "New" },
      { issueType: "Pothole", status: "In Progress" },
      { issueType: "Garbage", status: "In Progress" },
      { issueType: "Water Leak", status: "New" },
      { issueType: "Crime Alert", status: "Resolved" },
      { issueType: "Streetlight", status: "Overdue" },
      { issueType: "Vandalism", status: "New" },
      { issueType: "Road Damage", status: "In Progress" },
      { issueType: "Pothole", status: "Resolved" },
      { issueType: "Power Outage", status: "New" },
      { issueType: "Traffic Jam", status: "In Progress" },
      { issueType: "Fire Hazard", status: "Overdue" },
    ];

    const issueTypes = [...new Set(complaints.map(complaint => complaint.issueType))];
    const statuses = ["New", "In Progress", "Resolved", "Overdue"];

    const statusCounts = issueTypes.reduce((acc, issue) => {
      acc[issue] = { "New": 0, "In Progress": 0, "Resolved": 0, "Overdue": 0 };
      return acc;
    }, {});

    complaints.forEach(({ issueType, status }) => {
      if (statusCounts[issueType]) {
        statusCounts[issueType][status]++;
      }
    });

    const datasets = statuses.map((status, index) => ({
      label: status,
      data: issueTypes.map(issue => statusCounts[issue][status] || 0),
      backgroundColor: ['#facc15', '#fbbf24', '#f59e0b', '#d97706'][index],
      borderWidth: 1,
      borderRadius: 12,
      borderSkipped: 'bottom',
    }));

    const ctxBarChart = chartRef.current?.getContext("2d");

    if (ctxBarChart) {
      const chartInstance = new Chart(ctxBarChart, {
        type: "bar",
        data: {
          labels: issueTypes,
          datasets: datasets,
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { color: "#fefefe", font: { size: 14, weight: "bold" } },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { color: "#fefefe" } },
            x: { ticks: { color: "#fefefe" } },
          },
        },
      });

      return () => {
        chartInstance.destroy();
      };
    }
  }, []);

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
      {/* Transactions Section */}
      <div className="lg:w-1/4 bg-gray-800 p-6 rounded-lg h-full">
        <div className="bg-gray-800 text-white w-full rounded-lg flex flex-col h-full">
          <h2 className="text-lg font-bold mb-4 text-center">GENERATED REPORTS</h2>
          <div className="flex-grow space-y-3 overflow-y-auto">
            {reports.map((report, index) => (
              <div key={index} className="flex flex-col items-center gap-3 mb-4">
                <button
                  onClick={() => handleReportClick(report.date)}
                  className="group relative mb-1 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="material-icons text-yellow-500 text-2xl">description</span>
                  <span className="material-icons text-yellow-500 text-xs absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform">download</span>
                </button>
                <p className="text-sm text-gray-300">{report.date}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6">
            <button
              onClick={handleGenerateReport}
              className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg w-full hover:bg-yellow-600 transition"
            >
              GENERATE REPORT
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Status Chart Section */}
      <div className="lg:w-3/4 bg-gray-800 p-6 rounded-lg h-full">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Complaint Status Breakdown by Issue Type
        </h2>
        <canvas id="complaintStatusChart" ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default Section3;
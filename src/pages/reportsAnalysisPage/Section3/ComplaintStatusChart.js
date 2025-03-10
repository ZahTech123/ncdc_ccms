import React, { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import 'chartjs-adapter-date-fns';

const ComplaintStatusChart = ({ tickets = [] }) => {
  const chartRef = useRef(null);
  const complaints = useMemo(() => tickets, [tickets]);

  useEffect(() => {
    if (!complaints || complaints.length === 0) return;

    // Extract unique issue types from tickets
    const issueTypes = [...new Set(complaints.map(complaint => complaint.issueType))];

    // Define all statuses to track
    const statuses = ["New", "In Progress", "Closed", "Resolved", "Invalid", "Verified", "Valid", "Overdue"];

    // Initialize status counts for each issue type
    const statusCounts = issueTypes.reduce((acc, issue) => {
      acc[issue] = {
        "New": 0,
        "In Progress": 0,
        "Closed": 0,
        "Resolved": 0,
        "Invalid": 0,
        "Verified": 0,
        "Valid": 0,
        "Overdue": 0
      };
      return acc;
    }, {});

    // Count tickets by issue type and status
    complaints.forEach(({ issueType, status }) => {
      if (statusCounts[issueType] && statusCounts[issueType][status] !== undefined) {
        statusCounts[issueType][status]++;
      }
    });

    // Prepare datasets for Chart.js
    const datasets = statuses.map((status, index) => ({
      label: status,
      data: issueTypes.map(issue => statusCounts[issue][status] || 0),
      backgroundColor: {
        'New': '#10b981', // Green
        'In Progress': '#f59e0b', // Amber
        'Closed': '#6b7280', // Gray
        'Resolved': '#3b82f6', // Blue
        'Invalid': '#ef4444', // Red
        'Verified': '#8b5cf6', // Purple
        'Valid': '#22c55e', // Green
        'Overdue': '#f97316' // Orange
      }[status],
      borderWidth: 1,
      borderRadius: 12,
      borderSkipped: false, // Important: This ensures no borders are skipped for rounding
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
          maintainAspectRatio: false, // Ensure the chart does not maintain aspect ratio
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { color: "#fefefe", font: { size: 14, weight: "bold" } },
            },
          },
          scales: {
            y: { 
              beginAtZero: true, 
              ticks: { color: "#fefefe" } 
            },
            x: { 
              ticks: { 
                color: "#fefefe",
                padding: 10 // Add padding to x-axis labels
              },
              grid: {
                display: false // Hide grid lines on x-axis
              }
            },
          },
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            }
          },
          elements: {
            bar: {
              borderRadius: 12,
              borderSkipped: false,
            }
          }
        },
      });

      return () => {
        chartInstance.destroy();
      };
    }
  }, [complaints]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full h-[500px]">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Complaint Status Breakdown by Issue Type
      </h2>
      <div className="w-full h-full">
        <canvas id="complaintStatusChart" ref={chartRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
};

export default ComplaintStatusChart;
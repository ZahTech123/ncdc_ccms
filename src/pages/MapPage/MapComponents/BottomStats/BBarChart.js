import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, LinearScale, CategoryScale } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTickets } from "../../../../context/TicketsContext";
// Fixed import path
import { statusColors } from "../../../../styles/colors";

Chart.register(BarElement, LinearScale, CategoryScale, ChartDataLabels);

const BarChart = () => {
  const { filteredTickets } = useTickets();

  // Process tickets data for the chart
  const statusCounts = {
    New: 0,
    'In Progress': 0,
    Resolved: 0,
    Overdue: 0,
    Closed: 0,
    Invalid: 0,
    Verified: 0
  };

  // Make sure filteredTickets exists and is an array before trying to iterate
  if (filteredTickets && Array.isArray(filteredTickets)) {
    filteredTickets.forEach(ticket => {
      if (statusCounts.hasOwnProperty(ticket.status)) {
        statusCounts[ticket.status]++;
      }
    });
  }

  console.log("Status Colors:", statusColors); // Debugging line

  return (
    <Bar
      data={{
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: "Tickets by Status",
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map(status => statusColors[status]),
            borderColor: Object.keys(statusCounts).map(status => statusColors[status]),
            borderWidth: 0,
            barThickness: 10,
            borderSkipped: false,
            borderRadius: 15,
          },
        ],
      }}
      options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            display: false
          }
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12,
              },
              color: "#6b7280",
            },
          },
        },
        elements: {
          bar: {
            borderRadius: 15,
            borderSkipped: false,
          }
        }
      }}
    />
  );
};

export default BarChart;
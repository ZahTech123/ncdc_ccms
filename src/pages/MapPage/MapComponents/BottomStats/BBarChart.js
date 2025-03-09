import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, LinearScale, CategoryScale } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTickets } from "../../../../context/TicketsContext";

Chart.register(BarElement, LinearScale, CategoryScale, ChartDataLabels);

const BarChart = () => {
  const { filteredTickets } = useTickets();

  // Log initial filtered tickets
  console.log('Initial filtered tickets for BarChart:', filteredTickets);

  // Process tickets data for the chart
  const statusCounts = {
    New: 0,
    'In Progress': 0,
    Resolved: 0,
    Overdue: 0,
    Closed: 0,
    Invalid: 0
  };

  filteredTickets.forEach(ticket => {
    if (statusCounts.hasOwnProperty(ticket.status)) {
      statusCounts[ticket.status]++;
    }
  });

  console.log('Processed status counts:', statusCounts);

  return (
    <Bar
      data={{
        labels: ["New", "In Progress", "Resolved", "Overdue", "Closed", "Invalid"],
        datasets: [
          {
            label: "Tickets by Status",
            data: Object.values(statusCounts),
            backgroundColor: [
              "#9333ea", "#0d9488", "#eab308", "#f87171", "#2563eb", "#6b7280"
            ],
            borderColor: [
              "#9333ea", "#0d9488", "#eab308", "#f87171", "#2563eb", "#6b7280"
            ],
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
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';

const DonutChart = ({ tickets, role }) => {
  const donutChartRef = useRef(null);
  const donutChartInstance = useRef(null);

  useEffect(() => {
    if (!donutChartRef.current) return;

    const ctxDonut = donutChartRef.current.getContext("2d");

    // Define counts based on the role
    let labels, counts;
    if (role === "admin" || role === "supervisorC" || role === "operator") {
      const newCount = tickets.filter(ticket => ticket.status === "New").length;
      const inProgressCount = tickets.filter(ticket => ticket.status === "In Progress").length;
      const resolvedCount = tickets.filter(ticket => ticket.status === "Resolved").length;
      const overdueCount = tickets.filter(ticket => ticket.status === "Overdue").length;
      const closedCount = tickets.filter(ticket => ticket.status === "Closed").length;
      const invalidCount = tickets.filter(ticket => ticket.status === "Invalid").length;
      const verifiedCount = tickets.filter(ticket => ticket.status === "Verified").length;

      labels = ["New", "In Progress", "Resolved", "Overdue", "Closed", "Invalid", "Verified"];
      counts = [newCount, inProgressCount, resolvedCount, overdueCount, closedCount, invalidCount, verifiedCount];
    } else if (role === "supervisorC") {
      const newCount = tickets.filter(ticket => ticket.status === "New").length;
      const inProgressCount = tickets.filter(ticket => ticket.status === "In Progress").length;
      const closedCount = tickets.filter(ticket => ticket.status === "Closed").length;

      labels = ["New", "In Progress", "Closed"];
      counts = [newCount, inProgressCount, closedCount];
    } else {
      const verifiedCount = tickets.filter(ticket => ticket.status === "Verified").length;
      const inProgressCount = tickets.filter(ticket => ticket.status === "In Progress").length;
      const closedCount = tickets.filter(ticket => ticket.status === "Closed").length;

      labels = ["Verified", "In Progress", "Closed"];
      counts = [verifiedCount, inProgressCount, closedCount];
    }

    const totalComplaints = counts.reduce((a, b) => a + b, 0);

    // Custom plugin to increase spacing between legend and chart
    const legendSpacingPlugin = {
      beforeInit(chart) {
        const origFit = chart.legend.fit;
        chart.legend.fit = function fit() {
          origFit.bind(chart.legend)();
          this.height += 20; // Increase this value to add more spacing
        };
      },
    };

    // Define gradient colors for each segment
    const gradientColors = labels.map((label) => {
      const gradient = ctxDonut.createLinearGradient(0, 0, 0, 400);
      switch (label) {
        case "New":
          gradient.addColorStop(0, "#34d399"); // Light green
          gradient.addColorStop(1, "#059669"); // Dark green
          break;
        case "In Progress":
          gradient.addColorStop(0, "#ddcb0e"); // Light yellow
          gradient.addColorStop(1, "#f49c28"); // Dark yellow
          break;
        case "Resolved":
          gradient.addColorStop(0, "#93c5fd"); // Light blue
          gradient.addColorStop(1, "#2563eb"); // Dark blue
          break;
        case "Overdue":
          gradient.addColorStop(0, "#fdba74"); // Light orange
          gradient.addColorStop(1, "#ea580c"); // Dark orange
          break;
        case "Closed":
          gradient.addColorStop(0, "#9ca3af"); // Light gray
          gradient.addColorStop(1, "#4b5563"); // Dark gray
          break;
        case "Invalid":
          gradient.addColorStop(0, "#fca5a5"); // Light red
          gradient.addColorStop(1, "#dc2626"); // Dark red
          break;
        case "Verified":
          gradient.addColorStop(0, "#a78bfa"); // Light purple
          gradient.addColorStop(1, "#7c3aed"); // Dark purple
          break;
        default:
          gradient.addColorStop(0, "#9ca3af"); // Default to gray
          gradient.addColorStop(1, "#4b5563");
      }
      return gradient;
    });

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    donutChartInstance.current = new Chart(ctxDonut, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: gradientColors,
            borderColor: "#1F2937",
            borderWidth: 0,
            hoverOffset: 4,
            spacing: -5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "80%",
        borderRadius: 20,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "white",
              usePointStyle: true,
              pointStyle: "circle",
              padding: 20,
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            enabled: true, // Enable tooltips on hover
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.raw || 0;
                return `${label}: ${value}`;
              },
            },
          },
          datalabels: {
            color: 'white',
            formatter: (value, context) => {
              return value; // Display the actual value (number) inside the segment
            },
            font: {
              weight: 'bold',
              size: 16,
            },
          },
        },
        animation: {
          onComplete: () => {
            const centerNumberDiv = document.getElementById("centerNumber");
            const centerLabelDiv = document.getElementById("centerLabel");
           
            if (centerNumberDiv) {
              centerNumberDiv.innerHTML = totalComplaints;
            }
            if (centerLabelDiv) {
              centerLabelDiv.innerHTML = "Total Tickets";
            }

          },
        },
      },
      plugins: [legendSpacingPlugin, ChartDataLabels],
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, [tickets, role]); // Add role to the dependency array

  return (
    <div className="text-center slide-in-left bg-gray-700 rounded-lg p-6 mb-8" style={{ animationDelay: "0.2s" }}>
      <div className="chart-container" style={{ position: "relative", height: "400px" }}>
        <canvas id="complaintsDonutChart" ref={donutChartRef} className="block"></canvas>
        <div id="centerNumber" style={{ position: "absolute", top: "53%", left: "48%", transform: "translate(-50%, -50%)", fontSize: "58px", fontWeight: "bold", color: "white" }}></div>
        <div id="centerLabel" style={{ position: "absolute", top: "67%", left: "48%", transform: "translate(-50%, -50%)", fontSize: "20px", color: "white" }}></div>
        <div id="centerTitle" style={{ position: "absolute", top: "65%", left: "48%", transform: "translate(-50%, -50%)", fontSize: "16px", color: "white", fontWeight: "bold" }}></div>
      </div>
      <p className="p-6 slide-in-left" style={{ fontSize: "14px", animationDelay: "0.7s" }}>
        This donut chart visually represents the status of complaints, showing the proportion of Resolved and Pending cases. Out of the total complaints, 25% have been resolved, while 75% remain pending. This breakdown provides a clear snapshot of the current resolution progress.
      </p>
    </div>
  );
};

export default DonutChart;
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';

const DonutChart = ({ tickets, role }) => {
  const donutChartRef = useRef(null);
  const donutChartInstance = useRef(null);

  // Log the role when the component mounts
  useEffect(() => {
    console.log("Confirming role in DonutChart. Role:", role);
  }, [role]);

  useEffect(() => {
    if (!donutChartRef.current) return;

    const ctxDonut = donutChartRef.current.getContext("2d");

    // Define counts based on the role
    let labels, counts;
    if (role === "supervisorC") {
      console.log("Filtering tickets for supervisorC role");
      const newCount = tickets.filter(ticket => ticket.status === "New").length;
      const inProgressCount = tickets.filter(ticket => ticket.status === "In Progress").length;
      const closedCount = tickets.filter(ticket => ticket.status === "Closed").length;

      labels = ["New", "In Progress", "Closed"];
      counts = [newCount, inProgressCount, closedCount];
    } else {
      console.log("Filtering tickets for other roles");
      const verifiedCount = tickets.filter(ticket => ticket.status === "Verified").length;
      const inProgressCount = tickets.filter(ticket => ticket.status === "In Progress").length;
      const closedCount = tickets.filter(ticket => ticket.status === "Closed").length;

      labels = ["Verified", "In Progress", "Closed"];
      counts = [verifiedCount, inProgressCount, closedCount];
    }

    const totalComplaints = counts.reduce((a, b) => a + b, 0);
    console.log("Total complaints:", totalComplaints);

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

    const gradientNew = ctxDonut.createLinearGradient(0, 0, 0, 400);
    gradientNew.addColorStop(0, "#34d399"); // Light green
    gradientNew.addColorStop(1, "#059669"); // Dark green

    const gradientInProgress = ctxDonut.createLinearGradient(0, 0, 0, 400);
    gradientInProgress.addColorStop(0, "#f8df7c"); // Light gold
    gradientInProgress.addColorStop(1, "#eab308"); // Dark gold

    const gradientClosed = ctxDonut.createLinearGradient(0, 0, 0, 400);
    gradientClosed.addColorStop(0, "#9ca3af"); // Light grey
    gradientClosed.addColorStop(1, "#4b5563"); // Dark grey

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
            backgroundColor: [
              gradientNew,        // New - Green gradient
              gradientInProgress, // In Progress - Gold gradient
              gradientClosed      // Closed - Grey gradient
            ],
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
import React, { useRef, useEffect, useMemo } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTickets } from "../../../../context/TicketsContext";
import { usePermissions } from "../../../../context/PermissionsContext";
import { filterTicketsRoles } from "../../../../utils/ticketFilters";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, ChartDataLabels);

const DonutChart = ({ COLORS }) => {
  const { filteredTickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  const donutChartRef = useRef(null);
  const donutChartInstance = useRef(null);

  // Apply role-based filtering
  const roleFilteredTickets = useMemo(() => {
    return filterTicketsRoles(filteredTickets, role);
  }, [filteredTickets, role]);

  // Process tickets data by priority
  const priorityData = useMemo(() => {
    const counts = {
      High: 0,
      Medium: 0,
      Low: 0
    };

    roleFilteredTickets.forEach(ticket => {
      if (counts.hasOwnProperty(ticket.priority)) {
        counts[ticket.priority]++;
      }
    });

    const processedData = [
      { name: 'High', value: counts.High },
      { name: 'Medium', value: counts.Medium },
      { name: 'Low', value: counts.Low }
    ];

    return processedData;
  }, [roleFilteredTickets]);

  useEffect(() => {
    if (!donutChartRef.current) return;

    const ctxDonut = donutChartRef.current.getContext("2d");
    const totalTickets = priorityData.reduce((acc, curr) => acc + curr.value, 0);

    const gradientColors = priorityData.map((item, index) => {
      const gradient = ctxDonut.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, COLORS[index]);
      gradient.addColorStop(1, COLORS[index]);
      return gradient;
    });

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    donutChartInstance.current = new Chart(ctxDonut, {
      type: "doughnut",
      data: {
        labels: priorityData.map((item) => item.name),
        datasets: [
          {
            data: priorityData.map((item) => item.value),
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
        maintainAspectRatio: false,
        cutout: "78%",
        borderRadius: 15,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.raw || 0;
                return `${label}: ${value}`;
              },
            },
          },
          datalabels: {
            color: "white",
            formatter: (value) => {
              return value;
            },
            font: {
              weight: "bold",
              size: 14,
            },
          },
        },
        animation: {
          onComplete: () => {
            const centerNumberDiv = document.getElementById("centerNumber");
            const centerLabelDiv = document.getElementById("centerLabel");

            if (centerNumberDiv) {
              centerNumberDiv.innerHTML = totalTickets;
            }
            if (centerLabelDiv) {
              centerLabelDiv.innerHTML = "Total Tickets";
            }
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, [priorityData, COLORS]);

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="chart-container" style={{ position: "relative", height: "150px", width: "150px" }}>
        <canvas id="priorityDonutChart" ref={donutChartRef} width="150" height="150"></canvas>
        <div className="center-content" style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div id="centerNumber" style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "black",
            lineHeight: "1",
            marginBottom: "2px"
          }}></div>
          <div id="centerLabel" style={{
            fontSize: "12px",
            color: "black",
            lineHeight: "1"
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
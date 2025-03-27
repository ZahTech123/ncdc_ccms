import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, LinearScale, CategoryScale } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTickets } from "../../../../context/TicketsContext";
import { usePermissions } from "../../../../context/PermissionsContext";
import { filterTicketsRoles } from "../../../../utils/ticketFilters";
import { statusColors } from "../../../../styles/colors";

Chart.register(BarElement, LinearScale, CategoryScale, ChartDataLabels);

const BarChart = () => {
  const { filteredTickets } = useTickets();
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;

  // Apply role-based filtering
  const roleFilteredTickets = useMemo(() => {
    return filterTicketsRoles(filteredTickets, role);
  }, [filteredTickets, role]);

  // Process tickets data for the chart
  const statusCounts = useMemo(() => {
    const counts = {
      New: 0,
      'In Progress': 0,
      Resolved: 0,
      Overdue: 0,
      Closed: 0,
      Invalid: 0,
      Verified: 0
    };

    if (roleFilteredTickets && Array.isArray(roleFilteredTickets)) {
      roleFilteredTickets.forEach(ticket => {
        if (counts.hasOwnProperty(ticket.status)) {
          counts[ticket.status]++;
        }
      });
    }

    return counts;
  }, [roleFilteredTickets]);

  const chartData = useMemo(() => ({
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
  }), [statusCounts]);

  const chartOptions = useMemo(() => ({
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
  }), []);

  return (
    <Bar
      data={chartData}
      options={chartOptions}
    />
  );
};

export default BarChart;
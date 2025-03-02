import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LineGraph = ({ tickets }) => {
    const lineChartRef = useRef(null);
    const lineChartInstance = useRef(null);

    useEffect(() => {
        console.log("Tickets data in LineGraph:", tickets);

        if (!tickets || tickets.length === 0) return;

        // Define the 3 electorates to track
        const electorates = ['Moresby North-West Open', 'Moresby North-East Open', 'Moresby South Open'];

        // Create a map to store data for each electorate
        const electorateData = new Map();
        electorates.forEach(electorate => {
            electorateData.set(electorate, {
                dates: new Map(),
                cumulativeCounts: []
            });
        });

        // Process tickets
        tickets.forEach(ticket => {
            const date = new Date(ticket.dateSubmitted).toISOString().split('T')[0];
            const electorate = ticket.electorate || 'Unknown';

            if (electorateData.has(electorate)) {
                const electorateEntry = electorateData.get(electorate);
                electorateEntry.dates.set(date, (electorateEntry.dates.get(date) || 0) + 1);
            }
        });

        // Prepare datasets for Chart.js
        const datasets = [];
        const colors = {
            'Moresby North-West Open': '#f97316', // Dark Orange
            'Moresby North-East Open': '#fb923c', // Mid Orange
            'Moresby South Open': '#fdba74' // Light Orange
        };

        electorateData.forEach((data, electorate) => {
            const dates = Array.from(data.dates.keys()).sort();
            const counts = dates.map(date => data.dates.get(date));

            // Calculate cumulative counts
            let cumulativeCount = 0;
            const cumulativeCounts = counts.map(count => {
                cumulativeCount += count;
                return cumulativeCount;
            });

            datasets.push({
                label: electorate,
                data: cumulativeCounts,
                borderColor: colors[electorate],
                backgroundColor: `${colors[electorate]}20`, // Add 20% opacity
                fill: false,
                tension: 0.4,
            });
        });

        // Get all unique dates for labels
        const allDates = new Set();
        electorateData.forEach(data => {
            Array.from(data.dates.keys()).forEach(date => allDates.add(date));
        });
        const labels = Array.from(allDates).sort();

        const lineData = {
            labels: labels,
            datasets: datasets
        };

        if (lineChartInstance.current) {
            lineChartInstance.current.destroy();
        }

        const ctxLine = lineChartRef.current.getContext("2d");
        lineChartInstance.current = new Chart(ctxLine, {
            type: "line",
            data: lineData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: "day",
                            tooltipFormat: "yyyy-MM-dd",
                        },
                        title: {
                            display: true,
                            text: "Date Submitted",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Cumulative Tickets",
                        },
                    },
                },
            },
        });

        return () => {
            if (lineChartInstance.current) {
                lineChartInstance.current.destroy();
            }
        };
    }, [tickets]);

    return (
        <div className="lg:w-2/3 bg-gray-800 p-6 rounded-lg mb-8">
            <p className="text-3xl font-bold text-center">Ticket Trends by Electorate</p>
            <canvas id="balanceChart" ref={lineChartRef} className="mt-6"></canvas>
        </div>
    );
};

export default LineGraph;
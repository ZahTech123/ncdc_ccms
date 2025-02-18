import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const Section2 = () => {
    // References for the line chart canvas and instance
    const lineChartRef = useRef(null);
    const lineChartInstance = useRef(null);

    useEffect(() => {
        // Get the canvas context for drawing the chart
        const ctxLine = lineChartRef.current.getContext("2d");

        // Scale factor for normalizing percentage values
        const scaleFactor = 10;

        // Define the data for the line chart
        const lineData = {
            labels: [
                "2025-01-04", "2025-01-06", "2025-01-09", "2025-01-10", "2025-01-11",
                "2025-01-12", "2025-01-14", "2025-01-15", "2025-01-17", "2025-01-18",
                "2025-01-19", "2025-01-20", "2025-01-21", "2025-01-23", "2025-01-24",
                "2025-01-25", "2025-01-26", "2025-01-27", "2025-01-29",
            ],
            datasets: [
                {
                    label: "Resolution Progress (%)",
                    data: [43, 33, 40, 37, 58, 98, 100, 48, 31, 20, 100, 65, 94, 80, 75, 15, 15, 43, 10].map((value) => value / scaleFactor),
                    borderColor: "#facc15",
                    backgroundColor: "rgba(252, 175, 80, 0.2)",
                    fill: true,
                    tension: 0.4, // Smooth curves for the line chart
                },
            ],
        };

        // Destroy the existing chart instance if it already exists to prevent memory leaks
        if (lineChartInstance.current) {
            lineChartInstance.current.destroy();
        }

        // Initialize the Chart.js line chart
        lineChartInstance.current = new Chart(ctxLine, {
            type: "line",
            data: lineData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false, // Hide legend for a cleaner UI
                    },
                },
                scales: {
                    x: {
                        type: "time", // Time-based x-axis
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
                        ticks: {
                            callback: (value) => value + "%", // Append '%' to tick values
                        },
                        title: {
                            display: true,
                            text: "Resolution Progress",
                        },
                    },
                },
            },
        });

        // Cleanup function to destroy the chart instance when the component unmounts
        return () => {
            if (lineChartInstance.current) {
                lineChartInstance.current.destroy();
            }
        };
    }, []); // Runs once when the component mounts

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Complaints by Electorate Section */}
            <div className="lg:w-1/2 bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-lg font-bold mb-4 text-white">Complaints by Electorate</h2>
                <div className="flex flex-col gap-4">
                    {[
                        { name: "MORESBY NORTH EAST", category: "Garbage", count: 204, percentage: 20, total: 25 },
                        { name: "MORESBY NORTH WEST", category: "Crime", count: 100, percentage: 40, total: 325 },
                        { name: "MORESBY SOUTH", category: "Potholes", count: 123, percentage: 20, total: 112 },
                    ].map((electorate, index) => (
                        <div key={index}  className="flex flex-col justify-between h-36 p-8 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 relative">
                            {/* Electorate Name & Issue Category */}
                            <div className="flex flex-col space-y-3" style={{ marginTop: "-05px" }} >
                                <h2 className="text-yellow-500 top-10 font-bold text-lg">{electorate.name}</h2>
                                <div className="flex items-center gap-3 " style={{ marginTop: "-05px" }}>

                                    <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs">{electorate.category}</span>
                                    <span className="text-white text-2xl font-bold">{electorate.count}</span>
                                </div>
                            </div>

                            {/* Complaint Percentage */}
                            <div className="absolute bottom-4 left-8 flex items-center">
                                <span className="bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-full text-sm">{electorate.percentage}%</span>
                                <span className="text-yellow-300 ml-3 text-sm">of all Complaints</span>
                            </div>

                            {/* Total Complaints Info */}
                            <div className="absolute top-1/2 right-8 text-white text-right space-y-1 leading-tight transform -translate-y-1/2 pr-4">
                                <p className="text-sm">Total of</p>
                                <p className="text-4xl font-bold">{electorate.total}</p>
                                <p className="text-sm">Complaints</p>
                            </div>

                            {/* Right-side Yellow Indicator Bar */}
                            <div className="absolute right-0 top-0 h-full w-4 bg-yellow-500 rounded-r-2xl"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Line Graph Section */}
            <div className="lg:w-1/2 bg-gray-800 p-6 rounded-lg mb-8">
                <p className="text-3xl font-bold">Complaint Resolution Progress Over Time</p>
                <p className="text-sm text-gray-400 mt-1">
                    Total Resolved: <span className="text-green-400">230</span> | Total Pending: <span className="text-red-400">12</span>
                </p>
                {/* Canvas element for the chart */}
                <canvas id="balanceChart" ref={lineChartRef} className="mt-6"></canvas>
            </div>
        </div>
    );
};

export default Section2;

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { 
  FaChartLine, 
  FaExclamationCircle, 
  FaUserTie, 
  FaClock, 
} from "react-icons/fa"; // Import React Icons

const Section1 = () => {
    const donutChartRef = useRef(null);
    const donutChartInstance = useRef(null);

    useEffect(() => {
        // Donut Chart
        const ctxDonut = donutChartRef.current.getContext("2d");
        const complaintsData = [15, 5]; // Data for resolved and pending complaints
        const totalComplaints = complaintsData.reduce((a, b) => a + b, 0); // Total complaints

        const gradientResolved = ctxDonut.createLinearGradient(0, 0, 0, 400);
        gradientResolved.addColorStop(0, "#f8df7c"); // Lighter yellow
        gradientResolved.addColorStop(1, "#eab308"); // Darker yellow

        const gradientPending = ctxDonut.createLinearGradient(0, 0, 0, 400);
        gradientPending.addColorStop(0, "#c59f09"); // Lighter yellow
        gradientPending.addColorStop(1, "#eab308"); // Darker yellow

        // Destroy existing chart instance if it exists
        if (donutChartInstance.current) {
            donutChartInstance.current.destroy();
        }

        donutChartInstance.current = new Chart(ctxDonut, {
            type: "doughnut",
            data: {
                labels: ["Resolved", "Pending"],
                datasets: [
                    {
                        data: complaintsData,
                        backgroundColor: [gradientResolved, gradientPending],
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
                cutout: "70%",
                borderRadius: 20,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            color: "white",
                        },
                    },
                    tooltip: {
                        enabled: false,
                    },
                },
                animation: {
                    onComplete: () => {
                        const centerNumberDiv = document.getElementById("centerNumber");
                        if (centerNumberDiv) {
                            centerNumberDiv.innerHTML = totalComplaints;
                        }
                    },
                },
            },
        });

        // Cleanup function to destroy chart instance on component unmount
        return () => {
            if (donutChartInstance.current) {
                donutChartInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left-Side Donut */}
            <div className="lg:w-1/3">
                <div className="text-center slide-in-left bg-gray-700 rounded-lg p-6 mb-8" style={{ animationDelay: "0.2s" }}>
                    <div className="chart-container" style={{ height: "400px" }}>
                        <canvas id="complaintsDonutChart" ref={donutChartRef} className="block"></canvas>
                        <div id="centerNumber" className="center-number"></div>
                        <div id="centerLabel" className="center-label">Total Complaints</div>
                    </div>
                    <p className="p-6 slide-in-left" style={{ fontSize: "14px", animationDelay: "0.7s" }}>
                        This donut chart visually represents the status of complaints, showing the proportion of Resolved and Pending cases. Out of the total complaints, 25% have been resolved, while 75% remain pending. This breakdown provides a clear snapshot of the current resolution progress.
                    </p>
                </div>
            </div>

            {/* Right Side: 4 Cards and Table */}
            <div className="lg:w-2/3">
                {/* 4 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { icon: <FaChartLine />, title: "Total Escalations", value: 18, change: "↓ 10%" },
                        { icon: <FaExclamationCircle />, title: "New Escalations", value: 7, resolved: 5 },
                        { icon: <FaUserTie />, title: "Escalated to Director", value: 10, unitManager: 8 },
                        { icon: <FaClock />, title: "Currently Open", value: 13, completed: 5 },
                    ].map((card, index) => (
                        <div key={index} className="bg-gradient-to-t from-gray-600 to-gray-700 p-4 rounded-lg relative slide-up" style={{ animationDelay: `${0.1 + index * 0.2}s` }}>
                            <span className="text-yellow-400 absolute top-4 right-4" style={{ fontSize: "3rem" }}>{card.icon}</span>
                            <div className="text-sm text-gray-300">12/24/25</div>
                            <div className="mt-10 pb-10">
                                <div className="flex items-start text-white">
                                    <span className="text-5xl font-bold">{card.value}</span>
                                    <div className="ml-2">
                                        <div className="text-lg font-semibold">{card.title}</div>
                                        <div className="text-sm text-gray-400">
                                            {card.resolved ? `Resolved: ${card.resolved}` : `% Change from Last Week`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-yellow-500 text-black font-semibold p-2 rounded-md" style={{ fontSize: "12px" }}>
                                {card.change ? `Operator - Supervisor` : `Supervisor - Unit Manager`}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-gray-700 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">Complaint Ticket Summary</h2>
                    <div className="flex space-x-6">
                        <div className="flex-1">
                            <table className="w-full table-auto text-sm">
                                <tbody>
                                    {[
                                        { label: "Total Tickets", value: 100, color: "gray-500" },
                                        { label: "Total New", value: 20, color: "green-500" },
                                        { label: "Total In Progress", value: 30, color: "yellow-500" },
                                        { label: "Total Resolved", value: 50, color: "blue-500" },
                                    ].map((row, index) => (
                                        <tr key={index} className="border-b border-gray-600">
                                            <td className="p-2 text-left">{row.label}</td>
                                            <td className="p-2 text-left">
                                                <span className={`inline-flex items-center justify-center w-10 h-10 bg-${row.color} bg-opacity-70 text-center rounded-full font-bold text-white`}>
                                                    {row.value}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-1">
                            <table className="w-full table-auto text-sm">
                                <tbody>
                                    {[
                                        { label: "Total Overdue", value: 10, color: "red-500" },
                                        { label: "Total High Priority", value: 15, color: "red-600" },
                                        { label: "Total Medium Priority", value: 25, color: "yellow-400" },
                                        { label: "Total Low Priority", value: 50, color: "green-600" },
                                    ].map((row, index) => (
                                        <tr key={index} className="border-b border-gray-600">
                                            <td className="p-2 text-left">{row.label}</td>
                                            <td className="p-2 text-left">
                                                <span className={`inline-flex items-center justify-center w-10 h-10 bg-${row.color} bg-opacity-70 text-center rounded-full font-bold text-white`}>
                                                    {row.value}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Section1;
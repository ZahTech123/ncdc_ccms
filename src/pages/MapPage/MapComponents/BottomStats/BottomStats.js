import React from "react";
import DonutChart from "./BDonutChart";
import BarChart from "./BBarChart";
import StatCards from "./StatCards/StatCards";

const priorityData = [
  { name: "High", value: 5 },
  { name: "Medium", value: 10 },
  { name: "Low", value: 12 },
];

const COLORS = ["#34d399", "#ddcb0e", "#93c5fd"];

const BottomStats = () => {
  return (
    <div className="fixed right-1 p-2 w-[78%]" style={{ zIndex: 1000, height: "auto", top: "calc(100vh - 250px)" }}>
      <div className="grid grid-cols-5 gap-2 h-full">
        <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm flex flex-col" style={{ height: "100%" }}>
          <h3 className="text-lg font-semibold mb-2 text-black text-center">Priority Breakdown</h3>
          <DonutChart priorityData={priorityData} COLORS={COLORS} />
        </div>
        <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm flex flex-col" style={{ height: "100%" }}>
          <h3 className="text-lg font-semibold mb-2 text-black">Tickets by Status</h3>
          <div className="flex-grow flex items-center justify-center">
            <BarChart />
          </div>
        </div>
        <StatCards />
      </div>
    </div>
  );
};

export default BottomStats;
import React from "react";
import { usePermissions } from "../../../context/PermissionsContext";
import DonutChart from "./DonutChart";
import CardsGrid from "./CardsGrid";
import Tables from "./Tables";
import "./section1.css";

const Section1 = ({ tickets = [] }) => {
  const { userPermissions } = usePermissions();
  const { role, name } = userPermissions;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column */}
      <div className="lg:w-1/3">
        <DonutChart tickets={tickets} role={role} name={name} />
      </div>

      {/* Right Column */}
      <div className="lg:w-2/3">
        {/* Card Grid */}
        <CardsGrid tickets={tickets} role={role} name={name} />

        {/* Complaint Ticket Summary */}
        <div className="bg-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Complaint Ticket Summary</h2>
          <Tables />
        </div>
      </div>
    </div>
  );
};

export default Section1;
import React from "react";
import ComplaintsByElectorate from "./ComplaintsByElectorate";
import LineGraph from "./LineGraph";

const Section2 = ({ tickets = [] }) => {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <ComplaintsByElectorate tickets={tickets} />
            <LineGraph tickets={tickets} />
        </div>
    );
};

export default Section2;
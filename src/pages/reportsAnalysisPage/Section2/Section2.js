import React from "react";
import ComplaintsByElectorate from "./ComplaintsByElectorate";
import LineGraph from "./LineGraph";

const Section2 = ({ tickets = [] }) => {
    // Log tickets received by Section2
    console.log("Section2 received tickets:", tickets);
    console.log("Section2 tickets type:", typeof tickets);
    console.log("Section2 tickets is array?", Array.isArray(tickets));

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <ComplaintsByElectorate tickets={tickets} />
            <LineGraph tickets={tickets} />
        </div>
    );
};

export default Section2;
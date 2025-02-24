import React from "react";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";

const ReportsAnalysis3 = ({ data = [] }) => {
    try {
        console.log("ReportsAndAnalysis received data:", data.length);
        return (
            <div className="bg-gray-900 text-white p-6">
                <div className="container mx-auto">
                    {/* Render Section 1 */}
                    <Section1 />

                    {/* Render Section 2 */}
                    <Section2 />

                    {/* Render Section 3 */}
                    <Section3 />
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in ReportsAnalysis3:", error);
        return (
            <div className="bg-gray-900 text-white p-6">
                <div className="container mx-auto">
                    <p className="text-red-500">Error loading reports data</p>
                </div>
            </div>
        );
    }
};

export default ReportsAnalysis3;
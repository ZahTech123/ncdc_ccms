import React from "react";

const ComplaintsByElectorate = ({ tickets = [] }) => {
    const calculateElectorateData = () => {
        const electorateMap = new Map();

        // If no tickets, return default "No Data" entry
        if (tickets.length === 0) {
            return [{
                name: "No Data",
                category: "None",
                count: 0,
                percentage: 0,
                total: 0
            }];
        }

        tickets.forEach(ticket => {
            const electorateName = ticket.electorate || 'Unknown';
            if (!electorateMap.has(electorateName)) {
                electorateMap.set(electorateName, {
                    name: electorateName,
                    categories: new Map(),
                    total: 0
                });
            }
            
            const electorate = electorateMap.get(electorateName);
            electorate.total++;
            
            const category = ticket.issueType || 'Other';
            electorate.categories.set(category, (electorate.categories.get(category) || 0) + 1);
        });

        // Convert to final format
        return Array.from(electorateMap.values()).map(electorate => {
            // Find the most common category and its count
            const categories = Array.from(electorate.categories.entries());
            
            // Handle case where no categories exist (shouldn't happen but just in case)
            const [mostCommonCategory, mostCommonCount] = categories.length > 0 
                ? categories.reduce((a, b) => b[1] > a[1] ? b : a)
                : ["None", 0];
            
            return {
                name: electorate.name,
                category: mostCommonCategory,
                count: mostCommonCount, // Changed from total to most common count
                percentage: tickets.length > 0 ? Math.round((electorate.total / tickets.length) * 100) : 0,
                total: electorate.total
            };
        });
    };

    const electorates = calculateElectorateData();

    return (
        <div className="lg:w-1/3 bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-bold mb-4 text-white">Complaints by Electorate</h2>
            <div className="flex flex-col gap-4">
                {electorates.length > 0 ? (
                    electorates.map((electorate, index) => (
                        <div key={index} className="flex flex-col justify-between h-36 p-8 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 relative">
                            {/* Electorate Name & Issue Category */}
                            <div className="flex flex-col space-y-3" style={{ marginTop: "-05px" }}>
                                <h2 className="text-yellow-500 top-10 font-bold text-lg">{electorate.name}</h2>
                                <div className="flex items-center gap-3" style={{ marginTop: "-05px" }}>
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
                    ))
                ) : (
                    <div className="flex flex-col justify-between h-36 p-8 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 relative">
                        <div className="flex flex-col space-y-3" style={{ marginTop: "-05px" }}>
                            <h2 className="text-yellow-500 top-10 font-bold text-lg">No Data</h2>
                            <div className="flex items-center gap-3" style={{ marginTop: "-05px" }}>
                                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs">None</span>
                                <span className="text-white text-2xl font-bold">0</span>
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-8 flex items-center">
                            <span className="bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-full text-sm">0%</span>
                            <span className="text-yellow-300 ml-3 text-sm">of all Complaints</span>
                        </div>

                        <div className="absolute top-1/2 right-8 text-white text-right space-y-1 leading-tight transform -translate-y-1/2 pr-4">
                            <p className="text-sm">Total of</p>
                            <p className="text-4xl font-bold">0</p>
                            <p className="text-sm">Complaints</p>
                        </div>

                        <div className="absolute right-0 top-0 h-full w-4 bg-yellow-500 rounded-r-2xl"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsByElectorate;
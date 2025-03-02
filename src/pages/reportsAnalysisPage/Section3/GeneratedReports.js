import React from "react";

const GeneratedReports = ({ reports = [], onGenerateReport, onReportClick }) => {
  return (
    <div className="lg:w-1/4 bg-gray-800 p-6 rounded-lg h-full">
      <div className="bg-gray-800 text-white w-full rounded-lg flex flex-col h-full">
        <h2 className="text-lg font-bold mb-4 text-center">GENERATED REPORTS</h2>
        <div className="flex-grow space-y-3 overflow-y-auto">
          {reports.map((report, index) => (
            <div key={index} className="flex flex-col items-center gap-3 mb-4">
              <button
                onClick={() => onReportClick(report.date)}
                className="group relative mb-1 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <span className="material-icons text-yellow-500 text-2xl">description</span>
                <span className="material-icons text-yellow-500 text-xs absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform">download</span>
              </button>
              <p className="text-sm text-gray-300">{report.date}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6">
          <button
            onClick={onGenerateReport}
            className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg w-full hover:bg-yellow-600 transition"
          >
            GENERATE REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedReports;
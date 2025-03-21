import React from 'react';
import "../../styles/buttonBounce.css";

// Mapping of issueType to default image paths
const defaultImages = {
  "Building": "/assets/images/Building.jpg",
  "Development Control & Physical Planning": "/assets/images/Development Control & Physical Planning.jpg",
  "Eda City Bus": "/assets/images/Eda City Bus.jpg",
  "Enforcement": "/assets/images/Enforcement.jpg",
  "Liqur License": "/assets/images/Liqur License.jpg",
  "Markets": "/assets/images/Market.jpg",
  "Parks & Gardens": "/assets/images/Parks & Gardens.jpg",
  "Potholes and Drainage": "/assets/images/Potholes and Drainage.jpg",
  "Road Furniture and Road Signs": "/assets/images/Road Furniture and Road Signs.jpg",
  "T Street Lights and Traffic Managment": "/assets/images/T Street Lights and Traffic Managment.jpg",
  "T Stretegic Planning": "/assets/images/T Stretegic Planning.jpg",
  "Urban Safety": "/assets/images/Urban Safety.jpg",
  "Waste Management": "/assets/images/Waste Management.jpg",
};

export default function MapPagePopUpModal({ selectedComplaint, setShowModal, setSelectedComplaint }) {
  // Function to parse the description into its components
  const parseDescription = (description) => {
    if (!description) {
      return [{
        handler: "Unknown",
        timestamp: "Unknown",
        status: "Unknown",
        comment: "No comment",
      }];
    }
  
    // Split the description into individual entries
    const entries = description.split("|");
  
    // Group the entries into chunks of 4 (handler, timestamp, status, comment)
    const groupedEntries = [];
    for (let i = 0; i < entries.length; i += 4) {
      // Ensure we don't go out of bounds
      if (i + 3 < entries.length) {
        groupedEntries.push({
          handler: entries[i].trim(),
          timestamp: entries[i + 1].trim(),
          status: entries[i + 2].trim(),
          comment: entries[i + 3].trim(),
        });
      }
    }
  
    // Sort the grouped entries by timestamp in descending order (most recent first)
    groupedEntries.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA; // Sort in descending order
    });
  
    return groupedEntries;
  };
  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 100000 }}
    >
      <div
        className="bg-white shadow-lg rounded-2xl p-6 max-w-2xl animate-slide-down"
        style={{ width: "400px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        {selectedComplaint && (
          <>
            {/* Header */}
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 text-center">
              {selectedComplaint.issueType}
            </h2>

            {/* Image */}
            <div className="mt-4">
              {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                <>
                  <img
                    src={selectedComplaint.images[0]}
                    alt={`${selectedComplaint.issueType} at ${
                      selectedComplaint.location?.address || "unknown location"
                    }`}
                    className="w-full max-h-52 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = defaultImages[selectedComplaint.issueType] || "/assets/images/default.jpg"; // Fallback to default image
                    }}
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Directorate: {selectedComplaint.directorate || "Unassigned"}
                  </p>
                </>
              ) : (
                <>
                  <img
                    src={defaultImages[selectedComplaint.issueType] || "/assets/images/default.jpg"}
                    alt={`Default for ${selectedComplaint.issueType}`}
                    className="w-full max-h-52 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = "/assets/images/default.jpg"; // Fallback to default image
                    }}
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Directorate: {selectedComplaint.directorate || "Unassigned"}
                  </p>
                </>
              )}
            </div>

            {/* Scrollable Details */}
            <div className="mt-4 flex-grow overflow-y-auto map-modal-scrollbar p-4">
              <div className="leading-tight text-gray-700 text-[15px]">
                {/* Ticket ID */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Ticket ID:</span>
                  <span className="text-gray-600">{selectedComplaint.ticketId}</span>
                </div>

                {/* Status */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Status:</span>
                  <span
                    className={`font-medium ${
                      selectedComplaint.status === "New"
                        ? "text-green-600"
                        : selectedComplaint.status === "In Progress"
                        ? "text-yellow-600"
                        : selectedComplaint.status === "Resolved"
                        ? "text-gray-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>

                {/* Escalation Info */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Escalation Info:</span>
                  <span className="text-red-600 font-medium">
                    {selectedComplaint.priority || "Normal"}
                  </span>
                </div>

                {/* Location Details */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Geo Location:</span>
                  <span className="text-gray-600">
                    ({selectedComplaint.latitude?.toFixed(4)}, {selectedComplaint.longitude?.toFixed(4)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Location:</span>
                  <span className="text-gray-600">{selectedComplaint.suburb || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Electorate:</span>
                  <span className="text-gray-600">{selectedComplaint.electorate || "N/A"}</span>
                </div>

                {/* Submission & Assignment Details */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Date Submitted:</span>
                  <span className="text-gray-600"> {(() => {
                        let dateString = selectedComplaint.dateSubmitted || selectedComplaint.dateSubmitted;

                        // Handle custom date format (dd/mm/yy) by converting it to a valid ISO format (yyyy-mm-dd)
                        if (dateString && !dateString.includes('T')) {
                          const [day, month, year] = dateString.split('/');
                          dateString = `20${year}-${month}-${day}`; // Convert to ISO format: yyyy-mm-dd
                        }

                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date

                        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(2, 4)}`;
                      })()}</span>
                </div>
                {/* Submission Time */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Submission Time:</span>
                  <span className="text-gray-600">{selectedComplaint.submissionTime || "N/A"}</span>
                </div>
                {/* Assigned Team */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Assigned Team:</span>
                  <span className="text-gray-600">{selectedComplaint.team || "Unassigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Requester Name:</span>
                  <span className="text-gray-600">{selectedComplaint.name || "Unassigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Directorate:</span>
                  <span className="text-gray-600">{selectedComplaint.directorate || "Unassigned"}</span>
                </div>
                {/* Resident Feedback */}
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Resident Feedback:</span>
                  <span className="text-gray-600 italic">
                    {selectedComplaint.feedback || "No feedback provided"}
                  </span>
                </div>

                {/* Description */}
                <div>
  <span className="font-semibold text-gray-800 block">Description:</span>
  <div className="mt-1 leading-relaxed h-40 overflow-y-auto map-modal-scrollbar p-4">
    {parseDescription(selectedComplaint.description).map((entry, index) => (
      <div key={index}>
        <div className="flex justify-between items-center">
          <strong>{entry.handler}</strong>
          <span className="text-sm text-gray-500">{entry.timestamp}</span>
        </div>
        <p>{entry.comment}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status: {entry.status}</span>
        </div>
        {index < parseDescription(selectedComplaint.description).length - 1 && (
          <hr className="my-2" />
        )}
      </div>
    ))}
  </div>
</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedComplaint(null);
                }}
                className=" bounce-effect px-5 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-all"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';

// Mapping of issueType to default image paths
const defaultImages = {
  "Building": "/assets/images/Building.jpg",
  "Development Control & Physical Planning": "/assets/images/Development Control & Physical Planning.jpg",
  "Eda City Bus": "/assets/images/Eda City Bus.jpg",
  "Enforcement": "/assets/images/Enforcement.jpg",
  "Liqur License": "/assets/images/Liqur License.jpg",
  "Market": "/assets/images/Market.jpg",
  "Parks & Gardens": "/assets/images/Parks & Gardens.jpg",
  "Potholes and Drainage": "/assets/images/Potholes and Drainage.jpg",
  "Road Furniture and Road Signs": "/assets/images/Road Furniture and Road Signs.jpg",
  "T Street Lights and Traffic Managment": "/assets/images/T Street Lights and Traffic Managment.jpg",
  "T Stretegic Planning": "/assets/images/T Stretegic Planning.jpg",
  "Waste Management": "/assets/images/Waste Management.jpg",
};

export default function MapPagePopUpModal({ selectedComplaint, setShowModal, setSelectedComplaint }) {
  // Debugging: Log the selected complaint and image path
  useEffect(() => {
    if (selectedComplaint) {
      console.log("Selected Complaint:", selectedComplaint);
      const imagePath = defaultImages[selectedComplaint.issueType] || "/assets/images/default.jpg";
      console.log("Computed Image Path:", imagePath);
    }
  }, [selectedComplaint]);

  // Function to restructure the description
  const restructureDescription = (description) => {
    if (!description) return "No description provided";

    // Split the description into parts based on the handler pattern
    const parts = description.split(/(\w+\s*\|\s*\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)\s*\|\s*\w+\s*\|\s*)/g);

    const handlers = [];
    let currentHandler = null;

    parts.forEach((part) => {
      if (part.trim()) {
        // Check if the part matches a handler pattern (e.g., "Operator | 2/19/2025, 08:11 AM | New |")
        const handlerMatch = part.match(/^(\w+)\s*\|\s*(\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM))\s*\|\s*(\w+)\s*\|\s*(.*)$/);

        if (handlerMatch) {
          // If it's a new handler, push the previous one (if any) and start a new one
          if (currentHandler) {
            handlers.push(currentHandler);
          }
          currentHandler = {
            name: handlerMatch[1].trim(),
            date: handlerMatch[2].trim(),
            status: handlerMatch[3].trim(),
            comment: handlerMatch[4].trim(),
          };
        } else if (currentHandler) {
          // If it's not a handler pattern, treat it as part of the current handler's comment
          currentHandler.comment += ` ${part.trim()}`;
        }
      }
    });

    // Push the last handler if it exists
    if (currentHandler) {
      handlers.push(currentHandler);
    }

    // If no handlers were found, return the original description
    if (handlers.length === 0) {
      return <p className="text-gray-600">{description}</p>;
    }

    // Reverse the handlers to show the most recent comment first
    handlers.reverse();

    // Format the handlers as per the desired output
    return handlers.map((handler, index) => {
      // Convert the date to the desired format (dd/mm/yy 00:00)
      const formattedDate = new Date(handler.date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return (
        <div key={index}>
          <div className="flex justify-between items-center">
            <strong>{handler.name}</strong>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <p>{handler.comment}</p>
          {index < handlers.length - 1 && <hr className="my-2" />}
        </div>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 10000 }}
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
                      console.error("Firebase image failed to load:", e.target.src);
                      e.target.src = defaultImages[selectedComplaint.issueType] || "/assets/images/default.jpg"; // Fallback to default image
                    }}
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Image from Firebase: {selectedComplaint.images[0]}
                  </p>
                </>
              ) : (
                <>
                  <img
                    src={defaultImages[selectedComplaint.issueType] || "/assets/images/default.jpg"}
                    alt={`Default for ${selectedComplaint.issueType}`}
                    className="w-full max-h-52 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      console.error("Default image failed to load:", e.target.src);
                      e.target.src = "/assets/images/default.jpg"; // Fallback to default image
                    }}
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Default Image: {defaultImages[selectedComplaint.issueType] || "/assets/images/default.jpg"}
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
                  <span className="text-gray-600">#{selectedComplaint.id}</span>
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

                        console.log('Formatted Date String:', dateString); // Debugging step

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
                    {restructureDescription(selectedComplaint.description)}
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
                className="px-5 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-all"
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

// Add custom styles for the scrollbar and animation
const styles = `
.map-modal-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.map-modal-scrollbar::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.5); /* Slightly less transparent track */
  border-radius: 4px;
}

.map-modal-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(136, 136, 136, 0.2); /* Slightly less transparent thumb */
  border-radius: 4px;
}

.map-modal-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(85, 85, 85, 0.2); /* Slightly less transparent thumb on hover */
}

.animate-slide-down {
  animation: slide-down 0.3s ease-in-out forwards;
}

@keyframes slide-down {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`;

// Inject the custom styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
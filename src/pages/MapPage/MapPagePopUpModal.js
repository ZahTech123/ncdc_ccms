import React from 'react';

export default function MapPagePopUpModal({ selectedComplaint, setShowModal, setSelectedComplaint }) {
  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 10000 }}
    >
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-2xl" style={{ width: "400px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        {selectedComplaint && (
          <>
            {/* Header */}
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 text-center">
              {selectedComplaint.issueType}
            </h2>

            {/* Image */}
            <div className="mt-4">
              {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                <img
                  src={selectedComplaint.images[0]}
                  alt={`${selectedComplaint.issueType} at ${
                    selectedComplaint.location?.address || "unknown location"
                  }`}
                  className="w-full max-h-52 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-52 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
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
                    <p className="text-gray-600">
                      {selectedComplaint.description || "No description provided"}
                    </p>
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

// Add custom styles for the scrollbar
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
`;

// Inject the custom styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}





















// import React from 'react';

// // Import images
// import BuildingImage from '../../public/assets/images/Building.jpg';
// import DevelopmentControlImage from '../assets/images/Development Control & Physical Planning.jpg';
// import EdaCityBusImage from '../assets/images/T Eda City Bus.jpg';
// import EnforcementImage from '../assets/images/Enforcement.jpg';
// import LiquorLicenseImage from '../assets/images/Liqur License.jpg';
// import MarketImage from '../assets/images/Market.jpg';
// import ParksAndGardensImage from '../assets/images/Parks & Gardens.jpg';
// import PotholesAndDrainageImage from '../assets/images/Potholes and Drainage.jpg';
// import RoadFurnitureAndRoadSignsImage from '../assets/images/Road Furniture and Road Signs.jpg';
// import StreetLightsAndTrafficManagementImage from '../assets/images/Street Lights and Traffic Managment.jpg';
// import StrategicPlanningImage from '../assets/images/T Stretegic Planning.jpg';
// import WasteManagementImage from '../../assets/images/Waste Managment.jpg';

// const issueTypeToImage = {
//   "Building": BuildingImage,
//   "Development Control & Physical Planning": DevelopmentControlImage,
//   "Eda City Bus": EdaCityBusImage,
//   "Enforcement": EnforcementImage,
//   "Liquor License": LiquorLicenseImage,
//   "Markets": MarketImage,
//   "Parks & Gardens": ParksAndGardensImage,
//   "Potholes & Drainage": PotholesAndDrainageImage,
//   "Road Furniture & Road Signs": RoadFurnitureAndRoadSignsImage,
//   "Streetlights & Traffic Management": StreetLightsAndTrafficManagementImage,
//   "Strategic Planning": StrategicPlanningImage,
//   "Waste Management": WasteManagementImage,
// };

// export default function MapPagePopUpModal({ selectedComplaint, setShowModal, setSelectedComplaint }) {
//   const fallbackImage = issueTypeToImage[selectedComplaint?.issueType] || null;

//   return (
//     <div
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
//       style={{ zIndex: 10000 }}
//     >
//       <div className="bg-white shadow-lg rounded-2xl p-6 max-w-2xl" style={{ width: "400px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
//         {selectedComplaint && (
//           <>
//             {/* Header */}
//             <h2 className="text-xl font-bold text-gray-800 border-b pb-3 text-center">
//               {selectedComplaint.issueType}
//             </h2>

//             {/* Image */}
//             <div className="mt-4">
//               {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
//                 <img
//                   src={selectedComplaint.images[0]}
//                   alt={`${selectedComplaint.issueType} at ${
//                     selectedComplaint.location?.address || "unknown location"
//                   }`}
//                   className="w-full max-h-52 object-cover rounded-lg shadow-md"
//                 />
//               ) : fallbackImage ? (
//                 <img
//                   src={fallbackImage}
//                   alt={`${selectedComplaint.issueType} at ${
//                     selectedComplaint.location?.address || "unknown location"
//                   }`}
//                   className="w-full max-h-52 object-cover rounded-lg shadow-md"
//                 />
//               ) : (
//                 <div className="w-full h-52 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
//                   <span className="text-gray-500">No image available</span>
//                 </div>
//               )}
//             </div>

//             {/* Scrollable Details */}
//             <div className="mt-4 flex-grow overflow-y-auto map-modal-scrollbar p-4">
//               <div className="leading-tight text-gray-700 text-[15px]">
//                 {/* Ticket ID */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Ticket ID:</span>
//                   <span className="text-gray-600">#{selectedComplaint.id}</span>
//                 </div>

//                 {/* Status */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Status:</span>
//                   <span
//                     className={`font-medium ${
//                       selectedComplaint.status === "New"
//                         ? "text-green-600"
//                         : selectedComplaint.status === "In Progress"
//                         ? "text-yellow-600"
//                         : selectedComplaint.status === "Resolved"
//                         ? "text-gray-600"
//                         : "text-red-600"
//                     }`}
//                   >
//                     {selectedComplaint.status}
//                   </span>
//                 </div>

//                 {/* Escalation Info */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Escalation Info:</span>
//                   <span className="text-red-600 font-medium">
//                     {selectedComplaint.priority || "Normal"}
//                   </span>
//                 </div>

//                 {/* Location Details */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Geo Location:</span>
//                   <span className="text-gray-600">
//                     ({selectedComplaint.latitude?.toFixed(4)}, {selectedComplaint.longitude?.toFixed(4)})
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Location:</span>
//                   <span className="text-gray-600">{selectedComplaint.suburb || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Electorate:</span>
//                   <span className="text-gray-600">{selectedComplaint.electorate || "N/A"}</span>
//                 </div>

//                 {/* Submission & Assignment Details */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Date Submitted:</span>
//                   <span className="text-gray-600"> {(() => {
//                         let dateString = selectedComplaint.dateSubmitted || selectedComplaint.dateSubmitted;

//                         // Handle custom date format (dd/mm/yy) by converting it to a valid ISO format (yyyy-mm-dd)
//                         if (dateString && !dateString.includes('T')) {
//                           const [day, month, year] = dateString.split('/');
//                           dateString = `20${year}-${month}-${day}`; // Convert to ISO format: yyyy-mm-dd
//                         }

//                         console.log('Formatted Date String:', dateString); // Debugging step

//                         const date = new Date(dateString);
//                         if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date

//                         return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(2, 4)}`;
//                       })()}</span>
//                 </div>
//                 {/* Submission Time */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Submission Time:</span>
//                   <span className="text-gray-600">{selectedComplaint.submissionTime || "N/A"}</span>
//                 </div>
//                 {/* Assigned Team */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Assigned Team:</span>
//                   <span className="text-gray-600">{selectedComplaint.team || "Unassigned"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Requester Name:</span>
//                   <span className="text-gray-600">{selectedComplaint.name || "Unassigned"}</span>
//                 </div>

//                 {/* Resident Feedback */}
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-800">Resident Feedback:</span>
//                   <span className="text-gray-600 italic">
//                     {selectedComplaint.feedback || "No feedback provided"}
//                   </span>
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <span className="font-semibold text-gray-800 block">Description:</span>
//                   <div className="mt-1 leading-relaxed h-40 overflow-y-auto map-modal-scrollbar p-4">
//                     <p className="text-gray-600">
//                       {selectedComplaint.description || "No description provided"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="mt-6 flex justify-end space-x-4">
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setSelectedComplaint(null);
//                 }}
//                 className="px-5 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-all"
//               >
//                 Close
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // Add custom styles for the scrollbar
// const styles = `
// .map-modal-scrollbar::-webkit-scrollbar {
//   width: 8px;
//   height: 8px;
// }

// .map-modal-scrollbar::-webkit-scrollbar-track {
//   background: rgba(241, 241, 241, 0.5); /* Slightly less transparent track */
//   border-radius: 4px;
// }

// .map-modal-scrollbar::-webkit-scrollbar-thumb {
//   background: rgba(136, 136, 136, 0.2); /* Slightly less transparent thumb */
//   border-radius: 4px;
// }

// .map-modal-scrollbar::-webkit-scrollbar-thumb:hover {
//   background: rgba(85, 85, 85, 0.2); /* Slightly less transparent thumb on hover */
// }
// `;

// // Inject the custom styles into the document
// if (typeof document !== 'undefined') {
//   const styleSheet = document.createElement("style");
//   styleSheet.type = "text/css";
//   styleSheet.innerText = styles;
//   document.head.appendChild(styleSheet);
// }
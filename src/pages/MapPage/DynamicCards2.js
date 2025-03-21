import React, { useRef, useMemo } from "react";
import {
  FaTrash,
  FaLightbulb,
  FaExclamationTriangle,
  FaTrafficLight,
  FaHardHat,
  FaShoppingCart,
  FaTree,
  FaBus,
  FaGlassCheers,
  FaBuilding,
  FaProjectDiagram,
  FaGavel,
  FaRoad,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import "../../styles/buttonBounce.css";

const defaultImages = {
  "Building": "/assets/images/Building.jpg",
  "Development Control & Physical Planning": "/assets/images/Development Control & Physical Planning.jpg",
  "Eda City Bus": "/assets/images/Eda City Bus.jpg",
  "Enforcement": "/assets/images/Enforcement.jpg",
  "Liquor License": "/assets/images/Liquor License.jpg",
  "Markets": "/assets/images/Market.jpg",
  "Parks & Gardens": "/assets/images/Parks & Gardens.jpg",
  "Potholes and Drainage": "/assets/images/Potholes and Drainage.jpg",
  "Road Furniture & Road Signs": "/assets/images/Road Furniture and Road Signs.jpg",
  "Streetlights & Traffic Management": "/assets/images/T Street Lights and Traffic Managment.jpg",
  "Strategic Planning": "/assets/images/T Stretegic Planning.jpg",
  "Urban Safety": "/assets/images/Urban Safety.jpg",
  "Waste Management": "/assets/images/Waste Management.jpg", 
};

// Move this out to avoid recreating on each render
const issueTypeIcons = {
  "Garbage and Sanitation": <FaTrash size={16} color="black" />,
  "Street Lights": <FaLightbulb size={16} color="black" />,
  "Crime Alert": <FaExclamationTriangle size={16} color="black" />,
  "Traffic Lights": <FaTrafficLight size={16} color="black" />,
  "Pothole Roads": <FaHardHat size={16} color="black" />,
  "Urban Safety": <FaExclamationTriangle size={16} color="black" />,
  "Waste Management": <FaTrash size={16} color="black" />,
  "Markets": <FaShoppingCart size={16} color="black" />,
  "Parks & Gardens": <FaTree size={16} color="black" />,
  "Eda City Bus": <FaBus size={16} color="black" />,
  "Liquor License": <FaGlassCheers size={16} color="black" />,
  "Building": <FaBuilding size={16} color="black" />,
  "Development Control & Physical Planning": <FaProjectDiagram size={16} color="black" />,
  "Enforcement": <FaGavel size={16} color="black" />,
  "Streetlights & Traffic Management": <FaTrafficLight size={16} color="black" />,
  "Road Furniture & Road Signs": <FaRoad size={16} color="black" />,
  "Potholes & Drainage": <FaHardHat size={16} color="black" />,
  "Strategic Planning": <FaMapMarkedAlt size={16} color="black" />,
};

// Helper component for card icon
const IssueIcon = ({ issueType }) => {
  const icon = issueTypeIcons[issueType] || <HiOutlineQuestionMarkCircle size={16} color="white" />;
  
  return (
    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
      {icon}
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  if (!dateString.includes("T")) {
    const [day, month, year] = dateString.split("/");
    dateString = `20${year}-${month}-${day}`;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().slice(2, 4)}`;
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    "New": "bg-green-100 text-green-800",
    "In Progress": "bg-yellow-100 text-yellow-800 -ml-10",
    "Resolved": "bg-gray-200 text-gray-700 font-medium border border-gray-300 -ml-10",
    "Verified": "bg-blue-100 text-blue-800 -ml-10",
    "Closed": "bg-gray-100 text-gray-800 -ml-8",
    "Overdue": "bg-red-100 text-red-800 -ml-8",
  };

  return (
    <span className={`px-2.5 py-1 mb-6 mr-6 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[status] || "bg-red-100 text-red-800"}`}>
      {status}
    </span>
  );
};

const ComplaintCard = ({ complaint, flyToLocation, setSelectedComplaint, setShowModal, isFullscreen }) => {
  return (
    <div
      id={`card-${complaint.ticketId}`}
      className="bounce-effect bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative"
      onClick={() => {
        if (complaint.latitude && complaint.longitude) {
          flyToLocation(complaint);
        }
      }}
    >
      {/* Image at the top of the card (only in fullscreen mode) */}
      {isFullscreen && (
        <div
          className="w-full h-32 mb-4"
          onClick={(e) => {
            e.stopPropagation();
            if (complaint.latitude && complaint.longitude) {
              flyToLocation(complaint);
            }
          }}
        >
          <img
            src={
              complaint.images && complaint.images.length > 0
                ? complaint.images[0]
                : defaultImages[complaint.issueType] || "/assets/images/default.jpg"
            }
            alt={`${complaint.issueType} at ${complaint.suburb || "unknown location"}`}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.src = defaultImages[complaint.issueType] || "/assets/images/default.jpg";
            }}
          />
        </div>
      )}

      {/* Main Card Content */}
      <div>
        {/* Icon in the top-right corner */}
        <div className="absolute top-4 right-4">
          <IssueIcon issueType={complaint.issueType} />
        </div>

        {/* Delivery Timeline */}
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>

          {/* Details */}
          <div className="flex-1">
            {/* Top Location */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900">
                {complaint.issueType.replace(" and ", " \n ")}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(complaint.dateSubmitted || complaint.submissionDate)}
              </div>
            </div>

            {/* Bottom Location */}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {complaint.suburb || "Location unavailable"}
              </div>
              <div className="text-sm text-gray-500">
                {complaint.electorate}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3 mr-2"></div>

        {/* Footer with Status */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              Ticket ID: {complaint.ticketId}
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* See More Button */}
      <div
        className="mt-2 px-3 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative flex items-center justify-center text-black text-center border border-gray-300 bounce-effect"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComplaint(complaint);
          setShowModal(true);
        }}
      >
        See More
      </div>
    </div>
  );
};

const DynamicCards = ({
  filteredComplaints,
  markersRef,
  flyToLocation,
  setSelectedComplaint,
  setShowModal,
  isFullscreen,
  scrollToCard,
  focusedCardId,
}) => {
  const cardsContainerRef = useRef(null);

  // Sort complaints with focused card first - memoized to avoid unnecessary recalculations
  const sortedComplaints = useMemo(() => {
    if (!focusedCardId) return filteredComplaints;
    
    return [...filteredComplaints].sort((a, b) =>
      a.ticketId === focusedCardId ? -1 : b.ticketId === focusedCardId ? 1 : 0
    );
  }, [filteredComplaints, focusedCardId]);

  return (
    <div
      id="cityCardsContainer"
      ref={cardsContainerRef}
      className={`custom-scrollbar space-y-4 overflow-y-auto ${
        isFullscreen ? "" : "rounded-lg shadow-lg p-4"
      }`}
      style={{
        height: isFullscreen ? "calc(100vh - 100px)" : "500px",
        width: isFullscreen ? "320px" : "20%",
        padding: "8px",
        backgroundColor: "transparent",
      }}
    >
      {sortedComplaints.map((complaint) => (
        <ComplaintCard
          key={complaint.ticketId}
          complaint={complaint}
          flyToLocation={flyToLocation}
          setSelectedComplaint={setSelectedComplaint}
          setShowModal={setShowModal}
          isFullscreen={isFullscreen}
        />
      ))}
    </div>
  );
};

export default DynamicCards;
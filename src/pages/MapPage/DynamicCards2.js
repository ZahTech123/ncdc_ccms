import React, { useRef } from "react";
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
import { createRoot } from "react-dom/client";
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
  "Waste Management": "/assets/images/Waste Management.jpg",
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

  // Sort complaints with focused card first
  const sortedComplaints = focusedCardId
    ? [...filteredComplaints].sort((a, b) =>
        a.ticketId === focusedCardId ? -1 : b.ticketId === focusedCardId ? 1 : 0
      )
    : filteredComplaints;

  return (
    <div
      id="cityCardsContainer"
      ref={cardsContainerRef}
      className={`custom-scrollbar space-y-4 overflow-y-auto ${
        isFullscreen ? "" : "rounded-lg shadow-lg p-4"
      }`}
      style={{
        height: isFullscreen ? "calc(100vh - 100px)" : "500px",
        width: isFullscreen ? "320px" : "20%", // Adjust width as needed
        padding: "8px",
        backgroundColor: "transparent", // Ensure backdrop color is transparent in both modes
      }}
    >
      {sortedComplaints.map((complaint) => {
        const icon = {
          "Garbage and Sanitation": <FaTrash size={16} color="black" />,
          "Street Lights": <FaLightbulb size={16} color="black" />,
          "Crime Alert": <FaExclamationTriangle size={16} color="black" />,
          "Traffic Lights": <FaTrafficLight size={16} color="black" />,
          "Pothole Roads": <FaHardHat size={16} color="black" />,
          "Urban Safety": <FaExclamationTriangle size={16} color="black" />,
          "Waste Management": <FaTrash size={16} color="black" />,
          Markets: <FaShoppingCart size={16} color="black" />,
          "Parks & Gardens": <FaTree size={16} color="black" />,
          "Eda City Bus": <FaBus size={16} color="black" />,
          "Liquor License": <FaGlassCheers size={16} color="black" />,
          Building: <FaBuilding size={16} color="black" />,
          "Development Control & Physical Planning": (
            <FaProjectDiagram size={16} color="black" />
          ),
          Enforcement: <FaGavel size={16} color="black" />,
          "Streetlights & Traffic Management": (
            <FaTrafficLight size={16} color="black" />
          ),
          "Road Furniture & Road Signs": <FaRoad size={16} color="black" />,
          "Potholes & Drainage": <FaHardHat size={16} color="black" />,
          "Strategic Planning": <FaMapMarkedAlt size={16} color="black" />,
        }[complaint.issueType] || (
          <HiOutlineQuestionMarkCircle size={16} color="white" />
        );

        const iconContainer = document.createElement("div");
        iconContainer.style.width = "24px";
        iconContainer.style.height = "24px";
        iconContainer.style.borderRadius = "50%";
        iconContainer.style.backgroundColor = "#d1d5db";
        iconContainer.style.display = "flex";
        iconContainer.style.alignItems = "center";
        iconContainer.style.justifyContent = "center";

        const root = createRoot(iconContainer);
        root.render(icon);

        return (
          <div
            id={`card-${complaint.ticketId}`} // Add unique ID for each card
            className="bounce-effect bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative"
            onClick={() => {
              if (complaint.latitude && complaint.longitude) {
                flyToLocation(complaint); // Pass the entire complaint object
              }
            }}
          >
            {/* Image at the top of the card (only in fullscreen mode) */}
            {isFullscreen && (
              <div
                className="w-full h-32 mb-4"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling to the card
                  if (complaint.latitude && complaint.longitude) {
                    flyToLocation(complaint); // Pass the entire complaint object
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
                    e.target.src =
                      defaultImages[complaint.issueType] || "/assets/images/default.jpg"; // Fallback to default image
                  }}
                />
              </div>
            )}

            {/* Main Card Content */}
            <div>
              {/* Icon in the top-right corner */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                }}
                ref={(node) => {
                  if (node) {
                    node.innerHTML = ""; // Clear any existing content
                    node.appendChild(iconContainer); // Append the icon container
                  }
                }}
              ></div>

              {/* Delivery Timeline */}
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  {/* Blue Dot */}
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  {/* Vertical Line */}
                  <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                  {/* Gray Dot */}
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
                      {(() => {
                        let dateString =
                          complaint.dateSubmitted || complaint.submissionDate;

                        if (dateString && !dateString.includes("T")) {
                          const [day, month, year] = dateString.split("/");
                          dateString = `20${year}-${month}-${day}`;
                        }

                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) return "Invalid Date";

                        return `${date
                          .getDate()
                          .toString()
                          .padStart(2, "0")}/${(date.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}/${date
                          .getFullYear()
                          .toString()
                          .slice(2, 4)}`;
                      })()}
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
                <span
                  className={`px-2.5 py-1 mb-6 mr-6 rounded-full text-xs font-medium whitespace-nowrap ${
                    complaint.status === "New"
                      ? "bg-green-100 text-green-800"
                      : complaint.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : complaint.status === "Resolved"
                      ? ""
                      : "bg-red-100 text-red-800"
                  }`}
                  style={{
                    marginLeft: "-10px",
                    ...(complaint.status === "In Progress"
                      ? {
                          marginLeft: "-40px",
                        }
                      : {}),
                    ...(complaint.status === "Verified"
                      ? {
                          marginLeft: "-40px",
                        }
                      : {}),
                    ...(complaint.status === "Closed"
                      ? {
                          marginLeft: "-30px",
                        }
                      : {}),
                    ...(complaint.status === "Overdue"
                      ? {
                          marginLeft: "-30px",
                        }
                      : {}),
                    ...(complaint.status === "Resolved"
                      ? {
                          backgroundColor: "#E5E7EB",
                          color: "#374151",
                          fontWeight: "bold",
                          border: "1px solid #D1D5DB",
                          marginLeft: "-40px",
                        }
                      : {}),
                  }}
                >
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* See More Button */}
            <div
              className="mt-2 px-3 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative flex items-center justify-center text-black text-center border border-gray-300 bounce-effect"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling to the card
                setSelectedComplaint(complaint);
                setShowModal(true);
              }}
            >
              See More
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DynamicCards;
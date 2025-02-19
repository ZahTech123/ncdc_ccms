// DynamicCards.js
import React from "react";
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

const DynamicCards = ({
  filteredComplaints,
  markersRef,
  flyToLocation,
  setSelectedComplaint,
  setShowModal,
}) => {
  return (
    <div
      id="cityCardsContainer"
      className="custom-scrollbar w-1/5 space-y-4 overflow-y-auto"
      style={{ height: "500px", padding: "8px 8px 8px 8px" }}
    >
      {filteredComplaints.map((complaint) => {
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
          <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative">
            <div
              key={complaint.id}
              onClick={() => {
                if (complaint.latitude && complaint.longitude) {
                  const marker = markersRef.current.find(
                    (m) =>
                      m._lngLat.lng === complaint.longitude &&
                      m._lngLat.lat === complaint.latitude
                  );
                  flyToLocation(
                    complaint.longitude,
                    complaint.latitude,
                    marker
                  );
                }
              }}
            >
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
                    Ticket #{complaint.id}
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

            {/* See More Button with Bounce Effect */}
            <div
              className="mt-2 px-3 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative flex items-center justify-center text-black text-center border border-gray-300 transform active:scale-95"
              onClick={() => {
                setSelectedComplaint(complaint); // Set the selected complaint to trigger modal content
                setShowModal(true); // Show the modal
              }}
              style={{
                transition: "transform 0.1s ease-in-out, box-shadow 0.2s ease",
                transformOrigin: "center",
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

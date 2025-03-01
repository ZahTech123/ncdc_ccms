// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";
// import { db } from "../../firebaseConfig";
// import { collection, onSnapshot } from "firebase/firestore";
// import {
//   FaTrash,
//   FaExclamationTriangle,
//   FaShoppingCart,
//   FaTree,
//   FaBus,
//   FaGlassCheers,
//   FaBuilding,
//   FaProjectDiagram,
//   FaGavel,
//   FaRoad,
//   FaMapMarkedAlt,
//   FaTrafficLight,
//   FaHardHat,
// } from "react-icons/fa";
// import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
// import { createRoot } from "react-dom/client";
// import MapPagePopUpModal from "./MapPagePopUpModal";
// import DynamicCards from "./DynamicCards2";
// import Filters from "./Filters";

// // Set Mapbox access token
// mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

// // Helper function to create popup content
// const createPopupContent = (complaint) => {
//   const popupContent = document.createElement("div");
//   popupContent.className = "custom-popup";

//   // Create and style the icon container
//   const iconContainer = document.createElement("div");
//   iconContainer.style.width = "24px";
//   iconContainer.style.height = "24px";
//   iconContainer.style.borderRadius = "50%";
//   iconContainer.style.backgroundColor = "#d1d5db";
//   iconContainer.style.display = "flex";
//   iconContainer.style.alignItems = "center";
//   iconContainer.style.justifyContent = "center";

//   // Define the icon based on the issue type
//   const icon = {
//     "Urban Safety": <FaExclamationTriangle size={16} color="black" />,
//     "Waste Management": <FaTrash size={16} color="black" />,
//     "Markets": <FaShoppingCart size={16} color="black" />,
//     "Parks & Gardens": <FaTree size={16} color="black" />,
//     "Eda City Bus": <FaBus size={16} color="black" />,
//     "Liquor License": <FaGlassCheers size={16} color="black" />,
//     "Building": <FaBuilding size={16} color="black" />,
//     "Development Control & Physical Planning": <FaProjectDiagram size={16} color="black" />,
//     "Enforcement": <FaGavel size={16} color="black" />,
//     "Streetlights & Traffic Management": <FaTrafficLight size={16} color="black" />,
//     "Road Furniture & Road Signs": <FaRoad size={16} color="black" />,
//     "Potholes & Drainage": <FaHardHat size={16} color="black" />,
//     "Strategic Planning": <FaMapMarkedAlt size={16} color="black" />,
//   }[complaint.issueType] || (
//     <HiOutlineQuestionMarkCircle size={16} color="white" />
//   );

//   // Render the icon into the container
//   const root = createRoot(iconContainer);
//   root.render(icon);

//   // Create the rest of the popup content
//   const popupInner = document.createElement("div");
//   popupInner.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
//   popupInner.style.padding = "16px 32px 16px 16px";
//   popupInner.style.borderRadius = "12px";
//   popupInner.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
//   popupInner.style.width = "320px";
//   popupInner.style.position = "relative";
//   popupInner.style.display = "flex";
//   popupInner.style.flexDirection = "column";
//   popupInner.style.boxSizing = "border-box";

//   // Add issue type, ticket ID, status, location, description, and "See More" button
//   const issueTypeSection = document.createElement("div");
//   issueTypeSection.style.display = "flex";
//   issueTypeSection.style.alignItems = "center";
//   issueTypeSection.style.gap = "8px";
//   issueTypeSection.style.marginBottom = "6px";
//   issueTypeSection.appendChild(iconContainer);

//   const issueTypeText = document.createElement("h3");
//   issueTypeText.style.fontSize = "18px";
//   issueTypeText.style.fontWeight = "600";
//   issueTypeText.style.color = "black";
//   issueTypeText.textContent = complaint.issueType;
//   issueTypeSection.appendChild(issueTypeText);
//   popupInner.appendChild(issueTypeSection);

//   // Add ticket ID and status
//   const ticketIdSection = document.createElement("div");
//   ticketIdSection.style.display = "flex";
//   ticketIdSection.style.justifyContent = "space-between";
//   ticketIdSection.style.alignItems = "center";
//   ticketIdSection.style.width = "100%";
//   ticketIdSection.style.marginBottom = "6px";

//   const ticketIdText = document.createElement("p");
//   ticketIdText.style.fontWeight = "bold";
//   ticketIdText.style.color = "black";
//   ticketIdText.textContent = `Ticket ID: #${complaint.id}`;
//   ticketIdSection.appendChild(ticketIdText);

//   const statusBadge = document.createElement("span");
//   statusBadge.style.display = "inline-block";
//   statusBadge.style.padding = "6px 12px";
//   statusBadge.style.fontSize = "14px";
//   statusBadge.style.borderRadius = "20px";
//   statusBadge.style.fontWeight = "600";
//   statusBadge.style.color = "white";
//   statusBadge.style.whiteSpace = "nowrap";
//   statusBadge.style.backgroundColor =
//     {
//       New: "#10b981",
//       "In Progress": "#d9cc41",
//       Resolved: "#6b7280",
//       Pending: "#ef4444",
//     }[complaint.status] || "#6b7280";
//   statusBadge.textContent = complaint.status;
//   ticketIdSection.appendChild(statusBadge);
//   popupInner.appendChild(ticketIdSection);

//   // Add a divider
//   const divider = document.createElement("hr");
//   divider.style.border = "none";
//   divider.style.height = "1px";
//   divider.style.backgroundColor = "#e5e7eb";
//   divider.style.margin = "12px 0";
//   divider.style.width = "100%";
//   popupInner.appendChild(divider);

//   // Add location
//   const locationText = document.createElement("p");
//   locationText.style.color = "gray";
//   locationText.style.fontSize = "14px";
//   locationText.style.marginBottom = "12px";
//   locationText.textContent = `Location: ${complaint.suburb || "N/A"}`;
//   popupInner.appendChild(locationText);

//   // Add description
//   const descriptionText = document.createElement("p");
//   descriptionText.style.color = "#4b5563";
//   descriptionText.style.fontSize = "14px";
//   descriptionText.style.marginBottom = "16px";
//   descriptionText.textContent =
//     complaint.description?.length > 100
//       ? `${complaint.description.substring(0, 100)}...`
//       : complaint.description || "No description provided.";
//   popupInner.appendChild(descriptionText);

//   // Add "See More" button
//   const seeMoreButton = document.createElement("button");
//   seeMoreButton.style.width = "100%";
//   seeMoreButton.style.padding = "10px 0";
//   seeMoreButton.style.backgroundColor = "#eab308";
//   seeMoreButton.style.color = "white";
//   seeMoreButton.style.borderRadius = "8px";
//   seeMoreButton.style.fontSize = "14px";
//   seeMoreButton.style.fontWeight = "600";
//   seeMoreButton.style.transition = "background-color 0.3s";
//   seeMoreButton.textContent = "See More";
//   seeMoreButton.id = `seeMoreBtn-${complaint.id}`;
//   seeMoreButton.onmouseover = () => {
//     seeMoreButton.style.backgroundColor = "#f0ca55";
//   };
//   seeMoreButton.onmouseout = () => {
//     seeMoreButton.style.backgroundColor = "#eab308";
//   };
//   popupInner.appendChild(seeMoreButton);

//   // Append the popup inner content to the popup container
//   popupContent.appendChild(popupInner);
//   return popupContent;
// };

// // Main MapPage component
// const MapPage = () => {
//   // State Management
//   const [selectedCity, setSelectedCity] = useState("");
//   const [category, setCategory] = useState("");
//   const [date, setDate] = useState("");
//   const [locationKeyword, setLocationKeyword] = useState("");
//   const [complaints, setComplaints] = useState([]);
//   const [map, setMap] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [priority, setPriority] = useState("");
//   const markersRef = useRef([]);

//   // Fetch complaints data from Firebase
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
//       const complaintsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setComplaints(complaintsData);
//     });

//     return () => unsubscribe();
//   }, []);

//   // Initialize map with 3D buildings
//   useEffect(() => {
//     const mapInstance = new mapboxgl.Map({
//       container: "map",
//       style: "mapbox://styles/mapbox/streets-v12",
//       center: [147.15144455964452, -9.478037785341655],
//       zoom: 13,
//       pitch: 45,
//       bearing: 0,
//     });

//     mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

//     mapInstance.on("load", () => {
//       const layers = mapInstance.getStyle().layers;
//       let labelLayerId;
//       for (const layer of layers) {
//         if (layer.type === "symbol" && layer.layout["text-field"]) {
//           labelLayerId = layer.id;
//           break;
//         }
//       }

//       mapInstance.addLayer(
//         {
//           id: "3d-buildings",
//           source: "composite",
//           "source-layer": "building",
//           type: "fill-extrusion",
//           minzoom: 16,
//           paint: {
//             "fill-extrusion-color": "#aaa",
//             "fill-extrusion-height": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               15,
//               0,
//               16,
//               ["get", "height"],
//             ],
//             "fill-extrusion-opacity": 0.6,
//           },
//         },
//         labelLayerId
//       );
//     });

//     setMap(mapInstance);

//     return () => {
//       if (mapInstance && mapInstance.loaded()) {
//         mapInstance.remove();
//       }
//     };
//   }, []);

//   // Filter complaints based on selected filters
//   const filteredComplaints = useMemo(() => {
//     return complaints.filter((complaint) => {
//       const matchesCity = selectedCity
//         ? (complaint.electorate || "").toLowerCase() === selectedCity.toLowerCase()
//         : true;
//       const matchesCategory = category
//         ? (complaint.issueType || "").toLowerCase() === category.toLowerCase()
//         : true;
//       const matchesDate = date
//         ? (complaint.dateSubmitted || "") === date
//         : true;
//       const matchesKeyword = locationKeyword
//         ? (complaint.suburb || "")
//             .toLowerCase()
//             .includes(locationKeyword.toLowerCase())
//         : true;
//       const matchesPriority = priority
//         ? (complaint.priority || "").toLowerCase() === priority.toLowerCase()
//         : true;

//       return (
//         matchesCity &&
//         matchesCategory &&
//         matchesDate &&
//         matchesKeyword &&
//         matchesPriority
//       );
//     });
//   }, [complaints, selectedCity, category, date, locationKeyword, priority]);

//   // Function to handle fly-to animation and show popup
//   const flyToLocation = useCallback(
//     (longitude, latitude, marker) => {
//       if (!map) return;

//       markersRef.current.forEach((m) => {
//         if (m !== marker && m.getPopup().isOpen()) {
//           m.togglePopup();
//         }
//       });

//       map.flyTo({
//         center: [longitude, latitude],
//         zoom: 18,
//         pitch: 60,
//         bearing: 0,
//         speed: 1,
//         curve: 1.2,
//         essential: true,
//       });

//       if (marker) {
//         marker.togglePopup();
//       }
//     },
//     [map]
//   );

//   // Function to reset filters and zoom to bounds
//   const resetFiltersAndZoom = useCallback(() => {
//     setSelectedCity("");
//     setCategory("");
//     setDate("");
//     setLocationKeyword("");
//     setPriority("");

//     if (map && filteredComplaints.length > 0) {
//       const bounds = new mapboxgl.LngLatBounds();
//       filteredComplaints.forEach((complaint) => {
//         if (complaint.latitude && complaint.longitude) {
//           bounds.extend([complaint.longitude, complaint.latitude]);
//         }
//       });

//       map.flyTo({
//         bounds: bounds,
//         padding: 50,
//         pitch: 0,
//         speed: 0.5,
//         curve: 1,
//         essential: true,
//       });
//     } else {
//       map.flyTo({
//         center: [147.15144455964452, -9.478037785341655],
//         zoom: 6,
//         pitch: 45,
//         bearing: 0,
//       });
//     }
//   }, [map, filteredComplaints]);

//   // Update markers when filtered complaints change
//   useEffect(() => {
//     if (!map) return;

//     markersRef.current.forEach((marker) => marker && marker.remove());
//     markersRef.current = [];

//     const newMarkers = filteredComplaints
//       .map((complaint) => {
//         if (!complaint.latitude || !complaint.longitude) return null;

//         const popupContent = createPopupContent(complaint);
//         const marker = new mapboxgl.Marker({
//           color: getMarkerColor(complaint.status),
//         })
//           .setLngLat([complaint.longitude, complaint.latitude])
//           .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
//           .addTo(map);

//         marker.getPopup().on("open", () => {
//           const seeMoreBtn = document.getElementById(
//             `seeMoreBtn-${complaint.id}`
//           );
//           if (seeMoreBtn) {
//             seeMoreBtn.addEventListener("click", () => {
//               setSelectedComplaint(complaint);
//               setShowModal(true);
//             });
//           }
//         });

//         marker.getElement().addEventListener("click", () => {
//           flyToLocation(complaint.longitude, complaint.latitude, marker);
//         });

//         return marker;
//       })
//       .filter(Boolean);

//     markersRef.current = newMarkers;
//   }, [map, filteredComplaints, flyToLocation]);

//   // Helper function to get marker color based on status
//   const getMarkerColor = (status) => {
//     switch (status) {
//       case "New":
//         return "#10B981"; // green
//       case "In Progress":
//         return "#FBBF24"; // yellow
//       case "Resolved":
//         return "#6B7280"; // gray
//       case "Overdue":
//         return "#EF4444"; // red
//       default:
//         return "#3B82F6"; // blue
//     }
//   };

//   return (
//     <div className="flex mt-2 p-8 space-x-6">
//       {/* Left Section (Dynamic Cards) */}
//       <DynamicCards
//         filteredComplaints={filteredComplaints}
//         markersRef={markersRef}
//         flyToLocation={flyToLocation}
//       />
//       {/* Center Section (Map) */}
//       <div className="w-3/5 bg-gray-800 p-6 rounded-lg space-y-6 relative">
//         <div id="map" className="w-full h-[500px] rounded-lg"></div>
//       </div>

//       {/* Right Section (Filters Form) */}
//       <Filters
//         selectedCity={selectedCity}
//         setSelectedCity={setSelectedCity}
//         category={category}
//         setCategory={setCategory}
//         date={date}
//         setDate={setDate}
//         locationKeyword={locationKeyword}
//         setLocationKeyword={setLocationKeyword}
//         priority={priority}
//         setPriority={setPriority}
//         resetFiltersAndZoom={resetFiltersAndZoom}
//       />

//       {/* Modal */}
//       {showModal && (
//         <MapPagePopUpModal
//           selectedComplaint={selectedComplaint}
//           setShowModal={setShowModal}
//           setSelectedComplaint={setSelectedComplaint}
//         />
//       )}
//     </div>
//   );
// };

// export default MapPage;
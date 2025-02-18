import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { CreatePopupContent } from "./CreatePopupContent"; // Helper function for popup content
import MapPagePopUpModal from "./MapPagePopUpModal";
import DynamicCards from "./DynamicCards2";
import Filters from "./Filters";
import { easeQuadInOut } from "d3-ease";
// import MapControls from "./MapControls"; // Import the MapControls component

// Set Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

// Main MapPage component
const MapPage = () => {
  // State Management
  const [selectedCity, setSelectedCity] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [locationKeyword, setLocationKeyword] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [map, setMap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [priority, setPriority] = useState("");
  const markersRef = useRef([]);

  // Fetch complaints data from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      const complaintsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(complaintsData);
    });

    return () => unsubscribe();
  }, []);

  // Initialize map with 3D buildings
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12", // Ensure this style supports 3D buildings
      center: [147.15144455964452, -9.478037785341655],
      zoom: 16, // Set initial zoom level to ensure 3D buildings are visible
      pitch: 0,
      bearing: 90,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapInstance.on("load", () => {
      const layers = mapInstance.getStyle().layers;
      let labelLayerId;
      for (const layer of layers) {
        if (layer.type === "symbol" && layer.layout["text-field"]) {
          labelLayerId = layer.id;
          break;
        }
      }

      // Add 3D buildings layer
      if (mapInstance.getLayer("3d-buildings")) {
        mapInstance.removeLayer("3d-buildings");
      }

      mapInstance.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 15, // Adjust minzoom to ensure buildings appear at lower zoom levels
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              22,
              ["get", "height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    });

    setMap(mapInstance);

    // Cleanup function
    return () => {
      if (mapInstance && mapInstance.remove) {
        mapInstance.remove();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Filter complaints based on selected filters
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesCity = selectedCity
        ? (complaint.electorate || "").toLowerCase() === selectedCity.toLowerCase()
        : true;
      const matchesCategory = category
        ? category.toLowerCase() === "all" || (complaint.issueType || "").toLowerCase() === category.toLowerCase()
        : true;
      const matchesDate = date
        ? (complaint.dateSubmitted || "").split("T")[0] === date
        : true;
      const matchesKeyword = locationKeyword
        ? (complaint.suburb || "")
            .toLowerCase()
            .includes(locationKeyword.toLowerCase())
        : true;
      const matchesPriority = priority
        ? (complaint.priority || "").toLowerCase() === priority.toLowerCase()
        : true;

      return (
        matchesCity &&
        matchesCategory &&
        matchesDate &&
        matchesKeyword &&
        matchesPriority
      );
    });
  }, [complaints, selectedCity, category, date, locationKeyword, priority]);

  // Function to handle fly-to animation and show popup
  const flyToLocation = useCallback(
    (longitude, latitude, marker) => {
      if (!map) return;

      markersRef.current.forEach((m) => {
        if (m !== marker && m.getPopup().isOpen()) {
          m.togglePopup();
        }
      });
      const offsetLatitude = latitude - 0.0009; 
      //Marker Click and Card Click Fly to marker location Animation
      map.flyTo({
        center: [longitude, offsetLatitude],
        zoom: 18,//18
        pitch: 60,
        bearing: 0,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });

      if (marker) {
        marker.togglePopup();
      }
    },
    [map]
  );

  // Function to zoom to bounds of filtered complaints
  const zoomToBounds = useCallback(() => {
    if (!map || filteredComplaints.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    filteredComplaints.forEach((complaint) => {
      if (complaint.latitude && complaint.longitude) {
        bounds.extend([complaint.longitude, complaint.latitude]);
      }
    });

    map.fitBounds(bounds, {
      zoom: 12,//Map Intialization zoom
      padding: 120, // Add some padding around the bounds
      pitch: 0, // Reset pitch to 0 for a top-down view
      speed: 0.9, // Adjust the speed of the zoom animation
      essential: true,
      easing: easeQuadInOut, // Ensure the map always zooms to the bounds
    });
  }, [map, filteredComplaints]);

  // Call zoomToBounds whenever filtered complaints change
  useEffect(() => {
    zoomToBounds();
  }, [filteredComplaints, zoomToBounds]);

  // Function to reset filters and zoom to bounds
  const resetFiltersAndZoom = useCallback(() => {
    setSelectedCity("");
    setCategory("");
    setDate("");
    setLocationKeyword("");
    setPriority("");

    // Zoom to bounds of all complaints
    zoomToBounds();
  }, [zoomToBounds]);

  // Update markers when filtered complaints change
  useEffect(() => {
    if (!map) return;

    // Clean up existing markers
    markersRef.current.forEach((marker) => marker && marker.remove());
    markersRef.current = [];

    // Add new markers
    const newMarkers = filteredComplaints
      .map((complaint) => {
        if (!complaint.latitude || !complaint.longitude) return null;

        const popupContent = CreatePopupContent(complaint);
        const marker = new mapboxgl.Marker({
          color: getMarkerColor(complaint.status),
        })
          .setLngLat([complaint.longitude, complaint.latitude])
          .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
          .addTo(map);

        marker.getPopup().on("open", () => {
          const seeMoreBtn = document.getElementById(`seeMoreBtn-${complaint.id}`);
          if (seeMoreBtn) {
            seeMoreBtn.addEventListener("click", () => {
              setSelectedComplaint(complaint);
              setShowModal(true);
            });
          }
        });

        marker.getElement().addEventListener("click", () => {
          flyToLocation(complaint.longitude, complaint.latitude, marker);
        });

        return marker;
      })
      .filter(Boolean);

    markersRef.current = newMarkers;
  }, [map, filteredComplaints, flyToLocation]);

  // Helper function to get marker color based on status
  const getMarkerColor = (status) => {
    switch (status) {
      case "New":
        return "#10B981"; // green
      case "In Progress":
        return "#FBBF24"; // yellow
      case "Resolved":
        return "#6B7280"; // gray
      case "Overdue":
        return "#EF4444"; // red
      default:
        return "#3B82F6"; // blue
    }
  };

  return (
    <div className="flex mt-2 p-8 space-x-6">
      {/* Left Section (Dynamic Cards) */}
      <DynamicCards
        filteredComplaints={filteredComplaints}
        markersRef={markersRef}
        flyToLocation={flyToLocation}
        setSelectedComplaint={setSelectedComplaint} // Passing setSelectedComplaint
        setShowModal={setShowModal} // Passing setShowModal
      />
      {/* Center Section (Map) */}
      <div className="w-3/5 bg-gray-800 p-6 rounded-lg space-y-6 relative">
        <div id="map" className="w-full h-[500px] rounded-lg"></div>
        {/* Add MapControls here */}
        {/* {map && <MapControls map={map} />} */}
      </div>

      {/* Right Section (Filters Form) */}
      <Filters
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        category={category}
        setCategory={setCategory}
        date={date}
        setDate={setDate}
        locationKeyword={locationKeyword}
        setLocationKeyword={setLocationKeyword}
        priority={priority}
        setPriority={setPriority}
        resetFiltersAndZoom={resetFiltersAndZoom}
      />

      {/* Modal */}
      {showModal && (
        <MapPagePopUpModal
          selectedComplaint={selectedComplaint}
          setShowModal={setShowModal}
          setSelectedComplaint={setSelectedComplaint}
        />
      )}
    </div>
  );
};

export default MapPage;
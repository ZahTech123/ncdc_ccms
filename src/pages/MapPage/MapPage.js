import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CreatePopupContent } from "./CreatePopupContent"; // Helper function for popup content
import MapPagePopUpModal from "./MapPagePopUpModal";
import DynamicCards from "./DynamicCards2";
import Filters from "./Filters";
import { easeQuadInOut } from "d3-ease";
import { usePermissions } from "../../context/PermissionsContext"; // Updated import path
import { useTickets } from "../../context/TicketsContext"; // Import useTickets
import { filterTickets } from "../../utils/ticketFilters"; // Import filterTickets function

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

// Main MapPage component
const MapPage = () => {
  const { userPermissions } = usePermissions(); // Get user permissions
  const { role } = userPermissions;
  const { filteredTickets } = useTickets(); // Use filteredTickets from TicketsProvider

  // State Management
  const [selectedCity, setSelectedCity] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [locationKeyword, setLocationKeyword] = useState("");
  const [map, setMap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [priority, setPriority] = useState("");
  const [selectedDirectorate, setSelectedDirectorate] = useState(""); // Add selectedDirectorate state
  const markersRef = useRef([]);

  // Log the selectedDirectorate state whenever it changes
  useEffect(() => {
    console.log("Selected Directorate (MapPage):", selectedDirectorate);
  }, [selectedDirectorate]);

  // Automatically set the selectedDirectorate based on the first complaint's directorate
  useEffect(() => {
    if (filteredTickets.length > 0) {
      const firstComplaintDirectorate = filteredTickets[0].directorate;
      setSelectedDirectorate(firstComplaintDirectorate);
      console.log("Setting selectedDirectorate to:", firstComplaintDirectorate);
    }
  }, [filteredTickets]);

  // Filter tickets based on selected filters and role
  const filteredComplaints = useMemo(() => {
    return filterTickets(
      filteredTickets,
      priority,
      category,
      locationKeyword,
      role,
      selectedDirectorate,
      selectedCity, // Add selectedCity to filter criteria
      date // Add date to filter criteria
    );
  }, [filteredTickets, category, locationKeyword, priority, role, selectedDirectorate, selectedCity, date]);

  // Initialize map with 3D buildings
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [147.15144455964452, -9.478037785341655],
      zoom: 16,
      pitch: 45, // Add pitch for 3D effect
      bearing: 30,
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
      mapInstance.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa", // Color of the buildings
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              22,
              ["get", "height"], // Use building height data
            ],
            "fill-extrusion-opacity": 0.6, // Adjust opacity for better visibility
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              22,
              ["get", "min_height"], // Use building base height data
            ],
          },
        },
        labelLayerId // Ensure the layer is added above labels
      );

      console.log("3D buildings layer added successfully");
    });

    setMap(mapInstance);

    return () => {
      if (mapInstance && mapInstance.remove) {
        mapInstance.remove();
      }
    };
  }, []);

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
      map.flyTo({
        center: [longitude, offsetLatitude],
        zoom: 18,
        pitch: 60,
        bearing: 0,
        speed: 0.8, // Adjust speed for smoother animation
        curve: 1.2, // Adjust curve for smoother transitions
        essential: true,
        easing: easeQuadInOut, // Add easing for smooth in-and-out animation
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
      padding: { top: 50, bottom: 50, left: 50, right: 50 }, // Add padding to ensure markers are not at the edge
      maxZoom: 12, // Set a max zoom level to ensure markers are not too close to the edge
      speed: 0.9, // Adjust speed for smoother animation
      essential: true,
      easing: easeQuadInOut, // Add easing for smooth in-and-out animation
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
    setSelectedDirectorate(""); // Reset selectedDirectorate

    zoomToBounds();
  }, [zoomToBounds]);

  // Update markers when filtered complaints change
  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach((marker) => marker && marker.remove());
    markersRef.current = [];

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
        return "#10B981";
      case "In Progress":
        return "#FBBF24";
      case "Resolved":
        return "#6B7280";
      case "Overdue":
        return "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  return (
    <div className="flex  p-8 space-x-6">
      <DynamicCards
        filteredComplaints={filteredComplaints}
        markersRef={markersRef}
        flyToLocation={flyToLocation}
        setSelectedComplaint={setSelectedComplaint}
        setShowModal={setShowModal}
      />
      <div className="w-3/5 bg-gray-800 p-6 rounded-lg space-y-6 relative">
        <div id="map" className="w-full h-full rounded-lg"></div>
      </div>
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
        selectedDirectorate={selectedDirectorate}
        setSelectedDirectorate={setSelectedDirectorate}
      />
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
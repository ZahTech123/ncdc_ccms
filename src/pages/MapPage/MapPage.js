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

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

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
      style: "mapbox://styles/mapbox/streets-v12",
      center: [147.15144455964452, -9.478037785341655],
      zoom: 16,
      pitch: 0,
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

      if (mapInstance.getLayer("3d-buildings")) {
        mapInstance.removeLayer("3d-buildings");
      }

      mapInstance.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 15,
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

    return () => {
      if (mapInstance && mapInstance.remove) {
        mapInstance.remove();
      }
    };
  }, []);

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
    <div className="flex mt-2 p-8 space-x-6">
      <DynamicCards
        filteredComplaints={filteredComplaints}
        markersRef={markersRef}
        flyToLocation={flyToLocation}
        setSelectedComplaint={setSelectedComplaint}
        setShowModal={setShowModal}
      />
      <div className="w-3/5 bg-gray-800 p-6 rounded-lg space-y-6 relative">
        <div id="map" className="w-full h-[500px] rounded-lg"></div>
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
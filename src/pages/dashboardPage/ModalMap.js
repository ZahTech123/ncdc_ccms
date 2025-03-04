import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox CSS

// Define global variables
window.globalLat = null;
window.globalLng = null;

const ModalMap = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [147.15144455964452, -9.478037785341655],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Function to add a marker at clicked location
    const addMarker = (e) => {
      const { lng, lat } = e.lngLat;

      // Remove existing markers before adding a new one
      document.querySelectorAll(".mapboxgl-marker").forEach((marker) => marker.remove());

      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

      // Update state with the new latitude and longitude
      setLatitude(lat);
      setLongitude(lng);

      // Update global variables
      window.globalLat = lat;
      window.globalLng = lng;

      console.log(`Marker added at Latitude: ${lat}, Longitude: ${lng}`);
    };

    map.on("click", addMarker);

    // Resize map on window resize
    const resizeMap = () => map.resize();
    window.addEventListener("resize", resizeMap);

    map.on("load", () => {
      map.resize();
    });

    return () => {
      map.off("click", addMarker);
      map.remove();
      window.removeEventListener("resize", resizeMap);
    };
  }, []);

  return (
    <div style={{ zIndex: 10000 }}>
      <div 
        id="map" 
        className="w-full h-[500px] min-h-[500px] bg-gray-800"
        style={{ zIndex: 10001 }}
      ></div>
      <div className="mt-4 p-4 bg-gray-800 rounded-lg" style={{ zIndex: 10002 }}>
        <p className="text-gray-200">Latitude: {latitude !== null ? latitude : "No marker added yet"}</p>
        <p className="text-gray-200">Longitude: {longitude !== null ? longitude : "No marker added yet"}</p>
      </div>
    </div>
  );
};

export default ModalMap;

import { useEffect, useState, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

export const useMapInitialization = (mapContainerRef, setMap, setIsFullscreen, isDarkMode) => {
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const mapInstanceRef = useRef(null);
  
  // Use useMemo to prevent recreating the mapStyles array on each render
  const mapStyles = useMemo(() => [
    "mapbox://styles/mapbox/streets-v12",     // Light mode
    "mapbox://styles/mapbox/dark-v10",        // Dark mode
    "mapbox://styles/mapbox/satellite-streets-v11"  // Satellite
  ], []);

  // Update style index when isDarkMode changes from parent component
  useEffect(() => {
    if (isDarkMode !== undefined && mapInstanceRef.current) {
      // Set to dark mode (index 1) if isDarkMode is true, otherwise streets (index 0)
      const newStyleIndex = isDarkMode ? 1 : 0;
      
      if (newStyleIndex !== currentStyleIndex) {
        // Save current camera state
        const cameraState = {
          center: mapInstanceRef.current.getCenter(),
          zoom: mapInstanceRef.current.getZoom(),
          pitch: mapInstanceRef.current.getPitch(),
          bearing: mapInstanceRef.current.getBearing()
        };
        
        setCurrentStyleIndex(newStyleIndex);
        
        // Update the map style and preserve camera state
        mapInstanceRef.current.once('style.load', () => {
          // Restore camera state after style loads
          mapInstanceRef.current.jumpTo(cameraState);
        });
        
        mapInstanceRef.current.setStyle(mapStyles[newStyleIndex]);
      }
    }
  }, [isDarkMode, mapStyles, currentStyleIndex]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    
    // Initialize the map with the initial style
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyles[currentStyleIndex],
      center: [147.15144455964452, -9.478037785341655],
      zoom: 16,
      pitch: 45,
      bearing: 30,
      navigationControl: false
    });
    
    // Store map instance in ref for internal use
    mapInstanceRef.current = mapInstance;
    
    // Expose map instance to parent component
    setMap(mapInstance);
    
    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    // Add 3D buildings when map loads
    const addBuildings = () => {
      if (!mapInstance.getStyle()) return;
      
      const layers = mapInstance.getStyle().layers;
      let labelLayerId;
      for (const layer of layers) {
        if (layer.type === "symbol" && layer.layout["text-field"]) {
          labelLayerId = layer.id;
          break;
        }
      }
      
      // Only add if it doesn't already exist
      if (!mapInstance.getLayer("3d-buildings")) {
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
                ["get", "height"]
              ],
              "fill-extrusion-opacity": 0.6,
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                22,
                ["get", "min_height"]
              ]
            }
          },
          labelLayerId
        );
      }
    };
    
    mapInstance.on("load", addBuildings);
    
    // Re-add buildings when style changes
    mapInstance.on("style.load", addBuildings);
    
    // Cleanup function
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapContainerRef, setMap, setIsFullscreen, currentStyleIndex, mapStyles]);

  // Function to manually toggle map style with camera state preservation
  const toggleMapStyle = () => {
    if (!mapInstanceRef.current) return;
    
    // Save current camera state before changing style
    const cameraState = {
      center: mapInstanceRef.current.getCenter(),
      zoom: mapInstanceRef.current.getZoom(),
      pitch: mapInstanceRef.current.getPitch(),
      bearing: mapInstanceRef.current.getBearing()
    };
    
    // Calculate new style index
    const newIndex = (currentStyleIndex + 1) % mapStyles.length;
    setCurrentStyleIndex(newIndex);
    
    // Add event listener to restore camera state after style loads
    mapInstanceRef.current.once('style.load', () => {
      // Restore camera state after style loads
      mapInstanceRef.current.jumpTo(cameraState);
    });
    
    // Set the new style
    mapInstanceRef.current.setStyle(mapStyles[newIndex]);
  };

  return {
    currentStyleIndex,
    toggleMapStyle,
    currentStyle: mapStyles[currentStyleIndex]
  };
};
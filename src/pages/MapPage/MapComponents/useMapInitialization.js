import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

export const useMapInitialization = (mapContainerRef, setMap, setIsFullscreen) => {
  useEffect(() => {
    // Initialize the map without default navigation controls
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [147.15144455964452, -9.478037785341655],
      zoom: 16,
      pitch: 45,
      bearing: 30,
      // Disable default navigation controls as we're using custom ones
      navigationControl: false
    });

    // Do NOT add the standard navigation controls since we have custom ones
    // mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add 3D buildings layer
    mapInstance.on("load", () => {
      const layers = mapInstance.getStyle().layers;
      let labelLayerId;
      for (const layer of layers) {
        if (layer.type === "symbol" && layer.layout["text-field"]) {
          labelLayerId = layer.id;
          break;
        }
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
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              22,
              ["get", "min_height"],
            ],
          },
        },
        labelLayerId
      );
    });

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isFullscreen);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Set the map instance in state
    setMap(mapInstance);

    // Cleanup function
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (mapInstance && mapInstance.remove) {
        mapInstance.remove();
      }
    };
  }, [mapContainerRef, setMap, setIsFullscreen]);
};
import React from "react";
import { FaExpand, FaUndo, FaRedo } from "react-icons/fa";
import '../../styles/MapControls.css';  // Adjusted path to go up to the src folder and access styles
// Correct path to the CSS file

const MapControls = ({ map }) => {
  const handleFullScreen = () => {
    if (map) {
      const container = map.getContainer();
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }

      // Reset to 2D view with zero bearing and pitch
      map.flyTo({
        pitch: 0,
        bearing: 0,
      });
    }
  };

  const handleRotateLeft = () => {
    if (map) {
      const currentBearing = map.getBearing();
      map.flyTo({
        bearing: currentBearing - 45,
      });
    }
  };

  const handleRotateRight = () => {
    if (map) {
      const currentBearing = map.getBearing();
      map.flyTo({
        bearing: currentBearing + 45,
      });
    }
  };

  return (
    <div className="map-controls-container">
      <div className="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button
          className="mapboxgl-ctrl-icon"
          title="Full Screen"
          onClick={handleFullScreen}
        >
          <FaExpand />
        </button>
        <button
          className="mapboxgl-ctrl-icon"
          title="Rotate Left"
          onClick={handleRotateLeft}
        >
          <FaUndo />
        </button>
        <button
          className="mapboxgl-ctrl-icon"
          title="Rotate Right"
          onClick={handleRotateRight}
        >
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

export default MapControls;
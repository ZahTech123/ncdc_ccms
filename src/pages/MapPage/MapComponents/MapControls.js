import React from 'react';
import { FiMaximize, FiMinimize, FiRotateCcw, FiRotateCw, FiTarget, FiArrowLeft, FiArrowRight, FiFilter } from 'react-icons/fi';
import { FaChartLine } from 'react-icons/fa';
import { FiPlus, FiMinus, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const MapControls = ({ 
  map, 
  isFullscreen, 
  toggleFullScreen, 
  zoomToBounds,
  markersRef,
  toggleStats,
  toggleFilters,
  isFiltersOpen
}) => {
  // Function to handle switching to the previous marker
  const handlePreviousMarker = () => {
    if (!map || !markersRef.current || markersRef.current.length === 0) return;

    const markers = markersRef.current;
    const currentMarkerIndex = markers.findIndex(marker => marker.getPopup().isOpen());

    // Close current popup if open
    if (currentMarkerIndex !== -1) {
      markers[currentMarkerIndex].togglePopup();
    }

    let previousMarkerIndex;
    if (currentMarkerIndex === -1 || currentMarkerIndex === 0) {
      previousMarkerIndex = markers.length - 1;
    } else {
      previousMarkerIndex = currentMarkerIndex - 1;
    }

    const previousMarker = markers[previousMarkerIndex];
    const lngLat = previousMarker.getLngLat();

    map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: 18,
      pitch: 60,
      bearing: 0,
      speed: 0.8,
      curve: 1.2,
      essential: true,
    });

    previousMarker.togglePopup();
  };

  // Function to handle switching to the next marker
  const handleNextMarker = () => {
    if (!map || !markersRef.current || markersRef.current.length === 0) return;

    const markers = markersRef.current;
    const currentMarkerIndex = markers.findIndex(marker => marker.getPopup().isOpen());

    // Close current popup if open
    if (currentMarkerIndex !== -1) {
      markers[currentMarkerIndex].togglePopup();
    }

    let nextMarkerIndex;
    if (currentMarkerIndex === -1 || currentMarkerIndex === markers.length - 1) {
      nextMarkerIndex = 0;
    } else {
      nextMarkerIndex = currentMarkerIndex + 1;
    }

    const nextMarker = markers[nextMarkerIndex];
    const lngLat = nextMarker.getLngLat();

    map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: 18,
      pitch: 60,
      bearing: 0,
      speed: 0.8,
      curve: 1.2,
      essential: true,
    });

    nextMarker.togglePopup();
  };

  // Calculate the right position based on whether filters are open
  const getRightPosition = () => {
    if (!isFullscreen) return '34px';
    return isFiltersOpen ? '360px' : '10px'; // Increased from 310px to 360px to account for the increased filter panel margin
  };

  const rightPosition = getRightPosition();

  // Zoom in function
  const handleZoomIn = () => {
    if (map) {
      map.easeTo({
        zoom: map.getZoom() + 1,
        duration: 300,
        easing: (t) => t * t * (3 - 2 * t),
      });
    }
  };

  // Zoom out function
  const handleZoomOut = () => {
    if (map) {
      map.easeTo({
        zoom: map.getZoom() - 1,
        duration: 300,
        easing: (t) => t * t * (3 - 2 * t),
      });
    }
  };

  // Increase pitch (more 3D)
  const handleIncreasePitch = () => {
    if (map) {
      const currentPitch = map.getPitch();
      map.easeTo({
        pitch: Math.min(85, currentPitch + 10), // Max pitch is 85 in Mapbox
        duration: 300,
        easing: (t) => t * t * (3 - 2 * t),
      });
    }
  };

  // Decrease pitch (more 2D)
  const handleDecreasePitch = () => {
    if (map) {
      const currentPitch = map.getPitch();
      map.easeTo({
        pitch: Math.max(0, currentPitch - 10),
        duration: 300,
        easing: (t) => t * t * (3 - 2 * t),
      });
    }
  };

  // Create the button style function to reduce repetition
  const getButtonStyle = (topPosition) => {
    return {
      width: '30px',
      height: '30px',
      color: 'black',
      top: topPosition,
      right: rightPosition,
    };
  };

  return (
    <>
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullScreen}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('20px')}
      >
        {isFullscreen ? (
          <FiMinimize className="w-4 h-4" />
        ) : (
          <FiMaximize className="w-4 h-4" />
        )}
      </button>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('60px')}
      >
        <FiPlus className="w-4 h-4" />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('100px')}
      >
        <FiMinus className="w-4 h-4" />
      </button>

      {/* Rotate Left Button */}
      <button
        onClick={() => {
          if (map) {
            const currentBearing = map.getBearing();
            map.easeTo({
              bearing: currentBearing - 45,
              duration: 700,
              easing: (t) => t * t * (3 - 2 * t),
            });
          }
        }}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('140px')}
      >
        <FiRotateCcw className="w-4 h-4" />
      </button>

      {/* Rotate Right Button */}
      <button
        onClick={() => {
          if (map) {
            const currentBearing = map.getBearing();
            map.easeTo({
              bearing: currentBearing + 45,
              duration: 700,
              easing: (t) => t * t * (3 - 2 * t),
            });
          }
        }}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('180px')}
      >
        <FiRotateCw className="w-4 h-4" />
      </button>

      {/* Increase Pitch Button (more 3D) */}
      <button
        onClick={handleIncreasePitch}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('220px')}
      >
        <FiArrowUp className="w-4 h-4" />
      </button>

      {/* Decrease Pitch Button (more 2D) */}
      <button
        onClick={handleDecreasePitch}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('260px')}
      >
        <FiArrowDown className="w-4 h-4" />
      </button>

      {/* Reset View Button */}
      <button
        onClick={zoomToBounds}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('300px')}
      >
        <FiTarget className="w-4 h-4" />
      </button>

      {/* Previous Marker Button */}
      <button
        onClick={handlePreviousMarker}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('340px')}
      >
        <FiArrowLeft className="w-4 h-4" />
      </button>

      {/* Next Marker Button */}
      <button
        onClick={handleNextMarker}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('380px')}
      >
        <FiArrowRight className="w-4 h-4" />
      </button>

      {/* Stats Toggle Button */}
      <button
        onClick={toggleStats}
        className="absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
        style={getButtonStyle('420px')}
      >
        <FaChartLine className="w-4 h-4" />
      </button>

      {/* Filter Toggle Button */}
      <button
        onClick={toggleFilters}
        className={`absolute z-50 p-2 rounded-lg shadow-lg flex items-center justify-center ${isFiltersOpen ? 'bg-yellow-500 text-white' : 'bg-white text-black'}`}
        style={getButtonStyle('460px')}
      >
        <FiFilter className="w-4 h-4" />
      </button>
    </>
  );
};

export default MapControls;
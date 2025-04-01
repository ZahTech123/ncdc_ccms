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
  isFiltersOpen,
  fullscreenTopOffset = 120, // Default value if not provided
  normalTopOffset = 65, // Default value if not provided
  showStatsButton = true // Default to showing the stats button
}) => {
  // Base position from top - now dynamic based on screen mode
  const controlsTopOffset = isFullscreen ? fullscreenTopOffset : normalTopOffset;
  // Spacing between buttons
  const buttonSpacing = 40;

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
    return isFiltersOpen ? '360px' : '20px';
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

  // Create the button style function using the index to calculate position
  const getButtonStyle = (index) => {
    return {
      width: '30px',
      height: '30px',
      color: 'black',
      top: `${controlsTopOffset + (index * buttonSpacing)}px`,
      right: rightPosition,
    };
  };

  // Define the base control buttons with their respective handlers
  let controlButtons = [
    {
      icon: isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />,
      onClick: toggleFullScreen,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiPlus className="w-4 h-4" />,
      onClick: handleZoomIn,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiMinus className="w-4 h-4" />,
      onClick: handleZoomOut,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiRotateCcw className="w-4 h-4" />,
      onClick: () => {
        if (map) {
          const currentBearing = map.getBearing();
          map.easeTo({
            bearing: currentBearing - 45,
            duration: 700,
            easing: (t) => t * t * (3 - 2 * t),
          });
        }
      },
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiRotateCw className="w-4 h-4" />,
      onClick: () => {
        if (map) {
          const currentBearing = map.getBearing();
          map.easeTo({
            bearing: currentBearing + 45,
            duration: 700,
            easing: (t) => t * t * (3 - 2 * t),
          });
        }
      },
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiArrowUp className="w-4 h-4" />,
      onClick: handleIncreasePitch,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiArrowDown className="w-4 h-4" />,
      onClick: handleDecreasePitch,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiTarget className="w-4 h-4" />,
      onClick: zoomToBounds,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiArrowLeft className="w-4 h-4" />,
      onClick: handlePreviousMarker,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    },
    {
      icon: <FiArrowRight className="w-4 h-4" />,
      onClick: handleNextMarker,
      className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
    }
  ];
  
  // Only add these buttons in fullscreen mode
  if (isFullscreen) {
    // Add stats button only in fullscreen mode if showStatsButton is true
    if (showStatsButton) {
      controlButtons.push({
        icon: <FaChartLine className="w-4 h-4" />,
        onClick: toggleStats,
        className: "absolute z-50 bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
      });
    }
    
    // Add filter button only in fullscreen mode
    controlButtons.push({
      icon: <FiFilter className="w-4 h-4" />,
      onClick: toggleFilters,
      className: `absolute z-50 p-2 rounded-lg shadow-lg flex items-center justify-center ${isFiltersOpen ? 'bg-yellow-500 text-white' : 'bg-white text-black'}`
    });
  }

  return (
    <>
      {controlButtons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={button.className}
          style={getButtonStyle(index)}
        >
          {button.icon}
        </button>
      ))}
    </>
  );
};

export default MapControls;
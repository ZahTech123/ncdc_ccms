import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import MapPagePopUpModal from "../MapPagePopUpModal";
import DynamicCards from "../DynamicCards2";
import Filters from "../Filters";
import { usePermissions } from "../../../context/PermissionsContext";
import { useTickets } from "../../../context/TicketsContext";
import { filterTickets } from "../../../utils/ticketFilters";
import MapControls from "./MapControls";
import Sidebar from "./Sidebar";
import LiveDataFeed from './LiveDataFeed';
import { useMapInitialization } from './useMapInitialization';
import { useMapMarkers } from './useMapMarkers';
import BottomStats from './BottomStats/BottomStats';
import FullscreenFilters from './FullscreenFilters';

// Main MapPage component
const MapPage = () => {
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  const { filteredTickets, updateTicket } = useTickets();

  // State Management
  const [selectedCity, setSelectedCity] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [locationKeyword, setLocationKeyword] = useState("");
  const [map, setMap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [priority, setPriority] = useState("");
  const [selectedDirectorate, setSelectedDirectorate] = useState("");
  const mapContainerRef = useRef();
  const parentContainerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshHandled, setRefreshHandled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [markerClicked, setMarkerClicked] = useState(false); // Track marker clicks

  // Prevent zoom to bounds if marker interaction is recent
  const lastInteractionRef = useRef({
    timestamp: 0,
    isMarkerInteraction: false
  });

  // Create ref to track filter changes without causing re-renders
  const filterChangeRef = useRef({
    changed: false,
    lastUpdate: Date.now(),
    pendingZoom: false
  });

  // Use the custom hook for map initialization
  useMapInitialization(mapContainerRef, setMap, setIsFullscreen);

  // Filter tickets based on selected filters and role
  const filteredComplaints = useMemo(() => {
    // Mark that filters have changed and may need a zoom update
    if (!initialLoad) {
      filterChangeRef.current.changed = true;
      filterChangeRef.current.lastUpdate = Date.now();
      filterChangeRef.current.pendingZoom = true;
    }

    return filterTickets(
      filteredTickets,
      priority,
      category,
      locationKeyword,
      role,
      selectedDirectorate,
      selectedCity,
      date
    );
  }, [filteredTickets, category, locationKeyword, priority, role, selectedDirectorate, selectedCity, date, initialLoad]);

  // Use the custom hook for map markers management with exported zoomToMarker
  const {
    markersRef,
    updateMarkers,
    zoomToBounds,
    zoomToMarker
  } = useMapMarkers(
    map,
    filteredComplaints,
    role,
    updateTicket,
    initialLoad,
    setSelectedComplaint,
    setShowModal,
    setMarkerClicked
  );

  // Enhanced marker click handler that prevents auto-zooming
  const handleMarkerClick = useCallback((complaint) => {
    if (!complaint.latitude || !complaint.longitude) {
      console.error("Invalid latitude or longitude for complaint:", complaint.ticketId);
      return;
    }
  
    console.log("Handling marker click for complaint:", complaint.ticketId);
  
    // Set the marker clicked state to true - this will prevent auto-zooming
    setMarkerClicked(true);
  
    // Update last interaction reference to prevent auto-zooming
    lastInteractionRef.current = {
      timestamp: Date.now(),
      isMarkerInteraction: true,
    };
  
    // Find the matching marker
    const marker = markersRef.current.find(
      (m) =>
        m._lngLat.lng === complaint.longitude &&
        m._lngLat.lat === complaint.latitude
    );
  
    if (!marker) {
      console.error("Marker not found for complaint:", complaint.ticketId);
      return;
    }
  
    console.log("Calling zoomToMarker with:", complaint.longitude, complaint.latitude, marker);
    zoomToMarker(complaint.longitude, complaint.latitude, marker);
  }, [markersRef, zoomToMarker]);

  // Create a specialized function to handle both resetting filters and zooming
  const resetFiltersAndZoom = useCallback(() => {
    // Reset marker clicked state to allow auto-zooming
    setMarkerClicked(false);

    // Reset last interaction to allow auto-zooming
    lastInteractionRef.current = {
      timestamp: Date.now(),
      isMarkerInteraction: false
    };

    // Reset all filter states
    setSelectedCity("");
    setCategory("");
    setDate("");
    setLocationKeyword("");
    setPriority("");
    setSelectedDirectorate("");

    // Then trigger a zoom after a small delay
    setTimeout(() => {
      zoomToBounds();
    }, 100);
  }, [zoomToBounds]);

  // Create a cleaner function to reset both the marker state and zoom
  const resetViewAndZoom = useCallback(() => {
    // Reset marker clicked state to allow auto-zooming
    setMarkerClicked(false);

    // Reset last interaction to allow auto-zooming
    lastInteractionRef.current = {
      timestamp: Date.now(),
      isMarkerInteraction: false
    };

    // Trigger zoom to bounds
    zoomToBounds();
  }, [zoomToBounds]);

  // Enhanced function to trigger filter-based zoom only when appropriate
  const triggerFilterZoom = useCallback(() => {
    // Don't auto-zoom if a marker was recently clicked
    if (markerClicked || lastInteractionRef.current.isMarkerInteraction) {
      // Check if enough time has passed since last marker interaction
      const timeSinceInteraction = Date.now() - lastInteractionRef.current.timestamp;
      if (timeSinceInteraction < 5000) { // 5 seconds protection
        console.log('Skipping filter zoom due to recent marker interaction');
        return;
      }
    }

    // Reset pending zoom flag
    filterChangeRef.current.pendingZoom = false;

    // Perform the zoom
    zoomToBounds();
  }, [markerClicked, zoomToBounds]);

  // Dedicated effect for auto-zooming after filter changes
  useEffect(() => {
    if (!map || initialLoad) return;

    // Skip if there's an active marker interaction
    if (markerClicked) return;

    // Check if filter change flag is set and zoom is pending
    if (filterChangeRef.current.changed && filterChangeRef.current.pendingZoom) {
      // This will ensure we zoom to bounds whenever filters change
      const timer = setTimeout(() => {
        triggerFilterZoom();
        // Reset the filter change flag
        filterChangeRef.current.changed = false;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [map, filteredComplaints.length, triggerFilterZoom, initialLoad, markerClicked]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle filters visibility
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Filter complaints based on search query
  const searchedComplaints = useMemo(() => {
    if (!searchQuery) return filteredComplaints;

    return filteredComplaints.filter((complaint) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();

      // Search through all the specified fields
      const ticketId = (complaint?.ticketId || '').toLowerCase();
      const team = (complaint?.team || '').toLowerCase();
      const suburb = (complaint?.suburb || '').toLowerCase();
      const electorate = (complaint?.electorate || '').toLowerCase();
      const directorate = (complaint?.directorate || '').toLowerCase();
      const status = (complaint?.status || '').toLowerCase();

      // Return true if any field contains the search query
      return ticketId.includes(query) ||
             team.includes(query) ||
             suburb.includes(query) ||
             electorate.includes(query) ||
             directorate.includes(query) ||
             status.includes(query);
    });
  }, [filteredComplaints, searchQuery]);

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenEnabled) {
      alert('Fullscreen mode is not supported in this environment.');
      return;
    }

    if (!document.fullscreenElement) {
      parentContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Set page refresh flag on component mount
  useEffect(() => {
    sessionStorage.setItem('isPageRefresh', 'true');
  }, []);

  // Handle page refresh detection separately
  useEffect(() => {
    const isPageRefresh = sessionStorage.getItem('isPageRefresh') === 'true';

    if (isPageRefresh && map && !refreshHandled) {
      resetFiltersAndZoom();
      setRefreshHandled(true);
      sessionStorage.setItem('isPageRefresh', 'false');
    }
  }, [map, refreshHandled, resetFiltersAndZoom]);

  // Update markers when filtered complaints change
  useEffect(() => {
    if (!map) return;
    updateMarkers();
  }, [map, filteredComplaints, updateMarkers]);

  // Dedicated effect for initial map setup and zoom
  useEffect(() => {
    if (map && initialLoad) {
      const zoomTimer = setTimeout(() => {
        zoomToBounds();
        map.once('moveend', () => {
          setInitialLoad(false);
        });
      }, 300);
      return () => clearTimeout(zoomTimer);
    }
  }, [map, initialLoad, zoomToBounds]);

  // Exit fullscreen mode when exiting the component
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  // Toggle Stats visibility
  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Close filters when exiting fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setShowFilters(false);
    }
  }, [isFullscreen]);

  // Function to open a complaint from the card list - now using the enhanced marker click handler
  const handleCardClick = useCallback((complaint) => {
    handleMarkerClick(complaint);
  }, [handleMarkerClick]);

  return (
    <div
      ref={parentContainerRef}
      className={`flex ${isFullscreen ? '' : 'p-8 space-x-6'}`}
    >
      {!isFullscreen && (
        <DynamicCards
          filteredComplaints={searchedComplaints}
          markersRef={markersRef}
          flyToLocation={handleCardClick}
          setSelectedComplaint={setSelectedComplaint}
          setShowModal={setShowModal}
          isFullscreen={isFullscreen}
        />
      )}
      <div
        className={`${isFullscreen ? 'w-full h-screen' : 'w-3/5 bg-gray-800 p-6 rounded-lg space-y-6'} relative`}
      >
        {/* Live Data Feed */}
        {isFullscreen && <LiveDataFeed />}

        {/* Sidebar */}
        {isFullscreen && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchChange={handleSearchChange}
            searchedComplaints={searchedComplaints}
            markersRef={markersRef}
            flyToLocation={handleCardClick}
            setSelectedComplaint={setSelectedComplaint}
            setShowModal={setShowModal}
            isFullscreen={isFullscreen}
          />
        )}

        {/* Fullscreen Filters */}
        {isFullscreen && (
          <FullscreenFilters
            isOpen={showFilters}
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
            zoomToBounds={resetViewAndZoom}
            manualZoomOut={resetViewAndZoom}
            markerClicked={markerClicked}
            disableAutoZoom={true}
          />
        )}

        {/* Map Container */}
        <div
          id="map"
          className="w-full h-full rounded-lg"
          ref={mapContainerRef}
        ></div>

        {/* Map Controls */}
        <MapControls
          map={map}
          isFullscreen={isFullscreen}
          toggleFullScreen={toggleFullScreen}
          zoomToBounds={resetViewAndZoom}
          markersRef={markersRef}
          toggleStats={toggleStats}
          toggleFilters={toggleFilters}
          isFiltersOpen={showFilters}
          markerClicked={markerClicked}
        />
      </div>
      {!isFullscreen && (
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
          zoomToBounds={resetViewAndZoom}
          markerClicked={markerClicked}
          disableAutoZoom={true}
        />
      )}
      {showModal && (
        <MapPagePopUpModal
          selectedComplaint={selectedComplaint}
          setShowModal={setShowModal}
          setSelectedComplaint={setSelectedComplaint}
        />
      )}
      {showStats && <BottomStats />}
    </div>
  );
};

export default MapPage;
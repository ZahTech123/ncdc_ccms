import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import MapPagePopUpModal from "../MapPagePopUpModal";
import DynamicCards from "../DynamicCards2";
import Filters from "../Filters";
import { usePermissions } from "../../../context/PermissionsContext";
import { useTickets } from "../../../context/TicketsContext";
import { filterTickets } from "../../../utils/ticketFilters";
import MapControls from "./MapControls";
import Sidebar from "./Sidebar";
import LiveDataFeed from "./LiveDataFeed";
import { useMapInitialization } from "./useMapInitialization";
import { useMapMarkers } from "./useMapMarkers";
import BottomStats from "./BottomStats/BottomStats";
import FullscreenFilters from "./FullscreenFilters";
import NavbarTopRight from "../TopRightBar/TopRightBar";
import NotificationModal from "../../../components/NotificationModal";
import { useNotifications } from "../../../context/NotificationsContext";

// Main MapPage component
const MapPage = () => {
  const { userPermissions } = usePermissions();
  const { role } = userPermissions;
  const { filteredTickets, updateTicket } = useTickets();
  const { newTickets, markAsRead } = useNotifications();

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
  const [isFullscreen, setIsFullscreen] = useState(false); // Simple boolean for fullscreen state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshHandled, setRefreshHandled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [markerClicked, setMarkerClicked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Use the custom hook for map initialization with the currentStyleIndex
  const { currentStyleIndex, toggleMapStyle } = useMapInitialization(
    mapContainerRef,
    setMap,
    setIsFullscreen,
    isDarkMode
  );

  // Add a fullscreen change listener to sync state with browser fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenState = !!document.fullscreenElement;
      console.log("Browser fullscreen state changed:", fullscreenState);
      setIsFullscreen(fullscreenState);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Debug log for fullscreen state changes
  useEffect(() => {
    console.log("Current fullscreen state:", isFullscreen);
  }, [isFullscreen]);

  // Toggle map style and sync with dark mode state
  const handleToggleMapStyle = () => {
    toggleMapStyle();

    if (currentStyleIndex === 0) {
      setIsDarkMode(true);
    } else if (currentStyleIndex === 1) {
      // Keep isDarkMode as true here
    } else {
      setIsDarkMode(false);
    }
  };

  // Prevent zoom to bounds if marker interaction is recent
  const lastInteractionRef = useRef({
    timestamp: 0,
    isMarkerInteraction: false,
  });

  // Create ref to track filter changes without causing re-renders
  const filterChangeRef = useRef({
    changed: false,
    lastUpdate: Date.now(),
    pendingZoom: false,
  });

  // Filter tickets based on selected filters and role
  const filteredComplaints = useMemo(() => {
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
  }, [
    filteredTickets,
    category,
    locationKeyword,
    priority,
    role,
    selectedDirectorate,
    selectedCity,
    date,
    initialLoad,
  ]);

  // Use the custom hook for map markers management with exported zoomToMarker
// Add logging before calling useMapMarkers
console.log("MapPage - isFullscreen before useMapMarkers:", isFullscreen);

const { markersRef, updateMarkers, zoomToBounds, zoomToMarker } = useMapMarkers(
  map,
  filteredComplaints,
  role,
  updateTicket,
  initialLoad,
  setSelectedComplaint,
  setShowModal,
  setMarkerClicked,
  isFullscreen  // Make sure this parameter is passed
);

  // Force marker update when fullscreen state changes
  useEffect(() => {
    if (map) {
      console.log("Updating markers due to fullscreen change:", isFullscreen);
      updateMarkers();
    }
  }, [isFullscreen, map, updateMarkers]);

  // Enhanced marker click handler that prevents auto-zooming
  const handleMarkerClick = useCallback(
    (complaint) => {
      if (!complaint.latitude || !complaint.longitude) {
        console.error(
          "Invalid latitude or longitude for complaint:",
          complaint.ticketId
        );
        return;
      }
  
      console.log("Handle marker click - fullscreen state:", isFullscreen);
      setMarkerClicked(true);
  
      lastInteractionRef.current = {
        timestamp: Date.now(),
        isMarkerInteraction: true,
      };
  
      const marker = markersRef.current.find(
        (m) =>
          m._lngLat.lng === complaint.longitude &&
          m._lngLat.lat === complaint.latitude
      );
  
      if (!marker) {
        console.error("Marker not found for complaint:", complaint.ticketId);
        return;
      }
  
      zoomToMarker(complaint.longitude, complaint.latitude, marker);
    },
    [markersRef, zoomToMarker, isFullscreen]  // Remove isFullscreen here since it's already a dependency in zoomToMarker
  );
  // Create a specialized function to handle both resetting filters and zooming
  const resetFiltersAndZoom = useCallback(() => {
    setMarkerClicked(false);

    lastInteractionRef.current = {
      timestamp: Date.now(),
      isMarkerInteraction: false,
    };

    setSelectedCity("");
    setCategory("");
    setDate("");
    setLocationKeyword("");
    setPriority("");
    setSelectedDirectorate("");

    setTimeout(() => {
      zoomToBounds();
    }, 100);
  }, [zoomToBounds]);

  // Create a cleaner function to reset both the marker state and zoom
  const resetViewAndZoom = useCallback(() => {
    setMarkerClicked(false);

    lastInteractionRef.current = {
      timestamp: Date.now(),
      isMarkerInteraction: false,
    };

    zoomToBounds();
  }, [zoomToBounds]);

  // Enhanced function to trigger filter-based zoom only when appropriate
  const triggerFilterZoom = useCallback(() => {
    if (markerClicked || lastInteractionRef.current.isMarkerInteraction) {
      const timeSinceInteraction =
        Date.now() - lastInteractionRef.current.timestamp;
      if (timeSinceInteraction < 5000) {
        return;
      }
    }

    filterChangeRef.current.pendingZoom = false;
    zoomToBounds();
  }, [markerClicked, zoomToBounds]);

  // Dedicated effect for auto-zooming after filter changes
  useEffect(() => {
    if (!map || initialLoad) return;

    if (markerClicked) return;

    if (
      filterChangeRef.current.changed &&
      filterChangeRef.current.pendingZoom
    ) {
      const timer = setTimeout(() => {
        triggerFilterZoom();
        filterChangeRef.current.changed = false;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [
    map,
    filteredComplaints.length,
    triggerFilterZoom,
    initialLoad,
    markerClicked,
  ]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle filters visibility
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Filter complaints based on search query
  const searchedComplaints = useMemo(() => {
    if (!searchQuery) return filteredComplaints;

    return filteredComplaints.filter((complaint) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();

      const ticketId = (complaint?.ticketId || "").toLowerCase();
      const team = (complaint?.team || "").toLowerCase();
      const suburb = (complaint?.suburb || "").toLowerCase();
      const electorate = (complaint?.electorate || "").toLowerCase();
      const directorate = (complaint?.directorate || "").toLowerCase();
      const status = (complaint?.status || "").toLowerCase();

      return (
        ticketId.includes(query) ||
        team.includes(query) ||
        suburb.includes(query) ||
        electorate.includes(query) ||
        directorate.includes(query) ||
        status.includes(query)
      );
    });
  }, [filteredComplaints, searchQuery]);

  // Toggle fullscreen mode with proper state synchronization
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenEnabled) {
      alert("Fullscreen mode is not supported in this environment.");
      return;
    }

    // The actual fullscreen state change will be detected by the fullscreenchange event listener
    if (!document.fullscreenElement) {
      console.log("Entering fullscreen mode...");
      parentContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enter fullscreen:", err);
      });
    } else {
      console.log("Exiting fullscreen mode...");
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  }, []);

  // Set page refresh flag on component mount
  useEffect(() => {
    sessionStorage.setItem("isPageRefresh", "true");
  }, []);

  // Handle page refresh detection separately
  useEffect(() => {
    const isPageRefresh = sessionStorage.getItem("isPageRefresh") === "true";

    if (isPageRefresh && map && !refreshHandled) {
      resetFiltersAndZoom();
      setRefreshHandled(true);
      sessionStorage.setItem("isPageRefresh", "false");
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
        map.once("moveend", () => {
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
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen on cleanup:", err);
        });
      }
    };
  }, []);

  // Toggle Stats visibility
  const toggleStats = useCallback(() => {
    if (isFullscreen) {
      setShowStats((prev) => !prev);
    }
  }, [isFullscreen]);

  // Close filters when exiting fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setShowFilters(false);
    }
  }, [isFullscreen]);

  // Function to open a complaint from the card list - now using the enhanced marker click handler
  const handleCardClick = useCallback(
    (complaint) => {
      handleMarkerClick(complaint);
    },
    [handleMarkerClick]
  );

  const toggleAllTabs = useCallback(() => {
    const isAnyTabOpen = showStats || showFilters || isSidebarOpen;
    const newState = !isAnyTabOpen;

    setShowStats(newState);
    setShowFilters(newState);
    setIsSidebarOpen(newState);
  }, [showStats, showFilters, isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Function to toggle notification modal
  const toggleNotification = useCallback((forceClose = false) => {
    if (forceClose) {
      setIsNotificationOpen(false);
      return;
    }

    setIsNotificationOpen((prevState) => {
      const newState = !prevState;
      console.log("Setting notification modal to:", newState);
      return newState;
    });
  }, []);

  // Function to handle updating ticket read status
  const updateTicketAsRead = (ticketId) => {
    markAsRead(ticketId, role);
  };

  // Function to handle save when editing tickets
  const handleSave = async (ticketId) => {
    console.log("Saving ticket:", ticketId);
  };

  return (
    <div
      ref={parentContainerRef}
      className={`flex ${isFullscreen ? "" : "p-8 space-x-6"}`}
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
        className={`${
          isFullscreen
            ? "w-full h-screen"
            : "w-3/5 bg-gray-800 p-6 rounded-lg space-y-6"
        } relative`}
      >
        {/* Top-right NavBar when in fullscreen mode */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10">
            <NavbarTopRight
              toggleMapStyle={handleToggleMapStyle}
              currentStyleIndex={currentStyleIndex}
              toggleAllTabs={toggleAllTabs}
              toggleStats={toggleStats}
              allTabsVisible={showStats}
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              toggleNotification={toggleNotification}
              isOpen={isNotificationOpen}
              onClose={() => {
                console.log("Closing notification modal");
                setIsNotificationOpen(false);
              }}
              updateTicketAsRead={updateTicketAsRead}
              onSave={handleSave}
            />

            <NotificationModal
              isOpen={isNotificationOpen}
              onClose={() => {
                console.log("Closing notification modal");
                setIsNotificationOpen(false);
              }}
              newTickets={newTickets}
              updateTicketAsRead={updateTicketAsRead}
              onSave={handleSave}
            />
          </div>
        )}

        {/* Live Data Feed */}
        {isFullscreen && <LiveDataFeed />}

        {/* Sidebar */}
        {isFullscreen && (
          <Sidebar
            toggleSidebar={toggleSidebar}
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
            role={role}
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
            toggleFilters={toggleFilters}
            showStats={showStats}
          />
        )}

        {/* Map Container */}
        <div
          id="map"
          className="w-full h-full rounded-lg"
          ref={mapContainerRef}
          data-fullscreen={isFullscreen}
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
          fullscreenTopOffset={90}
          normalTopOffset={20}
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

      {/* Show BottomStats only in fullscreen mode */}
      {isFullscreen && showStats && <BottomStats />}
    </div>
  );
};

export default MapPage;
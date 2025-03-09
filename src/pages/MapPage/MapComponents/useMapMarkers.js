import { useRef, useCallback, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { CreatePopupContent } from "../CreatePopupContent";
import { easeQuadInOut } from "d3-ease";

export const useMapMarkers = (
  map,
  filteredComplaints,
  role,
  updateTicket,
  initialLoad,
  setSelectedComplaint,
  setShowModal,
  setMarkerClicked // Parameter to handle marker click state
) => {
  const markersRef = useRef([]);
  
  // Animation state reference
  const animationRef = useRef({
    isAnimating: false,
    currentTicketId: null,
    timeoutId: null
  });

  // Keep track of marker interaction state
  const markerInteractionRef = useRef({
    inProgress: false,
    lastMarkerZoom: 0
  });

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

  // IMPROVED MARKER ZOOM FUNCTION
  const zoomToMarker = useCallback(
    (longitude, latitude, marker) => {
      if (!map) return;

      // Set marker clicked state to true to prevent auto-zooming from filters
      if (setMarkerClicked) {
        setMarkerClicked(true);
      }
      
      // Set interaction state
      markerInteractionRef.current.inProgress = true;
      markerInteractionRef.current.lastMarkerZoom = Date.now();

      // Close any open popups
      markersRef.current.forEach((m) => {
        if (m !== marker && m.getPopup().isOpen()) {
          m.togglePopup();
        }
      });

      // Fly to the marker location
      const offsetLatitude = latitude - 0.0009;
      map.flyTo({
        center: [longitude, offsetLatitude],
        zoom: 18,
        pitch: 60,
        bearing: 0,
        speed: 0.8,
        curve: 1.2,
        essential: true,
        easing: easeQuadInOut,
      });

      // Open the popup for this marker
      if (marker) {
        marker.togglePopup();
      }
      
      // After the animation completes, we check if we need to maintain the marker clicked state
      map.once('moveend', () => {
        // Leave the marker clicked state as true, don't reset it
        // This prevents auto-zooming from taking over
        
        // Add an additional protection: prevent any auto-zooming for the next 2 seconds
        setTimeout(() => {
          markerInteractionRef.current.inProgress = false;
        }, 2000);
      });
    },
    [map, setMarkerClicked]
  );

  // Keep the original flyToLocation for compatibility
  const flyToLocation = useCallback(
    (longitude, latitude, marker) => {
      zoomToMarker(longitude, latitude, marker);
    },
    [zoomToMarker]
  );

  // Function to handle new ticket submission animation - now uses the dedicated zoom function
  const flyToNewTicket = useCallback(
    (longitude, latitude, marker) => {
      zoomToMarker(longitude, latitude, marker);
    },
    [zoomToMarker]
  );

  // Function to handle animation completion
  const handleAnimationComplete = useCallback(async (complaint, marker) => {
    try {
      // Update local state
      const updatedComplaint = { 
        ...complaint, 
        isNew: {
          ...complaint.isNew,
          [role]: false
        }
      };
      setSelectedComplaint(updatedComplaint);

      // Update Firebase
      await updateTicket(complaint.id, {
        isNew: {
          ...complaint.isNew,
          [role]: false
        }
      });
      console.log('Ticket isNew status updated in Firebase');
    } catch (error) {
      console.error('Error updating ticket in Firebase:', error);
    }

    // Clean up animation state
    animationRef.current.isAnimating = false;
    animationRef.current.currentTicketId = null;
  }, [role, updateTicket, setSelectedComplaint]);

  // Function to handle marker click and animation
  const handleMarkerClick = useCallback((complaint, marker) => {
    if (!map) return;

    // If animation is already running for this ticket, return
    if (animationRef.current.isAnimating && 
        animationRef.current.currentTicketId === complaint.id) {
      return;
    }

    // Set animation state
    animationRef.current.isAnimating = true;
    animationRef.current.currentTicketId = complaint.id;
    
    // Use the dedicated marker zoom function
    zoomToMarker(complaint.longitude, complaint.latitude, marker);

    // Listen for the 'moveend' event to detect when the animation completes
    const onMoveEnd = async () => {
      // Update the state and Firebase
      await handleAnimationComplete(complaint, marker);

      // Clean up the event listener
      map.off('moveend', onMoveEnd);
    };

    map.on('moveend', onMoveEnd);
  }, [map, handleAnimationComplete, zoomToMarker]);

  // Function to update markers
  const updateMarkers = useCallback(() => {
    if (!map) return;

    // Skip marker updates if we're in an active marker interaction
    if (markerInteractionRef.current.inProgress) {
      console.log('Skipping marker update during active marker interaction');
      return;
    }

    // Remove only markers that are no longer in filteredComplaints
    markersRef.current = markersRef.current.filter(marker => {
      const markerExists = filteredComplaints.some(complaint => 
        complaint.longitude === marker._lngLat.lng &&
        complaint.latitude === marker._lngLat.lat
      );
      
      if (!markerExists) {
        console.log('Removing marker:', marker._lngLat);
        marker.remove();
      }
      return markerExists;
    });

    // Add new markers for new complaints
    filteredComplaints.forEach(complaint => {
      if (!complaint.latitude || !complaint.longitude) return;

      // Check if marker already exists
      const markerExists = markersRef.current.some(marker => 
        marker._lngLat.lng === complaint.longitude &&
        marker._lngLat.lat === complaint.latitude
      );

      if (!markerExists) {
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
          handleMarkerClick(complaint, marker);
        });

        markersRef.current.push(marker);

        // Only fly to new tickets if it's not the initial load
        if (complaint.isNew && complaint.isNew[role] && !initialLoad) {
          setTimeout(() => {
            flyToNewTicket(complaint.longitude, complaint.latitude, marker);
          }, 500);
        }
      }
    });
  }, [map, filteredComplaints, handleMarkerClick, initialLoad, role, flyToNewTicket, setSelectedComplaint, setShowModal]);

  // IMPROVED ZOOM TO BOUNDS FUNCTION
  const zoomToBounds = useCallback(() => {
    if (!map || filteredComplaints.length === 0) return;

    // Extra protection: don't zoom to bounds if we're in an active marker interaction
    if (markerInteractionRef.current.inProgress) {
      console.log('Skipping zoomToBounds during marker interaction');
      return;
    }

    // Check how long since last marker zoom - don't override recent marker zooms
    const timeSinceLastMarkerZoom = Date.now() - markerInteractionRef.current.lastMarkerZoom;
    if (timeSinceLastMarkerZoom < 2000) { // 2 seconds protection
      console.log('Skipping zoomToBounds due to recent marker zoom');
      return;
    }

    // Reset the marker clicked state when intentionally zooming to bounds
    if (setMarkerClicked) {
      setMarkerClicked(false);
    }

    const bounds = new mapboxgl.LngLatBounds();

    filteredComplaints.forEach((complaint) => {
      if (complaint.latitude && complaint.longitude) {
        bounds.extend([complaint.longitude, complaint.latitude]);
      }
    });

    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 12,
      speed: 0.9,
      essential: true,
      easing: easeQuadInOut,
    });
  }, [map, filteredComplaints, setMarkerClicked]);

  // Update markers when filtered complaints change
  useEffect(() => {
    if (!map) return;

    // Log when marker update effect runs
    console.log('Marker update effect triggered', {
      timestamp: new Date().toISOString(),
      complaintCount: filteredComplaints.length,
      initialLoad
    });

    updateMarkers();
  }, [map, filteredComplaints, updateMarkers, initialLoad]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // If user navigates away from the page, update all new tickets
        const newTickets = filteredComplaints.filter(
          complaint => complaint.isNew?.[role]
        );

        for (const complaint of newTickets) {
          try {
            await updateTicket(complaint.id, {
              isNew: {
                ...complaint.isNew,
                [role]: false
              }
            });
            console.log(`Updated ticket ${complaint.id} as read for role ${role}`);
          } catch (error) {
            console.error(`Error updating ticket ${complaint.id}:`, error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filteredComplaints, role, updateTicket]);

  return {
    markersRef,
    flyToLocation,
    flyToNewTicket,
    handleMarkerClick,
    updateMarkers,
    zoomToBounds,
    zoomToMarker // Export the new dedicated function
  };
};
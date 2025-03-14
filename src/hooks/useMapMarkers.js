import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { CreatePopupContent } from '../pages/MapPage/CreatePopupContent';

const useMapMarkers = (
  map,
  filteredComplaints,
  role,
  updateTicket,
  initialLoad,
  setSelectedComplaint,
  setShowModal,
  setMarkerClicked,
  isFullscreen
) => {
  const markersRef = useRef([]);
  const markerInteractionRef = useRef({
    inProgress: false,
    lastMarkerZoom: 0,
  });

  console.log("useMapMarkers - initial isFullscreen value:", isFullscreen);

  const zoomToMarker = useCallback(
    (longitude, latitude, marker) => {
      if (!map) return;

      console.log(`Zooming to marker - Fullscreen mode: ${isFullscreen}`);

      // Remove any existing animations
      map.stop();
      
      // First, set the zoom level immediately
      map.setZoom(18);
      
      // Then ease to the location
      const offsetLatitude = isFullscreen ? latitude - 1 : latitude - 0.0009;
      map.easeTo({
        center: [longitude, offsetLatitude],
        zoom: 18,
        essential: true,
        duration: 1000,
        pitch: 60,
        bearing: 0
      });

      // Add a listener to maintain the zoom level
      const maintainZoom = () => {
        map.setZoom(18);
      };
      
      // Add listeners to prevent zoom changes
      map.on('zoomstart', maintainZoom);
      map.on('zoomend', maintainZoom);
      map.on('moveend', maintainZoom);

      // Cleanup listeners when component unmounts
      return () => {
        map.off('zoomstart', maintainZoom);
        map.off('zoomend', maintainZoom);
        map.off('moveend', maintainZoom);
      };
    },
    [map, setMarkerClicked, isFullscreen]
  );

  useEffect(() => {
    if (!map) return;

    // Remove only markers that are no longer in filteredComplaints
    markersRef.current = markersRef.current.filter(marker => {
      const markerExists = filteredComplaints.some(complaint => 
        complaint.longitude === marker._lngLat.lng &&
        complaint.latitude === marker._lngLat.lat
      );
      
      if (!markerExists) {
        marker.remove();
      }
      return markerExists;
    });

    // Add new markers for new complaints
    filteredComplaints.forEach(complaint => {
      if (!complaint.latitude || !complaint.longitude) return;

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

        marker._complaint = complaint;

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
          zoomToMarker(complaint.longitude, complaint.latitude, marker);
        });

        markersRef.current.push(marker);

        if (complaint.isNew && !initialLoad) {
          setTimeout(() => {
            zoomToMarker(complaint.longitude, complaint.latitude, marker);
            setTimeout(() => {
              if (!marker.getPopup().isOpen()) {
                marker.togglePopup();
              }
              const updatedComplaint = { ...complaint, isNew: false };
              setSelectedComplaint(updatedComplaint);
            }, 800);
          }, 500);
        }
      }
    });

    if (initialLoad) {
      setInitialLoad(false);
    }

  }, [map, filteredComplaints, zoomToMarker, initialLoad]);

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

  return { markersRef, zoomToMarker };
};

export default useMapMarkers; 
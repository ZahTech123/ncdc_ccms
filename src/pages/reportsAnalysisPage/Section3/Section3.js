import React, { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from 'mapbox-gl';
import ComplaintStatusChart from "./ComplaintStatusChart";
import GeneratedReports from "./GenerateReports/GeneratedReports";
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = "pk.eyJ1Ijoiam9obnNraXBvbGkiLCJhIjoiY201c3BzcDYxMG9neDJscTZqeXQ4MGk4YSJ9.afrO8Lq1P6mIUbSyQ6VCsQ";

const Section3 = ({ tickets = [] }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const markersRef = useRef([]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [147.1514, -9.4780],
      zoom: 12,
      interactive: true,
      preserveDrawingBuffer: true,
      antialias: true,
      attributionControl: false
    });

    mapInstance.on('load', () => {
      setMap(mapInstance);
      setMapReady(true);
      setIsMapLoading(false);
      mapInstance.resize();
    });

    mapInstance.on('render', () => {
      if (mapInstance.loaded()) {
        mapInstance.repaint = true;
      }
    });

    mapInstance.on('error', (e) => {
      console.error('Map error:', e.error);
      setIsMapLoading(false);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      if (mapInstance) mapInstance.remove();
    };
  }, [map]);

  // Enhanced marker update function
  const updateMarkers = useCallback(() => {
    if (!mapReady || !map || isMapLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Only proceed if we have valid coordinates
    const validTickets = tickets.filter(t => t.latitude && t.longitude);
    if (validTickets.length === 0) return;

    // Batch marker creation in animation frame
    requestAnimationFrame(() => {
      validTickets.forEach(ticket => {
        try {
          const el = document.createElement('div');
          el.className = 'map-marker';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.background = '#ff0000';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 8px rgba(0,0,0,0.5)';
          el.style.transform = 'translate(-50%, -50%)';

          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
          })
            .setLngLat([ticket.longitude, ticket.latitude])
            .addTo(map);
          
          markersRef.current.push(marker);
        } catch (error) {
          console.error('Failed to add marker:', error);
        }
      });

      // Fit bounds with padding if we have markers
      if (markersRef.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markersRef.current.forEach(marker => bounds.extend(marker.getLngLat()));
        
        map.fitBounds(bounds, { 
          padding: 100,
          maxZoom: 14,
          duration: 1000
        });
      }

      // Force repaint after markers are added
      map.triggerRepaint();
    });
  }, [mapReady, map, tickets, isMapLoading]);

  // Debounced effect for markers
  useEffect(() => {
    const timer = setTimeout(updateMarkers, 300);
    return () => clearTimeout(timer);
  }, [updateMarkers]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div 
        ref={mapContainerRef} 
        className="map-container-hidden"
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          top: '-9999px', 
          left: '-9999px' 
        }}
      />
      
      <GeneratedReports 
        tickets={tickets} 
        map={mapReady ? map : null} 
      />
      <ComplaintStatusChart tickets={tickets} />
    </div>
  );
};

export default Section3;
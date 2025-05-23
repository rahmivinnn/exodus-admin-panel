import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { LoadRequest } from '../types';

interface MapProps {
  loadRequest?: LoadRequest;
  className?: string;
  showControls?: boolean;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZnVlbGZyaWVuZGx5MjAyNSIsImEiOiJjbTlzZGZsOHowMW00Mm1xNGEzcHhzYnQ4In0.5K8rY561eFLN2hy0U7QPdw';

export const Map: React.FC<MapProps> = ({ 
  loadRequest, 
  className = '',
  showControls = true,
  onRouteCalculated
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // Center of USA
        zoom: 3.5,
        attributionControl: false
      });

      // Add attribution control
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }));

      // Add navigation controls if enabled
      if (showControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        map.current.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }), 'top-right');
      }

      // Handle map load errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map. Please try refreshing the page.');
      });

      // Cleanup on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try refreshing the page.');
    }
  }, [showControls]);

  // Handle load request changes
  useEffect(() => {
    if (!map.current) return;

    if (loadRequest) {
      // Clear existing routes and markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Get coordinates for origin and destination
      const origin = loadRequest.origin;
      const destination = loadRequest.destination;

      // Add markers
      const originMarker = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([origin.longitude, origin.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Origin</h3>
            <p>${origin.address}</p>
          </div>
        `))
        .addTo(map.current);

      const destinationMarker = new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat([destination.longitude, destination.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Destination</h3>
            <p>${destination.address}</p>
          </div>
        `))
        .addTo(map.current);

      markers.current.push(originMarker, destinationMarker);

      // Get route
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
          if (!map.current) return;
          
          const route = data.routes[0].geometry;
          
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 4,
              'line-opacity': 0.75
            }
          });

          // Fit bounds to show the entire route
          const bounds = new mapboxgl.LngLatBounds();
          route.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
          map.current.fitBounds(bounds, {
            padding: 50,
            duration: 1000
          });
        })
        .catch(error => {
          console.error('Error fetching route:', error);
        });
    } else {
      // Clear existing routes and markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
    }
  }, [loadRequest]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className={`w-full h-full min-h-[400px] rounded-lg shadow-lg ${className}`}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 
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
    if (!map.current || !loadRequest) {
      // Clear existing route if no loadRequest is provided
      if (map.current && map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      return;
    }

    const updateMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clear existing markers and route
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        // Get coordinates for origin and destination
        const origin = `${loadRequest.origin.city}, ${loadRequest.origin.state} ${loadRequest.origin.zipCode}`;
        const destination = `${loadRequest.destination.city}, ${loadRequest.destination.state} ${loadRequest.destination.zipCode}`;

        // Geocode addresses
        const [originResponse, destinationResponse] = await Promise.all([
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${mapboxgl.accessToken}`),
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxgl.accessToken}`)
        ]);

        if (!originResponse.ok || !destinationResponse.ok) {
          throw new Error('Failed to geocode addresses');
        }

        const [originData, destinationData] = await Promise.all([
          originResponse.json(),
          destinationResponse.json()
        ]);

        const originCoords = originData.features[0]?.center;
        const destinationCoords = destinationData.features[0]?.center;

        if (!originCoords || !destinationCoords || !map.current) {
          throw new Error('Could not find coordinates for addresses');
        }

        // Add markers with custom HTML
        const originMarker = new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat(originCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-blue-600">Origin</h3>
              <p class="text-sm">${origin}</p>
              <p class="text-xs text-gray-500 mt-1">Click for details</p>
            </div>
          `))
          .addTo(map.current);

        const destinationMarker = new mapboxgl.Marker({ color: '#10B981' })
          .setLngLat(destinationCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-green-600">Destination</h3>
              <p class="text-sm">${destination}</p>
              <p class="text-xs text-gray-500 mt-1">Click for details</p>
            </div>
          `))
          .addTo(map.current);

        markers.current = [originMarker, destinationMarker];

        // Fit map to show both markers
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(originCoords);
        bounds.extend(destinationCoords);
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 10,
          duration: 1000
        });

        // Get route
        const routeResponse = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.join(',')};${destinationCoords.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        if (!routeResponse.ok) {
          throw new Error('Failed to calculate route');
        }

        const routeData = await routeResponse.json();

        if (!map.current || !routeData.routes || routeData.routes.length === 0) {
          console.error('No route found', routeData);
          setError('Could not find a route for the given addresses.');
          return;
        }

        // Add route layer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: routeData.routes[0].geometry
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
            'line-opacity': 0.8
          }
        });

        // Add route background for better visibility
        map.current.addLayer({
          id: 'route-background',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.8
          }
        }, 'route');

        // Notify parent component about route details
        if (onRouteCalculated && routeData.routes && routeData.routes.length > 0) {
          const distance = routeData.routes[0].distance / 1609.34; // Convert meters to miles
          const duration = routeData.routes[0].duration / 3600; // Convert seconds to hours
          onRouteCalculated(distance, duration);
        }

      } catch (err) {
        console.error('Error updating map:', err);
        setError(err instanceof Error ? err.message : 'Failed to update map');
      } finally {
        setIsLoading(false);
      }
    };

    updateMap();
  }, [loadRequest, onRouteCalculated]);

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
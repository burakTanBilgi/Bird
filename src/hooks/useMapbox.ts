import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface UseMapboxProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  show3DBuildings?: boolean;
}

export const useMapbox = ({
  initialLng = 32.8552,
  initialLat = 39.8472,
  initialZoom = 15,
  show3DBuildings = true
}: UseMapboxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState<number>(initialLng);
  const [lat, setLat] = useState<number>(initialLat);
  const [zoom, setZoom] = useState<number>(initialZoom);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
      antialias: true,
      projection: 'globe'
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('move', () => {
      if (!map.current) return;
      setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current.getZoom().toFixed(2)));
    });

    map.current.on('style.load', () => {
      if (!map.current || !show3DBuildings) return;

      const layers = map.current.getStyle().layers;
      if (!layers) return;

      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']
      )?.id;

      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Add base 3D buildings layer
      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#d1d1d1',
              50, '#c9c9c9',
              100, '#b8b8b8',
              200, '#a3a3a3',
              400, '#8f8f8f'
            ],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 1.0
          }
        },
        labelLayerId
      );

      // Add property buildings layer (blue colored buildings with properties)
      map.current.addLayer({
        id: 'property-buildings',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['in', ['id'], ['literal', []]], // Empty filter initially
        paint: {
          'fill-extrusion-color': '#1e90ff',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 1.0
        }
      }, labelLayerId);

      // Add selected building layer (highlighted building when clicked)
      map.current.addLayer({
        id: 'selected-building',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['id'], ''], // Empty filter initially
        paint: {
          'fill-extrusion-color': '#e74c3c', // Softer, more elegant red
          'fill-extrusion-height': ['get', 'height'], // Keep original building height
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.85 // Higher opacity for solid look
        }
      }, labelLayerId);

      // Add selected building light effect layer
      map.current.addLayer({
        id: 'selected-building-light',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['id'], ''], // Empty filter initially
        paint: {
          'fill-extrusion-color': '#c0392b', // Darker, more muted red for light effect
          'fill-extrusion-height': 50000,
          'fill-extrusion-base': ['get', 'height'], // Start from roof (original height)
          'fill-extrusion-opacity': 0.35 // Low opacity for subtle light effect
        }
      }, labelLayerId);

      map.current.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.5, 180, 60]
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return {
    mapContainer,
    map,
    lng,
    lat,
    zoom
  };
};
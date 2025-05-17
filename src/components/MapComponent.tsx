// components/MapComponent.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../styles/MapComponent.module.css';

// Set your Mapbox token here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapComponentProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  show3DBuildings?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialLng = 28.9784,
  initialLat = 41.0082,
  initialZoom = 9,
  show3DBuildings = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState<number>(initialLng);
  const [lat, setLat] = useState<number>(initialLat);
  const [zoom, setZoom] = useState<number>(initialZoom);

  useEffect(() => {
    // Initialize map only once and if the container is available
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
      pitch: 45,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Update state when map moves
    map.current.on('move', () => {
      if (!map.current) return;
      setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current.getZoom().toFixed(2)));
    });

    // Add 3D buildings once the map style has loaded
    map.current.on('style.load', () => {
      if (!map.current || !show3DBuildings) return;

      // 3D binaları eklemek için katman kontrolü
      const layers = map.current.getStyle().layers;
      if (!layers) return;

      // İlk sembol katmanını bul (etiketler ve şehir adları gibi semboller)
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']
      )?.id;

      // 3D bina katmanını ekle
      map.current.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15, // 15 zoom seviyesinden sonra görünür olacak
          'paint': {
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
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.8
          }
        },
        labelLayerId
      );

      // İsteğe bağlı: Işık efektlerini artırmak için
      map.current.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.5, 180, 60]
      });
    });


    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLng, initialLat, initialZoom, show3DBuildings]);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
};

export default MapComponent;

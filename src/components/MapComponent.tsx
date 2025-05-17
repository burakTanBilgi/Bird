// components/MapComponent.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../styles/MapComponent.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapComponentProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  show3DBuildings?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialLng = 32.8552,
  initialLat = 39.8472,
  initialZoom = 15,
  show3DBuildings = true
}) => {
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

      map.current.addLayer({
        id: 'selected-building-light',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['id'], ''], // boş başlangıç
        paint: {
          'fill-extrusion-color': '#120A8F',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['+', ['get', 'height'], 500000]  // Çok yüksek ışık konisi gibi
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, ['get', 'height'],
            15.05, ['get', 'height']
          ],
          'fill-extrusion-opacity': 0.35
        }
      });
      
      

      map.current.on('click', (e) => {
        if (!map.current) return;

        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['3d-buildings']
        });

        if (!features || !features.length) return;

        const clickedFeature = features[0];
        const featureId = clickedFeature.id;
        if (!featureId) return;

        // Eğer seçili bina katmanı yoksa eklemeyi deneyelim
        const style = map.current.getStyle();
        if (!style.layers.find(layer => layer.id === 'selected-building')) {
          map.current.addLayer({
            id: 'selected-building',
            type: 'fill-extrusion',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', ['id'], featureId], // seçili bina
            paint: {
              'fill-extrusion-color': '#120A8F',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6
            }
          });
        } else {
          map.current.setFilter('selected-building', ['==', ['id'], featureId]);
        }

        map.current.setFilter('selected-building-light', ['==', ['id'], featureId]);
      });

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

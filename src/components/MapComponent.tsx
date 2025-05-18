import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../styles/MapComponent.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface Property {
  id: number;
  listing_number: number;
  price: number;
  property_type: string;
  room_count: string;
  gross_area: number;
  net_area: number;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string;
  district: string;
  city: string;
}

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
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch properties from API based on current viewport
  const fetchProperties = async () => {
    if (!map.current) return;
    
    setLoading(true);
    try {
      // Get current viewport bounds
      const bounds = map.current.getBounds();
      if (!bounds) {
        console.log('Bounds not available, skipping fetch');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        north: bounds.getNorth().toString(),
        south: bounds.getSouth().toString(),
        east: bounds.getEast().toString(),
        west: bounds.getWest().toString(),
        // You can add specific location filters too
        city: 'Ankara',  // Only Ankara for now
        district: 'Çankaya',  // Only Çankaya for now
        neighborhood: 'Oran'  // Only Oran for now
      });

      console.log('Fetching properties for viewport:', bounds);
      const response = await fetch(`/api/properties?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Properties fetched successfully:', data.length, 'items');
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find building features at property coordinates
  const findBuildingsAtProperties = () => {
    if (!map.current || properties.length === 0) return [];

    const buildingIds: (string | number)[] = [];

    properties.forEach(property => {
      // Convert lat/lng to pixel coordinates
      const point = map.current!.project([property.longitude, property.latitude]);
      
      // Query for building features at this point
      const features = map.current!.queryRenderedFeatures(point, {
        layers: ['3d-buildings']
      });

      if (features && features.length > 0) {
        features.forEach(feature => {
          if (feature.id && !buildingIds.includes(feature.id)) {
            buildingIds.push(feature.id);
          }
        });
      }
    });

    return buildingIds;
  };

  // Color buildings that contain properties
  const colorPropertyBuildings = () => {
    if (!map.current || properties.length === 0) return;

    const buildingIds = findBuildingsAtProperties();

    if (buildingIds.length === 0) {
      console.log('No buildings found at property coordinates');
      return;
    }

    // Add or update property buildings layer
    if (!map.current.getLayer('property-buildings')) {
      map.current.addLayer({
        id: 'property-buildings',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['in', ['id'], ['literal', buildingIds]],
        paint: {
          'fill-extrusion-color': '#1e90ff', // Blue color for buildings with properties
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8
        }
      });
    } else {
      // Update filter for existing layer
      map.current.setFilter('property-buildings', ['in', ['id'], ['literal', buildingIds]]);
    }

    // Add invisible points for click handling (since buildings might not be clickable in all zoom levels)
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: properties.map(property => ({
        type: 'Feature' as const,
        properties: {
          id: property.id,
          listing_number: property.listing_number,
          price: property.price,
          property_type: property.property_type,
          room_count: property.room_count,
          gross_area: property.gross_area,
          net_area: property.net_area,
          address: property.address,
          neighborhood: property.neighborhood,
          district: property.district,
          city: property.city
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [property.longitude, property.latitude]
        }
      }))
    };

    // Add invisible markers for click handling
    if (!map.current.getSource('property-points')) {
      map.current.addSource('property-points', {
        type: 'geojson',
        data: geojsonData
      });
    } else {
      const source = map.current.getSource('property-points') as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);
    }

    if (!map.current.getLayer('property-click-areas')) {
      map.current.addLayer({
        id: 'property-click-areas',
        type: 'circle',
        source: 'property-points',
        paint: {
          'circle-radius': 15, // Larger click area
          'circle-opacity': 0, // Invisible
          'circle-stroke-width': 0
        }
      });
    }

    // Add click events for property buildings
    map.current.off('click', 'property-buildings' as any);
    map.current.off('click', 'property-click-areas' as any);

    const handlePropertyClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;

      let propertyData: any;
      
      // If clicked on building, find nearest property
      if (e.features[0].source === 'composite') {
        // Find the closest property to the click point
        const clickPoint = [e.lngLat.lng, e.lngLat.lat];
        let closestProperty = null;
        let minDistance = Infinity;

        for (const prop of properties) {
          const distance = Math.sqrt(
            Math.pow(prop.longitude - clickPoint[0], 2) + 
            Math.pow(prop.latitude - clickPoint[1], 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestProperty = prop;
          }
        }

        if (closestProperty) {
          propertyData = closestProperty;
        }
      } else {
        // Clicked on invisible point
        propertyData = e.features[0].properties;
      }

      if (!propertyData) return;

      // Create popup content
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">${propertyData.property_type} - ${propertyData.room_count}</h3>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
            <strong>Fiyat:</strong> ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(propertyData.price)}
          </p>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
            <strong>Alan:</strong> ${propertyData.gross_area}m² (Brüt) / ${propertyData.net_area}m² (Net)
          </p>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
            <strong>Konum:</strong> ${propertyData.neighborhood}, ${propertyData.district}, ${propertyData.city}
          </p>
          <p style="margin: 0; color: #666; font-size: 12px;">
            <strong>İlan No:</strong> ${propertyData.listing_number}
          </p>
        </div>
      `;

      // Create and display popup
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map.current!);
    };

    map.current.on('click', 'property-buildings' as any, handlePropertyClick);
    map.current.on('click', 'property-click-areas' as any, handlePropertyClick);

    // Change cursor on hover
    map.current.off('mouseenter', 'property-buildings' as any);
    map.current.off('mouseleave', 'property-buildings' as any);
    map.current.off('mouseenter', 'property-click-areas' as any);
    map.current.off('mouseleave', 'property-click-areas' as any);
    
    const handleMouseEnter = () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    };

    const handleMouseLeave = () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    };

    map.current.on('mouseenter', 'property-buildings' as any, handleMouseEnter);
    map.current.on('mouseleave', 'property-buildings' as any, handleMouseLeave);
    map.current.on('mouseenter', 'property-click-areas' as any, handleMouseEnter);
    map.current.on('mouseleave', 'property-click-areas' as any, handleMouseLeave);

    console.log('Property buildings colored:', buildingIds.length, 'buildings');
  };

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

    // Fetch properties when user finishes moving the map
    map.current.on('moveend', () => {
      fetchProperties();
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

      // Fetch properties when map is ready
      fetchProperties();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLng, initialLat, initialZoom, show3DBuildings]);

  // Color buildings when properties are loaded
  useEffect(() => {
    if (map.current && properties.length > 0) {
      // Wait for map to be fully loaded
      if (map.current.isStyleLoaded()) {
        colorPropertyBuildings();
      } else {
        map.current.on('style.load', colorPropertyBuildings);
      }
    }
  }, [properties]);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        {loading && <div style={{ marginTop: '8px', color: '#ffeb3b' }}>İlanlar yükleniyor...</div>}
        {properties.length > 0 && (
          <div style={{ marginTop: '8px', color: '#4caf50' }}>
            {properties.length} ilan gösteriliyor
          </div>
        )}
      </div>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
};

export default MapComponent;
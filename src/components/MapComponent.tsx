import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import styles from '../styles/MapComponent.module.css';
import { Property } from '../types/property';
import { useMapbox } from '../hooks/useMapbox';
import { useProperties } from '../hooks/useProperties';
import { findBuildingsAtProperties } from '../utils/propertyUtils';
import { 
  createBuildingClickHandler, 
  createGeneralBuildingClickHandler,
  createMouseHandlers 
} from '../utils/mapEventHandlers';

interface MapComponentProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  show3DBuildings?: boolean;
  onBuildingPropertiesChange?: (properties: Property[], buildingCoordinates?: [number, number] | null) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialLng = 32.8552,
  initialLat = 39.8472,
  initialZoom = 15,
  show3DBuildings = true,
  onBuildingPropertiesChange
}) => {
  const { mapContainer, map, lng, lat, zoom } = useMapbox({
    initialLng,
    initialLat,
    initialZoom,
    show3DBuildings
  });

  const { properties, loading, fetchProperties } = useProperties();
  
  const [selectedBuildingCoords, setSelectedBuildingCoords] = useState<[number, number] | null>(null);
  const [selectedBuildingProperties, setSelectedBuildingProperties] = useState<Property[]>([]);

  // Color buildings that contain properties
  const colorPropertyBuildings = () => {
    if (!map.current || properties.length === 0) return;

    // Make sure the 3d-buildings layer is loaded
    if (!map.current.getLayer('3d-buildings')) {
      console.log('3d-buildings layer not yet loaded, waiting...');
      return;
    }

    const buildingIds = findBuildingsAtProperties(map.current, properties);

    if (buildingIds.length === 0) {
      console.log('No buildings found at property coordinates');
      if (map.current.getLayer('property-buildings')) {
        map.current.setFilter('property-buildings', ['in', ['id'], ['literal', []]]);
      }
      return;
    }

    // Update filter for property buildings layer
    if (map.current.getLayer('property-buildings')) {
      map.current.setFilter('property-buildings', ['in', ['id'], ['literal', buildingIds]]);
    }

    // Add invisible points for click handling
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

    // Add/update invisible markers for click handling
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
          'circle-radius': 15,
          'circle-opacity': 0,
          'circle-stroke-width': 0
        }
      });
    }

    // Remove existing event listeners
    const layers = ['property-buildings', 'property-click-areas'];
    layers.forEach(layer => {
      if (map.current!.getLayer(layer)) {
        map.current!.off('click', layer as any);
        map.current!.off('mouseenter', layer as any);
        map.current!.off('mouseleave', layer as any);
      }
    });

    // Create event handlers
    const propertyClickHandler = createBuildingClickHandler(
      map.current,
      properties,
      onBuildingPropertiesChange,
      setSelectedBuildingCoords,
      setSelectedBuildingProperties
    );

    const { handleMouseEnter, handleMouseLeave } = createMouseHandlers(map.current);

    // Add event listeners
    map.current.on('click', 'property-buildings' as any, propertyClickHandler);
    map.current.on('click', 'property-click-areas' as any, propertyClickHandler);
    map.current.on('mouseenter', 'property-buildings' as any, handleMouseEnter);
    map.current.on('mouseleave', 'property-buildings' as any, handleMouseLeave);
    map.current.on('mouseenter', 'property-click-areas' as any, handleMouseEnter);
    map.current.on('mouseleave', 'property-click-areas' as any, handleMouseLeave);

    console.log('Property buildings colored:', buildingIds.length, 'buildings');
  };

  // Setup map events and property fetching
  useEffect(() => {
    if (!map.current) return;

    // Fetch properties when user finishes moving the map (with debounce)
    let moveTimeout: NodeJS.Timeout;
    const handleMoveEnd = () => {
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        fetchProperties(map.current);
      }, 800);
    };

    // General building click handler
    const generalClickHandler = createGeneralBuildingClickHandler(
      map.current,
      properties,
      onBuildingPropertiesChange,
      setSelectedBuildingCoords,
      setSelectedBuildingProperties
    );

    // Fetch properties when map is ready - only once!
    let hasInitiallyFetched = false;
    const handleIdle = () => {
      if (!hasInitiallyFetched) {
        hasInitiallyFetched = true;
        fetchProperties(map.current);
      }
    };

    // Add event listeners
    map.current.on('moveend', handleMoveEnd);
    map.current.on('click', generalClickHandler);
    map.current.on('idle', handleIdle);

    return () => {
      clearTimeout(moveTimeout);
      if (map.current) {
        map.current.off('click', generalClickHandler);
        map.current.off('moveend', handleMoveEnd);
        map.current.off('idle', handleIdle);
      }
    };
  }, [map.current, properties, fetchProperties, onBuildingPropertiesChange]);

  // Color buildings when properties are loaded
  useEffect(() => {
    if (map.current && properties.length > 0) {
      const timeoutId = setTimeout(() => {
        if (map.current && map.current.isStyleLoaded()) {
          colorPropertyBuildings();
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
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
        {selectedBuildingCoords && (
          <div style={{ marginTop: '8px', color: '#2196f3', fontWeight: 'bold' }}>
            Seçilen Bina: {selectedBuildingCoords[1].toFixed(6)}, {selectedBuildingCoords[0].toFixed(6)}
          </div>
        )}
      </div>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
};

export default MapComponent;
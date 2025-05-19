import { useEffect, useRef, useState, useCallback } from 'react';
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
  onBuildingPropertiesChange?: (properties: Property[], buildingCoordinates?: [number, number] | null) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialLng = 32.8552,
  initialLat = 39.8472,
  initialZoom = 15,
  show3DBuildings = true,
  onBuildingPropertiesChange
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState<number>(initialLng);
  const [lat, setLat] = useState<number>(initialLat);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBuildingCoords, setSelectedBuildingCoords] = useState<[number, number] | null>(null);
  const [selectedBuildingProperties, setSelectedBuildingProperties] = useState<Property[]>([]);

  // Helper function to check if a point is inside a polygon
  const isPointInPolygon = useCallback((point: [number, number], polygon: [number, number][]): boolean => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }, []);

  // Smart property finder - used for both popup and bottom tab (with performance optimization)
  const findPropertiesForBuilding = useCallback((buildingFeature: any, buildingCoordinates: [number, number]): Property[] => {
    if (properties.length === 0) return [];
    
    let foundProperties: Property[] = [];
    
    // Method 1: Find properties within building polygon if available (most accurate)
    if (buildingFeature.geometry && buildingFeature.geometry.type === 'Polygon') {
      const polygon = buildingFeature.geometry.coordinates[0];
      
      foundProperties = properties.filter(prop => {
        const point: [number, number] = [prop.longitude, prop.latitude];
        return isPointInPolygon(point, polygon);
      });
      
      if (foundProperties.length > 0) {
        console.log(`Found ${foundProperties.length} properties inside building polygon`);
        return foundProperties; // Return early if found in polygon
      }
    }
    
    // Method 2: Distance-based approach with optimized search radius
    const searchRadius = 0.002; // Reduced from 0.005 for better performance
    foundProperties = properties.filter(prop => {
      const distance = Math.sqrt(
        Math.pow(prop.longitude - buildingCoordinates[0], 2) + 
        Math.pow(prop.latitude - buildingCoordinates[1], 2)
      );
      return distance < searchRadius;
    });
    
    if (foundProperties.length > 0) {
      console.log(`Found ${foundProperties.length} properties within ${searchRadius * 111} km`);
      return foundProperties;
    }
    
    // Method 3: Find closest properties (limited to 3 for performance)
    console.log('No properties in range, finding closest 3 properties...');
    
    const sortedProperties = properties
      .map(prop => ({
        property: prop,
        distance: Math.sqrt(
          Math.pow(prop.longitude - buildingCoordinates[0], 2) + 
          Math.pow(prop.latitude - buildingCoordinates[1], 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Limit to 3 for performance
      
    foundProperties = sortedProperties.map(item => item.property);
    console.log(`Selected closest 3 properties`);
    
    return foundProperties;
  }, [properties, isPointInPolygon]);

  // Fetch properties from API based on current viewport
  const fetchProperties = async () => {
    if (!map.current || loading) return; // Prevent multiple simultaneous requests
    
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
      
      // Only update if data is different
      if (JSON.stringify(data) !== JSON.stringify(properties)) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find building features at property coordinates
  const findBuildingsAtProperties = useCallback(() => {
    if (!map.current || properties.length === 0) return [];

    const buildingIds: (string | number)[] = [];

    properties.forEach(property => {
      // Convert lat/lng to pixel coordinates
      const point = map.current!.project([property.longitude, property.latitude]);
      
      // Query for building features with increased buffer for better accuracy
      const buffer = 10; // Increased from 5 to 10 pixels
      const features = map.current!.queryRenderedFeatures([
        [point.x - buffer, point.y - buffer],
        [point.x + buffer, point.y + buffer]
      ], {
        layers: ['3d-buildings']
      });

      if (features && features.length > 0) {
        // Find the closest building to the exact coordinate
        let closestFeature: any = null;
        let minDistance = Infinity;

        features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.type === 'Polygon') {
            // Calculate distance from property coordinate to building centroid
            const coords = feature.geometry.coordinates[0];
            if (coords && coords.length > 0) {
              let centerLng = 0, centerLat = 0;
              for (const coord of coords) {
                centerLng += coord[0];
                centerLat += coord[1];
              }
              centerLng /= coords.length;
              centerLat /= coords.length;

              const distance = Math.sqrt(
                Math.pow(property.longitude - centerLng, 2) + 
                Math.pow(property.latitude - centerLat, 2)
              );

              if (distance < minDistance && distance < 0.001) { // Added max distance threshold
                minDistance = distance;
                closestFeature = feature;
              }
            }
          }
        });

        // Only add if we found a close enough building and haven't added it before
        if (closestFeature && closestFeature.id != null && !buildingIds.includes(closestFeature.id)) {
          buildingIds.push(closestFeature.id);
          console.log(`Matched property ${property.id} to building ${closestFeature.id}, distance: ${minDistance.toFixed(6)}`);
        } else if (!closestFeature) {
          console.log(`No building found for property ${property.id} at ${property.latitude}, ${property.longitude}`);
        }
      }
    });

    return buildingIds;
  }, [properties]);

  // Color buildings that contain properties
  const colorPropertyBuildings = () => {
    if (!map.current || properties.length === 0) return;

    // Make sure the 3d-buildings layer is loaded
    if (!map.current.getLayer('3d-buildings')) {
      console.log('3d-buildings layer not yet loaded, waiting...');
      return;
    }

    const buildingIds = findBuildingsAtProperties();

    if (buildingIds.length === 0) {
      console.log('No buildings found at property coordinates');
      // Clear the filter to show no buildings
      if (map.current.getLayer('property-buildings')) {
        map.current.setFilter('property-buildings', ['in', ['id'], ['literal', []]]);
      }
      return;
    }

    // Update filter for property buildings layer (it already exists now)
    if (map.current.getLayer('property-buildings')) {
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

    // Remove existing event listeners
    if (map.current.getLayer('property-buildings')) {
      map.current.off('click', 'property-buildings' as any);
      map.current.off('mouseenter', 'property-buildings' as any);
      map.current.off('mouseleave', 'property-buildings' as any);
    }
    if (map.current.getLayer('property-click-areas')) {
      map.current.off('click', 'property-click-areas' as any);
      map.current.off('mouseenter', 'property-click-areas' as any);
      map.current.off('mouseleave', 'property-click-areas' as any);
    }

    const handlePropertyClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;

      // Get building coordinates for bottom tab
      let buildingCoordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // If we clicked on a building, get its centroid
      if (e.features[0].source === 'composite') {
        const clickedFeature = e.features[0];
        if (clickedFeature.geometry && clickedFeature.geometry.type === 'Polygon') {
          const coordinates = (clickedFeature.geometry as any).coordinates[0];
          if (coordinates && coordinates.length > 0) {
            let centerLng = 0, centerLat = 0;
            for (const coord of coordinates) {
              centerLng += coord[0];
              centerLat += coord[1];
            }
            centerLng /= coordinates.length;
            centerLat /= coordinates.length;
            buildingCoordinates = [centerLng, centerLat];
          }
        }
      }

      // Find all properties for this building using smart finder
      const allBuildingProperties = findPropertiesForBuilding(e.features[0], buildingCoordinates);
      
      console.log('Property building clicked, found:', allBuildingProperties.length, 'properties');

      // Update state for bottom tab
      setSelectedBuildingCoords(buildingCoordinates);
      setSelectedBuildingProperties(allBuildingProperties);
      
      // Notify parent component
      if (onBuildingPropertiesChange) {
        console.log('🔵 Sending to bottom tab:', allBuildingProperties.length, 'properties');
        console.log('🔵 Property building clicked, full data:', allBuildingProperties);
        console.log('🔵 Building coordinates for bottom tab:', buildingCoordinates);
        onBuildingPropertiesChange(allBuildingProperties, buildingCoordinates);
      }

      // Highlight the building
      if (e.features[0].id) {
        map.current!.setFilter('selected-building', ['==', ['id'], e.features[0].id]);
        map.current!.setFilter('selected-building-light', ['==', ['id'], e.features[0].id]);
      }
    };

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

    // Add event listeners
    map.current.on('click', 'property-buildings' as any, handlePropertyClick);
    map.current.on('click', 'property-click-areas' as any, handlePropertyClick);
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

    // Fetch properties when user finishes moving the map (with debounce)
    let moveTimeout: NodeJS.Timeout;
    map.current.on('moveend', () => {
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        fetchProperties();
      }, 800); // Increased debounce to 800ms
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

      // Add selected building layer (highlighted building when clicked) - IMPROVED STYLING
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

      // Add selected building light effect layer - FIXED TO START FROM ROOF
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

      // General building click handler for any building (not just property buildings)
      map.current.on('click', (e) => {
        if (!map.current) return;

        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['3d-buildings']
        });

        if (!features || !features.length) return;

        const clickedFeature = features[0];
        const featureId = clickedFeature.id;
        if (!featureId) return;

        // Get building coordinates
        let buildingCoordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        
        // If building has geometry, calculate centroid
        if (clickedFeature.geometry && clickedFeature.geometry.type === 'Polygon') {
          const coordinates = (clickedFeature.geometry as any).coordinates[0];
          if (coordinates && coordinates.length > 0) {
            let centerLng = 0, centerLat = 0;
            for (const coord of coordinates) {
              centerLng += coord[0];
              centerLat += coord[1];
            }
            centerLng /= coordinates.length;
            centerLat /= coordinates.length;
            buildingCoordinates = [centerLng, centerLat];
          }
        }

        // Update state with building coordinates
        setSelectedBuildingCoords(buildingCoordinates);
        console.log('Tıklanan bina koordinatları:', buildingCoordinates);

        // Use smart property finder
        const buildingProperties = findPropertiesForBuilding(clickedFeature, buildingCoordinates);

        console.log('Building clicked - found:', buildingProperties.length, 'properties');

        // Update selected building properties state
        setSelectedBuildingProperties(buildingProperties);
        
        // Notify parent component about the change
        if (onBuildingPropertiesChange) {
          console.log('Notifying parent with:', buildingProperties.length, 'properties');
          onBuildingPropertiesChange(buildingProperties, buildingCoordinates);
        }

        // Handle selected building highlighting
        map.current.setFilter('selected-building', ['==', ['id'], featureId]);
        map.current.setFilter('selected-building-light', ['==', ['id'], featureId]);
      });

      map.current.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.5, 180, 60]
      });

      // Fetch properties when map is ready - only once!
      let hasInitiallyFetched = false;
      map.current.on('idle', () => {
        if (!hasInitiallyFetched) {
          hasInitiallyFetched = true;
          fetchProperties();
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Color buildings when properties are loaded
  useEffect(() => {
    if (map.current && properties.length > 0) {
      // Debounce building coloring to prevent excessive calls
      const timeoutId = setTimeout(() => {
        if (map.current && map.current.isStyleLoaded()) {
          colorPropertyBuildings();
        }
      }, 500); // Increased delay
      
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
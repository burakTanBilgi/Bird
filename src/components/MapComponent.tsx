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

let mapInstance: mapboxgl.Map | null = null;

const MapComponent: React.FC<MapComponentProps> = ({
  initialLng = 32.8552,
  initialLat = 39.8472,
  initialZoom = 15,
  show3DBuildings = true,
  onBuildingPropertiesChange
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const onBuildingPropertiesChangeRef = useRef(onBuildingPropertiesChange);
  const [lng, setLng] = useState<number>(initialLng);
  const [lat, setLat] = useState<number>(initialLat);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBuildingCoords, setSelectedBuildingCoords] = useState<[number, number] | null>(null);

  // Update ref when callback changes
  useEffect(() => {
    onBuildingPropertiesChangeRef.current = onBuildingPropertiesChange;
  }, [onBuildingPropertiesChange]);

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

  // Smart property finder
  const findPropertiesForBuilding = useCallback((buildingFeature: any, buildingCoordinates: [number, number]): Property[] => {
    if (properties.length === 0) return [];
    
    let foundProperties: Property[] = [];
    
    // Method 1: Find properties within building polygon if available
    if (buildingFeature.geometry && buildingFeature.geometry.type === 'Polygon') {
      const polygon = buildingFeature.geometry.coordinates[0];
      
      foundProperties = properties.filter(prop => {
        const point: [number, number] = [prop.longitude, prop.latitude];
        return isPointInPolygon(point, polygon);
      });
      
      if (foundProperties.length > 0) {
        return foundProperties;
      }
    }
    
    // Method 2: Distance-based approach
    const searchRadius = 0.002;
    foundProperties = properties.filter(prop => {
      const distance = Math.sqrt(
        Math.pow(prop.longitude - buildingCoordinates[0], 2) + 
        Math.pow(prop.latitude - buildingCoordinates[1], 2)
      );
      return distance < searchRadius;
    });
    
    if (foundProperties.length > 0) {
      return foundProperties;
    }
    
    // Method 3: Find closest properties (limited to 3)
    const sortedProperties = properties
      .map(prop => ({
        property: prop,
        distance: Math.sqrt(
          Math.pow(prop.longitude - buildingCoordinates[0], 2) + 
          Math.pow(prop.latitude - buildingCoordinates[1], 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
      
    return sortedProperties.map(item => item.property);
  }, [properties, isPointInPolygon]);

  // Fetch properties from API based on current viewport
  const fetchProperties = useCallback(async () => {
    if (!mapInstance || loading) return;
    
    setLoading(true);
    try {
      const bounds = mapInstance.getBounds();
      if (!bounds) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        north: bounds.getNorth().toString(),
        south: bounds.getSouth().toString(),
        east: bounds.getEast().toString(),
        west: bounds.getWest().toString(),
        city: 'Ankara',
        district: 'Çankaya',
        neighborhood: 'Oran'
      });

      const response = await fetch(`/api/properties?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Find building features at property coordinates
  const findBuildingsAtProperties = useCallback(() => {
    if (!mapInstance || properties.length === 0) return [];

    const buildingIds: (string | number)[] = [];

    properties.forEach(property => {
      const point = mapInstance!.project([property.longitude, property.latitude]);
      
      const buffer = 10;
      const features = mapInstance!.queryRenderedFeatures([
        [point.x - buffer, point.y - buffer],
        [point.x + buffer, point.y + buffer]
      ], {
        layers: ['3d-buildings']
      });

      if (features && features.length > 0) {
        let closestFeature: any = null;
        let minDistance = Infinity;

        features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.type === 'Polygon') {
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

              if (distance < minDistance && distance < 0.001) {
                minDistance = distance;
                closestFeature = feature;
              }
            }
          }
        });

        if (closestFeature && closestFeature.id != null && !buildingIds.includes(closestFeature.id)) {
          buildingIds.push(closestFeature.id);
        }
      }
    });

    return buildingIds;
  }, [properties]);

  // Color buildings that contain properties
  const colorPropertyBuildings = useCallback(() => {
    if (!mapInstance || properties.length === 0) return;

    if (!mapInstance.getLayer('3d-buildings')) {
      return;
    }

    const buildingIds = findBuildingsAtProperties();

    if (buildingIds.length === 0) {
      if (mapInstance.getLayer('property-buildings')) {
        mapInstance.setFilter('property-buildings', ['in', ['id'], ['literal', []]] as mapboxgl.ExpressionSpecification);
      }
      return;
    }

    // Update filter for property buildings layer
    if (mapInstance.getLayer('property-buildings')) {
      mapInstance.setFilter('property-buildings', ['in', ['id'], ['literal', buildingIds]] as mapboxgl.ExpressionSpecification);
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

    if (!mapInstance.getSource('property-points')) {
      mapInstance.addSource('property-points', {
        type: 'geojson',
        data: geojsonData
      });
    } else {
      const source = mapInstance.getSource('property-points') as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);
    }

    if (!mapInstance.getLayer('property-click-areas')) {
      mapInstance.addLayer({
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
  }, [properties, findBuildingsAtProperties]);

  useEffect(() => {
    if (mapInstance || !mapContainer.current) return;

    mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'composite': {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v8'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f8f8f8'
            }
          },
          {
            id: 'water',
            source: 'composite',
            'source-layer': 'water',
            type: 'fill',
            paint: {
              'fill-color': '#a8d8ea'
            }
          },
          {
            id: 'landuse',
            source: 'composite',
            'source-layer': 'landuse',
            type: 'fill',
            paint: {
              'fill-color': '#e8e8e8'
            }
          },
          {
            id: 'roads-casing',
            source: 'composite',
            'source-layer': 'road',
            type: 'line',
            paint: {
              'line-color': '#cfcdca',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 0.5,
                12, 5,
                18, 12
              ]
            }
          },
          {
            id: 'roads',
            source: 'composite',
            'source-layer': 'road',
            type: 'line',
            paint: {
              'line-color': '#ffffff',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 0.2,
                12, 3,
                18, 8
              ]
            }
          }
        ]
        // No glyphs property = no font loading issues!
      },
      center: [initialLng, initialLat],
      zoom: initialZoom,
      antialias: true,
      projection: 'globe'
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapInstance.on('move', () => {
      if (!mapInstance) return;
      setLng(parseFloat(mapInstance.getCenter().lng.toFixed(4)));
      setLat(parseFloat(mapInstance.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(mapInstance.getZoom().toFixed(2)));
    });

    // Fetch properties when user finishes moving the map
    let moveTimeout: NodeJS.Timeout;
    mapInstance.on('moveend', () => {
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        fetchProperties();
      }, 800);
    });

    mapInstance.on('style.load', () => {
      if (!mapInstance || !show3DBuildings) return;

      const layers = mapInstance.getStyle().layers;
      if (!layers) return;

      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && (layer.layout as any)['text-field']
      )?.id;

      mapInstance.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Add base 3D buildings layer
      mapInstance.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'] as mapboxgl.ExpressionSpecification,
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
            ] as mapboxgl.ExpressionSpecification,
            'fill-extrusion-height': ['get', 'height'] as mapboxgl.ExpressionSpecification,
            'fill-extrusion-base': ['get', 'min_height'] as mapboxgl.ExpressionSpecification,
            'fill-extrusion-opacity': 1.0
          }
        },
        labelLayerId
      );

      // Add property buildings layer (blue colored buildings with properties)
      mapInstance.addLayer({
        id: 'property-buildings',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['in', ['id'], ['literal', []]] as mapboxgl.ExpressionSpecification,
        paint: {
          'fill-extrusion-color': '#1e90ff',
          'fill-extrusion-height': ['get', 'height'] as mapboxgl.ExpressionSpecification,
          'fill-extrusion-base': ['get', 'min_height'] as mapboxgl.ExpressionSpecification,
          'fill-extrusion-opacity': 1.0
        }
      }, labelLayerId);

      // Add selected building layer (highlighted building when clicked)
      mapInstance.addLayer({
        id: 'selected-building',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['id'], ''] as mapboxgl.ExpressionSpecification,
        paint: {
          'fill-extrusion-color': '#ff6b6b',
          'fill-extrusion-height': 50000,
          'fill-extrusion-base': ['get', 'min_height'] as mapboxgl.ExpressionSpecification,
          'fill-extrusion-opacity': 0.35
        }
      }, labelLayerId);

      // Add selected building light effect layer
      mapInstance.addLayer({
        id: 'selected-building-light',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['id'], ''] as mapboxgl.ExpressionSpecification,
        paint: {
          'fill-extrusion-color': '#ff6b6b',
          'fill-extrusion-height': 50200,
          'fill-extrusion-base': 50000,
          'fill-extrusion-opacity': 0.2
        }
      }, labelLayerId);

      // General building click handler for any building
      mapInstance.on('click', (e) => {
        if (!mapInstance) return;

        const features = mapInstance.queryRenderedFeatures(e.point, {
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

        // Use smart property finder
        const buildingProperties = findPropertiesForBuilding(clickedFeature, buildingCoordinates);

        // Notify parent component about the change
        if (onBuildingPropertiesChangeRef.current) {
          onBuildingPropertiesChangeRef.current(buildingProperties, buildingCoordinates);
        }

        // Handle selected building highlighting
        mapInstance.setFilter('selected-building', ['==', ['id'], featureId] as mapboxgl.ExpressionSpecification);
        mapInstance.setFilter('selected-building-light', ['==', ['id'], featureId] as mapboxgl.ExpressionSpecification);
      });

      // Fetch properties when map is ready
      let hasInitiallyFetched = false;
      mapInstance.on('idle', () => {
        if (!hasInitiallyFetched) {
          hasInitiallyFetched = true;
          fetchProperties();
        }
      });
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, []);  // Empty dependency array - only run once

  // Color buildings when properties are loaded
  useEffect(() => {
    if (mapInstance && properties.length > 0) {
      const timeoutId = setTimeout(() => {
        if (mapInstance && mapInstance.isStyleLoaded()) {
          colorPropertyBuildings();
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [properties, colorPropertyBuildings]);

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
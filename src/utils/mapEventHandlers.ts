import mapboxgl from 'mapbox-gl';
import { Property } from '../types/property';
import { findPropertiesForBuilding } from './propertyUtils';

export const createBuildingClickHandler = (
  map: mapboxgl.Map,
  properties: Property[],
  onBuildingPropertiesChange?: (properties: Property[], buildingCoordinates?: [number, number] | null) => void,
  setSelectedBuildingCoords?: (coords: [number, number] | null) => void,
  setSelectedBuildingProperties?: (props: Property[]) => void
) => {
  return (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
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
    const allBuildingProperties = findPropertiesForBuilding(e.features[0], buildingCoordinates, properties);
    
    console.log('Property building clicked, found:', allBuildingProperties.length, 'properties');

    // Update state for bottom tab
    if (setSelectedBuildingCoords) setSelectedBuildingCoords(buildingCoordinates);
    if (setSelectedBuildingProperties) setSelectedBuildingProperties(allBuildingProperties);
    
    // Notify parent component
    if (onBuildingPropertiesChange) {
      console.log('🔵 Sending to bottom tab:', allBuildingProperties.length, 'properties');
      onBuildingPropertiesChange(allBuildingProperties, buildingCoordinates);
    }

    // Highlight the building
    if (e.features[0].id) {
      map.setFilter('selected-building', ['==', ['id'], e.features[0].id]);
      map.setFilter('selected-building-light', ['==', ['id'], e.features[0].id]);
    }
  };
};

export const createGeneralBuildingClickHandler = (
  map: mapboxgl.Map,
  properties: Property[],
  onBuildingPropertiesChange?: (properties: Property[], buildingCoordinates?: [number, number] | null) => void,
  setSelectedBuildingCoords?: (coords: [number, number] | null) => void,
  setSelectedBuildingProperties?: (props: Property[]) => void
) => {
  return (e: mapboxgl.MapMouseEvent) => {
    const features = map.queryRenderedFeatures(e.point, {
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
    if (setSelectedBuildingCoords) setSelectedBuildingCoords(buildingCoordinates);
    console.log('Tıklanan bina koordinatları:', buildingCoordinates);

    // Use smart property finder
    const buildingProperties = findPropertiesForBuilding(clickedFeature, buildingCoordinates, properties);

    console.log('Building clicked - found:', buildingProperties.length, 'properties');

    // Update selected building properties state
    if (setSelectedBuildingProperties) setSelectedBuildingProperties(buildingProperties);
    
    // Notify parent component about the change
    if (onBuildingPropertiesChange) {
      console.log('Notifying parent with:', buildingProperties.length, 'properties');
      onBuildingPropertiesChange(buildingProperties, buildingCoordinates);
    }

    // Handle selected building highlighting
    map.setFilter('selected-building', ['==', ['id'], featureId]);
    map.setFilter('selected-building-light', ['==', ['id'], featureId]);
  };
};

export const createMouseHandlers = (map: mapboxgl.Map) => {
  const handleMouseEnter = () => {
    map.getCanvas().style.cursor = 'pointer';
  };

  const handleMouseLeave = () => {
    map.getCanvas().style.cursor = '';
  };

  return { handleMouseEnter, handleMouseLeave };
};
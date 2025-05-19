import { Property } from '../types/property';

// Helper function to check if a point is inside a polygon
export const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
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
};

// Smart property finder - finds properties for a building
export const findPropertiesForBuilding = (
  buildingFeature: any, 
  buildingCoordinates: [number, number], 
  properties: Property[]
): Property[] => {
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
      return foundProperties;
    }
  }
  
  // Method 2: Distance-based approach with optimized search radius
  const searchRadius = 0.002;
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
    .slice(0, 3);
    
  foundProperties = sortedProperties.map(item => item.property);
  console.log(`Selected closest 3 properties`);
  
  return foundProperties;
};

// Find building features at property coordinates
export const findBuildingsAtProperties = (map: mapboxgl.Map, properties: Property[]): (string | number)[] => {
  if (!map || properties.length === 0) return [];

  const buildingIds: (string | number)[] = [];

  properties.forEach(property => {
    const point = map.project([property.longitude, property.latitude]);
    
    const buffer = 10;
    const features = map.queryRenderedFeatures([
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
        console.log(`Matched property ${property.id} to building ${closestFeature.id}, distance: ${minDistance.toFixed(6)}`);
      } else if (!closestFeature) {
        console.log(`No building found for property ${property.id} at ${property.latitude}, ${property.longitude}`);
      }
    }
  });

  return buildingIds;
};
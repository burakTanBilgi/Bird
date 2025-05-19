import { useState, useCallback } from 'react';
import { Property } from '../types/property';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch properties from API based on current viewport
  const fetchProperties = useCallback(async (map: mapboxgl.Map | null) => {
    if (!map || loading) return;
    
    setLoading(true);
    try {
      const bounds = map.getBounds();
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
        city: 'Ankara',
        district: 'Çankaya',
        neighborhood: 'Oran'
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
  }, [loading, properties]);

  return {
    properties,
    loading,
    fetchProperties
  };
};
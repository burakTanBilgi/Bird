// pages/index.tsx - Updated Home Page with Map and BottomTab Integration
import Head from 'next/head';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import BottomTab from '../components/BottomTab';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

// Import the MapComponent dynamically with no SSR to avoid mapbox-gl issues
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false
});

// Property interface for type safety
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

const Home: NextPage = () => {
  // State for managing selected building properties
  const [selectedBuildingProperties, setSelectedBuildingProperties] = useState<Property[]>([]);
  const [selectedBuildingCoords, setSelectedBuildingCoords] = useState<[number, number] | null>(null);

  // Handle building selection from map
  const handleBuildingPropertiesChange = (properties: Property[], buildingCoordinates?: [number, number] | null) => {
    console.log('Home page received building data:', {
      propertiesCount: properties.length,
      properties: properties,
      buildingCoordinates: buildingCoordinates
    });
    setSelectedBuildingProperties(properties);
    setSelectedBuildingCoords(buildingCoordinates || null);
  };

  // Handle property selection from bottom tab
  const handlePropertySelect = (property: Property) => {
    console.log('Selected property:', property);
    // You can add navigation to property details page here
    // For example: router.push(`/property/${property.id}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Kuşbakışı - Emlak Haritası</title>
        <meta name="description" content="Ankara'daki emlak ilanlarını harita üzerinde görüntüleyin" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      <Navbar />
      
      <main className={styles.main}>
        {/* Map Component */}
        <div className={styles.mapWrapper}>
          <MapComponent 
            onBuildingPropertiesChange={handleBuildingPropertiesChange}
          />
        </div>
      </main>
      
      {/* Bottom Tab Component */}
      <BottomTab 
        properties={selectedBuildingProperties}
        buildingCoordinates={selectedBuildingCoords}
        onPropertySelect={handlePropertySelect}
      />
    </div>
  );
};

export default Home;
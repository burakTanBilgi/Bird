// components/BottomTab.tsx
import { FC } from 'react';
import styles from '../styles/BottomTab.module.css';

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

interface BottomTabProps {
  properties: Property[];
  buildingCoordinates?: [number, number] | null;
  onPropertySelect?: (property: Property) => void;
}

const BottomTab: FC<BottomTabProps> = ({ 
  properties, 
  buildingCoordinates,
  onPropertySelect 
}) => {
  console.log('BottomTab received:', {
    propertiesCount: properties?.length || 0,
    properties: properties,
    buildingCoordinates: buildingCoordinates
  });
  // Function to handle property selection
  const handlePropertyClick = (property: Property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  // If no properties, show empty state
  if (!properties || properties.length === 0) {
    return (
      <div className={styles.bottomTabContainer}>
        <div className={styles.tabHandle}>
          {/* Using CSS ::before for the rounded line, no need for text */}
        </div>
        <div className={styles.tabContent}>
          <div className={styles.emptyState}>
            <h3>Bina Seçin</h3>
            <p>Bir binaya tıklayarak o lokasyondaki ilanları görüntüleyin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bottomTabContainer}>
      <div className={styles.tabHandle}>
        {/* Using CSS ::before for the rounded line, no need for text */}
      </div>
      <div className={styles.tabContent}>
        <div className={styles.buildingInfo}>
          <h3>Bu Binada {properties.length} İlan Bulundu</h3>
          {buildingCoordinates && (
            <p className={styles.coordinatesInfo}>
              Koordinatlar: {buildingCoordinates[1].toFixed(6)}, {buildingCoordinates[0].toFixed(6)}
            </p>
          )}
        </div>
        <div className={styles.propertiesGrid}>
          {properties.map(property => (
            <div 
              key={property.id} 
              className={styles.propertyCard}
              onClick={() => handlePropertyClick(property)}
            >
              {/* Image section - top 1/3 */}
              <div className={styles.propertyImageSection}>
                <div className={styles.propertyImageContainer}>
                  <img 
                    src="/api/placeholder/400/200" 
                    alt={`${property.property_type} - ${property.room_count}`} 
                    className={styles.propertyImage} 
                  />
                  <div className={styles.propertyTypeLabel}>
                    {property.room_count}
                  </div>
                </div>
              </div>
              
              {/* Content section - middle 1/3 */}
              <div className={styles.propertyContent}>
                <h4 className={styles.propertyTitle}>
                  {property.property_type} - {property.room_count}
                </h4>
                <p className={styles.propertyPrice}>
                  {new Intl.NumberFormat('tr-TR', { 
                    style: 'currency', 
                    currency: 'TRY',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(property.price)}
                </p>
                <p className={styles.propertyDetails}>
                  <span>Brüt: {property.gross_area}m²</span>
                  <span>Net: {property.net_area}m²</span>
                </p>
                <p className={styles.propertyLocation}>
                  {property.neighborhood}, {property.district}
                </p>
              </div>
              
              {/* Buttons section - bottom 1/3 */}
              <div className={styles.propertyActions}>
                <button className={styles.detailsButton}>
                  İlan Detayları
                </button>
                <button className={styles.contactButton}>
                  İletişim
                </button>
                <div className={styles.listingNumber}>
                  İlan No: {property.listing_number}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTab;
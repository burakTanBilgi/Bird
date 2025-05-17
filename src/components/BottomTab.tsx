// components/BottomTab.tsx
import { FC, useState } from 'react';
import styles from '../styles/BottomTab.module.css';

interface RentalProperty {
  id: number;
  title: string;
  description: string;
  images: string[];
  price: string;
  isFavorite: boolean;
  currentImageIndex: number;
}

const BottomTab: FC = () => {
  // Placeholder data for rental properties in Turkish with multiple images
  const [properties, setProperties] = useState<RentalProperty[]>([
    {
      id: 1,
      title: "Oran Royal Konutları - Ferah 3+1 Daire",
      description: "Oran'ın kalbinde, 150m² net, güney-batı cepheli, şehir manzaralı lüks daire. Site içerisinde kapalı otopark, sosyal alanlar.",
      images: [
                "/../../public/favicon.png"

      ],
      price: "4.650.000 ₺",
      isFavorite: false,
      currentImageIndex: 0
    },
    {
      id: 2,
      title: "Oran Park Residence - 3+1 Kiracılı Daire",
      description: "Yatırımlık 3+1 daire. Aylık 15.000 ₺ kira getirisi. Spor salonu, havuz ve sosyal alan kullanımlı modern site.",
      images: [
        "/../../public/favicon.png",
        "/../../public/favicon.png",
        "/../../public/favicon.png"
      ],
      price: "4.950.000 ₺",
      isFavorite: true,
      currentImageIndex: 0
    },
    {
      id: 3,
      title: "Oran Vista Evleri - Lüks 4+1 Daire",
      description: "Akıllı ev sistemli, özel peyzajlı 200m² net kullanım alanlı daire. 3 banyo, kapalı otopark, 7/24 güvenlik.",
      images: [
        "/../../public/favicon.png",
        "/../../public/favicon.png",
        "/../../public/favicon.png",
        "/../../public/favicon.png",
        "/../../public/favicon.png"
      ],
      price: "7.800.000 ₺",
      isFavorite: false,
      currentImageIndex: 0
    },
    {
      id: 4,
      title: "Oran Elit Residence - 2+1 Havuz Manzaralı",
      description: "Şık ve kullanışlı 2+1 daire. Havuz manzaralı, ankastre mutfak. Site içerisinde sosyal alanlar ve 24 saat güvenlik.",
      images: [
        "/../../public/favicon.png",
        "/../../public/favicon.png"
      ],
      price: "4.800.000 ₺",
      isFavorite: false,
      currentImageIndex: 0
    },
    {
      id: 5,
      title: "Oran Panorama Evleri - 4+1 Kiracılı",
      description: "Aylık 22.000 ₺ kira getirisi. Şehir manzaralı, ebeveyn banyolu, ankastre mutfaklı lüks daire.",
      images: [
        "/../../public/favicon.png",
        "/../../public/favicon.png",
        "/../../public/favicon.png"
      ],
      price: "7.200.000 ₺",
      isFavorite: true,
      currentImageIndex: 0
    },
    {
      id: 6,
      title: "Oran Hills - Çatı Dubleksi",
      description: "Özel havuzlu, jakuzili, panoramik şehir manzaralı dubleks. 5 banyo, akıllı ev sistemleri ve özel tasarım.",
      images: [
        "/api/placeholder/400/200",
        "/api/placeholder/400/200",
        "/api/placeholder/400/200"
      ],
      price: "11.500.000 ₺",
      isFavorite: false,
      currentImageIndex: 0
    },
  ]);

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setProperties(properties.map(property => 
      property.id === id 
        ? {...property, isFavorite: !property.isFavorite} 
        : property
    ));
  };

  // Navigate through property images
  const changeImage = (propertyId: number, direction: 'prev' | 'next') => {
    setProperties(properties.map(property => {
      if (property.id !== propertyId) return property;
      
      const totalImages = property.images.length;
      let newIndex = property.currentImageIndex;
      
      if (direction === 'next') {
        newIndex = (newIndex + 1) % totalImages;
      } else {
        newIndex = (newIndex - 1 + totalImages) % totalImages;
      }
      
      return {...property, currentImageIndex: newIndex};
    }));
  };

  return (
    <div className={styles.bottomTabContainer}>
      <div className={styles.tabHandle}>
        {/* Using CSS ::before for the rounded line, no need for text */}
      </div>
      <div className={styles.tabContent}>
        <div className={styles.propertiesGrid}>
          {properties.map(property => (
            <div key={property.id} className={styles.propertyCard}>
              {/* Image section - top 1/3 */}
              <div className={styles.propertyImageSection}>
                <button 
                  className={`${styles.imageNavButton} ${styles.prevButton}`}
                  onClick={() => changeImage(property.id, 'prev')}
                  aria-label="Önceki resim"
                >
                  &#10094;
                </button>
                
                <div className={styles.propertyImageContainer}>
                  <img 
                    src={property.images[property.currentImageIndex]} 
                    alt={`${property.title} - Resim ${property.currentImageIndex + 1}`} 
                    className={styles.propertyImage} 
                  />
                  <div className={styles.imagePagination}>
                    {property.currentImageIndex + 1}/{property.images.length}
                  </div>
                </div>
                
                <button 
                  className={`${styles.imageNavButton} ${styles.nextButton}`}
                  onClick={() => changeImage(property.id, 'next')}
                  aria-label="Sonraki resim"
                >
                  &#10095;
                </button>
              </div>
              
              {/* Content section - middle 1/3 */}
              <div className={styles.propertyContent}>
                <h4 className={styles.propertyTitle}>{property.title}</h4>
                <p className={styles.propertyPrice}>{property.price}</p>
                <p className={styles.propertyDescription}>{property.description}</p>
              </div>
              
              {/* Buttons section - bottom 1/3 */}
              <div className={styles.propertyActions}>
                <button className={styles.infoButton}>Bilgiler</button>
                <button 
                  className={`${styles.favoriteIconButton} ${property.isFavorite ? styles.favoriteActive : ''}`}
                  onClick={() => toggleFavorite(property.id)}
                  aria-label={property.isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  {property.isFavorite ? '★' : '☆'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTab;
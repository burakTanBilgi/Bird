// pages/favorites.tsx - Favoriler Sayfası (Dynamic)
import Head from 'next/head';
import { NextPage, GetServerSideProps } from 'next';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';
import favStyles from '../styles/Favorites.module.css';
import { useState, useMemo } from 'react';

// Emlak ilanları için tip tanımı
interface PropertyListing {
  id: number;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  listingNumber: number;
  propertyType: string;
  roomCount: string;
  grossArea: number;
  netArea: number;
  floorNumber: number;
  totalFloors: number;
  buildingAge: number;
  bathroom: number;
  siteName: string;
  heatingType: string;
  hasBalcony: boolean;
  hasElevator: boolean;
  image: string;
  dateAdded: string;
  favoriteNotes?: string;
}

interface FavoritesProps {
  favorites: PropertyListing[];
  buyerName: string;
}

const Favorites: NextPage<FavoritesProps> = ({ favorites: initialFavorites, buyerName }) => {
  // Favori emlak ilanları verisi
  const [favorites, setFavorites] = useState<PropertyListing[]>(initialFavorites);

  // Filtre durumları
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("Tümü");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("Tümü");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("Tümü");
  const [selectedFloorRange, setSelectedFloorRange] = useState<string>("Tümü");
  const [selectedSite, setSelectedSite] = useState<string>("Tümü");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filtre seçenekleri
  const roomTypes = ["Tümü", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1"];
  const propertyTypes = ["Tümü", "Daire", "Dubleks"];
  const priceRanges = [
    { value: "Tümü", label: "Tüm Fiyatlar" },
    { value: "0-4000000", label: "0₺ - 4M₺" },
    { value: "4000000-6000000", label: "4M₺ - 6M₺" },
    { value: "6000000-8000000", label: "6M₺ - 8M₺" },
    { value: "8000000-999999999", label: "8M₺+" }
  ];
  const floorRanges = [
    { value: "Tümü", label: "Tüm Katlar" },
    { value: "1-3", label: "1-3. Kat" },
    { value: "4-7", label: "4-7. Kat" },
    { value: "8-999", label: "8. Kat ve Üzeri" }
  ];
  
  // Site isimlerini al
  const siteNames = useMemo(() => {
    const sites = ["Tümü", ...Array.from(new Set(favorites.map(fav => fav.siteName)))];
    return sites.sort();
  }, [favorites]);

  // Filtreleme işlevi
  const filteredFavorites = useMemo(() => {
    return favorites.filter(property => {
      // Arama filtresi
      const matchesSearch = searchTerm === "" || 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.siteName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Oda sayısı filtresi
      const matchesRoomType = selectedRoomType === "Tümü" || property.roomCount === selectedRoomType;
      
      // Mülk tipi filtresi
      const matchesPropertyType = selectedPropertyType === "Tümü" || property.propertyType === selectedPropertyType;
      
      // Fiyat aralığı filtresi
      let matchesPriceRange = true;
      if (selectedPriceRange !== "Tümü") {
        const [minStr, maxStr] = selectedPriceRange.split("-");
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        matchesPriceRange = property.price >= min && property.price <= max;
      }
      
      // Kat aralığı filtresi
      let matchesFloorRange = true;
      if (selectedFloorRange !== "Tümü") {
        const [minStr, maxStr] = selectedFloorRange.split("-");
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        matchesFloorRange = property.floorNumber >= min && property.floorNumber <= max;
      }
      
      // Site filtresi
      const matchesSite = selectedSite === "Tümü" || property.siteName === selectedSite;
      
      return matchesSearch && matchesRoomType && matchesPropertyType && 
             matchesPriceRange && matchesFloorRange && matchesSite;
    });
  }, [
    favorites, 
    searchTerm, 
    selectedRoomType, 
    selectedPropertyType, 
    selectedPriceRange, 
    selectedFloorRange,
    selectedSite
  ]);

  // Favoriden kaldırma (API call ile)
  const removeFavorite = async (id: number) => {
    try {
      const response = await fetch('/api/favorites/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: id }),
      });

      if (response.ok) {
        setFavorites(prevFavorites => 
          prevFavorites.filter(fav => fav.id !== id)
        );
      } else {
        console.error('Favori kaldırma işlemi başarısız:', response.statusText);
        alert('Favori kaldırılırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Favori kaldırma hatası:', error);
      alert('Favori kaldırılırken bir hata oluştu.');
    }
  };

  // Filtreleri sıfırlama
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRoomType("Tümü");
    setSelectedPropertyType("Tümü");
    setSelectedPriceRange("Tümü");
    setSelectedFloorRange("Tümü");
    setSelectedSite("Tümü");
  };

  // Filtreleme varsa göster
  const isFiltering = searchTerm !== "" || 
                     selectedRoomType !== "Tümü" || 
                     selectedPropertyType !== "Tümü" || 
                     selectedPriceRange !== "Tümü" || 
                     selectedFloorRange !== "Tümü" ||
                     selectedSite !== "Tümü";

  return (
    <div className={styles.container}>
      <Head>
        <title>Kuşbakış - {buyerName} Favorileri</title>
        <meta name="description" content={`${buyerName} favori emlak ilanları`} />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Navbar />

      <main className={`${styles.main} ${favStyles.darkMain} ${favStyles.scrollableMain}`}>
        <div className={favStyles.searchFilterContainer}>
          {/* Arama Kutusu */}
          <div className={favStyles.searchContainer}>
            <input
              type="text"
              placeholder="İlan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={favStyles.searchInput}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className={favStyles.clearButton}
                aria-label="Aramayı temizle"
              >
                ×
              </button>
            )}
          </div>

          {/* Filtre Butonu */}
          <button 
            className={favStyles.filterToggleButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'} 
            {isFiltering && <span className={favStyles.filterBadge}></span>}
          </button>
        </div>

        {/* Filtre Paneli */}
        {showFilters && (
          <div className={favStyles.filtersPanel}>
            <div className={favStyles.filterRow}>
              {/* Oda tipi filtresi */}
              <div className={favStyles.filterGroup}>
                <label htmlFor="roomType">Oda Sayısı</label>
                <select 
                  id="roomType" 
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className={favStyles.filterSelect}
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Mülk tipi filtresi */}
              <div className={favStyles.filterGroup}>
                <label htmlFor="propertyType">Mülk Tipi</label>
                <select 
                  id="propertyType" 
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className={favStyles.filterSelect}
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Fiyat aralığı filtresi */}
              <div className={favStyles.filterGroup}>
                <label htmlFor="priceRange">Fiyat Aralığı</label>
                <select 
                  id="priceRange" 
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className={favStyles.filterSelect}
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={favStyles.filterRow}>
              {/* Kat aralığı filtresi */}
              <div className={favStyles.filterGroup}>
                <label htmlFor="floorRange">Bulunduğu Kat</label>
                <select 
                  id="floorRange" 
                  value={selectedFloorRange}
                  onChange={(e) => setSelectedFloorRange(e.target.value)}
                  className={favStyles.filterSelect}
                >
                  {floorRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Site filtresi */}
              <div className={favStyles.filterGroup}>
                <label htmlFor="site">Site</label>
                <select 
                  id="site" 
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className={favStyles.filterSelect}
                >
                  {siteNames.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtreleri Sıfırla */}
              <div className={favStyles.filterGroup}>
                <button 
                  className={favStyles.resetButton}
                  onClick={resetFilters}
                  disabled={!isFiltering}
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtrelenmiş sonuç sayısı */}
        <div className={favStyles.resultsInfo}>
          <span>{filteredFavorites.length} sonuç gösteriliyor</span>
          {isFiltering && <span> (Toplam {favorites.length} favori)</span>}
        </div>

        {/* Favoriler Listesi */}
        <div className={favStyles.favoritesGrid}>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map(property => (
              <div key={property.id} className={favStyles.favoriteCard}>
                {/* Görsel bölümü */}
                <div className={favStyles.favoriteImageSection}>
                  <div className={favStyles.favoriteImageContainer}>
                    <img 
                      src={property.image} 
                      alt={`${property.title} görseli`} 
                      className={favStyles.favoriteImage} 
                    />
                    <div className={favStyles.propertyType}>{property.propertyType}</div>
                    <div className={favStyles.roomCount}>{property.roomCount}</div>
                  </div>
                </div>
                
                {/* İçerik bölümü */}
                <div className={favStyles.favoriteContent}>
                  <h2 className={favStyles.propertyTitle}>{property.title}</h2>
                  <p className={favStyles.propertyPrice}>{property.priceFormatted}</p>
                  <p className={favStyles.propertyDescription}>{property.description}</p>
                  
                  {/* Favori notu varsa göster */}
                  {property.favoriteNotes && (
                    <div className={favStyles.favoriteNotes}>
                      <strong>Not:</strong> {property.favoriteNotes}
                    </div>
                  )}
                  
                  <div className={favStyles.propertyDetails}>
                    <div className={favStyles.detailItem}>
                      <span className={favStyles.detailLabel}>Net Alan:</span>
                      <span className={favStyles.detailValue}>{property.netArea}m²</span>
                    </div>
                    <div className={favStyles.detailItem}>
                      <span className={favStyles.detailLabel}>Kat:</span>
                      <span className={favStyles.detailValue}>{property.floorNumber}/{property.totalFloors}</span>
                    </div>
                    <div className={favStyles.detailItem}>
                      <span className={favStyles.detailLabel}>Banyo:</span>
                      <span className={favStyles.detailValue}>{property.bathroom}</span>
                    </div>
                    <div className={favStyles.detailItem}>
                      <span className={favStyles.detailLabel}>Yaş:</span>
                      <span className={favStyles.detailValue}>{property.buildingAge} yıl</span>
                    </div>
                  </div>
                  
                  <div className={favStyles.siteName}>{property.siteName}</div>
                  
                  <div className={favStyles.dateAdded}>
                    İlan No: {property.listingNumber} | Favorilere eklenme: {new Date(property.dateAdded).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                
                {/* Eylem bölümü */}
                <div className={favStyles.favoriteActions}>
                  <button 
                    className={favStyles.viewButton}
                    onClick={() => window.open(`/listings/${property.listingNumber}`, '_blank')}
                  >
                    İlanı Görüntüle
                  </button>
                  
                  <div className={favStyles.actionButtons}>
                    <button 
                      className={favStyles.shareButton}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: property.title,
                            text: property.description,
                            url: `${window.location.origin}/listings/${property.listingNumber}`
                          });
                        } else {
                          navigator.clipboard.writeText(`${window.location.origin}/listings/${property.listingNumber}`);
                          alert('İlan linki panoya kopyalandı!');
                        }
                      }}
                      aria-label="İlanı paylaş"
                    >
                      📤
                    </button>
                    
                    <button 
                      className={favStyles.removeButton}
                      onClick={() => removeFavorite(property.id)}
                      aria-label="Favorilerden kaldır"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={favStyles.emptyState}>
              {isFiltering ? (
                <>
                  <p>Seçilen filtrelere uygun favori ilan bulunamadı.</p>
                  <p>Farklı filtreler deneyebilir veya filtreleri sıfırlayabilirsiniz.</p>
                </>
              ) : (
                <>
                  <p>Henüz favori ilanınız bulunmuyor.</p>
                  <p>Beğendiğiniz ilanları favorilerinize ekleyerek burada görüntüleyebilirsiniz!</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Server-side data fetching
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // In a real application, you would:
    // 1. Get the current user ID from session/authentication
    // 2. Query the database using the buyer_favorites_detailed view
    // 3. Format the data appropriately
    
    // For now, we'll simulate this with the data that matches our database
    const simulatedDbResponse = [
      {
        id: 2,
        title: "Oran Royal Konutları - 4+1 Ebeveyn Banyolu",
        description: "Oran Royal Konutlarında geniş, ebeveyn banyolu, ankastre mutfaklı 4+1 daire.",
        price: 5250000,
        listingNumber: 10022569,
        propertyType: "Daire",
        roomCount: "4+1",
        grossArea: 185,
        netArea: 170,
        floorNumber: 7,
        totalFloors: 12,
        buildingAge: 5,
        bathroom: 2,
        siteName: "Oran Royal Konutları",
        heatingType: "Merkezi Sistem",
        hasBalcony: true,
        hasElevator: true,
        dateAdded: "2025-04-10",
        favoriteNotes: "Love the 4+1 layout and furniture included"
      },
      {
        id: 9,
        title: "Oran Park Residence - 3+1 Kiracılı Daire",
        description: "Oran Park Residence'da kiracılı yatırımlık 3+1 daire. Aylık 15.000 TL kira getirisi.",
        price: 4950000,
        listingNumber: 10022574,
        propertyType: "Daire",
        roomCount: "3+1",
        grossArea: 155,
        netArea: 140,
        floorNumber: 8,
        totalFloors: 15,
        buildingAge: 2,
        bathroom: 2,
        siteName: "Oran Park Residence",
        heatingType: "Merkezi Sistem",
        hasBalcony: true,
        hasElevator: true,
        dateAdded: "2025-04-08",
        favoriteNotes: "Great investment opportunity with rental income"
      },
      {
        id: 12,
        title: "Oran Vista Evleri - Lüks 4+1 Daire",
        description: "Oran Vista Evleri'nde yeni yapılmış, lüks 4+1 daire. Akıllı ev sistemli, özel peyzajlı.",
        price: 7800000,
        listingNumber: 10022579,
        propertyType: "Daire",
        roomCount: "4+1",
        grossArea: 220,
        netArea: 200,
        floorNumber: 5,
        totalFloors: 8,
        buildingAge: 1,
        bathroom: 3,
        siteName: "Oran Vista Evleri",
        heatingType: "Merkezi Sistem",
        hasBalcony: true,
        hasElevator: true,
        dateAdded: "2025-04-17",
        favoriteNotes: "Amazing luxury features and location"
      },
      {
        id: 16,
        title: "Oran Elit Residence - 3+1 Ferah Daire",
        description: "Oran Elit Residence'da geniş, ferah 3+1 daire. 24 saat güvenlikli, havuzlu site.",
        price: 5100000,
        listingNumber: 10022584,
        propertyType: "Daire",
        roomCount: "3+1",
        grossArea: 150,
        netArea: 135,
        floorNumber: 6,
        totalFloors: 10,
        buildingAge: 3,
        bathroom: 2,
        siteName: "Oran Elit Residence",
        heatingType: "Merkezi Sistem",
        hasBalcony: true,
        hasElevator: true,
        dateAdded: "2025-04-09",
        favoriteNotes: "Perfect size and within budget"
      },
      {
        id: 32,
        title: "Oran Hills - Çatı Dubleksi",
        description: "Oran Hills'te çatı dubleksi. Özel havuzlu, jakuzili, panoramik şehir manzaralı.",
        price: 11500000,
        listingNumber: 10022603,
        propertyType: "Dubleks",
        roomCount: "6+1",
        grossArea: 320,
        netArea: 300,
        floorNumber: 12,
        totalFloors: 12,
        buildingAge: 2,
        bathroom: 5,
        siteName: "Oran Hills",
        heatingType: "Merkezi Sistem",
        hasBalcony: true,
        hasElevator: true,
        dateAdded: "2025-04-13",
        favoriteNotes: "Dream penthouse with panoramic views"
      }
    ];

    // Format the data for the component
    const formattedFavorites = simulatedDbResponse.map(property => ({
      ...property,
      priceFormatted: new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(property.price),
      image: "/api/placeholder/400/200"
    }));

    return {
      props: {
        favorites: formattedFavorites,
        buyerName: "Baran Konuk"
      }
    };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {
      props: {
        favorites: [],
        buyerName: "Baran Konuk"
      }
    };
  }
};

export default Favorites;
// pages/favorites.tsx - Favorites Page (Updated)
import Head from 'next/head';
import { NextPage } from 'next';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';
import favStyles from '../styles/Favorites.module.css';
import { useState, useMemo } from 'react';

interface FavoriteLocation {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  dateAdded: string;
  category: string;
  visited: boolean;
  image?: string; // Optional image URL for visual enhancements
}

const Favorites: NextPage = () => {
  // Sample favorite locations data
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([
    {
      id: 1,
      name: "Central Park",
      coordinates: { lat: 40.7812, lng: -73.9665 },
      description: "Iconic urban park in Manhattan with various attractions.",
      dateAdded: "2025-03-12",
      category: "Parks",
      visited: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 2,
      name: "Empire State Building",
      coordinates: { lat: 40.7484, lng: -73.9857 },
      description: "Famous 102-story Art Deco skyscraper in Midtown Manhattan.",
      dateAdded: "2025-03-14",
      category: "Landmarks",
      visited: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 3,
      name: "Brooklyn Bridge",
      coordinates: { lat: 40.7061, lng: -73.9969 },
      description: "Historic hybrid cable-stayed/suspension bridge connecting Manhattan and Brooklyn.",
      dateAdded: "2025-03-15",
      category: "Bridges",
      visited: false,
      image: "/api/placeholder/400/200"
    },
    {
      id: 4,
      name: "The Metropolitan Museum of Art",
      coordinates: { lat: 40.7794, lng: -73.9632 },
      description: "One of the world's largest and most prestigious art museums.",
      dateAdded: "2025-03-18",
      category: "Museums",
      visited: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 5,
      name: "Times Square",
      coordinates: { lat: 40.7580, lng: -73.9855 },
      description: "Major commercial intersection and tourist destination in Midtown Manhattan.",
      dateAdded: "2025-03-20",
      category: "Landmarks",
      visited: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 6,
      name: "High Line",
      coordinates: { lat: 40.7480, lng: -74.0048 },
      description: "Elevated linear park created on a former New York Central Railroad spur.",
      dateAdded: "2025-03-22",
      category: "Parks",
      visited: false,
      image: "/api/placeholder/400/200"
    },
    {
      id: 7,
      name: "Statue of Liberty",
      coordinates: { lat: 40.6892, lng: -74.0445 },
      description: "Colossal neoclassical sculpture on Liberty Island.",
      dateAdded: "2025-03-25",
      category: "Landmarks",
      visited: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 8,
      name: "One World Trade Center",
      coordinates: { lat: 40.7127, lng: -74.0134 },
      description: "Main building of the rebuilt World Trade Center complex.",
      dateAdded: "2025-03-27",
      category: "Landmarks",
      visited: false,
      image: "/api/placeholder/400/200"
    }
  ]);

  // State for filters and search
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(favorites.map(fav => fav.category)))];

  // Filter and search favorites
  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => {
      // Apply category filter
      const matchesCategory = activeCategory === "All" || fav.category === activeCategory;
      
      // Apply search filter (case insensitive)
      const matchesSearch = searchTerm === "" || 
        fav.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        fav.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [favorites, activeCategory, searchTerm]);

  // Toggle visited status
  const toggleVisited = (id: number) => {
    setFavorites(prevFavorites => 
      prevFavorites.map(fav => 
        fav.id === id ? { ...fav, visited: !fav.visited } : fav
      )
    );
  };

  // Remove favorite
  const removeFavorite = (id: number) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(fav => fav.id !== id)
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Kuşbakış - Favoriler</title>
        <meta name="description" content="Favori lokasyonlarınız" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Navbar />

      <main className={`${styles.main} ${favStyles.darkMain}`}>
        <h1 className={favStyles.title}>Favori Lokasyonlarınız</h1>
        
        <div className={favStyles.searchContainer}>
          <input
            type="text"
            placeholder="Ara..."
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

        {/* Category Filter */}
        <div className={favStyles.categoryFilter}>
          {categories.map(category => (
            <button 
              key={category}
              className={`${favStyles.categoryButton} ${activeCategory === category ? favStyles.active : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Favorites Grid */}
        <div className={favStyles.favoritesGrid}>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map(favorite => (
              <div key={favorite.id} className={favStyles.favoriteCard}>
                {/* Image section - top part */}
                <div className={favStyles.favoriteImageSection}>
                  <div className={favStyles.favoriteImageContainer}>
                    <img 
                      src={favorite.image || "/api/placeholder/400/200"} 
                      alt={`Image of ${favorite.name}`} 
                      className={favStyles.favoriteImage} 
                    />
                    <div className={favStyles.category}>{favorite.category}</div>
                  </div>
                </div>
                
                {/* Content section - middle part */}
                <div className={favStyles.favoriteContent}>
                  <h2 className={favStyles.favoriteName}>{favorite.name}</h2>
                  <p className={favStyles.favoriteDescription}>{favorite.description}</p>
                  
                  <div className={favStyles.coordinates}>
                    <span>Lat: {favorite.coordinates.lat.toFixed(4)}</span>
                    <span>Lng: {favorite.coordinates.lng.toFixed(4)}</span>
                  </div>
                  
                  <div className={favStyles.dateAdded}>
                    {new Date(favorite.dateAdded).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                
                {/* Actions section - bottom part */}
                <div className={favStyles.favoriteActions}>
                  <button 
                    className={favStyles.viewButton}
                    onClick={() => console.log(`View ${favorite.name}`)}
                  >
                    Görüntüle
                  </button>
                  
                  <div className={favStyles.actionButtons}>
                    <button 
                      className={`${favStyles.visitedButton} ${favorite.visited ? favStyles.visited : ''}`}
                      onClick={() => toggleVisited(favorite.id)}
                      aria-label={favorite.visited ? "Ziyaret edildi" : "Ziyaret edildi olarak işaretle"}
                    >
                      {favorite.visited ? '★' : '☆'}
                    </button>
                    
                    <button 
                      className={favStyles.removeButton}
                      onClick={() => removeFavorite(favorite.id)}
                      aria-label="Kaldır"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={favStyles.emptyState}>
              <p>Bu kategoride veya arama sonucunda favoriniz bulunmuyor.</p>
              <p>Yeni yerler ekleyerek burada görüntüleyebilirsiniz!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Favorites;
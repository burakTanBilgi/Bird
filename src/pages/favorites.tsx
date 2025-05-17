// pages/favorites.tsx - Favorites Page
import Head from 'next/head';
import { NextPage } from 'next';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';
import favStyles from '../styles/Favorites.module.css';
import { useState } from 'react';

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
      visited: true
    },
    {
      id: 2,
      name: "Empire State Building",
      coordinates: { lat: 40.7484, lng: -73.9857 },
      description: "Famous 102-story Art Deco skyscraper in Midtown Manhattan.",
      dateAdded: "2025-03-14",
      category: "Landmarks",
      visited: true
    },
    {
      id: 3,
      name: "Brooklyn Bridge",
      coordinates: { lat: 40.7061, lng: -73.9969 },
      description: "Historic hybrid cable-stayed/suspension bridge connecting Manhattan and Brooklyn.",
      dateAdded: "2025-03-15",
      category: "Bridges",
      visited: false
    },
    {
      id: 4,
      name: "The Metropolitan Museum of Art",
      coordinates: { lat: 40.7794, lng: -73.9632 },
      description: "One of the world's largest and most prestigious art museums.",
      dateAdded: "2025-03-18",
      category: "Museums",
      visited: true
    },
    {
      id: 5,
      name: "Times Square",
      coordinates: { lat: 40.7580, lng: -73.9855 },
      description: "Major commercial intersection and tourist destination in Midtown Manhattan.",
      dateAdded: "2025-03-20",
      category: "Landmarks",
      visited: true
    },
    {
      id: 6,
      name: "High Line",
      coordinates: { lat: 40.7480, lng: -74.0048 },
      description: "Elevated linear park created on a former New York Central Railroad spur.",
      dateAdded: "2025-03-22",
      category: "Parks",
      visited: false
    },
    {
      id: 7,
      name: "Statue of Liberty",
      coordinates: { lat: 40.6892, lng: -74.0445 },
      description: "Colossal neoclassical sculpture on Liberty Island.",
      dateAdded: "2025-03-25",
      category: "Landmarks",
      visited: true
    },
    {
      id: 8,
      name: "One World Trade Center",
      coordinates: { lat: 40.7127, lng: -74.0134 },
      description: "Main building of the rebuilt World Trade Center complex.",
      dateAdded: "2025-03-27",
      category: "Landmarks",
      visited: false
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Filter favorites based on active category
  const filteredFavorites = activeCategory === "All" 
    ? favorites 
    : favorites.filter(fav => fav.category === activeCategory);
  
  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(favorites.map(fav => fav.category)))];

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
        <title>Next.js Map App - Favorites</title>
        <meta name="description" content="Your favorite map locations" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <h1 className={styles.title}>Your Favorite Locations</h1>
        
        <p className={styles.description}>
          Keep track of places you love or want to visit
        </p>

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

        {/* Favorites List */}
        <div className={favStyles.favoritesGrid}>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map(favorite => (
              <div key={favorite.id} className={favStyles.favoriteCard}>
                <div className={favStyles.favoriteHeader}>
                  <h2>{favorite.name}</h2>
                  <span className={favStyles.category}>{favorite.category}</span>
                </div>
                
                <p className={favStyles.description}>{favorite.description}</p>
                
                <div className={favStyles.coordinates}>
                  <span>Lat: {favorite.coordinates.lat.toFixed(4)}</span>
                  <span>Lng: {favorite.coordinates.lng.toFixed(4)}</span>
                </div>
                
                <div className={favStyles.favoriteFooter}>
                  <div className={favStyles.dateAdded}>
                    Added on {new Date(favorite.dateAdded).toLocaleDateString()}
                  </div>
                  
                  <div className={favStyles.actions}>
                    <button 
                      className={`${favStyles.visitedButton} ${favorite.visited ? favStyles.visited : ''}`}
                      onClick={() => toggleVisited(favorite.id)}
                    >
                      {favorite.visited ? 'Visited ✓' : 'Mark as Visited'}
                    </button>
                    
                    <button 
                      className={favStyles.removeButton}
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={favStyles.emptyState}>
              <p>No favorites in this category. Add some places to see them here!</p>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by Next.js & Mapbox</p>
      </footer>
    </div>
  );
};

export default Favorites;

// pages/profile.tsx - Profile Page
import Head from 'next/head';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar component
import styles from '../styles/Home.module.css'; // Assuming your styles are here
import { NextPage } from 'next';
import dynamic from 'next/dynamic'; // Import dynamic for Next.js

// Dynamically import the MapComponent with no SSR, similar to index.tsx
// Ensure the path to your MapComponent is correct.
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  // You can add a loading component here if you like
  // loading: () => <p>Loading map...</p> 
});

const Profile: NextPage = () => {
  // User details
  const userName = "Baran Konuk";
  const userEmail = "baran.konuk@example.com"; // Example email

  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js App - {userName}&apos;s Profile</title>
        <meta name="description" content={`Profile page for ${userName} including location`} />
        <link rel="icon" href="/favicon.png" /> {/* Using favicon.png as the tab icon */}
      </Head>

      {/* Assuming you have a Navbar component. */}
      <Navbar />

      <main className={styles.main}>
        {/* Profile details section */}
        {/* The 'styles.profile' class from Home.module.css provides styling and margin-top */}
        <div className={styles.profile}> 
          <div className={styles.profileImage}>
            <div className={styles.avatar}>
              <img 
                src="/favicon.png" // Using favicon.png as the profile picture
                alt={`${userName}'s profile picture`} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: 'inherit' 
                }} 
              />
            </div>
          </div>
          
          <div className={styles.profileInfo}>
            <h2>{userName}</h2>
            <p>{userEmail}</p>
          </div>
        </div>

        {/* Location Address Section with Map */}
        <div 
          // This div acts as a container for the map section, applying consistent width and margin
          style={{ 
            marginTop: '2rem', // Space between profile info and map section
            width: '100%', 
            maxWidth: '800px', // Consistent max-width with the profile block
            padding: '0 1.5rem' // Optional: if you want padding similar to .profile (adjust as needed)
          }}
        >
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Etrafında yer aranan ana lokasyon:</h3>
          <div 
            className={styles.mapWrapper} // Reusing mapWrapper style from Home.module.css
            style={{ 
              height: '400px', // Define a height for the map container
              border: '1px solid #eaeaea', // Optional: adds a border around the map
              borderRadius: '10px', // Optional: rounds the corners of the map container
              overflow: 'hidden' // Ensures the map respects the border-radius
            }}
          >
            <MapComponent />
          </div>
        </div>
      </main>

      {/* Footer has been removed */}
    </div>
  );
};

export default Profile;

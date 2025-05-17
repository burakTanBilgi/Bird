// pages/index.tsx - Updated Home Page with Map
import Head from 'next/head';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import BottomTab from '../components/BottomTab';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';

// Import the MapComponent dynamically with no SSR to avoid mapbox-gl issues
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false
});

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js Map App - Home</title>
        <meta name="description" content="Next.js application with Mapbox integration" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Map Component */}
        <div className={styles.mapWrapper}>
          <MapComponent />
        </div>
      </main>

      {/* Bottom Tab Component */}
      <BottomTab />
    </div>
  );
};

export default Home;
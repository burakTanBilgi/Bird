// pages/profile.tsx - Profile Page
import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Home.module.css';
import { NextPage } from 'next';

const Profile: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js App - Profile</title>
        <meta name="description" content="User profile page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <h1 className={styles.title}>User Profile</h1>
        
        <div className={styles.profile}>
          <div className={styles.profileImage}>
            <div className={styles.avatar}>
              {/* Placeholder for profile image */}
              <span>JD</span>
            </div>
          </div>
          
          <div className={styles.profileInfo}>
            <h2>John Doe</h2>
            <p>Web Developer</p>
            <p>john.doe@example.com</p>
            
            <div className={styles.stats}>
              <div>
                <strong>5</strong>
                <span>Projects</span>
              </div>
              <div>
                <strong>12</strong>
                <span>Followers</span>
              </div>
              <div>
                <strong>25</strong>
                <span>Following</span>
              </div>
            </div>
            
            <div className={styles.bio}>
              <h3>About Me</h3>
              <p>
                Frontend developer with experience in React and Next.js.
                Passionate about creating responsive and user-friendly web applications.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Powered by Next.js</p>
      </footer>
    </div>
  );
};

export default Profile;
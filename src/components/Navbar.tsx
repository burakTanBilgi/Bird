// components/Navbar.tsx - Navigation Component (unchanged)
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.css';
import { FC } from 'react';

const Navbar: FC = () => {
  const router = useRouter();
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span>Kuşbakış</span>
        </Link>
      </div>
      
      <div className={styles.links}>
        <Link href="/">
          <span className={router.pathname === '/' ? styles.active : ''}>Home</span>
        </Link>
        <Link href="/profile">
          <span className={router.pathname === '/profile' ? styles.active : ''}>Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
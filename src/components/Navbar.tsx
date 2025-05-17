// components/Navbar.tsx - Navigation Component
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
          <span> Kuşbakış 𓅪 </span>
        </Link>
      </div>
      
      <div className={styles.links}>
        <Link href="/profile">
          <span className={router.pathname === '/profile' ? styles.active : ''}>Profil</span>
        </Link>
        <Link href="/favorites">
          <span className={router.pathname === '/favorites' ? styles.active : ''}>Favoriler</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
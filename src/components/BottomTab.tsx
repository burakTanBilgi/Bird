// components/BottomTab.tsx
import { FC } from 'react';
import styles from '../styles/BottomTab.module.css';

const BottomTab: FC = () => {
  return (
    <div className={styles.bottomTabContainer}>
      <div className={styles.tabHandle}>
        {/* Using CSS ::before for the rounded line, no need for text */}
      </div>
      <div className={styles.tabContent}>
        <h3 style={{ margin: '0 0 15px 0' }}>Tab Content</h3>
        <p style={{ margin: '0 0 10px 0' }}>
          This is the content of the bottom tab that slides up on hover.
          It appears in front of the map without changing the map&apos;s position.
        </p>
        <p style={{ margin: '0' }}>
          When you move your cursor away from this area, the tab will automatically close.
        </p>
      </div>
    </div>
  );
};

export default BottomTab;
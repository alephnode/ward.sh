import styles from '../section.module.css';
import Navbar from '@/components/Navbar';

export default function Visual() {
  return (
    <main className={styles.section}>
      <header className={styles.header}>
        <Navbar activePage="visual" />
      </header>
      <div className={styles.container}>
        <div className={styles.content}>
          coming soon
        </div>
      </div>
    </main>
  );
}


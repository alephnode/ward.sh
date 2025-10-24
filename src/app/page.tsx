import styles from './page.module.css';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className={styles.hero}>
      <Navbar variant="hero" />
    </main>
  );
}

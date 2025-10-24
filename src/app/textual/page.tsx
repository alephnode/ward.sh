import styles from '../section.module.css';
import Navbar from '@/components/Navbar';
import TransitionLink from '@/components/TransitionLink';

export default function Textual() {
  return (
    <main className={styles.section}>
      <header className={styles.header}>
        <Navbar activePage="textual" />
      </header>
      <div className={styles.container}>
        <div className={styles.content}>
          <TransitionLink href="/textual/archive" style={{ textDecoration: 'underline' }}>
            archive
          </TransitionLink>
        </div>
      </div>
    </main>
  );
}


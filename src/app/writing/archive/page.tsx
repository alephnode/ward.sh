import styles from '../../section.module.css';
import { getAllArticles } from '@/lib/markdown';
import Navbar from '@/components/Navbar';
import ArchiveList from './archive-list';
import path from 'path';

export default function Archive() {
  const archiveArticlesDirectory = path.join(process.cwd(), 'src/app/writing/archive/content');
  const archiveArticles = getAllArticles(archiveArticlesDirectory);

  return (
    <main className={styles.section}>
      <header className={styles.header}>
        <Navbar />
      </header>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 400 }}>
            Archive
          </h2>
          <ArchiveList articles={archiveArticles} />
        </div>
      </div>
    </main>
  );
}

import { getArticle, getArticleSlugs } from '@/lib/markdown';
import styles from '../../../section.module.css';
import Navbar from '@/components/Navbar';
import TransitionLink from '@/components/TransitionLink';
import articleStyles from './article.module.css';
import path from 'path';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const archiveArticlesDirectory = path.join(process.cwd(), 'src/app/textual/archive/content');

export async function generateStaticParams() {
  const slugs = getArticleSlugs(archiveArticlesDirectory);
  return slugs.map(slug => ({ slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(archiveArticlesDirectory, slug);

  return (
    <main className={styles.section}>
      <header className={styles.header}>
        <Navbar />
      </header>
      <div className={styles.container}>
        <article className={articleStyles.article}>
          <header className={articleStyles.articleHeader}>
            <h1 className={articleStyles.title}>{article.title}</h1>
            <time
              dateTime={article.date}
              className={articleStyles.date}
            >
              {new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </header>
          <div
            className={articleStyles.content}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <footer className={articleStyles.footer}>
            <TransitionLink href="/textual/archive" className={articleStyles.backLink}>
              ← Back to archive
            </TransitionLink>
          </footer>
        </article>
      </div>
    </main>
  );
}

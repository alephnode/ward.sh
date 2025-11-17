'use client';

import TransitionLink from '@/components/TransitionLink';
import { ArticleMetadata } from '@/lib/markdown';

interface ArchiveListProps {
  articles: ArticleMetadata[];
}

export default function ArchiveList({ articles }: ArchiveListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {articles.map(article => (
        <article
          key={article.slug}
          style={{
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <TransitionLink
            href={`/writing/archive/${article.slug}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 400,
                marginBottom: '0.5rem',
                color: 'var(--foreground)',
                hyphens: 'auto',
              }}
            >
              {article.title}
            </h3>
          </TransitionLink>
          <time
            dateTime={article.date}
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            {new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </article>
      ))}
    </div>
  );
}

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export interface ArticleMetadata {
  slug: string;
  title: string;
  date: string;
}

export interface Article extends ArticleMetadata {
  content: string;
}

/**
 * Get all articles sorted by date (newest first)
 */
export function getAllArticles(directory: string): ArticleMetadata[] {
  const slugs = getArticleSlugs(directory);

  const articles = slugs
    .map(slug => {
      const fullPath = path.join(directory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || '',
        date: data.date || '',
      };
    })
    .sort((a, b) => {
      // Sort by date, newest first
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  return articles;
}

/**
 * Get all article slugs (filenames without .md extension)
 */
export function getArticleSlugs(directory: string): string[] {
  const files = fs.readdirSync(directory);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

/**
 * Get a single article by slug
 */
export async function getArticle(directory: string, slug: string): Promise<Article> {
  const fullPath = path.join(directory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Update image paths from ./images/ or images/ to /archive-images/
  // This handles both markdown image syntax and HTML img tags
  let htmlContent = content.replace(/\.?\/?images\//g, '/archive-images/');

  // Process markdown to HTML, but preserve the raw HTML that's already in the content
  // We need to do this carefully to not lose the HTML blocks
  // Split content by HTML blocks and process only the markdown parts
  const htmlBlockRegex = /<[^>]+>[\s\S]*?<\/[^>]+>|<[^>]+\/>/g;
  const parts: Array<{ type: 'html' | 'markdown', content: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = htmlBlockRegex.exec(htmlContent)) !== null) {
    // Add markdown content before this HTML block
    if (match.index > lastIndex) {
      parts.push({ type: 'markdown', content: htmlContent.substring(lastIndex, match.index) });
    }
    // Add HTML block as-is
    parts.push({ type: 'html', content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining markdown content
  if (lastIndex < htmlContent.length) {
    parts.push({ type: 'markdown', content: htmlContent.substring(lastIndex) });
  }

  // Create remark processor once, outside the loop
  const remarkProcessor = remark().use(remarkHtml);

  // Process markdown parts through remark
  let processedHtml = '';
  for (const part of parts) {
    if (part.type === 'html') {
      processedHtml += part.content;
    } else {
      // Only process markdown if there's actual markdown content
      if (part.content.trim()) {
        const processedContent = await remarkProcessor.process(part.content);
        processedHtml += processedContent.toString();
      }
    }
  }

  htmlContent = processedHtml;

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    content: htmlContent,
  };
}

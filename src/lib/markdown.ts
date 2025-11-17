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

  // Split content into lines to identify standalone HTML blocks
  // We need to be careful to NOT extract HTML blocks that are inside markdown code blocks
  const lines = htmlContent.split('\n');
  const parts: Array<{ type: 'html' | 'markdown', content: string }> = [];
  let currentMarkdown = '';
  let inCodeBlock = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Check if we're entering or exiting a code block
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      currentMarkdown += lines[i] + '\n';
      i++;
      continue;
    }

    // If we're inside a code block, just accumulate the line as markdown
    if (inCodeBlock) {
      currentMarkdown += lines[i] + '\n';
      i++;
      continue;
    }

    // Check if this is a standalone HTML block (div, p, blockquote, etc. on its own line)
    // Only do this if we're NOT in a code block
    const blockLevelMatch = line.match(/^<(address|article|aside|blockquote|details|dialog|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|li|main|nav|ol|p|pre|section|table|ul|script|style)\b/i);

    if (blockLevelMatch) {
      // This is a block-level HTML element
      // First, add any accumulated markdown
      if (currentMarkdown.trim()) {
        parts.push({ type: 'markdown', content: currentMarkdown });
        currentMarkdown = '';
      }

      // Now extract the complete HTML block
      const tagName = blockLevelMatch[1];
      let htmlBlock = lines[i];
      i++;

      // For tags like hr and br that are self-closing, we're done
      if (line.match(/^<(hr|br)\b[^>]*\/?\s*>$/i)) {
        parts.push({ type: 'html', content: htmlBlock });
        continue;
      }

      // For opening tags, find the closing tag
      let closingTagFound = false;
      let depth = 1;

      while (i < lines.length && !closingTagFound) {
        htmlBlock += '\n' + lines[i];

        // Count opening and closing tags of the same type
        const openCount = (lines[i].match(new RegExp(`<${tagName}\\b`, 'gi')) || []).length;
        const closeCount = (lines[i].match(new RegExp(`</${tagName}>`, 'gi')) || []).length;

        depth += openCount - closeCount;

        if (depth === 0) {
          closingTagFound = true;
        }

        i++;
      }

      parts.push({ type: 'html', content: htmlBlock });
    } else {
      // This is markdown content
      currentMarkdown += lines[i] + '\n';
      i++;
    }
  }

  // Add any remaining markdown
  if (currentMarkdown.trim()) {
    parts.push({ type: 'markdown', content: currentMarkdown });
  }

  // Process markdown parts through remark
  const remarkProcessor = remark().use(remarkHtml);
  let processedHtml = '';

  for (const part of parts) {
    if (part.type === 'html') {
      processedHtml += part.content;
    } else {
      if (part.content.trim()) {
        const processed = await remarkProcessor.process(part.content);
        processedHtml += processed.toString();
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

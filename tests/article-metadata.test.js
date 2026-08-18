import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const store = require('../api/store');

describe('CSDN 文章展示元数据', () => {
  test('34 篇文章都有干净摘要、封面和替代文字', () => {
    const articles = store.listArticles();
    expect(articles).toHaveLength(34);
    for (const article of articles) {
      expect(article.summary.length, article.slug).toBeGreaterThanOrEqual(50);
      expect(article.summary.length, article.slug).toBeLessThanOrEqual(100);
      expect(article.summary, article.slug).not.toMatch(/<[^>]+>|```|\b(?:const|final|package)\b/);
      expect(article.cover, article.slug).toMatch(/^\/(?:articles|assets)\//);
      expect(article.coverAlt, article.slug).toContain('封面');
      const localPath = path.join(process.cwd(), 'public', article.cover.replace(/^\//, ''));
      expect(fs.existsSync(localPath), localPath).toBe(true);
    }
  });

  test('全部文章使用各自独立的 Clay 生成封面', () => {
    const generated = store.listArticles().filter((article) => article.cover.startsWith('/assets/clay/articles/'));
    expect(generated).toHaveLength(34);
    expect(new Set(generated.map((article) => article.cover)).size).toBe(34);
  });
});

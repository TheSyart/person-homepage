import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const LANGUAGE_LABELS = new Set([
  'text', 'bash', 'shell', 'java', 'javascript', 'typescript', 'python', 'dart',
  'json', 'yaml', 'xml', 'html', 'css', 'kotlin', 'c', 'cpp', 'sql'
]);
const PLACEHOLDER_FILES = ['hello-new-home.md', 'why-all-in-ai.md'];

function stripMarkdown(value) {
  return String(value || '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function nextNonBlank(lines, start) {
  let index = start;
  while (index < lines.length && !lines[index].trim()) index += 1;
  return index;
}

function removeFenceArtifacts(lines) {
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^```\s*([\w+-]*)\s*$/);
    if (!opening) {
      output.push(lines[index]);
      continue;
    }

    const block = [];
    let closing = index + 1;
    while (closing < lines.length && !/^```\s*$/.test(lines[closing])) {
      block.push(lines[closing]);
      closing += 1;
    }
    if (closing >= lines.length) {
      output.push(lines[index], ...block);
      break;
    }

    let language = opening[1].toLowerCase();
    let cursor = nextNonBlank(lines, closing + 1);
    const possibleLanguage = (lines[cursor] || '').trim().toLowerCase();
    if (!language && LANGUAGE_LABELS.has(possibleLanguage)) {
      language = possibleLanguage;
      cursor = nextNonBlank(lines, cursor + 1);

      if ((lines[cursor] || '').trim() === '运行') {
        cursor = nextNonBlank(lines, cursor + 1);
      }
      if (/icon-arrowwhite\.png/i.test(lines[cursor] || '')) {
        cursor = nextNonBlank(lines, cursor + 1);
      }
      while (/^(?:\*|-)\s+\d+\s*$/.test(lines[cursor] || '')) cursor += 1;
      cursor = nextNonBlank(lines, cursor);
    }

    output.push(`\`\`\`${language}`, ...block, '```', '');
    index = Math.max(closing, cursor - 1);
  }

  return output;
}

export function cleanCsdnMarkdown(markdown, sourceUrl = '') {
  const normalized = String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\[\]\([^)]+\)/g, '')
    .replace(/#pic_center\b/g, '')
    .replace(/^\s*!\[[^\]]*\]\([^\n)]*icon-arrowwhite\.png[^\n)]*\)\s*$/gim, '')
    .replace(/^(#{1,6})([^#\s].*)$/gm, '$1 $2');

  const cleaned = removeFenceArtifacts(normalized.split('\n'))
    .join('\n')
    .replace(/^\s*运行\s*$/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleaned) throw new Error(`CSDN 正文为空：${sourceUrl || 'unknown source'}`);
  return `${cleaned}\n`;
}

export function parseReaderDocument(raw) {
  const document = String(raw || '').replace(/\r\n?/g, '\n');
  const marker = '\nMarkdown Content:\n';
  const markerIndex = document.indexOf(marker);
  if (markerIndex < 0) throw new Error('Reader 文档缺少 Markdown Content');

  const header = document.slice(0, markerIndex);
  const title = header.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || '';
  const sourceUrl = header.match(/^URL Source:\s*(.+)$/m)?.[1]?.trim() || '';
  const publishedTime = header.match(/^Published Time:\s*(.+)$/m)?.[1]?.trim() || '';
  const id = sourceUrl.match(/\/article\/details\/(\d+)/)?.[1] || '';
  const date = publishedTime.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || '';
  const content = cleanCsdnMarkdown(document.slice(markerIndex + marker.length), sourceUrl);
  const tagsLine = content.match(/^\*\*标签\*\*[：:]\s*(.+)$/m)?.[1] || '';
  const tags = tagsLine.split(/[、,，]/).map((tag) => tag.trim()).filter(Boolean);
  const explicitSummary = content.match(/^\*\*摘要\*\*[：:]\s*(.+)$/m)?.[1] || '';
  const firstProse = content.split(/\n\s*\n/).find((paragraph) => {
    const value = paragraph.trim();
    return value && !/^(?:#{1,6}\s|!\[|```|\*\*标签\*\*)/.test(value);
  }) || '';
  const summary = stripMarkdown(explicitSummary || firstProse).slice(0, 180);

  if (!id || !title || !date) {
    throw new Error(`Reader 元数据不完整：id=${id || '-'} title=${title || '-'} date=${date || '-'}`);
  }

  return { id, title, date, summary, tags, sourceUrl, content };
}

export function parseExportedMarkdown(raw, item, metadata) {
  const content = String(raw || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/#pic_center\b/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!content) throw new Error(`CSDN 导出正文为空：${item.id}`);

  const tagsLine = content.match(/^\*\*标签\*\*[：:]\s*(.+)$/m)?.[1] || '';
  const tags = tagsLine.split(/[、,，]/).map((tag) => tag.trim()).filter(Boolean);
  const explicitSummary = content.match(/^\*\*摘要\*\*[：:]\s*(.+)$/m)?.[1] || '';
  const firstProse = content.split(/\n\s*\n/).find((paragraph) => {
    const value = paragraph.trim();
    return value && !/^(?:#{1,6}\s|!\[|```|\*\*标签\*\*)/.test(value);
  }) || '';

  return {
    id: String(item.id),
    title: item.title,
    date: metadata.date,
    summary: stripMarkdown(explicitSummary || firstProse).slice(0, 180),
    tags: tags.length ? tags : metadata.tags,
    sourceUrl: item.url,
    content: `${content}\n`
  };
}

export function parseReaderFallback(raw, item) {
  const document = String(raw || '').replace(/\r\n?/g, '\n');
  const marker = '\nMarkdown Content:\n';
  const markerIndex = document.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Reader 文档缺少 Markdown Content：${item.id}`);
  const content = cleanCsdnMarkdown(document.slice(markerIndex + marker.length), item.url);
  const tagsLine = content.match(/^\*\*标签\*\*[：:]\s*(.+)$/m)?.[1] || '';
  const tags = tagsLine.split(/[、,，]/).map((tag) => tag.trim()).filter(Boolean);
  const explicitSummary = content.match(/^\*\*摘要\*\*[：:]\s*(.+)$/m)?.[1] || '';
  const firstProse = content.split(/\n\s*\n/).find((paragraph) => stripMarkdown(paragraph)) || '';
  return {
    id: String(item.id),
    title: item.title,
    date: item.date,
    summary: stripMarkdown(explicitSummary || firstProse).slice(0, 180),
    tags,
    sourceUrl: item.url,
    content
  };
}

export function renderArticle(record) {
  const sourceNote = `[原文发布于 CSDN](${record.sourceUrl})`;
  const content = record.content.trimEnd();
  return [
    '---',
    `title: ${JSON.stringify(record.title)}`,
    `date: ${record.date}`,
    `summary: ${JSON.stringify(record.summary || '')}`,
    `tags: [${(record.tags || []).map((tag) => JSON.stringify(tag)).join(', ')}]`,
    'draft: false',
    '---',
    '',
    content,
    '',
    '---',
    '',
    sourceNote,
    ''
  ].join('\n');
}

export function validateInventory(items, expectedCount = 34) {
  if (!Array.isArray(items) || items.length !== expectedCount) {
    throw new Error(`CSDN 已发布清单必须恰好为 ${expectedCount} 篇，当前为 ${Array.isArray(items) ? items.length : 0}`);
  }

  const ids = new Set();
  for (const [index, item] of items.entries()) {
    if (!item?.title?.trim()) throw new Error(`第 ${index + 1} 项缺少标题`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item.date || ''))) throw new Error(`第 ${index + 1} 项发布日期非法`);
    if (!/^\d+$/.test(String(item.id || ''))) throw new Error(`第 ${index + 1} 项 ID 非法`);
    if (ids.has(String(item.id))) throw new Error(`发现重复 ID：${item.id}`);
    ids.add(String(item.id));
    const urlId = String(item.url || '').match(/\/article\/details\/(\d+)/)?.[1];
    if (urlId !== String(item.id)) throw new Error(`文章 ${item.id} 的 URL ID 不匹配`);
  }
}

function extensionFor(url, contentType) {
  const known = String(contentType || '').match(/image\/(png|jpe?g|gif|webp|svg\+xml)/i)?.[1];
  if (known) return known.replace('jpeg', 'jpg').replace('svg+xml', 'svg');
  const pathname = new URL(url).pathname;
  return pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() || 'png';
}

async function localizeImages(record, options) {
  const matches = [...record.content.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)];
  const replacements = new Map();
  const localized = [];
  let remoteFallback = false;

  for (const [index, match] of matches.entries()) {
    const remoteUrl = match[2];
    if (replacements.has(remoteUrl)) continue;
    try {
      const response = await options.fetchImpl(remoteUrl, {
        headers: { Referer: record.sourceUrl, 'User-Agent': 'Mozilla/5.0' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('empty image');
      const extension = extensionFor(remoteUrl, response.headers.get('content-type'));
      const filename = `image-${index + 1}.${extension}`;
      const diskDir = path.join(options.stagingImageRoot, record.id);
      await mkdir(diskDir, { recursive: true });
      const diskPath = path.join(diskDir, filename);
      await writeFile(diskPath, bytes);
      const publicPath = `/articles/csdn/${record.id}/${filename}`;
      replacements.set(remoteUrl, publicPath);
      localized.push({ remoteUrl, publicPath, diskPath });
    } catch (error) {
      remoteFallback = true;
      localized.push({ remoteUrl, error: error.message });
    }
  }

  let content = record.content;
  for (const [remoteUrl, publicPath] of replacements) content = content.split(remoteUrl).join(publicPath);
  return { content, localized, imageStatus: remoteFallback ? 'remote-fallback' : 'localized' };
}

async function findExportedMarkdown(item, exportDir) {
  if (!exportDir) return null;
  const filenames = await readdir(exportDir).catch(() => []);
  const candidates = new Set([
    `${item.title}.md`,
    `${item.title.replace(/[:/\\]/g, '_')}.md`
  ]);
  const filename = filenames.find((name) => candidates.has(name));
  return filename ? path.join(exportDir, filename) : null;
}

function validateRecord(record, rendered, localized) {
  if (record.content.trim().length <= 200) throw new Error(`文章 ${record.id} 正文少于 200 字符`);
  if ((record.content.match(/```/g) || []).length % 2 !== 0) throw new Error(`文章 ${record.id} 代码围栏不平衡`);
  if (/#pic_center|icon-arrowwhite\.png|^\[\]\(/m.test(rendered)) throw new Error(`文章 ${record.id} 仍含 CSDN 渲染残留`);
  if (/^(?:\*|-)\s+1\s*\n(?:\s*(?:\*|-)\s+\d+\s*\n?)+/m.test(rendered)) {
    throw new Error(`文章 ${record.id} 仍含代码行号列表`);
  }
  return Promise.all(localized.filter((item) => item.diskPath).map(async (item) => {
    const info = await stat(item.diskPath);
    if (!info.isFile() || info.size === 0) throw new Error(`文章 ${record.id} 本地图片无效`);
  }));
}

export async function importInventory(items, options = {}) {
  validateInventory(items, options.expectedCount ?? 34);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const articleDir = path.resolve(options.articleDir || 'api/data/articles');
  const imageRoot = path.resolve(options.imageRoot || 'public/articles/csdn');
  const exportDir = options.exportDir ? path.resolve(options.exportDir) : null;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const stagingArticleDir = path.join(path.dirname(articleDir), `.csdn-articles-${nonce}`);
  const stagingImageRoot = path.join(path.dirname(imageRoot), `.csdn-images-${nonce}`);
  const report = [];

  await mkdir(stagingArticleDir, { recursive: true });
  await mkdir(stagingImageRoot, { recursive: true });

  try {
    for (const item of items) {
      const exportedPath = await findExportedMarkdown(item, exportDir);
      let record;
      if (exportedPath) {
        record = parseExportedMarkdown(await readFile(exportedPath, 'utf8'), item, {
          date: item.date,
          tags: []
        });
      } else {
        const readerResponse = await fetchImpl(`https://r.jina.ai/${item.url}`, {
          headers: { 'X-Target-Selector': '#content_views' }
        });
        if (!readerResponse.ok) throw new Error(`Reader ${item.id}: HTTP ${readerResponse.status}`);
        record = parseReaderFallback(await readerResponse.text(), item);
      }

      const images = await localizeImages(record, { fetchImpl, stagingImageRoot });
      const localizedRecord = { ...record, content: images.content };
      const rendered = renderArticle(localizedRecord);
      await validateRecord(localizedRecord, rendered, images.localized);
      const filename = `csdn-${record.id}.md`;
      await writeFile(path.join(stagingArticleDir, filename), rendered, 'utf8');
      report.push({
        id: record.id,
        title: record.title,
        date: record.date,
        sourceUrl: record.sourceUrl,
        filename,
        images: images.localized.length,
        imageStatus: images.imageStatus,
        contentSource: exportedPath ? 'csdn-export' : 'reader-fallback',
        status: 'passed'
      });
    }

    if (report.length !== items.length) throw new Error(`导入数量不完整：${report.length}/${items.length}`);
    await mkdir(articleDir, { recursive: true });
    await mkdir(path.dirname(imageRoot), { recursive: true });
    await rm(imageRoot, { recursive: true, force: true });
    await rename(stagingImageRoot, imageRoot);
    for (const row of report) {
      await rename(path.join(stagingArticleDir, row.filename), path.join(articleDir, row.filename));
    }
    for (const placeholder of PLACEHOLDER_FILES) {
      await rm(path.join(articleDir, placeholder), { force: true });
    }
    await rm(stagingArticleDir, { recursive: true, force: true });
    return report;
  } catch (error) {
    await rm(stagingArticleDir, { recursive: true, force: true });
    await rm(stagingImageRoot, { recursive: true, force: true });
    throw error;
  }
}

export async function readInventory(filename) {
  return JSON.parse(await readFile(filename, 'utf8'));
}

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  cleanCsdnMarkdown,
  parseExportedMarkdown,
  parseReaderFallback,
  parseReaderDocument,
  renderArticle,
  validateInventory
} from '../scripts/lib/csdn-import.mjs';

const fixturePath = path.join(process.cwd(), 'tests/fixtures/csdn-reader-sample.md');
const fixture = readFileSync(fixturePath, 'utf8');
const exportFixture = readFileSync(path.join(process.cwd(), 'tests/fixtures/csdn-export-sample.md'), 'utf8');

describe('CSDN Reader parser', () => {
  it('preserves the real article while removing CSDN rendering artifacts', () => {
    const record = parseReaderDocument(fixture);

    expect(record).toMatchObject({
      id: '161193349',
      title: '从零实现自己的agent第五期：子代理实现',
      date: '2026-05-18',
      tags: ['Agent', 'Subagent', '上下文隔离', '并发', 'Tool Use']
    });
    expect(record.summary).toContain('有了任务规划');
    expect(record.content).toContain('```python');
    expect(record.content).not.toContain('\n运行\n');
    expect(record.content).not.toMatch(/^\*\s+1$/m);
    expect(record.content).not.toContain('[](');
    expect(record.content).not.toContain('#pic_center');
    expect(record.content).not.toContain('icon-arrowwhite.png');
  });

  it('keeps heading text when duplicated empty CSDN anchors are removed', () => {
    const cleaned = cleanCsdnMarkdown(
      '## [](https://example.com)[](https://example.com)保留标题\n\n正文',
      'https://example.com'
    );

    expect(cleaned).toContain('## 保留标题');
    expect(cleaned).not.toContain('[](');
  });

  it('renders safe frontmatter and source traceability', () => {
    const file = renderArticle(parseReaderDocument(fixture));

    expect(file).toContain('title: "从零实现自己的agent第五期：子代理实现"');
    expect(file).toContain('date: 2026-05-18');
    expect(file).toContain('tags: ["Agent", "Subagent", "上下文隔离", "并发", "Tool Use"]');
    expect(file).toContain('draft: false');
    expect(file).toContain('[原文发布于 CSDN](https://blog.csdn.net/m0_70561094/article/details/161193349)');
  });

  it('prefers CSDN native exports without changing their Markdown structure', () => {
    const metadata = parseReaderDocument(fixture);
    const record = parseExportedMarkdown(exportFixture, {
      id: '161193349',
      title: '从零实现自己的agent第五期：子代理实现',
      url: metadata.sourceUrl
    }, metadata);

    expect(record.title).toBe('从零实现自己的agent第五期：子代理实现');
    expect(record.date).toBe('2026-05-18');
    expect(record.content).toContain('# Subagent 实现：把脏活交给独立上下文');
    expect(record.content).toContain('```python');
    expect(record.content).toContain('- 保留真实列表');
    expect(record.content).not.toContain('#pic_center');
    expect(record.content.charCodeAt(0)).not.toBe(0xfeff);
    expect(record.tags).toEqual(['Agent', 'Subagent', 'Tool Use']);
  });

  it('uses inventory metadata for the one legacy rich-text article', () => {
    const record = parseReaderFallback([
      'Title: Android 开发avd界面跳转闪退哪里错了_android avd闪退-CSDN博客',
      '',
      'URL Source: https://blog.csdn.net/m0_70561094/article/details/134781227',
      '',
      'Markdown Content:',
      'package com.example.storesystem;',
      '',
      'public class SuccessActivity extends Activity {',
      '  // legacy rich text body',
      '}'
    ].join('\n'), {
      id: '134781227',
      title: 'Android 开发avd界面跳转闪退哪里错了',
      date: '2023-12-04',
      url: 'https://blog.csdn.net/m0_70561094/article/details/134781227'
    });

    expect(record).toMatchObject({
      id: '134781227',
      title: 'Android 开发avd界面跳转闪退哪里错了',
      date: '2023-12-04'
    });
    expect(record.content).toContain('SuccessActivity');
  });
});

describe('CSDN inventory validation', () => {
  const valid = Array.from({ length: 34 }, (_, index) => {
    const id = String(100000000 + index);
    return {
      id,
      title: `真实文章 ${index + 1}`,
      date: '2025-01-01',
      url: `https://blog.csdn.net/m0_70561094/article/details/${id}`
    };
  });

  it('accepts exactly 34 unique, well-formed published rows', () => {
    expect(() => validateInventory(valid, 34)).not.toThrow();
  });

  it('rejects incomplete, duplicate, mismatched, and untitled rows', () => {
    expect(() => validateInventory(valid.slice(0, 33), 34)).toThrow(/34/);
    expect(() => validateInventory([...valid.slice(0, 33), valid[0]], 34)).toThrow(/重复/);
    expect(() => validateInventory(valid.map((row, index) => index === 0
      ? { ...row, url: 'https://blog.csdn.net/m0_70561094/article/details/999999999' }
      : row), 34)).toThrow(/不匹配/);
    expect(() => validateInventory(valid.map((row, index) => index === 0
      ? { ...row, title: '' }
      : row), 34)).toThrow(/标题/);
    expect(() => validateInventory(valid.map((row, index) => index === 0
      ? { ...row, date: '' }
      : row), 34)).toThrow(/日期/);
  });
});

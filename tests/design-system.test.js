import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
const css = readFileSync('./src/style.css', 'utf8');

function ruleFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] || '';
}

describe('Clay 设计系统', () => {
  test('小字号界面文字使用高对比正文色', () => {
    ['.nav-link', '.page-description', '.clay-tag', '.achievement-label', '.form-status'].forEach((selector) => {
      expect(ruleFor(selector), selector).toMatch(/color:\s*var\(--clay-ink\)/);
    });
  });

  test('键盘焦点使用深色 Clay 轮廓', () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--clay-ink\)/s);
    expect(css).toMatch(/\.clay-input:focus\s*\{[^}]*outline:\s*3px solid var\(--clay-ink\)/s);
  });
});

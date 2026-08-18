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

  test('Hero 使用软体形变、挤压反馈和短生命周期粘土颗粒', () => {
    expect(css).toMatch(/\.agent-core\s*\{[^}]*animation:\s*clay-core-morph/s);
    expect(css).toMatch(/\.agent-core\.is-squishing\s*\{[^}]*animation:\s*clay-core-squish/s);
    expect(css).toMatch(/@keyframes\s+clay-core-morph/);
    expect(css).toMatch(/@keyframes\s+clay-core-squish/);
    expect(css).toMatch(/\.clay-spark\s*\{[^}]*animation:\s*clay-spark-pop/s);
  });

  test('Hero 在手机端单栏且减少动态时停止持续运动与粒子', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*\.agent-hero__inner\s*\{[^}]*grid-template-columns:\s*1fr/s);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.agent-core[\s\S]*animation:\s*none\s*!important/s);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.clay-spark\s*\{[^}]*display:\s*none/s);
  });
});

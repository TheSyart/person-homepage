import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

describe('浏览器标签图标', () => {
  test('首页声明可加载的正方形 PNG favicon', () => {
    const document = new JSDOM(readFileSync('./index.html', 'utf8')).window.document;
    const icon = document.querySelector('link[rel="icon"]');

    expect(icon).not.toBeNull();
    expect(icon.type).toBe('image/png');

    const bytes = readFileSync(resolve('./public', icon.getAttribute('href').replace(/^\//, '')));
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(bytes.readUInt32BE(16)).toBe(bytes.readUInt32BE(20));
  });
});

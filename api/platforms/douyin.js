const { parseDouyinProfileText } = require('./utils');

const PROFILE_URL = 'https://www.douyin.com/user/MS4wLjABAAAAk5lgbm96yoPPEoGXoY3MIp4S8voya0dzcnG0Lom5-SI?from_tab_name=main';
const EXPECTED = { expectedName: '小单说AI', expectedId: '23329202234' };

async function fetchDouyinProfile() {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' });
    await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.getByRole('heading', { name: EXPECTED.expectedName }).waitFor({ timeout: 25_000 });
    await page.waitForFunction(() => /粉丝\s*\n?\s*[\d.万wW]+/.test(document.body.innerText), null, { timeout: 25_000 });
    const text = await page.locator('body').innerText();
    const parsed = parseDouyinProfileText(text, EXPECTED);
    const avatar = await page.locator(`img[alt*="${EXPECTED.expectedName}"]`).first().getAttribute('src').catch(() => '');
    return {
      ...parsed,
      avatar: avatar || '',
      url: PROFILE_URL,
      source: 'Douyin public profile',
      updatedAt: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

module.exports = { EXPECTED, PROFILE_URL, fetchDouyinProfile };

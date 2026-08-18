import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { importInventory, readInventory } from './lib/csdn-import.mjs';

const execFileAsync = promisify(execFile);

async function curlFetch(url, options = {}) {
  const headers = Object.entries(options.headers || {}).flatMap(([name, value]) => ['-H', `${name}: ${value}`]);
  const { stdout } = await execFileAsync('curl', [
    '--silent', '--show-error', '--fail-with-body', '--location',
    '--retry', '3', '--connect-timeout', '20', '--max-time', '120',
    ...headers,
    url
  ], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  const body = Buffer.from(stdout);
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => body.toString('utf8'),
    arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
  };
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(root, 'scripts/data/csdn-published.json');
const reportPath = path.join(root, 'docs/csdn-import-report.json');
const items = await readInventory(inventoryPath);
const report = await importInventory(items, {
  fetchImpl: curlFetch,
  expectedCount: 34,
  articleDir: path.join(root, 'api/data/articles'),
  imageRoot: path.join(root, 'public/articles/csdn'),
  exportDir: process.env.CSDN_EXPORT_DIR || path.join(os.homedir(), 'Downloads')
});

await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify({
  importedAt: new Date().toISOString(),
  expected: 34,
  passed: report.length,
  failed: 0,
  articles: report
}, null, 2)}\n`, 'utf8');

console.log(`CSDN import complete: ${report.length} passed, 0 failed`);

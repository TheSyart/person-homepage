/* 鉴权：密码 sha256 校验 + token 颁发/验证 + 登录防爆破 */
const crypto = require('crypto');
const store = require('./store');

const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const CLI_TOKEN = process.env.ADMIN_TOKEN || '';          /* 长期 CLI token（仅服务器本地使用） */
const TOKEN_TTL = 7 * 24 * 3600 * 1000;                    /* 会话 token 7 天 */

/* 登录失败锁定：同 IP 5 次锁 10 分钟 */
const failMap = new Map(); // ip -> { count, lockUntil }

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function loadTokens() {
  return store.readJSON('tokens.json', []);
}

function saveTokens(tokens) {
  store.writeJSON('tokens.json', tokens);
}

function prune(tokens) {
  const now = Date.now();
  return tokens.filter((t) => t.exp > now);
}

function login(password, ip) {
  const rec = failMap.get(ip);
  if (rec && rec.lockUntil > Date.now()) {
    const wait = Math.ceil((rec.lockUntil - Date.now()) / 60000);
    return { ok: false, error: `尝试次数过多，请 ${wait} 分钟后再试` };
  }
  if (!PASSWORD_HASH || sha256(String(password)) !== PASSWORD_HASH) {
    const r = failMap.get(ip) || { count: 0, lockUntil: 0 };
    r.count += 1;
    if (r.count >= 5) { r.lockUntil = Date.now() + 10 * 60 * 1000; r.count = 0; }
    failMap.set(ip, r);
    return { ok: false, error: '密码错误' };
  }
  failMap.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  const tokens = prune(loadTokens());
  tokens.push({ token, exp: Date.now() + TOKEN_TTL });
  saveTokens(tokens);
  return { ok: true, token, exp: Date.now() + TOKEN_TTL };
}

function logout(token) {
  saveTokens(prune(loadTokens()).filter((t) => t.token !== token));
}

function validToken(token) {
  if (!token) return false;
  if (CLI_TOKEN && token === CLI_TOKEN) return true;
  const tokens = prune(loadTokens());
  return tokens.some((t) => t.token === token);
}

/* Express 中间件：保护 /api/admin/* */
function requireAdmin(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!validToken(token)) {
    return res.status(401).json({ error: '未授权' });
  }
  next();
}

module.exports = { login, logout, requireAdmin };

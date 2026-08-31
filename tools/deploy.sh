#!/bin/bash
# ============================================================
# 个人主页 Vue 版 · 部署脚本（需 root）
#   前置：dsh 用户已在 /opt/person-app 完成 vite build（dist/ 存在）
#   用法：sudo bash /opt/person-app/tools/deploy.sh
# ============================================================
set -euo pipefail

APP=/opt/person-app
WEB=/opt/person
NGX=/soft/nginx/conf/nginx.conf
TS=$(date +%Y%m%d-%H%M%S)

[ "$(id -u)" = "0" ] || { echo "❌ 需要 root：sudo bash $0" >&2; exit 1; }
[ -f "$APP/dist/index.html" ] || { echo "❌ 缺少 $APP/dist，请先构建" >&2; exit 1; }

echo "==> [1/6] 备份现网文件..."
cp -a "$WEB/index.html" "$WEB/index.html.bak-$TS" 2>/dev/null || true
cp -a "$NGX" "$NGX.bak-$TS"
echo "    备份: index.html.bak-$TS / nginx.conf.bak-$TS"

echo "==> [2/6] 准备 B站代理缓存目录..."
mkdir -p /var/cache/nginx-bili
chown -R nginx:nginx /var/cache/nginx-bili

echo "==> [3/6] 部署前端产物（保留 data/ 与旧备份）..."
# 首次部署：若线上无 data/ 则播种 stats.json
[ -d "$WEB/data" ] || cp -a "$APP/dist/data" "$WEB/data"
# 清理旧构建输出，再拷入新产物（不动 example/、data/、*.bak*）
rm -rf "$WEB/assets" "$WEB/index.html" "$WEB/favicon.svg"
cp -a "$APP/dist/." "$WEB/"
# example/ 用项目内子集覆盖同名文件（内容一致，幂等）
cp -a "$APP/dist/example/." "$WEB/example/"
# 修正属主与权限（dsh 构建产物默认 600/700，nginx worker 无法读取；
# 且 cp -a src/. 会把 dist 的 700 传染给 webroot 本身）
chown root:root "$WEB"
chmod 755 "$WEB"
chown -R root:root "$WEB/assets" "$WEB/data" "$WEB/example" "$WEB/index.html" "$WEB/favicon.svg"
find "$WEB/assets" "$WEB/data" "$WEB/example" -type d -exec chmod 755 {} +
find "$WEB/assets" "$WEB/data" "$WEB/example" -type f -exec chmod 644 {} +
chmod 644 "$WEB/index.html" "$WEB/favicon.svg"

echo "==> [4/6] 更新 nginx 配置..."
# ⚠️ 安全检查（2026-08-25 事故后新增，请勿删除）：
# 本机 nginx.conf 由多个项目共用（www/dsh/model/digital/ops 等）。
# 本脚本曾两次用过期模板覆盖生产 nginx.conf，导致 ops/model/digital 等站点全挂。
# 覆盖前必须确认：现网生效的所有 server_name 在新模板（含其 include 的文件）中都存在。
cur_names=$(/soft/nginx/sbin/nginx -T 2>/dev/null | grep -oP 'server_name\s+\K[^;]+' | tr ' ' '\n' | grep -v '^$' | sort -u)
new_names=$({
  grep -oP 'server_name\s+\K[^;]+' "$APP/tools/nginx.conf"
  grep -oP 'include\s+\K/soft/nginx/conf/[^;[:space:]]+\.conf' "$APP/tools/nginx.conf" | while read -r f; do
    [ -f "$f" ] && grep -oP 'server_name\s+\K[^;]+' "$f"
  done
} | tr ' ' '\n' | grep -v '^$' | sort -u)
missing=$(comm -23 <(echo "$cur_names") <(echo "$new_names") || true)
# 二次校验：现网所有 SSL 证书域名也必须在新模板覆盖范围内
# （防止模板保留了 server_name 却丢了 443 SSL server 块）
cur_certs=$(/soft/nginx/sbin/nginx -T 2>/dev/null | grep -oP 'ssl_certificate\s+/etc/letsencrypt/live/\K[^/]+' | sort -u)
new_certs=$({
  grep -oP 'ssl_certificate\s+/etc/letsencrypt/live/\K[^/]+' "$APP/tools/nginx.conf"
  grep -oP 'include\s+\K/soft/nginx/conf/[^;[:space:]]+\.conf' "$APP/tools/nginx.conf" | while read -r f; do
    [ -f "$f" ] && grep -oP 'ssl_certificate\s+/etc/letsencrypt/live/\K[^/]+' "$f"
  done
} | sort -u)
missing_certs=$(comm -23 <(echo "$cur_certs") <(echo "$new_certs") || true)
[ -n "$missing_certs" ] && missing="$missing $missing_certs(SSL块)"
if [ -n "$(echo $missing | tr -d ' ')" ]; then
  echo "❌ 中止部署：新模板缺少现网已有站点：$(echo $missing | tr '\n' ' ')" >&2
  echo "   请先把最新 /soft/nginx/conf/nginx.conf 同步到 $APP/tools/nginx.conf 再部署：" >&2
  echo "   sudo cp /soft/nginx/conf/nginx.conf $APP/tools/nginx.conf" >&2
  exit 1
fi
cp "$APP/tools/nginx.conf" "$NGX"
chmod 644 "$NGX"

echo "==> [5/6] 校验并重载 nginx..."
/soft/nginx/sbin/nginx -t -c "$NGX"
systemctl reload nginx

echo "==> [6/6] 验收..."
R="--resolve www.shanchen.space:443:127.0.0.1"
home=$(curl -sk -o /dev/null -w "%{http_code}" https://www.shanchen.space/ $R)
echo "    主页                       -> $home (期望 200)"
vuemark=$(curl -sk https://www.shanchen.space/ $R | grep -c "assets/index-" || true)
echo "    Vue 构建标记               -> $vuemark (期望 ≥1)"
bili=$(curl -sk "https://www.shanchen.space/api/bilibili/x/relation/stat?vmid=1452412374" $R)
echo "    B站代理 /api/bilibili      -> $(echo "$bili" | head -c 120)"
profile=$(curl -sk -o /dev/null -w "%{http_code}" https://www.shanchen.space/api/profile $R)
echo "    实时资料 /api/profile       -> $profile (期望 200)"
videos=$(curl -sk https://www.shanchen.space/api/videos $R | grep -o '"bvid"' | wc -l | tr -d ' ')
echo "    动态视频 /api/videos        -> $videos 条 (期望 50)"
sj=$(curl -sk -o /dev/null -w "%{http_code}" https://www.shanchen.space/data/stats.json $R)
echo "    /data/stats.json           -> $sj (期望 200)"
xmas=$(curl -sk -o /dev/null -w "%{http_code}" https://www.shanchen.space/christmas/christmas.html $R)
echo "    圣诞子页                   -> $xmas (期望 404)"
for h in sporter funcavatar protect myhero muyu; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $h.shanchen.space" http://127.0.0.1/)
  echo "    已下线 $h           -> $code (期望 404)"
done
dsh=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3080/)
echo "    DSH Web                    -> $dsh (期望 200)"

echo ""
echo "✅ 部署完成。回滚命令："
echo "   cp $WEB/index.html.bak-$TS $WEB/index.html && cp $NGX.bak-$TS $NGX && systemctl reload nginx"

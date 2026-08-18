#!/bin/bash
# ============================================================
# person-api 管理工具（需 root；通过长期 CLI token 调管理 API）
#
# 用法:
#   sudo bash admin.sh overview                  概览
#   sudo bash admin.sh articles                  文章列表
#   sudo bash admin.sh pub-article ./xx.md       发布/更新文章（从本地 md 文件导入）
#   sudo bash admin.sh del-article <slug>        删除文章
#   sudo bash admin.sh videos                    视频列表
#   sudo bash admin.sh add-video                 交互式添加视频
#   sudo bash admin.sh del-video <id>            删除视频
#   sudo bash admin.sh messages [page]           留言列表
#   sudo bash admin.sh del-message <id>          删除留言
# ============================================================
set -euo pipefail

ENV_FILE=/etc/person-api.env
BASE=http://127.0.0.1:3081/api/admin

[ "$(id -u)" = "0" ] || { echo "❌ 需要 root：sudo bash $0 ..." >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "❌ 未找到 $ENV_FILE，先运行 install-api.sh"; exit 1; }

TOKEN=$(grep '^ADMIN_TOKEN=' "$ENV_FILE" | cut -d= -f2)
[ -n "$TOKEN" ] || { echo "❌ $ENV_FILE 中缺少 ADMIN_TOKEN"; exit 1; }

AUTH=(-H "Authorization: Bearer $TOKEN")
JSON=(-H "Content-Type: application/json")
CMD=${1:-help}

pp() { python3 -m json.tool 2>/dev/null || cat; }

case "$CMD" in
  overview)
    curl -s "${AUTH[@]}" "$BASE/overview" | pp
    ;;
  articles)
    curl -s "${AUTH[@]}" "$BASE/articles" | python3 -c "
import json,sys
for a in json.load(sys.stdin):
    flag = ' [草稿]' if a.get('draft') else ''
    print(f\"{a['date']:<11} {a['slug']:<24} {a['title']}{flag}\")"
    ;;
  pub-article)
    F=${2:?用法: admin.sh pub-article ./xx.md}
    [ -f "$F" ] || { echo "❌ 文件不存在: $F"; exit 1; }
    python3 - "$F" <<'EOF' > /tmp/.admin-article-payload.json
import json, re, sys
raw = open(sys.argv[1], encoding='utf-8').read()
m = re.match(r'^---\n([\s\S]*?)\n---\n?([\s\S]*)$', raw)
meta, content = ({}, raw)
if m:
    meta, content = {}, m[2]
    for line in m[1].split('\n'):
        kv = re.match(r'^(\w+):\s*(.*)$', line)
        if kv:
            k, v = kv.group(1), kv.group(2).strip()
            if v.startswith('['):
                meta[k] = [s.strip().strip('"\'') for s in v[1:-1].split(',') if s.strip()]
            elif v in ('true', 'false'):
                meta[k] = v == 'true'
            else:
                meta[k] = v.strip('"\'')
import os
slug = os.path.splitext(os.path.basename(sys.argv[1]))[0]
payload = {
    'slug': slug,
    'title': meta.get('title', slug),
    'summary': meta.get('summary', ''),
    'tags': meta.get('tags', []),
    'date': meta.get('date'),
    'draft': meta.get('draft', False),
    'content': content
}
print(json.dumps(payload, ensure_ascii=False))
EOF
    curl -s "${AUTH[@]}" "${JSON[@]}" -d @/tmp/.admin-article-payload.json "$BASE/articles" | pp
    rm -f /tmp/.admin-article-payload.json
    ;;
  del-article)
    S=${2:?用法: admin.sh del-article <slug>}
    curl -s -X DELETE "${AUTH[@]}" "$BASE/articles/$S" | pp
    ;;
  videos)
    curl -s "$BASE/videos" "${AUTH[@]}" > /dev/null # 鉴权检查
    curl -s http://127.0.0.1:3081/api/videos | python3 -c "
import json,sys
for v in json.load(sys.stdin):
    print(f\"{v['id']:<10} {v['platform']:<9} {v['date']:<11} {v['title']}\")
    print(f\"{'':<10} → {v['url']}\")"
    ;;
  add-video)
    read -p "平台 (bilibili/douyin): " P
    read -p "标题: " T
    read -p "链接 (https://...): " U
    read -p "日期 (回车默认今天): " D
    read -p "简介 (可空): " DS
    python3 -c "
import json,sys
print(json.dumps({'platform':sys.argv[1],'title':sys.argv[2],'url':sys.argv[3],'date':sys.argv[4] or None,'desc':sys.argv[5]}, ensure_ascii=False))" "$P" "$T" "$U" "$D" "$DS" > /tmp/.admin-video.json
    curl -s "${AUTH[@]}" "${JSON[@]}" -d @/tmp/.admin-video.json "$BASE/videos" | pp
    rm -f /tmp/.admin-video.json
    ;;
  del-video)
    I=${2:?用法: admin.sh del-video <id>}
    curl -s -X DELETE "${AUTH[@]}" "$BASE/videos/$I" | pp
    ;;
  messages)
    P=${2:-1}
    curl -s "${AUTH[@]}" "$BASE/messages?page=$P" | python3 -c "
import json,sys,datetime
d=json.load(sys.stdin)
print(f\"共 {d['total']} 条\")
for m in d['list']:
    t=datetime.datetime.fromtimestamp(m['time']/1000).strftime('%Y-%m-%d %H:%M')
    print(f\"[{m['id']}] {t} {m['name']}: {m['content'][:60]}\")"
    ;;
  del-message)
    I=${2:?用法: admin.sh del-message <id>}
    curl -s -X DELETE "${AUTH[@]}" "$BASE/messages/$I" | pp
    ;;
  *)
    sed -n '2,17p' "$0"
    ;;
esac

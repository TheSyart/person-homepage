#!/bin/bash
# ============================================================
# 主页动态数据更新脚本（需 root）
# 更新 /opt/person/data/stats.json，页面下次访问即生效（无需重新构建）
#
# 用法示例：
#   sudo bash /opt/person-app/tools/update-stats.sh douyin.followers=1234 douyin.likes=5678
#   sudo bash /opt/person-app/tools/update-stats.sh bilibili.followers=3200
#   sudo bash /opt/person-app/tools/update-stats.sh github.totalStars=600 douyin.works=8
# ============================================================
set -euo pipefail

F=/opt/person/data/stats.json

[ "$(id -u)" = "0" ] || { echo "❌ 需要 root：sudo bash $0" >&2; exit 1; }
[ $# -ge 1 ] || { echo "用法: $0 key=value [key=value ...]  (如 douyin.followers=1234)"; exit 1; }
[ -f "$F" ] || { echo "❌ 未找到 $F"; exit 1; }

cp -a "$F" "$F.bak"

python3 - "$F" "$@" <<'EOF'
import json, sys, datetime

path = sys.argv[1]
with open(path, encoding='utf-8') as f:
    data = json.load(f)

for kv in sys.argv[2:]:
    if '=' not in kv:
        print(f'跳过无效参数: {kv}')
        continue
    key, val = kv.split('=', 1)
    parts = key.split('.')
    d = data
    for p in parts[:-1]:
        d = d.setdefault(p, {})
    d[parts[-1]] = int(val) if val.lstrip('-').isdigit() else val

data['updated'] = datetime.date.today().isoformat()

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('✅ 已更新', path)
print(json.dumps(data, ensure_ascii=False, indent=2))
EOF

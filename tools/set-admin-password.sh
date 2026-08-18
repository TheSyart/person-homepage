#!/bin/bash
# 修改管理端密码（需 root；只更新 /etc/person-api.env 中的哈希并重启服务）
set -euo pipefail
ENV_FILE=/etc/person-api.env
[ "$(id -u)" = "0" ] || { echo "❌ 需要 root"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "❌ 未找到 $ENV_FILE，先运行 install-api.sh"; exit 1; }

while true; do
  read -rs -p "新密码（输入不可见）: " PW1; echo
  read -rs -p "再输一次确认: " PW2; echo
  [ -n "$PW1" ] && [ "$PW1" = "$PW2" ] && break
  echo "两次输入不一致或为空，重来。"
done
HASH=$(printf '%s' "$PW1" | sha256sum | awk '{print $1}')
sed -i "s/^ADMIN_PASSWORD_HASH=.*/ADMIN_PASSWORD_HASH=$HASH/" "$ENV_FILE"
systemctl restart person-api
echo "✅ 密码已更新，person-api 已重启"

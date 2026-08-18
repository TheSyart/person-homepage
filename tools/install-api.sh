#!/bin/bash
# ============================================================
# person-api 首次安装（需 root）
#   注册 systemd 服务 + 设置管理密码 + 生成 CLI token + 启动
#   用法: sudo bash /opt/person-app/tools/install-api.sh
# ============================================================
set -euo pipefail

API=/opt/person-app/api
APP=/opt/person-app
ENV_FILE=/etc/person-api.env
UNIT=/etc/systemd/system/person-api.service
BROWSER_DIR=$APP/.cache/ms-playwright

[ "$(id -u)" = "0" ] || { echo "❌ 需要 root：sudo bash $0" >&2; exit 1; }

echo "==> [1/5] 写入服务配置 $ENV_FILE ..."
if [ -f "$ENV_FILE" ]; then
  echo "    已存在，保留现有配置（如需重置密码用 tools/set-admin-password.sh）"
else
  # 支持非交互：ADMIN_PASSWORD_INITIAL=xxx sudo -E bash install-api.sh
  if [ -n "${ADMIN_PASSWORD_INITIAL:-}" ]; then
    PW1="$ADMIN_PASSWORD_INITIAL"
  else
    while true; do
      read -rs -p "请设置管理端密码（输入不可见）: " PW1; echo
      read -rs -p "再输一次确认: " PW2; echo
      [ -n "$PW1" ] && [ "$PW1" = "$PW2" ] && break
      echo "两次输入不一致或为空，重来。"
    done
  fi
  HASH=$(printf '%s' "$PW1" | sha256sum | awk '{print $1}')
  CLI_TOKEN=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
  cat > "$ENV_FILE" <<EOF
PORT=3081
DATA_DIR=$API/data
ADMIN_PASSWORD_HASH=$HASH
ADMIN_TOKEN=$CLI_TOKEN
EOF
  chmod 600 "$ENV_FILE"
  chown root:root "$ENV_FILE"
  echo "    密码哈希与 CLI token 已写入（无明文）"
fi

grep -q '^PLAYWRIGHT_BROWSERS_PATH=' "$ENV_FILE" || echo "PLAYWRIGHT_BROWSERS_PATH=$BROWSER_DIR" >> "$ENV_FILE"
grep -q '^NODE_EXTRA_CA_CERTS=' "$ENV_FILE" || echo "NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt" >> "$ENV_FILE"

echo "==> [2/5] 安装 Playwright Chromium（抖音与 B站公开资料同步）..."
mkdir -p "$BROWSER_DIR"
PLAYWRIGHT_BROWSERS_PATH="$BROWSER_DIR" NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
  npx --prefix "$API" playwright install --with-deps chromium
chown -R dsh:dsh "$BROWSER_DIR"

echo "==> [3/5] 修正数据目录属主（服务以 dsh 运行）..."
chown -R dsh:dsh "$API/data"

echo "==> [4/5] 注册 systemd 服务..."
cat > "$UNIT" <<EOF
[Unit]
Description=Person Homepage API (articles/videos/messages)
After=network-online.target

[Service]
Type=simple
User=dsh
Group=dsh
WorkingDirectory=$API
EnvironmentFile=$ENV_FILE
ExecStart=/usr/local/bin/node $API/server.js
Restart=on-failure
RestartSec=3
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now person-api

echo "==> [5/5] 验证..."
sleep 1
systemctl is-active person-api
curl -s http://127.0.0.1:3081/api/health && echo
curl -s http://127.0.0.1:3081/api/profile | head -c 240 && echo
curl -s http://127.0.0.1:3081/api/videos | head -c 240 && echo
echo ""
echo "✅ person-api 已上线。管理工具：sudo bash /opt/person-app/tools/admin.sh help"

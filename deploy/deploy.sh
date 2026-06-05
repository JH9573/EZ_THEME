#!/usr/bin/env bash
#
# EZ THEME — VPS 一键构建部署脚本
#
# 作用:拉取最新代码 → 安装依赖 → 构建 → 部署到 Nginx 目录 → 重载 Nginx
# 用法:
#   首次:  git clone https://github.com/JH9573/EZ_THEME.git && cd EZ_THEME
#           chmod +x deploy/deploy.sh && ./deploy/deploy.sh
#   之后:  在仓库目录直接跑  ./deploy/deploy.sh  即可更新发版
#
# 依赖:git、Node 20.x + npm、(可选)rsync。构建建议 VPS 内存 ≥ 2GB。

set -euo pipefail

# ============ 可按需修改的配置 ============
REPO_URL="https://github.com/JH9573/EZ_THEME.git"   # 你的仓库
BRANCH="main"                                        # 构建分支
WEB_ROOT="/var/www/eztheme"                          # Nginx 站点根目录
RELOAD_NGINX=true                                    # 部署后是否重载 Nginx
# =========================================

# 颜色输出
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }

# 脚本所在仓库根目录(deploy/ 的上一级)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
cd "$REPO_DIR"

green "==> [1/5] 拉取最新代码 ($BRANCH)"
if [ -d .git ]; then
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"   # 丢弃本地改动,严格对齐远程
else
  red "当前目录不是 git 仓库,请先 git clone $REPO_URL 后在仓库内运行本脚本"
  exit 1
fi

green "==> [2/5] 安装依赖 (npm install)"
if ! command -v npm >/dev/null 2>&1; then
  red "未找到 npm,请先安装 Node 20.x"
  exit 1
fi
npm install --no-audit --no-fund

# 注入真实 API 地址:仓库里只有占位符 https://xxxx.com/api/v1
# 真实地址放在不入库的 deploy/api.env(已 gitignore),格式:
#   EZ_API_BASE_URL=https://your-real-backend.com/api/v1
API_ENV_FILE="$REPO_DIR/deploy/api.env"
if [ -f "$API_ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$API_ENV_FILE"
fi
if [ -n "${EZ_API_BASE_URL:-}" ]; then
  green "==> 注入真实 API 地址(来自 deploy/api.env,不入库)"
  sed -i "s#https://xxxx.com/api/v1#${EZ_API_BASE_URL}#g" src/config/index.js
else
  yellow "未找到 deploy/api.env 或未设置 EZ_API_BASE_URL,将使用仓库占位符 https://xxxx.com/api/v1"
  yellow "  首次部署请执行: echo 'EZ_API_BASE_URL=https://你的后端/api/v1' > deploy/api.env"
fi

green "==> [3/5] 构建 (npm run build)"
npm run build

if [ ! -d dist ]; then
  red "构建未产出 dist/ 目录,部署中止"
  exit 1
fi

green "==> [4/5] 部署到 $WEB_ROOT"
mkdir -p "$WEB_ROOT"
if command -v rsync >/dev/null 2>&1; then
  # --delete 会清掉旧的随机名 config 文件,避免残留累积
  rsync -a --delete dist/ "$WEB_ROOT/"
else
  yellow "未安装 rsync,改用 cp(不会清理旧文件,建议安装 rsync)"
  rm -rf "${WEB_ROOT:?}"/*
  cp -r dist/* "$WEB_ROOT/"
fi

green "==> [5/5] 重载 Nginx"
if [ "$RELOAD_NGINX" = true ] && command -v nginx >/dev/null 2>&1; then
  if nginx -t; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
    green "Nginx 已重载"
  else
    red "nginx -t 校验失败,未重载。请检查 Nginx 配置"
    exit 1
  fi
else
  yellow "跳过 Nginx 重载(RELOAD_NGINX=$RELOAD_NGINX 或未安装 nginx)"
fi

echo
green "✅ 部署完成!"
CONFIG_FILE="$(find "$WEB_ROOT" -maxdepth 1 -regextype posix-extended -regex '.*/[0-9]+\.[a-z0-9]+\.js' 2>/dev/null | head -1 || true)"
if [ -n "$CONFIG_FILE" ]; then
  yellow "外置配置文件:$CONFIG_FILE"
  yellow "  → 临时改配置(后端地址/站点名)可直接编辑此文件后刷新,无需重新构建。"
  yellow "  → 但再次运行本脚本会重新构建并覆盖它(文件名也会变)。"
fi

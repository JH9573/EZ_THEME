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

# 配置文件不入库:src/config/index.js 已 gitignore(本地私有),仓库只存模板
# git reset --hard 不会删除未跟踪文件,所以你编辑过的真实配置会一直保留
if [ ! -f src/config/index.js ]; then
  if [ -f src/config/index.example.js ]; then
    cp src/config/index.example.js src/config/index.js
    red  "首次部署:已从模板创建 src/config/index.js"
    yellow "请编辑该文件填入真实配置(后端地址、站点名、密钥等),然后重新运行本脚本:"
    yellow "  vim src/config/index.js && ./deploy/deploy.sh"
    exit 1
  else
    red "缺少 src/config/index.js,且未找到模板 src/config/index.example.js,无法构建"
    exit 1
  fi
fi

# ---- 低内存保护:构建(vite + terser)较吃内存,小内存 VPS 易 OOM ----
# 1) 加大 Node 堆上限
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
# 2) 内存(RAM+swap)不足 2GB 且为 root 时,自动创建 2G swap
if command -v free >/dev/null 2>&1; then
  TOTAL_MB=$(free -m | awk '/^Mem:/{m=$2} /^Swap:/{s=$2} END{print m+s}')
  if [ "${TOTAL_MB:-0}" -lt 1900 ]; then
    if [ "$(id -u)" -eq 0 ] && [ ! -f /swapfile ]; then
      yellow "==> 检测到可用内存不足 2GB,自动创建 2G swap 以防构建 OOM"
      fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
      chmod 600 /swapfile
      mkswap /swapfile >/dev/null
      swapon /swapfile
      grep -q '/swapfile' /etc/fstab 2>/dev/null || echo '/swapfile none swap sw 0 0' >> /etc/fstab
      green "swap 已启用" && free -h
    else
      yellow "==> 可用内存不足 2GB,若构建被 Killed/OOM,请手动加 swap(见 deploy README)"
    fi
  fi
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
yellow "改配置方式:编辑 src/config/index.js → 提交推送 → 在 VPS 跑本脚本重新发版。"
yellow "  (配置已打包进带哈希的 JS,文件名随内容变化,浏览器/CF 会自动取新版,无需清缓存)"
yellow "  真实 API 地址不在仓库里,由 deploy/api.env 在构建时注入。"

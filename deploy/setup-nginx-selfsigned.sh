#!/usr/bin/env bash
#
# EZ THEME — 自签证书 + Nginx 一键配置脚本(配合 Cloudflare "Full" 模式)
#
# 作用:
#   1) 生成 10 年自签 SSL 证书(Full 模式下 CF 不校验证书名,故域名无关)
#   2) 写入 catch-all(server_name _)的 Nginx 配置,换域名无需再改服务器
#   3) 校验并重载 Nginx
#
# 用法(需 root):
#   sudo ./deploy/setup-nginx-selfsigned.sh
#
# 之后在 Cloudflare:把域名解析(橙色云朵 Proxied)指向本机 IP,
# SSL/TLS 模式设为 “完全 / Full”(不是 strict)。
#
# 换主域名时:只在 CF 操作即可,本机证书与 Nginx 都不用动。
# (但记得在【后端】把新前端域名加入 CORS 白名单)

set -euo pipefail

# ============ 可改配置 ============
WEB_ROOT="${WEB_ROOT:-/var/www/eztheme}"      # 前端 dist 部署目录
CERT_DIR="${CERT_DIR:-/etc/ssl/selfsigned}"   # 证书存放目录
CERT_CN="${CERT_CN:-eztheme.origin}"          # 证书 CN,Full 模式下无所谓
SITE_NAME="eztheme"
# =================================

green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }

# 需要 root
if [ "$(id -u)" -ne 0 ]; then
  red "请用 root 运行:sudo $0"
  exit 1
fi
# 依赖检查
command -v openssl >/dev/null 2>&1 || { red "缺少 openssl,请先安装"; exit 1; }
command -v nginx   >/dev/null 2>&1 || { red "缺少 nginx,请先安装:apt install -y nginx"; exit 1; }

# ---- 1) 生成自签证书 ----
mkdir -p "$CERT_DIR"
if [ -f "$CERT_DIR/origin.pem" ] && [ -f "$CERT_DIR/origin.key" ]; then
  yellow "==> 已存在自签证书,跳过生成(如需重建:rm $CERT_DIR/origin.* 后重跑)"
else
  green "==> 生成 10 年自签证书"
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$CERT_DIR/origin.key" \
    -out "$CERT_DIR/origin.pem" \
    -subj "/CN=$CERT_CN"
  chmod 600 "$CERT_DIR/origin.key"
fi

# ---- 2) 确保前端目录存在 ----
mkdir -p "$WEB_ROOT"
if [ -z "$(ls -A "$WEB_ROOT" 2>/dev/null)" ]; then
  yellow "提示:$WEB_ROOT 当前为空,记得把构建产物 dist/ 部署到这里(或先跑 deploy.sh)"
fi

# ---- 3) 写入 Nginx 配置 ----
if [ -d /etc/nginx/sites-available ]; then
  CONF="/etc/nginx/sites-available/${SITE_NAME}.conf"
  ENABLE_LINK="/etc/nginx/sites-enabled/${SITE_NAME}.conf"
else
  CONF="/etc/nginx/conf.d/${SITE_NAME}.conf"
  ENABLE_LINK=""
fi

green "==> 写入 Nginx 配置:$CONF"
[ -f "$CONF" ] && cp "$CONF" "$CONF.bak.$(date +%s)" && yellow "已备份旧配置"

cat > "$CONF" <<'NGINX_EOF'
# EZ THEME — 自签证书 + Cloudflare(Full 模式)
# server_name _ 为 catch-all,换域名无需改本文件

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name _;

    ssl_certificate     __CERTDIR__/origin.pem;
    ssl_certificate_key __CERTDIR__/origin.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    root __WEBROOT__;
    index index.html;

    # hash 路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 带指纹的静态资源 → 强缓存一年
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # index.html 不缓存
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 根目录下的独立配置文件(随机名 .js)不缓存,改完即生效
    location ~ ^/\d+\.[a-z0-9]+\.js$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_types text/css text/plain application/javascript application/json image/svg+xml;

    location = /favicon.ico { access_log off; log_not_found off; }
}
NGINX_EOF

# 替换路径占位符
sed -i "s#__CERTDIR__#${CERT_DIR}#g; s#__WEBROOT__#${WEB_ROOT}#g" "$CONF"

# 启用本站,并移除会与 default_server 冲突的默认站点
if [ -n "$ENABLE_LINK" ]; then
  ln -sf "$CONF" "$ENABLE_LINK"
  rm -f /etc/nginx/sites-enabled/default
fi
if [ -f /etc/nginx/conf.d/default.conf ]; then
  mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled
  yellow "已禁用 /etc/nginx/conf.d/default.conf(避免 default_server 冲突)"
fi

# ---- 4) 校验并重载 ----
green "==> 校验 Nginx 配置"
if nginx -t; then
  systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || nginx -s reload
  green "✅ 完成!Nginx 已重载"
else
  red "nginx -t 失败,请检查上面的报错(常见:存在另一个 default_server)"
  exit 1
fi

echo
green "下一步:"
echo "  1) 把前端构建产物部署到 $WEB_ROOT(若还没做:跑 ./deploy/deploy.sh)"
echo "  2) Cloudflare:域名解析指向本机 IP 并开启橙色云朵(Proxied)"
echo "  3) Cloudflare:SSL/TLS 模式设为【完全 / Full】(不要选 strict)"
echo "  4) 换主域名时只需在 CF 操作;别忘了在【后端】把新域名加入 CORS"
